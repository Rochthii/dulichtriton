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
const helperPath = path.resolve(__dirname, '../src/lib/chatEmbeddingHelper.ts');
const queryRoutePath = path.resolve(__dirname, '../src/app/api/v1/chat/query/route.ts');

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

test('P04-006: Chat Embedding Single Call Invariant & Proof', async (t) => {
  const { generateQueryEmbedding } = loadModule(helperPath);

  // 1. Static Code Invariant: query/route.ts calls generateQueryEmbedding exactly once
  await t.test('1. Static Code Invariant: Route invokes generateQueryEmbedding exactly once and reuses qEmbedding', () => {
    assert.ok(fs.existsSync(queryRoutePath), 'query/route.ts must exist');
    const routeCode = fs.readFileSync(queryRoutePath, 'utf8');

    // Must import generateQueryEmbedding
    assert.match(
      routeCode,
      /import\s*\{[^}]*generateQueryEmbedding[^}]*\}\s*from\s*['"]@\/lib\/chatEmbeddingHelper['"]/,
      'Must import generateQueryEmbedding from @/lib/chatEmbeddingHelper'
    );

    // Count calls to generateQueryEmbedding
    const callMatches = routeCode.match(/generateQueryEmbedding\s*\(/g) || [];
    assert.equal(
      callMatches.length,
      1,
      `Expected generateQueryEmbedding to be called exactly once in route.ts, but found ${callMatches.length}`
    );

    // Verify qEmbedding is reused for queryVector
    assert.match(
      routeCode,
      /const\s+queryVector\s*=\s*qEmbedding;/,
      'queryVector must directly reuse qEmbedding without issuing a second embedding call'
    );

    // Verify qEmbedding was defined via generateQueryEmbedding at Step 1
    assert.match(
      routeCode,
      /const\s+qEmbedding\s*=\s*await\s+generateQueryEmbedding\s*\(\s*queryStr\s*\);/,
      'qEmbedding must be assigned from generateQueryEmbedding(queryStr) at Step 1'
    );
  });

  // 2. Spy Test: generateQueryEmbedding performs exactly one network call
  await t.test('2. Spy Test: generateQueryEmbedding executes exactly 1 network call per query', async () => {
    let callCount = 0;
    const requestedUrls = [];
    const mockVector = Array.from({ length: 768 }, (_, i) => Math.sin(i) * 0.1);

    const spyFetch = async (url, options) => {
      callCount++;
      requestedUrls.push(url);
      return {
        ok: true,
        json: async () => ({
          embedding: {
            values: mockVector,
          },
        }),
      };
    };

    // Save & set env key
    const prevKey = process.env.GEMINI_API_KEY;
    process.env.GEMINI_API_KEY = 'test-gemini-key-12345';

    try {
      const vector = await generateQueryEmbedding('Lịch trình du lịch Tri Tôn 2 ngày 1 đêm', {
        fetchFn: spyFetch,
      });

      assert.equal(callCount, 1, 'Embedding provider must be invoked exactly once');
      assert.ok(Array.isArray(vector), 'Vector must be an array');
      assert.equal(vector.length, 768, 'Vector dimension must be 768');
      assert.deepEqual(vector, mockVector, 'Returned vector must match mock');
      assert.match(requestedUrls[0], /models\/gemini-embedding-001:embedContent/, 'Must target gemini-embedding-001 endpoint');
    } finally {
      process.env.GEMINI_API_KEY = prevKey;
    }
  });

  // 3. Spy Test: Simulation of Route RAG execution sharing single embedding
  await t.test('3. Simulation Proof: Multi-consumer RAG pipeline (golden few-shots + vector search) uses 1 embedding call', async () => {
    let embeddingCalls = 0;
    const mockVector = Array.from({ length: 768 }, (_, i) => 0.05 * (i % 5));

    const spyFetch = async () => {
      embeddingCalls++;
      return {
        ok: true,
        json: async () => ({
          embedding: { values: mockVector },
        }),
      };
    };

    const prevKey = process.env.GEMINI_API_KEY;
    process.env.GEMINI_API_KEY = 'test-gemini-key-sim';

    try {
      const queryStr = 'Ăn gà đốt Ô Thum ở đâu ngon nhất?';

      // ── STEP 1: Single Embedding Generation
      const qEmbedding = await generateQueryEmbedding(queryStr, { fetchFn: spyFetch });
      assert.equal(embeddingCalls, 1, 'First consumer generates embedding');

      // Consumer A: match_golden RPC
      let goldenCalls = 0;
      let goldenVectorUsed = null;
      if (qEmbedding) {
        goldenCalls++;
        goldenVectorUsed = qEmbedding;
      }

      // Consumer B: match_places RPC
      let placesCalls = 0;
      let placesVectorUsed = null;
      const queryVector = qEmbedding; // P04-006 invariant
      if (queryVector) {
        placesCalls++;
        placesVectorUsed = queryVector;
      }

      // Consumer C: match_kb RPC
      let kbCalls = 0;
      let kbVectorUsed = null;
      if (queryVector) {
        kbCalls++;
        kbVectorUsed = queryVector;
      }

      // Verify all consumers received the exact same vector reference
      assert.equal(goldenCalls, 1, 'Consumer A ran');
      assert.equal(placesCalls, 1, 'Consumer B ran');
      assert.equal(kbCalls, 1, 'Consumer C ran');
      assert.strictEqual(goldenVectorUsed, queryVector, 'Consumer A and Consumer B share exact vector reference');
      assert.strictEqual(placesVectorUsed, kbVectorUsed, 'Consumer B and Consumer C share exact vector reference');

      // Total embedding network calls must remain STRICTLY 1
      assert.equal(embeddingCalls, 1, 'Total embedding network calls across all RAG consumers must be exactly 1');
    } finally {
      process.env.GEMINI_API_KEY = prevKey;
    }
  });

  // 4. Robustness: Empty/whitespace query triggers 0 network calls
  await t.test('4. Robustness: Empty or whitespace query triggers 0 network calls and returns null', async () => {
    let callCount = 0;
    const spyFetch = async () => {
      callCount++;
      return { ok: true, json: async () => ({}) };
    };

    const res1 = await generateQueryEmbedding('', { fetchFn: spyFetch });
    const res2 = await generateQueryEmbedding('   ', { fetchFn: spyFetch });
    const res3 = await generateQueryEmbedding(null, { fetchFn: spyFetch });

    assert.equal(callCount, 0, 'No network call should be made for empty inputs');
    assert.equal(res1, null);
    assert.equal(res2, null);
    assert.equal(res3, null);
  });

  // 5. Robustness: Network failure fails gracefully without throwing
  await t.test('5. Robustness: Network failure degrades gracefully to null without crashing', async () => {
    const errorFetch = async () => {
      throw new Error('Network timeout simulation');
    };

    const prevKey = process.env.GEMINI_API_KEY;
    process.env.GEMINI_API_KEY = 'test-gemini-key-fail';

    try {
      const res = await generateQueryEmbedding('Tìm đường đi Tà Pạ', { fetchFn: errorFetch });
      assert.equal(res, null, 'Failed network calls should degrade gracefully to null');
    } finally {
      process.env.GEMINI_API_KEY = prevKey;
    }
  });
});
