/**
 * DU LỊCH TRI TÔN AI — CHAT QUERY INPUT-LENGTH & PAYLOAD GUARD
 * Bảo vệ hệ thống chatbot chống DoS, token bomb, embedding exhaustion và prompt-injection padding.
 * Tuân thủ RULE 01 (Production Real, No Mock) & Task P04-001.
 */

/**
 * Ngưỡng tối đa mặc định cho một câu hỏi du lịch Tri Tôn: 1.000 ký tự (~200-250 từ).
 * Đảm bảo đáp ứng đầy đủ các câu hỏi lịch trình phức tạp nhưng ngăn chặn payload độc hại.
 */
export const DEFAULT_MAX_CHAT_QUERY_LENGTH = 1000;

export interface ChatQueryValidationSuccess {
  isValid: true;
  sanitizedQuery: string;
}

export interface ChatQueryValidationFailure {
  isValid: false;
  status: 400 | 413;
  error: string;
  code: 'MISSING_QUERY' | 'QUERY_TOO_LONG';
  maxLength?: number;
  currentLength?: number;
}

export type ChatQueryValidationResult = ChatQueryValidationSuccess | ChatQueryValidationFailure;

/**
 * Lấy giới hạn độ dài ký tự tối đa từ biến môi trường hoặc fallback về mặc định 1.000.
 */
export function getMaxChatQueryLength(
  envVarName = 'CHAT_MAX_QUERY_LENGTH',
  defaultLength = DEFAULT_MAX_CHAT_QUERY_LENGTH
): number {
  const envVal = process.env[envVarName];
  if (envVal) {
    const parsed = parseInt(envVal, 10);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return defaultLength;
}

/**
 * Thẩm định tính hợp lệ và độ dài của câu hỏi người dùng (chat query).
 * - Trả về 400 Bad Request nếu thiếu hoặc câu hỏi rỗng.
 * - Trả về 413 Payload Too Large nếu độ dài câu hỏi vượt ngưỡng tối đa.
 */
export function validateChatQuery(
  rawQuery: unknown,
  maxLength = getMaxChatQueryLength()
): ChatQueryValidationResult {
  if (typeof rawQuery !== 'string' || !rawQuery.trim()) {
    return {
      isValid: false,
      status: 400,
      error: 'Thiếu nội dung câu hỏi hoặc câu hỏi không hợp lệ.',
      code: 'MISSING_QUERY',
    };
  }

  const sanitizedQuery = rawQuery.trim();

  if (sanitizedQuery.length > maxLength) {
    return {
      isValid: false,
      status: 413,
      error: `Câu hỏi vượt quá giới hạn tối đa ${maxLength} ký tự (${sanitizedQuery.length}/${maxLength}). Vui lòng rút gọn nội dung.`,
      code: 'QUERY_TOO_LONG',
      maxLength,
      currentLength: sanitizedQuery.length,
    };
  }

  return {
    isValid: true,
    sanitizedQuery,
  };
}
