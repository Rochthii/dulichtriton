import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://knmlbwsmfljlabhvqfid.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@triton.gov.vn';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'TriTon2026!Admin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Vui lòng nhập đầy đủ Email và Mật khẩu!' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    let authenticatedUser: { name: string; email: string; role: string } | null = null;

    // 1. Query admin_users table in Supabase PostgreSQL
    const { data: dbUser } = await supabase
      .from('admin_users')
      .select('email, password, full_name, role, is_active')
      .eq('email', cleanEmail)
      .eq('is_active', true)
      .single();

    if (dbUser && dbUser.password === cleanPassword) {
      authenticatedUser = {
        name: dbUser.full_name || 'Admin Tri Tôn',
        email: dbUser.email,
        role: dbUser.role || 'SUPER_ADMIN',
      };
    } else if (cleanEmail === ADMIN_EMAIL.toLowerCase() && cleanPassword === ADMIN_PASSWORD) {
      authenticatedUser = {
        name: 'Trưởng Ban Quản Trị Tri Tôn',
        email: cleanEmail,
        role: 'ADMIN',
      };
    }

    if (!authenticatedUser) {
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

    // Record success audit log
    void Promise.resolve(
      supabase.from('audit_logs').insert({
        user_name: 'Admin_TriTon',
        user_role: 'ADMIN',
        action: 'LOGIN_SUCCESS',
        resource_type: 'admin_auth',
        details: { email: cleanEmail, timestamp: new Date().toISOString() },
      })
    ).catch(() => {});

    // Create session token
    const token = `triton_admin_session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const response = NextResponse.json({
      success: true,
      message: 'Đăng nhập Quản trị thành công!',
      user: authenticatedUser,
    });

    // Set secure HTTP cookie
    response.cookies.set({
      name: 'triton_admin_token',
      value: token,
      httpOnly: false, // Accessible by client script for layout guard
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax',
    });

    return response;
  } catch (err: unknown) {
    console.error('[Admin Login Error]:', err);
    return NextResponse.json({ error: 'Lỗi hệ thống khi đăng nhập' }, { status: 500 });
  }
}
