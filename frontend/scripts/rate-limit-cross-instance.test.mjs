/**
 * ─────────────────────────────────────────────────────────────────────────────
 * TEST SUITE: P05-013 DISTRIBUTED RATE LIMITER CROSS-INSTANCE INTEGRATION
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
  createRateLimiter,
  checkRateLimitAsync,
  checkRateLimit,
  isSuspiciousBot,
} from '../src/lib/rateLimiter.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');

/**
 * Giả lập Upstash Redis Server với Datastore nguyên tử dùng chung (Atomic Shared Store)
 * Mô phỏng chính xác giao thức REST API của Upstash (/pipeline và /expire)
 */
function createMockUpstashRedisServer() {
  const redisStore = new Map(); // key -> { count: number, ttl: number, expiresAt: number }

  return {
    getStore: () => redisStore,
    fetchFn: async (url, options = {}) => {
      const urlStr = String(url);
      const now = Date.now();

      // Dọn dẹp key hết hạn
      for (const [k, v] of redisStore.entries()) {
        if (v.expiresAt <= now) {
          redisStore.delete(k);
        }
      }

      // Xử lý endpoint /pipeline
      if (urlStr.endsWith('/pipeline')) {
        const body = JSON.parse(options.body || '[]');
        const results = [];

        for (const cmd of body) {
          const action = cmd[0];
          const key = cmd[1];

          if (action === 'INCR') {
            const entry = redisStore.get(key) || { count: 0, ttl: -1, expiresAt: Infinity };
            entry.count += 1;
            redisStore.set(key, entry);
            results.push({ result: entry.count });
          } else if (action === 'TTL') {
            const entry = redisStore.get(key);
            if (!entry) {
              results.push({ result: -2 });
            } else if (entry.expiresAt === Infinity) {
              results.push({ result: -1 });
            } else {
              const remainingSec = Math.max(1, Math.ceil((entry.expiresAt - now) / 1000));
              results.push({ result: remainingSec });
            }
          }
        }

        return {
          ok: true,
          status: 200,
          json: async () => results,
        };
      }

      // Xử lý endpoint /expire/:key/:seconds
      if (urlStr.includes('/expire/')) {
        const parts = urlStr.split('/expire/')[1].split('/');
        const key = decodeURIComponent(parts[0]);
        const sec = parseInt(parts[1], 10) || 60;

        const entry = redisStore.get(key);
        if (entry) {
          entry.ttl = sec;
          entry.expiresAt = now + sec * 1000;
          redisStore.set(key, entry);
        }

        return {
          ok: true,
          status: 200,
          json: async () => ({ result: 1 }),
        };
      }

      return {
        ok: false,
        status: 404,
        json: async () => ({ error: 'Not found' }),
      };
    },
  };
}

test('P05-013: 1. Cross-Instance Rate Limit Synchronization Proof (Instance A & Instance B)', async () => {
  const mockServer = createMockUpstashRedisServer();
  const mockEnv = {
    UPSTASH_REDIS_REST_URL: 'https://tri-ton-redis-cluster.upstash.io',
    UPSTASH_REDIS_REST_TOKEN: 'MockSecretTokenUpstashRedis2026',
  };

  // Khởi tạo 2 instance độc lập (mô phỏng 2 serverless pods/functions với isolated memory stores)
  const memoryStoreA = new Map();
  const memoryStoreB = new Map();

  const instanceA = createRateLimiter({
    env: mockEnv,
    fetchFn: mockServer.fetchFn,
    memoryStore: memoryStoreA,
  });

  const instanceB = createRateLimiter({
    env: mockEnv,
    fetchFn: mockServer.fetchFn,
    memoryStore: memoryStoreB,
  });

  try {
    const clientKey = 'chat_client_ip_203.0.113.195';
    const limit = 5; // Hạn mức tối đa 5 requests trong 60 giây
    const windowSeconds = 60;

    // Instance A xử lý 3 requests đầu tiên
    const r1 = await instanceA.check(clientKey, limit, windowSeconds);
    assert.equal(r1.allowed, true, 'Request 1 (Instance A) phải được cho phép');
    assert.equal(r1.remaining, 4, 'Remaining sau req 1 phải là 4');
    assert.equal(r1.backend, 'upstash_redis');

    const r2 = await instanceA.check(clientKey, limit, windowSeconds);
    assert.equal(r2.allowed, true, 'Request 2 (Instance A) phải được cho phép');
    assert.equal(r2.remaining, 3, 'Remaining sau req 2 phải là 3');

    const r3 = await instanceA.check(clientKey, limit, windowSeconds);
    assert.equal(r3.allowed, true, 'Request 3 (Instance A) phải được cho phép');
    assert.equal(r3.remaining, 2, 'Remaining sau req 3 phải là 2');

    // Instance B (máy chủ thứ hai, memory hoàn toàn rỗng) nhận 3 requests tiếp theo từ cùng client IP
    assert.equal(memoryStoreB.size, 0, 'Memory store của Instance B phải hoàn toàn rỗng ban đầu');

    const r4 = await instanceB.check(clientKey, limit, windowSeconds);
    assert.equal(r4.allowed, true, 'Request 4 (Instance B) phải được cho phép');
    assert.equal(r4.remaining, 1, 'Remaining sau req 4 phải là 1 (nhận biết từ Redis)');
    assert.equal(r4.backend, 'upstash_redis');

    const r5 = await instanceB.check(clientKey, limit, windowSeconds);
    assert.equal(r5.allowed, true, 'Request 5 (Instance B) phải được cho phép (chạm trần)');
    assert.equal(r5.remaining, 0, 'Remaining sau req 5 phải là 0');

    // Request thứ 6: Đã vượt quá hạn mức 5 request!
    // PROOF: Instance B phải CHẶN ĐỨNG request này mặc dù Instance B mới chỉ trực tiếp xử lý 2 requests
    const r6 = await instanceB.check(clientKey, limit, windowSeconds);
    assert.equal(r6.allowed, false, 'Request 6 (Instance B) BẮT BUỘC BỊ CHẶN ĐỨNG (Rate Limit Exceeded)');
    assert.equal(r6.remaining, 0, 'Remaining phải là 0 khi bị chặn');
    assert.ok(r6.resetSeconds > 0, 'resetSeconds phải > 0 để client biết thời gian retry');
    assert.equal(r6.backend, 'upstash_redis');
  } finally {
    instanceA.destroy();
    instanceB.destroy();
  }
});

