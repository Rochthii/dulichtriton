import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    let query = supabase
      .from("feedbacks")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    if (category && category !== "all") {
      query = query.eq("category", category);
    }

    const queryPromise = Promise.resolve(query);
    const timeoutPromise = new Promise<{ data: null; count: 0; error: Error }>((resolve) =>
      setTimeout(() => resolve({ data: null, count: 0, error: new Error("Supabase timeout") }), 2500)
    );

    const { data, count } = await Promise.race([queryPromise, timeoutPromise]);

    return NextResponse.json({
      feedbacks: data || [],
      total: count || 0,
      limit,
      offset,
    });
  } catch (err: any) {
    return NextResponse.json({ feedbacks: [], total: 0, limit: 50, offset: 0 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, admin_notes } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing feedback id" }, { status: 400 });
    }

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (status) updatePayload.status = status;
    if (admin_notes !== undefined) {
      updatePayload.metadata = {
        admin_notes,
        reviewed_at: new Date().toISOString(),
      };
    }

    const { data, error } = await supabase
      .from("feedbacks")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, feedback: data });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
