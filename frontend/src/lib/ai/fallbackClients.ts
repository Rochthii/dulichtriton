/**
 * ─────────────────────────────────────────────────────────────────────────────
 * FALLBACK CLIENTS (GROQ ROUND-ROBIN & OPENROUTER) (Single Responsibility)
 * Du Lịch Tri Tôn AI Assistant System
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { AI_CONFIG, isKeyInCooldown, recordKeyUsage, setKeyCooldown, getRoundRobinGroqKeys } from './config';

export interface FallbackCallResult {
  text: string;
  provider: string;
}

/**
 * Gọi Groq LPU siêu tốc với Round-Robin đa Key + Auto Model Failover
 * Hỗ trợ tối đa 4 Groq Keys xoay vòng, tránh bị 429 khi tải cao
 */
export async function callGroqFallback(
  systemPrompt: string,
  userPrompt: string,
  preferredModel?: string,
  timeoutMs = 3000   // Giảm từ 4500ms → 3000ms để failover nhanh hơn
): Promise<FallbackCallResult> {
  const groqKeyPool = getRoundRobinGroqKeys();

  if (groqKeyPool.length === 0) {
    throw new Error('No Groq keys available');
  }

  const modelsToTry = preferredModel
    ? [preferredModel, ...AI_CONFIG.groqModels.filter(m => m !== preferredModel)]
    : AI_CONFIG.groqModels;

  // Xoay vòng qua từng Key → thử từng Model
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
            // Key này bị rate limit → đặt cooldown và thử key tiếp theo
            setKeyCooldown(keyObj.id, 30000);
            console.warn(`[Groq] Key ${keyObj.id} rate limited (429). Switching to next key...`);
            break; // Thoát vòng model, chuyển sang key tiếp theo
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
 * Gọi OpenRouter — Chỉ dùng model Gemma-4 tốt nhất cho Tiếng Việt
 * Timeout 2000ms (giảm từ 5000ms) → failover nhanh sang LocalRAG
 */
export async function callOpenRouterFallback(
  systemPrompt: string,
  userPrompt: string,
  model = 'google/gemma-4-31b-it:free',
  timeoutMs = 2000    // Giảm từ 5000ms → 2000ms
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


