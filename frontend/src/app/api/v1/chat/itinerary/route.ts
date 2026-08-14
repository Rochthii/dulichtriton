import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { ItineraryData } from '@/components/WireDiagramItinerary';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');

  if (!slug) {
    // Return all presets (summary only, no stops detail)
    const { data, error } = await supabase
      .from('preset_itineraries')
      .select('slug, emoji, title, tagline, for_whom, duration, budget_range, sort_order')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ presets: data });
  }

  // Return specific preset with full stops
  const { data, error } = await supabase
    .from('preset_itineraries')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Preset not found' }, { status: 404 });
  }

  const itinerary: ItineraryData = {
    slug:         data.slug,
    emoji:        data.emoji,
    title:        data.title,
    tagline:      data.tagline,
    for_whom:     data.for_whom,
    duration:     data.duration,
    budget_range: data.budget_range || '',
    stops:        Array.isArray(data.stops) ? data.stops : JSON.parse(data.stops || '[]'),
  };

  return NextResponse.json({ itinerary });
}
