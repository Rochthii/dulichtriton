/**
 * ─────────────────────────────────────────────────────────────────────────────
 * P05-003: CHAT SESSIONS CLEANUP JOB VERIFICATION & PROOF SUITE
 * Du Lịch Tri Tôn AI Assistant System
 * 
 * PHẠM VI & MỤC TIÊU NGHIỆM THU:
 * - Tạo job xóa chat_sessions hết hạn.
 * - PROOF BẮT BUỘC: Fixture expired bị xóa sạch trong khi active fixture được bảo toàn,
 *   tuân thủ chuẩn mực 24h retention từ Decision Record G3.
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

const cleanupServiceTsPath = path.resolve(__dirname, '../src/lib/chatSessionCleanupService.ts');
const cronRouteTsPath = path.resolve(__dirname, '../src/app/api/v1/cron/cleanup-chat-sessions/route.ts');
const migrationSqlPath = path.resolve(__dirname, '../../supabase/migrations/20261002_p05_003_cleanup_expired_chat_sessions.sql');

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
      if (id === './chatSessionRetentionPolicy') {
        const target = path.resolve(__dirname, '../src/lib/chatSessionRetentionPolicy.ts');
        return loadModule(target, customResolver);
      }
      if (id === './chatDataInventory') {
        const target = path.resolve(__dirname, '../src/lib/chatDataInventory.ts');
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
  executeChatSessionCleanup,
  verifyCleanupAuthorization
} = cleanupService;

/**
 * Mock Client Supabase cho mục đích kiểm chứng thao tác cơ sở dữ liệu
 */
function createMockSupabaseDatabase(initialSessions) {
  const store = new Map(initialSessions.map((s) => [s.session_id, { ...s }]));

  return {
    store,
    client: {
      rpc: async (fnName, params) => {
        if (fnName === 'cleanup_expired_chat_sessions') {
          const limit = params?.p_batch_limit ?? 1000;
          const now = Date.now();
          const cutoff = now - 24 * 60 * 60 * 1000;

          const expired = Array.from(store.values())
            .filter((s) => new Date(s.updated_at).getTime() < cutoff)
            .sort((a, b) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime())
            .slice(0, limit);

          for (const s of expired) {
            store.delete(s.session_id);
          }

          return { data: expired.length, error: null };
        }
        return { data: null, error: new Error(`Unknown RPC ${fnName}`) };
      },
      from: (tableName) => {
        if (tableName !== 'chat_sessions') {
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
              if (inCol === 'session_id' && Array.isArray(inVals)) {
                for (const id of inVals) {
                  if (store.has(id)) {
                    deletedRows.push({ session_id: id });
                    store.delete(id);
                  }
                }
              }
              resolve({ data: deletedRows, error: null });
              return;
            }

            let results = Array.from(store.values());
            if (ltCol === 'updated_at' && ltVal) {
              const cutoffTime = new Date(ltVal).getTime();
              results = results.filter((s) => new Date(s.updated_at).getTime() < cutoffTime);
            }
            if (orderCol === 'updated_at') {
              results.sort((a, b) => {
                const diff = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
                return orderAsc ? diff : -diff;
              });
            }
            results = results.slice(0, limitVal);

            if (selectedCols === 'session_id') {
              results = results.map((r) => ({ session_id: r.session_id }));
            }
            resolve({ data: results, error: null });
          }
        };

        return builder;
      }
    }
  };
}

test('P05-003: 1. Proof: Expired Chat Session Fixtures Are Deleted While Active Fixtures Are Preserved', async () => {
  const now = Date.now();
  const ONE_HOUR = 60 * 60 * 1000;

  const fixtures = [
    {
      session_id: 'session_expired_25h',
      turns: [{ role: 'user', content: 'Hỏi về chùa Tà Pạ' }],
      created_at: new Date(now - 30 * ONE_HOUR).toISOString(),
      updated_at: new Date(now - 25 * ONE_HOUR).toISOString(), // > 24h -> EXPIRED
    },
    {
      session_id: 'session_expired_72h',
      turns: [{ role: 'user', content: 'Hỏi về gà đốt Ô Thum' }],
      created_at: new Date(now - 80 * ONE_HOUR).toISOString(),
      updated_at: new Date(now - 72 * ONE_HOUR).toISOString(), // > 24h -> EXPIRED
    },
    {
      session_id: 'session_active_1h',
      turns: [{ role: 'user', content: 'Hỏi về bún cá củ ngải' }],
      created_at: new Date(now - 2 * ONE_HOUR).toISOString(),
      updated_at: new Date(now - 1 * ONE_HOUR).toISOString(), // < 24h -> ACTIVE
    },
    {
      session_id: 'session_active_23h',
      turns: [{ role: 'user', content: 'Hỏi đường lên đồi Tức Dụp' }],
      created_at: new Date(now - 24 * ONE_HOUR).toISOString(),
      updated_at: new Date(now - 23 * ONE_HOUR).toISOString(), // < 24h -> ACTIVE
    },
  ];

  const { store, client } = createMockSupabaseDatabase(fixtures);
  assert.strictEqual(store.size, 4, 'Ban đầu có 4 session fixtures');

  // Chạy cleanup job
  const result = await executeChatSessionCleanup({
    supabaseClient: client,
    batchLimit: 1000
  });

  // Kiểm chứng PROOF
  assert.strictEqual(result.success, true, 'Cleanup job phải thành công');
  assert.strictEqual(result.deletedCount, 2, 'Proof: Đúng 2 session expired phải bị xóa');
  assert.strictEqual(store.size, 2, 'Store còn lại chính xác 2 active sessions');

  // Kiểm tra từng fixture
  assert.strictEqual(store.has('session_expired_25h'), false, 'Proof: session_expired_25h phải bị xóa sạch');
  assert.strictEqual(store.has('session_expired_72h'), false, 'Proof: session_expired_72h phải bị xóa sạch');
  assert.strictEqual(store.has('session_active_1h'), true, 'Proof: session_active_1h phải được bảo toàn');
  assert.strictEqual(store.has('session_active_23h'), true, 'Proof: session_active_23h phải được bảo toàn');
});

