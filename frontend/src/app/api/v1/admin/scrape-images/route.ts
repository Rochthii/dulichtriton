import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Extract high-resolution images from Google Maps URLs and Web URLs
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let targetUrl = body.url ? String(body.url).trim() : '';

    if (!targetUrl) {
      return NextResponse.json({ error: 'Vui lòng cung cấp đường link URL hợp lệ' }, { status: 400 });
    }

    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }

    // 1. Resolve redirect for short links (e.g. maps.app.goo.gl or goo.gl/maps)
    let finalUrl = targetUrl;
    try {
      const headRes = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
        },
        redirect: 'follow',
      });
      finalUrl = headRes.url || targetUrl;
    } catch (e) {
      console.warn('[ScrapeImages] Redirect resolution warning:', e);
    }

    // 2. Fetch page HTML
    const response = await fetch(finalUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
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
    const imagesSet = new Set<string>();

    // 3. Extract Google Maps user content photos
    // Pattern: https://lh3.googleusercontent.com/p/... or https://lh5.googleusercontent.com/p/...
    const googlePhotoRegex = /https?:\/\/(?:lh[3-6]\.googleusercontent\.com|streetviewpixels-pa\.googleapis\.com|geo[0-9]\.ggpht\.com)\/(?:p|gps-proxy|cbk)\/([^"'\s\\)]+)/gi;
    let match: RegExpExecArray | null;

    while ((match = googlePhotoRegex.exec(html)) !== null) {
      let photoId = match[1];
      // Clean up encoded query params or backslashes
      photoId = photoId.split('=')[0].split('\\')[0].split('"')[0].split("'")[0];
      if (photoId && photoId.length > 10) {
        // Build high-resolution URL (=w1600-h1200-k-no)
        const highResUrl = `https://lh3.googleusercontent.com/p/${photoId}=w1600-h1200-k-no`;
        imagesSet.add(highResUrl);
      }
    }

    // 4. Extract OpenGraph & Twitter Card images
    const ogImageMatches = html.matchAll(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/gi);
    for (const m of ogImageMatches) {
      if (m[1] && m[1].startsWith('http')) {
        imagesSet.add(m[1]);
      }
    }

    const twitterImageMatches = html.matchAll(/<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/gi);
    for (const m of twitterImageMatches) {
      if (m[1] && m[1].startsWith('http')) {
        imagesSet.add(m[1]);
      }
    }

    // 5. Extract general high-res <img> tags from standard websites
    const imgTagRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
    while ((match = imgTagRegex.exec(html)) !== null) {
      let src = match[1];
      if (!src) continue;

      // Filter out tiny tracker pixels, icons, svg, base64 badges
      if (
        src.includes('.svg') ||
        src.includes('data:image') ||
        src.includes('icon') ||
        src.includes('avatar') ||
        src.includes('logo') ||
        src.includes('pixel')
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

    // 6. Extract page title for display
    let pageTitle = '';
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
      pageTitle = titleMatch[1].replace(' - Google Maps', '').trim();
    }

    const resultList = Array.from(imagesSet).slice(0, 20);

    return NextResponse.json({
      success: true,
      count: resultList.length,
      images: resultList,
      title: pageTitle,
      sourceUrl: finalUrl,
      message: resultList.length > 0
        ? `Đã trích xuất thành công ${resultList.length} ảnh chất lượng cao`
        : 'Không tìm thấy ảnh phù hợp từ đường link này. Vui lòng kiểm tra lại link.',
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error extracting images';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
