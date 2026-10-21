# Architecture — GN Склад headless storefront

Status: draft v1, 2026-10-21. Based on [current-site-audit.md](current-site-audit.md).

## 1. Context and constraints

- The existing **PrestaShop 1.7.6.0** stays the source of truth for catalog, prices, customers, carts and orders.
- PS 1.7.6 offers only the **legacy Webservice API**. It has no Admin API (PS 9) and no storefront API, and it cannot verify customer passwords or compute customer-context prices. Those gaps are closed by a small **custom PrestaShop module** (`gnheadless`) that runs inside PrestaShop and reuses its own classes.
- The shop is **closed B2B**: no public registration, guests see no prices, prices are tax-excluded, there are MOQs, and a weekly order cut-off (Saturday 13:00).
- Everything runs in **Docker** containers: development, production, tests and tooling.

## 2. High-level view

```
 Browser / PWA ──HTTPS──▶ Next.js (App Router)                       Redis
                         ├─ Server Components (SSR/ISR pages)  ───▶ sessions, rate limits, cache
                         ├─ Route Handlers /api/* (BFF)        ───▶ Meilisearch (public catalog index)
                         └─ Service Worker (static + offline)
                                   │ server-only, signed requests
                                   ▼
                         PrestaShop 1.7.6 (origin, behind Cloudflare allow rule)
                         ├─ Webservice /api/*   → catalog reads (products, categories, manufacturers,
                         │                         stock_availables, combinations, images)
                         └─ module gnheadless   → auth, contextual pricing, cart, checkout,
                                                  order history, reorder (HMAC-signed)
 Worker (same image) ── catalog sync ──▶ Meilisearch
```

The browser only ever talks to Next.js. PrestaShop credentials (Webservice key, module HMAC secret) exist only in server environment variables.

## 3. Layers

| Layer | Path | Responsibility |
|---|---|---|
| Domain models | `src/domain/` | Framework-free TypeScript types: `Product`, `Category`, `Brand`, `Money`, `QuantityRule`, `Cart`, `Order`, `Customer`. Pure functions: quantity validation, money formatting, cut-off calculation. |
| Ports | `src/commerce/ports.ts` | `CatalogPort`, `CustomerPort`, `CartPort`, `CheckoutPort` interfaces. |
| PrestaShop adapter | `src/commerce/prestashop/` | `webservice/` (HTTP client, Zod DTO schemas, mappers DTO → domain) and `module/` (signed client for `gnheadless`). This is the only code that knows PrestaShop shapes. |
| Fixture adapter | `src/commerce/fixture/` | Deterministic in-memory implementation for local development and tests. Selected only by `COMMERCE_ADAPTER=fixture` and rendered with a visible **"DEMO DATA"** banner, so it is never mistaken for live data. |
| Services | `src/server/` | Session, auth, rate limiting, caching, search, audit log. `server-only` imports. |
| BFF API | `src/app/api/**/route.ts` | Typed endpoints with Zod-validated input and output, CSRF checks on mutations, object-level authorization from the session. |
| UI | `src/app/(store)/**`, `src/components/` | Server Components by default; client components only for interactivity (quantity steppers, drawers, search box). |

## 4. Key decisions

