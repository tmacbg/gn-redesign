// Redis-backed catalog snapshot shared between the sync worker and the web app.
import { gunzipSync, gzipSync } from 'node:zlib';
import type Redis from 'ioredis';
import type { CatalogData } from './catalog-data';

const KEY = 'catalog:v1:snapshot';
const VERSION = 'catalog:v1:version';

export async function saveSnapshot(r: Redis, data: CatalogData) {
  await r.multi().set(KEY, gzipSync(JSON.stringify(data))).set(VERSION, data.syncedAt).exec();
}

export async function snapshotVersion(r: Redis): Promise<string | null> {
  return r.get(VERSION);
}

export async function loadSnapshot(r: Redis): Promise<CatalogData | null> {
  const buf = await r.getBuffer(KEY);
  return buf ? (JSON.parse(gunzipSync(buf).toString('utf8')) as CatalogData) : null;
}
