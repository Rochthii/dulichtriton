/**
 * ─────────────────────────────────────────────────────────────────────────────
 * P05-002: CHAT SESSIONS RETENTION DECISION RECORD G3 VERIFICATION SUITE
 * Du Lịch Tri Tôn AI Assistant System
 * 
 * PHẠM VI & MỤC TIÊU NGHIỆM THU:
 * - Quyết định retention cho chat_sessions.
 * - PROOF: Decision Record G3 có số ngày/điều kiện cụ thể,
 *   khớp 100% với Data Inventory P05-001, Database Schema, và Logic Runtime.
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

const decisionRecordMdPath = path.resolve(__dirname, '../../docs/technical-spec/DECISION_RECORD_CHAT_SESSIONS_RETENTION.md');
const retentionPolicyTsPath = path.resolve(__dirname, '../src/lib/chatSessionRetentionPolicy.ts');
const migrationCreateSessionsPath = path.resolve(__dirname, '../../supabase/migrations/20260809_create_chat_sessions.sql');

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
      return {};
    },
    path.dirname(filePath),
    filePath
  );
  return m.exports;
}

const retentionModule = loadModule(retentionPolicyTsPath);
const {
  CHAT_SESSION_RETENTION_HOURS,
  CHAT_SESSION_RETENTION_MS,
  CHAT_SESSION_RETENTION_SQL_INTERVAL,
  CHAT_SESSION_INDEX_NAME,
  CHAT_SESSION_RETENTION_CONDITIONS,
  isSessionExpired,
  calculateSessionExpirationDate,
  buildRetentionCleanupQuery,
  assertRetentionPolicyConcordance
} = retentionModule;

test('P05-002: 1. Decision Record G3 Document Integrity & Metadata Proof', () => {
  assert.ok(fs.existsSync(decisionRecordMdPath), 'Tài liệu Decision Record G3 phải tồn tại');
  const doc = fs.readFileSync(decisionRecordMdPath, 'utf8');

  // Kiểm tra metadata bắt buộc
  assert.match(doc, /DR-G3-RETENTION-SESSIONS-001/, 'Phải có mã định danh DR-G3-RETENTION-SESSIONS-001');
  assert.match(doc, /P05-002/, 'Phải liên kết nhiệm vụ P05-002');
  assert.match(doc, /Decision Gate G3/i, 'Phải ghi rõ Decision Gate G3');
  assert.match(doc, /Chăm Rốch Thi/, 'Phải có người phê duyệt Chăm Rốch Thi');
  assert.match(doc, /APPROVED \/ VERIFIED/, 'Trạng thái phải là APPROVED / VERIFIED');

  // Kiểm tra có Trade-off Matrix
  assert.match(doc, /Ma Trận Đánh Đổi|Trade-off Matrix/i, 'Phải có ma trận so sánh trade-off');
  assert.match(doc, /Phương án B.*24 giờ/i, 'Phải chọn Phương án B 24 giờ');
});

test('P05-002: 2. Explicit Retention Window Proof (Proof of Exactly 24 Hours / 1 Day)', () => {
  const doc = fs.readFileSync(decisionRecordMdPath, 'utf8');

  // Kiểm chứng trong tài liệu
  assert.match(
    doc,
    /24 GIỜ|24 hours|1 NGÀY|1 day/i,
    'Decision Record phải khẳng định rõ ràng số ngày/giờ: 24 giờ hoặc 1 ngày'
  );

  // Kiểm chứng hằng số trong code runtime
  assert.strictEqual(CHAT_SESSION_RETENTION_HOURS, 24, 'CHAT_SESSION_RETENTION_HOURS phải là 24');
  assert.strictEqual(CHAT_SESSION_RETENTION_MS, 86400000, 'CHAT_SESSION_RETENTION_MS phải là 86,400,000');
  assert.strictEqual(CHAT_SESSION_RETENTION_SQL_INTERVAL, "INTERVAL '24 hours'", 'SQL Interval phải là INTERVAL 24 hours');
  assert.strictEqual(CHAT_SESSION_INDEX_NAME, 'chat_sessions_updated_at_idx');
});

test('P05-002: 3. Four Mandatory Retention Conditions Proof', () => {
  const doc = fs.readFileSync(decisionRecordMdPath, 'utf8');

  // 1. Điều kiện Sliding Window
  assert.match(doc, /Sliding Window|Cửa sổ trượt/i, 'Phải có điều kiện Sliding Window');
  assert.match(doc, /updated_at = NOW\(\)/i, 'Phải nêu trigger cập nhật updated_at');
  assert.ok(CHAT_SESSION_RETENTION_CONDITIONS.SLIDING_TTL_WINDOW, 'Code runtime phải có mô tả SLIDING_TTL_WINDOW');

  // 2. Điều kiện Expiration Threshold
  assert.match(doc, /updated_at <.*NOW\(\).*24 hours/i, 'Phải nêu ngưỡng hết hạn 24 giờ');
  assert.ok(CHAT_SESSION_RETENTION_CONDITIONS.EXPIRATION_THRESHOLD, 'Code runtime phải có EXPIRATION_THRESHOLD');

  // 3. Điều kiện Immediate Right to Erasure
  assert.match(doc, /Right to Erasure|Xóa bỏ tức thì|P05-005/i, 'Phải có điều kiện Right to Erasure');
  assert.ok(CHAT_SESSION_RETENTION_CONDITIONS.RIGHT_TO_ERASURE, 'Code runtime phải có RIGHT_TO_ERASURE');

  // 4. Điều kiện Decoupling Audit Logs
  assert.match(doc, /SOS.*Audit Log Decoupling|Tách biệt.*kiểm toán/i, 'Phải có điều kiện Audit Decoupling');
  assert.ok(CHAT_SESSION_RETENTION_CONDITIONS.AUDIT_DECOUPLING, 'Code runtime phải có AUDIT_DECOUPLING');
});

test('P05-002: 4. Expiration Evaluation Logic & Sliding Window Runtime Proof', () => {
  const now = new Date('2026-10-02T12:00:00.000Z');

  // Trường hợp 1: Session vừa hoạt động 1 giờ trước -> Chưa hết hạn
  const recent1h = new Date(now.getTime() - 1 * 60 * 60 * 1000);
  assert.strictEqual(isSessionExpired(recent1h, now), false, 'Session 1h trước không được hết hạn');

  // Trường hợp 2: Session hoạt động 23 giờ 59 phút trước -> Chưa hết hạn (vẫn trong hạn 24h)
  const recent23h59m = new Date(now.getTime() - (23 * 60 + 59) * 60 * 1000);
  assert.strictEqual(isSessionExpired(recent23h59m, now), false, 'Session 23h59m trước vẫn chưa hết hạn');

  // Trường hợp 3: Session hoạt động cách đây đúng 24 giờ -> Đã hết hạn
  const exact24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  assert.strictEqual(isSessionExpired(exact24h, now), true, 'Session đúng 24h trước phải coi là hết hạn');

  // Trường hợp 4: Session hoạt động cách đây 48 giờ -> Đã hết hạn
  const old48h = new Date(now.getTime() - 48 * 60 * 60 * 1000);
  assert.strictEqual(isSessionExpired(old48h, now), true, 'Session 48h trước phải hết hạn');

  // Trường hợp 5: Input không hợp lệ -> Fail-closed: coi như hết hạn
  assert.strictEqual(isSessionExpired('', now), true, 'Chuỗi rỗng coi như hết hạn');
  assert.strictEqual(isSessionExpired('invalid-date', now), true, 'Ngày không hợp lệ coi như hết hạn');

  // Kiểm tra hàm tính ngày hết hạn
  const expDate = calculateSessionExpirationDate(recent1h);
  assert.strictEqual(expDate.getTime(), recent1h.getTime() + 24 * 60 * 60 * 1000, 'Expiration date = updated_at + 24h');
});

test('P05-002: 5. SQL Cleanup Query & Schema Concordance Invariant Proof', () => {
  // Kiểm tra query sinh ra
  const query = buildRetentionCleanupQuery(1000);
  assert.match(query, /DELETE FROM public\.chat_sessions/i, 'Query phải xóa từ public.chat_sessions');
  assert.match(query, /INTERVAL '24 hours'/i, 'Query phải dùng khoảng thời gian 24 hours');
  assert.match(query, /LIMIT 1000/i, 'Query phải có batch limit 1000 chống nghẽn DB');

  // Đối chiếu với file migration database
  const migrationSql = fs.readFileSync(migrationCreateSessionsPath, 'utf8');
  assert.match(
    migrationSql,
    /chat_sessions_updated_at_idx/,
    'Database migration phải có index chat_sessions_updated_at_idx'
  );
  assert.match(
    migrationSql,
    /trg_chat_sessions_updated_at/,
    'Database migration phải có trigger cập nhật updated_at'
  );
});

test('P05-002: 6. Cross-Specification Concordance with Data Inventory (P05-001)', () => {
  const isConcordant = assertRetentionPolicyConcordance();
  assert.strictEqual(
    isConcordant,
    true,
    'Retention Policy runtime phải khớp 100% với Data Inventory (ttlHours=24, unit=hours)'
  );
});
