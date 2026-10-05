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

test('P07-002: SSRF Negative Test Suite (Private, Redirect, Scheme, Hostname & Egress Invariants)', async (t) => {
  const {
    validateSafeFetchUrl,
    assertSafeFetchUrl,
    safeServerFetch,
    SafeFetchValidationError,
    isDisallowedIPv4,
    isDisallowedIPv6,
    isDisallowedIp,
    isDisallowedHostname,
    GOOGLE_MAPS_ALLOWED_DOMAINS,
  } = await import('../src/lib/serverFetchValidator.ts');

  const createMockDns = (ips) => async () => ips;

  // Track all network egress to verify the Zero Private Egress Invariant
  const attemptedEgress = [];

  // ===========================================================================
  // SUITE 1: Scheme & Protocol Boundary Invariants (15+ malicious schemes)
  // ===========================================================================
  await t.test('Suite 1: Scheme & Protocol Boundary Invariants', async (st) => {
    const invalidSchemes = [
      { url: 'http://example.com/insecure', name: 'http:' },
      { url: 'file:///etc/passwd', name: 'file: (UNIX)' },
      { url: 'file:///C:/Windows/System32/drivers/etc/hosts', name: 'file: (Windows)' },
      { url: 'data:text/html,<script>alert(1)</script>', name: 'data:' },
      { url: 'gopher://127.0.0.1:70/1_gopher', name: 'gopher:' },
      { url: 'ftp://anonymous:pwd@ftp.example.com/dump.sql', name: 'ftp:' },
      { url: 'ftps://ftp.example.com/secret', name: 'ftps:' },
      { url: 'javascript:alert(document.cookie)', name: 'javascript:' },
      { url: 'blob:https://example.com/d1a2b3c4', name: 'blob:' },
      { url: 'ldap://127.0.0.1:389/dc=corp', name: 'ldap:' },
      { url: 'dict://127.0.0.1:2628/show', name: 'dict:' },
      { url: 'tftp://10.0.0.1/config', name: 'tftp:' },
      { url: '//169.254.169.254/latest/meta-data', name: 'protocol-relative //' },
      { url: '//localhost:3000/api/admin', name: 'protocol-relative //localhost' },
      { url: 'hTTp://mixed-case.example.com/path', name: 'mixed-case hTTp:' },
    ];

    for (const { url, name } of invalidSchemes) {
      await st.test(`strictly rejects malicious scheme: ${name}`, async () => {
        const res = await validateSafeFetchUrl(url);
        assert.equal(res.isValid, false, `Scheme ${name} must be rejected`);
        assert.ok(
          res.code === 'INVALID_SCHEME' || res.code === 'INVALID_URL',
          `Expected INVALID_SCHEME or INVALID_URL for ${name}, got ${res.code}`
        );
      });
    }

    const malformedUrls = [
      'not_a_valid_url',
      'https://',
      'https://[invalid-ipv6-bracket',
      '',
      '   ',
    ];

    for (const bad of malformedUrls) {
      await st.test(`rejects malformed input: "${bad}"`, async () => {
        const res = await validateSafeFetchUrl(bad);
        assert.equal(res.isValid, false);
        assert.ok(res.code === 'INVALID_URL' || res.code === 'INVALID_SCHEME');
      });
    }

    await st.test('accepts valid HTTPS protocol', async () => {
      const res = await validateSafeFetchUrl('https://maps.google.com/test', {
        dnsLookupFn: createMockDns(['172.217.16.206']),
      });
      assert.equal(res.isValid, true);
      assert.equal(res.url.protocol, 'https:');
    });
  });

  // ===========================================================================
  // SUITE 2: Private, Loopback, Link-Local, Cloud IMDS & Hostname Invariants
  // ===========================================================================
  await t.test('Suite 2: Private, Loopback, Link-Local, Cloud IMDS & Hostname Invariants', async (st) => {
    const blockedIpv4List = [
      // Loopback
      { ip: '127.0.0.1', desc: 'IPv4 Loopback 127.0.0.1' },
      { ip: '127.0.1.1', desc: 'IPv4 Loopback 127.0.1.1' },
      { ip: '127.255.255.254', desc: 'IPv4 Loopback 127.255.255.254' },
      // RFC 1918 Class A
      { ip: '10.0.0.1', desc: 'RFC 1918 10.0.0.1' },
      { ip: '10.255.255.254', desc: 'RFC 1918 10.255.255.254' },
      // RFC 1918 Class B
      { ip: '172.16.0.1', desc: 'RFC 1918 172.16.0.1' },
      { ip: '172.31.255.254', desc: 'RFC 1918 172.31.255.254' },
      // RFC 1918 Class C
      { ip: '192.168.0.1', desc: 'RFC 1918 192.168.0.1' },
      { ip: '192.168.1.254', desc: 'RFC 1918 192.168.1.254' },
      // Cloud IMDS / Link-Local
      { ip: '169.254.169.254', desc: 'Cloud IMDS 169.254.169.254' },
      { ip: '169.254.1.1', desc: 'Link-Local 169.254.1.1' },
      // Special / Reserved
      { ip: '0.0.0.0', desc: 'Current network 0.0.0.0' },
      { ip: '100.64.0.1', desc: 'CGNAT 100.64.0.1' },
      { ip: '100.127.255.254', desc: 'CGNAT 100.127.255.254' },
      { ip: '192.0.2.1', desc: 'TEST-NET-1 (RFC 5737)' },
      { ip: '198.51.100.1', desc: 'TEST-NET-2 (RFC 5737)' },
      { ip: '203.0.113.1', desc: 'TEST-NET-3 (RFC 5737)' },
      { ip: '224.0.0.1', desc: 'Multicast 224.0.0.1' },
      { ip: '240.0.0.1', desc: 'Reserved 240.0.0.1' },
      { ip: '255.255.255.255', desc: 'Broadcast 255.255.255.255' },
    ];

    for (const { ip, desc } of blockedIpv4List) {
      await st.test(`blocks ${desc}`, async () => {
        assert.equal(isDisallowedIPv4(ip), true, `isDisallowedIPv4(${ip}) should be true`);
        assert.equal(isDisallowedIp(ip), true, `isDisallowedIp(${ip}) should be true`);
        const res = await validateSafeFetchUrl(`https://${ip}/admin`);
        assert.equal(res.isValid, false);
        assert.equal(res.code, 'BLOCKED_IP');
      });
    }

    const blockedIpv6List = [
      { ip: '::1', desc: 'IPv6 Loopback ::1' },
      { ip: '::', desc: 'IPv6 Unspecified ::' },
      { ip: 'fe80::1', desc: 'IPv6 Link-Local fe80::1' },
      { ip: 'fe80::215:5dff:fe00:1', desc: 'IPv6 Link-Local SLAAC' },
      { ip: 'fc00::1', desc: 'IPv6 ULA fc00::1' },
      { ip: 'fd12:3456:789a::1', desc: 'IPv6 ULA fd12:...' },
      { ip: 'ff02::1', desc: 'IPv6 Multicast ff02::1' },
      { ip: '2001:db8::1', desc: 'IPv6 Documentation 2001:db8::1' },
      { ip: '::ffff:127.0.0.1', desc: 'IPv4-mapped Loopback' },
      { ip: '::ffff:169.254.169.254', desc: 'IPv4-mapped Cloud IMDS' },
      { ip: '::ffff:192.168.1.1', desc: 'IPv4-mapped RFC 1918' },
      { ip: '::ffff:10.0.0.1', desc: 'IPv4-mapped RFC 1918 10.x' },
    ];

    for (const { ip, desc } of blockedIpv6List) {
      await st.test(`blocks ${desc} (${ip})`, async () => {
        assert.equal(isDisallowedIPv6(ip), true, `isDisallowedIPv6(${ip}) should be true`);
        assert.equal(isDisallowedIp(ip), true, `isDisallowedIp(${ip}) should be true`);
        const res = await validateSafeFetchUrl(`https://[${ip}]/meta`);
        assert.equal(res.isValid, false);
        assert.equal(res.code, 'BLOCKED_IP');
      });
    }

    const blockedHostnames = [
      'localhost',
      'foo.localhost',
      'bar.localhost',
      'app.local',
      'db.internal',
      'router.lan',
      'metadata.google.internal',
      'metadata.goog',
      'instance-data',
      'admin',
      'intranet',
    ];

    for (const host of blockedHostnames) {
      await st.test(`blocks disallowed hostname: "${host}"`, async () => {
        assert.equal(isDisallowedHostname(host), true, `isDisallowedHostname(${host}) should be true`);
        const res = await validateSafeFetchUrl(`https://${host}/sensitive`);
        assert.equal(res.isValid, false);
        assert.equal(res.code, 'BLOCKED_HOSTNAME');
      });
    }

    // DNS Rebinding & Multi-IP checks
    await st.test('blocks hostname resolving to loopback 127.0.0.1 via DNS rebinding', async () => {
      const res = await validateSafeFetchUrl('https://rebound.malicious.com/api', {
        dnsLookupFn: createMockDns(['127.0.0.1']),
      });
      assert.equal(res.isValid, false);
      assert.equal(res.code, 'BLOCKED_IP');
      assert.match(res.error, /DNS rebinding protection/i);
    });

    await st.test('blocks hostname resolving to Cloud IMDS 169.254.169.254 via DNS', async () => {
      const res = await validateSafeFetchUrl('https://imds.malicious.com/latest/meta-data', {
        dnsLookupFn: createMockDns(['169.254.169.254']),
      });
      assert.equal(res.isValid, false);
      assert.equal(res.code, 'BLOCKED_IP');
    });

    await st.test('blocks multi-IP resolution where ANY IP is private', async () => {
      const res = await validateSafeFetchUrl('https://split.malicious.com/', {
        dnsLookupFn: createMockDns(['93.184.216.34', '192.168.1.100']),
      });
      assert.equal(res.isValid, false);
      assert.equal(res.code, 'BLOCKED_IP');
    });

    await st.test('fails closed on NXDOMAIN / DNS lookup failure', async () => {
      const res = await validateSafeFetchUrl('https://nxdomain.nonexistent.com/', {
        dnsLookupFn: async () => {
          throw new Error('ENOTFOUND: getaddrinfo ENOTFOUND');
        },
      });
      assert.equal(res.isValid, false);
      assert.equal(res.code, 'DNS_RESOLUTION_FAILED');
    });

    await st.test('fails closed when DNS returns zero addresses', async () => {
      const res = await validateSafeFetchUrl('https://empty.dns.com/', {
        dnsLookupFn: async () => [],
      });
      assert.equal(res.isValid, false);
      assert.equal(res.code, 'DNS_RESOLUTION_FAILED');
    });

    // Port restrictions
    const disallowedPorts = [80, 8080, 3000, 22, 5432, 6379, 8443];
    for (const p of disallowedPorts) {
      await st.test(`rejects non-standard port :${p} by default`, async () => {
        const res = await validateSafeFetchUrl(`https://example.com:${p}/test`, {
          dnsLookupFn: createMockDns(['93.184.216.34']),
        });
        assert.equal(res.isValid, false);
        assert.equal(res.code, 'INVALID_PORT');
      });
    }

    await st.test('accepts explicit port 443', async () => {
      const res = await validateSafeFetchUrl('https://example.com:443/test', {
        dnsLookupFn: createMockDns(['93.184.216.34']),
      });
      assert.equal(res.isValid, true);
    });
  });

  // ===========================================================================
  // SUITE 3: Redirect Hop Interception & Allowlist Enforcement Invariants
  // ===========================================================================
  await t.test('Suite 3: Redirect Hop Interception & Allowlist Enforcement Invariants', async (st) => {
    const origFetch = globalThis.fetch;

    try {
      // 3.1 Redirect to HTTP scheme
      await st.test('intercepts 302 redirect attempting SSRF to HTTP scheme', async () => {
        globalThis.fetch = async (url) => {
          if (url.includes('shortlink.com')) {
            return new Response(null, {
              status: 302,
              headers: { Location: 'http://127.0.0.1/admin' },
            });
          }
          return new Response('OK', { status: 200 });
        };

        await assert.rejects(
          () => safeServerFetch('https://shortlink.com/redirect', {}, {
            dnsLookupFn: createMockDns(['93.184.216.34']),
          }),
          (err) => {
            assert(err instanceof SafeFetchValidationError);
            assert.equal(err.code, 'INVALID_SCHEME');
            return true;
          }
        );
      });

      // 3.2 Redirect to Loopback IP
      await st.test('intercepts 302 redirect attempting SSRF to loopback IP', async () => {
        globalThis.fetch = async (url) => {
          if (url.includes('shortlink.com')) {
            return new Response(null, {
              status: 302,
              headers: { Location: 'https://127.0.0.1:443/internal' },
            });
          }
          return new Response('OK', { status: 200 });
        };

        await assert.rejects(
          () => safeServerFetch('https://shortlink.com/redirect', {}, {
            dnsLookupFn: createMockDns(['93.184.216.34']),
          }),
          (err) => {
            assert(err instanceof SafeFetchValidationError);
            assert.equal(err.code, 'BLOCKED_IP');
            return true;
          }
        );
      });

      // 3.3 Redirect to Cloud IMDS
      await st.test('intercepts 302 redirect attempting SSRF to cloud metadata IP', async () => {
        globalThis.fetch = async (url) => {
          if (url.includes('shortlink.com')) {
            return new Response(null, {
              status: 302,
              headers: { Location: 'https://169.254.169.254/latest/meta-data/' },
            });
          }
          return new Response('OK', { status: 200 });
        };

        await assert.rejects(
          () => safeServerFetch('https://shortlink.com/redirect', {}, {
            dnsLookupFn: createMockDns(['93.184.216.34']),
          }),
          (err) => {
            assert(err instanceof SafeFetchValidationError);
            assert.equal(err.code, 'BLOCKED_IP');
            return true;
          }
        );
      });

      // 3.4 Redirect to RFC 1918 Private IP
      await st.test('intercepts 302 redirect attempting SSRF to RFC 1918 private IP', async () => {
        globalThis.fetch = async (url) => {
          if (url.includes('shortlink.com')) {
            return new Response(null, {
              status: 302,
              headers: { Location: 'https://192.168.1.1/router' },
            });
          }
          return new Response('OK', { status: 200 });
        };

        await assert.rejects(
          () => safeServerFetch('https://shortlink.com/redirect', {}, {
            dnsLookupFn: createMockDns(['93.184.216.34']),
          }),
          (err) => {
            assert(err instanceof SafeFetchValidationError);
            assert.equal(err.code, 'BLOCKED_IP');
            return true;
          }
        );
      });

      // 3.5 Redirect to internal hostname
      await st.test('intercepts 302 redirect attempting SSRF to internal hostname', async () => {
        globalThis.fetch = async (url) => {
          if (url.includes('shortlink.com')) {
            return new Response(null, {
              status: 302,
              headers: { Location: 'https://metadata.google.internal/meta' },
            });
          }
          return new Response('OK', { status: 200 });
        };

        await assert.rejects(
          () => safeServerFetch('https://shortlink.com/redirect', {}, {
            dnsLookupFn: createMockDns(['93.184.216.34']),
          }),
          (err) => {
            assert(err instanceof SafeFetchValidationError);
            assert.equal(err.code, 'BLOCKED_HOSTNAME');
            return true;
          }
        );
      });

      // 3.6 Redirect Loop / Max Redirects
      await st.test('intercepts redirect loop exceeding maxRedirects', async () => {
        globalThis.fetch = async () => {
          return new Response(null, {
            status: 302,
            headers: { Location: 'https://loop.com/next' },
          });
        };

        await assert.rejects(
          () => safeServerFetch('https://loop.com/start', {}, {
            maxRedirects: 2,
            dnsLookupFn: createMockDns(['93.184.216.34']),
          }),
          (err) => {
            assert(err instanceof SafeFetchValidationError);
            assert.equal(err.code, 'MAX_REDIRECTS_EXCEEDED');
            return true;
          }
        );
      });

      // 3.7 Unauthorized domain redirect
      await st.test('intercepts redirect to unauthorized domain when restricted', async () => {
        globalThis.fetch = async (url) => {
          if (url === 'https://example.com/start') {
            return new Response(null, {
              status: 302,
              headers: { Location: 'https://unauthorized-attacker.com/poi' },
            });
          }
          return new Response('FAIL', { status: 200 });
        };

        await assert.rejects(
          () => safeServerFetch('https://example.com/start', {}, {
            allowedRedirectDomains: ['example.com'],
            dnsLookupFn: createMockDns(['93.184.216.34']),
          }),
          (err) => {
            assert(err instanceof SafeFetchValidationError);
            assert.equal(err.code, 'DISALLOWED_DOMAIN');
            return true;
          }
        );
      });

      // 3.8 Safe redirect within allowlist
      await st.test('allows safe redirect within authorized allowlist', async () => {
        globalThis.fetch = async (url) => {
          if (url === 'https://goo.gl/maps/123') {
            return new Response(null, {
              status: 302,
              headers: { Location: 'https://maps.google.com/maps/place/TriTon' },
            });
          }
          return new Response('SAFE_GOOGLE_PAYLOAD', { status: 200 });
        };

        const res = await safeServerFetch('https://goo.gl/maps/123', {}, {
          allowedRedirectDomains: GOOGLE_MAPS_ALLOWED_DOMAINS,
          dnsLookupFn: createMockDns(['172.217.16.206']),
        });
        assert.equal(res.status, 200);
        const text = await res.text();
        assert.equal(text, 'SAFE_GOOGLE_PAYLOAD');
      });

      // 3.9 Response body size limit
      await st.test('rejects oversized response exceeding maxBodySizeBytes', async () => {
        globalThis.fetch = async () => {
          return new Response('OVERSIZED', {
            status: 200,
            headers: { 'content-length': '20971520' }, // 20MB
          });
        };

        await assert.rejects(
          () => safeServerFetch('https://example.com/huge', {}, {
            maxBodySizeBytes: 10 * 1024 * 1024,
            dnsLookupFn: createMockDns(['93.184.216.34']),
          }),
          (err) => {
            assert(err instanceof SafeFetchValidationError);
            assert.equal(err.code, 'RESPONSE_TOO_LARGE');
            return true;
          }
        );
      });
    } finally {
      globalThis.fetch = origFetch;
    }
  });

  // ===========================================================================
  // SUITE 4: Route-Level SSRF Negative Verification (scrape-images & gmaps-scraper)
  // ===========================================================================
  await t.test('Suite 4: End-to-End Route Mutation SSRF Defense & Zero Private Egress Invariant', async (st) => {
    // 1. Setup Mock Supabase DB Server
    const validToken = randomBytes(32).toString('base64url');
    const validHash = createHash('sha256').update(validToken).digest('hex');

    const adminAccount = {
      id: 99,
      email: 'ssrf_guard@triton.gov.vn',
      full_name: 'Security Lead Auditor',
      role: 'ADMIN',
      is_active: true,
      session_hash: validHash,
      session_created_at: new Date(Date.now() - 60_000).toISOString(),
      session_expires_at: new Date(Date.now() + 60_000).toISOString(),
    };

    const privateEgressAttempts = [];

    const dbServer = http.createServer(async (req, res) => {
      const url = new URL(req.url, 'http://127.0.0.1');
      res.setHeader('content-type', 'application/json');

      if (url.pathname === '/rest/v1/admin_users') {
        if (url.searchParams.get('session_hash') === `eq.${adminAccount.session_hash}`) {
          res.end(JSON.stringify(adminAccount));
        } else {
          res.end('null');
        }
      } else if (url.pathname === '/rest/v1/places') {
        res.end(JSON.stringify([]));
      } else if (url.pathname === '/rest/v1/audit_logs') {
        res.statusCode = 201;
        res.end('{}');
      } else {
        res.statusCode = 404;
        res.end('{}');
      }
    });

    await new Promise((resolve) => dbServer.listen(0, '127.0.0.1', resolve));
    const dbPort = dbServer.address().port;

    const envNames = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY',
      'NODE_ENV',
      'ADMIN_LOCAL_HTTP',
      'ADMIN_MUTATIONS_ENABLED',
    ];
    const oldEnv = Object.fromEntries(envNames.map((name) => [name, process.env[name]]));

    Object.assign(process.env, {
      NEXT_PUBLIC_SUPABASE_URL: `http://127.0.0.1:${dbPort}`,
      SUPABASE_SERVICE_ROLE_KEY: 'test-ssrf-service-key',
      NODE_ENV: 'production',
      ADMIN_LOCAL_HTTP: 'false',
      ADMIN_MUTATIONS_ENABLED: 'true',
    });

    const origFetch = globalThis.fetch;

    // Spy on global fetch to catch any potential egress to forbidden destinations
    globalThis.fetch = async (input, init) => {
      const targetStr = typeof input === 'string' ? input : input?.url || '';
      try {
        const parsed = new URL(targetStr);
        // Exclude the mock DB server on localhost:dbPort
        if (parsed.port === String(dbPort)) {
          return origFetch(input, init);
        }
        // If an SSRF attack leaks to a private/loopback/metadata IP, record it!
        if (isDisallowedIp(parsed.hostname) || isDisallowedHostname(parsed.hostname)) {
          privateEgressAttempts.push(targetStr);
        }
      } catch { /* ignore non-url */ }
      return origFetch(input, init);
    };

    try {
      const scrapeImagesModule = loadRouteModule('scrape-images/route.ts');
      const gmapsScraperModule = loadRouteModule('gmaps-scraper/route.ts');

      const adminCookie = `__Host-triton_admin_session=${validToken}`;

      const makeReq = (pathUrl, bodyObj) => {
        return new NextRequest(`http://localhost${pathUrl}`, {
          method: 'POST',
          headers: {
            cookie: adminCookie,
            'content-type': 'application/json',
          },
          body: JSON.stringify(bodyObj),
        });
      };

      // ───────────────────────────────────────────────────────────────────────
      // 4.1 Route: scrape-images SSRF Attack Vectors
      // ───────────────────────────────────────────────────────────────────────
      const scrapeImagesAttackPayloads = [
        // Scheme attacks
        { body: { url: 'http://127.0.0.1:8080/secret' }, expectedCode: 'INVALID_SCHEME', desc: 'http: via url' },
        { body: { query: 'http://127.0.0.1:8080/secret' }, expectedCode: 'INVALID_SCHEME', desc: 'http: via query' },
        { body: { url: 'file:///etc/passwd' }, expectedCode: 'INVALID_SCHEME', desc: 'file: via url' },
        { body: { query: 'file:///etc/shadow' }, expectedCode: 'INVALID_SCHEME', desc: 'file: via query' },
        { body: { url: 'data:text/html,<h1>XSS</h1>' }, expectedCode: 'INVALID_SCHEME', desc: 'data: via url' },
        { body: { url: 'gopher://127.0.0.1:70/' }, expectedCode: 'INVALID_SCHEME', desc: 'gopher: via url' },
        { body: { url: 'ftp://ftp.example.com/file' }, expectedCode: 'INVALID_SCHEME', desc: 'ftp: via url' },
        { body: { url: 'javascript:alert(1)' }, expectedCode: 'INVALID_SCHEME', desc: 'javascript: via url' },
        { body: { url: '//169.254.169.254/latest/meta-data' }, expectedCode: 'INVALID_SCHEME', desc: '// via url' },

        // Private IP attacks
        { body: { url: 'https://127.0.0.1/admin' }, expectedCode: 'BLOCKED_IP', desc: 'loopback 127.0.0.1 via url' },
        { body: { query: 'https://127.0.0.1/admin' }, expectedCode: 'BLOCKED_IP', desc: 'loopback 127.0.0.1 via query' },
        { body: { url: 'https://169.254.169.254/latest/meta-data' }, expectedCode: 'BLOCKED_IP', desc: 'IMDS 169.254.169.254 via url' },
        { body: { url: 'https://192.168.1.1/setup' }, expectedCode: 'BLOCKED_IP', desc: 'RFC 1918 192.168.1.1 via url' },
        { body: { url: 'https://10.0.0.1/secret' }, expectedCode: 'BLOCKED_IP', desc: 'RFC 1918 10.0.0.1 via url' },
        { body: { url: 'https://172.16.0.1/internal' }, expectedCode: 'BLOCKED_IP', desc: 'RFC 1918 172.16.0.1 via url' },
        { body: { url: 'https://[::1]/secret' }, expectedCode: 'BLOCKED_IP', desc: 'IPv6 loopback [::1] via url' },
        { body: { url: 'https://[fe80::1]/link' }, expectedCode: 'BLOCKED_IP', desc: 'IPv6 link-local [fe80::1] via url' },

        // Hostname attacks
        { body: { url: 'https://localhost/admin' }, expectedCode: 'BLOCKED_HOSTNAME', desc: 'localhost hostname via url' },
        { body: { query: 'https://localhost/admin' }, expectedCode: 'BLOCKED_HOSTNAME', desc: 'localhost hostname via query' },
        { body: { url: 'https://metadata.google.internal/meta' }, expectedCode: 'BLOCKED_HOSTNAME', desc: 'metadata.google.internal via url' },
        { body: { url: 'https://instance-data/latest' }, expectedCode: 'BLOCKED_HOSTNAME', desc: 'instance-data via url' },
        { body: { url: '127.0.0.1/admin' }, expectedCode: 'BLOCKED_IP', desc: 'unprefixed 127.0.0.1 via url' },
        { body: { url: 'localhost/admin' }, expectedCode: 'BLOCKED_HOSTNAME', desc: 'unprefixed localhost via url' },
      ];

      for (const item of scrapeImagesAttackPayloads) {
        await st.test(`scrape-images blocks ${item.desc} with HTTP 400 (${item.expectedCode})`, async () => {
          const res = await scrapeImagesModule.POST(makeReq('/api/v1/admin/scrape-images', item.body));
          assert.equal(res.status, 400, `Must return HTTP 400 for ${item.desc}`);
          const json = await res.json();
          assert.equal(json.code, item.expectedCode, `Must have error code ${item.expectedCode} for ${item.desc}`);
        });
      }

      // ───────────────────────────────────────────────────────────────────────
      // 4.2 Route: gmaps-scraper SSRF Attack Vectors
      // ───────────────────────────────────────────────────────────────────────
      const gmapsScraperAttackPayloads = [
        // Scheme attacks
        { body: { query: 'http://127.0.0.1/maps' }, expectedCode: 'INVALID_SCHEME', desc: 'http: via query' },
        { body: { query: 'file:///etc/passwd' }, expectedCode: 'INVALID_SCHEME', desc: 'file: via query' },
        { body: { query: 'data:text/html,<h1>test</h1>' }, expectedCode: 'INVALID_SCHEME', desc: 'data: via query' },
        { body: { query: 'gopher://127.0.0.1:70/' }, expectedCode: 'INVALID_SCHEME', desc: 'gopher: via query' },
        { body: { query: 'ftp://ftp.example.com/poi' }, expectedCode: 'INVALID_SCHEME', desc: 'ftp: via query' },
        { body: { query: 'javascript:alert(1)' }, expectedCode: 'INVALID_SCHEME', desc: 'javascript: via query' },
        { body: { query: '//169.254.169.254/maps' }, expectedCode: 'INVALID_SCHEME', desc: '// via query' },

        // Private IP attacks
        { body: { query: 'https://127.0.0.1/maps' }, expectedCode: 'BLOCKED_IP', desc: 'loopback 127.0.0.1' },
        { body: { query: 'https://169.254.169.254/latest/meta-data' }, expectedCode: 'BLOCKED_IP', desc: 'IMDS 169.254.169.254' },
        { body: { query: 'https://192.168.1.1/maps' }, expectedCode: 'BLOCKED_IP', desc: 'RFC 1918 192.168.1.1' },
        { body: { query: 'https://10.0.0.1/maps' }, expectedCode: 'BLOCKED_IP', desc: 'RFC 1918 10.0.0.1' },
        { body: { query: 'https://172.16.0.1/maps' }, expectedCode: 'BLOCKED_IP', desc: 'RFC 1918 172.16.0.1' },
        { body: { query: 'https://[::1]/maps' }, expectedCode: 'BLOCKED_IP', desc: 'IPv6 loopback [::1]' },

        // Hostname attacks
        { body: { query: 'https://localhost/maps' }, expectedCode: 'BLOCKED_HOSTNAME', desc: 'localhost hostname' },
        { body: { query: 'https://metadata.google.internal/meta' }, expectedCode: 'BLOCKED_HOSTNAME', desc: 'metadata.google.internal' },
        { body: { query: 'https://instance-data/meta' }, expectedCode: 'BLOCKED_HOSTNAME', desc: 'instance-data' },
        { body: { query: '127.0.0.1/maps' }, expectedCode: 'BLOCKED_IP', desc: 'unprefixed 127.0.0.1' },
        { body: { query: 'localhost' }, expectedCode: 'BLOCKED_HOSTNAME', desc: 'unprefixed localhost' },

        // Domain Profile Enforcement (GOOGLE_MAPS Profile strictly restricts domains)
        { body: { query: 'https://attacker-domain.com/poi' }, expectedCode: 'DISALLOWED_DOMAIN', desc: 'arbitrary domain attacker-domain.com' },
        { body: { query: 'https://evil-spoof-maps.org/place' }, expectedCode: 'DISALLOWED_DOMAIN', desc: 'spoofed maps domain evil-spoof-maps.org' },
        { body: { query: 'https://vnexpress.net/du-lich' }, expectedCode: 'DISALLOWED_DOMAIN', desc: 'unauthorized news domain vnexpress.net' },
      ];

      for (const item of gmapsScraperAttackPayloads) {
        await st.test(`gmaps-scraper blocks ${item.desc} with HTTP 400 (${item.expectedCode})`, async () => {
          const res = await gmapsScraperModule.POST(makeReq('/api/v1/admin/gmaps-scraper', item.body));
          assert.equal(res.status, 400, `Must return HTTP 400 for ${item.desc}`);
          const json = await res.json();
          assert.equal(json.code, item.expectedCode, `Must have error code ${item.expectedCode} for ${item.desc}`);
        });
      }

      // ───────────────────────────────────────────────────────────────────────
      // 4.3 Zero Private Egress Invariant Proof
      // ───────────────────────────────────────────────────────────────────────
      await st.test('Zero Private Egress Invariant: ZERO outbound requests ever reached private/metadata destinations', () => {
        assert.equal(
          privateEgressAttempts.length,
          0,
          `Invariant Violated: ${privateEgressAttempts.length} requests reached private destinations: ${JSON.stringify(privateEgressAttempts)}`
        );
      });
    } finally {
      globalThis.fetch = origFetch;
      Object.assign(process.env, oldEnv);
      await new Promise((resolve) => dbServer.close(resolve));
    }
  });
});
