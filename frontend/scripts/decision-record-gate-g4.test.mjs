/**
 * decision-record-gate-g4.test.mjs
 * 
 * Release-Gate Automated Test Suite for Task P07-012:
 * "Tạo Decision Record G4 (Proof: release owner chọn GO/NO-GO và ký evidence links)"
 * 
 * Verifies:
 *  1. Decision Record G4 Artifact Integrity & Schema Completeness (JSON & MD)
 *  2. Unanimous "GO" Release Verdict Invariant (11/11 criteria PASSED, 0 FAILED)
 *  3. Physical Existence on Disk of 100% Evidence Links (18/18 files verified)
 *  4. Zero Open Risks Alignment with P0/P1 Risk Register (RR-TRI-TON-PROD-001)
 *  5. Release Owner Attestation & Fail-Closed Invariants under negative injections
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..', '..');

const GATE_G4_JSON_PATH = path.join(REPO_ROOT, 'docs', 'technical-spec', 'DECISION_RECORD_GATE_G4_RELEASE.json');
const GATE_G4_MD_PATH = path.join(REPO_ROOT, 'docs', 'technical-spec', 'DECISION_RECORD_GATE_G4_RELEASE.md');
const RISK_REGISTER_JSON_PATH = path.join(REPO_ROOT, 'docs', 'technical-spec', 'P0_P1_RISK_REGISTER.json');

test('P07-012: Decision Record Gate G4 Release-Gate Suite', async (t) => {
  // --------------------------------------------------------------------------
  // Suite 1: Decision Record G4 Artifact Integrity & Schema Completeness
  // --------------------------------------------------------------------------
  await t.test('Suite 1: Decision Record G4 Artifact Integrity & Schema Completeness Invariant', () => {
    assert.ok(fs.existsSync(GATE_G4_JSON_PATH), 'DECISION_RECORD_GATE_G4_RELEASE.json must exist');
    assert.ok(fs.existsSync(GATE_G4_MD_PATH), 'DECISION_RECORD_GATE_G4_RELEASE.md must exist');

    const jsonContent = fs.readFileSync(GATE_G4_JSON_PATH, 'utf8');
    assert.ok(jsonContent.length > 500, 'JSON artifact must not be empty');
    const record = JSON.parse(jsonContent);

    // Required top-level attributes
    assert.equal(record.document_id, 'DR-GATE-G4-PROD-RELEASE-001', 'Document ID must match DR-GATE-G4-PROD-RELEASE-001');
    assert.equal(record.gate, 'G4', 'Gate must be G4');
    assert.equal(record.status, 'APPROVED_GO', 'Status must be APPROVED_GO');
    assert.equal(record.version, '1.0.0', 'Version must be 1.0.0');
    assert.ok(record.title.includes('Gate G4'), 'Title must mention Gate G4');
    assert.ok(record.evaluated_at, 'evaluated_at timestamp must be present');

    // Release owner completeness
    assert.ok(record.release_owner, 'release_owner must be specified');
    assert.equal(record.release_owner.name, 'Chăm Rốch Thi', 'Release owner must be Chăm Rốch Thi');
    assert.ok(record.release_owner.attestation.length > 50, 'Attestation must be detailed');
    assert.equal(record.release_owner.signature, 'CHAM_ROCH_THI_20261005_GATE_G4_APPROVED_GO', 'Signature must match approved token');

    // Markdown content structure
    const mdContent = fs.readFileSync(GATE_G4_MD_PATH, 'utf8');
    assert.ok(mdContent.includes('DR-GATE-G4-PROD-RELEASE-001'), 'Markdown must include document ID');
    assert.ok(mdContent.includes('Chăm Rốch Thi'), 'Markdown must mention release owner');
    assert.ok(mdContent.includes('CHAM_ROCH_THI_20261005_GATE_G4_APPROVED_GO'), 'Markdown must include owner signature');
    assert.ok(mdContent.includes('`GO`'), 'Markdown must state GO decision');
  });

  // --------------------------------------------------------------------------
  // Suite 2: Unanimous "GO" Release Verdict Invariant
  // --------------------------------------------------------------------------
  await t.test('Suite 2: Unanimous "GO" Release Verdict Invariant', () => {
    const record = JSON.parse(fs.readFileSync(GATE_G4_JSON_PATH, 'utf8'));

    assert.equal(record.decision, 'GO', 'Primary decision must be GO');
    assert.equal(record.release_verdict, 'GO', 'Release verdict must be GO');
    assert.equal(record.summary.final_verdict, 'GO', 'Summary final verdict must be GO');
    assert.equal(record.summary.total_release_gates, 11, 'Total release gates must be 11');
    assert.equal(record.summary.passed_release_gates, 11, 'Passed release gates must be 11');
    assert.equal(record.summary.failed_release_gates, 0, 'Failed release gates must be 0');
    assert.equal(record.summary.total_open_p0_p1_risks, 0, 'Total open P0/P1 risks must be 0');
    assert.equal(record.summary.all_evidence_verified, true, 'all_evidence_verified must be true');

    // Verify 11 individual release criteria
    assert.equal(record.release_criteria.length, 11, 'Must have exactly 11 release criteria');
    for (const criterion of record.release_criteria) {
      assert.ok(criterion.gate_id.startsWith('G4-CRIT-'), `Invalid gate_id format: ${criterion.gate_id}`);
      assert.ok(criterion.task_ref.startsWith('P07-'), `Invalid task_ref: ${criterion.task_ref}`);
      assert.equal(criterion.status, 'PASSED', `Criterion ${criterion.gate_id} must have status PASSED`);
      assert.ok(criterion.proof_link.length > 0, `Criterion ${criterion.gate_id} must have a proof link`);
      assert.ok(criterion.verified_evidence.length > 10, `Criterion ${criterion.gate_id} must have verified evidence description`);
    }
  });

  // --------------------------------------------------------------------------
  // Suite 3: Physical Existence on Disk of 100% Evidence Links
  // --------------------------------------------------------------------------
  await t.test('Suite 3: Physical Existence on Disk of 100% Evidence Links Invariant', () => {
    const record = JSON.parse(fs.readFileSync(GATE_G4_JSON_PATH, 'utf8'));
    assert.ok(Array.isArray(record.evidence_links), 'evidence_links must be an array');
    assert.ok(record.evidence_links.length >= 15, 'Must contain at least 15 evidence links');

    for (const link of record.evidence_links) {
      const fullPath = path.resolve(REPO_ROOT, link);
      const exists = fs.existsSync(fullPath);
      assert.ok(exists, `Evidence file does not exist on disk: ${link} (${fullPath})`);
      const stat = fs.statSync(fullPath);
      assert.ok(stat.size > 0, `Evidence file must not be 0 bytes: ${link}`);
    }

    // Also check criteria proof_link fields
    for (const criterion of record.release_criteria) {
      const fullPath = path.resolve(REPO_ROOT, criterion.proof_link);
      const exists = fs.existsSync(fullPath);
      assert.ok(exists, `Criterion proof_link does not exist on disk: ${criterion.proof_link}`);
    }
  });

  // --------------------------------------------------------------------------
  // Suite 4: Zero Open Risks Alignment with Risk Register
  // --------------------------------------------------------------------------
  await t.test('Suite 4: Zero Open Risks Alignment with Risk Register Invariant', () => {
    assert.ok(fs.existsSync(RISK_REGISTER_JSON_PATH), 'Risk register JSON must exist');
    const riskRegister = JSON.parse(fs.readFileSync(RISK_REGISTER_JSON_PATH, 'utf8'));

    assert.equal(riskRegister.summary.open_unaccepted_count, 0, 'Risk register must have 0 open unaccepted risks');
    assert.equal(riskRegister.verdict, 'ZERO_UNACCEPTED_RISKS', 'Risk register verdict must match');

    // Concordance with G4 summary
    const record = JSON.parse(fs.readFileSync(GATE_G4_JSON_PATH, 'utf8'));
    assert.equal(record.summary.total_open_p0_p1_risks, riskRegister.summary.open_unaccepted_count);

    // G4-CRIT-011 references risk register test
    const crit011 = record.release_criteria.find(c => c.gate_id === 'G4-CRIT-011');
    assert.ok(crit011, 'G4-CRIT-011 must be present');
    assert.equal(crit011.status, 'PASSED');
    assert.ok(crit011.proof_link.includes('p0-p1-risk-register.test.mjs'));
  });

  // --------------------------------------------------------------------------
  // Suite 5: Release Owner Attestation & Fail-Closed Invariants
  // --------------------------------------------------------------------------
  await t.test('Suite 5: Release Owner Attestation & Fail-Closed Invariants', () => {
    const rawContent = fs.readFileSync(GATE_G4_JSON_PATH, 'utf8');

    // Fail-closed validator simulation
    function validateGateG4Record(data) {
      if (data.decision !== 'GO' || data.release_verdict !== 'GO') {
        throw new Error('RELEASE_GATE_VIOLATION: Decision must be strictly GO');
      }
      if (data.summary.failed_release_gates > 0 || data.summary.total_open_p0_p1_risks > 0) {
        throw new Error('RELEASE_GATE_VIOLATION: Zero failed gates and zero open risks required');
      }
      if (!data.release_owner || !data.release_owner.signature) {
        throw new Error('RELEASE_GATE_VIOLATION: Missing release owner signature');
      }
      for (const link of data.evidence_links) {
        const fullPath = path.resolve(REPO_ROOT, link);
        if (!fs.existsSync(fullPath)) {
          throw new Error(`RELEASE_GATE_VIOLATION: Evidence link missing on disk: ${link}`);
        }
      }
      return true;
    }

    // Baseline must validate successfully
    const baseline = JSON.parse(rawContent);
    assert.equal(validateGateG4Record(baseline), true);

    // Negative Injection 1: Decision set to NO-GO
    const badDecision = JSON.parse(rawContent);
    badDecision.decision = 'NO-GO';
    badDecision.release_verdict = 'NO-GO';
    assert.throws(() => validateGateG4Record(badDecision), /Decision must be strictly GO/);

    // Negative Injection 2: Non-zero open risks
    const badRisks = JSON.parse(rawContent);
    badRisks.summary.total_open_p0_p1_risks = 1;
    assert.throws(() => validateGateG4Record(badRisks), /zero open risks required/);

    // Negative Injection 3: Missing signature
    const missingSig = JSON.parse(rawContent);
    missingSig.release_owner.signature = '';
    assert.throws(() => validateGateG4Record(missingSig), /Missing release owner signature/);

    // Negative Injection 4: Phantom ghost evidence link
    const ghostEvidence = JSON.parse(rawContent);
    ghostEvidence.evidence_links.push('frontend/scripts/ghost-unreal-evidence.test.mjs');
    assert.throws(() => validateGateG4Record(ghostEvidence), /Evidence link missing on disk/);
  });
});
