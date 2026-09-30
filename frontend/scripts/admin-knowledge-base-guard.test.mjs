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

const rootRoutePath = path.resolve(__dirname, '../src/app/api/v1/admin/knowledge-base/route.ts');
const idRoutePath = path.resolve(__dirname, '../src/app/api/v1/admin/knowledge-base/[id]/route.ts');

function loadModule(filePath) {
  const { outputText } = typescript.transpileModule(fs.readFileSync(filePath, 'utf8'), {
    compilerOptions: {
      module: typescript.ModuleKind.CommonJS,
      target: typescript.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  });
  const m = new Module(filePath);
  m.filename = filePath;
  m.paths = Module._nodeModulePaths(dirname(filePath));
  m._compile(outputText, filePath);
  return m.exports;
}

test('admin knowledge-base routes enforce server-side guard on all methods and respect kill-switch', async () => {
  const token = randomBytes(32).toString('base64url');
  const sessionHash = createHash('sha256').update(token).digest('hex');

  const account = {
    id: 99,
    email: 'knowledge_admin@triton.gov.vn',
    full_name: 'Admin Tri Thức Tri Tôn',
    role: 'ADMIN',
    is_active: true,
    session_hash: sessionHash,
    session_created_at: new Date(Date.now() - 60_000).toISOString(),
    session_expires_at: new Date(Date.now() + 60_000).toISOString(),
  };

  const knowledgeItems = [
    {
      id: 'kb-1',
      title: 'Đặc sản Gà đốt Ô Thum',
      category: 'food',
      keywords: ['ga dot', 'o thum', 'dac san'],
      content: 'Món ăn trứ danh vùng Bảy Núi với lá chúc thơm lừng',
      is_active: true,
      priority: 10,
      author: 'Admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
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
    } else if (url.pathname === '/rest/v1/custom_knowledge_base') {
      if (req.method === 'GET') {
        const idMatch = url.searchParams.get('id');
        if (idMatch) {
          const cleanId = idMatch.replace(/^eq\./, '');
          const found = knowledgeItems.find((k) => k.id === cleanId);
          res.end(JSON.stringify(found || null));
        } else {
          res.end(JSON.stringify(knowledgeItems));
        }
      } else if (req.method === 'POST') {
        const parsed = JSON.parse(body);
        const item = Array.isArray(parsed) ? parsed[0] : parsed;
        item.id = item.id || `kb-${Date.now()}`;
        knowledgeItems.push(item);
        res.end(JSON.stringify(item));
      } else if (req.method === 'PATCH' || req.method === 'PUT') {
        const update = JSON.parse(body);
        const item = knowledgeItems[0];
        Object.assign(item, update);
        res.end(JSON.stringify(item));
      } else if (req.method === 'DELETE') {
        const deleted = knowledgeItems.shift() || {};
        res.end(JSON.stringify(deleted));
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
    const rootRoute = loadModule(rootRoutePath);
    const idRoute = loadModule(idRoutePath);

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
    const paramsMock = { params: Promise.resolve({ id: 'kb-1' }) };

    // 1. Anonymous requests (Missing cookie) -> MUST return 401
    assert.equal((await rootRoute.GET(makeReq('GET', '/api/v1/admin/knowledge-base'))).status, 401);
    assert.equal((await rootRoute.POST(makeReq('POST', '/api/v1/admin/knowledge-base', '', { title: 'Test', content: 'Test content' }))).status, 401);
    assert.equal((await idRoute.GET(makeReq('GET', '/api/v1/admin/knowledge-base/kb-1'), paramsMock)).status, 401);
    assert.equal((await idRoute.PUT(makeReq('PUT', '/api/v1/admin/knowledge-base/kb-1', '', { title: 'Updated' }), paramsMock)).status, 401);
    assert.equal((await idRoute.PATCH(makeReq('PATCH', '/api/v1/admin/knowledge-base/kb-1', '', { title: 'Updated' }), paramsMock)).status, 401);
    assert.equal((await idRoute.DELETE(makeReq('DELETE', '/api/v1/admin/knowledge-base/kb-1'), paramsMock)).status, 401);

    // 2. Unauthorized Role (e.g. VIEWER) -> MUST return 403
    account.role = 'VIEWER';
    assert.equal((await rootRoute.GET(makeReq('GET', '/api/v1/admin/knowledge-base', prodCookie))).status, 403);
    assert.equal((await rootRoute.POST(makeReq('POST', '/api/v1/admin/knowledge-base', prodCookie, { title: 'Test', content: 'Test content' }))).status, 403);
    assert.equal((await idRoute.GET(makeReq('GET', '/api/v1/admin/knowledge-base/kb-1', prodCookie), paramsMock)).status, 403);
    assert.equal((await idRoute.PUT(makeReq('PUT', '/api/v1/admin/knowledge-base/kb-1', prodCookie, { title: 'Updated' }), paramsMock)).status, 403);
    assert.equal((await idRoute.DELETE(makeReq('DELETE', '/api/v1/admin/knowledge-base/kb-1', prodCookie), paramsMock)).status, 403);
    account.role = 'ADMIN'; // restore

    // 3. Authorized Admin: Root GET -> 200 OK
    const getRes = await rootRoute.GET(makeReq('GET', '/api/v1/admin/knowledge-base', prodCookie));
    assert.equal(getRes.status, 200);
    const getBody = await getRes.json();
    assert.equal(getBody.success, true);
    assert.equal(getBody.data.length, 1);
    assert.equal(getBody.data[0].title, 'Đặc sản Gà đốt Ô Thum');

    // 4. Authorized Admin: Root POST -> 201 Created & Audit Log recorded
    const postRes = await rootRoute.POST(makeReq('POST', '/api/v1/admin/knowledge-base', prodCookie, {
      title: 'Bánh bò thốt nốt',
      category: 'food',
      content: 'Món bánh dân dã ngọt thanh vị đường thốt nốt nguyên chất',
      keywords: 'banh bo, thot not, am thuc',
    }));
    assert.equal(postRes.status, 201);
    const postBody = await postRes.json();
    assert.equal(postBody.success, true);
    assert.equal(postBody.data.title, 'Bánh bò thốt nốt');

    // Wait for audit log write
    for (let attempt = 0; attempt < 50; attempt++) {
      const audit = dbRequests.find((r) => r.method === 'POST' && r.url.includes('/rest/v1/audit_logs') && r.body.includes('CREATE_KNOWLEDGE_BASE'));
      if (audit) {
        assert.ok(audit.body.includes('Admin Tri Thức Tri Tôn'));
        assert.ok(audit.body.includes('ADMIN'));
        assert.ok(audit.body.includes('custom_knowledge_base'));
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 20));
    }

    // 5. Authorized Admin: Item GET -> 200 OK
    const itemGetRes = await idRoute.GET(makeReq('GET', '/api/v1/admin/knowledge-base/kb-1', prodCookie), paramsMock);
    assert.equal(itemGetRes.status, 200);
    const itemGetBody = await itemGetRes.json();
    assert.equal(itemGetBody.success, true);
    assert.equal(itemGetBody.data.id, 'kb-1');

    // 6. Authorized Admin: Item PUT -> 200 OK
    const putRes = await idRoute.PUT(makeReq('PUT', '/api/v1/admin/knowledge-base/kb-1', prodCookie, {
      title: 'Đặc sản Gà đốt Ô Thum (Cập nhật)',
      priority: 12,
    }), paramsMock);
    assert.equal(putRes.status, 200);
    const putBody = await putRes.json();
    assert.equal(putBody.success, true);
    assert.equal(putBody.data.title, 'Đặc sản Gà đốt Ô Thum (Cập nhật)');

    // 7. Authorized Admin: Item DELETE -> 200 OK
    const delRes = await idRoute.DELETE(makeReq('DELETE', '/api/v1/admin/knowledge-base/kb-1', prodCookie), paramsMock);
    assert.equal(delRes.status, 200);
    const delBody = await delRes.json();
    assert.equal(delBody.success, true);

    // 8. Kill-Switch Enforcement: ADMIN_MUTATIONS_ENABLED=false
    process.env.ADMIN_MUTATIONS_ENABLED = 'false';
    // GET reads still allowed with auth
    assert.equal((await rootRoute.GET(makeReq('GET', '/api/v1/admin/knowledge-base', prodCookie))).status, 200);
    assert.equal((await idRoute.GET(makeReq('GET', '/api/v1/admin/knowledge-base/kb-1', prodCookie), paramsMock)).status, 200);

    // Mutations must be blocked with 503
    assert.equal((await rootRoute.POST(makeReq('POST', '/api/v1/admin/knowledge-base', prodCookie, { title: 'Denied', content: 'Blocked' }))).status, 503);
    assert.equal((await idRoute.PUT(makeReq('PUT', '/api/v1/admin/knowledge-base/kb-1', prodCookie, { title: 'Denied' }), paramsMock)).status, 503);
    assert.equal((await idRoute.PATCH(makeReq('PATCH', '/api/v1/admin/knowledge-base/kb-1', prodCookie, { title: 'Denied' }), paramsMock)).status, 503);
    assert.equal((await idRoute.DELETE(makeReq('DELETE', '/api/v1/admin/knowledge-base/kb-1', prodCookie), paramsMock)).status, 503);

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
