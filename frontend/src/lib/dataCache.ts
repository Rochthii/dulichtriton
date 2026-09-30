/**
 * Global Next.js Data Cache with Tag-Based On-Demand Invalidation
 * Du Lịch Tri Tôn AI Project
 * 
 * Rules:
 * 1. Single Master Cache Key per domain (no cache dilution by query params).
 * 2. Revalidation Safety Net: 86400s (24h) fallback while on-demand revalidateTag is instant.
 * 3. Separation of Concerns: No private/user data stored in shared public cache.
 * 4. Fail-closed: Never fall back to anon key when service role is missing.
 */

import { unstable_cache, revalidateTag, revalidatePath } from 'next/cache';
import localMasterPois from '@/data/triton_pois_full.json';
import { bumpDataVersion } from '@/lib/serverCache';
import { getSupabaseServerClient } from '@/lib/serverSupabase';

/**
 * 1. Master Places Cache (All 149 Verified POIs)
 * Tag: 'places'
 */
export const getCachedAllPlaces = unstable_cache(
  async () => {
    try {
      const supabase = getSupabaseServerClient();
      if (!supabase) {
        console.warn('[DataCache] Supabase server client not configured, falling back to local master');
        return localMasterPois as any[];
      }

      const { data, error } = await supabase
        .from('places')
        .select('id, slug, name, category, tourism_category, commune, rating, photos, image_url, description, detailed_story, phone, open_late, night_hours, golden_time_windows, price_level, is_hot, is_active, video_url, latitude, longitude, address, opening_hours')
        .eq('is_active', true)
        .order('rating', { ascending: false });

      if (!error && data && data.length > 0) {
        // Intelligently merge rich detailed_story & field_tips from local master JSON
        const merged = data.map((sp: any) => {
          const local = (localMasterPois as any[]).find(
            (lp: any) => lp.id === sp.id || lp.slug === sp.slug || lp.name === sp.name
          );
          return {
            ...local,
            ...sp,
            detailed_story: sp.detailed_story || local?.detailed_story,
            field_tips: sp.field_tips || local?.field_tips,
          };
        });
        return merged;
      }
    } catch (e) {
      console.warn('[DataCache] Supabase fetch failed, falling back to local master:', e);
    }
    return localMasterPois as any[];
  },
  ['master-places-all-v3'],
  {
    tags: ['places'],
    revalidate: 86400, // 24h safety net
  }
);

/**
 * 2. Master Food & Gastronomy Places (Unfiltered Master)
 * Tag: 'places', 'food'
 */
export const getCachedAllFoodPlaces = unstable_cache(
  async () => {
    try {
      const supabase = getSupabaseServerClient();
      if (!supabase) {
        console.warn('[DataCache] Supabase server client not configured, falling back to local master');
      } else {
        const { data: foodPlaces, error } = await supabase
          .from('places')
          .select('id, slug, name, commune, category, tourism_category, rating, image_url, description, price_level, video_url, address, opening_hours, open_late, night_hours, phone, is_hot')
          .or('category.eq.gastronomy,category.eq.food,category.ilike.%Ẩm thực%,category.ilike.%Nhà hàng%,category.ilike.%Quán%,tourism_category.ilike.%Ẩm thực%,tourism_category.ilike.%Quán%,id.ilike.AT%,id.ilike.CF%,id.ilike.DS%')
          .eq('is_active', true)
          .order('rating', { ascending: false });

        if (!error && foodPlaces && foodPlaces.length > 0) {
          return foodPlaces;
        }
      }
    } catch (e) {
      console.warn('[DataCache] Food fetch error, using local fallback:', e);
    }

    return (localMasterPois as any[]).filter((p) => {
      return (
        p.category === 'gastronomy' ||
        p.category === 'food' ||
        p.category === 'am_thuc' ||
        (p.tourism_category && p.tourism_category.includes('Ẩm Thực')) ||
        (p.id && (p.id.startsWith('AT') || p.id.startsWith('CF') || p.id.startsWith('DS')))
      );
    });
  },
  ['master-food-places-v3'],
  {
    tags: ['places', 'food'],
    revalidate: 86400, // 24h safety net
  }
);

/**
 * Helper to get filtered food places from single master cache
 */
