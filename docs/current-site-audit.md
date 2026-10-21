# Current Site Audit — hranitelnistoki.com

Audit date: 2026-10-21. Method: headless Chromium (Playwright 1.48.2) and curl, both run in Docker containers, from an allowlisted IP after the merchant added a Cloudflare rule. Only guest (anonymous) access was available. Raw captures live in `.audit/raw/` (not for commit).

Legend: **[V]** verified by observation · **[I]** inferred from strong evidence · **[A]** assumption, needs validation.

---

## 0. Merchant-confirmed business rules (2026-10-21)

| Rule | Confirmed by merchant | Implementation |
|---|---|---|
| Payment | **Bank transfer only** | Checkout offers a single method (`ps_wirepayment`); no card or other providers |
| Delivery | **"Транспортна фирма" only** (PS carrier id 19) | Carrier step auto-selected, no choice UI |
| Prices for guests | **Never shown**, registered users only | BFF returns no prices without a session (pages and `/api/*`) |
| Registration | **Only by GN staff**, no public sign-up | No registration route or form; login page points to phone contact |
| VAT | **All customers buy VAT-exclusive** | Prices and totals shown without VAT, no VAT line |

Config: `src/lib/store-policy.ts`.

## 1. Verified findings

### Platform

| Item | Finding | |
|---|---|---|
| Commerce engine | PrestaShop **1.7.6.0** (version string in page JS) | V |
| Theme | `metromarket` by aeipix (third-party), modules `aei_cmsbanner`, `aei_imageslider`, `ps_banner` | V |
| CDN / WAF | Cloudflare with a Turnstile managed challenge for unknown clients | V |
| Webservice API | `/api/` answers **401**: enabled, needs a key | V |
| Merchant | GN Invest LTD / "GN Склад", ул. „Иван Братанов" 2Д, 7800 Попово, България · +359888402639 · gn_zaqvki@hranitelnistoki.com | V |
| Tagline | "Вкус от България"; meta: "GN Ltd, основен доставчик на български храни и стоки в Европа" | V |

### Commerce configuration (from the `window.prestashop` object, guest session)

| Setting | Value | Meaning | |
|---|---|---|---|
| `configuration.is_catalog` | `true` | Catalog mode for guests | V |
| `configuration.show_prices` | `false` | **Prices hidden from guests** | V |
| `display_prices_tax_incl` | `false` | Prices shown **tax-excluded** (B2B convention) | V |
| `quantity_discount.type` | `discount` | Quantity discounts are configured | V |
| `voucher_enabled` | `0` | Vouchers / cart-rule codes disabled at checkout | V |
| `return_enabled` | `0` | Merchandise returns disabled | V |
| Currency | EUR (€) | Single currency seen | V |
| Country context | `country-BG` | | V |
| Languages | bg (id 2, default, `/bg/`), en-GB (`/gb/`), tr (`/tr/`), plus a Google Translate widget | | V |

### Business rules visible in the UI

- "Този сайт е предназначен само за онлайн поръчки от Европа!": EU-only ordering. **[V]**
- Weekly order window: orders are accepted until **Saturday 13:00**, processed through Monday; anything later moves to the following week. **[V]** (homepage banner)
- No public registration: the login page (`/bg/вход`) has only email and password, with no "create account" link. **Accounts are provisioned by the merchant.** **[I]**
- An order how-to is provided as a YouTube video (`youtu.be/doAKBrM9CJk`). **[V]**

### Product data (sample: `/bg/khlyab/11721-khlyab-blgariya-650gr10-brv-kashon.html`)

Shown as free text in the description or custom fields **[V]**:

- "Цената е за: 1 бр. / 650 гр." (price basis: unit and weight)
- "Транспортна опаковка: Кашон" (transport package type)
- "Минималното количество за поръчка е: 10 бр." (minimum order quantity, likely PS `minimal_quantity`) **[I]**
- "Продукта е с превод от производителя на: Немски, Френски, Нидерландски" (label translations, relevant for EU export)
- "Референция 55622263" (SKU / reference)
- Names encode the pack: "650гр/10 броя в кашон"

Price, stock and add-to-cart are not visible to guests.

### Catalog

