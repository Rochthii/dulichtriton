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

    const cacheKey = `culture_${commune}_${limit}`;

    const result = await getOrSetServerCache(
      cacheKey,
      async () => {
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
          return { success: true, count: cultureItems.length, culture: cultureItems, source: 'supabase_cached' };
        }

        // Reliable fallback
        const fallbackCulture = (localMasterPois as any[])
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

        return { success: true, count: fallbackCulture.length, culture: fallbackCulture, source: 'local_master_cached' };
      },
      86400
    );

    return NextResponse.json(result, {
      headers: EDGE_CACHE_HEADERS,
    });
  } catch (err: unknown) {
    console.warn('[Culture API Error]:', err);
    const fallbackCulture = (localMasterPois as any[]).filter(
      (p) => p.category === 'spiritual' || p.category === 'culture' || (p.id && (p.id.startsWith('CH') || p.id.startsWith('DT')))
    );
    return NextResponse.json(
      { success: true, count: fallbackCulture.length, culture: fallbackCulture, source: 'fallback_error' },
      { headers: EDGE_CACHE_HEADERS }
    );
  }
}
