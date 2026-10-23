import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createRequire } from 'node:module';
import typescript from 'typescript';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..', '..');

// Helper load module TypeScript chuẩn bằng typescript compiler
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
      if (id.startsWith('.')) {
        const resolved = path.resolve(path.dirname(filePath), id);
        for (const ext of ['.ts', '.tsx', '.js', '.mjs', '']) {
          if (fs.existsSync(resolved + ext)) {
            return loadModule(resolved + ext, customResolver);
          }
        }
      }
      return require(id);
    },
    path.dirname(filePath),
    filePath
  );
  return m.exports;
}

const validatorPath = path.join(REPO_ROOT, 'frontend', 'src', 'lib', 'sosPayloadValidator.ts');
const {
  CANONICAL_VERIFIED_SOS_CONTACTS,
  validateSosContacts,
  generateCanonicalSosMarkdown,
  validateSosMarkdownProvenance,
} = loadModule(validatorPath);

test('P04-022: 1. Canonical Verified SOS Contacts Invariant (Proof: 100% have source_url & verified_at)', async () => {
  assert.ok(Array.isArray(CANONICAL_VERIFIED_SOS_CONTACTS), 'CANONICAL_VERIFIED_SOS_CONTACTS must be an array');
  assert.ok(CANONICAL_VERIFIED_SOS_CONTACTS.length >= 6, 'Must contain at least 6 canonical hotlines');

  for (const contact of CANONICAL_VERIFIED_SOS_CONTACTS) {
    // 1. Proof: Từng số có source_url
    assert.ok(contact.source_url, `Contact ${contact.name} must have source_url`);
    assert.ok(contact.source_url.startsWith('https://'), `source_url must start with https:// for ${contact.name}`);

    // 2. Proof: Từng số có verified_at
    assert.ok(contact.verified_at, `Contact ${contact.name} must have verified_at`);
    assert.ok(!isNaN(Date.parse(contact.verified_at)), `verified_at must be valid timestamp for ${contact.name}`);
    assert.ok(contact.verified_at.includes('T'), `verified_at must be ISO 8601 for ${contact.name}`);

    // 3. Verification status invariant
    assert.equal(contact.verification_status, 'VERIFIED', `Status must be VERIFIED for ${contact.name}`);

    // 4. Phone invariant
    assert.ok(contact.phone && contact.phone.length >= 3, `Valid phone required for ${contact.name}`);
  }

  // Validator test on canonical list
  const res = validateSosContacts(CANONICAL_VERIFIED_SOS_CONTACTS);
  assert.equal(res.isValid, true, 'Canonical list must pass validator completely');
  assert.equal(res.failures.length, 0, 'Must have 0 failures');
  assert.equal(res.verifiedContactsCount, CANONICAL_VERIFIED_SOS_CONTACTS.length);
});

