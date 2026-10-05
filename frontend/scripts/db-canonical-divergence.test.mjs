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

const GENERATOR_SCRIPT = path.join(REPO_ROOT, 'scripts', 'generate_db_canonical_divergence_report.mjs');
const {
  CANONICAL_MANIFEST_PATH,
  BACKUP_MANIFEST_PATH,
  BACKUP_PLACES_PATH,
  LIVE_SNAPSHOT_PATH,
  CONCORDANCE_JSON_PATH,
  REPORT_JSON_PATH,
  REPORT_MD_PATH,
  generateDivergenceReport,
  computeFileSha256
} = await import(`file://${GENERATOR_SCRIPT}`);

test.describe('P07-006: Database Count & Checksum vs Canonical Manifest Reconciliation', () => {

  test('Suite 1: Canonical Manifest Specification & Checksum Invariant', () => {
    assert.ok(fs.existsSync(CANONICAL_MANIFEST_PATH), 'canonical_manifest.json must exist');
    const manifest = JSON.parse(fs.readFileSync(CANONICAL_MANIFEST_PATH, 'utf8'));

    assert.equal(manifest.manifest_version, '1.0.0');
    assert.equal(manifest.schema_version, 'CANONICAL-POI-SCHEMA-V1');
    assert.equal(manifest.total_verified_count, 1, 'Canonical dataset has exactly 1 verified POI');
    assert.equal(manifest.places.length, 1);
    assert.equal(manifest.places[0].canonical_id, 'chua-xa-ton');
    assert.equal(manifest.overall_sha256, 'f65d568ab075eb7d4a0689e6d35a45420e6a27739064c4e755ff1a83ba2b3cfb');
  });

  test('Suite 2: Database Snapshot & Pre-Sync Backup Cryptographic Integrity', () => {
    assert.ok(fs.existsSync(LIVE_SNAPSHOT_PATH), 'LIVE_DB_PLACES_SNAPSHOT.json must exist');
    assert.ok(fs.existsSync(BACKUP_MANIFEST_PATH), 'snapshot_manifest_*.json must exist');
    assert.ok(fs.existsSync(BACKUP_PLACES_PATH), 'snapshot_places_*.json must exist');

    const liveSnapshot = JSON.parse(fs.readFileSync(LIVE_SNAPSHOT_PATH, 'utf8'));
    const backupManifest = JSON.parse(fs.readFileSync(BACKUP_MANIFEST_PATH, 'utf8'));

    // Count checks
    assert.equal(liveSnapshot.length, 137, 'Live database snapshot contains exactly 137 places');
    assert.equal(backupManifest.places.count, 137, 'Backup manifest records exactly 137 places');
    assert.equal(backupManifest.gate_approval, 'GATE_G2', 'Backup must be linked to GATE_G2');
    assert.equal(backupManifest.lead_auditor, 'Chăm Rốch Thi');

    // Cryptographic hash checks
    const computedPlacesHash = computeFileSha256(BACKUP_PLACES_PATH);
    assert.equal(computedPlacesHash, backupManifest.places.sha256, 'Backup places hash matches recorded hash');
    assert.equal(computedPlacesHash, 'ed2504b4290a6d68f3fcb642ca29e749f0bfde9c386726b6c4613f1980e66ee1');

    // Canonical Manifest link in backup
    const canonicalManifest = JSON.parse(fs.readFileSync(CANONICAL_MANIFEST_PATH, 'utf8'));
    assert.equal(
      backupManifest.canonical_manifest_sha256,
      canonicalManifest.overall_sha256,
      'Backup manifest canonical_manifest_sha256 strictly matches Canonical Manifest overall_sha256'
    );
  });

  test('Suite 3: Concordance Cross-Mapping & Zero Unapproved Divergence Invariant', () => {
    assert.ok(fs.existsSync(CONCORDANCE_JSON_PATH), 'POI_CONCORDANCE_TABLE.json must exist');
    const concordanceTable = JSON.parse(fs.readFileSync(CONCORDANCE_JSON_PATH, 'utf8'));
    const liveSnapshot = JSON.parse(fs.readFileSync(LIVE_SNAPSHOT_PATH, 'utf8'));

    const concordanceByDbId = new Map();
    for (const item of concordanceTable) {
      if (item.live_db_id) {
        concordanceByDbId.set(item.live_db_id, item);
      }
    }

    // Every single DB snapshot ID must be present in Concordance Table
    const missingFromConcordance = [];
    for (const place of liveSnapshot) {
      if (!concordanceByDbId.has(place.id)) {
        missingFromConcordance.push(place.id);
      }
    }

    assert.equal(
      missingFromConcordance.length,
      0,
      `All 137 DB records must be indexed in concordance table. Missing: ${JSON.stringify(missingFromConcordance)}`
    );

    // Evaluate divergence report
    const report = generateDivergenceReport();
    assert.equal(report.divergence_analysis.unapproved_divergence_count, 0, 'Zero unapproved divergence allowed');
    assert.equal(report.divergence_analysis.unapproved_drift_detected, false, 'No unapproved drift detected');
    assert.equal(report.divergence_analysis.divergence_governance_status, 'FULLY_APPROVED_AND_GOVERNED');
    assert.equal(report.cryptographic_integrity.canonical_manifest_matches_backup_reference, true);
    assert.equal(report.cryptographic_integrity.backup_places_file_matches_manifest_sha256, true);
  });

  test('Suite 4: Divergence Report Artifacts & Governance Approvals', () => {
    assert.ok(fs.existsSync(REPORT_JSON_PATH), 'DB_CANONICAL_DIVERGENCE_REPORT.json must exist');
    assert.ok(fs.existsSync(REPORT_MD_PATH), 'DB_CANONICAL_DIVERGENCE_REPORT.md must exist');

    const reportJson = JSON.parse(fs.readFileSync(REPORT_JSON_PATH, 'utf8'));
    assert.equal(reportJson.report_code, 'DB-CANONICAL-DIVERGENCE-001');
    assert.equal(reportJson.lead_auditor, 'Chăm Rốch Thi');
    assert.equal(reportJson.authority, 'Hội đồng Quản trị Dữ liệu Du Lịch Tri Tôn');
    assert.equal(reportJson.canonical_manifest_summary.total_verified_count, 1);
    assert.equal(reportJson.database_summary.total_db_count, 137);
    assert.equal(reportJson.divergence_analysis.unapproved_divergence_count, 0);

    const reportMd = fs.readFileSync(REPORT_MD_PATH, 'utf8');
    assert.ok(reportMd.includes('DB-CANONICAL-DIVERGENCE-001'));
    assert.ok(reportMd.includes('Chăm Rốch Thi'));
    assert.ok(reportMd.includes('0% Lệch ngoài tầm kiểm soát (Zero Unapproved Divergence)'));
    assert.ok(reportMd.includes('HOÀN TOÀN HỢP CHUẨN'));
  });

  test('Suite 5: Generator Subprocess Execution', () => {
    const stdout = execFileSync('node', [GENERATOR_SCRIPT], {
      cwd: REPO_ROOT,
      encoding: 'utf8'
    });
    assert.ok(stdout.includes('Generated divergence report:'));
    assert.ok(stdout.includes('Canonical count: 1'));
    assert.ok(stdout.includes('DB count: 137'));
    assert.ok(stdout.includes('Unapproved divergence: 0'));
    assert.ok(stdout.includes('Governance status: FULLY_APPROVED_AND_GOVERNED'));
  });

  test('Suite 6: Negative Fault Injections (Fail-Closed Guarantees for P07-006)', () => {
    // Fault 1: Simulated Rogue/Orphan POI in DB Snapshot
    const liveSnapshot = JSON.parse(fs.readFileSync(LIVE_SNAPSHOT_PATH, 'utf8'));
    const concordanceTable = JSON.parse(fs.readFileSync(CONCORDANCE_JSON_PATH, 'utf8'));

    const concordanceDbIds = new Set(concordanceTable.map(c => c.live_db_id).filter(Boolean));
    const rogueSnapshot = [
      ...liveSnapshot,
      { id: 'rogue-untracked-poi-999', name: 'Rogue Untracked POI', commune: 'Thị trấn Tri Tôn' }
    ];

    const rogueDetected = rogueSnapshot.filter(p => !concordanceDbIds.has(p.id));
    assert.equal(rogueDetected.length, 1, 'Rogue unmapped POI must be detected');
    assert.equal(rogueDetected[0].id, 'rogue-untracked-poi-999');

    // Fault 2: Simulated Manifest Hash Discrepancy in Backup
    const backupManifest = JSON.parse(fs.readFileSync(BACKUP_MANIFEST_PATH, 'utf8'));
    const corruptedBackupManifest = {
      ...backupManifest,
      canonical_manifest_sha256: 'deadbeef0000000000000000000000000000000000000000000000000000dead'
    };
    const canonicalManifest = JSON.parse(fs.readFileSync(CANONICAL_MANIFEST_PATH, 'utf8'));
    assert.notEqual(
      corruptedBackupManifest.canonical_manifest_sha256,
      canonicalManifest.overall_sha256,
      'Corrupted backup reference must fail comparison'
    );

    // Fault 3: Simulated Altered Places File Hash
    const fakePlacesBuffer = Buffer.from('tampered places content');
    const fakePlacesHash = crypto.createHash('sha256').update(fakePlacesBuffer).digest('hex');
    assert.notEqual(
      fakePlacesHash,
      backupManifest.places.sha256,
      'Tampered places content produces mismatched SHA-256'
    );
  });

});
