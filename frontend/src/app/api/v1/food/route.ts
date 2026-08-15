import { NextRequest, NextResponse } from 'next/server';
import { getCachedFoodPlaces } from '@/lib/dataCache';
import { EDGE_CACHE_HEADERS } from '@/lib/serverCache';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const commune = searchParams.get('commune') || 'ALL';
    const nightOnly = searchParams.get('night') === 'true';
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    const foodPlaces = await getCachedFoodPlaces(commune, nightOnly, limit);

    return NextResponse.json(
      {
        success: true,
        count: foodPlaces.length,
        food: foodPlaces,
        source: 'nextjs_data_cache',
      },
      { headers: EDGE_CACHE_HEADERS }
    );
  } catch (err: unknown) {
    console.warn('[Food API Error]:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to load food places' },
      { status: 500, headers: EDGE_CACHE_HEADERS }
    );
  }
}
