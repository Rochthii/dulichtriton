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
const guardPath = fileURLToPath(new URL('../src/lib/adminSessionGuard.ts', import.meta.url));

function loadGuard() {
  const { outputText } = typescript.transpileModule(readFileSync(guardPath, 'utf8'), {
    compilerOptions: {
      module: typescript.ModuleKind.CommonJS,
      target: typescript.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  });
  const guardModule = new Module(guardPath);
  guardModule.filename = guardPath;
  guardModule.paths = Module._nodeModulePaths(dirname(guardPath));
  guardModule._compile(outputText, guardPath);
  return guardModule.exports;
}

test('verifyAdminSession enforces valid session, correct roles, and fail-closed security invariants', async () => {
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

  const initialAccount = { ...account };
  const dbRequests = [];
  const errors = [];
  let dbError = false;
  let accountExists = true;

  const dbServer = http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://127.0.0.1');
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    dbRequests.push({ method: req.method, url: url.toString(), body: Buffer.concat(chunks).toString('utf8') });

    res.setHeader('content-type', 'application/json');

    if (url.pathname !== '/rest/v1/admin_users') {
      res.statusCode = 404;
      res.end('{}');
    } else if (dbError) {
      res.statusCode = 500;
      res.end(JSON.stringify({ code: 'LOCAL_READ_FAILURE', message: 'fixture db failure' }));
    } else if (!accountExists || url.searchParams.get('session_hash') !== `eq.${account.session_hash}`) {
      res.end('null');
    } else {
      res.end(JSON.stringify(account));
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
    const { verifyAdminSession } = loadGuard();
    const makeReq = (cookie = '') => new NextRequest('http://localhost/api/v1/admin/places', {
      headers: cookie ? { cookie } : {},
    });
    const prodCookie = `__Host-triton_admin_session=${token}`;

    // 1. Positive: Valid ADMIN role
    const adminAuth = await verifyAdminSession(makeReq(prodCookie));
    assert.equal(adminAuth.authenticated, true);
    assert.deepEqual(adminAuth.principal, {
      id: 42,
      email: 'admin@triton.gov.vn',
      fullName: 'Admin Tri Tôn',
      role: 'ADMIN',
    });

    // 2. Positive: Valid SUPER_ADMIN role
    account.role = 'SUPER_ADMIN';
    const superAdminAuth = await verifyAdminSession(makeReq(prodCookie));
    assert.equal(superAdminAuth.authenticated, true);
    assert.equal(superAdminAuth.principal.role, 'SUPER_ADMIN');
    account.role = 'ADMIN'; // restore

    // 3. Negative: Role restriction (Role sai / không đủ quyền)
    // Request specifically requiring SUPER_ADMIN
    const restrictedAuth = await verifyAdminSession(makeReq(prodCookie), ['SUPER_ADMIN']);
    assert.equal(restrictedAuth.authenticated, false);
    assert.equal(restrictedAuth.status, 403);
    assert.equal(restrictedAuth.response.status, 403);

    // User having an unauthorized role like VIEWER
    account.role = 'VIEWER';
    const viewerAuth = await verifyAdminSession(makeReq(prodCookie));
    assert.equal(viewerAuth.authenticated, false);
    assert.equal(viewerAuth.status, 403);
    assert.equal(viewerAuth.response.status, 403);
    account.role = 'ADMIN'; // restore

    // 4. Negative: Missing or null role in DB
    account.role = null;
    const nullRoleAuth = await verifyAdminSession(makeReq(prodCookie));
    assert.equal(nullRoleAuth.authenticated, false);
    assert.equal(nullRoleAuth.status, 403);
    account.role = 'ADMIN'; // restore

    // 5. Negative: Missing cookie
    const noCookieAuth = await verifyAdminSession(makeReq());
    assert.equal(noCookieAuth.authenticated, false);
    assert.equal(noCookieAuth.status, 401);
    assert.equal(noCookieAuth.response.status, 401);

    // 6. Negative: Malformed token (not 43 base64url characters)
    const malformedAuth = await verifyAdminSession(makeReq('__Host-triton_admin_session=invalid_short'));
    assert.equal(malformedAuth.authenticated, false);
    assert.equal(malformedAuth.status, 401);

    // 7. Negative: Legacy cookie ignored
    const legacyAuth = await verifyAdminSession(makeReq(`triton_admin_token=${token}`));
    assert.equal(legacyAuth.authenticated, false);
    assert.equal(legacyAuth.status, 401);

    // 8. Negative: Token mismatch (not found in DB)
    const unknownToken = randomBytes(32).toString('base64url');
    const unknownAuth = await verifyAdminSession(makeReq(`__Host-triton_admin_session=${unknownToken}`));
    assert.equal(unknownAuth.authenticated, false);
    assert.equal(unknownAuth.status, 401);

    // 9. Negative: Expired session
    account.session_expires_at = new Date(Date.now() - 1000).toISOString();
    const expiredAuth = await verifyAdminSession(makeReq(prodCookie));
    assert.equal(expiredAuth.authenticated, false);
    assert.equal(expiredAuth.status, 401);
    account.session_expires_at = initialAccount.session_expires_at;

    // 10. Negative: Future created_at
    account.session_created_at = new Date(Date.now() + 60_000).toISOString();
    const futureAuth = await verifyAdminSession(makeReq(prodCookie));
    assert.equal(futureAuth.authenticated, false);
    assert.equal(futureAuth.status, 401);
    account.session_created_at = initialAccount.session_created_at;

    // 11. Negative: Session duration exceeds 8 hours
    account.session_expires_at = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString();
    const longAuth = await verifyAdminSession(makeReq(prodCookie));
    assert.equal(longAuth.authenticated, false);
    assert.equal(longAuth.status, 401);
    account.session_expires_at = initialAccount.session_expires_at;

    // 12. Negative: Inactive account
    account.is_active = false;
    const inactiveAuth = await verifyAdminSession(makeReq(prodCookie));
    assert.equal(inactiveAuth.authenticated, false);
    assert.equal(inactiveAuth.status, 401);
    account.is_active = true;

    // 13. Local HTTP flag behavior
    process.env.NODE_ENV = 'development';
    process.env.ADMIN_LOCAL_HTTP = 'true';
    assert.equal((await verifyAdminSession(makeReq(prodCookie))).authenticated, false);
    assert.equal((await verifyAdminSession(makeReq(`triton_admin_session_local=${token}`))).authenticated, true);
    delete process.env.ADMIN_LOCAL_HTTP;
    assert.equal((await verifyAdminSession(makeReq(prodCookie))).authenticated, true);
    assert.equal((await verifyAdminSession(makeReq(`triton_admin_session_local=${token}`))).authenticated, false);
    process.env.NODE_ENV = 'production';

    // 14. Negative: DB Error returns 503 fail-closed
    dbError = true;
    const dbErrAuth = await verifyAdminSession(makeReq(prodCookie));
    assert.equal(dbErrAuth.authenticated, false);
    assert.equal(dbErrAuth.status, 503);
    assert.equal(dbErrAuth.response.status, 503);
    dbError = false;

    // 15. Negative: Missing service role key returns 503 fail-closed
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    const noKeyAuth = await verifyAdminSession(makeReq(prodCookie));
    assert.equal(noKeyAuth.authenticated, false);
    assert.equal(noKeyAuth.status, 503);
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'local-test-service-key';

    // 16. Security Invariant: Token and session hash never leaked in logs
    assert.equal(`${errors.join('')} ${JSON.stringify(dbRequests)}`.includes(token), false, 'Token must not leak in errors');
    assert.equal(errors.join('').includes(sessionHash), false, 'Hash must not leak in errors');
  } finally {
    console.error = oldConsoleError;
    for (const name of envNames) {
      if (oldEnv[name] === undefined) delete process.env[name];
      else process.env[name] = oldEnv[name];
    }
    await new Promise((resolve) => dbServer.close(resolve));
  }
});
