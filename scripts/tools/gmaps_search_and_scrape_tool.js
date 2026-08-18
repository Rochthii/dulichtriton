const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

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

/**
 * Fetch HTML với Timeout 4000ms chống treo Socket
 */
function fetchFastHtml(url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, {
      timeout: 4000,
      headers: {
        'User-Agent': 'TriTonTourismBot/1.0 (compatible; +https://dulichtriton.vn) Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let redirectUrl = res.headers.location;
        if (redirectUrl.startsWith('/')) {
          const u = new URL(url);
          redirectUrl = u.origin + redirectUrl;
        }
        return resolve(fetchFastHtml(redirectUrl));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });

    req.on('timeout', () => {
      req.destroy();
      resolve('');
    });

    req.on('error', () => resolve(''));
  });
}

/**
 * Trích xuất & Chuẩn hóa link ảnh từ HTML (hỗ trợ cả protocol-relative //upload...)
 */
function parsePhotosFromHtml(html, imagesSet) {
  if (!html) return;

  // 1. Google Maps / Photos CDN: lh3.googleusercontent.com/p/...
  const gmapsRegex = /https:\/\/lh[0-9]\.googleusercontent\.com\/p\/[A-Za-z0-9_-]+/g;
  let match;
  while ((match = gmapsRegex.exec(html)) !== null) {
    imagesSet.add(`${match[0]}=s1600-k-no`);
  }

  // 2. OpenGraph Image
  const ogMatches = html.matchAll(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/gi);
  for (const m of ogMatches) {
    let src = m[1];
    if (src.startsWith('//')) src = 'https:' + src;
    if (src.startsWith('http') && !src.includes('icon') && !src.includes('logo') && !src.includes('.svg')) {
      imagesSet.add(src);
    }
  }

  // 3. Image tag src & srcset (bao gồm cả protocol-relative //)
  const imgMatches = html.matchAll(/<img[^>]+(?:src|data-src|data-original)=["']([^"']+)["']/gi);
  for (const m of imgMatches) {
    let src = m[1];
    if (src.startsWith('//')) src = 'https:' + src;
    if (
      (src.startsWith('http://') || src.startsWith('https://')) &&
      /\.(jpe?g|png|webp|avif)/i.test(src) &&
      !src.includes('icon') &&
      !src.includes('logo') &&
      !src.includes('avatar') &&
      !src.includes('.svg')
    ) {
      imagesSet.add(src);
    }
  }
}

/**
 * Multi-source Fast Scraper Engine
 */
async function searchAndScrapePlaceImages(queryOrUrl) {
  const isUrl = queryOrUrl.startsWith('http://') || queryOrUrl.startsWith('https://');
  const images = new Set();
  let title = queryOrUrl;

  console.log(`\n🔍 [FAST SCRAPER] Đang bóc tách ảnh cho: "${queryOrUrl}"...`);

  if (isUrl) {
    const html = await fetchFastHtml(queryOrUrl);
    parsePhotosFromHtml(html, images);
  } else {
    // Tìm kiếm qua Google Maps Search URL
    const gmapsSearchUrl = `https://www.google.com/maps/search/${encodeURIComponent(queryOrUrl + ' Tri Tôn An Giang')}`;
    const gmapsHtml = await fetchFastHtml(gmapsSearchUrl);
    parsePhotosFromHtml(gmapsHtml, images);
  }

  const validPhotos = Array.from(images).filter(url => {
    return url && !url.includes('.pdf') && !url.includes('.svg') && !url.includes('icon') && !url.includes('avatar');
  });

  return {
    title,
    photos: validPhotos
  };
}

/**
 * Đồng bộ ảnh vào Supabase PostgreSQL
 */
async function syncToSupabase(placeId, photos, title = '') {
  if (!photos || photos.length === 0) {
    console.error(`⚠️ Không có ảnh để đồng bộ cho [${placeId}]`);
    return false;
  }

  const heroImage = photos[0];
  const spots = photos.slice(0, 3).map((url, idx) => ({
    title: `Góc check-in thực địa #${idx + 1} (${title || placeId})`,
    photo_url: url,
    tip: 'Ảnh chụp thực tế tại địa điểm.'
  }));

  const res = await fetch(`${supabaseUrl}/rest/v1/places?id=eq.${placeId}`, {
    method: 'PATCH',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      image_url: heroImage,
      photos: photos,
      checkin_spots: spots
    })
  });

  if (res.ok) {
    console.log(`✅ [SUPABASE SYNC] Đã cập nhật thành công ${photos.length} ảnh cho [${placeId}]!`);
    return true;
  } else {
    console.error(`❌ Lỗi cập nhật Supabase:`, await res.text());
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === 'run') {
    const placeId = args[1];
    const query = args[2];
    if (!placeId || !query) {
      console.error('❌ Thiếu tham số! Cú pháp: node gmaps_search_and_scrape_tool.js run "<PLACE_ID>" "<QUERY_HOẶC_URL>"');
      return;
    }
    const result = await searchAndScrapePlaceImages(query);
    console.log(`📸 Tìm thấy ${result.photos.length} ảnh thực tế hợp lệ!`);
    result.photos.slice(0, 5).forEach((p, idx) => console.log(`   ${idx + 1}. ${p}`));
    if (result.photos.length > 0) {
      await syncToSupabase(placeId, result.photos.slice(0, 5), result.title);
    }
  } else if (command === 'preview') {
    const query = args[1];
    const result = await searchAndScrapePlaceImages(query);
    console.log(`📸 Tìm thấy ${result.photos.length} ảnh thực tế hợp lệ cho "${result.title}":`);
    result.photos.slice(0, 8).forEach((p, idx) => console.log(`   ${idx + 1}. ${p}`));
  } else {
    console.log('Cách dùng:');
    console.log('  node scripts/tools/gmaps_search_and_scrape_tool.js run "<PLACE_ID>" "<URL_HOẶC_TÊN>"');
    console.log('  node scripts/tools/gmaps_search_and_scrape_tool.js preview "<URL_HOẶC_TÊN>"');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { searchAndScrapePlaceImages, syncToSupabase };
