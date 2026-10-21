// Also used by the sync worker (plain Node), so no `server-only` marker here.

/**
 * Read-only client for the PrestaShop 1.7 Webservice.
 * Only GET is implemented on purpose: the storefront never writes through the Webservice
 * (cart and order writes go through the gnheadless module).
 */
export class WebserviceError extends Error {
  constructor(message: string, readonly status: number | null, readonly resource: string) {
    super(message);
  }
}

export interface WebserviceConfig {
  baseUrl: string;
  key: string;
  timeoutMs?: number;
  retries?: number;
}

export type Query = Record<string, string | number | undefined>;

/** PrestaShop expects literal [ ] , | in display/filter/sort values, so they are not percent-encoded. */
export function buildQuery(params: Query): string {
  const enc = (v: string) => encodeURIComponent(v).replace(/%5B/g, '[').replace(/%5D/g, ']').replace(/%2C/g, ',').replace(/%7C/g, '|');
  return Object.entries({ output_format: 'JSON', ...params })
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${enc(k)}=${enc(String(v))}`)
    .join('&');
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function createWebservice({ baseUrl, key, timeoutMs = 60_000, retries = 3 }: WebserviceConfig) {
  const auth = 'Basic ' + Buffer.from(`${key}:`).toString('base64');

  async function get<T>(resource: string, params: Query = {}): Promise<T> {
    const url = `${baseUrl.replace(/\/$/, '')}/api/${resource}?${buildQuery(params)}`;
    let lastError: unknown;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const res = await fetch(url, { method: 'GET', headers: { Authorization: auth, Accept: 'application/json' }, signal: AbortSignal.timeout(timeoutMs), cache: 'no-store' });
        if (res.status === 429 || res.status >= 500) throw new WebserviceError(`HTTP ${res.status}`, res.status, resource);
        if (!res.ok) throw Object.assign(new WebserviceError(`HTTP ${res.status}`, res.status, resource), { fatal: true });
        const text = await res.text();
        // PrestaShop returns "[]" for an empty collection instead of { resource: [] }
        return (text.trim() === '[]' ? {} : JSON.parse(text)) as T;
      } catch (e) {
        lastError = e;
        if ((e as { fatal?: boolean }).fatal || attempt === retries) break;
        await sleep(500 * 2 ** attempt);
      }
    }
    if (lastError instanceof WebserviceError) throw lastError;
    throw new WebserviceError(`Request failed: ${(lastError as Error)?.message}`, null, resource);
  }

  return { get };
}

export type Webservice = ReturnType<typeof createWebservice>;
