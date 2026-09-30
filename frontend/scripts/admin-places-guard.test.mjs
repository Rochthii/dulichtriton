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

const routePath = path.resolve(__dirname, '../src/app/api/v1/admin/places/route.ts');

function loadRoute() {
  const { outputText } = typescript.transpileModule(fs.readFileSync(routePath, 'utf8'), {
    compilerOptions: {
      module: typescript.ModuleKind.CommonJS,
      target: typescript.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  });
  const routeModule = new Module(routePath);
  routeModule.filename = routePath;
  routeModule.paths = Module._nodeModulePaths(dirname(routePath));
  routeModule._compile(outputText, routePath);
  return routeModule.exports;
}

test('admin places route enforces server-side guard on GET/POST/PATCH/DELETE and respects kill-switch', async () => {
  const token = randomBytes(32).toString('base64url');
  const sessionHash = createHash('sha256').update(token).digest('hex');

  const account = {
    id: 42,
    email: 'admin@triton.gov.vn',
    full_name: 'Admin Tri Tôn',
    role: 'ADMIN',
    is_active: true,
    session_hash: sessionHash,
    session_created_at: new Date(Date.now() - 60_000).toISOString(),
    session_expires_at: new Date(Date.now() + 60_000).toISOString(),
  };

  const places = [
    { id: 'poi-1', name: 'Chùa Xà Tón', commune: 'Thị trấn Tri Tôn', category: 'Chùa', is_active: true },
  ];

  const dbRequests = [];
  const errors = [];

  const dbServer = http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://127.0.0.1');
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = Buffer.concat(chunks).toString('utf8');
    dbRequests.push({ method: req.method, url: url.toString(), body });

    res.setHeader('content-type', 'application/json');

    if (url.pathname === '/rest/v1/admin_users') {
      if (url.searchParams.get('session_hash') === `eq.${account.session_hash}` && account.is_active) {
        res.end(JSON.stringify(account));
      } else {
        res.end('null');
      }
    } else if (url.pathname === '/rest/v1/places') {
      if (req.method === 'GET') {
        res.end(JSON.stringify(places));
      } else if (req.method === 'POST') {
        const item = JSON.parse(body);
        places.push(item);
        res.end(JSON.stringify(item));
      } else if (req.method === 'PATCH') {
        const update = JSON.parse(body);
        const item = places[0];
        Object.assign(item, update);
        res.end(JSON.stringify(item));
      } else {
        res.end('{}');
      }
    } else if (url.pathname === '/rest/v1/audit_logs') {
      res.statusCode = 201;
      res.end('{}');
    } else {
      res.statusCode = 404;
      res.end('{}');
    }
  });

  await new Promise((resolve) => dbServer.listen(0, '127.0.0.1', resolve));

  const envNames = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NODE_ENV',
    'ADMIN_LOCAL_HTTP',
    'ADMIN_MUTATIONS_ENABLED',
  ];
  const oldEnv = Object.fromEntries(envNames.map((name) => [name, process.env[name]]));
  const oldConsoleError = console.error;

  Object.assign(process.env, {
    NEXT_PUBLIC_SUPABASE_URL: `http://127.0.0.1:${dbServer.address().port}`,
    SUPABASE_SERVICE_ROLE_KEY: 'local-test-service-key',
    NODE_ENV: 'production',
    ADMIN_LOCAL_HTTP: 'false',
    ADMIN_MUTATIONS_ENABLED: 'true',
  });

  console.error = (...args) => errors.push(args.map(String).join(' '));

  try {
    const { GET, POST, PATCH, DELETE } = loadRoute();

    const makeReq = (method, pathUrl, cookie = '', bodyObj = null) => {
      const init = {
        method,
        headers: {
          ...(cookie ? { cookie } : {}),
          ...(bodyObj ? { 'content-type': 'application/json' } : {}),
        },
        ...(bodyObj ? { body: JSON.stringify(bodyObj) } : {}),
      };
      return new NextRequest(`http://localhost${pathUrl}`, init);
    };

    const prodCookie = `__Host-triton_admin_session=${token}`;

    // 1. Anonymous requests (Missing cookie) -> MUST return 401
    assert.equal((await GET(makeReq('GET', '/api/v1/admin/places'))).status, 401);
    assert.equal((await POST(makeReq('POST', '/api/v1/admin/places', '', { name: 'Test', commune: 'Tri Tôn' }))).status, 401);
    assert.equal((await PATCH(makeReq('PATCH', '/api/v1/admin/places', '', { id: 'poi-1', name: 'Update' }))).status, 401);
    assert.equal((await DELETE(makeReq('DELETE', '/api/v1/admin/places?id=poi-1'))).status, 401);

    // 2. Unauthorized Role (e.g. VIEWER) -> MUST return 403
    account.role = 'VIEWER';
    assert.equal((await GET(makeReq('GET', '/api/v1/admin/places', prodCookie))).status, 403);
    assert.equal((await POST(makeReq('POST', '/api/v1/admin/places', prodCookie, { name: 'Test', commune: 'Tri Tôn' }))).status, 403);
    assert.equal((await PATCH(makeReq('PATCH', '/api/v1/admin/places', prodCookie, { id: 'poi-1', name: 'Update' }))).status, 403);
    assert.equal((await DELETE(makeReq('DELETE', '/api/v1/admin/places?id=poi-1', prodCookie))).status, 403);
    account.role = 'ADMIN'; // restore

    // 3. Authorized Admin (GET) -> 200 OK
    const getRes = await GET(makeReq('GET', '/api/v1/admin/places', prodCookie));
    assert.equal(getRes.status, 200);
    const getBody = await getRes.json();
    assert.equal(getBody.success, true);
    assert.equal(getBody.places.length, 1);

    // 4. Authorized Admin (POST) -> 200 OK & audit log includes authenticated principal
    // Zero Unsplash invariant: missing image_url must resolve to null, not fake stock photos
    const postRes = await POST(makeReq('POST', '/api/v1/admin/places', prodCookie, {
      name: 'Hồ Tà Pạ',
      commune: 'Núi Tô',
      category: 'Hồ nước',
    }));
    assert.equal(postRes.status, 200);
    const postBody = await postRes.json();
    assert.equal(postBody.success, true);
    assert.equal(postBody.place.name, 'Hồ Tà Pạ');
    assert.equal(postBody.place.image_url, null, 'POI created without images must have image_url = null');
    assert.deepEqual(postBody.place.photos, [], 'POI created without images must have empty photos array');
    assert.equal(JSON.stringify(postBody.place).includes('unsplash.com'), false, 'POI record must not contain unsplash URL');

    // 4b. Authorized Admin (POST with valid image) -> image_url is preserved
    const postWithImgRes = await POST(makeReq('POST', '/api/v1/admin/places', prodCookie, {
      name: 'Chùa Hàng Còng',
      commune: 'Châu Lăng',
      category: 'Chùa Khmer',
      image_url: 'https://res.cloudinary.com/dulichtriton/image/upload/v1/chua-hang-cong.jpg',
    }));
    assert.equal(postWithImgRes.status, 200);
    const postWithImgBody = await postWithImgRes.json();
    assert.equal(postWithImgBody.place.image_url, 'https://res.cloudinary.com/dulichtriton/image/upload/v1/chua-hang-cong.jpg');

    // Wait for audit log write
    for (let attempt = 0; attempt < 50; attempt++) {
      const audit = dbRequests.find((r) => r.method === 'POST' && r.url.includes('/rest/v1/audit_logs') && r.body.includes('CREATE_POI'));
      if (audit) {
        assert.ok(audit.body.includes('Admin Tri Tôn'));
        assert.ok(audit.body.includes('ADMIN'));
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 20));
    }

    // 5. Authorized Admin (PATCH) -> 200 OK
    const patchRes = await PATCH(makeReq('PATCH', '/api/v1/admin/places', prodCookie, {
      id: 'poi-1',
      name: 'Chùa Xà Tón Updated',
    }));
    assert.equal(patchRes.status, 200);
    const patchBody = await patchRes.json();
    assert.equal(patchBody.success, true);
    assert.equal(patchBody.place.name, 'Chùa Xà Tón Updated');

    // 6. Authorized Admin (DELETE) -> 200 OK
    const delRes = await DELETE(makeReq('DELETE', '/api/v1/admin/places?id=poi-1', prodCookie));
    assert.equal(delRes.status, 200);

    // 7. Kill-Switch Enforcement: ADMIN_MUTATIONS_ENABLED=false
    process.env.ADMIN_MUTATIONS_ENABLED = 'false';
    // GET read should still be allowed with auth
    assert.equal((await GET(makeReq('GET', '/api/v1/admin/places', prodCookie))).status, 200);
    // Mutations must be blocked with 503 even when authenticated!
    assert.equal((await POST(makeReq('POST', '/api/v1/admin/places', prodCookie, { name: 'Denied', commune: 'Núi Tô' }))).status, 503);
    assert.equal((await PATCH(makeReq('PATCH', '/api/v1/admin/places', prodCookie, { id: 'poi-1', name: 'Denied' }))).status, 503);
    assert.equal((await DELETE(makeReq('DELETE', '/api/v1/admin/places?id=poi-1', prodCookie))).status, 503);
    process.env.ADMIN_MUTATIONS_ENABLED = 'true'; // restore

    // 8. Static Code Invariant: Route file must NOT contain any reference to unsplash
    const routeSource = fs.readFileSync(routePath, 'utf8');
    assert.equal(routeSource.toLowerCase().includes('unsplash'), false, 'Route places must not contain any unsplash references');

    // Verify token secrecy
    assert.equal(`${errors.join('')} ${JSON.stringify(dbRequests)}`.includes(token), false);
  } finally {
    console.error = oldConsoleError;
    for (const name of envNames) {
      if (oldEnv[name] === undefined) delete process.env[name];
      else process.env[name] = oldEnv[name];
    }
    await new Promise((resolve) => dbServer.close(resolve));
  }
});
