/**
 * Advanced Multi-Tier Client Cache for Tri Ton Tourism
 * Du Lịch Tri Tôn AI Project
 * 
 * Features:
 * 1. Tier 1: In-Memory Fast Map (0ms access within same page/session)
 * 2. Tier 2: Persistent LocalStorage (survives page refreshes, browser reopens, and offline)
 * 3. Stale-While-Revalidate (SWR): Returns cached data instantly while refreshing in background
 * 4. Versioned Namespace: Prevents stale schema issues
 */

interface CacheEnvelope<T> {
  data: T;
  timestamp: number;
  version: string;
}

const CACHE_VERSION = 'v2.4.0';
const MEMORY_CACHE = new Map<string, CacheEnvelope<unknown>>();
const PREFIX = 'triton_cache_';

/**
 * Get cached item from Memory or LocalStorage
 */
export function getCachedItem<T>(key: string, ttlMs: number = 24 * 60 * 60 * 1000): T | null {
  const now = Date.now();

  // 1. Check Memory Cache first (fastest, 0ms)
  const mem = MEMORY_CACHE.get(key);
  if (mem && mem.version === CACHE_VERSION && now - mem.timestamp < ttlMs) {
    return mem.data as T;
  }

  // 2. Check Browser LocalStorage
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(`${PREFIX}${key}`);
      if (raw) {
        const parsed: CacheEnvelope<T> = JSON.parse(raw);
        if (parsed && parsed.version === CACHE_VERSION && now - parsed.timestamp < ttlMs) {
          // Warm memory cache
          MEMORY_CACHE.set(key, parsed);
          return parsed.data;
        }
      }
    } catch {
      // LocalStorage quota or parse error — fallback gracefully
    }
  }

  return null;
}

/**
 * Set item in both Memory and LocalStorage
 */
export function setCachedItem<T>(key: string, data: T): void {
  const envelope: CacheEnvelope<T> = {
    data,
    timestamp: Date.now(),
    version: CACHE_VERSION,
  };

  // Set memory
  MEMORY_CACHE.set(key, envelope);

  // Set LocalStorage
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(envelope));
    } catch {
      // If storage is full, clean up old keys with prefix
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith(PREFIX)) {
            localStorage.removeItem(k);
          }
        }
        localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(envelope));
      } catch {
        // ignore
      }
    }
  }
}

/**
 * Fetch data with Stale-While-Revalidate (SWR) & Multi-Tier Caching.
 * @param key Unique key for the query (e.g. 'client-food-places-12')
 * @param fetcher Async function that performs the network fetch
 * @param ttlMs Time-to-live in milliseconds (default: 1 hour, stale allowed up to 7 days)
 */
export async function fetchWithCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number = 60 * 60 * 1000 // 1 hour
): Promise<T> {
  const cached = getCachedItem<T>(key, ttlMs);

  if (cached !== null) {
    // Stale-While-Revalidate: Return cached immediately, trigger background refresh if near expiration (> 50% TTL)
    const mem = MEMORY_CACHE.get(key);
    const age = mem ? Date.now() - mem.timestamp : ttlMs;
    if (age > ttlMs / 2) {
      // Background non-blocking refresh
      void fetcher().then((fresh) => {
        if (fresh) setCachedItem(key, fresh);
      }).catch(() => { /* silent fail for background refresh */ });
    }
    return cached;
  }

  try {
    const freshData = await fetcher();
    if (freshData !== undefined && freshData !== null) {
      setCachedItem(key, freshData);
    }
    return freshData;
  } catch (error) {
    // If fetch fails and we have stale cached data of any age, return stale data
    const staleData = getCachedItem<T>(key, 30 * 24 * 60 * 60 * 1000); // 30 days stale grace
    if (staleData !== null) {
      console.warn(`[FastCache] Fetch failed for '${key}', returning stale cache fallback.`);
      return staleData;
    }
    throw error;
  }
}

/**
 * Manually invalidate a cache key or all Tri Ton cache entries
 */
export function invalidateCache(key?: string): void {
  if (key) {
    MEMORY_CACHE.delete(key);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(`${PREFIX}${key}`);
      } catch { /* ignore */ }
    }
  } else {
    MEMORY_CACHE.clear();
    if (typeof window !== 'undefined') {
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith(PREFIX)) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));
      } catch { /* ignore */ }
    }
  }
}
