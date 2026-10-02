import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

import {
  calculateChatRetrievalZeroResultMetrics,
  calculateChatLatencyMetrics,
  calculateChatProviderFallbackMetrics,
} from '../src/lib/chatAuditLatencyHelper.ts';

const root = path.resolve(import.meta.dirname, '../..');
const frontendRoot = path.join(root, 'frontend');
const require = createRequire(import.meta.url);
const Module = require('node:module');
const ts = require('typescript');
const { NextRequest } = require('next/server');

const recentChatLogs = [
  { latency_ms: 100, provider_fallback: false, retrieval_zero_result: false },
  { latency_ms: 120, provider_fallback: false, retrieval_zero_result: false },
  { latency_ms: 150, provider_fallback: true,  retrieval_zero_result: true },
  { latency_ms: 200, provider_fallback: null,  retrieval_zero_result: null }, // Out of scope / guard rejection
];

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

test('retrieval zero-result rate increases when zero-result fixture is introduced', () => {
  // Baseline: 4 successful retrievals (no zero-result)
  const baseline = [false, false, false, false];
  const initialMetrics = calculateChatRetrievalZeroResultMetrics(baseline);
  assert.deepEqual(initialMetrics, {
    zeroResultCount: 0,
    zeroResultRatePercent: 0,
    retrievalSampleCount: 4,
  });

  // Adding 1 zero-result event increases the zero-result rate to 20%
  const withOneZeroResult = [...baseline, true];
  const updatedMetrics = calculateChatRetrievalZeroResultMetrics(withOneZeroResult);
  assert.deepEqual(updatedMetrics, {
    zeroResultCount: 1,
    zeroResultRatePercent: 20,
    retrievalSampleCount: 5,
  });
  assert.ok((updatedMetrics.zeroResultRatePercent ?? 0) > (initialMetrics.zeroResultRatePercent ?? 0));

  // Adding 3 more zero-result events increases the rate to 50% (4/8)
  const withMultipleZeroResults = [...withOneZeroResult, true, true, true];
  const highMetrics = calculateChatRetrievalZeroResultMetrics(withMultipleZeroResults);
  assert.deepEqual(highMetrics, {
    zeroResultCount: 4,
    zeroResultRatePercent: 50,
    retrievalSampleCount: 8,
  });
});

test('retrieval zero-result rate excludes non-boolean and unclassified rows', () => {
  assert.deepEqual(
    calculateChatRetrievalZeroResultMetrics([true, false, null, undefined, 'true', 0, 1]),
    {
      zeroResultCount: 1,
      zeroResultRatePercent: 50,
      retrievalSampleCount: 2,
    }
  );

  assert.deepEqual(
    calculateChatRetrievalZeroResultMetrics([null, undefined, '']),
    {
      zeroResultCount: 0,
      zeroResultRatePercent: null,
      retrievalSampleCount: 0,
    }
  );
});

test('empty sample set yields null zero-result rate', () => {
  assert.deepEqual(calculateChatRetrievalZeroResultMetrics([]), {
    zeroResultCount: 0,
    zeroResultRatePercent: null,
    retrievalSampleCount: 0,
  });
});

test('authenticated admin metrics API returns zero-result rate from recent chat logs', async () => {
  const response = await getAdminMetrics(new NextRequest('http://localhost/api/v1/admin/ai-metrics'));
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.success, true);
  // From recentChatLogs: 1 true out of 3 boolean samples (false, false, true) = 33.3%
  assert.deepEqual(body.observability.zeroResultCount, 1);
  assert.deepEqual(body.observability.zeroResultRatePercent, 33.3);
  assert.deepEqual(body.observability.retrievalSampleCount, 3);
});

test('admin dashboard exposes zero-result rate and count metrics', () => {
  const page = fs.readFileSync(path.join(root, 'frontend/src/app/admin/ai-metrics/page.tsx'), 'utf8');

  assert.match(page, /observability\.zeroResultRatePercent/);
  assert.match(page, /observability\.zeroResultCount/);
  assert.match(page, /observability\.retrievalSampleCount/);
});

test('chat routes and migration persist retrieval_zero_result correctly', () => {
  const queryRoute = fs.readFileSync(path.join(root, 'frontend/src/app/api/v1/chat/query/route.ts'), 'utf8');
  const streamRoute = fs.readFileSync(path.join(root, 'frontend/src/app/api/v1/chat/stream/route.ts'), 'utf8');
  const migration = fs.readFileSync(
    path.join(root, 'supabase/migrations/20261002_p05_018_chat_logs_retrieval_zero_result.sql'),
    'utf8'
  );

  assert.match(queryRoute, /retrieval_zero_result:\s*places\.length\s*===\s*0/);
  assert.match(streamRoute, /retrieval_zero_result:\s*ragResult\.places\.length\s*===\s*0/);
  assert.match(migration, /ADD COLUMN IF NOT EXISTS retrieval_zero_result BOOLEAN/);
});
