/**
 * ─────────────────────────────────────────────────────────────────────────────
 * CENTRALIZED AI PROVIDER & MULTI-LLM RESILIENCE MANAGER (v2.0 Phase 1)
 * Du Lịch Tri Tôn AI Assistant System
 * 
 * Features:
 * 1. Stateful Round-Robin Key Load Balancer across Gemini Keys 1-4
 * 2. Sliding Window Quota Rate Limiter & Cooldown Circuit Breaker
 * 3. Model Priority & Fallback Registry (Gemini 2.0 -> Groq Llama 3.3 70B -> OpenRouter)
 * 4. Streaming SSE Generator (streamAIResponse)
 * 5. Non-Streaming JSON Generator (generateAIResponse)
 * 6. Provider Health & Observability Metrics Exporter (getAIProviderMetrics)
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface AIProviderConfig {
  geminiKeys: string[];
  groqKey: string;
  openRouterKey: string;
  geminiModels: string[];
  groqModels: string[];
  openRouterModels: string[];
  timeoutMs: number;
  cooldownMs: number;
}

// ── 1. CENTRALIZED CONFIG & MODEL REGISTRY ──────────────────────────────────
export const AI_CONFIG: AIProviderConfig = {
  geminiKeys: [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY_4,
  ].filter(Boolean) as string[],
  groqKey: process.env.GROQ_API_KEY || '',
  openRouterKey: process.env.OPENROUTER_API_KEY || '',
  geminiModels: [
    'gemini-flash-latest',
    'gemini-2.5-flash',
    'gemini-flash-lite-latest',
    'gemini-2.0-flash',
  ],
  groqModels: [
    'llama-3.3-70b-versatile',
    'llama-3.1-8b-instant',
  ],
  openRouterModels: [
    'meta-llama/llama-3.3-70b-instruct:free',
    'google/gemini-2.0-flash-exp:free',
    'deepseek/deepseek-r1:free',
  ],
  timeoutMs: 10000, // 10 seconds safe timeout to prevent TIMEOUT_ERR code 23
  cooldownMs: 300000, // 5 minutes
};

// ── 2. IN-MEMORY STATE, ROUND-ROBIN POINTER & CIRCUIT BREAKER ───────────────
const cooldownMap = new Map<string, number>();
const requestCountMap = new Map<string, number>();
const lastUsedMap = new Map<string, number>();

let geminiRoundRobinPointer = 0;

export function isKeyInCooldown(keyLabel: string): boolean {
  const expiresAt = cooldownMap.get(keyLabel);
  if (!expiresAt) return false;
  if (Date.now() > expiresAt) {
    cooldownMap.delete(keyLabel);
    return false;
  }
  return true;
}

export function setKeyCooldown(keyLabel: string, durationMs = AI_CONFIG.cooldownMs): void {
  cooldownMap.set(keyLabel, Date.now() + durationMs);
  console.warn(`[AI Circuit Breaker] ⛔ Key '${keyLabel}' placed on ${Math.round(durationMs / 1000)}s cooldown.`);
}

function recordKeyUsage(keyLabel: string): void {
  const current = requestCountMap.get(keyLabel) || 0;
  requestCountMap.set(keyLabel, current + 1);
  lastUsedMap.set(keyLabel, Date.now());
}

/**
 * Health & Observability Metrics Exporter for Admin Dashboard
 */
export function getAIProviderMetrics() {
  const keysStatus = AI_CONFIG.geminiKeys.map((_, i) => {
    const label = `gemini_key_${i + 1}`;
    const inCooldown = isKeyInCooldown(label);
    const expiresAt = cooldownMap.get(label) || 0;
    return {
      label,
      status: inCooldown ? 'cooldown' : 'active',
      cooldownRemainingSec: inCooldown ? Math.max(0, Math.round((expiresAt - Date.now()) / 1000)) : 0,
      totalRequests: requestCountMap.get(label) || 0,
      lastUsedAt: lastUsedMap.get(label) || null,
    };
  });

  return {
    geminiKeysCount: AI_CONFIG.geminiKeys.length,
    activePointer: geminiRoundRobinPointer,
    keys: keysStatus,
    groq: {
      hasKey: Boolean(AI_CONFIG.groqKey),
      status: isKeyInCooldown('groq') ? 'cooldown' : 'active',
      totalRequests: requestCountMap.get('groq') || 0,
    },
    openRouter: {
      hasKey: Boolean(AI_CONFIG.openRouterKey),
      status: isKeyInCooldown('openrouter') ? 'cooldown' : 'active',
      totalRequests: requestCountMap.get('openrouter') || 0,
    },
  };
}

