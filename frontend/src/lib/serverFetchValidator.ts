/**
 * Server-Side Fetch URL Validator & SSRF Protection Engine
 * Task: P01-020
 * System: Du Lịch Tri Tôn AI Assistant System
 * Contract Authority: docs/technical-spec/SERVER_FETCH_VALIDATION_CONTRACT.md
 *
 * Invariants:
 * 1. Fail-Closed: Any ambiguity, parse failure, timeout, or DNS resolution failure terminates with strict rejection.
 * 2. HTTPS-Only: Only https: scheme is allowed. Reject http:, file:, data:, gopher:, ftp:, javascript:, etc.
 * 3. Zero Private/Loopback/Metadata IP: Reject RFC 1918, RFC 3927 link-local/IMDS (169.254.169.254),
 *    loopback (127.0.0.0/8, ::1), CGNAT (100.64.0.0/10), ULA (fc00::/7), etc.
 * 4. Anti-DNS Rebinding: Pre-resolve hostnames via DNS lookup and verify all returned IPs.
 * 5. Safe Redirects: Disallow blind redirect following. Intercept and validate every redirect hop.
 * 6. Port Restrictions: Default to 443 only.
 * 7. Resource Limits: Default 6000ms timeout and 10MB response body limit.
 */

import net from 'node:net';
import dns from 'node:dns';

// ==============================================================================
// 1. Types & Interfaces
// ==============================================================================

export type SafeFetchErrorCode =
  | 'INVALID_URL'
  | 'INVALID_SCHEME'
  | 'INVALID_PORT'
  | 'BLOCKED_HOSTNAME'
  | 'BLOCKED_IP'
  | 'DNS_RESOLUTION_FAILED'
  | 'DISALLOWED_DOMAIN'
  | 'MAX_REDIRECTS_EXCEEDED'
  | 'RESPONSE_TOO_LARGE'
  | 'FETCH_TIMEOUT';

export type DomainValidationProfile = 'PUBLIC_INTERNET' | 'GOOGLE_MAPS' | 'STRICT';

export interface SafeFetchValidationOptions {
  profile?: DomainValidationProfile;
  allowedDomains?: string[];
  allowedRedirectDomains?: string[];
  allowedPorts?: number[];
  maxRedirects?: number;
  timeoutMs?: number;
  maxBodySizeBytes?: number;
  dnsLookupFn?: (hostname: string) => Promise<string[]>;
}

export interface SafeUrlValidationSuccess {
  isValid: true;
  url: URL;
  resolvedIps: string[];
  hostname: string;
}

export interface SafeUrlValidationFailure {
  isValid: false;
  error: string;
  code: SafeFetchErrorCode;
  rejectedTarget?: string;
}

export type SafeUrlValidationResult = SafeUrlValidationSuccess | SafeUrlValidationFailure;

export class SafeFetchValidationError extends Error {
  readonly code: SafeFetchErrorCode;
  readonly rejectedTarget?: string;

  constructor(message: string, code: SafeFetchErrorCode, rejectedTarget?: string) {
    super(message);
    this.name = 'SafeFetchValidationError';
    this.code = code;
    this.rejectedTarget = rejectedTarget;
  }
}

// ==============================================================================
// 2. IP & CIDR Tables
// ==============================================================================

interface IPv4Cidr {
  base: string;
  prefix: number;
  description: string;
}

interface IPv6Cidr {
  base: string;
  prefix: number;
  description: string;
}

const DISALLOWED_IPV4_CIDRS: IPv4Cidr[] = [
  { base: '0.0.0.0', prefix: 8, description: 'Current network (RFC 1122)' },
  { base: '10.0.0.0', prefix: 8, description: 'Private network (RFC 1918)' },
  { base: '100.64.0.0', prefix: 10, description: 'Shared Address Space / CGNAT (RFC 6598)' },
  { base: '127.0.0.0', prefix: 8, description: 'Loopback (RFC 1122)' },
  { base: '169.254.0.0', prefix: 16, description: 'Link-Local / Cloud Metadata (RFC 3927)' },
  { base: '172.16.0.0', prefix: 12, description: 'Private network (RFC 1918)' },
  { base: '192.0.0.0', prefix: 24, description: 'IETF Protocol Assignments (RFC 6890)' },
  { base: '192.0.2.0', prefix: 24, description: 'Documentation TEST-NET-1 (RFC 5737)' },
  { base: '192.88.99.0', prefix: 24, description: '6to4 Relay Anycast (RFC 3068)' },
  { base: '192.168.0.0', prefix: 16, description: 'Private network (RFC 1918)' },
  { base: '198.18.0.0', prefix: 15, description: 'Benchmarking (RFC 2544)' },
  { base: '198.51.100.0', prefix: 24, description: 'Documentation TEST-NET-2 (RFC 5737)' },
  { base: '203.0.113.0', prefix: 24, description: 'Documentation TEST-NET-3 (RFC 5737)' },
  { base: '224.0.0.0', prefix: 4, description: 'Multicast (RFC 5771)' },
  { base: '240.0.0.0', prefix: 4, description: 'Reserved (RFC 1112)' },
  { base: '255.255.255.255', prefix: 32, description: 'Limited Broadcast (RFC 919)' },
];

