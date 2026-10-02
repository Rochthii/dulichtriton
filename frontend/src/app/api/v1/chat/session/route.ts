import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/serverSupabase';
import { 
  executeChatSessionDeletion,
  extractSessionOwnershipToken 
} from '@/lib/chatSessionDeletionService';
import { SESSION_TOKEN_COOKIE } from '@/lib/chatSessionOwnership';

/**
 * DELETE /api/v1/chat/session
 * Endpoint xóa phiên hội thoại dành cho chủ sở hữu hợp pháp (Right to Erasure / Immediate Erasure).
 * Yêu cầu mã phiên (sessionId) và token sở hữu HMAC-SHA256 (qua Header, Cookie hoặc Body).
 */
export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    let sessionId = url.searchParams.get('sessionId') || url.searchParams.get('session_id') || '';
    let body: any = null;

    // Đọc JSON body nếu client gửi qua body
    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      try {
        body = await req.json();
        if (!sessionId && body) {
          sessionId = body.sessionId || body.session_id || '';
        }
      } catch {
        // Body không phải JSON hợp lệ hoặc rỗng, tiếp tục với query params
      }
    }

    // Trích xuất ownership token từ Header, Cookie hoặc Body
    const candidateToken = extractSessionOwnershipToken(req, body);

    // Khởi tạo Supabase Server Client (service_role)
    const supabase = getSupabaseServerClient();

    // Thực thi xóa phiên hội thoại
    const result = await executeChatSessionDeletion({
      sessionId,
      candidateToken,
      supabaseClient: supabase
    });

    const response = NextResponse.json(result, { status: result.status });

    // Nếu xóa thành công, dọn dẹp cookie phiên trên trình duyệt
    if (result.success) {
      response.cookies.set(SESSION_TOKEN_COOKIE, '', {
        path: '/',
        maxAge: 0,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
    }

    return response;
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        success: false,
        deleted: false,
        status: 500,
        error: 'INTERNAL_SERVER_ERROR',
        message: `Lỗi máy chủ nội bộ khi xử lý xóa phiên: ${errorMsg}`
      },
      { status: 500 }
    );
  }
}
