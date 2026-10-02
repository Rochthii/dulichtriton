/**
 * ─────────────────────────────────────────────────────────────────────────────
 * CHAT GROQ TIMEOUT & SEQUENTIAL FAILOVER HELPER (P04-015)
 * Du Lịch Tri Tôn AI Assistant System
 * 
 * Tuân thủ Decision Record DR-LLM-STRATEGY-001 (P04-014):
 * - GROQ_PRIMARY_TIMEOUT_MS = 2500ms
 * - GEMINI_SECONDARY_TIMEOUT_MS = 6000ms
 * - OPENROUTER_TERTIARY_TIMEOUT_MS = 5000ms
 * - LOCAL_RAG_TIMEOUT_MS = 0ms
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const GROQ_PRIMARY_TIMEOUT_MS = 2500;
export const GEMINI_SECONDARY_TIMEOUT_MS = 6000;
export const OPENROUTER_TERTIARY_TIMEOUT_MS = 5000;
export const LOCAL_RAG_TIMEOUT_MS = 0;

export function getGroqPrimaryTimeoutMs(overrideMs?: number): number {
  if (typeof overrideMs === 'number' && overrideMs > 0) return overrideMs;
  if (typeof process !== 'undefined' && process.env) {
    const envVal = process.env.AI_GROQ_PRIMARY_TIMEOUT_MS || process.env.GROQ_TIMEOUT_MS;
    if (envVal) {
      const parsed = parseInt(envVal, 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
  }
  return GROQ_PRIMARY_TIMEOUT_MS;
}

export interface BoundedTimeoutController {
  controller: AbortController;
  signal: AbortSignal;
  cleanup: () => void;
  isTimedOut: () => boolean;
  timeoutMs: number;
}

/**
 * Tạo bộ điều khiển Bounded Timeout với AbortController và timer tự động dọn dẹp
 */
export function createBoundedTimeoutController(timeoutMs?: number): BoundedTimeoutController {
  const effectiveTimeout = getGroqPrimaryTimeoutMs(timeoutMs);
  const controller = new AbortController();
  let timedOut = false;

  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort(new Error(`Groq Primary timeout exceeded after ${effectiveTimeout}ms`));
  }, effectiveTimeout);

  const cleanup = () => {
    clearTimeout(timer);
  };

  return {
    controller,
    signal: controller.signal,
    cleanup,
    isTimedOut: () => timedOut,
    timeoutMs: effectiveTimeout,
  };
}

import { containsRawProviderError } from './chatOutputSchemaValidator';

export interface StreamOutputChunk {
  type: 'delta' | 'done';
  content?: string;
  provider?: string;
  model?: string;
  providerFallback?: boolean;
}

export interface SequentialFailoverOptions {
  groqTimeoutMs?: number;
  onGroqTimeout?: (elapsedMs: number) => void;
  onFailoverTriggered?: (fromProvider: string, toProvider: string, reason: string) => void;
  onPrimaryStreamError?: (err: Error, partialTextSoFar: string) => void;
  onPrimaryMalformedOutput?: (rawContent: string, reason: string) => void;
}

/**
 * Điều phối gọi tuần tự Tầng 1 (Groq) với Bounded Timeout 2500ms -> Chuyển Tầng 2 (Gemini) khi quá hạn
 * Sử dụng Promise.race giữa TTFT của Groq và Timeout Promise để bảo đảm thời điểm failover chuẩn xác
 */
