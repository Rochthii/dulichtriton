import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://knmlbwsmfljlabhvqfid.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const FALLBACK_VIDEOS = [
  {
    id: 'vid-ta-pa-01',
    tiktokVideoId: '7259012345678901234',
    tiktokUrl: 'https://www.tiktok.com/@checkinangiang/video/7259012345678901234',
    embedUrl: 'https://www.tiktok.com/embed/v2/7259012345678901234',
    username: '@checkinangiang',
    userDisplayName: 'Check-in An Giang',
    userAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=tapa',
    description: 'Hồ Tà Pạ mùa nước trong vắt tuyệt đẹp giữa lòng Tri Tôn',
    location: 'Hồ Tà Pạ',
    thumbnail: 'https://res.cloudinary.com/dhjesnejt/image/upload/f_auto,q_auto:best,w_800,c_fill/v1786758533/tri_ton_hero/hero_ho_ta_pa.jpg',
    viewsCount: '150K',
    likesCount: '24K',
    sharesCount: '3.2K',
    hashtags: ['#tapa', '#dulichtriton', '#angiang'],
  },
  {
    id: 'vid-ga-dot-01',
    tiktokVideoId: '7259012345678905678',
    tiktokUrl: 'https://www.tiktok.com/@foodie_baynui/video/7259012345678905678',
    embedUrl: 'https://www.tiktok.com/embed/v2/7259012345678905678',
    username: '@foodie_baynui',
    userDisplayName: 'Ẩm Thực Bảy Núi',
    userAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=othum',
    description: 'Trải nghiệm thưởng thức Gà đốt Ô Thum thơm lừng lá chúc',
    location: 'Hồ Ô Thum',
    thumbnail: 'https://res.cloudinary.com/dhjesnejt/image/upload/f_auto,q_auto:best,w_800,c_fill/v1786758534/tri_ton_hero/hero_ga_dot_o_thum.jpg',
    viewsCount: '320K',
    likesCount: '48K',
    sharesCount: '6.5K',
    hashtags: ['#gadotothum', '#monngontriton', '#lachuc'],
  },
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const location = searchParams.get('location') || searchParams.get('category');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '12', 10);

    let query = supabase
      .from('video_discoveries')
      .select('id, external_video_id, video_url, embed_url, thumbnail_url, title, author_name, author_username, view_count, like_count, comment_count, share_count, matched_location, quality_score, hashtags')
      .order('view_count', { ascending: false })
      .limit(limit);

    if (location && location !== 'Tất cả') {
      const cleanLoc = location.trim();
      query = query.or(`matched_location.ilike.%${cleanLoc}%,title.ilike.%${cleanLoc}%,author_name.ilike.%${cleanLoc}%`);
    }

    if (search) {
      const cleanSearch = search.trim();
      query = query.or(`title.ilike.%${cleanSearch}%,author_name.ilike.%${cleanSearch}%,matched_location.ilike.%${cleanSearch}%`);
    }

    const queryPromise = Promise.resolve(query);
    const timeoutPromise = new Promise<{ data: null; error: Error }>((resolve) =>
      setTimeout(() => resolve({ data: null, error: new Error('Supabase network timeout') }), 2500)
    );

    const { data: videos, error } = await Promise.race([queryPromise, timeoutPromise]);

    if (error || !videos || videos.length === 0) {
      return NextResponse.json(
        {
          success: true,
          total: FALLBACK_VIDEOS.length,
          videos: FALLBACK_VIDEOS,
          source: 'curated_fallback',
        },
        { headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' } }
      );
    }

    const mapped = videos.map((v) => ({
      id: v.id,
      tiktokVideoId: v.external_video_id,
      tiktokUrl: v.video_url,
      embedUrl: v.embed_url || `https://www.tiktok.com/embed/v2/${v.external_video_id}`,
      username: v.author_username ? `@${v.author_username}` : '@triton.angiang',
      userDisplayName: v.author_name || 'TikToker Tri Tôn',
      userAvatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(v.author_username || 'triton')}`,
      description: v.title,
      location: v.matched_location || 'Tri Tôn, An Giang',
      thumbnail: v.thumbnail_url || 'https://res.cloudinary.com/dhjesnejt/image/upload/f_auto,q_auto:best,w_800,c_fill/v1786758533/tri_ton_hero/hero_ho_ta_pa.jpg',
      viewsCount: v.view_count ? (v.view_count > 1000000 ? `${(v.view_count / 1000000).toFixed(1)}M` : `${Math.round(v.view_count / 1000)}K`) : '50K',
      likesCount: v.like_count ? (v.like_count > 1000 ? `${Math.round(v.like_count / 1000)}K` : `${v.like_count}`) : '10K',
      sharesCount: v.share_count ? `${v.share_count}` : '1.2K',
      hashtags: v.hashtags || [],
    }));

    return NextResponse.json(
      {
        success: true,
        total: mapped.length,
        videos: mapped,
        source: 'supabase',
      },
      { headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' } }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: true,
        total: FALLBACK_VIDEOS.length,
        videos: FALLBACK_VIDEOS,
        source: 'curated_fallback',
      },
      { headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' } }
    );
  }
}
