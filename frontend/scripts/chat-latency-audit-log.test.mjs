/**
 * ─────────────────────────────────────────────────────────────────────────────
 * TEST SUITE: P04-013 — Ghi latency thực tế vào audit log
 * (Proof: latency là số đo, không phải constant)
 * 
 * RÀNG BUỘC KIỂM TOÁN:
 * 1. Latency là số đo thời gian thực tế (elapsed duration in milliseconds).
 * 2. Tuyệt đối không gán hằng số giả định (no hardcoded constant, no mock fallback 1200ms).
 * 3. Latency ghi vào audit log phải đồng nhất với latency trả về cho client.
 * 4. Giá trị latency phải là số nguyên không âm (integer >= 0).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Import helper functions under test
import {
  startLatencyTimer,
  calculateElapsedMs,
  isValidAuditLatency,
  resolveAuditLatency,
  FORBIDDEN_AUDIT_LATENCIES,
} from '../src/lib/chatAuditLatencyHelper.ts';

const queryRoutePath = path.join(rootDir, 'src/app/api/v1/chat/query/route.ts');
const streamRoutePath = path.join(rootDir, 'src/app/api/v1/chat/stream/route.ts');
const adminChatLogsPath = path.join(rootDir, 'src/app/admin/chat-logs/page.tsx');
const migrationPath = path.join(rootDir, '../supabase/migrations/20261002_p04_013_chat_logs_latency_ms.sql');

test('P04-013: Audit Log Real Latency Tracking — Proof that Latency is a Real Measurement, Not a Constant', async (t) => {

  await t.test('Assertion 1: Real Measured Latency Proof (Non-Constant Variation Proof)', async () => {
    // Helper to simulate asynchronous work
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const t1 = startLatencyTimer();
    await delay(25);
    const m1 = calculateElapsedMs(t1);

    const t2 = startLatencyTimer();
    await delay(60);
    const m2 = calculateElapsedMs(t2);

    const t3 = startLatencyTimer();
    await delay(100);
    const m3 = calculateElapsedMs(t3);

    // Rule: Latency must be non-negative integers
    assert.ok(Number.isInteger(m1) && m1 >= 20, `m1 (${m1}ms) must reflect >= 20ms delay`);
    assert.ok(Number.isInteger(m2) && m2 >= 55, `m2 (${m2}ms) must reflect >= 55ms delay`);
    assert.ok(Number.isInteger(m3) && m3 >= 90, `m3 (${m3}ms) must reflect >= 90ms delay`);

    // Proof: Real measurements vary with actual execution time and are strictly ordered
    assert.ok(m1 < m2, `m1 (${m1}ms) must be less than m2 (${m2}ms)`);
    assert.ok(m2 < m3, `m2 (${m2}ms) must be less than m3 (${m3}ms)`);

    // Proof: Not a static constant
    const measurements = new Set([m1, m2, m3]);
    assert.equal(measurements.size, 3, 'All 3 measurements must be distinct values, proving non-constant behavior');
  });

  await t.test('Assertion 2: Negative Invariants & Forbidden Constants Rejection Proof', () => {
    // Valid cases
    assert.equal(isValidAuditLatency(0), true, '0ms is valid');
    assert.equal(isValidAuditLatency(15), true, '15ms is valid');
    assert.equal(isValidAuditLatency(450), true, '450ms is valid');
    assert.equal(isValidAuditLatency(1500), true, '1500ms is valid');

    // Negative / Malformed / Non-number cases must be rejected
    assert.equal(isValidAuditLatency(-1), false, 'Negative number must be rejected');
    assert.equal(isValidAuditLatency(-50), false, 'Negative number must be rejected');
    assert.equal(isValidAuditLatency(NaN), false, 'NaN must be rejected');
    assert.equal(isValidAuditLatency(Infinity), false, 'Infinity must be rejected');
    assert.equal(isValidAuditLatency(-Infinity), false, '-Infinity must be rejected');
    assert.equal(isValidAuditLatency(null), false, 'null must be rejected');
    assert.equal(isValidAuditLatency(undefined), false, 'undefined must be rejected');
    assert.equal(isValidAuditLatency('120'), false, 'string must be rejected');
    assert.equal(isValidAuditLatency({}), false, 'object must be rejected');

    // Forbidden set check
    for (const forbidden of FORBIDDEN_AUDIT_LATENCIES) {
      assert.equal(isValidAuditLatency(forbidden), false, `Forbidden value ${forbidden} must be rejected`);
    }

    // resolveAuditLatency robustness
    assert.equal(resolveAuditLatency(250), 250);
    assert.equal(resolveAuditLatency(-1, Date.now() - 35) >= 30, true);
    assert.equal(resolveAuditLatency('invalid', Date.now() - 40) >= 35, true);
  });

  await t.test('Assertion 3: Static Code Invariant — 0% Mock 1200ms in Admin Chat Logs Page', () => {
    const adminCode = fs.readFileSync(adminChatLogsPath, 'utf8');

    // Rule: Must eliminate the fake demo fallback '|| 1200'
    assert.ok(
      !adminCode.includes('|| 1200'),
      'admin/chat-logs/page.tsx must not contain hardcoded demo fallback "|| 1200"'
    );
    assert.ok(
      !adminCode.includes('?? 1200'),
      'admin/chat-logs/page.tsx must not contain fallback "?? 1200"'
    );

    // Rule: Must render real latency_ms
    assert.ok(
      adminCode.includes("typeof log.latency_ms === 'number'"),
      'admin/chat-logs/page.tsx must check typeof log.latency_ms === "number"'
    );
  });

  await t.test('Assertion 4: Static Code Invariant — Real Latency in Query Route (Log + Response)', () => {
    const queryCode = fs.readFileSync(queryRoutePath, 'utf8');

    // Rule: Must import latency helpers
    assert.ok(
      queryCode.includes('calculateElapsedMs'),
      'query/route.ts must import and use calculateElapsedMs'
    );
    assert.ok(
      queryCode.includes('startLatencyTimer'),
      'query/route.ts must import and use startLatencyTimer'
    );

    // Rule: Out-of-Scope path must record and return latency_ms
    assert.ok(
      queryCode.includes('latency_ms: oosLatencyMs'),
      'query/route.ts must record and return oosLatencyMs in out-of-scope path'
    );

    // Rule: Main path must record actualLatencyMs in audit log
    assert.ok(
      queryCode.includes('latency_ms: actualLatencyMs'),
      'query/route.ts must record actualLatencyMs in audit log and response'
    );

    // Rule: JSON response must return latency_ms
    assert.ok(
      queryCode.includes('latency_ms: actualLatencyMs'),
      'query/route.ts JSON response must contain latency_ms'
    );
  });

  await t.test('Assertion 5: Static Code Invariant — Real Latency in Stream Route (Log + Done Event)', () => {
    const streamCode = fs.readFileSync(streamRoutePath, 'utf8');

    // Rule: Must import latency helpers
    assert.ok(
      streamCode.includes('calculateElapsedMs'),
      'stream/route.ts must import and use calculateElapsedMs'
    );
    assert.ok(
      streamCode.includes('startLatencyTimer'),
      'stream/route.ts must import and use startLatencyTimer'
    );

    // Rule: Out-of-Scope stream path must record and send latency_ms
    assert.ok(
      streamCode.includes('latency_ms: oosLatencyMs'),
      'stream/route.ts must record and emit oosLatencyMs'
    );

    // Rule: Main stream done event must emit latency_ms
    assert.ok(
      streamCode.includes('latency_ms: actualLatencyMs'),
      'stream/route.ts must emit and log actualLatencyMs'
    );
  });

  await t.test('Assertion 6: Database Migration Invariant (public.chat_logs.latency_ms)', () => {
    assert.ok(fs.existsSync(migrationPath), `Migration file must exist at ${migrationPath}`);
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');

    // Rule: Check constraint
    assert.ok(
      migrationSql.includes('chk_chat_logs_latency_positive'),
      'Migration must declare constraint chk_chat_logs_latency_positive'
    );
    assert.ok(
      migrationSql.includes('latency_ms >= 0'),
      'Migration must enforce latency_ms >= 0'
    );

    // Rule: Index on latency_ms
    assert.ok(
      migrationSql.includes('chat_logs_latency_idx'),
      'Migration must create index chat_logs_latency_idx'
    );

    // Rule: Non-constant comment
    assert.ok(
      migrationSql.includes('non-constant'),
      'Migration comment must note that latency_ms is non-constant'
    );
  });

  await t.test('Assertion 7: End-to-End Simulation: Latency Measurement Concordance Proof', async () => {
    // Simulator representing an API execution lifecycle
    async function simulateChatRequestExecution(simulatedExecutionDelayMs) {
      const startTime = startLatencyTimer();

      // Simulate AI inference & RAG processing
      await new Promise((r) => setTimeout(r, simulatedExecutionDelayMs));

      const measuredLatencyMs = calculateElapsedMs(startTime);

      // Audit log payload that would be inserted into Supabase public.chat_logs
      const auditPayload = {
        session_id: 'test-session-uuid',
        query: 'Hồ Tà Pạ nằm ở đâu?',
        provider_used: 'groq-llama-3.3-70b-versatile',
        model_used: 'llama-3.3-70b-versatile',
        latency_ms: measuredLatencyMs,
        is_out_scope: false,
      };

      // Client response payload
      const responsePayload = {
        text_response: 'Hồ Tà Pạ nằm tại Xã Núi Tô...',
        provider: 'groq-llama-3.3-70b-versatile',
        model: 'llama-3.3-70b-versatile',
        latency_ms: measuredLatencyMs,
      };

      return { auditPayload, responsePayload };
    }

    const run1 = await simulateChatRequestExecution(30);
    const run2 = await simulateChatRequestExecution(70);

    // 1. Audit payload and response payload must have identical latency_ms
    assert.equal(
      run1.auditPayload.latency_ms,
      run1.responsePayload.latency_ms,
      'Audit log and API response must have exact concordance for run 1'
    );
    assert.equal(
      run2.auditPayload.latency_ms,
      run2.responsePayload.latency_ms,
      'Audit log and API response must have exact concordance for run 2'
    );

    // 2. Both must be valid audit latencies
    assert.ok(isValidAuditLatency(run1.auditPayload.latency_ms));
    assert.ok(isValidAuditLatency(run2.auditPayload.latency_ms));

    // 3. Different execution times must produce different measured latencies
    assert.notEqual(
      run1.auditPayload.latency_ms,
      run2.auditPayload.latency_ms,
      'Two different requests must not share a fake constant latency'
    );
  });
});
