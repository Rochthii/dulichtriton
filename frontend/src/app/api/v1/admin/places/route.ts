import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://knmlbwsmfljlabhvqfid.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
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

// GET: Fetch places with commune, category & keyword search
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const commune = searchParams.get('commune');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    let query = supabase
      .from('places')
      .select('id, slug, name, commune, category, rating, image_url, description, golden_time_windows, price_level, is_hot, video_url, latitude, longitude, opening_hours, created_at')
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

// POST: Create a new POI record
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, commune, category, rating, image_url, description, golden_time_windows, video_url, is_hot } = body;

    if (!name || !commune) {
      return NextResponse.json({ error: 'Tên địa điểm và Xã/Thị trấn là bắt buộc' }, { status: 400 });
    }

    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const newRecord = {
      slug: `${slug}-${Date.now().toString(36)}`,
      name: name.trim(),
      commune: commune.trim(),
      category: category || 'Địa điểm nổi bật',
      rating: Number(rating) || 4.8,
      image_url: image_url || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop',
      description: description || 'Thông tin địa điểm du lịch mới tại Tri Tôn',
      golden_time_windows: golden_time_windows || '06:00-08:00 • 16:00-17:30',
      video_url: video_url || '',
      is_hot: Boolean(is_hot),
    };

    const { data, error } = await supabase
      .from('places')
      .insert(newRecord)
      .select()
      .single();

    if (error) {
      console.error('[AdminPlaces POST Error]:', error);
      throw error;
    }

    logAudit('CREATE_POI', data.id, newRecord);

    return NextResponse.json({ success: true, place: data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error creating POI';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// PATCH: Update an existing POI record
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, is_hot, name, commune, category, rating, image_url, description, golden_time_windows, video_url } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing POI ID' }, { status: 400 });
    }

    const updatePayload: Record<string, unknown> = {};
    if (is_hot !== undefined) updatePayload.is_hot = is_hot;
    if (name !== undefined) updatePayload.name = name;
    if (commune !== undefined) updatePayload.commune = commune;
    if (category !== undefined) updatePayload.category = category;
    if (rating !== undefined) updatePayload.rating = rating;
    if (image_url !== undefined) updatePayload.image_url = image_url;
    if (description !== undefined) updatePayload.description = description;
    if (golden_time_windows !== undefined) updatePayload.golden_time_windows = golden_time_windows;
    if (video_url !== undefined) updatePayload.video_url = video_url;

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

// DELETE: Remove a POI record
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing POI ID' }, { status: 400 });
    }

    const { error } = await supabase.from('places').delete().eq('id', id);
    if (error) {
      console.error('[AdminPlaces DELETE Error]:', error);
      throw error;
    }

    logAudit('DELETE_POI', id, { deleted_at: new Date().toISOString() });

    return NextResponse.json({ success: true, id });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error deleting POI';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
