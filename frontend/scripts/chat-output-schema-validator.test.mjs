/**
 * ─────────────────────────────────────────────────────────────────────────────
 * TEST SUITE: P04-018 — Output Schema Validator cho Câu Trả Lời Chatbot
 * (Proof: malformed provider output bị chặn/fallback)
 * 
 * RÀNG BUỘC KIỂM TOÁN (PRODUCTION-REAL AUDIT CONSTRAINTS):
 * 1. Mọi phản hồi từ LLM Provider (Groq, Gemini, OpenRouter, Local RAG) phải
 *    được thẩm định qua Output Schema Validator trước khi trả về client hoặc
 *    lưu vào session turns / audit logs.
 * 2. CHẶN ĐỨNG (Reject & Fail-closed) mọi trường hợp Malformed Provider Output:
 *    - EMPTY_OR_WHITESPACE: Chuỗi rỗng, khoảng trắng hoặc null bytes.
 *    - TOO_SHORT_OR_MEANINGLESS: Quá ngắn hoặc từ ngữ vô nghĩa ("...", "ok", "null").
 *    - RAW_PROVIDER_ERROR: Chữ ký lỗi kỹ thuật API / Gateway (500, 502, 429, JSON error).
 *    - PROMPT_LEAKAGE: Rò rỉ prompt hệ thống, special tokens (<system>, [INST], <|im_start|>).
 *    - MALFORMED_JSON_DUMP: JSON rách / dở dang hoặc raw choices rò rỉ từ API body.
 *    - REPETITIVE_LOOP: Vòng lặp lấy mẫu suy thoái (lặp lại vô tận một từ/cụm từ).
 * 3. TỰ ĐỘNG SỬA CHỮA (Auto-Repair) unclosed markdown code fences.
 * 4. KÍCH HOẠT FALLBACK AN TOÀN:
 *    - Non-streaming (generateAIResponse): Tự động suy thoái về Tầng 5: Local Expert RAG.
 *    - Streaming (orchestrateGroqWithFailover): Chặn chunk lỗi thô ngay tại cổng đón nhận,
 *      kích hoạt failover tức thì sang Secondary Gemini / Local RAG không rò rỉ rác ra UI.
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
const validatorPath = path.resolve(__dirname, '../src/lib/chatOutputSchemaValidator.ts');
const timeoutHelperPath = path.resolve(__dirname, '../src/lib/chatGroqTimeoutHelper.ts');
const aiProviderPath = path.resolve(__dirname, '../src/lib/aiProvider.ts');
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
        if (fs.existsSync(target)) {
          return loadModule(target, customResolver);
        }
      }
      if (id.startsWith('@/data/')) {
        const rel = id.replace('@/data/', '');
        const target = path.resolve(__dirname, '../src/data', rel);
        if (fs.existsSync(target)) {
          return JSON.parse(fs.readFileSync(target, 'utf8'));
        }
        const dataTarget = path.resolve(__dirname, '../../data', rel);
        if (fs.existsSync(dataTarget)) {
          return JSON.parse(fs.readFileSync(dataTarget, 'utf8'));
        }
      }
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

test('P04-018: Chatbot Output Schema Validator & Malformed Output Fallback Resilience Suite', async (t) => {
  const validatorMod = loadModule(validatorPath);
  const {
    validateChatbotOutput,
    isMalformedProviderOutput,
    containsRawProviderError,
    containsPromptLeakage,
    detectMalformedJsonDump,
    detectRepetitiveLoop,
    repairMarkdownFences,
  } = validatorMod;

  // ── 1. Positive Validation Proof ──────────────────────────────────────────
  await t.test('Assertion 1: Positive Valid Responses pass validator with clean state', () => {
    const validResponse1 = `Chào Bạn! Khi đến du lịch Tri Tôn, Bạn nhất định nên ghé thăm **Hồ Tà Pạ (Xã Núi Tô)** được mệnh danh là tuyệt tình cốc Bảy Núi.
[📍 Chỉ đường Google Maps](https://maps.google.com/?q=Ho+Ta+Pa,+Xa+Nui+To,+An+Giang) • [▶ Xem TikTok Video](https://www.tiktok.com/tag/hotapa)

Buổi trưa, Bạn có thể di chuyển sang **Hồ Ô Thum (Xã Ô Lâm)** để thưởng thức đặc sản **Gà đốt lá chúc** thơm lừng trứ danh!`;

    const res1 = validateChatbotOutput(validResponse1);
    assert.equal(res1.isValid, true, 'Valid response must pass');
    assert.equal(res1.code, undefined);
    assert.equal(res1.sanitizedText, validResponse1.trim());

    assert.equal(isMalformedProviderOutput(validResponse1), false);
  });

  // ── 2. Reject Empty / Whitespace-only / Control characters ────────────────
  await t.test('Assertion 2: Empty, whitespace-only and null bytes are rejected with EMPTY_OR_WHITESPACE', () => {
    const emptyCases = [
      '',
      '   ',
      '\n\t\r  \n',
      '\x00\x00\x00',
      null,
      undefined,
      12345,
      {},
      [],
    ];

    for (const c of emptyCases) {
      const res = validateChatbotOutput(c);
      assert.equal(res.isValid, false, `Should reject ${JSON.stringify(c)}`);
      assert.equal(res.code, 'EMPTY_OR_WHITESPACE');
      assert.ok(res.reason);
      assert.equal(isMalformedProviderOutput(c), true);
    }
  });

  // ── 3. Reject Too Short & Meaningless responses ──────────────────────────
  await t.test('Assertion 3: Meaningless and too short outputs are rejected with TOO_SHORT_OR_MEANINGLESS', () => {
    const meaninglessCases = [
      '...',
      '???',
      '!!!',
      'ok',
      'OK',
      'hi',
      'test',
      'null',
      'undefined',
      'NaN',
      'error',
      'done',
      'Xin chào', // 8 chars < 15
      'Tri Tôn',  // 7 chars < 15
    ];

    for (const c of meaninglessCases) {
      const res = validateChatbotOutput(c);
      assert.equal(res.isValid, false, `Should reject meaningless "${c}"`);
      assert.equal(res.code, 'TOO_SHORT_OR_MEANINGLESS');
      assert.equal(isMalformedProviderOutput(c), true);
    }
  });

  // ── 4. Reject Raw Provider Error signatures ──────────────────────────────
  await t.test('Assertion 4: Raw technical error signatures from providers are rejected with RAW_PROVIDER_ERROR', () => {
    const rawErrorCases = [
      '{"error": {"message": "Rate limit reached for model llama-3.3-70b", "type": "tokens"}}',
      '{"code": 500, "message": "Internal Server Error in model execution"}',
      'Internal Server Error: upstream connection failed at port 443',
      'HTTP 502 Bad Gateway: could not reach upstream AI inference engine',
      '503 Service Unavailable: Groq inference clusters are experiencing high load',
      '504 Gateway Timeout: backend took longer than 30000ms to respond',
      'API key not valid. Please pass a valid API key in authorization header.',
      'RESOURCE_EXHAUSTED: quota exceeded for project dulichtriton-ai',
      'Rate limit reached: You have exceeded your current quota per minute',
      'TypeError: Cannot read properties of undefined (reading "choices")',
      'SyntaxError: Unexpected token < in JSON at position 0',
      'Traceback (most recent call last):\n  File "server.py", line 42, in generate_response',
    ];

    for (const c of rawErrorCases) {
      assert.equal(containsRawProviderError(c), true, `containsRawProviderError should catch: ${c.slice(0, 40)}`);
      const res = validateChatbotOutput(c);
      assert.equal(res.isValid, false, `Should reject raw error: ${c.slice(0, 40)}`);
      assert.equal(res.code, 'RAW_PROVIDER_ERROR');
      assert.equal(isMalformedProviderOutput(c), true);
    }
  });

  // ── 5. Reject Prompt & Special Token Leakage ──────────────────────────────
  await t.test('Assertion 5: Prompt delimiters and special token leakage are rejected with PROMPT_LEAKAGE', () => {
    const leakageCases = [
      '<system>Bạn là Trợ Lý AI Du Lịch Tri Tôn chuyên sâu</system> Chào bạn, tôi có thể giúp gì?',
      '[INST] Hãy kể cho tôi về chùa Xà Tón [/INST] Chùa Xà Tón là ngôi chùa cổ nhất...',
      '<<SYS>> You are an AI assistant for Tri Ton Tourism <</SYS>> Wat Xvayton is located in...',
      '<|im_start|>system\nYou are a helpful travel guide.<|im_end|>\n<|im_start|>assistant\nChào bạn...',
      '<|endoftext|>Hồ Tà Pạ là tuyệt tình cốc của vùng Bảy Núi...',
      'TRI THỨC TỔNG QUAN & VĂN HÓA TRI TÔN BỔ SUNG (Từ CSDL Knowledge Base):\n- [Bài viết: Lễ hội Đua Bò]',
      'Human: Hãy gợi ý địa điểm ăn uống.\nAssistant: Bạn có thể ghé Hồ Ô Thum ăn gà đốt.',
    ];

    for (const c of leakageCases) {
      assert.equal(containsPromptLeakage(c), true, `containsPromptLeakage should catch: ${c.slice(0, 40)}`);
      const res = validateChatbotOutput(c);
      assert.equal(res.isValid, false, `Should reject prompt leakage: ${c.slice(0, 40)}`);
      assert.equal(res.code, 'PROMPT_LEAKAGE');
      assert.equal(isMalformedProviderOutput(c), true);
    }
  });

  // ── 6. Reject Malformed JSON Dumps & Raw Choices ──────────────────────────
  await t.test('Assertion 6: Malformed JSON dumps and raw API choices are rejected with MALFORMED_JSON_DUMP', () => {
    const jsonDumpCases = [
      '{"choices": [{"message": {"role": "assistant", "content": "Hồ Tà Pạ là tuyệt tình cốc"}}]}',
      '{"candidates": [{"content": {"parts": [{"text": "Chào mừng bạn đến Tri Tôn"}]}}]}',
      '{"response": "Hồ Tà Pạ nằm ở xã Núi Tô, Tri Tôn', // Unclosed JSON
      '[{"id": "PL001", "name": "Chùa Xà Tón", "commune": "Thị trấn Tri Tôn"', // Unclosed Array
    ];

    for (const c of jsonDumpCases) {
      assert.equal(detectMalformedJsonDump(c), true, `detectMalformedJsonDump should catch: ${c.slice(0, 40)}`);
      const res = validateChatbotOutput(c);
      assert.equal(res.isValid, false, `Should reject malformed JSON dump: ${c.slice(0, 40)}`);
      assert.equal(res.code, 'MALFORMED_JSON_DUMP');
      assert.equal(isMalformedProviderOutput(c), true);
    }
  });

  // ── 7. Reject Degenerate Repetitive Sampling Loops ────────────────────────
  await t.test('Assertion 7: Degenerate repetitive word/phrase loops are rejected with REPETITIVE_LOOP', () => {
    const singleWordLoop = 'Tri Tôn '.repeat(15).trim() + ' là điểm đến tuyệt vời tại tỉnh An Giang.';
    assert.equal(detectRepetitiveLoop(singleWordLoop), true);
    const res1 = validateChatbotOutput(singleWordLoop);
    assert.equal(res1.isValid, false);
    assert.equal(res1.code, 'REPETITIVE_LOOP');

    const bigramLoop = 'Hồ Tà Pạ '.repeat(10).trim() + ' có phong cảnh rất đẹp ở Bảy Núi.';
    assert.equal(detectRepetitiveLoop(bigramLoop), true);
    const res2 = validateChatbotOutput(bigramLoop);
    assert.equal(res2.isValid, false);
    assert.equal(res2.code, 'REPETITIVE_LOOP');
  });

  // ── 8. Markdown Auto-Repair Unclosed Code Fences ──────────────────────────
  await t.test('Assertion 8: Unclosed markdown code fences are safely repaired without breaking UI', () => {
    const unclosedMarkdown = `Dưới đây là thông tin chi tiết về lịch trình:
\`\`\`markdown
- Buổi sáng: Tham quan Hồ Tà Pạ (Xã Núi Tô)
- Buổi trưa: Ăn Gà đốt lá chúc tại Hồ Ô Thum (Xã Ô Lâm)
- Buổi chiều: Viếng Chùa Xà Tón (Thị trấn Tri Tôn)`;

    // Auto-repair enabled (default)
    const resAuto = validateChatbotOutput(unclosedMarkdown, { allowAutoRepair: true });
    assert.equal(resAuto.isValid, true, 'Should be valid when auto-repaired');
    assert.equal(resAuto.repairedFences, true);
    assert.ok(resAuto.sanitizedText.endsWith('```\n') || resAuto.sanitizedText.endsWith('```'));

    // Verify fence count is now even (valid markdown)
    const fences = resAuto.sanitizedText.match(/```/g);
    assert.equal(fences.length % 2, 0, 'Fences must be balanced');

    // Auto-repair disabled
    const resStrict = validateChatbotOutput(unclosedMarkdown, { allowAutoRepair: false });
    assert.equal(resStrict.isValid, false);
    assert.equal(resStrict.code, 'UNCLOSED_MARKDOWN_BLOCK');
  });

  // ── 9. Non-streaming generateAIResponse Fallback Proof ────────────────────
  await t.test('Assertion 9: generateAIResponse intercepts malformed provider output and falls back to Local Expert RAG', async () => {
    const localRagMod = loadModule(localRagPath);
    const timeoutHelperMod = loadModule(timeoutHelperPath, {
      './chatOutputSchemaValidator': validatorMod,
    });

    const aiProviderMod = loadModule(aiProviderPath, {
      './chatOutputSchemaValidator': validatorMod,
      './chatGroqTimeoutHelper': timeoutHelperMod,
      './ai/localExpertRag': localRagMod,
      './ai/config': { AI_CONFIG: { groqModels: ['m'], geminiModels: ['m'], openRouterModels: ['m'] } },
      './ai/geminiClient': { streamGeminiNative: async function* () {} },
      './ai/fallbackClients': {
        streamGroqNative: async function* () {},
        streamOpenRouterNative: async function* () {},
      },
      './ai/intentRouter': {
        routeQueryIntent: () => ({ intent: 'GENERAL_CHAT' }),
        applyTruthAnchor: (t) => t,
      },
      './chatAuditProviderHelper': {
        resolveAuditProvider: (p) => p || 'local_expert_rag',
        resolveAuditModel: (m) => m || 'local-expert-rag-v1',
      },
    });

    // Mock an upstream stream that yields a malformed raw error dump
    const malformedStreamOptions = {
      customGroqStream: async function* () {
        yield {
          type: 'delta',
          content: '{"error": {"message": "Invalid API key provided", "type": "invalid_request_error"}}',
          provider: 'groq-lpu',
          model: 'llama-3.3-70b-versatile',
        };
        yield { type: 'done', provider: 'groq-lpu', model: 'llama-3.3-70b-versatile' };
      },
      customGeminiStream: async function* () {
        // Fallback Gemini also yields malformed short junk
        yield { type: 'delta', content: 'error', provider: 'gemini-failover', model: 'gemini-flash' };
        yield { type: 'done', provider: 'gemini-failover', model: 'gemini-flash' };
      },
    };

    const userPrompt = 'Lễ hội khinh khí cầu Tri Tôn diễn ra khi nào?';
    const result = await aiProviderMod.generateAIResponse(
      'System prompt',
      userPrompt,
      malformedStreamOptions
    );

    // Bằng chứng cốt lõi: Kết quả không crash, không chứa error raw, tự động suy thoái về Local Expert RAG!
    assert.ok(result.text, 'Must return non-empty text');
    assert.ok(!result.text.includes('"error"'), 'Must not contain raw error payload');
    assert.equal(result.provider, 'local_expert_rag', 'Provider must fallback to local_expert_rag');
    assert.equal(result.model, 'local-expert-rag-v1', 'Model must fallback to local-expert-rag-v1');

    // Thẩm định text fallback đạt chuẩn 100%
    const textValidation = validateChatbotOutput(result.text);
    assert.equal(textValidation.isValid, true, 'Fallback text must be 100% valid schema');
    assert.ok(result.text.includes('Khinh Khí Cầu') || result.text.includes('Tri Tôn'));
  });

  // ── 10. Streaming orchestrateGroqWithFailover Early Raw Error Interception Proof ──
  await t.test('Assertion 10: orchestrateGroqWithFailover blocks raw error chunks and triggers instant failover', async () => {
    const timeoutHelperMod = loadModule(timeoutHelperPath, {
      './chatOutputSchemaValidator': validatorMod,
    });

    let primaryMalformedCaught = false;
    let failoverReason = '';

    // Primary emits raw 500 error in first delta chunk
    const badPrimaryStream = async function* () {
      yield {
        type: 'delta',
        content: 'Internal Server Error: 500 upstream model crashed',
        provider: 'groq-lpu',
        model: 'llama-3.3-70b-versatile',
      };
      yield { type: 'done', provider: 'groq-lpu', model: 'llama-3.3-70b-versatile' };
    };

    // Fallback emits healthy tokens
    const goodFallbackStream = async function* () {
      yield {
        type: 'delta',
        content: 'Chào Bạn! Tri Tôn có rất nhiều danh thắng đẹp như Hồ Tà Pạ và Đồi Tức Dụp.',
        provider: 'gemini-secondary',
        model: 'gemini-2.5-flash',
      };
      yield { type: 'done', provider: 'gemini-secondary', model: 'gemini-2.5-flash' };
    };

    const emittedChunks = [];
    const streamGen = timeoutHelperMod.orchestrateGroqWithFailover(
      badPrimaryStream,
      goodFallbackStream,
      {
        groqTimeoutMs: 2500,
        onPrimaryMalformedOutput: (raw, reason) => {
          primaryMalformedCaught = true;
          assert.equal(reason, 'RAW_PROVIDER_ERROR');
        },
        onFailoverTriggered: (from, to, reason) => {
          failoverReason = reason;
        },
      }
    );

    for await (const chunk of streamGen) {
      emittedChunks.push(chunk);
    }

    // 1. Phải bắt được raw error và kích hoạt failover
    assert.equal(primaryMalformedCaught, true, 'Must catch primary malformed output');
    assert.ok(failoverReason.includes('Primary returned raw error'), 'Failover reason must mention raw error');

    // 2. Client stream tuyệt đối KHÔNG nhận chunk lỗi "Internal Server Error"
    const deltas = emittedChunks.filter((c) => c.type === 'delta').map((c) => c.content);
    const combinedText = deltas.join('');
    assert.ok(!combinedText.includes('Internal Server Error'), 'Zero leaked error chunks to client');
    assert.ok(combinedText.includes('Chào Bạn! Tri Tôn'), 'Client receives healthy fallback tokens');

    // 3. Provider cuối cùng phải là gemini-secondary
    const doneChunk = emittedChunks.find((c) => c.type === 'done');
    assert.ok(doneChunk, 'Must have done chunk');
    assert.equal(doneChunk.provider, 'gemini-secondary');
  });

  // ── 11. Static Code Invariant Checks ──────────────────────────────────────
  await t.test('Assertion 11: Static Invariant Check on codebase', () => {
    // 1. validator file exists and is populated
    assert.ok(fs.existsSync(validatorPath), 'chatOutputSchemaValidator.ts must exist');
    const validatorCode = fs.readFileSync(validatorPath, 'utf8');
    assert.ok(validatorCode.includes('validateChatbotOutput'));
    assert.ok(validatorCode.includes('RAW_PROVIDER_ERROR_SIGNATURES'));
    assert.ok(validatorCode.includes('PROMPT_LEAKAGE_SIGNATURES'));

    // 2. query/route.ts applies validateChatbotOutput
    const queryRouteCode = fs.readFileSync(queryRoutePath, 'utf8');
    assert.ok(queryRouteCode.includes('validateChatbotOutput'), 'query route must import and use validateChatbotOutput');

    // 3. stream/route.ts applies validateChatbotOutput
    const streamRouteCode = fs.readFileSync(streamRoutePath, 'utf8');
    assert.ok(streamRouteCode.includes('validateChatbotOutput'), 'stream route must import and use validateChatbotOutput');

    // 4. aiProvider.ts exports chatOutputSchemaValidator
    const aiProviderCode = fs.readFileSync(aiProviderPath, 'utf8');
    assert.ok(aiProviderCode.includes("export * from './chatOutputSchemaValidator'"));
  });
});
