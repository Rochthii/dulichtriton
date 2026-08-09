import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://knmlbwsmfljlabhvqfid.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ── Shared with query/route.ts (intentionally duplicated to keep routes isolated) ─
const SYSTEM_PROMPT = `Bạn là Trợ lý Du Lịch Tri Tôn AI chuyên sâu về du lịch, ẩm thực, di sản văn hóa Khmer và thắng cảnh Huyện Tri Tôn, Tỉnh An Giang.
Xưng hô bắt buộc: Tự xưng "Tôi" và gọi người dùng là "Bạn".

QUY TẮC PHẠM VI & ĐỊNH DẠNG ĐẦU RA CAO CẤP (HIGH-QUALITY RESPONSE CONTRACT):
1. **Phạm vi hỗ trợ**:
   - Nếu câu hỏi nằm ngoài phạm vi Tri Tôn, phản hồi chính xác: "Tôi chỉ hỗ trợ các nội dung liên quan đến Tri Tôn và dự án Du Lịch Tri Tôn. Bạn hãy đặt câu hỏi trong phạm vi này."
   - Tuyệt đối không dùng cụm từ "Huyện Tri Tôn" trong mô tả địa danh, luôn gọi tên Xã / Thị trấn cụ thể (VD: Xã Núi Tô, Xã Ô Lâm, Xã Lương Phi, Thị trấn Tri Tôn).

2. **Cấu trúc câu trả lời nâng cao**:
   Sử dụng trình bày Markdown chuyên nghiệp với tiêu đề (###), in đậm (**text**), danh sách gạch đầu dòng (-) và bố cục mạch lạc.

   MẪU PHẢN HỒI KHI HỎI VỀ ĐỊA ĐIỂM / LỊCH TRÌNH / ẨM THỰC:
   ### 🌟 [Tên địa điểm / Tên tour gợi ý]
   [Giới thiệu hấp dẫn 1-2 câu về vẻ đẹp hoặc nét đặc sắc của điểm đến].

   ### 📅 Lộ Trình Khung Giờ Đề Xuất
   - **Sáng (06:00 - 11:30)**: [Hoạt động ngắm bình minh, chụp ảnh check-in]
   - **Trưa (11:30 - 13:30)**: [Thưởng thức Gà Đốt Ô Thum / Cháo bò lá trúc tại quán nổi tiếng]
   - **Chiều (14:00 - 17:30)**: [Khám phá di sản Chùa Khmer / Hồ nước & Hoàng hôn]
   - **Tối (18:00 - 21:00)**: [Lưu trú Homestay view núi / Dạo phố đêm Tri Tôn]

   ### 🍜 Đặc Sản & Trải Nghiệm Không Thể Bỏ Qua
   - **[Tên món đặc sản]**: [Mô tả vị ngon & Mẹo ăn chuẩn vị địa phương]

   ### 💡 Mẹo Trải Nghiệm & Khung Giờ Vàng
   - **Thời điểm vàng**: [Khung giờ chụp ảnh đẹp nhất trong ngày]
   - **Phương tiện & Lưu ý**: [Đường đi, trang phục đi Chùa Khmer thích hợp]`;

interface Turn { role: 'user' | 'assistant'; content: string }

async function loadHistory(sessionId: string): Promise<Turn[]> {
  const { data } = await supabase
    .from('chat_sessions').select('turns').eq('session_id', sessionId).single();
  if (!data) return [];
  return (data.turns as Turn[]).slice(-6);
}

async function saveHistory(sessionId: string, history: Turn[]): Promise<void> {
  await supabase.from('chat_sessions')
    .upsert({ session_id: sessionId, turns: history.slice(-20) }, { onConflict: 'session_id' });
}

async function generateQueryEmbedding(text: string): Promise<number[] | null> {
  const keys = [process.env.GEMINI_API_KEY, process.env.GEMINI_API_KEY_2].filter(Boolean) as string[];
  for (const key of keys) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'models/gemini-embedding-001',
            content: { parts: [{ text }] },
            outputDimensionality: 768,
          }),
          signal: AbortSignal.timeout(3500),
        }
      );
      if (res.ok) {
        const data = await res.json();
        const v = data?.embedding?.values;
        if (Array.isArray(v) && v.length > 0) return v;
      }
    } catch { /* silent */ }
  }
  return null;
}

// ── Observability: immutable audit log ─────────────────────────────────────
interface ChatLogEntry {
  session_id: string;
  query: string;
  response_preview?: string;
  provider_used?: string;
  rag_method?: string;
  places_count?: number;
  latency_ms?: number;
  is_out_scope?: boolean;
}

