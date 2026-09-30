import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..', '..');

const ALLOWED_VERIFICATION_STATUSES = [
  'UNVERIFIED',
  'IN_REVIEW',
  'VERIFIED',
  'REJECTED',
  'EXPIRED'
];

/**
 * Validator enforcing canonical schema invariants around verification_status (P03-011).
 */
function validateCanonicalPlaceRecord(place) {
  const errors = [];

  if (!place || typeof place !== 'object') {
    return { valid: false, errors: ['Record must be a non-null object'] };
  }

  // canonical_id
  if (!place.canonical_id || !/^[a-z0-9-]+$/.test(place.canonical_id)) {
    errors.push('Missing or invalid canonical_id');
  }

  // verification_status
  if (!place.verification_status || !ALLOWED_VERIFICATION_STATUSES.includes(place.verification_status)) {
    errors.push(`Invalid verification_status: "${place.verification_status}". Allowed: ${ALLOWED_VERIFICATION_STATUSES.join(', ')}`);
  }

  // Invariant: VERIFIED status requires review_id and existing review file
  if (place.verification_status === 'VERIFIED') {
    if (place.is_verified !== true) {
      errors.push('is_verified must be true when verification_status is VERIFIED');
    }
    if (!place.review_id || !/^PVR-[A-Z0-9_-]+$/.test(place.review_id)) {
      errors.push('review_id is required and must match ^PVR-[A-Z0-9_-]+$ when status is VERIFIED');
    } else {
      let reviewPath = path.join(REPO_ROOT, 'docs', 'technical-spec', 'poi-reviews', `${place.review_id}.json`);
      if (!fs.existsSync(reviewPath)) {
        const altPath = path.join(REPO_ROOT, 'docs', 'technical-spec', 'poi-reviews', `${place.review_id.replace(/-\d{4}$/, '')}.json`);
        if (fs.existsSync(altPath)) {
          reviewPath = altPath;
        }
      }
      if (!fs.existsSync(reviewPath)) {
        errors.push(`Referenced review file does not exist on disk: ${reviewPath}`);
      } else {
        try {
          const reviewContent = JSON.parse(fs.readFileSync(reviewPath, 'utf8'));
          if (reviewContent.target_poi?.canonical_id !== place.canonical_id) {
            errors.push(`Review record canonical_id mismatch: review has "${reviewContent.target_poi?.canonical_id}", place has "${place.canonical_id}"`);
          }
        } catch {
          errors.push(`Corrupted review file on disk: ${reviewPath}`);
        }
      }
    }
  } else {
    // Non-verified status must fail-closed is_verified
    if (place.is_verified === true) {
      errors.push(`is_verified cannot be true when verification_status is "${place.verification_status}"`);
    }
  }

  return { valid: errors.length === 0, errors };
}

test('P03-011: CANONICAL_POI_SCHEMA JSON and Markdown contracts', () => {
  const schemaPath = path.join(REPO_ROOT, 'docs', 'technical-spec', 'CANONICAL_POI_SCHEMA.json');
  assert.ok(fs.existsSync(schemaPath), 'CANONICAL_POI_SCHEMA.json must exist');

  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
  assert.equal(schema.title, 'TritonCanonicalPoiRecordSchema');
  assert.ok(schema.required.includes('verification_status'), 'Schema must require verification_status');
  assert.ok(schema.required.includes('is_verified'), 'Schema must require is_verified');

  const statusEnum = schema.properties.verification_status.enum;
  assert.equal(statusEnum.length, 5, 'Must contain exactly 5 verification statuses');
  for (const status of ALLOWED_VERIFICATION_STATUSES) {
    assert.ok(statusEnum.includes(status), `Schema must include status ${status}`);
  }

  const mdPath = path.join(REPO_ROOT, 'docs', 'technical-spec', 'CANONICAL_POI_SCHEMA.md');
  assert.ok(fs.existsSync(mdPath), 'CANONICAL_POI_SCHEMA.md must exist');
  const mdContent = fs.readFileSync(mdPath, 'utf8');
  assert.match(mdContent, /CANONICAL-POI-SCHEMA-V1/);
  assert.match(mdContent, /verification_status/);
  assert.match(mdContent, /UNVERIFIED/);
  assert.match(mdContent, /VERIFIED/);
});

