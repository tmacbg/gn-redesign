import type { MeiliSearch } from 'meilisearch';
import { translitBg } from '@/domain/translit';
import type { Category } from '@/domain/types';
import type { CatalogData, CatalogProduct } from '../catalog-data';
import { PRODUCTS_INDEX, productIndexSettings, type ProductSearchDoc } from '@/server/search';
import type { Webservice } from './client';
import { categoryDTO, collection, manufacturerDTO, productDTO, type ProductDTO } from './dto';
import { HOME_CATEGORY_ID, isListable, mapCategory, mapProduct } from './mappers';

type Log = (msg: string) => void;
const PAGE = 500;

async function fetchConfig(ws: Webservice, name: string): Promise<string | null> {
  const r = await ws.get<{ configurations?: { name: string; value: string | null }[] }>('configurations', { display: '[name,value]', 'filter[name]': `[${name}]` });
  return r.configurations?.[0]?.value ?? null;
}

async function fetchCategories(ws: Webservice): Promise<Category[]> {
  const raw = await ws.get<unknown>('categories', { display: '[id,id_parent,active,level_depth,position,name,link_rewrite]' });
  return collection('categories', categoryDTO).parse(raw).filter((c) => c.active && c.id > HOME_CATEGORY_ID).map(mapCategory);
}

async function fetchBrands(ws: Webservice) {
  const raw = await ws.get<unknown>('manufacturers', { display: '[id,name,active]' });
  return collection('manufacturers', manufacturerDTO).parse(raw).filter((m) => m.active).map((m) => ({ id: m.id, name: m.name.trim() }));
}

/** Parses item by item so one malformed product cannot break the whole sync. */
function parseProducts(raw: unknown, log: Log): ProductDTO[] {
  const items = (raw as { products?: unknown[] }).products ?? [];
  const out: ProductDTO[] = [];
  for (const item of items) {
    const r = productDTO.safeParse(item);
    if (r.success) out.push(r.data);
    else log(`skip product ${(item as { id?: unknown }).id}: ${r.error.issues[0]?.path.join('.')} ${r.error.issues[0]?.message}`);
  }
  return out;
}

async function fetchProducts(ws: Webservice, filter: Record<string, string>, log: Log): Promise<ProductDTO[]> {
  const all: ProductDTO[] = [];
  for (let offset = 0; ; offset += PAGE) {
    const raw = await ws.get<unknown>('products', { display: 'full', ...filter, sort: '[id_ASC]', limit: `${offset},${PAGE}` });
    const page = parseProducts(raw, log);
    all.push(...page);
    log(`products ${offset}–${offset + page.length}`);
    if (((raw as { products?: unknown[] }).products?.length ?? 0) < PAGE) break;
  }
  return all;
}

export async function fullSync(ws: Webservice, baseUrl: string, log: Log): Promise<CatalogData> {
  const started = new Date();
  const [newDays, categories, brands] = await Promise.all([fetchConfig(ws, 'PS_NB_DAYS_NEW_PRODUCT'), fetchCategories(ws), fetchBrands(ws)]);
  const dtos = await fetchProducts(ws, { 'filter[active]': '[1]' }, log);
  const products = dtos.filter(isListable).map((p) => mapProduct(p, baseUrl));
  return { source: 'prestashop', syncedAt: started.toISOString(), newDays: Number(newDays) || 20, categories, brands, products };
}

const psDate = (d: Date) => d.toISOString().slice(0, 19).replace('T', ' ');

/** Re-fetches products changed since the last sync; deactivated ones are removed. Deletions are caught by the nightly full sync. */
export async function incrementalSync(ws: Webservice, baseUrl: string, prev: CatalogData, log: Log): Promise<{ data: CatalogData; changed: CatalogProduct[]; removed: number[] }> {
  const started = new Date();
  // PrestaShop stores local server time; a 1-day overlap absorbs any timezone offset.
  const since = new Date(Date.parse(prev.syncedAt) - 86_400_000);
  const [categories, brands] = await Promise.all([fetchCategories(ws), fetchBrands(ws)]);
  const dtos = await fetchProducts(ws, { 'filter[date_upd]': `[${psDate(since)},${psDate(new Date(started.getTime() + 86_400_000))}]`, date: '1' }, log);
  const byId = new Map(prev.products.map((p) => [p.id, p]));
  const changed: CatalogProduct[] = [];
  const removed: number[] = [];
  for (const dto of dtos) {
    if (isListable(dto)) { const p = mapProduct(dto, baseUrl); byId.set(p.id, p); changed.push(p); }
    else if (byId.delete(dto.id)) removed.push(dto.id);
  }
  return { data: { ...prev, syncedAt: started.toISOString(), categories, brands, products: [...byId.values()] }, changed, removed };
}

export function toSearchDoc(p: CatalogProduct, categoryNames: Map<number, string>): ProductSearchDoc {
  return {
    id: p.id, name_bg: p.name.bg, name_en: p.name.en, translit: translitBg(p.name.bg), reference: p.reference, ean13: p.ean13,
    brand: p.brand?.name ?? null, brandId: p.brand?.id ?? null, categoryIds: p.categoryIds,
    categories: p.categoryIds.map((c) => categoryNames.get(c)).filter((n): n is string => !!n),
    dateAdd: Date.parse(p.dateAdd.replace(' ', 'T')) / 1000,
  };
}

/** Builds a fresh index and atomically swaps it in, so search never sees a half-built index. */
export async function reindexAll(meili: MeiliSearch, data: CatalogData, log: Log) {
  const names = new Map(data.categories.map((c) => [c.id, c.name.bg]));
  const tmp = `${PRODUCTS_INDEX}_tmp`;
  await meili.deleteIndexIfExists(tmp);
  await meili.waitForTask((await meili.createIndex(tmp, { primaryKey: 'id' })).taskUid);
  const idx = meili.index(tmp);
  await idx.waitForTask((await idx.updateSettings(productIndexSettings)).taskUid);
  const docs = data.products.map((p) => toSearchDoc(p, names));
  for (let i = 0; i < docs.length; i += 2000) await idx.waitForTask((await idx.addDocuments(docs.slice(i, i + 2000))).taskUid, { timeOutMs: 120_000 });
  if (!(await meili.getIndexes({ limit: 100 })).results.some((x) => x.uid === PRODUCTS_INDEX)) {
    await meili.waitForTask((await meili.createIndex(PRODUCTS_INDEX, { primaryKey: 'id' })).taskUid);
  }
  await meili.waitForTask((await meili.swapIndexes([{ indexes: [PRODUCTS_INDEX, tmp] }])).taskUid);
  await meili.deleteIndexIfExists(tmp);
  log(`search index: ${docs.length} documents`);
}

export async function reindexChanged(meili: MeiliSearch, data: CatalogData, changed: CatalogProduct[], removed: number[]) {
  const names = new Map(data.categories.map((c) => [c.id, c.name.bg]));
  const idx = meili.index(PRODUCTS_INDEX);
  if (changed.length) await idx.waitForTask((await idx.addDocuments(changed.map((p) => toSearchDoc(p, names)))).taskUid, { timeOutMs: 120_000 });
  if (removed.length) await idx.waitForTask((await idx.deleteDocuments(removed)).taskUid);
}
