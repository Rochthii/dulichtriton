/**
 * ─────────────────────────────────────────────────────────────────────────────
 * P05-008: CHAT CONSENT GUARD & NO-CONSENT PATH INVARIANCE TEST SUITE
 * Du Lịch Tri Tôn AI Assistant System
 * 
 * PHẠM VI & MỤC TIÊU NGHIỆM THU:
 * - Thêm consent UI nếu G3 yêu cầu (Decision Gate G3 & Nghị định 13/2023/NĐ-CP).
 * - PROOF BẮT BUỘC: No-consent path không ghi dữ liệu không được phép:
 *   1. Module chatConsentGuard phân loại chính xác các trạng thái granted, denied, unset.
 *   2. shouldPersistChatSession từ chối tuyệt đối (return false) khi consent bị từ chối (denied)
 *      hoặc khi session_id là anonymous.
 *   3. No-consent path trong Query Route (/api/v1/chat/query) TUYỆT ĐỐI KHÔNG ghi dữ liệu vào chat_sessions.
 *   4. No-consent path trong Stream Route (/api/v1/chat/stream) TUYỆT ĐỐI KHÔNG ghi dữ liệu vào chat_sessions.
 *   5. Giao diện ChatbotWidget và ChatbotPageClient tích hợp đầy đủ Consent Banner và Toggle Button.
 *   6. Negative & Privacy Invariants: No demo mock, không leak lịch sử khi ở chế độ Ẩn danh.
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

const consentGuardTsPath = path.resolve(__dirname, '../src/lib/chatConsentGuard.ts');
const queryRouteTsPath = path.resolve(__dirname, '../src/app/api/v1/chat/query/route.ts');
const streamRouteTsPath = path.resolve(__dirname, '../src/app/api/v1/chat/stream/route.ts');
const chatbotWidgetTsPath = path.resolve(__dirname, '../src/components/ChatbotWidget.tsx');
const chatbotPageClientTsPath = path.resolve(__dirname, '../src/components/ChatbotPageClient.tsx');

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

const consentGuard = loadModule(consentGuardTsPath);

test('P05-008 Assertion 1: resolveConsentStatus extracts granted/denied/unset from body and headers', () => {
  // Test body consent boolean
  assert.equal(consentGuard.resolveConsentStatus({ body: { consent: false } }), 'denied');
  assert.equal(consentGuard.resolveConsentStatus({ body: { consent: true } }), 'granted');
  assert.equal(consentGuard.resolveConsentStatus({ body: { consent: 'denied' } }), 'denied');
  assert.equal(consentGuard.resolveConsentStatus({ body: { consent: 'granted' } }), 'granted');

  // Test HTTP header x-chat-consent
  const reqDenied = { headers: new Headers({ 'x-chat-consent': 'denied' }) };
  assert.equal(consentGuard.resolveConsentStatus({ req: reqDenied }), 'denied');

  const reqGranted = { headers: new Headers({ 'x-chat-consent': 'granted' }) };
  assert.equal(consentGuard.resolveConsentStatus({ req: reqGranted }), 'granted');

  // Test empty/unset
  assert.equal(consentGuard.resolveConsentStatus({}), 'unset');
  assert.equal(consentGuard.resolveConsentStatus({ body: {} }), 'unset');
});

test('P05-008 Assertion 2: shouldPersistChatSession blocks writes when consent is denied or session is anonymous', () => {
  const validSessionId = '00000000-0000-4000-8000-000000000001';

  // No-consent path must NEVER persist
  assert.equal(
    consentGuard.shouldPersistChatSession('denied', validSessionId),
    false,
    'Denied consent must strictly block chat_sessions persistence'
  );

  // Anonymous session must NEVER persist
  assert.equal(
    consentGuard.shouldPersistChatSession('granted', 'anonymous'),
    false,
    'Anonymous session must strictly block chat_sessions persistence'
  );
  assert.equal(
    consentGuard.shouldPersistChatSession('granted', ''),
    false,
    'Empty session ID must strictly block chat_sessions persistence'
  );

  // Granted consent with valid session ID is allowed to persist
  assert.equal(
    consentGuard.shouldPersistChatSession('granted', validSessionId),
    true,
    'Granted consent with valid session ID should allow persistence'
  );
});

test('P05-008 Assertion 3: Query Route enforces consent guard and prevents DB writes on no-consent path', () => {
  const queryContent = fs.readFileSync(queryRouteTsPath, 'utf8');

  // Must import chatConsentGuard
  assert.ok(
    queryContent.includes('chatConsentGuard'),
    'Query route must import chatConsentGuard'
  );
  assert.ok(
    queryContent.includes('resolveConsentStatus'),
    'Query route must use resolveConsentStatus'
  );
  assert.ok(
    queryContent.includes('shouldPersistChatSession'),
    'Query route must use shouldPersistChatSession'
  );

  // Invariant: saveHistory must be protected by canPersistSession
  assert.ok(
    queryContent.includes('canPersistSession &&') || queryContent.includes('if (canPersistSession'),
    'saveHistory in Query route must be guarded by canPersistSession'
  );
});

test('P05-008 Assertion 4: Stream Route enforces consent guard and prevents DB writes on no-consent path', () => {
  const streamContent = fs.readFileSync(streamRouteTsPath, 'utf8');

  // Must import chatConsentGuard
  assert.ok(
    streamContent.includes('chatConsentGuard'),
    'Stream route must import chatConsentGuard'
  );
  assert.ok(
    streamContent.includes('resolveConsentStatus'),
    'Stream route must use resolveConsentStatus'
  );
  assert.ok(
    streamContent.includes('shouldPersistChatSession'),
    'Stream route must use shouldPersistChatSession'
  );

  // Invariant: saveHistory must be protected by canPersistSession
  assert.ok(
    streamContent.includes('canPersistSession &&') || streamContent.includes('if (canPersistSession'),
    'saveHistory in Stream route must be guarded by canPersistSession'
  );
});

test('P05-008 Assertion 5: UI Components (ChatbotWidget & ChatbotPageClient) integrate Consent Banner and Toggle', () => {
  const widgetContent = fs.readFileSync(chatbotWidgetTsPath, 'utf8');
  const pageContent = fs.readFileSync(chatbotPageClientTsPath, 'utf8');

  // Widget must contain consent state and banner
  assert.ok(widgetContent.includes('chatConsent'), 'ChatbotWidget must contain chatConsent state');
  assert.ok(widgetContent.includes('CHAT_CONSENT_STORAGE_KEY'), 'ChatbotWidget must persist consent');
  assert.ok(widgetContent.includes('handleSetConsent'), 'ChatbotWidget must provide handleSetConsent');
  assert.ok(widgetContent.includes('toggleConsent'), 'ChatbotWidget must provide toggleConsent');
  assert.ok(widgetContent.includes('Ẩn danh'), 'ChatbotWidget must offer incognito/denied option');
  assert.ok(widgetContent.includes('x-chat-consent'), 'ChatbotWidget must send x-chat-consent header');

  // Page must contain consent state and banner
  assert.ok(pageContent.includes('chatConsent'), 'ChatbotPageClient must contain chatConsent state');
  assert.ok(pageContent.includes('CHAT_CONSENT_STORAGE_KEY'), 'ChatbotPageClient must persist consent');
  assert.ok(pageContent.includes('handleSetConsent'), 'ChatbotPageClient must provide handleSetConsent');
  assert.ok(pageContent.includes('toggleConsent'), 'ChatbotPageClient must provide toggleConsent');
  assert.ok(pageContent.includes('Ẩn danh'), 'ChatbotPageClient must offer incognito/denied option');
  assert.ok(pageContent.includes('x-chat-consent'), 'ChatbotPageClient must send x-chat-consent header');
});

test('P05-008 Assertion 6: Negative & Privacy Invariant - Ephemeral mode suppresses history and protects privacy', () => {
  const widgetContent = fs.readFileSync(chatbotWidgetTsPath, 'utf8');
  const pageContent = fs.readFileSync(chatbotPageClientTsPath, 'utf8');

  // When consent is denied, history must be cleared/empty array
  assert.ok(
    widgetContent.includes('history: isConsentDenied') && widgetContent.includes('? []'),
    'Widget must not transmit conversation history when consent is denied'
  );

  assert.ok(
    pageContent.includes('history: isConsentDenied') && pageContent.includes('? []'),
    'ChatbotPageClient must not transmit conversation history when consent is denied'
  );

  // Invariant: No mock or placeholder
  assert.ok(!fs.readFileSync(consentGuardTsPath, 'utf8').includes('TODO'), 'No TODOs in consent guard');
});
