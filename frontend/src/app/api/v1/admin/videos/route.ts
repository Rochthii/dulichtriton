import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://knmlbwsmfljlabhvqfid.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
const supabase = createClient(supabaseUrl || "https://placeholder.supabase.co", supabaseKey || "placeholder");

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

    const queryPromise = Promise.resolve(query);
    const timeoutPromise = new Promise<{ data: null; error: Error }>((resolve) =>
      setTimeout(() => resolve({ data: null, error: new Error('Supabase timeout') }), 2500)
    );

    const { data: videos } = await Promise.race([queryPromise, timeoutPromise]);
    return NextResponse.json({ success: true, videos: videos || [] });
  } catch (err: unknown) {
    return NextResponse.json({ success: true, videos: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      video_url,
      embed_url,
      thumbnail_url,
      title,
      author_name,
      author_username,
      matched_location,
      verification_status = 'VERIFIED',
      quality_score = 0.95,
      view_count = 50000,
    } = body;

    if (!video_url || !title) {
      return NextResponse.json({ error: 'Missing required video fields (video_url, title)' }, { status: 400 });
    }

    const externalId = video_url.match(/video\/(\d+)/)?.[1] || `custom_${Date.now()}`;

    const insertPayload = {
      platform: 'tiktok',
      external_video_id: externalId,
      video_url,
      embed_url: embed_url || `https://www.tiktok.com/embed/v2/${externalId}`,
      thumbnail_url,
      title,
      author_name: author_name || 'TikTok Reviewer',
      author_username: author_username || '@tiktok',
      matched_location: matched_location || 'Tri Tôn, An Giang',
      verification_status,
      quality_score,
      view_count,
    };

    // Resilient Insert/Update check to prevent 42P10 constraint mismatch errors
    const { data: existing } = await supabase
      .from('video_discoveries')
      .select('id')
      .eq('video_url', video_url)
      .maybeSingle();

    let data;
    let error;

    if (existing) {
      const { data: updated, error: updateErr } = await supabase
        .from('video_discoveries')
        .update(insertPayload)
        .eq('id', existing.id)
        .select()
        .single();
      data = updated;
      error = updateErr;
    } else {
      const { data: inserted, error: insertErr } = await supabase
        .from('video_discoveries')
        .insert(insertPayload)
        .select()
        .single();
      data = inserted;
      error = insertErr;
    }

    if (error) {
      console.error('[AdminVideos POST Error]:', error);
      throw error;
    }

    logAudit('IMPORT_TIKTOK_VIDEO', data?.id || externalId, { title, matched_location });

    return NextResponse.json({ success: true, video: data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error creating video record';
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

    if (error) {
      console.error('[AdminVideos PATCH Error]:', error);
      throw error;
    }

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
    if (error) {
      console.error('[AdminVideos DELETE Error]:', error);
      throw error;
    }

    logAudit('DELETE_VIDEO', id, { deleted_at: new Date().toISOString() });

    return NextResponse.json({ success: true, message: 'Video deleted' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error deleting video';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