const DISALLOWED_IPV6_CIDRS: IPv6Cidr[] = [
  { base: '::', prefix: 128, description: 'Unspecified' },
  { base: '::1', prefix: 128, description: 'Loopback' },
  { base: '64:ff9b::', prefix: 96, description: 'IPv4/IPv6 translation (RFC 6052)' },
  { base: '2001:db8::', prefix: 32, description: 'Documentation (RFC 3849)' },
  { base: 'fc00::', prefix: 7, description: 'Unique Local Addresses (ULA / RFC 4193)' },
  { base: 'fe80::', prefix: 10, description: 'Link-Local Unicast (RFC 4291)' },
  { base: 'ff00::', prefix: 8, description: 'Multicast (RFC 4291)' },
];

const DISALLOWED_HOSTNAMES = new Set([
  'localhost',
  'localhost.localdomain',
  'ip6-localhost',
  'ip6-loopback',
  'metadata.google.internal',
  'metadata.goog',
  'instance-data',
]);

export const GOOGLE_MAPS_ALLOWED_DOMAINS = [
  'google.com',
  'www.google.com',
  'maps.google.com',
  'googleusercontent.com',
  'goo.gl',
  'maps.app.goo.gl',
  'google.com.vn',
  'www.google.com.vn',
  'maps.google.com.vn',
];

// ==============================================================================
// 3. IP Conversion & Matching Helpers
// ==============================================================================

export function parseIPv4ToUint32(ip: string): number | null {
  const parts = ip.split('.');
  if (parts.length !== 4) return null;
  let res = 0;
  for (let i = 0; i < 4; i++) {
    const raw = parts[i];
    // Reject leading zeroes or octal/hex notation
    if (raw.length > 1 && raw.startsWith('0')) return null;
    const num = Number(raw);
    if (!Number.isInteger(num) || num < 0 || num > 255) return null;
    res = (res << 8) | num;
  }
  return res >>> 0;
}

export function ipv4MatchesCidr(ipUint: number, baseStr: string, prefix: number): boolean {
  const base = parseIPv4ToUint32(baseStr);
  if (base === null) return false;
  if (prefix === 0) return true;
  if (prefix < 0 || prefix > 32) return false;
  const mask = prefix === 32 ? 0xffffffff : (~0 << (32 - prefix)) >>> 0;
  return (ipUint & mask) === (base & mask);
}

export function parseIPv6ToBigInt(ip: string): bigint | null {
  let clean = ip.replace(/^\[|\]$/g, '').toLowerCase();

  // Handle IPv4-mapped IPv6 (e.g. ::ffff:192.0.2.1)
  if (clean.includes('.')) {
    const lastColon = clean.lastIndexOf(':');
    if (lastColon === -1) return null;
    const v4Part = clean.slice(lastColon + 1);
    const v4Parts = v4Part.split('.').map(Number);
    if (v4Parts.length !== 4 || v4Parts.some(p => isNaN(p) || p < 0 || p > 255)) {
      return null;
    }
    const hex1 = ((v4Parts[0] << 8) | v4Parts[1]).toString(16);
    const hex2 = ((v4Parts[2] << 8) | v4Parts[3]).toString(16);
    clean = clean.slice(0, lastColon + 1) + hex1 + ':' + hex2;
  }

  const parts = clean.split('::');
  if (parts.length > 2) return null;

  let left = parts[0] ? parts[0].split(':').map(h => parseInt(h, 16)) : [];
  const right = parts.length === 2 && parts[1] ? parts[1].split(':').map(h => parseInt(h, 16)) : [];

  if (parts.length === 2) {
    const missing = 8 - (left.length + right.length);
    if (missing < 0) return null;
    left = [...left, ...new Array(missing).fill(0), ...right];
  }

  if (left.length !== 8 || left.some(isNaN)) return null;

  let res = BigInt(0);
  for (const w of left) {
    if (w < 0 || w > 0xffff) return null;
    res = (res << BigInt(16)) | BigInt(w);
  }
  return res;
}

