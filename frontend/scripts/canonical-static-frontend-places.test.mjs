import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..', '..');

const generatorScriptPath = path.join(REPO_ROOT, 'scripts', 'generate_static_frontend_places.mjs');
const manifestPath = path.join(REPO_ROOT, 'data', 'canonical', 'canonical_manifest.json');
const staticPlacesPath = path.join(REPO_ROOT, 'frontend', 'src', 'data', 'places.canonical.json');

test('P03-019: Positive control - places.canonical.json exists, is parseable, and matches manifest metadata', async () => {
  assert.ok(fs.existsSync(generatorScriptPath), 'generate_static_frontend_places.mjs must exist');
  assert.ok(fs.existsSync(manifestPath), 'canonical_manifest.json must exist');
  assert.ok(fs.existsSync(staticPlacesPath), 'places.canonical.json must exist on disk');

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const staticData = JSON.parse(fs.readFileSync(staticPlacesPath, 'utf8'));

  assert.ok(staticData.source_manifest, 'Must contain source_manifest metadata block');
  assert.equal(staticData.source_manifest.manifest_version, manifest.manifest_version, 'Manifest version must match exactly');
  assert.equal(staticData.source_manifest.schema_version, manifest.schema_version, 'Schema version must match exactly');
  assert.equal(staticData.source_manifest.manifest_name, manifest.manifest_name, 'Manifest name must match');
  assert.equal(staticData.total_count, manifest.places.length, 'Total count must match number of entries in manifest');
  assert.equal(staticData.places.length, manifest.places.length, 'Places array length must match manifest');
  assert.equal(staticData.generator, 'scripts/generate_static_frontend_places.mjs', 'Generator path recorded');
});

test('P03-019: Positive control - 100% POIs in places.canonical.json are VERIFIED and possess required frontend fields', async () => {
  const staticData = JSON.parse(fs.readFileSync(staticPlacesPath, 'utf8'));
  assert.ok(staticData.places.length >= 1, 'At least 1 verified place must be present');

  for (const place of staticData.places) {
    // Verification invariants
    assert.equal(place.verification_status, 'VERIFIED', `Place ${place.canonical_id} must have verification_status VERIFIED`);
    assert.equal(place.is_verified, true, `Place ${place.canonical_id} must have is_verified === true`);
    assert.ok(place.review_id, `Place ${place.canonical_id} must have review_id`);
    assert.ok(place.verified_at, `Place ${place.canonical_id} must have verified_at timestamp`);

    // Required frontend fields
    assert.ok(place.canonical_id, 'Must have canonical_id');
    assert.ok(place.name, `Place ${place.canonical_id} must have name`);
    assert.ok(place.commune, `Place ${place.canonical_id} must have commune`);
    assert.ok(place.coordinates, `Place ${place.canonical_id} must have coordinates`);
    assert.equal(typeof place.coordinates.latitude, 'number');
    assert.equal(typeof place.coordinates.longitude, 'number');
    assert.ok(place.category, `Place ${place.canonical_id} must have category`);
    assert.ok(place.description, `Place ${place.canonical_id} must have description`);
    assert.ok(Array.isArray(place.photos), `Place ${place.canonical_id} must have photos array`);
  }
});

