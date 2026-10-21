# Design System — GN Склад

Status: v1 (mockup), 2026-10-21. Source of truth: `tailwind.config.ts` and `src/styles/tokens.css`.

## Principles

1. **Order fast, repeatedly.** Wholesale buyers come back weekly. Quantities, pack sizes and minimum order quantities are visible without opening a product page.
2. **Calm premium.** Warm off-white background, one strong green, amber used only for urgency (promotions, cut-off, MOQ). No gradients except image scrims.
3. **Truthful data.** Real product photos from PrestaShop. AI imagery is used only for mood (hero, categories, campaigns), never for products. No price is shown to guests.
4. **Mobile is its own product.** Bottom navigation, bottom sheets, 44px+ touch targets, safe-area insets.

## Tokens

| Token | Value | Use |
|---|---|---|
| `primary` | `#176B4D` | Brand, primary actions, active states |
| `primary-hover` | `#12583F` | Hover |
| `primary-soft` | `#E7F2EC` | Selected rows, info notes |
| `secondary` | `#49A46C` | Eyebrows, brand links |
| `accent` | `#F2A93B` | Cart badge, MOQ, cut-off clock (sparingly) |
| `bg` | `#F8FAF7` | Page background |
| `surface` / `surface-muted` | `#FFFFFF` / `#F1F5F1` | Cards / inputs, chips |
| `fg` / `fg-muted` / `fg-subtle` | `#18241D` / `#4C5C52` / `#75847A` | Text levels (AA on `bg` for `fg` and `fg-muted`) |
| `border` / `border-strong` | `#DFE6E0` / `#C4CFC7` | Dividers / inputs |
| `danger` `warning` `success` | `#C4322E` `#B06A00` `#1F804B` | States |

**Typography:** Manrope (`latin` + `cyrillic` subsets, `next/font`, self-hosted, `display: swap`). With `lang="bg"` the font uses the **Bulgarian Cyrillic letterforms** (д, л, ж and others in the native Bulgarian shape). That's intentional and culturally correct; if the merchant prefers Russian-style forms, set `lang="bg"` only on content and use `font-feature-settings: "locl" 0`.

Scale: `2xs 11` · `xs 12` · `sm 14` · `base 16` · `lg 18` · `xl 22` · `2xl 28` · `3xl 36` · `4xl 48` px. Headings use weight 800 with tight tracking; body text is 400–500.

**Spacing:** Tailwind 4px scale. Page gutter is 16px on mobile and 24px from `md`. Max content width is 1440px.

**Breakpoints:** `sm 480` · `md 768` · `lg 1024` · `xl 1280` · `2xl 1440`. Verified widths: 360, 390, 430, 768, 1024, 1440. None has horizontal overflow (`.audit/mock/`).

**Radius:** `sm 6` · default `10` · `md 12` · `lg 16` · `xl 24`. **Elevation:** `shadow-1` (resting buttons), `shadow-2` (card hover), `shadow-3` (drawers, menus).

**Motion:** 150–300 ms, `cubic-bezier(0.22,1,0.36,1)`. Uses: the drawer and bottom sheets slide in, card images zoom 3% on hover. `prefers-reduced-motion` turns slides into fades and disables transitions globally.

## Components (implemented)

| Component | File | Notes |
|---|---|---|
| Button | `components/ui/button.tsx` | primary / secondary / ghost / accent; sm 36, md 44, lg 48 px |
| ArtPicture | `components/ui/art-picture.tsx` | `<picture>` with AVIF + WebP and art direction per breakpoint |
| PriceTag | `components/product/price-tag.tsx` | Guest: "Влезте, за да видите цената" (lock). Customer: price + "без ДДС" + price basis |
| QuantityStepper | `components/product/quantity-stepper.tsx` | Respects `{min, step}`; typed values snap to valid quantities; ↑/↓/Enter |
| AddToCart | `components/product/add-to-cart.tsx` | "Добави 10" (min qty), then turns into a stepper with "В количката" |
| ProductCard / ProductRow | `components/product/product-card.tsx` | Grid card; dense list row for repeat ordering; pack and MOQ badges |
| Header | `components/site/header.tsx` | Utility bar with cut-off countdown, search, account, cart, mega-menu, quick links |
| CategoryMenu | `components/site/category-menu.tsx` | Two-pane mega-menu with the full 25-group tree; Esc / click-outside |
| BottomNav | `components/site/bottom-nav.tsx` | Home, Categories, Search, Cart, Profile; safe-area aware; cart badge |
| CartDrawer | `components/cart/cart-drawer.tsx` | Slide-over, focus on close button, Esc closes, body scroll lock |
| ListingToolbar | `components/catalog/listing-toolbar.tsx` | Sort, grid/list toggle; mobile filter and sort **bottom sheets** |
| Breadcrumbs | `components/catalog/breadcrumbs.tsx` | Includes `BreadcrumbList` JSON-LD |
| CutoffCountdown | `components/site/cutoff-countdown.tsx` | Saturday 13:00 Europe/Sofia, DST-safe (unit-tested) |

Empty states: cart, filters with no results, quick-order search. Loading: cart skeleton. Errors: still to do (Phase 3, together with the API error model).

## Creative assets (Higgsfield)

Generated through the installed Higgsfield MCP integration (`gpt_image_2_5`, high quality) on 2026-10-21, for about 37 credits. Masters are in `assets-src/higgsfield/` (not served). Optimized AVIF and WebP variants are in `public/assets/higgsfield/`. The full list with job IDs, sizes and bytes is in [`public/assets/higgsfield/manifest.json`](../public/assets/higgsfield/manifest.json). To regenerate variants: `docker compose run --rm app npm run assets:optimize`.

| Asset | Ratio | Variants | Used on |
|---|---|---|---|
| hero-desktop / -tablet / -mobile | 21:9 / 4:3 / 9:16 | 1280–2560 / 1024–1600 / 640–1080 | Homepage hero (art-directed) |
| campaign-weekly-promo | 21:9 | 960–2400 | Promotions banner |
| campaign-wholesale | 21:9 | 960–2400 | Quick order banner, login |
| campaign-new-arrivals | 21:9 | 960–2400 | Bio selection banner |
| campaign-seasonal | 21:9 | 960–2400 | Reserved (holiday campaign) |
| cat-* ×12 | 4:3 | 480, 800 | Category tiles, category headers |

The desktop hero is **165 KB** as AVIF at 2560w, down from a 4.4 MB PNG master.

**Rules:** prompts forbid text, logos, labels, packaging and people. These images never stand in for product photos, and they make no claims about brands, prices or ingredients. Confirm commercial usage rights under the account's Higgsfield plan before launch. Motion assets weren't produced: they're not needed for the mockup, and heavy hero video is discouraged on mobile.
