/**
 * Chat Query Embedding Helper — P04-006
 * Generates vector embeddings for user queries using Google Generative Language API (models/gemini-embedding-001).
 * Supports dependency injection for testing and guarantees single-call efficiency.
 */

export interface QueryEmbeddingOptions {
  fetchFn?: typeof fetch;
  timeoutMs?: number;
}

export async function generateQueryEmbedding(
  text: string,
  options?: QueryEmbeddingOptions
): Promise<number[] | null> {
  if (!text || typeof text !== 'string' || !text.trim()) {
    return null;
  }

  const fetchImpl = options?.fetchFn || fetch;
  const timeoutMs = options?.timeoutMs || 3500;

  const geminiKeys = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY_4,
  ].filter(Boolean) as string[];

  for (const key of geminiKeys) {
    try {
      const res = await fetchImpl(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'models/gemini-embedding-001',
            content: { parts: [{ text: text.trim() }] },
            outputDimensionality: 768,
          }),
          signal: AbortSignal.timeout(timeoutMs),
        }
      );
      if (res.ok) {
        const data = await res.json();
        const vector = data?.embedding?.values;
        if (Array.isArray(vector) && vector.length > 0) return vector;
      }
    } catch {
      // fallback silently to next key
    }
  }
  return null;
}
