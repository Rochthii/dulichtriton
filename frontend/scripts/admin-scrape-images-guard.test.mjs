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

const routePath = path.resolve(__dirname, '../src/app/api/v1/admin/scrape-images/route.ts');

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

test('admin scrape-images route enforces server-side guard on POST, kill-switch, and principal logging', async (t) => {
  const token = randomBytes(32).toString('base64url');
  const sessionHash = createHash('sha256').update(token).digest('hex');

  const account = {
    id: 66,
    email: 'scraper_admin@triton.gov.vn',
    full_name: 'Admin Scraper Manager',
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
      res.end(JSON.stringify([{ name: 'Hồ Tà Pạ', image_url: 'https://example.com/tapa.jpg', photos: [] }]));
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

    await t.test('1. Anonymous request (Missing cookie) -> MUST return 401', async () => {
      assert.equal((await POST(makeReq('POST', '/api/v1/admin/scrape-images', '', { query: 'Tà Pạ' }))).status, 401);
    });

    await t.test('2. Unauthorized Role (e.g. VIEWER) -> MUST return 403', async () => {
      account.role = 'VIEWER';
      assert.equal((await POST(makeReq('POST', '/api/v1/admin/scrape-images', prodCookie, { query: 'Tà Pạ' }))).status, 403);
      account.role = 'ADMIN'; // restore
    });

    await t.test('3. Authorized Admin: POST with keyword -> 200 OK & Audit Log with principal', async () => {
      const postRes = await POST(makeReq('POST', '/api/v1/admin/scrape-images', prodCookie, {
        query: 'Tà Pạ',
      }));
      assert.equal(postRes.status, 200);
      const postBody = await postRes.json();
      assert.equal(postBody.success, true);
      assert.ok(postBody.count >= 1);

      // Wait for audit log write
      for (let attempt = 0; attempt < 50; attempt++) {
        const audit = dbRequests.find((r) => r.method === 'POST' && r.url.includes('/rest/v1/audit_logs') && r.body.includes('SCRAPE_IMAGES'));
        if (audit) {
          assert.ok(audit.body.includes('Admin Scraper Manager'));
          assert.ok(audit.body.includes('ADMIN'));
          assert.ok(audit.body.includes('image_scraping'));
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 20));
      }
    });

    await t.test('4. Kill-Switch Enforcement: ADMIN_MUTATIONS_ENABLED=false -> 503', async () => {
      process.env.ADMIN_MUTATIONS_ENABLED = 'false';
      assert.equal((await POST(makeReq('POST', '/api/v1/admin/scrape-images', prodCookie, { query: 'Tà Pạ' }))).status, 503);
      process.env.ADMIN_MUTATIONS_ENABLED = 'true'; // restore
    });

    await t.test('5. P01-021 Scheme Boundary Enforcement: Reject all non-HTTPS schemes', async (st) => {
      const invalidSchemePayloads = [
        { payload: { url: 'http://example.com/image.jpg' }, desc: 'http: via url' },
        { payload: { query: 'http://example.com/image.jpg' }, desc: 'http: via query' },
        { payload: { url: 'file:///etc/passwd' }, desc: 'file: via url' },
        { payload: { query: 'file:///etc/shadow' }, desc: 'file: via query' },
        { payload: { url: 'data:text/html,<script>alert(1)</script>' }, desc: 'data: via url' },
        { payload: { url: 'gopher://127.0.0.1:70/' }, desc: 'gopher: via url' },
        { payload: { url: 'ftp://ftp.example.com/pub/image.png' }, desc: 'ftp: via url' },
        { payload: { url: 'javascript:alert(1)' }, desc: 'javascript: via url' },
        { payload: { url: '//evil.com/image.jpg' }, desc: 'protocol-relative // via url' },
      ];

      for (const { payload, desc } of invalidSchemePayloads) {
        await st.test(`rejects ${desc} with 400 INVALID_SCHEME`, async () => {
          const res = await POST(makeReq('POST', '/api/v1/admin/scrape-images', prodCookie, payload));
          assert.equal(res.status, 400, `Expected 400 for ${desc}`);
          const body = await res.json();
          assert.equal(body.code, 'INVALID_SCHEME', `Expected INVALID_SCHEME code for ${desc}`);
        });
      }
    });

    await t.test('6. P01-021 Safe URL: Valid HTTPS direct image URL is accepted (200 OK)', async () => {
      const validHttpsRes = await POST(makeReq('POST', '/api/v1/admin/scrape-images', prodCookie, {
        url: 'https://example.com/photo.jpg',
      }));
      assert.equal(validHttpsRes.status, 200, 'Expected 200 for valid HTTPS URL');
      const validHttpsBody = await validHttpsRes.json();
      assert.equal(validHttpsBody.success, true);
      assert.deepEqual(validHttpsBody.images, ['https://example.com/photo.jpg']);
    });

    await t.test('7. P01-022 IP & Hostname Boundary Enforcement: Reject private/loopback/link-local IPs and internal hostnames', async (st) => {
      const blockedIpPayloads = [
        { payload: { url: 'https://127.0.0.1/secret.jpg' }, expectedCode: 'BLOCKED_IP', desc: 'IPv4 loopback 127.0.0.1' },
        { payload: { query: 'https://127.0.0.1/secret.jpg' }, expectedCode: 'BLOCKED_IP', desc: 'IPv4 loopback via query' },
        { payload: { url: 'https://169.254.169.254/latest/meta-data' }, expectedCode: 'BLOCKED_IP', desc: 'Cloud IMDS / link-local 169.254.169.254' },
        { payload: { url: 'https://192.168.1.1/admin' }, expectedCode: 'BLOCKED_IP', desc: 'RFC 1918 192.168.1.1' },
        { payload: { url: 'https://10.0.0.1/api' }, expectedCode: 'BLOCKED_IP', desc: 'RFC 1918 10.0.0.1' },
        { payload: { url: 'https://172.16.0.1/status' }, expectedCode: 'BLOCKED_IP', desc: 'RFC 1918 172.16.0.1' },
        { payload: { url: 'https://[::1]/secret' }, expectedCode: 'BLOCKED_IP', desc: 'IPv6 loopback ::1' },
        { payload: { url: 'https://[fe80::1]/secret' }, expectedCode: 'BLOCKED_IP', desc: 'IPv6 link-local fe80::1' },
        { payload: { url: 'https://localhost/admin' }, expectedCode: 'BLOCKED_HOSTNAME', desc: 'Hostname localhost' },
        { payload: { query: 'https://localhost/admin' }, expectedCode: 'BLOCKED_HOSTNAME', desc: 'Hostname localhost via query' },
        { payload: { url: 'https://metadata.google.internal/computeMetadata/v1/' }, expectedCode: 'BLOCKED_HOSTNAME', desc: 'Cloud metadata hostname' },
        { payload: { url: 'https://instance-data/latest/meta-data' }, expectedCode: 'BLOCKED_HOSTNAME', desc: 'AWS instance-data hostname' },
        { payload: { url: '127.0.0.1/secret.jpg' }, expectedCode: 'BLOCKED_IP', desc: 'Unprefixed 127.0.0.1' },
        { payload: { url: 'localhost' }, expectedCode: 'BLOCKED_HOSTNAME', desc: 'Unprefixed localhost' },
      ];

      for (const { payload, expectedCode, desc } of blockedIpPayloads) {
        await st.test(`rejects ${desc} with 400 ${expectedCode}`, async () => {
          const res = await POST(makeReq('POST', '/api/v1/admin/scrape-images', prodCookie, payload));
          assert.equal(res.status, 400, `Expected 400 for ${desc}`);
          const body = await res.json();
          assert.equal(body.code, expectedCode, `Expected ${expectedCode} code for ${desc}, got ${body.code} (${body.error})`);
        });
      }
    });

    await t.test('8. Token secrecy: token never leaked in errors or db logs', async () => {
      assert.equal(`${errors.join('')} ${JSON.stringify(dbRequests)}`.includes(token), false);
    });

    await t.test('9. P01-023 Redirect Hop Interception & Allowlist Enforcement', async (st) => {
      const origLookup = dns.promises.lookup;
      const origFetch = globalThis.fetch;

      // Stub DNS lookup to always resolve valid public IP
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
        await st.test('9.1 Intercepts redirect attempting SSRF to HTTP scheme (400 INVALID_SCHEME)', async () => {
          setupMockFetch((url) => {
            if (url.includes('redirect-to-http')) {
              return new Response(null, {
                status: 302,
                headers: { Location: 'http://example.com/insecure-image.jpg' },
              });
            }
            return new Response('OK', { status: 200 });
          });

          const res = await POST(makeReq('POST', '/api/v1/admin/scrape-images', prodCookie, {
            url: 'https://example.com/redirect-to-http',
          }));
          assert.equal(res.status, 400);
          const body = await res.json();
          assert.equal(body.code, 'INVALID_SCHEME');
        });

        await st.test('9.2 Intercepts redirect attempting SSRF to private loopback IP (400 BLOCKED_IP)', async () => {
          setupMockFetch((url) => {
            if (url.includes('redirect-to-loopback')) {
              return new Response(null, {
                status: 302,
                headers: { Location: 'https://127.0.0.1/admin-secret.jpg' },
              });
            }
            return new Response('OK', { status: 200 });
          });

          const res = await POST(makeReq('POST', '/api/v1/admin/scrape-images', prodCookie, {
            url: 'https://example.com/redirect-to-loopback',
          }));
          assert.equal(res.status, 400);
          const body = await res.json();
          assert.equal(body.code, 'BLOCKED_IP');
        });

        await st.test('9.3 Intercepts redirect attempting SSRF to cloud metadata IP (400 BLOCKED_IP)', async () => {
          setupMockFetch((url) => {
            if (url.includes('redirect-to-metadata')) {
              return new Response(null, {
                status: 302,
                headers: { Location: 'https://169.254.169.254/latest/meta-data' },
              });
            }
            return new Response('OK', { status: 200 });
          });

          const res = await POST(makeReq('POST', '/api/v1/admin/scrape-images', prodCookie, {
            url: 'https://example.com/redirect-to-metadata',
          }));
          assert.equal(res.status, 400);
          const body = await res.json();
          assert.equal(body.code, 'BLOCKED_IP');
        });

        await st.test('9.4 Intercepts redirect loop exceeding maxRedirects (400 MAX_REDIRECTS_EXCEEDED)', async () => {
          setupMockFetch(() => {
            return new Response(null, {
              status: 302,
              headers: { Location: 'https://example.com/loop/next' },
            });
          });

          const res = await POST(makeReq('POST', '/api/v1/admin/scrape-images', prodCookie, {
            url: 'https://example.com/loop/start',
          }));
          assert.equal(res.status, 400);
          const body = await res.json();
          assert.equal(body.code, 'MAX_REDIRECTS_EXCEEDED');
        });

        await st.test('9.5 Intercepts Google Maps shortlink redirecting to unauthorized third-party domain (400 DISALLOWED_DOMAIN)', async () => {
          setupMockFetch((url) => {
            if (url.includes('maps.app.goo.gl')) {
              return new Response(null, {
                status: 302,
                headers: { Location: 'https://evil-unauthorized-site.com/fake-login' },
              });
            }
            return new Response('OK', { status: 200 });
          });

          const res = await POST(makeReq('POST', '/api/v1/admin/scrape-images', prodCookie, {
            url: 'https://maps.app.goo.gl/evil-redirect',
          }));
          assert.equal(res.status, 400);
          const body = await res.json();
          assert.equal(body.code, 'DISALLOWED_DOMAIN');
        });

        await st.test('9.6 Intercepts regular article redirecting to different third-party host outside allowlist (400 DISALLOWED_DOMAIN)', async () => {
          setupMockFetch((url) => {
            if (url.includes('travel-blog.vn')) {
              return new Response(null, {
                status: 302,
                headers: { Location: 'https://completely-different-domain.com/landing' },
              });
            }
            return new Response('OK', { status: 200 });
          });

          const res = await POST(makeReq('POST', '/api/v1/admin/scrape-images', prodCookie, {
            url: 'https://travel-blog.vn/tri-ton',
          }));
          assert.equal(res.status, 400);
          const body = await res.json();
          assert.equal(body.code, 'DISALLOWED_DOMAIN');
        });

        await st.test('9.7 Allows safe redirect from Google Maps shortlink to valid Google destination (200 OK)', async () => {
          setupMockFetch((url) => {
            if (url.includes('maps.app.goo.gl')) {
              return new Response(null, {
                status: 302,
                headers: { Location: 'https://www.google.com/maps/place/Ho+Ta+Pa/@10.42,104.98' },
              });
            }
            return new Response(
              `<html>
                <head>
                  <title>Hồ Tà Pạ - Google Maps</title>
                  <meta property="og:image" content="https://lh3.googleusercontent.com/p/AF1QipM_valid_photo.jpg">
                </head>
                <body>
                  <img src="https://lh3.googleusercontent.com/p/AF1QipM_photo2.jpg"/>
                </body>
              </html>`,
              { status: 200, headers: { 'content-type': 'text/html; charset=utf-8' } }
            );
          });

          const res = await POST(makeReq('POST', '/api/v1/admin/scrape-images', prodCookie, {
            url: 'https://maps.app.goo.gl/ho-ta-pa',
          }));
          assert.equal(res.status, 200);
          const body = await res.json();
          assert.equal(body.success, true);
          assert.ok(body.images.length >= 2);
          assert.ok(body.images.includes('https://lh3.googleusercontent.com/p/AF1QipM_valid_photo.jpg'));
          assert.ok(body.images.includes('https://lh3.googleusercontent.com/p/AF1QipM_photo2.jpg'));
          assert.ok(body.sourceUrl.includes('www.google.com/maps/place/Ho+Ta+Pa'));
        });

        await st.test('9.8 Allows safe redirect within same domain for regular website (200 OK)', async () => {
          setupMockFetch((url) => {
            if (url.includes('/ta-pa-short')) {
              return new Response(null, {
                status: 302,
                headers: { Location: 'https://dulichtriton.vn/diem-den/ho-ta-pa' },
              });
            }
            return new Response(
              `<html>
                <head>
                  <title>Hồ Tà Pạ Tri Tôn</title>
                  <meta property="og:image" content="https://dulichtriton.vn/images/tapa_hero.jpg">
                </head>
                <body>
                  <img src="/images/tapa_gallery.jpg"/>
                </body>
              </html>`,
              { status: 200, headers: { 'content-type': 'text/html; charset=utf-8' } }
            );
          });

          const res = await POST(makeReq('POST', '/api/v1/admin/scrape-images', prodCookie, {
            url: 'https://dulichtriton.vn/ta-pa-short',
          }));
          assert.equal(res.status, 200);
          const body = await res.json();
          assert.equal(body.success, true);
          assert.ok(body.images.includes('https://dulichtriton.vn/images/tapa_hero.jpg'));
          assert.ok(body.images.includes('https://dulichtriton.vn/images/tapa_gallery.jpg'));
          assert.equal(body.sourceUrl, 'https://dulichtriton.vn/diem-den/ho-ta-pa');
        });
      } finally {
        dns.promises.lookup = origLookup;
        globalThis.fetch = origFetch;
      }
    });
  } finally {
    console.error = oldConsoleError;
    for (const name of envNames) {
      if (oldEnv[name] === undefined) delete process.env[name];
      else process.env[name] = oldEnv[name];
    }
    await new Promise((resolve) => dbServer.close(resolve));
  }
});
