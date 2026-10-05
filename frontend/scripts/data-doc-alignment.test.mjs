import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../..');
const dbDocPath = path.join(root, 'docs', '05_Database.md');
const manifestPath = path.join(root, 'data', 'canonical', 'canonical_manifest.json');

// 15 Canonical Communes and Towns of Tri Ton District under Decision Gate G1 & RULE 02
const OFFICIAL_15_COMMUNES_G1 = [
  'Thị trấn Tri Tôn',
  'Thị trấn Ba Chúc',
  'Xã An Tức',
  'Xã Châu Lăng',
  'Xã Cô Tô',
  'Xã Lạc Quới',
  'Xã Lê Trì',
  'Xã Lương An Trà',
  'Xã Lương Phi',
  'Xã Núi Tô',
  'Xã Ô Lâm',
  'Xã Tà Đảnh',
  'Xã Tân Tuyến',
  'Xã Vĩnh Gia',
  'Xã Vĩnh Phước',
];

test('Test 1: Database Documentation Exists and Contains Standard Structure', () => {
  assert.ok(fs.existsSync(dbDocPath), 'docs/05_Database.md must physically exist');
  const stats = fs.statSync(dbDocPath);
  assert.ok(stats.size > 1500, `docs/05_Database.md must be comprehensive (size: ${stats.size} bytes > 1500)`);

  const content = fs.readFileSync(dbDocPath, 'utf8');
  assert.match(content, /# 05\.\s+CƠ SỞ DỮ LIỆU/i, 'Must contain standard database design title');
});

test('Test 2: Decision Gate G2 & Canonical Manifest Alignment (Version, Source & Verified Count)', () => {
  assert.ok(fs.existsSync(manifestPath), 'data/canonical/canonical_manifest.json must exist');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  const content = fs.readFileSync(dbDocPath, 'utf8');

  // Verify explicit declaration of Canonical Manifest version
  assert.match(content, /v1\.0\.0/, 'docs/05_Database.md must cite Canonical Manifest version v1.0.0');
  assert.equal(manifest.manifest_version, '1.0.0', 'Manifest version must match v1.0.0');

  // Verify explicit schema version citation
  assert.match(content, /CANONICAL-POI-SCHEMA-V1/, 'docs/05_Database.md must cite schema CANONICAL-POI-SCHEMA-V1');
  assert.equal(manifest.schema_version, 'CANONICAL-POI-SCHEMA-V1');

  // Verify manifest source path citation
  assert.match(content, /data\/canonical\/canonical_manifest\.json/, 'docs/05_Database.md must cite exact manifest path');

  // Verify exact total verified count concordance
  assert.match(
    content,
    new RegExp(`total_verified_count[^\\d]*${manifest.total_verified_count}|${manifest.total_verified_count}\\s+(?:POI|địa điểm)\\s+canonical`, 'i'),
    `docs/05_Database.md must strictly declare ${manifest.total_verified_count} canonical verified POI(s)`
  );
  assert.equal(manifest.total_verified_count, 1, 'Canonical manifest currently contains exactly 1 verified POI');

  // Verify citation of cryptographic hash
  assert.match(content, /SHA-256|sha256/i, 'docs/05_Database.md must cite cryptographic SHA-256 integrity');
});

test('Test 3: Zero Tolerance for Obsolete/Unverified Claims & Clear 2-Tier Data Boundary', () => {
  const content = fs.readFileSync(dbDocPath, 'utf8');

  // Negative invariant: MUST NOT contain legacy unverified claims
  assert.doesNotMatch(content, /82 bản ghi v10\.0\.0/i, 'Obsolete claim "82 bản ghi v10.0.0" must be eliminated');
  assert.doesNotMatch(content, /master 82/i, 'Obsolete claim "master 82" must be eliminated');

  // Must clearly distinguish Tier 1 (Canonical Verified) from Tier 2 (Raw Survey Candidates in Review Queue)
  assert.match(content, /1[,.]?592/i, 'Must acknowledge 1,592 raw survey records in tri_ton_master_cleaned.csv');
  assert.match(content, /Review Queue|Hàng đợi thẩm định/i, 'Must specify candidate records are governed by Review Queue');
  assert.match(content, /tri_ton_master_cleaned\.csv/, 'Must cite candidate source tri_ton_master_cleaned.csv');
});

test('Test 4: Decision Gate G1 & RULE 02 Compliance (Official 15 Communes & Bounding Box)', () => {
  const content = fs.readFileSync(dbDocPath, 'utf8');

  // Must define exact geographic bounding box of Tri Ton
  assert.match(content, /10\.30/i, 'Bounding box latitude min must be 10.30');
  assert.match(content, /10\.55/i, 'Bounding box latitude max must be 10.55');
  assert.match(content, /104\.80/i, 'Bounding box longitude min must be 104.80');
  assert.match(content, /105\.15/i, 'Bounding box longitude max must be 105.15');

  // Must enumerate 100% of all 15 official administrative units without exception
  for (const commune of OFFICIAL_15_COMMUNES_G1) {
    assert.ok(
      content.includes(commune),
      `docs/05_Database.md must explicitly contain official commune '${commune}'`
    );
  }

  // Must strictly forbid prohibited abbreviations in commune names
  assert.doesNotMatch(content, /TT Tri Tôn/i, 'Forbidden abbreviation "TT Tri Tôn" must not exist');
  assert.doesNotMatch(content, /TT Ba Chúc/i, 'Forbidden abbreviation "TT Ba Chúc" must not exist');
  assert.doesNotMatch(content, /TT\.\s+Tri Tôn/i, 'Forbidden abbreviation "TT. Tri Tôn" must not exist');
  assert.doesNotMatch(content, /TT\.\s+Ba Chúc/i, 'Forbidden abbreviation "TT. Ba Chúc" must not exist');
});

test('Test 5: Production Database Architecture & RLS Security Lockdown Conformance', () => {
  const content = fs.readFileSync(dbDocPath, 'utf8');

  // Verify PostGIS and pgvector technology citations
  assert.match(content, /PostGIS/i, 'Must cite PostGIS spatial extension');
  assert.match(content, /pgvector/i, 'Must cite pgvector semantic search extension');
  assert.match(content, /knmlbwsmfljlabhvqfid/, 'Must cite real Supabase project reference knmlbwsmfljlabhvqfid');

  // Verify Row Level Security (RLS) Lockdown Matrix citation (P02-024)
  assert.match(content, /Row Level Security|RLS/i, 'Must document Row Level Security enforcement');
  assert.match(content, /P02-024/i, 'Must cite security baseline P02-024');
  assert.match(content, /RUNBOOK_DATA_ROLLBACK/i, 'Must reference data rollback runbook');
});
