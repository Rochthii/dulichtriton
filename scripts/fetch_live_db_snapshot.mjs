import fs from 'fs';
import path from 'path';

const envPath = path.resolve('frontend', '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('No .env.local found');
  process.exit(0);
}

const env = fs.readFileSync(envPath, 'utf8');
let url = '', key = '';
for (const line of env.split('\n')) {
  const trimmed = line.trim();
  if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
    url = trimmed.split('=')[1].trim().replace(/^['"]|['"]$/g, '');
  }
  if (trimmed.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
    key = trimmed.split('=')[1].trim().replace(/^['"]|['"]$/g, '');
  }
}

if (!key) {
  for (const line of env.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
      key = trimmed.split('=')[1].trim().replace(/^['"]|['"]$/g, '');
    }
  }
}

if (!url || !key) {
  console.log('No URL or KEY in .env.local');
  process.exit(0);
}

try {
  const res = await fetch(`${url}/rest/v1/places?select=id,name,commune,category,subcategory,latitude,longitude,address`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Prefer: 'count=exact'
    }
  });
  console.log('HTTP Status:', res.status);
  const data = await res.json();
  if (Array.isArray(data)) {
    console.log('Fetched live DB places count:', data.length);
    fs.writeFileSync('docs/technical-spec/LIVE_DB_PLACES_SNAPSHOT.json', JSON.stringify(data, null, 2));
    console.log('Saved live snapshot to docs/technical-spec/LIVE_DB_PLACES_SNAPSHOT.json');
  } else {
    console.log('Response body:', data);
  }
} catch (e) {
  console.error('Error fetching live DB:', e.message);
}
