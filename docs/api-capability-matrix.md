# API Capability Matrix

Verified 2026-10-21 against `https://hranitelnistoki.com/api/` (PrestaShop 1.7.6.0 Webservice) with the merchant-provided key. Only GET requests were made.

## 1. Webservice key handling

- The key lives only in the server-side `.env` (gitignored, dockerignored) and never reaches the browser.
- The storefront client implements **GET only**. Writes go through the `gnheadless` module.
- Cost prices, password hashes, secure keys and employee data are never requested or mapped.
- Production uses a dedicated read-only key limited to catalog resources. Key scope details are kept in internal notes, not in this repository.

## 2. Verified shop configuration

| Setting | Value | Consequence |
|---|---|---|
| Active products / total | 10,596 / 19,238 | Index and sitemap only `active=1` |
| Categories (active / total) | 227 / 232 | |
| Combinations | 0 | Model products as simple; no variant UI |
| Cart rules | 0 | No voucher UI (also `voucher_enabled=0`) |
| Carriers (active) | id 19 "Транспортна фирма" | Single carrier; checkout step can auto-select |
| `PS_B2B_ENABLE` | 1 | Company / VAT fields on customers and addresses |
| `PS_CATALOG_MODE` | 0 | Guests' hidden prices come from **group settings** (`show_prices` on visitor/guest groups), not global catalog mode |
| `PS_UNIDENTIFIED_GROUP` / `PS_GUEST_GROUP` / `PS_CUSTOMER_GROUP` | 1 / 2 / 3 | Default B2B customer group is 3 |
| `PS_STOCK_MANAGEMENT` | 0 | **No stock tracking.** No stock counts or "out of stock" states. Availability = `active && available_for_order` |
| `PS_ORDER_OUT_OF_STOCK` | 1 | Ordering is always allowed |
| `PS_PURCHASE_MINIMUM` | 0 | No minimum order value |
| `PS_DISPLAY_QTIES` | 0 | Quantities not shown |
| `PS_PRICE_ROUND_MODE` / `PS_ROUND_TYPE` | 2 (half-up) / 1 (per item) | Must match in any client-side preview formatting |
| `PS_CURRENCY_DEFAULT` | 2 (EUR, seen in storefront) | |
| `PS_LANG_DEFAULT` | 2 (bg); 3 = en, 4 = tr | |
| `PS_COUNTRY_DEFAULT` | 236 | (id to confirm; storefront showed `country-BG`) |
| `PS_ROUTE_product_rule` | `{category:/}{id}{-:id_product_attribute}-{rewrite}{-:ean13}.html` | Legacy URL contract for redirects |
| `PS_ROUTE_category_rule` | `{id}-{rewrite}` | |
| `PS_SHOP_DOMAIN(_SSL)` | hranitelnistoki.com | Sitemap pointing to bghranite.com comes from the sitemap module, not from this setting |

## 3. Product data shape (verified on product 11721)

| Field | Use | Notes |
|---|---|---|
| `id`, `reference`, `ean13` | Identity, SKU search, barcode lookup | `ean13` often empty |
| `name[lang]`, `link_rewrite[lang]` | Title, URL | bg/en/tr present |
| `description_short[lang]` | Holds "Цената е за", "Транспортна опаковка", "Минималното количество", "превод" lines | Parsed into structured fields where the pattern matches; raw HTML kept as fallback |
| `minimal_quantity` | MOQ | **Authoritative** (10 on sample) |
| `price` | Base price, tax excl. | Never sent to guests. For customers, the price shown comes from the module (group / specific price / quantity discount) |
| `wholesale_price` | Cost price | **Never leaves the server**; dropped in the DTO schema |
| `id_tax_rules_group` | Tax context | Rates not readable (no `taxes` access); totals come from the module/cart |
| `id_manufacturer`, `manufacturer_name` | Brand | `manufacturers` resource not granted. Brand list derived from products until it is |
| `id_category_default`, `associations.categories` | Category, breadcrumbs | |
| `associations.images`, `id_default_image` | Gallery | Public URL `/{id_image}-{type}/{rewrite}.jpg` |
| `weight` (kg), `unity`, `unit_price_ratio` | Unit info | `unity` empty on sample |
| `available_for_order`, `show_price`, `active`, `visibility` | Display rules | |
| `on_sale`, `new` | Badges | |
| `product_features` | Only "Composition" and "Property" defined | Not used for pack data |

## 4. Feature → implementation method

| Feature | Method | Status |
|---|---|---|
| Category tree | Webservice `categories` (GET) | ✅ verified readable |
| Product list / detail | Webservice `products` (GET, `display=full`, `filter`, `limit`) | ✅ verified readable. Full scan takes ~28 s, so it needs a sync and cache |
| Product images | Public image URLs + `image_types` | ✅ resource readable |
| Brands | Webservice `manufacturers` (GET) | ✅ now granted |
| Search | Meilisearch fed by worker sync from Webservice | Planned |
| Stock | n/a (stock management disabled) | ✅ resolved: not needed |
| Guest price hiding | BFF never returns prices without a session | Planned |
| Customer login | **Module `gnheadless`** (`Customer::getByEmail` with password) | ❌ `customers` is readable, but comparing password hashes outside PrestaShop is explicitly out of bounds; verification stays inside PS |
| Customer-specific prices | **Module** (`Product::getPriceStatic` in customer context) | ⚠️ `specific_prices`/`groups` are now readable (useful for analysis and sync), but reimplementing PS price rules outside PS is error-prone, so the module stays authoritative |
| Cart | **Module** wrapping native `Cart` | Webservice `carts` is writable but skips context-aware pricing, so not used |
| Checkout / order creation | **Module** → `PaymentModule::validateOrder`, idempotent | ❌ needs module + staging |
| Order history / reorder | Webservice `orders` + `order_details` filtered by the **session's** `id_customer` (server-side), or module | ⚠️ readable now; BFF must always inject the customer filter itself (object-level access control) |
| Addresses | Module (scoped to the session's customer) | Webservice `addresses` is readable, but access would not be scoped per customer |
| Payment methods | Module (installed payment modules) | Unknown which are active |
| Saved lists | Module tables | Planned |
| CMS pages | Webservice `content_management_system` (GET) | ✅ now granted |
| Change sync (search, ISR) | Poll `products?filter[date_upd]=>[…]&date=1` every N minutes | Planned |

Legend: ✅ verified · ⚠️ partial / workaround · ❌ requires the `gnheadless` module
