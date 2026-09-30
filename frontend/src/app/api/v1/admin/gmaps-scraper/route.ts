import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdminSession, AdminPrincipal } from '@/lib/adminSessionGuard';
import {
  validateSafeFetchUrl,
  safeServerFetch,
  SafeFetchValidationError,
  GOOGLE_MAPS_ALLOWED_DOMAINS,
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
      resource_type: 'gmaps_scraper',
      resource_id: resourceId,
      details,
    })
  ).catch(e => console.warn('[AuditLog] Error:', e));
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
  // If it has a dot without spaces, it is a domain or IP (e.g. maps.google.com, 127.0.0.1)
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
 * API Chuyên Dụng: Tìm kiếm Địa Điểm Trên Google Maps + Bóc Tách Ảnh CDN + Đồng Bộ Supabase (Requires Admin Session)
 */
export async function POST(req: NextRequest) {
  const auth = await verifyAdminSession(req);
  if (!auth.authenticated) return auth.response;

  if (process.env.ADMIN_MUTATIONS_ENABLED === 'false') {
    return NextResponse.json({ error: 'Admin mutations are temporarily disabled' }, { status: 503 });
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Database service unavailable' }, { status: 503 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { query, placeId, autoSync = false } = body;

    const inputQuery = query ? String(query).trim() : '';
    if (!inputQuery) {
      return NextResponse.json(
        { error: 'Vui lòng cung cấp từ khóa tìm kiếm hoặc đường link Google Maps' },
        { status: 400 }
      );
    }

    // 0. Scheme Boundary Enforcement (SSRF Mitigation - P01-024)
    const schemeMatch = inputQuery.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):/);
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
    } else if (inputQuery.startsWith('//')) {
      return NextResponse.json(
        {
          error: 'Chỉ chấp nhận đường dẫn HTTPS an toàn. Đường dẫn protocol-relative không được phép.',
          code: 'INVALID_SCHEME',
        },
        { status: 400 }
      );
    }

    let targetUrl: string;
    if (isUrlLike(inputQuery)) {
      targetUrl = inputQuery.startsWith('https://') ? inputQuery : `https://${inputQuery}`;
    } else {
      const searchQuery = inputQuery.includes('Tri Tôn') ? inputQuery : `${inputQuery} Tri Tôn An Giang`;
      targetUrl = `https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}`;
    }

    // 1. URL Validation Contract & SSRF Protection (profile: GOOGLE_MAPS)
    const validation = await validateSafeFetchUrl(targetUrl, {
      profile: 'GOOGLE_MAPS',
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

    // 2. Fetch HTML từ Google Maps qua safeServerFetch (Manual redirect handling & SSRF protection)
    let response: Response;
    let finalUrl = targetUrl;
    try {
      response = await safeServerFetch(
        targetUrl,
        {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
          },
        },
        {
          profile: 'GOOGLE_MAPS',
          allowedRedirectDomains: GOOGLE_MAPS_ALLOWED_DOMAINS,
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
        { error: `Không thể kết nối đến Google Maps: ${fetchErr instanceof Error ? fetchErr.message : String(fetchErr)}` },
        { status: 502 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: `Không thể tải dữ liệu Google Maps (HTTP ${response.status})` },
        { status: 502 }
      );
    }

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
      if (m[1] && !m[1].includes('icon') && !m[1].includes('logo')) {
        let imgUrl = m[1].trim();
        if (imgUrl.startsWith('//')) imgUrl = 'https:' + imgUrl;
        else if (imgUrl.startsWith('http://')) imgUrl = imgUrl.replace(/^http:\/\//i, 'https://');
        if (imgUrl.startsWith('https://')) imagesSet.add(imgUrl);
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

    logAudit('GMAPS_SCRAPE', placeId || 'query_search', { query, photoCount: photos.length, synced }, auth.principal);

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