export async function getCachedFoodPlaces(commune: string = 'ALL', nightOnly: boolean = false, limit: number = 100) {
  const allFood = await getCachedAllFoodPlaces();
  return allFood
    .filter((p: any) => {
      if (nightOnly && !p.open_late) return false;
      if (commune && commune !== 'ALL' && commune !== 'Tất cả' && !p.commune?.includes(commune)) return false;
      return true;
    })
    .slice(0, limit);
}

/**
 * 3. Master Stays & Accommodations (Unfiltered Master)
 * Tag: 'places', 'stays'
 */
export const getCachedAllStayPlaces = unstable_cache(
  async () => {
    try {
      const supabase = getSupabaseServerClient();
      if (!supabase) {
        console.warn('[DataCache] Supabase server client not configured, falling back to local master');
      } else {
        const { data: stays, error } = await supabase
          .from('places')
          .select('id, slug, name, commune, category, tourism_category, rating, image_url, description, price_level, video_url, address, opening_hours, phone, is_hot')
          .or('category.ilike.%Homestay%,category.ilike.%Khách sạn%,category.ilike.%Nhà nghỉ%,tourism_category.ilike.%Homestay%,tourism_category.ilike.%Khách sạn%,id.ilike.KS%,id.ilike.HS%')
          .eq('is_active', true)
          .order('rating', { ascending: false });

        if (!error && stays && stays.length > 0) {
          return stays;
        }
      }
    } catch (e) {
      console.warn('[DataCache] Stays fetch error, using local fallback:', e);
    }

    return (localMasterPois as any[]).filter((p) => {
      const cat = (p.category || '').toLowerCase();
      const subcat = (p.subcategory || '').toLowerCase();
      const name = (p.name || '').toLowerCase();
      return (
        cat === 'hotel' ||
        cat === 'homestay' ||
        cat === 'stay' ||
        cat === 'accommodation' ||
        p.stay_type ||
        subcat.includes('khách sạn') ||
        subcat.includes('homestay') ||
        subcat.includes('nhà nghỉ') ||
        subcat.includes('cắm trại') ||
        name.includes('homestay') ||
        name.includes('khách sạn') ||
        name.includes('nhà nghỉ') ||
        name.includes('resort') ||
        name.includes('camping')
      );
    });
  },
  ['master-stays-places-v4'],
  {
    tags: ['places', 'stays'],
    revalidate: 86400, // 24h safety net
  }
);

/**
 * Helper to get filtered stay places from single master cache
 */
export async function getCachedStayPlaces(commune: string = 'ALL', limit: number = 100) {
  const allStays = await getCachedAllStayPlaces();
  return allStays
    .filter((p: any) => {
      if (commune && commune !== 'ALL' && commune !== 'Tất cả' && !p.commune?.includes(commune)) return false;
      return true;
    })
    .slice(0, limit);
}

/**
 * 4. Master Culture & Pagodas (Unfiltered Master)
 * Tag: 'places', 'culture'
 */
export const getCachedAllCulturePlaces = unstable_cache(
  async () => {
    try {
      const supabase = getSupabaseServerClient();
      if (!supabase) {
        console.warn('[DataCache] Supabase server client not configured, falling back to local master');
      } else {
        const { data: cultureItems, error } = await supabase
          .from('places')
          .select('id, slug, name, commune, category, tourism_category, rating, image_url, description, price_level, video_url, address, opening_hours, is_hot')
          .or('category.ilike.%Chùa%,category.ilike.%Văn hóa%,category.ilike.%Di tích%,category.ilike.%Di sản%,category.eq.spiritual,category.eq.culture,category.eq.history,tourism_category.ilike.%Tâm linh%,tourism_category.ilike.%Văn hóa%,tourism_category.ilike.%Lễ hội%,id.ilike.CH%,id.ilike.DT%')
          .eq('is_active', true)
          .order('rating', { ascending: false });

        if (!error && cultureItems && cultureItems.length > 0) {
          return cultureItems;
        }
      }
    } catch (e) {
      console.warn('[DataCache] Culture fetch error, using local fallback:', e);
    }

    return (localMasterPois as any[]).filter((p) => {
      return (
        p.category === 'spiritual' ||
        p.category === 'culture' ||
        p.category === 'history' ||
        (p.tourism_category && (p.tourism_category.includes('Tâm linh') || p.tourism_category.includes('Văn hóa') || p.tourism_category.includes('Di tích'))) ||
        (p.id && (p.id.startsWith('CH') || p.id.startsWith('DT')))
      );
    });
  },
  ['master-culture-places-v3'],
  {
    tags: ['places', 'culture'],
    revalidate: 86400, // 24h safety net
  }
);

