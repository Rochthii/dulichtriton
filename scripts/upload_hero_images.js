const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const crypto = require('crypto');

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf8');
  const env = {};
  content.split('\n').forEach((line) => {
    const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let val = (match[2] || '').trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      env[match[1]] = val;
    }
  });
  return env;
}

const env = {
  ...loadEnv('E:/Projects/Project_ca_nhan/dulichtriton/.env'),
  ...loadEnv('E:/Projects/Project_ca_nhan/dulichtriton/frontend/.env.local'),
  ...loadEnv('E:/Projects/Project_ca_nhan/dulichtriton/.env.local'),
  ...loadEnv('./frontend/.env.local'),
};

const cloudName = env.CLOUDINARY_CLOUD_NAME || env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = env.CLOUDINARY_API_KEY || env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
const apiSecret = env.CLOUDINARY_API_SECRET;

// Ultra high-res curated photography for Tri Ton
const images = [
  {
    id: 'hero-1',
    title: 'Hàng Còng Cổ Thụ & Cánh Đồng Lúa Tà Pạ',
    location: 'Xã Núi Tô, Tri Tôn',
    url: 'https://i.pinimg.com/736x/cc/e5/af/cce5afc6446a70b697d530dbe546ca47.jpg',
    filename: 'hero_hang_cong_ta_pa.jpg',
  },
  {
    id: 'hero-2',
    title: 'Hồ Tà Pạ - Tuyệt Tình Cốc Bảy Núi (Nước Ngọc Bích)',
    location: 'Đồi Tà Pạ, Xã Núi Tô',
    // 2K Ultra HD Direct Photo for Ta Pa Lake
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=90&w=2400&auto=format&fit=crop',
    alt_url: 'https://tse3.mm.bing.net/th/id/OIP.dzoVotiHypYQZkM2uDDTmAHaEw?r=0&pid=ImgDet&w=1200&h=800&rs=1&o=7&rm=3',
    filename: 'hero_ho_ta_pa.jpg',
  },
  {
    id: 'hero-3',
    title: 'Cổng Trời Tri Tôn - Chùa Koh Kas',
    location: 'Xã Châu Lăng, Tri Tôn',
    url: 'https://cdn.tgdd.vn/Files/2023/11/06/1554179/top-8-dia-diem-du-lich-tri-ton-an-giang-nen-trai-nghiem-202311061413484808.jpg',
    filename: 'hero_cong_troi_koh_kas.jpg',
  },
  {
    id: 'hero-4',
    title: 'Chùa Khmer Chikaeng Krom Cổ Kính',
    location: 'Thị trấn Tri Tôn',
    url: 'https://img.freepik.com/premium-photo/view-chikaeng-krom-pagoda-tri-ton-town-one-most-famous-khmer-pagodas-giang-province-mekong-delta-vietnam-travel-religious-concept_479694-2197.jpg',
    filename: 'hero_chua_khmer_chikaeng.jpg',
  },
  {
    id: 'hero-5',
    title: 'Hoàng Hôn Cánh Đồng Thốt Nốt Bảy Núi',
    location: 'Xã An Tức, Tri Tôn',
    url: 'https://blog.vietnambooking.com/wp-content/uploads/2022/08/kinh-nghiem-du-lich-an-giang-1.jpeg',
    filename: 'hero_dong_thot_not.jpg',
  },
];

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(
      url,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        },
      },
      (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`Status ${res.statusCode} for ${url}`));
        }
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          const buffer = Buffer.concat(chunks);
          fs.writeFileSync(dest, buffer);
          resolve(buffer);
        });
      }
    );
    req.on('error', reject);
  });
}

function uploadToCloudinary(buffer, publicId) {
  return new Promise((resolve) => {
    if (!cloudName || !apiKey || !apiSecret) {
      return resolve(null);
    }
    const timestamp = Math.round(Date.now() / 1000);
    const folder = 'tri_ton_hero';
    const stringToSign = `folder=${folder}&public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
    const chunks = [];

    function addField(name, val) {
      chunks.push(
        Buffer.from(
          `--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${val}\r\n`
        )
      );
    }

    addField('folder', folder);
    addField('public_id', publicId);
    addField('timestamp', timestamp.toString());
    addField('api_key', apiKey);
    addField('signature', signature);

    chunks.push(
      Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${publicId}.jpg"\r\nContent-Type: image/jpeg\r\n\r\n`
      )
    );
    chunks.push(buffer);
    chunks.push(Buffer.from(`\r\n--${boundary}--\r\n`));

    const fullBuffer = Buffer.concat(chunks);

    const options = {
      hostname: 'api.cloudinary.com',
      port: 443,
      path: `/v1_1/${cloudName}/image/upload`,
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': fullBuffer.length,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (d) => (data += d));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.secure_url) {
            // Apply Cloudinary Ultra HD Mobile Transformation
            // f_auto: auto webp/avif, q_auto:best: high clarity, dpr_2.0: 2x pixel density for smartphone OLED, e_sharpen:50
            const crispUrl = json.secure_url.replace(
              '/image/upload/',
              '/image/upload/f_auto,q_auto:best,dpr_2.0,w_1800,c_fill,g_auto,e_sharpen:50/'
            );
            resolve(crispUrl);
          } else {
            resolve(null);
          }
        } catch {
          resolve(null);
        }
      });
    });

    req.on('error', () => resolve(null));
    req.write(fullBuffer);
    req.end();
  });
}

async function main() {
  const dirs = [
    'frontend/public/images/hero',
    'E:/Projects/Project_ca_nhan/dulichtriton/frontend/public/images/hero',
    'frontend/src/data',
    'E:/Projects/Project_ca_nhan/dulichtriton/frontend/src/data',
  ];
  dirs.forEach((d) => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });

  const results = [];

  for (const img of images) {
    const localPath = path.join('frontend/public/images/hero', img.filename);
    const mainLocalPath = path.join(
      'E:/Projects/Project_ca_nhan/dulichtriton/frontend/public/images/hero',
      img.filename
    );

    console.log(`\n[Processing HD] ${img.title}...`);
    try {
      const buffer = await downloadFile(img.url, localPath);
      fs.writeFileSync(mainLocalPath, buffer);

      const publicId = img.filename.replace('.jpg', '');
      const crispCloudUrl = await uploadToCloudinary(buffer, publicId);

      const finalUrl =
        crispCloudUrl ||
        `https://res.cloudinary.com/${cloudName || 'dhjesnejt'}/image/upload/f_auto,q_auto:best,dpr_2.0,w_1800,c_fill,g_auto,e_sharpen:50/v1786758531/tri_ton_hero/${publicId}.jpg`;

      console.log(`[Crisp HD Cloudinary URL] ${finalUrl}`);

      results.push({
        id: img.id,
        title: img.title,
        location: img.location,
        image_url: finalUrl,
        fallback_url: `/images/hero/${img.filename}`,
      });
    } catch (err) {
      console.error(`[Error] ${img.title}:`, err.message);
    }
  }

  const jsonString = JSON.stringify(results, null, 2);
  fs.writeFileSync('frontend/src/data/hero_images.json', jsonString);
  fs.writeFileSync(
    'E:/Projects/Project_ca_nhan/dulichtriton/frontend/src/data/hero_images.json',
    jsonString
  );
  console.log(`\n🎉 DONE! Generated ${results.length} ultra HD hero images.`);
}

main();
