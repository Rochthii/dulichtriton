import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: placeId } = await params;

  if (!placeId) {
    return NextResponse.json({ error: 'Missing place id' }, { status: 400 });
  }

  // Query video_discoveries table filtered by matched_poi_id
  const { data, error } = await supabase
    .from('video_discoveries')
    .select(
      'id, platform, external_video_id, video_url, embed_url, thumbnail_url, title, author_name, view_count, matched_poi_id, matched_alias, relevance_score, score_breakdown, verification_status'
    )
    .eq('matched_poi_id', placeId)
    .in('verification_status', ['VERIFIED', 'RELEVANT'])
    .order('relevance_score', { ascending: false })
    .limit(10);

  if (error) {
    console.error(`[API /api/v1/places/${placeId}/videos] Supabase error:`, error.message);
    return NextResponse.json({ videos: [] }, { status: 200 });
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
}
