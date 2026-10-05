/**
 * ─────────────────────────────────────────────────────────────────────────────
 * TEST SUITE: P07-011 — Review Open P0/P1 Risk Register Release-Gate Suite
 * (Proof: Zero Unaccepted P0/P1 Risks Invariant — Không còn risk chưa accept)
 * 
 * RÀNG BUỘC KIỂM TOÁN HỆ THỐNG SẢN XUẤT (PRODUCTION-REAL SYSTEM CONSTRAINTS):
 * 1. Zero Unaccepted Risk Invariant: 100% các rủi ro mức P0 (Blocker) và P1 (Critical/High)
 *    phải ở trạng thái `REMEDIATED` hoặc `ACCEPTED_RISK`. Tuyệt đối không còn rủi ro nào
 *    ở trạng thái `OPEN`, `PENDING`, `UNREVIEWED`, hoặc `UNACCEPTED`.
 * 2. P0 Blocker Remediated Invariant: Toàn bộ 100% các rủi ro nghiêm trọng nhất (P0)
 *    đều phải được khắc phục hoàn toàn (`acceptance_status === 'REMEDIATED'`).
 * 3. Formal Accepted Risk Governance Invariant: Mọi rủi ro chấp nhận (`ACCEPTED_RISK`)
 *    phải có `decision_ref` hợp lệ, người chịu trách nhiệm (`owner`) và giải trình (`rationale`).
 * 4. Proof Link Physical Verification Invariant: 100% các đường dẫn bằng chứng (`proof_link`)
 *    được trích dẫn phải tồn tại thực tế trên đĩa cứng.
 * 5. Strict Fault Injection: Bất kỳ rủi ro nào mang trạng thái `OPEN` hoặc thiếu thông tin
 *    pháp lý đều bị hệ thống phát hiện và fail-closed tức thì.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');
const frontendDir = path.resolve(__dirname, '..');

const riskRegisterJsonPath = path.join(rootDir, 'docs', 'technical-spec', 'P0_P1_RISK_REGISTER.json');
const riskRegisterMdPath = path.join(rootDir, 'docs', 'technical-spec', 'P0_P1_RISK_REGISTER.md');

test.describe('P07-011: Review Open P0/P1 Risk Register Release-Gate Suite', () => {

  // ───────────────────────────────────────────────────────────────────────────
  // SUITE 1: RISK REGISTER ARTIFACT INTEGRITY & SCHEMA COMPLETENESS INVARIANT
  // ───────────────────────────────────────────────────────────────────────────
  test('Suite 1: Risk Register Artifact Integrity & Schema Completeness Invariant', () => {
    assert.ok(fs.existsSync(riskRegisterJsonPath), 'P0_P1_RISK_REGISTER.json must exist');
    assert.ok(fs.existsSync(riskRegisterMdPath), 'P0_P1_RISK_REGISTER.md must exist');

    const jsonContent = fs.readFileSync(riskRegisterJsonPath, 'utf8');
    const register = JSON.parse(jsonContent);

    assert.equal(register.document_id, 'RR-TRI-TON-PROD-001', 'Document ID must match convention');
    assert.equal(register.version, '1.0.0', 'Version must be 1.0.0');
    assert.equal(register.verdict, 'ZERO_UNACCEPTED_RISKS', 'Verdict must declare zero unaccepted risks');

    assert.ok(Array.isArray(register.risks), 'Risks must be an array');
    assert.ok(register.risks.length >= 10, 'Must audit at least 10 core P0/P1 risks');

    // Required fields on every single risk record
    const requiredFields = [
      'risk_id', 'severity', 'category', 'title', 'description',
      'finding_source', 'mitigation_summary', 'proof_link',
      'acceptance_status', 'owner', 'decision_ref', 'rationale'
    ];

    for (const r of register.risks) {
      for (const field of requiredFields) {
        assert.ok(
          r[field] !== undefined && r[field] !== null && String(r[field]).trim() !== '',
          `Risk record ${r.risk_id} is missing required field "${field}"`
        );
      }
    }
  });

  // ───────────────────────────────────────────────────────────────────────────
  // SUITE 2: ZERO UNACCEPTED P0/P1 RISKS INVARIANT (CORE RELEASE PROOF)
  // ───────────────────────────────────────────────────────────────────────────
  test('Suite 2: Zero Unaccepted P0/P1 Risks Invariant', () => {
    const register = JSON.parse(fs.readFileSync(riskRegisterJsonPath, 'utf8'));

    // Invariant: summary.open_unaccepted_count === 0
    assert.equal(
      register.summary?.open_unaccepted_count,
      0,
      'summary.open_unaccepted_count must be strictly 0'
    );

    let openCount = 0;
    let remediatedCount = 0;
    let acceptedRiskCount = 0;

    for (const r of register.risks) {
      const status = r.acceptance_status;

      // Must strictly be either REMEDIATED or ACCEPTED_RISK
      assert.ok(
        status === 'REMEDIATED' || status === 'ACCEPTED_RISK',
        `Risk ${r.risk_id} has invalid status "${status}". Only REMEDIATED or ACCEPTED_RISK allowed.`
      );

      // Forbidden statuses
      assert.notEqual(status, 'OPEN', `Risk ${r.risk_id} must not be OPEN`);
      assert.notEqual(status, 'PENDING', `Risk ${r.risk_id} must not be PENDING`);
      assert.notEqual(status, 'UNREVIEWED', `Risk ${r.risk_id} must not be UNREVIEWED`);
      assert.notEqual(status, 'UNACCEPTED', `Risk ${r.risk_id} must not be UNACCEPTED`);

      if (status === 'REMEDIATED') remediatedCount++;
      if (status === 'ACCEPTED_RISK') acceptedRiskCount++;
      if (status === 'OPEN') openCount++;

      // Strict Invariant for P0: 100% of P0 Blocker risks MUST be REMEDIATED
      if (r.severity === 'P0') {
        assert.equal(
          status,
          'REMEDIATED',
          `P0 Blocker risk ${r.risk_id} must be strictly REMEDIATED (cannot be deferred)`
        );
      }
    }

    assert.equal(openCount, 0, 'Zero open risks invariant violated');
    assert.equal(remediatedCount, register.summary?.remediated_count);
    assert.equal(acceptedRiskCount, register.summary?.accepted_risk_count);
  });

  // ───────────────────────────────────────────────────────────────────────────
  // SUITE 3: FORMAL ACCEPTED RISK GOVERNANCE & RATIONALE INVARIANT
  // ───────────────────────────────────────────────────────────────────────────
  test('Suite 3: Formal Accepted Risk Governance & Rationale Invariant', () => {
    const register = JSON.parse(fs.readFileSync(riskRegisterJsonPath, 'utf8'));

    const acceptedRisks = register.risks.filter(r => r.acceptance_status === 'ACCEPTED_RISK');

    assert.ok(acceptedRisks.length > 0, 'Must have recorded accepted risk (RSK-P1-007 rate limiting)');

    for (const r of acceptedRisks) {
      // Must link to a specific Decision Gate / Record
      assert.match(
        r.decision_ref,
        /^GATE_G[0-4]$/,
        `Accepted risk ${r.risk_id} must be approved by a valid Decision Gate (e.g. GATE_G3)`
      );

      // Must have designated responsible owner
      assert.ok(
        r.owner.includes('Chăm Rốch Thi'),
        `Accepted risk ${r.risk_id} must be owned by designated authority`
      );

      // Must have detailed engineering rationale with fallback/graceful degradation
      assert.ok(
        r.rationale.length >= 50,
        `Accepted risk ${r.risk_id} must have comprehensive engineering rationale`
      );
      assert.ok(
        r.rationale.toLowerCase().includes('fallback') ||
        r.rationale.toLowerCase().includes('graceful degradation') ||
        r.rationale.toLowerCase().includes('in-memory'),
        `Accepted risk ${r.risk_id} rationale must document safe fallback mechanism`
      );
    }
  });

  // ───────────────────────────────────────────────────────────────────────────
  // SUITE 4: PROOF LINKS PHYSICAL EXISTENCE ON DISK INVARIANT
  // ───────────────────────────────────────────────────────────────────────────
  test('Suite 4: Proof Links Physical Existence on Disk Invariant', () => {
    const register = JSON.parse(fs.readFileSync(riskRegisterJsonPath, 'utf8'));

    for (const r of register.risks) {
      const proofPath = path.resolve(rootDir, r.proof_link);
      assert.ok(
        fs.existsSync(proofPath),
        `Proof file for ${r.risk_id} does not exist at "${r.proof_link}" (resolved: ${proofPath})`
      );

      // Proof files must be non-empty
      const stats = fs.statSync(proofPath);
      assert.ok(
        stats.size > 100,
        `Proof file for ${r.risk_id} at "${r.proof_link}" is unexpectedly small (${stats.size} bytes)`
      );
    }
  });

  // ───────────────────────────────────────────────────────────────────────────
  // SUITE 5: FAULT INJECTION & FAIL-CLOSED COMPLIANCE INVARIANTS
  // ───────────────────────────────────────────────────────────────────────────
  test('Suite 5: Fault Injection & Fail-Closed Compliance Invariants', () => {
    // Helper function that validates an in-memory risk register
    function validateRegister(reg) {
      if (reg.summary?.open_unaccepted_count !== 0) {
        throw new Error('VIOLATION: open_unaccepted_count must be 0');
      }
      for (const r of reg.risks) {
        if (r.acceptance_status === 'OPEN' || r.acceptance_status === 'UNREVIEWED') {
          throw new Error(`VIOLATION: Unaccepted risk found: ${r.risk_id}`);
        }
        if (r.severity === 'P0' && r.acceptance_status !== 'REMEDIATED') {
          throw new Error(`VIOLATION: P0 risk must be REMEDIATED: ${r.risk_id}`);
        }
        if (!r.owner || !r.decision_ref) {
          throw new Error(`VIOLATION: Missing governance authority on risk: ${r.risk_id}`);
        }
      }
      return true;
    }

    const baselineRegister = JSON.parse(fs.readFileSync(riskRegisterJsonPath, 'utf8'));
    assert.equal(validateRegister(baselineRegister), true, 'Baseline register must pass validation');

    // Negative 1: Injected OPEN risk must fail
    const dirtyRegisterOpen = JSON.parse(JSON.stringify(baselineRegister));
    dirtyRegisterOpen.risks.push({
      risk_id: 'RSK-INJECTED-OPEN',
      severity: 'P1',
      acceptance_status: 'OPEN',
      owner: 'Tester',
      decision_ref: 'GATE_G3'
    });
    assert.throws(
      () => validateRegister(dirtyRegisterOpen),
      /Unaccepted risk found/,
      'Validator must fail-closed when an OPEN risk is detected'
    );

    // Negative 2: Injected P0 with ACCEPTED_RISK must fail (P0 cannot be accepted without remediation)
    const dirtyRegisterP0 = JSON.parse(JSON.stringify(baselineRegister));
    dirtyRegisterP0.risks.push({
      risk_id: 'RSK-INJECTED-P0',
      severity: 'P0',
      acceptance_status: 'ACCEPTED_RISK',
      owner: 'Tester',
      decision_ref: 'GATE_G0'
    });
    assert.throws(
      () => validateRegister(dirtyRegisterP0),
      /P0 risk must be REMEDIATED/,
      'Validator must fail-closed when a P0 risk is not remediated'
    );

    // Negative 3: Injected risk missing owner must fail
    const dirtyRegisterNoOwner = JSON.parse(JSON.stringify(baselineRegister));
    dirtyRegisterNoOwner.risks[0].owner = '';
    assert.throws(
      () => validateRegister(dirtyRegisterNoOwner),
      /Missing governance authority/,
      'Validator must fail-closed when a risk has no owner'
    );
  });

});
