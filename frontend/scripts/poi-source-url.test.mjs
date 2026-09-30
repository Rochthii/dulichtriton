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

// Validator specifically for source_url provenance and security (P03-013)
function validateSourceUrl(place) {
  const errors = [];

  const BLOCKED_HOSTNAMES = ['localhost', 'metadata.google.internal', 'instance-data', 'router.lan'];
  const BLOCKED_IPS = ['127.0.0.1', '169.254.169.254', '0.0.0.0', '::1'];

  if (place.verification_status === 'VERIFIED') {
    // 1. Mandatory for VERIFIED
    if (!place.source_url) {
      errors.push('source_url is mandatory when verification_status is VERIFIED');
      return { valid: false, errors };
    }

    // 2. URL parsing and security
    let parsedUrl;
    try {
      parsedUrl = new URL(place.source_url);
    } catch {
      errors.push(`source_url "${place.source_url}" is not a parseable URI`);
      return { valid: false, errors };
    }

    // Scheme must be HTTPS strictly
    if (parsedUrl.protocol !== 'https:') {
      errors.push(`source_url protocol must be "https:", received "${parsedUrl.protocol}"`);
    }

    // Hostname checks (anti-SSRF / anti-placeholder)
    const hostname = parsedUrl.hostname.toLowerCase();
    if (BLOCKED_HOSTNAMES.includes(hostname)) {
      errors.push(`source_url hostname "${hostname}" is blocked (internal/loopback)`);
    }
    if (BLOCKED_IPS.includes(hostname)) {
      errors.push(`source_url IP "${hostname}" is blocked (private/loopback/IMDS)`);
    }
    if (!hostname.includes('.')) {
      errors.push(`source_url hostname "${hostname}" is invalid (dotless domain)`);
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
          if (review.source?.source_url !== place.source_url) {
            errors.push(
              `source_url provenance mismatch: place has "${place.source_url}", but review record has "${review.source?.source_url}"`
            );
          }
          if (!review.source?.type || !review.source?.title) {
            errors.push('Review record lacks authentic source type or title specification');
          }
        } catch {
          errors.push(`Corrupted review file on disk: ${reviewPath}`);
        }
      }
    }
  } else {
    // Non-verified status should not claim verified source_url
    if (place.source_url) {
      errors.push(`Unverified status "${place.verification_status}" cannot possess a verified source_url`);
    }
  }

  return { valid: errors.length === 0, errors };
}

test('P03-013: CANONICAL_POI_SCHEMA contract for source_url', () => {
  const schemaPath = path.join(REPO_ROOT, 'docs', 'technical-spec', 'CANONICAL_POI_SCHEMA.json');
  assert.ok(fs.existsSync(schemaPath), 'CANONICAL_POI_SCHEMA.json must exist');

  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
  assert.ok(schema.properties.source_url, 'Schema must define source_url property');
  assert.equal(schema.properties.source_url.type, 'string');
  assert.equal(schema.properties.source_url.format, 'uri');

  const mdPath = path.join(REPO_ROOT, 'docs', 'technical-spec', 'CANONICAL_POI_SCHEMA.md');
  assert.ok(fs.existsSync(mdPath), 'CANONICAL_POI_SCHEMA.md must exist');
  const mdContent = fs.readFileSync(mdPath, 'utf8');
  assert.match(mdContent, /INV-05/);
  assert.match(mdContent, /source_url/);
  assert.match(mdContent, /P03-013/);
});

test('P03-013: Canonical record for Chùa Xà Tón has valid authoritative source_url', () => {
  const placePath = path.join(REPO_ROOT, 'data', 'canonical', 'places', 'chua-xa-ton.json');
  assert.ok(fs.existsSync(placePath), 'chua-xa-ton.json must exist');

  const place = JSON.parse(fs.readFileSync(placePath, 'utf8'));
  assert.equal(place.canonical_id, 'chua-xa-ton');
  assert.equal(place.verification_status, 'VERIFIED');
  assert.equal(place.source_url, 'https://triton.angiang.gov.vn');

  const validation = validateSourceUrl(place);
  assert.equal(validation.valid, true, `Validation failed: ${validation.errors.join(', ')}`);

  // Direct assertion with review file
  const reviewPath = resolveReviewFile(place.review_id);
  assert.ok(reviewPath, 'Review file must exist');
  const review = JSON.parse(fs.readFileSync(reviewPath, 'utf8'));
  assert.equal(place.source_url, review.source.source_url);
  assert.equal(review.source.type, 'GOVERNMENT_DECISION');
  assert.match(review.source.issuing_authority, /Bộ Văn hóa/);
  assert.match(review.evidence.reference_number, /224\/QĐ-BVHTT/);
});

