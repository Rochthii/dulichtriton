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

test('P03-023: Static code invariant - smart_delta_sync exports parseCsvRows, parseMasterCsv, computePlaceDiff', async () => {
  assert.ok(fs.existsSync(syncScriptPath), 'smart_delta_sync.js must exist');
  const syncModule = require(syncScriptPath);

  assert.equal(typeof syncModule.parseCsvRows, 'function', 'Must export parseCsvRows');
  assert.equal(typeof syncModule.parseMasterCsv, 'function', 'Must export parseMasterCsv');
  assert.equal(typeof syncModule.computePlaceDiff, 'function', 'Must export computePlaceDiff');

  const code = fs.readFileSync(syncScriptPath, 'utf8');
  assert.match(code, /parseCsvRows/, 'Code must implement RFC 4180 parseCsvRows');
  assert.match(code, /computePlaceDiff/, 'Code must implement computePlaceDiff');
});

test('P03-023: Unit test - parseMasterCsv parses address with commas, quotes, and multiline content', async () => {
  const { parseMasterCsv } = require(syncScriptPath);

  const testCsv = `id,name,commune,category,subcategory,latitude,longitude,address,description
"ho-ta-pa","Hồ Tà Pạ","Xã Núi Tô","nature","lake","10.4165","105.0042","Đồi Tà Pạ, Xã Núi Tô, Tri Tôn, An Giang","Tuyệt tình cốc Bảy Núi"
"chua-xa-ton","Chùa Xà Tón","Thị trấn Tri Tôn","spiritual","temple","10.4110","105.0089","Đường Nam Kỳ Khởi Nghĩa, Khóm 3, Thị trấn Tri Tôn, An Giang","Kỷ lục VietKings: Chùa lưu giữ ""Kinh lá buông"" cổ nhất"
"diem-multiline","Điểm Multiline","Xã Châu Lăng","culture","heritage","10.4500","105.0200","Ấp Tà Miệt, Xã Châu Lăng,
Huyện Tri Tôn, Tỉnh An Giang","Mô tả có nhiều dòng
xuống hàng liên tiếp"`;

  const records = parseMasterCsv(testCsv);
  assert.equal(records.length, 3, 'Must parse exactly 3 records');

  // Record 1: address with multiple commas
  assert.equal(records[0].id, 'ho-ta-pa');
  assert.equal(records[0].address, 'Đồi Tà Pạ, Xã Núi Tô, Tri Tôn, An Giang');

  // Record 2: address with commas and escaped quotes in description
  assert.equal(records[1].id, 'chua-xa-ton');
  assert.equal(records[1].address, 'Đường Nam Kỳ Khởi Nghĩa, Khóm 3, Thị trấn Tri Tôn, An Giang');
  assert.equal(records[1].description, 'Kỷ lục VietKings: Chùa lưu giữ "Kinh lá buông" cổ nhất');

  // Record 3: address with newline inside quoted field
  assert.equal(records[2].id, 'diem-multiline');
  assert.equal(records[2].address, 'Ấp Tà Miệt, Xã Châu Lăng,\nHuyện Tri Tôn, Tỉnh An Giang');
  assert.match(records[2].description, /Mô tả có nhiều dòng/);
});

test('P03-023: Unit test - parseMasterCsv fallback when address is empty or whitespace', async () => {
  const { parseMasterCsv } = require(syncScriptPath);

  const testCsv = `id,name,commune,category,subcategory,latitude,longitude,address,description
"place-empty-addr","Địa Điểm Không Địa Chỉ","Xã An Tức","nature","mountain","10.4200","105.0100","","Mô tả"
"place-space-addr","Địa Điểm Khoảng Trắng","Xã Ô Lâm","nature","lake","10.4300","105.0200","   ","Mô tả"
"place-no-commune","Địa Điểm Không Xã","","nature","lake","10.4400","105.0300","","Mô tả"`;

  const records = parseMasterCsv(testCsv);
  assert.equal(records.length, 3);

  assert.equal(records[0].address, 'Xã An Tức, Tri Tôn, An Giang', 'Empty address should fallback to commune address');
  assert.equal(records[1].address, 'Xã Ô Lâm, Tri Tôn, An Giang', 'Whitespace address should fallback to commune address');
  assert.equal(records[2].address, 'Tri Tôn, An Giang', 'Missing commune and address should fallback to default district address');
});

