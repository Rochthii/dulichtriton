// Fast client-side memory cache utility for Tri Ton Tourism
// Prevents duplicate network requests to Supabase and makes page navigation instant (0ms).

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const memoryCache = new Map<string, CacheEntry<any>>();

/**
 * Fetch data with in-memory caching.
 * @param key Unique key for the query (e.g. 'hot-places-3')
 * @param fetcher Async function that performs the real fetch if cache misses
 * @param ttlMs Time-to-live in milliseconds (default: 5 minutes)
 */
export async function fetchWithCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number = 5 * 60 * 1000
): Promise<T> {
  const now = Date.now();
  const cached = memoryCache.get(key);

  if (cached && now - cached.timestamp < ttlMs) {
    return cached.data as T;
  }

  try {
    const freshData = await fetcher();
    if (freshData) {
      memoryCache.set(key, { data: freshData, timestamp: now });
    }
    return freshData;
  } catch (error) {
    // If fetch fails and we have stale cached data, return stale data as fallback
    if (cached) {
      console.warn(`[FastCache] Fetch failed for '${key}', returning stale cache.`, error);
      return cached.data as T;
    }
    throw error;
  }
}

/**
 * Manually invalidate a cache key or all cache entries
 */
export function invalidateCache(key?: string) {
  if (key) {
    memoryCache.delete(key);
  } else {
    memoryCache.clear();
  }
}
