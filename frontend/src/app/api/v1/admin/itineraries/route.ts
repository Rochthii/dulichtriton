import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

interface StopItem {
  time?: string;
  time_start?: string;
  time_end?: string;
  id?: string;
  name: string;
  commune?: string;
  cluster?: string;
  category?: string;
  tip?: string;
  duration_min?: number;
  travel_to_next_km?: number;
}

interface ItineraryPayload {
  id?: string;
  itinerary_id?: string;
  slug?: string;
  emoji?: string;
  title: string;
  duration: string;
  total_distance_km?: number;
  recommended_vehicle?: string;
  suitable_for?: string;
  for_whom?: string;
  budget_estimate?: string;
  budget?: string;
  budget_range?: string;
  description?: string;
  tagline?: string;
  stops?: StopItem[];
  is_active?: boolean;
  display_order?: number;
  sort_order?: number;
}

// GET: Fetch all itineraries directly from Supabase PostgreSQL
export async function GET() {
  try {
    const { data: rows, error } = await supabase
      .from('preset_itineraries')
      .select('*')
      .order('sort_order', { ascending: true, nullsFirst: false });

    if (error) {
      console.error('[AdminItineraries GET Error]:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Normalize rows for admin table
    const itineraries = (rows || []).map((row: any) => ({
      itinerary_id: row.id,
      id: row.id,
      slug: row.slug,
      emoji: row.emoji || '🧭',
      title: row.title,
      duration: row.duration || '1 ngày',
      total_distance_km: row.total_distance_km || 25,
      recommended_vehicle: row.recommended_vehicle || 'Xe máy / Ô tô',
      suitable_for: row.for_whom || 'Tất cả du khách',
      for_whom: row.for_whom || 'Tất cả du khách',
      budget_estimate: row.budget_range || row.budget || '200k - 500k/người',
      budget: row.budget_range || row.budget || '200k - 500k/người',
      budget_range: row.budget_range || row.budget || '200k - 500k/người',
      description: row.tagline || '',
      tagline: row.tagline || '',
      stops: Array.isArray(row.stops) ? row.stops : [],
      is_active: row.is_active ?? true,
      display_order: row.sort_order ?? 1,
      sort_order: row.sort_order ?? 1,
      created_at: row.created_at,
    }));

    return NextResponse.json({
      success: true,
      count: itineraries.length,
      itineraries,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching itineraries';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST: Add a new itinerary to Supabase
export async function POST(req: NextRequest) {
  try {
    const body: ItineraryPayload = await req.json();
    const {
      title,
      duration,
      stops,
      description,
      tagline,
      suitable_for,
      for_whom,
      budget_estimate,
      budget,
      budget_range,
      emoji,
    } = body;

    if (!title || !duration) {
      return NextResponse.json({ error: 'Tiêu đề và thời lượng tour là bắt buộc' }, { status: 400 });
    }

    const slug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const newRecord = {
      slug: `${slug}-${Date.now().toString(36)}`,
      emoji: emoji || '🧭',
      title: title.trim(),
      tagline: (tagline || description || '').trim(),
      for_whom: (for_whom || suitable_for || 'Tất cả du khách').trim(),
      duration: duration.trim(),
      budget_range: (budget_range || budget || budget_estimate || '300.000đ - 600.000đ/người').trim(),
      stops: Array.isArray(stops) ? stops : [],
      is_active: true,
      sort_order: 99,
    };

    const { data, error } = await supabase
      .from('preset_itineraries')
      .insert(newRecord)
      .select()
      .single();

    if (error) {
      console.error('[AdminItineraries POST Error]:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Audit log
    void Promise.resolve(
      supabase.from('audit_logs').insert({
        action: 'CREATE_ITINERARY',
        target_table: 'preset_itineraries',
        target_id: data.id,
        changes: newRecord,
        created_at: new Date().toISOString(),
      })
    ).catch(() => {});

    const mapped = {
      itinerary_id: data.id,
      ...data,
      suitable_for: data.for_whom,
      budget_estimate: data.budget_range,
      description: data.tagline,
    };

    return NextResponse.json({ success: true, itinerary: mapped });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error creating itinerary';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// PATCH: Update existing itinerary in Supabase
export async function PATCH(req: NextRequest) {
  try {
    const body: ItineraryPayload = await req.json();
    const {
      id,
      itinerary_id,
      title,
      duration,
      stops,
      description,
      tagline,
      suitable_for,
      for_whom,
      budget_estimate,
      budget,
      budget_range,
      emoji,
      is_active,
      display_order,
      sort_order,
    } = body;

    const targetId = id || itinerary_id;
    if (!targetId) {
      return NextResponse.json({ error: 'Thiếu mã itinerary_id' }, { status: 400 });
    }

    const updatePayload: Record<string, any> = {};
    if (title !== undefined) updatePayload.title = title.trim();
    if (duration !== undefined) updatePayload.duration = duration.trim();
    if (tagline !== undefined || description !== undefined) updatePayload.tagline = (tagline || description || '').trim();
    if (for_whom !== undefined || suitable_for !== undefined) updatePayload.for_whom = (for_whom || suitable_for || '').trim();
    if (budget_range !== undefined || budget !== undefined || budget_estimate !== undefined) {
      updatePayload.budget_range = (budget_range || budget || budget_estimate || '').trim();
    }
    if (emoji !== undefined) updatePayload.emoji = emoji.trim();
    if (stops !== undefined) updatePayload.stops = Array.isArray(stops) ? stops : [];
    if (is_active !== undefined) updatePayload.is_active = Boolean(is_active);
    if (sort_order !== undefined || display_order !== undefined) {
      updatePayload.sort_order = Number(sort_order ?? display_order);
    }

    const { data, error } = await supabase
      .from('preset_itineraries')
      .update(updatePayload)
      .or(`id.eq.${targetId},slug.eq.${targetId}`)
      .select()
      .single();

    if (error) {
      console.error('[AdminItineraries PATCH Error]:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Audit log
    void Promise.resolve(
      supabase.from('audit_logs').insert({
        action: 'UPDATE_ITINERARY',
        target_table: 'preset_itineraries',
        target_id: targetId,
        changes: updatePayload,
        created_at: new Date().toISOString(),
      })
    ).catch(() => {});

    const mapped = {
      itinerary_id: data.id,
      ...data,
      suitable_for: data.for_whom,
      budget_estimate: data.budget_range,
      description: data.tagline,
    };

    return NextResponse.json({ success: true, itinerary: mapped });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error updating itinerary';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE: Remove itinerary in Supabase
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const itinerary_id = searchParams.get('id');

    if (!itinerary_id) {
      return NextResponse.json({ error: 'Thiếu mã itinerary_id' }, { status: 400 });
    }

    const { error } = await supabase
      .from('preset_itineraries')
      .delete()
      .or(`id.eq.${itinerary_id},slug.eq.${itinerary_id}`);

    if (error) {
      console.error('[AdminItineraries DELETE Error]:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    void Promise.resolve(
      supabase.from('audit_logs').insert({
        action: 'DELETE_ITINERARY',
        target_table: 'preset_itineraries',
        target_id: itinerary_id,
        changes: { deleted_at: new Date().toISOString() },
        created_at: new Date().toISOString(),
      })
    ).catch(() => {});

    return NextResponse.json({ success: true, deleted_id: itinerary_id });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error deleting itinerary';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
