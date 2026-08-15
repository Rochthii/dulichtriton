import { NextRequest, NextResponse } from 'next/server';
import { getCachedStayPlaces } from '@/lib/dataCache';
import { EDGE_CACHE_HEADERS } from '@/lib/serverCache';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const commune = searchParams.get('commune') || 'ALL';
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    const stays = await getCachedStayPlaces(commune, limit);

    return NextResponse.json(
      {
        success: true,
        count: stays.length,
        stays,
        source: 'nextjs_data_cache',
      },
      { headers: EDGE_CACHE_HEADERS }
    );
  } catch (err: unknown) {
    console.warn('[Stays API Error]:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to load stays' },
      { status: 500, headers: EDGE_CACHE_HEADERS }
    );
  }
}
