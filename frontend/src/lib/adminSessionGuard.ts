import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'node:crypto';

export type AdminRole = 'ADMIN' | 'SUPER_ADMIN';

export interface AdminPrincipal {
  id: number | string;
  email: string;
  fullName: string;
  role: AdminRole;
}

export type AdminAuthResult =
  | { authenticated: true; principal: AdminPrincipal }
  | { authenticated: false; status: 401 | 403 | 500 | 503; error: string; response: NextResponse };

function extractCookie(req: NextRequest | Request, cookieName: string): string | undefined {
  if ('cookies' in req && typeof (req as NextRequest).cookies?.get === 'function') {
    const val = (req as NextRequest).cookies.get(cookieName)?.value;
    if (val) return val;
  }
  const rawCookie = req.headers.get('cookie') || '';
  const match = rawCookie.match(new RegExp(`(?:^|;\\s*)${cookieName}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

export async function verifyAdminSession(
  req: NextRequest | Request,
  allowedRoles: AdminRole[] = ['ADMIN', 'SUPER_ADMIN'],
): Promise<AdminAuthResult> {
  const localHttp = process.env.NODE_ENV === 'development' && process.env.ADMIN_LOCAL_HTTP === 'true';
  const cookieName = localHttp ? 'triton_admin_session_local' : '__Host-triton_admin_session';
  const token = extractCookie(req, cookieName);

  if (!token || !/^[A-Za-z0-9_-]{43}$/.test(token)) {
    return {
      authenticated: false,
      status: 401,
      error: 'Yêu cầu đăng nhập quản trị viên',
      response: NextResponse.json({ error: 'Yêu cầu đăng nhập quản trị viên' }, { status: 401 }),
    };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('[AdminGuard Error]: Supabase configuration missing');
    return {
      authenticated: false,
      status: 503,
      error: 'Dịch vụ xác thực tạm thời không khả dụng',
      response: NextResponse.json({ error: 'Dịch vụ xác thực tạm thời không khả dụng' }, { status: 503 }),
    };
  }

  try {
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data: dbUser, error: dbErr } = await supabase
      .from('admin_users')
      .select('id, email, full_name, role, is_active, session_hash, session_created_at, session_expires_at')
      .eq('session_hash', tokenHash)
      .eq('is_active', true)
      .maybeSingle();

    if (dbErr) {
      console.error('[AdminGuard DB Error]: session lookup failed');
      return {
        authenticated: false,
        status: 503,
        error: 'Dịch vụ xác thực tạm thời không khả dụng',
        response: NextResponse.json({ error: 'Dịch vụ xác thực tạm thời không khả dụng' }, { status: 503 }),
      };
    }

    if (!dbUser || dbUser.id == null || dbUser.is_active !== true || dbUser.session_hash !== tokenHash) {
      return {
        authenticated: false,
        status: 401,
        error: 'Phiên quản trị không hợp lệ hoặc đã hết hạn',
        response: NextResponse.json({ error: 'Phiên quản trị không hợp lệ hoặc đã hết hạn' }, { status: 401 }),
      };
    }

    const createdAt = Date.parse(dbUser.session_created_at ?? '');
    const expiresAt = Date.parse(dbUser.session_expires_at ?? '');
    const now = Date.now();

    if (
      !Number.isFinite(createdAt) ||
      !Number.isFinite(expiresAt) ||
      createdAt > now ||
      expiresAt <= now ||
      expiresAt <= createdAt ||
      expiresAt - createdAt > 8 * 60 * 60 * 1000
    ) {
      return {
        authenticated: false,
        status: 401,
        error: 'Phiên quản trị đã hết hạn hoặc không hợp lệ',
        response: NextResponse.json({ error: 'Phiên quản trị đã hết hạn hoặc không hợp lệ' }, { status: 401 }),
      };
    }

    const userRole = dbUser.role as AdminRole;
    if (!allowedRoles.includes(userRole)) {
      return {
        authenticated: false,
        status: 403,
        error: 'Tài khoản không có quyền thực hiện thao tác này',
        response: NextResponse.json({ error: 'Tài khoản không có quyền thực hiện thao tác này' }, { status: 403 }),
      };
    }

    return {
      authenticated: true,
      principal: {
        id: dbUser.id,
        email: dbUser.email,
        fullName: dbUser.full_name || 'Admin Tri Tôn',
        role: userRole,
      },
    };
  } catch {
    console.error('[AdminGuard Error]: session verification exception');
    return {
      authenticated: false,
      status: 500,
      error: 'Lỗi hệ thống khi xác thực phiên',
      response: NextResponse.json({ error: 'Lỗi hệ thống khi xác thực phiên' }, { status: 500 }),
    };
  }
}