export async function* orchestrateGroqWithFailover(
  primaryStreamFn: (signal: AbortSignal) => AsyncGenerator<StreamOutputChunk>,
  fallbackStreamFn: (signal: AbortSignal) => AsyncGenerator<StreamOutputChunk>,
  options?: SequentialFailoverOptions
): AsyncGenerator<StreamOutputChunk> {
  const timeoutMs = getGroqPrimaryTimeoutMs(options?.groqTimeoutMs);
  const bounded = createBoundedTimeoutController(timeoutMs);
  const secondaryAbort = new AbortController();

  let hasReceivedFirstToken = false;
  let accumulatedPrimaryText = '';
  let activeProvider = '';
  let activeModel = '';
  const startTime = Date.now();

  const timeoutPromise = new Promise<never>((_, reject) => {
    if (bounded.signal.aborted) {
      reject(new Error(`Groq Primary timeout exceeded after ${timeoutMs}ms`));
    } else {
      bounded.signal.addEventListener(
        'abort',
        () => {
          reject(new Error(`Groq Primary timeout exceeded after ${timeoutMs}ms`));
        },
        { once: true }
      );
    }
  });

  const primaryGen = primaryStreamFn(bounded.signal);

  try {
    while (true) {
      // Đua với timeout cho đến khi nhận được token đầu tiên (TTFT bounded guard)
      const nextResult = !hasReceivedFirstToken
        ? await Promise.race([primaryGen.next(), timeoutPromise])
        : await primaryGen.next();

      if (nextResult.done) {
        break;
      }

      const chunk = nextResult.value;
      if (chunk.type === 'delta' && chunk.content) {
        if (!hasReceivedFirstToken) {
          // P04-018: Kiểm tra nếu token/chunk đầu tiên là raw provider error (chặn và fallback)
          if (containsRawProviderError(chunk.content)) {
            options?.onPrimaryMalformedOutput?.(chunk.content, 'RAW_PROVIDER_ERROR');
            options?.onFailoverTriggered?.(
              'groq-primary',
              'gemini-secondary',
              `Primary returned raw error: ${chunk.content.slice(0, 80)}`
            );
            try {
              if (typeof primaryGen.return === 'function') {
                const retPromise = primaryGen.return(undefined as any);
                if (retPromise && typeof retPromise.catch === 'function') {
                  retPromise.catch(() => {});
                }
              }
            } catch {}
            break; // Thoát vòng lặp, nhảy xuống khối !hasReceivedFirstToken để kích hoạt fallbackStreamFn
          }

          hasReceivedFirstToken = true;
          bounded.cleanup(); // Hủy timeout timer ngay khi token đầu tiên xuất hiện
          activeProvider = chunk.provider || 'groq-lpu';
          activeModel = chunk.model || 'llama-3.3-70b-versatile';
          secondaryAbort.abort();
        }
        accumulatedPrimaryText += chunk.content;
        yield {
          type: 'delta',
          content: chunk.content,
          provider: activeProvider,
          model: activeModel || chunk.model,
          providerFallback: false,
        };
      }

      if (chunk.type === 'done') {
        bounded.cleanup();
        yield {
          type: 'done',
          provider: activeProvider || chunk.provider,
          model: activeModel || chunk.model,
          providerFallback: false,
        };
        return;
      }
    }
  } catch (err: any) {
    bounded.cleanup();
    try {
      if (typeof primaryGen.return === 'function') {
        const retPromise = primaryGen.return(undefined as any);
        if (retPromise && typeof retPromise.catch === 'function') {
          retPromise.catch(() => {});
        }
      }
    } catch {
      // ignore generator cancel error
    }

    const elapsed = Date.now() - startTime;
    const isTimeout = bounded.isTimedOut() || bounded.signal.aborted || err?.message?.includes('timeout');
    if (isTimeout) {
      options?.onGroqTimeout?.(elapsed);
      options?.onFailoverTriggered?.('groq-primary', 'gemini-secondary', `Timeout exceeded ${timeoutMs}ms`);
    } else {
      const streamErr = err instanceof Error ? err : new Error(String(err));
      options?.onPrimaryStreamError?.(streamErr, accumulatedPrimaryText);
      options?.onFailoverTriggered?.('groq-primary', 'gemini-secondary', `Stream error: ${streamErr.message}`);
    }
  } finally {
    bounded.cleanup();
  }

  // Nếu Groq không yield bất kỳ token nào (do timeout hoặc stream error) -> Failover sang Secondary Provider
  if (!hasReceivedFirstToken) {
    const elapsed = Date.now() - startTime;
    if (bounded.isTimedOut() || bounded.signal.aborted) {
      options?.onGroqTimeout?.(elapsed);
      options?.onFailoverTriggered?.('groq-primary', 'gemini-secondary', `Timeout exceeded ${timeoutMs}ms`);
    }

    try {
      const fallbackGen = fallbackStreamFn(secondaryAbort.signal);
      for await (const chunk of fallbackGen) {
        if (chunk.type === 'delta' && chunk.content) {
          hasReceivedFirstToken = true;
          activeProvider = chunk.provider || 'gemini-failover';
          activeModel = chunk.model || 'gemini-flash';
          yield {
            type: 'delta',
            content: chunk.content,
            provider: activeProvider,
            model: activeModel || chunk.model,
            providerFallback: true,
          };
        }

        if (chunk.type === 'done') {
          yield {
            type: 'done',
            provider: activeProvider || chunk.provider,
            model: activeModel || chunk.model,
            providerFallback: true,
          };
          return;
        }
      }
    } catch (fallbackErr: any) {
      throw fallbackErr;
    }
  } else {
    // Trường hợp Groq stream error giữa chừng sau khi đã phát một phần token:
    // Đảm bảo downstream consumer nhận được tín hiệu hoàn tất, không bị treo socket
    yield {
      type: 'done',
      provider: activeProvider || 'groq-lpu-interrupted',
      model: activeModel || 'llama-3.3-70b-versatile',
    };
  }
}

