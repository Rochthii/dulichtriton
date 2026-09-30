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
  const res = await fetch(`${url}/rest/v1/places?select=id`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Prefer: 'count=exact'
    }
  });
  console.log('HTTP Status:', res.status);
  const range = res.headers.get('content-range');
  console.log('Content-Range:', range);
  const data = await res.json();
  if (Array.isArray(data)) {
    console.log('Live DB places count:', data.length);
    console.log('Sample IDs (first 5):', data.slice(0, 5).map(p => p.id));
    // Save live ids for analysis
    fs.writeFileSync('docs/technical-spec/LIVE_DB_PLACES_IDS.json', JSON.stringify(data.map(p => p.id), null, 2));
    console.log('Saved live IDs to docs/technical-spec/LIVE_DB_PLACES_IDS.json');
  } else {
    console.log('Response body:', data);
  }
} catch (e) {
  console.error('Error fetching live DB:', e.message);
}
