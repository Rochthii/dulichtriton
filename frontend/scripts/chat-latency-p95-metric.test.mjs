import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

import { calculateChatLatencyMetrics, calculateChatProviderFallbackMetrics } from '../src/lib/chatAuditLatencyHelper.ts';

const root = path.resolve(import.meta.dirname, '../..');
const frontendRoot = path.join(root, 'frontend');
const require = createRequire(import.meta.url);
const Module = require('node:module');
const ts = require('typescript');
const { NextRequest } = require('next/server');

const recentChatLogs = [10, 20, 30, 40, 50, 60, 80, 100, 200, 300].map((latency_ms, index) => ({
  latency_ms,
  provider_fallback: index === 0 ? true : index === 1 ? false : null,
}));
const supabaseMock = {
  from(table) {
    if (table === 'semantic_chat_cache') {
      return { select: async () => ({ data: [], count: 0 }) };
    }
    assert.equal(table, 'chat_logs');
    return {
      select() { return this; },
      order() { return this; },
      limit: async (count) => {
        assert.equal(count, 50);
        return { data: recentChatLogs };
      },
    };
  },
};

const mocks = new Map([
  ['@/lib/aiProvider', { getAIProviderMetrics: () => ({}) }],
  ['@/lib/adminSessionGuard', { verifyAdminSession: async () => ({ authenticated: true }) }],
  ['@/lib/serverSupabase', { requireSupabaseServerClient: () => supabaseMock }],
]);

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
const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (mocks.has(request)) return mocks.get(request);
  return originalLoad.call(this, request, parent, isMain);
};
const { GET: getAdminMetrics } = require(path.join(frontendRoot, 'src/app/api/v1/admin/ai-metrics/route.ts'));

test('p95 uses nearest-rank over valid persisted chat latency samples', () => {
  const samples = Array.from({ length: 100 }, (_, index) => index + 1);
  assert.deepEqual(calculateChatLatencyMetrics(samples), {
    avgLatencyMs: 51,
    p95LatencyMs: 95,
    latencySampleCount: 100,
  });
});

test('p95 excludes invalid values and preserves zero-millisecond samples', () => {
  assert.deepEqual(calculateChatLatencyMetrics([0, 10, -1, Number.NaN, Infinity, '20', null]), {
    avgLatencyMs: 5,
    p95LatencyMs: 10,
    latencySampleCount: 2,
  });
});

test('empty sample window returns an explicit missing p95', () => {
  assert.deepEqual(calculateChatLatencyMetrics([]), {
    avgLatencyMs: 0,
    p95LatencyMs: null,
    latencySampleCount: 0,
  });
});

test('provider fallback rate excludes unclassified and legacy rows', () => {
  assert.deepEqual(calculateChatProviderFallbackMetrics([true, false, null, undefined, 'true']), {
    fallbackCount: 1,
    fallbackRatePercent: 50,
    sampleCount: 2,
  });
  assert.deepEqual(calculateChatProviderFallbackMetrics([null, undefined]), {
    fallbackCount: 0,
    fallbackRatePercent: null,
    sampleCount: 0,
  });
});

test('authenticated admin metrics API returns p95 calculated from recent chat log rows', async () => {
  const response = await getAdminMetrics(new NextRequest('http://localhost/api/v1/admin/ai-metrics'));
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.deepEqual(body.observability, {
    avgLatencyMs: 89,
    p95LatencyMs: 300,
    latencySampleCount: 10,
    fallbackCount: 1,
    fallbackRatePercent: 50,
    sampleCount: 2,
    zeroResultCount: 0,
    zeroResultRatePercent: null,
    retrievalSampleCount: 0,
    uptimeStatus: '100% Operational',
  });
});

test('admin dashboard exposes p95 and the metric sample count', () => {
  const page = fs.readFileSync(path.join(root, 'frontend/src/app/admin/ai-metrics/page.tsx'), 'utf8');

  assert.match(page, /observability\.p95LatencyMs/);
  assert.match(page, /observability\.latencySampleCount/);
  assert.match(page, /observability\.fallbackRatePercent/);
  assert.match(page, /observability\.fallbackCount/);
});

test('chat routes persist provider fallback classification only for model-backed results', () => {
  const queryRoute = fs.readFileSync(path.join(root, 'frontend/src/app/api/v1/chat/query/route.ts'), 'utf8');
  const streamRoute = fs.readFileSync(path.join(root, 'frontend/src/app/api/v1/chat/stream/route.ts'), 'utf8');
  const migration = fs.readFileSync(path.join(root, 'supabase/migrations/20261002_p05_017_chat_logs_provider_fallback.sql'), 'utf8');

  assert.match(queryRoute, /provider_fallback:\s*providerFallback/);
  assert.match(streamRoute, /provider_fallback:\s*providerFallback/);
  assert.match(migration, /ADD COLUMN IF NOT EXISTS provider_fallback BOOLEAN/);
  assert.match(streamRoute, /providerFallback = true/);
  assert.match(queryRoute, /providerFallback = true/);
});