function logChatEvent(entry: ChatLogEntry): void {
  // Fire-and-forget — wrap in Promise.resolve to get proper .catch()
  void Promise.resolve(supabase.from('chat_logs').insert(entry))
    .then(({ error }) => { if (error) console.warn('[ChatLog] Insert failed:', error.message); })
    .catch((e: unknown) => console.warn('[ChatLog] Error:', e));
}
// ── Smart Intent Classifier & Out-of-Scope Guard ────────────────────────────
function checkIsOutOfScope(queryStr: string, history: Turn[]): boolean {
  const lower = queryStr.toLowerCase();

  // 1. Explicitly ALLOW if query mentions Tri Tôn or An Giang or Bảy Núi
  if (lower.includes('tri tôn') || lower.includes('an giang') || lower.includes('bảy núi')) {
    return false;
  }

  // 2. Explicitly ALLOW if query contains travel/direction intent
  const travelKeywords = [
    'đi từ', 'từ ', 'xe ', 'bến xe', 'vé xe', 'phương tiện', 'khoảng cách',
    'bao xa', 'bao nhiêu km', 'mất bao lâu', 'mất mấy tiếng', 'mất mấy giờ',
    'đường đi', 'di chuyển', 'bằng xe', 'chặng'
  ];
  const isTravelQuery = travelKeywords.some(kw => lower.includes(kw));
  if (isTravelQuery) {
    return false;
  }

  // 3. Explicitly ALLOW if session history exists and query is follow-up
  if (history.length > 0) {
    return false;
  }

  // 4. Check for HARD non-Tri Tôn topics
  const hardOutOfScope = [
    'cổ phiếu', 'chứng khoán', 'bitcoin', 'crypto', 'bóng đá',
    'thời tiết mỹ', 'thời tiết hà nội', 'thời tiết đà nẵng',
    'du lịch hà nội', 'du lịch đà nẵng', 'du lịch phú quốc', 'du lịch sapa', 'du lịch đà lạt',
    'lập trình python', 'viết code java', 'toán học', 'hóa học'
  ];
  if (hardOutOfScope.some(topic => lower.includes(topic))) {
    return true;
  }

  // 5. If query explicitly asks about another major region without travel intent
  const externalPlaces = ['hà nội', 'sài gòn', 'đà nẵng', 'nha trang', 'vũng tàu', 'đà lạt', 'phú quốc', 'sapa'];
  if (externalPlaces.some(p => lower.includes(p))) {
    return true;
  }

  return false;
}

// ── Context-Aware Video Discovery Helper ────────────────────────────────────
async function fetchContextAwareVideos(queryStr: string, matchedPlaces: Record<string, unknown>[] = []) {
  const lower = queryStr.toLowerCase();
  const matchedIds = matchedPlaces.map(p => p.id as string).filter(Boolean);

  // 1. Try matching by matched_poi_id
  if (matchedIds.length > 0) {
    const { data: poiVideos } = await supabase
      .from('video_discoveries')
      .select('id, title, video_url, thumbnail_url, author_name, view_count')
      .in('matched_poi_id', matchedIds)
      .limit(2);
    if (poiVideos && poiVideos.length > 0) return poiVideos;
  }

  // 2. Topic keyword matching in title
  let topicKeyword = '';
  if (lower.includes('gà đốt') || lower.includes('ô thum')) topicKeyword = 'Gà Đốt';
  else if (lower.includes('chùa') || lower.includes('khmer')) topicKeyword = 'Chùa';
  else if (lower.includes('hồ') || lower.includes('tà pạ')) topicKeyword = 'Tà Pạ';
  else if (lower.includes('cô tô') || lower.includes('phụng hoàng')) topicKeyword = 'Cô Tô';
  else if (lower.includes('cháo bò')) topicKeyword = 'Cháo Bò';
  else if (lower.includes('ăn') || lower.includes('đặc sản')) topicKeyword = 'Ăn';
  else if (lower.includes('homestay') || lower.includes('khách sạn')) topicKeyword = 'Homestay';

  if (topicKeyword) {
    const { data: topicVideos } = await supabase
      .from('video_discoveries')
      .select('id, title, video_url, thumbnail_url, author_name, view_count')
      .ilike('title', `%${topicKeyword}%`)
      .limit(2);
    if (topicVideos && topicVideos.length > 0) return topicVideos;
  }

  // 3. Fallback: return default videos
  const { data: fallbackVideos } = await supabase
    .from('video_discoveries')
    .select('id, title, video_url, thumbnail_url, author_name, view_count')
    .limit(2);

  return fallbackVideos || [];
}

