import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { clearServerCache } from '@/lib/serverCache';
import { invalidateSinglePlaceCache } from '@/lib/dataCache';
import { verifyAdminSession, AdminPrincipal } from '@/lib/adminSessionGuard';
import { buildSafeOrIlikeFilter } from '@/lib/postgrestFilterSanitizer';
import { resolveVerificationMetadata } from '@/lib/placeVerificationGuard';

export const dynamic = 'force-dynamic';

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return null;
  return createClient(supabaseUrl, serviceRoleKey);
}

function logAudit(
  action: string,
  resourceId: string,
  details: Record<string, unknown>,
  principal?: AdminPrincipal,
) {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  void Promise.resolve(
    supabase.from('audit_logs').insert({
      user_name: principal ? (principal.fullName || principal.email) : 'Admin_Manager',
      user_role: principal?.role || 'ADMIN',
      action,
      resource_type: 'places',
      resource_id: resourceId,
      details,
    })
  ).catch(e => console.warn('[AuditLog] Error:', e));
}

// Helper to generate Gemini Vector Embedding (768d)
async function generateEmbedding(text: string): Promise<number[] | null> {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_2;
  if (!geminiKey) return null;
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${geminiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'models/gemini-embedding-001',
        content: { parts: [{ text: text.slice(0, 2000) }] },
        outputDimensionality: 768,
      }),
    });
    const data = await res.json();
    return data?.embedding?.values || null;
  } catch (err) {
    console.warn('[VectorEmbedding] Warning:', err);
    return null;
  }
}

