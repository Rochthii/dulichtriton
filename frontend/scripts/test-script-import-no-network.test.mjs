/**
 * frontend/scripts/test-script-import-no-network.test.mjs
 * 
 * Automated Verification Suite for P05-009:
 * "Tách network call khỏi import-time của một test script (Proof: test import không gọi mạng)"
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..', '..');

test('P05-009 Assertion 1: Python test suite proves import produces zero network / DB calls', () => {
  const pyTest = spawnSync('python', ['-m', 'unittest', 'tests/test_script_import_no_network.py'], {
    cwd: REPO_ROOT,
    encoding: 'utf-8',
    env: { ...process.env, PYTHONUNBUFFERED: '1' },
  });

  assert.equal(
    pyTest.status,
    0,
    `Python unittest suite must pass with exit code 0. Stderr: ${pyTest.stderr}\nStdout: ${pyTest.stdout}`
  );
  assert.ok(
    pyTest.stderr.includes('Ran 5 tests') || pyTest.stdout.includes('Ran 5 tests'),
    'All 5 assertions in test_script_import_no_network.py must run'
  );
  assert.ok(
    pyTest.stderr.includes('OK') || pyTest.stdout.includes('OK'),
    'Python unittest suite must finish with status OK'
  );
});

test('P05-009 Assertion 2: Static source invariant - scripts/test_embedding.py has zero top-level network calls', () => {
  const filePath = path.join(REPO_ROOT, 'scripts', 'test_embedding.py');
  const content = fs.readFileSync(filePath, 'utf-8');

  // Verify functions exist
  assert.ok(content.includes('def build_embedding_request('), 'build_embedding_request function must be defined');
  assert.ok(content.includes('def test_gemini_embedding('), 'test_gemini_embedding function must be defined');
  assert.ok(content.includes('__name__') && content.includes('__main__'), "Must have __main__ entrypoint guard");

  // Verify top-level code does not execute urlopen directly outside def/main block
  const lines = content.split('\n');
  let insideDefOrMain = false;
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line.startsWith('def ') || line.startsWith("if __name__ == '__main__':") || line.startsWith('class ')) {
      insideDefOrMain = true;
    }
    if (!insideDefOrMain) {
      assert.ok(
        !line.startsWith('urllib.request.urlopen(') && !line.startsWith('with urllib.request.urlopen'),
        `Forbidden top-level network call detected: ${line}`
      );
    }
  }
});

test('P05-009 Assertion 3: Static source invariant - scripts/test_page_queries.py has zero top-level DB connections', () => {
  const filePath = path.join(REPO_ROOT, 'scripts', 'test_page_queries.py');
  const content = fs.readFileSync(filePath, 'utf-8');

  // Verify function exists
  assert.ok(content.includes('def run_page_queries_test('), 'run_page_queries_test function must be defined');
  assert.ok(content.includes('__name__') && content.includes('__main__'), "Must have __main__ entrypoint guard");

  // Verify top-level code does not connect psycopg2 directly outside def/main block
  const lines = content.split('\n');
  let insideDefOrMain = false;
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line.startsWith('def ') || line.startsWith("if __name__ == '__main__':") || line.startsWith('class ')) {
      insideDefOrMain = true;
    }
    if (!insideDefOrMain) {
      assert.ok(
        !line.startsWith('conn = psycopg2.connect(') && !line.startsWith('psycopg2.connect('),
        `Forbidden top-level DB connection detected: ${line}`
      );
    }
  }
});

test('P05-009 Assertion 4: Subprocess import isolation - importing scripts does not throw or hang', () => {
  const pyCheck = spawnSync(
    'python',
    ['-c', 'import scripts.test_embedding ; import scripts.test_page_queries ; print("SAFE_IMPORT_OK")'],
    {
      cwd: REPO_ROOT,
      encoding: 'utf-8',
      timeout: 5000, // Must complete well within 5 seconds without network hangs
    }
  );

  assert.equal(pyCheck.status, 0, `Importing modules in subprocess must exit cleanly. Error: ${pyCheck.stderr}`);
  assert.ok(pyCheck.stdout.includes('SAFE_IMPORT_OK'), 'Output must confirm safe import completion without side-effects');
});

test('P05-009 Assertion 5: Dependency injection works offline without API keys or live database', () => {
  const pyDiCheck = spawnSync(
    'python',
    ['-c', `
import scripts.test_embedding as emb
from unittest.mock import MagicMock
mock_res = MagicMock()
mock_res.read.return_value = b'{"embedding": {"values": [0.42]}}'
mock_res.__enter__.return_value = mock_res
mock_caller = MagicMock(return_value=mock_res)
res = emb.test_gemini_embedding(api_key="MOCK_KEY", urlopen_fn=mock_caller)
assert res["success"] is True
assert res["embedding"] == [0.42]
print("DI_OFFLINE_VERIFIED")
`],
    {
      cwd: REPO_ROOT,
      encoding: 'utf-8',
      timeout: 5000,
    }
  );

  assert.equal(pyDiCheck.status, 0, `Dependency injection test must exit with code 0. Stderr: ${pyDiCheck.stderr}`);
  assert.ok(pyDiCheck.stdout.includes('DI_OFFLINE_VERIFIED'), 'DI verification must pass cleanly');
});
