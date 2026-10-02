/**
 * ─────────────────────────────────────────────────────────────────────────────
 * DISTRIBUTED & IN-MEMORY RATE LIMITER WITH GRACEFUL DEGRADATION
 * Du Lịch Tri Tôn AI Assistant System
 * Architectural Authority: DR-G3-RATELIMIT-BACKEND-001 (P05-012, P05-013)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  RATE_LIMIT_POLICIES,
  DISTRIBUTED_RATE_LIMIT_DEFAULTS,
  getDistributedRateLimitCredentials,
  type RateLimitTier,
} from './rateLimitConfig.ts';

export interface RateLimitRecord {
  count: number;
  resetAt: number;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
  backend: 'upstash_redis' | 'memory_fallback';
}

export interface RateLimiterOptions {
  env?: NodeJS.ProcessEnv;
  fetchFn?: typeof fetch;
  memoryStore?: Map<string, RateLimitRecord>;
  timeoutMs?: number;
}

/**
 * Lớp điều phối Rate Limiter phân tán kèm cơ chế tự động suy thoái về bộ nhớ cục bộ
 */
export class DistributedRateLimiter {
  private memoryStore: Map<string, RateLimitRecord>;
  private env: NodeJS.ProcessEnv;
  private fetchFn: typeof fetch;
  private timeoutMs: number;
  private cleanupInterval?: ReturnType<typeof setInterval>;

  constructor(options: RateLimiterOptions = {}) {
    this.memoryStore = options.memoryStore || new Map<string, RateLimitRecord>();
    this.env = options.env || process.env;
    this.fetchFn = options.fetchFn || (typeof globalThis.fetch !== 'undefined' ? globalThis.fetch.bind(globalThis) : (fetch as any));
    this.timeoutMs = options.timeoutMs || DISTRIBUTED_RATE_LIMIT_DEFAULTS.TIMEOUT_MS;

    // Dọn dẹp các bản ghi memory hết hạn định kỳ mỗi 5 phút
    if (typeof setInterval !== 'undefined') {
      this.cleanupInterval = setInterval(() => {
        const now = Date.now();
        for (const [key, record] of this.memoryStore.entries()) {
          if (record.resetAt <= now) {
            this.memoryStore.delete(key);
          }
        }
      }, 5 * 60 * 1000);
      if (this.cleanupInterval && typeof this.cleanupInterval.unref === 'function') {
        this.cleanupInterval.unref();
      }
    }
  }

  /**
   * Hủy timer dọn dẹp (phục vụ teardown trong test)
   */
  public destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }
  }

  /**
   * Kiểm tra hạn mức đồng bộ qua bộ nhớ RAM (In-Memory Sliding Window)
   */
  public checkMemory(
    key: string,
    limit: number = 60,
    windowSeconds: number = 60
  ): RateLimitResult {
    const now = Date.now();
    const windowMs = windowSeconds * 1000;
    const record = this.memoryStore.get(key);

    if (!record || record.resetAt <= now) {
      this.memoryStore.set(key, { count: 1, resetAt: now + windowMs });
      return {
        allowed: true,
        limit,
        remaining: Math.max(0, limit - 1),
        resetSeconds: windowSeconds,
        backend: 'memory_fallback',
      };
    }

    if (record.count >= limit) {
      const resetSeconds = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
      return {
        allowed: false,
        limit,
        remaining: 0,
        resetSeconds,
        backend: 'memory_fallback',
      };
    }

    record.count += 1;
    const resetSeconds = Math.max(1, Math.ceil((record.resetAt - now) / 1000));

    return {
      allowed: true,
      limit,
      remaining: Math.max(0, limit - record.count),
      resetSeconds,
      backend: 'memory_fallback',
    };
  }

  /**
   * Kiểm tra hạn mức phân tán bất đồng bộ qua Upstash Serverless Redis REST API
   * Tự động suy thoái an toàn về In-Memory nếu thiếu credentials hoặc lỗi mạng/timeout
   */
  public async check(
    key: string,
    limit: number = 60,
    windowSeconds: number = 60
  ): Promise<RateLimitResult> {
    const credentials = getDistributedRateLimitCredentials(this.env);

    // Nếu không có credentials Upstash Redis hợp lệ -> Chuyển mạch ngay về memory store
    if (!credentials.isValid || !credentials.url || !credentials.token) {
      return this.checkMemory(key, limit, windowSeconds);
    }

    try {
      const redisKey = `triton_rl:${key}`;
      const url = credentials.url.replace(/\/+$/, '');
      const token = credentials.token;

      // Chuẩn bị tín hiệu timeout an toàn ngắt kết nối
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      try {
        // Thực thi pipeline nguyên tử: INCR và TTL trong 1 HTTP request
        const pipelineResponse = await this.fetchFn(`${url}/pipeline`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify([
            ['INCR', redisKey],
            ['TTL', redisKey],
          ]),
          signal: controller.signal,
        });

        if (!pipelineResponse.ok) {
          throw new Error(`Upstash Redis HTTP error: ${pipelineResponse.status}`);
        }

        const pipelineData = (await pipelineResponse.json()) as Array<{ result: any; error?: string }>;

        if (!Array.isArray(pipelineData) || pipelineData.length < 2) {
          throw new Error('Malformed pipeline response from Upstash Redis');
        }

        const count = Number(pipelineData[0]?.result);
        let ttl = Number(pipelineData[1]?.result);

        // Nếu là lần đầu tiên tăng biến đếm (count === 1) hoặc key chưa có TTL (ttl === -1)
        // Thiết lập thời hạn hết hạn EXPIRE
        if (count === 1 || ttl === -1) {
          ttl = windowSeconds;
          // Gửi lệnh expire async ngầm (không chặn luồng)
          this.fetchFn(`${url}/expire/${encodeURIComponent(redisKey)}/${windowSeconds}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          }).catch(() => {});
        }

        const resetSeconds = ttl > 0 ? ttl : windowSeconds;
        const allowed = count <= limit;
        const remaining = Math.max(0, limit - count);

        return {
          allowed,
          limit,
          remaining,
          resetSeconds,
          backend: 'upstash_redis',
        };
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (err: any) {
      // Cơ chế Graceful Degradation: Bắt lỗi mạng / timeout và suy thoái an toàn về memory
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[RateLimiter] Distributed backend unavailable (${err?.message || 'unknown error'}). Falling back to in-memory store.`);
      }
      return this.checkMemory(key, limit, windowSeconds);
    }
  }
}

