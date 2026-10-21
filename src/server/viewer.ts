import 'server-only';
import { cookies } from 'next/headers';
import { cache } from 'react';
import { getCatalog } from '@/commerce/catalog';
import { accessForGroup, canOrder, canSeePrices, type ViewerStatus } from '@/domain/access';
import type { CustomerPrice, Product } from '@/domain/types';
import { storePolicy } from '@/lib/store-policy';

export interface Viewer {
  status: ViewerStatus;
  isLoggedIn: boolean;
  /** May see prices: any logged-in customer. */
  isCustomer: boolean;
  /** May add to cart and order: only the ordering group, re-checked on every request. */
  canOrder: boolean;
  name: string | null;
  price(productId: number): CustomerPrice | null;
}

export const DEMO_VIEW_COOKIE = 'gn_demo_view';

/** Mockup: the DEMO bar picks a simulated group. Phase 4 reads the live group from PrestaShop on every request. */
const DEMO_GROUP: Record<string, number> = { customer: 3, restricted: 5 };

/** Memoized per request, so components can call it freely. */
export const getViewer = cache(async function getViewer(): Promise<Viewer> {
  const [c, catalog] = await Promise.all([cookies(), getCatalog()]);
  const demo = c.get(DEMO_VIEW_COOKIE)?.value ?? 'guest';
  const groupId = DEMO_GROUP[demo];
  const status: ViewerStatus = groupId == null ? 'guest' : accessForGroup(groupId, storePolicy.groups.orderingGroupIds);
  const isCustomer = canSeePrices(status);
  return {
    status, isLoggedIn: status !== 'guest', isCustomer, canOrder: canOrder(status),
    name: status === 'guest' ? null : 'Магазин „Демо“ ЕООД',
    price: (id) => (isCustomer ? catalog.demoPrice(id) : null),
  };
});

/** Guests never receive a price. */
export function priceFor(product: Product, viewer: Viewer): CustomerPrice | null {
  return viewer.price(product.id);
}
