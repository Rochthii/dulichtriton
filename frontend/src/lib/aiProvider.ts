/**
 * ─────────────────────────────────────────────────────────────────────────────
 * CENTRALIZED AI ORCHESTRATOR & FACADE (High-Performance Native Engine v80.0.0)
 * Du Lịch Tri Tôn AI Assistant System
 * 
 * Core Design:
 * 1. SOS Instant Bypass (< 30ms): Cứu hộ khẩn cấp không qua LLM
 * 2. Realtime Grounded Search (Gemini Live Search Grounding SSE)
 * 3. Smart Hedging Racer (Groq LPU First 0ms ➔ Gemini Failover 600ms): TTFT < 300ms, tiết kiệm 85% quota
 * 4. Resilient Fallback (OpenRouter Free SSE ➔ Local Expert RAG 100% Offline)
 * 5. Truth Anchor v2.0 Sanitizer (Token-safe, bảo vệ 100% văn hóa Bảy Núi)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { AI_CONFIG, getRoundRobinGeminiKeys } from './ai/config';
import { streamGeminiNative, callGeminiLiveSearch } from './ai/geminiClient';
import { streamGroqNative, streamOpenRouterNative, callGroqFallback, callOpenRouterFallback } from './ai/fallbackClients';
import { generateSmartLocalDomainResponse } from './ai/localExpertRag';
import { routeQueryIntent, applyTruthAnchor } from './ai/intentRouter';
import { resolveAuditProvider, resolveAuditModel } from './chatAuditProviderHelper';
import { validateChatbotOutput } from './chatOutputSchemaValidator';
import { checkCitationCoverage } from './chatCitationCoverageGate';
import { detectPromptInjection } from './chatPromptInjectionGuard';

export * from './ai/config';
export * from './ai/geminiClient';
export * from './ai/fallbackClients';
export * from './ai/localExpertRag';
export * from './ai/semanticCache';
export * from './ai/intentRouter';
export * from './ai/ragEngine';
export * from './chatAuditProviderHelper';
export * from './chatGroqTimeoutHelper';
export * from './chatOutputSchemaValidator';
export * from './chatCitationCoverageGate';
export * from './chatPromptInjectionGuard';
export * from './chatPoisonedKnowledgeGuard';

import {
  GROQ_PRIMARY_TIMEOUT_MS,
  GEMINI_SECONDARY_TIMEOUT_MS,
  OPENROUTER_TERTIARY_TIMEOUT_MS,
  LOCAL_RAG_TIMEOUT_MS,
  getGroqPrimaryTimeoutMs,
  createBoundedTimeoutController,
  orchestrateGroqWithFailover,
} from './chatGroqTimeoutHelper';

export interface StreamOutputChunk {
  type: 'delta' | 'done';
  content?: string;
  provider?: string;
  model?: string;
}

export interface StreamAIOptions {
  groqTimeoutMs?: number;
  customGroqStream?: (
    systemPrompt: string,
    userPrompt: string,
    signal?: AbortSignal
  ) => AsyncGenerator<StreamOutputChunk>;
  customGeminiStream?: (
    systemPrompt: string,
    userPrompt: string,
    signal?: AbortSignal
  ) => AsyncGenerator<StreamOutputChunk>;
}

/**
 * Sequential Failover với Fast Bounded Timeout Native SSE Streaming Engine (DR-LLM-STRATEGY-001)
 */
