import fs from 'fs';
import path from 'path';

function loadLocalEnvIfNode() {
  if (typeof process === 'undefined' || !process.cwd) return;
  try {
    const paths = [
      path.resolve(process.cwd(), '.env.local'),
      path.resolve(process.cwd(), 'frontend', '.env.local'),
      path.resolve(process.cwd(), '..', 'frontend', '.env.local'),
    ];
    for (const p of paths) {
      if (fs.existsSync(p)) {
        const content = fs.readFileSync(p, 'utf8');
        for (const line of content.split('\n')) {
          const match = line.match(/^([^=]+)=(.*)$/);
          if (match) {
            const k = match[1].trim();
            const v = match[2].trim().replace(/^['"]|['"]$/g, '');
            if (!process.env[k]) process.env[k] = v;
          }
        }
      }
    }
  } catch { /* ignore */ }
}
loadLocalEnvIfNode();

export interface AIProviderConfig {
  geminiKeys: string[];
  groqKeys: string[];    // Round-Robin pool (hỗ trợ đa key)
  groqKey: string;       // Legacy: key đầu tiên (backward compat)
  openRouterKey: string;
  geminiModels: string[];
  groqModels: string[];
  openRouterModels: string[];
  timeoutMs: number;
  cooldownMs: number;
}

export const AI_CONFIG: AIProviderConfig = {
  geminiKeys: [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY_4,
  ].filter(Boolean) as string[],

  // Groq Round-Robin Pool: hỗ trợ đến 4 keys (thêm GROQ_API_KEY_2, _3, _4 trong Vercel Env)
  groqKeys: [
    process.env.GROQ_API_KEY,
    process.env.GROQ_API_KEY_2,
    process.env.GROQ_API_KEY_3,
    process.env.GROQ_API_KEY_4,
  ].filter(Boolean) as string[],
  // Legacy field — luôn trỏ vào key đầu tiên
  get groqKey() { return this.groqKeys[0] || ''; },

  openRouterKey: process.env.OPENROUTER_API_KEY || '',
  geminiModels: [
    'gemini-flash-lite-latest',    // 🥇 Hạn mức Free cao nhất: 1,500 RPD / 30 RPM
    'gemini-2.5-flash-lite',       // 🥈 1,500 RPD, phản hồi siêu nhanh <300ms
    'gemini-3.1-flash-lite',       // 🥉 Flash Lite thế hệ mới
    'gemini-flash-latest',         // Flash chuẩn (Search Grounding tốt)
    'gemini-3-flash-preview',      // Backup cao cấp
    'gemini-3.7-flash',            // Backup reasoning
  ],
  groqModels: [
    'llama-3.3-70b-versatile',   // Model mạnh nhất, tiếng Việt tốt
    'llama-3.1-8b-instant',      // Model nhanh nhất
    'gemma2-9b-it',              // Backup Google
    'mixtral-8x7b-32768',        // Context dài
  ],
  // Giảm xuống chỉ còn 1 model tốt nhất cho Tiếng Việt — tránh timeout chuỗi dài
  openRouterModels: [
    'google/gemma-2-27b-it',
  ],
  timeoutMs: 4500,
  cooldownMs: 30000,
};

// ── In-Memory State & Circuit Breaker ────────────────────────────────────────
const cooldownMap = new Map<string, number>();
const requestCountMap = new Map<string, number>();
const lastUsedMap = new Map<string, number>();

let geminiRoundRobinPointer = 0;
let groqRoundRobinPointer = 0;   // Groq Round-Robin Pointer

export function isKeyInCooldown(keyLabel: string): boolean {
  const expiresAt = cooldownMap.get(keyLabel);
  if (!expiresAt) return false;
  if (Date.now() > expiresAt) {
    cooldownMap.delete(keyLabel);
    return false;
  }
  return true;
}

export function setKeyCooldown(keyLabel: string, durationMs = AI_CONFIG.cooldownMs): void {
  cooldownMap.set(keyLabel, Date.now() + durationMs);
  console.warn(`[AI Circuit Breaker] ⛔ Key '${keyLabel}' placed on ${Math.round(durationMs / 1000)}s cooldown.`);
}

export function recordKeyUsage(keyLabel: string): void {
  const current = requestCountMap.get(keyLabel) || 0;
  requestCountMap.set(keyLabel, current + 1);
  lastUsedMap.set(keyLabel, Date.now());
}

/**
 * Groq Round-Robin: xây vòng các Groq Keys không trong cooldown
 */
export function getRoundRobinGroqKeys(): { key: string; id: string }[] {
  const keys = AI_CONFIG.groqKeys;
  const total = keys.length;
  if (total === 0) return [];

  const startIdx = groqRoundRobinPointer;
  groqRoundRobinPointer = (groqRoundRobinPointer + 1) % total;

  const result: { key: string; id: string }[] = [];
  for (let i = 0; i < total; i++) {
    const idx = (startIdx + i) % total;
    const id = `groq_key_${idx + 1}`;
    if (!isKeyInCooldown(id)) {
      result.push({ key: keys[idx], id });
    }
  }

  // Nếu tất cả trong cooldown → trả về tất cả để thử lại
  if (result.length === 0) {
    for (let i = 0; i < total; i++) {
      result.push({ key: keys[i], id: `groq_key_${i + 1}` });
    }
  }

  return result;
}

/**
 * Lấy danh sách Gemini Keys theo thứ tự xoay vòng Round-Robin công bằng
 */
export function getRoundRobinGeminiKeys(): { key: string; id: string }[] {
  const total = AI_CONFIG.geminiKeys.length;
  if (total === 0) return [];

  const startIdx = geminiRoundRobinPointer;
  geminiRoundRobinPointer = (geminiRoundRobinPointer + 1) % total;

  const result: { key: string; id: string }[] = [];
  for (let i = 0; i < total; i++) {
    const idx = (startIdx + i) % total;
    const id = `gemini_key_${idx + 1}`;
    if (!isKeyInCooldown(id)) {
      result.push({ key: AI_CONFIG.geminiKeys[idx], id });
    }
  }

  // If all active in cooldown, return all to attempt
  if (result.length === 0) {
    for (let i = 0; i < total; i++) {
      result.push({ key: AI_CONFIG.geminiKeys[i], id: `gemini_key_${i + 1}` });
    }
  }

  return result;
}

/**
 * Health & Observability Metrics Exporter for Admin Dashboard
 */
export function getAIProviderMetrics() {
  const keysStatus = AI_CONFIG.geminiKeys.map((_, i) => {
    const label = `gemini_key_${i + 1}`;
    const inCooldown = isKeyInCooldown(label);
    const expiresAt = cooldownMap.get(label) || 0;
    return {
      label,
      status: inCooldown ? 'cooldown' : 'active',
      cooldownRemainingSec: inCooldown ? Math.max(0, Math.round((expiresAt - Date.now()) / 1000)) : 0,
      totalRequests: requestCountMap.get(label) || 0,
      lastUsedAt: lastUsedMap.get(label) || null,
    };
  });

  return {
    geminiKeysCount: AI_CONFIG.geminiKeys.length,
    activePointer: geminiRoundRobinPointer,
    keys: keysStatus,
    groq: {
      hasKey: Boolean(AI_CONFIG.groqKey),
      status: isKeyInCooldown('groq') ? 'cooldown' : 'active',
      totalRequests: requestCountMap.get('groq') || 0,
    },
    openRouter: {
      hasKey: Boolean(AI_CONFIG.openRouterKey),
      status: isKeyInCooldown('openrouter') ? 'cooldown' : 'active',
      totalRequests: requestCountMap.get('openrouter') || 0,
    },
  };
}
