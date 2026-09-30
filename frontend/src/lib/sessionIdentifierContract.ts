/**
 * DU LỊCH TRI TÔN AI — CHAT SESSION IDENTIFIER CONTRACT
 * Triển khai chuẩn hóa Session ID theo CHAT-SESSION-ID-CONTRACT-V1 & Task P04-002.
 * Tuân thủ chuẩn UUID v4 (RFC 4122), loại bỏ hoàn toàn Math.random().
 */

import { randomUUID } from 'node:crypto';

/**
 * Biểu thức chính quy bất biến xác thực UUID v4 (RFC 4122).
 * Vị trí ký tự thứ 15 bắt buộc là '4' (version 4).
 * Vị trí ký tự thứ 20 bắt buộc là một trong các ký tự '8', '9', 'a', 'b' (RFC 4122 variant).
 */
export const SESSION_ID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface SessionIdValidationResult {
  isValid: boolean;
  sessionId?: string;
  error?: string;
  code?: 'INVALID_SESSION_ID' | 'MISSING_SESSION_ID';
}

/**
 * Kiểm tra một giá trị đầu vào có phải là UUID v4 hợp lệ hay không.
 */
export function isValidSessionId(id: unknown): boolean {
  if (typeof id !== 'string') return false;
  const trimmed = id.trim();
  if (trimmed.length !== 36) return false;
  return SESSION_ID_REGEX.test(trimmed);
}

/**
 * Sinh mới một Session ID chuẩn UUID v4 an toàn mật mã.
 * Sử dụng native crypto.randomUUID() tương thích cả Web Crypto API và Node.js.
 */
export function generateSessionId(): string {
  if (typeof globalThis.crypto !== 'undefined' && typeof globalThis.crypto.randomUUID === 'function') {
    return globalThis.crypto.randomUUID().toLowerCase();
  }
  return randomUUID().toLowerCase();
}

/**
 * Chuẩn hóa Session ID:
 * - Nếu đã là UUID v4 hợp lệ: Trả về dạng chữ thường (lowercase).
 * - Nếu không hợp lệ hoặc thiếu: Tự động khởi tạo UUID v4 mới an toàn.
 */
export function sanitizeSessionId(id: unknown): string {
  if (isValidSessionId(id)) {
    return (id as string).trim().toLowerCase();
  }
  return generateSessionId();
}

/**
 * Thẩm định Session ID nghiêm ngặt (Strict Contract Validation) dùng cho API layer.
 */
export function validateSessionId(id: unknown): SessionIdValidationResult {
  if (typeof id !== 'string' || !id.trim()) {
    return {
      isValid: false,
      error: 'Thiếu mã định danh phiên hội thoại (session_id).',
      code: 'MISSING_SESSION_ID',
    };
  }

  const trimmed = id.trim();
  if (!SESSION_ID_REGEX.test(trimmed)) {
    return {
      isValid: false,
      error: `Mã phiên hội thoại '${trimmed}' không hợp lệ. Hệ thống chỉ chấp nhận định dạng UUID v4 (RFC 4122).`,
      code: 'INVALID_SESSION_ID',
    };
  }

  return {
    isValid: true,
    sessionId: trimmed.toLowerCase(),
  };
}
