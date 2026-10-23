/**
 * @file chatConsentGuard.ts
 * @description Rào chắn quản lý quyền đồng thuận người dùng (User Consent Guard) cho hệ thống Chatbot AI Du Lịch Tri Tôn.
 * Tuân thủ Điều 17 Nghị định 13/2023/NĐ-CP về Bảo vệ Dữ liệu Cá nhân và Quyết định Kiến trúc G3 (DR-G3-RETENTION-SESSIONS-001).
 * 
 * Quy chuẩn: CHAT-CONSENT-GUARD-V1 (P05-008)
 * Bất biến:
 * 1. Chỉ granted cho phép lưu/tải lịch sử. Unset/denied không được nâng thành granted.
 * 2. Routes dùng cùng guard cho chat log; câu hỏi hiện tại vẫn có thể được gửi tới AI để trả lời.
 */

export const CHAT_CONSENT_STORAGE_KEY = 'triton_chat_consent';
export const CHAT_CONSENT_HEADER = 'x-chat-consent';

export type ConsentStatus = 'granted' | 'denied' | 'unset';

export interface ConsentResolutionOptions {
  body?: Record<string, unknown> | null;
  req?: Request | { headers?: Headers | Record<string, string | null | undefined> } | null;
}

/**
 * Trích xuất trạng thái đồng thuận từ HTTP Request (Body hoặc Headers)
 */
export function resolveConsentStatus(options?: ConsentResolutionOptions): ConsentStatus {
  if (!options) return 'unset';

  let bodyStatus: ConsentStatus = 'unset';
  let headerStatus: ConsentStatus = 'unset';
  // Denial wins when body and header disagree.
  if (options.body && typeof options.body === 'object') {
    if (options.body.consent === false || options.body.consent === 'denied') {
      bodyStatus = 'denied';
    }
    if (options.body.consent === true || options.body.consent === 'granted') {
      bodyStatus = 'granted';
    }
  }

  // 2. Kiểm tra HTTP Headers
  if (options.req && 'headers' in options.req && options.req.headers) {
    let headerValue: string | null | undefined = null;
    const h = options.req.headers;
    if (typeof (h as Headers).get === 'function') {
      headerValue = (h as Headers).get(CHAT_CONSENT_HEADER);
    } else {
      headerValue = (h as Record<string, string>)[CHAT_CONSENT_HEADER] ||
                    (h as Record<string, string>)[CHAT_CONSENT_HEADER.toLowerCase()];
    }

    if (headerValue) {
      const normalized = headerValue.trim().toLowerCase();
      if (normalized === 'denied' || normalized === 'false' || normalized === 'no') {
        headerStatus = 'denied';
      }
      if (normalized === 'granted' || normalized === 'true' || normalized === 'yes') {
        headerStatus = 'granted';
      }
    }
  }

  if (bodyStatus === 'denied' || headerStatus === 'denied') return 'denied';
  return bodyStatus === 'granted' || headerStatus === 'granted' ? 'granted' : 'unset';
}

/**
 * Thẩm định xem phiên hội thoại có được phép ghi vào bảng public.chat_sessions trên CSDL hay không.
 * Chỉ cho phép khi đã đồng ý rõ ràng và phiên không phải anonymous.
 */
export function shouldPersistChatSession(status: ConsentStatus, sessionId?: string | null): boolean {
  if (!sessionId || sessionId === 'anonymous' || sessionId.trim() === '') {
    return false;
  }
  return status === 'granted';
}

/**
 * Thẩm định xem có được phép tải lịch sử hội thoại trước đó từ CSDL hay không.
 * Unset và denied đều không được tải lịch sử máy chủ.
 */
export function shouldLoadChatHistory(status: ConsentStatus, sessionId?: string | null): boolean {
  if (!sessionId || sessionId === 'anonymous' || sessionId.trim() === '') {
    return false;
  }
  return status === 'granted';
}