export async function* streamAIResponse(
  systemPrompt: string,
  userPrompt: string,
  options?: StreamAIOptions
): AsyncGenerator<StreamOutputChunk> {
  // ── 0. LUỒNG 0: PROMPT INJECTION FIREWALL (P04-020: FAIL-CLOSED AN TOÀN) ───
  const injection = detectPromptInjection(userPrompt);
  if (injection.isInjection && injection.rejectionText) {
    const words = injection.rejectionText.split(' ');
    for (let i = 0; i < words.length; i += 4) {
      const chunk = words.slice(i, i + 4).join(' ') + ' ';
      yield { type: 'delta', content: chunk, provider: 'guard_prompt_injection_firewall', model: 'prompt-injection-firewall-v1' };
      await new Promise((r) => setTimeout(r, 4));
    }
    yield { type: 'done', provider: 'guard_prompt_injection_firewall', model: 'prompt-injection-firewall-v1' };
    return;
  }

  // ── 1. LUỒNG 1: SOS KHẨN CẤP (< 30ms BYPASS TOÀN BỘ LLM) ───────────────────
  const analysis = routeQueryIntent(userPrompt);
  if (analysis.intent === 'SOS_EMERGENCY' && analysis.emergencyPayload) {
    const words = analysis.emergencyPayload.split(' ');
    for (let i = 0; i < words.length; i += 4) {
      const chunk = words.slice(i, i + 4).join(' ') + ' ';
      yield { type: 'delta', content: chunk, provider: 'emergency_instant_bypass', model: 'emergency-instant-rule-engine' };
      await new Promise((r) => setTimeout(r, 4));
    }
    yield { type: 'done', provider: 'emergency_instant_bypass', model: 'emergency-instant-rule-engine' };
    return;
  }

  // ── 2. LUỒNG 2: THỜI GIAN THỰC & GOOGLE SEARCH GROUNDING ────────────────────
  if (analysis.intent === 'REALTIME_GROUNDED_SEARCH') {
    const candidateKeys = getRoundRobinGeminiKeys();
    for (const keyObj of candidateKeys) {
      try {
        const abortCtrl = new AbortController();
        const timer = setTimeout(() => abortCtrl.abort(), 6000);
        let hasYielded = false;

        for await (const chunk of streamGeminiNative(
          keyObj.key,
          keyObj.id,
          AI_CONFIG.geminiModels[0],
          systemPrompt,
          userPrompt,
          true,
          abortCtrl.signal
        )) {
          clearTimeout(timer);
          if (chunk.type === 'delta' && chunk.content) {
            hasYielded = true;
            yield { type: 'delta', content: chunk.content, provider: chunk.provider, model: chunk.model || AI_CONFIG.geminiModels[0] };
          }
          if (chunk.type === 'done') {
            yield { type: 'done', provider: chunk.provider || `gemini-${keyObj.id}`, model: chunk.model || AI_CONFIG.geminiModels[0] };
            return;
          }
        }

        if (hasYielded) return;
      } catch (err: any) {
        console.warn(`[AI Provider] Gemini Live Search Key ${keyObj.id} failed (${err.message}). Failover to hedging path...`);
        continue;
      }
    }
  }

  // ── 3. LUỒNG 3: SEQUENTIAL FAILOVER VỚI FAST BOUNDED TIMEOUT (DR-LLM-STRATEGY-001) ──
  // Tầng 1: Groq LPU Primary (llama-3.3-70b-versatile) với Bounded Timeout 2500ms
  // Tầng 2: Google Gemini Round-Robin Failover (khi Groq timeout > 2500ms hoặc gặp lỗi)
  try {
    const primaryStreamFn = (signal: AbortSignal) => {
      if (options?.customGroqStream) {
        return options.customGroqStream(systemPrompt, userPrompt, signal);
      }
      return streamGroqNative(systemPrompt, userPrompt, AI_CONFIG.groqModels[0], signal);
    };

    const fallbackStreamFn = (signal: AbortSignal) => {
      if (options?.customGeminiStream) {
        return options.customGeminiStream(systemPrompt, userPrompt, signal);
      }
      const geminiKeys = getRoundRobinGeminiKeys();
      if (geminiKeys.length > 0) {
        const keyObj = geminiKeys[0];
        return streamGeminiNative(
          keyObj.key,
          keyObj.id,
          AI_CONFIG.geminiModels[0],
          systemPrompt,
          userPrompt,
          false,
          signal
        );
      }
      return (async function* () {})();
    };

    let hasYieldedFromPrimaryChain = false;
    for await (const chunk of orchestrateGroqWithFailover(
      primaryStreamFn,
      fallbackStreamFn,
      { groqTimeoutMs: options?.groqTimeoutMs }
    )) {
      hasYieldedFromPrimaryChain = true;
      yield chunk;
      if (chunk.type === 'done') {
        return;
      }
    }

    if (hasYieldedFromPrimaryChain) {
      return;
    }
  } catch (primaryErr: any) {
    console.warn(`[AI Provider] Primary provider chain failed (${primaryErr.message})...`);
  }

  // ── 4. LUỒNG 4: OPENROUTER FREE STREAMING FALLBACK ──────────────────────────
  if (AI_CONFIG.openRouterKey) {
    try {
      const openRouterGen = streamOpenRouterNative(
        systemPrompt,
        userPrompt,
        AI_CONFIG.openRouterModels[0]
      );

      for await (const chunk of openRouterGen) {
        if (chunk.type === 'delta' && chunk.content) {
          yield { type: 'delta', content: chunk.content, provider: chunk.provider, model: chunk.model || AI_CONFIG.openRouterModels[0] };
        }
        if (chunk.type === 'done') {
          yield { type: 'done', provider: chunk.provider, model: chunk.model || AI_CONFIG.openRouterModels[0] };
          return;
        }
      }
    } catch (openRouterErr: any) {
      console.warn(`[AI Provider] OpenRouter stream failed: ${openRouterErr.message}`);
    }
  }

  // ── 5. LUỒNG 5: LOCAL EXPERT RAG (100% Offline Zero-Downtime Guarantee) ────
  const localExpertResponse = generateSmartLocalDomainResponse(userPrompt);
  const words = localExpertResponse.split(' ');
  for (let i = 0; i < words.length; i += 3) {
    const chunk = words.slice(i, i + 3).join(' ') + ' ';
    yield { type: 'delta', content: chunk, provider: 'local_expert_rag', model: 'local-expert-rag-v1' };
    await new Promise((r) => setTimeout(r, 6));
  }
  yield { type: 'done', provider: 'local_expert_rag', model: 'local-expert-rag-v1' };
}