- **222 categories** in the mega-menu, two levels deep, with top-level groups in caps: БЕЗАЛКОХОЛНИ, МЕСНИ, МЛЕЧНИ, Замразени продукти, Захарни изделия, Ядки и снакс, ПОДПРАВКИ, ВАРИВА, КОНСЕРВИ, КОЗМЕТИКА, Кафе и чай, Алкохолни напитки, ПЛОДОВЕ И ЗЕЛЕНЧУЦИ, ТУРШИИ, ТЕСТЕНИ, ПРЕПАРАТИ, ДОМАШНИ ПОТРЕБИ, БЕБЕШКИ, БИО ПРОДУКТИ, Промо Пакети, and more. **[V]**
- Category labels contain private-use icon glyphs (`…`) that must be stripped in mapping. **[V]**
- **~400+ brands** linked (`/bg/brand/{id}-{slug}`), almost all Bulgarian producers. **[V]**
- Promotions are modelled as **categories**: `%Топ Промоции%` (id 456, 171 products) plus per-brand subcategories ("Промоция Еко Мес", "ХАЛАЛ Стефанов", …). **[V]** No evidence of PS specific-price-driven promo badges for guests.
- Badges seen: "НОВ" (new). **[V]**
- Sections: "Най-продавани" (bestsellers). **[V]**
- Search: native PS search at `/bg/търсене?s=` with relevance sort ("Приложимост"); the query "сирене" returns 235 products. **[V]**

### URL structure (SEO)

| Type | Pattern | Example |
|---|---|---|
| Home | `/{lang}/` | `/bg/` |
| Category | `/{lang}/{id}-{slug}` | `/bg/456-top-promocii` |
| Product | `/{lang}/{category-slug}/{id}-{slug}.html` | `/bg/khlyab/11721-….html` |
| Brand | `/{lang}/brand/{id}-{slug}` | `/bg/brand/559-bio-nl-bulgaria` |
| CMS | `/{lang}/content/{id}-{slug}` | `/bg/content/4-about-us` |
| Login | `/bg/вход`, `/gb/entrance`, `/tr/oturum-ac` | localized Cyrillic slugs |
| Account | `/bg/моят-профил` | |
| Search | `/bg/търсене` | |
| Contact | `/bg/за-контакти` | |

- Canonical tags present on category and product pages. **[V]**
- Search pages are `noindex`. **[V]**
- **No JSON-LD structured data** on product or category pages. **[V]**
- `robots.txt` is the stock PrestaShop one. **[V]**
- **Sitemap defect:** `/1_bg_0_sitemap.xml` lists 6,244 URLs, but every `<loc>` points to **`https://bghranite.com/`**, a different (old) domain. Google is being sent to the wrong host. **[V]**
- Product titles carry dimension info; meta descriptions are mostly empty or default. **[I]**

### Responsive / UX / performance

- Desktop: navy header, grey utility bar, large raster hero (brand-sponsored campaign image), yellow full-width notice block with phone number. **[V]**
- Rendered homepage DOM ≈ **944 KB** HTML (the mega-menu with 222 categories and 400+ brand links is inlined). **[V]**
- Mobile (390px): no horizontal overflow. **[V]**
- Google Translate widget plus a third-party chat bubble are loaded on every page, which costs performance and privacy. **[V]**
- Truncated product names in grids ("Валмес Кюфтета с Лук...") hide the pack-size information that buyers need. **[V]**
- Footer copyright: "© 2026 – Софтуер За Електронна Търговия". **[V]**

## 2. Existing functionality

| Area | Status | Notes |
|---|---|---|
| Category browsing, mega-menu | V | 222 categories |
| Brand listing and brand pages | V | |
| Product pages | V | MOQ, package and price basis as text |
| Search with relevance sort | V | Native PS |
| Sorting | V | "Подреди по" |
| Faceted filtering | A | Not observed on the sampled pages; `ps_facetedsearch` not confirmed |
| Login | V | email + password |
| Registration | I: none | Merchant-provisioned accounts |
| Wishlist | V | "You need to be logged in to save products in your wish list" |
| Newsletter signup | V | Footer form |
| Cart / checkout | Not observable | Catalog mode for guests |
| Customer account / order history | Not observable | Needs a test account |
| Multi-language bg/en/tr | V | |
| Live chat widget | V | Third-party |

## 3. Information architecture

```
Home
├── Начало · За нас (CMS 4) · Екип (CMS 7) · Всички марки
├── Категории (mega-menu, ~20 top-level groups → ~200 leaves)
│   └── %Топ Промоции% (456) → per-brand promo subcategories
├── Search
├── Вход → Моят профил (orders, addresses, wishlist; assumed)
└── Footer: Как да поръчам (YouTube) · Политика за лични данни · Общи условия · За нас · Контакти · Карта на сайта
```

## 4. UX opportunities

