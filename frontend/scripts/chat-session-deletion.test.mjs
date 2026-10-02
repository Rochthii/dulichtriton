/**
 * ─────────────────────────────────────────────────────────────────────────────
 * P05-005: CHAT SESSION OWNER DELETION & OWNERSHIP PROOF SUITE
 * Du Lịch Tri Tôn AI Assistant System
 * 
 * PHẠM VI & MỤC TIÊU NGHIỆM THU:
 * - Tạo endpoint và workflow xóa một session của chủ sở hữu (Right to Erasure).
 * - PROOF BẮT BUỘC: Ownership test pass:
 *   1. Chủ sở hữu hợp pháp (đúng session_id + HMAC token) xóa thành công phiên của mình.
 *   2. Kẻ tấn công (sai token, thiếu token, tráo token phiên khác) bị từ chối 403 Forbidden
 *      và phiên của nạn nhân được bảo toàn 100% không bị xóa.
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

const deletionServiceTsPath = path.resolve(__dirname, '../src/lib/chatSessionDeletionService.ts');
const sessionRouteTsPath = path.resolve(__dirname, '../src/app/api/v1/chat/session/route.ts');

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
        const target = path.resolve(__dirname, '../src/lib/sessionIdentifierContract.ts');
        return loadModule(target, customResolver);
      }
      if (id === '@/lib/chatSessionOwnership') {
        const target = path.resolve(__dirname, '../src/lib/chatSessionOwnership.ts');
        return loadModule(target, customResolver);
      }
      if (id.startsWith('@/lib/')) {
        const rel = id.replace('@/lib/', '');
        const target = path.resolve(__dirname, '../src/lib', rel.endsWith('.ts') ? rel : `${rel}.ts`);
        if (fs.existsSync(target)) {
          return loadModule(target, customResolver);
        }
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

const deletionService = loadModule(deletionServiceTsPath);
const {
  executeChatSessionDeletion,
  validateSessionId,
  verifySessionOwnershipToken,
  extractSessionOwnershipToken,
  createSessionOwnershipToken
} = deletionService;

/**
 * Mock Client Supabase cho thao tác kiểm chứng xóa session
 */
function createMockSupabaseDatabase(initialSessions) {
  const store = new Map(initialSessions.map((s) => [s.session_id, { ...s }]));

  return {
    store,
    client: {
      from: (tableName) => {
        if (tableName !== 'chat_sessions') {
          throw new Error(`Unexpected table: ${tableName}`);
        }

        let isDelete = false;
        let eqCol = null;
        let eqVal = null;
        let selectedCols = '*';

        const builder = {
          select: (cols) => {
            selectedCols = cols;
            return builder;
          },
          delete: () => {
            isDelete = true;
            return builder;
          },
          eq: (col, val) => {
            eqCol = col;
            eqVal = val;
            return builder;
          },
          then: (resolve) => {
            if (isDelete) {
              const deletedRows = [];
              if (eqCol === 'session_id' && eqVal && store.has(eqVal)) {
                deletedRows.push({ session_id: eqVal });
                store.delete(eqVal);
              }
              resolve({ data: deletedRows, error: null });
              return;
            }

            if (eqCol === 'session_id' && eqVal) {
              const row = store.get(eqVal);
              resolve({ data: row ? [row] : [], error: null });
              return;
            }

            resolve({ data: Array.from(store.values()), error: null });
          }
        };

        return builder;
      }
    }
  };
}

