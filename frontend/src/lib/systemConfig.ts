/**
 * ─────────────────────────────────────────────────────────────────────────────
 * DYNAMIC SYSTEM CONFIG & PROMPT HOT-RELOAD MANAGER
 * Du Lịch Tri Tôn AI Assistant System
 * 
 * Features:
 * 1. Reads dynamic System Directives & Festival Rules from Supabase `system_configs`
 * 2. 60-second SWR (Stale-While-Revalidate) in-memory caching to eliminate DB overhead
 * 3. Static Fallback Contract if Supabase table is unreachable
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://knmlbwsmfljlabhvqfid.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface CacheEntry {
  value: string;
  fetchedAt: number;
}

const configCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60000; // 60 seconds TTL

/**
 * Reads a dynamic system configuration or prompt template from Supabase `system_configs`
 */
export async function getDynamicSystemConfig(
  configKey: string,
  fallbackValue: string
): Promise<string> {
  const cached = configCache.get(configKey);
  const now = Date.now();

  // Return cached value if within TTL
  if (cached && now - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.value;
  }

  try {
    const { data, error } = await supabase
      .from('system_configs')
      .select('value')
      .eq('key', configKey)
      .single();

    if (!error && data?.value) {
      const valStr = typeof data.value === 'string' ? data.value : JSON.stringify(data.value);
      configCache.set(configKey, { value: valStr, fetchedAt: now });
      return valStr;
    }
  } catch (e) {
    console.warn(`[SystemConfig] Failed to fetch '${configKey}':`, e);
  }

  // Use fallback if DB fetch fails or key missing
  if (!cached) {
    configCache.set(configKey, { value: fallbackValue, fetchedAt: now });
  }

  return cached?.value || fallbackValue;
}
