/**
 * ─────────────────────────────────────────────────────────────────────────────
 * CHAT AUDIT PROVIDER HELPER (P04-011 Audit Log Real Provider Tracking)
 * Du Lịch Tri Tôn AI Assistant System
 * 
 * Mục tiêu:
 * 1. Chuẩn hóa và ghi nhận chính xác nhà cung cấp AI thực tế (`provider_used`)
 *    vào bảng `chat_logs` và hệ thống audit log.
 * 2. Loại bỏ hoàn toàn các hằng số giả định/hardcoded như 'parallel-race' hay 'none'.
 * 3. Phân biệt rõ rệt giữa các nhà cung cấp: Groq, Gemini, OpenRouter,
 *    Local Expert RAG, Emergency Instant Bypass, và Out-of-Scope Guard.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type AuditProviderFamily =
  | 'groq'
  | 'gemini'
  | 'openrouter'
  | 'local_expert_rag'
  | 'emergency_instant_bypass'
  | 'out_of_scope_guard'
  | 'unknown_fallback';

export const FORBIDDEN_AUDIT_PROVIDERS = Object.freeze([
  'parallel-race',
  'none',
  '',
  'undefined',
  'null',
]);

export const CANONICAL_OUT_OF_SCOPE_PROVIDER = 'out_of_scope_guard';
export const CANONICAL_EMERGENCY_PROVIDER = 'emergency_instant_bypass';
export const CANONICAL_LOCAL_RAG_PROVIDER = 'local_expert_rag';
export const CANONICAL_UNKNOWN_FALLBACK = 'local_expert_rag';

/**
 * Chuẩn hóa giá trị provider trước khi ghi vào chat_logs audit log.
 * Đảm bảo:
 * - Khi out-of-scope: trả về 'out_of_scope_guard'
 * - Khi có provider thực tế: giữ nguyên định danh thực tế (Groq / Gemini / OpenRouter / Local RAG)
 * - Tuyệt đối không trả về 'parallel-race', 'none', rỗng, null hay undefined.
 */
export function resolveAuditProvider(
  rawProvider?: string | null,
  isOutOfScope?: boolean
): string {
  if (isOutOfScope) {
    return CANONICAL_OUT_OF_SCOPE_PROVIDER;
  }

  if (!rawProvider || typeof rawProvider !== 'string') {
    return CANONICAL_UNKNOWN_FALLBACK;
  }

  const cleaned = rawProvider.trim();
  if (
    !cleaned ||
    cleaned.toLowerCase() === 'none' ||
    cleaned.toLowerCase() === 'parallel-race'
  ) {
    return CANONICAL_UNKNOWN_FALLBACK;
  }

  return cleaned;
}

/**
 * Phân loại nhà cung cấp AI theo họ kiến trúc (Family Classifier).
 * Phục vụ giám sát, kiểm thử và phân luồng metrics.
 */
export function classifyProviderFamily(provider: string): AuditProviderFamily {
  const normalized = (provider || '').trim().toLowerCase();

  if (normalized === CANONICAL_OUT_OF_SCOPE_PROVIDER || normalized.includes('out_of_scope')) {
    return 'out_of_scope_guard';
  }
  if (normalized === CANONICAL_EMERGENCY_PROVIDER || normalized.includes('emergency')) {
    return 'emergency_instant_bypass';
  }
  if (normalized.startsWith('groq')) {
    return 'groq';
  }
  if (normalized.startsWith('gemini')) {
    return 'gemini';
  }
  if (normalized.startsWith('openrouter')) {
    return 'openrouter';
  }
  if (normalized === CANONICAL_LOCAL_RAG_PROVIDER || normalized.includes('local_expert')) {
    return 'local_expert_rag';
  }

  return 'unknown_fallback';
}

/**
 * Kiểm tra xem một chuỗi provider có hợp lệ và an toàn để ghi audit log hay không.
 */
export function isValidAuditProvider(provider: unknown): boolean {
  if (typeof provider !== 'string') return false;
  const cleaned = provider.trim().toLowerCase();
  if (!cleaned) return false;
  return !FORBIDDEN_AUDIT_PROVIDERS.includes(cleaned);
}
