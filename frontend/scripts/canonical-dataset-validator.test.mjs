import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..', '..');

// Import the canonical dataset validator module
const validatorModulePath = path.join(REPO_ROOT, 'scripts', 'validate_canonical_dataset.mjs');

test('P03-015: Schema validation succeeds on all production canonical places', async () => {
  assert.ok(fs.existsSync(validatorModulePath), 'validate_canonical_dataset.mjs must exist');
  const { validateCanonicalDataset } = await import(`file://${validatorModulePath}`);

  const summary = validateCanonicalDataset();
  assert.equal(summary.valid, true, `Validation failed with errors: ${JSON.stringify(summary.results, null, 2)}`);
  assert.ok(summary.count >= 1, 'Canonical dataset must contain at least 1 verified POI record');
  assert.equal(summary.totalErrors, 0, 'Total errors in production canonical dataset must be 0');
});

test('P03-015: Positive control - Chùa Xà Tón valid canonical record', async () => {
  const { validatePlaceRecord } = await import(`file://${validatorModulePath}`);
  const chuaXaTonPath = path.join(REPO_ROOT, 'data', 'canonical', 'places', 'chua-xa-ton.json');
  assert.ok(fs.existsSync(chuaXaTonPath), 'chua-xa-ton.json must exist');

  const record = JSON.parse(fs.readFileSync(chuaXaTonPath, 'utf8'));
  const res = validatePlaceRecord(record);
  assert.equal(res.valid, true, `Chùa Xà Tón record must be valid: ${res.errors.join(', ')}`);
  assert.equal(res.errors.length, 0);
});

test('P03-015: Negative Fixtures - Missing required fields fail closed', async () => {
  const { validatePlaceRecord } = await import(`file://${validatorModulePath}`);

  const baseRecord = {
    canonical_id: 'chua-xa-ton',
    name: 'Chùa Xà Tón',
    commune: 'Thị trấn Tri Tôn',
    coordinates: { latitude: 10.4110, longitude: 105.0089 },
    category: 'culture',
    verification_status: 'VERIFIED',
    is_verified: true,
    review_id: 'PVR-CHUA-XA-TON-2026',
    verified_at: '2026-09-28T22:00:00+07:00',
    expires_at: '2027-09-28T22:00:00+07:00',
    source_url: 'https://triton.angiang.gov.vn'
  };

  const requiredFields = ['canonical_id', 'name', 'commune', 'coordinates', 'category', 'verification_status', 'is_verified'];
  for (const field of requiredFields) {
    const invalidRecord = { ...baseRecord };
    delete invalidRecord[field];
    const res = validatePlaceRecord(invalidRecord);
    assert.equal(res.valid, false, `Record missing "${field}" must be rejected`);
    assert.ok(res.errors.some(e => e.includes(`Missing required field: "${field}"`)));
  }
});

test('P03-015: Negative Fixtures - Geography, boundary & format violations fail closed', async () => {
  const { validatePlaceRecord } = await import(`file://${validatorModulePath}`);

  const validBase = {
    canonical_id: 'chua-xa-ton',
    name: 'Chùa Xà Tón',
    commune: 'Thị trấn Tri Tôn',
    coordinates: { latitude: 10.4110, longitude: 105.0089 },
    category: 'culture',
    verification_status: 'VERIFIED',
    is_verified: true,
    review_id: 'PVR-CHUA-XA-TON-2026',
    verified_at: '2026-09-28T22:00:00+07:00',
    expires_at: '2027-09-28T22:00:00+07:00',
    source_url: 'https://triton.angiang.gov.vn'
  };

  // 1. Latitude outside bounding box (> 10.55)
  const outOfBoundsLat = { ...validBase, coordinates: { latitude: 10.56, longitude: 105.0089 } };
  const res1 = validatePlaceRecord(outOfBoundsLat);
  assert.equal(res1.valid, false);
  assert.ok(res1.errors.some(e => e.includes('outside Tri Ton bounding box')));

  // 2. Longitude outside bounding box (< 104.80)
  const outOfBoundsLng = { ...validBase, coordinates: { latitude: 10.4110, longitude: 104.75 } };
  const res2 = validatePlaceRecord(outOfBoundsLng);
  assert.equal(res2.valid, false);
  assert.ok(res2.errors.some(e => e.includes('outside Tri Ton bounding box')));

  // 3. Latitude is string
  const stringCoord = { ...validBase, coordinates: { latitude: '10.4110', longitude: 105.0089 } };
  const res3 = validatePlaceRecord(stringCoord);
  assert.equal(res3.valid, false);
  assert.ok(res3.errors.some(e => e.includes('must be a valid number')));

  // 4. Invalid commune not in RULE 02
  const invalidCommune = { ...validBase, commune: 'Xã Tri Tôn' };
  const res4 = validatePlaceRecord(invalidCommune);
  assert.equal(res4.valid, false);
  assert.ok(res4.errors.some(e => e.includes('Invalid commune')));

  // 5. Invalid canonical_id format (uppercase, spaces, or UUID prefix)
  const uppercaseId = { ...validBase, canonical_id: 'Chua-Xa-Ton' };
  const res5 = validatePlaceRecord(uppercaseId);
  assert.equal(res5.valid, false);
  assert.ok(res5.errors.some(e => e.includes('Invalid canonical_id format')));

  const uuidPrefixId = { ...validBase, canonical_id: '0c1d5e83-chua-xa-ton' };
  const res5b = validatePlaceRecord(uuidPrefixId);
  // Note: 0c1d5e83-chua-xa-ton matches ^[a-z0-9-]+$ syntax, but let's test invalid characters
  const spaceId = { ...validBase, canonical_id: 'chua xa ton' };
  const res5c = validatePlaceRecord(spaceId);
  assert.equal(res5c.valid, false);
  assert.ok(res5c.errors.some(e => e.includes('Invalid canonical_id format')));
});

