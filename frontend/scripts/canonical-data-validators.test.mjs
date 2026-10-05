import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..', '..');

const MANIFEST_PATH = path.join(REPO_ROOT, 'data', 'canonical', 'canonical_manifest.json');
const CANONICAL_PLACES_DIR = path.join(REPO_ROOT, 'data', 'canonical', 'places');
const VALIDATOR_MODULE_PATH = path.join(REPO_ROOT, 'scripts', 'validate_canonical_dataset.mjs');
const FRONTEND_CANONICAL_JSON_PATH = path.join(REPO_ROOT, 'frontend', 'src', 'data', 'places.canonical.json');

// Dynamically import validators from scripts/validate_canonical_dataset.mjs
const {
  validatePlaceRecord,
  validateGpsBoundary,
  validateCommuneGlossary,
  validateCanonicalIdUniqueness,
  validateCanonicalDataset,
  TRI_TON_15_COMMUNES,
  TRI_TON_BBOX
} = await import(`file://${VALIDATOR_MODULE_PATH}`);

test.describe('P07-005: Canonical Data Validators & Current Manifest Verification', () => {

  test('Suite 1: Canonical Manifest Specification & Cryptographic Integrity', () => {
    assert.ok(fs.existsSync(MANIFEST_PATH), 'canonical_manifest.json must exist');
    const manifestRaw = fs.readFileSync(MANIFEST_PATH, 'utf8');
    const manifest = JSON.parse(manifestRaw);

    // Authority & Versioning checks
    assert.equal(manifest.manifest_name, 'Tri Ton Tourism Official Canonical Dataset Manifest');
    assert.equal(manifest.manifest_version, '1.0.0');
    assert.equal(manifest.schema_version, 'CANONICAL-POI-SCHEMA-V1');
    assert.equal(manifest.authority, 'Hội đồng Quản trị Dữ liệu Du Lịch Tri Tôn');
    assert.equal(manifest.lead_auditor, 'Chăm Rốch Thi');

    // Geographic scope checks
    assert.equal(manifest.dataset_scope.geographic_boundary, 'Tri Ton District, An Giang Province');
    assert.equal(manifest.dataset_scope.commune_count, 15);
    assert.deepEqual(manifest.dataset_scope.bounding_box.latitude, [10.3, 10.55]);
    assert.deepEqual(manifest.dataset_scope.bounding_box.longitude, [104.8, 105.15]);

    // Count checks
    assert.ok(Array.isArray(manifest.places), 'places must be an array');
    assert.equal(manifest.total_verified_count, 1, 'Current canonical manifest has exactly 1 verified POI');
    assert.equal(manifest.total_verified_count, manifest.places.length, 'total_verified_count must strictly match places array length');

    // Individual file cryptographic hash checks
    for (const place of manifest.places) {
      const filePath = path.join(CANONICAL_PLACES_DIR, place.file_name);
      assert.ok(fs.existsSync(filePath), `Place file "${place.file_name}" must exist on disk`);

      const fileBuffer = fs.readFileSync(filePath);
      const computedHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

      assert.equal(computedHash, place.sha256, `SHA-256 mismatch for "${place.canonical_id}"`);
      assert.equal(fileBuffer.length, place.size_bytes, `File size mismatch for "${place.canonical_id}"`);
      assert.equal(place.verification_status, 'VERIFIED');
    }

    // Overall dataset SHA-256 re-computation
    const sortedEntries = [...manifest.places].sort((a, b) => a.canonical_id.localeCompare(b.canonical_id));
    const hashInput = sortedEntries.map(p => `${p.canonical_id}:${p.sha256}`).join('\n');
    const computedOverallHash = crypto.createHash('sha256').update(hashInput).digest('hex');

    assert.equal(computedOverallHash, manifest.overall_sha256, 'overall_sha256 must match recomputed hash of entries');
  });

  test('Suite 2: Schema & Invariant Contract Verification on Production Places', () => {
    const files = fs.readdirSync(CANONICAL_PLACES_DIR).filter(f => f.endsWith('.json'));
    assert.equal(files.length, 1, 'Production canonical places directory contains exactly 1 place file');

    for (const file of files) {
      const filePath = path.join(CANONICAL_PLACES_DIR, file);
      const place = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      const res = validatePlaceRecord(place, { checkDiskReview: true, repoRoot: REPO_ROOT });
      assert.equal(res.valid, true, `Place record "${file}" must pass validation. Errors: ${JSON.stringify(res.errors)}`);
      assert.equal(res.errors.length, 0);

      // Invariant checks
      assert.equal(place.canonical_id, 'chua-xa-ton');
      assert.equal(place.verification_status, 'VERIFIED');
      assert.equal(place.is_verified, true, 'is_verified must be true for VERIFIED POI (INV-02)');
      assert.equal(place.review_id, 'PVR-CHUA-XA-TON-2026', 'review_id must be populated (INV-01)');
      assert.ok(place.verified_at, 'verified_at must be populated (INV-04)');
      assert.ok(place.source_url.startsWith('https://'), 'source_url must be HTTPS (INV-05)');
    }
  });

  test('Suite 3: Geographic Boundary & Administrative Commune Glossary Verification', () => {
    const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

    for (const entry of manifest.places) {
      const place = JSON.parse(fs.readFileSync(path.join(CANONICAL_PLACES_DIR, entry.file_name), 'utf8'));

      // GPS Bounding Box Check
      const gpsResult = validateGpsBoundary(place.coordinates);
      assert.equal(gpsResult.valid, true, `GPS boundary must pass for ${place.canonical_id}`);
      assert.equal(gpsResult.in_bounding_box, true);
      assert.equal(gpsResult.is_swapped, false);
      assert.ok(place.coordinates.latitude >= TRI_TON_BBOX.MIN_LATITUDE && place.coordinates.latitude <= TRI_TON_BBOX.MAX_LATITUDE);
      assert.ok(place.coordinates.longitude >= TRI_TON_BBOX.MIN_LONGITUDE && place.coordinates.longitude <= TRI_TON_BBOX.MAX_LONGITUDE);

      // Commune Glossary Check (RULE 02)
      const communeResult = validateCommuneGlossary(place.commune);
      assert.equal(communeResult.valid, true, `Commune glossary must pass for ${place.canonical_id}`);
      assert.ok(TRI_TON_15_COMMUNES.includes(place.commune), `Commune "${place.commune}" must be in official 15 communes list`);
      assert.equal(place.commune, 'Thị trấn Tri Tôn');
    }
  });

  test('Suite 4: Uniqueness, Concordance & Frontend Static Artifact Alignment', () => {
    const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
    const files = fs.readdirSync(CANONICAL_PLACES_DIR).filter(f => f.endsWith('.json'));

    const parsedPlaces = files.map(f => JSON.parse(fs.readFileSync(path.join(CANONICAL_PLACES_DIR, f), 'utf8')));

    // Uniqueness
    const uniqueness = validateCanonicalIdUniqueness(parsedPlaces);
    assert.equal(uniqueness.valid, true, 'Canonical ID uniqueness must pass with 0 duplicates');
    assert.equal(uniqueness.unique_count, 1);
    assert.equal(uniqueness.errors.length, 0);

    // Concordance Disk vs Manifest
    assert.equal(parsedPlaces.length, manifest.places.length);
    assert.equal(parsedPlaces[0].canonical_id, manifest.places[0].canonical_id);

    // Concordance with Frontend Static Build Artifact (places.canonical.json)
    assert.ok(fs.existsSync(FRONTEND_CANONICAL_JSON_PATH), 'Frontend static canonical artifact must exist');
    const frontendArtifact = JSON.parse(fs.readFileSync(FRONTEND_CANONICAL_JSON_PATH, 'utf8'));

    assert.equal(frontendArtifact.total_count, manifest.total_verified_count);
    assert.equal(frontendArtifact.source_manifest.manifest_version, manifest.manifest_version);
    assert.equal(frontendArtifact.source_manifest.overall_sha256, manifest.overall_sha256);
    assert.equal(frontendArtifact.places[0].canonical_id, manifest.places[0].canonical_id);
  });

  test('Suite 5: Runner Execution (validate_canonical_dataset.mjs)', () => {
    // 1. Programmatic invocation
    const summary = validateCanonicalDataset(undefined, undefined, { checkDiskReview: true, repoRoot: REPO_ROOT });
    assert.equal(summary.valid, true, 'Dataset validation summary must be valid');
    assert.equal(summary.count, 1, 'Validated exactly 1 canonical POI file');
    assert.equal(summary.totalErrors, 0, 'Total errors must be exactly 0');
    assert.ok(summary.uniqueness.valid, 'Uniqueness check must pass');
    assert.ok(summary.manifestValidation.valid, 'Manifest validation must pass');

    // 2. Child Process CLI invocation
    const stdout = execFileSync('node', [VALIDATOR_MODULE_PATH], {
      cwd: REPO_ROOT,
      encoding: 'utf8'
    });
    assert.ok(stdout.includes('Validated 1 canonical POI file(s). Valid: true. Total errors: 0'));
    assert.ok(stdout.includes('Uniqueness check: PASSED'));
    assert.ok(stdout.includes('Manifest concordance check: PASSED'));
  });

  test('Suite 6: Negative Fault Injections (Fail-Closed Guarantees for Release Gate)', () => {
    // Fault 1: Tampered Hash in Manifest
    const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
    const tamperedEntries = manifest.places.map(e => ({
      ...e,
      sha256: '0000000000000000000000000000000000000000000000000000000000000000'
    }));
    const tamperedInput = tamperedEntries.map(p => `${p.canonical_id}:${p.sha256}`).join('\n');
    const tamperedHash = crypto.createHash('sha256').update(tamperedInput).digest('hex');
    assert.notEqual(tamperedHash, manifest.overall_sha256, 'Tampered hash must fail detection');

    // Fault 2: GPS Coordinate Out of Bounding Box
    const outOfBoundsGps = validateGpsBoundary({ latitude: 10.37, longitude: 105.43 }); // Long Xuyen
    assert.equal(outOfBoundsGps.valid, false);
    assert.equal(outOfBoundsGps.error_code, 'GPS_OUT_OF_BOUNDS');

    // Fault 3: Swapped GPS Coordinates
    const swappedGps = validateGpsBoundary({ latitude: 105.0089, longitude: 10.4110 });
    assert.equal(swappedGps.valid, false);
    assert.equal(swappedGps.error_code, 'GPS_SWAPPED_COORDINATES');

    // Fault 4: Non-Glossary / Abbreviated Commune Label
    const invalidCommune = validateCommuneGlossary('TT Tri Tôn');
    assert.equal(invalidCommune.valid, false);
    assert.equal(invalidCommune.suggested_commune, 'Thị trấn Tri Tôn');

    const externalCommune = validateCommuneGlossary('Phường Mỹ Long');
    assert.equal(externalCommune.valid, false);
    assert.equal(externalCommune.suggested_commune, null);

    // Fault 5: Missing Review File on Verified Record (INV-01)
    const placeMissingReview = {
      canonical_id: 'fake-poi',
      name: 'Fake POI',
      commune: 'Thị trấn Tri Tôn',
      category: 'culture',
      coordinates: { latitude: 10.41, longitude: 105.01 },
      verification_status: 'VERIFIED',
      is_verified: true,
      review_id: 'PVR-NON-EXISTENT-2026',
      verified_at: '2026-09-28T22:00:00+07:00',
      source_url: 'https://triton.angiang.gov.vn'
    };
    const missingReviewRes = validatePlaceRecord(placeMissingReview, { checkDiskReview: true, repoRoot: REPO_ROOT });
    assert.equal(missingReviewRes.valid, false);
    assert.ok(missingReviewRes.errors.some(e => e.includes('does not exist on disk')));

    // Fault 6: Non-HTTPS Source URL (INV-05)
    const placeHttpUrl = {
      ...placeMissingReview,
      review_id: 'PVR-CHUA-XA-TON-2026',
      canonical_id: 'chua-xa-ton',
      source_url: 'http://insecure-domain.com'
    };
    const httpUrlRes = validatePlaceRecord(placeHttpUrl, { checkDiskReview: false, repoRoot: REPO_ROOT });
    assert.equal(httpUrlRes.valid, false);
    assert.ok(httpUrlRes.errors.some(e => e.includes('source_url must use https:')));

    // Fault 7: Duplicate Canonical ID
    const duplicateList = [
      { canonical_id: 'chua-xa-ton', name: 'Chùa Xà Tón' },
      { canonical_id: 'chua-xa-ton', name: 'Chùa Xà Tón Nhái' }
    ];
    const duplicateRes = validateCanonicalIdUniqueness(duplicateList);
    assert.equal(duplicateRes.valid, false);
    assert.ok(duplicateRes.errors.some(e => e.includes('Duplicate canonical_id')));
  });

});
