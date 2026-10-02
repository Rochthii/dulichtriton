/**
 * ─────────────────────────────────────────────────────────────────────────────
 * FALLBACK CLIENTS (GROQ ROUND-ROBIN & OPENROUTER NATIVE STREAMING)
 * Du Lịch Tri Tôn AI Assistant System
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { AI_CONFIG, isKeyInCooldown, recordKeyUsage, setKeyCooldown, getRoundRobinGroqKeys } from './config';

export interface FallbackCallResult {
  text: string;
  provider: string;
  model?: string;
}

export interface StreamChunk {
  type: 'delta' | 'done';
  content?: string;
  provider?: string;
  model?: string;
}

/**
 * Native SSE Stream từ Groq LPU siêu tốc (<300ms TTFT)
 */
export async function* streamGroqNative(
  systemPrompt: string,
  userPrompt: string,
  preferredModel?: string,
  abortSignal?: AbortSignal,
  timeoutMs = 2500
): AsyncGenerator<StreamChunk> {
  const groqKeyPool = getRoundRobinGroqKeys();

  if (groqKeyPool.length === 0) {
    throw new Error('No Groq keys available');
  }

  const modelsToTry = preferredModel
    ? [preferredModel, ...AI_CONFIG.groqModels.filter(m => m !== preferredModel)]
    : AI_CONFIG.groqModels;

  let localAbort: AbortController | null = null;
  let localTimer: NodeJS.Timeout | null = null;
  if (!abortSignal) {
    localAbort = new AbortController();
    localTimer = setTimeout(() => {
      localAbort?.abort(new Error(`Groq stream timeout exceeded after ${timeoutMs}ms`));
    }, timeoutMs);
  }
  const effectiveSignal = abortSignal || localAbort?.signal;

  try {
    for (const keyObj of groqKeyPool) {
      for (const model of modelsToTry) {
        if (effectiveSignal?.aborted) return;

        try {
          const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${keyObj.key}`,
            },
            body: JSON.stringify({
              model,
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
              ],
              temperature: 0.6,
              max_tokens: 1536,
              stream: true,
            }),
            signal: effectiveSignal,
          });

          if (!res.ok) {
            if (res.status === 429) {
              setKeyCooldown(keyObj.id, 30000);
              console.warn(`[Groq Stream] Key ${keyObj.id} 429 Rate Limited. Switching key...`);
              break;
            }
            console.warn(`[Groq Stream] Key ${keyObj.id} / Model ${model} HTTP ${res.status}. Trying next...`);
            continue;
          }

          if (!res.body) {
            continue;
          }

          recordKeyUsage(keyObj.id);
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';
          let hasYielded = false;

          while (true) {
            if (effectiveSignal?.aborted) {
              reader.cancel().catch(() => {});
              return;
            }

            const { value, done } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed.startsWith('data:')) continue;
              const dataStr = trimmed.replace(/^data:\s*/, '').trim();
              if (!dataStr || dataStr === '[DONE]') continue;

              try {
                const parsed = JSON.parse(dataStr);
                const delta = parsed.choices?.[0]?.delta?.content;
                if (delta) {
                  hasYielded = true;
                  if (localTimer) {
                    clearTimeout(localTimer);
                    localTimer = null;
                  }
                  yield { type: 'delta', content: delta, provider: `groq-${keyObj.id}-${model}`, model };
                }
              } catch {
                // ignore parse errors on incomplete chunks
              }
            }
          }

          if (hasYielded) {
            if (localTimer) {
              clearTimeout(localTimer);
              localTimer = null;
            }
            yield { type: 'done', provider: `groq-${keyObj.id}-${model}`, model };
            return;
          }
        } catch (err: any) {
          if (err.name === 'AbortError' || effectiveSignal?.aborted) {
            return;
          }
          console.warn(`[Groq Stream] Key ${keyObj.id} / Model ${model} failed: ${err.message}`);
          continue;
        }
      }
    }
  } finally {
    if (localTimer) {
      clearTimeout(localTimer);
      localTimer = null;
    }
  }

  throw new Error('All Groq streaming keys and models exhausted');
}

/**
 * Gọi Groq LPU non-streaming (dùng cho Fallback hoặc Test)
 */
export async function callGroqFallback(
  systemPrompt: string,
  userPrompt: string,
  preferredModel?: string,
  timeoutMs = 3000
): Promise<FallbackCallResult> {
  const groqKeyPool = getRoundRobinGroqKeys();

  if (groqKeyPool.length === 0) {
    throw new Error('No Groq keys available');
  }

  const modelsToTry = preferredModel
    ? [preferredModel, ...AI_CONFIG.groqModels.filter(m => m !== preferredModel)]
    : AI_CONFIG.groqModels;

  for (const keyObj of groqKeyPool) {
    for (const model of modelsToTry) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${keyObj.key}`,
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            temperature: 0.6,
            max_tokens: 1536,
          }),
          signal: controller.signal,
        });

        clearTimeout(timer);

        if (!res.ok) {
          if (res.status === 429) {
            setKeyCooldown(keyObj.id, 30000);
            console.warn(`[Groq] Key ${keyObj.id} rate limited (429). Switching to next key...`);
            break;
          }
          console.warn(`[Groq] Key ${keyObj.id} / Model ${model} returned HTTP ${res.status}. Trying next...`);
          continue;
        }

        recordKeyUsage(keyObj.id);
        const data = await res.json();
        const text = data?.choices?.[0]?.message?.content;

        if (text && text.trim()) {
          return {
            text: text.trim(),
            provider: `groq-${keyObj.id}-${model}`,
          };
        }
      } catch (err: any) {
        clearTimeout(timer);
        if (err.name === 'AbortError') {
          console.warn(`[Groq] Key ${keyObj.id} / Model ${model} timeout (${timeoutMs}ms). Trying next...`);
        } else {
          console.warn(`[Groq] Key ${keyObj.id} / Model ${model} exception: ${err.message}`);
        }
        continue;
      }
    }
  }

  throw new Error('All Groq keys and models exhausted');
}

