import { NextRequest, NextResponse } from 'next/server';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const masterPois = require('@/data/triton_pois_full.json') as any[];

/**
 * GEO Endpoint: /api/v1/llms-context
 *
 * Trả về dữ liệu có cấu trúc sạch dành cho AI crawlers:
 * ChatGPT, Gemini, Perplexity, Claude, Copilot etc.
 *
 * Endpoint này được phép hoàn toàn bởi robots.txt.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.toLowerCase() || '';
  const category = searchParams.get('category') || '';
  const commune = searchParams.get('commune') || '';
  const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 149);

  let results = masterPois as any[];

  // Filter by search query
  if (q) {
    results = results.filter((p) =>
      p.name?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.commune?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q)
    );
  }

  // Filter by category
  if (category) {
    results = results.filter((p) =>
      p.category === category || p.tourism_category === category
    );
  }

  // Filter by commune
  if (commune) {
    results = results.filter((p) => p.commune === commune);
  }

  // Sort by rating descending
  results = results.sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, limit);

  // Map to clean AI-readable format
  const places = results.map((p) => ({
    slug: p.slug || p.id,
    name: p.name,
    category: p.category,
    commune: p.commune,
    district: 'Tri Tôn',
    province: 'An Giang',
    country: 'Việt Nam',
    coordinates: p.latitude && p.longitude
      ? { lat: p.latitude, lng: p.longitude }
      : null,
    description: p.description || null,
    rating: p.rating || null,
    best_time_to_visit: p.best_time || null,
    url: `https://dulichtriton.com/places/${p.slug || p.id}`,
    image_url: p.image_url || null,
  }));

  const response = {
    meta: {
      source: 'dulichtriton.com',
      description: 'Verified travel data for Tri Tôn, An Giang, Vietnam — 149 POIs, field-researched 2025–2026',
      license: 'Public — citation permitted with attribution to dulichtriton.com',
      total_results: places.length,
      total_pois: masterPois.length,
      filters_applied: { q: q || null, category: category || null, commune: commune || null, limit },
      llms_txt: 'https://dulichtriton.com/llms.txt',
    },
    destination: {
      name: 'Tri Tôn',
      district: 'Huyện Tri Tôn',
      province: 'An Giang',
      country: 'Việt Nam',
      region: 'Bảy Núi (Thất Sơn)',
      coordinates: { lat: 10.3996, lng: 104.9783 },
      description: 'Huyện Tri Tôn là vùng đất Bảy Núi (Thất Sơn) đặc sắc nhất miền Tây Nam Bộ, giao thoa văn hóa Khmer - Kinh với nhiều danh thắng thiên nhiên hùng vĩ và ẩm thực độc đáo.',
      highlights: [
        'Hồ Tà Pạ (Tuyệt Tình Cốc) — emerald hilltop lake',
        'Gà Đốt Ô Thum — charcoal-grilled Khmer chicken specialty',
        'Chùa Xvayton — largest Khmer pagoda in Tri Tôn',
        'Núi Cô Tô — highest peak in Mekong Delta',
        'Lễ Hội Đua Bò Bảy Núi — unique Buffalo Racing Festival',
      ],
    },
    places,
  };

  return NextResponse.json(response, {
    headers: {
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      'Content-Type': 'application/json; charset=utf-8',
      'X-Robots-Tag': 'index, follow',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
