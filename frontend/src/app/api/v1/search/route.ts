import { removeVietnameseTones } from '@/lib/searchText';
import { NextRequest, NextResponse } from 'next/server';
import localMasterPois from '@/data/triton_pois_full.json';
import { getOrSetServerCache, EDGE_CACHE_HEADERS } from '@/lib/serverCache';
import { getSupabaseServerClient, getSupabaseAnonServerClient } from '@/lib/serverSupabase';
import { buildSafeOrIlikeFilter } from '@/lib/postgrestFilterSanitizer';
import { resolveVerificationMetadata, filterVerifiedRetrievalPlaces } from '@/lib/placeVerificationGuard';

export const dynamic = 'force-dynamic';

// Category mappings for grouped display
const CATEGORY_GROUPS: Record<string, string> = {
  // Food
  'Ẩm Thực': 'food', 'Quán Ăn': 'food', 'Nhà Hàng': 'food', 'Café': 'food',
  'Quán Cà Phê': 'food', 'Đặc Sản': 'food', 'gastronomy': 'food', 'food': 'food',
  // Stay
  'Lưu Trú': 'stay', 'Homestay': 'stay', 'Khách Sạn': 'stay', 'Resort': 'stay',
  'Nhà Nghỉ': 'stay', 'hotel': 'stay', 'stay': 'stay',
  // Culture
  'Di Tích': 'culture', 'Chùa': 'culture', 'Lễ Hội': 'culture', 'Văn Hóa': 'culture',
  'Tôn Giáo': 'culture', 'Lịch Sử': 'culture', 'spiritual': 'culture', 'history': 'culture',
};

function getGroup(category: string): string {
  for (const [key, group] of Object.entries(CATEGORY_GROUPS)) {
    if (category?.toLowerCase().includes(key.toLowerCase())) return group;
  }
  return 'place';
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim();

  if (!q || q.length < 1) {
    return NextResponse.json({ results: [], query: q });
  }

  const qClean = removeVietnameseTones(q);
  const cacheKey = `search_${qClean}`;

  try {
    const data = await getOrSetServerCache(
      cacheKey,
      async () => {
        let dbData: any[] | null = null;
        const supabase = getSupabaseServerClient() || getSupabaseAnonServerClient();

        if (supabase) {
          // Query Supabase with broad search using safe PostgREST filter
          const safeOrFilter = buildSafeOrIlikeFilter(
            ['name', 'commune', 'category', 'tourism_category', 'description', 'address'],
            q
          );

          let reqQuery = supabase
            .from('places')
            .select('id, slug, name, category, tourism_category, commune, rating, image_url, description, is_hot, is_verified, verification_status, verified_at')
            .eq('is_active', true)
            .eq('is_verified', true)
            .eq('verification_status', 'VERIFIED')
            .order('rating', { ascending: false })
            .limit(20);

          if (safeOrFilter) {
            reqQuery = reqQuery.or(safeOrFilter);
          }

          const { data, error } = await reqQuery;

          if (!error && data) {
            dbData = data;
          }
        }

        // Merge DB data with local master POIs, enforcing VERIFIED only on the search pool (P04-010)
        const rawPool: any[] = (dbData && dbData.length > 0) ? dbData : (localMasterPois as any[]);
        const pool: any[] = filterVerifiedRetrievalPlaces(rawPool);
        
        // Match both with original and unaccented terms
        const filtered = pool.filter((p) => {
          const nameClean = removeVietnameseTones(p.name || '');
          const communeClean = removeVietnameseTones(p.commune || '');
          const catClean = removeVietnameseTones(p.tourism_category || p.category || '');
          const descClean = removeVietnameseTones(p.description || '');

          return (
            nameClean.includes(qClean) ||
            communeClean.includes(qClean) ||
            catClean.includes(qClean) ||
            descClean.includes(qClean)
          );
        });

        // Score and sort: name-starts-with gets highest score
        const scored = filtered.map((item: any) => {
          const nameClean = removeVietnameseTones(item.name || '');
          let score = 0;
          if (nameClean.startsWith(qClean)) score += 120;
          else if (nameClean.includes(qClean)) score += 80;
          
          if (removeVietnameseTones(item.category || '').includes(qClean)) score += 30;
          if (removeVietnameseTones(item.commune || '').includes(qClean)) score += 25;
          if (item.is_hot) score += 15;
          if (item.rating && Number(item.rating) >= 4.8) score += 10;
          const vMeta = resolveVerificationMetadata(item);
          return {
            ...item,
            is_verified: vMeta.is_verified,
            verification_status: vMeta.verification_status,
            verified_at: vMeta.verified_at,
            _score: score,
          };
        }).sort((a: any, b: any) => b._score - a._score);

        // Group results
        const grouped: Record<string, typeof scored> = { place: [], food: [], stay: [], culture: [] };
        for (const item of scored) {
          const group = getGroup(item.category || item.tourism_category || '');
          if (grouped[group].length < 4) grouped[group].push(item);
        }

        return {
          total: scored.length,
          topMatch: scored[0] || null,
          grouped,
          all: scored.slice(0, 12),
        };
      },
      300 // 5 minute server-side cache
    );

    return NextResponse.json(
      { success: true, query: q, ...data },
      { headers: EDGE_CACHE_HEADERS }
    );
  } catch (err: unknown) {
    console.error('[API /search Error]:', err);
    return NextResponse.json(
      { success: false, query: q, error: 'Lỗi tìm kiếm nội bộ' },
      { status: 500 }
    );
  }
}
