import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { streamAIResponse, lookupSemanticCache } from '@/lib/aiProvider';
import { getDynamicSystemConfig } from '@/lib/systemConfig';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://knmlbwsmfljlabhvqfid.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const SYSTEM_PROMPT = `Bạn là Trợ lý Du Lịch Tri Tôn AI chuyên sâu về du lịch, ẩm thực, di sản văn hóa Khmer và thắng cảnh Tri Tôn, An Giang.
Xưng hô bắt buộc: Tự xưng "Tôi" và gọi người dùng là "Bạn".

QUY TẮC CỐT LÕI (MANDATORY RULES):
1. **Ưu tiên thông tin thực tế & cập nhật trên Internet**:
   - Luôn luôn ưu tiên thông tin thực tế mới nhất, khách quan, chính xác từ kết quả tìm kiếm internet về địa danh, giờ mở cửa, giá cả, món ăn, dịch vụ tại Tri Tôn, An Giang.

2. **Quy tắc đính kèm Link Google Maps và TikTok ngay dưới TỪNG ĐỊA ĐIỂM được nhắc đến**:
   - Mỗi khi bạn gợi ý hoặc nhắc đến bất kỳ địa điểm, quán ăn, thắng cảnh, chùa chiền nào, bạn BẮT BUỘC phải đính kèm ngay 2 đường link bên dưới địa điểm đó theo đúng định dạng Markdown sau:
     [📍 Chỉ đường Google Maps](https://www.google.com/maps/search/?api=1&query=<Tên_Địa_Điểm>+<Tên_Xã_hoặc_Thị_trấn>+Tri+Tôn+An+Giang)  •  [▶ Xem TikTok Video](https://www.tiktok.com/search?q=<Tên_Địa_Điểm>+Tri+Tôn)
   
   - QUAN TRỌNG: Không gom link về cuối bài mà phải để NGAY BÊN DƯỚI TỪNG ĐỊA ĐIỂM được gợi ý!
   - Ví dụ:
     ### 1. Hồ Tà Pạ
     Hồ nước ngọt xanh màu ngọc bích nằm trên đỉnh đồi Tà Pạ, xã Núi Tô. Được mệnh danh là Tuyệt tình cốc của miền Tây.
     [📍 Chỉ đường Google Maps](https://www.google.com/maps/search/?api=1&query=Hồ+Tà+Pạ+Xã+Núi+Tô+Tri+Tôn+An+Giang)  •  [▶ Xem TikTok Video](https://www.tiktok.com/search?q=Hồ+Tà+Pạ+Tri+Tôn)

     ### 2. Quán Gà Đốt Ô Thum
     Đặc sản gà thả đồi ướp lá chúc nướng than hồng thơm lừng ven hồ Ô Thum, xã Ô Lâm.
     [📍 Chỉ đường Google Maps](https://www.google.com/maps/search/?api=1&query=Gà+Đốt+Ô+Thum+Xã+Ô+Lâm+Tri+Tôn+An+Giang)  •  [▶ Xem TikTok Video](https://www.tiktok.com/search?q=Gà+Đốt+Ô+Thum+Tri+Tôn)

3. **Phạm vi hỗ trợ**:
   - Nếu câu hỏi hoàn toàn ngoài phạm vi Tri Tôn/An Giang: "Tôi chỉ hỗ trợ các nội dung liên quan đến Tri Tôn và dự án Du Lịch Tri Tôn. Bạn hãy đặt câu hỏi trong phạm vi này."
   - Tuyệt đối không dùng cụm từ "Huyện Tri Tôn" (dùng Xã hoặc Thị trấn cụ thể như Xã Núi Tô, Xã Ô Lâm, Xã Châu Lăng, Xã Cô Tô, Xã Lương Phi, Thị trấn Tri Tôn).`;

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
  const keys = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY_4,
  ].filter(Boolean) as string[];
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

// ── Observability ────────────────────────────────────────────────────────────
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
  void Promise.resolve(supabase.from('chat_logs').insert(entry))
    .then(({ error }) => { if (error) console.warn('[ChatLog] Insert failed:', error.message); })
    .catch((e: unknown) => console.warn('[ChatLog] Error:', e));
}

// ── Smart Intent Classifier & Out-of-Scope Guard ────────────────────────────
function checkIsOutOfScope(queryStr: string, history: Turn[]): boolean {
  const lower = queryStr.toLowerCase();

  if (lower.includes('tri tôn') || lower.includes('an giang') || lower.includes('bảy núi')) {
    return false;
  }

  const travelKeywords = [
    'đi từ', 'từ ', 'xe ', 'bến xe', 'vé xe', 'phương tiện', 'khoảng cách',
    'bao xa', 'bao nhiêu km', 'mất bao lâu', 'mất mấy tiếng', 'mất mấy giờ',
    'đường đi', 'di chuyển', 'bằng xe', 'chặng'
  ];
  if (travelKeywords.some(kw => lower.includes(kw))) {
    return false;
  }

  if (history.length > 0) {
    return false;
  }

  const hardOutOfScope = [
    'cổ phiếu', 'chứng khoán', 'bitcoin', 'crypto', 'bóng đá',
    'thời tiết mỹ', 'thời tiết hà nội', 'thời tiết đà nẵng',
    'du lịch hà nội', 'du lịch đà nẵng', 'du lịch phú quốc', 'du lịch sapa', 'du lịch đà lạt',
    'lập trình python', 'viết code java', 'toán học', 'hóa học'
  ];
  if (hardOutOfScope.some(topic => lower.includes(topic))) {
    return true;
  }

  const externalPlaces = ['hà nội', 'sài gòn', 'đà nẵng', 'nha trang', 'vũng tàu', 'đà lạt', 'phú quốc', 'sapa'];
  if (externalPlaces.some(p => lower.includes(p))) {
    return true;
  }

  return false;
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

// ── SSE Stream Handler ───────────────────────────────────────────────────────
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

        // 2.5. Check Semantic Vector Cache (< 10ms response if similarity >= 0.90)
        if (queryVector) {
          const cacheHit = await lookupSemanticCache(queryVector, supabase, 0.90);
          if (cacheHit) {
            send({ type: 'places', data: cacheHit.places_json || [] });
            send({ type: 'text_delta', delta: cacheHit.answer_text });
            send({ type: 'suggestions', data: buildSuggestions(lower) });
            send({ type: 'done' });

            logChatEvent({
              session_id: sessionId,
              query: queryStr,
              response_preview: cacheHit.answer_text.slice(0, 300),
              provider_used: 'semantic-cache-hit',
              rag_method: 'vector-cache',
              places_count: (cacheHit.places_json || []).length,
              latency_ms: Date.now() - t0,
              is_out_scope: false,
            });
            controller.close();
            return;
          }
        }

        // 3. Database Places Matching (for place cards header)
        let places: Record<string, unknown>[] = [];
        let ragMethod = 'none';
        if (queryVector) {
          const { data: vm } = await supabase.rpc('match_places', {
            query_embedding: queryVector, match_threshold: 0.3, match_count: 4,
          });
          if (vm && vm.length > 0) { places = vm; ragMethod = 'vector'; }
        }
        if (places.length === 0) {
          const { data: tm } = await supabase.from('places')
            .select('id,slug,name,commune,category,rating,image_url,description,golden_time_windows')
            .or(`name.ilike.%${queryStr}%,category.ilike.%${queryStr}%,commune.ilike.%${queryStr}%,description.ilike.%${queryStr}%`)
            .limit(3);
          if (tm) { places = tm; ragMethod = 'ilike'; }
        }

        const formattedPlaces = places.map(p => ({
          id: p.id, slug: p.slug || p.id, name: p.name,
          commune: p.commune, category: p.category,
          rating: p.rating, image_url: p.image_url,
        }));

        const ragContext = places.length > 0
          ? places.map(p =>
              `- ${p.name} (${p.commune}): ${p.category}. Đánh giá: ${p.rating}/5. ${p.description ? p.description.slice(0, 150) : ''}`
            ).join('\n')
          : '';

        // Send place cards early (if any)
        if (formattedPlaces.length > 0) {
          send({ type: 'places', data: formattedPlaces });
        }

        // Build system message with history
        const activeSystemPrompt = await getDynamicSystemConfig('SYSTEM_PROMPT', SYSTEM_PROMPT);
        const historySnippet = history.length > 0
          ? '\n\nLịch sử hội thoại gần nhất:\n' +
            history.map(t => `${t.role === 'user' ? 'Bạn' : 'Tôi'}: ${t.content}`).join('\n')
          : '';
        const systemMsg = activeSystemPrompt + historySnippet;
        
        // Priority prompt: Always prioritize live web search/internet facts
        const userMsg = ragContext
          ? `Câu hỏi của Bạn: ${queryStr}\n\n[Lưu ý: Luôn ưu tiên kiến thức thực tế và kết quả tìm kiếm internet mới nhất. Tham khảo thêm CSDL địa phương nếu phù hợp:\n${ragContext}]`
          : `Câu hỏi của Bạn: ${queryStr}\n\n[Lưu ý: Hãy tìm kiếm và cung cấp thông tin thực tế, chính xác nhất về Tri Tôn, An Giang trên internet]`;

        let fullText = '';
        let providerUsed = 'none';

        // Delegate streaming generation to AI Provider
        for await (const chunk of streamAIResponse(systemMsg, userMsg)) {
          if (chunk.type === 'delta' && chunk.content) {
            fullText += chunk.content;
            send({ type: 'text_delta', delta: chunk.content });
          }
          if (chunk.type === 'done' && chunk.provider) {
            providerUsed = chunk.provider;
          }
        }

        // Send suggestion chips
        send({ type: 'suggestions', data: buildSuggestions(lower) });
        send({ type: 'done' });

        // Save conversation turn
        if (fullText.trim()) {
          const updatedHistory: Turn[] = [
            ...history,
            { role: 'user', content: queryStr },
            { role: 'assistant', content: fullText },
          ];
          void saveHistory(sessionId, updatedHistory);
        }

        // Observability logging
        logChatEvent({
          session_id: sessionId,
          query: queryStr,
          response_preview: fullText.slice(0, 300),
          provider_used: providerUsed,
          rag_method: ragMethod,
          places_count: formattedPlaces.length,
          latency_ms: Date.now() - t0,
          is_out_scope: false,
        });

      } catch (err) {
        console.error('Chat stream error:', err);
        send({ type: 'error', message: 'Lỗi xử lý luồng AI' });
      } finally {
        controller.close();
      }
    }
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
