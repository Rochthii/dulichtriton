/**
 * ─────────────────────────────────────────────────────────────────────────────
 * DISTRIBUTED RATE LIMIT CONFIGURATION & CONTRACT SPECIFICATION
 * Du Lịch Tri Tôn AI Assistant System
 * Architectural Authority: DR-G3-RATELIMIT-BACKEND-001 (Task P05-012)
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type RateLimitTier = 'chat_query' | 'admin_mutation' | 'auth_login' | 'public_api';

export type RateLimitBackendType = 'upstash_redis' | 'memory_fallback';

export interface RateLimitPolicy {
  tier: RateLimitTier;
  limit: number;
  windowSeconds: number;
  description: string;
}

export interface DistributedRateLimitConfig {
  backendType: RateLimitBackendType;
  isDistributed: boolean;
  restUrl?: string;
  hasRestToken: boolean;
  timeoutMs: number;
  reason: string;
}

/**
 * Bảng hạn mức chuẩn hóa theo Decision Record DR-G3-RATELIMIT-BACKEND-001
 */
export const RATE_LIMIT_POLICIES: Record<RateLimitTier, RateLimitPolicy> = {
  chat_query: {
    tier: 'chat_query',
    limit: 20,
    windowSeconds: 60,
    description: 'Giới hạn truy vấn Chatbot AI phòng chống lạm dụng token LLM (20 req / 60s)',
  },
  admin_mutation: {
    tier: 'admin_mutation',
    limit: 30,
    windowSeconds: 60,
    description: 'Giới hạn thay đổi dữ liệu quản trị viên chống bùng nổ mutation (30 req / 60s)',
  },
  auth_login: {
    tier: 'auth_login',
    limit: 5,
    windowSeconds: 60,
    description: 'Giới hạn đăng nhập quản trị viên chống tấn công vét cạn brute-force (5 req / 60s)',
  },
  public_api: {
    tier: 'public_api',
    limit: 90,
    windowSeconds: 60,
    description: 'Giới hạn các API dữ liệu công cộng chống bot scraper tự động (90 req / 60s)',
  },
};

export const DISTRIBUTED_RATE_LIMIT_DEFAULTS = {
  TIMEOUT_MS: 1500, // Timeout ngắt kết nối Redis REST API để tránh nghẽn luồng
  DEFAULT_TIER: 'public_api' as RateLimitTier,
  SPECIFICATION_ID: 'DR-G3-RATELIMIT-BACKEND-001',
};

/**
 * Trích xuất và thẩm định biến môi trường cấu hình Distributed Redis
 */
export function getDistributedRateLimitCredentials(env: NodeJS.ProcessEnv = process.env): {
  url?: string;
  token?: string;
  isValid: boolean;
} {
  const url = (env.UPSTASH_REDIS_REST_URL || env.REDIS_REST_URL || '').trim();
  const token = (env.UPSTASH_REDIS_REST_TOKEN || env.REDIS_REST_TOKEN || '').trim();

  // Kiểm tra URL hợp lệ bắt đầu bằng https://
  const isValidUrl = url.startsWith('https://') && url.length > 10;
  const isValidToken = token.length > 0;

  return {
    url: isValidUrl ? url : undefined,
    token: isValidToken ? token : undefined,
    isValid: isValidUrl && isValidToken,
  };
}

/**
 * Xác định phân giải Backend Rate Limiter tại thời điểm thực thi (Runtime Resolver)
 * Tự động chuyển mạch an toàn sang Memory Fallback nếu thiếu credentials hoặc lỗi môi trường
 */
export function resolveRateLimitBackend(
  env: NodeJS.ProcessEnv = process.env
): DistributedRateLimitConfig {
  const credentials = getDistributedRateLimitCredentials(env);

  if (credentials.isValid && credentials.url) {
    return {
      backendType: 'upstash_redis',
      isDistributed: true,
      restUrl: credentials.url,
      hasRestToken: true,
      timeoutMs: DISTRIBUTED_RATE_LIMIT_DEFAULTS.TIMEOUT_MS,
      reason: 'Đã kích hoạt Upstash Serverless Redis REST API phân tán theo chuẩn DR-G3-RATELIMIT-BACKEND-001',
    };
  }

  return {
    backendType: 'memory_fallback',
    isDistributed: false,
    hasRestToken: false,
    timeoutMs: 0,
    reason: 'Chuyển mạch an toàn về In-Memory Sliding Window (Local Dev hoặc thiếu Redis REST credentials)',
  };
}

/**
 * Lấy chính sách giới hạn tốc độ theo tầng nghiệp vụ
 */
export function getRateLimitPolicy(tier: RateLimitTier): RateLimitPolicy {
  const policy = RATE_LIMIT_POLICIES[tier];
  if (!policy) {
    return RATE_LIMIT_POLICIES.public_api;
  }
  return policy;
}
