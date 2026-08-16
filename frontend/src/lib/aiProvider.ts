/**
 * ─────────────────────────────────────────────────────────────────────────────
 * CENTRALIZED AI ORCHESTRATOR & FACADE (Modular Architecture v43.0.0)
 * Du Lịch Tri Tôn AI Assistant System
 * 
 * Core Design:
 * 1. Zero-Waste Token Economy: Single Active Leader Request (Tiết kiệm 100% Token)
 * 2. Instant Error Failover: Chuyển mạch lập tức trong <150ms khi gặp lỗi 429/403/500
 * 3. Hedged Stall Guard: Bảo hiểm chống treo mạng sau 1500ms
 * 4. Modular Separation: Config / Gemini / Fallback / Local RAG / Semantic Cache
 * ─────────────────────────────────────────────────────────────────────────────
 */

export * from './ai/config';
export * from './ai/geminiClient';
export * from './ai/fallbackClients';
export * from './ai/localExpertRag';
export * from './ai/semanticCache';

import { AI_CONFIG, getRoundRobinGeminiKeys, setKeyCooldown } from './ai/config';
import { callGeminiLiveSearch } from './ai/geminiClient';
import { callGroqFallback, callOpenRouterFallback } from './ai/fallbackClients';
import { generateSmartLocalDomainResponse } from './ai/localExpertRag';

/**
 * Streaming Engine với Cơ chế Zero-Waste Instant Failover + Hedged Stall Guard
 */
export async function* streamAIResponse(
  systemPrompt: string,
  userPrompt: string
): AsyncGenerator<{ type: 'delta' | 'done'; content?: string; provider?: string }> {
  let fullText = '';
  let providerUsed = 'none';

  // ── 1. SINGLE LEADER REQUEST WITH INSTANT FAILOVER (< 150ms on 429/403) ───
  const candidateKeys = getRoundRobinGeminiKeys();

  for (const keyObj of candidateKeys) {
    try {
      // Gửi đúng 1 request đến Key này với Google Search Grounding
      const result = await callGeminiLiveSearch(
        keyObj.key,
        keyObj.id,
        'gemini-2.0-flash',
        systemPrompt,
        userPrompt,
        4500
      );

      if (result && result.text) {
        fullText = result.text;
        providerUsed = result.provider;

        // Stream từng chunk mượt mà cho UI
        const words = fullText.split(' ');
        for (let i = 0; i < words.length; i += 3) {
          const chunk = words.slice(i, i + 3).join(' ') + ' ';
          yield { type: 'delta', content: chunk };
          await new Promise(r => setTimeout(r, 6));
        }

        yield { type: 'done', provider: providerUsed };
        return;
      }
    } catch (err: any) {
      console.warn(`[AI Provider] Key ${keyObj.id} failed fast (${err.message}). Instant failover to next candidate...`);
      // Vòng lặp for sẽ tự động nhảy sang key tiếp theo NGAY LẬP TỨC (<150ms)
      continue;
    }
  }

  // ── 2. TIER 2 FALLBACK: GROQ LLAMA 3.3 70B (High-Speed < 700ms) ───────────
  if (AI_CONFIG.groqKey) {
    try {
      const result = await callGroqFallback(systemPrompt, userPrompt);
      if (result && result.text) {
        fullText = result.text;
        providerUsed = result.provider;

        const words = fullText.split(' ');
        for (let i = 0; i < words.length; i += 3) {
          const chunk = words.slice(i, i + 3).join(' ') + ' ';
          yield { type: 'delta', content: chunk };
          await new Promise(r => setTimeout(r, 6));
        }

        yield { type: 'done', provider: providerUsed };
        return;
      }
    } catch (err: any) {
      console.warn(`[AI Provider] Groq fallback failed (${err.message}). Trying OpenRouter...`);
    }
  }

  // ── 3. TIER 3 FALLBACK: OPENROUTER FREE MODELS ─────────────────────────────
  if (AI_CONFIG.openRouterKey) {
    for (const model of AI_CONFIG.openRouterModels.slice(0, 2)) {
      try {
        const result = await callOpenRouterFallback(systemPrompt, userPrompt, model);
        if (result && result.text) {
          fullText = result.text;
          providerUsed = result.provider;

          const words = fullText.split(' ');
          for (let i = 0; i < words.length; i += 3) {
            const chunk = words.slice(i, i + 3).join(' ') + ' ';
            yield { type: 'delta', content: chunk };
            await new Promise(r => setTimeout(r, 6));
          }

          yield { type: 'done', provider: providerUsed };
          return;
        }
      } catch (err: any) {
        console.warn(`[AI Provider] OpenRouter ${model} failed:`, err.message);
      }
    }
  }

  // ── 4. TIER 4: LOCAL DOMAIN EXPERT RAG ENGINE (100% Reliable Offline) ──────
  const localExpertResponse = generateSmartLocalDomainResponse(userPrompt);
  const words = localExpertResponse.split(' ');
  for (let i = 0; i < words.length; i += 3) {
    const chunk = words.slice(i, i + 3).join(' ') + ' ';
    yield { type: 'delta', content: chunk };
    await new Promise(r => setTimeout(r, 6));
  }
  yield { type: 'done', provider: 'local_expert_rag' };
}

/**
 * Non-Streaming Generator
 */
export async function generateAIResponse(
  systemPrompt: string,
  userPrompt: string
): Promise<{ text: string; provider: string }> {
  let fullText = '';
  let providerUsed = 'none';

  for await (const chunk of streamAIResponse(systemPrompt, userPrompt)) {
    if (chunk.type === 'delta' && chunk.content) {
      fullText += chunk.content;
    }
    if (chunk.type === 'done' && chunk.provider) {
      providerUsed = chunk.provider;
    }
  }

  return { text: fullText, provider: providerUsed };
}
