import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://knmlbwsmfljlabhvqfid.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

function logAudit(action: string, resourceId: string, details: Record<string, unknown>) {
  void Promise.resolve(
    supabase.from('audit_logs').insert({
      user_name: 'Admin_Manager',
      user_role: 'ADMIN',
      action,
      resource_type: 'video_discoveries',
      resource_id: resourceId,
      details,
    })
  ).catch(e => console.warn('[AuditLog] Error:', e));
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    let query = supabase
      .from('video_discoveries')
      .select('*')
      .order('created_at', { ascending: false });

    if (status && status !== 'ALL') {
      query = query.eq('verification_status', status);
    }

    const { data: videos, error } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true, videos: videos || [] });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching admin videos';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, verification_status, matched_poi_id, matched_location } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing video ID' }, { status: 400 });
    }

    const updatePayload: Record<string, unknown> = {};
    if (verification_status) updatePayload.verification_status = verification_status;
    if (matched_poi_id !== undefined) updatePayload.matched_poi_id = matched_poi_id;
    if (matched_location !== undefined) updatePayload.matched_location = matched_location;

    const { data, error } = await supabase
      .from('video_discoveries')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    logAudit('UPDATE_VIDEO_STATUS', id, { verification_status, matched_poi_id });

    return NextResponse.json({ success: true, video: data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error updating video';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing video ID' }, { status: 400 });
    }

    const { error } = await supabase.from('video_discoveries').delete().eq('id', id);
    if (error) throw error;

    logAudit('DELETE_VIDEO', id, { deleted_at: new Date().toISOString() });

    return NextResponse.json({ success: true, message: 'Video deleted' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error deleting video';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