function buildSuggestions(lower: string): string[] {
  if (lower.includes('ăn') || lower.includes('gà đốt') || lower.includes('cháo bò'))
    return ['Quán Gà Đốt Ô Thum chuẩn vị nhất', 'Địa chỉ quán Cháo Bò lá trúc', 'Bún nước lèo Khmer'];
  if (lower.includes('chùa') || lower.includes('khmer') || lower.includes('văn hóa'))
    return ['Đường lên Chùa Tà Pạ', 'Cổng trời Chùa Koh Kas', 'Lễ hội Đua bò Khmer'];
  if (lower.includes('ở') || lower.includes('homestay') || lower.includes('khách sạn'))
    return ['Homestay view núi Cô Tô đẹp nhất', 'Khách sạn trung tâm Thị trấn Tri Tôn', 'Khu cắm trại Hồ Ô Thum'];
  return ['Đặc sản Gà Đốt Ô Thum ở đâu?', 'Lộ trình 2 ngày 1 đêm Tri Tôn', 'Khung giờ chụp ảnh đẹp Hồ Tà Pạ'];
}

// ── Non-streaming fallback when Gemini streaming unavailable ─────────────────
async function callNonStreamingFallback(
  userMsg: string, systemMsg: string
): Promise<string> {
  // Try Groq
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${groqKey}` },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'system', content: systemMsg }, { role: 'user', content: userMsg }],
        }),
        signal: AbortSignal.timeout(6000),
      });
      if (res.ok) {
        const d = await res.json();
        const t = d?.choices?.[0]?.message?.content;
        if (t) return t.trim();
      }
    } catch { /* try next */ }
  }
  // Try OpenRouter
  const orKey = process.env.OPENROUTER_API_KEY;
  if (orKey) {
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${orKey}` },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.3-70b-instruct:free',
          messages: [{ role: 'system', content: systemMsg }, { role: 'user', content: userMsg }],
        }),
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) {
        const d = await res.json();
        const t = d?.choices?.[0]?.message?.content;
        if (t) return t.trim();
      }
    } catch { /* fallback */ }
  }
  return 'Tôi đã tổng hợp dữ liệu địa điểm Tri Tôn cho Bạn. Vui lòng tham khảo các gợi ý địa danh bên dưới!';
}

