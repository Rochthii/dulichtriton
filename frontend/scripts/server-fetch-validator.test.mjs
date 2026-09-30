import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import https from 'node:https';

test('P01-020: Server Fetch URL Validation & Anti-SSRF Contract Suite', async (t) => {
  const {
    validateSafeFetchUrl,
    assertSafeFetchUrl,
    safeServerFetch,
    SafeFetchValidationError,
    isDisallowedIPv4,
    isDisallowedIPv6,
    isDisallowedIp,
    isDisallowedHostname,
  } = await import('../src/lib/serverFetchValidator.ts');

  // Helper mock DNS lookup returning specific IPs
  const createMockDns = (ips) => async () => ips;

  // ───────────────────────────────────────────────────────────────────────────
  // 1. Scheme Validation
  // ───────────────────────────────────────────────────────────────────────────
  await t.test('1. Scheme validation: HTTPS-only invariant', async (st) => {
    await st.test('accepts valid HTTPS scheme', async () => {
      const res = await validateSafeFetchUrl('https://example.com/test', {
        dnsLookupFn: createMockDns(['93.184.216.34']),
      });
      assert.equal(res.isValid, true);
      assert.equal(res.url.protocol, 'https:');
    });

    await st.test('accepts uppercase HTTPS scheme', async () => {
      const res = await validateSafeFetchUrl('HTTPS://example.com/test', {
        dnsLookupFn: createMockDns(['93.184.216.34']),
      });
      assert.equal(res.isValid, true);
      assert.equal(res.url.protocol, 'https:');
    });

    const disallowedSchemes = [
      { url: 'http://example.com', name: 'http:' },
      { url: 'file:///etc/passwd', name: 'file:' },
      { url: 'data:text/html,<h1>Hello</h1>', name: 'data:' },
      { url: 'gopher://127.0.0.1:70/1', name: 'gopher:' },
      { url: 'ftp://ftp.example.com/file', name: 'ftp:' },
      { url: 'javascript:alert(1)', name: 'javascript:' },
      { url: 'blob:https://example.com/uuid', name: 'blob:' },
    ];

    for (const { url, name } of disallowedSchemes) {
      await st.test(`strictly rejects ${name}`, async () => {
        const res = await validateSafeFetchUrl(url);
        assert.equal(res.isValid, false);
        assert.equal(res.code, 'INVALID_SCHEME');
      });
    }

    await st.test('rejects malformed URLs', async () => {
      const res = await validateSafeFetchUrl('not a url at all');
      assert.equal(res.isValid, false);
      assert.equal(res.code, 'INVALID_URL');
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 2. IPv4 Blacklist Validation (Direct IP Literals)
  // ───────────────────────────────────────────────────────────────────────────
  await t.test('2. IPv4 CIDR blacklist enforcement', async (st) => {
    const blockedIpv4Targets = [
      { ip: '127.0.0.1', desc: 'Loopback 127.0.0.1' },
      { ip: '127.0.1.1', desc: 'Loopback 127.0.1.1' },
      { ip: '127.255.255.254', desc: 'Loopback range end' },
      { ip: '10.0.0.1', desc: 'RFC 1918 10.0.0.0/8' },
      { ip: '10.255.255.254', desc: 'RFC 1918 10.x.x.x' },
      { ip: '172.16.0.1', desc: 'RFC 1918 172.16.0.0/12 start' },
      { ip: '172.31.255.254', desc: 'RFC 1918 172.16.0.0/12 end' },
      { ip: '192.168.0.1', desc: 'RFC 1918 192.168.0.0/16' },
      { ip: '192.168.1.254', desc: 'RFC 1918 192.168.1.x' },
      { ip: '169.254.169.254', desc: 'Cloud IMDS / Link-Local' },
      { ip: '169.254.1.1', desc: 'Link-Local 169.254.0.0/16' },
      { ip: '0.0.0.0', desc: 'Current network 0.0.0.0/8' },
      { ip: '100.64.0.1', desc: 'Carrier-Grade NAT 100.64.0.0/10' },
      { ip: '100.127.255.254', desc: 'Carrier-Grade NAT range end' },
      { ip: '192.0.2.1', desc: 'TEST-NET-1 (RFC 5737)' },
      { ip: '198.51.100.1', desc: 'TEST-NET-2 (RFC 5737)' },
      { ip: '203.0.113.1', desc: 'TEST-NET-3 (RFC 5737)' },
      { ip: '224.0.0.1', desc: 'Multicast 224.0.0.0/4' },
      { ip: '240.0.0.1', desc: 'Reserved 240.0.0.0/4' },
      { ip: '255.255.255.255', desc: 'Limited Broadcast' },
    ];

    for (const { ip, desc } of blockedIpv4Targets) {
      await st.test(`blocks IPv4 ${desc} (${ip})`, async () => {
        assert.equal(isDisallowedIPv4(ip), true, `isDisallowedIPv4(${ip}) should be true`);
        const res = await validateSafeFetchUrl(`https://${ip}/meta`);
        assert.equal(res.isValid, false);
        assert.equal(res.code, 'BLOCKED_IP');
      });
    }

    await st.test('allows legitimate public IPv4 addresses', () => {
      const publicIps = ['1.1.1.1', '8.8.8.8', '93.184.216.34', '172.32.0.1', '100.128.0.1'];
      for (const ip of publicIps) {
        assert.equal(isDisallowedIPv4(ip), false, `${ip} should not be blocked`);
      }
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 3. IPv6 Blacklist Validation
  // ───────────────────────────────────────────────────────────────────────────
  await t.test('3. IPv6 CIDR blacklist enforcement', async (st) => {
    const blockedIpv6Targets = [
      { ip: '::1', desc: 'Loopback ::1' },
      { ip: '::', desc: 'Unspecified ::' },
      { ip: 'fe80::1', desc: 'Link-Local fe80::/10' },
      { ip: 'fe80::215:5dff:fe00:1', desc: 'Link-Local SLAAC' },
      { ip: 'fc00::1', desc: 'Unique Local Address fc00::/7' },
      { ip: 'fd12:3456:789a::1', desc: 'Unique Local Address ULA fd...' },
      { ip: 'ff02::1', desc: 'Multicast ff00::/8' },
      { ip: '2001:db8::1', desc: 'Documentation 2001:db8::/32' },
      { ip: '::ffff:127.0.0.1', desc: 'IPv4-mapped IPv6 loopback' },
      { ip: '::ffff:169.254.169.254', desc: 'IPv4-mapped IPv6 cloud metadata' },
      { ip: '::ffff:192.168.1.1', desc: 'IPv4-mapped IPv6 RFC 1918' },
      { ip: '::ffff:10.0.0.1', desc: 'IPv4-mapped IPv6 RFC 1918 10.x' },
    ];

    for (const { ip, desc } of blockedIpv6Targets) {
      await st.test(`blocks IPv6 ${desc} (${ip})`, async () => {
        assert.equal(isDisallowedIPv6(ip), true, `isDisallowedIPv6(${ip}) should be true`);
        const res = await validateSafeFetchUrl(`https://[${ip}]/test`);
        assert.equal(res.isValid, false);
        assert.equal(res.code, 'BLOCKED_IP');
      });
    }

    await st.test('allows legitimate public IPv6 addresses', () => {
      const publicIpv6 = ['2606:4700:4700::1111', '2001:4860:4860::8888'];
      for (const ip of publicIpv6) {
        assert.equal(isDisallowedIPv6(ip), false, `${ip} should not be blocked`);
      }
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 4. Hostname Blacklist Validation
  // ───────────────────────────────────────────────────────────────────────────
  await t.test('4. Hostname blacklist and dotless domain checks', async (st) => {
    const blockedHostnames = [
      'localhost',
      'foo.localhost',
      'app.local',
      'db.internal',
      'router.lan',
      'metadata.google.internal',
      'metadata.goog',
      'instance-data',
      'admin', // dotless
      'intranet', // dotless
    ];

    for (const host of blockedHostnames) {
      await st.test(`blocks hostname "${host}"`, async () => {
        assert.equal(isDisallowedHostname(host), true, `isDisallowedHostname(${host}) should be true`);
        const res = await validateSafeFetchUrl(`https://${host}/test`);
        assert.equal(res.isValid, false);
        assert.equal(res.code, 'BLOCKED_HOSTNAME');
      });
    }
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 5. Port Policy Validation
  // ───────────────────────────────────────────────────────────────────────────
  await t.test('5. Port policy enforcement', async (st) => {
    await st.test('accepts default port (implicit 443)', async () => {
      const res = await validateSafeFetchUrl('https://example.com/test', {
        dnsLookupFn: createMockDns(['93.184.216.34']),
      });
      assert.equal(res.isValid, true);
    });

    await st.test('accepts explicit port 443', async () => {
      const res = await validateSafeFetchUrl('https://example.com:443/test', {
        dnsLookupFn: createMockDns(['93.184.216.34']),
      });
      assert.equal(res.isValid, true);
    });

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

    await st.test('accepts custom port when explicitly permitted in allowedPorts', async () => {
      const res = await validateSafeFetchUrl('https://example.com:8443/test', {
        allowedPorts: [443, 8443],
        dnsLookupFn: createMockDns(['93.184.216.34']),
      });
      assert.equal(res.isValid, true);
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 6. DNS Pre-Resolution & Anti-DNS Rebinding
  // ───────────────────────────────────────────────────────────────────────────
  await t.test('6. DNS resolution & anti-DNS rebinding', async (st) => {
    await st.test('rejects hostname resolving to loopback IP', async () => {
      const res = await validateSafeFetchUrl('https://rebound.attacker.com/data', {
        dnsLookupFn: createMockDns(['127.0.0.1']),
      });
      assert.equal(res.isValid, false);
      assert.equal(res.code, 'BLOCKED_IP');
      assert.match(res.error, /DNS rebinding protection/i);
    });

    await st.test('rejects hostname resolving to metadata IP (169.254.169.254)', async () => {
      const res = await validateSafeFetchUrl('https://cloud-meta.attacker.com/secret', {
        dnsLookupFn: createMockDns(['169.254.169.254']),
      });
      assert.equal(res.isValid, false);
      assert.equal(res.code, 'BLOCKED_IP');
    });

    await st.test('rejects hostname resolving to private RFC 1918 IP (192.168.1.5)', async () => {
      const res = await validateSafeFetchUrl('https://local-scan.attacker.com/status', {
        dnsLookupFn: createMockDns(['192.168.1.5']),
      });
      assert.equal(res.isValid, false);
      assert.equal(res.code, 'BLOCKED_IP');
    });

    await st.test('rejects hostname resolving to multiple IPs when ANY is private', async () => {
      const res = await validateSafeFetchUrl('https://split.attacker.com/', {
        dnsLookupFn: createMockDns(['93.184.216.34', '10.0.0.1']),
      });
      assert.equal(res.isValid, false);
      assert.equal(res.code, 'BLOCKED_IP');
    });

    await st.test('fails closed when DNS lookup fails / throws (NXDOMAIN)', async () => {
      const res = await validateSafeFetchUrl('https://nonexistent-domain-xyz-12345.com/', {
        dnsLookupFn: async () => {
          throw new Error('ENOTFOUND: getaddrinfo ENOTFOUND');
        },
      });
      assert.equal(res.isValid, false);
      assert.equal(res.code, 'DNS_RESOLUTION_FAILED');
    });

    await st.test('fails closed when DNS lookup returns 0 addresses', async () => {
      const res = await validateSafeFetchUrl('https://empty.attacker.com/', {
        dnsLookupFn: async () => [],
      });
      assert.equal(res.isValid, false);
      assert.equal(res.code, 'DNS_RESOLUTION_FAILED');
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 7. Domain Validation Profiles & Allowlists
  // ───────────────────────────────────────────────────────────────────────────
  await t.test('7. Domain validation profiles & allowlists', async (st) => {
    // 7.1 GOOGLE_MAPS Profile
    await st.test('GOOGLE_MAPS profile allows google domains', async () => {
      const allowedGoogleUrls = [
        'https://maps.google.com/maps/place/Tri+Ton',
        'https://www.google.com/maps/search/Chua+Hang+Cong',
        'https://lh3.googleusercontent.com/p/AF1QipMxyz',
        'https://goo.gl/maps/12345',
        'https://maps.app.goo.gl/abcdef',
      ];
      for (const u of allowedGoogleUrls) {
        const res = await validateSafeFetchUrl(u, {
          profile: 'GOOGLE_MAPS',
          dnsLookupFn: createMockDns(['172.217.16.206']), // Google public IP
        });
        assert.equal(res.isValid, true, `Should allow ${u}`);
      }
    });

    await st.test('GOOGLE_MAPS profile rejects non-google domains', async () => {
      const res = await validateSafeFetchUrl('https://evil-spoof-maps.com/poi', {
        profile: 'GOOGLE_MAPS',
        dnsLookupFn: createMockDns(['93.184.216.34']),
      });
      assert.equal(res.isValid, false);
      assert.equal(res.code, 'DISALLOWED_DOMAIN');
    });

    // 7.2 STRICT Profile
    await st.test('STRICT profile allows only explicit allowedDomains', async () => {
      const options = {
        profile: 'STRICT',
        allowedDomains: ['tri-ton.gov.vn', 'images.unsplash.com'],
        dnsLookupFn: createMockDns(['93.184.216.34']),
      };

      const resAllowed1 = await validateSafeFetchUrl('https://tri-ton.gov.vn/du-lich', options);
      assert.equal(resAllowed1.isValid, true);

      const resAllowed2 = await validateSafeFetchUrl('https://images.unsplash.com/photo-123', options);
      assert.equal(resAllowed2.isValid, true);

      const resDenied = await validateSafeFetchUrl('https://other-domain.vn/page', options);
      assert.equal(resDenied.isValid, false);
      assert.equal(resDenied.code, 'DISALLOWED_DOMAIN');
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 8. assertSafeFetchUrl Exception Throwing
  // ───────────────────────────────────────────────────────────────────────────
  await t.test('8. assertSafeFetchUrl throws SafeFetchValidationError', async () => {
    await assert.rejects(
      () => assertSafeFetchUrl('http://insecure.com'),
      (err) => {
        assert(err instanceof SafeFetchValidationError);
        assert.equal(err.code, 'INVALID_SCHEME');
        return true;
      }
    );

    await assert.rejects(
      () => assertSafeFetchUrl('https://127.0.0.1/admin'),
      (err) => {
        assert(err instanceof SafeFetchValidationError);
        assert.equal(err.code, 'BLOCKED_IP');
        return true;
      }
    );

    const validUrl = await assertSafeFetchUrl('https://example.com/safe', {
      dnsLookupFn: createMockDns(['93.184.216.34']),
    });
    assert(validUrl instanceof URL);
    assert.equal(validUrl.hostname, 'example.com');
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 9. safeServerFetch Runtime Integration (Redirects & Size Limit)
  // ───────────────────────────────────────────────────────────────────────────
  await t.test('9. safeServerFetch runtime behavior (Redirect & DoS defense)', async (st) => {
    await st.test('safeServerFetch rejects initial SSRF target before network call', async () => {
      await assert.rejects(
        () => safeServerFetch('http://127.0.0.1:8080/secret'),
        (err) => {
          assert(err instanceof SafeFetchValidationError);
          assert.equal(err.code, 'INVALID_SCHEME');
          return true;
        }
      );

      await assert.rejects(
        () => safeServerFetch('https://169.254.169.254/latest/meta-data/'),
        (err) => {
          assert(err instanceof SafeFetchValidationError);
          assert.equal(err.code, 'BLOCKED_IP');
          return true;
        }
      );
    });

    await st.test('intercepts redirect attempting SSRF to HTTP scheme', async () => {
      const origFetch = globalThis.fetch;
      try {
        globalThis.fetch = async (url) => {
          if (url.includes('short.link')) {
            return new Response(null, {
              status: 302,
              headers: { Location: 'http://127.0.0.1/admin' },
            });
          }
          return new Response('OK', { status: 200 });
        };

        await assert.rejects(
          () => safeServerFetch('https://short.link/test', {}, {
            dnsLookupFn: createMockDns(['93.184.216.34']),
          }),
          (err) => {
            assert(err instanceof SafeFetchValidationError);
            assert.equal(err.code, 'INVALID_SCHEME');
            return true;
          }
        );
      } finally {
        globalThis.fetch = origFetch;
      }
    });

    await st.test('intercepts redirect attempting SSRF to cloud metadata IP', async () => {
      const origFetch = globalThis.fetch;
      try {
        globalThis.fetch = async (url) => {
          if (url.includes('short.link')) {
            return new Response(null, {
              status: 302,
              headers: { Location: 'https://169.254.169.254/latest/meta-data' },
            });
          }
          return new Response('OK', { status: 200 });
        };

        await assert.rejects(
          () => safeServerFetch('https://short.link/test', {}, {
            dnsLookupFn: createMockDns(['93.184.216.34']),
          }),
          (err) => {
            assert(err instanceof SafeFetchValidationError);
            assert.equal(err.code, 'BLOCKED_IP');
            return true;
          }
        );
      } finally {
        globalThis.fetch = origFetch;
      }
    });

    await st.test('intercepts redirect loop exceeding maxRedirects', async () => {
      const origFetch = globalThis.fetch;
      try {
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
      } finally {
        globalThis.fetch = origFetch;
      }
    });

    await st.test('follows safe redirect to valid destination successfully', async () => {
      const origFetch = globalThis.fetch;
      try {
        globalThis.fetch = async (url) => {
          if (url === 'https://short.link/safe') {
            return new Response(null, {
              status: 302,
              headers: { Location: 'https://final.destination.com/target' },
            });
          }
          return new Response('SUCCESS_PAYLOAD', { status: 200 });
        };

        const res = await safeServerFetch('https://short.link/safe', {}, {
          dnsLookupFn: createMockDns(['93.184.216.34']),
        });
        assert.equal(res.status, 200);
        const text = await res.text();
        assert.equal(text, 'SUCCESS_PAYLOAD');
      } finally {
        globalThis.fetch = origFetch;
      }
    });

    await st.test('intercepts redirect to unauthorized domain when allowedRedirectDomains is enforced', async () => {
      const origFetch = globalThis.fetch;
      try {
        globalThis.fetch = async (url) => {
          if (url === 'https://example.com/start') {
            return new Response(null, {
              status: 302,
              headers: { Location: 'https://unauthorized-destination.com/target' },
            });
          }
          return new Response('SHOULD_NOT_REACH', { status: 200 });
        };

        await assert.rejects(
          () => safeServerFetch('https://example.com/start', {}, {
            allowedRedirectDomains: ['example.com'],
            dnsLookupFn: createMockDns(['93.184.216.34']),
          }),
          (err) => {
            assert(err instanceof SafeFetchValidationError);
            assert.equal(err.code, 'DISALLOWED_DOMAIN');
            assert.match(err.message, /unauthorized domain/i);
            return true;
          }
        );
      } finally {
        globalThis.fetch = origFetch;
      }
    });

    await st.test('allows redirect when destination matches allowedRedirectDomains', async () => {
      const origFetch = globalThis.fetch;
      try {
        globalThis.fetch = async (url) => {
          if (url === 'https://short.link/to-google') {
            return new Response(null, {
              status: 302,
              headers: { Location: 'https://maps.google.com/place/TriTon' },
            });
          }
          return new Response('GOOGLE_MAPS_PAYLOAD', { status: 200 });
        };

        const res = await safeServerFetch('https://short.link/to-google', {}, {
          allowedRedirectDomains: ['google.com'],
          dnsLookupFn: createMockDns(['172.217.16.206']),
        });
        assert.equal(res.status, 200);
        const text = await res.text();
        assert.equal(text, 'GOOGLE_MAPS_PAYLOAD');
      } finally {
        globalThis.fetch = origFetch;
      }
    });

    await st.test('rejects response exceeding maxBodySizeBytes', async () => {
      const origFetch = globalThis.fetch;
      try {
        globalThis.fetch = async () => {
          return new Response('HUGE_BODY', {
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
      } finally {
        globalThis.fetch = origFetch;
      }
    });
  });
});
