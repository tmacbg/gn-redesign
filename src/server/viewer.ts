import 'server-only';
import { cookies } from 'next/headers';
import { getCatalog } from '@/commerce/catalog';
import type { CustomerPrice, Product } from '@/domain/types';

export interface Viewer {
  /** Mockup: toggled by the DEMO bar. Phase 4 replaces this with the real session. */
  isCustomer: boolean;
  name: string | null;
  price(productId: number): CustomerPrice | null;
}

export const DEMO_VIEW_COOKIE = 'gn_demo_view';

export async function getViewer(): Promise<Viewer> {
  const [c, catalog] = await Promise.all([cookies(), getCatalog()]);
  const isCustomer = c.get(DEMO_VIEW_COOKIE)?.value === 'customer';
  return { isCustomer, name: isCustomer ? 'Магазин „Демо“ ЕООД' : null, price: (id) => (isCustomer ? catalog.demoPrice(id) : null) };
}

/** Guests never receive a price (mirrors the legacy shop's group setting). */
export function priceFor(product: Product, viewer: Viewer): CustomerPrice | null {
  return viewer.price(product.id);
}
