import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdminSession, AdminPrincipal } from '@/lib/adminSessionGuard';
import {
  validateSafeFetchUrl,
  safeServerFetch,
  SafeFetchValidationError,
  isDisallowedHostname,
  GOOGLE_MAPS_ALLOWED_DOMAINS,
  DomainValidationProfile,
} from '@/lib/serverFetchValidator';

export const dynamic = 'force-dynamic';

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return null;
  return createClient(supabaseUrl, serviceRoleKey);
}

function logAudit(
  action: string,
  resourceId: string,
  details: Record<string, unknown>,
  principal?: AdminPrincipal,
) {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  void Promise.resolve(
    supabase.from('audit_logs').insert({
      user_name: principal ? (principal.fullName || principal.email) : 'Admin_Manager',
      user_role: principal?.role || 'ADMIN',
      action,
      resource_type: 'image_scraping',
      resource_id: resourceId,
      details,
    })
  ).catch(e => console.warn('[AuditLog] Error:', e));
}

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

function isUrlLike(input: string): boolean {
  if (input.startsWith('https://') || input.startsWith('http://') || input.startsWith('//')) {
    return true;
  }
  // Natural language query with spaces is always a keyword
  if (input.includes(' ')) {
    return false;
  }
  // If it has a slash, it is a path or URL
  if (input.includes('/')) {
    return true;
  }
  // If it has a dot without spaces, it is a domain or IP (e.g. example.com, 127.0.0.1)
  if (input.includes('.')) {
    return true;
  }
  // Reserved / disallowed hostnames (e.g. localhost, admin, router)
  const lower = input.toLowerCase();
  if (
    lower === 'localhost' ||
    lower === 'admin' ||
    lower === 'router' ||
    lower === 'internal' ||
    lower === 'intranet' ||
    lower === 'instance-data' ||
    lower === 'metadata' ||
    lower.endsWith('.local') ||
    lower.endsWith('.internal') ||
    lower.endsWith('.lan') ||
    lower.endsWith('.localhost')
  ) {
    return true;
  }
  return false;
}

/**
 * Intelligent Image Scraping & Search Engine for Tri Ton Places (Requires Admin Session)
 */