test('P03-013: Negative controls for source_url validation and security', () => {
  const basePlace = {
    canonical_id: 'chua-xa-ton',
    verification_status: 'VERIFIED',
    is_verified: true,
    review_id: 'PVR-CHUA-XA-TON-2026',
    verified_at: '2026-09-28T22:00:00+07:00',
    expires_at: '2027-09-28T22:00:00+07:00',
    source_url: 'https://triton.angiang.gov.vn'
  };

  // Case 1: Missing source_url when VERIFIED
  const missingUrl = { ...basePlace, source_url: undefined };
  const res1 = validateSourceUrl(missingUrl);
  assert.equal(res1.valid, false);
  assert.match(res1.errors[0], /source_url is mandatory/);

  // Case 2: Insecure HTTP scheme
  const insecureScheme = { ...basePlace, source_url: 'http://triton.angiang.gov.vn' };
  const res2 = validateSourceUrl(insecureScheme);
  assert.equal(res2.valid, false);
  assert.match(res2.errors[0], /must be "https:"/);

  // Case 3: Dangerous scheme javascript:
  const dangerousScheme = { ...basePlace, source_url: 'javascript:alert(1)' };
  const res3 = validateSourceUrl(dangerousScheme);
  assert.equal(res3.valid, false);
  assert.match(res3.errors[0], /must be "https:"/);

  // Case 4: Blocked loopback / metadata IP
  const loopbackUrl = { ...basePlace, source_url: 'https://127.0.0.1/admin' };
  const res4 = validateSourceUrl(loopbackUrl);
  assert.equal(res4.valid, false);
  assert.match(res4.errors[0], /is blocked/);

  // Case 5: source_url mismatch with review record
  const mismatchUrl = { ...basePlace, source_url: 'https://example.com/fake-source' };
  const res5 = validateSourceUrl(mismatchUrl);
  assert.equal(res5.valid, false);
  assert.match(res5.errors[0], /source_url provenance mismatch/);

  // Case 6: UNVERIFIED status possessing verified source_url
  const unverifiedWithUrl = {
    canonical_id: 'chua-xa-ton',
    verification_status: 'UNVERIFIED',
    is_verified: false,
    source_url: 'https://triton.angiang.gov.vn'
  };
  const res6 = validateSourceUrl(unverifiedWithUrl);
  assert.equal(res6.valid, false);
  assert.match(res6.errors[0], /cannot possess a verified source_url/);
});

test('P03-013: Database schema and TypeScript type synchronization', () => {
  // 1. TypeScript types check
  const typesPath = path.join(REPO_ROOT, 'frontend', 'src', 'app', 'admin', 'places', 'types.ts');
  assert.ok(fs.existsSync(typesPath), 'admin places types.ts must exist');
  const typesContent = fs.readFileSync(typesPath, 'utf8');
  assert.match(typesContent, /source_url\?:\s*string;/, 'PlaceRecord must include source_url');

  // 2. Migration schema check
  const migrationNearbyRpcPath = path.join(
    REPO_ROOT,
    'supabase',
    'migrations',
    '20260807060000_p02_009_fix_match_places_nearby_rpc.sql'
  );
  assert.ok(fs.existsSync(migrationNearbyRpcPath), 'match_places_nearby migration must exist');
  const nearbyContent = fs.readFileSync(migrationNearbyRpcPath, 'utf8');
  assert.match(nearbyContent, /source_url TEXT/, 'places must have source_url TEXT');
});
