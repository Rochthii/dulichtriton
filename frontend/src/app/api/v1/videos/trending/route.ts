import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://knmlbwsmfljlabhvqfid.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
);

const FALLBACK_TRENDING = [
  {
    id: 'vid-ta-pa-01',
    title: 'Hồ Tà Pạ mùa nước trong vắt tuyệt đẹp giữa lòng Tri Tôn',
    platform: 'tiktok' as const,
    video_url: 'https://www.tiktok.com/@checkinangiang/video/7259012345678901234',
    embed_url: 'https://www.tiktok.com/embed/v2/7259012345678901234',
    thumbnail_url: 'https://res.cloudinary.com/dhjesnejt/image/upload/f_auto,q_auto:best,w_800,c_fill/v1786758533/tri_ton_hero/hero_ho_ta_pa.jpg',
    author_name: 'Check-in An Giang',
    view_count: 150000,
    place_id: 'ho-ta-pa',
  },
];

export async function GET() {
  try {
    const queryPromise = Promise.resolve(
      supabase
        .from('videos')
        .select('id, title, platform, video_url, embed_url, thumbnail_url, author_name, view_count, place_id')
        .eq('is_verified', true)
        .order('view_count', { ascending: false })
        .limit(10)
    );
    const timeoutPromise = new Promise<{ data: null; error: Error }>((resolve) =>
      setTimeout(() => resolve({ data: null, error: new Error('Supabase timeout') }), 2500)
    );

    const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

    if (error || !data || data.length === 0) {
      return NextResponse.json({ videos: FALLBACK_TRENDING, total: FALLBACK_TRENDING.length }, { status: 200 });
    }

    const videos = data.map((v) => ({
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
  } catch (err: any) {
    return NextResponse.json({ videos: FALLBACK_TRENDING, total: FALLBACK_TRENDING.length }, { status: 200 });
  }
}
