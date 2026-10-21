import { parsePackInfo as parsePack } from '@/domain/pack';
import type { CatalogData } from '../catalog-data';
import snapshot from './snapshot.json';

/** Builds a CatalogData from the committed demo snapshot (231 real products, local images). */
export function fixtureData(): CatalogData {
  return {
    source: 'fixture',
    syncedAt: snapshot.generatedAt,
    newDays: 20,
    categories: snapshot.categories,
    brands: [],
    products: snapshot.products.map((p) => {
      const image = p.imageId ? { id: p.imageId, medium: `/mock/p/${p.id}-m.jpg`, large: `/mock/p/${p.id}-l.jpg` } : null;
      return {
        id: p.id, reference: p.reference, ean13: p.ean13, name: p.name, slug: p.slug, categoryId: p.categoryId, categoryIds: [p.categoryId],
        brand: p.brand, quantity: { min: p.minimalQuantity, step: 1 }, pack: parsePack(p.descriptionShortHtml), weightKg: p.weightKg,
        onSale: p.onSale, availableForOrder: p.availableForOrder, image, images: image ? [image] : [], dateAdd: p.dateAdd,
        basePriceExcl: null, metaTitle: null, metaDescription: null,
      };
    }),
  };
}