// Singleton RateLimiter mặc định cho toàn bộ ứng dụng
const defaultLimiter = new DistributedRateLimiter();

/**
 * Hàm kiểm tra rate limit bất đồng bộ (Khuyến nghị dùng trong toàn bộ Server routes & Middleware)
 */
export async function checkRateLimitAsync(
  key: string,
  limit?: number,
  windowSeconds?: number,
  tier?: RateLimitTier
): Promise<RateLimitResult> {
  const policyLimit = tier ? RATE_LIMIT_POLICIES[tier].limit : (limit ?? 60);
  const policyWindow = tier ? RATE_LIMIT_POLICIES[tier].windowSeconds : (windowSeconds ?? 60);

  return defaultLimiter.check(key, policyLimit, policyWindow);
}

/**
 * Hàm kiểm tra rate limit đồng bộ (Backward compatibility cho context đồng bộ)
 */
export function checkRateLimit(
  key: string,
  limit: number = 60,
  windowSeconds: number = 60
): RateLimitResult {
  return defaultLimiter.checkMemory(key, limit, windowSeconds);
}

export const RATE_LIMIT_REDIS_KEY_PREFIX = 'triton_rl:';

export type CallableDistributedRateLimiter = ((
  key: string,
  limit?: number,
  windowSeconds?: number
) => Promise<RateLimitResult>) & DistributedRateLimiter;

/**
 * Factory tạo instance mới phục vụ kiểm thử đa phiên bản (Multi-instance testing)
 * Trả về callable instance vừa gọi trực tiếp limiter(key, limit, window) vừa có các methods của DistributedRateLimiter
 */
export function createRateLimiter(
  optionsOrEnv?: RateLimiterOptions | NodeJS.ProcessEnv
): CallableDistributedRateLimiter {
  const isEnv = optionsOrEnv && typeof (optionsOrEnv as any).UPSTASH_REDIS_REST_URL !== 'undefined';
  const opts: RateLimiterOptions = isEnv
    ? { env: optionsOrEnv as NodeJS.ProcessEnv }
    : (optionsOrEnv as RateLimiterOptions) || {};

  const instance = new DistributedRateLimiter(opts);
  const callable = function (
    key: string,
    limit: number = 60,
    windowSeconds: number = 60
  ): Promise<RateLimitResult> {
    return instance.check(key, limit, windowSeconds);
  };

  Object.setPrototypeOf(callable, instance);
  // Bind methods sang callable
  callable.check = instance.check.bind(instance);
  callable.checkMemory = instance.checkMemory.bind(instance);
  callable.destroy = instance.destroy.bind(instance);

  return callable as CallableDistributedRateLimiter;
}

/**
 * Kiểm tra xem request có xuất phát từ Scraper Bot tự động không
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

  return badBots.some((bot) => ua.includes(bot));
}
