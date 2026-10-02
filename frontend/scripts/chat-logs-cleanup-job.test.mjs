/**
 * ─────────────────────────────────────────────────────────────────────────────
 * P05-004: CHAT LOGS CLEANUP JOB VERIFICATION & PROOF SUITE
 * Du Lịch Tri Tôn AI Assistant System
 * 
 * PHẠM VI & MỤC TIÊU NGHIỆM THU:
 * - Tạo job xóa chat_logs hết hạn (> 30 ngày kể từ created_at).
 * - PROOF BẮT BUỘC: Fixture expired bị xóa sạch trong khi active fixture được bảo toàn,
 *   bãi bỏ rule chat_logs_no_delete và phân quyền RLS an toàn chỉ cho service_role.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import typescript from 'typescript';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const cleanupServiceTsPath = path.resolve(__dirname, '../src/lib/chatLogCleanupService.ts');
const cronRouteTsPath = path.resolve(__dirname, '../src/app/api/v1/cron/cleanup-chat-logs/route.ts');
const migrationSqlPath = path.resolve(__dirname, '../../supabase/migrations/20261002_p05_004_cleanup_expired_chat_logs.sql');

function loadModule(filePath, customResolver = {}) {
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
  fn(
    m,
    m.exports,
    (id) => {
      if (customResolver[id]) return customResolver[id];
      if (id.startsWith('@/lib/')) {
        const rel = id.replace('@/lib/', '');
        const target = path.resolve(__dirname, '../src/lib', rel.endsWith('.ts') ? rel : `${rel}.ts`);
        if (fs.existsSync(target)) {
          return loadModule(target, customResolver);
        }
      }
      if (id === './chatSessionCleanupService') {
        const target = path.resolve(__dirname, '../src/lib/chatSessionCleanupService.ts');
        return loadModule(target, customResolver);
      }
      if (id.startsWith('./') || id.startsWith('../')) {
        const target = path.resolve(path.dirname(filePath), id.endsWith('.ts') ? id : `${id}.ts`);
        if (fs.existsSync(target)) {
          return loadModule(target, customResolver);
        }
      }
      if (id === 'crypto' || id === 'node:crypto') {
        return require('crypto');
      }
      return {};
    },
    path.dirname(filePath),
    filePath
  );
  return m.exports;
}

const cleanupService = loadModule(cleanupServiceTsPath);
const {
  executeChatLogCleanup,
  isChatLogExpired,
  calculateChatLogExpirationDate,
  verifyCleanupAuthorization,
  CHAT_LOG_RETENTION_DAYS,
  CHAT_LOG_RETENTION_MS,
  CHAT_LOG_RETENTION_SQL_INTERVAL
} = cleanupService;

/**
 * Mock Client Supabase cho mục đích kiểm chứng thao tác cơ sở dữ liệu trên chat_logs
 */
function createMockSupabaseDatabase(initialLogs) {
  const store = new Map(initialLogs.map((l) => [l.id, { ...l }]));

  return {
    store,
    client: {
      rpc: async (fnName, params) => {
        if (fnName === 'cleanup_expired_chat_logs') {
          const limit = params?.p_batch_limit ?? 1000;
          const now = Date.now();
          const cutoff = now - CHAT_LOG_RETENTION_MS;

          const expired = Array.from(store.values())
            .filter((l) => new Date(l.created_at).getTime() < cutoff)
            .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
            .slice(0, limit);

          for (const l of expired) {
            store.delete(l.id);
          }

          return { data: expired.length, error: null };
        }
        return { data: null, error: new Error(`Unknown RPC ${fnName}`) };
      },
      from: (tableName) => {
        if (tableName !== 'chat_logs') {
          throw new Error(`Unexpected table: ${tableName}`);
        }

        let selectedCols = '*';
        let ltCol = null;
        let ltVal = null;
        let inCol = null;
        let inVals = null;
        let limitVal = 1000;
        let orderCol = null;
        let orderAsc = true;
        let isDelete = false;

        const builder = {
          select: (cols) => {
            selectedCols = cols;
            return builder;
          },
          delete: () => {
            isDelete = true;
            return builder;
          },
          lt: (col, val) => {
            ltCol = col;
            ltVal = val;
            return builder;
          },
          in: (col, vals) => {
            inCol = col;
            inVals = vals;
            return builder;
          },
          order: (col, opts) => {
            orderCol = col;
            orderAsc = opts?.ascending ?? true;
            return builder;
          },
          limit: (n) => {
            limitVal = n;
            return builder;
          },
          then: (resolve) => {
            if (isDelete) {
              const deletedRows = [];
              if (inCol === 'id' && Array.isArray(inVals)) {
                for (const id of inVals) {
                  if (store.has(id)) {
                    deletedRows.push({ id });
                    store.delete(id);
                  }
                }
              }
              resolve({ data: deletedRows, error: null });
              return;
            }

            let results = Array.from(store.values());
            if (ltCol === 'created_at' && ltVal) {
              const cutoffTime = new Date(ltVal).getTime();
              results = results.filter((l) => new Date(l.created_at).getTime() < cutoffTime);
            }
            if (orderCol === 'created_at') {
              results.sort((a, b) => {
                const diff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                return orderAsc ? diff : -diff;
              });
            }
            results = results.slice(0, limitVal);

            if (selectedCols === 'id') {
              results = results.map((r) => ({ id: r.id }));
            }
            resolve({ data: results, error: null });
          }
        };

        return builder;
      }
    }
  };
}

