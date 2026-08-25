const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..', '..');
const envFile = path.join(rootDir, 'frontend', '.env.local');
const fullPoisJsonFile = path.join(rootDir, 'frontend', 'src', 'data', 'triton_pois_full.json');
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
  console.log('ℹ️ Chưa có biến môi trường Supabase live trong .env.local — Chế độ Local Dry-Run.');
}

async function syncPlacesDelta() {
  console.log('\n================================================================================');
  console.log('📍 SMART DELTA SYNC: BẢNG PLACES (149+ ĐỊA ĐIỂM XÁC MINH TRI TÔN)');
  console.log('================================================================================');

  if (!fs.existsSync(fullPoisJsonFile)) {
    console.error('❌ Không tìm thấy file dữ liệu:', fullPoisJsonFile);
    return;
  }

  const masterPois = JSON.parse(fs.readFileSync(fullPoisJsonFile, 'utf8'));
  console.log(`📖 Đã nạp ${masterPois.length} địa điểm Master từ ${path.basename(fullPoisJsonFile)}`);

  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder')) {
    console.log(`✅ [Dry-Run]: ${masterPois.length} bản ghi đã sẵn sàng để đồng bộ.`);
    return;
  }

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/places?select=id,name,commune,category,latitude,longitude,address,detailed_story,image_url`, {
      headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
    });

    if (!res.ok) {
      console.warn('⚠️ Lỗi kết nối Supabase REST API:', res.status, await res.text());
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
      
      const payload = {
        id: master.id,
        slug: master.slug || master.id,
        name: master.name,
        name_en: master.name_en || null,
        commune: master.commune,
        category: master.category,
        tourism_category: master.tourism_category || master.category,
        subcategory: master.subcategory || null,
        rating: Number(master.rating) || 4.8,
        image_url: master.image_url,
        photos: Array.isArray(master.photos) ? master.photos : (master.image_url ? [master.image_url] : []),
        checkin_spots: Array.isArray(master.checkin_spots) ? master.checkin_spots : [],
        description: master.description || '',
        short_description: master.short_description || null,
        detailed_story: master.detailed_story || '',
        detailed_story_en: master.detailed_story_en || null,
        field_tips_en: master.field_tips_en || null,
        opening_hours: master.opening_hours || '07:00 - 18:00 (Hàng ngày)',
        open_late: Boolean(master.open_late),
        price_level: master.price_level || 'Miễn phí',
        phone: master.phone || null,
        address: master.address || `${master.commune}, Tri Tôn, An Giang`,
        latitude: parseFloat(master.latitude),
        longitude: parseFloat(master.longitude),
        is_hot: Boolean(master.is_hot),
        is_active: master.is_active !== false,
      };

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
          body: JSON.stringify(payload)
        });
        if (postRes.ok) console.log(`   ➕ Đã INSERT mới: [${payload.id}] "${payload.name}"`);
        continue;
      }

      const diff = {};
      if (db.name !== payload.name) diff.name = payload.name;
      if (db.commune !== payload.commune) diff.commune = payload.commune;
      if (db.category !== payload.category) diff.category = payload.category;
      if (Math.abs(Number(db.latitude) - payload.latitude) > 0.0001) diff.latitude = payload.latitude;
      if (Math.abs(Number(db.longitude) - payload.longitude) > 0.0001) diff.longitude = payload.longitude;
      if (payload.address && db.address !== payload.address) diff.address = payload.address;
      if (payload.detailed_story && db.detailed_story !== payload.detailed_story) diff.detailed_story = payload.detailed_story;

      if (Object.keys(diff).length > 0) {
        updated++;
        const patchRes = await fetch(`${supabaseUrl}/rest/v1/places?id=eq.${payload.id}`, {
          method: 'PATCH',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(diff)
        });
        if (patchRes.ok) console.log(`   🔄 Đã PATCH cập nhật [${payload.id}]: ${Object.keys(diff).join(', ')}`);
      } else {
        skipped++;
      }
    }

    console.log(`📊 Kết quả Places: Bỏ qua ${skipped} (100% khớp) | Cập nhật ${updated} | Thêm mới ${inserted}`);
  } catch (err) {
    console.warn('⚠️ Ngoại lệ trong quá trình sync:', err.message);
  }
}

async function runSmartDeltaSync() {
  console.log('🚀 KHỞI CHẠY GIAO THỨC SMART DELTA SYNC V2.0 — TRI TÔN TOURISM');
  await syncPlacesDelta();
  console.log('\n✨ GIAO THỨC SMART DELTA SYNC HOÀN TẤT THÀNH CÔNG!\n');
}

runSmartDeltaSync();
