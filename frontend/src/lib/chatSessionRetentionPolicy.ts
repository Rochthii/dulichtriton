/**
 * @file chatSessionRetentionPolicy.ts
 * @description Quy chuẩn kỹ thuật thời hạn lưu trữ và thanh lọc dữ liệu phiên trò chuyện (Chat Sessions Retention Policy).
 * Thực thi các quyết định kiến trúc từ Decision Record G3 (DR-G3-RETENTION-SESSIONS-001) tuân thủ Nghị định 13/2023/NĐ-CP.
 * 
 * Nhiệm vụ: P05-002 (Wave W5 — Privacy, Data Retention & Observability)
 * Phê duyệt: Chăm Rốch Thi (Lead Technical Architect)
 */

import { CANONICAL_CHAT_SESSION_ID_INVENTORY } from './chatDataInventory';

/**
 * Số giờ lưu trữ tối đa của một phiên trò chuyện kể từ tương tác cuối cùng (updated_at).
 * Chuẩn hóa bất biến: 24 giờ (1 ngày) theo Decision Record G3.
 */
export const CHAT_SESSION_RETENTION_HOURS = 24;

/**
 * Số mili-giây tương đương với thời hạn lưu trữ phiên (86,400,000 ms).
 */
export const CHAT_SESSION_RETENTION_MS = CHAT_SESSION_RETENTION_HOURS * 60 * 60 * 1000;

/**
 * Mệnh đề SQL INTERVAL chuẩn tắc dùng cho PostgreSQL query và cleanup migration.
 */
export const CHAT_SESSION_RETENTION_SQL_INTERVAL = "INTERVAL '24 hours'";

/**
 * Tên chỉ mục PostgreSQL hỗ trợ quét phạm vi thời gian hiệu quả cho việc dọn dẹp.
 */
export const CHAT_SESSION_INDEX_NAME = 'chat_sessions_updated_at_idx';

/**
 * Quy chuẩn điều kiện lưu trữ và thu hồi (Retention & Eviction Conditions).
 */
export const CHAT_SESSION_RETENTION_CONDITIONS = Object.freeze({
  SLIDING_TTL_WINDOW: 'Mỗi tương tác hợp lệ (thêm lượt hỏi/đáp) cập nhật updated_at = NOW(), gia hạn thời gian sống thêm 24 giờ.',
  EXPIRATION_THRESHOLD: 'Phiên có updated_at < (NOW() - INTERVAL \'24 hours\') được xác định là hết hạn và đủ điều kiện xóa vĩnh viễn.',
  RIGHT_TO_ERASURE: 'Người dùng có quyền gửi yêu cầu xóa ngay lập tức (P05-005) kèm session_token hợp lệ mà không cần chờ đủ 24 giờ.',
  AUDIT_DECOUPLING: 'Nội dung hội thoại thô trong chat_sessions bị xóa sạch, trong khi vết kiểm toán an toàn (chat_logs) được lưu riêng biệt có chính sách độc lập (P05-004).'
});

/**
 * Kiểm tra xem một mốc thời gian phiên (updated_at) đã hết hạn lưu trữ hay chưa.
 * 
 * @param updatedAt Mốc thời gian tương tác cuối cùng (chuỗi ISO, số timestamp hoặc đối tượng Date)
 * @param nowReference Thời điểm hiện tại tham chiếu (mặc định là Date.now())
 * @returns true nếu phiên đã quá 24 giờ, false nếu còn hạn
 */
export function isSessionExpired(
  updatedAt: string | number | Date,
  nowReference: number | Date = Date.now()
): boolean {
  if (!updatedAt) return true;

  const updatedTime = updatedAt instanceof Date 
    ? updatedAt.getTime() 
    : typeof updatedAt === 'string' 
      ? new Date(updatedAt).getTime() 
      : updatedAt;

  if (Number.isNaN(updatedTime)) {
    // Fail-closed: Mốc thời gian không hợp lệ coi như đã hết hạn để tránh lưu rác
    return true;
  }

  const nowTime = nowReference instanceof Date ? nowReference.getTime() : nowReference;
  const ageMs = nowTime - updatedTime;

  return ageMs >= CHAT_SESSION_RETENTION_MS;
}

/**
 * Tính toán thời điểm hết hạn chính xác của một phiên trò chuyện.
 * 
 * @param updatedAt Mốc thời gian tương tác cuối cùng
 * @returns Đối tượng Date đại diện cho thời điểm hết hạn (updatedAt + 24h)
 */
export function calculateSessionExpirationDate(updatedAt: string | number | Date): Date {
  const updatedTime = updatedAt instanceof Date 
    ? updatedAt.getTime() 
    : typeof updatedAt === 'string' 
      ? new Date(updatedAt).getTime() 
      : updatedAt;

  if (Number.isNaN(updatedTime)) {
    return new Date(0);
  }

  return new Date(updatedTime + CHAT_SESSION_RETENTION_MS);
}

/**
 * Sinh câu truy vấn PostgreSQL DELETE chuẩn tắc phục vụ tiến trình xóa phiên hết hạn (P05-003).
 */
export function buildRetentionCleanupQuery(batchLimit = 1000): string {
  return `DELETE FROM public.chat_sessions WHERE session_id IN (SELECT session_id FROM public.chat_sessions WHERE updated_at < (NOW() - ${CHAT_SESSION_RETENTION_SQL_INTERVAL}) LIMIT ${batchLimit});`;
}

/**
 * Xác nhận tính nhất quán giữa Retention Policy runtime và Data Inventory Specification (P05-001).
 */
export function assertRetentionPolicyConcordance(): boolean {
  return (
    CANONICAL_CHAT_SESSION_ID_INVENTORY.retention.ttlHours === CHAT_SESSION_RETENTION_HOURS &&
    CANONICAL_CHAT_SESSION_ID_INVENTORY.retention.unit === 'hours'
  );
}
