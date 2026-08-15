import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getOrSetServerCache, EDGE_CACHE_HEADERS } from '@/lib/serverCache';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const placeId = searchParams.get('place') || 'ALL';
  const sort = searchParams.get('sort') || 'relevant';
  const limit = Math.min(Number(searchParams.get('limit')) || 10, 30);

  const cacheKey = `videos_triton_${placeId}_${sort}_${limit}`;

  try {
    const data = await getOrSetServerCache(
      cacheKey,
      async () => {
        let query = supabase
          .from('video_discoveries')
          .select(
            'id, platform, external_video_id, video_url, embed_url, thumbnail_url, title, author_name, view_count, matched_poi_id, matched_alias, relevance_score, score_breakdown, verification_status'
          )
          .in('verification_status', ['VERIFIED', 'RELEVANT']);

        if (placeId && placeId !== 'ALL') {
          query = query.eq('matched_poi_id', placeId);
        }

        if (sort === 'recent') {
          query = query.order('discovered_at', { ascending: false });
        } else if (sort === 'popular') {
          query = query.order('view_count', { ascending: false, nullsFirst: false });
        } else {
          query = query.order('relevance_score', { ascending: false });
        }

        query = query.limit(limit);

        const { data: dbData, error } = await query;

        if (error) {
          console.warn('[API /api/v1/videos/triton] DB error fallback:', error.message);
          return {
            videos: [],
            total: 0,
            filters: { place_id: placeId, sort, limit },
          };
        }

        const videos = (dbData ?? []).map((v) => ({
          id: v.id,
          external_video_id: v.external_video_id,
          platform: v.platform as 'tiktok' | 'youtube' | 'youtube_shorts' | 'facebook',
          video_url: v.video_url,
          embed_url: v.embed_url,
          thumbnail_url: v.thumbnail_url ?? undefined,
          title: v.title,
          author_name: v.author_name ?? undefined,
          view_count: v.view_count ?? undefined,
          matched_poi_id: v.matched_poi_id ?? undefined,
          matched_alias: v.matched_alias ?? undefined,
          relevance_score: v.relevance_score,
          verification_status: v.verification_status,
        }));

        return {
          videos,
          total: videos.length,
          filters: { place_id: placeId, sort, limit },
        };
      },
      86400 // 24 hours
    );

    return NextResponse.json(data, {
      headers: EDGE_CACHE_HEADERS,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to fetch discovered videos', detail: msg }, { status: 500 });
  }
}
