import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  PROVIDER_OUTAGE_TRIGGER_THRESHOLDS,
  PROVIDER_OUTAGE_OWNERSHIP_MATRIX,
  evaluateProviderOutageSeverity,
  verifyProviderOutageRecovery,
} from '../src/lib/providerOutageRunbook.ts';

const root = path.resolve(import.meta.dirname, '../..');
const runbookPath = path.join(root, 'docs', 'runbooks', 'RUNBOOK_PROVIDER_OUTAGE.md');

test('Runbook document exists and contains standard metadata', () => {
  assert.ok(fs.existsSync(runbookPath), 'RUNBOOK_PROVIDER_OUTAGE.md must exist in docs/runbooks/');
  const content = fs.readFileSync(runbookPath, 'utf8');
  assert.ok(content.length > 500, 'Runbook document must not be empty');

  // Verify Standard Metadata
  assert.match(content, /RB-SRE-PROVIDER-OUTAGE-001/i, 'Must contain code RB-SRE-PROVIDER-OUTAGE-001');
  assert.match(content, /Chăm Rốch Thi/i, 'Must reference Approver/Incident Commander Chăm Rốch Thi');
  assert.match(content, /P05-024/i, 'Must reference Task P05-024');
});

test('Criterion 1: TRIGGER section is defined with quantitative thresholds and diagnostic SQL', () => {
  const content = fs.readFileSync(runbookPath, 'utf8');

  // Must have TRIGGER section
  assert.match(content, /## 2\.\s+TIÊU CHUẨN 1:\s+TRIGGER/i, 'Must have explicit TRIGGER section');

  // Must define severity levels
  assert.match(content, /SEV-3/i, 'Must define SEV-3 (Minor)');
  assert.match(content, /SEV-2/i, 'Must define SEV-2 (Major)');
  assert.match(content, /SEV-1/i, 'Must define SEV-1 (Critical)');

  // Must contain quantitative metrics: 15% error, 2500ms p95, 40% fallback
  assert.match(content, /15(?:\\)?%/, 'Must define 15% error rate trigger');
  assert.match(content, /2500\s*\\text\{ms\}|2500ms/i, 'Must define 2500ms p95 latency trigger');
  assert.match(content, /40(?:\\)?%/, 'Must define 40% fallback rate trigger');

  // Must provide concrete diagnostic SQL
  assert.match(content, /SELECT\s+.*provider_fallback.*FROM\s+public\.chat_logs/is, 'Must contain diagnostic SQL for chat_logs');
});

test('Criterion 2: OWNER section is defined with clear hierarchy and responsibilities', () => {
  const content = fs.readFileSync(runbookPath, 'utf8');

  // Must have OWNER section
  assert.match(content, /## 3\.\s+TIÊU CHUẨN 2:\s+OWNER/i, 'Must have explicit OWNER section');

  // Must define Incident Commander
  assert.match(content, /Incident Commander/i, 'Must designate Incident Commander');
  assert.match(content, /Chăm Rốch Thi/i, 'Must designate Chăm Rốch Thi as Incident Commander');

  // Must define On-call SRE / Operations role
  assert.match(content, /On-call|Trực ca/i, 'Must define on-call SRE responsibility');
});

test('Criterion 3: ROLLBACK section defines automated 4-tier failover and manual procedures', () => {
  const content = fs.readFileSync(runbookPath, 'utf8');

  // Must have ROLLBACK section
  assert.match(content, /## 4\.\s+TIÊU CHUẨN 3:\s+ROLLBACK/i, 'Must have explicit ROLLBACK section');

  // Must specify 4-tier fallback chain matching DR-LLM-STRATEGY-001
  assert.match(content, /Groq/i, 'Tier 1 must be Groq');
  assert.match(content, /Gemini/i, 'Tier 2 must be Google Gemini');
  assert.match(content, /OpenRouter/i, 'Tier 3 must be OpenRouter');
  assert.match(content, /Local Expert RAG/i, 'Tier 4 must be Local Expert RAG');

  // Must include manual mitigation procedures (Key rotation, Forced secondary, Offline mode)
  assert.match(content, /Xoay vòng.*API Keys|Key Rotation/i, 'Must document API key rotation');
  assert.match(content, /Offline Mode|chế độ.*cục bộ/i, 'Must document offline resilience mode');
});

test('Criterion 4: VERIFICATION section defines clear end-to-end criteria before resolving incident', () => {
  const content = fs.readFileSync(runbookPath, 'utf8');

  // Must have VERIFICATION section
  assert.match(content, /## 5\.\s+TIÊU CHUẨN 4:\s+VERIFICATION/i, 'Must have explicit VERIFICATION section');

  // Must include API curl verification
  assert.match(content, /curl.*\/api\/v1\/chat\/query/i, 'Must specify query endpoint verification');
  assert.match(content, /curl.*\/api\/v1\/chat\/stream/i, 'Must specify stream endpoint verification');

  // Must specify metric recovery boundaries (<10% fallback, <2000ms p95)
  assert.match(content, /10(?:\\)?%/, 'Must specify fallback rate recovery target');
  assert.match(content, /2000\s*\\text\{ms\}|2000ms/i, 'Must specify p95 latency recovery target');

  // Must include SOS bypass verification
  assert.match(content, /SOS/i, 'Must specify SOS rescue bypass verification');

  // Must include Post-Incident Review requirement
  assert.match(content, /Post-Incident Review|Post-Mortem/i, 'Must specify post-incident review requirement');
});

test('Runtime module providerOutageRunbook.ts concordantly evaluates incident severity', () => {
  // Test normal conditions -> NONE
  const normal = evaluateProviderOutageSeverity({
    errorRatePercent: 2.0,
    p95LatencyMs: 800,
    fallbackRatePercent: 3.0,
    isTotalCloudOutage: false,
  });
  assert.equal(normal.severity, 'NONE');
  assert.equal(normal.triggered, false);

  // Test SEV-3: high latency (>2500ms)
  const sev3 = evaluateProviderOutageSeverity({
    errorRatePercent: 5.0,
    p95LatencyMs: 3100,
    fallbackRatePercent: 8.0,
  });
  assert.equal(sev3.severity, 'SEV-3');
  assert.equal(sev3.triggered, true);
  assert.match(sev3.recommendedAction, /Gemini/i);

  // Test SEV-2: high fallback rate (>40%)
  const sev2 = evaluateProviderOutageSeverity({
    errorRatePercent: 10.0,
    p95LatencyMs: 1500,
    fallbackRatePercent: 55.0,
  });
  assert.equal(sev2.severity, 'SEV-2');
  assert.equal(sev2.triggered, true);
  assert.equal(sev2.owner.name, 'Chăm Rốch Thi');

  // Test SEV-1: total cloud outage
  const sev1 = evaluateProviderOutageSeverity({
    isTotalCloudOutage: true,
  });
  assert.equal(sev1.severity, 'SEV-1');
  assert.equal(sev1.triggered, true);
  assert.match(sev1.recommendedAction, /Local Expert RAG/i);
});

test('Runtime module verifies post-incident recovery against all 4 criteria', () => {
  // All green
  const recovered = verifyProviderOutageRecovery({
    currentFallbackRatePercent: 4.5,
    currentP95LatencyMs: 1200,
    currentErrorRatePercent: 0.0,
    sosEmergencyBypassWorking: true,
  });
  assert.equal(recovered.verified, true);
  assert.equal(recovered.unmetCriteria.length, 0);

  // Unmet fallback rate
  const notRecovered = verifyProviderOutageRecovery({
    currentFallbackRatePercent: 18.0,
    currentP95LatencyMs: 1200,
    currentErrorRatePercent: 0.0,
    sosEmergencyBypassWorking: true,
  });
  assert.equal(notRecovered.verified, false);
  assert.match(notRecovered.unmetCriteria[0], /Fallback rate/i);

  // Unmet SOS bypass
  const brokenSos = verifyProviderOutageRecovery({
    currentFallbackRatePercent: 2.0,
    currentP95LatencyMs: 1100,
    currentErrorRatePercent: 0.0,
    sosEmergencyBypassWorking: false,
  });
  assert.equal(brokenSos.verified, false);
  assert.match(brokenSos.unmetCriteria[0], /SOS Emergency Instant Bypass/i);
});
