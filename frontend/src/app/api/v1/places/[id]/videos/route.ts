import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient, getSupabaseAnonServerClient } from '@/lib/serverSupabase';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: placeId } = await params;

  if (!placeId) {
    return NextResponse.json({ error: 'Missing place id' }, { status: 400 });
  }

  try {
    const supabase = getSupabaseServerClient() || getSupabaseAnonServerClient();
    if (!supabase) {
      return NextResponse.json({ videos: [], total: 0 }, { status: 200 });
    }

    // Query video_discoveries table filtered by matched_poi_id with 3s timeout race
    const queryPromise = Promise.resolve(
      supabase
        .from('video_discoveries')
        .select(
          'id, platform, external_video_id, video_url, embed_url, thumbnail_url, title, author_name, view_count, matched_poi_id, matched_alias, relevance_score, score_breakdown, verification_status'
        )
        .eq('matched_poi_id', placeId)
        .in('verification_status', ['VERIFIED', 'RELEVANT'])
        .order('relevance_score', { ascending: false })
        .limit(10)
    );

    const timeoutPromise = new Promise<{ data: null; error: Error }>((resolve) =>
      setTimeout(() => resolve({ data: null, error: new Error('Supabase timeout (3s limit)') }), 3000)
    );

    const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

    if (error) {
      console.warn(`[API /api/v1/places/${placeId}/videos] Supabase warning:`, error.message);
      return NextResponse.json({ videos: [], total: 0 }, { status: 200 });
    }

    const videos = (data ?? []).map((v) => ({
      id: v.id,
      external_video_id: v.external_video_id,
      platform: v.platform as 'tiktok' | 'youtube' | 'youtube_shorts' | 'facebook',
      video_url: v.video_url,
      embed_url: v.embed_url,
      thumbnail_url: v.thumbnail_url ?? undefined,
      title: v.title,
      author_name: v.author_name ?? undefined,
      view_count: v.view_count ?? 15000,
      matched_poi_id: v.matched_poi_id,
      matched_alias: v.matched_alias,
      relevance_score: Number(v.relevance_score),
      verification_status: v.verification_status,
    }));

    return NextResponse.json({ videos, total: videos.length }, { status: 200 });
  } catch (err: unknown) {
    console.error(`[API /api/v1/places/${placeId}/videos Error]:`, err);
    return NextResponse.json({ videos: [], total: 0 }, { status: 200 });
  }
}
