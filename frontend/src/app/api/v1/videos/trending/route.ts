import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  const { data, error } = await supabase
    .from('videos')
    .select(
      'id, title, platform, video_url, embed_url, thumbnail_url, author_name, view_count, place_id'
    )
    .eq('is_verified', true)
    .order('view_count', { ascending: false })
    .limit(10);

  if (error) {
    console.error('[API /videos/trending] Supabase error:', error.message);
    return NextResponse.json({ error: 'Failed to fetch trending videos' }, { status: 500 });
  }

  const videos = (data ?? []).map((v) => ({
    id: v.id,
    title: v.title,
    platform: v.platform as 'tiktok' | 'youtube' | 'youtube_shorts' | 'facebook',
    video_url: v.video_url,
    embed_url: v.embed_url,
    thumbnail_url: v.thumbnail_url ?? undefined,
    author_name: v.author_name ?? undefined,
    view_count: v.view_count ?? 0,
    place_id: v.place_id,
  }));

  return NextResponse.json({ videos, total: videos.length }, { status: 200 });
}
