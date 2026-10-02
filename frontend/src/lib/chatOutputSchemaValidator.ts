/**
 * ─────────────────────────────────────────────────────────────────────────────
 * CHATBOT OUTPUT SCHEMA VALIDATOR & SANITIZER (P04-018)
 * Du Lịch Tri Tôn AI Assistant System
 * 
 * RÀNG BUỘC KIẾN TRÚC & PRODUCTION-REAL SAFETY:
 * 1. Mọi phản hồi chatbot từ LLM Providers (Groq, Gemini, OpenRouter, Local RAG)
 *    phải thỏa mãn schema và tiêu chuẩn nội dung trước khi gửi về client,
 *    lưu vào session turns hoặc ghi vào audit log.
 * 2. CHẶN ĐỨNG (Reject & Fail-closed) các phản hồi malformed:
 *    - Rỗng hoặc toàn khoảng trắng / ký tự điều khiển (EMPTY_OR_WHITESPACE).
 *    - Quá ngắn hoặc vô nghĩa như "ok", "...", "null", "undefined" (TOO_SHORT_OR_MEANINGLESS).
 *    - Rò rỉ thông báo lỗi kỹ thuật của provider / gateway (RAW_PROVIDER_ERROR).
 *    - Rò rỉ prompt hệ thống, instruction tags, special tokens (PROMPT_LEAKAGE).
 *    - Rò rỉ JSON payload bị cắt cụt hoặc dump raw API choices (MALFORMED_JSON_DUMP).
 *    - Lặp từ vô tận do suy thoái lấy mẫu LLM (REPETITIVE_LOOP).
 * 3. KÍCH HOẠT FALLBACK AN TOÀN:
 *    - Khi provider sơ cấp trả về malformed output, hệ thống chặn đứng và
 *      chuyển tầng suy thoái sang Secondary Provider hoặc Local Expert RAG
 *      để đảm bảo du khách luôn nhận được câu trả lời chất lượng cao, đúng văn hóa.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type ChatbotOutputErrorCode =
  | 'EMPTY_OR_WHITESPACE'
  | 'TOO_SHORT_OR_MEANINGLESS'
  | 'RAW_PROVIDER_ERROR'
  | 'PROMPT_LEAKAGE'
  | 'MALFORMED_JSON_DUMP'
  | 'UNCLOSED_MARKDOWN_BLOCK'
  | 'REPETITIVE_LOOP';

export interface ChatbotOutputValidationResult {
  isValid: boolean;
  code?: ChatbotOutputErrorCode;
  reason?: string;
  sanitizedText?: string;
  repairedFences?: boolean;
}

export interface ChatbotOutputValidationOptions {
  minCharLength?: number;
  allowAutoRepair?: boolean;
  maxRepetitionCount?: number;
}

export const DEFAULT_MIN_CHAR_LENGTH = 15;
export const DEFAULT_MAX_REPETITION_COUNT = 6;

/**
 * Danh sách chữ ký lỗi kỹ thuật và exception signature từ LLM providers & API gateways
 */
