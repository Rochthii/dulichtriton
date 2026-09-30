const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..', '..');
const envFile = path.join(rootDir, 'frontend', '.env.local');
const masterCsvFile = path.join(rootDir, 'data', 'tri_ton_master_cleaned.csv');
const lichtrinhFile = path.join(rootDir, 'data', 'lichtrinh.json');

function getCredentials(customEnv = {}) {
  let url = customEnv.supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  let key = customEnv.supabaseKey || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!url || !key) {
    if (fs.existsSync(envFile)) {
      const envContent = fs.readFileSync(envFile, 'utf8');
      envContent.split('\n').forEach(line => {
        if (!url && line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = line.split('=')[1].trim().replace(/^["']|["']$/g, '');
        if (!key && line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) key = line.split('=')[1].trim().replace(/^["']|["']$/g, '');
        if (!key && line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) key = line.split('=')[1].trim().replace(/^["']|["']$/g, '');
      });
    }
  }

  return { supabaseUrl: url, supabaseKey: key };
}

// 1. RFC 4180 Compliant CSV Parser
function parseCsvRows(csvText) {
  if (typeof csvText !== 'string') return [];
  if (csvText.charCodeAt(0) === 0xFEFF) {
    csvText = csvText.slice(1);
  }

  const rows = [];
  let currentRow = [];
  let currentField = '';
  let inQuotes = false;
  let i = 0;
  const len = csvText.length;

  while (i < len) {
    const char = csvText[i];

    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < len && csvText[i + 1] === '"') {
          currentField += '"';
          i += 2;
          continue;
        } else {
          inQuotes = false;
          i++;
          continue;
        }
      } else {
        currentField += char;
        i++;
        continue;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
        i++;
        continue;
      } else if (char === ',') {
        currentRow.push(currentField);
        currentField = '';
        i++;
        continue;
      } else if (char === '\r') {
        if (i + 1 < len && csvText[i + 1] === '\n') {
          i++;
        }
        currentRow.push(currentField);
        currentField = '';
        rows.push(currentRow);
        currentRow = [];
        i++;
        continue;
      } else if (char === '\n') {
        currentRow.push(currentField);
        currentField = '';
        rows.push(currentRow);
        currentRow = [];
        i++;
        continue;
      } else {
        currentField += char;
        i++;
        continue;
      }
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  return rows.filter(r => r.length > 1 || (r.length === 1 && r[0].trim() !== ''));
}

// 2. Parser Master CSV
function parseMasterCsv(csvText) {
  const rows = parseCsvRows(csvText);
  if (rows.length === 0) return [];

  const headerRow = rows[0].map(h => h.trim().toLowerCase());
  const colIndex = {};
  headerRow.forEach((col, idx) => {
    colIndex[col] = idx;
  });

  const getCol = (row, name, fallbackIdx) => {
    if (colIndex[name] !== undefined && row[colIndex[name]] !== undefined) {
      return row[colIndex[name]];
    }
    if (fallbackIdx !== undefined && row[fallbackIdx] !== undefined) {
      return row[fallbackIdx];
    }
    return '';
  };

  const records = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const id = (getCol(row, 'id', 0) || '').trim();
    if (!id) continue;

    const name = (getCol(row, 'name', 1) || '').trim();
    const commune = (getCol(row, 'commune', 2) || '').trim();
    const category = (getCol(row, 'category', 3) || '').trim();
    const subcategory = (getCol(row, 'subcategory', 4) || '').trim();
    const latStr = (getCol(row, 'latitude', 5) || '').trim();
    const lonStr = (getCol(row, 'longitude', 6) || '').trim();
    const rawAddress = getCol(row, 'address', 7);
    const rawDesc = getCol(row, 'description', 8);

    const address = rawAddress && rawAddress.trim() ? rawAddress.trim() : (commune ? `${commune}, Tri Tôn, An Giang` : 'Tri Tôn, An Giang');
    const description = rawDesc ? rawDesc.trim() : '';

    records.push({
      id,
      place_id: id,
      slug: id,
      name,
      commune,
      district: 'Tri Tôn',
      province: 'An Giang',
      category,
      tourism_category: category,
      subcategory,
      latitude: parseFloat(latStr) || 0,
      longitude: parseFloat(lonStr) || 0,
      address,
      description
    });
  }

  return records;
}

// Helper to normalize text (handling null/undefined, CRLF -> LF, and trimming)
function normalizeText(text) {
  if (text === null || text === undefined) return '';
  return String(text).replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
}

// 3. Compute Diff between Master and Database Place
function computePlaceDiff(master, db) {
  const diff = {};
  if (!db) return diff;
  if (master.name && normalizeText(db.name) !== normalizeText(master.name)) diff.name = master.name;
  if (master.commune && normalizeText(db.commune) !== normalizeText(master.commune)) diff.commune = master.commune;
  if (master.category && normalizeText(db.category) !== normalizeText(master.category)) diff.category = master.category;
  if (master.subcategory && normalizeText(db.subcategory) !== normalizeText(master.subcategory)) diff.subcategory = master.subcategory;
  if (master.latitude !== undefined && !isNaN(master.latitude) && (db.latitude === undefined || db.latitude === null || Math.abs(Number(db.latitude) - master.latitude) > 0.0001)) {
    diff.latitude = master.latitude;
  }
  if (master.longitude !== undefined && !isNaN(master.longitude) && (db.longitude === undefined || db.longitude === null || Math.abs(Number(db.longitude) - master.longitude) > 0.0001)) {
    diff.longitude = master.longitude;
  }
  if (master.address && normalizeText(db.address) !== normalizeText(master.address)) {
    diff.address = master.address;
  }
  if (master.description && normalizeText(db.description) !== normalizeText(master.description)) {
    diff.description = master.description;
  }
  return diff;
}

function computeItineraryDiff(payload, db) {
  const diff = {};
  if (!db) return diff;

  if (payload.title && normalizeText(db.title) !== normalizeText(payload.title)) {
    diff.title = payload.title;
  }
  if (payload.tagline && normalizeText(db.tagline) !== normalizeText(payload.tagline)) {
    diff.tagline = payload.tagline;
  }
  if (payload.for_whom && normalizeText(db.for_whom) !== normalizeText(payload.for_whom)) {
    diff.for_whom = payload.for_whom;
  }
  if (payload.duration && normalizeText(db.duration) !== normalizeText(payload.duration)) {
    diff.duration = payload.duration;
  }
  if (payload.budget_range && normalizeText(db.budget_range) !== normalizeText(payload.budget_range)) {
    diff.budget_range = payload.budget_range;
  }
  if (payload.emoji && normalizeText(db.emoji) !== normalizeText(payload.emoji)) {
    diff.emoji = payload.emoji;
  }

  const dbStopsJson = JSON.stringify(db.stops || []);
  const payloadStopsJson = JSON.stringify(payload.stops || []);
  if (dbStopsJson !== payloadStopsJson) {
    diff.stops = payload.stops;
  }

  return diff;
}

async function syncPlacesDelta(options = {}) {
  const isDryRun = options.dryRun !== undefined ? options.dryRun : process.argv.includes('--dry-run');
  const { supabaseUrl, supabaseKey } = getCredentials(options);

  const report = {
    entity: 'places',
    mode: isDryRun ? 'DRY_RUN' : 'LIVE',
    skip: 0,
    patch: 0,
    create: 0,
    error: 0,
    details: []
  };

  console.log('\n================================================================================');
  console.log(`📍 SMART DELTA SYNC: BẢNG PLACES ${isDryRun ? '[CHẾ ĐỘ THỬ NGHIỆM - DRY-RUN]' : '[CHẾ ĐỘ SỐNG - LIVE]'}`);
  console.log('================================================================================');

  if (!supabaseUrl || !supabaseKey) {
    const err = 'Thiếu biến môi trường NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY';
    console.error(`❌ ${err}`);
    report.error++;
    report.details.push({ action: 'ERROR', error: err });
    return report;
  }

  if (!fs.existsSync(masterCsvFile)) {
    const err = `Không tìm thấy tệp Master CSV tại: ${masterCsvFile}`;
    console.error(`❌ ${err}`);
    report.error++;
    report.details.push({ action: 'ERROR', error: err });
    return report;
  }

  const masterPois = parseMasterCsv(fs.readFileSync(masterCsvFile, 'utf8'));

  const fetchFn = options.fetch || fetch;

  let res;
  try {
    res = await fetchFn(`${supabaseUrl}/rest/v1/places?select=id,name,commune,category,subcategory,latitude,longitude,address,description`, {
      headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
    });
  } catch (netErr) {
    console.error('❌ Lỗi kết nối Supabase:', netErr.message);
    report.error++;
    report.details.push({ action: 'ERROR', error: netErr.message });
    return report;
  }

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    console.error('❌ Lỗi tải places từ Supabase:', res.status, errText);
    report.error++;
    report.details.push({ action: 'ERROR', status: res.status, error: `HTTP ${res.status}: ${errText}` });
    return report;
  }

  const dbPlaces = await res.json();
  const dbMap = new Map();
  dbPlaces.forEach(p => dbMap.set(p.id, p));

  for (const master of masterPois) {
    const db = dbMap.get(master.id);
    if (!db) {
      if (isDryRun) {
        report.create++;
        report.details.push({ action: 'CREATE', id: master.id, name: master.name, mode: 'DRY_RUN' });
        console.log(`   [DRY-RUN] ➕ Sẽ INSERT mới: [${master.id}] "${master.name}"`);
      } else {
        try {
          const postRes = await fetchFn(`${supabaseUrl}/rest/v1/places`, {
            method: 'POST',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'resolution=merge-duplicates'
            },
            body: JSON.stringify(master)
          });
          if (postRes.ok) {
            report.create++;
            report.details.push({ action: 'CREATE', id: master.id, name: master.name, status: postRes.status });
            console.log(`   ➕ Đã INSERT mới: [${master.id}] "${master.name}"`);
          } else {
            const errText = await postRes.text().catch(() => '');
            report.error++;
            report.details.push({
              action: 'CREATE',
              id: master.id,
              name: master.name,
              status: postRes.status,
              error: `HTTP ${postRes.status}: ${errText}`
            });
            console.error(`   ❌ Lỗi INSERT [${master.id}] (HTTP ${postRes.status}):`, errText);
          }
        } catch (postErr) {
          report.error++;
          report.details.push({
            action: 'CREATE',
            id: master.id,
            name: master.name,
            error: postErr.message
          });
          console.error(`   ❌ Lỗi mạng khi INSERT [${master.id}]:`, postErr.message);
        }
      }
      continue;
    }

    const diff = computePlaceDiff(master, db);

    if (Object.keys(diff).length > 0) {
      if (isDryRun) {
        report.patch++;
        report.details.push({ action: 'PATCH', id: master.id, name: master.name, diff, mode: 'DRY_RUN' });
        console.log(`   [DRY-RUN] 🔄 Sẽ PATCH cập nhật [${master.id}]: ${Object.keys(diff).join(', ')}`);
      } else {
        try {
          const patchRes = await fetchFn(`${supabaseUrl}/rest/v1/places?id=eq.${master.id}`, {
            method: 'PATCH',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(diff)
          });
          if (patchRes.ok) {
            report.patch++;
            report.details.push({ action: 'PATCH', id: master.id, name: master.name, diff, status: patchRes.status });
            console.log(`   🔄 Đã PATCH cập nhật [${master.id}]: ${Object.keys(diff).join(', ')}`);
          } else {
            const errText = await patchRes.text().catch(() => '');
            report.error++;
            report.details.push({
              action: 'PATCH',
              id: master.id,
              name: master.name,
              diff,
              status: patchRes.status,
              error: `HTTP ${patchRes.status}: ${errText}`
            });
            console.error(`   ❌ Lỗi PATCH [${master.id}] (HTTP ${patchRes.status}):`, errText);
          }
        } catch (patchErr) {
          report.error++;
          report.details.push({
            action: 'PATCH',
            id: master.id,
            name: master.name,
            diff,
            error: patchErr.message
          });
          console.error(`   ❌ Lỗi mạng khi PATCH [${master.id}]:`, patchErr.message);
        }
      }
    } else {
      report.skip++;
    }
  }

  console.log(`📊 Kết quả Places: Skip=${report.skip} (100% khớp) | Patch=${report.patch} | Create=${report.create} | Error=${report.error}`);
  return report;
}

async function syncItinerariesDelta(options = {}) {
  const isDryRun = options.dryRun !== undefined ? options.dryRun : process.argv.includes('--dry-run');
  const { supabaseUrl, supabaseKey } = getCredentials(options);

  const report = {
    entity: 'itineraries',
    mode: isDryRun ? 'DRY_RUN' : 'LIVE',
    skip: 0,
    patch: 0,
    create: 0,
    error: 0,
    details: []
  };

  console.log('\n================================================================================');
  console.log(`🧭 SMART DELTA SYNC: BẢNG PRESET_ITINERARIES ${isDryRun ? '[CHẾ ĐỘ THỬ NGHIỆM - DRY-RUN]' : '[CHẾ ĐỘ SỐNG - LIVE]'}`);
  console.log('================================================================================');

  if (!supabaseUrl || !supabaseKey) {
    const err = 'Thiếu biến môi trường NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY';
    console.error(`❌ ${err}`);
    report.error++;
    report.details.push({ action: 'ERROR', error: err });
    return report;
  }

  if (!fs.existsSync(lichtrinhFile)) {
    const err = `Không tìm thấy tệp lichtrinh.json tại: ${lichtrinhFile}`;
    console.error(`❌ ${err}`);
    report.error++;
    report.details.push({ action: 'ERROR', error: err });
    return report;
  }

  const rawLichtrinh = JSON.parse(fs.readFileSync(lichtrinhFile, 'utf8'));

  const fetchFn = options.fetch || fetch;

  let listRes;
  try {
    listRes = await fetchFn(`${supabaseUrl}/rest/v1/preset_itineraries?select=*`, {
      headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
    });
  } catch (netErr) {
    console.error('❌ Lỗi kết nối Supabase:', netErr.message);
    report.error++;
    report.details.push({ action: 'ERROR', error: netErr.message });
    return report;
  }

  if (!listRes.ok) {
    const errText = await listRes.text().catch(() => '');
    console.error('❌ Lỗi tải preset_itineraries từ Supabase:', listRes.status, errText);
    report.error++;
    report.details.push({ action: 'ERROR', status: listRes.status, error: `HTTP ${listRes.status}: ${errText}` });
    return report;
  }

  const dbItins = await listRes.json();
  const dbMap = new Map();
  dbItins.forEach(it => dbMap.set(it.slug, it));

  for (let i = 0; i < rawLichtrinh.itineraries.length; i++) {
    const it = rawLichtrinh.itineraries[i];
    const slug = it.slug || `tour-${it.id}`;

    const flattenedStops = [];
    (it.days || []).forEach(day => {
      (day.stops || []).forEach(s => {
        flattenedStops.push({
          day: day.day,
          order: s.stop_order,
          time_start: s.time,
          time_end: '',
          name: s.name,
          poi_id: s.poi_id,
          commune: s.commune,
          category: s.category || 'visit',
          activity: s.activity,
          tip: s.notes || '',
          cost_vnd: s.cost_vnd || '',
          duration_min: s.duration_minutes || 60,
          travel_to_next_km: s.distance_from_prev_km || 0,
          travel_to_next_min: s.travel_time_mins || 0,
          transport_to_next: s.transport_to_next || ''
        });
      });
    });

    const payload = {
      slug,
      emoji: it.emoji || '🧭',
      title: it.name,
      tagline: it.description,
      for_whom: (it.audiences || ['Mọi du khách']).join(', '),
      duration: it.duration,
      budget_range: it.budget_level || '200k - 500k/người',
      stops: flattenedStops,
      is_active: true,
      sort_order: i + 1
    };

    const db = dbMap.get(slug);

    if (!db) {
      if (isDryRun) {
        report.create++;
        report.details.push({ action: 'CREATE', slug, title: it.name, mode: 'DRY_RUN' });
        console.log(`   [DRY-RUN] ➕ Sẽ INSERT tour mới: "${it.name}" (Slug: ${slug})`);
      } else {
        try {
          const postRes = await fetchFn(`${supabaseUrl}/rest/v1/preset_itineraries`, {
            method: 'POST',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          });
          if (postRes.ok) {
            report.create++;
            report.details.push({ action: 'CREATE', slug, title: it.name, status: postRes.status });
            console.log(`   ➕ Đã INSERT tour mới: "${it.name}" (Slug: ${slug})`);
          } else {
            const errText = await postRes.text().catch(() => '');
            report.error++;
            report.details.push({
              action: 'CREATE',
              slug,
              title: it.name,
              status: postRes.status,
              error: `HTTP ${postRes.status}: ${errText}`
            });
            console.error(`   ❌ Lỗi INSERT tour [${slug}] (HTTP ${postRes.status}):`, errText);
          }
        } catch (postErr) {
          report.error++;
          report.details.push({
            action: 'CREATE',
            slug,
            title: it.name,
            error: postErr.message
          });
          console.error(`   ❌ Lỗi mạng khi INSERT tour [${slug}]:`, postErr.message);
        }
      }
      continue;
    }

    const diff = computeItineraryDiff(payload, db);

    if (Object.keys(diff).length > 0) {
      if (isDryRun) {
        report.patch++;
        report.details.push({ action: 'PATCH', slug, title: it.name, diff, mode: 'DRY_RUN' });
        console.log(`   [DRY-RUN] 🔄 Sẽ PATCH cập nhật tour: "${it.name}" (Slug: ${slug}) - Khác: ${Object.keys(diff).join(', ')}`);
      } else {
        try {
          const patchRes = await fetchFn(`${supabaseUrl}/rest/v1/preset_itineraries?id=eq.${db.id}`, {
            method: 'PATCH',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(diff)
          });
          if (patchRes.ok) {
            report.patch++;
            report.details.push({ action: 'PATCH', slug, title: it.name, diff, status: patchRes.status });
            console.log(`   🔄 Đã PATCH cập nhật tour: "${it.name}" (Slug: ${slug})`);
          } else {
            const errText = await patchRes.text().catch(() => '');
            report.error++;
            report.details.push({
              action: 'PATCH',
              slug,
              title: it.name,
              diff,
              status: patchRes.status,
              error: `HTTP ${patchRes.status}: ${errText}`
            });
            console.error(`   ❌ Lỗi PATCH tour [${slug}] (HTTP ${patchRes.status}):`, errText);
          }
        } catch (patchErr) {
          report.error++;
          report.details.push({
            action: 'PATCH',
            slug,
            title: it.name,
            diff,
            error: patchErr.message
          });
          console.error(`   ❌ Lỗi mạng khi PATCH tour [${slug}]:`, patchErr.message);
        }
      }
    } else {
      report.skip++;
    }
  }

  console.log(`📊 Kết quả Itineraries: Skip=${report.skip} (100% khớp) | Patch=${report.patch} | Create=${report.create} | Error=${report.error}`);
  return report;
}

async function runSmartDeltaSync(options = {}) {
  const isDryRun = options.dryRun !== undefined ? options.dryRun : process.argv.includes('--dry-run');
  console.log('\n================================================================================');
  console.log(`🚀 KHỞI ĐỘNG SMART DELTA SYNC PROTOCOL ${isDryRun ? '[DRY-RUN MODE: READ-ONLY AUDIT]' : '[PRODUCTION LIVE]'}`);
  console.log('================================================================================');

  let preSyncSnapshot = null;
  if (!isDryRun) {
    const { createProductionSnapshot } = require('./create_production_snapshot');
    console.log('\n🔒 ĐANG TẠO PRE-SYNC SNAPSHOT BACKUP VÀ THẨM ĐỊNH GATE G2...');
    preSyncSnapshot = await createProductionSnapshot(options);
    console.log(`✅ Pre-sync Snapshot Backup hoàn tất: Places=${preSyncSnapshot.placesCount} (${preSyncSnapshot.placesHash.slice(0, 8)}...), Itineraries=${preSyncSnapshot.itinsCount}`);
  }

  const placesReport = await syncPlacesDelta(options);
  const itinsReport = await syncItinerariesDelta(options);

  const finalSummary = {
    mode: isDryRun ? 'DRY_RUN' : 'LIVE',
    timestamp: new Date().toISOString(),
    preSyncSnapshot: preSyncSnapshot ? {
      timestamp: preSyncSnapshot.timestamp,
      placesCount: preSyncSnapshot.placesCount,
      placesHash: preSyncSnapshot.placesHash,
      itinsCount: preSyncSnapshot.itinsCount,
      itinsHash: preSyncSnapshot.itinsHash,
      backupManifestPath: preSyncSnapshot.backupManifestPath
    } : null,
    places: placesReport,
    itineraries: itinsReport,
    totals: {
      skip: placesReport.skip + itinsReport.skip,
      patch: placesReport.patch + itinsReport.patch,
      create: placesReport.create + itinsReport.create,
      error: placesReport.error + itinsReport.error,
    }
  };

  // Post-sync concordance verification
  if (!isDryRun) {
    const fetchFn = options.fetch || fetch;
    const { supabaseUrl, supabaseKey } = getCredentials(options);
    if (supabaseUrl && supabaseKey) {
      try {
        const postPlacesRes = await fetchFn(`${supabaseUrl}/rest/v1/places?select=id`, {
          headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` }
        });
        const postItinsRes = await fetchFn(`${supabaseUrl}/rest/v1/preset_itineraries?select=id`, {
          headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` }
        });
        if (postPlacesRes.ok && postItinsRes.ok) {
          const postPlaces = await postPlacesRes.json();
          const postItins = await postItinsRes.json();
          finalSummary.postSyncVerification = {
            ok: true,
            placesCount: postPlaces.length,
            itinsCount: postItins.length,
            concordance: postPlaces.length >= 132 && postItins.length === 27
          };
        }
      } catch (err) {
        console.warn('⚠️ Cảnh báo: Không thể đối soát post-sync:', err.message);
      }
    }
  }

  console.log('\n================================================================================');
  console.log(`📋 TỔNG HỢP BÁO CÁO SMART DELTA SYNC DIFF REPORT (${finalSummary.mode}):`);
  console.log(`   • Tổng số bản ghi 100% KHỚP (Skip) : ${finalSummary.totals.skip}`);
  console.log(`   • Tổng số bản ghi CẦN SỬA (Patch)  : ${finalSummary.totals.patch}`);
  console.log(`   • Tổng số bản ghi CẦN THÊM (Create): ${finalSummary.totals.create}`);
  console.log(`   • Tổng số bản ghi LỖI (Error)      : ${finalSummary.totals.error}`);
  if (finalSummary.preSyncSnapshot) {
    console.log(`   • Pre-sync Snapshot Backup         : ${finalSummary.preSyncSnapshot.backupManifestPath}`);
  }
  if (finalSummary.postSyncVerification) {
    console.log(`   • Post-sync Concordance Audit      : Places=${finalSummary.postSyncVerification.placesCount}, Itineraries=${finalSummary.postSyncVerification.itinsCount} (Khớp=${finalSummary.postSyncVerification.concordance ? 'ĐẠT' : 'CHƯA ĐẠT'})`);
  }
  console.log('================================================================================');

  return finalSummary;
}

if (require.main === module) {
  runSmartDeltaSync().catch(console.error);
}

module.exports = {
  normalizeText,
  parseCsvRows,
  parseMasterCsv,
  computePlaceDiff,
  computeItineraryDiff,
  syncPlacesDelta,
  syncItinerariesDelta,
  runSmartDeltaSync,
  getCredentials
};
