import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..', '..');

const MANIFEST_PATH = path.join(REPO_ROOT, 'data', 'canonical', 'canonical_manifest.json');
const CANONICAL_PLACES_DIR = path.join(REPO_ROOT, 'data', 'canonical', 'places');

test('P03-014: Manifest file exists and conforms to structure', () => {
  assert.ok(fs.existsSync(MANIFEST_PATH), 'canonical_manifest.json must exist');

  const content = fs.readFileSync(MANIFEST_PATH, 'utf8');
  const manifest = JSON.parse(content);

  assert.equal(manifest.manifest_version, '1.0.0');
  assert.equal(manifest.schema_version, 'CANONICAL-POI-SCHEMA-V1');
  assert.equal(manifest.lead_auditor, 'Chăm Rốch Thi');
  assert.equal(manifest.dataset_scope.commune_count, 15);
  assert.ok(Array.isArray(manifest.places), 'places must be an array');
  assert.equal(manifest.total_verified_count, manifest.places.length, 'total_verified_count must strictly match places array length');
  assert.ok(manifest.total_verified_count >= 1, 'Dataset must have at least 1 verified record');

  // Verify documentation exists
  const docPath = path.join(REPO_ROOT, 'docs', 'technical-spec', 'CANONICAL_DATASET_MANIFEST.md');
  assert.ok(fs.existsSync(docPath), 'CANONICAL_DATASET_MANIFEST.md documentation must exist');
});

test('P03-014: Cryptographic hash verification of individual POI files', () => {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

  for (const entry of manifest.places) {
    const placeFilePath = path.join(CANONICAL_PLACES_DIR, entry.file_name);
    assert.ok(fs.existsSync(placeFilePath), `File ${entry.file_name} must exist on disk`);

    const fileBuffer = fs.readFileSync(placeFilePath);
    const computedHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    assert.equal(
      computedHash,
      entry.sha256,
      `Cryptographic mismatch for ${entry.canonical_id}: expected ${entry.sha256}, got ${computedHash}`
    );
    assert.equal(
      fileBuffer.length,
      entry.size_bytes,
      `Size mismatch for ${entry.canonical_id}`
    );
    assert.equal(entry.verification_status, 'VERIFIED');
    assert.ok(entry.review_id, 'review_id must be populated');
    assert.ok(entry.verified_at, 'verified_at must be populated');
    assert.ok(entry.source_url, 'source_url must be populated');
  }
});

test('P03-014: Overall dataset hash verification and tamper resistance', () => {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

  // Re-compute overall hash deterministically
  const sortedEntries = [...manifest.places].sort((a, b) => a.canonical_id.localeCompare(b.canonical_id));
  const hashInput = sortedEntries.map(p => `${p.canonical_id}:${p.sha256}`).join('\n');
  const computedOverallHash = crypto.createHash('sha256').update(hashInput).digest('hex');

  assert.equal(
    computedOverallHash,
    manifest.overall_sha256,
    `Overall SHA-256 mismatch: expected ${manifest.overall_sha256}, got ${computedOverallHash}`
  );

  // Negative control: simulated file tamper detected
  const tamperedEntries = sortedEntries.map(e => ({
    ...e,
    sha256: e.sha256.replace(/^[0-9a-f]/, '0') === e.sha256 ? '1' + e.sha256.slice(1) : '0' + e.sha256.slice(1)
  }));
  const tamperedInput = tamperedEntries.map(p => `${p.canonical_id}:${p.sha256}`).join('\n');
  const tamperedOverallHash = crypto.createHash('sha256').update(tamperedInput).digest('hex');
  assert.notEqual(tamperedOverallHash, manifest.overall_sha256, 'Tampered dataset must produce different overall SHA-256');
});

test('P03-014: Generator script reproducibility', async () => {
  const generatorModulePath = path.join(REPO_ROOT, 'scripts', 'generate_canonical_manifest.mjs');
  assert.ok(fs.existsSync(generatorModulePath), 'generate_canonical_manifest.mjs must exist');

  const { generateManifest } = await import(`file://${generatorModulePath}`);
  const freshManifest = generateManifest({ generated_at: '2026-09-28T22:20:00+07:00' });

  const diskManifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  assert.equal(freshManifest.overall_sha256, diskManifest.overall_sha256, 'Regenerating manifest must be idempotent');
  assert.equal(freshManifest.total_verified_count, diskManifest.total_verified_count);
});
