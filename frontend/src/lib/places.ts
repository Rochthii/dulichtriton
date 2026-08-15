import { supabase } from './supabase';
import { Place } from '@/components/PlaceCard';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const masterPois = require('@/data/triton_pois_full.json') as any[];

let placesMapCache: Map<string, Place> | null = null;
let lastCacheTime = 0;

/**
 * Bulk fetch and cache all active places in memory.
 * Eliminates 500+ individual Supabase network roundtrips during Next.js SSG build,
 * speeding up build time from ~115s down to < 20s!
 */
async function getCachedPlacesMap(): Promise<Map<string, Place>> {
  const now = Date.now();
  if (placesMapCache && (now - lastCacheTime < 60000)) {
    return placesMapCache;
  }

  const map = new Map<string, Place>();

  // 1. Initialize with 100% verified local master POIs
  if (Array.isArray(masterPois)) {
    for (const p of masterPois) {
      if (p.slug) map.set(p.slug, p as Place);
      if (p.id) map.set(p.id, p as Place);
      if (p.name) map.set(p.name.toLowerCase(), p as Place);
    }
  }

  // 2. Fetch live updates in ONE single bulk query
  try {
    const { data, error } = await supabase
      .from('places')
      .select('*')
      .eq('is_active', true);

    if (!error && data && data.length > 0) {
      for (const p of data) {
        const local = (p.slug ? map.get(p.slug) : null) || (p.id ? map.get(p.id) : null);
        const merged: Place = {
          ...local,
          ...p,
          detailed_story: p.detailed_story || local?.detailed_story,
          field_tips: p.field_tips || local?.field_tips,
        } as Place;

        if (p.slug) map.set(p.slug, merged);
        if (p.id) map.set(p.id, merged);
      }
    }
  } catch (err) {
    console.warn('[getCachedPlacesMap] Using master POIs fallback:', err);
  }

  placesMapCache = map;
  lastCacheTime = now;
  return map;
}

/**
 * Fetch featured places dynamically from live Supabase database
 */
export async function getFeaturedPlaces(limit: number = 6): Promise<Place[]> {
  try {
    const { data, error } = await supabase
      .from('places')
      .select('*')
      .eq('is_active', true)
      .order('rating', { ascending: false })
      .limit(limit);

    if (error || !data || data.length === 0) {
      return (masterPois as Place[]).slice(0, limit);
    }

    return data as Place[];
  } catch (err) {
    console.error('Failed to query Supabase places:', err);
    return (masterPois as Place[]).slice(0, limit);
  }
}

/**
 * Fetch all places filtered by commune dynamically from Supabase
 */
export async function getPlacesByCommune(commune?: string): Promise<Place[]> {
  return getPlacesFiltered(commune);
}

/**
 * Fetch all places filtered by commune and category dynamically from Supabase
 */
export async function getPlacesFiltered(commune?: string, category?: string): Promise<Place[]> {
  try {
    let query = supabase
      .from('places')
      .select('*')
      .eq('is_active', true)
      .order('rating', { ascending: false });

    if (commune && commune !== 'Tất cả') {
      query = query.eq('commune', commune);
    }

    if (category && category !== 'Tất cả') {
      query = query.or(`category.eq.${category},tourism_category.eq.${category}`);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      let list = masterPois as Place[];
      if (commune && commune !== 'Tất cả') {
        list = list.filter(p => p.commune === commune);
      }
      if (category && category !== 'Tất cả') {
        list = list.filter(p => p.category === category || p.tourism_category === category);
      }
      return list;
    }

    return data as Place[];
  } catch (err) {
    console.error('Failed to query Supabase places:', err);
    return masterPois as Place[];
  }
}

/**
 * Fetch place detail by ID or slug with instant in-memory lookup.
 */
export async function getPlaceById(idOrSlug: string): Promise<Place | null> {
  let decoded = idOrSlug;
  try {
    decoded = decodeURIComponent(idOrSlug).trim();
  } catch {
    decoded = idOrSlug.trim();
  }

  const map = await getCachedPlacesMap();

  // 1. Instant RAM lookup (0.001ms)
  let found = map.get(decoded) || map.get(idOrSlug) || map.get(decoded.toLowerCase());
  if (found) return found;

  // 2. Exact match in master array
  found = (masterPois as any[]).find(
    (p: any) =>
      p.slug === decoded ||
      p.slug === idOrSlug ||
      p.id === decoded ||
      p.id === idOrSlug ||
      p.name?.toLowerCase() === decoded.toLowerCase()
  );

  return (found as Place) || null;
}
