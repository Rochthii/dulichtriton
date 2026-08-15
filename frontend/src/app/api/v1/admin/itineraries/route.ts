import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://knmlbwsmfljlabhvqfid.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
const supabase = createClient(supabaseUrl, supabaseKey);

const ITIN_FILE = path.join(process.cwd(), 'data', 'tri_ton_master_itineraries_and_rules.json');

function readMasterItineraries() {
  try {
    if (fs.existsSync(ITIN_FILE)) {
      const content = fs.readFileSync(ITIN_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading itineraries file:', err);
  }
  return { metadata: {}, master_itineraries: [] };
}

function writeMasterItineraries(data: Record<string, unknown>) {
  try {
    fs.writeFileSync(ITIN_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing itineraries file:', err);
    return false;
  }
}

// GET: Fetch all itineraries
export async function GET() {
  try {
    const data = readMasterItineraries();
    const list = data.master_itineraries || [];
    return NextResponse.json({
      success: true,
      count: list.length,
      itineraries: list,
      metadata: data.metadata || {},
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching itineraries';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST: Add a new itinerary
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, duration, total_distance_km, recommended_vehicle, stops, description, suitable_for, budget_estimate } = body;

    if (!title || !duration) {
      return NextResponse.json({ error: 'Tiêu đề và thời lượng tour là bắt buộc' }, { status: 400 });
    }

    const data = readMasterItineraries();
    const list = data.master_itineraries || [];

    const newId = `tour-${Date.now().toString(36)}`;
    const newTour = {
      itinerary_id: newId,
      title: title.trim(),
      duration: duration.trim(),
      total_distance_km: Number(total_distance_km) || 30,
      recommended_vehicle: recommended_vehicle || 'Xe máy / Ô tô',
      suitable_for: suitable_for || 'Tất cả du khách',
      budget_estimate: budget_estimate || '300.000đ - 600.000đ/người',
      description: description || '',
      stops: Array.isArray(stops) ? stops : [],
      created_at: new Date().toISOString(),
    };

    list.unshift(newTour);
    data.master_itineraries = list;
    writeMasterItineraries(data);

    // Audit log
    void Promise.resolve(
      supabase.from('audit_logs').insert({
        action: 'CREATE_ITINERARY',
        target_table: 'itineraries',
        changes: newTour,
        created_at: new Date().toISOString(),
      })
    ).catch(() => {});

    return NextResponse.json({ success: true, itinerary: newTour });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error creating itinerary';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// PATCH: Update existing itinerary
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { itinerary_id, title, duration, total_distance_km, recommended_vehicle, stops, description, suitable_for, budget_estimate } = body;

    if (!itinerary_id) {
      return NextResponse.json({ error: 'Thiếu mã itinerary_id' }, { status: 400 });
    }

    const data = readMasterItineraries();
    const list = data.master_itineraries || [];
    const index = list.findIndex((it: { itinerary_id: string }) => it.itinerary_id === itinerary_id);

    if (index === -1) {
      return NextResponse.json({ error: 'Không tìm thấy lịch trình cần sửa' }, { status: 404 });
    }

    const existing = list[index];
    const updated = {
      ...existing,
      ...(title !== undefined && { title: title.trim() }),
      ...(duration !== undefined && { duration: duration.trim() }),
      ...(total_distance_km !== undefined && { total_distance_km: Number(total_distance_km) }),
      ...(recommended_vehicle !== undefined && { recommended_vehicle: recommended_vehicle.trim() }),
      ...(suitable_for !== undefined && { suitable_for: suitable_for.trim() }),
      ...(budget_estimate !== undefined && { budget_estimate: budget_estimate.trim() }),
      ...(description !== undefined && { description: description.trim() }),
      ...(stops !== undefined && { stops }),
      updated_at: new Date().toISOString(),
    };

    list[index] = updated;
    data.master_itineraries = list;
    writeMasterItineraries(data);

    // Audit log
    void Promise.resolve(
      supabase.from('audit_logs').insert({
        action: 'UPDATE_ITINERARY',
        target_table: 'itineraries',
        changes: updated,
        created_at: new Date().toISOString(),
      })
    ).catch(() => {});

    return NextResponse.json({ success: true, itinerary: updated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error updating itinerary';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE: Remove itinerary
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const itinerary_id = searchParams.get('id');

    if (!itinerary_id) {
      return NextResponse.json({ error: 'Thiếu mã itinerary_id' }, { status: 400 });
    }

    const data = readMasterItineraries();
    const list = data.master_itineraries || [];
    const filtered = list.filter((it: { itinerary_id: string }) => it.itinerary_id !== itinerary_id);

    data.master_itineraries = filtered;
    writeMasterItineraries(data);

    void Promise.resolve(
      supabase.from('audit_logs').insert({
        action: 'DELETE_ITINERARY',
        target_table: 'itineraries',
        changes: { deleted_id: itinerary_id },
        created_at: new Date().toISOString(),
      })
    ).catch(() => {});

    return NextResponse.json({ success: true, deleted_id: itinerary_id });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error deleting itinerary';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
