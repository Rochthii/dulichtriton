/**
 * Server-Side Cache & Global Version Heartbeat
 * Du Lịch Tri Tôn AI Project
 * 
 * Ensures:
 * 1. Global DATA_VERSION timestamp updated on every Admin mutation.
 * 2. Short CDN maxage (60s) with long Stale-While-Revalidate (24h) for instant Edge response.
 * 3. Client auto-detects version increments and invalidates local storage immediately.
 */

interface ServerCacheEntry<T> {
  data: T;
  expiresAt: number;
}

// Global Singleton across warm serverless container invocations
const serverMemoryStore = new Map<string, ServerCacheEntry<unknown>>();
const MAX_SERVER_CACHE_ENTRIES = 200;

// Global Data Version timestamp (initializes at container start)
let GLOBAL_DATA_VERSION = Date.now().toString();

/**
 * Get current global data version
 */
export function getDataVersion(): string {
  return GLOBAL_DATA_VERSION;
}

/**
 * Bump data version on Admin mutations to force all clients & CDNs to re-fetch
 */
export function bumpDataVersion(): string {
  GLOBAL_DATA_VERSION = Date.now().toString();
  clearServerCache();
  return GLOBAL_DATA_VERSION;
}

/**
 * Get or compute server-side cached data
 */
export async function getOrSetServerCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 3600 // 1 hour default
): Promise<T> {
  const now = Date.now();
  const entry = serverMemoryStore.get(key);

  if (entry && entry.expiresAt > now) {
    return entry.data as T;
  }

  const freshData = await fetcher();

  if (freshData !== undefined && freshData !== null) {
    if (serverMemoryStore.size >= MAX_SERVER_CACHE_ENTRIES) {
      const firstKey = serverMemoryStore.keys().next().value;
      if (firstKey) serverMemoryStore.delete(firstKey);
    }

    serverMemoryStore.set(key, {
      data: freshData,
      expiresAt: now + ttlSeconds * 1000,
    });
  }

  return freshData;
}

/**
 * Clear server-side memory cache
 */
export function clearServerCache(prefix?: string): void {
  if (!prefix) {
    serverMemoryStore.clear();
    return;
  }
  for (const key of serverMemoryStore.keys()) {
    if (key.startsWith(prefix)) {
      serverMemoryStore.delete(key);
    }
  }
}

/**
 * Standard Cache-Control Headers with Dynamic Versioning
 */
export function getEdgeCacheHeaders() {
  return {
    'Cache-Control': 'public, max-age=10, s-maxage=60, stale-while-revalidate=86400',
    'CDN-Cache-Control': 'public, s-maxage=60, stale-while-revalidate=86400',
    'Vercel-CDN-Cache-Control': 'public, s-maxage=60, stale-while-revalidate=86400',
    'X-Data-Version': GLOBAL_DATA_VERSION,
  };
}

export const EDGE_CACHE_HEADERS = {
  'Cache-Control': 'public, max-age=10, s-maxage=60, stale-while-revalidate=86400',
  'CDN-Cache-Control': 'public, s-maxage=60, stale-while-revalidate=86400',
  'Vercel-CDN-Cache-Control': 'public, s-maxage=60, stale-while-revalidate=86400',
};