test('P03-019: Positive control - Generator function produces deterministic output', async () => {
  const { generateStaticFrontendPlaces } = await import(`file://${generatorScriptPath}`);
  
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'triton-static-test-'));
  const tempOut1 = path.join(tmpDir, 'places-1.json');
  const tempOut2 = path.join(tmpDir, 'places-2.json');

  try {
    const fixedTimestamp = '2026-09-29T12:00:00.000Z';
    generateStaticFrontendPlaces({ outputPath: tempOut1, generated_at: fixedTimestamp });
    generateStaticFrontendPlaces({ outputPath: tempOut2, generated_at: fixedTimestamp });

    const content1 = fs.readFileSync(tempOut1, 'utf8');
    const content2 = fs.readFileSync(tempOut2, 'utf8');

    assert.equal(content1, content2, 'Consecutive generator runs with fixed timestamp must produce byte-for-byte identical output');
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('P03-019: Negative control - Generator fails closed if checksum mismatch occurs', async () => {
  const { generateStaticFrontendPlaces } = await import(`file://${generatorScriptPath}`);

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'triton-corrupt-test-'));
  const fakeManifestPath = path.join(tmpDir, 'manifest.json');
  const fakePlacesDir = path.join(tmpDir, 'places');
  const fakeOut = path.join(tmpDir, 'out.json');

  try {
    fs.mkdirSync(fakePlacesDir, { recursive: true });
    const placeContent = JSON.stringify({
      canonical_id: 'test-poi',
      verification_status: 'VERIFIED',
      is_verified: true
    });
    fs.writeFileSync(path.join(fakePlacesDir, 'test-poi.json'), placeContent, 'utf8');

    // Create manifest with WRONG checksum
    const fakeManifest = {
      manifest_name: 'Corrupt Test Manifest',
      manifest_version: '1.0.0',
      schema_version: 'CANONICAL-POI-SCHEMA-V1',
      places: [
        {
          canonical_id: 'test-poi',
          file_name: 'test-poi.json',
          sha256: '0000000000000000000000000000000000000000000000000000000000000000'
        }
      ]
    };
    fs.writeFileSync(fakeManifestPath, JSON.stringify(fakeManifest), 'utf8');

    assert.throws(
      () => {
        generateStaticFrontendPlaces({
          manifestPath: fakeManifestPath,
          placesDir: fakePlacesDir,
          outputPath: fakeOut
        });
      },
      /Checksum mismatch/,
      'Must throw Checksum mismatch when file SHA-256 does not match manifest'
    );
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('P03-019: Negative control - Generator fails closed if unverified place is encountered', async () => {
  const { generateStaticFrontendPlaces } = await import(`file://${generatorScriptPath}`);

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'triton-unverified-test-'));
  const fakeManifestPath = path.join(tmpDir, 'manifest.json');
  const fakePlacesDir = path.join(tmpDir, 'places');
  const fakeOut = path.join(tmpDir, 'out.json');

  try {
    fs.mkdirSync(fakePlacesDir, { recursive: true });
    const unverifiedPlace = {
      canonical_id: 'mock-place',
      verification_status: 'PENDING',
      is_verified: false
    };
    const placeStr = JSON.stringify(unverifiedPlace);
    const placeHash = crypto.createHash('sha256').update(placeStr).digest('hex');
    fs.writeFileSync(path.join(fakePlacesDir, 'mock-place.json'), placeStr, 'utf8');

    const fakeManifest = {
      manifest_name: 'Unverified Test Manifest',
      manifest_version: '1.0.0',
      schema_version: 'CANONICAL-POI-SCHEMA-V1',
      places: [
        {
          canonical_id: 'mock-place',
          file_name: 'mock-place.json',
          sha256: placeHash
        }
      ]
    };
    fs.writeFileSync(fakeManifestPath, JSON.stringify(fakeManifest), 'utf8');

    assert.throws(
      () => {
        generateStaticFrontendPlaces({
          manifestPath: fakeManifestPath,
          placesDir: fakePlacesDir,
          outputPath: fakeOut
        });
      },
      /Unverified place detected/,
      'Must reject unverified places unconditionally (Fail Closed)'
    );
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('P03-019: Negative control - Generator fails closed if referenced file is missing', async () => {
  const { generateStaticFrontendPlaces } = await import(`file://${generatorScriptPath}`);

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'triton-missing-test-'));
  const fakeManifestPath = path.join(tmpDir, 'manifest.json');
  const fakePlacesDir = path.join(tmpDir, 'places');
  const fakeOut = path.join(tmpDir, 'out.json');

  try {
    fs.mkdirSync(fakePlacesDir, { recursive: true });

    const fakeManifest = {
      manifest_name: 'Missing File Test',
      manifest_version: '1.0.0',
      schema_version: 'CANONICAL-POI-SCHEMA-V1',
      places: [
        {
          canonical_id: 'non-existent-poi',
          file_name: 'non-existent-poi.json',
          sha256: 'some-hash'
        }
      ]
    };
    fs.writeFileSync(fakeManifestPath, JSON.stringify(fakeManifest), 'utf8');

    assert.throws(
      () => {
        generateStaticFrontendPlaces({
          manifestPath: fakeManifestPath,
          placesDir: fakePlacesDir,
          outputPath: fakeOut
        });
      },
      /Referenced canonical place file not found/,
      'Must reject missing place file referenced in manifest'
    );
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});
