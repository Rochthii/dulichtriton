import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import fs from 'fs';
import type { ItineraryData } from '@/components/WireDiagramItinerary';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
);

// ── Category inference for lichtrinh.json stops ─────────────────────────────
type StopCategory = 'check-in' | 'food' | 'spiritual' | 'nature' | 'history';

function inferCategory(name: string, activity = ''): StopCategory {
  const t = (name + ' ' + activity).toLowerCase();
  if (/ăn|quán|lẩu|gà đốt|bánh|bún|đu đủ|cà phê|cafe|coffee|trà|chợ|bia|nhà hàng|tiệm|xiên nướng|bò nướng/.test(t)) return 'food';
  if (/chùa|tịnh xá|đình|miếu|nhà mồ|tưởng niệm|hành hương|svayton|xà tón|phi lai/.test(t)) return 'spiritual';
  if (/lịch sử|di tích|bảo tàng|kháng chiến|ba chúc|tức dụp|đồi tức/.test(t)) return 'history';
  if (/leo|núi|đỉnh|hang|trek|vồ|trekking|đi bộ rừng/.test(t)) return 'nature';
  return 'check-in';
}

function getEmojiFromJson(itin: Record<string, unknown>): string {
  const name = String(itin.name || '').toLowerCase();
  if (/sống ảo|tiktok|check-in/.test(name)) return '📸';
  if (/food|ẩm thực/.test(name)) return '🍗';
  if (/tâm linh/.test(name)) return '🙏';
  if (/trek|leo/.test(name)) return '🥾';
  if (/couple|đôi|lãng mạn|sunset/.test(name)) return '💑';
  if (/lịch sử|tưởng niệm|về nguồn/.test(name)) return '📜';
  if (/gia đình|family/.test(name)) return '👨‍👩‍👧';
  if (/nửa ngày|express/.test(name)) return '🕰️';
  if (/3n2d|3 ngày|full exp/.test(name)) return '🏆';
  if (/2n1d|2 ngày/.test(name)) return '🗺️';
  if (/về đêm|đêm|cafe hopping/.test(name)) return '🌙';
  if (/photographer|nhiếp ảnh|lúa chín/.test(name)) return '📷';
  if (/backpacker|budget/.test(name)) return '💰';
  if (/luxury|sang trọng/.test(name)) return '✨';
  if (/solo/.test(name)) return '🎒';
  if (/đua bò/.test(name)) return '🐃';
  if (/lễ hội|khmer|nước nổi/.test(name)) return '🎭';
  if (/hoàng hôn|sunset|bbq/.test(name)) return '🌅';
  if (/chạy xe|xe đêm/.test(name)) return '🛵';
  if (/cafe/.test(name)) return '☕';
  return '🔥';
}

// ── Cache places map for dynamic POI enrichment ──────────────────────────────
interface PlaceInfo {
  id: string;
  name: string;
  commune: string;
  category: string;
  rating: number;
  image_url: string;
}

let placesCache: PlaceInfo[] | null = null;
let lastPlacesFetch = 0;

async function getPlacesMap(): Promise<Map<string, PlaceInfo>> {
  const now = Date.now();
  if (!placesCache || now - lastPlacesFetch > 300000) {
    try {
      const { data } = await supabase
        .from('places')
        .select('id, name, commune, category, rating, image_url')
        .eq('is_verified', true);
      if (Array.isArray(data)) {
        placesCache = data;
        lastPlacesFetch = now;
      }
    } catch { /* ignore fallback */ }
  }

  const map = new Map<string, PlaceInfo>();
  if (placesCache) {
    for (const p of placesCache) {
      map.set(p.name.toLowerCase(), p);
      map.set(p.id.toLowerCase(), p);
    }
  }
  return map;
}

function findMatchingPlace(stopName: string, poiId: string, placesMap: Map<string, PlaceInfo>): PlaceInfo | null {
  if (poiId && placesMap.has(poiId.toLowerCase())) {
    return placesMap.get(poiId.toLowerCase()) || null;
  }
  const low = stopName.toLowerCase();
  for (const [key, p] of placesMap.entries()) {
    if (low.includes(key) || key.includes(low)) return p;
  }
  return null;
}

const SLUG_ALIASES: Record<string, string> = {
  'classic-1day': 'kinh-dien-1-ngay',
  'backpack-2d1n': 'toan-canh-2n1d',
  'deep-explore-3d2n': 'kham-pha-sau-3n2d',
  'foodie-trail': 'food-tour-am-thuc-1-ngay-dem',
  'pagoda-heritage': 'tam-linh-hanh-huong-1-ngay',
  'co-to-trekking': 'trekking-cafe-chieu',
  '3-days': 'kham-pha-sau-3n2d',
  '2-days': 'toan-canh-2n1d',
  '1-day': 'kinh-dien-1-ngay',
};

