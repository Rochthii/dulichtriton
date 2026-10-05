import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..');

test('Test 1: AI Workflow Document Alignment with P04 Sequential Failover Strategy', () => {
  const workflowDocPath = path.join(projectRoot, 'docs', 'ai_workflow.md');
  assert.ok(fs.existsSync(workflowDocPath), 'docs/ai_workflow.md must exist');

  const content = fs.readFileSync(workflowDocPath, 'utf8');

  // Verify technical authority and decision records citation
  assert.match(content, /DECISION_RECORD_MULTI_LLM_PROVIDER_STRATEGY\.md/, 'Must cite DR-LLM-STRATEGY-001');
  assert.match(content, /RUNBOOK_PROVIDER_OUTAGE\.md/, 'Must cite SRE Provider Outage Runbook');
  assert.match(content, /DEPLOYMENT_PATH_INVENTORY\.md/, 'Must cite Deployment Path Inventory');

  // Verify Sequential Failover architecture tiers and bounded timeouts
  assert.match(content, /GROQ_PRIMARY_TIMEOUT_MS\s*=\s*2\.5s/i, 'Must define Groq primary timeout 2.5s');
  assert.match(content, /GEMINI_SECONDARY_TIMEOUT_MS\s*=\s*6s/i, 'Must define Gemini secondary timeout 6s');
  assert.match(content, /OPENROUTER_TERTIARY_TIMEOUT\s*=\s*5s/i, 'Must define OpenRouter tertiary timeout 5s');
  assert.match(content, /LOCAL_RAG_TIMEOUT_MS\s*=\s*0ms/i, 'Must define Local RAG timeout 0ms');

  // Verify Zero Provider Race principle
  assert.match(content, /0%\s*Provider\s*Race/i, 'Must explicitly enforce 0% Provider Race invariant');
  assert.match(content, /0%\s*Zombie\s*Requests/i, 'Must explicitly enforce 0% Zombie Requests invariant');
});

test('Test 2: Strict Zero-Tolerance for Obsolete Race and Unverified RAG Claims in docs/ai_workflow.md', () => {
  const workflowDocPath = path.join(projectRoot, 'docs', 'ai_workflow.md');
  const workflowContent = fs.readFileSync(workflowDocPath, 'utf8');

  // Check obsolete claims in ai_workflow.md
  assert.doesNotMatch(workflowContent, /Cross-Encoder\s*Reranker\s*\(Tái xếp hạng kết quả\)/i, 'Must eliminate active Cross-Encoder Reranker claim');
  assert.doesNotMatch(workflowContent, /105\s*địa điểm\s*Master/i, 'Must eliminate obsolete 105 spots claim');
  assert.doesNotMatch(workflowContent, /Master\s*Documents\s*\(105\s*Spots\)/i, 'Must eliminate 105 spots master documents claim');
  assert.doesNotMatch(workflowContent, /FastAPI\s*API\s*Gateway/i, 'Must eliminate obsolete FastAPI gateway in production flow');
  assert.doesNotMatch(workflowContent, /Claude\s*3\.5\s*Sonnet\s*\n\s*\(Cultural\s*Knowledge\)/i, 'Must eliminate obsolete Claude fallback claim');
  assert.doesNotMatch(workflowContent, /áp dụng\s*racing\s*song\s*song/i, 'Must not claim active parallel racing');
});

