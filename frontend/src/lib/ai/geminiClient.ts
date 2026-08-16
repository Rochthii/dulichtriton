/**
 * ─────────────────────────────────────────────────────────────────────────────
 * GEMINI API CLIENT WITH LIVE GOOGLE SEARCH GROUNDING (Single Responsibility)
 * Du Lịch Tri Tôn AI Assistant System
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { AI_CONFIG, recordKeyUsage, setKeyCooldown } from './config';

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
  preferredModel: string,
  systemPrompt: string,
  userPrompt: string,
  timeoutMs = 4000
): Promise<GeminiCallResult> {
  const models = preferredModel
    ? [preferredModel, ...AI_CONFIG.geminiModels.filter(m => m !== preferredModel)]
    : AI_CONFIG.geminiModels;

  for (const model of models) {
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

      // 2. Nếu model không hỗ trợ tools -> fallback gọi standard không tools
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

      if (!res.ok) {
        if (res.status === 429) {
          setKeyCooldown(keyId, 30000);
          throw new Error(`Gemini ${keyId} Rate Limited (HTTP 429)`);
        }
        console.warn(`[Gemini] Model ${model} on ${keyId} returned HTTP ${res.status}. Trying next model...`);
        continue;
      }

      recordKeyUsage(keyId);
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (text && text.trim()) {
        return {
          text: text.trim(),
          provider: `gemini:${keyId}:${model}`,
        };
      }
    } catch (err: any) {
      clearTimeout(timer);
      if (err.message.includes('Rate Limited') || err.message.includes('429')) {
        throw err;
      }
      console.warn(`[Gemini] ${keyId} model ${model} failed (${err.message}).`);
      continue;
    }
  }

  throw new Error(`All Gemini models failed on ${keyId}`);
}
