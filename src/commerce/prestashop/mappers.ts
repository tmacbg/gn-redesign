import { parsePackInfo } from '@/domain/pack';
import type { Category } from '@/domain/types';
import type { CatalogProduct } from '../catalog-data';
import type { CategoryDTO, LangValues, ProductDTO } from './dto';

export const LANG = { bg: '2', en: '3' } as const;
/** PrestaShop "Root" (1) and "Home" (2) are structural, not storefront categories. */
export const HOME_CATEGORY_ID = 2;

export const pick = (v: LangValues | undefined, lang: string) => v?.find((x) => x.id === lang)?.value.trim() ?? '';
const orNull = (s: string) => (s ? s : null);
/** Category names carry private-use icon glyphs from the legacy theme. */
export const cleanLabel = (s: string) => s.replace(/[-]/g, '').replace(/\s+/g, ' ').trim();

export function mapCategory(c: CategoryDTO): Category {
  return {
    id: c.id, parentId: c.id_parent, depth: c.level_depth - 1, position: c.position,
    name: { bg: cleanLabel(pick(c.name, LANG.bg)), en: cleanLabel(pick(c.name, LANG.en)) },
    slug: pick(c.link_rewrite, LANG.bg),
  };
}

export function imageUrls(baseUrl: string, imageId: number, slug: string) {
  const b = baseUrl.replace(/\/$/, '');
  return { id: imageId, medium: `${b}/${imageId}-home_default/${slug}.jpg`, large: `${b}/${imageId}-large_default/${slug}.jpg` };
}

export function mapProduct(p: ProductDTO, baseUrl: string): CatalogProduct {
  const slug = pick(p.link_rewrite, LANG.bg);
  const imageIds = [...new Set([p.id_default_image, ...(p.associations.images ?? []).map((i) => i.id)])].filter((n) => n > 0);
  const images = imageIds.map((i) => imageUrls(baseUrl, i, slug));
  const categoryIds = [...new Set([p.id_category_default, ...(p.associations.categories ?? []).map((c) => c.id)])].filter((c) => c > HOME_CATEGORY_ID);
  return {
    id: p.id,
    reference: p.reference,
    ean13: orNull(p.ean13 ?? ''),
    name: { bg: pick(p.name, LANG.bg), en: pick(p.name, LANG.en) },
    slug,
    categoryId: p.id_category_default,
    categoryIds,
    brand: p.id_manufacturer > 0 && p.manufacturer_name ? { id: p.id_manufacturer, name: p.manufacturer_name.trim() } : null,
    quantity: { min: p.minimal_quantity, step: 1 },
    pack: parsePackInfo(pick(p.description_short, LANG.bg)),
    weightKg: p.weight > 0 ? p.weight : null,
    onSale: p.on_sale,
    availableForOrder: p.available_for_order,
    image: images[0] ?? null,
    images,
    dateAdd: p.date_add,
    basePriceExcl: p.price,
    metaTitle: orNull(pick(p.meta_title, LANG.bg)),
    metaDescription: orNull(pick(p.meta_description, LANG.bg)),
  };
}

/** Storefront-visible: active, and visible in catalog listings. */
export const isListable = (p: ProductDTO) => p.active && (p.visibility === 'both' || p.visibility === 'catalog');
