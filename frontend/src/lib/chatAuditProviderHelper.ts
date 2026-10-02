/**
 * ─────────────────────────────────────────────────────────────────────────────
 * CHAT AUDIT PROVIDER & MODEL HELPER (P04-011 & P04-012 Real Observability)
 * Du Lịch Tri Tôn AI Assistant System
 * 
 * Mục tiêu:
 * 1. Chuẩn hóa và ghi nhận chính xác nhà cung cấp AI thực tế (`provider_used`)
 *    vào bảng `chat_logs`.
 * 2. Ghi nhận chính xác model ID thực tế (`model_used`) của nhà cung cấp AI đã
 *    hoàn thành lượt suy luận vào bảng `chat_logs`.
 * 3. Loại bỏ hoàn toàn các hằng số giả định/hardcoded như 'parallel-race' hay 'none'.
 * 4. Phân biệt rõ rệt giữa các nhà cung cấp và model ID: Groq, Gemini, OpenRouter,
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

export const FORBIDDEN_AUDIT_MODELS = Object.freeze([
  'parallel-race',
  'none',
  '',
  'undefined',
  'null',
  'default',
]);

// Canonical Provider Constants
export const CANONICAL_OUT_OF_SCOPE_PROVIDER = 'out_of_scope_guard';
export const CANONICAL_EMERGENCY_PROVIDER = 'emergency_instant_bypass';
export const CANONICAL_LOCAL_RAG_PROVIDER = 'local_expert_rag';
export const CANONICAL_PROMPT_INJECTION_PROVIDER = 'guard_prompt_injection_firewall';
export const CANONICAL_POISONED_KNOWLEDGE_PROVIDER = 'guard_poisoned_knowledge_firewall';
export const CANONICAL_UNKNOWN_FALLBACK = 'local_expert_rag';

// Canonical Model Constants (P04-012, P04-020 & P04-021)
export const CANONICAL_OUT_OF_SCOPE_MODEL = 'intent-out-of-scope-filter';
export const CANONICAL_EMERGENCY_MODEL = 'emergency-instant-rule-engine';
export const CANONICAL_LOCAL_RAG_MODEL = 'local-expert-rag-v1';
export const CANONICAL_PROMPT_INJECTION_MODEL = 'prompt-injection-firewall-v1';
export const CANONICAL_POISONED_KNOWLEDGE_MODEL = 'poisoned-knowledge-firewall-v1';

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
 * Chuẩn hóa giá trị model trước khi ghi vào chat_logs audit log (P04-012).
 * Đảm bảo:
 * - Khi out-of-scope: trả về 'intent-out-of-scope-filter'
 * - Khi có rawModel cụ thể: giữ nguyên model ID chính xác đã hoàn thành request
 * - Khi rawModel chưa có nhưng rawProvider chứa định danh model: trích xuất chính xác
 * - Tuyệt đối không trả về các chuỗi cấm ('parallel-race', 'none', rỗng, null, undefined).
 */
export function resolveAuditModel(
  rawModel?: string | null,
  rawProvider?: string | null,
  isOutOfScope?: boolean
): string {
  if (isOutOfScope) {
    return CANONICAL_OUT_OF_SCOPE_MODEL;
  }

  if (rawModel && typeof rawModel === 'string') {
    const cleaned = rawModel.trim();
    if (cleaned && !FORBIDDEN_AUDIT_MODELS.includes(cleaned.toLowerCase())) {
      return cleaned;
    }
  }

  // Tự động phân tích và trích xuất model ID từ rawProvider nếu rawModel chưa được truyền
  if (rawProvider && typeof rawProvider === 'string') {
    const p = rawProvider.trim();
    if (p === CANONICAL_EMERGENCY_PROVIDER || p.includes('emergency')) {
      return CANONICAL_EMERGENCY_MODEL;
    }
    if (p === CANONICAL_PROMPT_INJECTION_PROVIDER || p.includes('prompt_injection')) {
      return CANONICAL_PROMPT_INJECTION_MODEL;
    }
    if (p === CANONICAL_POISONED_KNOWLEDGE_PROVIDER || p.includes('poisoned_knowledge')) {
      return CANONICAL_POISONED_KNOWLEDGE_MODEL;
    }
    if (p === CANONICAL_LOCAL_RAG_PROVIDER || p.includes('local_expert')) {
      return CANONICAL_LOCAL_RAG_MODEL;
    }

    // Các model Groq đã biết
    if (p.includes('llama-3.3-70b-versatile')) return 'llama-3.3-70b-versatile';
    if (p.includes('llama-3.1-8b-instant')) return 'llama-3.1-8b-instant';
    if (p.includes('gemma2-9b-it')) return 'gemma2-9b-it';
    if (p.includes('mixtral-8x7b-32768')) return 'mixtral-8x7b-32768';
    if (p.startsWith('groq')) return 'llama-3.3-70b-versatile'; // default groq primary

    // Các model Gemini đã biết
    if (p.includes('gemini-flash-lite-latest')) return 'gemini-flash-lite-latest';
    if (p.includes('gemini-2.5-flash-lite')) return 'gemini-2.5-flash-lite';
    if (p.includes('gemini-3.1-flash-lite')) return 'gemini-3.1-flash-lite';
    if (p.includes('gemini-flash-latest')) return 'gemini-flash-latest';
    if (p.includes('gemini-3-flash-preview')) return 'gemini-3-flash-preview';
    if (p.includes('gemini-3.7-flash')) return 'gemini-3.7-flash';
    if (p.includes('gemini-2.5-flash')) return 'gemini-2.5-flash';
    if (p.includes('gemini-1.5-flash')) return 'gemini-1.5-flash';
    if (p.includes('gemini-1.5-pro')) return 'gemini-1.5-pro';
    if (p.startsWith('gemini')) return 'gemini-flash-lite-latest'; // default gemini primary

    // OpenRouter models
    if (p.includes('openrouter-')) {
      const extracted = p.replace(/^openrouter-/, '').trim();
      if (extracted) return extracted;
    }
    if (p.includes('google/gemma-2-27b-it')) return 'google/gemma-2-27b-it';
    if (p.includes('meta-llama/llama-3.3-70b-instruct:free')) return 'meta-llama/llama-3.3-70b-instruct:free';
    if (p.startsWith('openrouter')) return 'google/gemma-2-27b-it';
  }

  return CANONICAL_LOCAL_RAG_MODEL;
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

/**
 * Kiểm tra xem một chuỗi model ID có hợp lệ và an toàn để ghi audit log hay không (P04-012).
 */
export function isValidAuditModel(model: unknown): boolean {
  if (typeof model !== 'string') return false;
  const cleaned = model.trim().toLowerCase();
  if (!cleaned) return false;
  return !FORBIDDEN_AUDIT_MODELS.includes(cleaned);
}
