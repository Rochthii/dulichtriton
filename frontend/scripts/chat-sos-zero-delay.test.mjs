/**
 * ─────────────────────────────────────────────────────────────────────────────
 * P04-023: CHAT SOS ZERO ARTIFICIAL DELAY RESILIENCE & UNIT SUITE
 * Du Lịch Tri Tôn AI Assistant System
 * 
 * PHẠM VI & MỤC TIÊU NGHIỆM THU:
 * - Bỏ hoàn toàn sleep / delay nhân tạo khỏi luồng phản hồi khẩn cấp SOS (SOS_EMERGENCY).
 * - PROOF: Unit test xác nhận 100% không gọi delay helper (0 calls to setTimeout/sleep).
 * - Đo lường độ trễ TTFT cứu hộ khẩn cấp đạt tức thì (< 20ms).
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

const aiProviderPath = path.resolve(__dirname, '../src/lib/aiProvider.ts');

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

const aiProvider = loadModule(aiProviderPath);
const { streamAIResponse, generateAIResponse } = aiProvider;

test('P04-023: 1. streamAIResponse SOS Response Path Executes With ZERO setTimeout Calls', async () => {
  const originalSetTimeout = global.setTimeout;
  let setTimeoutCallCount = 0;
  const recordedDelays = [];

  // Spy on global.setTimeout
  global.setTimeout = function (callback, delay, ...args) {
    setTimeoutCallCount++;
    recordedDelays.push(delay);
    return originalSetTimeout(callback, delay, ...args);
  };

  try {
    const sosQuery = 'Tôi bị ngã xe chấn thương ở đèo Tà Pạ cần cấp cứu khẩn cấp!';
    const chunks = [];
    const t0 = performance.now();

    for await (const chunk of streamAIResponse('Hệ thống trợ lý', sosQuery)) {
      chunks.push(chunk);
    }

    const elapsedMs = performance.now() - t0;

    // PROOF: Không gọi delay helper
    assert.equal(
      setTimeoutCallCount,
      0,
      `SOS response path không được gọi setTimeout! Đã phát hiện ${setTimeoutCallCount} lời gọi trễ: ${JSON.stringify(recordedDelays)}`
    );

    // PROOF: Hoàn thành cực nhanh (< 20ms)
    assert.ok(
      elapsedMs < 20,
      `Độ trễ phản hồi SOS phải < 20ms, thực tế là ${elapsedMs.toFixed(2)}ms`
    );

    // Kiểm tra cấu trúc chunks
    assert.ok(chunks.length >= 2, 'Phải có ít nhất delta và done chunks');
    const deltaChunk = chunks.find(c => c.type === 'delta');
    assert.ok(deltaChunk && deltaChunk.content, 'Delta chunk phải có nội dung');
    assert.equal(deltaChunk.provider, 'emergency_instant_bypass');
    assert.equal(deltaChunk.model, 'emergency-instant-rule-engine');

    const doneChunk = chunks.find(c => c.type === 'done');
    assert.ok(doneChunk, 'Phải có done chunk kết thúc');
    assert.equal(doneChunk.provider, 'emergency_instant_bypass');
  } finally {
    global.setTimeout = originalSetTimeout;
  }
});

test('P04-023: 2. Completeness of SOS Emergency Content & Provenance Citations', async () => {
  const sosQuery = 'Số điện thoại công an và cấp cứu bệnh viện Tri Tôn cứu hộ khẩn cấp';
  const chunks = [];

  for await (const chunk of streamAIResponse('Hệ thống trợ lý', sosQuery)) {
    chunks.push(chunk);
  }

  const fullText = chunks
    .filter(c => c.type === 'delta')
    .map(c => c.content)
    .join('');

  // Proof: Đầy đủ các đầu số khẩn cấp quan trọng
  assert.ok(fullText.includes('0296.3874.113'), 'Phải chứa số Công an Huyện Tri Tôn');
  assert.ok(fullText.includes('0296.3874.115'), 'Phải chứa số Cấp cứu Y tế Tri Tôn');
  assert.ok(fullText.includes('114'), 'Phải chứa số Cứu hỏa PCCC');

  // Proof: Đầy đủ nguồn xác minh chính thức và ngày thẩm định (P04-022 provenance)
  assert.ok(fullText.includes('https://triton.angiang.gov.vn'), 'Phải dẫn nguồn cổng thông tin chính thức');
  assert.ok(fullText.includes('2026-09-28'), 'Phải dẫn mốc thời gian kiểm toán');

  // Proof: Loại trừ hoàn toàn số mock
  assert.ok(!fullText.includes('0913 789 123'), 'Tuyệt đối không chứa số mock 0913 789 123');
  assert.ok(!fullText.includes('0296 3760 123'), 'Tuyệt đối không chứa số mock 0296 3760 123');
});

test('P04-023: 3. generateAIResponse SOS Path Executes Instantaneously Without Delay', async () => {
  const originalSetTimeout = global.setTimeout;
  let setTimeoutCallCount = 0;

  global.setTimeout = function (callback, delay, ...args) {
    setTimeoutCallCount++;
    return originalSetTimeout(callback, delay, ...args);
  };

  try {
    const sosQuery = 'Cứu hộ khẩn cấp tai nạn xe máy ở Tri Tôn';
    const t0 = performance.now();
    const result = await generateAIResponse('Hệ thống trợ lý', sosQuery);
    const elapsedMs = performance.now() - t0;

    // PROOF: Không gọi setTimeout trong quá trình xử lý non-streaming SOS
    assert.equal(setTimeoutCallCount, 0, 'generateAIResponse không được gọi setTimeout trong nhánh SOS');
    assert.ok(elapsedMs < 50, `Thời gian đáp ứng phải < 50ms, thực tế là ${elapsedMs.toFixed(2)}ms`);

    assert.ok(result.text.includes('0296.3874.113'), 'Phải chứa số Công an');
    assert.equal(result.provider, 'emergency_instant_bypass');
    assert.equal(result.model, 'emergency-instant-rule-engine');
  } finally {
    global.setTimeout = originalSetTimeout;
  }
});

test('P04-023: 4. Static Code Invariant Audit on aiProvider.ts (Proof: Zero Sleep in SOS Path)', async () => {
  const code = fs.readFileSync(aiProviderPath, 'utf8');

  // Trích xuất đoạn code xử lý SOS_EMERGENCY
  const sosSectionMatch = code.match(/if\s*\(\s*analysis\.intent\s*===\s*['"]SOS_EMERGENCY['"][\s\S]*?return;\s*\}/);
  assert.ok(sosSectionMatch, 'Phải tìm thấy khối xử lý SOS_EMERGENCY trong aiProvider.ts');

  const sosSection = sosSectionMatch[0];

  // Invariant 1: Không có setTimeout trong khối SOS
  assert.ok(
    !sosSection.includes('setTimeout'),
    'Khối SOS_EMERGENCY tuyệt đối KHÔNG chứa setTimeout!'
  );

  // Invariant 2: Không có Promise sleep trong khối SOS
  assert.ok(
    !sosSection.includes('sleep('),
    'Khối SOS_EMERGENCY tuyệt đối KHÔNG chứa hàm sleep!'
  );

  assert.ok(
    !sosSection.includes('Promise((r) => setTimeout'),
    'Khối SOS_EMERGENCY tuyệt đối KHÔNG chứa Promise delay wrapper!'
  );

  // Invariant 3: Provider và Model phải là canonical identifiers
  assert.ok(
    sosSection.includes("provider: 'emergency_instant_bypass'"),
    'Phải sử dụng canonical provider emergency_instant_bypass'
  );
  assert.ok(
    sosSection.includes("model: 'emergency-instant-rule-engine'"),
    'Phải sử dụng canonical model emergency-instant-rule-engine'
  );
});
