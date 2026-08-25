import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import localMasterPois from '@/data/triton_pois_full.json';
import { getOrSetServerCache, EDGE_CACHE_HEADERS } from '@/lib/serverCache';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://knmlbwsmfljlabhvqfid.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
const supabase = createClient(supabaseUrl || "https://placeholder.supabase.co", supabaseKey || "placeholder");

export function removeVietnameseTones(str: string): string {
  if (!str) return '';
  str = str.normalize('NFC');
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
  str = str.replace(/đ/g, 'd');
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, 'a');
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, 'e');
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, 'i');
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, 'o');
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, 'u');
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, 'y');
  str = str.replace(/Đ/g, 'd');
  return str.toLowerCase().trim();
}

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
        // Query Supabase with broad search
        const { data: dbData, error } = await supabase
          .from('places')
          .select('id, slug, name, category, tourism_category, commune, rating, image_url, description, is_hot')
          .or([
            `name.ilike.%${q}%`,
            `commune.ilike.%${q}%`,
            `category.ilike.%${q}%`,
            `tourism_category.ilike.%${q}%`,
            `description.ilike.%${q}%`,
            `address.ilike.%${q}%`,
          ].join(','))
          .eq('is_active', true)
          .order('rating', { ascending: false })
          .limit(20);

        // Merge DB data with local master POIs to guarantee unaccented search coverage
        const pool: any[] = (!error && dbData && dbData.length > 0) ? dbData : (localMasterPois as any[]);
        
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
          return { ...item, _score: score };
        }).sort((a: any, b: any) => b._score - a._score);

        // Group results
        const grouped: Record<string, typeof scored> = { place: [], food: [], stay: [], culture: [] };
        for (const item of scored) {
          const group = getGroup(item.category || item.tourism_category || '');
          if (grouped[group].length < 4) grouped[group].push(item);
        }

        // Flatten preserving group order, max 10 total
        const results = [
          ...grouped.place,
          ...grouped.food,
          ...grouped.stay,
          ...grouped.culture,
        ].slice(0, 10).map((item) => ({
          id: item.id,
          slug: item.slug || item.id,
          name: item.name,
          category: item.tourism_category || item.category || 'Địa điểm',
          commune: item.commune,
          rating: item.rating ? Number(item.rating) : 4.8,
          image_url: item.image_url,
          group: getGroup(item.tourism_category || item.category || ''),
          is_hot: Boolean(item.is_hot),
        }));

        return { results, query: q, total: results.length };
      },
      3600 // 1 hour cache
    );

    return NextResponse.json(data, {
      headers: EDGE_CACHE_HEADERS,
    });
  } catch (err) {
    console.error('[/api/v1/search] Error:', err);
    return NextResponse.json({ error: 'Search failed', results: [] }, { status: 500 });
  }
}
