import { Barcode, Globe2, Hash, Package, Scale, ShieldCheck, Truck } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCatalog, listProducts } from '@/commerce/catalog';
import { Gallery } from '@/components/product/gallery';
import { Breadcrumbs } from '@/components/catalog/breadcrumbs';
import { AddToCart } from '@/components/product/add-to-cart';
import { productHref, toCartLine } from '@/components/product/line';
import { PriceTag } from '@/components/product/price-tag';
import { ProductCard } from '@/components/product/product-card';
import { Rail, Section } from '@/components/site/section';
import { categoryUrl, parseIdSlug } from '@/lib/urls';
import { getViewer, priceFor } from '@/server/viewer';

type Props = { params: Promise<{ segment: string; product: string }> };

async function load(params: Props['params']) {
  const parsed = parseIdSlug((await params).product);
  return parsed ? (await getCatalog()).product(parsed.id) : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await load(params);
  if (!p) return {};
  const meta = (await getCatalog()).productMeta(p.id);
  const desc = meta?.description || [p.brand?.name, p.pack.priceBasis && `Цена за ${p.pack.priceBasis}`, p.pack.transportPackage, p.quantity.min > 1 && `мин. ${p.quantity.min}`].filter(Boolean).join(' · ');
  return {
    title: meta?.title || p.name.bg, description: desc, alternates: { canonical: productHref(p) },
    openGraph: { title: p.name.bg, description: desc, images: p.image ? [{ url: p.image.large, width: 1000, height: 1000 }] : [] },
  };
}

export default async function ProductPage({ params }: Props) {
  const product = await load(params);
  if (!product) notFound();
  const [viewer, catalog] = await Promise.all([getViewer(), getCatalog()]);
  const price = priceFor(product, viewer);
  const path = catalog.categoryPath(product.categoryId);
  const related = (await listProducts(catalog, { categoryId: product.categoryId, perPage: 11 })).items.filter((p) => p.id !== product.id).slice(0, 10);
  const facts = [
    { icon: Hash, k: 'Референция', v: product.reference },
    product.ean13 && { icon: Barcode, k: 'Баркод (EAN)', v: product.ean13 },
    product.pack.priceBasis && { icon: Scale, k: 'Цената е за', v: product.pack.priceBasis },
    product.pack.transportPackage && { icon: Package, k: 'Транспортна опаковка', v: product.pack.transportPackage },
    { icon: ShieldCheck, k: 'Минимално количество', v: `${product.quantity.min}` },
    product.pack.labelLanguages.length > 0 && { icon: Globe2, k: 'Етикет с превод на', v: product.pack.labelLanguages.join(', ') },
  ].filter(Boolean) as { icon: typeof Hash; k: string; v: string }[];

  // No price/offers in structured data: prices are customer-specific and hidden from guests.
  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'Product', name: product.name.bg, sku: product.reference,
    ...(product.ean13 && { gtin13: product.ean13 }), ...(product.brand && { brand: { '@type': 'Brand', name: product.brand.name } }),
    ...(product.images.length > 0 && { image: product.images.map((i) => i.large) }),
  };

  return (
    <>
      <div className="mx-auto max-w-[1440px] px-4 pt-4 md:px-6 md:pt-6">
        <Breadcrumbs items={[...path.map((c) => ({ name: c.name.bg, href: categoryUrl(c) })), { name: product.name.bg }]} />
        <div className="mt-4 grid gap-6 md:grid-cols-2 lg:gap-12">
          <Gallery images={product.images} alt={product.name.bg} badge={product.isNew ? <span className="absolute left-3 top-3 rounded-sm bg-primary px-2 py-1 text-xs font-bold uppercase text-primary-fg">Ново</span> : null} />
          <div className="flex flex-col">
            {product.brand && <a href={`/bg/tarsene?brand=${product.brand.id}`} className="text-sm font-bold uppercase tracking-wide text-secondary hover:underline">{product.brand.name}</a>}
            <h1 className="mt-1 text-2xl font-extrabold leading-tight tracking-tight md:text-3xl">{product.name.bg}</h1>
            <div className="mt-5 rounded-lg border border-border bg-surface p-5">
              <PriceTag price={price} basis={product.pack.priceBasis} size="lg" />
              {price?.source === 'catalog-base' && <p className="mt-1 text-2xs text-fg-subtle">Демо: базова каталожна цена. Реалната цена зависи от клиентската група.</p>}
              <div className="mt-4 flex flex-wrap items-center gap-3">
                {price && !viewer.canOrder ? (
                  <a href="tel:+359888402639" className="text-sm font-semibold text-warning hover:underline">Поръчките за профила ви са временно ограничени — свържете се с GN</a>
                ) : price ? <AddToCart line={toCartLine(product, price)} canOrder={product.availableForOrder} /> : (
                  <a href="/bg/vhod" className="inline-flex h-12 items-center rounded bg-primary px-6 font-semibold text-primary-fg hover:bg-primary-hover">Вход за клиенти</a>
                )}
                {product.quantity.min > 1 && <span className="text-sm text-fg-muted">Поръчва се минимум <b className="text-fg">{product.quantity.min}</b></span>}
              </div>
              <p className="mt-4 flex items-center gap-2 border-t border-border pt-4 text-sm text-fg-muted"><Truck className="h-4 w-4 text-primary" />Поръчки до събота 13:00 се доставят следващата седмица</p>
            </div>
            <dl className="mt-5 divide-y divide-border rounded-lg border border-border bg-surface">
              {facts.map(({ icon: Icon, k, v }) => (
                <div key={k} className="flex items-center gap-3 px-4 py-3 text-sm">
                  <Icon className="h-4 w-4 shrink-0 text-fg-subtle" aria-hidden />
                  <dt className="w-44 shrink-0 text-fg-muted">{k}</dt>
                  <dd className="font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
      {related.length > 0 && path.length > 0 && (
        <Section title="Още от категорията" href={categoryUrl(path[path.length - 1]!)}>
          <Rail>{related.map((p) => <ProductCard key={p.id} product={p} price={priceFor(p, viewer)} />)}</Rail>
        </Section>
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