test('Test 3: Verification of Factual Retrieval, Provenance & Safety Gates Integration', () => {
  const workflowDocPath = path.join(projectRoot, 'docs', 'ai_workflow.md');
  const content = fs.readFileSync(workflowDocPath, 'utf8');

  // Verify query length limit and session ownership
  assert.match(content, /validateChatQuery/, 'Must include query input length guard');
  assert.match(content, /UUID\s*v4\s*RFC\s*4122/, 'Must include RFC 4122 session ID standard');
  assert.match(content, /HMAC-SHA256/, 'Must include HMAC-SHA256 ownership verification');

  // Verify security firewalls
  assert.match(content, /Prompt\s*Injection\s*Firewall/, 'Must include Prompt Injection Firewall');
  assert.match(content, /Poisoned\s*Knowledge\s*Firewall/, 'Must include Poisoned Knowledge Firewall');

  // Verify RAG performance and verification invariants
  assert.match(content, /generateQueryEmbedding/, 'Must include single embedding execution invariant');
  assert.match(content, /postgrestFilterSanitizer/, 'Must include PostgREST filter injection protection');
  assert.match(content, /verification_status\s*=\s*'VERIFIED'/, 'Must include verification status filter invariant');
  assert.match(content, /is_verified\s*=\s*true/, 'Must include is_verified true filter invariant');

  // Verify SOS fast path and citation gates
  assert.match(content, /SOS\s*Emergency\s*Fast-Path/i, 'Must include SOS fast-path');
  assert.match(content, /chatOutputSchemaValidator/, 'Must include output schema validation');
  assert.match(content, /chatCitationCoverageGate/, 'Must include citation coverage gate');

  // Verify real audit logging
  assert.match(content, /model_used/, 'Must include model_used audit log');
  assert.match(content, /latency_ms/, 'Must include latency_ms measurement');
});

test('Test 4: Concordance with Decision Record DR-LLM-STRATEGY-001 and Runtime Constants', () => {
  const drPath = path.join(projectRoot, 'docs', 'technical-spec', 'DECISION_RECORD_MULTI_LLM_PROVIDER_STRATEGY.md');
  assert.ok(fs.existsSync(drPath), 'DECISION_RECORD_MULTI_LLM_PROVIDER_STRATEGY.md must exist');

  const drContent = fs.readFileSync(drPath, 'utf8');
  assert.match(drContent, /DR-LLM-STRATEGY-001/, 'Decision Record must have ID DR-LLM-STRATEGY-001');
  assert.match(drContent, /GROQ_PRIMARY_TIMEOUT_MS\s*=\s*2500/, 'DR must specify 2500ms Groq timeout');
  assert.match(drContent, /GEMINI_SECONDARY_TIMEOUT_MS\s*=\s*6000/, 'DR must specify 6000ms Gemini timeout');
  assert.match(drContent, /OPENROUTER_TERTIARY_TIMEOUT_MS\s*=\s*5000/, 'DR must specify 5000ms OpenRouter timeout');
  assert.match(drContent, /LOCAL_RAG_TIMEOUT_MS\s*=\s*0/, 'DR must specify 0ms Local RAG timeout');

  // Cross-check runtime code in chatGroqTimeoutHelper.ts
  const timeoutHelperPath = path.join(projectRoot, 'frontend', 'src', 'lib', 'chatGroqTimeoutHelper.ts');
  const helperContent = fs.readFileSync(timeoutHelperPath, 'utf8');
  assert.match(helperContent, /GROQ_PRIMARY_TIMEOUT_MS\s*=\s*2500/, 'chatGroqTimeoutHelper.ts must define 2500ms timeout');
  assert.match(helperContent, /GEMINI_SECONDARY_TIMEOUT_MS\s*=\s*6000/, 'chatGroqTimeoutHelper.ts must define 6000ms timeout');
  assert.match(helperContent, /OPENROUTER_TERTIARY_TIMEOUT_MS\s*=\s*5000/, 'chatGroqTimeoutHelper.ts must define 5000ms timeout');
  assert.match(helperContent, /LOCAL_RAG_TIMEOUT_MS\s*=\s*0/, 'chatGroqTimeoutHelper.ts must define 0ms timeout');
});

test('Test 5: Canonical Manifest Concordance and Data Governance Boundaries', () => {
  const workflowDocPath = path.join(projectRoot, 'docs', 'ai_workflow.md');
  const content = fs.readFileSync(workflowDocPath, 'utf8');

  // Must reference Canonical Manifest v1.0.0
  assert.match(content, /CANONICAL_DATASET_MANIFEST\.md/, 'Must cite Canonical Dataset Manifest');
  assert.match(content, /Canonical\s*Manifest\s*`?v1\.0\.0`?/i, 'Must cite Canonical Manifest v1.0.0');
  assert.match(content, /CANONICAL-POI-SCHEMA-V1/i, 'Must reference canonical schema');

  // Must distinguish offline research backend
  assert.match(content, /backend\//, 'Must reference backend/ directory');
  assert.match(content, /chạy\s*offline/i, 'Must specify offline execution for research scripts');
});
