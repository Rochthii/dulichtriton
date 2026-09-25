import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'node:crypto';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
      return NextResponse.json({ error: 'Vui lòng nhập đầy đủ Email và Mật khẩu!' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Dịch vụ đăng nhập chưa được cấu hình' }, { status: 503 });
    }
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    let authenticatedUser: { name: string; email: string; role: string } | null = null;

    // 1. Query admin_users table in Supabase PostgreSQL
    const { data: dbUser, error: dbErr } = await supabase
      .from('admin_users')
      .select('id, email, password_hash, full_name, role, is_active')
      .eq('email', cleanEmail)
      .eq('is_active', true)
      .maybeSingle();

    if (dbErr) {
      console.error('[AdminLogin DB Error]: credential lookup failed');
      return NextResponse.json({ error: 'Lỗi hệ thống khi đăng nhập' }, { status: 503 });
    }

    if (
      dbUser?.password_hash &&
      (dbUser.role === 'ADMIN' || dbUser.role === 'SUPER_ADMIN') &&
      !bcrypt.truncates(password) &&
      await bcrypt.compare(password, dbUser.password_hash)
    ) {
      authenticatedUser = {
        name: dbUser.full_name || 'Admin Tri Tôn',
        email: dbUser.email,
        role: dbUser.role,
      };
    }

    if (!authenticatedUser || !dbUser) {
      // Record failed audit log
      void Promise.resolve(
        supabase.from('audit_logs').insert({
          user_name: cleanEmail,
          user_role: 'UNKNOWN',
          action: 'LOGIN_FAILED',
          resource_type: 'admin_auth',
          details: { reason: 'Invalid credentials', email: cleanEmail },
        })
      ).catch(() => {});

      return NextResponse.json({ error: 'Email hoặc Mật khẩu Quản trị không chính xác!' }, { status: 401 });
    }

    if (dbUser.id == null) {
      console.error('[AdminLogin DB Error]: account identity missing');
      return NextResponse.json({ error: 'Lỗi hệ thống khi đăng nhập' }, { status: 503 });
    }

    const token = randomBytes(32).toString('base64url');
    const sessionHash = createHash('sha256').update(token).digest('hex');
    const sessionCreatedAt = new Date();
    const sessionExpiresAt = new Date(sessionCreatedAt.getTime() + 8 * 60 * 60 * 1000);

    const { data: sessionRow, error: sessionErr } = await supabase
      .from('admin_users')
      .update({
        session_hash: sessionHash,
        session_created_at: sessionCreatedAt.toISOString(),
        session_expires_at: sessionExpiresAt.toISOString(),
      })
      .eq('id', dbUser.id)
      .eq('password_hash', dbUser.password_hash)
      .eq('role', dbUser.role)
      .eq('is_active', true)
      .select('id, session_hash')
      .maybeSingle();

    if (sessionErr || !sessionRow || sessionRow.id !== dbUser.id || sessionRow.session_hash !== sessionHash) {
      console.error('[AdminLogin DB Error]: session persistence failed');
      return NextResponse.json({ error: 'Lỗi hệ thống khi đăng nhập' }, { status: 503 });
    }

    // Record success only after the session write succeeds.
    void Promise.resolve(
      supabase.from('audit_logs').insert({
        user_name: authenticatedUser.name,
        user_role: authenticatedUser.role,
        action: 'LOGIN_SUCCESS',
        resource_type: 'admin_auth',
        details: { email: cleanEmail, timestamp: new Date().toISOString() },
      })
    ).catch(() => {});

    const response = NextResponse.json({
      success: true,
      message: 'Đăng nhập Quản trị thành công!',
      user: authenticatedUser,
    });

    const localHttp = process.env.NODE_ENV === 'development' && process.env.ADMIN_LOCAL_HTTP === 'true';
    response.cookies.set({
      name: localHttp ? 'triton_admin_session_local' : '__Host-triton_admin_session',
      value: token,
      httpOnly: true,
      secure: !localHttp,
      path: '/',
      maxAge: 60 * 60 * 8,
      sameSite: 'strict',
    });
    response.cookies.set({
      name: 'triton_admin_token',
      value: '',
      httpOnly: true,
      secure: !localHttp,
      path: '/',
      maxAge: 0,
      sameSite: 'strict',
    });

    return response;
  } catch {
    console.error('[Admin Login Error]: credential request failed');
    return NextResponse.json({ error: 'Lỗi hệ thống khi đăng nhập' }, { status: 500 });
  }
}
