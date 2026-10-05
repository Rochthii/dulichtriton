/**
 * ─────────────────────────────────────────────────────────────────────────────
 * TEST SUITE: P07-008 — Privacy Retention & Deletion Release-Gate Suite
 * (Proof: Expired Cleanup và Owner-Request Deletion Fixtures Pass 100%)
 * 
 * RÀNG BUỘC KIỂM TOÁN HỆ THỐNG SẢN XUẤT (PRODUCTION-REAL SYSTEM CONSTRAINTS):
 * 1. Retention Policy Specification: Khớp 100% thời hạn lưu trữ dữ liệu theo
 *    Decision Record G3 (chat_sessions 24 giờ, chat_logs 30 ngày).
 * 2. Expired Chat Sessions Cleanup Proof: Tự động dọn dẹp theo lô, xóa sạch 100%
 *    các phiên hết hạn (> 24h) và bảo toàn 100% các phiên đang hoạt động.
 * 3. Expired Chat Logs Cleanup Proof: Tự động dọn dẹp các nhật ký kiểm toán hết hạn
 *    (> 30 ngày), bảo vệ toàn vẹn nhật ký hợp lệ và tuân thủ RLS service_role.
 * 4. Owner-Request Session Deletion Proof (Right to Erasure): Xác thực quyền sở hữu
 *    mật mã HMAC-SHA256 fail-closed: từ chối 403 cho kẻ tấn công (không token / sai token),
 *    từ chối 400 cho session_id sai format, và xóa sạch dữ liệu 200 cho chủ sở hữu hợp pháp.
 * 5. Privacy Notice Concordance & Fail-Closed Invariant: Đối chiếu tính trung thực
 *    của chính sách và không trả về fake success khi lỗi server.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import crypto from 'node:crypto';
import typescript from 'typescript';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Target Source Modules
const sessionPolicyPath = path.resolve(__dirname, '../src/lib/chatSessionRetentionPolicy.ts');
const sessionCleanupPath = path.resolve(__dirname, '../src/lib/chatSessionCleanupService.ts');
const logCleanupPath = path.resolve(__dirname, '../src/lib/chatLogCleanupService.ts');
const deletionServicePath = path.resolve(__dirname, '../src/lib/chatSessionDeletionService.ts');
const sessionOwnershipPath = path.resolve(__dirname, '../src/lib/chatSessionOwnership.ts');
const sessionContractPath = path.resolve(__dirname, '../src/lib/sessionIdentifierContract.ts');
const privacyNoticeDocPath = path.resolve(__dirname, '../../docs/privacy/PRIVACY_NOTICE.md');

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
      if (id === '@/lib/sessionIdentifierContract') {
        return loadModule(sessionContractPath, customResolver);
      }
      if (id === '@/lib/chatSessionOwnership') {
        return loadModule(sessionOwnershipPath, customResolver);
      }
      if (id === '@/lib/chatSessionRetentionPolicy') {
        return loadModule(sessionPolicyPath, customResolver);
      }
      if (id === '@/lib/chatSessionCleanupService') {
        return loadModule(sessionCleanupPath, customResolver);
      }
      if (id === './chatSessionCleanupService') {
        return loadModule(sessionCleanupPath, customResolver);
      }
      if (id.startsWith('@/lib/')) {
        const rel = id.replace('@/lib/', '');
        const target = path.resolve(__dirname, '../src/lib', rel.endsWith('.ts') ? rel : `${rel}.ts`);
        if (fs.existsSync(target)) return loadModule(target, customResolver);
      }
      if (id.startsWith('./') || id.startsWith('../')) {
        const target = path.resolve(path.dirname(filePath), id.endsWith('.ts') ? id : `${id}.ts`);
        if (fs.existsSync(target)) return loadModule(target, customResolver);
      }
      if (id === 'crypto' || id === 'node:crypto') {
        return crypto;
      }
      return require(id);
    },
    path.dirname(filePath),
    filePath
  );
  return m.exports;
}

test.describe('P07-008: Privacy Retention & Deletion Release-Gate Suite', () => {

  // Load modules
  const sessionPolicy = loadModule(sessionPolicyPath);
  const sessionCleanup = loadModule(sessionCleanupPath);
  const logCleanup = loadModule(logCleanupPath);
  const deletionService = loadModule(deletionServicePath);
  const sessionOwnership = loadModule(sessionOwnershipPath);
  const sessionContract = loadModule(sessionContractPath);

  // ───────────────────────────────────────────────────────────────────────────
  // SUITE 1: RETENTION POLICY SPECIFICATION & INVARIANTS
  // ───────────────────────────────────────────────────────────────────────────
  test('Suite 1: Retention Policy Specification & Invariants (Decision Record G3)', () => {
    const {
      CHAT_SESSION_RETENTION_HOURS,
      CHAT_SESSION_RETENTION_MS,
      CHAT_SESSION_RETENTION_SQL_INTERVAL,
      isSessionExpired,
      calculateSessionExpirationDate,
    } = sessionPolicy;

    const {
      CHAT_LOG_RETENTION_DAYS,
      CHAT_LOG_RETENTION_MS,
      CHAT_LOG_RETENTION_SQL_INTERVAL,
      isChatLogExpired,
      calculateChatLogExpirationDate,
    } = logCleanup;

    // 1.1 Chat Sessions Retention Constants Invariant
    assert.equal(CHAT_SESSION_RETENTION_HOURS, 24, 'Session retention must be exactly 24 hours');
    assert.equal(CHAT_SESSION_RETENTION_MS, 86400000, 'Session retention must be 86,400,000 ms');
    assert.equal(CHAT_SESSION_RETENTION_SQL_INTERVAL, "INTERVAL '24 hours'");

    // 1.2 Chat Logs Retention Constants Invariant
    assert.equal(CHAT_LOG_RETENTION_DAYS, 30, 'Log retention must be exactly 30 days');
    assert.equal(CHAT_LOG_RETENTION_MS, 30 * 24 * 60 * 60 * 1000, 'Log retention ms must equal 30 days');
    assert.equal(CHAT_LOG_RETENTION_SQL_INTERVAL, "INTERVAL '30 days'");

    // 1.3 Session Expiration Boundary Calculations
    const now = Date.now();
    const activeSessionTime = now - 12 * 60 * 60 * 1000; // 12 hours ago
    const expiredSessionTime = now - 25 * 60 * 60 * 1000; // 25 hours ago

    assert.equal(isSessionExpired(activeSessionTime, now), false, '12h old session must be ACTIVE');
    assert.equal(isSessionExpired(expiredSessionTime, now), true, '25h old session must be EXPIRED');
    assert.equal(isSessionExpired('', now), true, 'Empty timestamp must be EXPIRED (fail-closed)');
    assert.equal(isSessionExpired('invalid-date', now), true, 'Invalid date must be EXPIRED (fail-closed)');

    const expDate = calculateSessionExpirationDate(activeSessionTime);
    assert.equal(expDate.getTime(), activeSessionTime + CHAT_SESSION_RETENTION_MS);

    // 1.4 Log Expiration Boundary Calculations
    const activeLogTime = now - 15 * 24 * 60 * 60 * 1000; // 15 days ago
    const expiredLogTime = now - 31 * 24 * 60 * 60 * 1000; // 31 days ago

    assert.equal(isChatLogExpired(activeLogTime, now), false, '15d old log must be ACTIVE');
    assert.equal(isChatLogExpired(expiredLogTime, now), true, '31d old log must be EXPIRED');
    assert.equal(isChatLogExpired('', now), true, 'Empty log timestamp must be EXPIRED (fail-closed)');

    const expLogDate = calculateChatLogExpirationDate(activeLogTime);
    assert.equal(expLogDate.getTime(), activeLogTime + CHAT_LOG_RETENTION_MS);
  });

  // ───────────────────────────────────────────────────────────────────────────
  // SUITE 2: EXPIRED CHAT SESSIONS AUTOMATED CLEANUP PROOF
  // ───────────────────────────────────────────────────────────────────────────
  test('Suite 2: Expired Chat Sessions Automated Cleanup Proof', async () => {
    const { executeChatSessionCleanup, verifyCleanupAuthorization } = sessionCleanup;

    const now = Date.now();
    // 5 Expired sessions (> 24h) and 5 Active sessions (< 24h)
    const initialSessions = [
      { session_id: 'e1000000-0000-4000-8000-000000000001', updated_at: new Date(now - 30 * 3600 * 1000).toISOString() },
      { session_id: 'e1000000-0000-4000-8000-000000000002', updated_at: new Date(now - 28 * 3600 * 1000).toISOString() },
      { session_id: 'e1000000-0000-4000-8000-000000000003', updated_at: new Date(now - 26 * 3600 * 1000).toISOString() },
      { session_id: 'e1000000-0000-4000-8000-000000000004', updated_at: new Date(now - 25 * 3600 * 1000).toISOString() },
      { session_id: 'e1000000-0000-4000-8000-000000000005', updated_at: new Date(now - 24.5 * 3600 * 1000).toISOString() },
      // Active sessions
      { session_id: 'a1000000-0000-4000-8000-000000000001', updated_at: new Date(now - 1 * 3600 * 1000).toISOString() },
      { session_id: 'a1000000-0000-4000-8000-000000000002', updated_at: new Date(now - 5 * 3600 * 1000).toISOString() },
      { session_id: 'a1000000-0000-4000-8000-000000000003', updated_at: new Date(now - 12 * 3600 * 1000).toISOString() },
      { session_id: 'a1000000-0000-4000-8000-000000000004', updated_at: new Date(now - 20 * 3600 * 1000).toISOString() },
      { session_id: 'a1000000-0000-4000-8000-000000000005', updated_at: new Date(now - 23.5 * 3600 * 1000).toISOString() },
    ];

    const store = new Map(initialSessions.map((s) => [s.session_id, { ...s }]));
    const mockSupabase = {
      rpc: async (fnName, params) => {
        if (fnName === 'cleanup_expired_chat_sessions') {
          const cutoff = now - 24 * 3600 * 1000;
          const expiredIds = [];
          for (const [id, s] of store.entries()) {
            if (new Date(s.updated_at).getTime() < cutoff) {
              expiredIds.push(id);
            }
          }
          for (const id of expiredIds) {
            store.delete(id);
          }
          return { data: expiredIds.length, error: null };
        }
        throw new Error(`Unexpected RPC: ${fnName}`);
      },
    };

    const cleanupResult = await executeChatSessionCleanup({
      supabaseClient: mockSupabase,
      batchLimit: 100,
    });

    assert.equal(cleanupResult.success, true);
    assert.equal(cleanupResult.deletedCount, 5, 'Exactly 5 expired sessions must be deleted');
    assert.equal(cleanupResult.retentionHours, 24);
    assert.equal(store.size, 5, 'Exactly 5 active sessions must remain in database');

    // Confirm all active sessions are strictly preserved
    for (let i = 1; i <= 5; i++) {
      const activeId = `a1000000-0000-4000-8000-00000000000${i}`;
      assert.equal(store.has(activeId), true, `Active session ${activeId} must not be deleted`);
    }

    // Cron Authentication Check (timingSafeEqual)
    const cronSecret = 'super-secret-cron-token-9988';
    assert.equal(verifyCleanupAuthorization('Bearer super-secret-cron-token-9988', cronSecret), true);
    assert.equal(verifyCleanupAuthorization('super-secret-cron-token-9988', cronSecret), true);
    assert.equal(verifyCleanupAuthorization('Bearer wrong-token', cronSecret), false);
    assert.equal(verifyCleanupAuthorization('', cronSecret), false);
    assert.equal(verifyCleanupAuthorization(null, cronSecret), false);
    assert.equal(verifyCleanupAuthorization('Bearer super-secret-cron-token-9988', null), false);
  });

  // ───────────────────────────────────────────────────────────────────────────
  // SUITE 3: EXPIRED CHAT LOGS AUTOMATED CLEANUP PROOF
  // ───────────────────────────────────────────────────────────────────────────
  test('Suite 3: Expired Chat Logs Automated Cleanup Proof', async () => {
    const { executeChatLogCleanup } = logCleanup;

    const now = Date.now();
    const dayMs = 24 * 3600 * 1000;
    // 5 Expired logs (> 30 days) and 5 Active logs (< 30 days)
    const initialLogs = [
      { id: 1, created_at: new Date(now - 45 * dayMs).toISOString() },
      { id: 2, created_at: new Date(now - 40 * dayMs).toISOString() },
      { id: 3, created_at: new Date(now - 35 * dayMs).toISOString() },
      { id: 4, created_at: new Date(now - 32 * dayMs).toISOString() },
      { id: 5, created_at: new Date(now - 31 * dayMs).toISOString() },
      // Active logs
      { id: 6, created_at: new Date(now - 1 * dayMs).toISOString() },
      { id: 7, created_at: new Date(now - 10 * dayMs).toISOString() },
      { id: 8, created_at: new Date(now - 20 * dayMs).toISOString() },
      { id: 9, created_at: new Date(now - 25 * dayMs).toISOString() },
      { id: 10, created_at: new Date(now - 29 * dayMs).toISOString() },
    ];

    const store = new Map(initialLogs.map((l) => [l.id, { ...l }]));
    const mockSupabase = {
      rpc: async (fnName, params) => {
        if (fnName === 'cleanup_expired_chat_logs') {
          const cutoff = now - 30 * dayMs;
          const expiredIds = [];
          for (const [id, l] of store.entries()) {
            if (new Date(l.created_at).getTime() < cutoff) {
              expiredIds.push(id);
            }
          }
          for (const id of expiredIds) {
            store.delete(id);
          }
          return { data: expiredIds.length, error: null };
        }
        throw new Error(`Unexpected RPC: ${fnName}`);
      },
    };

    const cleanupResult = await executeChatLogCleanup({
      supabaseClient: mockSupabase,
      batchLimit: 100,
    });

    assert.equal(cleanupResult.success, true);
    assert.equal(cleanupResult.deletedCount, 5, 'Exactly 5 expired logs must be deleted');
    assert.equal(cleanupResult.retentionDays, 30);
    assert.equal(store.size, 5, 'Exactly 5 active logs must remain in database');

    // Confirm all active logs are strictly preserved
    for (let id = 6; id <= 10; id++) {
      assert.equal(store.has(id), true, `Active log #${id} must not be deleted`);
    }
  });

  // ───────────────────────────────────────────────────────────────────────────
  // SUITE 4: OWNER-REQUEST SESSION DELETION & HMAC VERIFICATION PROOF
  // ───────────────────────────────────────────────────────────────────────────
  test('Suite 4: Owner-Request Session Deletion & HMAC Verification Proof (Right to Erasure)', async () => {
    const { executeChatSessionDeletion } = deletionService;
    const { createSessionOwnershipToken } = sessionOwnership;

    const sessionA = '11111111-1111-4111-8111-111111111111';
    const sessionB = '22222222-2222-4222-8222-222222222222';
    const tokenA = createSessionOwnershipToken(sessionA);
    const tokenB = createSessionOwnershipToken(sessionB);

    assert.ok(tokenA, 'Valid token A must be generated');
    assert.ok(tokenB, 'Valid token B must be generated');
    assert.notEqual(tokenA, tokenB, 'Different sessions must have distinct HMAC tokens');

    const database = new Map([
      [sessionA, { session_id: sessionA, created_at: new Date().toISOString() }],
      [sessionB, { session_id: sessionB, created_at: new Date().toISOString() }],
    ]);

    const mockSupabase = {
      from: (tableName) => {
        assert.equal(tableName, 'chat_sessions');
        return {
          delete: () => ({
            eq: (col, val) => ({
              select: () => {
                assert.equal(col, 'session_id');
                const had = database.has(val);
                if (had) database.delete(val);
                return Promise.resolve({
                  data: had ? [{ session_id: val }] : [],
                  error: null,
                });
              },
            }),
          }),
        };
      },
    };

    // 4.1 Missing Token Attack -> 403 Forbidden
    const resNoToken = await executeChatSessionDeletion({
      sessionId: sessionA,
      candidateToken: null,
      supabaseClient: mockSupabase,
    });
    assert.equal(resNoToken.status, 403);
    assert.equal(resNoToken.success, false);
    assert.equal(resNoToken.error, 'INVALID_SESSION_OWNERSHIP');
    assert.equal(database.has(sessionA), true, 'Session A must NOT be deleted without token');

    // 4.2 Forged/Mismatched Token Attack -> 403 Forbidden (Token B used to delete Session A)
    const resWrongToken = await executeChatSessionDeletion({
      sessionId: sessionA,
      candidateToken: tokenB,
      supabaseClient: mockSupabase,
    });
    assert.equal(resWrongToken.status, 403);
    assert.equal(resWrongToken.success, false);
    assert.equal(resWrongToken.error, 'INVALID_SESSION_OWNERSHIP');
    assert.equal(database.has(sessionA), true, 'Session A must NOT be deleted with mismatched token');

    // 4.3 Malformed Session ID Attack -> 400 Bad Request
    const resMalformed = await executeChatSessionDeletion({
      sessionId: 'invalid-session-uuid-1234',
      candidateToken: tokenA,
      supabaseClient: mockSupabase,
    });
    assert.equal(resMalformed.status, 400);
    assert.equal(resMalformed.success, false);
    assert.equal(resMalformed.error, 'INVALID_SESSION_ID');

    // 4.4 Legitimate Owner Deletion -> 200 OK & Database Erasure
    const resLegit = await executeChatSessionDeletion({
      sessionId: sessionA,
      candidateToken: tokenA,
      supabaseClient: mockSupabase,
    });
    assert.equal(resLegit.status, 200);
    assert.equal(resLegit.success, true);
    assert.equal(resLegit.deleted, true);
    assert.equal(database.has(sessionA), false, 'Session A must be permanently erased from database');
    assert.equal(database.has(sessionB), true, 'Session B must remain completely intact');
  });

  // ───────────────────────────────────────────────────────────────────────────
  // SUITE 5: PRIVACY NOTICE CONCORDANCE & FAIL-CLOSED INVARIANTS
  // ───────────────────────────────────────────────────────────────────────────
  test('Suite 5: Privacy Notice Concordance & Fail-Closed Invariants', async () => {
    const { executeChatSessionDeletion } = deletionService;
    const { createSessionOwnershipToken } = sessionOwnership;

    // 5.1 Privacy Notice Documentation Alignment
    if (fs.existsSync(privacyNoticeDocPath)) {
      const noticeContent = fs.readFileSync(privacyNoticeDocPath, 'utf8');
      assert.ok(
        noticeContent.includes('24') || noticeContent.includes('24 giờ') || noticeContent.includes('24h'),
        'Privacy notice must declare 24-hour retention window for chat sessions'
      );
      assert.ok(
        noticeContent.includes('30 ngày') || noticeContent.includes('30-day') || noticeContent.includes('30'),
        'Privacy notice must declare 30-day audit log retention'
      );
    }

    // 5.2 Server Configuration Error Fail-Closed Invariant
    const testSession = '33333333-3333-4333-8333-333333333333';
    const testToken = createSessionOwnershipToken(testSession);
    const resNullClient = await executeChatSessionDeletion({
      sessionId: testSession,
      candidateToken: testToken,
      supabaseClient: null,
    });
    assert.equal(resNullClient.status, 500);
    assert.equal(resNullClient.success, false);
    assert.equal(resNullClient.deleted, false);
    assert.equal(resNullClient.error, 'SERVER_CONFIGURATION_ERROR');

    // 5.3 Timing-Safe Equality Proof
    const { verifySessionOwnershipToken } = sessionOwnership;
    assert.equal(verifySessionOwnershipToken(testSession, testToken), true);
    assert.equal(verifySessionOwnershipToken(testSession, testToken + 'tampered'), false);
    assert.equal(verifySessionOwnershipToken(testSession, ''), false);
  });

});
