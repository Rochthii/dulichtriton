import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..', '..');

const syncScriptPath = path.resolve(REPO_ROOT, 'scripts/sync/smart_delta_sync.js');
const masterCsvPath = path.resolve(REPO_ROOT, 'data/tri_ton_master_cleaned.csv');

test('P03-024: Static code invariant - smart_delta_sync exports normalizeText and handles description diffing', async () => {
  assert.ok(fs.existsSync(syncScriptPath), 'smart_delta_sync.js must exist');
  const syncModule = require(syncScriptPath);

  assert.equal(typeof syncModule.normalizeText, 'function', 'Must export normalizeText');
  assert.equal(typeof syncModule.parseMasterCsv, 'function', 'Must export parseMasterCsv');
  assert.equal(typeof syncModule.computePlaceDiff, 'function', 'Must export computePlaceDiff');

  // Test normalizeText directly
  assert.equal(syncModule.normalizeText(null), '');
  assert.equal(syncModule.normalizeText(undefined), '');
  assert.equal(syncModule.normalizeText('   hello world   '), 'hello world');
  assert.equal(syncModule.normalizeText('line1\r\nline2\r\nline3'), 'line1\nline2\nline3');
});

test('P03-024: Unit test - parseMasterCsv parses complex descriptions (escaped quotes, multiline, markdown)', async () => {
  const { parseMasterCsv } = require(syncScriptPath);

  const testCsv = `id,name,commune,category,subcategory,latitude,longitude,address,description
"ho-ta-pa","Hồ Tà Pạ","Xã Núi Tô","nature","lake","10.4165","105.0042","Đồi Tà Pạ","Hồ nước ngọt trong xanh ngọc bích, được mệnh danh là ""Tuyệt Tình Cốc Bảy Núi""."
"chua-ta-pa","Chùa Tà Pạ","Xã Núi Tô","spiritual","temple","10.4182","105.0086","Đồi Tà Pạ","Ngôi chùa Phật giáo Nam Tông Khmer với kiến trúc Angkor tuyệt mỹ."
"diem-multiline","Điểm Multiline","Xã Châu Lăng","culture","heritage","10.4500","105.0200","Ấp Tà Miệt","Mô tả dòng 1: Giới thiệu chung.
Mô tả dòng 2: Đặc điểm nổi bật **in đậm**.
Mô tả dòng 3: Lịch sử hình thành."
"diem-empty-desc","Điểm Không Mô Tả","Xã Ô Lâm","nature","lake","10.4300","105.0200","Hồ Ô Thum",""`;

  const records = parseMasterCsv(testCsv);
  assert.equal(records.length, 4, 'Must parse exactly 4 records');

  // Record 1: unescaped quotes in description
  assert.equal(records[0].id, 'ho-ta-pa');
  assert.equal(
    records[0].description,
    'Hồ nước ngọt trong xanh ngọc bích, được mệnh danh là "Tuyệt Tình Cốc Bảy Núi".'
  );

  // Record 2: standard description
  assert.equal(records[1].id, 'chua-ta-pa');
  assert.equal(
    records[1].description,
    'Ngôi chùa Phật giáo Nam Tông Khmer với kiến trúc Angkor tuyệt mỹ.'
  );

  // Record 3: multiline description with markdown formatting
  assert.equal(records[2].id, 'diem-multiline');
  assert.equal(
    records[2].description,
    'Mô tả dòng 1: Giới thiệu chung.\nMô tả dòng 2: Đặc điểm nổi bật **in đậm**.\nMô tả dòng 3: Lịch sử hình thành.'
  );

  // Record 4: empty description handled gracefully
  assert.equal(records[3].id, 'diem-empty-desc');
  assert.equal(records[3].description, '');
});