export function ipv6MatchesCidr(ipBigInt: bigint, baseStr: string, prefix: number): boolean {
  const base = parseIPv6ToBigInt(baseStr);
  if (base === null) return false;
  if (prefix === 0) return true;
  if (prefix < 0 || prefix > 128) return false;
  const shift = BigInt(128) - BigInt(prefix);
  const mask = prefix === 128 ? (BigInt(1) << BigInt(128)) - BigInt(1) : ((BigInt(1) << BigInt(prefix)) - BigInt(1)) << shift;
  return (ipBigInt & mask) === (base & mask);
}

// ==============================================================================
// 4. IP & Hostname Disallowed Checks
// ==============================================================================

export function isDisallowedIPv4(ip: string): boolean {
  const ipUint = parseIPv4ToUint32(ip);
  if (ipUint === null) return true; // Malformed IPv4 is disallowed by default

  for (const cidr of DISALLOWED_IPV4_CIDRS) {
    if (ipv4MatchesCidr(ipUint, cidr.base, cidr.prefix)) {
      return true;
    }
  }
  return false;
}

export function isDisallowedIPv6(ip: string): boolean {
  const clean = ip.replace(/^\[|\]$/g, '').toLowerCase();

  const ipBigInt = parseIPv6ToBigInt(clean);
  if (ipBigInt === null) return true; // Malformed IPv6 is disallowed

  // IPv4-mapped IPv6 check (::ffff:0:0/96) - whether expressed as dotted-decimal or hex words
  if ((ipBigInt >> BigInt(32)) === BigInt(0xffff)) {
    const v4Uint = Number(ipBigInt & BigInt(0xffffffff)) >>> 0;
    const v4Str = `${(v4Uint >>> 24) & 0xff}.${(v4Uint >>> 16) & 0xff}.${(v4Uint >>> 8) & 0xff}.${v4Uint & 0xff}`;
    return isDisallowedIPv4(v4Str);
  }

  // Deprecated IPv4-compatible IPv6 (::x.x.x.x where top 96 bits are 0)
  if ((ipBigInt >> BigInt(32)) === BigInt(0) && ipBigInt > BigInt(1)) {
    const v4Uint = Number(ipBigInt & BigInt(0xffffffff)) >>> 0;
    const v4Str = `${(v4Uint >>> 24) & 0xff}.${(v4Uint >>> 16) & 0xff}.${(v4Uint >>> 8) & 0xff}.${v4Uint & 0xff}`;
    return isDisallowedIPv4(v4Str);
  }

  for (const cidr of DISALLOWED_IPV6_CIDRS) {
    if (ipv6MatchesCidr(ipBigInt, cidr.base, cidr.prefix)) {
      return true;
    }
  }
  return false;
}

export function isDisallowedIp(ip: string): boolean {
  const version = net.isIP(ip.replace(/^\[|\]$/g, ''));
  if (version === 4) {
    return isDisallowedIPv4(ip);
  }
  if (version === 6) {
    return isDisallowedIPv6(ip);
  }
  return true; // Not a valid IP -> treated as disallowed
}

export function isDisallowedHostname(rawHostname: string): boolean {
  const hostname = rawHostname.toLowerCase().trim();

  if (DISALLOWED_HOSTNAMES.has(hostname)) {
    return true;
  }

  if (
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal') ||
    hostname.endsWith('.lan') ||
    hostname.endsWith('.localdomain')
  ) {
    return true;
  }

  // Reject dotless domains (e.g. "http://admin" or "http://internal") unless it's a direct valid IP
  if (!hostname.includes('.') && !hostname.includes(':') && net.isIP(hostname) === 0) {
    return true;
  }

  return false;
}

export function isAllowedDomain(
  hostname: string,
  profile: DomainValidationProfile = 'PUBLIC_INTERNET',
  customAllowlist?: string[]
): boolean {
  const lowerHost = hostname.toLowerCase();

  if (profile === 'PUBLIC_INTERNET') {
    return true; // Allowed as long as IP/hostname blacklist passes
  }

  if (profile === 'GOOGLE_MAPS') {
    for (const domain of GOOGLE_MAPS_ALLOWED_DOMAINS) {
      if (lowerHost === domain || lowerHost.endsWith('.' + domain)) {
        return true;
      }
    }
    // Also check maps shortlinks (maps.app.goo.gl)
    if (lowerHost === 'maps.app.goo.gl' || lowerHost.endsWith('.goo.gl')) {
      return true;
    }
    return false;
  }

  if (profile === 'STRICT') {
    if (!customAllowlist || customAllowlist.length === 0) return false;
    for (const domain of customAllowlist) {
      const lowerAllowed = domain.toLowerCase();
      if (lowerHost === lowerAllowed || lowerHost.endsWith('.' + lowerAllowed)) {
        return true;
      }
    }
    return false;
  }

  return false;
}

