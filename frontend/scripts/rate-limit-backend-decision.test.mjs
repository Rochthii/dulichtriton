/**
 * ─────────────────────────────────────────────────────────────────────────────
 * TEST SUITE: P05-012 DISTRIBUTED RATE LIMIT BACKEND DECISION & CONTRACT
 * Du Lịch Tri Tôn AI Assistant System
 * Proof Authority: DR-G3-RATELIMIT-BACKEND-001 (Decision Gate G3)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  RATE_LIMIT_POLICIES,
  DISTRIBUTED_RATE_LIMIT_DEFAULTS,
  resolveRateLimitBackend,
  getDistributedRateLimitCredentials,
  getRateLimitPolicy,
} from '../src/lib/rateLimitConfig.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');

test('P05-012: 1. Decision Record Document Integrity & Gate G3 Authority Proof', () => {
  const docPath = path.join(
    ROOT_DIR,
    'docs/technical-spec/DECISION_RECORD_DISTRIBUTED_RATE_LIMIT_BACKEND.md'
  );
  assert.ok(fs.existsSync(docPath), 'Tài liệu Decision Record phải tồn tại trên ổ đĩa');

  const content = fs.readFileSync(docPath, 'utf8');

  // Kiểm tra mã định danh và metadata phê duyệt
  assert.ok(
    content.includes('DR-G3-RATELIMIT-BACKEND-001'),
    'Phải chứa mã quy chuẩn DR-G3-RATELIMIT-BACKEND-001'
  );
  assert.ok(
    content.includes('Decision Gate G3'),
    'Phải gắn với Decision Gate G3'
  );
  assert.ok(
    content.includes('APPROVED / VERIFIED'),
    'Trạng thái phê duyệt phải là APPROVED / VERIFIED'
  );
  assert.ok(
    content.includes('Chăm Rốch Thi'),
    'Người phê duyệt phải là Lead Architect Chăm Rốch Thi'
  );

  // Kiểm tra phân tích ma trận đánh đổi 4 phương án
  assert.ok(
    content.includes('Upstash Serverless Redis (REST API)'),
    'Phải khảo sát Upstash Serverless Redis'
  );
  assert.ok(
    content.includes('Self-hosted Redis'),
    'Phải khảo sát Self-hosted Redis'
  );
  assert.ok(
    content.includes('Supabase PostgreSQL'),
    'Phải khảo sát Supabase PostgreSQL'
  );
  assert.ok(
    content.includes('Cloudflare KV'),
    'Phải khảo sát Cloudflare KV'
  );

  // Kiểm tra bảng phân tích chi phí định lượng
  assert.ok(
    content.includes('Detailed Cost Analysis') || content.includes('Bảng Phân Tích Chi Phí'),
    'Phải có phần phân tích chi phí chi tiết'
  );
  assert.ok(
    content.includes('10,000 requests/ngày') || content.includes('Free Tier'),
    'Phải phân tích định lượng Free Tier của nhà cung cấp'
  );
});

test('P05-012: 2. Rate Limit Policy Quota Tiers Conformance Proof', () => {
  // Thẩm định 4 tầng phân quyền hạn mức chuẩn tắc
  const tiers = ['chat_query', 'admin_mutation', 'auth_login', 'public_api'];

  for (const tier of tiers) {
    const policy = getRateLimitPolicy(tier);
    assert.ok(policy, `Chính sách ${tier} phải được định nghĩa`);
    assert.equal(policy.tier, tier, `Tier ID phải khớp với ${tier}`);
    assert.ok(policy.limit > 0, `Hạn mức ${tier} phải > 0`);
    assert.ok(policy.windowSeconds > 0, `Cửa sổ thời gian ${tier} phải > 0`);
    assert.ok(policy.description.length > 10, `Mô tả ${tier} phải chi tiết`);
  }

  // Khẳng định giá trị chuẩn xác theo Decision Record
  assert.equal(RATE_LIMIT_POLICIES.chat_query.limit, 20, 'Chat query limit phải là 20 requests');
  assert.equal(RATE_LIMIT_POLICIES.chat_query.windowSeconds, 60, 'Chat query window phải là 60 giây');

  assert.equal(RATE_LIMIT_POLICIES.admin_mutation.limit, 30, 'Admin mutation limit phải là 30 requests');
  assert.equal(RATE_LIMIT_POLICIES.admin_mutation.windowSeconds, 60, 'Admin mutation window phải là 60 giây');

  assert.equal(RATE_LIMIT_POLICIES.auth_login.limit, 5, 'Auth login limit phải là 5 requests');
  assert.equal(RATE_LIMIT_POLICIES.auth_login.windowSeconds, 60, 'Auth login window phải là 60 giây');

  assert.equal(RATE_LIMIT_POLICIES.public_api.limit, 90, 'Public API limit phải là 90 requests');
  assert.equal(RATE_LIMIT_POLICIES.public_api.windowSeconds, 60, 'Public API window phải là 60 giây');

  // Fallback an toàn cho tier không xác định
  const unknownPolicy = getRateLimitPolicy('invalid_tier_xyz');
  assert.equal(unknownPolicy.tier, 'public_api', 'Tier không tồn tại phải fallback về public_api an toàn');
});

test('P05-012: 3. Distributed Redis Credentials & Environment Resolver Proof', () => {
  // Test case 1: Môi trường có credentials Upstash Redis hợp lệ
  const validUpstashEnv = {
    UPSTASH_REDIS_REST_URL: 'https://test-redis-cluster.upstash.io',
    UPSTASH_REDIS_REST_TOKEN: 'Ax123456789SecretTokenABCDEF',
  };
  const upstashConfig = resolveRateLimitBackend(validUpstashEnv);
  assert.equal(upstashConfig.backendType, 'upstash_redis');
  assert.equal(upstashConfig.isDistributed, true);
  assert.equal(upstashConfig.restUrl, 'https://test-redis-cluster.upstash.io');
  assert.equal(upstashConfig.hasRestToken, true);
  assert.equal(upstashConfig.timeoutMs, 1500);

  // Test case 2: Môi trường có biến REDIS_REST_URL chuẩn hóa
  const validGenericRedisEnv = {
    REDIS_REST_URL: 'https://generic-redis.provider.net',
    REDIS_REST_TOKEN: 'GenericTokenXYZ987',
  };
  const genericConfig = resolveRateLimitBackend(validGenericRedisEnv);
  assert.equal(genericConfig.backendType, 'upstash_redis');
  assert.equal(genericConfig.isDistributed, true);
  assert.equal(genericConfig.restUrl, 'https://generic-redis.provider.net');

  // Test case 3: URL không phải HTTPS hoặc URL rác -> Fail-Safe suy thoái
  const invalidUrlEnv = {
    UPSTASH_REDIS_REST_URL: 'http://insecure-redis.io', // Thiếu HTTPS
    UPSTASH_REDIS_REST_TOKEN: 'SomeToken',
  };
  const creds = getDistributedRateLimitCredentials(invalidUrlEnv);
  assert.equal(creds.isValid, false, 'URL HTTP không được chấp nhận vì bảo mật');
  const invalidConfig = resolveRateLimitBackend(invalidUrlEnv);
  assert.equal(invalidConfig.backendType, 'memory_fallback');
  assert.equal(invalidConfig.isDistributed, false);
});

test('P05-012: 4. Graceful Degradation & In-Memory Fallback Invariant Proof', () => {
  // Khi không có biến môi trường nào được cấp (ví dụ: Local Dev máy lập trình viên)
  const emptyEnv = {};
  const fallbackConfig = resolveRateLimitBackend(emptyEnv);

  assert.equal(fallbackConfig.backendType, 'memory_fallback', 'Phải tự suy thoái về memory_fallback');
  assert.equal(fallbackConfig.isDistributed, false, 'Không báo distributed giả');
  assert.equal(fallbackConfig.hasRestToken, false, 'Không có token');
  assert.ok(
    fallbackConfig.reason.includes('In-Memory'),
    'Lý do suy thoái phải nêu rõ In-Memory Sliding Window'
  );
});

test('P05-012: 5. Static Code Invariant Audit & Zero Mock Verification', () => {
  const configFile = path.join(ROOT_DIR, 'frontend/src/lib/rateLimitConfig.ts');
  const code = fs.readFileSync(configFile, 'utf8');

  // Không hardcode secret keys
  assert.ok(!code.includes('redis_token_'), 'Tuyệt đối không hardcode Redis token');
  assert.ok(!code.includes('mock_rate_limit'), 'Tuyệt đối không chứa mock rate limit');

  // Khẳng định ID quy chuẩn
  assert.equal(DISTRIBUTED_RATE_LIMIT_DEFAULTS.SPECIFICATION_ID, 'DR-G3-RATELIMIT-BACKEND-001');
  assert.equal(DISTRIBUTED_RATE_LIMIT_DEFAULTS.TIMEOUT_MS, 1500);
});
