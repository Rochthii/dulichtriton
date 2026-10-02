/**
 * ─────────────────────────────────────────────────────────────────────────────
 * TEST SUITE: P04-019 — Citation Coverage Check Cho Factual Answers
 * (Proof: factual fixture không nguồn không qua gate)
 * 
 * RÀNG BUỘC KIỂM TOÁN (PRODUCTION-REAL AUDIT CONSTRAINTS):
 * 1. Mọi câu trả lời mang tính sự kiện/thực địa (Factual Answer) — đề cập đến
 *    địa danh, di tích, chùa chiền, danh thắng, món ăn đặc sản, giá vé, giờ mở cửa
 *    hoặc hotline tại Tri Tôn — BẮT BUỘC phải có trích dẫn nguồn xác minh
 *    (Google Maps link, TikTok review link, hoặc CSDL chính thức).
 * 2. CHẶN ĐỨNG (Reject & Fail-closed) mọi Factual Fixture không có nguồn:
 *    - Factual answer nhắc tên POI nhưng có 0 trích dẫn (MISSING_ALL_CITATIONS).
 *    - Factual answer có trích dẫn domain giả mạo / spam (INVALID_CITATION_DOMAIN).
 *    - Tỷ lệ trích dẫn không đạt ngưỡng tối thiểu (INSUFFICIENT_CITATION_COVERAGE).
 * 3. HỖ TRỢ DETERMINISTIC ENRICHMENT:
 *    - Tự động bổ sung trích dẫn xác minh cho các thực thể Tri Tôn hợp lệ đã có
 *      trong CSDL tri thức. Nếu thực thể là fixture ảo/chưa xác minh, từ chối
 *      enrich và fail-closed gate.
 * 4. KÍCH HOẠT FALLBACK AN TOÀN:
 *    - Khi factual answer từ LLM không qua Gate, hệ thống tự động suy thoái
 *      về Local Expert RAG (100% câu trả lời có trích dẫn kiểm chứng thực địa).
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
const citationGatePath = path.resolve(__dirname, '../src/lib/chatCitationCoverageGate.ts');
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

test('P04-019: Chatbot Citation Coverage Gate & Factual Grounding Resilience Suite', async (t) => {
  const citationGateMod = loadModule(citationGatePath);
  const {
    checkCitationCoverage,
    detectFactualElements,
    extractValidCitations,
    enrichFactualCitations,
    ALLOWED_CITATION_DOMAINS,
    KNOWN_TRI_TON_ENTITIES,
  } = citationGateMod;

  // ── 1. Non-factual Conversational Answers Pass Gate ────────────────────────
  await t.test('Assertion 1: Non-factual text passes gate as NON_FACTUAL without citation requirement', () => {
    const conversationalCases = [
      'Xin chào Bạn! Tôi là Trợ Lý AI Du Lịch Tri Tôn chuyên sâu. Tôi có thể giúp gì cho Bạn hôm nay?',
      'Tôi chỉ hỗ trợ các nội dung liên quan đến Tri Tôn và dự án Du Lịch Tri Tôn. Bạn hãy đặt câu hỏi trong phạm vi này nhé!',
      'Cảm ơn Bạn đã hỏi! Chúc Bạn có một chuyến đi thật vui vẻ và trọn vẹn.',
      'Dạ vâng, Bạn muốn tìm hiểu thông tin về danh lam thắng cảnh hay các món ăn đặc sản ạ?',
    ];

    for (const text of conversationalCases) {
      const res = checkCitationCoverage(text);
      assert.equal(res.isFactual, false, `Must be non-factual: "${text.slice(0, 30)}"`);
      assert.equal(res.passed, true, 'Conversational text must pass gate');
      assert.equal(res.code, 'NON_FACTUAL');
      assert.equal(res.coverageRatio, 1.0);
    }
  });

  // ── 2. Positive Valid Factual Answers With Citations Pass Gate ────────────
  await t.test('Assertion 2: Valid factual answers with verified citations pass gate with PASSED code', () => {
    const validFactualAnswer = `Chào Bạn! Khi đến Tri Tôn, Bạn nhất định nên ghé thăm **Hồ Tà Pạ (Xã Núi Tô)** và thưởng thức **Gà Đốt Ô Thum (Xã Ô Lâm)**.

[📍 Chỉ đường Google Maps Hồ Tà Pạ](https://maps.google.com/?q=H%E1%BB%93+T%C3%A0+P%E1%BA%A1,+X%C3%A3+N%C3%BAi+T%C3%B4,+An+Giang) • [▶ Xem TikTok Video Hồ Tà Pạ](https://www.tiktok.com/tag/hotapa)
[📍 Chỉ đường Google Maps Gà Đốt](https://maps.google.com/?q=G%C3%A0+%C4%90%E1%BB%91t+%C3%94+Thum,+X%C3%A3+%C3%94+L%C3%A2m,+An+Giang) • [▶ Xem TikTok Video Gà Đốt](https://www.tiktok.com/tag/gadotothum)`;

    const res = checkCitationCoverage(validFactualAnswer);
    assert.equal(res.isFactual, true, 'Must identify as factual answer');
    assert.equal(res.passed, true, 'Must pass citation gate');
    assert.equal(res.code, 'PASSED');
    assert.ok(res.detectedEntities.includes('Hồ Tà Pạ'));
    assert.ok(res.detectedEntities.includes('Gà Đốt Ô Thum'));
    assert.ok(res.citations.length >= 2, 'Must extract at least 2 valid citations');
    assert.ok(res.coverageRatio >= 0.5, 'Coverage ratio must be >= 50%');
  });

  // ── 3. Factual Fixtures WITHOUT Citations are REJECTED (Core Proof) ────────
  await t.test('Assertion 3: Proof of Gate Enforcement — Factual fixtures without citations FAIL GATE', () => {
    const unverifiedFixtures = [
      {
        title: 'Chùa Xà Tón không nguồn',
        text: 'Chùa Xà Tón là ngôi chùa Khmer cổ kính bậc nhất tỉnh An Giang với hơn 300 năm tuổi, lưu giữ bộ Kinh lá buông Satra quý hiếm.',
        expectedEntity: 'Chùa Xà Tón',
      },
      {
        title: 'Hồ Tà Pạ & Đồi Tức Dụp không nguồn',
        text: 'Du khách có thể ghé thăm Hồ Tà Pạ ngắm làn nước xanh như ngọc bích, sau đó sang Đồi Tức Dụp để tham quan di tích lịch sử. Giá vé vào cổng là 20.000đ/người.',
        expectedEntity: 'Hồ Tà Pạ',
      },
      {
        title: 'Gà Đốt Ô Thum không nguồn',
        text: 'Gà Đốt Ô Thum tại Xã Ô Lâm được đốt trong thố đất với lá chúc tươi thơm nồng, mở cửa từ 8:00 sáng đến 18:00 chiều hàng ngày.',
        expectedEntity: 'Gà Đốt Ô Thum',
      },
      {
        title: 'Núi Cô Tô & Vồ Hội không nguồn',
        text: 'Đỉnh Núi Cô Tô cao hơn 600m có mỏm Đá Vồ Hội là tọa độ săn mây và ngắm hoàng hôn tuyệt đẹp của huyện Tri Tôn.',
        expectedEntity: 'Núi Cô Tô',
      },
    ];

    for (const fixture of unverifiedFixtures) {
      // Khi không cho phép enrichment (kiểm tra fixture thuần túy)
      const res = checkCitationCoverage(fixture.text, { allowEnrichment: false });
      assert.equal(res.isFactual, true, `Fixture "${fixture.title}" must be identified as factual`);
      assert.equal(res.passed, false, `Fixture "${fixture.title}" without citation MUST FAIL GATE`);
      assert.equal(res.code, 'MISSING_ALL_CITATIONS');
      assert.equal(res.citations.length, 0);
      assert.equal(res.coverageRatio, 0);
      assert.ok(
        res.detectedEntities.includes(fixture.expectedEntity),
        `Must detect entity ${fixture.expectedEntity}`
      );
      assert.ok(res.reason?.includes('lacks any verified citations'), 'Reason must explicitly state missing citations');
    }
  });

  // ── 4. Reject Suspicious / Unapproved / Spam Citation Domains ─────────────
  await t.test('Assertion 4: Factual answers with suspicious or unapproved citation domains are REJECTED', () => {
    const badDomainText = `Bạn nên đến viếng Chùa Xà Tón tại Thị trấn Tri Tôn:
[📍 Bản đồ chỉ đường](http://scam-travel-phishing.com/map?id=123) • [▶ Xem Video](https://tracking-malware.biz/video)`;

    const res = checkCitationCoverage(badDomainText);
    assert.equal(res.isFactual, true);
    assert.equal(res.passed, false, 'Must reject unapproved domain citation');
    assert.equal(res.code, 'INVALID_CITATION_DOMAIN');
    assert.ok(res.reason?.includes('unapproved or suspicious citation URLs'));
  });

  // ── 5. Strict Mode Insufficient Coverage Check ────────────────────────────
  await t.test('Assertion 5: Strict Mode rejects answers with insufficient citation coverage', () => {
    // Văn bản nhắc 4 địa danh nhưng chỉ có 1 link citation duy nhất
    const lowCoverageText = `Lịch trình gợi ý gồm có: **Hồ Tà Pạ**, **Chùa Xà Tón**, **Đồi Tức Dụp** và **Núi Cô Tô**.
[📍 Chỉ đường Hồ Tà Pạ](https://maps.google.com/?q=Ho+Ta+Pa,+Tri+Ton)`;

    const res = checkCitationCoverage(lowCoverageText, {
      strictMode: true,
      minCoverageRatio: 0.5,
      allowEnrichment: false,
    });

    assert.equal(res.isFactual, true);
    assert.equal(res.passed, false, 'Must fail in strict mode when coverage < 0.5');
    assert.equal(res.code, 'INSUFFICIENT_CITATION_COVERAGE');
    assert.ok(res.coverageRatio < 0.5);
  });

  // ── 6. Deterministic Citation Enrichment for Verified Tri Ton Entities ─────
  await t.test('Assertion 6: Deterministic Enrichment automatically adds verified citations for known entities', () => {
    const textWithoutLink = `Bạn hãy đến tham quan **Hồ Tà Pạ (Xã Núi Tô)** và ăn đặc sản **Gà Đốt Ô Thum (Xã Ô Lâm)** nhé!`;

    // Khi bật allowEnrichment: true
    const res = checkCitationCoverage(textWithoutLink, { allowEnrichment: true });
    assert.equal(res.isFactual, true);
    assert.equal(res.passed, true, 'Should pass after successful enrichment');
    assert.equal(res.code, 'PASSED');
    assert.equal(res.wasEnriched, true);
    assert.ok(res.enrichedText);
    assert.ok(res.enrichedText.includes('maps.google.com/?q=Hồ+Tà+Pạ'));
    assert.ok(res.enrichedText.includes('maps.google.com/?q=Gà+Đốt+Ô+Thum'));
    assert.ok(res.enrichedText.includes('tiktok.com/tag/hotapa'));
    assert.ok(res.enrichedText.includes('tiktok.com/tag/gadotothum'));
    assert.ok(res.citations.length >= 2);
  });

  // ── 7. Unknown / Unverified Factual Claims CANNOT Be Enriched & FAIL GATE ──
  await t.test('Assertion 7: Unknown/Unverified claims cannot be enriched and strictly FAIL GATE', () => {
    const fakeFixture = `Tại Tri Tôn có Thác Nước Cầu Vồng 7 Tầng bí ẩn, giá vé vào cổng là 150.000đ và giờ mở cửa là cả ngày.`;

    // Kể cả khi allowEnrichment: true, vì thực thể này không có trong CSDL xác minh, gate vẫn FAIL-CLOSED!
    const res = checkCitationCoverage(fakeFixture, { allowEnrichment: true });
    assert.equal(res.isFactual, true);
    assert.equal(res.passed, false, 'Unknown factual fixture MUST FAIL GATE even with enrichment enabled');
    assert.equal(res.code, 'MISSING_ALL_CITATIONS');
    assert.equal(res.citations.length, 0);
  });

  // ── 8. End-to-End Pipeline Fallback Proof (generateAIResponse) ─────────────
  await t.test('Assertion 8: generateAIResponse intercepts ungrounded factual answer and falls back to Local Expert RAG', async () => {
    const localRagMod = loadModule(localRagPath);
    const validatorMod = loadModule(validatorPath);
    const timeoutHelperMod = loadModule(timeoutHelperPath, {
      './chatOutputSchemaValidator': validatorMod,
    });

    const aiProviderMod = loadModule(aiProviderPath, {
      './chatCitationCoverageGate': citationGateMod,
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

    // Mock upstream stream trả về một câu trả lời factual bịa đặt không có nguồn và không thể enrich
    const ungroundedFactualStream = {
      customGroqStream: async function* () {
        yield {
          type: 'delta',
          content: 'Thác Nước Cầu Vồng 7 Tầng tại Tri Tôn là điểm đến mới nổi, vé vào cổng là 150.000đ mỗi khách.',
          provider: 'groq-lpu',
          model: 'llama-3.3-70b-versatile',
        };
        yield { type: 'done', provider: 'groq-lpu', model: 'llama-3.3-70b-versatile' };
      },
      customGeminiStream: async function* () {
        yield {
          type: 'delta',
          content: 'Thác Nước Cầu Vồng 7 Tầng tại Tri Tôn là điểm đến mới nổi, vé vào cổng là 150.000đ mỗi khách.',
          provider: 'gemini-failover',
          model: 'gemini-flash',
        };
        yield { type: 'done', provider: 'gemini-failover', model: 'gemini-flash' };
      },
    };

    const userPrompt = 'Lễ hội khinh khí cầu Tri Tôn diễn ra khi nào?';
    const result = await aiProviderMod.generateAIResponse(
      'System prompt',
      userPrompt,
      ungroundedFactualStream
    );

    // Bằng chứng cốt lõi: Câu trả lời không nguồn bị chặn lại, kích hoạt fallback sang Local Expert RAG!
    assert.equal(result.provider, 'local_expert_rag', 'Must fallback to local_expert_rag');
    assert.equal(result.model, 'local-expert-rag-v1');
    assert.ok(result.text.includes('Google Maps') || result.text.includes('maps.google.com'), 'Fallback text must contain verified citations');

    // Thẩm định câu trả lời sau fallback vượt qua Citation Gate 100%
    const gateCheck = checkCitationCoverage(result.text);
    assert.equal(gateCheck.passed, true, 'Fallback response must pass citation gate');
  });

  // ── 9. Static Code Invariant Checks ───────────────────────────────────────
  await t.test('Assertion 9: Static Invariant Check on codebase', () => {
    // 1. Module file exists
    assert.ok(fs.existsSync(citationGatePath), 'chatCitationCoverageGate.ts must exist');
    const gateCode = fs.readFileSync(citationGatePath, 'utf8');
    assert.ok(gateCode.includes('checkCitationCoverage'));
    assert.ok(gateCode.includes('ALLOWED_CITATION_DOMAINS'));
    assert.ok(gateCode.includes('KNOWN_TRI_TON_ENTITIES'));

    // 2. aiProvider.ts imports and exports chatCitationCoverageGate
    const aiProviderCode = fs.readFileSync(aiProviderPath, 'utf8');
    assert.ok(aiProviderCode.includes('checkCitationCoverage'));
    assert.ok(aiProviderCode.includes("export * from './chatCitationCoverageGate'"));

    // 3. query/route.ts applies checkCitationCoverage
    const queryRouteCode = fs.readFileSync(queryRoutePath, 'utf8');
    assert.ok(queryRouteCode.includes('checkCitationCoverage'), 'query route must import and apply checkCitationCoverage');

    // 4. stream/route.ts applies checkCitationCoverage
    const streamRouteCode = fs.readFileSync(streamRoutePath, 'utf8');
    assert.ok(streamRouteCode.includes('checkCitationCoverage'), 'stream route must import and apply checkCitationCoverage');
  });
});
