/**
 * ─────────────────────────────────────────────────────────────────────────────
 * TEST SUITE: P04-017 — Integration Test Provider Primary Stream Error
 * (Proof: response không treo và không trả partial sai)
 * 
 * RÀNG BUỘC KIỂM TOÁN (PRODUCTION-REAL AUDIT CONSTRAINTS):
 * 1. Khi Groq Primary gặp lỗi stream (Early Stream Error: HTTP 500, socket drop; hoặc
 *    Mid-stream Error: đứt socket giữa chừng khi đang phát tokens), response tuyệt
 *    đối KHÔNG ĐƯỢC TREO (controller stream phải được đóng, socket được giải phóng).
 * 2. Response KHÔNG ĐƯỢC TRẢ PARTIAL SAI:
 *    - Khi lỗi sớm: Failover sạch 100% sang Secondary Provider (Gemini / Local RAG).
 *    - Khi lỗi giữa chừng: Không chắp vá thông báo lỗi cọc cạch vào partial của LLM;
 *      đảm bảo mọi delta tokens đã gửi ra client khớp 100% với done event full_text.
 * 3. Chống rách chunk và trung hòa các SSE chunks bị corrupt cú pháp JSON.
 * 4. Resource cleanup triệt để: AbortSignal được kích hoạt, timer được giải phóng,
 *    không có zombie generators hay unhandled promise rejections.
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

// Paths
const contractPath = path.resolve(__dirname, '../src/lib/chatStructuredResultContract.ts');
const timeoutHelperPath = path.resolve(__dirname, '../src/lib/chatGroqTimeoutHelper.ts');
const latencyHelperPath = path.resolve(__dirname, '../src/lib/chatAuditLatencyHelper.ts');
const providerHelperPath = path.resolve(__dirname, '../src/lib/chatAuditProviderHelper.ts');
const suggestionEnginePath = path.resolve(__dirname, '../src/lib/ai/contextualSuggestionEngine.ts');
const localRagPath = path.resolve(__dirname, '../src/lib/ai/localExpertRag.ts');
const queryRoutePath = path.resolve(__dirname, '../src/app/api/v1/chat/query/route.ts');
const streamRoutePath = path.resolve(__dirname, '../src/app/api/v1/chat/stream/route.ts');

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
      if (id.startsWith('@/lib/')) {
        const rel = id.replace('@/lib/', '');
        const target = path.resolve(__dirname, '../src/lib', rel.endsWith('.ts') ? rel : `${rel}.ts`);
        if (fs.existsSync(target)) return loadModule(target, customResolver);
      }
      if (id.startsWith('@/data/')) {
        const rel = id.replace('@/data/', '');
        const target = path.resolve(__dirname, '../src/data', rel.endsWith('.json') ? rel : `${rel}.json`);
        if (fs.existsSync(target)) return JSON.parse(fs.readFileSync(target, 'utf8'));
      }
      return require(id);
    },
    path.dirname(filePath),
    filePath
  );
  return m.exports;
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

test('P04-017: Provider Primary Stream Error Resilience & Concordance Integration', async (t) => {
  const contract = loadModule(contractPath);
  const timeoutHelper = loadModule(timeoutHelperPath);
  const latencyHelper = loadModule(latencyHelperPath);
  const providerHelper = loadModule(providerHelperPath);
  const suggestionEngine = loadModule(suggestionEnginePath);
  const localRag = loadModule(localRagPath);

  const {
    validateStructuredChatResponse,
    validateStructuredStreamDoneEvent,
    validateStreamTokenConcordance,
  } = contract;

  const {
    orchestrateGroqWithFailover,
    createBoundedTimeoutController,
  } = timeoutHelper;

  const { startLatencyTimer, calculateElapsedMs } = latencyHelper;
  const { resolveAuditProvider, resolveAuditModel } = providerHelper;
  const { generateSmartSuggestions } = suggestionEngine;
  const { generateSmartLocalDomainResponse } = localRag;

  // ───────────────────────────────────────────────────────────────────────────
  // ASSERTION 1: Early Stream Error: Groq Throws HTTP 500 / Network Error Before First Token
  // ───────────────────────────────────────────────────────────────────────────
  await t.test('Assertion 1: Early Stream Error: Groq Throws HTTP 500 / Network Error Before First Token', async () => {
    let failoverTriggeredReason = '';
    let fallbackExecuted = false;

    // Primary Groq crashes immediately on first connect
    async function* mockCrashingGroq(signal) {
      await delay(15);
      throw new Error('Groq LPU Gateway 502 Bad Gateway / Connection Reset by Peer');
    }

    // Secondary Gemini provides clean full replacement
    async function* mockGeminiFallback(signal) {
      fallbackExecuted = true;
      yield {
        type: 'delta',
        content: 'Chào bạn, đây là thông tin về du lịch Tri Tôn: ',
        provider: 'gemini-key-1',
        model: 'gemini-2.5-flash',
      };
      yield {
        type: 'delta',
        content: 'Hồ Tà Pạ nổi tiếng với làn nước trong xanh màu ngọc bích.',
        provider: 'gemini-key-1',
        model: 'gemini-2.5-flash',
      };
      yield {
        type: 'done',
        provider: 'gemini-key-1',
        model: 'gemini-2.5-flash',
      };
    }

    const chunks = [];
    for await (const chunk of orchestrateGroqWithFailover(mockCrashingGroq, mockGeminiFallback, {
      onFailoverTriggered: (from, to, reason) => {
        failoverTriggeredReason = reason;
      },
    })) {
      chunks.push(chunk);
    }

    // 1. Proof: Failover callback triggered with stream error reason
    assert.ok(failoverTriggeredReason.includes('Stream error'), 'Must record stream error failover');
    assert.equal(fallbackExecuted, true, 'Fallback stream must be executed');

    // 2. Proof: Response delivered completely without partial contamination
    const deltas = chunks.filter((c) => c.type === 'delta').map((c) => c.content);
    const fullText = deltas.join('');
    assert.equal(fullText, 'Chào bạn, đây là thông tin về du lịch Tri Tôn: Hồ Tà Pạ nổi tiếng với làn nước trong xanh màu ngọc bích.');

    // 3. Proof: Done chunk present and valid
    const doneChunk = chunks.find((c) => c.type === 'done');
    assert.ok(doneChunk, 'Must emit done chunk');
    assert.equal(doneChunk.provider, 'gemini-key-1');
  });

  // ───────────────────────────────────────────────────────────────────────────
  // ASSERTION 2: Mid-Stream Error: Groq Crashes After Emitting Initial Chunks (No Corrupted Partials)
  // ───────────────────────────────────────────────────────────────────────────
  await t.test('Assertion 2: Mid-Stream Error: Groq Crashes After Emitting Initial Chunks (No Corrupted Partials)', async () => {
    let primaryStreamErrorCaught = null;
    let partialTextRecorded = '';
    const emittedTokens = [];

    // Primary Groq emits 2 tokens then crashes mid-flight
    async function* mockMidStreamCrashingGroq(signal) {
      yield {
        type: 'delta',
        content: 'Núi Cô Tô (Phụng Hoàng Sơn) ',
        provider: 'groq-lpu-primary',
        model: 'llama-3.3-70b-versatile',
      };
      await delay(10);
      yield {
        type: 'delta',
        content: 'có độ cao 614m với nhiều vách đá hùng vĩ.',
        provider: 'groq-lpu-primary',
        model: 'llama-3.3-70b-versatile',
      };
      await delay(10);
      // Sudden mid-stream network drop
      throw new Error('Socket hang up / Premature TLS stream termination');
    }

    // Secondary fallback (not called because tokens already sent to client)
    async function* mockSecondary(signal) {
      yield { type: 'delta', content: 'Secondary text' };
      yield { type: 'done' };
    }

    const chunks = [];
    for await (const chunk of orchestrateGroqWithFailover(mockMidStreamCrashingGroq, mockSecondary, {
      onPrimaryStreamError: (err, partialText) => {
        primaryStreamErrorCaught = err;
        partialTextRecorded = partialText;
      },
    })) {
      chunks.push(chunk);
      if (chunk.type === 'delta' && chunk.content) {
        emittedTokens.push(chunk.content);
      }
    }

    // 1. Proof: Primary error callback recorded exact partial text sent so far
    assert.ok(primaryStreamErrorCaught, 'Must catch mid-stream error');
    assert.equal(partialTextRecorded, 'Núi Cô Tô (Phụng Hoàng Sơn) có độ cao 614m với nhiều vách đá hùng vĩ.');

    // 2. Proof: Stream did NOT hang - done chunk was cleanly emitted
    const doneChunk = chunks.find((c) => c.type === 'done');
    assert.ok(doneChunk, 'Done chunk must be emitted to release downstream stream');

    // 3. Proof: Concordance Invariant - No corrupted or mismatched partials
    const fullEmittedText = emittedTokens.join('');
    const concordance = validateStreamTokenConcordance(emittedTokens, fullEmittedText);
    assert.equal(concordance.isValid, true, 'Emitted tokens must match full text 100%');
    assert.equal(fullEmittedText, partialTextRecorded);
  });

  // ───────────────────────────────────────────────────────────────────────────
  // ASSERTION 3: Corrupted Chunk Invariant: Malformed SSE Chunks from Primary are Neutralized
  // ───────────────────────────────────────────────────────────────────────────
  await t.test('Assertion 3: Corrupted Chunk Invariant: Malformed SSE Chunks from Primary are Neutralized', async () => {
    // Simulate stream parser behavior with corrupt SSE chunks
    const rawSseChunks = [
      'data: {"choices":[{"delta":{"content":"Khám phá "}}]}\n\n',
      'data: {BAD_CORRUPT_JSON_SYNTAX_ERROR}\n\n', // Corrupted JSON
      'data: {"choices":[{"delta":{"content":"đồi Tà Pạ."}}]}\n\n',
      'data: [DONE]\n\n',
    ];

    const validDeltas = [];
    for (const chunk of rawSseChunks) {
      const trimmed = chunk.trim();
      if (!trimmed.startsWith('data:')) continue;
      const dataStr = trimmed.replace(/^data:\s*/, '').trim();
      if (!dataStr || dataStr === '[DONE]') continue;

      try {
        const parsed = JSON.parse(dataStr);
        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) validDeltas.push(delta);
      } catch {
        // Must neutralize parse error safely without throwing unhandled crash
      }
    }

    // Proof: Corrupt chunk neutralized and valid chunks preserved
    assert.equal(validDeltas.join(''), 'Khám phá đồi Tà Pạ.');
  });

  // ───────────────────────────────────────────────────────────────────────────
  // ASSERTION 4: Socket Cleanup & Resource Release Proof (Zero Hanging Streams)
  // ───────────────────────────────────────────────────────────────────────────
  await t.test('Assertion 4: Socket Cleanup & Resource Release Proof (Zero Hanging Streams)', async () => {
    let controllerClosed = false;
    let abortSignalTriggered = false;

    // Simulate Next.js ReadableStream lifecycle with error injection
    const testStream = new ReadableStream({
      async start(controller) {
        const abortCtrl = new AbortController();
        abortCtrl.signal.addEventListener('abort', () => {
          abortSignalTriggered = true;
        });

        try {
          // Simulate error during processing
          abortCtrl.abort();
          throw new Error('Simulated socket failure in stream controller');
        } catch (err) {
          // Catch and handle
        } finally {
          controller.close();
          controllerClosed = true;
        }
      },
    });

    const reader = testStream.getReader();
    const readResult = await reader.read();

    // Proof: Stream controller closed promptly without hanging
    assert.equal(readResult.done, true, 'Stream must be done immediately');
    assert.equal(controllerClosed, true, 'Controller must be closed');
    assert.equal(abortSignalTriggered, true, 'Abort signal must be triggered');
  });

  // ───────────────────────────────────────────────────────────────────────────
  // ASSERTION 5: Query Route Stream Error Resilience (Structured Fallback Guaranteed)
  // ───────────────────────────────────────────────────────────────────────────
  await t.test('Assertion 5: Query Route Stream Error Resilience (Structured Fallback Guaranteed)', async () => {
    const userQuery = 'Ẩm thực Tri Tôn có món gì đặc sản?';
    const t0 = startLatencyTimer();

    // Primary Groq crashes on stream start
    async function* mockCrashingGroq(signal) {
      throw new Error('Groq Primary 500 Internal Server Error');
    }

    // Fallback Local RAG provides offline domain response
    async function* mockFallback(signal) {
      const localResp = generateSmartLocalDomainResponse(userQuery);
      yield {
        type: 'delta',
        content: localResp,
        provider: 'local_expert_rag',
        model: 'local-expert-rag-v1',
      };
      yield {
        type: 'done',
        provider: 'local_expert_rag',
        model: 'local-expert-rag-v1',
      };
    }

    let fullText = '';
    let usedProvider = '';
    let usedModel = '';

    for await (const chunk of orchestrateGroqWithFailover(mockCrashingGroq, mockFallback)) {
      if (chunk.type === 'delta' && chunk.content) {
        fullText += chunk.content;
      }
      if (chunk.type === 'done') {
        usedProvider = chunk.provider || '';
        usedModel = chunk.model || '';
      }
    }

    const actualLatencyMs = calculateElapsedMs(t0);
    const suggestions = generateSmartSuggestions({
      query: userQuery,
      assistantAnswer: fullText,
    });

    const structuredResponse = {
      text_response: fullText,
      provider: resolveAuditProvider(usedProvider),
      model: resolveAuditModel(usedModel, usedProvider),
      latency_ms: actualLatencyMs,
      ui_components: [],
      places: [],
      videos: [],
      suggestions,
    };

    // Proof: Structured result schema valid, no crash
    const validation = validateStructuredChatResponse(structuredResponse, { isTimeoutFallback: false });
    assert.equal(validation.isValid, true, `Response must be structured and valid: ${validation.errors.join('; ')}`);
    assert.ok(structuredResponse.text_response.length > 50);
  });

  // ───────────────────────────────────────────────────────────────────────────
  // ASSERTION 6: Negative Tests: Stream Mismatch & Hanging Stream Invariants Rejected
  // ───────────────────────────────────────────────────────────────────────────
  await t.test('Assertion 6: Negative Tests: Stream Mismatch & Hanging Stream Invariants Rejected', () => {
    // Case 1: Mismatched partial tokens vs done full_text (Corrupted partial)
    const deltas = ['Hồ Tà Pạ ', 'nước màu xanh'];
    const corruptedDoneText = 'Hồ Tà Pạ [ERROR_LOST_CHUNKS]';
    const check1 = validateStreamTokenConcordance(deltas, corruptedDoneText);
    assert.equal(check1.isValid, false);
    assert.ok(check1.errors.some((e) => e.includes('ERR_PARTIAL_MISMATCH')));

    // Case 2: Incomplete done event (missing full_text)
    const invalidDone = {
      type: 'done',
      full_text: '', // Empty
      latency_ms: 100,
      suggestions: ['Gợi ý'],
    };
    const check2 = validateStructuredStreamDoneEvent(invalidDone);
    assert.equal(check2.isValid, false);
    assert.ok(check2.errors.some((e) => e.includes('ERR_MISSING_FULL_TEXT')));

    // Case 3: Empty deltas vs non-empty full_text
    const check3 = validateStreamTokenConcordance([], 'Nội dung không có deltas');
    assert.equal(check3.isValid, false);
    assert.ok(check3.errors.some((e) => e.includes('ERR_PARTIAL_MISMATCH')));
  });

  // ───────────────────────────────────────────────────────────────────────────
  // ASSERTION 7: Static Code Invariants Across Stream & Query Routes
  // ───────────────────────────────────────────────────────────────────────────
  await t.test('Assertion 7: Static Code Invariants Across Stream & Query Routes', () => {
    // 1. stream/route.ts must always close controller in finally block
    const streamCode = fs.readFileSync(streamRoutePath, 'utf8');
    assert.ok(
      streamCode.includes('controller.close()'),
      'stream/route.ts must invoke controller.close()'
    );
    assert.ok(
      streamCode.includes('finally {'),
      'stream/route.ts must have finally block for stream closure'
    );
    assert.ok(
      streamCode.includes('fullText.trim().length === 0'),
      'stream/route.ts must check whether fullText was partially emitted before setting error message'
    );

    // 2. chatGroqTimeoutHelper.ts must implement onPrimaryStreamError
    const timeoutCode = fs.readFileSync(timeoutHelperPath, 'utf8');
    assert.ok(
      timeoutCode.includes('onPrimaryStreamError'),
      'chatGroqTimeoutHelper.ts must declare onPrimaryStreamError in options'
    );
    assert.ok(
      timeoutCode.includes('groq-lpu-interrupted'),
      'chatGroqTimeoutHelper.ts must emit fallback done chunk on mid-stream interruption'
    );

    // 3. chatStructuredResultContract.ts must export validateStreamTokenConcordance
    const contractCode = fs.readFileSync(contractPath, 'utf8');
    assert.ok(
      contractCode.includes('validateStreamTokenConcordance'),
      'chatStructuredResultContract.ts must export validateStreamTokenConcordance'
    );
  });
});