test('P03-024: Unit test - computePlaceDiff description diff calculation with normalization', async () => {
  const { computePlaceDiff } = require(syncScriptPath);

  const masterPlace = {
    id: 'ho-ta-pa',
    name: 'Hồ Tà Pạ',
    commune: 'Xã Núi Tô',
    category: 'nature',
    subcategory: 'lake',
    latitude: 10.4165,
    longitude: 105.0042,
    address: 'Đồi Tà Pạ, Xã Núi Tô, Tri Tôn, An Giang',
    description: 'Hồ nước ngọt trong xanh ngọc bích trên đỉnh đồi Tà Pạ.'
  };

  // Case 1: Exact match -> NO diff
  const dbMatch = {
    ...masterPlace,
    description: 'Hồ nước ngọt trong xanh ngọc bích trên đỉnh đồi Tà Pạ.'
  };
  const diffMatch = computePlaceDiff(masterPlace, dbMatch);
  assert.equal(diffMatch.description, undefined, 'Identical description must not generate diff');

  // Case 2: CRLF vs LF match -> NO diff (normalized)
  const dbCrlf = {
    ...masterPlace,
    description: 'Hồ nước ngọt trong xanh ngọc bích trên đỉnh đồi Tà Pạ.\r\n'
  };
  const diffCrlf = computePlaceDiff(masterPlace, dbCrlf);
  assert.equal(diffCrlf.description, undefined, 'CRLF vs LF differences must be normalized');

  // Case 3: Leading / trailing whitespace match -> NO diff
  const dbWhitespace = {
    ...masterPlace,
    description: '   Hồ nước ngọt trong xanh ngọc bích trên đỉnh đồi Tà Pạ.   '
  };
  const diffWs = computePlaceDiff(masterPlace, dbWhitespace);
  assert.equal(diffWs.description, undefined, 'Whitespace padding must not trigger spurious diff');

  // Case 4: Genuine description difference -> Generates diff
  const dbOutdated = {
    ...masterPlace,
    description: 'Mô tả cũ sơ sài.'
  };
  const diffOutdated = computePlaceDiff(masterPlace, dbOutdated);
  assert.equal(
    diffOutdated.description,
    'Hồ nước ngọt trong xanh ngọc bích trên đỉnh đồi Tà Pạ.',
    'Must capture master description in diff'
  );

  // Case 5: DB description is null / undefined -> Generates diff
  const dbNull = {
    ...masterPlace,
    description: null
  };
  const diffNull = computePlaceDiff(masterPlace, dbNull);
  assert.equal(
    diffNull.description,
    'Hồ nước ngọt trong xanh ngọc bích trên đỉnh đồi Tà Pạ.'
  );

  // Case 6: Master description is empty -> Does not wipe DB description
  const masterEmptyDesc = {
    ...masterPlace,
    description: ''
  };
  const dbWithDesc = {
    ...masterPlace,
    description: 'Mô tả đang có trên DB.'
  };
  const diffEmptyMaster = computePlaceDiff(masterEmptyDesc, dbWithDesc);
  assert.equal(diffEmptyMaster.description, undefined, 'Empty master description must not overwrite DB description');
});

test('P03-024: Integration test - Production Master CSV description integrity across all 132 records', async () => {
  const { parseMasterCsv } = require(syncScriptPath);

  assert.ok(fs.existsSync(masterCsvPath), 'tri_ton_master_cleaned.csv must exist');
  const rawContent = fs.readFileSync(masterCsvPath, 'utf8');
  const records = parseMasterCsv(rawContent);

  // Exactly 132 records
  assert.equal(records.length, 132, 'Master CSV must contain exactly 132 POI records');

  // 100% of records must have rich descriptions
  records.forEach((record, index) => {
    assert.ok(record.id, `Row ${index + 1} must have an id`);
    assert.ok(record.description, `Row ${index + 1} [${record.id}] must have a description`);
    assert.ok(
      record.description.trim().length >= 15,
      `Row ${index + 1} [${record.id}] description too short: "${record.description}"`
    );
  });

  // Verify prominent POI descriptions
  const hoTaPa = records.find(r => r.id === 'ho-ta-pa');
  assert.ok(hoTaPa, 'ho-ta-pa must exist');
  assert.match(hoTaPa.description, /Tuyệt Tình Cốc/);

  const chuaTaPa = records.find(r => r.id === 'chua-ta-pa');
  assert.ok(chuaTaPa, 'chua-ta-pa must exist');
  assert.match(chuaTaPa.description, /Ngôi chùa Phật giáo Nam Tông Khmer/);

  const nuiCoTo = records.find(r => r.id === 'nui-co-to');
  assert.ok(nuiCoTo, 'nui-co-to must exist');
  assert.match(nuiCoTo.description, /614m/);
  assert.match(nuiCoTo.description, /TRI TÔN/);

  const hoSoaiChek = records.find(r => r.id === 'ho-soai-chek');
  assert.ok(hoSoaiChek, 'ho-soai-chek must exist');
  assert.match(hoSoaiChek.description, /đồi Tà Pạ/);
});
