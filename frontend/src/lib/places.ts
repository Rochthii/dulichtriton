import { supabase } from './supabase';
import { Place } from '@/components/PlaceCard';

/**
 * Fetch featured places dynamically from live Supabase database
 * NO hardcoded place objects in code!
 */
export async function getFeaturedPlaces(limit: number = 6): Promise<Place[]> {
  try {
    const { data, error } = await supabase
      .from('places')
      .select('*')
      .eq('is_active', true)
      .order('rating', { ascending: false })
      .limit(limit);

    if (error || !data) {
      console.error('Error fetching featured places from Supabase:', error);
      return [];
    }

    return data as Place[];
  } catch (err) {
    console.error('Failed to query Supabase places:', err);
    return [];
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

    if (error || !data) {
      console.error('Error fetching places from Supabase:', error);
      return [];
    }

    return data as Place[];
  } catch (err) {
    console.error('Failed to query Supabase places:', err);
    return [];
  }
}

/**
 * Fetch place detail by ID or slug dynamically from Supabase database.
 * Lookup order: 1) slug, 2) id (text PK like "CF001").
 */
export async function getPlaceById(idOrSlug: string): Promise<Place | null> {
  try {
    // 1. Try matching by slug first (SEO-friendly URLs)
    const { data: bySlug } = await supabase
      .from('places')
      .select('*')
      .eq('slug', idOrSlug)
      .maybeSingle();

    if (bySlug) return bySlug as Place;

    // 2. Fallback: match by primary key id (e.g. "CF001", "AT002")
    const { data: byId, error: idError } = await supabase
      .from('places')
      .select('*')
      .eq('id', idOrSlug)
      .maybeSingle();

    if (byId) return byId as Place;

    console.error(`[getPlaceById] No place found for slug/id: "${idOrSlug}"`, idError);
    return null;
  } catch (err) {
    console.error(`[getPlaceById] Failed to query Supabase for "${idOrSlug}":`, err);
    return null;
  }
}

