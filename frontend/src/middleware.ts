import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimitAsync, isSuspiciousBot } from '@/lib/rateLimiter';

export async function middleware(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
             req.headers.get('x-real-ip') || 
             '127.0.0.1';
  const pathname = req.nextUrl.pathname;
  const userAgent = req.headers.get('user-agent');

  const isAdminMutation =
    pathname.startsWith('/api/v1/admin/') &&
    !pathname.startsWith('/api/v1/admin/auth/') &&
    ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);

  if (isAdminMutation && process.env.ADMIN_MUTATIONS_ENABLED !== 'true') {
    return new NextResponse(
      JSON.stringify({
        error: 'Admin mutations are temporarily disabled.',
        message: 'Các thao tác quản trị đang tạm khóa để bảo trì hệ thống.',
      }),
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-store',
          'Content-Type': 'application/json',
        },
      }
    );
  }

  // 1. Block Suspicious Scraper Bots on API routes (anti-scraping)
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/v1/admin')) {
    if (isSuspiciousBot(userAgent)) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Access Denied: Automated bot scraping detected.',
          message: 'Hệ thống bảo mật phát hiện truy vấn tự động không hợp lệ.' 
        }),
        { 
          status: 403, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }
  }

  // 1.5. CSRF Origin Verification for state-mutating requests (POST, PUT, DELETE, PATCH)
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method) && pathname.startsWith('/api/')) {
    const origin = req.headers.get('origin');
    const host = req.headers.get('host');
    if (origin && host) {
      const originHost = origin.replace(/^https?:\/\//, '');
      if (originHost !== host && !originHost.endsWith('.vercel.app') && !originHost.includes('localhost')) {
        return new NextResponse(
          JSON.stringify({ 
            error: 'CSRF Forbidden: Origin mismatch.',
            message: 'Từ chối yêu cầu từ nguồn không được ủy quyền.' 
          }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }
  }

  // 2. Sliding Window Rate Limiting (Anti-DDoS & Wallet Drain Shield)
  if (pathname.startsWith('/api/v1/chat/')) {
    // Protect AI Chatbot endpoints: max 20 prompts / minute per IP
    const limitResult = await checkRateLimitAsync(`chat_${ip}`, 20, 60, 'chat_query');
    if (!limitResult.allowed) {
      return new NextResponse(
        JSON.stringify({
          error: 'Rate limit exceeded. Please slow down.',
          message: `Bạn đã gửi quá nhiều câu hỏi trong thời gian ngắn. Vui lòng thử lại sau ${limitResult.resetSeconds} giây!`,
          reset_seconds: limitResult.resetSeconds,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(limitResult.resetSeconds),
            'X-RateLimit-Limit': String(limitResult.limit),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }
  } else if (pathname.startsWith('/api/v1/admin/auth/login')) {
    // Protect Admin Login: max 5 login attempts / minute per IP (Anti Brute-force)
    const limitResult = await checkRateLimitAsync(`login_${ip}`, 5, 60, 'auth_login');
    if (!limitResult.allowed) {
      return new NextResponse(
        JSON.stringify({
          error: 'Too many login attempts. Locked for 60 seconds.',
          message: `Đã thử đăng nhập sai quá nhiều lần. Vui lòng chờ ${limitResult.resetSeconds} giây!`,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(limitResult.resetSeconds),
          },
        }
      );
    }
  } else if (pathname.startsWith('/api/')) {
    // General API rate limit: max 90 requests / minute per IP
    const limitResult = await checkRateLimitAsync(`api_${ip}`, 90, 60, 'public_api');
    if (!limitResult.allowed) {
      return new NextResponse(
        JSON.stringify({
          error: 'API rate limit exceeded.',
          message: 'Tần suất gửi yêu cầu quá nhanh. Vui lòng giảm tốc độ truy cập!',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(limitResult.resetSeconds),
          },
        }
      );
    }
  }

  // 3. Security Headers Injection
  const res = NextResponse.next();
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('X-XSS-Protection', '1; mode=block');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return res;
}

export const config = {
  matcher: [
    '/api/:path*',
    '/admin/:path*',
  ],
};
