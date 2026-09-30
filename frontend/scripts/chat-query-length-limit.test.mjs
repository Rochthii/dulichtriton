import assert from 'node:assert/strict';
import fs from 'node:fs';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import typescript from 'typescript';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Paths
const guardPath = path.resolve(__dirname, '../src/lib/chatQueryGuard.ts');
const queryRoutePath = path.resolve(__dirname, '../src/app/api/v1/chat/query/route.ts');
const streamRoutePath = path.resolve(__dirname, '../src/app/api/v1/chat/stream/route.ts');

// Transpile and load TypeScript helper
function loadModule(filePath) {
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
  fn(m, m.exports, (mod) => {
    if (mod.startsWith('@/lib/')) {
      const target = path.resolve(__dirname, '../src/lib', mod.slice(6));
      for (const ext of ['', '.ts', '.js']) {
        if (fs.existsSync(target + ext)) return loadModule(target + ext);
      }
    }
    return require(mod);
  }, path.dirname(filePath), filePath);
  return m.exports;
}

test('P04-001: Chat Query Input-Length Limit Suite', async (t) => {
  const {
    DEFAULT_MAX_CHAT_QUERY_LENGTH,
    getMaxChatQueryLength,
    validateChatQuery,
  } = loadModule(guardPath);

  // 1. Static Code Invariant
  await t.test('1. Static Code Invariant: Guard and routes enforce input length limit', () => {
    assert.ok(fs.existsSync(guardPath), 'chatQueryGuard.ts must exist');
    assert.equal(DEFAULT_MAX_CHAT_QUERY_LENGTH, 1000, 'Default max chat query length must be 1000');

    const queryContent = fs.readFileSync(queryRoutePath, 'utf8');
    assert.ok(
      queryContent.includes('validateChatQuery'),
      'query/route.ts must import and call validateChatQuery'
    );
    assert.ok(
      queryContent.includes('validation.status'),
      'query/route.ts must respect validation.status (400 or 413)'
    );

    const streamContent = fs.readFileSync(streamRoutePath, 'utf8');
    assert.ok(
      streamContent.includes('validateChatQuery'),
      'stream/route.ts must import and call validateChatQuery'
    );
    assert.ok(
      streamContent.includes('validation.status'),
      'stream/route.ts must respect validation.status (400 or 413)'
    );
  });

  // 2. Unit Tests: getMaxChatQueryLength configuration
  await t.test('2. getMaxChatQueryLength respects environment variables with fallback', () => {
    assert.equal(getMaxChatQueryLength(), 1000);

    const prev = process.env.TEST_CHAT_MAX_LEN;
    try {
      process.env.TEST_CHAT_MAX_LEN = '500';
      assert.equal(getMaxChatQueryLength('TEST_CHAT_MAX_LEN'), 500);

      process.env.TEST_CHAT_MAX_LEN = 'invalid';
      assert.equal(getMaxChatQueryLength('TEST_CHAT_MAX_LEN'), 1000);

      process.env.TEST_CHAT_MAX_LEN = '-20';
      assert.equal(getMaxChatQueryLength('TEST_CHAT_MAX_LEN'), 1000);
    } finally {
      if (prev === undefined) delete process.env.TEST_CHAT_MAX_LEN;
      else process.env.TEST_CHAT_MAX_LEN = prev;
    }
  });

  // 3. Unit Tests: validateChatQuery
  await t.test('3. validateChatQuery accepts valid queries and enforces 1000 char threshold', () => {
    // Normal valid query
    const normal = validateChatQuery('Cho tôi biết về Hồ Tà Pạ');
    assert.equal(normal.isValid, true);
    if (normal.isValid) {
      assert.equal(normal.sanitizedQuery, 'Cho tôi biết về Hồ Tà Pạ');
    }

    // Boundary query (exact 1000 chars)
    const exact1000 = 'A'.repeat(1000);
    const boundaryRes = validateChatQuery(exact1000);
    assert.equal(boundaryRes.isValid, true);
    if (boundaryRes.isValid) {
      assert.equal(boundaryRes.sanitizedQuery.length, 1000);
    }

    // Query exceeding limit (1001 chars) -> HTTP 413
    const over1000 = 'A'.repeat(1001);
    const failRes = validateChatQuery(over1000);
    assert.equal(failRes.isValid, false);
    if (!failRes.isValid) {
      assert.equal(failRes.status, 413, 'Must return HTTP 413 for oversized query');
      assert.equal(failRes.code, 'QUERY_TOO_LONG');
      assert.equal(failRes.currentLength, 1001);
      assert.equal(failRes.maxLength, 1000);
      assert.ok(failRes.error.includes('1000 ký tự'));
    }

    // Token bomb / DoS attack string (50,000 chars) -> HTTP 413
    const tokenBomb = 'X'.repeat(50000);
    const bombRes = validateChatQuery(tokenBomb);
    assert.equal(bombRes.isValid, false);
    if (!bombRes.isValid) {
      assert.equal(bombRes.status, 413);
      assert.equal(bombRes.code, 'QUERY_TOO_LONG');
      assert.equal(bombRes.currentLength, 50000);
    }

    // Custom max length override
    const customRes = validateChatQuery('Hello Tri Ton', 5);
    assert.equal(customRes.isValid, false);
    if (!customRes.isValid) {
      assert.equal(customRes.status, 413);
      assert.equal(customRes.maxLength, 5);
    }
  });

  // 4. Unit Tests: Empty and malformed queries receive HTTP 400
  await t.test('4. validateChatQuery rejects missing or empty queries with HTTP 400', () => {
    const emptyCases = ['', '   ', '\n\t  ', null, undefined, 12345, {}, []];
    for (const val of emptyCases) {
      const res = validateChatQuery(val);
      assert.equal(res.isValid, false, `Must reject ${JSON.stringify(val)}`);
      if (!res.isValid) {
        assert.equal(res.status, 400, 'Must return HTTP 400 for empty/invalid query');
        assert.equal(res.code, 'MISSING_QUERY');
        assert.ok(res.error.length > 0);
      }
    }
  });

  // 5. Verification of Fail-Closed Route Payloads
  await t.test('5. Route response contract guarantees 413/400 for both query and stream endpoints', () => {
    // Simulate query validation logic from query/route.ts
    const testOversizedPayload = { query: 'Q'.repeat(1200) };
    const queryValidation = validateChatQuery(testOversizedPayload.query);
    assert.equal(queryValidation.isValid, false);
    assert.equal(queryValidation.status, 413);
    assert.equal(queryValidation.code, 'QUERY_TOO_LONG');

    // Simulate stream validation logic from stream/route.ts
    const testStreamMissingPayload = { message: '' };
    const rawStreamQuery = testStreamMissingPayload.query ?? testStreamMissingPayload.question ?? testStreamMissingPayload.message;
    const streamValidation = validateChatQuery(rawStreamQuery);
    assert.equal(streamValidation.isValid, false);
    assert.equal(streamValidation.status, 400);
    assert.equal(streamValidation.code, 'MISSING_QUERY');
  });
});
