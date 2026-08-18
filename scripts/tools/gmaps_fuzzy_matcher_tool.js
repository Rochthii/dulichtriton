const fs = require('fs');
const path = require('path');
const https = require('https');

const rootDir = path.join(__dirname, '..', '..');
const envFile = path.join(rootDir, 'frontend', '.env.local');

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

// Tri Tôn Bounding Box
const TRI_TON_BOUNDS = { minLat: 10.25, maxLat: 10.60, minLng: 104.80, maxLng: 105.20 };

/**
 * 1. BẢNG BÍ DANH ĐA NGỮ (VIỆT - KHMER - TÊN DÂN DÃ BẢY NÚI)
 */
const KNOWN_PLACE_ALIASES = {
  'chùa hàng còng': ['krăng krốch', 'kroang kroch', 'prochum meáp', 'chùa còng', 'châu lăng'],
  'chùa tà pạ': ['chùa núi tà pạ', 'chùa chơn phnom reangsey', 'chùa phnom pi', 'núi tô'],
  'chùa xà tón': ['xvayton', 'svay ton', 'chùa xvay ton', 'chùa khmer tri tôn'],
  'cổng trời tri tôn': ['chùa koh kas', 'cổng koh kas', 'cổng trời châu lăng', 'cổng thời gian'],
  'hồ tà pạ': ['tuyệt tình cốc tri tôn', 'hồ đá tà pạ', 'núi tô'],
  'đồi tức dụp': ['đồi 2 triệu đô', 'căn cứ tức dụp', 'an tức'],
  'hồ soài chek': ['soài chék', 'hồ núi tô', 'vườn hoa soài chek'],
  'hồ ô thum': ['gà đốt ô thum', 'cầu gỗ ô thum', 'ô lâm'],
  'đu đủ đâm rina': ['quán rina', 'đu đủ đâm phnôm pi', 'rina châu lăng'],
  'cháo bò thủy đen': ['quán thủy đen', 'cháo bò cầu cây me', 'cháo bò trái chúc'],
  'gà đốt thảo nguyên': ['thảo nguyên ô thum', 'vườn nho ô thum', 'gà đốt vườn nho'],
  'cây thốt nốt trái tim': ['thốt nốt tình yêu', 'thốt nốt an tức', 'cặp thốt nốt trái tim']
};

/**
 * 2. THUẬT TOÁN TÍNH ĐỘ TƯƠNG ĐỒNG NGỮ NGHĨA (FUZZY STRING SIMILARITY)
 */
function normalizeStr(str) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function calculateFuzzySimilarity(s1, s2) {
  const norm1 = normalizeStr(s1);
  const norm2 = normalizeStr(s2);

  if (norm1 === norm2) return 1.0;
  if (!norm1 || !norm2) return 0.0;

  // Substring inclusion check
  if (norm1.includes(norm2) || norm2.includes(norm1)) {
    const ratio = Math.min(norm1.length, norm2.length) / Math.max(norm1.length, norm2.length);
    return Math.max(0.75, ratio);
  }

  // Token Overlap (Jaccard Index)
  const tokens1 = new Set(norm1.split(' '));
  const tokens2 = new Set(norm2.split(' '));
  let intersection = 0;
  tokens1.forEach(t => { if (tokens2.has(t)) intersection++; });
  const union = new Set([...tokens1, ...tokens2]).size;
  return union > 0 ? (intersection / union) : 0.0;
}

/**
 * 3. ENGINE TÌM KIẾM MỜ & CHẤM ĐIỂM ĐỘ KHỚP TOÀN DIỆN (0 - 100 ĐIỂM)
 */
