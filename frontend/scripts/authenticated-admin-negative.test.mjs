import assert from 'node:assert/strict';
import { createHash, randomBytes } from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import Module, { createRequire } from 'node:module';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import typescript from 'typescript';

const require = createRequire(import.meta.url);
const { NextRequest } = require('next/server');
const __dirname = dirname(fileURLToPath(import.meta.url));

// Register TypeScript and path alias loader for @/
require.extensions['.ts'] = function (module, filename) {
  const content = fs.readFileSync(filename, 'utf8');
  const { outputText } = typescript.transpileModule(content, {
    compilerOptions: {
      module: typescript.ModuleKind.CommonJS,
      target: typescript.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  });
  module._compile(outputText, filename);
};

const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (request, parent, isMain, options) {
  if (request.startsWith('@/')) {
    const rel = request.slice(2);
    const resolvedPath = path.resolve(__dirname, '../src', rel);
    for (const ext of ['', '.ts', '.tsx', '.js']) {
      if (fs.existsSync(resolvedPath + ext)) return resolvedPath + ext;
    }
  }
  return originalResolve.call(this, request, parent, isMain, options);
};

function loadRouteModule(relRoutePath) {
  const fullPath = path.resolve(__dirname, '../src/app/api/v1/admin', relRoutePath);
  const { outputText } = typescript.transpileModule(fs.readFileSync(fullPath, 'utf8'), {
    compilerOptions: {
      module: typescript.ModuleKind.CommonJS,
      target: typescript.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  });
  const routeModule = new Module(fullPath);
  routeModule.filename = fullPath;
  routeModule.paths = Module._nodeModulePaths(dirname(fullPath));
  routeModule._compile(outputText, fullPath);
  return routeModule.exports;
}

test('P07-001: Authenticated-Admin Negative Test Suite Across All P01 Mutation Routes', async (t) => {
  // Setup Mock Database Server to capture all requests and verify ZERO mutations
  const dbRequests = [];
  const mutationWrites = [];

  const validToken = randomBytes(32).toString('base64url');
  const validHash = createHash('sha256').update(validToken).digest('hex');

  const viewerToken = randomBytes(32).toString('base64url');
  const viewerHash = createHash('sha256').update(viewerToken).digest('hex');

  const expiredToken = randomBytes(32).toString('base64url');
  const expiredHash = createHash('sha256').update(expiredToken).digest('hex');

  const disabledToken = randomBytes(32).toString('base64url');
  const disabledHash = createHash('sha256').update(disabledToken).digest('hex');

  const dbServer = http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://127.0.0.1');
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = Buffer.concat(chunks).toString('utf8');
    const record = { method: req.method, path: url.pathname, query: url.search, body };
    dbRequests.push(record);

    res.setHeader('content-type', 'application/json');

    // Track any attempt to write/mutate business database tables
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) && url.pathname !== '/rest/v1/admin_users') {
      mutationWrites.push(record);
    }

    if (url.pathname === '/rest/v1/admin_users') {
      const searchHash = url.searchParams.get('session_hash')?.replace(/^eq\./, '');
      if (searchHash === validHash) {
        res.end(
          JSON.stringify({
            id: 1,
            email: 'admin@triton.vn',
            full_name: 'Lead Admin',
            role: 'ADMIN',
            is_active: true,
            session_hash: validHash,
            session_created_at: new Date(Date.now() - 1000).toISOString(),
            session_expires_at: new Date(Date.now() + 3600000).toISOString(),
          })
        );
      } else if (searchHash === viewerHash) {
        res.end(
          JSON.stringify({
            id: 2,
            email: 'viewer@triton.vn',
            full_name: 'Readonly Viewer',
            role: 'VIEWER',
            is_active: true,
            session_hash: viewerHash,
            session_created_at: new Date(Date.now() - 1000).toISOString(),
            session_expires_at: new Date(Date.now() + 3600000).toISOString(),
          })
        );
      } else if (searchHash === expiredHash) {
        res.end(
          JSON.stringify({
            id: 3,
            email: 'expired@triton.vn',
            full_name: 'Expired Admin',
            role: 'ADMIN',
            is_active: true,
            session_hash: expiredHash,
            session_created_at: new Date(Date.now() - 7200000).toISOString(),
            session_expires_at: new Date(Date.now() - 3600000).toISOString(), // Expired
          })
        );
      } else if (searchHash === disabledHash) {
        res.end(
          JSON.stringify({
            id: 4,
            email: 'disabled@triton.vn',
            full_name: 'Disabled Admin',
            role: 'ADMIN',
            is_active: false, // Inactive
            session_hash: disabledHash,
            session_created_at: new Date(Date.now() - 1000).toISOString(),
            session_expires_at: new Date(Date.now() + 3600000).toISOString(),
          })
        );
      } else {
        res.end('null');
      }
    } else {
      res.statusCode = 200;
      res.end('[]');
    }
  });

  await new Promise((resolve) => dbServer.listen(0, '127.0.0.1', resolve));
  const serverPort = dbServer.address().port;

  const prevEnv = { ...process.env };
  process.env.ADMIN_MUTATIONS_ENABLED = 'true';
  process.env.NEXT_PUBLIC_SUPABASE_URL = `http://127.0.0.1:${serverPort}`;
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
  process.env.NODE_ENV = 'production';

  // Helper to generate NextRequest with specific auth cookies and payloads
  const makeRequest = (method, pathname, cookie = '', bodyObj = null) => {
    const headers = {};
    if (cookie) headers['cookie'] = cookie;
    if (bodyObj) headers['content-type'] = 'application/json';

    return new NextRequest(`http://localhost${pathname}`, {
      method,
      headers,
      ...(bodyObj ? { body: JSON.stringify(bodyObj) } : {}),
    });
  };

  const cookieAnonymous = '';
  const cookieMalformed = '__Host-triton_admin_session=invalid_malformed_token';
  const cookieForged = `__Host-triton_admin_session=${randomBytes(32).toString('base64url')}`;
  const cookieExpired = `__Host-triton_admin_session=${expiredToken}`;
  const cookieDisabled = `__Host-triton_admin_session=${disabledToken}`;
  const cookieViewer = `__Host-triton_admin_session=${viewerToken}`;

  try {
    // 12 Target Mutation Routes with 20 Business Mutation Methods from P01
    const targetRoutes = [
      {
        name: 'places',
        relPath: 'places/route.ts',
        endpoint: '/api/v1/admin/places',
        methods: ['POST', 'PATCH', 'DELETE'],
        payloads: {
          POST: { name: 'Unauthorized Place', commune: 'Thị trấn Tri Tôn' },
          PATCH: { id: 'poi-test', name: 'Hacked Place' },
          DELETE: null,
          deleteQuery: '?id=poi-test',
        },
      },
      {
        name: 'videos',
        relPath: 'videos/route.ts',
        endpoint: '/api/v1/admin/videos',
        methods: ['POST', 'PATCH', 'DELETE'],
        payloads: {
          POST: { title: 'Unauthorized Video', video_url: 'https://youtube.com/watch?v=xyz' },
          PATCH: { id: 'vid-test', title: 'Hacked Video' },
          DELETE: null,
          deleteQuery: '?id=vid-test',
        },
      },
      {
        name: 'videos/ai-scan',
        relPath: 'videos/ai-scan/route.ts',
        endpoint: '/api/v1/admin/videos/ai-scan',
        methods: ['POST'],
        payloads: {
          POST: { keyword: 'Tri Tôn' },
        },
      },
      {
        name: 'upload',
        relPath: 'upload/route.ts',
        endpoint: '/api/v1/admin/upload',
        methods: ['POST'],
        payloads: {
          POST: { file: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=' },
        },
      },
      {
        name: 'itineraries',
        relPath: 'itineraries/route.ts',
        endpoint: '/api/v1/admin/itineraries',
        methods: ['POST', 'PATCH', 'DELETE'],
        payloads: {
          POST: { title: 'Unauthorized Itinerary', days: 2 },
          PATCH: { id: 'itin-test', title: 'Hacked Itinerary' },
          DELETE: null,
          deleteQuery: '?id=itin-test',
        },
      },
      {
        name: 'knowledge-base',
        relPath: 'knowledge-base/route.ts',
        endpoint: '/api/v1/admin/knowledge-base',
        methods: ['POST'],
        payloads: {
          POST: { title: 'Unauthorized Knowledge', content: 'Poisoned Data' },
        },
      },
      {
        name: 'knowledge-base/[id]',
        relPath: 'knowledge-base/[id]/route.ts',
        endpoint: '/api/v1/admin/knowledge-base/item-123',
        methods: ['PUT', 'DELETE'],
        isDynamic: true,
        dynamicParams: { params: Promise.resolve({ id: 'item-123' }) },
        payloads: {
          PUT: { title: 'Unauthorized Update', content: 'Poisoned Data' },
          DELETE: null,
        },
      },
      {
        name: 'feedbacks',
        relPath: 'feedbacks/route.ts',
        endpoint: '/api/v1/admin/feedbacks',
        methods: ['PATCH'],
        payloads: {
          PATCH: { id: 'fb-test', status: 'resolved' },
        },
      },
      {
        name: 'feedback',
        relPath: 'feedback/route.ts',
        endpoint: '/api/v1/admin/feedback',
        methods: ['PATCH'],
        payloads: {
          PATCH: { id: 'fb-test', resolved: true },
        },
      },
      {
        name: 'revalidate',
        relPath: 'revalidate/route.ts',
        endpoint: '/api/v1/admin/revalidate',
        methods: ['POST'],
        payloads: {
          POST: { path: '/places' },
        },
      },
      {
        name: 'gmaps-scraper',
        relPath: 'gmaps-scraper/route.ts',
        endpoint: '/api/v1/admin/gmaps-scraper',
        methods: ['POST'],
        payloads: {
          POST: { query: 'Chùa Xà Tón' },
        },
      },
      {
        name: 'scrape-images',
        relPath: 'scrape-images/route.ts',
        endpoint: '/api/v1/admin/scrape-images',
        methods: ['POST'],
        payloads: {
          POST: { url: 'https://example.com/test.jpg' },
        },
      },
    ];

    let totalNegativeChecks = 0;

    for (const routeSpec of targetRoutes) {
      const routeHandlers = loadRouteModule(routeSpec.relPath);

      for (const method of routeSpec.methods) {
        const handler = routeHandlers[method];
        assert.ok(
          typeof handler === 'function',
          `Route ${routeSpec.endpoint} must export handler function for ${method}`
        );

        const payload = routeSpec.payloads[method] || null;
        const querySuffix = method === 'DELETE' && routeSpec.payloads.deleteQuery ? routeSpec.payloads.deleteQuery : '';
        const targetUrl = `${routeSpec.endpoint}${querySuffix}`;

        // TEST 1: Raw Anonymous (No cookie) -> MUST Reject with 401
        {
          const req = makeRequest(method, targetUrl, cookieAnonymous, payload);
          const res = routeSpec.isDynamic ? await handler(req, routeSpec.dynamicParams) : await handler(req);
          assert.equal(
            res.status,
            401,
            `[Anonymous] ${method} ${routeSpec.endpoint} must return 401 Unauthorized when no cookie is sent (got ${res.status})`
          );
          totalNegativeChecks++;
        }

        // TEST 2: Malformed Cookie -> MUST Reject with 401
        {
          const req = makeRequest(method, targetUrl, cookieMalformed, payload);
          const res = routeSpec.isDynamic ? await handler(req, routeSpec.dynamicParams) : await handler(req);
          assert.equal(
            res.status,
            401,
            `[Malformed] ${method} ${routeSpec.endpoint} must return 401 Unauthorized for malformed cookie (got ${res.status})`
          );
          totalNegativeChecks++;
        }

        // TEST 3: Forged Non-Existent Token -> MUST Reject with 401
        {
          const req = makeRequest(method, targetUrl, cookieForged, payload);
          const res = routeSpec.isDynamic ? await handler(req, routeSpec.dynamicParams) : await handler(req);
          assert.equal(
            res.status,
            401,
            `[Forged] ${method} ${routeSpec.endpoint} must return 401 Unauthorized for forged token (got ${res.status})`
          );
          totalNegativeChecks++;
        }

        // TEST 4: Expired Session Token -> MUST Reject with 401
        {
          const req = makeRequest(method, targetUrl, cookieExpired, payload);
          const res = routeSpec.isDynamic ? await handler(req, routeSpec.dynamicParams) : await handler(req);
          assert.equal(
            res.status,
            401,
            `[Expired] ${method} ${routeSpec.endpoint} must return 401 Unauthorized for expired token (got ${res.status})`
          );
          totalNegativeChecks++;
        }

        // TEST 5: Deactivated / Disabled User Token -> MUST Reject with 401
        {
          const req = makeRequest(method, targetUrl, cookieDisabled, payload);
          const res = routeSpec.isDynamic ? await handler(req, routeSpec.dynamicParams) : await handler(req);
          assert.equal(
            res.status,
            401,
            `[Disabled] ${method} ${routeSpec.endpoint} must return 401 Unauthorized for disabled user (got ${res.status})`
          );
          totalNegativeChecks++;
        }

        // TEST 6: Unauthorized Role (VIEWER attempting mutation) -> MUST Reject with 403
        {
          const req = makeRequest(method, targetUrl, cookieViewer, payload);
          const res = routeSpec.isDynamic ? await handler(req, routeSpec.dynamicParams) : await handler(req);
          assert.equal(
            res.status,
            403,
            `[Viewer] ${method} ${routeSpec.endpoint} must return 403 Forbidden for VIEWER role (got ${res.status})`
          );
          totalNegativeChecks++;
        }
      }
    }

    // VERIFY ZERO SIDE EFFECT PROOF: Absolutely ZERO persistent mutation writes occurred
    assert.equal(
      mutationWrites.length,
      0,
      `Zero Mutation Side-Effect Invariant: Expected 0 mutation writes to database, but got ${mutationWrites.length}`
    );

    // Verify comprehensive coverage count: 19 authenticated mutation method-route pairs * 6 negative scenarios = 114 checks
    assert.equal(
      totalNegativeChecks,
      114,
      `Expected exactly 114 negative checks across all 19 admin mutation routes (got ${totalNegativeChecks})`
    );

    console.log(`\n🎉 PROOF VERIFIED: Successfully executed ${totalNegativeChecks} negative tests across all 19 P01 admin mutation method-route pairs.`);
    console.log(`🔒 Zero Side-Effect Invariant verified: 0 unauthorized mutations reached the database.`);
  } finally {
    process.env = prevEnv;
    await new Promise((resolve) => dbServer.close(resolve));
  }
});