test('P03-023: Unit test - computePlaceDiff accurately computes address diff (match vs diff)', async () => {
  const { computePlaceDiff } = require(syncScriptPath);

  const masterRecord = {
    id: 'ho-ta-pa',
    name: 'Hồ Tà Pạ (Tuyệt Tình Cốc Bảy Núi)',
    commune: 'Xã Núi Tô',
    category: 'nature',
    subcategory: 'lake',
    latitude: 10.4165,
    longitude: 105.0042,
    address: 'Đồi Tà Pạ, Xã Núi Tô, Tri Tôn, An Giang',
    description: 'Tuyệt tình cốc Bảy Núi'
  };

  // Case 1: Identical address -> NO address diff
  const dbMatch = {
    id: 'ho-ta-pa',
    name: 'Hồ Tà Pạ (Tuyệt Tình Cốc Bảy Núi)',
    commune: 'Xã Núi Tô',
    category: 'nature',
    subcategory: 'lake',
    latitude: 10.4165,
    longitude: 105.0042,
    address: 'Đồi Tà Pạ, Xã Núi Tô, Tri Tôn, An Giang',
    description: 'Tuyệt tình cốc Bảy Núi'
  };
  const diffMatch = computePlaceDiff(masterRecord, dbMatch);
  assert.equal(diffMatch.address, undefined, 'Identical address must not generate address diff');
  assert.equal(Object.keys(diffMatch).length, 0, 'Full match must have empty diff');

  // Case 2: DB has outdated/fallback address -> generates address diff
  const dbOutdated = {
    ...dbMatch,
    address: 'Xã Núi Tô, Tri Tôn, An Giang' // Generic commune fallback
  };
  const diffOutdated = computePlaceDiff(masterRecord, dbOutdated);
  assert.equal(diffOutdated.address, 'Đồi Tà Pạ, Xã Núi Tô, Tri Tôn, An Giang', 'Must generate diff with master address');

  // Case 3: DB address is null/undefined
  const dbNullAddr = {
    ...dbMatch,
    address: null
  };
  const diffNull = computePlaceDiff(masterRecord, dbNullAddr);
  assert.equal(diffNull.address, 'Đồi Tà Pạ, Xã Núi Tô, Tri Tôn, An Giang');

  // Case 4: Address diff with whitespace normalization
  const dbWhitespace = {
    ...dbMatch,
    address: '  Đồi Tà Pạ, Xã Núi Tô, Tri Tôn, An Giang  '
  };
  const diffWs = computePlaceDiff(masterRecord, dbWhitespace);
  assert.equal(diffWs.address, undefined, 'Trimming difference must not trigger spurious diff');
});

test('P03-023: Integration test - Production Master CSV address integrity across all 132 records', async () => {
  const { parseMasterCsv } = require(syncScriptPath);

  assert.ok(fs.existsSync(masterCsvPath), 'tri_ton_master_cleaned.csv must exist');
  const rawContent = fs.readFileSync(masterCsvPath, 'utf8');
  const records = parseMasterCsv(rawContent);

  // Exactly 132 records
  assert.equal(records.length, 132, 'Master CSV must contain exactly 132 POI records');

  // 100% of records must have valid non-empty address
  records.forEach((record, index) => {
    assert.ok(record.id, `Row ${index + 1} must have an id`);
    assert.ok(record.address, `Row ${index + 1} [${record.id}] must have an address`);
    assert.ok(record.address.trim().length >= 3, `Row ${index + 1} [${record.id}] address too short: "${record.address}"`);
  });

  // Verify majority have regional markers
  const withRegionalMarker = records.filter(r => r.address.includes('Tri Tôn') || r.address.includes('An Giang'));
  assert.ok(withRegionalMarker.length >= 130, `Expected at least 130 records with Tri Tôn/An Giang, got ${withRegionalMarker.length}`);

  // Verify critical landmark addresses
  const hoTaPa = records.find(r => r.id === 'ho-ta-pa');
  assert.ok(hoTaPa, 'ho-ta-pa must exist');
  assert.equal(hoTaPa.address, 'Đồi Tà Pạ, Xã Núi Tô, Tri Tôn, An Giang');

  const chuaTaPa = records.find(r => r.id === 'chua-ta-pa');
  assert.ok(chuaTaPa, 'chua-ta-pa must exist');
  assert.equal(chuaTaPa.address, 'Đồi Tà Pạ, Xã Núi Tô, Tri Tôn, An Giang');

  const hoSoaiChek = records.find(r => r.id === 'ho-soai-chek');
  assert.ok(hoSoaiChek, 'ho-soai-chek must exist');
  assert.equal(hoSoaiChek.address, 'Dưới chân đồi Tà Pạ, Xã Núi Tô, Tri Tôn, An Giang');
});
