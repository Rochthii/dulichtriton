import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://knmlbwsmfljlabhvqfid.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const commune = searchParams.get('commune');
    const limit = parseInt(searchParams.get('limit') || '12', 10);

    let query = supabase
      .from('places')
      .select('id, slug, name, commune, category, rating, image_url, description, price_level, video_url, address, opening_hours, phone')
      .or('category.ilike.%Homestay%,category.ilike.%Khách sạn%,category.ilike.%Nhà nghỉ%,tourism_category.ilike.%Homestay%,tourism_category.ilike.%Khách sạn%')
      .order('rating', { ascending: false })
      .limit(limit);

    if (commune && commune !== 'ALL') {
      query = query.ilike('commune', `%${commune}%`);
    }

    const { data: stays, error } = await query;
    if (error) {
      console.error('[Stays API Error]:', error);
      throw error;
    }

    return NextResponse.json(
      { success: true, count: stays?.length || 0, stays: stays || [], source: 'supabase' },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' } }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching stays';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