| # | Decision | Why |
|---|---|---|
| D1 | Next.js App Router + TypeScript strict + Tailwind + shadcn/ui primitives | Requested stack; RSC keeps the JS bundle small |
| D2 | **Custom module `gnheadless`** for auth, pricing, cart and checkout | The Webservice cannot verify passwords or apply PS cart-rule, tax, group and specific-price logic. The module calls native `Customer`, `Cart`, `Product::getPriceStatic` and `PaymentModule::validateOrder`, so PS rules stay authoritative. |
| D3 | The module is reached through **HMAC-SHA256-signed** server-to-server requests (timestamp + nonce, 5-minute window) | No customer tokens or admin keys exposed; replay-safe |
| D4 | Sessions: opaque random ID in a `__Host-` HttpOnly, Secure, SameSite=Lax cookie; session data in Redis (customer id, group, PS cart id, CSRF secret) | Server-side revocation; no JWTs with PII in the browser |
| D5 | **Two price modes**: guests get no prices (mirrors catalog mode); logged-in users get prices from the module in their own customer context | Preserves current business rule; never leaks group prices |
| D6 | Public search index (Meilisearch) holds **no prices**; prices are hydrated per request for logged-in users | Prices are customer-specific |
| D7 | Meilisearch over Typesense | Simpler ops, good typo tolerance, single binary, fine for ~6k products |
| D8 | Catalog pages use ISR (`revalidate` 300 s) plus tag-based revalidation from sync webhooks; prices and stock are always fetched fresh for logged-in users | SEO and speed without stale prices |
| D9 | Cart lives in PrestaShop (`Cart` object via module); the BFF stores only `id_cart` in session | Totals, taxes and cart rules come from PS |
| D10 | Checkout = module endpoint wrapping `validateOrder` with an **idempotency key** (stored in Redis and in a module table) | Prevents duplicate orders; uses the native order flow, emails and references |
| D11 | Offline: service worker caches the shell, static assets and visited catalog pages; offline pages show "prices may be outdated" and disable checkout | PWA requirement without stale-price risk |
| D12 | Docker Compose services: `app` (dev), `app-prod` (standalone build), `worker` (search sync), `redis`, `meilisearch`, `test-unit`, `test-e2e` | Everything containerised |

## 5. Docker topology

| Service | Image | Profile | Purpose |
|---|---|---|---|
| `app` | `Dockerfile` target `dev` | default | `next dev` with hot reload, source bind-mounted |
| `redis` | `redis:7.4-alpine` | default | Sessions, rate limit, cache |
| `meilisearch` | `getmeili/meilisearch:v1.11.3` | default | Search |
| `worker` | target `dev` | default | `npm run sync:search` loop |
| `app-prod` | target `runner` | `prod` | `node server.js` from the standalone output, non-root |
| `test-unit` | target `dev` | `test` | Vitest |
| `test-e2e` | `mcr.microsoft.com/playwright` | `test` | Playwright against `app` |

## 6. Security summary

Server-only secrets; Zod on every input; CSRF double-submit token on mutating routes; login throttling (per IP and per email, Redis sliding window); object-level checks (every order, list or address lookup is scoped by the session's `customerId` in the module call, never by a client-supplied id); strict CSP, HSTS and frame-ancestors headers; audit log for login, checkout and reorder; no PII in analytics. Details: `docs/production-readiness.md`.

## 7. `gnheadless` module endpoints (planned)

| Endpoint | Purpose | Native PS API used |
|---|---|---|
| `POST auth/login` | Verify email and password | `Customer::getByEmail($email, $plaintext)` (uses the shop's own hashing) |
| `GET customer/{id}` | Profile, group, addresses | `Customer`, `Address` |
| `POST prices` | Contextual prices for N products and quantities | `Product::getPriceStatic` with `Context` set to the customer |
| `GET/POST cart` | Read or create the cart; add, update, remove lines | `Cart::updateQty`, `Cart::getSummaryDetails` |
| `GET checkout/options` | Carriers and payment modules for the cart | `Carrier::getCarriersForOrder`, `PaymentModule::getInstalledPaymentModules` |
| `POST checkout` | Place the order (idempotent) | `PaymentModule::validateOrder` |
| `GET orders`, `GET orders/{id}` | Customer order history | `Order::getCustomerOrders` |
| `POST reorder` | Build a cart from an order with revalidation | `Cart::updateQty` per line |
| `lists/*` | Saved shopping lists | Module tables `gnh_list`, `gnh_list_item` |

PHP target: 7.1+ syntax, compatible with PS 1.7.6.

## 8. Open items

See section 6 of the audit. The blocking ones are the Webservice key, a test B2B account, and a staging copy for checkout.
