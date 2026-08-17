import fs from 'fs';

async function testAppInitState() {
  const url = 'https://www.google.com/maps/place/H%E1%BB%93+%C3%94+Thum/@10.380721,104.974917,17z/';
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
    },
  });
  const html = await res.text();
  
  // Check for APP_INITIALIZATION_STATE
  const initStateMatch = html.match(/window\.APP_INITIALIZATION_STATE\s*=\s*(\[.+?\]);/s);
  console.log('Found APP_INITIALIZATION_STATE:', !!initStateMatch);
  
  if (initStateMatch) {
    const raw = initStateMatch[1];
    console.log('State string length:', raw.length);
    // Find all https://lh3... or AF1Qip... inside this state
    const photos = new Set();
    const photoMatches = raw.matchAll(/(https?:\\\/\\\/[^\s"'\\]*(?:googleusercontent|ggpht)[^\s"'\\]*)/gi);
    for (const m of photoMatches) {
      const clean = m[1].replace(/\\u003d/g, '=').replace(/\\/g, '');
      photos.add(clean);
    }
    console.log('Photos inside state:', photos.size);
    for (const p of Array.from(photos).slice(0, 10)) {
      console.log('  Photo in state:', p);
    }
  }

  // Also check general regex for any image in html
  const imgMatches = [...html.matchAll(/(https:\/\/[^"'\s\\]+\.(?:jpg|jpeg|png|webp))/gi)];
  console.log('Direct image URLs found in HTML:', imgMatches.length);
  for (const m of imgMatches.slice(0, 5)) {
    console.log('  Direct img:', m[1]);
  }
}

testAppInitState();
