import Image from 'next/image';
import Link from 'next/link';
import { Package } from 'lucide-react';
import type { CustomerPrice, Product } from '@/domain/types';
import { AddToCart } from './add-to-cart';
import { PriceTag } from './price-tag';
import { getViewer } from '@/server/viewer';
import { productHref, toCartLine } from './line';

export function PackBadges({ product }: { product: Product }) {
  const { pack, quantity } = product;
  return (
    <div className="flex flex-wrap gap-1">
      {pack.transportPackage && (
        <span className="inline-flex items-center gap-1 rounded-sm bg-surface-muted px-1.5 py-0.5 text-2xs font-medium text-fg-muted">
          <Package className="h-3 w-3" aria-hidden />{pack.transportPackage}
        </span>
      )}
      {quantity.min > 1 && <span className="rounded-sm bg-accent-soft px-1.5 py-0.5 text-2xs font-semibold text-warning">мин. {quantity.min}</span>}
    </div>
  );
}

export async function ProductCard({ product, price, priority }: { product: Product; price: CustomerPrice | null; priority?: boolean }) {
  const href = productHref(product);
  const { canOrder } = await getViewer();
  return (
    <article className="group relative flex flex-col rounded-md border border-border bg-surface p-2.5 transition-shadow duration-200 hover:shadow-2 sm:p-3">
      <Link href={href} className="relative mb-2.5 block aspect-square overflow-hidden rounded bg-white">
        {product.image ? (
          <Image src={product.image.medium} alt={product.name.bg} fill sizes="(min-width:1280px) 220px, (min-width:768px) 25vw, 45vw" className="object-contain p-2 transition-transform duration-300 ease-out group-hover:scale-[1.03]" priority={priority} />
        ) : null}
        <div className="absolute left-1.5 top-1.5 flex flex-col gap-1">
          {product.isNew && <span className="rounded-sm bg-primary px-1.5 py-0.5 text-2xs font-bold uppercase tracking-wide text-primary-fg">Ново</span>}
        </div>
      </Link>
      {product.brand && <div className="truncate text-2xs font-semibold uppercase tracking-wide text-fg-subtle">{product.brand.name}</div>}
      <h3 className="mt-0.5 line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-5 text-fg">
        <Link href={href} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">{product.name.bg}</Link>
      </h3>
      <div className="mt-1.5"><PackBadges product={product} /></div>
      <div className="relative z-10 mt-auto flex flex-col gap-2 pt-3">
        <PriceTag price={price} basis={product.pack.priceBasis} />
        {price && <AddToCart line={toCartLine(product, price)} canOrder={canOrder && product.availableForOrder} size="sm" full />}
      </div>
    </article>
  );
}

export async function ProductRow({ product, price }: { product: Product; price: CustomerPrice | null }) {
  const href = productHref(product);
  const { canOrder } = await getViewer();
  return (
    <div className="flex items-center gap-3 border-b border-border px-2 py-2.5 last:border-0 sm:gap-4 sm:px-3">
      <Link href={href} className="relative h-14 w-14 shrink-0 overflow-hidden rounded bg-white">
        {product.image && <Image src={product.image.medium} alt="" fill sizes="56px" className="object-contain p-1" />}
      </Link>
      <div className="min-w-0 flex-1">
        <Link href={href} className="line-clamp-2 text-sm font-semibold hover:text-primary">{product.name.bg}</Link>
        {price && <PriceTag price={price} basis={product.pack.priceBasis} className="mt-1 md:hidden [&_span:first-child]:text-base" />}
        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-fg-subtle">
          <span>Реф. {product.reference}</span>
          {product.brand && <span className="hidden sm:inline">{product.brand.name}</span>}
          <PackBadges product={product} />
        </div>
      </div>
      <PriceTag price={price} basis={product.pack.priceBasis} className="hidden w-36 text-right md:block" />
      {price ? <AddToCart line={toCartLine(product, price)} canOrder={canOrder && product.availableForOrder} size="sm" /> : <PriceTag price={null} className="md:hidden" />}
    </div>
  );
}

export function ProductGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">{children}</div>;
}