test('P05-003: 2. Sliding Window Preservation Proof (Recent Turn Protects Old Session)', async () => {
  const now = Date.now();
  const ONE_HOUR = 60 * 60 * 1000;

  // Session được tạo 50 giờ trước, nhưng du khách vừa hỏi thêm 30 phút trước
  const fixtures = [
    {
      session_id: 'session_sliding_window_active',
      turns: [
        { role: 'user', content: 'Câu hỏi từ hôm kia' },
        { role: 'user', content: 'Câu hỏi mới cách đây 30 phút' }
      ],
      created_at: new Date(now - 50 * ONE_HOUR).toISOString(),
      updated_at: new Date(now - 0.5 * ONE_HOUR).toISOString(), // < 24h nhờ sliding window
    }
  ];

  const { store, client } = createMockSupabaseDatabase(fixtures);

  const result = await executeChatSessionCleanup({
    supabaseClient: client
  });

  assert.strictEqual(result.deletedCount, 0, 'Sliding window session không được bị xóa');
  assert.strictEqual(store.has('session_sliding_window_active'), true, 'Session phải được giữ nguyên');
});

test('P05-003: 3. Batch Limit Safeguard Invariant (Bảo vệ I/O không nghẽn database)', async () => {
  const now = Date.now();
  const ONE_HOUR = 60 * 60 * 1000;

  // Tạo 10 expired sessions
  const fixtures = Array.from({ length: 10 }, (_, i) => ({
    session_id: `expired_batch_${i}`,
    turns: [],
    created_at: new Date(now - (30 + i) * ONE_HOUR).toISOString(),
    updated_at: new Date(now - (30 + i) * ONE_HOUR).toISOString(),
  }));

  const { store, client } = createMockSupabaseDatabase(fixtures);

  // Chạy với batchLimit = 4
  const result = await executeChatSessionCleanup({
    supabaseClient: client,
    batchLimit: 4
  });

  assert.strictEqual(result.deletedCount, 4, 'Chỉ được xóa tối đa 4 sessions trong batch đầu');
  assert.strictEqual(store.size, 6, 'Store còn lại 6 sessions cho các batch kế tiếp');
});

test('P05-003: 4. Cron Authorization Security Gate (Fail-Closed Token Verification)', () => {
  const secret = 'super_secret_cron_token_2026';

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

test('P05-003: 5. Database Migration DDL Audit Invariant (cleanup_expired_chat_sessions)', () => {
  assert.ok(fs.existsSync(migrationSqlPath), 'Migration SQL phải tồn tại');
  const sql = fs.readFileSync(migrationSqlPath, 'utf8');

  // Kiểm tra tên hàm
  assert.match(sql, /CREATE OR REPLACE FUNCTION public\.cleanup_expired_chat_sessions/i);
  // Kiểm tra khoảng thời gian 24h
  assert.match(sql, /INTERVAL '24 hours'/i);
  // Kiểm tra SECURITY DEFINER
  assert.match(sql, /SECURITY DEFINER/i);
  // Kiểm tra phân quyền: REVOKE anon, authenticated; GRANT service_role
  assert.match(sql, /REVOKE EXECUTE ON FUNCTION public\.cleanup_expired_chat_sessions.*FROM anon, authenticated/i);
  assert.match(sql, /GRANT EXECUTE ON FUNCTION public\.cleanup_expired_chat_sessions.*TO service_role/i);
});

test('P05-003: 6. Static Code Invariant Audit on Cron Route & Cleanup Service', () => {
  assert.ok(fs.existsSync(cronRouteTsPath), 'Route cron phải tồn tại');
  const routeContent = fs.readFileSync(cronRouteTsPath, 'utf8');

  // Phải kiểm tra xác thực
  assert.match(routeContent, /verifyCleanupAuthorization/, 'Route phải kiểm tra xác thực cron');
  // Phải gọi executeChatSessionCleanup
  assert.match(routeContent, /executeChatSessionCleanup/, 'Route phải gọi executeChatSessionCleanup');
  // Phải trả về 401 khi unauthorized
  assert.match(routeContent, /401/, 'Route phải trả về status 401 khi không có quyền');
  // Không được mock/fake
  assert.strictEqual(routeContent.includes('mock'), false, 'Route không được chứa mock');
});
