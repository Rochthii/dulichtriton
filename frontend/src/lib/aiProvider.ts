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
 * Streaming Engine v77.0.0 — Resilient Multi-Tier AI Engine
 * 
 * 1. SOS Bypass       (< 30ms)   → Hotline ngay, không qua LLM
 * 2. REALTIME Search  (~800ms)  → Gemini Flash Lite Google Search + Truth Anchor
 * 3. LOCAL_POI Fast   (~300ms)  → Groq LPU Round-Robin (timeout 3500ms)
 * 4. Fallback Ladder  (~2s)     → Gemini Flash Lite → OpenRouter → Local Domain Expert RAG (100% Offline)
 */
export async function* streamAIResponse(
  systemPrompt: string,
  userPrompt: string
): AsyncGenerator<{ type: 'delta' | 'done'; content?: string; provider?: string }> {
  try {
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
            AI_CONFIG.geminiModels[0],
            systemPrompt,
            userPrompt,
            4000
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
          console.warn(`[AI Provider] Gemini Live Search Key ${keyObj.id} skipped (${err.message}). Failover to fast path...`);
          continue;
        }
      }
    }

    // ── 3. LUỒNG LOCAL_POI: GROQ LPU ROUND-ROBIN (80% CÂU HỎI ĐỊA ĐIỂM, ẨM THỰC) ─
    if (AI_CONFIG.groqKeys.length > 0) {
      try {
        const groqResult = await callGroqFallback(systemPrompt, userPrompt, undefined, 3500);
        if (groqResult && groqResult.text) {
          fullText = applyTruthAnchor(groqResult.text);
          providerUsed = groqResult.provider;

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
        console.warn(`[AI Provider] Groq pool exhausted (${err.message}). Failover to Gemini...`);
      }
    }

    // ── 4. FALLBACK TẦNG 2: GEMINI MULTI-KEY (NẾU GROQ BẬN HOẶC HẾT QUOTA) ───────
    const candidateKeys = getRoundRobinGeminiKeys();
    for (const keyObj of candidateKeys) {
      try {
        const result = await callGeminiLiveSearch(
          keyObj.key,
          keyObj.id,
          AI_CONFIG.geminiModels[0],
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

    // ── 5. FALLBACK TẦNG 3: OPENROUTER FREE MODEL ─────────────────────────────────
    if (AI_CONFIG.openRouterKey) {
      for (const model of AI_CONFIG.openRouterModels) {
        try {
          const result = await callOpenRouterFallback(systemPrompt, userPrompt, model, 2500);
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

  } catch (criticalErr: any) {
    console.error('[AI Provider] Critical stream recovery:', criticalErr);
    const localExpertResponse = generateSmartLocalDomainResponse(userPrompt);
    const words = localExpertResponse.split(' ');
    for (let i = 0; i < words.length; i += 3) {
      const chunk = words.slice(i, i + 3).join(' ') + ' ';
      yield { type: 'delta', content: chunk };
      await new Promise(r => setTimeout(r, 6));
    }
    yield { type: 'done', provider: 'local_expert_rag_shield' };
  }
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