/**
 * Native SSE Stream từ OpenRouter Free Model
 */
export async function* streamOpenRouterNative(
  systemPrompt: string,
  userPrompt: string,
  model = 'google/gemma-2-27b-it',
  abortSignal?: AbortSignal
): AsyncGenerator<StreamChunk> {
  const modelKeyId = `openrouter_${model}`;
  if (!AI_CONFIG.openRouterKey || isKeyInCooldown(modelKeyId)) {
    throw new Error(`OpenRouter ${model} not available`);
  }

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${AI_CONFIG.openRouterKey}`,
        'HTTP-Referer': 'https://dulichtriton.vercel.app',
        'X-Title': 'Du Lich Tri Ton AI',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.6,
        max_tokens: 1024,
        stream: true,
      }),
      signal: abortSignal,
    });

    if (!res.ok) {
      if (res.status === 429) {
        setKeyCooldown(modelKeyId, 60000);
      }
      throw new Error(`OpenRouter HTTP ${res.status}`);
    }

    if (!res.body) {
      throw new Error('No OpenRouter stream body');
    }

    recordKeyUsage('openrouter');
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let hasYielded = false;

    while (true) {
      if (abortSignal?.aborted) {
        reader.cancel().catch(() => {});
        return;
      }

      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;
        const dataStr = trimmed.replace(/^data:\s*/, '').trim();
        if (!dataStr || dataStr === '[DONE]') continue;

        try {
          const parsed = JSON.parse(dataStr);
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) {
            hasYielded = true;
            yield { type: 'delta', content: delta, provider: `openrouter-${model}`, model };
          }
        } catch {
          // ignore chunk error
        }
      }
    }

    if (hasYielded) {
      yield { type: 'done', provider: `openrouter-${model}`, model };
      return;
    }
  } catch (err: any) {
    if (err.name === 'AbortError' || abortSignal?.aborted) return;
    throw new Error(`OpenRouter streaming failed: ${err.message}`);
  }
}

/**
 * Gọi OpenRouter non-streaming
 */
export async function callOpenRouterFallback(
  systemPrompt: string,
  userPrompt: string,
  model = 'google/gemma-2-27b-it',
  timeoutMs = 2000
): Promise<FallbackCallResult> {
  const modelKeyId = `openrouter_${model}`;
  if (!AI_CONFIG.openRouterKey || isKeyInCooldown(modelKeyId)) {
    throw new Error(`OpenRouter ${model} not available`);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${AI_CONFIG.openRouterKey}`,
        'HTTP-Referer': 'https://dulichtriton.vercel.app',
        'X-Title': 'Du Lich Tri Ton AI',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.6,
        max_tokens: 1024,
      }),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!res.ok) {
      if (res.status === 429) {
        setKeyCooldown(modelKeyId, 60000);
      }
      throw new Error(`OpenRouter HTTP ${res.status}`);
    }

    recordKeyUsage('openrouter');
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content;

    if (text && text.trim()) {
      return { text: text.trim(), provider: `openrouter-${model}` };
    }
    throw new Error('OpenRouter returned empty response');
  } catch (err: any) {
    clearTimeout(timer);
    throw new Error(`OpenRouter ${model} failed: ${err.message}`);
  }
}


