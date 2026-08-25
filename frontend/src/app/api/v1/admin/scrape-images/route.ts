import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl || "https://placeholder.supabase.co", serviceKey || "placeholder");

// Curated Fallback High-Res Image Bank for Tri Ton Core Places
const TRI_TON_MEDIA_BANK: Record<string, string[]> = {
  'ta pa': [
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1600&auto=format&fit=crop',
  ],
  'o thum': [
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1600&auto=format&fit=crop',
  ],
  'co to': [
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?q=80&w=1600&auto=format&fit=crop',
  ],
  'xvayton': [
    'https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1528181304800-259b08848526?q=80&w=1600&auto=format&fit=crop',
  ],
  'soai chek': [
    'https://images.unsplash.com/photo-1439853941329-a99ce0457e8a?q=80&w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1600&auto=format&fit=crop',
  ],
  'tuc dup': [
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1600&auto=format&fit=crop',
  ],
};

function extractPlaceNameFromUrl(url: string): string {
  try {
    const decoded = decodeURIComponent(url);
    const placeMatch = decoded.match(/\/place\/([^\/@?#]+)/i);
    if (placeMatch && placeMatch[1]) {
      return placeMatch[1].replace(/\+/g, ' ').trim();
    }
    const qMatch = decoded.match(/[?&]q=([^&]+)/i);
    if (qMatch && qMatch[1]) {
      return qMatch[1].replace(/\+/g, ' ').trim();
    }
  } catch { /* ignore */ }
  return '';
}

/**
 * Intelligent Image Scraping & Search Engine for Tri Ton Places
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let targetInput = body.url ? String(body.url).trim() : (body.query ? String(body.query).trim() : '');

    if (!targetInput) {
      return NextResponse.json(
        { error: 'Vui lòng cung cấp đường link URL hoặc tên địa điểm cần tìm ảnh' },
        { status: 400 }
      );
    }

    const imagesSet = new Set<string>();
    let detectedTitle = '';

    // CASE 1: USER INPUT IS A KEYWORD / PLACE NAME (NOT A URL)
    if (!targetInput.startsWith('http://') && !targetInput.startsWith('https://') && !targetInput.includes('.')) {
      detectedTitle = targetInput;

      // 1. Check Supabase places matching this name
      try {
        const { data: dbPlaces } = await supabase
          .from('places')
          .select('name, image_url, photos')
          .ilike('name', `%${targetInput}%`)
          .limit(5);

        if (dbPlaces && dbPlaces.length > 0) {
          for (const p of dbPlaces) {
            if (p.image_url) imagesSet.add(p.image_url);
            if (Array.isArray(p.photos)) {
              for (const photo of p.photos) if (photo) imagesSet.add(photo);
            }
          }
        }
      } catch { /* non-blocking */ }

      // 2. Check Media Bank
      const lowerKeyword = targetInput.toLowerCase();
      for (const [key, list] of Object.entries(TRI_TON_MEDIA_BANK)) {
        if (lowerKeyword.includes(key)) {
          list.forEach(img => imagesSet.add(img));
        }
      }

      const resultList = Array.from(imagesSet).slice(0, 20);
      return NextResponse.json({
        success: true,
        count: resultList.length,
        images: resultList,
        title: detectedTitle,
        message: resultList.length > 0
          ? `Đã tìm thấy ${resultList.length} ảnh chất lượng cao cho "${detectedTitle}"`
          : `Không tìm thấy ảnh cho từ khóa "${targetInput}". Vui lòng nhập link bài viết trực tiếp.`,
      });
    }

    // CASE 2: USER INPUT IS A URL (WEB / GOOGLE MAPS / ARTICLE / DIRECT IMAGE)
    let targetUrl = targetInput;
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }

    // 2.1 Direct Image URL check
    if (/\.(jpg|jpeg|png|webp|avif)(\?.*)?$/i.test(targetUrl)) {
      return NextResponse.json({
        success: true,
        count: 1,
        images: [targetUrl],
        title: 'Ảnh trực tiếp',
        message: 'Đã nhận 1 link ảnh trực tiếp thành công!',
      });
    }

    // 2.2 Resolve Redirects for short links
    let finalUrl = targetUrl;
    try {
      const headRes = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
        },
        redirect: 'follow',
      });
      finalUrl = headRes.url || targetUrl;
    } catch (e) {
      console.warn('[ScrapeImages] Redirect resolution warning:', e);
    }

    // 2.3 Fetch HTML content
    const response = await fetch(finalUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Không thể kết nối đến trang web (Mã lỗi: ${response.status})` },
        { status: 400 }
      );
    }

    const html = await response.text();

    // Extract Title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
      detectedTitle = titleMatch[1].replace(' - Google Maps', '').trim();
    }

    // Extract Place Name from URL if Google Maps
    const extractedPlaceName = extractPlaceNameFromUrl(finalUrl);
    if (extractedPlaceName) {
      detectedTitle = detectedTitle || extractedPlaceName;
      // Search matching photos in DB
      try {
        const { data: dbPlaces } = await supabase
          .from('places')
          .select('image_url, photos')
          .ilike('name', `%${extractedPlaceName}%`)
          .limit(5);

        if (dbPlaces) {
          for (const p of dbPlaces) {
            if (p.image_url) imagesSet.add(p.image_url);
            if (Array.isArray(p.photos)) {
              for (const photo of p.photos) if (photo) imagesSet.add(photo);
            }
          }
        }
      } catch { /* non-blocking */ }
    }

    // 2.4 Extract OpenGraph & Twitter Images
    const ogMatches = html.matchAll(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/gi);
    for (const m of ogMatches) {
      if (m[1] && m[1].startsWith('http')) imagesSet.add(m[1]);
    }

    const twitterMatches = html.matchAll(/<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/gi);
    for (const m of twitterMatches) {
      if (m[1] && m[1].startsWith('http')) imagesSet.add(m[1]);
    }

    // 2.5 Extract all <img> tags, data-src, data-original, data-lazy-src, srcset
    const imgRegex = /<img[^>]+(?:src|data-src|data-original|data-lazy-src)=["']([^"']+)["'][^>]*>/gi;
    let match: RegExpExecArray | null;
    while ((match = imgRegex.exec(html)) !== null) {
      let src = match[1];
      if (!src) continue;

      // Filter unwanted small icons, avatars, trackers
      if (
        src.includes('.svg') ||
        src.includes('data:image') ||
        src.includes('icon') ||
        src.includes('avatar') ||
        src.includes('logo') ||
        src.includes('pixel') ||
        src.includes('tracking')
      ) {
        continue;
      }

      // Convert relative to absolute
      if (src.startsWith('//')) {
        src = 'https:' + src;
      } else if (src.startsWith('/')) {
        try {
          const origin = new URL(finalUrl).origin;
          src = origin + src;
        } catch {
          continue;
        }
      }

      if (src.startsWith('http://') || src.startsWith('https://')) {
        imagesSet.add(src);
      }
    }

    // 2.6 Extract direct high-res image links inside JSON / scripts
    const jsonImgRegex = /"(https?:\/\/[^"'\s\\]+\.(?:jpg|jpeg|png|webp|avif))"/gi;
    while ((match = jsonImgRegex.exec(html)) !== null) {
      let src = match[1];
      if (src && !src.includes('icon') && !src.includes('logo') && !src.includes('.svg')) {
        imagesSet.add(src);
      }
    }

    // 2.7 Fallback to Media Bank if 0 found
    if (imagesSet.size === 0 && detectedTitle) {
      const lower = detectedTitle.toLowerCase();
      for (const [key, list] of Object.entries(TRI_TON_MEDIA_BANK)) {
        if (lower.includes(key)) {
          list.forEach(img => imagesSet.add(img));
        }
      }
    }

    const resultList = Array.from(imagesSet).slice(0, 24);

    return NextResponse.json({
      success: true,
      count: resultList.length,
      images: resultList,
      title: detectedTitle || 'Web Page',
      sourceUrl: finalUrl,
      message: resultList.length > 0
        ? `Đã trích xuất thành công ${resultList.length} ảnh chất lượng cao`
        : 'Không tìm thấy ảnh phù hợp từ đường link này. Hãy thử dán link bài viết trực tiếp hoặc link ảnh.',
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi trích xuất ảnh';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
