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

import { AI_CONFIG, getRoundRobinGeminiKeys } from './ai/config';
import { callGeminiLiveSearch } from './ai/geminiClient';
import { callGroqFallback, callOpenRouterFallback } from './ai/fallbackClients';
import { generateSmartLocalDomainResponse } from './ai/localExpertRag';
import { routeQueryIntent, applyTruthAnchor } from './ai/intentRouter';

export * from './ai/config';
export * from './ai/geminiClient';
export * from './ai/fallbackClients';
export * from './ai/localExpertRag';
export * from './ai/semanticCache';
export * from './ai/intentRouter';

/**
 * Streaming Engine với Cơ chế Quad-Path Intent-Gated & Truth Anchor Guard v75.0.0
 * 
 * 1. LUỒNG 1: SOS Khẩn cấp (< 30ms) -> Trả thẳng Hotline Công an / Cấp cứu
 * 2. LUỒNG 3: 80% Tra cứu POIs / Ẩm thực -> Groq LPU Siêu tốc (< 200ms)
 * 3. LUỒNG 4: 20% Tin tức / Thời tiết -> Gemini Google Search + Truth Anchor
 * 4. LUỒNG Dự phòng: OpenRouter Free -> Local Expert RAG
 */
export async function* streamAIResponse(
  systemPrompt: string,
  userPrompt: string
): AsyncGenerator<{ type: 'delta' | 'done'; content?: string; provider?: string }> {
  // ── 1. LUỒNG 1: SOS KHẨN CẤP (< 30ms BYPASS TOÀN BỘ LLM) ───────────────────
  const analysis = routeQueryIntent(userPrompt);
  if (analysis.intent === 'SOS_EMERGENCY' && analysis.emergencyPayload) {
    const words = analysis.emergencyPayload.split(' ');
    for (let i = 0; i < words.length; i += 4) {
      const chunk = words.slice(i, i + 4).join(' ') + ' ';
      yield { type: 'delta', content: chunk };
      await new Promise(r => setTimeout(r, 4));
    }
    yield { type: 'done', provider: 'emergency_instant_bypass' };
    return;
  }

  let fullText = '';
  let providerUsed = 'none';

  // ── 2. LUỒNG 4: NẾU LÀ CÂU HỎI THỜI GIAN THỰC / TIN TỨC -> GỌI GOOGLE SEARCH ──
  if (analysis.intent === 'REALTIME_GROUNDED_SEARCH') {
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
          // Áp dụng Mỏ neo Chân lý (Truth Anchor) để lọc sạch thông tin rác từ mạng
          fullText = applyTruthAnchor(result.text);
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
        console.warn(`[AI Provider] Gemini Live Search Key ${keyObj.id} skipped (${err.message}). Failover to fast path...`);
        continue;
      }
    }
  }

  // ── 3. LUỒNG 3: 80% TRA CỨU POI / ẨM THỰC / LỊCH TRÌNH -> GROQ LPU SIÊU TỐC (<200ms) ─
  if (AI_CONFIG.groqKey) {
    try {
      const result = await callGroqFallback(systemPrompt, userPrompt);
      if (result && result.text) {
        fullText = applyTruthAnchor(result.text);
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
      console.warn(`[AI Provider] Groq high-speed LPU pool exhausted (${err.message}). Trying Gemini...`);
    }
  }

  // ── 4. FALLBACK TẦNG 2: GEMINI MULTI-KEY (NẾU CHƯA THỬ HOẶC GROQ BẬN) ────────
  const candidateKeys = getRoundRobinGeminiKeys();
  for (const keyObj of candidateKeys) {
    try {
      const result = await callGeminiLiveSearch(
        keyObj.key,
        keyObj.id,
        'gemini-flash-latest',
        systemPrompt,
        userPrompt,
        3500
      );

      if (result && result.text) {
        fullText = applyTruthAnchor(result.text);
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
      console.warn(`[AI Provider] Gemini Key ${keyObj.id} skipped (${err.message})...`);
      continue;
    }
  }

  // ── 5. FALLBACK TẦNG 3: OPENROUTER FREE MULTI-MODEL POOL ─────────────────────
  if (AI_CONFIG.openRouterKey) {
    for (const model of AI_CONFIG.openRouterModels) {
      try {
        const result = await callOpenRouterFallback(systemPrompt, userPrompt, model);
        if (result && result.text) {
          fullText = applyTruthAnchor(result.text);
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
        console.warn(`[AI Provider] OpenRouter model ${model} failed (${err.message})...`);
      }
    }
  }

  // ── 6. FALLBACK TẦNG 4: LOCAL DOMAIN EXPERT RAG (100% Offline Guarantee) ────
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
