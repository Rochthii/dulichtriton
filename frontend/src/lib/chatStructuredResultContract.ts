/**
 * ─────────────────────────────────────────────────────────────────────────────
 * STRUCTURED CHAT RESULT CONTRACT & VALIDATOR (P04-016)
 * Du Lịch Tri Tôn AI Assistant System
 * 
 * RÀNG BUỘC KIẾN TRÚC & PRODUCTION-REAL SCHEMA:
 * 1. Mọi phản hồi chatbot (kể cả khi Primary LLM timeout và kích hoạt fallback)
 *    phải trả về kết quả có cấu trúc hoàn chỉnh (Structured Result).
 * 2. Không được phép trả về kết quả rách chunk, thiếu trường hoặc rỗng text.
 * 3. Khi Groq Primary timeout (>= 2500ms):
 *    - provider phải là fallback provider hợp lệ (Gemini Secondary / Local RAG).
 *    - model phải là fallback model tương ứng.
 *    - latency_ms phải phản ánh số đo thực tế >= 2500ms.
 *    - suggestions phải có >= 1 gợi ý có ý nghĩa.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface StructuredPlaceItem {
  id: string;
  slug?: string;
  name: string;
  commune: string;
  category: string;
  rating?: number;
  image_url?: string;
  source_url?: string;
  tiktok_search_url?: string;
  hashtags?: string[];
  is_verified?: boolean;
  verification_status?: string;
  verified_at?: string;
  distance_km?: number;
}

export interface StructuredUIComponent {
  type: string;
  data: unknown;
}

export interface StructuredVideoItem {
  id: string;
  title: string;
  video_url: string;
  thumbnail_url?: string;
  author_name?: string;
  view_count?: number;
}

export interface StructuredChatResponse {
  text_response: string;
  provider: string;
  model: string;
  latency_ms: number;
  ui_components: StructuredUIComponent[];
  places: StructuredPlaceItem[];
  videos: StructuredVideoItem[];
  suggestions: string[];
}

export interface StructuredStreamDoneEvent {
  type: 'done';
  full_text: string;
  latency_ms: number;
  suggestions: string[];
  places?: StructuredPlaceItem[];
  provider?: string;
  model?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface StructuredValidationOptions {
  isTimeoutFallback?: boolean;
  minTimeoutMs?: number;
}

export const FORBIDDEN_PRIMARY_PROVIDERS_ON_TIMEOUT = [
  'groq-lpu',
  'groq-lpu-primary',
  'groq-llama-3.3-70b-versatile',
  'groq-round-robin',
  'groq',
];

export const FORBIDDEN_PRIMARY_MODELS_ON_TIMEOUT = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
];

/**
 * Xác thực tính hợp lệ của một Structured Chat Response (JSON query endpoint)
 */
