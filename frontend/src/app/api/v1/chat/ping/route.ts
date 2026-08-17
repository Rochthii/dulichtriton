/**
 * /api/v1/chat/ping — Pre-warm Groq LPU endpoint
 * Được gọi khi user bắt đầu gõ (Cơ chế C: Model Warm-up Pre-ping)
 * Gửi 1 request siêu nhẹ để "đánh thức" Groq LPU trước khi user bấm Gửi
 * → Giảm TTFB ~150ms cho câu trả lời chính thức
 */

import { NextRequest } from 'next/server';
import { AI_CONFIG } from '@/lib/ai/config';
import { getRoundRobinGroqKeys } from '@/lib/ai/config';

export async function POST(_req: NextRequest) {
  const keyPool = getRoundRobinGroqKeys();
  if (keyPool.length === 0) {
    return new Response(JSON.stringify({ ok: false, reason: 'no_groq_key' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Fire-and-forget: gửi ping nhẹ đến Groq LPU, không chờ kết quả
  // max_tokens=1 → tốn < 0.001 xu quota, chỉ để "ấm máy" connection
  const keyObj = keyPool[0];
  void fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${keyObj.key}`,
    },
    body: JSON.stringify({
      model: AI_CONFIG.groqModels[0],
      messages: [{ role: 'user', content: 'ok' }],
      max_tokens: 1,
      temperature: 0,
    }),
    signal: AbortSignal.timeout(2000),
  }).catch(() => { /* silent — không ảnh hưởng UX */ });

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
