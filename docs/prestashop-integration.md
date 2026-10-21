# PrestaShop Integration

Status 2026-10-21: **catalog integration live and tested** (Phase 3). Customer auth, pricing, cart and checkout are still to do (Phase 4, needs the `gnheadless` module and a staging shop).

## 1. Catalog data flow

```
PrestaShop 1.7.6 Webservice ──GET only──▶ worker (sync-catalog.ts)
                                             ├─▶ Redis  catalog:v1:snapshot (gzip JSON) + catalog:v1:version
                                             └─▶ Meilisearch index "products" (no prices)
Next.js app ── getCatalog() ── loads snapshot into memory, re-checks version every 30 s
            └─ listProducts() ── Meilisearch for text search, in-memory engine for category, brand, sort and pagination
```

| Piece | File |
|---|---|
| Webservice client (GET only, retries on 429 and 5xx, 60 s timeout) | `src/commerce/prestashop/client.ts` |
| DTO schemas (Zod; unknown fields such as `wholesale_price` are stripped) | `src/commerce/prestashop/dto.ts` |
| DTO → domain mappers | `src/commerce/prestashop/mappers.ts` |
| Full and incremental sync, search indexing | `src/commerce/prestashop/sync.ts` |
| Worker loop with Redis lock | `src/worker/sync-catalog.ts` |
| Snapshot store | `src/commerce/store.ts` |
| In-memory catalog engine (shared with the demo fixture) | `src/commerce/engine.ts` |
| Adapter selection and refresh | `src/commerce/catalog.ts` |

## 2. Sync behaviour (verified)

| | Value |
|---|---|
| First full sync | 10,596 products · 225 categories · 366 brands · **88 s** · 0 rejected items |
| Incremental sync | `filter[date_upd]` window since the last sync (−1 day overlap for server timezone) · 51 changed in 1.9 s |
| Schedule | Incremental every `SYNC_INTERVAL_MIN` (10); full every `FULL_SYNC_HOURS` (24) or on start without a snapshot |
| Deletions | Detected only by the full sync (the Webservice has no change feed) |
| Search index | Built in `products_tmp`, then **atomically swapped** in |
| Concurrency | Redis `SET NX` lock (30 min TTL) |

Commands:

```bash
docker compose up -d worker                                    # continuous
docker compose run --rm worker npm run sync:catalog -- --once --full   # one-off full sync
docker compose logs -f worker
```

## 3. Mapping rules

- **Storefront products:** `active=1` and `visibility ∈ {both, catalog}`.
- **Categories:** active, excluding PrestaShop Root (1) and Home (2). Legacy icon glyphs are stripped from names.
- **Category membership** comes from `associations.categories`, not only the default category. This is how the promotion categories (`%Топ Промоции%` and others) fill up: 177 products.
- **"Ново" badge:** `date_add` within `PS_NB_DAYS_NEW_PRODUCT` days (read from configuration).
- **Pack data:** `minimal_quantity` is authoritative. Price basis, transport package and label languages are parsed from `description_short`, which matches the convention on 95% of the sample.
- **Images:** `/{id_image}-home_default/{rewrite}.jpg` and `large_default`, served from the PrestaShop origin and optimized by `next/image`.
- **URLs:** identical to legacy (`/bg/{id}-{rewrite}`, `/bg/{category}/{id}-{rewrite}.html`), so no redirects are needed for these routes.

## 4. Search

Meilisearch, chosen over Typesense: one binary, built-in typo tolerance, works well with Cyrillic. Searchable fields: Bulgarian name, reference, brand, **Latin transliteration** (Bulgarian streamlined system), English name, EAN, category names.

Verified queries: "сирене" (298), "sirene" (244), typo "сирнее" (276), "kashkaval" (125), reference "55622263" (1), "pirinsko" (10). If Meilisearch is unavailable, the app falls back to in-memory matching.

## 5. Security notes

- The Webservice key is server-side only. The client exposes `get()` and nothing else.
- The snapshot keeps the **catalog base price** only to power the demo customer view. It is never indexed and never returned to guests: `/api/search` and the pages check this, and so does a test.
- Production must use a dedicated read-only key (see `api-capability-matrix.md` §1).

## 6. Customer groups (for Phase 4)

The shop uses several customer groups with different price visibility, group reductions and specific prices. Internal group details are kept outside this repository. Customer prices **must** therefore come from PrestaShop's own price engine (`gnheadless` module), not from the snapshot.

## 7. Checkout rules (merchant-confirmed)

- **Payment:** bank transfer only. The module calls `PaymentModule::validateOrder` through `ps_wirepayment`, so PrestaShop's own order state ("Awaiting bank wire payment"), confirmation email with bank details, and order reference are used unchanged.
- **Carrier:** id 19 "Транспортна фирма", fixed. The module rejects any other carrier id.
- **VAT:** every customer buys VAT-exclusive. The storefront shows no VAT. To verify on staging: PrestaShop must also compute the **order** without tax (via group `price_display_method`, customer/address VAT number or tax rules). Otherwise the order total in PS and in the storefront would differ.
  > Open item: one customer group's tax display setting needs merchant confirmation (internal notes).
- **Registration:** none. Customers are created by staff in the PS back office; the module exposes no sign-up endpoint.

## 8. Next: `gnheadless` module (Phase 4)

Endpoints and native classes: see `architecture.md` §7. Prerequisites: a staging copy of the shop (or FTP/SSH to a non-production install) and a test B2B customer in each relevant group.
