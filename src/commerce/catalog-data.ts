import type { Brand, Category, Product } from '@/domain/types';

/** Serializable catalog snapshot produced by the sync worker (or built from the fixture). */
export interface CatalogProduct extends Omit<Product, 'isNew' | 'categorySlug'> {
  /** Catalog base price, tax excl. Server-only; never indexed or sent to guests. */
  basePriceExcl: number | null;
  metaTitle: string | null;
  metaDescription: string | null;
}

export interface CatalogData {
  source: 'prestashop' | 'fixture';
  syncedAt: string;
  /** PS_NB_DAYS_NEW_PRODUCT */
  newDays: number;
  categories: Category[];
  brands: Brand[];
  products: CatalogProduct[];
}