export const RAW_PROVIDER_ERROR_SIGNATURES: RegExp[] = [
  /\{\s*["']error["']\s*:/i,
  /\{\s*["']code["']\s*:\s*(4\d\d|5\d\d)/i,
  /rate\s*limit\s*(exceeded|reached)/i,
  /ratelimiterror/i,
  /too\s*many\s*requests/i,
  /internal\s*server\s*error/i,
  /502\s*bad\s*gateway/i,
  /503\s*service\s*unavailable/i,
  /504\s*gateway\s*timeout/i,
  /api\s*key\s*(not\s*valid|invalid|expired|missing)/i,
  /resource_exhausted/i,
  /upstream\s*connect\s*error/i,
  /connection\s*reset\s*by\s*peer/i,
  /socket\s*hang\s*up/i,
  /model\s*(is\s*currently\s*)?overloaded/i,
  /service\s*unavailable/i,
  /typeerror:\s*/i,
  /referenceerror:\s*/i,
  /syntaxerror:\s*/i,
  /failed\s*to\s*fetch/i,
  /traceback\s*\(most\s*recent\s*call\s*last\)/i,
];

/**
 * Danh sách special tokens, instruction wrappers và prompt leakage
 */
export const PROMPT_LEAKAGE_SIGNATURES: RegExp[] = [
  /<\/?system>/i,
  /<\/?prompt>/i,
  /<\/?context>/i,
  /<\/?assistant>/i,
  /\[inst\]/i,
  /\[\/inst\]/i,
  /<<sys>>/i,
  /<<\/sys>>/i,
  /<\|im_start\|>/i,
  /<\|im_end\|>/i,
  /<\|endoftext\|>/i,
  /^human:\s*/im,
  /^assistant:\s*/im,
  /^system:\s*/im,
  /câu hỏi của bạn:\s*$/im,
  /tri thức tổng quan & văn hóa tri tôn bổ sung \(từ csdl/i,
];

/**
 * Từ / cụm vô nghĩa quá ngắn
 */
export const MEANINGLESS_SHORT_WORDS = new Set([
  'ok',
  'yes',
  'no',
  'hi',
  'hello',
  'test',
  'null',
  'undefined',
  'nan',
  'error',
  'fail',
  'done',
  '...',
  '???',
  '!!!',
  'none',
  '[]',
  '{}',
]);

/**
 * Kiểm tra xem một chuỗi có chứa chữ ký lỗi raw của provider không
 */
export function containsRawProviderError(text: string): boolean {
  if (!text || typeof text !== 'string') return false;
  return RAW_PROVIDER_ERROR_SIGNATURES.some((rx) => rx.test(text));
}

/**
 * Kiểm tra xem một chuỗi có rò rỉ prompt hệ thống / special tokens không
 */
export function containsPromptLeakage(text: string): boolean {
  if (!text || typeof text !== 'string') return false;
  return PROMPT_LEAKAGE_SIGNATURES.some((rx) => rx.test(text));
}

/**
 * Tự động sửa chữa các code fence markdown chưa được khép kín (```)
 */
export function repairMarkdownFences(text: string): { repairedText: string; wasRepaired: boolean } {
  if (!text || typeof text !== 'string') return { repairedText: '', wasRepaired: false };

  // Đếm số lượng chuỗi ```
  const fenceMatches = text.match(/```/g);
  const fenceCount = fenceMatches ? fenceMatches.length : 0;

  // Nếu số fence là lẻ -> có 1 fence mở chưa đóng
  if (fenceCount % 2 !== 0) {
    const repairedText = text.trimEnd() + '\n```\n';
    return { repairedText, wasRepaired: true };
  }

  return { repairedText: text, wasRepaired: false };
}

/**
 * Kiểm tra hiện tượng lặp từ vô tận (LLM repetitive sampling loop)
 */
export function detectRepetitiveLoop(text: string, maxRepeat: number = DEFAULT_MAX_REPETITION_COUNT): boolean {
  if (!text || text.length < 50) return false;

  // Tách thành các token từ ngữ
  const words = text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 2);

  if (words.length < maxRepeat * 2) return false;

  // Kiểm tra lặp cụm N từ liên tiếp (n-gram với n từ 1 đến 4)
  for (const n of [1, 2, 3, 4]) {
    if (words.length < n * maxRepeat) continue;
    let consecutiveCount = 1;
    let lastGram = '';
    for (let i = 0; i <= words.length - n; i += n) {
      const gram = words.slice(i, i + n).join(' ');
      if (gram === lastGram) {
        consecutiveCount++;
        if (consecutiveCount >= maxRepeat) {
          return true;
        }
      } else {
        lastGram = gram;
        consecutiveCount = 1;
      }
    }
  }

  return false;
}

/**
 * Kiểm tra xem output có phải là JSON dump malformed (chưa đóng hoặc rò rỉ API choices) không
 */
export function detectMalformedJsonDump(text: string): boolean {
  const trimmed = text.trim();

  // Bắt đầu bằng { hoặc [ nhưng không phải markdown code block
  if ((trimmed.startsWith('{') || trimmed.startsWith('[')) && !trimmed.startsWith('```')) {
    // 1. Chứa raw choices rò rỉ từ OpenAI / Groq / Anthropic response body
    if (trimmed.includes('"choices"') || trimmed.includes('"candidates"') || trimmed.includes('"delta"')) {
      return true;
    }

    // 2. Thử parse JSON
    try {
      JSON.parse(trimmed);
      // Nếu là JSON hợp lệ nhưng cấu trúc chỉ chứa { "error": ... }
      if (containsRawProviderError(trimmed)) {
        return true;
      }
      // LLM trả về raw JSON object thay vì text trò chuyện tự nhiên
      return true;
    } catch {
      // JSON bị cắt cụt (unclosed brackets) -> malformed
      return true;
    }
  }

  return false;
}

/**
 * Hàm kiểm tra nhanh xem output có bị malformed không (dùng trong early stream checks)
 */
export function isMalformedProviderOutput(text: unknown): boolean {
  const res = validateChatbotOutput(text, { allowAutoRepair: false });
  return !res.isValid;
}

/**
 * Hàm xác thực toàn diện Output Schema của Chatbot (Production-Real Guard)
 */
export function validateChatbotOutput(
  rawOutput: unknown,
  options?: ChatbotOutputValidationOptions
): ChatbotOutputValidationResult {
  const minLen = options?.minCharLength ?? DEFAULT_MIN_CHAR_LENGTH;
  const allowRepair = options?.allowAutoRepair ?? true;
  const maxRepeat = options?.maxRepetitionCount ?? DEFAULT_MAX_REPETITION_COUNT;

  // 1. Kiểm tra Type & Non-empty
  if (typeof rawOutput !== 'string') {
    return {
      isValid: false,
      code: 'EMPTY_OR_WHITESPACE',
      reason: `Output must be a string, got ${typeof rawOutput}`,
    };
  }

  const trimmed = rawOutput.trim();

  // Loại bỏ các ký tự null byte và control byte vô nghĩa
  if (trimmed.length === 0 || /^\x00+$/.test(trimmed)) {
    return {
      isValid: false,
      code: 'EMPTY_OR_WHITESPACE',
      reason: 'Output is empty or contains only whitespace/null bytes',
    };
  }

  // 2. Kiểm tra Too Short & Meaningless
  if (trimmed.length < minLen) {
    const lower = trimmed.toLowerCase();
    if (MEANINGLESS_SHORT_WORDS.has(lower) || /^[.?!\s\-_]+$/.test(trimmed)) {
      return {
        isValid: false,
        code: 'TOO_SHORT_OR_MEANINGLESS',
        reason: `Output is meaningless short string ("${trimmed}")`,
      };
    }
    return {
      isValid: false,
      code: 'TOO_SHORT_OR_MEANINGLESS',
      reason: `Output length (${trimmed.length} chars) is below minimum required (${minLen} chars)`,
    };
  }

  // 3. Kiểm tra Raw Provider Errors
  if (containsRawProviderError(trimmed)) {
    return {
      isValid: false,
      code: 'RAW_PROVIDER_ERROR',
      reason: 'Output contains raw technical provider error or stacktrace signature',
    };
  }

  // 4. Kiểm tra Prompt & Special Token Leakage
  if (containsPromptLeakage(trimmed)) {
    return {
      isValid: false,
      code: 'PROMPT_LEAKAGE',
      reason: 'Output contains system prompt, instruction delimiters, or special token leakage',
    };
  }

  // 5. Kiểm tra Malformed JSON Dump
  if (detectMalformedJsonDump(trimmed)) {
    return {
      isValid: false,
      code: 'MALFORMED_JSON_DUMP',
      reason: 'Output contains raw JSON dump or truncated JSON structure instead of natural chat response',
    };
  }

  // 6. Kiểm tra Repetitive Sampling Loop
  if (detectRepetitiveLoop(trimmed, maxRepeat)) {
    return {
      isValid: false,
      code: 'REPETITIVE_LOOP',
      reason: 'Output contains degenerate repetitive token looping from model sampling anomaly',
    };
  }

  // 7. Kiểm tra Markdown Code Fence & Auto Repair
  let sanitizedText = trimmed;
  let repairedFences = false;

  const fenceMatches = trimmed.match(/```/g);
  const fenceCount = fenceMatches ? fenceMatches.length : 0;
  if (fenceCount % 2 !== 0) {
    if (allowRepair) {
      const repairResult = repairMarkdownFences(trimmed);
      sanitizedText = repairResult.repairedText;
      repairedFences = repairResult.wasRepaired;
    } else {
      return {
        isValid: false,
        code: 'UNCLOSED_MARKDOWN_BLOCK',
        reason: 'Output contains unclosed markdown code block fences (odd number of ```)',
      };
    }
  }

  return {
    isValid: true,
    sanitizedText,
    repairedFences,
  };
}