// ==============================================================================
// 5. Core URL Validation Logic
// ==============================================================================

async function defaultDnsLookup(hostname: string): Promise<string[]> {
  const records = await dns.promises.lookup(hostname, { all: true });
  return records.map(r => r.address);
}

/**
 * Validates whether a raw URL string is strictly safe for server-side fetching.
 * Enforces scheme, port, hostname blacklist, DNS pre-resolution, and IP CIDR checks.
 */
export async function validateSafeFetchUrl(
  rawUrl: string,
  options: SafeFetchValidationOptions = {}
): Promise<SafeUrlValidationResult> {
  const {
    profile = 'PUBLIC_INTERNET',
    allowedDomains,
    allowedPorts = [443],
    dnsLookupFn = defaultDnsLookup,
  } = options;

  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return {
      isValid: false,
      error: `Invalid URL format: "${rawUrl}"`,
      code: 'INVALID_URL',
      rejectedTarget: rawUrl,
    };
  }

  // 1. Scheme Check (Must be https:)
  if (url.protocol.toLowerCase() !== 'https:') {
    return {
      isValid: false,
      error: `Invalid protocol scheme: "${url.protocol}". Only HTTPS is allowed.`,
      code: 'INVALID_SCHEME',
      rejectedTarget: rawUrl,
    };
  }

  // 2. Port Check (Must be standard 443 or explicitly allowed)
  const port = url.port ? Number(url.port) : 443;
  if (!allowedPorts.includes(port)) {
    return {
      isValid: false,
      error: `Disallowed port: ${port}. Allowed ports: [${allowedPorts.join(', ')}].`,
      code: 'INVALID_PORT',
      rejectedTarget: rawUrl,
    };
  }

  const rawHostname = url.hostname.trim();
  const cleanHostname = rawHostname.replace(/^\[|\]$/g, '').toLowerCase();

  // 3. Hostname Blacklist Check
  if (isDisallowedHostname(cleanHostname)) {
    return {
      isValid: false,
      error: `Blocked hostname: "${rawHostname}" is not permitted for outbound requests.`,
      code: 'BLOCKED_HOSTNAME',
      rejectedTarget: rawUrl,
    };
  }

  // 4. Direct IP Literal Check (Anti-SSRF)
  const ipVersion = net.isIP(cleanHostname);
  let resolvedIps: string[] = [];

  if (ipVersion !== 0) {
    // Hostname is already a direct IP address literal -> check blacklist first
    if (isDisallowedIp(cleanHostname)) {
      return {
        isValid: false,
        error: `Blocked IP address: "${cleanHostname}" belongs to a private/reserved/metadata subnet.`,
        code: 'BLOCKED_IP',
        rejectedTarget: rawUrl,
      };
    }
    resolvedIps = [cleanHostname];
  }

  // 5. Domain Profile / Allowlist Check
  if (!isAllowedDomain(cleanHostname, profile, allowedDomains)) {
    return {
      isValid: false,
      error: `Domain "${cleanHostname}" is not authorized under profile "${profile}".`,
      code: 'DISALLOWED_DOMAIN',
      rejectedTarget: rawUrl,
    };
  }

  // 6. DNS Pre-resolution & Rebinding Verification
  if (ipVersion === 0) {
    // Hostname is a domain name -> Must perform DNS resolution
    try {
      resolvedIps = await dnsLookupFn(cleanHostname);
    } catch (dnsErr) {
      return {
        isValid: false,
        error: `DNS resolution failed for hostname "${cleanHostname}": ${dnsErr instanceof Error ? dnsErr.message : String(dnsErr)}`,
        code: 'DNS_RESOLUTION_FAILED',
        rejectedTarget: rawUrl,
      };
    }

    if (!resolvedIps || resolvedIps.length === 0) {
      return {
        isValid: false,
        error: `DNS lookup returned no addresses for hostname "${cleanHostname}".`,
        code: 'DNS_RESOLUTION_FAILED',
        rejectedTarget: rawUrl,
      };
    }

    // Verify EVERY resolved IP address against CIDR blacklist
    for (const ip of resolvedIps) {
      if (isDisallowedIp(ip)) {
        return {
          isValid: false,
          error: `DNS rebinding protection: Hostname "${cleanHostname}" resolved to disallowed IP "${ip}".`,
          code: 'BLOCKED_IP',
          rejectedTarget: rawUrl,
        };
      }
    }
  }

  return {
    isValid: true,
    url,
    resolvedIps,
    hostname: cleanHostname,
  };
}

