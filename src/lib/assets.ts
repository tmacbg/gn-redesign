// Higgsfield creative assets (see public/assets/higgsfield/manifest.json and docs/design-system.md).
const A = '/assets/higgsfield';

export const srcSet = (name: string, widths: number[], fmt: 'avif' | 'webp') =>
  widths.map((w) => `${A}/${name}-${w}.${fmt} ${w}w`).join(', ');
export const assetUrl = (name: string, width: number, fmt: 'avif' | 'webp' = 'webp') => `${A}/${name}-${width}.${fmt}`;

/** Top-level PrestaShop category id → category visual. */
export const categoryVisual: Record<number, string> = {
  93: 'cat-meat', 101: 'cat-dairy', 87: 'cat-drinks', 113: 'cat-confectionery', 147: 'cat-preserves',
  180: 'cat-bakery', 140: 'cat-pantry', 178: 'cat-fruit-veg', 124: 'cat-nuts-snacks', 319: 'cat-household',
  321: 'cat-household', 333: 'cat-baby', 344: 'cat-organic', 179: 'cat-preserves', 107: 'cat-meat', 167: 'cat-drinks',
};

/** Order of category shortcuts on the homepage. */
export const featuredCategoryIds = [93, 101, 87, 113, 147, 180, 140, 178, 124, 344, 333, 319];
