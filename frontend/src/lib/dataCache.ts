/**
 * Global Next.js Data Cache with Tag-Based On-Demand Invalidation
 * Du Lịch Tri Tôn AI Project
 * 
 * Architecture:
 * - 1st Visitor (or Build Time): Fetches from Supabase once and persists to Next.js Data Cache on Vercel.
 * - 2nd to 1,000,000th Visitor: Served from Next.js Data Cache with 0 Supabase DB queries and 0 quota cost.
 * - Admin Update: Calls revalidateTag('places' | 'food' | 'stays' | 'culture' | 'videos') to purge cache instantly worldwide.
 */

import { unstable_cache, revalidateTag, revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import localMasterPois from '@/data/triton_pois_full.json';
import { bumpDataVersion } from '@/lib/serverCache';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://knmlbwsmfljlabhvqfid.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * 1. Master Places Cache (All 149 Verified POIs)
 * Tag: 'places'
 */
export const getCachedAllPlaces = unstable_cache(
  async () => {
    try {
      const { data, error } = await supabase
        .from('places')
        .select('id, slug, name, category, tourism_category, commune, rating, photos, image_url, description, detailed_story, phone, open_late, night_hours, golden_time_windows, price_level, is_hot, is_active, video_url, latitude, longitude, address, opening_hours')
        .eq('is_active', true)
        .order('rating', { ascending: false });

      if (!error && data && data.length > 0) {
        return data;
      }
    } catch (e) {
      console.warn('[DataCache] Supabase fetch failed, falling back to local master:', e);
    }
    return localMasterPois as any[];
  },
  ['master-places-all'],
  {
    tags: ['places'],
    revalidate: 86400, // 24h background revalidation fallback
  }
);

/**
 * 2. Food & Gastronomy Places Cache
 * Tag: 'places', 'food'
 */
export const getCachedFoodPlaces = unstable_cache(
  async (commune: string = 'ALL', nightOnly: boolean = false, limit: number = 100) => {
    try {
      let query = supabase
        .from('places')
        .select('id, slug, name, commune, category, tourism_category, rating, image_url, description, price_level, video_url, address, opening_hours, open_late, night_hours, phone')
        .or('category.eq.gastronomy,category.eq.food,category.ilike.%Ẩm thực%,category.ilike.%Nhà hàng%,category.ilike.%Quán%,tourism_category.ilike.%Ẩm thực%,tourism_category.ilike.%Quán%,id.ilike.AT%,id.ilike.CF%,id.ilike.DS%')
        .eq('is_active', true)
        .order('rating', { ascending: false })
        .limit(limit);

      if (nightOnly) {
        query = query.eq('open_late', true);
      }

      if (commune && commune !== 'ALL' && commune !== 'Tất cả') {
        query = query.ilike('commune', `%${commune}%`);
      }

      const { data: foodPlaces, error } = await query;
      if (!error && foodPlaces && foodPlaces.length > 0) {
        return foodPlaces;
      }
    } catch (e) {
      console.warn('[DataCache] Food fetch error, using local fallback:', e);
    }

    // Local Fallback
    return (localMasterPois as any[])
      .filter((p) => {
        const isFood =
          p.category === 'gastronomy' ||
          p.category === 'food' ||
          p.category === 'am_thuc' ||
          (p.tourism_category && p.tourism_category.includes('Ẩm Thực')) ||
          (p.id && (p.id.startsWith('AT') || p.id.startsWith('CF') || p.id.startsWith('DS')));
        
        if (!isFood) return false;
        if (nightOnly && !p.open_late) return false;
        if (commune && commune !== 'ALL' && commune !== 'Tất cả' && p.commune !== commune) return false;
        return true;
      })
      .slice(0, limit);
  },
  ['food-places-catalog'],
  {
    tags: ['places', 'food'],
    revalidate: 86400,
  }
);

/**
 * 3. Stays & Accommodations Cache
 * Tag: 'places', 'stays'
 */
export const getCachedStayPlaces = unstable_cache(
  async (commune: string = 'ALL', limit: number = 100) => {
    try {
      let query = supabase
        .from('places')
        .select('id, slug, name, commune, category, rating, image_url, description, price_level, video_url, address, opening_hours, phone')
        .or('category.ilike.%Homestay%,category.ilike.%Khách sạn%,category.ilike.%Nhà nghỉ%,tourism_category.ilike.%Homestay%,tourism_category.ilike.%Khách sạn%,id.ilike.KS%,id.ilike.HS%')
        .order('rating', { ascending: false })
        .limit(limit);

      if (commune && commune !== 'ALL' && commune !== 'Tất cả') {
        query = query.ilike('commune', `%${commune}%`);
      }

      const { data: stays, error } = await query;
      if (!error && stays && stays.length > 0) {
        return stays;
      }
    } catch (e) {
      console.warn('[DataCache] Stays fetch error, using local fallback:', e);
    }

    return (localMasterPois as any[])
      .filter((p) => {
        const isStay =
          p.category === 'hotel' ||
          p.category === 'homestay' ||
          p.category === 'stay' ||
          (p.tourism_category && (p.tourism_category.includes('Khách sạn') || p.tourism_category.includes('Homestay'))) ||
          (p.id && (p.id.startsWith('KS') || p.id.startsWith('HS')));
        if (!isStay) return false;
        if (commune && commune !== 'ALL' && commune !== 'Tất cả' && p.commune !== commune) return false;
        return true;
      })
      .slice(0, limit);
  },
  ['stays-places-catalog'],
  {
    tags: ['places', 'stays'],
    revalidate: 86400,
  }
);

/**
 * 4. Culture & Pagodas Cache
 * Tag: 'places', 'culture'
 */
export const getCachedCulturePlaces = unstable_cache(
  async (commune: string = 'ALL', limit: number = 100) => {
    try {
      let query = supabase
        .from('places')
        .select('id, slug, name, commune, category, rating, image_url, description, price_level, video_url, address, opening_hours')
        .or('category.ilike.%Chùa%,category.ilike.%Văn hóa%,category.ilike.%Di tích%,category.ilike.%Di sản%,category.eq.spiritual,category.eq.culture,tourism_category.ilike.%Tâm linh%,tourism_category.ilike.%Văn hóa%,id.ilike.CH%,id.ilike.DT%')
        .order('rating', { ascending: false })
        .limit(limit);

      if (commune && commune !== 'ALL' && commune !== 'Tất cả') {
        query = query.ilike('commune', `%${commune}%`);
      }

      const { data: cultureItems, error } = await query;
      if (!error && cultureItems && cultureItems.length > 0) {
        return cultureItems;
      }
    } catch (e) {
      console.warn('[DataCache] Culture fetch error, using local fallback:', e);
    }

    return (localMasterPois as any[])
      .filter((p) => {
        const isCulture =
          p.category === 'spiritual' ||
          p.category === 'culture' ||
          p.category === 'history' ||
          (p.tourism_category && (p.tourism_category.includes('Tâm linh') || p.tourism_category.includes('Văn hóa') || p.tourism_category.includes('Di tích'))) ||
          (p.id && (p.id.startsWith('CH') || p.id.startsWith('DT')));
        if (!isCulture) return false;
        if (commune && commune !== 'ALL' && commune !== 'Tất cả' && p.commune !== commune) return false;
        return true;
      })
      .slice(0, limit);
  },
  ['culture-places-catalog'],
  {
    tags: ['places', 'culture'],
    revalidate: 86400,
  }
);

/**
 * 5. Discovered TikTok Videos Cache
 * Tag: 'videos'
 */
export const getCachedVideos = unstable_cache(
  async (placeId: string = 'ALL', sort: string = 'relevant', limit: number = 30) => {
    try {
      let query = supabase
        .from('video_discoveries')
        .select(
          'id, platform, external_video_id, video_url, embed_url, thumbnail_url, title, author_name, view_count, matched_poi_id, matched_alias, relevance_score, score_breakdown, verification_status'
        )
        .in('verification_status', ['VERIFIED', 'RELEVANT']);

      if (placeId && placeId !== 'ALL') {
        query = query.eq('matched_poi_id', placeId);
      }

      if (sort === 'recent') {
        query = query.order('discovered_at', { ascending: false });
      } else if (sort === 'popular') {
        query = query.order('view_count', { ascending: false, nullsFirst: false });
      } else {
        query = query.order('relevance_score', { ascending: false });
      }

      query = query.limit(limit);

      const { data: dbData, error } = await query;
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
  ['videos-triton-catalog'],
  {
    tags: ['videos'],
    revalidate: 86400,
  }
);

/**
 * On-Demand Global Cache Purge (Triggered by Admin Actions)
 */
export function invalidateAllPlacesCache(): void {
  try {
    bumpDataVersion();
    (revalidateTag as any)('places', { expire: 0 });
    (revalidateTag as any)('food', { expire: 0 });
    (revalidateTag as any)('stays', { expire: 0 });
    (revalidateTag as any)('culture', { expire: 0 });
    (revalidateTag as any)('videos', { expire: 0 });
    revalidatePath('/', 'layout');
    revalidatePath('/places');
    revalidatePath('/food');
    revalidatePath('/stay');
    revalidatePath('/culture');
  } catch (e) {
    console.warn('[DataCache] Invalidation warning:', e);
  }
}
