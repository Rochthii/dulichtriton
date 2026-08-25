import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl || "https://placeholder.supabase.co", serviceKey || "placeholder");

/**
 * API Chuyên Dụng: Tìm kiếm Địa Điểm Trên Google Maps + Bóc Tách Ảnh CDN + Đồng Bộ Supabase
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, placeId, autoSync = false } = body;

    if (!query) {
      return NextResponse.json({ error: 'Vui lòng cung cấp từ khóa tìm kiếm hoặc đường link Google Maps' }, { status: 400 });
    }

    const isUrl = query.startsWith('http://') || query.startsWith('https://');
    let targetUrl = isUrl ? query : `https://www.google.com/maps/search/${encodeURIComponent(query.includes('Tri Tôn') ? query : `${query} Tri Tôn An Giang`)}`;

    // 1. Fetch HTML từ Google Maps / Web URL
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
      },
      redirect: 'follow',
    });

    const finalUrl = response.url || targetUrl;
    const html = await response.text();

    // 2. Extract Place Title & GPS Coordinates
    let detectedTitle = query;
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
      detectedTitle = titleMatch[1].replace(' - Google Maps', '').trim();
    }

    let latitude: number | null = null;
    let longitude: number | null = null;
    const coordMatch = finalUrl.match(/@([0-9.]+),([0-9.]+)/) || html.match(/@([0-9.]+),([0-9.]+)/);
    if (coordMatch) {
      latitude = parseFloat(coordMatch[1]);
      longitude = parseFloat(coordMatch[2]);
    }

    // 3. Extract Real Photos from Google Maps CDN (lh3.googleusercontent.com/p/...)
    const imagesSet = new Set<string>();

    const gmapsPdnRegex = /https:\/\/lh[0-9]\.googleusercontent\.com\/p\/[A-Za-z0-9_-]+/g;
    let match: RegExpExecArray | null;
    while ((match = gmapsPdnRegex.exec(html)) !== null) {
      imagesSet.add(`${match[0]}=s1600-k-no`);
    }

    const gphotosRegex = /https:\/\/lh[0-9]\.googleusercontent\.com\/[A-Za-z0-9_-]{20,}/g;
    while ((match = gphotosRegex.exec(html)) !== null) {
      if (!match[0].includes('icon') && !match[0].includes('avatar') && !match[0].includes('logo')) {
        imagesSet.add(`${match[0]}=s1600-k-no`);
      }
    }

    const ogMatches = html.matchAll(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/gi);
    for (const m of ogMatches) {
      if (m[1] && m[1].startsWith('http') && !m[1].includes('icon') && !m[1].includes('logo')) {
        imagesSet.add(m[1]);
      }
    }

    const photos = Array.from(imagesSet).slice(0, 20);

    // 4. Tự động đồng bộ lên Supabase nếu autoSync = true và có placeId
    let synced = false;
    if (autoSync && placeId && photos.length > 0) {
      const heroImage = photos[0];
      const checkinSpots = photos.slice(0, 3).map((url, idx) => ({
        title: `Góc check-in thực địa #${idx + 1} (${detectedTitle})`,
        photo_url: url,
        tip: 'Ảnh chụp thực tế từ Google Maps.',
      }));

      const { error } = await supabase
        .from('places')
        .update({
          image_url: heroImage,
          photos: photos,
          checkin_spots: checkinSpots,
        })
        .eq('id', placeId);

      if (!error) synced = true;
    }

    return NextResponse.json({
      success: true,
      query,
      detectedTitle,
      googleMapsUrl: finalUrl,
      coordinates: latitude && longitude ? { latitude, longitude } : null,
      photoCount: photos.length,
      photos,
      synced,
      message: photos.length > 0
        ? `Đã bóc tách thành công ${photos.length} ảnh thực tế từ Google Maps!`
        : `Đã tìm thấy địa điểm trên Google Maps nhưng không có ảnh công khai.`,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi xử lý';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
