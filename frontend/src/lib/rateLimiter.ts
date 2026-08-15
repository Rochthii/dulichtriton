/**
 * ─────────────────────────────────────────────────────────────────────────────
 * SLIDING WINDOW IN-MEMORY RATE LIMITER & BOT DETECTION
 * Du Lịch Tri Tôn AI Assistant System
 * ─────────────────────────────────────────────────────────────────────────────
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const ipStore = new Map<string, RateLimitRecord>();

// Clean up stale IP records every 5 minutes to prevent memory leak
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of ipStore.entries()) {
      if (record.resetAt <= now) {
        ipStore.delete(ip);
      }
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
}

/**
 * Check and enforce rate limits for a given client IP
 * @param ip Client IP address
 * @param limit Max allowed requests within window
 * @param windowSeconds Window duration in seconds
 */
export function checkRateLimit(
  ip: string,
  limit: number = 60,
  windowSeconds: number = 60
): RateLimitResult {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const record = ipStore.get(ip);

  if (!record || record.resetAt <= now) {
    ipStore.set(ip, { count: 1, resetAt: now + windowMs });
    return {
      allowed: true,
      limit,
      remaining: limit - 1,
      resetSeconds: windowSeconds,
    };
  }

  if (record.count >= limit) {
    const resetSeconds = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
    return {
      allowed: false,
      limit,
      remaining: 0,
      resetSeconds,
    };
  }

  record.count += 1;
  const resetSeconds = Math.max(1, Math.ceil((record.resetAt - now) / 1000));

  return {
    allowed: true,
    limit,
    remaining: limit - record.count,
    resetSeconds,
  };
}

/**
 * Check if incoming request is from a suspicious automated scraper bot
 */
export function isSuspiciousBot(userAgent: string | null): boolean {
  if (!userAgent) return true;
  const ua = userAgent.toLowerCase();
  
  const badBots = [
    'python-requests',
    'python-urllib',
    'scrapy',
    'httpx',
    'aiohttp',
    'curl/',
    'wget/',
    'go-http-client',
    'java/',
    'libwww-perl',
    'postmanruntime',
    'petalbot',
    'mj12bot',
    'ahrefsbot',
    'semrushbot',
  ];

  return badBots.some(bot => ua.includes(bot));
}
