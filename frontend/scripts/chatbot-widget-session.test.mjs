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
const widgetComponentPath = path.resolve(__dirname, '../src/components/ChatbotWidget.tsx');
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

test('P04-004: ChatbotWidget Session Identifier Contract Compliance', async (t) => {
  const {
    isValidSessionId,
    generateSessionId,
  } = loadModule(contractModulePath);

  // 1. Static Code Invariant
  await t.test('1. Static Code Invariant: Elimination of Math.random and mandatory UUID v4 enforcement', () => {
    assert.ok(fs.existsSync(widgetComponentPath), 'ChatbotWidget.tsx must exist');
    const content = fs.readFileSync(widgetComponentPath, 'utf8');

    // Must NOT contain Math.random()
    assert.equal(
      content.includes('Math.random'),
      false,
      'ChatbotWidget.tsx MUST NOT contain Math.random()'
    );

    // Must import from sessionIdentifierContract
    assert.ok(
      content.includes('isValidSessionId'),
      'ChatbotWidget.tsx must import and use isValidSessionId'
    );
    assert.ok(
      content.includes('generateSessionId'),
      'ChatbotWidget.tsx must import and use generateSessionId'
    );

    // Must check stored session validity before reusing
    assert.ok(
      content.includes('stored && isValidSessionId(stored)'),
      'ChatbotWidget.tsx must validate stored session using isValidSessionId'
    );
  });

  // 2. Behavioral Simulation: Fresh Visitor (Empty localStorage)
  await t.test('2. Fresh Visitor: Generates valid UUID v4 session and stores in localStorage', () => {
    const store = new Map();
    const mockLocalStorage = {
      getItem: (k) => store.get(k) || null,
      setItem: (k, v) => store.set(k, String(v)),
    };

    const KEY = 'triton_widget_session_id';
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
    const KEY = 'triton_widget_session_id';
    // Seed with old legacy format
    store.set(KEY, 'session_k9x2m4p');

    const mockLocalStorage = {
      getItem: (k) => store.get(k) || null,
      setItem: (k, v) => store.set(k, String(v)),
    };

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
    assert.notEqual(currentSessionId, 'session_k9x2m4p', 'Old legacy session must be abandoned');
    assert.equal(isValidSessionId(currentSessionId), true, 'Migrated session ID must be valid UUID v4');
    assert.equal(mockLocalStorage.getItem(KEY), currentSessionId, 'New UUID v4 must overwrite legacy session in localStorage');
  });

  // 4. Behavioral Simulation: Valid Existing Session
  await t.test('4. Existing Valid Session: Reuses valid UUID v4 session without regeneration', () => {
    const store = new Map();
    const KEY = 'triton_widget_session_id';
    const existingValidUuid = '7d2d3a95-5cb2-4682-9382-73699bcf82f1';
    store.set(KEY, existingValidUuid);

    const mockLocalStorage = {
      getItem: (k) => store.get(k) || null,
      setItem: (k, v) => store.set(k, String(v)),
    };

    const stored = mockLocalStorage.getItem(KEY);

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

    assert.equal(generatedNew, false, 'Must NOT generate a new session when valid UUID v4 is stored');
    assert.equal(currentSessionId, existingValidUuid, 'Must reuse the exact existing UUID v4 session');
  });

  // 5. Behavioral Simulation: Malformed/Tampered Session Protection
  await t.test('5. Malformed Session Protection: Defends against whitespace, null, or invalid shapes', () => {
    const invalidInputs = [
      '',
      '   ',
      'null',
      'undefined',
      '12345',
      '7d2d3a95-5cb2-3682-9382-73699bcf82f1', // UUID v3
      '7d2d3a95-5cb2-5682-9382-73699bcf82f1', // UUID v5
      '7d2d3a95-5cb2-4682-c382-73699bcf82f1', // variant non-RFC4122
      'session_random_string_from_previous_build',
      '<script>alert(1)</script>',
    ];

    for (const badInput of invalidInputs) {
      const store = new Map();
      const KEY = 'triton_widget_session_id';
      store.set(KEY, badInput);

      const mockLocalStorage = {
        getItem: (k) => store.get(k) || null,
        setItem: (k, v) => store.set(k, String(v)),
      };

      const stored = mockLocalStorage.getItem(KEY);

      let currentSessionId = '';
      if (stored && isValidSessionId(stored)) {
        currentSessionId = stored;
      } else {
        const newId = generateSessionId();
        mockLocalStorage.setItem(KEY, newId);
        currentSessionId = newId;
      }

      assert.equal(isValidSessionId(currentSessionId), true, `Must replace invalid session "${badInput}" with valid UUID v4`);
      assert.notEqual(currentSessionId, badInput, `Session must differ from invalid input "${badInput}"`);
      assert.equal(mockLocalStorage.getItem(KEY), currentSessionId, 'Clean UUID v4 must be saved to storage');
    }
  });
});