/**
 * Helper to get filtered culture places from single master cache
 */
export async function getCachedCulturePlaces(commune: string = 'ALL', limit: number = 100) {
  const allCulture = await getCachedAllCulturePlaces();
  return allCulture
    .filter((p: any) => {
      if (commune && commune !== 'ALL' && commune !== 'Tất cả' && !p.commune?.includes(commune)) return false;
      return true;
    })
    .slice(0, limit);
}

/**
 * 5. Master Discovered TikTok Videos (Unfiltered Master)
 * Tag: 'videos'
 */
export const getCachedAllVideos = unstable_cache(
  async () => {
    try {
      const supabase = getSupabaseServerClient();
      if (!supabase) {
        console.warn('[DataCache] Supabase server client not configured');
        return [];
      }
      const { data: dbData, error } = await supabase
        .from('video_discoveries')
        .select(
          'id, platform, external_video_id, video_url, embed_url, thumbnail_url, title, author_name, view_count, matched_poi_id, matched_alias, relevance_score, score_breakdown, verification_status'
        )
        .in('verification_status', ['VERIFIED', 'RELEVANT'])
        .order('relevance_score', { ascending: false });

      if (!error && dbData) {
        return dbData.map((v) => ({
          id: v.id,
          external_video_id: v.external_video_id,
          platform: v.platform as 'tiktok' | 'youtube' | 'youtube_shorts' | 'facebook',
          video_url: v.video_url,
          embed_url: v.embed_url,
          thumbnail_url: v.thumbnail_url ?? undefined,
          title: v.title,
          author_name: v.author_name ?? undefined,
          view_count: v.view_count ?? undefined,
          matched_poi_id: v.matched_poi_id ?? undefined,
          matched_alias: v.matched_alias ?? undefined,
          relevance_score: v.relevance_score,
          verification_status: v.verification_status,
        }));
      }
    } catch (e) {
      console.warn('[DataCache] Videos fetch error:', e);
    }
    return [];
  },
  ['master-videos-triton-v3'],
  {
    tags: ['videos'],
    revalidate: 86400, // 24h safety net
  }
);

/**
 * Helper to get filtered videos from single master cache
 */
export async function getCachedVideos(placeId: string = 'ALL', sort: string = 'relevant', limit: number = 30) {
  const allVideos = await getCachedAllVideos();
  let list = [...allVideos];

  if (placeId && placeId !== 'ALL') {
    list = list.filter((v: any) => v.matched_poi_id === placeId);
  }

  if (sort === 'popular') {
    list.sort((a: any, b: any) => (b.view_count || 0) - (a.view_count || 0));
  } else {
    list.sort((a: any, b: any) => (b.relevance_score || 0) - (a.relevance_score || 0));
  }

  return list.slice(0, limit);
}

/**
 * Surgical Single POI Cache Invalidation
 * ONLY revalidates the exact detail page and its direct parent listing.
 * Consumes exactly 1-2 Vercel ISR writes instead of wiping the entire site!
 */
export function invalidateSinglePlaceCache(slugOrId: string, category?: string): void {
  try {
    bumpDataVersion();
    if (slugOrId && slugOrId.trim()) {
      revalidatePath(`/places/${slugOrId.trim()}`);
    }
    revalidatePath('/places');

    const cat = (category || '').toLowerCase();
    if (cat.includes('food') || cat.includes('gastronomy') || cat.includes('ẩm thực') || cat.includes('quán')) {
      revalidatePath('/food');
    } else if (cat.includes('stay') || cat.includes('homestay') || cat.includes('hotel') || cat.includes('nghỉ')) {
      revalidatePath('/stay');
    } else if (cat.includes('culture') || cat.includes('temple') || cat.includes('chùa') || cat.includes('văn hóa') || cat.includes('lịch sử')) {
      revalidatePath('/culture');
    }
  } catch (e) {
    console.warn('[DataCache] Surgical POI Invalidation warning:', e);
  }
}

/**
 * On-Demand Global Cache Purge (Only called on full system deploy / migration)
 */
export function invalidateAllPlacesCache(): void {
  try {
    bumpDataVersion();
    (revalidateTag as any)('places', { expire: 0 });
    revalidatePath('/places');
  } catch (e) {
    console.warn('[DataCache] Invalidation warning:', e);
  }
}