1. **Login-first B2B journey.** Guests see a catalog without prices, so the new storefront should make the "log in to see your prices" path explicit and attractive, rather than empty price slots.
2. **Structured pack data.** Promote MOQ, pack type, units per carton and price basis from free text into structured fields shown on cards ("10 бр. / кашон · мин. 10").
3. **Quantity steppers that respect MOQ and multiples**, instead of a free text input.
4. **Quick order and reorder** for weekly replenishment, matched to the Saturday 13:00 cut-off. Show a countdown to the weekly cut-off.
5. **Promotions as a first-class surface**, not 25 brand subcategories in a sidebar.
6. **Lighter navigation.** Load the 222-category tree on demand instead of inlining ~900 KB of HTML.
7. **Remove the Google Translate widget** and rely on the real bg/en/tr content.
8. **Full product names** with pack size; avoid truncation in grids.
9. **Mobile bottom navigation** and filter/sort bottom sheets.

## 5. Integration risks

| Risk | Impact | Mitigation |
|---|---|---|
| PS **1.7.6.0** is old (2019) and has no Admin API; only the legacy Webservice | High | Webservice for catalog reads; a custom module for customer auth, cart pricing and checkout |
| Webservice cannot verify customer passwords | High | Custom PS module endpoint that calls the native `Customer::getByEmail($email, $passwd)` path |
| Webservice does not compute contextual prices (group, specific prices, quantity discounts) reliably for a customer | High | A module endpoint that runs `Product::getPriceStatic` in the customer context, or one that uses the PS cart for totals |
| Checkout must keep the PS payment-module and order-state flow | High | Create orders through `PaymentModule::validateOrder` inside a module, never by raw DB writes |
| Pack/MOQ data is partly free text | Medium | Prefer `minimal_quantity` and features; parse text only as a labelled fallback |
| Cloudflare Turnstile on origin | Medium | Server-to-server calls need an allow rule or a direct origin hostname; the BFF must not trip bot protection |
| PHP / PS version compatibility of new modules | Medium | Target PHP 7.1–7.3 syntax for PS 1.7.6 |
| Sitemap on wrong domain | Medium (SEO) | Fix in the new sitemap; report it to the merchant now |
| Private-use glyphs in category names | Low | Strip them in the mapper |

## 6. Unknowns requiring validation

1. Webservice key and the enabled resources (products, categories, combinations, specific_prices, stock_availables, customers, groups, carts, orders, …).
2. Customer groups, and whether prices differ per group (B2B tiers).
3. ~~Account creation~~ → confirmed: staff only.
4. Whether combinations (variants) are used.
5. How MOQ is stored (`minimal_quantity`?) and whether quantity *multiples* are enforced or only the minimum.
6. ~~Carrier~~ → confirmed: "Транспортна фирма" only. Delivery zones (EU countries) still to confirm. Minimum order value: none (`PS_PURCHASE_MINIMUM=0`).
7. ~~Payment~~ → confirmed: bank transfer only.
8. Whether stock is managed (`PS_STOCK_MANAGEMENT`) and whether out-of-stock ordering is allowed.
9. Order confirmation emails and order states in use.
10. Whether the en/tr translations are complete and in SEO scope.
11. Hosting / origin access for the BFF (same server? separate?).
12. Whether `ps_facetedsearch` is installed.
13. Why the sitemap points to bghranite.com (a shared catalog with another shop?).

**Needed from the merchant:** a Webservice API key (read-only for the first phase), a **test B2B customer account** (not a real customer), and ideally a **staging copy** or DB dump for checkout testing.

## 7. Feature parity checklist

| # | Feature | Legacy | New target |
|---|---|---|---|
| 1 | Guests see catalog without prices | V | Required |
| 2 | Prices tax-excl. for logged-in customers | V (config) | Required |
| 3 | bg / en / tr languages with same URL patterns | V | bg required; en/tr to confirm |
| 4 | 222-category tree | V | Required |
| 5 | Brand index and brand pages | V | Required |
| 6 | Promotions category tree | V | Required (redesigned) |
| 7 | Bestsellers, "new" badge | V | Required |
| 8 | Product: reference, MOQ, package, price basis, label translations | V | Required, structured |
| 9 | Search with relevance sort | V | Required (improved) |
| 10 | Login (email + password, existing hashes) | V | Required |
| 11 | No public registration | I | Preserve; offer a "request access" contact form |
| 12 | Wishlist | V | Replace with saved lists |
| 13 | Newsletter signup | V | Keep if consent-compliant |
| 14 | EU-only notice | V | Required |
| 15 | Weekly order cut-off notice | V | Required (with countdown) |
| 16 | Cart / checkout / payment / carriers | Unknown | Required, validate with test account |
| 17 | Order history / account | Unknown | Required |
| 18 | Canonical URLs, noindex search | V | Required |
| 19 | 301 for every legacy product, category, brand and CMS URL | n/a | Required |
| 20 | CMS pages (about, team, privacy, terms) | V | Required |
| 21 | Contact details and phone | V | Required |
| 22 | Order how-to video | V | Keep link |
