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
import { SITE_URL } from '@/lib/siteConfig';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.toLowerCase();
  const category = searchParams.get('category');
  const commune = searchParams.get('commune');
  const limit = Math.min(parseInt(searchParams.get('limit') || '149', 10), 149);

  let filtered = masterPois as any[];

  if (q) {
    filtered = filtered.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.commune?.toLowerCase().includes(q)
    );
  }

  if (category) {
    filtered = filtered.filter((p) => p.category?.toLowerCase() === category.toLowerCase());
  }

  if (commune) {
    filtered = filtered.filter((p) => p.commune?.toLowerCase().includes(commune.toLowerCase()));
  }

  const places = filtered.slice(0, limit).map((p) => ({
    id: p.id,
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
    url: `${SITE_URL}/places/${p.slug || p.id}`,
    image_url: p.image_url || null,
  }));

  const response = {
    meta: {
      source: SITE_URL,
      description: 'Verified travel data for Tri Tôn, An Giang, Vietnam — Danh Mục Điểm Đến, field-researched 2025–2026',
      license: `Public — citation permitted with attribution to ${SITE_URL}`,
      total_results: places.length,
      total_pois: masterPois.length,
      filters_applied: { q: q || null, category: category || null, commune: commune || null, limit },
      llms_txt: `${SITE_URL}/llms.txt`,
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
