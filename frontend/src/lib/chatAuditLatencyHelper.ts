/**
 * Chat Audit Latency Helper (P04-013)
 * Cung cấp tiện ích đo lường và thẩm định số đo thời gian thực tế (latency_ms)
 * cho audit log chat_logs và API responses.
 *
 * RÀNG BUỘC:
 * 1. Latency là SỐ ĐO THỰC TẾ (Date.now() - startTime), tuyệt đối KHÔNG PHẢI CONSTANT.
 * 2. Giá trị phải là số nguyên không âm (integer >= 0).
 * 3. 0% mock / 0% fake placeholder (loại bỏ triệt để hardcoded 1200ms hay hằng số giả định).
 */

export const FORBIDDEN_AUDIT_LATENCIES = new Set<number>([
  -1,
]);

/**
 * Bắt đầu bộ đếm thời gian
 */
export function startLatencyTimer(): number {
  return Date.now();
}

/**
 * Tính số mili-giây đã trôi qua kể từ startTime
 */
export function calculateElapsedMs(startTime: number): number {
  if (typeof startTime !== 'number' || !Number.isFinite(startTime)) {
    return 0;
  }
  const now = Date.now();
  const diff = now - startTime;
  return Math.max(0, Math.round(diff));
}

/**
 * Kiểm tra xem một giá trị latency có hợp lệ để ghi vào audit log hay không
 */
export function isValidAuditLatency(latency: unknown): boolean {
  if (typeof latency !== 'number') {
    return false;
  }
  if (!Number.isFinite(latency) || isNaN(latency)) {
    return false;
  }
  if (latency < 0) {
    return false;
  }
  if (FORBIDDEN_AUDIT_LATENCIES.has(latency)) {
    return false;
  }
  return true;
}

/**
 * Chuẩn hóa và bảo đảm latency_ms là số đo thực tế
 */
export function resolveAuditLatency(measuredMs: unknown, startTime?: number): number {
  if (typeof measuredMs === 'number' && isValidAuditLatency(measuredMs)) {
    return Math.round(measuredMs);
  }
  if (typeof startTime === 'number' && Number.isFinite(startTime)) {
    return calculateElapsedMs(startTime);
  }
  return 0;
}
