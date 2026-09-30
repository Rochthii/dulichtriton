import assert from 'node:assert/strict';
import { createHash, randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import http from 'node:http';
import Module, { createRequire } from 'node:module';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import typescript from 'typescript';

const require = createRequire(import.meta.url);
const { NextRequest } = require('next/server');
const routePath = fileURLToPath(new URL('../src/app/api/v1/admin/auth/logout/route.ts', import.meta.url));

function loadRoute() {
  const { outputText } = typescript.transpileModule(readFileSync(routePath, 'utf8'), {
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

test('admin logout revokes session in DB, preserves newer session on stale logout, and clears cookies', async () => {
  const token = randomBytes(32).toString('base64url');
  const sessionHash = createHash('sha256').update(token).digest('hex');

  const account = {
    id: 42,
    email: 'sample-admin@example.invalid',
    full_name: 'Sample Admin',
    role: 'ADMIN',
    is_active: true,
    session_hash: sessionHash,
    session_created_at: new Date(Date.now() - 60_000).toISOString(),
    session_expires_at: new Date(Date.now() + 60_000).toISOString(),
  };

  const dbRequests = [];
  const errors = [];
  let dbError = false;

  const dbServer = http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://127.0.0.1');
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const bodyText = Buffer.concat(chunks).toString('utf8');
    dbRequests.push({ method: req.method, url: url.toString(), body: bodyText });

    res.setHeader('content-type', 'application/json');

    if (dbError) {
      res.statusCode = 500;
      res.end(JSON.stringify({ code: 'LOCAL_DB_FAILURE', message: 'simulated db failure' }));
      return;
    }

    if (url.pathname === '/rest/v1/admin_users' && req.method === 'PATCH') {
      const targetHash = (url.searchParams.get('session_hash') || '').replace(/^eq\./, '');
      if (account.session_hash && account.session_hash === targetHash) {
        account.session_hash = null;
        account.session_created_at = null;
        account.session_expires_at = null;
        res.end(JSON.stringify({
          id: account.id,
          email: account.email,
          full_name: account.full_name,
          role: account.role,
        }));
      } else {
        res.end('null');
      }
    } else if (url.pathname === '/rest/v1/audit_logs' && req.method === 'POST') {
      res.statusCode = 201;
      res.end('{}');
    } else {
      res.statusCode = 404;
      res.end('{}');
    }
  });

  await new Promise((resolve) => dbServer.listen(0, '127.0.0.1', resolve));

  const envNames = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'NODE_ENV', 'ADMIN_LOCAL_HTTP'];
  const oldEnv = Object.fromEntries(envNames.map((name) => [name, process.env[name]]));
  const oldConsoleError = console.error;

  Object.assign(process.env, {
    NEXT_PUBLIC_SUPABASE_URL: `http://127.0.0.1:${dbServer.address().port}`,
    SUPABASE_SERVICE_ROLE_KEY: 'local-test-service-key',
    NODE_ENV: 'production',
    ADMIN_LOCAL_HTTP: 'false',
  });

  console.error = (...args) => errors.push(args.map(String).join(' '));

  try {
    const { POST } = loadRoute();
    const logout = (cookie = '') => POST(new NextRequest('http://localhost/api/v1/admin/auth/logout', {
      method: 'POST',
      headers: cookie ? { cookie } : {},
    }));

    // 1. Positive: Valid session logout
    const validRes = await logout(`__Host-triton_admin_session=${token}`);
    assert.equal(validRes.status, 200);
    assert.deepEqual(await validRes.json(), {
      success: true,
      message: 'Đã đăng xuất tài khoản Quản trị',
    });

    // DB session must be revoked
    assert.equal(account.session_hash, null);
    assert.equal(account.session_created_at, null);
    assert.equal(account.session_expires_at, null);

    // Verify Set-Cookie headers in production
    const setCookieHeaders = validRes.headers.getSetCookie();
    assert.ok(setCookieHeaders.length >= 2, 'Should set multiple cookie clearing headers');

    const hostCookieHeader = setCookieHeaders.find((h) => h.includes('__Host-triton_admin_session='));
    assert.ok(hostCookieHeader, '__Host-triton_admin_session clearing cookie must exist');
    assert.ok(hostCookieHeader.includes('Max-Age=0') || hostCookieHeader.includes('max-age=0'));
    assert.ok(hostCookieHeader.includes('HttpOnly') || hostCookieHeader.includes('httponly'));
    assert.ok(hostCookieHeader.includes('Secure') || hostCookieHeader.includes('secure'));
    assert.match(hostCookieHeader, /; SameSite=strict/i);

    // Verify audit log write was sent
    const getAuditReq = () => dbRequests.find((r) => r.method === 'POST' && r.url.includes('/rest/v1/audit_logs'));
    for (let attempt = 0; attempt < 50 && !getAuditReq(); attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
    const auditReq = getAuditReq();
    assert.ok(auditReq, 'LOGOUT_SUCCESS audit log should be submitted');
    assert.ok(auditReq.body.includes('LOGOUT_SUCCESS'));

    // 2. Negative: Logout with old/stale token does NOT delete newer active session
    const newToken = randomBytes(32).toString('base64url');
    const newSessionHash = createHash('sha256').update(newToken).digest('hex');
    account.session_hash = newSessionHash;
    account.session_created_at = new Date().toISOString();
    account.session_expires_at = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString();

    const staleRes = await logout(`__Host-triton_admin_session=${token}`); // using OLD token
    assert.equal(staleRes.status, 200);
    // Crucial check: newer session in DB must be untouched!
    assert.equal(account.session_hash, newSessionHash, 'Newer session in DB must not be modified by old token logout');

    // 3. Negative: Logout with malformed token
    const malformedRes = await logout('__Host-triton_admin_session=short_bad_token');
    assert.equal(malformedRes.status, 200);
    assert.equal(account.session_hash, newSessionHash, 'DB session must remain untouched');

    // 4. Negative: Logout without any cookie
    const noCookieRes = await logout();
    assert.equal(noCookieRes.status, 200);
    assert.equal(account.session_hash, newSessionHash, 'DB session must remain untouched');

    // 5. Local development HTTP mode
    process.env.NODE_ENV = 'development';
    process.env.ADMIN_LOCAL_HTTP = 'true';
    const localRes = await logout(`triton_admin_session_local=${newToken}`);
    assert.equal(localRes.status, 200);
    assert.equal(account.session_hash, null, 'Active local session should be revoked');

    const localHeaders = localRes.headers.getSetCookie();
    const localCookieHeader = localHeaders.find((h) => h.includes('triton_admin_session_local='));
    assert.ok(localCookieHeader);
    assert.ok(!localCookieHeader.includes('Secure'), 'Local HTTP mode must not enforce Secure flag');

    // 6. DB Error handling
    dbError = true;
    const dbErrRes = await logout(`triton_admin_session_local=dummy`);
    assert.equal(dbErrRes.status, 200, 'Logout must succeed on client even if DB has errors');
    dbError = false;

    // 7. Missing service role key handling
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    const noKeyRes = await logout(`triton_admin_session_local=dummy`);
    assert.equal(noKeyRes.status, 200, 'Logout must succeed on client even if service key is missing');
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'local-test-service-key';

    // 8. Security invariant: No raw token or session hash in logs
    assert.equal(`${errors.join('')} ${JSON.stringify(dbRequests)}`.includes(token), false, 'Token must not leak in errors');
    assert.equal(`${errors.join('')} ${JSON.stringify(dbRequests)}`.includes(newToken), false, 'New token must not leak in errors');
  } finally {
    console.error = oldConsoleError;
    for (const name of envNames) {
      if (oldEnv[name] === undefined) delete process.env[name];
      else process.env[name] = oldEnv[name];
    }
    await new Promise((resolve) => dbServer.close(resolve));
  }
});
