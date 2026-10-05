import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  DATA_ROLLBACK_CANONICAL_TARGETS,
  TRI_TON_BOUNDING_BOX,
  isPlaceWithinTriTonBoundingBox,
  verifySnapshotFileIntegrity,
  verifyDataRestoreIntegrity,
} from '../src/lib/dataRollbackRunbook.ts';

const root = path.resolve(import.meta.dirname, '../..');
const runbookPath = path.join(root, 'docs', 'runbooks', 'RUNBOOK_DATA_ROLLBACK.md');
const backupsDir = path.join(root, 'data', 'backups');

test('Runbook document exists and contains standard metadata', () => {
  assert.ok(fs.existsSync(runbookPath), 'RUNBOOK_DATA_ROLLBACK.md must exist in docs/runbooks/');
  const content = fs.readFileSync(runbookPath, 'utf8');
  assert.ok(content.length > 500, 'Runbook document must not be empty');

  // Verify Standard Metadata
  assert.match(content, /RB-DB-DATA-ROLLBACK-001/i, 'Must contain code RB-DB-DATA-ROLLBACK-001');
  assert.match(content, /Chăm Rốch Thi/i, 'Must reference Data Governance Owner Chăm Rốch Thi');
  assert.match(content, /P05-025/i, 'Must reference Task P05-025');
});