test('P03-011: Canonical record for Chùa Xà Tón contains valid VERIFIED status', () => {
  const canonicalPlacePath = path.join(REPO_ROOT, 'data', 'canonical', 'places', 'chua-xa-ton.json');
  assert.ok(fs.existsSync(canonicalPlacePath), 'chua-xa-ton.json must exist in data/canonical/places/');

  const place = JSON.parse(fs.readFileSync(canonicalPlacePath, 'utf8'));
  assert.equal(place.canonical_id, 'chua-xa-ton');
  assert.equal(place.verification_status, 'VERIFIED');
  assert.equal(place.is_verified, true);
  assert.equal(place.review_id, 'PVR-CHUA-XA-TON-2026');

  const validation = validateCanonicalPlaceRecord(place);
  assert.equal(validation.valid, true, `Validation failed: ${validation.errors.join(', ')}`);
});

test('P03-011: Negative controls for verification_status invariants', () => {
  const basePlace = {
    canonical_id: 'chua-xa-ton',
    name: 'Chùa Xà Tón',
    commune: 'Thị trấn Tri Tôn',
    coordinates: { latitude: 10.4110, longitude: 105.0089 },
    category: 'culture'
  };

  // Case 1: VERIFIED without review_id
  const noReviewId = { ...basePlace, verification_status: 'VERIFIED', is_verified: true };
  const res1 = validateCanonicalPlaceRecord(noReviewId);
  assert.equal(res1.valid, false);
  assert.match(res1.errors.join(' '), /review_id is required/);

  // Case 2: VERIFIED with non-existent review file
  const nonExistentReview = { ...basePlace, verification_status: 'VERIFIED', is_verified: true, review_id: 'PVR-NON-EXISTENT-FILE' };
  const res2 = validateCanonicalPlaceRecord(nonExistentReview);
  assert.equal(res2.valid, false);
  assert.match(res2.errors.join(' '), /does not exist on disk/);

  // Case 3: Invalid status string (e.g. 'APPROVED')
  const invalidStatus = { ...basePlace, verification_status: 'APPROVED', is_verified: false };
  const res3 = validateCanonicalPlaceRecord(invalidStatus);
  assert.equal(res3.valid, false);
  assert.match(res3.errors.join(' '), /Invalid verification_status/);

  // Case 4: UNVERIFIED but is_verified is illegally set to true
  const illegalTrue = { ...basePlace, verification_status: 'UNVERIFIED', is_verified: true };
  const res4 = validateCanonicalPlaceRecord(illegalTrue);
  assert.equal(res4.valid, false);
  assert.match(res4.errors.join(' '), /is_verified cannot be true when verification_status is "UNVERIFIED"/);
});

test('P03-011: PostgreSQL migration schema and Frontend type definitions synchronization', () => {
  // 1. Migration check
  const migrationPath = path.join(REPO_ROOT, 'supabase', 'migrations', '20260928000000_p03_011_places_verification_status.sql');
  assert.ok(fs.existsSync(migrationPath), 'Migration file 20260928000000_p03_011_places_verification_status.sql must exist');

  const sqlContent = fs.readFileSync(migrationPath, 'utf8');
  assert.match(sqlContent, /ALTER TABLE public\.places\s+ADD COLUMN IF NOT EXISTS verification_status/i);
  assert.match(sqlContent, /chk_places_verification_status/i);
  for (const status of ALLOWED_VERIFICATION_STATUSES) {
    assert.match(sqlContent, new RegExp(`'${status}'`));
  }

  // 2. Frontend type definition check
  const typesPath = path.join(REPO_ROOT, 'frontend', 'src', 'app', 'admin', 'places', 'types.ts');
  assert.ok(fs.existsSync(typesPath), 'types.ts must exist');

  const typesContent = fs.readFileSync(typesPath, 'utf8');
  assert.match(typesContent, /verification_status\?:/);
  assert.match(typesContent, /'UNVERIFIED' \| 'IN_REVIEW' \| 'VERIFIED' \| 'REJECTED' \| 'EXPIRED'/);
  assert.match(typesContent, /verification_status:\s*'UNVERIFIED'/);
  assert.doesNotMatch(typesContent, /unsplash\.com/i, 'DEFAULT_NEW_PLACE must not contain unsplash mock URLs');
});
