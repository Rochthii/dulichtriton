/**
 * ─────────────────────────────────────────────────────────────────────────────
 * FALLBACK CLIENTS (GROQ & OPENROUTER) (Single Responsibility)
 * Du Lịch Tri Tôn AI Assistant System
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { AI_CONFIG, isKeyInCooldown, recordKeyUsage, setKeyCooldown } from './config';

export interface FallbackCallResult {
  text: string;
  provider: string;
}

/**
 * Gọi Groq Llama 3.3 70B siêu tốc (<700ms)
 */
export async function callGroqFallback(
  systemPrompt: string,
  userPrompt: string,
  model = 'llama-3.3-70b-versatile',
  timeoutMs = 4500
): Promise<FallbackCallResult> {
  if (!AI_CONFIG.groqKey || isKeyInCooldown('groq')) {
    throw new Error('Groq key not available or in cooldown');
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${AI_CONFIG.groqKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!res.ok) {
      if (res.status === 429) setKeyCooldown('groq', 30000);
      throw new Error(`Groq HTTP ${res.status}`);
    }

    recordKeyUsage('groq');
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content;

    if (!text || !text.trim()) {
      throw new Error('Groq returned empty text');
    }

    return {
      text: text.trim(),
      provider: `groq:${model}`,
    };
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

/**
 * Gọi OpenRouter Free Models
 */
export async function callOpenRouterFallback(
  systemPrompt: string,
  userPrompt: string,
  model = 'nvidia/nemotron-3-nano-30b-a3b:free',
  timeoutMs = 5000
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
        'HTTP-Referer': 'https://dulichtriton.vn',
        'X-Title': 'Du Lich Tri Ton AI',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!res.ok) {
      if (res.status === 429) setKeyCooldown(modelKeyId, 45000);
      throw new Error(`OpenRouter HTTP ${res.status}`);
    }

    recordKeyUsage('openrouter');
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content;

    if (!text || !text.trim()) {
      throw new Error(`OpenRouter ${model} returned empty text`);
    }

    return {
      text: text.trim(),
      provider: `openrouter:${model}`,
    };
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}
