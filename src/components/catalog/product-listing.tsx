import { Suspense } from 'react';
import { PackageSearch } from 'lucide-react';
import type { ListResult } from '@/commerce/engine';
import { ProductCard, ProductGrid, ProductRow } from '@/components/product/product-card';
import { priceFor, type Viewer } from '@/server/viewer';
import { BrandFacet, ListingToolbar } from './listing-toolbar';
import { Pagination, pageHref } from './pagination';

export function ProductListing({ result, viewer, activeBrand, sort, view, path, params }: {
  result: ListResult; viewer: Viewer; activeBrand: number | null; sort: string; view: string; path: string; params: Record<string, string | undefined>;
}) {
  const { items, total, brands, page, pages } = result;
  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <aside className="hidden lg:block">
        <div className="sticky top-48 max-h-[calc(100vh-13rem)] overflow-y-auto pr-1">
          {brands.length > 0 && (
            <div>
              <h2 className="mb-2 px-2 text-xs font-bold uppercase tracking-wider text-fg-subtle">Марка</h2>
              <Suspense><BrandFacet brands={brands} active={activeBrand} /></Suspense>
            </div>
          )}
        </div>
      </aside>
      <div className="min-w-0">
        <Suspense><ListingToolbar total={total} brands={brands} activeBrand={activeBrand} sort={sort} view={view} /></Suspense>
        <div className="mt-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-border-strong bg-surface py-16 text-center">
              <PackageSearch className="h-10 w-10 text-fg-subtle" />
              <p className="font-semibold">Няма продукти по тези критерии</p>
              <p className="text-sm text-fg-muted">Опитайте друга дума или изчистете филтрите.</p>
            </div>
          ) : view === 'list' ? (
            <div className="rounded-md border border-border bg-surface">{items.map((p) => <ProductRow key={p.id} product={p} price={priceFor(p, viewer)} />)}</div>
          ) : (
            <ProductGrid>{items.map((p, i) => <ProductCard key={p.id} product={p} price={priceFor(p, viewer)} priority={i < 4} />)}</ProductGrid>
          )}
          <Pagination page={page} pages={pages} hrefFor={(n) => pageHref(path, params, n)} />
        </div>
      </div>
    </div>
  );
}

export const parseSort = (s?: string) => (s === 'new' || s === 'name' ? s : '');
export const parsePage = (s?: string) => Math.max(1, Number.parseInt(s ?? '1', 10) || 1);
