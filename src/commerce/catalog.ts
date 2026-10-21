import 'server-only';
import { redis } from '@/server/redis';
import { searchProductIds } from '@/server/search';
import { CatalogEngine, type ListQuery, type ListResult } from './engine';
import { fixtureData } from './fixture';
import { loadSnapshot, snapshotVersion } from './store';

const CHECK_EVERY_MS = 30_000;

interface Cache { engine: CatalogEngine; version: string | null; checkedAt: number }
const g = globalThis as unknown as { __catalog?: Cache; __catalogLoading?: Promise<Cache> };

async function loadLive(prev?: Cache): Promise<Cache> {
  const r = redis();
  const version = await snapshotVersion(r);
  if (prev && version === prev.version) return { ...prev, checkedAt: Date.now() };
  const data = version ? await loadSnapshot(r) : null;
  return { engine: new CatalogEngine(data ?? fixtureData()), version: data ? version : null, checkedAt: Date.now() };
}

/**
 * Returns the in-memory catalog. With COMMERCE_ADAPTER=prestashop it is built from the snapshot
 * written by the sync worker and refreshed when the worker publishes a new version.
 * Until the first sync completes (or with COMMERCE_ADAPTER=fixture) it serves the labelled demo data.
 */
export async function getCatalog(): Promise<CatalogEngine> {
  if (process.env.COMMERCE_ADAPTER !== 'prestashop') {
    g.__catalog ??= { engine: new CatalogEngine(fixtureData()), version: null, checkedAt: Date.now() };
    return g.__catalog.engine;
  }
  const cached = g.__catalog;
  if (cached && Date.now() - cached.checkedAt < CHECK_EVERY_MS) return cached.engine;
  g.__catalogLoading ??= loadLive(cached)
    .catch((e) => {
      console.error('[catalog] load failed', e);
      return cached ?? { engine: new CatalogEngine(fixtureData()), version: null, checkedAt: Date.now() };
    })
    .finally(() => { g.__catalogLoading = undefined; });
  g.__catalog = await g.__catalogLoading;
  return g.__catalog.engine;
}

/** Listing with search: Meilisearch for live data (typo-tolerant, Latin/Cyrillic), in-memory fallback otherwise. */
export async function listProducts(catalog: CatalogEngine, query: ListQuery): Promise<ListResult> {
  if (query.q && catalog.data.source === 'prestashop') {
    const ids = await searchProductIds(query.q);
    if (ids) return catalog.list({ ...query, ids, q: undefined });
  }
  return catalog.list(query);
}

export type { CatalogEngine };
