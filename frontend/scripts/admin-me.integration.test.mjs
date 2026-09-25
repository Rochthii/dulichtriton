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
const routePath = fileURLToPath(new URL('../src/app/api/v1/admin/auth/me/route.ts', import.meta.url));

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

test('admin me verifies the current DB session and rejects legacy or changed cookies', async () => {
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
      res.end(JSON.stringify({ code: 'LOCAL_READ_FAILURE', message: 'fixture failure' }));
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
    ADMIN_LOCAL_HTTP: 'true',
  });
  console.error = (...args) => errors.push(args.map(String).join(' '));

  try {
    const { GET } = loadRoute();
    const me = (cookie = '') => GET(new NextRequest('http://localhost/api/v1/admin/auth/me', {
      headers: cookie ? { cookie } : {},
    }));
    const productionCookie = `__Host-triton_admin_session=${token}`;

    const valid = await me(productionCookie);
    assert.equal(valid.status, 200);
    assert.deepEqual(await valid.json(), {
      authenticated: true,
      user: { name: 'Sample Admin', email: account.email, role: 'ADMIN' },
    });

    assert.equal((await me()).status, 401);
    assert.equal((await me(`triton_admin_token=${token}`)).status, 401);
    assert.equal((await me(`triton_admin_token=${token}; __Host-triton_admin_session=invalid`)).status, 401);
    const changedToken = `${token[0] === 'A' ? 'B' : 'A'}${token.slice(1)}`;
    assert.equal((await me(`__Host-triton_admin_session=${changedToken}`)).status, 401);

    account.session_expires_at = new Date(Date.now() - 1000).toISOString();
    assert.equal((await me(productionCookie)).status, 401);
    account.session_expires_at = initialAccount.session_expires_at;

    account.is_active = false;
    assert.equal((await me(productionCookie)).status, 401);
    account.is_active = true;

    account.role = 'VIEWER';
    assert.equal((await me(productionCookie)).status, 401);
    account.role = 'SUPER_ADMIN';
    const elevated = await me(productionCookie);
    assert.equal(elevated.status, 200);
    assert.equal((await elevated.json()).user.role, 'SUPER_ADMIN');
    account.role = initialAccount.role;

    account.session_created_at = new Date(Date.now() + 60_000).toISOString();
    assert.equal((await me(productionCookie)).status, 401);
    account.session_created_at = initialAccount.session_created_at;

    account.session_expires_at = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString();
    assert.equal((await me(productionCookie)).status, 401);
    account.session_expires_at = initialAccount.session_expires_at;

    accountExists = false;
    assert.equal((await me(productionCookie)).status, 401);
    accountExists = true;

    dbError = true;
    assert.equal((await me(productionCookie)).status, 401);
    dbError = false;

    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    assert.equal((await me(productionCookie)).status, 401);
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'local-test-service-key';

    process.env.NODE_ENV = 'development';
    assert.equal((await me(productionCookie)).status, 401);
    assert.equal((await me(`triton_admin_session_local=${token}`)).status, 200);
    delete process.env.ADMIN_LOCAL_HTTP;
    assert.equal((await me(productionCookie)).status, 200);
    assert.equal((await me(`triton_admin_session_local=${token}`)).status, 401);

    assert.deepEqual(account, initialAccount);
    assert.ok(dbRequests.every(({ method, url, body }) =>
      method === 'GET' && new URL(url).pathname === '/rest/v1/admin_users' && body === ''));
    assert.ok(dbRequests.every(({ url }) => new URL(url).searchParams.get('is_active') === 'eq.true'));
    assert.equal(`${errors.join('')} ${JSON.stringify(dbRequests)}`.includes(token), false);
    assert.equal(errors.join('').includes(sessionHash), false);
  } finally {
    console.error = oldConsoleError;
    for (const name of envNames) {
      if (oldEnv[name] === undefined) delete process.env[name];
      else process.env[name] = oldEnv[name];
    }
    await new Promise((resolve) => dbServer.close(resolve));
  }
});
