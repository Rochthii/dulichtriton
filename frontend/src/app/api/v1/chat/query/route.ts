import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://127.0.0.1:8000';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.query || typeof body.query !== 'string' || !body.query.trim()) {
      return NextResponse.json(
        { error: 'Missing or invalid query parameter' },
        { status: 400 }
      );
    }

    const payload = {
      query: body.query.trim(),
      session_id: body.session_id || 'anonymous',
    };

    const backendRes = await fetch(`${BACKEND_API_URL}/api/v1/chat/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      // 10 second timeout for RAG response
      signal: AbortSignal.timeout(10000),
    });

    if (!backendRes.ok) {
      const errorText = await backendRes.text();
      console.error(`[ChatProxy] Backend error ${backendRes.status}: ${errorText}`);
      return NextResponse.json(
        {
          error: 'Backend service error',
          detail: `HTTP ${backendRes.status}`,
          text_response: 'Xin lỗi, dịch vụ AI đang bận. Vui lòng thử lại sau ít giây!',
          ui_components: [],
          videos: [],
          suggestions: ['Thử lại câu hỏi', 'Gợi ý tour 2N1Đ', 'Địa điểm nổi bật Tri Tôn'],
        },
        { status: 502 }
      );
    }

    const data = await backendRes.json();
    return NextResponse.json(data);

  } catch (error: unknown) {
    const isTimeout = error instanceof Error && error.name === 'TimeoutError';
    console.error('[ChatProxy] Error:', error);

    return NextResponse.json(
      {
        error: isTimeout ? 'Backend timeout' : 'Internal proxy error',
        text_response: isTimeout
          ? 'Hệ thống AI mất kết nối với backend. Vui lòng đảm bảo server FastAPI đang chạy!'
          : 'Đã xảy ra lỗi kết nối. Vui lòng thử lại!',
        ui_components: [],
        videos: [],
        suggestions: ['Khởi động lại hệ thống', 'Thử câu hỏi khác'],
      },
      { status: 503 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'Tri Ton Tourism AI — Chat Proxy',
    backend: BACKEND_API_URL,
    status: 'ready',
  });
}
