/**
 * Catalog sync worker: PrestaShop Webservice → Redis snapshot + Meilisearch index.
 * Full sync at start (if no snapshot or older than FULL_SYNC_HOURS), incremental every SYNC_INTERVAL_MIN.
 * Run: docker compose up worker   |   one-off: docker compose run --rm worker npm run sync:catalog -- --once --full
 */
import { createWebservice } from '@/commerce/prestashop/client';
import { fullSync, incrementalSync, reindexAll, reindexChanged } from '@/commerce/prestashop/sync';
import { loadSnapshot, saveSnapshot } from '@/commerce/store';
import Redis from 'ioredis';
import { MeiliSearch } from 'meilisearch';

const env = (k: string, d?: string) => {
  const v = process.env[k] ?? d;
  if (v === undefined || v === '') throw new Error(`Missing env ${k}`);
  return v;
};

const baseUrl = env('PRESTASHOP_BASE_URL');
const ws = createWebservice({ baseUrl, key: env('PRESTASHOP_WEBSERVICE_KEY') });
const r = new Redis(env('REDIS_URL', 'redis://localhost:6379'));
const meili = new MeiliSearch({ host: env('MEILI_HOST', 'http://localhost:7700'), apiKey: process.env.MEILI_MASTER_KEY });
const INTERVAL = Number(process.env.SYNC_INTERVAL_MIN ?? 10) * 60_000;
const FULL_EVERY = Number(process.env.FULL_SYNC_HOURS ?? 24) * 3_600_000;
const LOCK = 'catalog:v1:sync-lock';
const args = new Set(process.argv.slice(2));

const log = (m: string) => console.log(`[sync ${new Date().toISOString()}] ${m}`);

async function runOnce(forceFull: boolean) {
  if (!(await r.set(LOCK, String(process.pid), 'EX', 1800, 'NX'))) return log('another sync is running; skipping');
  const t0 = Date.now();
  try {
    const prev = await loadSnapshot(r);
    if (forceFull || !prev || prev.source !== 'prestashop' || Date.now() - Date.parse(prev.syncedAt) > FULL_EVERY) {
      log('full sync');
      const data = await fullSync(ws, baseUrl, log);
      await saveSnapshot(r, data);
      await reindexAll(meili, data, log);
      log(`full sync done: ${data.products.length} products, ${data.categories.length} categories, ${data.brands.length} brands in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
    } else {
      const { data, changed, removed } = await incrementalSync(ws, baseUrl, prev, log);
      await saveSnapshot(r, data);
      await reindexChanged(meili, data, changed, removed);
      log(`incremental sync done: ${changed.length} changed, ${removed.length} removed in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
    }
  } finally {
    await r.del(LOCK);
  }
}

async function main() {
  await runOnce(args.has('--full'));
  if (args.has('--once')) { r.disconnect(); return; }
  for (;;) {
    await new Promise((res) => setTimeout(res, INTERVAL));
    await runOnce(false).catch((e) => log(`sync failed: ${(e as Error).message}`));
  }
}

main().catch((e) => { log(`fatal: ${(e as Error).stack}`); process.exit(1); });
