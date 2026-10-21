export type Locale = 'bg' | 'en';
export type Localized = Record<Locale, string>;

export interface Money {
  /** Amount in major units (EUR), tax excluded unless stated otherwise. */
  amount: number;
  currency: 'EUR';
}

export interface Category {
  id: number;
  parentId: number;
  depth: number;
  position: number;
  name: Localized;
  slug: string;
}

export interface CategoryNode extends Category {
  children: CategoryNode[];
}

export interface Brand {
  id: number;
  name: string;
}

export interface QuantityRule {
  /** Minimum order quantity, from PrestaShop `minimal_quantity`. */
  min: number;
  /** Order in multiples of this. 1 unless the merchant defines package multiples. */
  step: number;
}

/** Package facts parsed from the merchant's structured description text. */
export interface PackInfo {
  /** "1 бр. / 650 гр.", "1 кг." */
  priceBasis: string | null;
  /** "Кашон" */
  transportPackage: string | null;
  /** Label translations provided by the producer, e.g. ["Немски", "Френски"] */
  labelLanguages: string[];
}

export interface ProductImage {
  id: number;
  medium: string;
  large: string;
}

export interface Product {
  id: number;
  reference: string;
  ean13: string | null;
  name: Localized;
  slug: string;
  /** Default category (drives the canonical URL). */
  categoryId: number;
  /** URL rewrite of the default category (legacy product URLs include it). */
  categorySlug: string;
  /** Every category the product is assigned to (promotions are modelled as categories). */
  categoryIds: number[];
  brand: Brand | null;
  quantity: QuantityRule;
  pack: PackInfo;
  weightKg: number | null;
  isNew: boolean;
  onSale: boolean;
  availableForOrder: boolean;
  image: ProductImage | null;
  images: ProductImage[];
  dateAdd: string;
}

/** Price shown to an authenticated customer. Never present for guests. */
export interface CustomerPrice {
  productId: number;
  unitPrice: Money;
  /** Where the number came from; the UI labels anything other than `customer`. */
  source: 'customer' | 'catalog-base';
}