export function validateStructuredChatResponse(
  payload: unknown,
  options?: StructuredValidationOptions
): ValidationResult {
  const errors: string[] = [];

  if (!payload || typeof payload !== 'object') {
    return { isValid: false, errors: ['ERR_PAYLOAD_NOT_OBJECT: Payload must be a non-null object'] };
  }

  const p = payload as Record<string, unknown>;

  // 1. text_response validation
  if (typeof p.text_response !== 'string' || p.text_response.trim().length === 0) {
    errors.push('ERR_MISSING_TEXT_RESPONSE: text_response must be a non-empty string');
  }

  // 2. provider validation
  if (typeof p.provider !== 'string' || p.provider.trim().length === 0) {
    errors.push('ERR_MISSING_PROVIDER: provider must be a non-empty string');
  } else if (options?.isTimeoutFallback) {
    const normProvider = p.provider.toLowerCase();
    const isForbidden = FORBIDDEN_PRIMARY_PROVIDERS_ON_TIMEOUT.some(f => normProvider.includes(f));
    if (isForbidden) {
      errors.push(`ERR_GROQ_NOT_ALLOWED_ON_TIMEOUT: provider "${p.provider}" is forbidden when primary timed out`);
    }
  }

  // 3. model validation
  if (typeof p.model !== 'string' || p.model.trim().length === 0) {
    errors.push('ERR_MISSING_MODEL: model must be a non-empty string');
  } else if (options?.isTimeoutFallback) {
    const normModel = p.model.toLowerCase();
    const isForbidden = FORBIDDEN_PRIMARY_MODELS_ON_TIMEOUT.some(f => normModel === f);
    if (isForbidden) {
      errors.push(`ERR_PRIMARY_MODEL_NOT_ALLOWED_ON_TIMEOUT: model "${p.model}" is forbidden when primary timed out`);
    }
  }

  // 4. latency_ms validation
  if (typeof p.latency_ms !== 'number' || isNaN(p.latency_ms) || p.latency_ms < 0) {
    errors.push('ERR_INVALID_LATENCY: latency_ms must be a non-negative number');
  } else if (options?.isTimeoutFallback) {
    const minMs = options.minTimeoutMs ?? 2500;
    if (p.latency_ms < minMs) {
      errors.push(`ERR_INVALID_TIMEOUT_LATENCY: latency_ms (${p.latency_ms}ms) must be >= ${minMs}ms on timeout fallback`);
    }
  }

  // 5. ui_components validation
  if (!Array.isArray(p.ui_components)) {
    errors.push('ERR_INVALID_UI_COMPONENTS: ui_components must be an array');
  } else {
    for (let i = 0; i < p.ui_components.length; i++) {
      const comp = p.ui_components[i];
      if (!comp || typeof comp !== 'object' || typeof comp.type !== 'string') {
        errors.push(`ERR_MALFORMED_UI_COMPONENT_${i}: ui_components[${i}] must have a string type`);
      }
    }
  }

  // 6. places validation
  if (!Array.isArray(p.places)) {
    errors.push('ERR_INVALID_PLACES: places must be an array');
  } else {
    for (let i = 0; i < p.places.length; i++) {
      const pl = p.places[i];
      if (!pl || typeof pl !== 'object' || !pl.id || !pl.name) {
        errors.push(`ERR_MALFORMED_PLACE_${i}: places[${i}] must have id and name`);
      }
    }
  }

  // 7. videos validation
  if (!Array.isArray(p.videos)) {
    errors.push('ERR_INVALID_VIDEOS: videos must be an array');
  }

  // 8. suggestions validation
  if (!Array.isArray(p.suggestions) || p.suggestions.length === 0) {
    errors.push('ERR_EMPTY_SUGGESTIONS: suggestions must be a non-empty array');
  } else {
    for (let i = 0; i < p.suggestions.length; i++) {
      if (typeof p.suggestions[i] !== 'string' || p.suggestions[i].trim().length === 0) {
        errors.push(`ERR_EMPTY_SUGGESTION_ITEM_${i}: suggestions[${i}] must be a non-empty string`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Xác thực tính hợp lệ của một SSE Stream Done Event
 */
export function validateStructuredStreamDoneEvent(
  event: unknown,
  options?: StructuredValidationOptions
): ValidationResult {
  const errors: string[] = [];

  if (!event || typeof event !== 'object') {
    return { isValid: false, errors: ['ERR_EVENT_NOT_OBJECT: Event must be a non-null object'] };
  }

  const ev = event as Record<string, unknown>;

  if (ev.type !== 'done') {
    errors.push(`ERR_INVALID_EVENT_TYPE: Event type must be 'done', got "${ev.type}"`);
  }

  if (typeof ev.full_text !== 'string' || ev.full_text.trim().length === 0) {
    errors.push('ERR_MISSING_FULL_TEXT: full_text must be a non-empty string');
  }

  if (typeof ev.latency_ms !== 'number' || isNaN(ev.latency_ms) || ev.latency_ms < 0) {
    errors.push('ERR_INVALID_LATENCY: latency_ms must be a non-negative number');
  } else if (options?.isTimeoutFallback) {
    const minMs = options.minTimeoutMs ?? 2500;
    if (ev.latency_ms < minMs) {
      errors.push(`ERR_INVALID_TIMEOUT_LATENCY: latency_ms (${ev.latency_ms}ms) must be >= ${minMs}ms on timeout fallback`);
    }
  }

  if (!Array.isArray(ev.suggestions) || ev.suggestions.length === 0) {
    errors.push('ERR_EMPTY_SUGGESTIONS: suggestions must be a non-empty array');
  }

  if (ev.places !== undefined && !Array.isArray(ev.places)) {
    errors.push('ERR_INVALID_PLACES: places must be an array when present');
  }

  if (options?.isTimeoutFallback && typeof ev.provider === 'string') {
    const normProvider = ev.provider.toLowerCase();
    const isForbidden = FORBIDDEN_PRIMARY_PROVIDERS_ON_TIMEOUT.some(f => normProvider.includes(f));
    if (isForbidden) {
      errors.push(`ERR_GROQ_NOT_ALLOWED_ON_TIMEOUT: provider "${ev.provider}" is forbidden when primary timed out`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Xác thực tính nhất quán giữa các token delta đã phát xuất và full_text trong done event
 * (Bảo đảm không rách chunk, không trả partial sai - P04-017)
 */
export function validateStreamTokenConcordance(
  emittedDeltas: string[],
  doneFullText: string
): ValidationResult {
  const errors: string[] = [];

  if (!Array.isArray(emittedDeltas)) {
    return { isValid: false, errors: ['ERR_INVALID_DELTAS: emittedDeltas must be an array of strings'] };
  }

  const concatenated = emittedDeltas.join('');

  if (concatenated !== doneFullText) {
    errors.push(
      `ERR_PARTIAL_MISMATCH: Concatenated deltas (${concatenated.length} chars) do not match done event full_text (${doneFullText.length} chars)`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

