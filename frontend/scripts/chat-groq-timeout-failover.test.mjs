/**
 * ─────────────────────────────────────────────────────────────────────────────
 * TEST SUITE: P04-015 — Áp Timeout Đã Chọn Cho Groq
 * (Proof: fault test chứng minh thời điểm failover)
 * 
 * RÀNG BUỘC KIỂM TOÁN:
 * 1. Hằng số timeout GROQ_PRIMARY_TIMEOUT_MS = 2500ms tuân thủ DR-LLM-STRATEGY-001.
 * 2. Khi Groq phản hồi nhanh (< 2500ms), Groq xử lý trọn vẹn, không kích hoạt failover.
 * 3. Khi Groq bị treo hoặc phản hồi quá hạn định (Fault Injection), hệ thống ngắt kết nối
 *    tại chính xác mốc timeout đã định (chứng minh thời điểm failover bằng số đo thực tế).
 * 4. Hệ thống chuyển tầng failover an toàn sang Secondary Provider (Gemini) mà không gây rò rỉ socket.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import typescript from 'typescript';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const helperPath = path.resolve(__dirname, '../src/lib/chatGroqTimeoutHelper.ts');
const aiProviderSourcePath = path.resolve(__dirname, '../src/lib/aiProvider.ts');
const fallbackClientsSourcePath = path.resolve(__dirname, '../src/lib/ai/fallbackClients.ts');

function loadModule(filePath, customResolver = {}) {
  const content = fs.readFileSync(filePath, 'utf8');
  const { outputText } = typescript.transpileModule(content, {
    compilerOptions: {
      module: typescript.ModuleKind.CommonJS,
      target: typescript.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  });

  const m = { exports: {} };
  const fn = new Function('module', 'exports', 'require', '__dirname', '__filename', outputText);
  fn(
    m,
    m.exports,
    (id) => {
      if (customResolver[id]) return customResolver[id];
      if (id.startsWith('./') || id.startsWith('../')) {
        const target = path.resolve(path.dirname(filePath), id.endsWith('.ts') ? id : `${id}.ts`);
        if (fs.existsSync(target)) {
          return loadModule(target, customResolver);
        }
      }
      return require(id);
    },
    path.dirname(filePath),
    filePath
  );
  return m.exports;
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

test('P04-015: Groq Primary Bounded Timeout & Failover Verification', async (t) => {
  const {
    GROQ_PRIMARY_TIMEOUT_MS,
    GEMINI_SECONDARY_TIMEOUT_MS,
    OPENROUTER_TERTIARY_TIMEOUT_MS,
    LOCAL_RAG_TIMEOUT_MS,
    getGroqPrimaryTimeoutMs,
    createBoundedTimeoutController,
    orchestrateGroqWithFailover,
  } = loadModule(helperPath);

  await t.test('Assertion 1: Timeout Constants & Parameter Alignment Invariant', () => {
    // Exact values required by Decision Record DR-LLM-STRATEGY-001
    assert.equal(GROQ_PRIMARY_TIMEOUT_MS, 2500, 'GROQ_PRIMARY_TIMEOUT_MS must be exactly 2500ms');
    assert.equal(GEMINI_SECONDARY_TIMEOUT_MS, 6000, 'GEMINI_SECONDARY_TIMEOUT_MS must be 6000ms');
    assert.equal(OPENROUTER_TERTIARY_TIMEOUT_MS, 5000, 'OPENROUTER_TERTIARY_TIMEOUT_MS must be 5000ms');
    assert.equal(LOCAL_RAG_TIMEOUT_MS, 0, 'LOCAL_RAG_TIMEOUT_MS must be 0ms');

    // Default getter
    assert.equal(getGroqPrimaryTimeoutMs(), 2500, 'Default getter must return 2500ms');

    // Explicit override support
    assert.equal(getGroqPrimaryTimeoutMs(1200), 1200, 'Explicit override must be respected');
  });

  await t.test('Assertion 2: Fast Path (Groq Responds Within Timeout Window < 2500ms)', async () => {
    // Fast Groq response (~40ms TTFT)
    let fallbackCalled = false;
    let groqSignalObserved = null;

    async function* mockFastGroq(signal) {
      groqSignalObserved = signal;
      await delay(30);
      yield { type: 'delta', content: 'Xin chào du khách, ', provider: 'groq-lpu-primary', model: 'llama-3.3-70b-versatile' };
      await delay(20);
      yield { type: 'delta', content: 'đây là Tri Tôn.', provider: 'groq-lpu-primary', model: 'llama-3.3-70b-versatile' };
      yield { type: 'done', provider: 'groq-lpu-primary', model: 'llama-3.3-70b-versatile' };
    }

    async function* mockFallback(signal) {
      fallbackCalled = true;
      yield { type: 'delta', content: 'Gemini fallback' };
      yield { type: 'done' };
    }

    const tStart = Date.now();
    const chunks = [];
    for await (const chunk of orchestrateGroqWithFailover(mockFastGroq, mockFallback, {
      groqTimeoutMs: 2500,
    })) {
      chunks.push(chunk);
    }
    const elapsed = Date.now() - tStart;

    // Must be answered by Groq, NOT fallback
    assert.equal(fallbackCalled, false, 'Fallback must NOT be called when Groq responds fast');
    assert.ok(chunks.filter((c) => c.type === 'delta').every((c) => c.providerFallback === false), 'Primary Groq chunks must be classified as non-fallback');
    assert.ok(elapsed < 2000, `Execution elapsed (${elapsed}ms) must be well within 2500ms window`);

    const deltas = chunks.filter((c) => c.type === 'delta').map((c) => c.content).join('');
    assert.equal(deltas, 'Xin chào du khách, đây là Tri Tôn.');
    assert.equal(chunks[chunks.length - 1].provider, 'groq-lpu-primary');
  });

  await t.test('Assertion 3: Fault Injection: Groq Primary Timeout Triggers Failover at Exact Bound', async () => {
    // Fault injection: Groq hangs indefinitely (simulating queue congestion or network freeze)
    let groqSignalAborted = false;
    let geminiReceivedAt = 0;
    const testTimeoutMs = 150; // Use bounded 150ms for precise timing assertion

    async function* mockHangingGroq(signal) {
      signal.addEventListener('abort', () => {
        groqSignalAborted = true;
      });
      // Hang for 2000ms (far beyond 150ms timeout)
      await delay(2000);
      if (!signal.aborted) {
        yield { type: 'delta', content: 'Late Groq token' };
      }
    }

    async function* mockGeminiFailover(signal) {
      geminiReceivedAt = Date.now();
      yield { type: 'delta', content: 'Chào bạn từ Gemini Failover!', provider: 'gemini-secondary-failover', model: 'gemini-2.5-flash-lite' };
      yield { type: 'done', provider: 'gemini-secondary-failover', model: 'gemini-2.5-flash-lite' };
    }

    let reportedTimeoutElapsed = 0;
    let failoverFrom = '';
    let failoverTo = '';

    const tStart = Date.now();
    const chunks = [];
    for await (const chunk of orchestrateGroqWithFailover(mockHangingGroq, mockGeminiFailover, {
      groqTimeoutMs: testTimeoutMs,
      onGroqTimeout: (elapsed) => {
        reportedTimeoutElapsed = elapsed;
      },
      onFailoverTriggered: (from, to) => {
        failoverFrom = from;
        failoverTo = to;
      },
    })) {
      chunks.push(chunk);
    }
    const failoverTiming = geminiReceivedAt - tStart;

    // Proof: Failover happened exactly around the configured timeout bound (>= 140ms and <= 280ms)
    assert.ok(
      failoverTiming >= testTimeoutMs - 15 && failoverTiming <= testTimeoutMs + 130,
      `Failover timing (${failoverTiming}ms) must occur at bounded timeout (${testTimeoutMs}ms)`
    );

    // Proof: Groq signal was properly aborted
    assert.equal(groqSignalAborted, true, 'Groq abort signal must be aborted upon timeout');

    // Proof: Callbacks faithfully notified failover event
    assert.equal(failoverFrom, 'groq-primary');
    assert.equal(failoverTo, 'gemini-secondary');
    assert.ok(reportedTimeoutElapsed >= testTimeoutMs - 15);

    // Proof: Response delivered by secondary provider
    const doneChunk = chunks.find((c) => c.type === 'done');
    assert.equal(doneChunk.provider, 'gemini-secondary-failover');
    assert.equal(doneChunk.model, 'gemini-2.5-flash-lite');
    assert.equal(doneChunk.providerFallback, true, 'Gemini chunks after Groq timeout must be classified as fallback');
  });

  await t.test('Assertion 4: Precise 2500ms Production Bound Failover Time Window Proof', async () => {
    // Fault injection with production timeout: GROQ_PRIMARY_TIMEOUT_MS = 2500
    let groqSignalAborted = false;
    let geminiFirstTokenTime = 0;

    async function* mockHangingProductionGroq(signal) {
      signal.addEventListener('abort', () => {
        groqSignalAborted = true;
      });
      // Simulate hung socket (hanging 6000ms)
      await delay(6000);
    }

    async function* mockGeminiProductionFailover(signal) {
      geminiFirstTokenTime = Date.now();
      yield { type: 'delta', content: 'Du lịch Tri Tôn xin chào.', provider: 'gemini-production-failover', model: 'gemini-flash' };
      yield { type: 'done', provider: 'gemini-production-failover', model: 'gemini-flash' };
    }

    const tStart = Date.now();
    const chunks = [];
    for await (const chunk of orchestrateGroqWithFailover(mockHangingProductionGroq, mockGeminiProductionFailover, {
      groqTimeoutMs: GROQ_PRIMARY_TIMEOUT_MS, // 2500ms
    })) {
      chunks.push(chunk);
    }
    const failoverDelay = geminiFirstTokenTime - tStart;

    // Proof: Failover executed at ~2500ms (>= 2450ms and < 2900ms), NOT default socket timeout 30s-60s
    assert.ok(
      failoverDelay >= 2450,
      `Failover delay (${failoverDelay}ms) must be >= 2450ms (GROQ_PRIMARY_TIMEOUT_MS bounded limit)`
    );
    assert.ok(
      failoverDelay <= 2900,
      `Failover delay (${failoverDelay}ms) must trigger promptly near 2500ms, not hang indefinitely`
    );

    // Proof: Signal aborted and clean fallback result returned
    assert.equal(groqSignalAborted, true, 'Groq abort signal must be aborted at 2500ms');
    const doneChunk = chunks.find((c) => c.type === 'done');
    assert.equal(doneChunk.provider, 'gemini-production-failover');
    assert.equal(doneChunk.providerFallback, true);
  });

  await t.test('Assertion 5: Mid-Stream Safety: Timer is Cleared Once First Token is Received', async () => {
    // If Groq begins streaming within timeout window (e.g. 40ms),
    // subsequent chunks taking total 350ms must NOT be aborted by a 200ms timeout
    let wasAborted = false;

    async function* mockLegitimateLongStream(signal) {
      signal.addEventListener('abort', () => {
        wasAborted = true;
      });
      await delay(40); // First token arrives at 40ms (< 200ms)
      yield { type: 'delta', content: 'Token 1 ', provider: 'groq-streaming', model: 'llama-3.3-70b' };
      await delay(120); // 160ms total
      yield { type: 'delta', content: 'Token 2 ', provider: 'groq-streaming', model: 'llama-3.3-70b' };
      await delay(120); // 280ms total (> 200ms initial timeout)
      yield { type: 'delta', content: 'Token 3.', provider: 'groq-streaming', model: 'llama-3.3-70b' };
      yield { type: 'done', provider: 'groq-streaming', model: 'llama-3.3-70b' };
    }

    async function* mockFallback(signal) {
      yield { type: 'delta', content: 'Should not run' };
      yield { type: 'done' };
    }

    const chunks = [];
    for await (const chunk of orchestrateGroqWithFailover(mockLegitimateLongStream, mockFallback, {
      groqTimeoutMs: 200,
    })) {
      chunks.push(chunk);
    }

    // Stream must finish legitimately without premature abort
    assert.equal(wasAborted, false, 'Timer must be cleared after first token, preventing mid-stream abort');
    assert.ok(chunks.every((c) => c.providerFallback === false), 'All primary Groq chunks must remain non-fallback');
    const fullText = chunks.filter((c) => c.type === 'delta').map((c) => c.content).join('');
    assert.equal(fullText, 'Token 1 Token 2 Token 3.');
  });

  await t.test('Assertion 6: Static Code Invariant: AI Orchestrator & Fallback Clients Bounded Timeout', () => {
    const aiProviderContent = fs.readFileSync(aiProviderSourcePath, 'utf8');
    const helperContent = fs.readFileSync(helperPath, 'utf8');
    const fallbackClientsContent = fs.readFileSync(fallbackClientsSourcePath, 'utf8');

    // Invariant: Exported constants in chatGroqTimeoutHelper & aiProvider
    assert.ok(
      helperContent.includes('export const GROQ_PRIMARY_TIMEOUT_MS = 2500'),
      'chatGroqTimeoutHelper.ts must export GROQ_PRIMARY_TIMEOUT_MS = 2500'
    );
    assert.ok(
      aiProviderContent.includes("from './chatGroqTimeoutHelper'"),
      'aiProvider.ts must import and re-export from chatGroqTimeoutHelper'
    );
    assert.ok(
      aiProviderContent.includes('orchestrateGroqWithFailover'),
      'aiProvider.ts must invoke orchestrateGroqWithFailover in Luong 3'
    );

    // Invariant: Timeout timer set and cleared in helper
    assert.ok(
      helperContent.includes('const timer = setTimeout'),
      'chatGroqTimeoutHelper.ts must set timer with setTimeout'
    );
    assert.ok(
      helperContent.includes('clearTimeout(timer)'),
      'chatGroqTimeoutHelper.ts must clear timer upon first token'
    );
    assert.ok(
      helperContent.includes('controller.abort'),
      'chatGroqTimeoutHelper.ts must abort controller on timeout'
    );
    assert.ok(
      helperContent.includes('Promise.race'),
      'chatGroqTimeoutHelper.ts must use Promise.race to guarantee exact timeout bound failover'
    );

    // Invariant: Fallback clients native stream includes fail-safe bounded timeout
    assert.ok(
      fallbackClientsContent.includes('timeoutMs = 2500'),
      'fallbackClients.ts must specify default timeoutMs = 2500 for streamGroqNative'
    );
    assert.ok(
      fallbackClientsContent.includes('localAbort = new AbortController()'),
      'fallbackClients.ts must instantiate local AbortController when signal is omitted'
    );
  });
});
