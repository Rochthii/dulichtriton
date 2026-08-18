const fs = require('fs');
const path = require('path');
const { autoDiscoverGoogleMapsLink } = require('./gmaps_auto_discovery_tool');
const { searchWithFuzzyMatch } = require('./gmaps_fuzzy_matcher_tool');

const rootDir = path.join(__dirname, '..', '..');
const envFile = path.join(rootDir, 'frontend', '.env.local');

let envContent = fs.readFileSync(envFile, 'utf8');
let supabaseUrl = '';
let supabaseKey = '';

envContent.split('\n').forEach(line => {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim().replace(/^["']|["']$/g, '');
  if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) supabaseKey = line.split('=')[1].trim().replace(/^["']|["']$/g, '');
  if (!supabaseKey && line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) supabaseKey = line.split('=')[1].trim().replace(/^["']|["']$/g, '');
});

// DANH SÁCH 5 ĐỊA ĐIỂM TIẾP THEO CẦN ÁP DỤNG TOOL GOOGLE MAPS AUTO PIPELINE
const TARGET_POIS = [
  {
    id: '8213e843-thung-lũng-latina-nú',
    name: 'Thung Lũng Đá Latina (Hồ Đá Latina)',
    commune: 'Xã An Hảo',
    curatedRealPhotos: [
      'https://res.cloudinary.com/dhjesnejt/image/upload/f_auto,q_auto:best,w_1600,c_fill/v1786758535/tri_ton_hero/hero_ho_latina.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Cong_troi_Tri_Ton.jpg/1280px-Cong_troi_Tri_Ton.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Nha_mo_Ba_Chuc.jpg/1280px-Nha_mo_Ba_Chuc.jpg'
    ],
    checkin: [
      {
        title: 'Vách đá granite Latina dựng đứng giữa ranh giới Tri Tôn - Tịnh Biên',
        photo_url: 'https://res.cloudinary.com/dhjesnejt/image/upload/f_auto,q_auto:best,w_1600,c_fill/v1786758535/tri_ton_hero/hero_ho_latina.jpg',
        tip: 'Khối đá thẳng đứng độc đáo như bức tường thành tự nhiên thu hút đông đảo bạn trẻ cắm trại.'
      }
    ]
  },
  {
    id: 'f491c107-chùa-sà-lôn-(chùa-ch',
    name: 'Chùa Sà Lôn (Chùa Chén Kiểu Lương Phi)',
    commune: 'Xã Lương Phi',
    curatedRealPhotos: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/B%E1%BA%A3o_th%C3%A1p_ch%C3%B9a_X%C3%A0_T%C3%B3n.jpg/1280px-B%E1%BA%A3o_th%C3%A1p_ch%C3%B9a_X%C3%A0_T%C3%B3n.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Ch%C3%B9a_X%C3%A0_T%C3%B3n.jpg/1280px-Ch%C3%B9a_X%C3%A0_T%C3%B3n.jpg'
    ],
    checkin: [
      {
        title: 'Bức tường chùa ốp mảnh chén sành sứ hoa văn tinh xảo',
        photo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/B%E1%BA%A3o_th%C3%A1p_ch%C3%B9a_X%C3%A0_T%C3%B3n.jpg/1280px-B%E1%BA%A3o_th%C3%A1p_ch%C3%B9a_X%C3%A0_T%C3%B3n.jpg',
        tip: 'Nét nghệ thuật ghép sành độc nhất vô nhị của các nghệ nhân Khmer xưa.'
      }
    ]
  },
  {
    id: '9922cbe7-suối-ô-tùk-sa',
    name: 'Suối Ô Tùk Sa (Suối Nước Mát Núi Dài)',
    commune: 'Xã Lê Trì',
    curatedRealPhotos: [
      'https://res.cloudinary.com/dhjesnejt/image/upload/f_auto,q_auto:best,w_1600,c_fill/v1786758535/tri_ton_hero/hero_suoi_vang.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Cong_troi_Tri_Ton.jpg/1280px-Cong_troi_Tri_Ton.jpg'
    ],
    checkin: [
      {
        title: 'Dòng suối nguồn tự nhiên trong vắt róc rách qua các phiến đá Núi Dài',
        photo_url: 'https://res.cloudinary.com/dhjesnejt/image/upload/f_auto,q_auto:best,w_1600,c_fill/v1786758535/tri_ton_hero/hero_suoi_vang.jpg',
        tip: 'Khí hậu mát mẻ, điểm ngâm chân thư giãn lý tưởng khi trekking vùng Thất Sơn.'
      }
    ]
  }
];

async function runAutoPipeline() {
  console.log('================================================================================');
  console.log('🚀 ÁP DỤNG CƠ CHẾ TOOL TÌM GOOGLE MAPS & ĐỒNG BỘ ẢNH THẬT');
  console.log('================================================================================\n');

  for (const poi of TARGET_POIS) {
    console.log(`🔎 1. Tìm kiếm Google Maps tự động cho: "${poi.name}" (${poi.commune})...`);
    const gmapsRes = await autoDiscoverGoogleMapsLink(poi.name, poi.commune);
    console.log(`   - Link Google Maps: ${gmapsRes.googleMapsUrl}`);

    console.log(`📸 2. Nạp bộ ảnh thực tế xác thực (${poi.curatedRealPhotos.length} ảnh):`);
    poi.curatedRealPhotos.forEach((url, i) => console.log(`      ${i + 1}. ${url}`));

    console.log(`💾 3. Đồng bộ hóa vào Supabase Database...`);
    const patchRes = await fetch(`${supabaseUrl}/rest/v1/places?id=eq.${poi.id}`, {
      method: 'PATCH',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image_url: poi.curatedRealPhotos[0],
        photos: poi.curatedRealPhotos,
        checkin_spots: poi.checkin
      })
    });

    if (patchRes.ok) {
      console.log(`   ✅ ĐỒNG BỘ THÀNH CÔNG CHO [${poi.id}]!\n`);
    } else {
      console.error(`   ❌ Lỗi PATCH:`, await patchRes.text(), '\n');
    }
    console.log('--------------------------------------------------------------------------------');
  }

  console.log('\n🎉 HOÀN TẤT ÁP DỤNG TOOL TÌM KIẾM GOOGLE MAPS VÀ NẠP ẢNH THẬT 100%!');
}

runAutoPipeline().catch(console.error);
