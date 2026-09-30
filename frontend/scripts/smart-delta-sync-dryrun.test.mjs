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

test('P03-022: Static code invariant - smart_delta_sync.js guards all mutations behind isDryRun flag', async () => {
  assert.ok(fs.existsSync(syncScriptPath), 'smart_delta_sync.js must exist');
  const code = fs.readFileSync(syncScriptPath, 'utf8');

  // Verify dryRun detection
  assert.match(code, /--dry-run/, 'Must check for --dry-run CLI argument');
  assert.match(code, /isDryRun/, 'Must define isDryRun flag');

  // Verify dryRun branching for places and itineraries
  assert.match(code, /if\s*\(\s*isDryRun\s*\)/, 'Mutations must be guarded by isDryRun check');
  assert.match(code, /\[DRY-RUN\]/, 'Must log [DRY-RUN] indicators');
});

test('P03-022: Unit test - parseMasterCsv parses records correctly', async () => {
  const { parseMasterCsv } = require(syncScriptPath);

  const sampleCsv = `id,name,commune,category,subcategory,latitude,longitude,address,description
"chua-xa-ton","Chùa Xà Tón","Thị trấn Tri Tôn","culture","chùa","10.411","105.0089","Đường Nam Kỳ Khởi Nghĩa","Chùa cổ Khmer"
"ho-ta-pa","Hồ Tà Pạ","Xã Núi Tô","nature","hồ","10.435","105.0123","Xã Núi Tô, Tri Tôn","Tuyệt tình cốc"`;

  const parsed = parseMasterCsv(sampleCsv);
  assert.equal(parsed.length, 2, 'Must parse exactly 2 records');
  assert.equal(parsed[0].id, 'chua-xa-ton');
  assert.equal(parsed[0].name, 'Chùa Xà Tón');
  assert.equal(parsed[0].commune, 'Thị trấn Tri Tôn');
  assert.equal(parsed[0].latitude, 10.411);
  assert.equal(parsed[0].longitude, 105.0089);
  assert.equal(parsed[1].id, 'ho-ta-pa');
  assert.equal(parsed[1].name, 'Hồ Tà Pạ');
});

test('P03-022: Integration test - smart_delta_sync in dry-run mode generates accurate diff report with zero errors', async () => {
  const { runSmartDeltaSync } = require(syncScriptPath);

  const report = await runSmartDeltaSync({ dryRun: true });

  assert.ok(report, 'Must return summary report object');
  assert.equal(report.mode, 'DRY_RUN', 'Report mode must be DRY_RUN');
  assert.ok(report.timestamp, 'Report must contain timestamp');

  // Places report assertions
  assert.ok(report.places, 'Must include places report');
  assert.equal(report.places.entity, 'places');
  assert.equal(report.places.mode, 'DRY_RUN');
  assert.equal(typeof report.places.skip, 'number');
  assert.equal(typeof report.places.patch, 'number');
  assert.equal(typeof report.places.create, 'number');
  assert.equal(report.places.error, 0, 'Places dry-run must encounter 0 network/credential errors');
  assert.ok(report.places.skip + report.places.patch + report.places.create >= 120, 'Total places evaluated must be >= 120');

  // Itineraries report assertions
  assert.ok(report.itineraries, 'Must include itineraries report');
  assert.equal(report.itineraries.entity, 'itineraries');
  assert.equal(report.itineraries.mode, 'DRY_RUN');
  assert.equal(typeof report.itineraries.skip, 'number');
  assert.equal(typeof report.itineraries.patch, 'number');
  assert.equal(typeof report.itineraries.create, 'number');
  assert.equal(report.itineraries.error, 0, 'Itineraries dry-run must encounter 0 network/credential errors');
  assert.equal(report.itineraries.skip + report.itineraries.patch + report.itineraries.create, 27, 'Total itineraries evaluated must equal exactly 27');

  // Totals assertions
  assert.equal(report.totals.error, 0, 'Overall total errors must equal 0');
  assert.equal(
    report.totals.skip,
    report.places.skip + report.itineraries.skip,
    'Total skip count must equal sum of places and itineraries skip'
  );
  assert.equal(
    report.totals.patch,
    report.places.patch + report.itineraries.patch,
    'Total patch count must equal sum of places and itineraries patch'
  );
  assert.equal(
    report.totals.create,
    report.places.create + report.itineraries.create,
    'Total create count must equal sum of places and itineraries create'
  );
});
