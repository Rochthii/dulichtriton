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
const clientComponentPath = path.resolve(__dirname, '../src/components/ChatbotPageClient.tsx');
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

test('P04-003: ChatbotPageClient Session Identifier Contract Compliance', async (t) => {
  const {
    isValidSessionId,
    generateSessionId,
  } = loadModule(contractModulePath);

  // 1. Static Code Invariant
  await t.test('1. Static Code Invariant: Elimination of Math.random and mandatory UUID v4 enforcement', () => {
    assert.ok(fs.existsSync(clientComponentPath), 'ChatbotPageClient.tsx must exist');
    const content = fs.readFileSync(clientComponentPath, 'utf8');

    // Must NOT contain Math.random()
    assert.equal(
      content.includes('Math.random'),
      false,
      'ChatbotPageClient.tsx MUST NOT contain Math.random()'
    );

    // Must import from sessionIdentifierContract
    assert.ok(
      content.includes('isValidSessionId'),
      'ChatbotPageClient.tsx must import and use isValidSessionId'
    );
    assert.ok(
      content.includes('generateSessionId'),
      'ChatbotPageClient.tsx must import and use generateSessionId'
    );

    // Must check stored session validity before reusing
    assert.ok(
      content.includes('stored && isValidSessionId(stored)'),
      'ChatbotPageClient.tsx must validate stored session using isValidSessionId'
    );
  });

  // 2. Behavioral Simulation: Fresh Visitor (Empty localStorage)
  await t.test('2. Fresh Visitor: Generates valid UUID v4 session and stores in localStorage', () => {
    const store = new Map();
    const mockLocalStorage = {
      getItem: (k) => store.get(k) || null,
      setItem: (k, v) => store.set(k, String(v)),
    };

    const KEY = 'triton_chat_page_session_id';
    const stored = mockLocalStorage.getItem(KEY);

    let currentSessionId = '';
    if (stored && isValidSessionId(stored)) {
      currentSessionId = stored;
    } else {
      const newId = generateSessionId();
      mockLocalStorage.setItem(KEY, newId);
      currentSessionId = newId;
    }

    assert.ok(currentSessionId, 'Session ID must be generated');
    assert.equal(isValidSessionId(currentSessionId), true, 'Session ID must be a valid UUID v4');
    assert.equal(mockLocalStorage.getItem(KEY), currentSessionId, 'Generated UUID v4 must be persisted in localStorage');
  });

  // 3. Behavioral Simulation: Legacy Migration (localStorage contains old Math.random() session)
  await t.test('3. Legacy Migration: Detects invalid legacy session, migrates to fresh UUID v4', () => {
    const store = new Map();
    const KEY = 'triton_chat_page_session_id';
    // Seed with old legacy format
    store.set(KEY, 'page_session_k9x2m4p');

    const mockLocalStorage = {
      getItem: (k) => store.get(k) || null,
      setItem: (k, v) => store.set(k, String(v)),
    };

    const stored = mockLocalStorage.getItem(KEY);
    assert.equal(isValidSessionId(stored), false, 'Legacy session must be detected as invalid');

    let currentSessionId = '';
    if (stored && isValidSessionId(stored)) {
      currentSessionId = stored;
    } else {
      const newId = generateSessionId();
      mockLocalStorage.setItem(KEY, newId);
      currentSessionId = newId;
    }

    assert.notEqual(currentSessionId, 'page_session_k9x2m4p', 'Legacy session must not be kept');
    assert.equal(isValidSessionId(currentSessionId), true, 'Replaced session must be valid UUID v4');
    assert.equal(mockLocalStorage.getItem(KEY), currentSessionId, 'New UUID v4 must overwrite legacy key in localStorage');
  });

  // 4. Behavioral Simulation: Returning Visitor (localStorage contains valid UUID v4)
  await t.test('4. Returning Visitor: Reuses existing valid UUID v4 session without regeneration', () => {
    const store = new Map();
    const KEY = 'triton_chat_page_session_id';
    const existingValidUuid = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
    store.set(KEY, existingValidUuid);

    const mockLocalStorage = {
      getItem: (k) => store.get(k) || null,
      setItem: (k, v) => store.set(k, String(v)),
    };

    const stored = mockLocalStorage.getItem(KEY);
    assert.equal(isValidSessionId(stored), true);

    let currentSessionId = '';
    let generatedNew = false;
    if (stored && isValidSessionId(stored)) {
      currentSessionId = stored;
    } else {
      const newId = generateSessionId();
      mockLocalStorage.setItem(KEY, newId);
      currentSessionId = newId;
      generatedNew = true;
    }

    assert.equal(generatedNew, false, 'Must not generate new session when valid UUID v4 exists');
    assert.equal(currentSessionId, existingValidUuid, 'Must retain existing valid UUID v4');
    assert.equal(mockLocalStorage.getItem(KEY), existingValidUuid);
  });
});
