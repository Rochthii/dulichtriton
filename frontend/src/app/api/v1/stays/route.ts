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
    const limit = parseInt(searchParams.get('limit') || '12', 10);

    const cacheKey = `stays_${commune}_${limit}`;

    const result = await getOrSetServerCache(
      cacheKey,
      async () => {
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
          return { success: true, count: stays.length, stays, source: 'supabase_cached' };
        }

        // Reliable fallback
        const fallbackStays = (localMasterPois as any[])
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

        return { success: true, count: fallbackStays.length, stays: fallbackStays, source: 'local_master_cached' };
      },
      86400
    );

    return NextResponse.json(result, {
      headers: EDGE_CACHE_HEADERS,
    });
  } catch (err: unknown) {
    console.warn('[Stays API Error]:', err);
    const fallbackStays = (localMasterPois as any[]).filter(
      (p) => p.category === 'hotel' || p.category === 'homestay' || (p.id && (p.id.startsWith('KS') || p.id.startsWith('HS')))
    );
    return NextResponse.json(
      { success: true, count: fallbackStays.length, stays: fallbackStays, source: 'fallback_error' },
      { headers: EDGE_CACHE_HEADERS }
    );
  }
}
