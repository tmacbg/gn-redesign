import type { CustomerPrice, Product } from '@/domain/types';
import { productUrl } from '@/lib/urls';
import type { CartLineInput } from './add-to-cart';

export const productHref = (p: Product) => productUrl(p, p.categorySlug);

export function toCartLine(p: Product, price: CustomerPrice | null): CartLineInput {
  return {
    productId: p.id, name: p.name.bg, image: p.image?.medium ?? null, href: productHref(p), reference: p.reference,
    rule: p.quantity, basis: p.pack.priceBasis, pack: p.pack.transportPackage, unitPrice: price?.unitPrice.amount ?? null,
  };
}
