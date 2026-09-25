import assert from 'node:assert/strict';
import { createHash, randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import http from 'node:http';
import Module, { createRequire } from 'node:module';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import bcrypt from 'bcryptjs';
import typescript from 'typescript';

const require = createRequire(import.meta.url);
const { NextRequest } = require('next/server');
const routePath = fileURLToPath(new URL('../src/app/api/v1/admin/auth/login/route.ts', import.meta.url));

function loadRoute() {
  const source = readFileSync(routePath, 'utf8');
  const { outputText } = typescript.transpileModule(source, {
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

function assertSessionCookie(response, localHttp) {
  const name = localHttp ? 'triton_admin_session_local' : '__Host-triton_admin_session';
  const setCookies = response.headers.getSetCookie();
  const sessionCookie = setCookies.find((line) => line.startsWith(`${name}=`));
  const legacyCookie = setCookies.find((line) => line.startsWith('triton_admin_token='));
  assert.ok(sessionCookie);
  assert.match(sessionCookie, /; Path=\//);
  assert.match(sessionCookie, /; Max-Age=28800/);
  assert.match(sessionCookie, /; HttpOnly/);
  assert.match(sessionCookie, /; SameSite=strict/i);
  assert.equal(/; Domain=/i.test(sessionCookie), false);
  assert.equal(/; Secure/.test(sessionCookie), !localHttp);
  assert.match(legacyCookie ?? '', /^triton_admin_token=;/);
  assert.match(legacyCookie, /; Max-Age=0/);
  return new RegExp(`^${name}=([^;]+)`).exec(sessionCookie)?.[1];
}

test('admin login persists only an opaque session hash before issuing a cookie', async () => {
  const email = 'sample-admin@example.invalid';
  const password = ` ${randomBytes(24).toString('base64url')} `;
  const envPassword = randomBytes(24).toString('base64url');
  const passwordHash = await bcrypt.hash(password, 12);
  const account = {
    id: 42, email, password_hash: passwordHash, full_name: 'Sample Admin',
    role: 'ADMIN', is_active: true, session_hash: null,
    session_created_at: null, session_expires_at: null,
  };
  let sessionWriteMode = 'success';
  const dbRequests = [];
  const errors = [];

  const dbServer = http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://127.0.0.1');
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = Buffer.concat(chunks).toString('utf8');
    dbRequests.push({ method: req.method, url: url.toString(), body });

    res.setHeader('content-type', 'application/json');
    if (url.pathname === '/rest/v1/admin_users' && req.method === 'GET') {
      res.end(JSON.stringify(account));
    } else if (url.pathname === '/rest/v1/admin_users' && req.method === 'PATCH') {
      if (sessionWriteMode === 'error') {
        res.statusCode = 500;
        res.end(JSON.stringify({ code: 'LOCAL_WRITE_FAILURE', message: 'fixture failure' }));
      } else if (sessionWriteMode === 'no-match') {
        res.end('null');
      } else {
        const update = JSON.parse(body);
        account.session_hash = update.session_hash;
        account.session_created_at = update.session_created_at;
        account.session_expires_at = update.session_expires_at;
        res.end(JSON.stringify({ id: account.id, session_hash: account.session_hash }));
      }
    } else if (url.pathname === '/rest/v1/audit_logs') {
      res.statusCode = 201;
      res.end('[]');
    } else {
      res.statusCode = 404;
      res.end('{}');
    }
  });
  await new Promise((resolve) => dbServer.listen(0, '127.0.0.1', resolve));

  const envNames = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'ADMIN_EMAIL', 'ADMIN_PASSWORD', 'NODE_ENV', 'ADMIN_LOCAL_HTTP'];
  const oldEnv = Object.fromEntries(envNames.map((name) => [name, process.env[name]]));
  const oldConsoleError = console.error;
  Object.assign(process.env, {
    NEXT_PUBLIC_SUPABASE_URL: `http://127.0.0.1:${dbServer.address().port}`,
    SUPABASE_SERVICE_ROLE_KEY: 'local-test-service-key',
    ADMIN_EMAIL: email,
    ADMIN_PASSWORD: envPassword,
    NODE_ENV: 'production',
    ADMIN_LOCAL_HTTP: 'true',
  });
  console.error = (...args) => errors.push(args.map(String).join(' '));

  try {
    const { POST } = loadRoute();
    const login = (candidate) => POST(new NextRequest('http://localhost/api/v1/admin/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password: candidate }),
    }));

    const valid = await login(password);
    assert.equal(valid.status, 200);
    const firstToken = assertSessionCookie(valid, false);
    assert.match(firstToken ?? '', /^[A-Za-z0-9_-]{43}$/);
    assert.equal(account.session_hash, createHash('sha256').update(firstToken).digest('hex'));
    assert.equal(new Date(account.session_expires_at) - new Date(account.session_created_at), 8 * 60 * 60 * 1000);
    const validBody = await valid.json();
    assert.equal(validBody.user.email, email);
    assert.equal(JSON.stringify(validBody).includes(account.session_hash), false);
    assert.equal(JSON.stringify(validBody).includes(firstToken), false);

    const validAgain = await login(password);
    assert.equal(validAgain.status, 200);
    const secondToken = assertSessionCookie(validAgain, false);
    assert.match(secondToken ?? '', /^[A-Za-z0-9_-]{43}$/);
    assert.notEqual(secondToken, firstToken);
    assert.equal(account.session_hash, createHash('sha256').update(secondToken).digest('hex'));
    assert.notEqual(account.session_hash, createHash('sha256').update(firstToken).digest('hex'));
    const tamperedToken = `${secondToken[0] === 'A' ? 'B' : 'A'}${secondToken.slice(1)}`;
    assert.notEqual(account.session_hash, createHash('sha256').update(tamperedToken).digest('hex'));

    const persistedSession = {
      hash: account.session_hash, created: account.session_created_at, expires: account.session_expires_at,
    };
    sessionWriteMode = 'error';
    const writeError = await login(password);
    assert.equal(writeError.status, 503);
    assert.equal(writeError.headers.has('set-cookie'), false);
    assert.deepEqual(
      { hash: account.session_hash, created: account.session_created_at, expires: account.session_expires_at },
      persistedSession,
    );

    sessionWriteMode = 'no-match';
    const noMatchingAccount = await login(password);
    assert.equal(noMatchingAccount.status, 503);
    assert.equal(noMatchingAccount.headers.has('set-cookie'), false);
    sessionWriteMode = 'success';

    account.id = null;
    const missingIdentity = await login(password);
    assert.equal(missingIdentity.status, 503);
    assert.equal(missingIdentity.headers.has('set-cookie'), false);
    account.id = 42;

    const wrong = await login('incorrect');
    assert.equal(wrong.status, 401);
    assert.equal(wrong.headers.has('set-cookie'), false);

    const oldFallback = await login(envPassword);
    assert.equal(oldFallback.status, 401);
    assert.equal(oldFallback.headers.has('set-cookie'), false);

    const truncatedEquivalent = await login(`${password}${'x'.repeat(80)}`);
    assert.equal(truncatedEquivalent.status, 401);
    assert.equal(truncatedEquivalent.headers.has('set-cookie'), false);

    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    const missingServiceKey = await login(password);
    assert.equal(missingServiceKey.status, 503);
    assert.equal(missingServiceKey.headers.has('set-cookie'), false);

    process.env.SUPABASE_SERVICE_ROLE_KEY = 'local-test-service-key';
    process.env.NODE_ENV = 'development';
    delete process.env.ADMIN_LOCAL_HTTP;
    const devWithoutFlag = await login(password);
    assert.equal(devWithoutFlag.status, 200);
    const devSecureToken = assertSessionCookie(devWithoutFlag, false);

    process.env.ADMIN_LOCAL_HTTP = 'true';
    const localHttpLogin = await login(password);
    assert.equal(localHttpLogin.status, 200);
    const localToken = assertSessionCookie(localHttpLogin, true);

    const adminQueries = dbRequests.filter(({ url }) => new URL(url).pathname === '/rest/v1/admin_users');
    const accountReads = adminQueries.filter(({ method }) => method === 'GET');
    const sessionWrites = adminQueries.filter(({ method }) => method === 'PATCH');
    assert.equal(accountReads.length, 10);
    assert.equal(sessionWrites.length, 6);
    assert.ok(accountReads.every(({ url }) => new URL(url).searchParams.get('select')?.includes('password_hash')));
    assert.ok(sessionWrites.every(({ url }) => {
      const filters = new URL(url).searchParams;
      return filters.get('id') === 'eq.42' && filters.get('password_hash') === `eq.${passwordHash}`
        && filters.get('role') === 'eq.ADMIN' && filters.get('is_active') === 'eq.true';
    }));
    assert.equal(`${errors.join('')} ${JSON.stringify(dbRequests)}`.includes(password), false);
    assert.equal(`${errors.join('')} ${JSON.stringify(dbRequests)}`.includes(envPassword), false);
    assert.equal(`${errors.join('')} ${JSON.stringify(dbRequests)}`.includes(firstToken), false);
    assert.equal(`${errors.join('')} ${JSON.stringify(dbRequests)}`.includes(secondToken), false);
    assert.equal(`${errors.join('')} ${JSON.stringify(dbRequests)}`.includes(devSecureToken), false);
    assert.equal(`${errors.join('')} ${JSON.stringify(dbRequests)}`.includes(localToken), false);
    const successAuditCount = () => dbRequests.filter(({ url, body }) =>
      new URL(url).pathname === '/rest/v1/audit_logs' && body.includes('LOGIN_SUCCESS')).length;
    for (let attempt = 0; attempt < 50 && successAuditCount() < 4; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
    assert.equal(successAuditCount(), 4);
  } finally {
    console.error = oldConsoleError;
    for (const name of envNames) {
      if (oldEnv[name] === undefined) delete process.env[name];
      else process.env[name] = oldEnv[name];
    }
    await new Promise((resolve) => dbServer.close(resolve));
  }
});