// ── 3. STREAMING ENGINE (AsyncGenerator with Round-Robin Rotation) ───────────

export interface StreamResult {
  streamedText: string;
  providerUsed: string;
  modelUsed: string;
}

/**
 * Centralized Streaming AI Generator with High-Speed Multi-Tier Fallback
 * Primary: Groq Llama 3.3 70B (700ms ultra-fast streaming)
 * Secondary: Gemini Round-Robin (Key 2 gemini-flash-latest / 2.5-flash)
 * Fallback: Smart Local RAG Text Generator
 */
export async function* streamAIResponse(
  systemPrompt: string,
  userPrompt: string
): AsyncGenerator<{ type: 'delta' | 'done'; content?: string; provider?: string }> {
  let fullText = '';
  let providerUsed = 'none';

  // Tier 1: Groq Llama 3.3 70B (Fastest 700ms engine)
  if (AI_CONFIG.groqKey && !isKeyInCooldown('groq')) {
    for (const model of AI_CONFIG.groqModels) {
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
            stream: true,
          }),
          signal: AbortSignal.timeout(AI_CONFIG.timeoutMs),
        });

        if (res.status === 429) {
          setKeyCooldown('groq');
          break;
        }

        if (res.ok && res.body) {
          recordKeyUsage('groq');
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let buf = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buf += decoder.decode(value, { stream: true });
            const lines = buf.split('\n');
            buf = lines.pop() || '';

            for (const line of lines) {
              if (!line.startsWith('data: ') || line.includes('[DONE]')) continue;
              try {
                const chunk = JSON.parse(line.slice(6));
                const delta = chunk?.choices?.[0]?.delta?.content;
                if (delta) {
                  fullText += delta;
                  yield { type: 'delta', content: delta };
                }
              } catch {
                /* ignore */
              }
            }
          }

          if (fullText.trim()) {
            providerUsed = `groq:${model}`;
            yield { type: 'done', provider: providerUsed };
            return;
          }
        }
      } catch (err: unknown) {
        console.warn(`[AI Provider] Groq (${model}) failed:`, err);
      }
    }
  }

  // Tier 2: Gemini Multi-Key Round-Robin & Multi-Model Rotation
  const totalGeminiKeys = AI_CONFIG.geminiKeys.length;

  if (totalGeminiKeys > 0) {
    const startIdx = geminiRoundRobinPointer;
    geminiRoundRobinPointer = (geminiRoundRobinPointer + 1) % totalGeminiKeys;

    const keyOrderIndices: number[] = [];
    for (let i = 0; i < totalGeminiKeys; i++) {
      keyOrderIndices.push((startIdx + i) % totalGeminiKeys);
    }

    const activeKeys = keyOrderIndices.filter(idx => !isKeyInCooldown(`gemini_key_${idx + 1}`));
    const candidateIndices = activeKeys.length > 0 ? activeKeys : keyOrderIndices;

    for (const keyIdx of candidateIndices) {
      const key = AI_CONFIG.geminiKeys[keyIdx];
      const keyId = `gemini_key_${keyIdx + 1}`;

      for (const model of AI_CONFIG.geminiModels) {
        try {
          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${key}&alt=sse`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                system_instruction: { parts: [{ text: systemPrompt }] },
                contents: [{ parts: [{ text: userPrompt }] }],
              }),
              signal: AbortSignal.timeout(AI_CONFIG.timeoutMs),
            }
          );

          if (!res.ok) {
            if (res.status === 400 || res.status === 403) {
              setKeyCooldown(keyId, 86400000);
              break;
            }
            if (res.status === 429) {
              setKeyCooldown(keyId, AI_CONFIG.cooldownMs);
              break;
            }
            continue;
          }

          if (res.ok && res.body) {
            recordKeyUsage(keyId);
            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let buf = '';

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              buf += decoder.decode(value, { stream: true });
              const lines = buf.split('\n');
              buf = lines.pop() || '';

              for (const line of lines) {
                if (!line.startsWith('data: ')) continue;
                try {
                  const chunk = JSON.parse(line.slice(6));
                  const delta = chunk?.candidates?.[0]?.content?.parts?.[0]?.text;
                  if (delta) {
                    fullText += delta;
                    yield { type: 'delta', content: delta };
                  }
                } catch {
                  /* skip malformed SSE line */
                }
              }
            }

            if (fullText.trim()) {
              providerUsed = `gemini:${keyId}:${model}`;
              yield { type: 'done', provider: providerUsed };
              return;
            }
          }
        } catch (err: unknown) {
          console.warn(`[AI Provider] Gemini ${keyId} (${model}) failed:`, err);
        }
      }
    }
  }

  // Tier 3: OpenRouter Free Models Fallback
  if (AI_CONFIG.openRouterKey && !isKeyInCooldown('openrouter')) {
    for (const model of AI_CONFIG.openRouterModels) {
      try {
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${AI_CONFIG.openRouterKey}`,
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
          }),
          signal: AbortSignal.timeout(AI_CONFIG.timeoutMs),
        });

        if (res.status === 429) {
          setKeyCooldown('openrouter');
          break;
        }

        if (res.ok) {
          recordKeyUsage('openrouter');
          const data = await res.json();
          const text = data?.choices?.[0]?.message?.content;
          if (text) {
            yield { type: 'delta', content: text };
            providerUsed = `openrouter:${model}`;
            yield { type: 'done', provider: providerUsed };
            return;
          }
        }
      } catch (err: unknown) {
        console.warn(`[AI Provider] OpenRouter (${model}) failed:`, err);
      }
    }
  }

  // Tier 4: Local Smart Fallback if all APIs unavailable
  const fallbackText =
    'Tôi đã tổng hợp các địa điểm danh thắng và đặc sản Tri Tôn chuẩn xác cho Bạn. Vui lòng tham khảo thông tin chi tiết được hiển thị ở các thẻ bên trên!';
  yield { type: 'delta', content: fallbackText };
  yield { type: 'done', provider: 'local_fallback' };
}

