import assert from 'node:assert/strict';
import { createHash, randomBytes } from 'node:crypto';
import dns from 'node:dns';
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

const routePath = path.resolve(__dirname, '../src/app/api/v1/admin/gmaps-scraper/route.ts');

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

test('admin gmaps-scraper route enforces server-side guard on POST, kill-switch, and URL validation contract', async (t) => {
  const token = randomBytes(32).toString('base64url');
  const sessionHash = createHash('sha256').update(token).digest('hex');

  const account = {
    id: 95,
    email: 'gmaps_admin@triton.gov.vn',
    full_name: 'Admin Google Maps Scraper',
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
    } else if (url.pathname === '/rest/v1/places') {
      res.end(JSON.stringify({ id: 'place-1', name: 'Chùa Xà Tón' }));
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

  const origLookup = dns.promises.lookup;
  const origFetch = globalThis.fetch;

  // Stub DNS lookup to always resolve valid public IP for non-disallowed domains
  dns.promises.lookup = async () => {
    return [{ address: '93.184.216.34', family: 4 }];
  };

  const setupMockFetch = (handler) => {
    globalThis.fetch = async (input, init) => {
      const urlStr = typeof input === 'string' ? input : (input && input.url ? input.url : String(input));
      if (urlStr.includes('/rest/v1/') || urlStr.includes('127.0.0.1')) {
        return origFetch(input, init);
      }
      return handler(urlStr, init);
    };
  };

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

    const defaultGmapsHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Chùa Xà Tón - Google Maps</title>
          <meta property="og:image" content="https://lh3.googleusercontent.com/p/AF1QipN_valid_photo.jpg">
        </head>
        <body>
          <img src="https://lh5.googleusercontent.com/p/AF1QipN1234567890abcdef=s1600-k-no" />
        </body>
      </html>
    `;

    // 1. Anonymous request (Missing cookie) -> MUST return 401
    await t.test('1. Anonymous request (Missing cookie) -> MUST return 401', async () => {
      assert.equal((await POST(makeReq('POST', '/api/v1/admin/gmaps-scraper', '', { query: 'Chùa Xà Tón' }))).status, 401);
    });

    // 2. Unauthorized Role (e.g. VIEWER) -> MUST return 403
    await t.test('2. Unauthorized Role (e.g. VIEWER) -> MUST return 403', async () => {
      account.role = 'VIEWER';
      assert.equal((await POST(makeReq('POST', '/api/v1/admin/gmaps-scraper', prodCookie, { query: 'Chùa Xà Tón' }))).status, 403);
      account.role = 'ADMIN'; // restore
    });

    // 3. Authorized Admin: POST with keyword -> 200 OK & Audit Log with principal
    await t.test('3. Authorized Admin: POST with keyword -> 200 OK & Audit Log with principal', async () => {
      setupMockFetch(() => {
        return new Response(defaultGmapsHtml, {
          status: 200,
          headers: { 'content-type': 'text/html; charset=utf-8' },
        });
      });

      const postRes = await POST(makeReq('POST', '/api/v1/admin/gmaps-scraper', prodCookie, {
        query: 'Chùa Xà Tón',
        placeId: 'place-1',
        autoSync: true,
      }));
      assert.equal(postRes.status, 200);
      const postBody = await postRes.json();
      assert.equal(postBody.success, true);
      assert.ok(postBody.photoCount >= 1);
      assert.equal(postBody.synced, true);

      // Wait for audit log write
      for (let attempt = 0; attempt < 50; attempt++) {
        const audit = dbRequests.find((r) => r.method === 'POST' && r.url.includes('/rest/v1/audit_logs') && r.body.includes('GMAPS_SCRAPE'));
        if (audit) {
          assert.ok(audit.body.includes('Admin Google Maps Scraper'));
          assert.ok(audit.body.includes('ADMIN'));
          assert.ok(audit.body.includes('gmaps_scraper'));
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 20));
      }
    });

    // 4. Kill-Switch Enforcement: ADMIN_MUTATIONS_ENABLED=false -> 503
    await t.test('4. Kill-Switch Enforcement: ADMIN_MUTATIONS_ENABLED=false -> 503', async () => {
      process.env.ADMIN_MUTATIONS_ENABLED = 'false';
      assert.equal((await POST(makeReq('POST', '/api/v1/admin/gmaps-scraper', prodCookie, { query: 'Chùa Xà Tón' }))).status, 503);
      process.env.ADMIN_MUTATIONS_ENABLED = 'true'; // restore
    });

    // 5. Scheme Boundary Enforcement: Reject all non-HTTPS schemes (P01-024)
    await t.test('5. P01-024 Scheme Boundary Enforcement: Reject non-HTTPS schemes', async (st) => {
      const invalidSchemePayloads = [
        { payload: { query: 'http://maps.google.com/test' }, desc: 'http:' },
        { payload: { query: 'file:///etc/passwd' }, desc: 'file:' },
        { payload: { query: 'data:text/html,<script>alert(1)</script>' }, desc: 'data:' },
        { payload: { query: 'gopher://127.0.0.1:70/' }, desc: 'gopher:' },
        { payload: { query: 'ftp://ftp.google.com/' }, desc: 'ftp:' },
        { payload: { query: 'javascript:alert(1)' }, desc: 'javascript:' },
        { payload: { query: '//evil.com/map' }, desc: 'protocol-relative //' },
      ];

      for (const { payload, desc } of invalidSchemePayloads) {
        await st.test(`rejects ${desc} with 400 INVALID_SCHEME`, async () => {
          const res = await POST(makeReq('POST', '/api/v1/admin/gmaps-scraper', prodCookie, payload));
          assert.equal(res.status, 400);
          const body = await res.json();
          assert.equal(body.code, 'INVALID_SCHEME');
        });
      }
    });

    // 6. IP & Hostname Boundary Enforcement (P01-024)
    await t.test('6. P01-024 IP & Hostname Boundary Enforcement: Reject private/loopback/metadata IP', async (st) => {
      const blockedTargets = [
        { query: 'https://127.0.0.1/maps', expectedCode: 'BLOCKED_IP', desc: 'IPv4 loopback' },
        { query: 'https://169.254.169.254/latest/meta-data', expectedCode: 'BLOCKED_IP', desc: 'Cloud IMDS / link-local' },
        { query: 'https://192.168.1.1/maps', expectedCode: 'BLOCKED_IP', desc: 'RFC 1918 192.168.x' },
        { query: 'https://10.0.0.1/maps', expectedCode: 'BLOCKED_IP', desc: 'RFC 1918 10.x' },
        { query: 'https://172.16.0.1/maps', expectedCode: 'BLOCKED_IP', desc: 'RFC 1918 172.16.x' },
        { query: 'https://[::1]/maps', expectedCode: 'BLOCKED_IP', desc: 'IPv6 loopback' },
        { query: 'https://localhost/maps', expectedCode: 'BLOCKED_HOSTNAME', desc: 'localhost hostname' },
        { query: 'https://metadata.google.internal/meta', expectedCode: 'BLOCKED_HOSTNAME', desc: 'metadata hostname' },
        { query: 'https://instance-data/meta', expectedCode: 'BLOCKED_HOSTNAME', desc: 'instance-data hostname' },
        { query: '127.0.0.1/maps', expectedCode: 'BLOCKED_IP', desc: 'Unprefixed 127.0.0.1' },
        { query: 'localhost', expectedCode: 'BLOCKED_HOSTNAME', desc: 'Unprefixed localhost' },
      ];

      for (const { query, expectedCode, desc } of blockedTargets) {
        await st.test(`rejects ${desc} (${query}) with 400 ${expectedCode}`, async () => {
          const res = await POST(makeReq('POST', '/api/v1/admin/gmaps-scraper', prodCookie, { query }));
          assert.equal(res.status, 400);
          const body = await res.json();
          assert.equal(body.code, expectedCode);
        });
      }
    });

    // 7. Domain Profile Enforcement: Only Google Maps domains permitted (P01-024)
    await t.test('7. P01-024 Domain Profile Enforcement: Reject non-Google domains', async (st) => {
      const unauthorizedDomains = [
        'https://attacker-domain.com/poi',
        'https://evil-spoof-maps.org/place',
        'https://vnexpress.net/du-lich-tri-ton',
      ];

      for (const target of unauthorizedDomains) {
        await st.test(`rejects non-Google domain ${target} with 400 DISALLOWED_DOMAIN`, async () => {
          const res = await POST(makeReq('POST', '/api/v1/admin/gmaps-scraper', prodCookie, { query: target }));
          assert.equal(res.status, 400);
          const body = await res.json();
          assert.equal(body.code, 'DISALLOWED_DOMAIN');
        });
      }
    });

    // 8. Redirect Protection & Allowlist Enforcement (P01-024)
    await t.test('8. P01-024 Redirect Protection: Intercept redirects on gmaps-scraper', async (st) => {
      await st.test('intercepts redirect attempting SSRF to HTTP scheme (400 INVALID_SCHEME)', async () => {
        setupMockFetch((url) => {
          if (url.includes('maps.app.goo.gl')) {
            return new Response(null, {
              status: 302,
              headers: { Location: 'http://example.com/insecure.jpg' },
            });
          }
          return new Response('OK', { status: 200 });
        });

        const res = await POST(makeReq('POST', '/api/v1/admin/gmaps-scraper', prodCookie, {
          query: 'https://maps.app.goo.gl/redirect-http',
        }));
        assert.equal(res.status, 400);
        const body = await res.json();
        assert.equal(body.code, 'INVALID_SCHEME');
      });

      await st.test('intercepts redirect attempting SSRF to loopback IP (400 BLOCKED_IP)', async () => {
        setupMockFetch((url) => {
          if (url.includes('maps.app.goo.gl')) {
            return new Response(null, {
              status: 302,
              headers: { Location: 'https://127.0.0.1/admin-secret' },
            });
          }
          return new Response('OK', { status: 200 });
        });

        const res = await POST(makeReq('POST', '/api/v1/admin/gmaps-scraper', prodCookie, {
          query: 'https://maps.app.goo.gl/redirect-loopback',
        }));
        assert.equal(res.status, 400);
        const body = await res.json();
        assert.equal(body.code, 'BLOCKED_IP');
      });

      await st.test('intercepts open redirect to unauthorized domain (400 DISALLOWED_DOMAIN)', async () => {
        setupMockFetch((url) => {
          if (url.includes('maps.app.goo.gl')) {
            return new Response(null, {
              status: 302,
              headers: { Location: 'https://evil-attacker.com/malicious' },
            });
          }
          return new Response('OK', { status: 200 });
        });

        const res = await POST(makeReq('POST', '/api/v1/admin/gmaps-scraper', prodCookie, {
          query: 'https://maps.app.goo.gl/evil-target',
        }));
        assert.equal(res.status, 400);
        const body = await res.json();
        assert.equal(body.code, 'DISALLOWED_DOMAIN');
      });

      await st.test('allows safe redirect to valid Google Maps destination (200 OK)', async () => {
        setupMockFetch((url) => {
          if (url.includes('maps.app.goo.gl')) {
            return new Response(null, {
              status: 302,
              headers: { Location: 'https://www.google.com/maps/place/Chua+Xa+Ton/@10.4128,105.0068' },
            });
          }
          return new Response(
            `<!DOCTYPE html>
            <html>
              <head>
                <title>Chùa Xà Tón Tri Tôn - Google Maps</title>
                <meta property="og:image" content="https://lh3.googleusercontent.com/p/AF1QipN_valid_photo.jpg">
              </head>
              <body>
                <img src="https://lh5.googleusercontent.com/p/AF1QipN1234567890abcdef=s1600-k-no" />
              </body>
            </html>`,
            { status: 200, headers: { 'content-type': 'text/html; charset=utf-8' } }
          );
        });

        const res = await POST(makeReq('POST', '/api/v1/admin/gmaps-scraper', prodCookie, {
          query: 'https://maps.app.goo.gl/valid-xa-ton',
        }));
        assert.equal(res.status, 200);
        const body = await res.json();
        assert.equal(body.success, true);
        assert.ok(body.photoCount >= 1);
        assert.ok(body.googleMapsUrl.includes('www.google.com/maps/place/Chua+Xa+Ton'));
        assert.deepEqual(body.coordinates, { latitude: 10.4128, longitude: 105.0068 });
      });
    });

    // 9. Token secrecy: token never leaked in errors or db logs
    await t.test('9. Token secrecy: token never leaked in errors or db logs', async () => {
      assert.equal(`${errors.join('')} ${JSON.stringify(dbRequests)}`.includes(token), false);
    });
  } finally {
    dns.promises.lookup = origLookup;
    globalThis.fetch = origFetch;
    console.error = oldConsoleError;
    for (const name of envNames) {
      if (oldEnv[name] === undefined) delete process.env[name];
      else process.env[name] = oldEnv[name];
    }
    await new Promise((resolve) => dbServer.close(resolve));
  }
});
