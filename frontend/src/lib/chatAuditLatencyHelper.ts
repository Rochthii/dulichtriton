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

export interface ChatLatencyMetrics {
  avgLatencyMs: number;
  p95LatencyMs: number | null;
  latencySampleCount: number;
}

export interface ChatProviderFallbackMetrics {
  fallbackCount: number;
  fallbackRatePercent: number | null;
  sampleCount: number;
}

export interface ChatRetrievalZeroResultMetrics {
  zeroResultCount: number;
  zeroResultRatePercent: number | null;
  retrievalSampleCount: number;
}

/** Only explicitly classified provider-backed requests belong in this denominator. */
export function calculateChatProviderFallbackMetrics(samples: readonly unknown[]): ChatProviderFallbackMetrics {
  const classified = samples.filter((sample): sample is boolean => typeof sample === 'boolean');
  const fallbackCount = classified.filter(Boolean).length;
  return {
    fallbackCount,
    fallbackRatePercent: classified.length ? Math.round((fallbackCount / classified.length) * 1000) / 10 : null,
    sampleCount: classified.length,
  };
}

/** Only requests that executed retrieval belong in this denominator. */
export function calculateChatRetrievalZeroResultMetrics(samples: readonly unknown[]): ChatRetrievalZeroResultMetrics {
  const classified = samples.filter((sample): sample is boolean => typeof sample === 'boolean');
  const zeroResultCount = classified.filter(Boolean).length;
  return {
    zeroResultCount,
    zeroResultRatePercent: classified.length ? Math.round((zeroResultCount / classified.length) * 1000) / 10 : null,
    retrievalSampleCount: classified.length,
  };
}

/**
 * Summarize persisted latency samples with the nearest-rank p95 definition.
 * Invalid samples are ignored; no-data is represented explicitly as null p95.
 */
export function calculateChatLatencyMetrics(samples: readonly unknown[]): ChatLatencyMetrics {
  const validSamples = samples
    .filter((sample): sample is number =>
      typeof sample === 'number' && Number.isFinite(sample) && sample >= 0
    )
    .sort((left, right) => left - right);

  if (validSamples.length === 0) {
    return { avgLatencyMs: 0, p95LatencyMs: null, latencySampleCount: 0 };
  }

  const average = validSamples.reduce((total, sample) => total + sample, 0) / validSamples.length;
  const p95Index = Math.ceil(validSamples.length * 0.95) - 1;

  return {
    avgLatencyMs: Math.round(average),
    p95LatencyMs: validSamples[p95Index],
    latencySampleCount: validSamples.length,
  };
}

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
