import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdminSession, AdminPrincipal } from '@/lib/adminSessionGuard';

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
      resource_type: 'custom_knowledge_base',
      resource_id: resourceId,
      details,
    })
  ).catch(e => console.warn('[AuditLog] Error:', e));
}

// GET: Lấy chi tiết một mục tri thức (Requires Admin Session)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdminSession(req);
  if (!auth.authenticated) return auth.response;

  const supabase = getSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Database service unavailable' }, { status: 503 });
  }

  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Thiếu ID tri thức' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('custom_knowledge_base')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.code === 'PGRST116' ? 404 : 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching knowledge item';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

// PUT / PATCH: Cập nhật tri thức & ghi Audit Log (Requires Admin Session & Kill-switch Check)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Thiếu ID tri thức' }, { status: 400 });
    }

    const body = await req.json();
    const { title, category, keywords, content, is_active, priority, author } = body;

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (title !== undefined) updates.title = title.trim();
    if (category !== undefined) updates.category = category;
    if (content !== undefined) updates.content = content.trim();
    if (is_active !== undefined) updates.is_active = Boolean(is_active);
    if (priority !== undefined) updates.priority = Number(priority);
    if (author !== undefined) updates.author = author;

    if (keywords !== undefined) {
      updates.keywords = Array.isArray(keywords)
        ? keywords.map(k => String(k).trim()).filter(Boolean)
        : typeof keywords === 'string'
        ? keywords.split(',').map(k => k.trim()).filter(Boolean)
        : [];
    }

    const { data, error } = await supabase
      .from('custom_knowledge_base')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[Admin Knowledge Base API] Update error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    logAudit('UPDATE_KNOWLEDGE_BASE', id, updates, auth.principal);

    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error updating knowledge item';
    console.error('[Admin Knowledge Base API] Update exception:', msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export const PATCH = PUT;

// DELETE: Xóa tri thức & ghi Audit Log (Requires Admin Session & Kill-switch Check)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Thiếu ID tri thức' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('custom_knowledge_base')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[Admin Knowledge Base API] Delete error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    logAudit('DELETE_KNOWLEDGE_BASE', id, { deleted: data }, auth.principal);

    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error deleting knowledge item';
    console.error('[Admin Knowledge Base API] Delete exception:', msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
