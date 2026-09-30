import assert from 'node:assert/strict';
import fs from 'node:fs';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import test from 'node:test';
import typescript from 'typescript';

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));

// Paths
const specPath = path.resolve(__dirname, '../../docs/technical-spec/CHAT_SESSION_IDENTIFIER_CONTRACT.md');
const contractModulePath = path.resolve(__dirname, '../src/lib/sessionIdentifierContract.ts');

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
  fn(m, m.exports, require, path.dirname(filePath), filePath);
  return m.exports;
}

test('P04-002: Chat Session Identifier Contract Suite', async (t) => {
  const {
    SESSION_ID_REGEX,
    isValidSessionId,
    generateSessionId,
    sanitizeSessionId,
    validateSessionId,
  } = loadModule(contractModulePath);

  // 1. Static Contract & Specification Invariant
  await t.test('1. Static Specification Invariant: Contract documentation exists with mandatory rules', () => {
    assert.ok(fs.existsSync(specPath), 'CHAT_SESSION_IDENTIFIER_CONTRACT.md must exist');
    const docContent = fs.readFileSync(specPath, 'utf8');

    assert.ok(docContent.includes('CHAT-SESSION-ID-CONTRACT-V1'), 'Must state contract ID');
    assert.ok(docContent.includes('UUID v4'), 'Must mandate UUID v4');
    assert.ok(docContent.includes('RFC 4122'), 'Must reference RFC 4122');
    assert.ok(docContent.includes('Math.random()'), 'Must explicitly prohibit Math.random');
    assert.ok(docContent.includes('crypto.randomUUID()'), 'Must specify crypto.randomUUID() as native generator');
    assert.ok(docContent.includes('INV-SEC-01'), 'Must contain security invariant INV-SEC-01');
    assert.ok(docContent.includes('INV-SEC-02'), 'Must contain security invariant INV-SEC-02');
    assert.ok(docContent.includes('INV-SEC-03'), 'Must contain security invariant INV-SEC-03');
  });

  // 2. Unit Tests: isValidSessionId
  await t.test('2. isValidSessionId strictly accepts valid UUID v4 and rejects invalid/legacy strings', () => {
    // Valid UUID v4
    const validV4Sample1 = 'c0a80101-0000-4000-8000-000000000000';
    const validV4Sample2 = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
    const validV4Sample3 = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'.replace('-11d1-', '-41d1-'); // morphed to v4
    const validV4Upper = 'F47AC10B-58CC-4372-A567-0E02B2C3D479';

    assert.equal(isValidSessionId(validV4Sample1), true);
    assert.equal(isValidSessionId(validV4Sample2), true);
    assert.equal(isValidSessionId(validV4Sample3), true);
    assert.equal(isValidSessionId(validV4Upper), true);

    // Non-v4 UUIDs must be rejected (version bit must be 4)
    const uuidV1 = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'; // version 1
    const uuidV3 = '6ba7b810-9dad-31d1-80b4-00c04fd430c8'; // version 3
    const uuidV5 = '6ba7b810-9dad-51d1-80b4-00c04fd430c8'; // version 5
    assert.equal(isValidSessionId(uuidV1), false, 'UUID v1 must be rejected');
    assert.equal(isValidSessionId(uuidV3), false, 'UUID v3 must be rejected');
    assert.equal(isValidSessionId(uuidV5), false, 'UUID v5 must be rejected');

    // Invalid variant bit (must be 8, 9, a, or b)
    const invalidVariant = 'c0a80101-0000-4000-c000-000000000000'; // variant 'c' is not RFC 4122
    assert.equal(isValidSessionId(invalidVariant), false, 'Non-RFC 4122 variant must be rejected');

    // Legacy client strings from Math.random() must be rejected
    const legacyPageSession = 'page_session_k9x2m4p';
    const legacyWidgetSession = 'session_ab12cd3';
    const legacyAnon = 'anonymous';
    assert.equal(isValidSessionId(legacyPageSession), false);
    assert.equal(isValidSessionId(legacyWidgetSession), false);
    assert.equal(isValidSessionId(legacyAnon), false);

    // Malformed shapes
    const malformedShort = 'c0a80101-0000-4000-8000-00000000000'; // 35 chars
    const malformedLong = 'c0a80101-0000-4000-8000-0000000000000'; // 37 chars
    const malformedNoHyphen = 'c0a80101000040008000000000000000';
    const malformedInvalidHex = 'g0a80101-0000-4000-8000-000000000000';
    assert.equal(isValidSessionId(malformedShort), false);
    assert.equal(isValidSessionId(malformedLong), false);
    assert.equal(isValidSessionId(malformedNoHyphen), false);
    assert.equal(isValidSessionId(malformedInvalidHex), false);

    // Non-string types
    assert.equal(isValidSessionId(null), false);
    assert.equal(isValidSessionId(undefined), false);
    assert.equal(isValidSessionId(12345), false);
    assert.equal(isValidSessionId({}), false);
    assert.equal(isValidSessionId([]), false);
  });

  // 3. Unit Tests: generateSessionId
  await t.test('3. generateSessionId generates collision-free cryptographically valid UUID v4', () => {
    const generatedSet = new Set();
    const ITERATIONS = 1000;

    for (let i = 0; i < ITERATIONS; i++) {
      const id = generateSessionId();
      assert.equal(typeof id, 'string');
      assert.equal(id.length, 36);
      assert.ok(SESSION_ID_REGEX.test(id), `Generated ID must match UUID v4 regex: ${id}`);
      assert.equal(id, id.toLowerCase(), 'Generated ID must be lowercase');
      generatedSet.add(id);
    }

    assert.equal(
      generatedSet.size,
      ITERATIONS,
      `All ${ITERATIONS} generated UUIDs must be distinct (zero collisions)`
    );
  });

  // 4. Unit Tests: sanitizeSessionId
  await t.test('4. sanitizeSessionId preserves valid IDs and regenerates invalid ones', () => {
    const valid = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
    assert.equal(sanitizeSessionId(valid), valid);

    const validUpper = 'F47AC10B-58CC-4372-A567-0E02B2C3D479';
    assert.equal(sanitizeSessionId(validUpper), valid.toLowerCase());

    const legacy = 'session_old123';
    const sanitized = sanitizeSessionId(legacy);
    assert.notEqual(sanitized, legacy);
    assert.equal(isValidSessionId(sanitized), true);

    const emptySanitized = sanitizeSessionId('');
    assert.equal(isValidSessionId(emptySanitized), true);
  });

  // 5. Unit Tests: validateSessionId (Strict API Enforcement)
  await t.test('5. validateSessionId returns structured contract result for API routes', () => {
    const valid = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
    const validRes = validateSessionId(valid);
    assert.equal(validRes.isValid, true);
    assert.equal(validRes.sessionId, valid);

    const emptyRes = validateSessionId('   ');
    assert.equal(emptyRes.isValid, false);
    assert.equal(emptyRes.code, 'MISSING_SESSION_ID');

    const invalidRes = validateSessionId('invalid-session-id');
    assert.equal(invalidRes.isValid, false);
    assert.equal(invalidRes.code, 'INVALID_SESSION_ID');
    assert.ok(invalidRes.error.includes('UUID v4'));
  });
});
