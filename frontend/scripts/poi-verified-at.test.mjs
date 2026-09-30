import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..', '..');

// Helper function to resolve review file on disk
function resolveReviewFile(reviewId) {
  let reviewPath = path.join(REPO_ROOT, 'docs', 'technical-spec', 'poi-reviews', `${reviewId}.json`);
  if (!fs.existsSync(reviewPath)) {
    const altPath = path.join(REPO_ROOT, 'docs', 'technical-spec', 'poi-reviews', `${reviewId.replace(/-\d{4}$/, '')}.json`);
    if (fs.existsSync(altPath)) {
      reviewPath = altPath;
    }
  }
  return fs.existsSync(reviewPath) ? reviewPath : null;
}

// Validator specifically for verified_at provenance and temporal integrity (P03-012)
function validateVerifiedAtProvenance(place) {
  const errors = [];

  // Check ISO 8601 regex pattern
  const ISO_8601_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?([+-]\d{2}:\d{2}|Z)$/;

  if (place.verification_status === 'VERIFIED') {
    // 1. verified_at is mandatory for VERIFIED status
    if (!place.verified_at) {
      errors.push('verified_at is mandatory when verification_status is VERIFIED');
      return { valid: false, errors };
    }

    // 2. Format validation
    if (!ISO_8601_REGEX.test(place.verified_at)) {
      errors.push(`verified_at "${place.verified_at}" is not a valid ISO 8601 timestamp with timezone`);
    }

    const verifiedTimestamp = Date.parse(place.verified_at);
    if (isNaN(verifiedTimestamp)) {
      errors.push(`verified_at "${place.verified_at}" cannot be parsed by Date`);
    }

    // 3. Provenance check: must match referenced review file
    if (!place.review_id) {
      errors.push('Cannot verify provenance: review_id is missing');
    } else {
      const reviewPath = resolveReviewFile(place.review_id);
      if (!reviewPath) {
        errors.push(`Referenced review file does not exist on disk for review_id: ${place.review_id}`);
      } else {
        try {
          const review = JSON.parse(fs.readFileSync(reviewPath, 'utf8'));
          if (review.lifecycle?.verified_at !== place.verified_at) {
            errors.push(
              `verified_at provenance mismatch: place has "${place.verified_at}", but review record has "${review.lifecycle?.verified_at}"`
            );
          }
          if (!review.reviewer?.name || !review.reviewer?.signature_hash) {
            errors.push('Review record lacks authentic reviewer signature provenance');
          }
        } catch {
          errors.push(`Corrupted review file on disk: ${reviewPath}`);
        }
      }
    }

    // 4. Chronological consistency with expires_at
    if (place.expires_at) {
      const expiresTimestamp = Date.parse(place.expires_at);
      if (!isNaN(expiresTimestamp) && !isNaN(verifiedTimestamp)) {
        if (verifiedTimestamp >= expiresTimestamp) {
          errors.push(`Chronological violation: verified_at (${place.verified_at}) must be strictly before expires_at (${place.expires_at})`);
        }
      }
    }
  } else {
    // For UNVERIFIED or REJECTED: must not have verified_at populated
    if (place.verified_at) {
      errors.push(`Unverified status "${place.verification_status}" cannot possess a verified_at timestamp`);
    }
  }

  return { valid: errors.length === 0, errors };
}

test('P03-012: CANONICAL_POI_SCHEMA contract for verified_at', () => {
  const schemaPath = path.join(REPO_ROOT, 'docs', 'technical-spec', 'CANONICAL_POI_SCHEMA.json');
  assert.ok(fs.existsSync(schemaPath), 'CANONICAL_POI_SCHEMA.json must exist');

  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
  assert.ok(schema.properties.verified_at, 'Schema must define verified_at property');
  assert.equal(schema.properties.verified_at.type, 'string');
  assert.equal(schema.properties.verified_at.format, 'date-time');

  const mdPath = path.join(REPO_ROOT, 'docs', 'technical-spec', 'CANONICAL_POI_SCHEMA.md');
  assert.ok(fs.existsSync(mdPath), 'CANONICAL_POI_SCHEMA.md must exist');
  const mdContent = fs.readFileSync(mdPath, 'utf8');
  assert.match(mdContent, /INV-04/);
  assert.match(mdContent, /verified_at/);
  assert.match(mdContent, /P03-012/);
});

