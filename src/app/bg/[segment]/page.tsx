import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCatalog, listProducts } from '@/commerce/catalog';
import { Breadcrumbs } from '@/components/catalog/breadcrumbs';
import { ProductListing, parsePage, parseSort } from '@/components/catalog/product-listing';
import { categoryVisual, srcSet } from '@/lib/assets';
import { categoryUrl, parseIdSlug } from '@/lib/urls';
import { getViewer } from '@/server/viewer';

type Props = { params: Promise<{ segment: string }>; searchParams: Promise<Record<string, string | undefined>> };

async function load(params: Props['params']) {
  const parsed = parseIdSlug((await params).segment);
  return parsed ? (await getCatalog()).category(parsed.id) : null;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const c = await load(params);
  if (!c) return {};
  const sp = await searchParams;
  const filtered = Boolean(sp.brand || sp.sort || sp.view);
  return {
    title: c.name.bg,
    description: `${c.name.bg} на едро — български продукти за магазини в Европа. GN Invest LTD.`,
    // Pagination stays indexable with a self-canonical; filtered/sorted variants are noindex.
    alternates: { canonical: sp.page && sp.page !== '1' && !filtered ? `${categoryUrl(c)}?page=${sp.page}` : categoryUrl(c) },
    robots: filtered ? { index: false, follow: true } : undefined,
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const category = await load(params);
  if (!category) notFound();
  const [sp, viewer, catalog] = await Promise.all([searchParams, getViewer(), getCatalog()]);
  const path = catalog.categoryPath(category.id);
  const top = path[0]!;
  const visual = categoryVisual[top.id];
  const sort = parseSort(sp.sort);
  const activeBrand = sp.brand ? Number(sp.brand) : null;
  const result = await listProducts(catalog, { categoryId: category.id, brandId: activeBrand ?? undefined, sort: sort || 'recommended', page: parsePage(sp.page) });
  const subs = category.children.length ? category.children : (catalog.category(category.parentId)?.children ?? []);
  const parent = category.children.length ? category : catalog.category(category.parentId);

  return (
    <div className="mx-auto max-w-[1440px] px-4 pt-4 md:px-6 md:pt-6">
      <Breadcrumbs items={path.map((c) => ({ name: c.name.bg, href: categoryUrl(c) }))} />
      <header className="relative mt-3 overflow-hidden rounded-lg border border-border bg-surface">
        <div className="flex items-center gap-4 p-4 md:p-6">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">{category.id === 456 ? 'Топ промоции' : category.name.bg}</h1>
            {top.id !== category.id && <p className="mt-1 text-sm text-fg-muted">в {top.name.bg}</p>}
          </div>
          {visual && (
            <picture className="hidden h-24 w-36 shrink-0 overflow-hidden rounded-md sm:block">
              <source type="image/avif" srcSet={srcSet(visual, [480], 'avif')} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/assets/higgsfield/${visual}-480.webp`} alt="" width={144} height={96} className="h-full w-full object-cover" />
            </picture>
          )}
        </div>
        {subs.length > 0 && (
          <nav aria-label="Подкатегории" className="border-t border-border">
            <ul className="flex gap-2 overflow-x-auto px-4 py-3 [scrollbar-width:none] md:px-6">
              {parent && parent.id !== category.id && <li><Link href={categoryUrl(parent)} className="block whitespace-nowrap rounded-full border border-border px-3.5 py-1.5 text-sm font-medium text-fg-muted hover:border-primary hover:text-primary">Всички</Link></li>}
              {subs.map((s) => (
                <li key={s.id}>
                  <Link href={categoryUrl(s)} aria-current={s.id === category.id ? 'page' : undefined}
                    className={`block whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-medium ${s.id === category.id ? 'border-primary bg-primary text-primary-fg' : 'border-border text-fg-muted hover:border-primary hover:text-primary'}`}>{s.name.bg}</Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>
      <div className="mt-6">
        <ProductListing result={result} viewer={viewer} activeBrand={activeBrand} sort={sort} view={sp.view ?? ''} path={categoryUrl(category)} params={{ sort: sp.sort, brand: sp.brand, view: sp.view }} />
      </div>
    </div>
  );
}