test('Proof 1: Snapshot Versioning is formally specified in runbook document', () => {
  const content = fs.readFileSync(runbookPath, 'utf8');

  // Must have snapshot versioning section
  assert.match(content, /## 2\.\s+KIẾN TRÚC PHIÊN BẢN SNAPSHOT/i, 'Must specify snapshot versioning section');

  // Must define standard naming convention
  assert.match(content, /snapshot_manifest_<ISO_TIMESTAMP>\.json/, 'Must specify snapshot_manifest naming');
  assert.match(content, /snapshot_places_<ISO_TIMESTAMP>\.json/, 'Must specify snapshot_places naming');

  // Must specify required cryptographic and governance metadata
  assert.match(content, /sha256/i, 'Must require SHA-256 hash');
  assert.match(content, /GATE_G2/, 'Must link to GATE_G2 approval');
  assert.match(content, /count/i, 'Must require record count');
});

test('Proof 1: Existing repository snapshot exhibits cryptographic integrity and valid manifest schema', () => {
  assert.ok(fs.existsSync(backupsDir), 'data/backups directory must exist');
  const manifestFiles = fs.readdirSync(backupsDir).filter(f => f.startsWith('snapshot_manifest_') && f.endsWith('.json'));
  assert.ok(manifestFiles.length > 0, 'At least one snapshot manifest must exist in data/backups/');

  const manifestPath = path.join(backupsDir, manifestFiles[0]);
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  // Validate manifest schema
  assert.equal(manifest.gate_approval, 'GATE_G2');
  assert.equal(manifest.lead_auditor, 'Chăm Rốch Thi');
  assert.ok(manifest.places?.count >= 100, 'Places count must be at least 100');
  assert.equal(typeof manifest.places?.count, 'number');
  assert.ok(manifest.places?.sha256, 'Places SHA-256 must exist');

  // Validate file integrity on disk
  const placesFilePath = path.join(root, manifest.places.file);
  assert.ok(fs.existsSync(placesFilePath), `Places snapshot file must exist at ${placesFilePath}`);

  const placesContent = fs.readFileSync(placesFilePath, 'utf8');
  const integrityResult = verifySnapshotFileIntegrity(placesContent, manifest.places.sha256);
  assert.equal(integrityResult.valid, true, 'Places snapshot SHA-256 must strictly match manifest');
});

test('Proof 2: Restore Verification Criteria are formally specified in runbook document', () => {
  const content = fs.readFileSync(runbookPath, 'utf8');

  // Must have Restore Verification section
  assert.match(content, /## 5\.\s+TIÊU CHUẨN KIỂM CHỨNG SAU KHÔI PHỤC/i, 'Must specify restore verification section');

  // Must define 5 mandatory criteria
  assert.match(content, /Tiêu chí 1:\s*Hash Checksum/i, 'Must define Criteria 1: Checksum');
  assert.match(content, /Tiêu chí 2:\s*Record Count/i, 'Must define Criteria 2: Record Count');
  assert.match(content, /Tiêu chí 3:\s*Geographic Boundary/i, 'Must define Criteria 3: Bounding Box');
  assert.match(content, /Tiêu chí 4:\s*Row Level Security/i, 'Must define Criteria 4: RLS');
  assert.match(content, /Tiêu chí 5:\s*.*Nghiệm thu|Sign-Off/i, 'Must define Criteria 5: Sign-off');

  // Must specify bounding box parameters
  assert.match(content, /10\.3.*10\.55/, 'Must specify latitude bounds [10.3, 10.55]');
  assert.match(content, /104\.8.*105\.15/, 'Must specify longitude bounds [104.8, 105.15]');
});

test('Proof 2: Runtime module verifies valid restore across all 5 verification criteria', () => {
  // Test valid restore state
  const validRestore = verifyDataRestoreIntegrity({
    restoredPlacesCount: 149,
    outOfBoundaryCount: 0,
    rlsEnabledOnPlaces: true,
    checksumMatchesManifest: true,
    auditorSignOffName: 'Chăm Rốch Thi',
  });

  assert.equal(validRestore.verified, true);
  assert.equal(validRestore.unmetCriteria.length, 0);
  assert.equal(validRestore.criteriaStatus.checksumVerification, true);
  assert.equal(validRestore.criteriaStatus.recordCountVerification, true);
  assert.equal(validRestore.criteriaStatus.boundaryVerification, true);
  assert.equal(validRestore.criteriaStatus.rlsVerification, true);
  assert.equal(validRestore.criteriaStatus.auditorSignOffVerification, true);
});

test('Proof 2: Negative Fault Injections cause restore verification to fail-closed with explicit error diagnostics', () => {
  // Injection 1: Checksum mismatch
  const failedChecksum = verifyDataRestoreIntegrity({
    restoredPlacesCount: 149,
    outOfBoundaryCount: 0,
    rlsEnabledOnPlaces: true,
    checksumMatchesManifest: false,
    auditorSignOffName: 'Chăm Rốch Thi',
  });
  assert.equal(failedChecksum.verified, false);
  assert.match(failedChecksum.unmetCriteria[0], /Checksum verification failed/i);

  // Injection 2: Record count loss (< 149)
  const failedCount = verifyDataRestoreIntegrity({
    restoredPlacesCount: 120,
    outOfBoundaryCount: 0,
    rlsEnabledOnPlaces: true,
    checksumMatchesManifest: true,
    auditorSignOffName: 'Chăm Rốch Thi',
  });
  assert.equal(failedCount.verified, false);
  assert.match(failedCount.unmetCriteria[0], /Record count invariant failed/i);

  // Injection 3: Geographic bounding box violation
  const failedBoundary = verifyDataRestoreIntegrity({
    restoredPlacesCount: 149,
    outOfBoundaryCount: 4,
    rlsEnabledOnPlaces: true,
    checksumMatchesManifest: true,
    auditorSignOffName: 'Chăm Rốch Thi',
  });
  assert.equal(failedBoundary.verified, false);
  assert.match(failedBoundary.unmetCriteria[0], /Geographic boundary invariant failed/i);

  // Injection 4: RLS disabled
  const failedRls = verifyDataRestoreIntegrity({
    restoredPlacesCount: 149,
    outOfBoundaryCount: 0,
    rlsEnabledOnPlaces: false,
    checksumMatchesManifest: true,
    auditorSignOffName: 'Chăm Rốch Thi',
  });
  assert.equal(failedRls.verified, false);
  assert.match(failedRls.unmetCriteria[0], /RLS policy invariant failed/i);

  // Injection 5: Unauthorized auditor sign-off
  const failedAuditor = verifyDataRestoreIntegrity({
    restoredPlacesCount: 149,
    outOfBoundaryCount: 0,
    rlsEnabledOnPlaces: true,
    checksumMatchesManifest: true,
    auditorSignOffName: 'Unverified Operator',
  });
  assert.equal(failedAuditor.verified, false);
  assert.match(failedAuditor.unmetCriteria[0], /Auditor sign-off invariant failed/i);
});

test('Bounding box helper correctly classifies geographical boundaries of Tri Ton', () => {
  // Inside Tri Ton: Chùa Xà Tón (10.421, 105.006)
  assert.equal(isPlaceWithinTriTonBoundingBox(10.421, 105.006), true);

  // Outside Tri Ton: Long Xuyen (10.38, 105.43) -> longitude > 105.15
  assert.equal(isPlaceWithinTriTonBoundingBox(10.38, 105.43), false);

  // Outside Tri Ton: Chau Doc (10.70, 105.12) -> latitude > 10.55
  assert.equal(isPlaceWithinTriTonBoundingBox(10.70, 105.12), false);
});
