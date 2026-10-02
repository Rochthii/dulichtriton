/**
 * ─────────────────────────────────────────────────────────────────────────────
 * P05-006: PRIVACY NOTICE CHAT STORAGE & CODE BEHAVIOR CONCORDANCE PROOF SUITE
 * Du Lịch Tri Tôn AI Assistant System
 * 
 * PHẠM VI & MỤC TIÊU NGHIỆM THU:
 * - Sửa câu privacy notice về nơi lưu hội thoại (Chat Sessions Storage).
 * - PROOF BẮT BUỘC: Khớp hành vi code (Code Behavior Concordance):
 *   1. Privacy Notice tuyên bố chính xác nơi lưu trữ server-side tại bảng public.chat_sessions.
 *   2. Tuyên bố chính xác vòng đời tự hủy 24 giờ (sliding window TTL) và quyền xóa chủ động (Right to Erasure).
 *   3. Không còn tuyên bố sai lệch rằng hội thoại chỉ lưu cục bộ trên điện thoại (LocalStorage only).
 *   4. Giao diện người dùng (ChatbotWidget, ChatbotPageClient) kích hoạt API DELETE thực tế khi bấm "Xóa chat".
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

const privacyPagePath = path.resolve(__dirname, '../src/app/privacy/page.tsx');
const chatbotWidgetPath = path.resolve(__dirname, '../src/components/ChatbotWidget.tsx');
const chatbotPageClientPath = path.resolve(__dirname, '../src/components/ChatbotPageClient.tsx');
const retentionPolicyTsPath = path.resolve(__dirname, '../src/lib/chatSessionRetentionPolicy.ts');
const dataInventoryTsPath = path.resolve(__dirname, '../src/lib/chatDataInventory.ts');
const sessionDeletionServiceTsPath = path.resolve(__dirname, '../src/lib/chatSessionDeletionService.ts');
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

const retentionPolicy = loadModule(retentionPolicyTsPath);
const dataInventory = loadModule(dataInventoryTsPath);

test('P05-006: 1. Privacy Notice Explicit Chat Storage Disclosure Proof (Nơi lưu hội thoại)', () => {
  assert.ok(fs.existsSync(privacyPagePath), 'Trang Privacy phải tồn tại');
  const privacyContent = fs.readFileSync(privacyPagePath, 'utf8');

  // Khẳng định rõ nơi lưu trên máy chủ: public.chat_sessions tại Supabase PostgreSQL
  assert.match(privacyContent, /public\.chat_sessions/i, 'Privacy page phải nêu rõ bảng public.chat_sessions');
  assert.match(privacyContent, /Supabase PostgreSQL/i, 'Privacy page phải nêu rõ cơ sở dữ liệu Supabase PostgreSQL');

  // Khẳng định mã định danh ẩn danh UUID v4 và chữ ký bảo vệ HMAC-SHA256
  assert.match(privacyContent, /UUID v4/i, 'Privacy page phải nêu rõ mã phiên UUID v4');
  assert.match(privacyContent, /HMAC-SHA256/i, 'Privacy page phải nêu rõ chữ ký bảo vệ HMAC-SHA256');

  // Khẳng định giới hạn số lượt trao đổi (tối đa 20 lượt)
  assert.match(privacyContent, /20 lượt/i, 'Privacy page phải nêu rõ giới hạn tối đa 20 lượt trao đổi');

  // Khẳng định thời hạn lưu trữ tự hủy chính xác 24 giờ
  assert.match(privacyContent, /24 giờ/i, 'Privacy page phải nêu rõ thời hạn lưu trữ 24 giờ');
  assert.match(privacyContent, /sliding window TTL/i, 'Privacy page phải nêu rõ cơ chế sliding window TTL');

  // Khẳng định quyền xóa chủ động ngay lập tức (Right to Erasure)
  assert.match(privacyContent, /Xóa chat/i, 'Privacy page phải hướng dẫn nút Xóa chat');
  assert.match(privacyContent, /Right to Erasure/i, 'Privacy page phải khẳng định Right to Erasure');
});

test('P05-006: 2. Code Behavior Concordance Proof (Alignment with Runtime Constants & Inventory)', () => {
  // 1. Đối chiếu với Runtime Retention Policy
  assert.strictEqual(retentionPolicy.CHAT_SESSION_RETENTION_HOURS, 24, 'Runtime retention phải là 24 giờ');
  assert.strictEqual(retentionPolicy.CHAT_SESSION_RETENTION_MS, 24 * 60 * 60 * 1000, 'Runtime retention MS khớp 24h');

  // 2. Đối chiếu với Data Inventory
  const sessionInv = dataInventory.CANONICAL_CHAT_SESSION_ID_INVENTORY;
  assert.strictEqual(sessionInv.field, 'public.chat_sessions.session_id', 'Khớp trường CSDL');
  assert.strictEqual(sessionInv.table, 'public.chat_sessions', 'Khớp bảng lưu trữ');
  assert.strictEqual(sessionInv.retention.duration, '24 hours', 'Khớp mô tả thời hạn lưu');
  assert.strictEqual(sessionInv.userRights.canDelete, true, 'Hỗ trợ xóa tức thì');
});

test('P05-006: 3. UI Action to Backend API Concordance Proof (Button triggers real API)', () => {
  // 1. ChatbotWidget: handleClearHistory phải gọi DELETE /api/v1/chat/session
  assert.ok(fs.existsSync(chatbotWidgetPath), 'ChatbotWidget.tsx phải tồn tại');
  const widgetContent = fs.readFileSync(chatbotWidgetPath, 'utf8');
  assert.match(widgetContent, /\/api\/v1\/chat\/session/, 'Widget phải gọi endpoint /api/v1/chat/session khi xóa');
  assert.match(widgetContent, /method:\s*['"]DELETE['"]/, 'Widget phải dùng HTTP DELETE');
  assert.match(widgetContent, /x-chat-session-token/, 'Widget phải gửi kèm token sở hữu');

  // 2. ChatbotPageClient: handleClearHistory phải gọi DELETE /api/v1/chat/session
  assert.ok(fs.existsSync(chatbotPageClientPath), 'ChatbotPageClient.tsx phải tồn tại');
  const pageClientContent = fs.readFileSync(chatbotPageClientPath, 'utf8');
  assert.match(pageClientContent, /\/api\/v1\/chat\/session/, 'PageClient phải gọi endpoint /api/v1/chat/session khi xóa');
  assert.match(pageClientContent, /method:\s*['"]DELETE['"]/, 'PageClient phải dùng HTTP DELETE');
  assert.match(pageClientContent, /x-chat-session-token/, 'PageClient phải gửi kèm token sở hữu');
});

test('P05-006: 4. Negative Invariant: No False Claim of "LocalStorage Only" for Chat Content', () => {
  const privacyContent = fs.readFileSync(privacyPagePath, 'utf8');

  // Tách riêng Section 3 (LocalStorage) để kiểm tra
  const section3Match = privacyContent.match(/<h2>3\. Lưu Trữ Dữ Liệu Cục Bộ[\s\S]*?<\/section>/);
  assert.ok(section3Match, 'Phải tìm thấy Section 3');
  const section3Content = section3Match[0];

  // Section 3 không được tuyên bố rằng toàn bộ nội dung hội thoại chỉ lưu trong LocalStorage
  assert.strictEqual(
    section3Content.includes('Lịch sử trò chuyện gần nhất với Trợ lý AI (bạn có thể chủ động bấm nút Xóa chat bất cứ lúc nào để làm sạch toàn bộ dữ liệu)'),
    false,
    'Section 3 không được dùng câu cũ gây hiểu lầm là chat history chỉ lưu ở LocalStorage'
  );

  // Section 3 phải nêu rõ LocalStorage chỉ lưu mã phiên và token mật mã
  assert.match(section3Content, /UUID v4/i, 'Section 3 phải nêu mã định danh UUID v4');
  assert.match(section3Content, /HMAC-SHA256/i, 'Section 3 phải nêu token mật mã HMAC-SHA256');
});

test('P05-006: 5. Legal & Architectural Authority Concordance (Decree 13/2023 & DR-G3)', () => {
  const privacyContent = fs.readFileSync(privacyPagePath, 'utf8');

  // Phải viện dẫn Nghị định 13/2023/NĐ-CP
  assert.match(privacyContent, /Nghị định 13\/2023\/NĐ-CP/i, 'Phải trích dẫn Nghị định 13/2023/NĐ-CP');
  // Phải viện dẫn Decision Record G3
  assert.match(privacyContent, /DR-G3-RETENTION-SESSIONS-001/i, 'Phải trích dẫn mã quy chuẩn DR-G3-RETENTION-SESSIONS-001');
});
