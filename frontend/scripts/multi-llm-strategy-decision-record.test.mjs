/**
 * ─────────────────────────────────────────────────────────────────────────────
 * TEST SUITE: P04-014 — Quyết định Chiến Lược Điều Phối Multi-LLM Provider
 * (Proof: Decision Record mô tả quota/latency trade-off)
 * 
 * RÀNG BUỘC KIỂM TOÁN:
 * 1. File Decision Record DR-LLM-STRATEGY-001 phải tồn tại và được phê duyệt chính thức.
 * 2. Phân tích định lượng đầy đủ quota/latency trade-off giữa Timed Hedge và Sequential Failover.
 * 3. Chốt quyết định rõ ràng: Sequential Failover với Fast Bounded Timeout (2.5s).
 * 4. Định nghĩa đầy đủ tham số timeout chuẩn hóa cho P04-015: GROQ_PRIMARY_TIMEOUT_MS = 2500.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

const decisionRecordPath = path.join(
  rootDir,
  'docs/technical-spec/DECISION_RECORD_MULTI_LLM_PROVIDER_STRATEGY.md'
);

test('P04-014: Decision Record Multi-LLM Provider Strategy Verification', async (t) => {
  await t.test('Assertion 1: Decision Record Document Exists and is Readable', () => {
    assert.ok(
      fs.existsSync(decisionRecordPath),
      `Decision Record file must exist at ${decisionRecordPath}`
    );
    const content = fs.readFileSync(decisionRecordPath, 'utf8');
    assert.ok(content.length > 2000, 'Decision Record must be detailed and substantial (>2000 bytes)');
  });

  await t.test('Assertion 2: Document Header and Canonical Identifiers are Present', () => {
    const content = fs.readFileSync(decisionRecordPath, 'utf8');
    assert.match(content, /DR-LLM-STRATEGY-001/, 'Must contain identifier DR-LLM-STRATEGY-001');
    assert.match(content, /P04-014/, 'Must link to task P04-014');
    assert.match(content, /APPROVED \/ VERIFIED/, 'Must have APPROVED / VERIFIED status');
    assert.match(content, /Chăm Rốch Thi/, 'Must be authored/approved by Chăm Rốch Thi');
  });

  await t.test('Assertion 3: Quantitative Trade-off Matrix Evaluates Timed Hedge vs Sequential Failover', () => {
    const content = fs.readFileSync(decisionRecordPath, 'utf8');
    assert.match(content, /Timed Hedge \(Racing 600ms\)/, 'Must evaluate Timed Hedge option');
    assert.match(content, /Sequential Failover \(Fast Timeout 2\.5s\)/, 'Must evaluate Sequential Failover option');
    assert.match(content, /Unbounded Sequential/, 'Must evaluate Unbounded Sequential baseline');
    assert.match(content, /Tiêu thụ Quota API/i, 'Must evaluate API quota consumption');
    assert.match(content, /Rủi ro Rate Limit 429/i, 'Must evaluate 429 rate limit risks');
    assert.match(content, /Độ trễ TTFT/i, 'Must evaluate TTFT latency profile');
    assert.match(content, /Zombie Requests/i, 'Must evaluate zombie connection/leak risks');
  });

  await t.test('Assertion 4: Final Selection is Explicitly Option B (Sequential Failover)', () => {
    const content = fs.readFileSync(decisionRecordPath, 'utf8');
    assert.match(
      content,
      /PHƯƠNG ÁN B — SEQUENTIAL FAILOVER VỚI FAST BOUNDED TIMEOUT/,
      'Final choice must unambiguously select Option B'
    );
    assert.match(content, /Zero Quota Waste/i, 'Must justify choice with zero quota waste');
    assert.match(content, /4-Tier Linear Fallback Chain/i, 'Must define the 4-tier fallback chain');
  });

  await t.test('Assertion 5: Standardized Timeout Parameters are Defined for Downstream Implementation', () => {
    const content = fs.readFileSync(decisionRecordPath, 'utf8');
    assert.match(content, /GROQ_PRIMARY_TIMEOUT_MS\s*=\s*2500/, 'Must define GROQ_PRIMARY_TIMEOUT_MS = 2500');
    assert.match(content, /GEMINI_SECONDARY_TIMEOUT_MS\s*=\s*6000/, 'Must define GEMINI_SECONDARY_TIMEOUT_MS = 6000');
    assert.match(content, /OPENROUTER_TERTIARY_TIMEOUT_MS\s*=\s*5000/, 'Must define OPENROUTER_TERTIARY_TIMEOUT_MS = 5000');
  });

  await t.test('Assertion 6: Downstream Implementation Plan Links to Tasks P04-015, P04-016, P04-017', () => {
    const content = fs.readFileSync(decisionRecordPath, 'utf8');
    assert.match(content, /Task P04-015/, 'Must specify implementation plan for P04-015');
    assert.match(content, /Task P04-016/, 'Must specify implementation plan for P04-016');
    assert.match(content, /Task P04-017/, 'Must specify implementation plan for P04-017');
    assert.match(content, /Phê Duyệt & Cam Kết/i, 'Must contain signed commitment section');
  });
});
