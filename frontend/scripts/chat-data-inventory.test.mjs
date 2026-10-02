/**
 * ─────────────────────────────────────────────────────────────────────────────
 * P05-001: CHAT DATA INVENTORY VERIFICATION & PROOF SUITE
 * Du Lịch Tri Tôn AI Assistant System
 * 
 * PHẠM VI & MỤC TIÊU NGHIỆM THU:
 * - Lập data inventory cho một field chat (public.chat_sessions.session_id).
 * - PROOF BẮT BUỘC: field, purpose, retention, access role được ghi nhận rõ ràng,
 *   khớp 100% với RLS Matrix, Migration DDL và văn bản quy chuẩn kỹ thuật.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import typescript from 'typescript';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const chatDataInventoryTsPath = path.resolve(__dirname, '../src/lib/chatDataInventory.ts');
const chatDataInventoryMdPath = path.resolve(__dirname, '../../docs/technical-spec/CHAT_DATA_INVENTORY.md');
const migrationCreateSessionsPath = path.resolve(__dirname, '../../supabase/migrations/20260809_create_chat_sessions.sql');
const migrationRevokeSelectPath = path.resolve(__dirname, '../../supabase/migrations/20260924140500_p02_014_chat_sessions_revoke_anon_select.sql');
const migrationRevokeInsertPath = path.resolve(__dirname, '../../supabase/migrations/20260924141700_p02_015_chat_sessions_revoke_anon_insert.sql');

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
      if (id.startsWith('./') || id.startsWith('../')) {
        const target = path.resolve(path.dirname(filePath), id.endsWith('.ts') ? id : `${id}.ts`);
        if (fs.existsSync(target)) {
          return loadModule(target, customResolver);
        }
      }
      return {};
    },
    path.dirname(filePath),
    filePath
  );
  return m.exports;
}

const chatDataInventoryModule = loadModule(chatDataInventoryTsPath);
const {
  CANONICAL_CHAT_SESSION_ID_INVENTORY,
  REGISTERED_CHAT_FIELD_INVENTORIES,
  getChatFieldInventory,
  validateFieldInventory
} = chatDataInventoryModule;

test('P05-001: 1. Canonical Chat Field Inventory Completeness Proof (Proof of Field, Purpose, Retention, Access Role)', () => {
  assert.ok(CANONICAL_CHAT_SESSION_ID_INVENTORY, 'Phải tồn tại bản ghi CANONICAL_CHAT_SESSION_ID_INVENTORY');

  // 1. Kiểm chứng FIELD
  assert.strictEqual(
    CANONICAL_CHAT_SESSION_ID_INVENTORY.field,
    'public.chat_sessions.session_id',
    'Proof Field: Tên trường phải là public.chat_sessions.session_id'
  );
  assert.strictEqual(CANONICAL_CHAT_SESSION_ID_INVENTORY.table, 'public.chat_sessions');
  assert.strictEqual(CANONICAL_CHAT_SESSION_ID_INVENTORY.columnName, 'session_id');
  assert.strictEqual(CANONICAL_CHAT_SESSION_ID_INVENTORY.dataType, 'TEXT');
  assert.strictEqual(CANONICAL_CHAT_SESSION_ID_INVENTORY.isPrimaryKey, true);
  assert.strictEqual(CANONICAL_CHAT_SESSION_ID_INVENTORY.dataClassification, 'PSEUDONYMOUS');

  // 2. Kiểm chứng PURPOSE
  assert.ok(
    typeof CANONICAL_CHAT_SESSION_ID_INVENTORY.purpose === 'string',
    'Proof Purpose: Mục đích phải là kiểu chuỗi'
  );
  assert.ok(
    CANONICAL_CHAT_SESSION_ID_INVENTORY.purpose.length > 50,
    'Proof Purpose: Mục đích phải được mô tả chi tiết, rõ ràng (> 50 ký tự)'
  );
  assert.match(
    CANONICAL_CHAT_SESSION_ID_INVENTORY.purpose,
    /ngữ cảnh|multi-turn|cô lập phiên|quyền sở hữu/i,
    'Proof Purpose: Phải bao hàm duy trì ngữ cảnh hoặc cô lập phiên'
  );

  // 3. Kiểm chứng RETENTION
  assert.ok(CANONICAL_CHAT_SESSION_ID_INVENTORY.retention, 'Proof Retention: Phải có cấu hình retention');
  assert.strictEqual(CANONICAL_CHAT_SESSION_ID_INVENTORY.retention.ttlHours, 24, 'Proof Retention: TTL phải là 24 giờ');
  assert.strictEqual(CANONICAL_CHAT_SESSION_ID_INVENTORY.retention.unit, 'hours');
  assert.ok(
    CANONICAL_CHAT_SESSION_ID_INVENTORY.retention.description.length > 30,
    'Proof Retention: Phải có mô tả cơ chế thu hồi/xóa phiên'
  );
  assert.match(
    CANONICAL_CHAT_SESSION_ID_INVENTORY.retention.indexReference,
    /chat_sessions_updated_at_idx/,
    'Proof Retention: Phải tham chiếu chỉ mục updated_at'
  );

  // 4. Kiểm chứng ACCESS ROLE
  assert.ok(CANONICAL_CHAT_SESSION_ID_INVENTORY.accessRoles, 'Proof Access Role: Phải có cấu hình accessRoles');
  const roles = ['anon', 'authenticated', 'serviceRole', 'admin'];
  for (const role of roles) {
    assert.ok(CANONICAL_CHAT_SESSION_ID_INVENTORY.accessRoles[role], `Phải định nghĩa quyền cho role: ${role}`);
    assert.ok(
      typeof CANONICAL_CHAT_SESSION_ID_INVENTORY.accessRoles[role].allowed === 'boolean',
      `Role ${role} phải có cờ boolean allowed`
    );
  }
});

test('P05-001: 2. Access Role Invariant Concordance Proof (Proof of RLS & Migration Alignment)', () => {
  const roles = CANONICAL_CHAT_SESSION_ID_INVENTORY.accessRoles;

  // Vai trò anon bị tước đoạt toàn bộ quyền (Zero Direct Access)
  assert.strictEqual(roles.anon.allowed, false, 'Anon tuyệt đối không được phép truy cập trực tiếp');
  assert.deepStrictEqual(roles.anon.permissions, [], 'Anon permissions phải là mảng rỗng');
  assert.match(roles.anon.enforcement, /REVOKE.*FROM anon/i, 'Anon enforcement phải ghi nhận thu hồi quyền');

  // Vai trò authenticated
  assert.strictEqual(roles.authenticated.allowed, false, 'Authenticated client không được truy vấn thô tự do');

  // Vai trò serviceRole
  assert.strictEqual(roles.serviceRole.allowed, true, 'serviceRole được phép truy cập từ backend');
  assert.ok(roles.serviceRole.permissions.includes('SELECT'), 'serviceRole phải có quyền SELECT');
  assert.ok(roles.serviceRole.permissions.includes('INSERT'), 'serviceRole phải có quyền INSERT');

  // Đối chiếu với các file migration DDL thực tế
  const revokeSelectSql = fs.readFileSync(migrationRevokeSelectPath, 'utf8');
  assert.match(
    revokeSelectSql,
    /REVOKE SELECT ON TABLE public\.chat_sessions FROM anon;/i,
    'Migration DDL P02-014 phải tồn tại lệnh REVOKE SELECT FROM anon'
  );

  const revokeInsertSql = fs.readFileSync(migrationRevokeInsertPath, 'utf8');
  assert.match(
    revokeInsertSql,
    /REVOKE INSERT ON TABLE public\.chat_sessions FROM anon;/i,
    'Migration DDL P02-015 phải tồn tại lệnh REVOKE INSERT FROM anon'
  );
});

test('P05-001: 3. Retention Policy & Database Schema Concordance Proof', () => {
  const retention = CANONICAL_CHAT_SESSION_ID_INVENTORY.retention;

  assert.strictEqual(retention.ttlHours, 24, 'Thời hạn lưu trữ phải là 24h');
  assert.match(retention.duration, /24 hours/i, 'Duration chuỗi phải là 24 hours');

  // Đọc migration tạo bảng chat_sessions
  const createSessionsSql = fs.readFileSync(migrationCreateSessionsPath, 'utf8');
  assert.match(
    createSessionsSql,
    /chat_sessions_updated_at_idx/i,
    'Migration schema phải có index chat_sessions_updated_at_idx phục vụ cleanup TTL'
  );
  assert.match(
    createSessionsSql,
    /trg_chat_sessions_updated_at/i,
    'Migration schema phải có trigger tự động cập nhật updated_at'
  );
});

test('P05-001: 4. Markdown Specification Document Concordance Proof (CHAT_DATA_INVENTORY.md)', () => {
  assert.ok(fs.existsSync(chatDataInventoryMdPath), 'Tài liệu CHAT_DATA_INVENTORY.md phải tồn tại');
  const mdContent = fs.readFileSync(chatDataInventoryMdPath, 'utf8');

  // Kiểm tra mã quy chuẩn
  assert.match(mdContent, /DATA-INVENTORY-CHAT-001/, 'Tài liệu phải có mã đặc tả DATA-INVENTORY-CHAT-001');
  assert.match(mdContent, /P05-001/, 'Tài liệu phải dẫn chiếu task P05-001');

  // Kiểm tra có đủ 4 tiêu chuẩn cốt lõi của Proof
  assert.match(mdContent, /public\.chat_sessions\.session_id/, 'Tài liệu phải có tên field');
  assert.match(mdContent, /Mục Đích Xử Lý|Purpose/i, 'Tài liệu phải có mục đích');
  assert.match(mdContent, /Thời Hạn Lưu Trữ|Retention/i, 'Tài liệu phải có thời hạn lưu trữ');
  assert.match(mdContent, /Phân Quyền Vai Trò|Access Role/i, 'Tài liệu phải có phân quyền vai trò');

  // Kiểm tra bảng RLS Matrix trong tài liệu
  assert.match(mdContent, /`anon`.*DENY/i, 'Tài liệu phải khẳng định DENY anon');
  assert.match(mdContent, /`service_role`.*ALLOW/i, 'Tài liệu phải khẳng định ALLOW service_role');
});

test('P05-001: 5. Fail-Closed Inventory Validation Gate Enforcement Proof', () => {
  // 1. Positive case: canonical item hợp lệ 100%
  const validResult = validateFieldInventory(CANONICAL_CHAT_SESSION_ID_INVENTORY);
  assert.strictEqual(validResult.valid, true, 'Canonical item phải hợp lệ');
  assert.strictEqual(validResult.errors.length, 0, 'Không được có lỗi');

  // 2. Negative case: null / undefined
  assert.strictEqual(validateFieldInventory(null).valid, false);
  assert.strictEqual(validateFieldInventory(undefined).valid, false);

  // 3. Negative case: Thiếu field
  const missingField = { ...CANONICAL_CHAT_SESSION_ID_INVENTORY, field: '' };
  const res1 = validateFieldInventory(missingField);
  assert.strictEqual(res1.valid, false);
  assert.ok(res1.errors.some((e) => e.includes('field')));

  // 4. Negative case: Thiếu purpose
  const missingPurpose = { ...CANONICAL_CHAT_SESSION_ID_INVENTORY, purpose: 'ngắn' };
  const res2 = validateFieldInventory(missingPurpose);
  assert.strictEqual(res2.valid, false);
  assert.ok(res2.errors.some((e) => e.includes('purpose')));

  // 5. Negative case: Sai ttlHours
  const invalidTtl = {
    ...CANONICAL_CHAT_SESSION_ID_INVENTORY,
    retention: { ...CANONICAL_CHAT_SESSION_ID_INVENTORY.retention, ttlHours: -5 }
  };
  const res3 = validateFieldInventory(invalidTtl);
  assert.strictEqual(res3.valid, false);
  assert.ok(res3.errors.some((e) => e.includes('ttlHours')));

  // 6. Negative case: Thiếu role trong accessRoles
  const missingRole = {
    ...CANONICAL_CHAT_SESSION_ID_INVENTORY,
    accessRoles: {
      anon: CANONICAL_CHAT_SESSION_ID_INVENTORY.accessRoles.anon,
      authenticated: CANONICAL_CHAT_SESSION_ID_INVENTORY.accessRoles.authenticated,
      // thiếu serviceRole và admin
    }
  };
  const res4 = validateFieldInventory(missingRole);
  assert.strictEqual(res4.valid, false);
  assert.ok(res4.errors.some((e) => e.includes('serviceRole')));
});

test('P05-001: 6. Lookup & Registry Concordance Proof', () => {
  assert.strictEqual(REGISTERED_CHAT_FIELD_INVENTORIES.length, 1, 'Hiện có 1 canonical item đã đăng ký');

  // Tra cứu theo tên cột
  const byCol = getChatFieldInventory('public.chat_sessions', 'session_id');
  assert.ok(byCol, 'Phải tìm thấy theo tên cột session_id');
  assert.strictEqual(byCol.id, 'INV-CHAT-SESSIONS-SESSION-ID-001');

  // Tra cứu theo full field path
  const byFull = getChatFieldInventory('public.chat_sessions', 'public.chat_sessions.session_id');
  assert.ok(byFull, 'Phải tìm thấy theo full field path');
  assert.strictEqual(byFull.id, 'INV-CHAT-SESSIONS-SESSION-ID-001');

  // Tra cứu không phân biệt hoa thường
  const byCase = getChatFieldInventory('PUBLIC.CHAT_SESSIONS', 'SESSION_ID');
  assert.ok(byCase, 'Phải tìm thấy khi hoa thường');

  // Tra cứu trường không tồn tại
  const byUnknown = getChatFieldInventory('public.chat_sessions', 'non_existent_column');
  assert.strictEqual(byUnknown, null, 'Trường không tồn tại phải trả về null');
});
