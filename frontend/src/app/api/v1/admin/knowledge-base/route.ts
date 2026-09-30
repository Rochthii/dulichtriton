import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdminSession, AdminPrincipal } from '@/lib/adminSessionGuard';
import { buildSafeOrIlikeFilter } from '@/lib/postgrestFilterSanitizer';

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

export interface KnowledgeItem {
  id: string;
  title: string;
  category: 'food' | 'place' | 'festival' | 'transport' | 'emergency' | 'general';
  keywords: string[];
  content: string;
  is_active: boolean;
  priority: number;
  author: string;
  created_at: string;
  updated_at: string;
}

// GET: Lấy danh sách tri thức có phân trang & tìm kiếm (Requires Admin Session)
export async function GET(req: NextRequest) {
  const auth = await verifyAdminSession(req);
  if (!auth.authenticated) return auth.response;

  const supabase = getSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Database service unavailable' }, { status: 503 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('q')?.trim() || '';
    const category = searchParams.get('category')?.trim() || '';
    const activeOnly = searchParams.get('active_only') === 'true';

    let query = supabase
      .from('custom_knowledge_base')
      .select('*')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    if (search && search.trim()) {
      const searchFilter = buildSafeOrIlikeFilter(['title', 'content'], search);
      if (searchFilter) {
        query = query.or(searchFilter);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('[Admin Knowledge Base API] Fetch error:', error);
      return NextResponse.json({ success: false, error: error.message, data: [] }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      total: data?.length || 0,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching knowledge base';
    console.error('[Admin Knowledge Base API] Exception:', msg);
    return NextResponse.json({ success: false, error: msg, data: [] }, { status: 500 });
  }
}

// POST: Tạo mới tri thức & ghi Audit Log (Requires Admin Session & Kill-switch Check)
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
    const body = await req.json();
    const { title, category, keywords, content, is_active, priority, author } = body;

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Tiêu đề và nội dung tri thức không được để trống' },
        { status: 400 }
      );
    }

    const parsedKeywords = Array.isArray(keywords)
      ? keywords.map(k => String(k).trim()).filter(Boolean)
      : typeof keywords === 'string'
      ? keywords.split(',').map(k => k.trim()).filter(Boolean)
      : [];

    const newRecord = {
      title: title.trim(),
      category: category || 'general',
      keywords: parsedKeywords,
      content: content.trim(),
      is_active: is_active ?? true,
      priority: Number(priority) || 5,
      author: author?.trim() || auth.principal?.fullName || 'Admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('custom_knowledge_base')
      .insert([newRecord])
      .select()
      .single();

    if (error) {
      console.error('[Admin Knowledge Base API] Insert error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    logAudit('CREATE_KNOWLEDGE_BASE', data.id, newRecord, auth.principal);

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error creating knowledge item';
    console.error('[Admin Knowledge Base API] Insert exception:', msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
