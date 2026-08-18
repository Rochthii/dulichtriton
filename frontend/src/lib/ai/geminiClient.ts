/**
 * ─────────────────────────────────────────────────────────────────────────────
 * GEMINI API CLIENT WITH NATIVE SSE STREAMING & GOOGLE SEARCH GROUNDING
 * Du Lịch Tri Tôn AI Assistant System
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { AI_CONFIG, recordKeyUsage, setKeyCooldown } from './config';
import type { StreamChunk } from './fallbackClients';

export interface GeminiCallResult {
  text: string;
  provider: string;
}

/**
 * Native SSE Streaming từ Gemini 2.0 Flash Lite & Google Search Grounding
 */
export async function* streamGeminiNative(
  key: string,
  keyId: string,
  preferredModel: string,
  systemPrompt: string,
  userPrompt: string,
  enableSearch = false,
  abortSignal?: AbortSignal
): AsyncGenerator<StreamChunk> {
  const models = preferredModel
    ? [preferredModel, ...AI_CONFIG.geminiModels.filter(m => m !== preferredModel)]
    : AI_CONFIG.geminiModels;

  for (const model of models) {
    if (abortSignal?.aborted) return;

    try {
      const payload: Record<string, unknown> = {
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      };

      if (enableSearch) {
        payload.tools = [{ googleSearch: {} }];
      }

      let res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: abortSignal,
        }
      );

      // Nếu model không hỗ trợ search tools -> thử lại không tools
      if (!res.ok && enableSearch && (res.status === 400 || res.status === 404)) {
        delete payload.tools;
        res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${key}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: abortSignal,
          }
        );
      }

      if (!res.ok) {
        if (res.status === 429) {
          setKeyCooldown(keyId, 30000);
          console.warn(`[Gemini Stream] ${keyId} Rate Limited (429).`);
          throw new Error(`Gemini ${keyId} 429`);
        }
        console.warn(`[Gemini Stream] Model ${model} on ${keyId} HTTP ${res.status}. Trying next...`);
        continue;
      }

      if (!res.body) {
        continue;
      }

      recordKeyUsage(keyId);
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
            const delta = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
            if (delta) {
              hasYielded = true;
              yield { type: 'delta', content: delta, provider: `gemini-${keyId}-${model}` };
            }
          } catch {
            // ignore JSON parse partial
          }
        }
      }

      if (hasYielded) {
        yield { type: 'done', provider: `gemini-${keyId}-${model}` };
        return;
      }
    } catch (err: any) {
      if (err.name === 'AbortError' || abortSignal?.aborted) return;
      if (err.message.includes('429')) throw err;
      console.warn(`[Gemini Stream] ${keyId} / Model ${model} failed: ${err.message}`);
      continue;
    }
  }

  throw new Error(`All Gemini streaming models exhausted on ${keyId}`);
}

/**
 * Gọi Google Gemini 2.0 Flash với Live Google Search Grounding (non-streaming)
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

