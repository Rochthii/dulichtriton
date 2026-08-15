/**
 * Server-Side In-Memory LRU Cache for Next.js Route Handlers
 * Du Lịch Tri Tôn AI Project
 * 
 * Prevents redundant Supabase PostgreSQL queries and stays well within the 2GB Free Egress limit.
 */

interface ServerCacheEntry<T> {
  data: T;
  expiresAt: number;
}

// Global singleton map across warm serverless invocations
const serverMemoryStore = new Map<string, ServerCacheEntry<unknown>>();
const MAX_SERVER_CACHE_ENTRIES = 200;

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

  // Fetch fresh data from Supabase
  const freshData = await fetcher();

  if (freshData !== undefined && freshData !== null) {
    // Evict oldest if limit reached
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
 * Clear server-side cache on demand (e.g. when admin modifies a place)
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
 * Standard Cache-Control Headers for Edge CDN + Browser
 */
export const EDGE_CACHE_HEADERS = {
  'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
  'CDN-Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
  'Vercel-CDN-Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
};
