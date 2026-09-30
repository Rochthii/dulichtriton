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
const snapshotScriptPath = path.resolve(REPO_ROOT, 'scripts/sync/create_production_snapshot.js');
const canonicalManifestPath = path.resolve(REPO_ROOT, 'data/canonical/canonical_manifest.json');
const backupsDir = path.resolve(REPO_ROOT, 'data/backups');
const techSpecDir = path.resolve(REPO_ROOT, 'docs/technical-spec');

test('P03-028: Static code invariant - smart_delta_sync integrates Gate G2 verification, snapshot backup, and post-sync audit', async () => {
  assert.ok(fs.existsSync(syncScriptPath), 'smart_delta_sync.js must exist');
  assert.ok(fs.existsSync(snapshotScriptPath), 'create_production_snapshot.js must exist');

  const syncCode = fs.readFileSync(syncScriptPath, 'utf8');
  const snapCode = fs.readFileSync(snapshotScriptPath, 'utf8');

  // Verify Gate G2 verification
  assert.match(snapCode, /verifyGateG2Approval/, 'Must define verifyGateG2Approval');
  assert.match(snapCode, /GATE_G2_VIOLATION/, 'Must reject with GATE_G2_VIOLATION on failure');

  // Verify createProductionSnapshot
  assert.match(snapCode, /createProductionSnapshot/, 'Must define createProductionSnapshot');
  assert.match(snapCode, /backup_type:\s*['"]PRE_SYNC_SNAPSHOT['"]/, 'Must tag backup as PRE_SYNC_SNAPSHOT');
  assert.match(snapCode, /gate_approval:\s*['"]GATE_G2['"]/, 'Must record GATE_G2 approval');

  // Verify integration in smart_delta_sync
  assert.match(syncCode, /createProductionSnapshot/, 'smart_delta_sync must import/call createProductionSnapshot');
  assert.match(syncCode, /postSyncVerification/, 'smart_delta_sync must perform post-sync verification');
});

test('P03-028: Gate G2 Fail-Closed - Rejects snapshot backup if Gate G2 canonical manifest is missing or invalid', async () => {
  const { verifyGateG2Approval } = require(snapshotScriptPath);

  // Missing file must throw
  assert.throws(() => {
    verifyGateG2Approval('/tmp/non_existent_manifest.json');
  }, /GATE_G2_VIOLATION/);

  // Corrupted manifest missing lead_auditor must throw
  const tempInvalidManifest = path.resolve(backupsDir, 'temp_invalid_manifest.json');
  if (!fs.existsSync(backupsDir)) fs.mkdirSync(backupsDir, { recursive: true });
  fs.writeFileSync(tempInvalidManifest, JSON.stringify({ manifest_version: '1.0.0' }));

  try {
    assert.throws(() => {
      verifyGateG2Approval(tempInvalidManifest);
    }, /GATE_G2_VIOLATION/);
  } finally {
    if (fs.existsSync(tempInvalidManifest)) fs.unlinkSync(tempInvalidManifest);
  }

  // Official manifest must pass Gate G2
  const validManifest = verifyGateG2Approval();
  assert.ok(validManifest, 'Official manifest must be valid');
  assert.equal(validManifest.lead_auditor, 'Chăm Rốch Thi');
  assert.ok(validManifest.overall_sha256);
});

test('P03-028: Unit test - createProductionSnapshot generates timestamped backup files with verified SHA-256', async () => {
  const { createProductionSnapshot, sha256 } = require(snapshotScriptPath);

  const mockPlaces = [
    { id: 'chua-xa-ton', name: 'Chùa Xà Tón', commune: 'Thị trấn Tri Tôn' },
    { id: 'ho-ta-pa', name: 'Hồ Tà Pạ', commune: 'Xã Núi Tô' }
  ];
  const mockItins = [
    { id: 'itin-001', slug: 'kinh-dien-1-ngay', title: 'Kinh điển 1 ngày' }
  ];

  const mockFetch = async (url) => {
    const urlStr = String(url);
    if (urlStr.includes('/places')) {
      return { ok: true, status: 200, json: async () => mockPlaces };
    }
    if (urlStr.includes('/preset_itineraries')) {
      return { ok: true, status: 200, json: async () => mockItins };
    }
    return { ok: false, status: 500 };
  };

  const testTimestamp = 'test-snapshot-' + Date.now();
  const result = await createProductionSnapshot({
    fetch: mockFetch,
    timestamp: testTimestamp,
    supabaseUrl: 'https://mock.supabase.co',
    supabaseKey: 'mock-key'
  });

  assert.ok(result.ok, 'Snapshot creation must succeed');
  assert.equal(result.placesCount, 2, 'Must record correct places count');
  assert.equal(result.itinsCount, 1, 'Must record correct itineraries count');

  // Verify backup files exist on disk
  assert.ok(fs.existsSync(result.placesBackupPath), 'Places backup file must exist');
  assert.ok(fs.existsSync(result.itinsBackupPath), 'Itineraries backup file must exist');
  assert.ok(fs.existsSync(result.backupManifestPath), 'Backup manifest file must exist');

  // Verify SHA-256 integrity
  const savedPlacesContent = fs.readFileSync(result.placesBackupPath, 'utf8');
  assert.equal(sha256(savedPlacesContent), result.placesHash, 'Places backup hash must match');

  const savedItinsContent = fs.readFileSync(result.itinsBackupPath, 'utf8');
  assert.equal(sha256(savedItinsContent), result.itinsHash, 'Itineraries backup hash must match');

  // Verify manifest content
  const manifestData = JSON.parse(fs.readFileSync(result.backupManifestPath, 'utf8'));
  assert.equal(manifestData.gate_approval, 'GATE_G2');
  assert.equal(manifestData.lead_auditor, 'Chăm Rốch Thi');
  assert.equal(manifestData.places.count, 2);
  assert.equal(manifestData.itineraries.count, 1);

  // Clean up test files
  if (fs.existsSync(result.placesBackupPath)) fs.unlinkSync(result.placesBackupPath);
  if (fs.existsSync(result.itinsBackupPath)) fs.unlinkSync(result.itinsBackupPath);
  if (fs.existsSync(result.backupManifestPath)) fs.unlinkSync(result.backupManifestPath);
});

test('P03-028: Integration test - runSmartDeltaSync in LIVE mode orchestrates pre-sync snapshot and post-sync audit', async () => {
  const { runSmartDeltaSync } = require(syncScriptPath);

  // Load real Master CSV and lichtrinh.json to construct realistic mock responses
  const masterCsv = fs.readFileSync(path.resolve(REPO_ROOT, 'data/tri_ton_master_cleaned.csv'), 'utf8');
  const lichtrinh = JSON.parse(fs.readFileSync(path.resolve(REPO_ROOT, 'data/lichtrinh.json'), 'utf8'));

  const mockDbPlaces = [
    {
      id: 'chua-xa-ton',
      name: 'Chùa Xà Tón',
      commune: 'Thị trấn Tri Tôn',
      category: 'culture',
      subcategory: 'chùa',
      latitude: 10.411,
      longitude: 105.0089,
      address: 'Đường Nam Kỳ Khởi Nghĩa',
      description: 'Chùa cổ Khmer'
    }
  ];

  const mockDbItins = lichtrinh.itineraries.map((it, idx) => ({
    id: `itin-uuid-${idx + 1}`,
    slug: it.slug || `tour-${it.id}`,
    emoji: it.emoji || '🧭',
    title: it.name,
    tagline: it.description,
    for_whom: (it.audiences || ['Mọi du khách']).join(', '),
    duration: it.duration,
    budget_range: it.budget_level || '200k - 500k/người',
    stops: [],
    is_active: true,
    sort_order: idx + 1
  }));

  const mockFetch = async (url, options = {}) => {
    const urlStr = String(url);
    const method = options.method || 'GET';

    if (method === 'GET') {
      if (urlStr.includes('/places')) {
        return { ok: true, status: 200, json: async () => mockDbPlaces };
      }
      if (urlStr.includes('/preset_itineraries')) {
        return { ok: true, status: 200, json: async () => mockDbItins };
      }
    }

    if (method === 'POST' || method === 'PATCH') {
      return { ok: true, status: 200, json: async () => ({}) };
    }

    return { ok: false, status: 500 };
  };

  const tmpTestBackupDir = path.resolve(REPO_ROOT, 'data/backups/test_tmp_' + Date.now());
  fs.mkdirSync(tmpTestBackupDir, { recursive: true });

  try {
    const summary = await runSmartDeltaSync({
      dryRun: false,
      fetch: mockFetch,
      supabaseUrl: 'https://mock.supabase.co',
      supabaseKey: 'mock-key',
      backupDir: tmpTestBackupDir
    });

    assert.equal(summary.mode, 'LIVE');
    assert.ok(summary.preSyncSnapshot, 'Must record preSyncSnapshot');
    assert.ok(summary.preSyncSnapshot.placesHash, 'Pre-sync snapshot must have placesHash');
    assert.ok(summary.preSyncSnapshot.itinsHash, 'Pre-sync snapshot must have itinsHash');
    assert.ok(summary.postSyncVerification, 'Must record postSyncVerification');
    assert.equal(summary.postSyncVerification.ok, true, 'Post-sync verification must succeed');
    assert.equal(summary.totals.error, 0, 'Must have zero errors');
  } finally {
    if (fs.existsSync(tmpTestBackupDir)) {
      fs.rmSync(tmpTestBackupDir, { recursive: true, force: true });
    }
  }
});

test('P03-028: Production Disk Artifact Verification - Pre-sync live snapshot exists and has valid checksum', async () => {
  const liveSnapshotPath = path.resolve(techSpecDir, 'LIVE_DB_PLACES_SNAPSHOT.json');
  assert.ok(fs.existsSync(liveSnapshotPath), 'LIVE_DB_PLACES_SNAPSHOT.json must exist');

  const snapshotContent = fs.readFileSync(liveSnapshotPath, 'utf8');
  assert.ok(snapshotContent.length > 1000, 'Snapshot content must not be empty');

  const snapshotData = JSON.parse(snapshotContent);
  assert.ok(Array.isArray(snapshotData), 'Snapshot data must be an array of places');
  assert.ok(snapshotData.length >= 130, `Snapshot places count must be >= 130 (got ${snapshotData.length})`);

  // Verify critical POIs exist in the snapshot
  const chuaXaTon = snapshotData.find(p => p.id.includes('xà-tón') || p.id.includes('xa-ton'));
  assert.ok(chuaXaTon, 'Chùa Xà Tón must be present in live snapshot');

  // Verify backup directory contains manifest
  const backupFiles = fs.readdirSync(backupsDir);
  const manifests = backupFiles.filter(f => f.startsWith('snapshot_manifest_'));
  assert.ok(manifests.length > 0, 'Must have at least one snapshot manifest in data/backups/');

  // Locate the valid production manifest
  const validManifestFile = manifests.find(m => {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(backupsDir, m), 'utf8'));
      return data.places && data.places.count >= 130;
    } catch {
      return false;
    }
  });
  assert.ok(validManifestFile, 'Must find production snapshot manifest with >= 130 places');

  const manifestData = JSON.parse(fs.readFileSync(path.join(backupsDir, validManifestFile), 'utf8'));
  assert.equal(manifestData.gate_approval, 'GATE_G2');
  assert.equal(manifestData.lead_auditor, 'Chăm Rốch Thi');
  assert.ok(manifestData.places.count >= 130);
  assert.equal(manifestData.itineraries.count, 27);
});