/**
 * Non-Streaming Generator (Tích lũy từ streamAIResponse)
 */
export async function generateAIResponse(
  systemPrompt: string,
  userPrompt: string,
  options?: StreamAIOptions
): Promise<{ text: string; provider: string; model: string }> {
  let fullText = '';
  let providerUsed = '';
  let modelUsed = '';

  for await (const chunk of streamAIResponse(systemPrompt, userPrompt, options)) {
    if (chunk.type === 'delta' && chunk.content) {
      fullText += chunk.content;
      if (chunk.provider) {
        providerUsed = chunk.provider;
      }
      if (chunk.model) {
        modelUsed = chunk.model;
      }
    }
    if (chunk.type === 'done') {
      if (chunk.provider) {
        providerUsed = chunk.provider;
      }
      if (chunk.model) {
        modelUsed = chunk.model;
      }
    }
  }

  let resolvedText = fullText;
  let finalProvider = providerUsed;
  let finalModel = modelUsed;

  // P04-018: Kiểm tra Output Schema của Provider; chặn malformed và kích hoạt Fallback
  const validation = validateChatbotOutput(resolvedText);
  if (!validation.isValid) {
    console.warn(
      `[AI Provider] Malformed provider output detected (${validation.code}: ${validation.reason}). Falling back to Local Expert RAG.`
    );
    resolvedText = generateSmartLocalDomainResponse(userPrompt);
    finalProvider = 'local_expert_rag';
    finalModel = 'local-expert-rag-v1';
  } else if (validation.sanitizedText) {
    resolvedText = validation.sanitizedText;
  }

  // P04-019: Thẩm định Citation Coverage cho Factual Answer; chặn fixture không nguồn và kích hoạt Fallback
  const citationGate = checkCitationCoverage(resolvedText, { allowEnrichment: true });
  if (!citationGate.passed) {
    console.warn(
      `[AI Provider] Factual answer failed citation coverage gate (${citationGate.code}: ${citationGate.reason}). Falling back to Local Expert RAG.`
    );
    resolvedText = generateSmartLocalDomainResponse(userPrompt);
    finalProvider = 'local_expert_rag';
    finalModel = 'local-expert-rag-v1';
  } else if (citationGate.enrichedText) {
    resolvedText = citationGate.enrichedText;
  }

  const resolvedModel = resolveAuditModel(finalModel, finalProvider);

  providerUsed = finalProvider;
  return {
    text: applyTruthAnchor(resolvedText),
    provider: resolveAuditProvider(providerUsed),
    model: resolvedModel,
  };
}


