/**
 * @file chatConsentGuard.ts
 * @description Rào chắn quản lý quyền đồng thuận người dùng (User Consent Guard) cho hệ thống Chatbot AI Du Lịch Tri Tôn.
 * Tuân thủ Điều 17 Nghị định 13/2023/NĐ-CP về Bảo vệ Dữ liệu Cá nhân và Quyết định Kiến trúc G3 (DR-G3-RETENTION-SESSIONS-001).
 * 
 * Quy chuẩn: CHAT-CONSENT-GUARD-V1 (P05-008)
 * Bất biến:
 * 1. Khi người dùng từ chối đồng thuận (no-consent / incognito mode, consent = false / denied),
 *    hệ thống TUYỆT ĐỐI KHÔNG ghi bất kỳ bản ghi nào vào bảng public.chat_sessions trên máy chủ.
 * 2. Mọi chức năng hỏi đáp du lịch, trích dẫn bản đồ, gợi ý lịch trình vẫn hoạt động 100% trôi chảy.
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

  // 1. Kiểm tra Body JSON
  if (options.body && typeof options.body === 'object') {
    if (options.body.consent === false || options.body.consent === 'denied') {
      return 'denied';
    }
    if (options.body.consent === true || options.body.consent === 'granted') {
      return 'granted';
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
        return 'denied';
      }
      if (normalized === 'granted' || normalized === 'true' || normalized === 'yes') {
        return 'granted';
      }
    }
  }

  return 'unset';
}

/**
 * Thẩm định xem phiên hội thoại có được phép ghi vào bảng public.chat_sessions trên CSDL hay không.
 * Trả về false tuyệt đối nếu người dùng từ chối (no-consent) hoặc phiên là anonymous.
 */
export function shouldPersistChatSession(status: ConsentStatus, sessionId?: string | null): boolean {
  if (!sessionId || sessionId === 'anonymous' || sessionId.trim() === '') {
    return false;
  }
  // No-consent path: Nếu người dùng từ chối đồng thuận (denied), TUYỆT ĐỐI KHÔNG GHI
  if (status === 'denied') {
    return false;
  }
  // Mặc định hoặc khi đã đồng thuận (granted/unset), cho phép lưu nếu có sessionId hợp lệ
  return true;
}

/**
 * Thẩm định xem có được phép tải lịch sử hội thoại trước đó từ CSDL hay không.
 * Nếu người dùng đang ở chế độ từ chối đồng thuận (denied), không tải lịch sử máy chủ.
 */
export function shouldLoadChatHistory(status: ConsentStatus, sessionId?: string | null): boolean {
  if (!sessionId || sessionId === 'anonymous' || sessionId.trim() === '') {
    return false;
  }
  if (status === 'denied') {
    return false;
  }
  return true;
}
