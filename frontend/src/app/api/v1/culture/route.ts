import { NextRequest, NextResponse } from 'next/server';
import { getCachedCulturePlaces } from '@/lib/dataCache';
import { EDGE_CACHE_HEADERS } from '@/lib/serverCache';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const commune = searchParams.get('commune') || 'ALL';
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    const culture = await getCachedCulturePlaces(commune, limit);

    return NextResponse.json(
      {
        success: true,
        count: culture.length,
        culture,
        source: 'nextjs_data_cache',
      },
      { headers: EDGE_CACHE_HEADERS }
    );
  } catch (err: unknown) {
    console.warn('[Culture API Error]:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to load culture places' },
      { status: 500, headers: EDGE_CACHE_HEADERS }
    );
  }
}
