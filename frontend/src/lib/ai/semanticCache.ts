/**
 * ─────────────────────────────────────────────────────────────────────────────
 * SEMANTIC VECTOR CACHE & EMBEDDING MANAGER (Single Responsibility)
 * Du Lịch Tri Tôn AI Assistant System
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { AI_CONFIG, isKeyInCooldown, setKeyCooldown } from './config';

export interface CachedChatResult {
  id: string;
  query_text: string;
  answer_text: string;
  places_json: any[];
  videos_json: any[];
  similarity: number;
}

/**
 * Sinh vector embedding 768 chiều qua gemini-embedding-001
 */
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

      const data = await res.json();
      const vector = data?.embedding?.values;
      if (Array.isArray(vector) && vector.length > 0) return vector;
    } catch {
      /* try next key */
    }
  }
  return null;
}

/**
 * Tra cứu bộ đệm ngữ nghĩa Supabase (Cosine Similarity >= threshold)
 */
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

    // Fire-and-forget: cập nhật hit_count & last_hit_at
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

/**
 * Lưu câu trả lời chất lượng cao vào Semantic Cache
 */
export async function storeSemanticCache(
  queryText: string,
  queryEmbedding: number[],
  answerText: string,
  placesJson: any[],
  videosJson: any[],
  supabaseClient: any
): Promise<void> {
  if (!queryEmbedding || !answerText || answerText.length < 50) return;

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