test('P07-001: Middleware Guard Boundary & Kill-Switch Negative Invariants', async () => {
  const middlewarePath = path.resolve(__dirname, '../src/middleware.ts');
  const { middleware } = require(middlewarePath);

  const prevKillSwitch = process.env.ADMIN_MUTATIONS_ENABLED;
  try {
    // 1. When ADMIN_MUTATIONS_ENABLED is disabled / not 'true', ALL admin mutations MUST receive 503
    process.env.ADMIN_MUTATIONS_ENABLED = 'false';

    const mutationEndpoints = [
      { path: '/api/v1/admin/places', method: 'POST' },
      { path: '/api/v1/admin/places', method: 'DELETE' },
      { path: '/api/v1/admin/videos', method: 'PATCH' },
      { path: '/api/v1/admin/itineraries', method: 'POST' },
      { path: '/api/v1/admin/knowledge-base', method: 'POST' },
      { path: '/api/v1/admin/upload', method: 'POST' },
      { path: '/api/v1/admin/feedbacks', method: 'PATCH' },
    ];

    for (const item of mutationEndpoints) {
      const req = new NextRequest(`http://localhost${item.path}`, {
        method: item.method,
        headers: {
          'x-forwarded-for': '198.51.100.1',
          'content-type': 'application/json',
        },
      });

      const res = await middleware(req);
      assert.equal(
        res.status,
        503,
        `Kill-switch enabled must reject ${item.method} ${item.path} with 503 Service Unavailable (got ${res.status})`
      );
      assert.equal(res.headers.get('cache-control'), 'no-store');
      const json = await res.json();
      assert.match(json.error, /temporarily disabled/i);
    }

    // 2. Auth routes (/api/v1/admin/auth/*) are excluded from kill-switch so admins can log in
    const authReq = new NextRequest('http://localhost/api/v1/admin/auth/login', {
      method: 'POST',
      headers: {
        'x-forwarded-for': '198.51.100.1',
      },
    });
    const authRes = await middleware(authReq);
    // Should pass through middleware (undefined response indicates Next.js passes to handler)
    assert.ok(
      !authRes || authRes.status !== 503,
      'Auth login route must not be blocked by mutation kill-switch'
    );
  } finally {
    process.env.ADMIN_MUTATIONS_ENABLED = prevKillSwitch;
  }
});
