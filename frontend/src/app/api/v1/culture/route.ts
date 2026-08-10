import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://knmlbwsmfljlabhvqfid.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const commune = searchParams.get('commune');
    const limit = parseInt(searchParams.get('limit') || '12', 10);

    let query = supabase
      .from('places')
      .select('id, slug, name, commune, category, rating, image_url, description, price_level, video_url, address, opening_hours')
      .or('category.ilike.%Chùa%,category.ilike.%Văn hóa%,category.ilike.%Di tích%,category.ilike.%Di sản%,tourism_category.ilike.%Tâm linh%,tourism_category.ilike.%Văn hóa%')
      .order('rating', { ascending: false })
      .limit(limit);

    if (commune && commune !== 'ALL') {
      query = query.ilike('commune', `%${commune}%`);
    }

    const { data: cultureItems, error } = await query;
    if (error) {
      console.error('[Culture API Error]:', error);
      throw error;
    }

    return NextResponse.json(
      { success: true, count: cultureItems?.length || 0, culture: cultureItems || [], source: 'supabase' },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' } }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching culture items';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
