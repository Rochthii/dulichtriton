import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/adminSessionGuard';
import { requireSupabaseServerClient } from '@/lib/serverSupabase';

export const dynamic = 'force-dynamic';

// GET: Fetch real feedback / correction reports from audit_logs (Admin only)
export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAdminSession(req);
    if (!auth.authenticated) return auth.response;

    const supabase = requireSupabaseServerClient();
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 200);

    const { data: logs, error } = await supabase
      .from('audit_logs')
      .select('id, user_name, user_role, action, resource_type, resource_id, details, created_at')
      .or('action.ilike.%CORRECTION%,action.ilike.%FEEDBACK%,action.ilike.%REPORT%')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[Feedback GET Error]:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      count: logs?.length || 0,
      feedbacks: logs || [],
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching feedbacks';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST: Submit a new user field feedback / correction report
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { place_id, place_name, issue_type, comment, reporter_name, contact } = body;

    if (!place_id && !place_name) {
      return NextResponse.json({ error: 'Cần có thông tin địa điểm' }, { status: 400 });
    }

    const feedbackPayload = {
      place_id: place_id || null,
      place_name: place_name || null,
      issue_type: issue_type || 'Thông tin chung',
      comment: comment || 'Báo cáo từ du khách',
      reporter_name: reporter_name || 'Du khách ẩn danh',
      contact: contact || '',
      status: 'PENDING',
      reported_at: new Date().toISOString(),
    };

    const supabase = requireSupabaseServerClient();
    const { data, error } = await supabase.from('audit_logs').insert({
      user_name: reporter_name || 'Du khách ẩn danh',
      user_role: 'PUBLIC_USER',
      action: 'POI_CORRECTION_REPORTED',
      resource_type: 'places',
      resource_id: place_id ? String(place_id) : 'UNKNOWN',
      details: feedbackPayload,
      created_at: new Date().toISOString(),
    }).select().single();

    if (error) {
      console.error('[Feedback POST Error]:', error);
      throw error;
    }

    return NextResponse.json({ success: true, feedback: data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error submitting feedback';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// PATCH: Approve / Dismiss / Resolve feedback ticket (Admin only)
export async function PATCH(req: NextRequest) {
  try {
    const auth = await verifyAdminSession(req);
    if (!auth.authenticated) return auth.response;

    const body = await req.json();
    const { log_id, status, notes } = body;

    if (!log_id || !status) {
      return NextResponse.json({ error: 'Thiếu log_id hoặc status' }, { status: 400 });
    }

    const supabase = requireSupabaseServerClient();

    // Fetch existing log
    const { data: log, error: fetchErr } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('id', log_id)
      .single();

    if (fetchErr || !log) {
      return NextResponse.json({ error: 'Không tìm thấy báo cáo' }, { status: 404 });
    }

    const currentDetails = (log.details as Record<string, unknown>) || {};
    const updatedDetails = {
      ...currentDetails,
      status,
      resolved_at: new Date().toISOString(),
      resolved_by: auth.principal.fullName || auth.principal.email,
      admin_notes: notes || '',
    };

    const { data, error } = await supabase
      .from('audit_logs')
      .update({
        details: updatedDetails,
      })
      .eq('id', log_id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, log: data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error resolving feedback';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
