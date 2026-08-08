import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const placeId = searchParams.get('place');
  const sort = searchParams.get('sort') || 'relevant';
  const limit = Math.min(Number(searchParams.get('limit')) || 10, 30);

  let query = supabase
    .from('video_discoveries')
    .select(
      'id, platform, external_video_id, video_url, embed_url, thumbnail_url, title, author_name, view_count, matched_poi_id, matched_alias, relevance_score, score_breakdown, verification_status'
    )
    .in('verification_status', ['VERIFIED', 'RELEVANT']);

  // Filter by place_id if provided
  if (placeId) {
    query = query.eq('matched_poi_id', placeId);
  }

  // Sorting logic
  if (sort === 'recent') {
    query = query.order('discovered_at', { ascending: false });
  } else if (sort === 'popular') {
    query = query.order('view_count', { ascending: false, nullsFirst: false });
  } else {
    // Default: sort by relevance_score
    query = query.order('relevance_score', { ascending: false });
  }

  query = query.limit(limit);

  const { data, error } = await query;

  if (error) {
    console.error('[API /api/v1/videos/triton] Supabase error:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch discovered videos', detail: error.message },
      { status: 500 }
    );
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
    view_count: v.view_count ?? undefined,
    matched_poi_id: v.matched_poi_id,
    matched_alias: v.matched_alias,
    relevance_score: Number(v.relevance_score),
    score_breakdown: v.score_breakdown,
    verification_status: v.verification_status,
  }));

  return NextResponse.json({ videos, total: videos.length }, { status: 200 });
}