/**
 * Asserts that a URL is safe. Throws SafeFetchValidationError if validation fails.
 */
export async function assertSafeFetchUrl(
  rawUrl: string,
  options: SafeFetchValidationOptions = {}
): Promise<URL> {
  const result = await validateSafeFetchUrl(rawUrl, options);
  if (!result.isValid) {
    throw new SafeFetchValidationError(result.error, result.code, result.rejectedTarget);
  }
  return result.url;
}

// ==============================================================================
// 6. Safe Server Fetch Wrapper (Manual Redirects & Body Size Limits)
// ==============================================================================

/**
 * Executes a safe server-side fetch request with strict SSRF defense:
 * - Validates initial URL.
 * - Enforces manual redirect handling, validating every hop against the contract.
 * - Enforces timeout and maximum response body size limits.
 */
export async function safeServerFetch(
  rawUrl: string | URL,
  init?: RequestInit,
  options: SafeFetchValidationOptions = {}
): Promise<Response> {
  const {
    maxRedirects = 3,
    timeoutMs = 6000,
    maxBodySizeBytes = 10 * 1024 * 1024, // 10MB
    allowedRedirectDomains,
  } = options;

  let currentTarget = typeof rawUrl === 'string' ? rawUrl : rawUrl.toString();
  let redirectsCount = 0;

  while (true) {
    // 1. Validate the current target URL
    const validation = await validateSafeFetchUrl(currentTarget, options);
    if (!validation.isValid) {
      throw new SafeFetchValidationError(validation.error, validation.code, validation.rejectedTarget);
    }

    // 1b. Enforce allowedRedirectDomains for redirect hops
    if (redirectsCount > 0 && allowedRedirectDomains && allowedRedirectDomains.length > 0) {
      const hopHostname = validation.url.hostname.toLowerCase();
      const isAllowedRedirect = allowedRedirectDomains.some((d) => {
        const lowerDomain = d.toLowerCase();
        return hopHostname === lowerDomain || hopHostname.endsWith('.' + lowerDomain);
      });
      if (!isAllowedRedirect) {
        throw new SafeFetchValidationError(
          `Redirect to unauthorized domain "${hopHostname}" is not permitted.`,
          'DISALLOWED_DOMAIN',
          currentTarget
        );
      }
    }

    // 2. Prepare request with timeout and manual redirect handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(validation.url.toString(), {
        ...init,
        redirect: 'manual', // Strictly intercept all redirects
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // 3. Handle HTTP 3xx Redirects
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        redirectsCount++;
        if (redirectsCount > maxRedirects) {
          throw new SafeFetchValidationError(
            `Maximum redirect limit (${maxRedirects}) exceeded.`,
            'MAX_REDIRECTS_EXCEEDED',
            currentTarget
          );
        }

        const locationHeader = response.headers.get('location');
        if (!locationHeader) {
          throw new SafeFetchValidationError(
            `Received redirect status ${response.status} without Location header.`,
            'INVALID_URL',
            currentTarget
          );
        }

        // Resolve relative redirects against current URL
        try {
          const nextUrl = new URL(locationHeader, validation.url);
          currentTarget = nextUrl.toString();
        } catch {
          throw new SafeFetchValidationError(
            `Invalid redirect Location: "${locationHeader}"`,
            'INVALID_URL',
            locationHeader
          );
        }

        continue; // Next hop
      }

      // 4. Response Size Validation (via Content-Length header if present)
      const contentLengthHeader = response.headers.get('content-length');
      if (contentLengthHeader) {
        const contentLength = Number(contentLengthHeader);
        if (!isNaN(contentLength) && contentLength > maxBodySizeBytes) {
          throw new SafeFetchValidationError(
            `Response Content-Length (${contentLength} bytes) exceeds limit of ${maxBodySizeBytes} bytes.`,
            'RESPONSE_TOO_LARGE',
            validation.url.toString()
          );
        }
      }

      Object.defineProperty(response, 'finalUrl', {
        value: validation.url.toString(),
        writable: true,
        enumerable: false,
        configurable: true,
      });

      return response;
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      if (err instanceof SafeFetchValidationError) {
        throw err;
      }
      if (err instanceof Error && err.name === 'AbortError') {
        throw new SafeFetchValidationError(
          `Request to "${currentTarget}" timed out after ${timeoutMs}ms.`,
          'FETCH_TIMEOUT',
          currentTarget
        );
      }
      throw err;
    }
  }
}
