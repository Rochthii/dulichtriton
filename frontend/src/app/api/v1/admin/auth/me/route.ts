import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'node:crypto';

export const dynamic = 'force-dynamic';

const unauthorized = () => NextResponse.json({ authenticated: false }, { status: 401 });

export async function GET(req: NextRequest) {
  const localHttp = process.env.NODE_ENV === 'development' && process.env.ADMIN_LOCAL_HTTP === 'true';
  const cookieName = localHttp ? 'triton_admin_session_local' : '__Host-triton_admin_session';
  const token = req.cookies.get(cookieName)?.value;

  if (!token || !/^[A-Za-z0-9_-]{43}$/.test(token)) {
    return unauthorized();
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return unauthorized();
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
      console.error('[AdminMe DB Error]: session lookup failed');
      return unauthorized();
    }

    const createdAt = Date.parse(dbUser?.session_created_at ?? '');
    const expiresAt = Date.parse(dbUser?.session_expires_at ?? '');
    const now = Date.now();
    if (
      !dbUser || dbUser.id == null || dbUser.is_active !== true ||
      dbUser.session_hash !== tokenHash ||
      (dbUser.role !== 'ADMIN' && dbUser.role !== 'SUPER_ADMIN') ||
      !Number.isFinite(createdAt) || !Number.isFinite(expiresAt) ||
      createdAt > now || expiresAt <= now ||
      expiresAt <= createdAt || expiresAt - createdAt > 8 * 60 * 60 * 1000
    ) {
      return unauthorized();
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        name: dbUser.full_name || 'Admin Tri Tôn',
        email: dbUser.email,
        role: dbUser.role,
      },
    });
  } catch {
    console.error('[AdminMe Error]: session request failed');
    return unauthorized();
  }
}
