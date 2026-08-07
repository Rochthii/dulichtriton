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
 * Fetch place detail by ID dynamically from Supabase database
 */
export async function getPlaceById(id: string): Promise<Place | null> {
  try {
    const { data, error } = await supabase
      .from('places')
      .select('*')
      .or(`id.eq.${id},place_id.eq.${id}`)
      .single();

    if (error || !data) {
      console.error(`Error fetching place ID ${id} from Supabase:`, error);
      return null;
    }

    return data as Place;
  } catch (err) {
    console.error(`Failed to query Supabase place ID ${id}:`, err);
    return null;
  }
}

