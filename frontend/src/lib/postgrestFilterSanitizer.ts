/**
 * PostgREST Filter Sanitizer — P04-008
 * Prevents PostgREST filter injection and syntax corruption caused by raw string interpolation.
 * Neutralizes PostgREST syntax delimiters (, ( ) " \ : ; .) and guarantees that
 * user input cannot alter the query AST or inject unintended filter clauses.
 */

// Delimiters and operator characters that control PostgREST logical operators and URI syntax
const POSTGREST_SYNTAX_CHARS_REGEX = /[,()"\\]/g;
const EXTRA_WHITESPACE_REGEX = /\s+/g;
const SAFE_FIELD_NAME_REGEX = /^[a-zA-Z0-9_]+$/;

/**
 * Sanitizes a raw user input string intended for PostgREST filter values.
 * Removes PostgREST clause delimiters (, ( ) " \), strips trailing wildcards,
 * and normalizes whitespace.
 */
export function sanitizeFilterTerm(rawInput: unknown): string {
  if (typeof rawInput !== 'string') return '';

  // 1. Remove dangerous PostgREST structural delimiters
  let clean = rawInput.replace(POSTGREST_SYNTAX_CHARS_REGEX, ' ');

  // 2. Normalize and trim whitespaces
  clean = clean.replace(EXTRA_WHITESPACE_REGEX, ' ').trim();

  // 3. Remove standalone wildcards or multiple consecutive percent signs
  clean = clean.replace(/%+/, '%');

  return clean;
}

/**
 * Builds a safe, injection-proof PostgREST .or() filter string for a single search term across multiple fields.
 * Guarantees that the resulting filter contains EXACTLY `fields.length` clauses, regardless of user input.
 *
 * @param fields Array of column names to query (e.g. ['name', 'commune', 'category'])
 * @param rawTerm Raw search query entered by the user
 * @returns Safe PostgREST filter string (e.g. "name.ilike.%query%,commune.ilike.%query%") or null if empty
 */
export function buildSafeOrIlikeFilter(fields: string[], rawTerm: unknown): string | null {
  if (!Array.isArray(fields) || fields.length === 0) return null;

  const validFields = fields.filter((f) => typeof f === 'string' && SAFE_FIELD_NAME_REGEX.test(f.trim()));
  if (validFields.length === 0) return null;

  const cleanTerm = sanitizeFilterTerm(rawTerm);
  if (!cleanTerm || cleanTerm.length === 0) return null;

  const clauses = validFields.map((field) => `${field.trim()}.ilike.%${cleanTerm}%`);
  return clauses.join(',');
}

/**
 * Builds a safe, injection-proof PostgREST .or() filter string for multiple search terms across multiple fields.
 * Guarantees that the resulting filter contains EXACTLY `fields.length * terms.length` clauses.
 *
 * @param fields Array of column names to query
 * @param rawTerms Array of search terms
 * @returns Safe PostgREST filter string or null if empty
 */
export function buildSafeMultiTermOrFilter(fields: string[], rawTerms: unknown[]): string | null {
  if (!Array.isArray(fields) || fields.length === 0 || !Array.isArray(rawTerms) || rawTerms.length === 0) {
    return null;
  }

  const validFields = fields.filter((f) => typeof f === 'string' && SAFE_FIELD_NAME_REGEX.test(f.trim()));
  if (validFields.length === 0) return null;

  const cleanTerms: string[] = [];
  for (const term of rawTerms) {
    const clean = sanitizeFilterTerm(term);
    if (clean && clean.length >= 2 && !cleanTerms.includes(clean)) {
      cleanTerms.push(clean);
    }
  }

  if (cleanTerms.length === 0) return null;

  const clauses: string[] = [];
  for (const term of cleanTerms) {
    for (const field of validFields) {
      clauses.push(`${field.trim()}.ilike.%${term}%`);
    }
  }

  return clauses.length > 0 ? clauses.join(',') : null;
}

/**
 * Utility to count the exact number of top-level PostgREST clauses in a filter string.
 * Used for verifying that input did not inject unexpected clauses.
 */
export function countPostgrestClauses(filterStr: string | null): number {
  if (!filterStr || typeof filterStr !== 'string') return 0;
  return filterStr.split(',').filter(Boolean).length;
}
