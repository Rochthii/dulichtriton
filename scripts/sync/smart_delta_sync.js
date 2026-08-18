const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..', '..');
const envFile = path.join(rootDir, 'frontend', '.env.local');
const masterCsvFile = path.join(rootDir, 'data', 'tri_ton_master_cleaned.csv');
const lichtrinhFile = path.join(rootDir, 'data', 'lichtrinh.json');

let envContent = '';
if (fs.existsSync(envFile)) {
  envContent = fs.readFileSync(envFile, 'utf8');
}

let supabaseUrl = '';
let supabaseKey = '';

envContent.split('\n').forEach(line => {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim().replace(/^["']|["']$/g, '');
  if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) supabaseKey = line.split('=')[1].trim().replace(/^["']|["']$/g, '');
  if (!supabaseKey && line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) supabaseKey = line.split('=')[1].trim().replace(/^["']|["']$/g, '');
});

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Thiếu biến môi trường Supabase!');
  process.exit(1);
}

// 1. Parser Master CSV
function parseMasterCsv(csvText) {
  const lines = csvText.split('\n');
  const records = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const match = line.match(/^"([^"]+)","([^"]+)","([^"]+)","([^"]+)","([^"]+)","([^"]+)","([^"]+)"/);
    if (match) {
      records.push({
        id: match[1],
        place_id: match[1],
        slug: match[1],
        name: match[2],
        commune: match[3],
        district: 'Tri Tôn',
        province: 'An Giang',
        category: match[4],
        tourism_category: match[4],
        subcategory: match[5],
        latitude: parseFloat(match[6]),
        longitude: parseFloat(match[7]),
        address: match[8] || `${match[3]}, Tri Tôn, An Giang`,
        description: match[9] || ''
      });
    }
  }
  return records;
}

async function syncPlacesDelta() {
  console.log('\n================================================================================');
  console.log('📍 SMART DELTA SYNC: BẢNG PLACES (149+ ĐỊA ĐIỂM TRI TÔN)');
  console.log('================================================================================');

  const masterPois = parseMasterCsv(fs.readFileSync(masterCsvFile, 'utf8'));

  const res = await fetch(`${supabaseUrl}/rest/v1/places?select=id,name,commune,category,subcategory,latitude,longitude,address`, {
    headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
  });

  if (!res.ok) {
    console.error('❌ Lỗi tải places từ Supabase:', res.status, await res.text());
    return;
  }

  const dbPlaces = await res.json();
  const dbMap = new Map();
  dbPlaces.forEach(p => dbMap.set(p.id, p));

  let skipped = 0;
  let updated = 0;
  let inserted = 0;

  for (const master of masterPois) {
    const db = dbMap.get(master.id);
    if (!db) {
      inserted++;
      const postRes = await fetch(`${supabaseUrl}/rest/v1/places`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify(master)
      });
      if (postRes.ok) console.log(`   ➕ Đã INSERT mới: [${master.id}] "${master.name}"`);
      continue;
    }

    const diff = {};
    if (db.name !== master.name) diff.name = master.name;
    if (db.commune !== master.commune) diff.commune = master.commune;
    if (db.category !== master.category) diff.category = master.category;
    if (db.subcategory !== master.subcategory) diff.subcategory = master.subcategory;
    if (Math.abs(Number(db.latitude) - master.latitude) > 0.0001) diff.latitude = master.latitude;
    if (Math.abs(Number(db.longitude) - master.longitude) > 0.0001) diff.longitude = master.longitude;
    if (master.address && db.address !== master.address) diff.address = master.address;

    if (Object.keys(diff).length > 0) {
      updated++;
      const patchRes = await fetch(`${supabaseUrl}/rest/v1/places?id=eq.${master.id}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(diff)
      });
      if (patchRes.ok) console.log(`   🔄 Đã PATCH cập nhật [${master.id}]: ${Object.keys(diff).join(', ')}`);
    } else {
      skipped++;
    }
  }

  console.log(`📊 Kết quả Places: Bỏ qua ${skipped} (100% khớp) | Cập nhật ${updated} | Thêm mới ${inserted}`);
}

async function syncItinerariesDelta() {
  console.log('\n================================================================================');
  console.log('🧭 SMART DELTA SYNC: BẢNG PRESET_ITINERARIES (27 LỊCH TRÌNH KHÉP VÒNG NÚI)');
  console.log('================================================================================');

  const rawLichtrinh = JSON.parse(fs.readFileSync(lichtrinhFile, 'utf8'));

  const listRes = await fetch(`${supabaseUrl}/rest/v1/preset_itineraries?select=*`, {
    headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
  });

  const dbItins = await listRes.json();
  const dbMap = new Map();
  dbItins.forEach(it => dbMap.set(it.slug, it));

  let skipped = 0;
  let updated = 0;
  let inserted = 0;

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
      inserted++;
      await fetch(`${supabaseUrl}/rest/v1/preset_itineraries`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      console.log(`   ➕ Đã INSERT tour mới: "${it.name}" (Slug: ${slug})`);
      continue;
    }

    // So sánh stops stringify và metadata
    const isStopsEqual = JSON.stringify(db.stops) === JSON.stringify(payload.stops);
    const isMetaEqual = db.title === payload.title && db.duration === payload.duration && db.tagline === payload.tagline;

    if (!isStopsEqual || !isMetaEqual) {
      updated++;
      await fetch(`${supabaseUrl}/rest/v1/preset_itineraries?id=eq.${db.id}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      console.log(`   🔄 Đã PATCH cập nhật tour: "${it.name}" (Slug: ${slug})`);
    } else {
      skipped++;
    }
  }

  console.log(`📊 Kết quả Itineraries: Bỏ qua ${skipped} (100% khớp) | Cập nhật ${updated} | Thêm mới ${inserted}`);
}

async function runAll() {
  await syncPlacesDelta();
  await syncItinerariesDelta();
  console.log('\n🌟 HOÀN TẤT TOÀN BỘ SMART DELTA SYNC THEO ĐÚNG CHUẨN SKILL!');
}

runAll().catch(console.error);
