/**
 * ─────────────────────────────────────────────────────────────────────────────
 * CENTRALIZED AI ORCHESTRATOR & FACADE (High-Performance Engine v50.0.0)
 * Du Lịch Tri Tôn AI Assistant System
 * 
 * Core Design:
 * 1. Groq LPU First (Primary High-Speed LPU <800ms): Phản hồi siêu tốc 300 tokens/s
 * 2. Gemini Live Search Guard (Secondary Grounding): Cập nhật dữ liệu Google
 * 3. OpenRouter 100% Free Fallback: Bảo vệ chi phí 0đ
 * 4. Local Expert RAG: Đảm bảo 100% không bao giờ gián đoạn
 * ─────────────────────────────────────────────────────────────────────────────
 */

export * from './ai/config';
export * from './ai/geminiClient';
export * from './ai/fallbackClients';
export * from './ai/localExpertRag';
export * from './ai/semanticCache';

import { AI_CONFIG, getRoundRobinGeminiKeys } from './ai/config';
import { callGeminiLiveSearch } from './ai/geminiClient';
import { callGroqFallback, callOpenRouterFallback } from './ai/fallbackClients';
import { generateSmartLocalDomainResponse } from './ai/localExpertRag';

/**
 * Streaming Engine với Cơ chế High-Speed Groq Primary + Gemini Grounding Failover
 */
export async function* streamAIResponse(
  systemPrompt: string,
  userPrompt: string
): AsyncGenerator<{ type: 'delta' | 'done'; content?: string; provider?: string }> {
  let fullText = '';
  let providerUsed = 'none';

  // ── 1. TẦNG 1 (PRIMARY): GEMINI 4-KEYS WITH LIVE GOOGLE SEARCH GROUNDING ────
  const candidateKeys = getRoundRobinGeminiKeys();
  for (const keyObj of candidateKeys) {
    try {
      const result = await callGeminiLiveSearch(
        keyObj.key,
        keyObj.id,
        'gemini-flash-latest',
        systemPrompt,
        userPrompt,
        4000
      );

      if (result && result.text) {
        fullText = result.text;
        providerUsed = result.provider;

        const words = fullText.split(' ');
        for (let i = 0; i < words.length; i += 3) {
          const chunk = words.slice(i, i + 3).join(' ') + ' ';
          yield { type: 'delta', content: chunk };
          await new Promise(r => setTimeout(r, 8));
        }

        yield { type: 'done', provider: providerUsed };
        return;
      }
    } catch (err: any) {
      // Khi gặp 429 hoặc lỗi, bắt lỗi tức thì (<100ms) và thử key/tầng tiếp theo
      console.warn(`[AI Provider] Gemini Key ${keyObj.id} skipped (${err.message}). Instant failover...`);
      continue;
    }
  }

  // ── 2. TẦNG 2 (SECONDARY): GROQ LPU MULTI-MODEL POOL (Siêu Tốc <500ms) ──────
  if (AI_CONFIG.groqKey) {
    try {
      const result = await callGroqFallback(systemPrompt, userPrompt);
      if (result && result.text) {
        fullText = result.text;
        providerUsed = result.provider;

        // Stream mượt mà từng cụm từ
        const words = fullText.split(' ');
        for (let i = 0; i < words.length; i += 3) {
          const chunk = words.slice(i, i + 3).join(' ') + ' ';
          yield { type: 'delta', content: chunk };
          await new Promise(r => setTimeout(r, 8));
        }

        yield { type: 'done', provider: providerUsed };
        return;
      }
    } catch (err: any) {
      console.warn(`[AI Provider] Groq multi-model pool exhausted (${err.message}). Trying OpenRouter...`);
    }
  }

  // ── 3. TIER 3: OPENROUTER FREE MULTI-MODEL POOL (100% Free Fallback) ──────
  if (AI_CONFIG.openRouterKey) {
    for (const model of AI_CONFIG.openRouterModels) {
      try {
        const result = await callOpenRouterFallback(systemPrompt, userPrompt, model);
        if (result && result.text) {
          fullText = result.text;
          providerUsed = result.provider;

          const words = fullText.split(' ');
          for (let i = 0; i < words.length; i += 3) {
            const chunk = words.slice(i, i + 3).join(' ') + ' ';
            yield { type: 'delta', content: chunk };
            await new Promise(r => setTimeout(r, 8));
          }

          yield { type: 'done', provider: providerUsed };
          return;
        }
      } catch (err: any) {
        console.warn(`[AI Provider] OpenRouter model ${model} failed (${err.message}). Trying next free model...`);
      }
    }
  }

  // ── 4. TIER 4: LOCAL DOMAIN EXPERT RAG ENGINE (100% Offline Guarantee) ─────
  const localExpertResponse = generateSmartLocalDomainResponse(userPrompt);
  const words = localExpertResponse.split(' ');
  for (let i = 0; i < words.length; i += 3) {
    const chunk = words.slice(i, i + 3).join(' ') + ' ';
    yield { type: 'delta', content: chunk };
    await new Promise(r => setTimeout(r, 8));
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
