/**
 * ─────────────────────────────────────────────────────────────────────────────
 * GEMINI API CLIENT WITH LIVE GOOGLE SEARCH GROUNDING (Single Responsibility)
 * Du Lịch Tri Tôn AI Assistant System
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { recordKeyUsage, setKeyCooldown } from './config';

export interface GeminiCallResult {
  text: string;
  provider: string;
}

/**
 * Gọi Google Gemini 2.0 Flash với Live Google Search Grounding
 * Bắt lỗi 429 / 403 / 500 cực nhanh (<150ms) để báo hiệu failover tức thì
 */
export async function callGeminiLiveSearch(
  key: string,
  keyId: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
  timeoutMs = 4500
): Promise<GeminiCallResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // 1. Thử gọi với Google Search Grounding (Live Internet Facts)
    let res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          tools: [{ googleSearch: {} }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        }),
        signal: controller.signal,
      }
    );

    // 2. Nếu model tier không hỗ trợ tools -> fallback gọi standard không tools
    if (!res.ok && (res.status === 400 || res.status === 404)) {
      res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2048,
            },
          }),
          signal: controller.signal,
        }
      );
    }

    clearTimeout(timer);

    // 3. Xử lý mã lỗi trả về nhanh (<150ms)
    if (!res.ok) {
      if (res.status === 429) {
        setKeyCooldown(keyId, 25000); // 25s cooldown
      } else if (res.status === 403 || res.status === 401) {
        setKeyCooldown(keyId, 60000);
      }
      throw new Error(`Gemini ${keyId} HTTP ${res.status}`);
    }

    recordKeyUsage(keyId);
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text || !text.trim()) {
      throw new Error(`Gemini ${keyId} returned empty text`);
    }

    return {
      text: text.trim(),
      provider: `gemini:${keyId}:${model} (Google Search Grounding)`,
    };
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}
