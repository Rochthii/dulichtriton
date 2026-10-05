import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../..');
const manifestPath = path.join(root, 'data', 'canonical', 'canonical_manifest.json');
const docOverviewPath = path.join(root, 'docs', '01_Project_Overview.md');

test('P06-003: Canonical Manifest Integrity and Authority Verification', () => {
  assert.ok(fs.existsSync(manifestPath), 'data/canonical/canonical_manifest.json must exist');
  assert.ok(fs.existsSync(docOverviewPath), 'docs/01_Project_Overview.md must exist');

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert.equal(typeof manifest.total_verified_count, 'number', 'Manifest must declare total_verified_count');
  assert.ok(manifest.manifest_version, 'Manifest must declare manifest_version');
  assert.ok(manifest.schema_version, 'Manifest must declare schema_version');
});

test('P06-003: Elimination of Outdated/Unverified POI Claims in docs/01_Project_Overview.md', () => {
  const docContent = fs.readFileSync(docOverviewPath, 'utf8');

  // Must NOT contain the outdated claim "82+ địa điểm"
  assert.equal(
    docContent.includes('82+ địa điểm'),
    false,
    'docs/01_Project_Overview.md MUST NOT contain outdated "82+ địa điểm" claim'
  );

  // Must NOT contain ambiguous "master 82 địa điểm"
  assert.equal(
    docContent.includes('master 82'),
    false,
    'docs/01_Project_Overview.md MUST NOT contain "master 82" claim'
  );
});

test('P06-003 PROOF: Document Explicitly Declares Manifest Version, Source, and Verified POI Count', () => {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const docContent = fs.readFileSync(docOverviewPath, 'utf8');

  const expectedVersion = manifest.manifest_version; // "1.0.0"
  const expectedCount = manifest.total_verified_count; // 1
  const expectedCanonicalId = manifest.places[0].canonical_id; // "chua-xa-ton"

  // 1. Proof of Version: Must reference exact canonical manifest version
  assert.match(
    docContent,
    new RegExp(`Canonical Manifest v${expectedVersion.replace('.', '\\.')}`, 'i'),
    `Document must explicitly state 'Canonical Manifest v${expectedVersion}'`
  );

  // 2. Proof of Source: Must reference exact canonical manifest source file path
  assert.match(
    docContent,
    /data\/canonical\/canonical_manifest\.json/,
    "Document must explicitly cite source 'data/canonical/canonical_manifest.json'"
  );

  // 3. Proof of Verified Count: Must declare the exact verified POI count
  assert.match(
    docContent,
    new RegExp(`(?:Số lượng POI Canonical Đã Xác Minh|Canonical Verified đầy đủ)[^\\n]*\`?${expectedCount}\`?\\s*POI`, 'i'),
    `Document must declare verified count of '${expectedCount} POI'`
  );

  // 4. Proof of Verified Entity Identity: Must reference canonical ID
  assert.match(
    docContent,
    new RegExp(expectedCanonicalId),
    `Document must reference verified entity '${expectedCanonicalId}'`
  );

  // 5. Proof of Decision Gate Authority
  assert.match(
    docContent,
    /Decision Gate G2|GATE_G2/i,
    'Document must link authority to Decision Gate G2'
  );
});

test('P06-003: Clean Distinction Between Verified Canonical and Raw Candidate Dataset', () => {
  const docContent = fs.readFileSync(docOverviewPath, 'utf8');

  // Must distinguish between verified canonical POIs and the raw survey dataset (1,592 records)
  assert.match(
    docContent,
    /`?1,592`?\s*bản ghi/i,
    'Document must explicitly quantify candidate survey dataset as 1,592 records'
  );

  assert.match(
    docContent,
    /tri_ton_master_cleaned\.csv/,
    'Document must reference data/tri_ton_master_cleaned.csv as candidate dataset'
  );

  assert.match(
    docContent,
    /Review Queue/i,
    'Document must state that unverified records are processed via Review Queue'
  );
});
