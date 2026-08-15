const fs = require('fs');
const path = require('path');
const https = require('https');
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

const rootEnv = loadEnv(path.resolve(__dirname, '../.env'));
const frontEnv = loadEnv(path.resolve(__dirname, '../frontend/.env.local'));
const parentRootEnv = loadEnv('E:/Projects/Project_ca_nhan/dulichtriton/.env');
const parentFrontEnv = loadEnv('E:/Projects/Project_ca_nhan/dulichtriton/frontend/.env.local');
const env = { ...parentRootEnv, ...parentFrontEnv, ...rootEnv, ...frontEnv };

let cloudName = env.CLOUDINARY_CLOUD_NAME || env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
let apiKey = env.CLOUDINARY_API_KEY || env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
let apiSecret = env.CLOUDINARY_API_SECRET;

if (env.CLOUDINARY_URL) {
  const match = env.CLOUDINARY_URL.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
  if (match) {
    apiKey = apiKey || match[1];
    apiSecret = apiSecret || match[2];
    cloudName = cloudName || match[3];
  }
}

function uploadToCloudinary(buffer, publicId, folder = 'tri_ton_brand') {
  return new Promise((resolve, reject) => {
    if (!cloudName || !apiKey || !apiSecret) {
      return reject(new Error('Missing Cloudinary credentials in .env / .env.local'));
    }
    const timestamp = Math.round(Date.now() / 1000);
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
        `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${publicId}.png"\r\nContent-Type: image/png\r\n\r\n`
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
          const parsed = JSON.parse(data);
          if (parsed.secure_url) {
            resolve(parsed.secure_url);
          } else {
            reject(new Error(data));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(fullBuffer);
    req.end();
  });
}

async function main() {
  console.log('Uploading brand logos to Cloudinary:', { cloudName, hasApiKey: !!apiKey });

  const fullLogoPath = path.resolve(__dirname, '../frontend/public/images/logo_full.png');
  const emblemLogoPath = path.resolve(__dirname, '../frontend/public/images/logo_emblem.png');

  if (fs.existsSync(fullLogoPath)) {
    const fullBuf = fs.readFileSync(fullLogoPath);
    const fullUrl = await uploadToCloudinary(fullBuf, 'tri_ton_logo_official');
    console.log('✅ Uploaded Official Full Logo to Cloudinary:', fullUrl);
  }

  if (fs.existsSync(emblemLogoPath)) {
    const emblemBuf = fs.readFileSync(emblemLogoPath);
    const emblemUrl = await uploadToCloudinary(emblemBuf, 'tri_ton_logo_emblem');
    console.log('✅ Uploaded Official Emblem Logo to Cloudinary:', emblemUrl);
  }

  console.log('🎉 Brand logos uploaded and CDN live!');
}

main().catch(console.error);
