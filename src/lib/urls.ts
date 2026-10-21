import type { Category, Product } from '@/domain/types';

// Legacy PrestaShop URL contract, kept 1:1 so existing links and rankings survive.
//   category: /bg/{id}-{rewrite}      product: /bg/{category}/{id}-{rewrite}.html
export const categoryUrl = (c: Pick<Category, 'id' | 'slug'>) => `/bg/${c.id}-${c.slug}`;
export const productUrl = (p: Pick<Product, 'id' | 'slug'>, categorySlug: string) => `/bg/${categorySlug}/${p.id}-${p.slug}.html`;
export const parseIdSlug = (segment: string) => {
  const m = decodeURIComponent(segment).match(/^(\d+)-(.+?)(?:\.html)?$/);
  return m ? { id: Number(m[1]), slug: m[2]! } : null;
};
