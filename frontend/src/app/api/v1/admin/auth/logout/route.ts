import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'node:crypto';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const localHttp = process.env.NODE_ENV === 'development' && process.env.ADMIN_LOCAL_HTTP === 'true';
  const cookieName = localHttp ? 'triton_admin_session_local' : '__Host-triton_admin_session';
  const token = req.cookies.get(cookieName)?.value;

  try {
    if (token && /^[A-Za-z0-9_-]{43}$/.test(token)) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (supabaseUrl && serviceRoleKey) {
        const tokenHash = createHash('sha256').update(token).digest('hex');
        const supabase = createClient(supabaseUrl, serviceRoleKey);

        const { data: revokedUser, error: updateErr } = await supabase
          .from('admin_users')
          .update({
            session_hash: null,
            session_created_at: null,
            session_expires_at: null,
          })
          .eq('session_hash', tokenHash)
          .select('id, email, full_name, role')
          .maybeSingle();

        if (updateErr) {
          console.error('[AdminLogout DB Error]: session revocation failed');
        } else if (revokedUser) {
          void Promise.resolve(
            supabase.from('audit_logs').insert({
              user_name: revokedUser.full_name || revokedUser.email,
              user_role: revokedUser.role,
              action: 'LOGOUT_SUCCESS',
              resource_type: 'admin_auth',
              details: { email: revokedUser.email, timestamp: new Date().toISOString() },
            })
          ).catch(() => {});
        }
      }
    }
  } catch {
    console.error('[AdminLogout Error]: logout processing failed');
  }

  const response = NextResponse.json({
    success: true,
    message: 'Đã đăng xuất tài khoản Quản trị',
  });

  const clearCookie = (name: string) => {
    response.cookies.set({
      name,
      value: '',
      httpOnly: true,
      secure: !localHttp,
      path: '/',
      maxAge: 0,
      sameSite: 'strict',
    });
  };

  clearCookie(localHttp ? 'triton_admin_session_local' : '__Host-triton_admin_session');
  clearCookie(localHttp ? '__Host-triton_admin_session' : 'triton_admin_session_local');
  clearCookie('triton_admin_token');

  return response;
}
