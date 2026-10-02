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

// Isolate the integration proof from any configured shared Redis service.
for (const key of ['UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN', 'REDIS_REST_URL', 'REDIS_REST_TOKEN']) {
  delete process.env[key];
}

const originalResolveFilename = Module._resolveFilename;
Module._resolveFilename = function (request, parent, ...rest) {
  if (request.startsWith('@/')) {
    request = path.join(frontendRoot, 'src', request.slice(2));
  }
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

async function send(pathname, ip) {
  const request = new NextRequest(`http://localhost${pathname}`, {
    method: 'GET',
    headers: {
      'x-forwarded-for': ip,
      'user-agent': 'P05-014-rate-limit-test',
    },
  });
  return middleware(request);
}

async function consume(pathname, ip, count) {
  const responses = [];
  for (let index = 0; index < count; index += 1) {
    responses.push(await send(pathname, ip));
  }
  return responses;
}

test('chat query quota returns a standard uncached 429 with Retry-After', async () => {
  const responses = await consume('/api/v1/chat/query', '198.51.100.1', 21);
  for (const response of responses.slice(0, 20)) assert.notEqual(response.status, 429);

  const blocked = responses[20];
  assert.equal(blocked.status, 429);
  assert.match(blocked.headers.get('content-type') || '', /application\/json/i);
  assert.match(blocked.headers.get('retry-after') || '', /^\d+$/);
  assert.equal(blocked.headers.get('cache-control'), 'no-store');
  assert.equal(blocked.headers.get('x-ratelimit-limit'), '20');
  assert.equal(blocked.headers.get('x-ratelimit-remaining'), '0');
  assert.match((await blocked.json()).message, /quá nhiều câu hỏi/i);
});

test('query and stream share the same per-IP chat quota', async () => {
  await consume('/api/v1/chat/query', '198.51.100.2', 10);
  await consume('/api/v1/chat/stream', '198.51.100.2', 10);
  assert.equal((await send('/api/v1/chat/stream', '198.51.100.2')).status, 429);
});

test('trailing slash cannot bypass the chat quota', async () => {
  await consume('/api/v1/chat/query', '198.51.100.3', 20);
  const blocked = await send('/api/v1/chat/query/', '198.51.100.3');
  assert.equal(blocked.status, 429);
});

test('chat utility routes stay outside the chat query quota', async () => {
  await consume('/api/v1/chat/query', '198.51.100.4', 20);
  for (const pathname of [
    '/api/v1/chat/session',
    '/api/v1/chat/ping',
    '/api/v1/chat/itinerary',
  ]) {
    assert.notEqual((await send(pathname, '198.51.100.4')).status, 429, pathname);
  }
});