test('P03-012: Canonical record for Chùa Xà Tón has verified_at with proven source', () => {
  const placePath = path.join(REPO_ROOT, 'data', 'canonical', 'places', 'chua-xa-ton.json');
  assert.ok(fs.existsSync(placePath), 'chua-xa-ton.json must exist');

  const place = JSON.parse(fs.readFileSync(placePath, 'utf8'));
  assert.equal(place.canonical_id, 'chua-xa-ton');
  assert.equal(place.verification_status, 'VERIFIED');
  assert.equal(place.verified_at, '2026-09-28T22:00:00+07:00');

  const validation = validateVerifiedAtProvenance(place);
  assert.equal(validation.valid, true, `Validation failed: ${validation.errors.join(', ')}`);

  // Direct assertion with review file
  const reviewPath = resolveReviewFile(place.review_id);
  assert.ok(reviewPath, 'Review file must exist');
  const review = JSON.parse(fs.readFileSync(reviewPath, 'utf8'));
  assert.equal(place.verified_at, review.lifecycle.verified_at);
  assert.equal(review.reviewer.name, 'Chăm Rốch Thi');
  assert.ok(/^[0-9a-f]{64}$/.test(review.reviewer.signature_hash));

  const verifiedTime = new Date(place.verified_at).getTime();
  const expiresTime = new Date(place.expires_at).getTime();
  assert.ok(verifiedTime < expiresTime, 'verified_at must be before expires_at');
});

test('P03-012: Negative controls for verified_at provenance and chronology', () => {
  const basePlace = {
    canonical_id: 'chua-xa-ton',
    verification_status: 'VERIFIED',
    is_verified: true,
    review_id: 'PVR-CHUA-XA-TON-2026',
    verified_at: '2026-09-28T22:00:00+07:00',
    expires_at: '2027-09-28T22:00:00+07:00'
  };

  // Case 1: VERIFIED without verified_at
  const missingVerifiedAt = { ...basePlace, verified_at: undefined };
  const res1 = validateVerifiedAtProvenance(missingVerifiedAt);
  assert.equal(res1.valid, false);
  assert.match(res1.errors[0], /verified_at is mandatory/);

  // Case 2: Invalid ISO 8601 string
  const invalidDateStr = { ...basePlace, verified_at: '2026-99-99 25:00:00' };
  const res2 = validateVerifiedAtProvenance(invalidDateStr);
  assert.equal(res2.valid, false);
  assert.match(res2.errors[0], /not a valid ISO 8601/);

  // Case 3: verified_at provenance mismatch with review file
  const mismatchedTimestamp = { ...basePlace, verified_at: '2024-01-01T00:00:00+07:00' };
  const res3 = validateVerifiedAtProvenance(mismatchedTimestamp);
  assert.equal(res3.valid, false);
  assert.match(res3.errors[0], /provenance mismatch/);

  // Case 4: Chronological inversion (verified_at >= expires_at)
  const invertedTime = {
    ...basePlace,
    verified_at: '2026-09-28T22:00:00+07:00',
    expires_at: '2025-01-01T00:00:00+07:00'
  };
  const res4 = validateVerifiedAtProvenance(invertedTime);
  assert.equal(res4.valid, false);
  assert.match(res4.errors[0], /Chronological violation/);

  // Case 5: UNVERIFIED status possessing verified_at
  const unverifiedWithTimestamp = {
    canonical_id: 'chua-xa-ton',
    verification_status: 'UNVERIFIED',
    is_verified: false,
    verified_at: '2026-09-28T22:00:00+07:00'
  };
  const res5 = validateVerifiedAtProvenance(unverifiedWithTimestamp);
  assert.equal(res5.valid, false);
  assert.match(res5.errors[0], /cannot possess a verified_at timestamp/);
});

test('P03-012: Database schema and TypeScript type synchronization', () => {
  // 1. TypeScript types check
  const typesPath = path.join(REPO_ROOT, 'frontend', 'src', 'app', 'admin', 'places', 'types.ts');
  assert.ok(fs.existsSync(typesPath), 'admin places types.ts must exist');
  const typesContent = fs.readFileSync(typesPath, 'utf8');
  assert.match(typesContent, /verified_at\?:\s*string;/, 'PlaceRecord must include verified_at');

  // 2. Migration schema check
  const migrationNearbyRpcPath = path.join(
    REPO_ROOT,
    'supabase',
    'migrations',
    '20260807060000_p02_009_fix_match_places_nearby_rpc.sql'
  );
  assert.ok(fs.existsSync(migrationNearbyRpcPath), 'match_places_nearby migration must exist');
  const nearbyContent = fs.readFileSync(migrationNearbyRpcPath, 'utf8');
  assert.match(nearbyContent, /verified_at TIMESTAMPTZ/, 'places must have verified_at TIMESTAMPTZ');
});
