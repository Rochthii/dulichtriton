/**
 * Chat Token Search Helper — P04-007
 * Replaces sequential loop-based N+1 DB queries with a single bounded PostgREST query.
 * Extracts high-value N-grams and tokens, enforces a strict clause bound, and performs
 * exactly ONE database round-trip.
 */

import { buildSafeMultiTermOrFilter } from '@/lib/postgrestFilterSanitizer';

export const STOP_WORDS = new Set([
  'ở', 'đâu', 'có', 'gì', 'đẹp', 'nào', 'ngon', 'mấy', 'giờ', 'bao', 'nhiêu',
  'cho', 'mình', 'với', 'thì', 'lên', 'ăn', 'đi', 'muốn', 'ngắm', 'chỗ', 'hãy',
  'bạn', 'tối', 'sáng', 'thế', 'từ', 'vé', 'quán', 'thích', 'và', 'hay', 'được',
  'của', 'tôi', 'này', 'kia', 'những', 'các', 'một', 'nhé', 'ạ'
]);

export interface TokenSearchOptions {
  maxTerms?: number;
  limit?: number;
}

/**
 * Extracts distinct, high-signal search terms (trigrams, bigrams, unigrams) from a user query.
 * Sanitizes input to prevent filter injection and bounds the term count.
 */
export function extractSearchTerms(query: string, maxTerms = 6): string[] {
  if (!query || typeof query !== 'string') return [];

  // Remove punctuation and dangerous filter delimiters (, % () \)
  const cleaned = query.toLowerCase().replace(/[,%()\\/?.!;:_"'`]/g, ' ').trim();
  if (!cleaned) return [];

  const rawTokens = cleaned.split(/\s+/).filter(Boolean);
  const filteredTokens = rawTokens.filter((w) => !STOP_WORDS.has(w) && w.length >= 2);

  if (filteredTokens.length === 0) return [];

  const candidates: string[] = [];

  // 1. 3-word trigrams (Highest specificity)
  for (let i = 0; i < filteredTokens.length - 2; i++) {
    const phrase = `${filteredTokens[i]} ${filteredTokens[i + 1]} ${filteredTokens[i + 2]}`;
    if (phrase.length >= 5) candidates.push(phrase);
  }

  // 2. 2-word bigrams (High specificity)
  for (let i = 0; i < filteredTokens.length - 1; i++) {
    const phrase = `${filteredTokens[i]} ${filteredTokens[i + 1]}`;
    if (phrase.length >= 4) candidates.push(phrase);
  }

  // 3. Significant unigrams (length >= 3)
  for (const token of filteredTokens) {
    if (token.length >= 3) {
      candidates.push(token);
    }
  }

  // Deduplicate while preserving specificity order
  const seen = new Set<string>();
  const distinctTerms: string[] = [];

  for (const term of candidates) {
    if (!seen.has(term)) {
      seen.add(term);
      distinctTerms.push(term);
      if (distinctTerms.length >= maxTerms) break;
    }
  }

  return distinctTerms;
}

/**
 * Builds a single PostgREST .or() filter clause combining all search terms.
 * Each term is checked against name, category, and commune using ilike.
 */
export function buildBoundedOrFilter(terms: string[]): string | null {
  return buildSafeMultiTermOrFilter(['name', 'category', 'commune'], terms);
}

/**
 * Executes a single bounded database query for POI token matching.
 * Guarantees at most ONE query call (queryCount <= 1).
 */
export async function executeBoundedTokenSearch(
  supabase: any,
  query: string,
  options?: TokenSearchOptions
): Promise<any[]> {
  if (!supabase || !query || typeof query !== 'string') return [];

  const maxTerms = options?.maxTerms ?? 6;
  const limit = options?.limit ?? 8;

  const terms = extractSearchTerms(query, maxTerms);
  if (terms.length === 0) return [];

  const orFilter = buildBoundedOrFilter(terms);
  if (!orFilter) return [];

  try {
    const { data, error } = await supabase
      .from('places')
      .select('id, slug, name, commune, category, rating, image_url, description, golden_time_windows, price_level, opening_hours, is_verified, verification_status, verified_at, source_url')
      .or(orFilter)
      .limit(limit);

    if (error) {
      console.warn('[TokenSearch] Query warning:', error.message);
      return [];
    }

    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn('[TokenSearch] Unexpected query error:', err);
    return [];
  }
}
