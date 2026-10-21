import { getCatalog, listProducts } from '@/commerce/catalog';
import { ProductListing, parsePage, parseSort } from '@/components/catalog/product-listing';
import { SearchBox } from '@/components/site/search-box';
import { getViewer } from '@/server/viewer';

export const metadata = { title: 'Търсене', robots: { index: false, follow: true } };

export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const [sp, viewer, catalog] = await Promise.all([searchParams, getViewer(), getCatalog()]);
  const q = sp.q?.trim().slice(0, 100) ?? '';
  const sort = parseSort(sp.sort);
  const activeBrand = sp.brand ? Number(sp.brand) : null;
  const result = await listProducts(catalog, { q: q || undefined, brandId: activeBrand ?? undefined, sort: sort || (q ? 'relevance' : 'recommended'), page: parsePage(sp.page) });
  const brandName = activeBrand ? catalog.brands().find((b) => b.id === activeBrand)?.name : null;
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-6 md:px-6">
      <SearchBox defaultValue={q} className="md:hidden" autoFocus={!q && !activeBrand} />
      <h1 className="mt-4 text-2xl font-extrabold tracking-tight md:mt-0 md:text-3xl">
        {q ? <>Резултати за „{q}“</> : brandName ?? 'Всички продукти'}
      </h1>
      <div className="mt-5">
        <ProductListing result={result} viewer={viewer} activeBrand={activeBrand} sort={sort} view={sp.view ?? ''} path="/bg/tarsene" params={{ q: q || undefined, sort: sp.sort, brand: sp.brand, view: sp.view }} />
      </div>
    </div>
  );
}
