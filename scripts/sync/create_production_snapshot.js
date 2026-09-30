const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const rootDir = path.join(__dirname, '..', '..');
const backupsDir = path.join(rootDir, 'data', 'backups');
const techSpecDir = path.join(rootDir, 'docs', 'technical-spec');
const canonicalManifestPath = path.join(rootDir, 'data', 'canonical', 'canonical_manifest.json');

function sha256(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

function verifyGateG2Approval(customManifestPath) {
  const targetPath = customManifestPath || canonicalManifestPath;
  if (!fs.existsSync(targetPath)) {
    throw new Error(`GATE_G2_VIOLATION: Canonical manifest not found at ${targetPath}`);
  }
  const manifest = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
  if (!manifest.manifest_version || !manifest.overall_sha256 || !manifest.lead_auditor) {
    throw new Error('GATE_G2_VIOLATION: Canonical manifest is missing required governance fields (manifest_version, overall_sha256, lead_auditor)');
  }
  return manifest;
}

async function createProductionSnapshot(options = {}) {
  const fetchFn = options.fetch || fetch;
  const { getCredentials } = require('./smart_delta_sync');
  const { supabaseUrl, supabaseKey } = getCredentials(options);

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('MISSING_CREDENTIALS: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is required');
  }

  // 1. Verify Gate G2 approval
  const gateG2Manifest = verifyGateG2Approval(options.canonicalManifestPath);

  // 2. Fetch places snapshot
  const placesRes = await fetchFn(`${supabaseUrl}/rest/v1/places?select=*`, {
    headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
  });
  if (!placesRes.ok) {
    const errText = await placesRes.text().catch(() => '');
    throw new Error(`FETCH_PLACES_FAILED: HTTP ${placesRes.status} - ${errText}`);
  }
  const placesData = await placesRes.json();

  // 3. Fetch preset_itineraries snapshot
  const itinsRes = await fetchFn(`${supabaseUrl}/rest/v1/preset_itineraries?select=*`, {
    headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
  });
  if (!itinsRes.ok) {
    const errText = await itinsRes.text().catch(() => '');
    throw new Error(`FETCH_ITINERARIES_FAILED: HTTP ${itinsRes.status} - ${errText}`);
  }
  const itinsData = await itinsRes.json();

  // 4. Ensure backups and tech-spec dirs exist
  const targetBackupDir = options.backupDir || backupsDir;
  if (!fs.existsSync(targetBackupDir)) {
    fs.mkdirSync(targetBackupDir, { recursive: true });
  }
  if (!fs.existsSync(techSpecDir)) {
    fs.mkdirSync(techSpecDir, { recursive: true });
  }

  const timestamp = options.timestamp || new Date().toISOString().replace(/[:.]/g, '-');
  const placesJson = JSON.stringify(placesData, null, 2);
  const itinsJson = JSON.stringify(itinsData, null, 2);

  const placesHash = sha256(placesJson);
  const itinsHash = sha256(itinsJson);

  const placesBackupPath = path.join(targetBackupDir, `snapshot_places_${timestamp}.json`);
  const itinsBackupPath = path.join(targetBackupDir, `snapshot_itineraries_${timestamp}.json`);
  const liveSnapshotSpecPath = path.join(techSpecDir, 'LIVE_DB_PLACES_SNAPSHOT.json');
  const liveIdsSpecPath = path.join(techSpecDir, 'LIVE_DB_PLACES_IDS.json');

  fs.writeFileSync(placesBackupPath, placesJson, 'utf8');
  fs.writeFileSync(itinsBackupPath, itinsJson, 'utf8');

  // Only update repository technical-spec documents when connecting to real Supabase, never with mock fetch
  if (!options.fetch || options.updateTechSpec) {
    fs.writeFileSync(liveSnapshotSpecPath, placesJson, 'utf8');
    fs.writeFileSync(liveIdsSpecPath, JSON.stringify(placesData.map(p => p.id), null, 2), 'utf8');
  }

  // Unified backup manifest
  const backupManifest = {
    backup_type: 'PRE_SYNC_SNAPSHOT',
    gate_approval: 'GATE_G2',
    lead_auditor: gateG2Manifest.lead_auditor || 'Chăm Rốch Thi',
    timestamp: new Date().toISOString(),
    canonical_manifest_sha256: gateG2Manifest.overall_sha256,
    places: {
      count: placesData.length,
      sha256: placesHash,
      file: path.relative(rootDir, placesBackupPath).replace(/\\/g, '/')
    },
    itineraries: {
      count: itinsData.length,
      sha256: itinsHash,
      file: path.relative(rootDir, itinsBackupPath).replace(/\\/g, '/')
    }
  };

  const backupManifestPath = path.join(targetBackupDir, `snapshot_manifest_${timestamp}.json`);
  fs.writeFileSync(backupManifestPath, JSON.stringify(backupManifest, null, 2), 'utf8');

  return {
    ok: true,
    timestamp,
    placesCount: placesData.length,
    placesHash,
    placesBackupPath,
    itinsCount: itinsData.length,
    itinsHash,
    itinsBackupPath,
    backupManifestPath,
    backupManifest
  };
}

if (require.main === module) {
  createProductionSnapshot()
    .then(res => {
      console.log('✅ Snapshot backup thành công:', res.backupManifest);
    })
    .catch(err => {
      console.error('❌ Lỗi tạo snapshot backup:', err.message);
      process.exit(1);
    });
}

module.exports = {
  sha256,
  verifyGateG2Approval,
  createProductionSnapshot,
  backupsDir,
  techSpecDir
};
