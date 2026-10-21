import type { CategoryNode, CustomerPrice, Product } from '@/domain/types';
import { foldForSearch } from '@/domain/translit';
import type { CatalogData, CatalogProduct } from './catalog-data';

export type SortKey = 'recommended' | 'new' | 'name' | 'relevance';

export interface ListQuery {
  categoryId?: number;
  brandId?: number;
  /** Product ids already matched by a search backend, in relevance order. */
  ids?: number[];
  q?: string;
  sort?: SortKey;
  page?: number;
  perPage?: number;
}

export interface Facet { id: number; name: string; count: number }
export interface ListResult { items: Product[]; total: number; page: number; pages: number; brands: Facet[] }

const HOME = 2;
const DAY = 86_400_000;

/** In-memory catalog built from a CatalogData snapshot. Pure and synchronous; adapters handle loading. */
export class CatalogEngine {
  readonly tree: CategoryNode[];
  private readonly nodes = new Map<number, CategoryNode>();
  private readonly products = new Map<number, Product>();
  private readonly ordered: Product[];
  private readonly basePrice = new Map<number, number | null>();
  private readonly meta = new Map<number, { title: string | null; description: string | null }>();
  private readonly byCategory = new Map<number, Set<number>>();
  private readonly haystack = new Map<number, string>();

  constructor(readonly data: CatalogData, now = Date.now()) {
    for (const c of data.categories) this.nodes.set(c.id, { ...c, children: [] });
    for (const n of this.nodes.values()) this.nodes.get(n.parentId)?.children.push(n);
    for (const n of this.nodes.values()) n.children.sort((a, b) => a.position - b.position);
    this.tree = [...this.nodes.values()].filter((n) => n.parentId === HOME).sort((a, b) => a.position - b.position);

    const newSince = now - data.newDays * DAY;
    for (const p of data.products) {
      const { basePriceExcl, metaTitle, metaDescription, ...rest } = p;
      const product: Product = { ...rest, categorySlug: this.nodes.get(p.categoryId)?.slug ?? 'produkt', isNew: Date.parse(p.dateAdd.replace(' ', 'T')) >= newSince };
      this.products.set(p.id, product);
      this.basePrice.set(p.id, basePriceExcl);
      this.meta.set(p.id, { title: metaTitle, description: metaDescription });
      for (const c of p.categoryIds) (this.byCategory.get(c) ?? this.byCategory.set(c, new Set()).get(c)!).add(p.id);
      this.haystack.set(p.id, foldForSearch(`${p.name.bg} ${p.name.en} ${p.reference} ${p.ean13 ?? ''} ${p.brand?.name ?? ''}`));
    }
    this.ordered = [...this.products.values()].sort((a, b) => b.dateAdd.localeCompare(a.dateAdd) || b.id - a.id);
  }

  category = (id: number) => this.nodes.get(id) ?? null;

  categoryPath(id: number): CategoryNode[] {
    const path: CategoryNode[] = [];
    for (let n = this.nodes.get(id); n; n = this.nodes.get(n.parentId)) path.unshift(n);
    return path;
  }

  descendants(id: number): number[] {
    const out: number[] = [];
    const walk = (n?: CategoryNode) => { if (!n) return; out.push(n.id); n.children.forEach(walk); };
    walk(this.nodes.get(id));
    return out;
  }

  product = (id: number) => this.products.get(id) ?? null;
  productMeta = (id: number) => this.meta.get(id) ?? null;
  demoPrice(productId: number): CustomerPrice | null {
    const amount = this.basePrice.get(productId);
    return amount == null ? null : { productId, unitPrice: { amount, currency: 'EUR' }, source: 'catalog-base' };
  }

  brands(): Facet[] {
    return facets(this.ordered);
  }

  /** Fallback matcher when no search backend is available: every term must appear. */
  match(q: string): number[] {
    const terms = foldForSearch(q).split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    return this.ordered.filter((p) => { const h = this.haystack.get(p.id)!; return terms.every((t) => h.includes(t)); }).map((p) => p.id);
  }

  list({ categoryId, brandId, ids, q, sort = 'recommended', page = 1, perPage = 48 }: ListQuery): ListResult {
    let base: Product[];
    if (ids) base = ids.map((i) => this.products.get(i)).filter((p): p is Product => !!p);
    else if (q) base = this.match(q).map((i) => this.products.get(i)!);
    else base = this.ordered;
    if (categoryId) {
      const allowed = new Set<number>();
      for (const c of this.descendants(categoryId)) this.byCategory.get(c)?.forEach((pid) => allowed.add(pid));
      base = base.filter((p) => allowed.has(p.id));
    }
    const brandFacets = facets(base);
    let items = brandId ? base.filter((p) => p.brand?.id === brandId) : base;
    if (sort === 'name') items = [...items].sort((a, b) => a.name.bg.localeCompare(b.name.bg, 'bg'));
    else if (sort === 'new') items = [...items].sort((a, b) => b.dateAdd.localeCompare(a.dateAdd) || b.id - a.id);
    else if (sort === 'recommended' && !ids && !q) items = [...items].sort((a, b) => Number(b.onSale) - Number(a.onSale) || Number(b.isNew) - Number(a.isNew) || b.dateAdd.localeCompare(a.dateAdd));
    const total = items.length;
    const pages = Math.max(1, Math.ceil(total / perPage));
    const p = Math.min(Math.max(1, page), pages);
    return { items: items.slice((p - 1) * perPage, p * perPage), total, page: p, pages, brands: brandFacets };
  }

  get size() { return this.products.size; }
}

function facets(products: Product[]): Facet[] {
  const m = new Map<number, Facet>();
  for (const p of products) if (p.brand) { const f = m.get(p.brand.id) ?? { ...p.brand, count: 0 }; f.count++; m.set(f.id, f); }
  return [...m.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'bg'));
}

export type { CatalogProduct };