test('P05-013: 2. Key Isolation Invariant: Different IPs Have Independent Quotas', async () => {
  const mockServer = createMockUpstashRedisServer();
  const mockEnv = {
    UPSTASH_REDIS_REST_URL: 'https://tri-ton-redis-cluster.upstash.io',
    UPSTASH_REDIS_REST_TOKEN: 'MockSecretTokenUpstashRedis2026',
  };

  const instanceB = createRateLimiter({
    env: mockEnv,
    fetchFn: mockServer.fetchFn,
  });

  try {
    // Client khác với IP độc lập gửi request
    const distinctClientKey = 'chat_client_ip_198.51.100.42';
    const limit = 5;

    const r = await instanceB.check(distinctClientKey, limit, 60);
    assert.equal(r.allowed, true, 'IP mới phải được cấp phép bình thường');
    assert.equal(r.remaining, 4, 'Remaining của IP mới phải độc lập');
    assert.equal(r.backend, 'upstash_redis');
  } finally {
    instanceB.destroy();
  }
});

test('P05-013: 3. Graceful Degradation Proof Under Redis Outage or Network Failure', async () => {
  // Giả lập lỗi mạng hoặc Redis server sập hoàn toàn (HTTP 500 hoặc Network Connection Error)
  const failingFetch = async () => {
    throw new Error('ETIMEDOUT: Connection to Upstash Redis timed out after 1500ms');
  };

  const mockEnv = {
    UPSTASH_REDIS_REST_URL: 'https://tri-ton-broken-cluster.upstash.io',
    UPSTASH_REDIS_REST_TOKEN: 'Token',
  };

  const resilientInstance = createRateLimiter({
    env: mockEnv,
    fetchFn: failingFetch,
  });

  try {
    const key = 'test_fallback_client_ip';
    // PROOF: Hệ thống không bị crash 500, tự động suy thoái an toàn về In-Memory
    const result = await resilientInstance.check(key, 10, 60);

    assert.equal(result.allowed, true, 'Request phải được thông qua an toàn qua fallback');
    assert.equal(result.remaining, 9, 'Remaining đếm qua fallback memory');
    assert.equal(result.backend, 'memory_fallback', 'Backend phải báo memory_fallback');
  } finally {
    resilientInstance.destroy();
  }
});

test('P05-013: 4. Tiered Rate Limiting Policy Conformance in Runtime Helper', async () => {
  // Kiểm tra helper checkRateLimitAsync với các tier chuẩn
  const resChat = await checkRateLimitAsync('test_chat_key', undefined, undefined, 'chat_query');
  assert.equal(resChat.limit, 20, 'chat_query tier phải có limit là 20');

  const resAdmin = await checkRateLimitAsync('test_admin_key', undefined, undefined, 'admin_mutation');
  assert.equal(resAdmin.limit, 30, 'admin_mutation tier phải có limit là 30');

  const resAuth = await checkRateLimitAsync('test_auth_key', undefined, undefined, 'auth_login');
  assert.equal(resAuth.limit, 5, 'auth_login tier phải có limit là 5');

  const resPublic = await checkRateLimitAsync('test_public_key', undefined, undefined, 'public_api');
  assert.equal(resPublic.limit, 90, 'public_api tier phải có limit là 90');
});

test('P05-013: 5. Static Code Invariant Audit on Middleware & RateLimiter', () => {
  const middlewarePath = path.join(ROOT_DIR, 'frontend/src/middleware.ts');
  const rateLimiterPath = path.join(ROOT_DIR, 'frontend/src/lib/rateLimiter.ts');

  const middlewareCode = fs.readFileSync(middlewarePath, 'utf8');
  const rateLimiterCode = fs.readFileSync(rateLimiterPath, 'utf8');

  // Middleware sử dụng checkRateLimitAsync
  assert.ok(
    middlewareCode.includes('checkRateLimitAsync'),
    'middleware.ts phải import và gọi checkRateLimitAsync'
  );
  assert.ok(
    middlewareCode.includes("export async function middleware"),
    'middleware.ts phải là async function'
  );

  // RateLimiter cung cấp cả hai phương thức async và sync fallback
  assert.ok(
    rateLimiterCode.includes('export class DistributedRateLimiter'),
    'rateLimiter.ts phải export class DistributedRateLimiter'
  );
  assert.ok(
    rateLimiterCode.includes('createRateLimiter'),
    'rateLimiter.ts phải export hàm createRateLimiter'
  );
  assert.ok(
    rateLimiterCode.includes('checkRateLimitAsync'),
    'rateLimiter.ts phải export hàm checkRateLimitAsync'
  );

  // Không hardcode secret keys
  assert.ok(!rateLimiterCode.includes('Ax123456789SecretToken'), 'Không chứa mock secret keys');
});
