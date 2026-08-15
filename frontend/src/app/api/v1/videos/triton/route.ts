import { NextRequest, NextResponse } from 'next/server';
import { getCachedVideos } from '@/lib/dataCache';
import { EDGE_CACHE_HEADERS } from '@/lib/serverCache';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const placeId = searchParams.get('place') || 'ALL';
  const sort = searchParams.get('sort') || 'relevant';
  const limit = Math.min(Number(searchParams.get('limit')) || 10, 30);

  try {
    const videos = await getCachedVideos(placeId, sort, limit);

    return NextResponse.json(
      {
        videos,
        total: videos.length,
        filters: { place_id: placeId, sort, limit },
        source: 'nextjs_data_cache',
      },
      { headers: EDGE_CACHE_HEADERS }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to fetch discovered videos', detail: msg },
      { status: 500, headers: EDGE_CACHE_HEADERS }
    );
  }
}
