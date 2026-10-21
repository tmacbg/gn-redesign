// Also used by the sync worker (plain Node), so no `server-only` marker here.
import { MeiliSearch } from 'meilisearch';

export const PRODUCTS_INDEX = 'products';

const g = globalThis as unknown as { __meili?: MeiliSearch };

export function meili(): MeiliSearch {
  g.__meili ??= new MeiliSearch({ host: process.env.MEILI_HOST ?? 'http://localhost:7700', apiKey: process.env.MEILI_MASTER_KEY });
  return g.__meili;
}

/** Public search document. Deliberately contains no prices (they are customer-specific). */
export interface ProductSearchDoc {
  id: number;
  name_bg: string;
  name_en: string;
  translit: string;
  reference: string;
  ean13: string | null;
  brand: string | null;
  brandId: number | null;
  categoryIds: number[];
  categories: string[];
  dateAdd: number;
}

export const productIndexSettings = {
  searchableAttributes: ['name_bg', 'reference', 'brand', 'translit', 'name_en', 'ean13', 'categories'],
  filterableAttributes: ['categoryIds', 'brandId'],
  sortableAttributes: ['dateAdd', 'name_bg'],
  displayedAttributes: ['id'],
  typoTolerance: { minWordSizeForTypos: { oneTypo: 4, twoTypos: 8 }, disableOnAttributes: ['reference', 'ean13'] },
  pagination: { maxTotalHits: 2000 },
};

export async function searchProductIds(q: string, limit = 2000): Promise<number[] | null> {
  try {
    const res = await meili().index(PRODUCTS_INDEX).search<{ id: number }>(q, { limit, attributesToRetrieve: ['id'] });
    return res.hits.map((h) => h.id);
  } catch {
    return null; // caller falls back to in-memory matching
  }
}
