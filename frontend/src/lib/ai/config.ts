/**
 * ─────────────────────────────────────────────────────────────────────────────
 * AI CONFIG & STATE MANAGER (Single Responsibility)
 * Du Lịch Tri Tôn AI Assistant System
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface AIProviderConfig {
  geminiKeys: string[];
  groqKey: string;
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
  groqKey: process.env.GROQ_API_KEY || '',
  openRouterKey: process.env.OPENROUTER_API_KEY || '',
  geminiModels: [
    'gemini-flash-latest',
    'gemini-1.5-flash',
  ],
  groqModels: [
    'llama-3.1-8b-instant',
    'llama-3.3-70b-versatile',
    'gemma2-9b-it',
  ],
  openRouterModels: [
    'google/gemma-4-31b-it:free',
    'google/gemma-4-26b-a4b-it:free',
    'nvidia/nemotron-3-nano-30b-a3b:free',
    'nvidia/nemotron-3.5-lightning:free',
    'nvidia/nemotron-3-ultra-550b-a55b:free',
    'openai/gpt-oss-20b:free',
    'liquid/lfm-2.5-2.6b:free',
  ],
  timeoutMs: 5000,
  cooldownMs: 20000, // 20s cooldown for 429 rate limit
};

// ── In-Memory State & Circuit Breaker ────────────────────────────────────────
const cooldownMap = new Map<string, number>();
const requestCountMap = new Map<string, number>();
const lastUsedMap = new Map<string, number>();

let geminiRoundRobinPointer = 0;

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