export async function POST(req: NextRequest) {
  const auth = await verifyAdminSession(req);
  if (!auth.authenticated) return auth.response;

  if (process.env.ADMIN_MUTATIONS_ENABLED === 'false') {
    return NextResponse.json({ error: 'Admin mutations are temporarily disabled' }, { status: 503 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    let targetInput = body.url ? String(body.url).trim() : (body.query ? String(body.query).trim() : '');

    if (!targetInput) {
      return NextResponse.json(
        { error: 'Vui lòng cung cấp đường link URL hoặc tên địa điểm cần tìm ảnh' },
        { status: 400 }
      );
    }

    // 0. Scheme Boundary Enforcement (SSRF Mitigation - P01-021)
    // Strictly reject any explicit non-HTTPS schemes or protocol-relative URLs
    const schemeMatch = targetInput.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):/);
    if (schemeMatch) {
      const scheme = schemeMatch[1].toLowerCase();
      if (scheme !== 'https') {
        return NextResponse.json(
          {
            error: `Chỉ chấp nhận đường dẫn HTTPS an toàn. Giao thức "${scheme}:" không được phép.`,
            code: 'INVALID_SCHEME',
          },
          { status: 400 }
        );
      }
    } else if (targetInput.startsWith('//')) {
      return NextResponse.json(
        {
          error: 'Chỉ chấp nhận đường dẫn HTTPS an toàn. Đường dẫn protocol-relative không được phép.',
          code: 'INVALID_SCHEME',
        },
        { status: 400 }
      );
    }

    const imagesSet = new Set<string>();
    let detectedTitle = '';

    // CASE 1: USER INPUT IS A KEYWORD / PLACE NAME (NOT A URL)
    if (!isUrlLike(targetInput)) {
      detectedTitle = targetInput;

      // 1. Check Supabase places matching this name
      try {
        const supabase = getSupabaseClient();
        if (supabase) {
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
      logAudit('SCRAPE_IMAGES', 'keyword_search', { targetInput, count: resultList.length }, auth.principal);

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
    if (!targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }

    // Determine domain profile & allowed redirect domains (P01-023)
    let initialHost = '';
    try {
      initialHost = new URL(targetUrl).hostname.toLowerCase();
    } catch {
      return NextResponse.json(
        { error: `Đường link không hợp lệ: "${targetInput}"`, code: 'INVALID_URL' },
        { status: 400 }
      );
    }

    const isGoogleMaps =
      initialHost === 'goo.gl' ||
      initialHost.endsWith('.goo.gl') ||
      initialHost === 'google.com' ||
      initialHost.endsWith('.google.com') ||
      initialHost === 'google.com.vn' ||
      initialHost.endsWith('.google.com.vn');

    const domainProfile: DomainValidationProfile = isGoogleMaps ? 'GOOGLE_MAPS' : 'PUBLIC_INTERNET';
    const baseDomain = initialHost.startsWith('www.') ? initialHost.slice(4) : initialHost;
    const allowedRedirectDomains = isGoogleMaps
      ? GOOGLE_MAPS_ALLOWED_DOMAINS
      : [initialHost, baseDomain];

    // 2.0 SSRF & Server-Fetch Contract Validation (P01-020 & P01-021 & P01-023)
    const validation = await validateSafeFetchUrl(targetUrl, {
      profile: domainProfile,
    });
    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: validation.error,
          code: validation.code,
        },
        { status: 400 }
      );
    }
    targetUrl = validation.url.toString();

    // 2.1 Direct Image URL check
    if (/\.(jpg|jpeg|png|webp|avif)(\?.*)?$/i.test(targetUrl)) {
      logAudit('SCRAPE_IMAGES', 'direct_image', { targetUrl, count: 1 }, auth.principal);
      return NextResponse.json({
        success: true,
        count: 1,
        images: [targetUrl],
        title: 'Ảnh trực tiếp',
        message: 'Đã nhận 1 link ảnh trực tiếp thành công!',
      });
    }

    // 2.2 Fetch HTML content safely with manual redirect inspection and SSRF defense
    let response: Response;
    let finalUrl = targetUrl;
    try {
      response = await safeServerFetch(
        targetUrl,
        {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
          },
        },
        {
          profile: domainProfile,
          allowedRedirectDomains,
          maxRedirects: 3,
          timeoutMs: 6000,
          maxBodySizeBytes: 10 * 1024 * 1024,
        }
      );
      finalUrl = (response as unknown as { finalUrl?: string }).finalUrl || response.url || targetUrl;
    } catch (fetchErr: unknown) {
      if (fetchErr instanceof SafeFetchValidationError) {
        return NextResponse.json(
          { error: fetchErr.message, code: fetchErr.code },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: `Không thể kết nối đến trang web: ${fetchErr instanceof Error ? fetchErr.message : String(fetchErr)}` },
        { status: 502 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: `Không thể tải trang web (HTTP ${response.status})` },
        { status: 502 }
      );
    }

    const html = await response.text();

    // Try extracting page title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
      detectedTitle = titleMatch[1].replace(/ - [^-]+$/, '').trim();
    }
    if (!detectedTitle) {
      detectedTitle = extractPlaceNameFromUrl(finalUrl);
    }

    // 2.4 Extract Open Graph & Twitter Cards images (Highest Quality - HTTPS Only)
    const ogMatches = Array.from(html.matchAll(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/gi));
    for (const m of ogMatches) {
      if (m[1]) {
        let imgUrl = m[1].trim();
        if (imgUrl.startsWith('//')) imgUrl = 'https:' + imgUrl;
        else if (imgUrl.startsWith('http://')) imgUrl = imgUrl.replace(/^http:\/\//i, 'https://');
        if (imgUrl.startsWith('https://')) imagesSet.add(imgUrl);
      }
    }

    const twitterMatches = Array.from(html.matchAll(/<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/gi));
    for (const m of twitterMatches) {
      if (m[1]) {
        let imgUrl = m[1].trim();
        if (imgUrl.startsWith('//')) imgUrl = 'https:' + imgUrl;
        else if (imgUrl.startsWith('http://')) imgUrl = imgUrl.replace(/^http:\/\//i, 'https://');
        if (imgUrl.startsWith('https://')) imagesSet.add(imgUrl);
      }
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

      if (src.startsWith('http://')) {
        src = src.replace(/^http:\/\//i, 'https://');
      }
      if (src.startsWith('https://')) {
        imagesSet.add(src);
      }
    }

    // 2.6 Extract direct high-res image links inside JSON / scripts
    const jsonImgRegex = /"(https?:\/\/[^"'\s\\]+\.(?:jpg|jpeg|png|webp|avif))"/gi;
    while ((match = jsonImgRegex.exec(html)) !== null) {
      let src = match[1];
      if (src && !src.includes('icon') && !src.includes('logo') && !src.includes('.svg')) {
        if (src.startsWith('http://')) src = src.replace(/^http:\/\//i, 'https://');
        if (src.startsWith('https://')) imagesSet.add(src);
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
    logAudit('SCRAPE_IMAGES', 'url_scrape', { finalUrl, count: resultList.length }, auth.principal);

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
