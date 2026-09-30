import { NextResponse } from 'next/server';
import { getSupabaseServerClient, getSupabaseAnonServerClient } from '@/lib/serverSupabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = getSupabaseServerClient() || getSupabaseAnonServerClient();
  if (!supabase) {
    return NextResponse.json({ videos: [], total: 0 }, { status: 200 });
  }

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

  return NextResponse.json({
    videos: data ?? [],
    total: data?.length ?? 0,
  });
}