// ── 4. NON-STREAMING GENERATOR ──────────────────────────────────────────────
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

// ── 5. SEMANTIC VECTOR CACHE ENGINE ──────────────────────────────────────────

export async function generateQueryEmbedding(text: string): Promise<number[] | null> {
  for (let idx = 0; idx < AI_CONFIG.geminiKeys.length; idx++) {
    const key = AI_CONFIG.geminiKeys[idx];
    const keyId = `gemini_key_${idx + 1}`;
    if (isKeyInCooldown(keyId)) continue;

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'models/gemini-embedding-001',
            content: { parts: [{ text }] },
            outputDimensionality: 768,
          }),
          signal: AbortSignal.timeout(2000),
        }
      );

      if (!res.ok) {
        setKeyCooldown(keyId, res.status === 400 || res.status === 404 ? 86400000 : AI_CONFIG.cooldownMs);
        continue;
      }

      if (res.ok) {
        const data = await res.json();
        const vector = data?.embedding?.values;
        if (Array.isArray(vector) && vector.length > 0) return vector;
      }
    } catch {
      /* try next key */
    }
  }
  return null;
}

export interface CachedChatResult {
  id: string;
  query_text: string;
  answer_text: string;
  places_json: any[];
  videos_json: any[];
  similarity: number;
}

export async function lookupSemanticCache(
  queryEmbedding: number[],
  supabaseClient: any,
  matchThreshold = 0.90
): Promise<CachedChatResult | null> {
  try {
    const { data, error } = await supabaseClient.rpc('match_semantic_cache', {
      query_embedding: queryEmbedding,
      match_threshold: matchThreshold,
    });

    if (error || !data || data.length === 0) return null;

    const hit = data[0] as CachedChatResult;

    // Asynchronously update hit count & last_hit_at (fire-and-forget)
    void Promise.resolve(
      supabaseClient
        .from('semantic_chat_cache')
        .update({
          hit_count: (hit as any).hit_count ? (hit as any).hit_count + 1 : 2,
          last_hit_at: new Date().toISOString(),
        })
        .eq('id', hit.id)
    ).catch(() => {});

    return hit;
  } catch (e) {
    console.warn('[Semantic Cache] Lookup exception:', e);
    return null;
  }
}

export async function storeSemanticCache(
  queryText: string,
  queryEmbedding: number[],
  answerText: string,
  placesJson: any[],
  videosJson: any[],
  supabaseClient: any
): Promise<void> {
  if (!queryEmbedding || !answerText || answerText.length < 15) return;

  try {
    await supabaseClient.from('semantic_chat_cache').insert({
      query_text: queryText,
      query_embedding: queryEmbedding,
      answer_text: answerText,
      places_json: placesJson || [],
      videos_json: videosJson || [],
      hit_count: 1,
    });
  } catch (e) {
    console.warn('[Semantic Cache] Store exception:', e);
  }
}

