/**
 * Place Verification Guard — P04-009
 * Enforces fail-closed verification invariants:
 * - Missing or falsy `is_verified` MUST NEVER default to true.
 * - Missing fields (`undefined`, `null`, empty string, 0, non-boolean) MUST resolve to `is_verified: false`.
 * - Records with `verification_status` other than 'VERIFIED' (e.g. 'UNVERIFIED', 'IN_REVIEW', 'REJECTED', 'EXPIRED')
 *   MUST NOT claim `is_verified: true`.
 * - Unverified records MUST have `verified_at` stripped/null to avoid false audit provenance claims.
 */

export interface VerificationFields {
  is_verified: boolean;
  verification_status: 'UNVERIFIED' | 'IN_REVIEW' | 'VERIFIED' | 'REJECTED' | 'EXPIRED';
  verified_at: string | null;
}

/**
 * Checks whether a place record is strictly verified.
 * Returns true ONLY if `is_verified === true` AND `verification_status` is not a non-VERIFIED status.
 * Fails closed (returns false) if the field is missing, null, undefined, false, or unverified.
 */
export function isRecordVerified(record: unknown): boolean {
  if (!record || typeof record !== 'object') return false;
  const p = record as Record<string, unknown>;

  // Fail-closed: missing or non-boolean true is strictly unverified
  if (p.is_verified !== true) return false;

  // If verification_status is explicitly set, it MUST be 'VERIFIED'
  if (p.verification_status !== undefined && p.verification_status !== null && p.verification_status !== 'VERIFIED') {
    return false;
  }

  return true;
}

/**
 * Resolves safe, fail-closed verification metadata for any POI/place payload.
 * Guarantees that missing fields NEVER resolve to verified = true.
 */
export function resolveVerificationMetadata(record: unknown): VerificationFields {
  if (!record || typeof record !== 'object') {
    return {
      is_verified: false,
      verification_status: 'UNVERIFIED',
      verified_at: null,
    };
  }

  const p = record as Record<string, unknown>;
  const verified = isRecordVerified(p);

  const status = verified
    ? 'VERIFIED'
    : (typeof p.verification_status === 'string' && ['UNVERIFIED', 'IN_REVIEW', 'REJECTED', 'EXPIRED'].includes(p.verification_status)
        ? (p.verification_status as VerificationFields['verification_status'])
        : 'UNVERIFIED');

  const verifiedAt = (verified && typeof p.verified_at === 'string' && p.verified_at.trim())
    ? p.verified_at.trim()
    : null;

  return {
    is_verified: verified,
    verification_status: status,
    verified_at: verifiedAt,
  };
}

/**
 * Formats a raw place candidate into a safe API output item, guaranteeing
 * that is_verified is strictly boolean and never defaults to true on missing fields.
 */
export function sanitizePlaceVerification<T extends Record<string, unknown>>(place: T): T & VerificationFields {
  const meta = resolveVerificationMetadata(place);
  return {
    ...place,
    ...meta,
  };
}

/**
 * P04-010: Strict predicate for Chatbot RAG / Search retrieval eligibility.
 * A retrieval candidate MUST have verification_status === 'VERIFIED' AND is_verified === true.
 * Any candidate that is UNVERIFIED, IN_REVIEW, REJECTED, EXPIRED, missing status,
 * or has is_verified !== true is strictly rejected.
 */
export function isRetrievalEligiblePlace(record: unknown): boolean {
  if (!record || typeof record !== 'object') return false;
  const p = record as Record<string, unknown>;
  return p.verification_status === 'VERIFIED' && p.is_verified === true;
}

/**
 * P04-010: Filters an array of place candidates to ONLY approved VERIFIED places.
 * Guarantees 0% leakage of unverified fixtures into RAG context or retrieval responses.
 */
export function filterVerifiedRetrievalPlaces<T extends Record<string, unknown>>(places: T[]): T[] {
  if (!Array.isArray(places)) return [];
  return places.filter(isRetrievalEligiblePlace);
}