test('P05-004: 1. Proof: Expired Chat Log Fixtures Are Deleted While Active Fixtures Are Preserved', async () => {
  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;

  const fixtures = [
    {
      id: 101,
      session_id: 'session_old_1',
      user_message: 'Hỏi về hồ Soài So',
      bot_response: 'Hồ Soài So nằm dưới chân núi Tô...',
      created_at: new Date(now - 31 * ONE_DAY).toISOString(), // > 30 ngày -> EXPIRED
    },
    {
      id: 102,
      session_id: 'session_old_2',
      user_message: 'Hỏi về đua bò Bảy Núi',
      bot_response: 'Hội đua bò diễn ra dịp lễ Sên Đôlta...',
      created_at: new Date(now - 60 * ONE_DAY).toISOString(), // > 30 ngày -> EXPIRED
    },
    {
      id: 201,
      session_id: 'session_active_1',
      user_message: 'Ăn đu đủ đâm ở đâu ngon?',
      bot_response: 'Quán Rina ở Tri Tôn...',
      created_at: new Date(now - 5 * ONE_DAY).toISOString(), // < 30 ngày -> ACTIVE
    },
    {
      id: 202,
      session_id: 'session_active_2',
      user_message: 'Đường lên Tà Pạ có dốc không?',
      bot_response: 'Đường bê tông dễ đi...',
      created_at: new Date(now - 29 * ONE_DAY).toISOString(), // < 30 ngày -> ACTIVE
    },
  ];

  const { store, client } = createMockSupabaseDatabase(fixtures);
  assert.strictEqual(store.size, 4, 'Ban đầu có 4 chat_logs fixtures');

  // Chạy cleanup job
  const result = await executeChatLogCleanup({
    supabaseClient: client,
    batchLimit: 1000
  });

  // Kiểm chứng PROOF
  assert.strictEqual(result.success, true, 'Cleanup job chat_logs phải thành công');
  assert.strictEqual(result.deletedCount, 2, 'Proof: Đúng 2 log expired (> 30 ngày) phải bị xóa');
  assert.strictEqual(store.size, 2, 'Store còn lại chính xác 2 active logs');

  // Kiểm tra từng fixture
  assert.strictEqual(store.has(101), false, 'Proof: fixture 101 (> 31 ngày) phải bị xóa sạch');
  assert.strictEqual(store.has(102), false, 'Proof: fixture 102 (> 60 ngày) phải bị xóa sạch');
  assert.strictEqual(store.has(201), true, 'Proof: fixture 201 (5 ngày) phải được bảo toàn nguyên vẹn');
  assert.strictEqual(store.has(202), true, 'Proof: fixture 202 (29 ngày) phải được bảo toàn nguyên vẹn');
});

test('P05-004: 2. Batch Limit Safeguard Invariant (Bảo vệ I/O không nghẽn database)', async () => {
  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;

  // Tạo 10 expired logs (> 30 ngày)
  const fixtures = Array.from({ length: 10 }, (_, i) => ({
    id: 1000 + i,
    session_id: `batch_session_${i}`,
    user_message: `Tin nhắn thứ ${i}`,
    bot_response: `Phản hồi thứ ${i}`,
    created_at: new Date(now - (35 + i) * ONE_DAY).toISOString(),
  }));

  const { store, client } = createMockSupabaseDatabase(fixtures);

  // Chạy với batchLimit = 3
  const result = await executeChatLogCleanup({
    supabaseClient: client,
    batchLimit: 3
  });

  assert.strictEqual(result.deletedCount, 3, 'Chỉ được xóa tối đa 3 bản ghi trong đợt đầu');
  assert.strictEqual(store.size, 7, 'Store còn lại đúng 7 bản ghi cho đợt tiếp theo');
});

