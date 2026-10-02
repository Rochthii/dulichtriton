/**
 * @file chatSessionDeletionService.ts
 * @description Dịch vụ thực thi xóa phiên trò chuyện theo yêu cầu của chủ sở hữu (Chat Session Owner Deletion Service).
 * Tuân thủ quyền được lãng quên / xóa bỏ dữ liệu tức thì (Right to Erasure / Immediate Erasure)
 * theo Nghị định 13/2023/NĐ-CP và nhiệm vụ P05-005.
 * 
 * Phê duyệt: Chăm Rốch Thi (Lead Technical Architect)
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { validateSessionId } from '@/lib/sessionIdentifierContract';
import { 
  verifySessionOwnershipToken, 
  extractSessionOwnershipToken,
  createSessionOwnershipToken 
} from '@/lib/chatSessionOwnership';

export interface ChatSessionDeletionOptions {
  sessionId: string;
  candidateToken?: string | null;
  supabaseClient?: SupabaseClient | null;
}

export interface ChatSessionDeletionResult {
  success: boolean;
  deleted: boolean;
  status: number;
  sessionId?: string;
  error?: string;
  message?: string;
}

/**
 * Thực thi xóa phiên trò chuyện cho chủ sở hữu hợp pháp.
 * Kiểm thực quyền sở hữu mật mã (HMAC-SHA256) trước khi cấp phép xóa cơ sở dữ liệu.
 * 
 * @param options Tùy chọn xóa phiên bao gồm sessionId, candidateToken và supabaseClient
 * @returns Kết quả xóa chi tiết (status code, thông báo, mã lỗi)
 */
export async function executeChatSessionDeletion(
  options: ChatSessionDeletionOptions
): Promise<ChatSessionDeletionResult> {
  const { sessionId, candidateToken, supabaseClient } = options;

  // 1. Kiểm tra định dạng Session ID (Strict UUID v4 RFC 4122)
  const validation = validateSessionId(sessionId);
  if (!validation.isValid || !validation.sessionId) {
    return {
      success: false,
      deleted: false,
      status: 400,
      error: validation.code || 'INVALID_SESSION_ID',
      message: validation.error || 'Mã định danh phiên hội thoại (session_id) không hợp lệ.'
    };
  }

  const cleanSessionId = validation.sessionId;

  // 2. Kiểm thực quyền sở hữu mật mã (Fail-Closed Gate)
  const isOwner = verifySessionOwnershipToken(cleanSessionId, candidateToken);
  if (!isOwner) {
    return {
      success: false,
      deleted: false,
      status: 403,
      sessionId: cleanSessionId,
      error: 'INVALID_SESSION_OWNERSHIP',
      message: 'Từ chối quyền xóa phiên hội thoại: Token sở hữu không hợp lệ hoặc không khớp với session_id.'
    };
  }

  // 3. Kiểm tra Supabase client máy chủ
  if (!supabaseClient) {
    return {
      success: false,
      deleted: false,
      status: 500,
      sessionId: cleanSessionId,
      error: 'SERVER_CONFIGURATION_ERROR',
      message: 'Supabase server client không khả dụng hoặc chưa được cấu hình service_role.'
    };
  }

  // 4. Thực thi thao tác xóa thực tế trên database (Production Real Delete)
  try {
    const { data, error } = await supabaseClient
      .from('chat_sessions')
      .delete()
      .eq('session_id', cleanSessionId)
      .select('session_id');

    if (error) {
      return {
        success: false,
        deleted: false,
        status: 500,
        sessionId: cleanSessionId,
        error: error.message,
        message: `Lỗi cơ sở dữ liệu khi xóa phiên: ${error.message}`
      };
    }

    const actuallyDeleted = Boolean(data && data.length > 0);

    return {
      success: true,
      deleted: true,
      status: 200,
      sessionId: cleanSessionId,
      message: actuallyDeleted
        ? 'Đã xóa toàn bộ dữ liệu phiên hội thoại thành công theo quyền được lãng quên (Right to Erasure).'
        : 'Phiên hội thoại đã được xóa hoặc không còn tồn tại trong hệ thống.'
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      deleted: false,
      status: 500,
      sessionId: cleanSessionId,
      error: errorMsg,
      message: `Ngoại lệ khi thực thi xóa phiên: ${errorMsg}`
    };
  }
}

export {
  validateSessionId,
  verifySessionOwnershipToken,
  extractSessionOwnershipToken,
  createSessionOwnershipToken
};