// ── Load & convert from lichtrinh.json with real POI enrichment ──────────────
async function loadFromJsonFile(slugInput: string): Promise<ItineraryData | null> {
  try {
    const slug = SLUG_ALIASES[slugInput] || slugInput;
    const filePath = path.join(process.cwd(), '..', 'data', 'lichtrinh.json');
    if (!fs.existsSync(filePath)) return null;

    const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const itin = (raw.itineraries as Record<string, unknown>[])
      .find((i) => i.slug === slug || i.id === slug || i.slug === slugInput || i.id === slugInput);
    if (!itin) return null;

    const placesMap = await getPlacesMap();

    // Flatten days → stops
    let order = 1;
    const stops: ItineraryData['stops'] = [];
    for (const day of (itin.days as Record<string, unknown>[])) {
      const dayNum = Number(day.day) || 1;
      for (const s of (day.stops as Record<string, unknown>[])) {
        const transport = String(s.transport_to_next || '');
        const travelMin = Number((/(\d+)\s*phút/.exec(transport) || [])[1] || 0);
        const travelKm  = Number((/(\d+(?:\.\d+)?)\s*km/.exec(transport) || [])[1] || 0);
        const notes    = String(s.notes || '');
        const activity = String(s.activity || '');
        const stopName = String(s.name || '');
        const poiId    = String(s.poi_id || '');

        const matchedPlace = findMatchingPlace(stopName, poiId, placesMap);

        stops.push({
          order:               order++,
          name:                stopName,
          commune:             matchedPlace?.commune || 'Tri Tôn, An Giang',
          category:            inferCategory(stopName, activity),
          time_start:          String(s.time || '07:00'),
          time_end:            '',
          duration_min:        Number(s.duration_minutes || 60),
          tip:                 notes || activity,
          travel_to_next_min:  travelMin,
          travel_to_next_km:   travelKm,
          cost_vnd:            String(s.cost_vnd || ''),
          day:                 dayNum,
          transport_to_next:   transport,
          imageUrl:            matchedPlace?.image_url || '',
          rating:              matchedPlace?.rating || 4.8,
        } as ItineraryData['stops'][number]);
      }
    }

    // Build tagline
    const desc = String(itin.description || '');
    const audiences = (itin.audiences as string[]) || [];

    return {
      slug:         String(itin.slug || slug),
      emoji:        getEmojiFromJson(itin),
      title:        String(itin.name || 'Lịch Trình Tri Tôn'),
      tagline:      desc.length > 120 ? desc.slice(0, 120) + '…' : desc,
      for_whom:     audiences.join(', '),
      duration:     String(itin.duration || '1 ngày'),
      budget_range: String(itin.total_cost_estimate_vnd || ''),
      stops,
      tips:         Array.isArray(itin.tips) ? (itin.tips as string[]) : [],
      best_season:  String(itin.best_season || 'Quanh năm'),
    };
  } catch {
    return null;
  }
}

// ── GET /api/v1/chat/itinerary?slug=... ─────────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');

  // ── List all presets ─────────────────────────────────────────────────────
  if (!slug) {
    // PRIMARY: luôn luôn đọc từ lichtrinh.json trước
    try {
      const filePath = path.join(process.cwd(), '..', 'data', 'lichtrinh.json');
      const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const presets = (raw.itineraries as Record<string, unknown>[]).map((i, idx) => ({
        slug:         String(i.slug || ''),
        emoji:        getEmojiFromJson(i),
        title:        String(i.name || ''),
        tagline:      String(i.description || '').slice(0, 120),
        for_whom:     ((i.audiences as string[]) || []).join(', '),
        duration:     String(i.duration || '1 ngày'),
        budget_range: String(i.total_cost_estimate_vnd || ''),
        sort_order:   idx + 1,
      }));
      return NextResponse.json({ presets, source: 'lichtrinh.json' });
    } catch (jsonErr) {
      console.error('[itinerary] JSON read failed, falling back to DB:', jsonErr);
    }

    // FALLBACK: Supabase DB nếu file bị lỗi
    const { data: dbData, error } = await supabase
      .from('preset_itineraries')
      .select('slug, emoji, title, tagline, for_whom, duration, budget_range, sort_order')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (!error && dbData && dbData.length > 0) {
      return NextResponse.json({ presets: dbData, source: 'db_fallback' });
    }

    return NextResponse.json({ presets: [] });
  }

  // ── Fetch specific itinerary ─────────────────────────────────────────────
  // PRIMARY: luôn đọc thẳng từ lichtrinh.json (nguồn chân lý tuyệt đối)
  const itineraryFromJson = await loadFromJsonFile(slug);
  if (itineraryFromJson) {
    return NextResponse.json({
      itinerary: itineraryFromJson,
      stops_count: itineraryFromJson.stops.length,
      source: 'lichtrinh.json',
    });
  }

  // FALLBACK: Supabase DB chỉ khi JSON không tìm thấy slug (lịch trình cũ/extra)
  const { data: dbRow } = await supabase
    .from('preset_itineraries')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (dbRow) {
    const itinerary: ItineraryData = {
      slug:         dbRow.slug,
      emoji:        dbRow.emoji,
      title:        dbRow.title,
      tagline:      dbRow.tagline,
      for_whom:     dbRow.for_whom,
      duration:     dbRow.duration,
      budget_range: dbRow.budget_range || '',
      stops:        Array.isArray(dbRow.stops) ? dbRow.stops : JSON.parse(dbRow.stops || '[]'),
    };
    return NextResponse.json({
      itinerary,
      stops_count: itinerary.stops.length,
      source: 'db_fallback',
    });
  }

  return NextResponse.json({ error: 'Lịch trình không tồn tại' }, { status: 404 });
}
