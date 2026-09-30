import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

interface FeedbackPayload {
  name: string;
  email: string;
  phone?: string;
  category?: string;
  subject?: string;
  message: string;
  rating?: number;
  metadata?: Record<string, any>;
}

export async function POST(req: NextRequest) {
  try {
    const body: FeedbackPayload = await req.json();

    // 1. Validate mandatory fields
    const name = (body.name || "").trim().normalize("NFC");
    const email = (body.email || "").trim().toLowerCase();
    const phone = (body.phone || "").trim();
    const category = (body.category || "general").trim();
    const subject = (body.subject || "").trim().normalize("NFC");
    const message = (body.message || "").trim().normalize("NFC");
    const rating = typeof body.rating === "number" && body.rating >= 1 && body.rating <= 5 ? body.rating : 5;

    if (!name || name.length < 2) {
      return NextResponse.json(
        { error: "Vui lòng nhập họ và tên hợp lệ (ít nhất 2 ký tự)." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Vui lòng nhập địa chỉ email hợp lệ để nhận phản hồi từ ban quản trị." },
        { status: 400 }
      );
    }

    if (!message || message.length < 10) {
      return NextResponse.json(
        { error: "Nội dung góp ý cần có ít nhất 10 ký tự để chúng tôi hiểu rõ ý kiến của bạn." },
        { status: 400 }
      );
    }

    // 2. Extract client metadata
    const userAgent = req.headers.get("user-agent") || "unknown";
    const forwardedFor = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const ip = forwardedFor.split(",")[0].trim();

    const metadata = {
      ...(body.metadata || {}),
      user_agent: userAgent,
      ip: ip,
      submitted_at: new Date().toISOString(),
    };

    // 3. Insert into Supabase feedbacks table
    const { data, error } = await supabase
      .from("feedbacks")
      .insert({
        name,
        email,
        phone: phone || null,
        category,
        subject: subject || null,
        message,
        rating,
        status: "pending",
        metadata,
      })
      .select("id, created_at")
      .single();

    if (error) {
      console.error("Supabase insert feedback error:", error);
      return NextResponse.json(
        { error: "Lỗi lưu trữ dữ liệu vào hệ thống: " + error.message },
        { status: 500 }
      );
    }

    // 4. Audit Log
    try {
      await supabase.from("audit_logs").insert({
        user_email: email,
        action: "FEEDBACK_SUBMITTED",
        details: {
          feedback_id: data.id,
          name,
          category,
          rating,
          ip,
        },
        ip_address: ip,
      });
    } catch (auditErr) {
      console.warn("Feedback audit log error:", auditErr);
    }

    return NextResponse.json({
      success: true,
      id: data.id,
      created_at: data.created_at,
      message: "Cảm ơn bạn! Ý kiến đóng góp của bạn đã được ghi nhận vào hệ thống thành công.",
    });
  } catch (err: any) {
    console.error("POST /api/v1/feedback error:", err);
    return NextResponse.json(
      { error: "Lỗi máy chủ khi tiếp nhận góp ý: " + (err?.message || "Unknown error") },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { count, error } = await supabase
      .from("feedbacks")
      .select("*", { count: "exact", head: true });

    if (error) {
      return NextResponse.json({ total: 0 });
    }

    return NextResponse.json({
      total: count || 0,
      status: "active",
    });
  } catch {
    return NextResponse.json({ total: 0 });
  }
}
