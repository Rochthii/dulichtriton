import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const Module = require('node:module');
const ts = require('typescript');
const { NextRequest } = require('next/server');

const root = path.resolve(import.meta.dirname, '../..');
const frontendRoot = path.join(root, 'frontend');

for (const key of ['UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN', 'REDIS_REST_URL', 'REDIS_REST_TOKEN']) {
  delete process.env[key];
}
process.env.ADMIN_MUTATIONS_ENABLED = 'true';

const originalResolveFilename = Module._resolveFilename;
Module._resolveFilename = function (request, parent, ...rest) {
  if (request.startsWith('@/')) request = path.join(frontendRoot, 'src', request.slice(2));
  return originalResolveFilename.call(this, request, parent, ...rest);
};

require.extensions['.ts'] = (loadedModule, filename) => {
  const source = fs.readFileSync(filename, 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  });
  loadedModule._compile(outputText, filename);
};

const { middleware } = require(path.join(frontendRoot, 'src/middleware.ts'));

async function send(pathname, ip, method = 'POST') {
  const request = new NextRequest(`http://localhost${pathname}`, {
    method,
    headers: {
      'x-forwarded-for': ip,
      'user-agent': 'P05-015-rate-limit-test',
    },
  });
  return middleware(request);
}

test('admin write methods share a 30/60 quota and return a standard 429', async () => {
  const methods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  for (let index = 0; index < 30; index += 1) {
    const response = await send('/api/v1/admin/places', '198.51.100.11', methods[index % methods.length]);
    assert.notEqual(response.status, 429, `admin mutation ${index + 1} should be allowed`);
  }

  const blocked = await send('/api/v1/admin/places', '198.51.100.11');
  assert.equal(blocked.status, 429);
  assert.match(blocked.headers.get('content-type') || '', /application\/json/i);
  assert.match(blocked.headers.get('retry-after') || '', /^\d+$/);
  assert.equal(blocked.headers.get('cache-control'), 'no-store');
  assert.equal(blocked.headers.get('x-ratelimit-limit'), '30');
  assert.equal(blocked.headers.get('x-ratelimit-remaining'), '0');
  assert.match((await blocked.json()).message, /quá nhiều thao tác quản trị/i);
});

test('admin reads, auth, and public APIs remain outside the admin mutation bucket', async () => {
  for (let index = 0; index < 30; index += 1) {
    await send('/api/v1/admin/places', '198.51.100.12', 'PATCH');
  }

  assert.notEqual((await send('/api/v1/admin/places', '198.51.100.12', 'GET')).status, 429);
  assert.notEqual((await send('/api/v1/admin/auth/logout', '198.51.100.12')).status, 429);
  assert.notEqual((await send('/api/v1/places', '198.51.100.12')).status, 429);

  for (let index = 0; index < 5; index += 1) {
    assert.notEqual((await send('/api/v1/admin/auth/login', '198.51.100.13')).status, 429);
  }
  assert.equal((await send('/api/v1/admin/auth/login', '198.51.100.13')).status, 429);
});

test('the existing admin mutation kill switch still returns 503 before rate limiting', async () => {
  process.env.ADMIN_MUTATIONS_ENABLED = 'false';
  const disabled = await send('/api/v1/admin/places', '198.51.100.14');
  assert.equal(disabled.status, 503);

  process.env.ADMIN_MUTATIONS_ENABLED = 'true';
  for (let index = 0; index < 30; index += 1) {
    assert.notEqual((await send('/api/v1/admin/places', '198.51.100.14')).status, 429);
  }
  assert.equal((await send('/api/v1/admin/places', '198.51.100.14')).status, 429);
});
