import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import fs from 'fs';
import type { ItineraryData } from '@/components/WireDiagramItinerary';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
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

// ── Load & convert from lichtrinh.json ──────────────────────────────────────
function loadFromJsonFile(slug: string): ItineraryData | null {
  try {
    const filePath = path.join(process.cwd(), '..', 'data', 'lichtrinh.json');
    if (!fs.existsSync(filePath)) return null;

    const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const itin = (raw.itineraries as Record<string, unknown>[])
      .find((i) => i.slug === slug || i.id === slug);
    if (!itin) return null;

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
        stops.push({
          order:               order++,
          name:                String(s.name || ''),
          commune:             'Tri Tôn, An Giang',
          category:            inferCategory(String(s.name || ''), activity),
          time_start:          String(s.time || '07:00'),
          time_end:            '',
          duration_min:        Number(s.duration_minutes || 60),
          tip:                 notes || activity,
          travel_to_next_min:  travelMin,
          travel_to_next_km:   travelKm,
          // extra raw fields exposed for UI if needed
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ...(s.cost_vnd ? { cost_vnd: s.cost_vnd } : {}),
          ...(dayNum > 1 ? { day: dayNum } : {}),
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
    };
  } catch {
    return null;
  }
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
  const itineraryFromJson = loadFromJsonFile(slug);
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

