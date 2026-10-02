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

test('P04-011: Audit Log Real Provider Tracking — Proof that Groq, Gemini & Fallbacks Produce Distinct Values', async (t) => {
  const {
    resolveAuditProvider,
    classifyProviderFamily,
    isValidAuditProvider,
    FORBIDDEN_AUDIT_PROVIDERS,
    CANONICAL_OUT_OF_SCOPE_PROVIDER,
    CANONICAL_EMERGENCY_PROVIDER,
    CANONICAL_LOCAL_RAG_PROVIDER,
  } = loadModule(helperPath);

  await t.test('Assertion 1: Distinct Provider Resolution Proof (Groq, Gemini, OpenRouter, Local RAG, SOS, OOS)', () => {
    const groqProvider = resolveAuditProvider('groq-key1-llama-3.3-70b-versatile');
    const geminiProvider = resolveAuditProvider('gemini-key2-gemini-2.5-flash');
    const openrouterProvider = resolveAuditProvider('openrouter-meta-llama/llama-3.3-70b-instruct:free');
    const localRagProvider = resolveAuditProvider('local_expert_rag');
    const emergencyProvider = resolveAuditProvider('emergency_instant_bypass');
    const outOfScopeProvider = resolveAuditProvider(undefined, true);

    // Verify all resolved values are non-empty strings
    assert.ok(groqProvider, 'Groq provider must not be empty');
    assert.ok(geminiProvider, 'Gemini provider must not be empty');
    assert.ok(openrouterProvider, 'OpenRouter provider must not be empty');
    assert.ok(localRagProvider, 'Local RAG provider must not be empty');
    assert.ok(emergencyProvider, 'Emergency provider must not be empty');
    assert.ok(outOfScopeProvider, 'Out-of-scope provider must not be empty');

    // Proof: All 6 providers must have distinct values
    const distinctSet = new Set([
      groqProvider,
      geminiProvider,
      openrouterProvider,
      localRagProvider,
      emergencyProvider,
      outOfScopeProvider,
    ]);

    assert.equal(
      distinctSet.size,
      6,
      `Expected 6 distinct provider values, got ${distinctSet.size}: ${Array.from(distinctSet).join(', ')}`
    );

    // Specific pairwise inequalities
    assert.notEqual(groqProvider, geminiProvider, 'Groq and Gemini must not share the same audit label');
    assert.notEqual(groqProvider, localRagProvider, 'Groq and Local Fallback must not share the same audit label');
    assert.notEqual(geminiProvider, localRagProvider, 'Gemini and Local Fallback must not share the same audit label');
    assert.notEqual(openrouterProvider, localRagProvider, 'OpenRouter and Local Fallback must not share the same label');
    assert.notEqual(outOfScopeProvider, groqProvider, 'Out of scope must not be labeled as Groq');
    assert.notEqual(emergencyProvider, groqProvider, 'Emergency SOS must not be labeled as Groq');
  });

  await t.test('Assertion 2: Negative Invariants & Forbidden Values Rejection Proof', () => {
    // Forbidden values must be rejected by isValidAuditProvider
    for (const forbidden of FORBIDDEN_AUDIT_PROVIDERS) {
      assert.equal(
        isValidAuditProvider(forbidden),
        false,
        `Forbidden value "${forbidden}" must not be considered valid`
      );
    }
    assert.equal(isValidAuditProvider(null), false, 'null must not be valid');
    assert.equal(isValidAuditProvider(undefined), false, 'undefined must not be valid');
    assert.equal(isValidAuditProvider(12345), false, 'number must not be valid');

    // Resolving forbidden values must safely fail-closed to canonical fallback, NEVER leak 'parallel-race'
    const fallbackFromParallelRace = resolveAuditProvider('parallel-race');
    assert.notEqual(
      fallbackFromParallelRace,
      'parallel-race',
      'resolveAuditProvider must never return "parallel-race"'
    );
    assert.equal(
      fallbackFromParallelRace,
      CANONICAL_LOCAL_RAG_PROVIDER,
      'resolveAuditProvider("parallel-race") must safely fail-closed to canonical local RAG provider'
    );

    const fallbackFromNone = resolveAuditProvider('none');
    assert.notEqual(fallbackFromNone, 'none', 'resolveAuditProvider must never return "none"');
    assert.equal(
      fallbackFromNone,
      CANONICAL_LOCAL_RAG_PROVIDER,
      'resolveAuditProvider("none") must safely fail-closed to canonical local RAG provider'
    );

    const fallbackFromEmpty = resolveAuditProvider('');
    assert.equal(fallbackFromEmpty, CANONICAL_LOCAL_RAG_PROVIDER);

    const fallbackFromNull = resolveAuditProvider(null);
    assert.equal(fallbackFromNull, CANONICAL_LOCAL_RAG_PROVIDER);

    const fallbackFromUndefined = resolveAuditProvider(undefined);
    assert.equal(fallbackFromUndefined, CANONICAL_LOCAL_RAG_PROVIDER);
  });

  await t.test('Assertion 3: Provider Family Classification Proof', () => {
    assert.equal(classifyProviderFamily('groq-key1-llama-3.3-70b-versatile'), 'groq');
    assert.equal(classifyProviderFamily('groq-lpu'), 'groq');
    assert.equal(classifyProviderFamily('gemini-key1-gemini-2.5-flash'), 'gemini');
    assert.equal(classifyProviderFamily('gemini-key2'), 'gemini');
    assert.equal(classifyProviderFamily('gemini-search'), 'gemini');
    assert.equal(classifyProviderFamily('openrouter-meta-llama/llama-3.3-70b-instruct:free'), 'openrouter');
    assert.equal(classifyProviderFamily('openrouter-google/gemma-2-27b-it'), 'openrouter');
    assert.equal(classifyProviderFamily('local_expert_rag'), 'local_expert_rag');
    assert.equal(classifyProviderFamily('emergency_instant_bypass'), 'emergency_instant_bypass');
    assert.equal(classifyProviderFamily('out_of_scope_guard'), 'out_of_scope_guard');
    assert.equal(classifyProviderFamily('unknown_random_provider'), 'unknown_fallback');
  });

  await t.test('Assertion 4: Static Code Invariant — 0% Hardcoded "parallel-race" in Query Route', () => {
    const queryRouteCode = fs.readFileSync(queryRoutePath, 'utf8');

    // Rule: Must not have any occurrence of 'parallel-race' in query route
    assert.ok(
      !queryRouteCode.includes("'parallel-race'"),
      'query/route.ts must not contain hardcoded string \'parallel-race\''
    );
    assert.ok(
      !queryRouteCode.includes('"parallel-race"'),
      'query/route.ts must not contain hardcoded string "parallel-race"'
    );

    // Rule: logChatEvent in query route must pass actualProvider
    assert.ok(
      queryRouteCode.includes('provider_used: actualProvider'),
      'query/route.ts must pass actualProvider to logChatEvent'
    );

    // Rule: generateAIResponse must return an object with provider property
    assert.ok(
      queryRouteCode.includes('Promise<{ text: string; provider: string }>'),
      'generateAIResponse in query/route.ts must return text and provider'
    );

    // Rule: JSON response must include provider
    assert.ok(
      queryRouteCode.includes('provider: actualProvider'),
      'Main JSON response must return actualProvider'
    );

    // Rule: out-of-scope handler must log provider_used
    assert.ok(
      queryRouteCode.includes('provider_used: oosProvider'),
      'Out of scope handler must log provider_used'
    );
  });

  await t.test('Assertion 5: Static Code Invariant — Audit Integrity in Stream Route & aiProvider', () => {
    const streamRouteCode = fs.readFileSync(streamRoutePath, 'utf8');
    const aiProviderCode = fs.readFileSync(aiProviderPath, 'utf8');

    // Stream route must import and use resolveAuditProvider
    assert.ok(
      streamRouteCode.includes('resolveAuditProvider'),
      'stream/route.ts must import and use resolveAuditProvider'
    );
    assert.ok(
      streamRouteCode.includes('provider_used: resolveAuditProvider(providerUsed)'),
      'stream/route.ts must resolve providerUsed before logging'
    );
    assert.ok(
      streamRouteCode.includes('provider_used: oosProvider'),
      'stream/route.ts must log oosProvider on out-of-scope'
    );

    // aiProvider must capture provider and resolve it in generateAIResponse
    assert.ok(
      aiProviderCode.includes('provider: resolveAuditProvider(providerUsed)'),
      'aiProvider.ts must normalize provider with resolveAuditProvider'
    );
    assert.ok(
      aiProviderCode.includes("provider: 'emergency_instant_bypass'"),
      'aiProvider.ts must tag emergency delta chunks with emergency_instant_bypass'
    );
  });

  await t.test('Assertion 6: Simulated End-to-End Audit Payload Pipeline Proof', () => {
    // Simulator representing what logChatEvent receives across 6 operational scenarios
    function simulateChatTurn(scenario) {
      let rawProvider;
      let isOutOfScope = false;

      switch (scenario) {
        case 'groq_primary_success':
          rawProvider = 'groq-key1-llama-3.3-70b-versatile';
          break;
        case 'groq_429_gemini_failover':
          rawProvider = 'gemini-key2-gemini-2.5-flash';
          break;
        case 'llm_exhausted_openrouter_fallback':
          rawProvider = 'openrouter-meta-llama/llama-3.3-70b-instruct:free';
          break;
        case 'offline_local_expert_rag':
          rawProvider = 'local_expert_rag';
          break;
        case 'sos_emergency_bypass':
          rawProvider = 'emergency_instant_bypass';
          break;
        case 'out_of_scope_user_query':
          isOutOfScope = true;
          break;
        default:
          rawProvider = 'unknown';
      }

      const providerUsed = resolveAuditProvider(rawProvider, isOutOfScope);

      // Audit log payload structure corresponding to public.chat_logs
      return {
        session_id: 'test-session-uuid',
        query: 'Câu hỏi du lịch',
        response_preview: 'Câu trả lời mẫu...',
        provider_used: providerUsed,
        provider_family: classifyProviderFamily(providerUsed),
        is_out_scope: isOutOfScope,
        latency_ms: 250,
      };
    }

    const scenarios = [
      'groq_primary_success',
      'groq_429_gemini_failover',
      'llm_exhausted_openrouter_fallback',
      'offline_local_expert_rag',
      'sos_emergency_bypass',
      'out_of_scope_user_query',
    ];

    const results = scenarios.map(simulateChatTurn);

    // Verify all simulated payloads are valid and compliant with public.chat_logs schema
    for (const log of results) {
      assert.ok(
        isValidAuditProvider(log.provider_used),
        `Audit log payload must have a valid provider_used: got "${log.provider_used}"`
      );
      assert.ok(
        log.provider_family !== 'unknown_fallback',
        `Recognized scenarios must classify into a known provider family: got "${log.provider_family}"`
      );
    }

    // Verify Groq vs Gemini vs Fallback payloads have distinct values
    const providerValues = results.map(r => r.provider_used);
    const uniqueValues = new Set(providerValues);

    assert.equal(
      uniqueValues.size,
      scenarios.length,
      `Expected ${scenarios.length} distinct provider values across scenarios, got ${uniqueValues.size}`
    );

    // Verify specific expected values
    assert.equal(results[0].provider_used, 'groq-key1-llama-3.3-70b-versatile');
    assert.equal(results[0].provider_family, 'groq');

    assert.equal(results[1].provider_used, 'gemini-key2-gemini-2.5-flash');
    assert.equal(results[1].provider_family, 'gemini');

    assert.equal(results[2].provider_used, 'openrouter-meta-llama/llama-3.3-70b-instruct:free');
    assert.equal(results[2].provider_family, 'openrouter');

    assert.equal(results[3].provider_used, 'local_expert_rag');
    assert.equal(results[3].provider_family, 'local_expert_rag');

    assert.equal(results[4].provider_used, 'emergency_instant_bypass');
    assert.equal(results[4].provider_family, 'emergency_instant_bypass');

    assert.equal(results[5].provider_used, 'out_of_scope_guard');
    assert.equal(results[5].provider_family, 'out_of_scope_guard');
  });
});
