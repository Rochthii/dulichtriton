import assert from 'node:assert/strict';
import fs from 'node:fs';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import test from 'node:test';
import typescript from 'typescript';

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));

// File Paths
const helperPath = path.resolve(__dirname, '../src/lib/chatAuditProviderHelper.ts');
const queryRoutePath = path.resolve(__dirname, '../src/app/api/v1/chat/query/route.ts');
const streamRoutePath = path.resolve(__dirname, '../src/app/api/v1/chat/stream/route.ts');
const aiProviderPath = path.resolve(__dirname, '../src/lib/aiProvider.ts');
const fallbackClientsPath = path.resolve(__dirname, '../src/lib/ai/fallbackClients.ts');
const geminiClientPath = path.resolve(__dirname, '../src/lib/ai/geminiClient.ts');
const migrationPath = path.resolve(__dirname, '../../supabase/migrations/20261002_p04_012_chat_logs_model_used.sql');

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

test('P04-012: Audit Log Real Model Tracking — Proof that Completed Requests Exactly Match Model ID', async (t) => {
  const {
    resolveAuditModel,
    isValidAuditModel,
    FORBIDDEN_AUDIT_MODELS,
    CANONICAL_OUT_OF_SCOPE_MODEL,
    CANONICAL_EMERGENCY_MODEL,
    CANONICAL_LOCAL_RAG_MODEL,
  } = loadModule(helperPath);

  await t.test('Assertion 1: Model ID Resolution Accuracy Proof (Matching Completed Request)', () => {
    // Test direct resolution with known model IDs
    const groqPrimary = resolveAuditModel('llama-3.3-70b-versatile');
    const groqFast = resolveAuditModel('llama-3.1-8b-instant');
    const geminiLite = resolveAuditModel('gemini-2.5-flash-lite');
    const geminiSearch = resolveAuditModel('gemini-flash-lite-latest');
    const openRouterGemma = resolveAuditModel('google/gemma-2-27b-it');
    const localRag = resolveAuditModel(undefined, 'local_expert_rag');
    const emergencySos = resolveAuditModel(undefined, 'emergency_instant_bypass');
    const outOfScope = resolveAuditModel(undefined, undefined, true);

    // Assert exact model ID matches completed request
    assert.equal(groqPrimary, 'llama-3.3-70b-versatile', 'Groq primary model ID must be exact');
    assert.equal(groqFast, 'llama-3.1-8b-instant', 'Groq fast model ID must be exact');
    assert.equal(geminiLite, 'gemini-2.5-flash-lite', 'Gemini lite model ID must be exact');
    assert.equal(geminiSearch, 'gemini-flash-lite-latest', 'Gemini search model ID must be exact');
    assert.equal(openRouterGemma, 'google/gemma-2-27b-it', 'OpenRouter model ID must be exact');
    assert.equal(localRag, CANONICAL_LOCAL_RAG_MODEL, 'Local RAG model ID must match canonical');
    assert.equal(emergencySos, CANONICAL_EMERGENCY_MODEL, 'Emergency model ID must match canonical');
    assert.equal(outOfScope, CANONICAL_OUT_OF_SCOPE_MODEL, 'Out of scope model ID must match canonical');
  });

  await t.test('Assertion 2: Negative Invariants & Forbidden Model Values Rejection Proof', () => {
    for (const forbidden of FORBIDDEN_AUDIT_MODELS) {
      assert.equal(
        isValidAuditModel(forbidden),
        false,
        `Forbidden model "${forbidden}" must not be valid`
      );
    }
    assert.equal(isValidAuditModel(null), false, 'null model must not be valid');
    assert.equal(isValidAuditModel(undefined), false, 'undefined model must not be valid');
    assert.equal(isValidAuditModel(999), false, 'number must not be valid');

    // Resolving forbidden values must safely fail-closed to canonical fallback
    const fallbackFromParallelRace = resolveAuditModel('parallel-race');
    assert.equal(fallbackFromParallelRace, CANONICAL_LOCAL_RAG_MODEL);

    const fallbackFromNone = resolveAuditModel('none');
    assert.equal(fallbackFromNone, CANONICAL_LOCAL_RAG_MODEL);

    const fallbackFromEmpty = resolveAuditModel('');
    assert.equal(fallbackFromEmpty, CANONICAL_LOCAL_RAG_MODEL);

    const fallbackFromDefault = resolveAuditModel('default');
    assert.equal(fallbackFromDefault, CANONICAL_LOCAL_RAG_MODEL);
  });

  await t.test('Assertion 3: Provider-to-Model Extraction Invariant (Fallback Extraction)', () => {
    // When rawModel is not explicitly provided, helper extracts it accurately from rawProvider
    assert.equal(
      resolveAuditModel(undefined, 'groq-key1-llama-3.3-70b-versatile'),
      'llama-3.3-70b-versatile'
    );
    assert.equal(
      resolveAuditModel(undefined, 'groq-key2-llama-3.1-8b-instant'),
      'llama-3.1-8b-instant'
    );
    assert.equal(
      resolveAuditModel(undefined, 'gemini-key1-gemini-2.5-flash-lite'),
      'gemini-2.5-flash-lite'
    );
    assert.equal(
      resolveAuditModel(undefined, 'gemini-key3-gemini-flash-lite-latest'),
      'gemini-flash-lite-latest'
    );
    assert.equal(
      resolveAuditModel(undefined, 'openrouter-google/gemma-2-27b-it'),
      'google/gemma-2-27b-it'
    );
    assert.equal(
      resolveAuditModel(undefined, 'emergency_instant_bypass'),
      'emergency-instant-rule-engine'
    );
    assert.equal(
      resolveAuditModel(undefined, 'local_expert_rag'),
      'local-expert-rag-v1'
    );
  });

  await t.test('Assertion 4: Static Code Invariant — Model Propagation in Query & Stream Routes', () => {
    const queryCode = fs.readFileSync(queryRoutePath, 'utf8');
    const streamCode = fs.readFileSync(streamRoutePath, 'utf8');

    // Query route checks
    assert.ok(
      queryCode.includes('model_used: actualModel'),
      'query/route.ts must pass model_used to logChatEvent'
    );
    assert.ok(
      queryCode.includes('model: actualModel'),
      'query/route.ts must return model in main JSON response'
    );
    assert.ok(
      queryCode.includes('model_used: oosModel'),
      'query/route.ts must log model_used on out-of-scope'
    );
    assert.ok(
      queryCode.includes('model: oosModel'),
      'query/route.ts must return model in out-of-scope response'
    );
    assert.ok(
      queryCode.includes('Promise<{ text: string; provider: string; model: string }>'),
      'generateAIResponse in query/route.ts must return text, provider, and model'
    );

    // Stream route checks
    assert.ok(
      streamCode.includes('model_used: resolveAuditModel(modelUsed, providerUsed)'),
      'stream/route.ts must log resolved model_used on completion'
    );
    assert.ok(
      streamCode.includes('model_used: oosModel'),
      'stream/route.ts must log oosModel on out-of-scope'
    );
    assert.ok(
      streamCode.includes('model_used?: string'),
      'logChatEvent in stream/route.ts must accept model_used'
    );
  });

  await t.test('Assertion 5: Static Code Invariant — Model Emission in aiProvider & Native Clients', () => {
    const aiProviderCode = fs.readFileSync(aiProviderPath, 'utf8');
    const fallbackClientsCode = fs.readFileSync(fallbackClientsPath, 'utf8');
    const geminiClientCode = fs.readFileSync(geminiClientPath, 'utf8');

    // aiProvider checks
    assert.ok(
      aiProviderCode.includes('model?: string'),
      'StreamOutputChunk in aiProvider.ts must have optional model field'
    );
    assert.ok(
      aiProviderCode.includes('model: resolvedModel'),
      'generateAIResponse in aiProvider.ts must return resolvedModel'
    );
    assert.ok(
      aiProviderCode.includes("model: 'emergency-instant-rule-engine'"),
      'aiProvider.ts must emit emergency-instant-rule-engine model on SOS'
    );
    assert.ok(
      aiProviderCode.includes("model: 'local-expert-rag-v1'"),
      'aiProvider.ts must emit local-expert-rag-v1 model on Local RAG'
    );

    // fallbackClients checks
    assert.ok(
      fallbackClientsCode.includes('model?: string'),
      'StreamChunk in fallbackClients.ts must have optional model field'
    );
    assert.ok(
      fallbackClientsCode.includes('model }'),
      'streamGroqNative and streamOpenRouterNative must yield model'
    );

    // geminiClient checks
    assert.ok(
      geminiClientCode.includes('model }'),
      'streamGeminiNative must yield model'
    );
  });

  await t.test('Assertion 6: Database Migration Invariant (public.chat_logs.model_used)', () => {
    assert.ok(fs.existsSync(migrationPath), 'Migration file 20261002_p04_012_chat_logs_model_used.sql must exist');
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');

    assert.ok(
      migrationSql.includes('ALTER TABLE public.chat_logs'),
      'Migration must alter public.chat_logs'
    );
    assert.ok(
      migrationSql.includes('ADD COLUMN IF NOT EXISTS model_used TEXT'),
      'Migration must add model_used TEXT column'
    );
    assert.ok(
      migrationSql.includes('CREATE INDEX IF NOT EXISTS chat_logs_model_idx'),
      'Migration must create index on model_used'
    );
  });

  await t.test('Assertion 7: End-to-End Simulation: Completed Request Model Concordance Proof', () => {
    // Simulation verifying that whatever model completes the request is faithfully recorded
    const testCases = [
      {
        description: 'Groq primary completion',
        completedModel: 'llama-3.3-70b-versatile',
        provider: 'groq-key1',
        isOutOfScope: false,
        expectedModelLogged: 'llama-3.3-70b-versatile',
      },
      {
        description: 'Groq fast failover completion',
        completedModel: 'llama-3.1-8b-instant',
        provider: 'groq-key2',
        isOutOfScope: false,
        expectedModelLogged: 'llama-3.1-8b-instant',
      },
      {
        description: 'Gemini lite failover completion',
        completedModel: 'gemini-2.5-flash-lite',
        provider: 'gemini-key1',
        isOutOfScope: false,
        expectedModelLogged: 'gemini-2.5-flash-lite',
      },
      {
        description: 'OpenRouter Gemma fallback completion',
        completedModel: 'google/gemma-2-27b-it',
        provider: 'openrouter',
        isOutOfScope: false,
        expectedModelLogged: 'google/gemma-2-27b-it',
      },
      {
        description: 'Local Expert RAG offline completion',
        completedModel: 'local-expert-rag-v1',
        provider: 'local_expert_rag',
        isOutOfScope: false,
        expectedModelLogged: 'local-expert-rag-v1',
      },
      {
        description: 'SOS emergency instant bypass',
        completedModel: 'emergency-instant-rule-engine',
        provider: 'emergency_instant_bypass',
        isOutOfScope: false,
        expectedModelLogged: 'emergency-instant-rule-engine',
      },
      {
        description: 'Out of scope geographical guard',
        completedModel: undefined,
        provider: undefined,
        isOutOfScope: true,
        expectedModelLogged: 'intent-out-of-scope-filter',
      },
    ];

    for (const tc of testCases) {
      const resolved = resolveAuditModel(tc.completedModel, tc.provider, tc.isOutOfScope);
      assert.equal(
        resolved,
        tc.expectedModelLogged,
        `For ${tc.description}, expected model_used "${tc.expectedModelLogged}", got "${resolved}"`
      );
      assert.ok(
        isValidAuditModel(resolved),
        `Resolved model "${resolved}" must be valid`
      );
    }
  });
});
