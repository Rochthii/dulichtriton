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

const routePath = path.resolve(__dirname, '../src/app/api/v1/admin/videos/ai-scan/route.ts');

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

test('admin videos ai-scan route enforces server-side guard on POST, kill-switch, and principal logging', async () => {
  const token = randomBytes(32).toString('base64url');
  const sessionHash = createHash('sha256').update(token).digest('hex');

  const account = {
    id: 55,
    email: 'video_scanner@triton.gov.vn',
    full_name: 'Admin Quét Video',
    role: 'ADMIN',
    is_active: true,
    session_hash: sessionHash,
    session_created_at: new Date(Date.now() - 60_000).toISOString(),
    session_expires_at: new Date(Date.now() + 60_000).toISOString(),
  };

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
    } else if (url.pathname === '/rest/v1/video_discoveries') {
      if (req.method === 'POST') {
        const parsed = JSON.parse(body);
        const item = Array.isArray(parsed) ? parsed[0] : parsed;
        item.id = item.id || `vid-${Date.now()}`;
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
    const { POST } = loadRoute();

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

    // 1. Anonymous request (Missing cookie) -> MUST return 401
    assert.equal((await POST(makeReq('POST', '/api/v1/admin/videos/ai-scan', '', { targetKeyword: 'Tà Pạ', limit: 1 }))).status, 401);

    // 2. Unauthorized Role (e.g. VIEWER) -> MUST return 403
    account.role = 'VIEWER';
    assert.equal((await POST(makeReq('POST', '/api/v1/admin/videos/ai-scan', prodCookie, { targetKeyword: 'Tà Pạ', limit: 1 }))).status, 403);
    account.role = 'ADMIN'; // restore

    // 3. Authorized Admin: POST -> 200 OK & Audit Log with principal
    const postRes = await POST(makeReq('POST', '/api/v1/admin/videos/ai-scan', prodCookie, { targetKeyword: 'Tà Pạ', limit: 1 }));
    assert.equal(postRes.status, 200);
    const postBody = await postRes.json();
    assert.equal(postBody.success, true);
    assert.ok(postBody.count >= 1);

    // Wait for audit log write
    for (let attempt = 0; attempt < 50; attempt++) {
      const audit = dbRequests.find((r) => r.method === 'POST' && r.url.includes('/rest/v1/audit_logs') && r.body.includes('AI_SCAN_TIKTOK'));
      if (audit) {
        assert.ok(audit.body.includes('Admin Quét Video'));
        assert.ok(audit.body.includes('ADMIN'));
        assert.ok(audit.body.includes('video_discoveries'));
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 20));
    }

    // 4. Kill-Switch Enforcement: ADMIN_MUTATIONS_ENABLED=false -> 503
    process.env.ADMIN_MUTATIONS_ENABLED = 'false';
    assert.equal((await POST(makeReq('POST', '/api/v1/admin/videos/ai-scan', prodCookie, { targetKeyword: 'Tà Pạ', limit: 1 }))).status, 503);

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