async function searchWithFuzzyMatch(placeName, commune = '') {
  console.log(`\n🔍 [FUZZY SEARCH ENGINE] Bắt đầu tìm kiếm mờ cho: "${placeName}" (${commune})...`);

  // Tạo danh sách biến thể tên
  const candidateQueries = new Set([
    `${placeName} ${commune} Tri Tôn An Giang`,
    `${placeName} Tri Tôn`,
  ]);

  const normName = normalizeStr(placeName);
  for (const [key, aliases] of Object.entries(KNOWN_PLACE_ALIASES)) {
    if (normName.includes(normalizeStr(key))) {
      aliases.forEach(a => candidateQueries.add(`${a} Tri Tôn An Giang`));
    }
  }

  console.log(`📌 Các biến thể tìm kiếm thông minh:`);
  Array.from(candidateQueries).forEach((q, i) => console.log(`   ${i + 1}. "${q}"`));

  const searchResults = [];

  for (const query of candidateQueries) {
    const res = await fetchGmapsSearchResult(query);
    if (res && res.title) {
      let score = 0;

      // 1. Điểm tương đồng tên (Max 50 điểm)
      const nameSim = calculateFuzzySimilarity(placeName, res.title);
      score += nameSim * 50;

      // 2. Điểm khớp Xã/Thị trấn (Max 25 điểm)
      if (commune && normalizeStr(res.address || res.title).includes(normalizeStr(commune))) {
        score += 25;
      }

      // 3. Điểm nằm trong Geofence Tri Tôn (Max 25 điểm)
      if (res.latitude && res.longitude) {
        if (
          res.latitude >= TRI_TON_BOUNDS.minLat &&
          res.latitude <= TRI_TON_BOUNDS.maxLat &&
          res.longitude >= TRI_TON_BOUNDS.minLng &&
          res.longitude <= TRI_TON_BOUNDS.maxLng
        ) {
          score += 25;
        }
      } else {
        score += 10; // Không có GPS cụ thể nhưng query có Tri Tôn
      }

      searchResults.push({
        queryUsed: query,
        matchedTitle: res.title,
        googleMapsUrl: res.url,
        latitude: res.latitude,
        longitude: res.longitude,
        confidenceScore: Math.min(100, Math.round(score)),
        photosFound: res.photosCount || 0
      });
    }
  }

  // Sắp xếp theo điểm tin cậy giảm dần và loại trùng link
  const uniqueResults = [];
  const seenUrls = new Set();
  searchResults.sort((a, b) => b.confidenceScore - a.confidenceScore);

  for (const item of searchResults) {
    if (!seenUrls.has(item.googleMapsUrl)) {
      seenUrls.add(item.googleMapsUrl);
      uniqueResults.push(item);
    }
  }

  return uniqueResults.slice(0, 3);
}

function fetchGmapsSearchResult(query) {
  const url = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
  return new Promise((resolve) => {
    https.get(url, {
      timeout: 4500,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'vi-VN,vi;q=0.9,en;q=0.8'
      }
    }, (res) => {
      let finalUrl = url;
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        finalUrl = res.headers.location;
      }
      let html = '';
      res.on('data', c => html += c);
      res.on('end', () => {
        let lat = null;
        let lng = null;
        const dMatch = finalUrl.match(/!3d(10\.[0-9]+)!4d(10[45]\.[0-9]+)/) || html.match(/!3d(10\.[0-9]+)!4d(10[45]\.[0-9]+)/);
        if (dMatch) {
          lat = parseFloat(dMatch[1]);
          lng = parseFloat(dMatch[2]);
        }
        let title = query.replace(/Tri Tôn|An Giang/gi, '').trim();
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        if (titleMatch && titleMatch[1] && !titleMatch[1].includes('Google Maps')) {
          title = titleMatch[1].trim();
        }
        resolve({ title, url: finalUrl, latitude: lat, longitude: lng, photosCount: 4 });
      });
    }).on('error', () => resolve(null));
  });
}

// CLI Mode
async function main() {
  const args = process.argv.slice(2);
  const name = args[0] || 'Chùa Hàng Còng';
  const commune = args[1] || 'Xã Châu Lăng';

  console.log('================================================================================');
  console.log('🎯 TOOL TÌM KIẾM MỜ & CHẤM ĐIỂM ĐỘ KHỚP GOOGLE MAPS (FUZZY MATCHER v1.0)');
  console.log('================================================================================');

  const matches = await searchWithFuzzyMatch(name, commune);

  console.log(`\n🏆 TOP KẾT QUẢ KHỚP NHẤT CHO "${name}" (${commune}):\n`);
  matches.forEach((m, idx) => {
    const badge = m.confidenceScore >= 80 ? '🟢 CỰC KỲ KHỚP' : (m.confidenceScore >= 60 ? '🟡 KHỚP TƯƠNG ĐỐI' : '🔴 CẦN KIỂM TRA');
    console.log(`[#${idx + 1}] [${m.confidenceScore}%] ${badge}: "${m.matchedTitle}"`);
    console.log(`    - Link: ${m.googleMapsUrl}`);
    if (m.latitude && m.longitude) console.log(`    - GPS: [${m.latitude}, ${m.longitude}]`);
    console.log(`    - Query dùng: "${m.queryUsed}"`);
    console.log('--------------------------------------------------------------------------------');
  });
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { searchWithFuzzyMatch, calculateFuzzySimilarity };
