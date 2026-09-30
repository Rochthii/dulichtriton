import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..', '..');

const syncScriptPath = path.resolve(REPO_ROOT, 'scripts/sync/smart_delta_sync.js');
const lichtrinhFilePath = path.resolve(REPO_ROOT, 'data/lichtrinh.json');

test('P03-026: Static code invariant - smart_delta_sync exports computeItineraryDiff and compares for_whom', async () => {
  assert.ok(fs.existsSync(syncScriptPath), 'smart_delta_sync.js must exist');
  const code = fs.readFileSync(syncScriptPath, 'utf8');

  // Verify computeItineraryDiff exists and is exported
  assert.match(code, /function\s+computeItineraryDiff\s*\(/, 'Must define computeItineraryDiff');
  assert.match(code, /computeItineraryDiff\s*,?/, 'Must export computeItineraryDiff');

  // Verify for_whom comparison using normalizeText
  assert.match(code, /payload\.for_whom\s*&&\s*normalizeText\s*\(\s*db\.for_whom\s*\)\s*!==\s*normalizeText\s*\(\s*payload\.for_whom\s*\)/, 'Must compare for_whom using normalizeText');
  assert.match(code, /diff\.for_whom\s*=\s*payload\.for_whom/, 'Must assign payload.for_whom to diff');

  // Verify syncItinerariesDelta calls computeItineraryDiff
  assert.match(code, /const\s+diff\s*=\s*computeItineraryDiff\s*\(\s*payload\s*,\s*db\s*\)/, 'Must invoke computeItineraryDiff in sync loop');
});

test('P03-026: Unit test - computeItineraryDiff detects differences in for_whom correctly', async () => {
  const { computeItineraryDiff } = require(syncScriptPath);

  const basePayload = {
    slug: 'kinh-dien-1-ngay',
    emoji: '🧭',
    title: 'Kinh điển 1 ngày',
    tagline: 'Lịch trình phổ biến nhất',
    for_whom: 'Mọi lứa tuổi, Lần đầu tới',
    duration: '1 ngày',
    budget_range: '200k - 500k/người',
    stops: [{ day: 1, name: 'Chợ Tri Tôn' }]
  };

  // Case 1: Identical for_whom -> no diff
  const dbMatch = {
    ...basePayload,
    id: 'db-itin-001'
  };
  const diffMatch = computeItineraryDiff(basePayload, dbMatch);
  assert.equal(diffMatch.for_whom, undefined, 'Identical for_whom must not produce diff');
  assert.equal(Object.keys(diffMatch).length, 0, 'Matching itinerary must have empty diff');

  // Case 2: Whitespace and newline variations -> normalized, no diff
  const dbWhitespace = {
    ...basePayload,
    id: 'db-itin-001',
    for_whom: '  Mọi lứa tuổi, Lần đầu tới \r\n'
  };
  const diffWhitespace = computeItineraryDiff(basePayload, dbWhitespace);
  assert.equal(diffWhitespace.for_whom, undefined, 'Whitespace/CRLF differences must be normalized without false diff');

  // Case 3: Genuine difference in for_whom
  const dbDifferent = {
    ...basePayload,
    id: 'db-itin-001',
    for_whom: 'Chỉ dành cho dân phượt mạo hiểm'
  };
  const diffDifferent = computeItineraryDiff(basePayload, dbDifferent);
  assert.equal(diffDifferent.for_whom, 'Mọi lứa tuổi, Lần đầu tới', 'Must detect genuine difference in for_whom');
  assert.equal(Object.keys(diffDifferent).length, 1, 'Only for_whom should be in diff when other fields match');

  // Case 4: db.for_whom is null or undefined
  const dbNull = {
    ...basePayload,
    id: 'db-itin-001',
    for_whom: null
  };
  const diffNull = computeItineraryDiff(basePayload, dbNull);
  assert.equal(diffNull.for_whom, 'Mọi lứa tuổi, Lần đầu tới', 'Null db.for_whom must trigger diff');
});

test('P03-026: Integration test - Fixture with different for_whom triggers PATCH mutation', async () => {
  const { syncItinerariesDelta } = require(syncScriptPath);

  assert.ok(fs.existsSync(lichtrinhFilePath), 'data/lichtrinh.json must exist');
  const rawLichtrinh = JSON.parse(fs.readFileSync(lichtrinhFilePath, 'utf8'));

  // Build mock DB records where all itineraries match exactly except the first one
  const mockDbItineraries = rawLichtrinh.itineraries.map((it, idx) => {
    const slug = it.slug || `tour-${it.id}`;
    const flattenedStops = [];
    (it.days || []).forEach(day => {
      (day.stops || []).forEach(s => {
        flattenedStops.push({
          day: day.day,
          order: s.stop_order,
          time_start: s.time,
          time_end: '',
          name: s.name,
          poi_id: s.poi_id,
          commune: s.commune,
          category: s.category || 'visit',
          activity: s.activity,
          tip: s.notes || '',
          cost_vnd: s.cost_vnd || '',
          duration_min: s.duration_minutes || 60,
          travel_to_next_km: s.distance_from_prev_km || 0,
          travel_to_next_min: s.travel_time_mins || 0,
          transport_to_next: s.transport_to_next || ''
        });
      });
    });

    const isTarget = idx === 0; // The first tour
    return {
      id: `uuid-itin-${idx + 1}`,
      slug,
      emoji: it.emoji || '🧭',
      title: it.name,
      tagline: it.description,
      // Target tour has an outdated for_whom in DB!
      for_whom: isTarget ? 'Người thích đi bộ một mình (cũ)' : (it.audiences || ['Mọi du khách']).join(', '),
      duration: it.duration,
      budget_range: it.budget_level || '200k - 500k/người',
      stops: flattenedStops,
      is_active: true,
      sort_order: idx + 1
    };
  });

  const patchCalls = [];

  const mockFetch = async (url, options = {}) => {
    const urlStr = String(url);
    const method = options.method || 'GET';

    if (method === 'GET' && urlStr.includes('/rest/v1/preset_itineraries')) {
      return {
        ok: true,
        status: 200,
        json: async () => mockDbItineraries
      };
    }

    if (method === 'PATCH' && urlStr.includes('/rest/v1/preset_itineraries')) {
      patchCalls.push({
        url: urlStr,
        headers: options.headers,
        body: JSON.parse(options.body)
      });
      return {
        ok: true,
        status: 200,
        json: async () => ({})
      };
    }

    return { ok: false, status: 500, text: async () => 'unexpected' };
  };

  const report = await syncItinerariesDelta({
    dryRun: false,
    fetch: mockFetch,
    supabaseUrl: 'https://mock.supabase.co',
    supabaseKey: 'mock-key'
  });

  assert.equal(report.patch, 1, 'Must trigger exactly 1 PATCH for the itinerary with modified for_whom');
  assert.equal(report.create, 0, 'Must NOT trigger any CREATE');
  assert.equal(report.skip, rawLichtrinh.itineraries.length - 1, 'Remaining itineraries must SKIP');
  assert.equal(report.error, 0, 'Must encounter zero errors');

  // Verify PATCH call details
  assert.equal(patchCalls.length, 1, 'Must have made exactly 1 PATCH request');
  assert.ok(patchCalls[0].url.includes('id=eq.uuid-itin-1'), 'PATCH must target the specific itinerary id');
  assert.ok(patchCalls[0].body.for_whom, 'PATCH body must contain for_whom');
  const expectedForWhom = (rawLichtrinh.itineraries[0].audiences || ['Mọi du khách']).join(', ');
  assert.equal(patchCalls[0].body.for_whom, expectedForWhom, 'PATCH body must have new for_whom from fixture');

  // Verify report details
  const patchDetail = report.details.find(d => d.action === 'PATCH');
  assert.ok(patchDetail, 'Report details must include the PATCH action');
  assert.equal(patchDetail.slug, rawLichtrinh.itineraries[0].slug || `tour-${rawLichtrinh.itineraries[0].id}`);
  assert.equal(patchDetail.diff.for_whom, expectedForWhom);
});

test('P03-026: Integration test - Fixture with identical for_whom skips without any PATCH calls', async () => {
  const { syncItinerariesDelta } = require(syncScriptPath);

  const rawLichtrinh = JSON.parse(fs.readFileSync(lichtrinhFilePath, 'utf8'));

  // Build mock DB records matching 100% with lichtrinh.json
  const mockDbItineraries = rawLichtrinh.itineraries.map((it, idx) => {
    const slug = it.slug || `tour-${it.id}`;
    const flattenedStops = [];
    (it.days || []).forEach(day => {
      (day.stops || []).forEach(s => {
        flattenedStops.push({
          day: day.day,
          order: s.stop_order,
          time_start: s.time,
          time_end: '',
          name: s.name,
          poi_id: s.poi_id,
          commune: s.commune,
          category: s.category || 'visit',
          activity: s.activity,
          tip: s.notes || '',
          cost_vnd: s.cost_vnd || '',
          duration_min: s.duration_minutes || 60,
          travel_to_next_km: s.distance_from_prev_km || 0,
          travel_to_next_min: s.travel_time_mins || 0,
          transport_to_next: s.transport_to_next || ''
        });
      });
    });

    return {
      id: `uuid-itin-${idx + 1}`,
      slug,
      emoji: it.emoji || '🧭',
      title: it.name,
      tagline: it.description,
      for_whom: (it.audiences || ['Mọi du khách']).join(', '),
      duration: it.duration,
      budget_range: it.budget_level || '200k - 500k/người',
      stops: flattenedStops,
      is_active: true,
      sort_order: idx + 1
    };
  });

  const patchCalls = [];

  const mockFetch = async (url, options = {}) => {
    const method = options.method || 'GET';
    if (method === 'GET') {
      return {
        ok: true,
        status: 200,
        json: async () => mockDbItineraries
      };
    }
    if (method === 'PATCH') {
      patchCalls.push(url);
      return { ok: true, status: 200 };
    }
    return { ok: false, status: 500 };
  };

  const report = await syncItinerariesDelta({
    dryRun: false,
    fetch: mockFetch,
    supabaseUrl: 'https://mock.supabase.co',
    supabaseKey: 'mock-key'
  });

  assert.equal(report.patch, 0, 'Must have 0 PATCH when all itineraries match 100%');
  assert.equal(report.create, 0, 'Must have 0 CREATE');
  assert.equal(report.skip, rawLichtrinh.itineraries.length, 'All 27 itineraries must SKIP');
  assert.equal(report.error, 0, 'Zero errors');
  assert.equal(patchCalls.length, 0, 'Zero PATCH network calls must be executed');
});