test('P05-005: 1. Proof: Valid Owner Can Delete Their Chat Session (Ownership Authentication Pass & Row Eviction)', async () => {
  const aliceSessionId = 'c7e8a932-d15f-4a3e-b873-a1b2c3d4e5f6';
  const fixtures = [
    {
      session_id: aliceSessionId,
      turns: [{ role: 'user', content: 'Tôi muốn tìm quán bún cá ngon ở Tri Tôn' }],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  ];

  const { store, client } = createMockSupabaseDatabase(fixtures);
  assert.strictEqual(store.size, 1, 'Ban đầu phiên của Alice tồn tại trong store');

  // Sinh token sở hữu hợp lệ cho Alice
  const aliceToken = createSessionOwnershipToken(aliceSessionId);

  // Thực thi yêu cầu xóa phiên với token hợp lệ
  const result = await executeChatSessionDeletion({
    sessionId: aliceSessionId,
    candidateToken: aliceToken,
    supabaseClient: client
  });

  // Kiểm chứng PROOF
  assert.strictEqual(result.success, true, 'Xóa phiên của chủ sở hữu phải thành công');
  assert.strictEqual(result.deleted, true, 'Cờ deleted phải là true');
  assert.strictEqual(result.status, 200, 'HTTP status code phải là 200 OK');
  assert.strictEqual(result.sessionId, aliceSessionId, 'SessionId trả về phải khớp');
  assert.strictEqual(store.has(aliceSessionId), false, 'Proof: Phiên của Alice phải bị xóa sạch khỏi database');
  assert.strictEqual(store.size, 0, 'Store database phải rỗng sau khi xóa');
});

test('P05-005: 2. Proof: Attacker with Wrong Token Is Rejected with 403 & Victim Row Is Preserved', async () => {
  const bobSessionId = 'e2b3c4d5-6789-4abc-aef0-123456789abc';
  const fixtures = [
    {
      session_id: bobSessionId,
      turns: [{ role: 'user', content: 'Thông tin lịch sử đồi Tức Dụp' }],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  ];

  const { store, client } = createMockSupabaseDatabase(fixtures);

  // Kẻ tấn công dùng token giả mạo
  const fakeToken = 'attacker_forged_token_0123456789abcdef0123456789abcdef0123456789abcdef';

  const result = await executeChatSessionDeletion({
    sessionId: bobSessionId,
    candidateToken: fakeToken,
    supabaseClient: client
  });

  // Kiểm chứng PROOF
  assert.strictEqual(result.success, false, 'Yêu cầu của kẻ tấn công phải thất bại');
  assert.strictEqual(result.deleted, false, 'Không được phép xóa');
  assert.strictEqual(result.status, 403, 'Phải trả về 403 Forbidden');
  assert.strictEqual(result.error, 'INVALID_SESSION_OWNERSHIP', 'Mã lỗi phải là INVALID_SESSION_OWNERSHIP');
  assert.strictEqual(store.has(bobSessionId), true, 'Proof: Phiên của nạn nhân Bob phải được bảo toàn nguyên vẹn');
});

test('P05-005: 3. Proof: Attacker with Missing/Empty/Null Token Is Rejected with 403 & Victim Row Is Preserved', async () => {
  const victimSessionId = 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d';
  const fixtures = [
    {
      session_id: victimSessionId,
      turns: [{ role: 'user', content: 'Hỏi về chùa Xà Tón' }],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  ];

  const { store, client } = createMockSupabaseDatabase(fixtures);

  // 1. Token rỗng
  const resEmpty = await executeChatSessionDeletion({
    sessionId: victimSessionId,
    candidateToken: '',
    supabaseClient: client
  });
  assert.strictEqual(resEmpty.status, 403, 'Token rỗng phải bị từ chối 403');
  assert.strictEqual(store.has(victimSessionId), true, 'Phiên vẫn còn');

  // 2. Token null
  const resNull = await executeChatSessionDeletion({
    sessionId: victimSessionId,
    candidateToken: null,
    supabaseClient: client
  });
  assert.strictEqual(resNull.status, 403, 'Token null phải bị từ chối 403');
  assert.strictEqual(store.has(victimSessionId), true, 'Phiên vẫn còn');

  // 3. Token undefined
  const resUndefined = await executeChatSessionDeletion({
    sessionId: victimSessionId,
    candidateToken: undefined,
    supabaseClient: client
  });
  assert.strictEqual(resUndefined.status, 403, 'Token undefined phải bị từ chối 403');
  assert.strictEqual(store.has(victimSessionId), true, 'Proof: Phiên không bị xóa khi thiếu token');
});

test('P05-005: 4. Proof: Cross-Session Token Tampering (Charlie Token used for David Session) Is Rejected', async () => {
  const charlieSessionId = '33333333-3333-4333-8333-333333333333';
  const davidSessionId   = '44444444-4444-4444-8444-444444444444';

  const fixtures = [
    { session_id: charlieSessionId, turns: [] },
    { session_id: davidSessionId, turns: [] }
  ];

  const { store, client } = createMockSupabaseDatabase(fixtures);

  // Sinh token của Charlie nhưng cố dùng để xóa phiên của David
  const charlieToken = createSessionOwnershipToken(charlieSessionId);

  const result = await executeChatSessionDeletion({
    sessionId: davidSessionId,
    candidateToken: charlieToken,
    supabaseClient: client
  });

  assert.strictEqual(result.status, 403, 'Tráo token giữa các phiên phải bị từ chối 403');
  assert.strictEqual(result.error, 'INVALID_SESSION_OWNERSHIP');
  assert.strictEqual(store.has(davidSessionId), true, 'Phiên của David không bị xóa');
  assert.strictEqual(store.has(charlieSessionId), true, 'Phiên của Charlie không bị ảnh hưởng');
  assert.strictEqual(store.size, 2, 'Cả hai phiên đều được bảo toàn');
});

test('P05-005: 5. Proof: Malformed/Invalid Session ID Is Rejected with 400 Bad Request', async () => {
  const { client } = createMockSupabaseDatabase([]);

  // 1. Không phải UUID v4
  const res1 = await executeChatSessionDeletion({
    sessionId: 'invalid-non-uuid-string',
    candidateToken: 'any-token',
    supabaseClient: client
  });
  assert.strictEqual(res1.status, 400, 'Non-UUID phải bị từ chối 400');
  assert.strictEqual(res1.error, 'INVALID_SESSION_ID');

  // 2. Session ID rỗng
  const res2 = await executeChatSessionDeletion({
    sessionId: '',
    candidateToken: 'any-token',
    supabaseClient: client
  });
  assert.strictEqual(res2.status, 400, 'Session ID rỗng phải bị từ chối 400');
  assert.strictEqual(res2.error, 'MISSING_SESSION_ID');

  // 3. Session ID dạng số
  const res3 = await executeChatSessionDeletion({
    sessionId: 12345,
    candidateToken: 'any-token',
    supabaseClient: client
  });
  assert.strictEqual(res3.status, 400, 'Session ID kiểu dữ liệu sai phải bị từ chối 400');
});

test('P05-005: 6. Multi-Channel Transport Token Extraction (Header, Cookie, Body)', () => {
  const tokenExpected = 'test_token_secret_hex_123456';

  // 1. Từ Header: x-chat-session-token
  const reqHeader = {
    headers: {
      get: (h) => (h === 'x-chat-session-token' ? tokenExpected : null)
    }
  };
  assert.strictEqual(extractSessionOwnershipToken(reqHeader), tokenExpected);

  // 2. Từ Cookie: triton_chat_session_token (NextRequest style)
  const reqCookie = {
    cookies: {
      get: (c) => (c === 'triton_chat_session_token' ? { value: tokenExpected } : null)
    }
  };
  assert.strictEqual(extractSessionOwnershipToken(reqCookie), tokenExpected);

  // 3. Từ raw cookie header string
  const reqRawCookie = {
    headers: {
      get: (h) => (h === 'cookie' ? `other=abc; triton_chat_session_token=${tokenExpected}; foo=bar` : null)
    }
  };
  assert.strictEqual(extractSessionOwnershipToken(reqRawCookie), tokenExpected);

  // 4. Từ JSON body: session_token
  const reqNoHeader = {};
  const body = { session_token: tokenExpected };
  assert.strictEqual(extractSessionOwnershipToken(reqNoHeader, body), tokenExpected);
});

test('P05-005: 7. Static Code Invariant Audit on Route, Service and Production Path', () => {
  assert.ok(fs.existsSync(deletionServiceTsPath), 'chatSessionDeletionService.ts phải tồn tại');
  assert.ok(fs.existsSync(sessionRouteTsPath), 'Route /api/v1/chat/session/route.ts phải tồn tại');

  const routeContent = fs.readFileSync(sessionRouteTsPath, 'utf8');

  // Route phải export hàm DELETE
  assert.match(routeContent, /export async function DELETE/i, 'Route phải hỗ trợ phương thức DELETE');
  // Phải gọi executeChatSessionDeletion
  assert.match(routeContent, /executeChatSessionDeletion/, 'Route phải gọi executeChatSessionDeletion');
  // Phải dọn dẹp cookie
  assert.match(routeContent, /SESSION_TOKEN_COOKIE/, 'Route phải dọn dẹp cookie phiên khi xóa thành công');
  // Tuyệt đối không mock/fake
  assert.strictEqual(routeContent.includes('mock'), false, 'Route không được chứa mock');

  const serviceContent = fs.readFileSync(deletionServiceTsPath, 'utf8');
  assert.match(serviceContent, /validateSessionId/, 'Service phải kiểm tra UUID v4');
  assert.match(serviceContent, /verifySessionOwnershipToken/, 'Service phải kiểm thực HMAC token');
  assert.match(serviceContent, /\.delete\(\)/, 'Service phải thực thi lệnh delete trên Supabase');
  assert.strictEqual(serviceContent.includes('mock'), false, 'Service không được chứa mock');
});
