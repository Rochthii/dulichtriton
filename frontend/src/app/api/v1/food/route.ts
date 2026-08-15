import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import localMasterPois from '@/data/triton_pois_full.json';
import { getOrSetServerCache, EDGE_CACHE_HEADERS } from '@/lib/serverCache';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://knmlbwsmfljlabhvqfid.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const commune = searchParams.get('commune') || 'ALL';
    const nightOnly = searchParams.get('night') === 'true';
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    const cacheKey = `food_${commune}_${nightOnly}_${limit}`;

    const result = await getOrSetServerCache(
      cacheKey,
      async () => {
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
          return { success: true, count: foodPlaces.length, food: foodPlaces, source: 'supabase_cached' };
        }

        // Reliable Local Fallback
        const fallbackFood = (localMasterPois as any[])
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

        return { success: true, count: fallbackFood.length, food: fallbackFood, source: 'local_master_cached' };
      },
      86400 // 24 hours
    );

    return NextResponse.json(result, {
      headers: EDGE_CACHE_HEADERS,
    });
  } catch (err: unknown) {
    console.warn('[Food API Error]:', err);
    const fallbackFood = (localMasterPois as any[]).filter(
      (p) => p.category === 'gastronomy' || (p.id && (p.id.startsWith('AT') || p.id.startsWith('CF') || p.id.startsWith('DS')))
    );
    return NextResponse.json(
      { success: true, count: fallbackFood.length, food: fallbackFood, source: 'fallback_error' },
      { headers: EDGE_CACHE_HEADERS }
    );
  }
}
