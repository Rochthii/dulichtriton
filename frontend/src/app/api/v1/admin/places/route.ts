import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://knmlbwsmfljlabhvqfid.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

function logAudit(action: string, resourceId: string, details: Record<string, unknown>) {
  void Promise.resolve(
    supabase.from('audit_logs').insert({
      user_name: 'Admin_Manager',
      user_role: 'ADMIN',
      action,
      resource_type: 'places',
      resource_id: resourceId,
      details,
    })
  ).catch(e => console.warn('[AuditLog] Error:', e));
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const commune = searchParams.get('commune');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    let query = supabase
      .from('places')
      .select('id, slug, name, commune, category, rating, image_url, description, golden_time_windows, price_range, is_hot, created_at')
      .order('name', { ascending: true });

    if (commune && commune !== 'ALL') {
      query = query.ilike('commune', `%${commune}%`);
    }

    if (category && category !== 'ALL') {
      query = query.ilike('category', `%${category}%`);
    }

    if (search && search.trim()) {
      query = query.or(`name.ilike.%${search.trim()}%,commune.ilike.%${search.trim()}%,description.ilike.%${search.trim()}%`);
    }

    const { data: places, error } = await query;
    if (error) {
      console.error('[AdminPlaces GET Error]:', error);
      throw error;
    }

    return NextResponse.json({ success: true, count: places?.length || 0, places: places || [] });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching admin places';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, is_hot, name, commune, category, rating, description, golden_time_windows } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing POI ID' }, { status: 400 });
    }

    const updatePayload: Record<string, unknown> = {};
    if (is_hot !== undefined) updatePayload.is_hot = is_hot;
    if (name !== undefined) updatePayload.name = name;
    if (commune !== undefined) updatePayload.commune = commune;
    if (category !== undefined) updatePayload.category = category;
    if (rating !== undefined) updatePayload.rating = rating;
    if (description !== undefined) updatePayload.description = description;
    if (golden_time_windows !== undefined) updatePayload.golden_time_windows = golden_time_windows;

    const { data, error } = await supabase
      .from('places')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[AdminPlaces PATCH Error]:', error);
      throw error;
    }

    logAudit('UPDATE_POI', id, updatePayload);

    return NextResponse.json({ success: true, place: data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error updating POI';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
