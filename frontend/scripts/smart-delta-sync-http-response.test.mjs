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

test('P03-025: Static code invariant - smart_delta_sync guards counters behind res.ok and logs HTTP errors', async () => {
  assert.ok(fs.existsSync(syncScriptPath), 'smart_delta_sync.js must exist');
  const code = fs.readFileSync(syncScriptPath, 'utf8');

  // Verify fetchFn dependency injection
  assert.match(code, /options\.fetch\s*\|\|\s*fetch/, 'Must support options.fetch injection');

  // Verify postRes and patchRes check res.ok before incrementing create/patch
  assert.match(code, /if\s*\(\s*postRes\.ok\s*\)\s*\{\s*report\.create\+\+/, 'Must only increment report.create when postRes.ok');
  assert.match(code, /if\s*\(\s*patchRes\.ok\s*\)\s*\{\s*report\.patch\+\+/, 'Must only increment report.patch when patchRes.ok');

  // Verify error++ on HTTP failures
  assert.match(code, /report\.error\+\+/, 'Must increment report.error on failure');
});

test('P03-025: Unit test - Fake 4xx client errors (400, 401, 403, 404, 409) must NOT increment create or patch counters', async () => {
  const { syncPlacesDelta } = require(syncScriptPath);

  // Mock initial DB query to return 1 place that differs (triggers PATCH)
  // and other places missing from DB (triggers CREATE)
  const mockFetch = async (url, options = {}) => {
    const urlStr = String(url);
    const method = options.method || 'GET';

    if (method === 'GET' && urlStr.includes('/rest/v1/places')) {
      return {
        ok: true,
        status: 200,
        json: async () => [
          {
            id: 'ho-ta-pa',
            name: 'Old Name',
            commune: 'Xã Núi Tô',
            category: 'nature',
            subcategory: 'lake',
            latitude: 10.4,
            longitude: 105.0,
            address: 'Old Address',
            description: 'Old Description'
          }
        ]
      };
    }

    if (method === 'POST') {
      // Simulate 400 Bad Request / 409 Conflict
      return {
        ok: false,
        status: 400,
        text: async () => JSON.stringify({ code: '23505', message: 'duplicate key value violates unique constraint' })
      };
    }

    if (method === 'PATCH') {
      // Simulate 403 Forbidden
      return {
        ok: false,
        status: 403,
        text: async () => JSON.stringify({ code: '42501', message: 'permission denied for table places' })
      };
    }

    return { ok: false, status: 500, text: async () => 'unexpected url' };
  };

  const report = await syncPlacesDelta({
    dryRun: false,
    fetch: mockFetch,
    supabaseUrl: 'https://mock.supabase.co',
    supabaseKey: 'mock-key'
  });

  assert.equal(report.create, 0, 'Must NOT increment create counter on 4xx POST response');
  assert.equal(report.patch, 0, 'Must NOT increment patch counter on 4xx PATCH response');
  assert.ok(report.error > 0, `Must record errors for failed HTTP calls (got ${report.error})`);

  // Verify report details record exact status codes
  const postErrors = report.details.filter(d => d.action === 'CREATE' && d.status === 400);
  const patchErrors = report.details.filter(d => d.action === 'PATCH' && d.status === 403);
  assert.ok(postErrors.length > 0, 'Must record details for 400 CREATE errors');
  assert.ok(patchErrors.length > 0, 'Must record details for 403 PATCH errors');
});

test('P03-025: Unit test - 5xx server errors (500, 502, 503) must NOT increment create or patch counters', async () => {
  const { syncPlacesDelta } = require(syncScriptPath);

  const mockFetch = async (url, options = {}) => {
    const urlStr = String(url);
    const method = options.method || 'GET';

    if (method === 'GET' && urlStr.includes('/rest/v1/places')) {
      return {
        ok: true,
        status: 200,
        json: async () => [
          {
            id: 'ho-ta-pa',
            name: 'Old Name',
            commune: 'Xã Núi Tô',
            category: 'nature',
            subcategory: 'lake',
            latitude: 10.4,
            longitude: 105.0,
            address: 'Old Address',
            description: 'Old Description'
          }
        ]
      };
    }

    if (method === 'POST') {
      return {
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error'
      };
    }

    if (method === 'PATCH') {
      return {
        ok: false,
        status: 502,
        text: async () => 'Bad Gateway'
      };
    }

    return { ok: false, status: 500, text: async () => 'unexpected url' };
  };

  const report = await syncPlacesDelta({
    dryRun: false,
    fetch: mockFetch,
    supabaseUrl: 'https://mock.supabase.co',
    supabaseKey: 'mock-key'
  });

  assert.equal(report.create, 0, 'Must NOT increment create counter on 500 POST response');
  assert.equal(report.patch, 0, 'Must NOT increment patch counter on 502 PATCH response');
  assert.ok(report.error > 0, `Must record errors for failed HTTP calls (got ${report.error})`);

  const serverErrors = report.details.filter(d => d.status === 500 || d.status === 502);
  assert.ok(serverErrors.length > 0, 'Must record details for 5xx errors');
});

test('P03-025: Unit test - Itineraries sync handles 4xx/5xx errors safely and increments error counter only', async () => {
  const { syncItinerariesDelta } = require(syncScriptPath);

  const mockFetch = async (url, options = {}) => {
    const urlStr = String(url);
    const method = options.method || 'GET';

    if (method === 'GET' && urlStr.includes('/rest/v1/preset_itineraries')) {
      return {
        ok: true,
        status: 200,
        json: async () => [
          {
            id: 'itin-1',
            slug: 'kinh-dien-1-ngay',
            title: 'Old Title',
            duration: '1 ngày',
            tagline: 'Old Tagline',
            stops: []
          }
        ]
      };
    }

    if (method === 'POST') {
      return {
        ok: false,
        status: 401,
        text: async () => 'Unauthorized'
      };
    }

    if (method === 'PATCH') {
      return {
        ok: false,
        status: 503,
        text: async () => 'Service Unavailable'
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

  assert.equal(report.create, 0, 'Must NOT increment create counter on 401 POST response');
  assert.equal(report.patch, 0, 'Must NOT increment patch counter on 503 PATCH response');
  assert.ok(report.error > 0, `Must record error count on itineraries 4xx/5xx (got ${report.error})`);

  const itinErrors = report.details.filter(d => d.status === 401 || d.status === 503);
  assert.ok(itinErrors.length > 0, 'Must log error details with status code');
});

test('P03-025: Unit test - Network exceptions during POST/PATCH are caught and recorded as errors', async () => {
  const { syncPlacesDelta } = require(syncScriptPath);

  const mockFetch = async (url, options = {}) => {
    const method = options.method || 'GET';
    if (method === 'GET') {
      return {
        ok: true,
        status: 200,
        json: async () => []
      };
    }
    throw new Error('ECONNRESET: Connection reset by peer');
  };

  const report = await syncPlacesDelta({
    dryRun: false,
    fetch: mockFetch,
    supabaseUrl: 'https://mock.supabase.co',
    supabaseKey: 'mock-key'
  });

  assert.equal(report.create, 0, 'Must NOT increment create counter on network exception');
  assert.ok(report.error > 0, 'Must increment error count on network exception');
  const netErrors = report.details.filter(d => d.error && d.error.includes('ECONNRESET'));
  assert.ok(netErrors.length > 0, 'Must record ECONNRESET in report details');
});

test('P03-025: Positive control - 2xx responses (200, 201, 204) increment create and patch counters with zero errors', async () => {
  const { syncPlacesDelta } = require(syncScriptPath);

  const mockFetch = async (url, options = {}) => {
    const method = options.method || 'GET';
    if (method === 'GET') {
      return {
        ok: true,
        status: 200,
        json: async () => [
          {
            id: 'ho-ta-pa',
            name: 'Old Name',
            commune: 'Xã Núi Tô',
            category: 'nature',
            subcategory: 'lake',
            latitude: 10.4,
            longitude: 105.0,
            address: 'Old Address',
            description: 'Old Description'
          }
        ]
      };
    }

    if (method === 'POST') {
      return {
        ok: true,
        status: 201,
        text: async () => 'Created'
      };
    }

    if (method === 'PATCH') {
      return {
        ok: true,
        status: 204,
        text: async () => ''
      };
    }

    return { ok: false, status: 500 };
  };

  const report = await syncPlacesDelta({
    dryRun: false,
    fetch: mockFetch,
    supabaseUrl: 'https://mock.supabase.co',
    supabaseKey: 'mock-key'
  });

  assert.equal(report.error, 0, 'Successful 2xx mutations must have zero errors');
  assert.ok(report.create > 0, 'Successful 201 POST must increment create counter');
  assert.ok(report.patch > 0, 'Successful 204 PATCH must increment patch counter');
});
