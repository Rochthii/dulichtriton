import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';
export const revalidate = 0;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
);

// Category mappings for grouped display
const CATEGORY_GROUPS: Record<string, string> = {
  // Food
  'Ẩm Thực': 'food', 'Quán Ăn': 'food', 'Nhà Hàng': 'food', 'Café': 'food',
  'Quán Cà Phê': 'food', 'Đặc Sản': 'food',
  // Stay
  'Lưu Trú': 'stay', 'Homestay': 'stay', 'Khách Sạn': 'stay', 'Resort': 'stay',
  'Nhà Nghỉ': 'stay',
  // Culture
  'Di Tích': 'culture', 'Chùa': 'culture', 'Lễ Hội': 'culture', 'Văn Hóa': 'culture',
  'Tôn Giáo': 'culture', 'Lịch Sử': 'culture',
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

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [], query: q });
  }

  try {
    // Single parallel query — all categories from places table
    const { data, error } = await supabase
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
      .limit(12);

    if (error) throw error;

    // Score and sort: name-starts-with gets highest score
    const scored = (data || []).map((item) => {
      const nameLower = item.name?.toLowerCase() ?? '';
      const qLower = q.toLowerCase();
      let score = 0;
      if (nameLower.startsWith(qLower)) score += 100;
      else if (nameLower.includes(qLower)) score += 60;
      if (item.category?.toLowerCase().includes(qLower)) score += 30;
      if (item.commune?.toLowerCase().includes(qLower)) score += 20;
      if (item.is_hot) score += 10;
      return { ...item, _score: score };
    }).sort((a, b) => b._score - a._score);

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
      category: item.category || item.tourism_category || 'Địa điểm',
      commune: item.commune,
      rating: item.rating,
      image_url: item.image_url,
      group: getGroup(item.category || item.tourism_category || ''),
      is_hot: item.is_hot,
    }));

    return NextResponse.json({ results, query: q, total: results.length });
  } catch (err) {
    console.error('[/api/v1/search] Error:', err);
    return NextResponse.json({ error: 'Search failed', results: [] }, { status: 500 });
  }
}