test('P04-022: 2. Fail-Closed Validation Gate Enforcement (Proof: Reject missing source_url or verified_at)', async () => {
  // Negative Case 1: Thiếu source_url
  const missingSourceFixture = [
    {
      id: 'TEST-001',
      name: 'Trạm Cứu Hộ Giả Lập',
      phone: '0296 3874 999',
      verified_at: '2026-09-28T20:55:00+07:00',
      verification_status: 'VERIFIED',
    },
  ];
  const res1 = validateSosContacts(missingSourceFixture);
  assert.equal(res1.isValid, false, 'Must fail when source_url is missing');
  assert.ok(res1.failures.some(f => f.code === 'MISSING_SOURCE_URL'), 'Must report MISSING_SOURCE_URL');

  // Negative Case 2: source_url không an toàn (HTTP hoặc chuỗi rác)
  const invalidSourceFixture = [
    {
      id: 'TEST-002',
      name: 'Trạm Y Tế Giả Mạo',
      phone: '0296 3874 999',
      source_url: 'http://insecure-site.com',
      verified_at: '2026-09-28T20:55:00+07:00',
      verification_status: 'VERIFIED',
    },
  ];
  const res2 = validateSosContacts(invalidSourceFixture);
  assert.equal(res2.isValid, false, 'Must fail when source_url is not HTTPS');
  assert.ok(res2.failures.some(f => f.code === 'INVALID_SOURCE_URL'), 'Must report INVALID_SOURCE_URL');

  // Negative Case 3: Thiếu verified_at
  const missingVerifiedAtFixture = [
    {
      id: 'TEST-003',
      name: 'Công an Giả Lập',
      phone: '0296 3874 113',
      source_url: 'https://triton.angiang.gov.vn',
      verification_status: 'VERIFIED',
    },
  ];
  const res3 = validateSosContacts(missingVerifiedAtFixture);
  assert.equal(res3.isValid, false, 'Must fail when verified_at is missing');
  assert.ok(res3.failures.some(f => f.code === 'MISSING_VERIFIED_AT'), 'Must report MISSING_VERIFIED_AT');

  // Negative Case 4: verified_at không phải timestamp hợp lệ
  const invalidDateFixture = [
    {
      id: 'TEST-004',
      name: 'Công an Giả Lập',
      phone: '0296 3874 113',
      source_url: 'https://triton.angiang.gov.vn',
      verified_at: 'hom-qua-luc-chieu',
      verification_status: 'VERIFIED',
    },
  ];
  const res4 = validateSosContacts(invalidDateFixture);
  assert.equal(res4.isValid, false, 'Must fail when verified_at is invalid date');
  assert.ok(res4.failures.some(f => f.code === 'INVALID_VERIFIED_AT'), 'Must report INVALID_VERIFIED_AT');

  // Negative Case 5: verification_status chưa duyệt
  const unverifiedFixture = [
    {
      id: 'TEST-005',
      name: 'Hotline Chưa Duyệt',
      phone: '0296 3874 113',
      source_url: 'https://triton.angiang.gov.vn',
      verified_at: '2026-09-28T20:55:00+07:00',
      verification_status: 'UNVERIFIED',
    },
  ];
  const res5 = validateSosContacts(unverifiedFixture);
  assert.equal(res5.isValid, false, 'Must fail when status is UNVERIFIED');
  assert.ok(res5.failures.some(f => f.code === 'UNVERIFIED_STATUS'), 'Must report UNVERIFIED_STATUS');

  // Negative Case 6: Chặn số điện thoại placeholder bị cấm
  const mockPhoneFixture = [
    {
      id: 'TEST-006',
      name: 'Cứu Hộ Phượt Placeholder',
      phone: '0913 789 123',
      source_url: 'https://triton.angiang.gov.vn',
      verified_at: '2026-09-28T20:55:00+07:00',
      verification_status: 'VERIFIED',
    },
  ];
  const res6 = validateSosContacts(mockPhoneFixture);
  assert.equal(res6.isValid, false, 'Must reject forbidden placeholder phone number');
  assert.ok(res6.failures.some(f => f.code === 'UNAPPROVED_PHONE'), 'Must report UNAPPROVED_PHONE');
});

test('P04-022: 3. Chatbot AI Emergency Payload Provenance Proof', async () => {
  const markdown = generateCanonicalSosMarkdown();
  assert.ok(markdown && markdown.length > 100, 'SOS Markdown must be substantive');

  const provenance = validateSosMarkdownProvenance(markdown);
  assert.equal(provenance.isCompliant, true, 'SOS Markdown must be fully compliant with provenance contract');
  assert.equal(provenance.missingCitations.length, 0);

  // Proof: Phải chứa các đầu số khẩn cấp quan trọng cùng nguồn chính thức và thời điểm thẩm định
  assert.ok(markdown.includes('0296.3874.113'), 'Must contain Police phone');
  assert.ok(markdown.includes('0296.3874.115'), 'Must contain Medical phone');
  assert.ok(markdown.includes('114'), 'Must contain Fire phone');
  assert.ok(markdown.includes('https://triton.angiang.gov.vn'), 'Must cite official Government source URL');
  assert.ok(markdown.includes('https://congan.angiang.gov.vn'), 'Must cite official Police source URL');
  assert.ok(markdown.includes('2026-09-28'), 'Must cite audit timestamp');

  // Proof: Tuyệt đối không chứa số mock
  assert.ok(!markdown.includes('0913 789 123'), 'Must not contain 0913 789 123');
  assert.ok(!markdown.includes('0296 3760 123'), 'Must not contain 0296 3760 123');
});

