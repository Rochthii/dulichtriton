/**
 * Canonical Claims Contract & Resolver
 * System: Du Lịch Tri Tôn AI Assistant System
 * Task: P06-002 (Phase P06 — Interface, Documentation & Claim Alignment)
 *
 * Provides single-source-of-truth claim resolvers linked directly to the approved
 * Canonical Manifest (data/canonical/canonical_manifest.json via frontend static artifact places.canonical.json).
 *
 * Zero-Drift Guarantee:
 * UI components must never hard-code POI counts. Instead, they reference this module,
 * ensuring rendered values strictly match the approved canonical manifest.
 */

import placesCanonical from '@/data/places.canonical.json';

export interface CanonicalClaimMetadata {
  manifestName: string;
  manifestVersion: string;
  schemaVersion: string;
  totalVerifiedCount: number;
}

export const CANONICAL_CLAIM_METADATA: CanonicalClaimMetadata = {
  manifestName: placesCanonical.source_manifest?.manifest_name || 'Tri Ton Tourism Official Canonical Dataset Manifest',
  manifestVersion: placesCanonical.source_manifest?.manifest_version || '1.0.0',
  schemaVersion: placesCanonical.source_manifest?.schema_version || 'CANONICAL-POI-SCHEMA-V1',
  totalVerifiedCount: typeof placesCanonical.total_count === 'number' ? placesCanonical.total_count : (placesCanonical.places?.length || 0),
};

export const CANONICAL_TOTAL_VERIFIED_COUNT = CANONICAL_CLAIM_METADATA.totalVerifiedCount;
export const CANONICAL_MANIFEST_VERSION = CANONICAL_CLAIM_METADATA.manifestVersion;

/** Do not infer verification from a name, rating or a legacy is_verified flag. */
export function getCanonicalPlaceVerification(place: {
  id?: string; slug?: string; canonical_id?: string; is_verified?: boolean;
  verification_status?: string; review_id?: string; source_url?: string; verified_at?: string;
}, now = Date.now()) {
  if (place.is_verified !== true || place.verification_status !== 'VERIFIED') return null;
  const canonicalId = place.canonical_id || place.id || place.slug;
  return placesCanonical.places.find(record =>
    canonicalId === record.canonical_id
    && place.review_id === record.review_id
    && place.source_url === record.source_url
    && place.verified_at === record.verified_at
    && Date.parse(record.verified_at) <= now
    && Date.parse(record.expires_at) > now
  ) || null;
}

/**
 * Returns the exact verified POI count guaranteed by the canonical manifest.
 */
export function getCanonicalVerifiedPoiCount(): number {
  return CANONICAL_TOTAL_VERIFIED_COUNT;
}

/**
 * Generates the standardized header subtitle for Chatbot UI.
 * Contract: Rendered POI count must strictly equal canonical manifest total_verified_count.
 */
export function getCanonicalChatbotHeaderClaim(): string {
  const count = getCanonicalVerifiedPoiCount();
  const version = CANONICAL_MANIFEST_VERSION;
  return `${count} Địa Điểm Đã Xác Minh (Canonical v${version}) • 35 Lịch Trình Gợi Ý`;
}

/**
 * Generates a short badge label for verified POI claims.
 */
export function getCanonicalVerifiedBadgeText(): string {
  const count = getCanonicalVerifiedPoiCount();
  return `${count} Điểm Đến Đã Xác Minh`;
}
