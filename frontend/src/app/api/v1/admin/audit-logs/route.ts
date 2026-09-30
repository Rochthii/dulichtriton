import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/adminSessionGuard';
import { requireSupabaseServerClient } from '@/lib/serverSupabase';
import { buildSafeOrIlikeFilter } from '@/lib/postgrestFilterSanitizer';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAdminSession(req);
    if (!auth.authenticated) return auth.response;

    const supabase = requireSupabaseServerClient();
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 200);
    const search = searchParams.get('search');

    let query = supabase
      .from('audit_logs')
      .select('id, user_name, user_role, action, resource_type, resource_id, details, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (search && search.trim()) {
      const searchFilter = buildSafeOrIlikeFilter(['action', 'user_name', 'resource_id'], search);
      if (searchFilter) {
        query = query.or(searchFilter);
      }
    }

    const { data: logs, error } = await query;

    if (error) {
      console.error('[AuditLogs API Error]:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, count: logs?.length || 0, logs: logs || [] });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching audit logs';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
