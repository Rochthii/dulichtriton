import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const pagePath = fileURLToPath(new URL('../src/app/admin/login/page.tsx', import.meta.url));

test('admin login page preserves raw password bytes without trimming', () => {
  const source = readFileSync(pagePath, 'utf8');

  // 1. Assert no password.trim() call exists anywhere in the file
  assert.equal(
    source.includes('password.trim()'),
    false,
    'admin login page must not call password.trim() anywhere',
  );

  // 2. Assert submission payload passes raw password
  assert.ok(
    /body:\s*JSON\.stringify\(\{\s*email:\s*email\.trim\(\),\s*password\s*\}\)/.test(source),
    'admin login page must serialize raw password in fetch body',
  );

  // 3. Assert guard checks !password instead of !password.trim()
  assert.ok(
    /if\s*\(!email\.trim\(\)\s*\|\|\s*!password\s*\|\|\s*isLoading\)\s*return;/.test(source),
    'admin login page must guard against empty password without trimming spaces',
  );

  // 4. Assert functional byte fidelity simulation
  const simulatePayload = (email, password) => {
    if (!email.trim() || !password) return null;
    return JSON.stringify({ email: email.trim(), password });
  };

  const samplePasswordWithWhitespace = '  P@ssw0rd With Spaces!  ';
  const sampleEmail = '  Admin@TriTon.Gov.Vn  ';

  const serialized = simulatePayload(sampleEmail, samplePasswordWithWhitespace);
  assert.ok(serialized, 'Payload should not be null');

  const parsed = JSON.parse(serialized);
  assert.equal(parsed.email, 'Admin@TriTon.Gov.Vn');
  assert.equal(parsed.password, samplePasswordWithWhitespace);
  assert.equal(parsed.password.startsWith('  '), true);
  assert.equal(parsed.password.endsWith('  '), true);
  assert.equal(parsed.password.length, samplePasswordWithWhitespace.length);
});
