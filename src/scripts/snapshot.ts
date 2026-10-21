/**
 * Builds the fixture snapshot used by COMMERCE_ADAPTER=fixture (design mockups, tests).
 * Read-only GETs against the PrestaShop Webservice. No prices are requested: this file is committed to a public repo.
 * Run: docker compose run --rm app npx tsx src/scripts/snapshot.ts
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const BASE = process.env.PRESTASHOP_BASE_URL!;
const KEY = process.env.PRESTASHOP_WEBSERVICE_KEY!;
const LANG = { bg: '2', en: '3' } as const;
const auth = 'Basic ' + Buffer.from(KEY + ':').toString('base64');

const SAMPLE_CATEGORIES = [94, 95, 96, 97, 99, 102, 103, 104, 106, 331, 315, 115, 114, 117, 148, 153, 89, 90, 171, 172, 168, 141, 144, 134, 130, 126, 340, 339, 323, 324];
const PER_CATEGORY = 8;

async function ws<T>(resource: string, params: Record<string, string>): Promise<T> {
  const qs = new URLSearchParams({ output_format: 'JSON', ...params }).toString().replace(/%5B/g, '[').replace(/%5D/g, ']').replace(/%7C/g, '|').replace(/%2C/g, ',');
  const res = await fetch(`${BASE}/api/${resource}?${qs}`, { headers: { Authorization: auth } });
  if (!res.ok) throw new Error(`${resource} ${res.status}`);
  return res.json() as Promise<T>;
}

type Lang = { id: string; value: string }[];
type CatDTO = { id: number; id_parent: string; active: string; level_depth: string; position: string; name: Lang; link_rewrite: Lang };
type ProdDTO = {
  id: number; reference: string; ean13: string; minimal_quantity: string; price: string; weight: string;
  manufacturer_name: string; id_manufacturer: string; id_default_image: string; id_category_default: string;
  on_sale: string; date_add: string; active: string; available_for_order: string;
  name: Lang; link_rewrite: Lang; description_short: Lang;
};

const pick = (l: Lang, lang: string) => l.find((x) => x.id === lang)?.value ?? '';
const cleanName = (s: string) => s.replace(/[-]/g, '').trim();

async function main() {
  const { categories } = await ws<{ categories: CatDTO[] }>('categories', { display: '[id,id_parent,active,level_depth,position,name,link_rewrite]' });
  const cats = categories
    .filter((c) => c.active === '1' && Number(c.level_depth) >= 2)
    .map((c) => ({
      id: c.id, parentId: Number(c.id_parent), depth: Number(c.level_depth) - 1, position: Number(c.position),
      name: { bg: cleanName(pick(c.name, LANG.bg)), en: cleanName(pick(c.name, LANG.en)) },
      slug: pick(c.link_rewrite, LANG.bg),
    }));

  const fields = '[id,reference,ean13,minimal_quantity,weight,manufacturer_name,id_manufacturer,id_default_image,id_category_default,on_sale,date_add,active,available_for_order,name,link_rewrite,description_short]';
  const products: unknown[] = [];
  for (const catId of SAMPLE_CATEGORIES) {
    const r = await ws<{ products?: ProdDTO[] } | []>('products', {
      display: fields, 'filter[id_category_default]': `[${catId}]`, 'filter[active]': '[1]', sort: '[id_DESC]', limit: String(PER_CATEGORY),
    });
    const list = Array.isArray(r) ? [] : r.products ?? [];
    for (const p of list) {
      if (p.id_default_image === '0' || !p.id_default_image) continue;
      const slug = pick(p.link_rewrite, LANG.bg);
      products.push({
        id: p.id, reference: p.reference, ean13: p.ean13 || null,
        name: { bg: pick(p.name, LANG.bg).trim(), en: pick(p.name, LANG.en).trim() },
        slug, categoryId: Number(p.id_category_default),
        brand: p.manufacturer_name ? { id: Number(p.id_manufacturer), name: p.manufacturer_name } : null,
        minimalQuantity: Number(p.minimal_quantity) || 1,
        weightKg: Number(p.weight) || null,
        onSale: p.on_sale === '1', dateAdd: p.date_add,
        availableForOrder: p.available_for_order === '1',
        descriptionShortHtml: pick(p.description_short, LANG.bg),
        imageId: Number(p.id_default_image),
      });
      for (const [type, suffix] of [['home_default', 'm'], ['large_default', 'l']] as const) {
        const file = path.join('public/mock/p', `${p.id}-${suffix}.jpg`);
        try { await fs.access(file); continue; } catch {}
        const img = await fetch(`${BASE}/${p.id_default_image}-${type}/${slug}.jpg`);
        if (img.ok) await fs.writeFile(file, Buffer.from(await img.arrayBuffer()));
      }
    }
    console.log(`category ${catId}: ${list.length}`);
  }
  await fs.writeFile('src/commerce/fixture/snapshot.json', JSON.stringify({ generatedAt: new Date().toISOString(), source: BASE, categories: cats, products }, null, 1));
  console.log(`snapshot: ${cats.length} categories, ${products.length} products`);
}

main().catch((e) => { console.error(e); process.exit(1); });