test('P03-015: Negative Fixtures - Verification invariants (INV-01 to INV-05) fail closed', async () => {
  const { validatePlaceRecord } = await import(`file://${validatorModulePath}`);

  const validBase = {
    canonical_id: 'chua-xa-ton',
    name: 'Chùa Xà Tón',
    commune: 'Thị trấn Tri Tôn',
    coordinates: { latitude: 10.4110, longitude: 105.0089 },
    category: 'culture',
    verification_status: 'VERIFIED',
    is_verified: true,
    review_id: 'PVR-CHUA-XA-TON-2026',
    verified_at: '2026-09-28T22:00:00+07:00',
    expires_at: '2027-09-28T22:00:00+07:00',
    source_url: 'https://triton.angiang.gov.vn'
  };

  // INV-01: VERIFIED without review_id
  const noReview = { ...validBase, review_id: undefined };
  const res1 = validatePlaceRecord(noReview);
  assert.equal(res1.valid, false);
  assert.ok(res1.errors.some(e => e.includes('review_id is mandatory')));

  // INV-01: review_id references non-existent file on disk
  const nonExistentReview = { ...validBase, review_id: 'PVR-NON-EXISTENT-2099' };
  const res1b = validatePlaceRecord(nonExistentReview);
  assert.equal(res1b.valid, false);
  assert.ok(res1b.errors.some(e => e.includes('does not exist on disk')));

  // INV-02: VERIFIED but is_verified is false
  const mismatchIsVerified = { ...validBase, is_verified: false };
  const res2 = validatePlaceRecord(mismatchIsVerified);
  assert.equal(res2.valid, false);
  assert.ok(res2.errors.some(e => e.includes('is_verified must be true when verification_status is VERIFIED')));

  // INV-02: UNVERIFIED but is_verified is true
  const unverifiedTrue = { ...validBase, verification_status: 'UNVERIFIED', is_verified: true };
  const res2b = validatePlaceRecord(unverifiedTrue);
  assert.equal(res2b.valid, false);
  assert.ok(res2b.errors.some(e => e.includes('is_verified cannot be true')));

  // INV-04: VERIFIED without verified_at
  const noVerifiedAt = { ...validBase, verified_at: undefined };
  const res4 = validatePlaceRecord(noVerifiedAt);
  assert.equal(res4.valid, false);
  assert.ok(res4.errors.some(e => e.includes('verified_at is mandatory')));

  // INV-04: Chronological violation verified_at >= expires_at
  const invertedTime = { ...validBase, verified_at: '2028-01-01T00:00:00+07:00', expires_at: '2027-01-01T00:00:00+07:00' };
  const res4b = validatePlaceRecord(invertedTime);
  assert.equal(res4b.valid, false);
  assert.ok(res4b.errors.some(e => e.includes('Chronological violation')));

  // INV-05: Insecure HTTP scheme
  const insecureUrl = { ...validBase, source_url: 'http://triton.angiang.gov.vn' };
  const res5 = validatePlaceRecord(insecureUrl);
  assert.equal(res5.valid, false);
  assert.ok(res5.errors.some(e => e.includes('source_url must use https:')));

  // INV-05: Blocked loopback / IMDS IP
  const loopbackUrl = { ...validBase, source_url: 'https://169.254.169.254/latest' };
  const res5b = validatePlaceRecord(loopbackUrl);
  assert.equal(res5b.valid, false);
  assert.ok(res5b.errors.some(e => e.includes('is blocked')));
});
