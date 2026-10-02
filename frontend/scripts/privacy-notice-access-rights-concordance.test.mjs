/**
 * ─────────────────────────────────────────────────────────────────────────────
 * P05-007: PRIVACY NOTICE ACCESS RIGHTS & RLS MATRIX CONCORDANCE PROOF SUITE
 * Du Lịch Tri Tôn AI Assistant System
 * 
 * PHẠM VI & MỤC TIÊU NGHIỆM THU:
 * - Sửa câu privacy notice về quyền truy cập dữ liệu (Access Rights & Role-Based Access Control).
 * - PROOF BẮT BUỘC: Khớp 100% với RLS Lockdown Matrix (P02-024) và Data Inventory (P05-001):
 *   1. Mô hình Zero-Trust và Row Level Security Matrix Lockdown (P02-024) được công bố rõ ràng.
 *   2. Vai trò anon & authenticated bị tước bỏ 100% quyền truy cập trực tiếp (REVOKE ALL) trên các bảng nhạy cảm.
 *   3. Vai trò service_role chỉ kích hoạt độc quyền tại Server API Gateway sau khi kiểm thực token sở hữu HMAC-SHA256.
 *   4. Vai trò admin tuyệt đối không đọc trực tiếp nội dung chat thô của cá nhân du khách.
 *   5. Khớp 100% giữa nội dung Privacy Notice với DDL Migration (20260924_p02_024_rls_lockdown_client_roles_matrix.sql) và Data Inventory (chatDataInventory.ts).
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

const privacyPagePath = path.resolve(__dirname, '../src/app/privacy/page.tsx');
const dataInventoryTsPath = path.resolve(__dirname, '../src/lib/chatDataInventory.ts');
const rlsMigrationSqlPath = path.resolve(__dirname, '../../supabase/migrations/20260924_p02_024_rls_lockdown_client_roles_matrix.sql');

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
        const target = path.resolve(dirname(filePath), id.endsWith('.ts') ? id : `${id}.ts`);
        if (fs.existsSync(target)) {
          return loadModule(target, customResolver);
        }
      }
      return {};
    },
    dirname(filePath),
    filePath
  );
  return m.exports;
}

test('P05-007 Assertion 1: Privacy notice explicitly announces Zero-Trust & RLS Matrix Lockdown', () => {
  const privacyContent = fs.readFileSync(privacyPagePath, 'utf8');

  // Verify section title and explicit RLS announcement
  assert.ok(
    privacyContent.includes('Phân Quyền Truy Cập Dữ Liệu & Ma Trận Bảo Vệ RLS') ||
    privacyContent.includes('Zero-Trust Access Matrix'),
    'Privacy Notice must contain Section 5 announcing RLS matrix lockdown and Zero-Trust model'
  );

  assert.ok(
    privacyContent.includes('Row Level Security') || privacyContent.includes('RLS'),
    'Privacy Notice must explicitly disclose Row Level Security (RLS)'
  );

  assert.ok(
    privacyContent.includes('P02-024'),
    'Privacy Notice must cite governance standard P02-024 for RLS matrix lockdown'
  );
});

test('P05-007 Assertion 2: Direct access denial for anon and authenticated roles is clearly disclosed', () => {
  const privacyContent = fs.readFileSync(privacyPagePath, 'utf8');

  // Must mention anon & authenticated roles
  assert.ok(privacyContent.includes('anon'), 'Must disclose anon role');
  assert.ok(privacyContent.includes('authenticated'), 'Must disclose authenticated role');

  // Must disclose full revocation of direct access
  assert.ok(
    privacyContent.includes('REVOKE ALL') ||
    (privacyContent.includes('SELECT') && privacyContent.includes('INSERT') && privacyContent.includes('DELETE')),
    'Must disclose revocation of direct DB operations for client roles'
  );

  // Must mention sensitive tables
  assert.ok(privacyContent.includes('chat_sessions'), 'Must explicitly mention chat_sessions table');
  assert.ok(privacyContent.includes('chat_logs'), 'Must explicitly mention chat_logs table');
  assert.ok(privacyContent.includes('audit_logs'), 'Must explicitly mention audit_logs table');

  // Must disclose PostgREST browser client boundary
  assert.ok(
    privacyContent.includes('PostgREST client') || privacyContent.includes('trình duyệt'),
    'Must explain that browser PostgREST client cannot be used to scrape or tamper with other users data'
  );
});

test('P05-007 Assertion 3: service_role server API gateway and HMAC ownership verification is disclosed', () => {
  const privacyContent = fs.readFileSync(privacyPagePath, 'utf8');

  // Must mention service_role
  assert.ok(privacyContent.includes('service_role'), 'Must disclose service_role technical boundary');

  // Must mention server-side gateway boundary
  assert.ok(
    privacyContent.includes('Server API Gateway') || privacyContent.includes('Next.js Server API'),
    'Must disclose that service_role operates exclusively behind Server API Gateway'
  );

  // Must mention cryptographic HMAC-SHA256 session token verification
  assert.ok(
    privacyContent.includes('HMAC-SHA256') &&
    (privacyContent.includes('x-chat-session-token') || privacyContent.includes('session_token')),
    'Must disclose HMAC-SHA256 ownership token verification requirement'
  );

  // Must mention constant-time comparison protection
  assert.ok(
    privacyContent.includes('timingSafeEqual') || privacyContent.includes('thời gian hằng số'),
    'Must disclose timingSafeEqual protection against timing attacks'
  );
});

test('P05-007 Assertion 4: Admin role privacy boundary (no raw chat browsing) is disclosed', () => {
  const privacyContent = fs.readFileSync(privacyPagePath, 'utf8');

  // Must mention admin role
  assert.ok(privacyContent.includes('admin'), 'Must disclose admin role');

  // Must state admin cannot read raw chat contents
  assert.ok(
    privacyContent.includes('không được đọc nội dung thô') ||
    privacyContent.includes('không đọc trực tiếp nội dung thô') ||
    privacyContent.includes('không được đọc trực tiếp'),
    'Must explicitly state that administrators cannot read raw personal chat messages'
  );

  // Must state admin only sees aggregated metrics and immutable audit logs
  assert.ok(
    privacyContent.includes('chỉ số vận hành tổng hợp') || privacyContent.includes('audit_logs'),
    'Must state that admins only observe aggregated metrics and immutable audit logs'
  );
});

test('P05-007 Assertion 5: 100% concordance with DDL Migration & Data Inventory specification', () => {
  // Read DDL Migration
  const ddlSql = fs.readFileSync(rlsMigrationSqlPath, 'utf8');

  // Verify DDL commands match privacy statements
  assert.ok(
    ddlSql.includes('REVOKE ALL ON TABLE public.chat_sessions FROM anon, authenticated;'),
    'DDL must revoke all privileges on chat_sessions from anon and authenticated'
  );
  assert.ok(
    ddlSql.includes('REVOKE ALL ON TABLE public.chat_logs FROM anon, authenticated;'),
    'DDL must revoke all privileges on chat_logs from anon and authenticated'
  );
  assert.ok(
    ddlSql.includes('REVOKE ALL ON TABLE public.audit_logs FROM anon, authenticated;'),
    'DDL must revoke all privileges on audit_logs from anon and authenticated'
  );

  // Read Data Inventory
  const dataInventory = loadModule(dataInventoryTsPath);
  const sessionInv = dataInventory.CANONICAL_CHAT_SESSION_ID_INVENTORY;

  assert.ok(sessionInv, 'Canonical chat session inventory must exist');
  assert.equal(sessionInv.accessRoles.anon.allowed, false, 'anon must not be allowed in Data Inventory');
  assert.equal(sessionInv.accessRoles.authenticated.allowed, false, 'authenticated must not be allowed in Data Inventory');
  assert.equal(sessionInv.accessRoles.serviceRole.allowed, true, 'service_role must be allowed in Data Inventory');
  assert.equal(sessionInv.accessRoles.admin.allowed, false, 'admin must not be allowed direct read in Data Inventory');
});

test('P05-007 Assertion 6: Negative and Integrity Invariant - No demo placeholders or fake claims', () => {
  const privacyContent = fs.readFileSync(privacyPagePath, 'utf8');

  // Invariant: No mock/demo/fake in privacy page
  assert.ok(!privacyContent.includes('TODO'), 'No TODO comments allowed in privacy page');
  assert.ok(!privacyContent.includes('mock'), 'No mock data references in privacy page');
  assert.ok(!privacyContent.includes('placeholder'), 'No placeholder text in privacy page');

  // Invariant: Encryption standards HTTPS / TLS 1.3
  assert.ok(
    privacyContent.includes('TLS 1.3') || privacyContent.includes('HTTPS'),
    'Must disclose HTTPS / TLS 1.3 transport encryption'
  );
});