// ── SSE helper ───────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return new Response('Invalid JSON', { status: 400 }); }

  const queryStr = (body.query as string)?.trim();
  if (!queryStr) return new Response('Missing query', { status: 400 });
  const sessionId = (body.session_id as string)?.trim() || 'anonymous';

  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      const send = (obj: object) => {
        try { controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`)); } catch { /* closed */ }
      };

      try {
        const t0 = Date.now();
        const lower = queryStr.toLowerCase();

        // 1. Load history & generate embedding in parallel
        const [history, queryVector] = await Promise.all([
          loadHistory(sessionId),
          generateQueryEmbedding(queryStr),
        ]);

        // 2. Out-of-scope guard with history context
        if (checkIsOutOfScope(queryStr, history)) {
          send({ type: 'text_delta', delta: 'Tôi chỉ hỗ trợ các nội dung liên quan đến Tri Tôn và dự án Du Lịch Tri Tôn. Bạn hãy đặt câu hỏi trong phạm vi này.' });
          send({ type: 'suggestions', data: ['Hồ Tà Pạ có gì đẹp?', 'Ăn Gà Đốt Ô Thum ở đâu?', 'Chùa Khmer Bảy Núi'] });
          send({ type: 'done' });
          logChatEvent({ session_id: sessionId, query: queryStr, is_out_scope: true });
          controller.close();
          return;
        }

        // Vector search → ILIKE fallback
        let places: Record<string, unknown>[] = [];
        let ragMethod = 'none';
        if (queryVector) {
          const { data: vm } = await supabase.rpc('match_places', {
            query_embedding: queryVector, match_threshold: 0.3, match_count: 5,
          });
          if (vm && vm.length > 0) { places = vm; ragMethod = 'vector'; }
        }
        if (places.length === 0) {
          const { data: tm } = await supabase.from('places')
            .select('id,slug,name,commune,category,rating,image_url,description,golden_time_windows')
            .or(`name.ilike.%${queryStr}%,category.ilike.%${queryStr}%,commune.ilike.%${queryStr}%,description.ilike.%${queryStr}%`)
            .limit(4);
          if (tm) { places = tm; ragMethod = 'ilike'; }
        }
        if (places.length === 0) {
          const { data: hot } = await supabase.from('places')
            .select('id,slug,name,commune,category,rating,image_url,golden_time_windows')
            .eq('is_hot', true).limit(3);
          if (hot) { places = hot; ragMethod = 'hot_fallback'; }
        }

        const formattedPlaces = places.map(p => ({
          id: p.id, slug: p.slug || p.id, name: p.name,
          commune: p.commune, category: p.category,
          rating: p.rating, image_url: p.image_url,
        }));

        const ragContext = places.length > 0
          ? places.map(p =>
              `- ${p.name} (Thuộc ${p.commune}): Thể loại ${p.category}. Đánh giá: ${p.rating}/5. Mô tả: ${p.description || ''}`
            ).join('\n')
          : 'Không có dữ liệu địa điểm cụ thể.';

        // Fetch context-aware videos (POI matched or Topic matched)
        const videos = await fetchContextAwareVideos(queryStr, places);

        // Send structural data early — user sees cards before AI finishes typing
        send({ type: 'places', data: formattedPlaces });
        send({ type: 'videos', data: videos });

        // Build system message with history
        const historySnippet = history.length > 0
          ? '\n\nLịch sử hội thoại gần nhất:\n' +
            history.map(t => `${t.role === 'user' ? 'Bạn' : 'Tôi'}: ${t.content}`).join('\n')
          : '';
        const systemMsg = SYSTEM_PROMPT + historySnippet;
        const userMsg = `Thông tin bối cảnh xác minh từ CSDL Tri Tôn:\n${ragContext}\n\nCâu hỏi của Bạn: ${queryStr}`;

        let fullText = '';
        const geminiKeys = [process.env.GEMINI_API_KEY, process.env.GEMINI_API_KEY_2].filter(Boolean) as string[];

        // Try streaming Gemini (try each key)
        let geminiStreamed = false;
        for (const key of geminiKeys) {
          if (geminiStreamed) break;
          try {
            const geminiRes = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?key=${key}&alt=sse`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: `${systemMsg}\n\n${userMsg}` }] }] }),
                signal: AbortSignal.timeout(15000),
              }
            );

            if (geminiRes.ok && geminiRes.body) {
              const reader = geminiRes.body.getReader();
              const decoder = new TextDecoder();
              let buf = '';

              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buf += decoder.decode(value, { stream: true });
                const lines = buf.split('\n');
                buf = lines.pop() || '';
                for (const line of lines) {
                  if (!line.startsWith('data: ')) continue;
                  try {
                    const chunk = JSON.parse(line.slice(6));
                    const delta = chunk?.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (delta) {
                      fullText += delta;
                      send({ type: 'text_delta', delta });
                    }
                  } catch { /* malformed chunk — skip */ }
                }
              }
              if (fullText) geminiStreamed = true;
            }
          } catch (e) {
            console.warn(`[Stream] Gemini key failed:`, e);
          }
        }

        // Non-streaming fallback if Gemini failed
        if (!fullText) {
          console.warn('[Stream] Gemini unavailable, falling back to non-streaming provider');
          fullText = await callNonStreamingFallback(userMsg, systemMsg);
          send({ type: 'text_delta', delta: fullText });
        }

        const latencyMs = Date.now() - t0;
        const providerUsed = geminiStreamed ? 'streaming-gemini' : 'fallback-nonstream';

        // Persist to Supabase (fire-and-forget)
        saveHistory(sessionId, [
          ...history,
          { role: 'user', content: queryStr },
          { role: 'assistant', content: fullText.slice(0, 1200) },
        ]).catch(e => console.warn('[Memory] saveHistory failed:', e));

        // Audit log (immutable)
        logChatEvent({
          session_id: sessionId,
          query: queryStr,
          response_preview: fullText.slice(0, 300),
          provider_used: providerUsed,
          rag_method: ragMethod,
          places_count: formattedPlaces.length,
          latency_ms: latencyMs,
          is_out_scope: false,
        });

        send({ type: 'suggestions', data: buildSuggestions(lower) });
        send({ type: 'done' });

      } catch (e) {
        console.error('[Stream] Fatal error:', e);
        send({ type: 'error', message: 'Service error' });
      } finally {
        try { controller.close(); } catch { /* already closed */ }
      }
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Vercel edge: disable buffering
    },
  });
}

export async function GET() {
  return new Response(JSON.stringify({ service: 'Tri Ton AI Stream', status: 'ready' }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