test('P05-004: 3. Retention Policy Runtime Invariants & Expiration Date Calculator', () => {
  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;

  assert.strictEqual(CHAT_LOG_RETENTION_DAYS, 30, 'Chính sách lưu trữ là 30 ngày');
  assert.strictEqual(CHAT_LOG_RETENTION_SQL_INTERVAL, "INTERVAL '30 days'", 'SQL interval là 30 days');

  // Quá 30 ngày -> expired
  const expiredDate = new Date(now - 30 * ONE_DAY - 1000);
  assert.strictEqual(isChatLogExpired(expiredDate, now), true, 'Bản ghi > 30 ngày phải coi là hết hạn');

  // Chưa quá 30 ngày -> active
  const activeDate = new Date(now - 30 * ONE_DAY + 1000);
  assert.strictEqual(isChatLogExpired(activeDate, now), false, 'Bản ghi < 30 ngày phải còn hiệu lực');

  // Giá trị null/invalid -> Fail-closed
  assert.strictEqual(isChatLogExpired('', now), true, 'Mốc rỗng fail-closed thành true');
  assert.strictEqual(isChatLogExpired('invalid-date', now), true, 'Ngày không hợp lệ fail-closed thành true');

  // Tính ngày hết hạn
  const createdDate = new Date(now);
  const expirationDate = calculateChatLogExpirationDate(createdDate);
  const diffDays = Math.round((expirationDate.getTime() - createdDate.getTime()) / ONE_DAY);
  assert.strictEqual(diffDays, 30, 'Ngày hết hạn phải cách đúng 30 ngày sau created_at');
});

test('P05-004: 4. Cron Authorization Security Gate (Fail-Closed Token Verification)', () => {
  const secret = 'prod_audit_cron_secret_test_2026';

  // 1. Đúng token với Bearer
  assert.strictEqual(verifyCleanupAuthorization(`Bearer ${secret}`, secret), true);
  // 2. Đúng token không có Bearer
  assert.strictEqual(verifyCleanupAuthorization(secret, secret), true);
  // 3. Sai token
  assert.strictEqual(verifyCleanupAuthorization('Bearer wrong_token', secret), false);
  // 4. Token rỗng
  assert.strictEqual(verifyCleanupAuthorization('', secret), false);
  // 5. Header null / undefined
  assert.strictEqual(verifyCleanupAuthorization(null, secret), false);
  // 6. Server chưa cấu hình envSecret -> Fail-closed
  assert.strictEqual(verifyCleanupAuthorization(`Bearer ${secret}`, ''), false);
  assert.strictEqual(verifyCleanupAuthorization(`Bearer ${secret}`, null), false);
});

test('P05-004: 5. Database Migration DDL Audit Invariant (cleanup_expired_chat_logs)', () => {
  assert.ok(fs.existsSync(migrationSqlPath), 'Migration SQL phải tồn tại');
  const sql = fs.readFileSync(migrationSqlPath, 'utf8');

  // Kiểm tra hủy bỏ rule no_delete cũ
  assert.match(sql, /DROP RULE IF EXISTS chat_logs_no_delete/i, 'Phải DROP RULE chat_logs_no_delete cũ');
  // Kiểm tra tên hàm RPC
  assert.match(sql, /CREATE OR REPLACE FUNCTION public\.cleanup_expired_chat_logs/i, 'Phải tạo function cleanup_expired_chat_logs');
  // Kiểm tra khoảng thời gian 30 days
  assert.match(sql, /INTERVAL '30 days'/i, 'Phải dùng INTERVAL 30 days');
  // Kiểm tra SECURITY DEFINER
  assert.match(sql, /SECURITY DEFINER/i, 'Function phải là SECURITY DEFINER');
  // Kiểm tra phân quyền: REVOKE anon, authenticated, PUBLIC; GRANT service_role
  assert.match(sql, /REVOKE DELETE, UPDATE ON TABLE public\.chat_logs FROM PUBLIC/i, 'Phải REVOKE DELETE, UPDATE từ PUBLIC');
  assert.match(sql, /GRANT DELETE ON TABLE public\.chat_logs TO service_role/i, 'Phải GRANT DELETE cho service_role');
  assert.match(sql, /REVOKE EXECUTE ON FUNCTION public\.cleanup_expired_chat_logs.*FROM anon, authenticated/i, 'Phải REVOKE EXECUTE function từ anon, authenticated');
  assert.match(sql, /GRANT EXECUTE ON FUNCTION public\.cleanup_expired_chat_logs.*TO service_role/i, 'Phải GRANT EXECUTE function cho service_role');
});

test('P05-004: 6. Static Code Invariant Audit on Cron Route & Cleanup Service', () => {
  assert.ok(fs.existsSync(cronRouteTsPath), 'Route cron phải tồn tại');
  const routeContent = fs.readFileSync(cronRouteTsPath, 'utf8');

  // Phải kiểm tra xác thực
  assert.match(routeContent, /verifyCleanupAuthorization/, 'Route phải kiểm tra xác thực cron');
  // Phải gọi executeChatLogCleanup
  assert.match(routeContent, /executeChatLogCleanup/, 'Route phải gọi executeChatLogCleanup');
  // Phải trả về 401 khi unauthorized
  assert.match(routeContent, /401/, 'Route phải trả về status 401 khi không có quyền');
  // Không được mock/fake
  assert.strictEqual(routeContent.includes('mock'), false, 'Route không được chứa mock');
});