// GET: Fetch places with commune, category & keyword search (Requires Admin Session)
export async function GET(req: NextRequest) {
  const auth = await verifyAdminSession(req);
  if (!auth.authenticated) return auth.response;

  const supabase = getSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Database service unavailable' }, { status: 503 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const commune = searchParams.get('commune');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    let query = supabase
      .from('places')
      .select('id, slug, name, commune, category, tourism_category, rating, image_url, photos, checkin_spots, description, detailed_story, phone, open_late, night_hours, golden_time_windows, price_level, is_hot, is_active, video_url, latitude, longitude, address, opening_hours, created_at, updated_at')
      .order('name', { ascending: true });

    if (commune && commune !== 'ALL') {
      query = query.ilike('commune', `%${commune}%`);
    }

    if (category && category !== 'ALL') {
      const catFilter = buildSafeOrIlikeFilter(['category', 'tourism_category'], category);
      if (catFilter) {
        query = query.or(catFilter);
      }
    }

    if (search && search.trim()) {
      const searchFilter = buildSafeOrIlikeFilter(['name', 'commune', 'description'], search);
      if (searchFilter) {
        query = query.or(searchFilter);
      }
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

// Helpers to normalize Postgres Array and JSONB fields
function normalizeGoldenTimeWindows(val: unknown): string[] | null {
  if (Array.isArray(val)) return val.map(String).filter(Boolean);
  if (typeof val === 'string' && val.trim()) {
    return val.split(/[•,;]+/).map(s => s.trim()).filter(Boolean);
  }
  return null;
}

function normalizePhotos(photos: unknown, imageUrl?: string): string[] {
  if (Array.isArray(photos) && photos.length > 0) {
    return photos.map(String).filter(Boolean);
  }
  if (typeof photos === 'string' && photos.trim()) {
    try {
      const parsed = JSON.parse(photos);
      if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
    } catch {
      return [photos.trim()];
    }
  }
  return imageUrl ? [imageUrl] : [];
}

function normalizeCheckinSpots(spots: unknown): any[] {
  if (Array.isArray(spots)) return spots;
  if (typeof spots === 'string' && spots.trim()) {
    try {
      const parsed = JSON.parse(spots);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return [];
    }
  }
  return [];
}

// POST: Create a new POI record (Requires Admin Session)
export async function POST(req: NextRequest) {
  const auth = await verifyAdminSession(req);
  if (!auth.authenticated) return auth.response;

  if (process.env.ADMIN_MUTATIONS_ENABLED === 'false') {
    return NextResponse.json({ error: 'Admin mutations are temporarily disabled' }, { status: 503 });
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Database service unavailable' }, { status: 503 });
  }

  try {
    const body = await req.json();
    const { 
      name, commune, category, tourism_category, rating, image_url, photos, checkin_spots,
      description, detailed_story, phone, open_late, night_hours,
      golden_time_windows, price_level, video_url, is_hot, latitude, longitude, address,
      is_verified, verification_status, verified_at
    } = body;

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

    const resolvedPhotos = normalizePhotos(photos, image_url);
    const resolvedCover = (image_url && typeof image_url === 'string' && image_url.trim())
      ? image_url.trim()
      : (resolvedPhotos[0] || null);

    const vMeta = resolveVerificationMetadata({
      is_verified,
      verification_status,
      verified_at,
    });

    const newRecord: Record<string, unknown> = {
      id: `${slug}-${Date.now().toString(36)}`,
      slug: `${slug}-${Date.now().toString(36)}`,
      name: name.trim(),
      commune: commune.trim(),
      district: 'Tri Tôn',
      province: 'An Giang',
      category: category || 'general',
      tourism_category: tourism_category || 'Địa Điểm Tham Quan',
      rating: Number(rating) || 4.8,
      image_url: resolvedCover,
      photos: resolvedPhotos,
      checkin_spots: normalizeCheckinSpots(checkin_spots),
      description: description || 'Thông tin địa điểm du lịch mới tại Tri Tôn',
      detailed_story: detailed_story || description || '',
      phone: phone || null,
      open_late: Boolean(open_late),
      night_hours: night_hours || null,
      golden_time_windows: normalizeGoldenTimeWindows(golden_time_windows),
      price_level: price_level || 'Bình dân',
      video_url: video_url || '',
      latitude: latitude !== undefined && latitude !== null && latitude !== '' ? Number(latitude) : 10.42,
      longitude: longitude !== undefined && longitude !== null && longitude !== '' ? Number(longitude) : 105.01,
      address: address || `${commune.trim()}, Tri Tôn, An Giang`,
      is_hot: Boolean(is_hot),
      is_active: true,
      is_verified: vMeta.is_verified,
      verification_status: vMeta.verification_status,
      verified_at: vMeta.verified_at,
    };

    // Generate Vector Embedding automatically
    const textToEmbed = `${newRecord.name} - ${newRecord.commune} - ${newRecord.tourism_category}. ${newRecord.description}\n${newRecord.detailed_story}`;
    const embedding = await generateEmbedding(textToEmbed);
    if (embedding) {
      newRecord.embedding = embedding;
    }

    const { data, error } = await supabase
      .from('places')
      .insert(newRecord)
      .select()
      .single();

    if (error) {
      console.error('[AdminPlaces POST Error]:', error);
      throw error;
    }

    logAudit('CREATE_POI', data.id, newRecord, auth.principal);

    // Surgical On-Demand Invalidation (Only for this POI and its category)
    clearServerCache();
    invalidateSinglePlaceCache(data.slug || data.id, data.category || data.tourism_category);

    return NextResponse.json({ success: true, place: data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error creating POI';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// PATCH: Update an existing POI record (Requires Admin Session)
export async function PATCH(req: NextRequest) {
  const auth = await verifyAdminSession(req);
  if (!auth.authenticated) return auth.response;

  if (process.env.ADMIN_MUTATIONS_ENABLED === 'false') {
    return NextResponse.json({ error: 'Admin mutations are temporarily disabled' }, { status: 503 });
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Database service unavailable' }, { status: 503 });
  }

  try {
    const body = await req.json();
    const { 
      id, is_hot, is_active, name, commune, category, tourism_category, rating, 
      image_url, photos, checkin_spots, description, detailed_story, phone, open_late, night_hours,
      golden_time_windows, price_level, video_url, latitude, longitude, address,
      is_verified, verification_status, verified_at
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing POI ID' }, { status: 400 });
    }

    const updatePayload: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (is_hot !== undefined) updatePayload.is_hot = Boolean(is_hot);
    if (is_active !== undefined) updatePayload.is_active = Boolean(is_active);
    if (name !== undefined) updatePayload.name = String(name).trim();
    if (commune !== undefined) updatePayload.commune = String(commune).trim();
    if (category !== undefined) updatePayload.category = category;
    if (tourism_category !== undefined) updatePayload.tourism_category = tourism_category;
    if (rating !== undefined && rating !== null && rating !== '') updatePayload.rating = Number(rating);
    if (image_url !== undefined) updatePayload.image_url = image_url;
    if (photos !== undefined) updatePayload.photos = normalizePhotos(photos, image_url);
    if (checkin_spots !== undefined) updatePayload.checkin_spots = normalizeCheckinSpots(checkin_spots);
    if (description !== undefined) updatePayload.description = description;
    if (detailed_story !== undefined) updatePayload.detailed_story = detailed_story;
    if (phone !== undefined) updatePayload.phone = phone;
    if (open_late !== undefined) updatePayload.open_late = Boolean(open_late);
    if (night_hours !== undefined) updatePayload.night_hours = night_hours;
    if (golden_time_windows !== undefined) updatePayload.golden_time_windows = normalizeGoldenTimeWindows(golden_time_windows);
    if (price_level !== undefined) updatePayload.price_level = price_level;
    if (video_url !== undefined) updatePayload.video_url = video_url;
    if (latitude !== undefined && latitude !== null && latitude !== '') updatePayload.latitude = Number(latitude);
    if (longitude !== undefined && longitude !== null && longitude !== '') updatePayload.longitude = Number(longitude);
    if (address !== undefined) updatePayload.address = address;

    if (is_verified !== undefined || verification_status !== undefined) {
      const vMeta = resolveVerificationMetadata({
        is_verified,
        verification_status,
        verified_at,
      });
      updatePayload.is_verified = vMeta.is_verified;
      updatePayload.verification_status = vMeta.verification_status;
      updatePayload.verified_at = vMeta.verified_at;
    }

    // Regenerate Vector Embedding if text changed
    if (name || description || detailed_story || commune) {
      const textToEmbed = `${name || ''} - ${commune || ''} - ${tourism_category || category || ''}. ${description || ''}\n${detailed_story || ''}`;
      const embedding = await generateEmbedding(textToEmbed);
      if (embedding) {
        updatePayload.embedding = embedding;
      }
    }

    const { data, error } = await supabase
      .from('places')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[AdminPlaces PATCH Error]:', error);
      return NextResponse.json({ error: 'Database update error: ' + error.message }, { status: 400 });
    }

    logAudit('UPDATE_POI', id, updatePayload, auth.principal);

    // Surgical On-Demand Invalidation (Only for this POI and its category)
    clearServerCache();
    invalidateSinglePlaceCache(data.slug || data.id, data.category || data.tourism_category);

    return NextResponse.json({ success: true, place: data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error updating POI';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE: Remove a POI record (Requires Admin Session)
export async function DELETE(req: NextRequest) {
  const auth = await verifyAdminSession(req);
  if (!auth.authenticated) return auth.response;

  if (process.env.ADMIN_MUTATIONS_ENABLED === 'false') {
    return NextResponse.json({ error: 'Admin mutations are temporarily disabled' }, { status: 503 });
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Database service unavailable' }, { status: 503 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing POI ID' }, { status: 400 });
    }

    const { error } = await supabase.from('places').update({ is_active: false }).eq('id', id);
    if (error) {
      console.error('[AdminPlaces DELETE Error]:', error);
      throw error;
    }

    logAudit('DEACTIVATE_POI', id, { deactivated_at: new Date().toISOString() }, auth.principal);

    // Surgical On-Demand Invalidation (Only for the deactivated POI)
    clearServerCache();
    invalidateSinglePlaceCache(id);

    return NextResponse.json({ success: true, id });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error deleting POI';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