test('P04-022: 4. Constants Emergency Contacts & Commune Directory Provenance Invariant', async () => {
  const constantsPath = path.join(REPO_ROOT, 'frontend', 'src', 'lib', 'constants.ts');
  const constantsCode = fs.readFileSync(constantsPath, 'utf8');

  // Kiểm tra interface VerifiedEmergencyContact
  assert.ok(constantsCode.includes('source_url: string;'), 'Must have source_url in interface');
  assert.ok(constantsCode.includes('verified_at: string;'), 'Must have verified_at in interface');

  // Kiểm tra CommuneEmergencyEntry
  assert.ok(constantsCode.includes('export interface CommuneEmergencyEntry'), 'Must export CommuneEmergencyEntry');

  // Kiểm tra 15 xã/thị trấn trong COMMUNE_EMERGENCY_DIRECTORY đều có source_url và verified_at
  const communes = [
    'Thị trấn Tri Tôn', 'Thị trấn Ba Chúc', 'Xã Núi Tô', 'Xã Châu Lăng', 'Xã Chau Lăng',
    'Xã An Tức', 'Xã Ô Lâm', 'Xã Lương Phi', 'Xã Lê Trì', 'Xã Tà Đảnh',
    'Xã Cô Tô', 'Xã Tân Tuyến', 'Xã Lạc Quới', 'Xã Vĩnh Gia', 'Xã Vĩnh Phước', 'Xã Lương An Trà'
  ];

  for (const c of communes) {
    assert.ok(constantsCode.includes(`'${c}': {`), `COMMUNE_EMERGENCY_DIRECTORY must contain ${c}`);
  }

  // Tần suất xuất hiện https://triton.angiang.gov.vn phải >= 16 lần
  const countUrls = (constantsCode.match(/https:\/\/triton\.angiang\.gov\.vn/g) || []).length;
  assert.ok(countUrls >= 16, `Expected at least 16 source_url occurrences, got ${countUrls}`);

  // Tần suất xuất hiện verified_at phải >= 16 lần
  const countVerifiedAt = (constantsCode.match(/2026-09-28T20:55:00\+07:00/g) || []).length;
  assert.ok(countVerifiedAt >= 16, `Expected at least 16 verified_at occurrences, got ${countVerifiedAt}`);
});

test('P04-022: 5. Emergency UI withholds disputed local contact claims and retains national entry points', () => {
  const pagePath = path.join(REPO_ROOT, 'frontend', 'src', 'app', 'emergency', 'page.tsx');
  const pageCode = fs.readFileSync(pagePath, 'utf8');
  assert.ok(pageCode.includes('EmergencyQuickLinks'));
  assert.ok(pageCode.includes('Danh bạ địa phương đang đối chiếu'));
  assert.ok(pageCode.includes('chinhphu.vn'));
  assert.ok(!pageCode.includes('Xác minh 100%'));
  assert.ok(!pageCode.includes('0296'));
  // Actual SSR and dialing targets are exercised by public-data-trust.test.mjs.
});

test('P04-022: 6. Specification Artifact Concordance (VERIFIED_EMERGENCY_HOTLINES.json)', async () => {
  const jsonPath = path.join(REPO_ROOT, 'docs', 'technical-spec', 'VERIFIED_EMERGENCY_HOTLINES.json');
  assert.ok(fs.existsSync(jsonPath), 'VERIFIED_EMERGENCY_HOTLINES.json must exist');

  const content = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const res = validateSosContacts(content);

  assert.equal(res.isValid, true, 'VERIFIED_EMERGENCY_HOTLINES.json must pass validator 100%');
  assert.equal(res.failures.length, 0, 'Must have zero failures');
  assert.equal(res.verifiedContactsCount, content.length);
});
