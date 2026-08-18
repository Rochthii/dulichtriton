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
 * Intelligent Image Scraping Engine for Google Maps & Travel Articles
 */
async function scrapeImagesFromUrl(targetUrl) {
  return new Promise((resolve) => {
    const client = targetUrl.startsWith('https') ? https : http;
    client.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    }, (res) => {
      // Follow Redirects (especially for short links maps.app.goo.gl)
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(scrapeImagesFromUrl(res.headers.location));
      }

      let html = '';
      res.on('data', chunk => html += chunk);
      res.on('end', () => {
        const images = new Set();

        // 1. Google Maps / Photos CDN: lh3.googleusercontent.com/p/...
        const gmapsPdnRegex = /https:\/\/lh[0-9]\.googleusercontent\.com\/p\/[A-Za-z0-9_-]+/g;
        let match;
        while ((match = gmapsPdnRegex.exec(html)) !== null) {
          images.add(`${match[0]}=s1600-k-no`);
        }

        // 2. OpenGraph Images
        const ogMatches = html.matchAll(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/gi);
        for (const m of ogMatches) {
          if (m[1] && m[1].startsWith('http') && !m[1].includes('icon') && !m[1].includes('logo')) {
            images.add(m[1]);
          }
        }

        // 3. Article Content Images
        const imgMatches = html.matchAll(/<img[^>]+(?:src|data-src|data-original)=["'](https?:\/\/[^"']+\.(?:jpg|jpeg|png|webp|avif)[^"']*)["']/gi);
        for (const m of imgMatches) {
          const src = m[1];
          if (!src.includes('logo') && !src.includes('avatar') && !src.includes('icon') && !src.includes('.svg')) {
            images.add(src);
          }
        }

        resolve(Array.from(images));
      });
    }).on('error', (err) => {
      console.error('❌ Lỗi kết nối URL:', err.message);
      resolve([]);
    });
  });
}

/**
 * Sync Curated Photos for a specific place to Supabase
 */
async function syncPlacePhotos(placeId, photos, checkinSpots = []) {
  if (!photos || photos.length === 0) {
    console.error(`⚠️ Không có ảnh nào để cập nhật cho [${placeId}]`);
    return false;
  }

  const heroImage = photos[0];
  const spots = checkinSpots.length > 0 ? checkinSpots : photos.slice(0, 3).map((url, idx) => ({
    title: `Góc check-in thực địa #${idx + 1}`,
    photo_url: url,
    tip: 'Góc chụp ảnh thực tế tại địa điểm.'
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
    console.log(`✅ Đã đồng bộ thành công ${photos.length} ảnh cho [${placeId}] lên Supabase!`);
    return true;
  } else {
    console.error(`❌ Lỗi cập nhật Supabase:`, await res.text());
    return false;
  }
}

// CLI Usage Mode
async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.log('================================================================================');
    console.log('📌 GOOGLE MAPS & MULTI-SOURCE REAL PHOTO INGESTION CLI TOOL');
    console.log('================================================================================');
    console.log('Cách dùng: node scripts/tools/gmaps_photo_ingestion_cli.js <PLACE_ID> <URL>');
    console.log('Ví dụ:');
    console.log('  node scripts/tools/gmaps_photo_ingestion_cli.js ho-ta-pa "https://maps.app.goo.gl/..."');
    console.log('--------------------------------------------------------------------------------');
    return;
  }

  const [placeId, inputUrl] = args;
  console.log(`🚀 Bắt đầu bóc tách ảnh cho [${placeId}] từ: ${inputUrl}`);
  const photos = await scrapeImagesFromUrl(inputUrl);
  console.log(`📸 Tìm thấy ${photos.length} ảnh thực tế.`);
  
  if (photos.length > 0) {
    await syncPlacePhotos(placeId, photos.slice(0, 5));
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { scrapeImagesFromUrl, syncPlacePhotos };
