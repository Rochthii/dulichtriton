import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://knmlbwsmfljlabhvqfid.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
      // Search across matched_location OR title OR author_name
      query = query.or(`matched_location.ilike.%${cleanLoc}%,title.ilike.%${cleanLoc}%,author_name.ilike.%${cleanLoc}%`);
    }

    if (search) {
      const cleanSearch = search.trim();
      query = query.or(`title.ilike.%${cleanSearch}%,author_name.ilike.%${cleanSearch}%,matched_location.ilike.%${cleanSearch}%`);
    }

    // Query Supabase with timeout guard
    const queryPromise = Promise.resolve(query);
    const timeoutPromise = new Promise<{ data: null; error: Error }>((resolve) =>
      setTimeout(() => resolve({ data: null, error: new Error('Supabase network timeout') }), 5000)
    );

    let { data: videos, error } = await Promise.race([queryPromise, timeoutPromise]);

    // If a specific tag/location search returned 0 items, fallback to fetching all real DB videos
    if (!error && (!videos || videos.length === 0) && location && location !== 'Tất cả') {
      const fallbackQuery = await supabase
        .from('video_discoveries')
        .select('id, external_video_id, video_url, embed_url, thumbnail_url, title, author_name, author_username, view_count, like_count, comment_count, share_count, matched_location, quality_score, hashtags')
        .order('view_count', { ascending: false })
        .limit(limit);
      videos = fallbackQuery.data || [];
    }

    if (error) {
      console.warn('[Videos API] Supabase fetch error:', error.message);
      return NextResponse.json(
        { success: false, total: 0, videos: [], error: error.message },
        { status: 500 }
      );
    }

    // Map to normalized frontend format
    const mapped = (videos || []).map((v) => ({
      id: v.id,
      tiktokVideoId: v.external_video_id,
      tiktokUrl: v.video_url,
      embedUrl: v.embed_url || `https://www.tiktok.com/embed/v2/${v.external_video_id}`,
      username: v.author_username ? `@${v.author_username}` : '@triton.angiang',
      userDisplayName: v.author_name || 'TikToker Tri Tôn',
      userAvatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(v.author_username || 'triton')}`,
      description: v.title,
      location: v.matched_location || 'Tri Tôn, An Giang',
      thumbnail: v.thumbnail_url || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
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
    console.error('[Videos API Error]:', err);
    return NextResponse.json(
      { success: false, total: 0, videos: [], error: err?.message || 'Internal Error' },
      { status: 500 }
    );
  }
}
