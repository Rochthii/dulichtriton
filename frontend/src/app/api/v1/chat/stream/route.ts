import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { streamAIResponse, generateQueryEmbedding } from '@/lib/aiProvider';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://knmlbwsmfljlabhvqfid.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
const supabase = createClient(supabaseUrl, supabaseKey);

// In-Memory Hot Question Cache (0ms latency, zero quota usage)
const HOT_QUERY_CACHE = new Map<string, { answer: string; places: any[]; suggestions: string[]; timestamp: number }>();

// ── Types ────────────────────────────────────────────────────────────────────
interface Turn {
  role: 'user' | 'assistant';
  content: string;
}

// ── Base System Prompt with Tri Tôn Master Persona & Link Formats ──────────────
const BASE_SYSTEM_PROMPT = `
Bạn là Trợ Lý AI Du Lịch Tri Tôn chuyên sâu, chuyên gia hướng dẫn bản địa 24/7 của huyện Tri Tôn, tỉnh An Giang, Việt Nam.
Giọng điệu: Thân thiện, mến khách, hiểu biết sâu sắc về văn hóa Khmer, ẩm thực và danh thắng Bảy Núi.

1. **Ưu tiên thông tin thực tế & cập nhật trên Internet**:
   - Luôn luôn ưu tiên thông tin thực tế mới nhất, khách quan, chính xác từ kết quả tìm kiếm internet về địa danh, giờ mở cửa, giá cả, món ăn, dịch vụ tại Tri Tôn, An Giang.

2. **Quy tắc đính kèm Link Google Maps và TikTok ngay dưới TỪNG ĐỊA ĐIỂM được nhắc đến**:
   - Mỗi khi bạn gợi ý hoặc nhắc đến bất kỳ địa điểm, quán ăn, thắng cảnh, chùa chiền nào, bạn BẮT BUỘC phải đính kèm ngay 2 đường link bên dưới địa điểm đó theo đúng định dạng Markdown sau (sử dụng hashtag TikTok chuẩn không dấu để mở thẳng video trên điện thoại):
     [📍 Chỉ đường Google Maps](https://www.google.com/maps/search/?api=1&query=<Tên_Địa_Điểm>+<Tên_Xã_hoặc_Thị_trấn>+Tri+Tôn+An+Giang)  •  [▶ Xem TikTok Video](https://www.tiktok.com/tag/<Hashtag_Địa_Điểm>)
   
   - QUAN TRỌNG: Không gom link về cuối bài mà phải để NGAY BÊN DƯỚI TỪNG ĐỊA ĐIỂM được gợi ý!
   - Ví dụ:
     ### 1. Hồ Tà Pạ
     Hồ nước ngọt xanh màu ngọc bích nằm trên đỉnh đồi Tà Pạ, xã Núi Tô. Được mệnh danh là Tuyệt tình cốc của miền Tây.
     [📍 Chỉ đường Google Maps](https://www.google.com/maps/search/?api=1&query=Hồ+Tà+Pạ+Xã+Núi+Tô+Tri+Tôn+An+Giang)  •  [▶ Xem TikTok Video](https://www.tiktok.com/tag/hotapa)

     ### 2. Quán Gà Đốt Ô Thum
     Đặc sản gà thả đồi ướp lá chúc nướng than hồng thơm lừng ven hồ Ô Thum, xã Ô Lâm. Nên gọi đặt trước 30-45 phút trước khi đến.
     [📍 Chỉ đường Google Maps](https://www.google.com/maps/search/?api=1&query=Gà+Đốt+Ô+Thum+Xã+Ô+Lâm+Tri+Tôn+An+Giang)  •  [▶ Xem TikTok Video](https://www.tiktok.com/tag/gadotothum)

3. **Cẩm nang Ẩm thực & Đặc sản Bảy Núi 2026**:
   - Gà Đốt Ô Thum (Xã Ô Lâm): Nướng than 35-45 phút, cần dặn du khách gọi đặt trước khi khởi hành để không phải chờ lâu.
   - Cháo Bò Tri Tôn (Thị trấn Tri Tôn & Xã Châu Lăng): Lòng bò tươi béo ngậy, nước lèo nấu trái chúc thơm thanh, ăn kèm bánh mì hoặc bún.
   - Bún Nước Lèo Khmer (Thị trấn Tri Tôn): Nấu từ mắm cá sặc/cá lóc, bắp chuối, ngải bún và củ nghệ tươi.
   - Bánh Cống, Bánh Bò Thốt Nốt, Nước Thốt Nốt Tươi ướp lạnh.

4. **Tôn trọng văn hóa Chùa Tháp Khmer**:
   - Khi vào chánh điện: Mặc trang phục lịch sự, cởi giày dép, không chỉ ngón tay trực tiếp vào tượng Phật.
`;

// ── Helpers ──────────────────────────────────────────────────────────────────
async function getDynamicSystemConfig(key: string, defaultValue: string): Promise<string> {
  try {
    const { data } = await supabase
      .from('system_configs')
      .select('config_value')
      .eq('config_key', key)
      .maybeSingle();
    return data?.config_value || defaultValue;
  } catch {
    return defaultValue;
  }
}

async function loadHistory(sessionId: string): Promise<Turn[]> {
  try {
    const { data } = await supabase
      .from('conversations')
      .select('turns')
      .eq('session_id', sessionId)
      .maybeSingle();
    return (data?.turns as Turn[]) || [];
  } catch {
    return [];
  }
}

async function saveHistory(sessionId: string, turns: Turn[]): Promise<void> {
  try {
    await supabase.from('conversations').upsert(
      {
        session_id: sessionId,
        turns: turns.slice(-10),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'session_id' }
    );
  } catch (err) {
    console.warn('[ChatStream] Save history warning:', err);
  }
}

function logChatEvent(entry: {
  session_id: string;
  query: string;
  response_preview?: string;
  provider_used?: string;
  rag_method?: string;
  places_count?: number;
  latency_ms?: number;
  is_out_scope?: boolean;
}) {
  void Promise.resolve(
    supabase.from('chat_logs').insert({
      session_id: entry.session_id,
      user_message: entry.query,
      bot_response: entry.response_preview || '',
      provider_used: entry.provider_used || 'unknown',
      rag_method: entry.rag_method || 'none',
      places_count: entry.places_count || 0,
      latency_ms: entry.latency_ms || 0,
      is_out_of_scope: entry.is_out_scope || false,
    })
  ).catch(e => console.warn('[Observability] Warning:', e));
}

async function lookupSemanticCache(
  vector: number[],
  client: typeof supabase,
  threshold: number = 0.90
): Promise<{ answer_text: string; places_json: Record<string, unknown>[] } | null> {
  try {
    const { data, error } = await client.rpc('match_semantic_cache', {
      query_embedding: vector,
      match_threshold: threshold,
      match_count: 1,
    });
    if (error || !data || data.length === 0) return null;
    return {
      answer_text: data[0].answer_text,
      places_json: data[0].places_json || [],
    };
  } catch {
    return null;
  }
}

async function fetchLiveWeatherContext(): Promise<string> {
  try {
    const res = await fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=10.42&longitude=104.98&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=Asia%2FHo_Chi_Minh',
      { next: { revalidate: 1800 } }
    );
    if (!res.ok) return '';
    const data = await res.json();
    const cur = data.current;
    if (!cur) return '';

    let weatherDesc = 'trời đẹp, thuận lợi du lịch';
    if (cur.weather_code >= 51 && cur.weather_code <= 67) weatherDesc = 'có mưa rải rác';
    else if (cur.weather_code >= 80) weatherDesc = 'mưa rào';
    else if (cur.weather_code === 0) weatherDesc = 'trời quang, nắng đẹp';
    else if (cur.weather_code <= 3) weatherDesc = 'nhiều mây, mát mẻ';

    return `\n\n[Thời tiết Tri Tôn hiện tại: ${cur.temperature_2m}°C, ${weatherDesc}, gió ${cur.wind_speed_10m} km/h. Hãy chủ động nhắc du khách mang nón lá/áo mưa nếu cần.]`;
  } catch {
    return '';
  }
}

function checkIsOutOfScope(query: string, history: Turn[] = []): boolean {
  const lower = query.toLowerCase();

  const travelKeywords = [
    'tri tôn', 'an giang', 'tà pạ', 'ô thum', 'cô tô', 'tức dụp', 'núi tô', 'châu lăng', 'ô lâm',
    'gà đốt', 'cháo bò', 'chùa', 'khmer', 'thốt nốt', 'du lịch', 'khách sạn', 'homestay', 'quán',
    'lịch trình', 'tour', 'xe', 'đường', 'thuê', 'ăn gì', 'ở đâu', 'chơi gì', 'giá vé', 'thời tiết'
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
    return ['Quán Gà Đốt Ô Thum chuẩn vị nhất', 'Địa chỉ quán Cháo Bò lá chúc', 'Bún nước lèo Khmer'];
  if (lower.includes('chùa') || lower.includes('khmer') || lower.includes('văn hóa'))
    return ['Đường lên Chùa Tà Pạ', 'Cổng trời Chùa Koh Kas', 'Lễ hội Đua bò Khmer'];
  if (lower.includes('ở') || lower.includes('homestay') || lower.includes('khách sạn'))
    return ['Homestay view núi Cô Tô đẹp nhất', 'Khách sạn trung tâm Thị trấn Tri Tôn', 'Khu cắm trại Hồ Ô Thum'];
  return ['Thời tiết Tri Tôn hôm nay thế nào?', 'Gà Đốt Ô Thum có cần đặt trước?', 'Lịch trình 1 ngày tối ưu'];
}

// ── SSE Stream Handler ───────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try { 
    body = await req.json(); 
  } catch { 
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { 
      status: 400, 
      headers: { 'Content-Type': 'application/json' } 
    }); 
  }

  // Support query, question, message, or prompt
  const queryStr = (
    (body.query as string) || 
    (body.question as string) || 
    (body.message as string) || 
    (body.prompt as string) || 
    ''
  ).trim();

  if (!queryStr) {
    return new Response(JSON.stringify({ error: 'Missing query' }), { 
      status: 400, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }

  const sessionId = (body.session_id as string)?.trim() || 'anonymous';
  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      const send = (obj: object) => {
        try { 
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`)); 
        } catch { /* closed */ }
      };

      try {
        const t0 = Date.now();
        const lower = queryStr.toLowerCase();
        const cleanQ = lower.replace(/[?!.,]/g, '').trim();

        // 0. Check In-Memory Instant Hot Cache (0ms response, 0 API calls, 0 DB queries)
        const hotHit = HOT_QUERY_CACHE.get(cleanQ);
        if (hotHit && Date.now() - hotHit.timestamp < 24 * 60 * 60 * 1000) {
          if (hotHit.places && hotHit.places.length > 0) {
            send({ 
              type: 'metadata', 
              places: hotHit.places, 
              suggestions: hotHit.suggestions || buildSuggestions(lower),
              data: hotHit.places 
            });
          }

          const words = hotHit.answer.split(' ');
          for (let i = 0; i < words.length; i += 3) {
            const chunk = words.slice(i, i + 3).join(' ') + ' ';
            send({ type: 'token', token: chunk, delta: chunk });
            await new Promise(r => setTimeout(r, 15));
          }

          send({ 
            type: 'done', 
            full_text: hotHit.answer,
            suggestions: hotHit.suggestions || buildSuggestions(lower),
            places: hotHit.places 
          });

          logChatEvent({
            session_id: sessionId,
            query: queryStr,
            response_preview: hotHit.answer.slice(0, 200),
            provider_used: 'in-memory-hot-cache',
            rag_method: 'ram-cache',
            latency_ms: Date.now() - t0,
            is_out_scope: false,
          });

          controller.close();
          return;
        }

        // 1. Load history, embedding & weather telemetry in parallel
        const [history, queryVector, weatherContext] = await Promise.all([
          loadHistory(sessionId),
          generateQueryEmbedding(queryStr),
          fetchLiveWeatherContext(),
        ]);

        // 2. Out-of-scope guard with history context
        if (checkIsOutOfScope(queryStr, history)) {
          const oosMsg = 'Tôi chỉ hỗ trợ các nội dung liên quan đến Tri Tôn và dự án Du Lịch Tri Tôn. Bạn hãy đặt câu hỏi trong phạm vi này.';
          send({ type: 'token', token: oosMsg, delta: oosMsg });
          send({ 
            type: 'done', 
            full_text: oosMsg,
            suggestions: ['Hồ Tà Pạ có gì đẹp?', 'Ăn Gà Đốt Ô Thum ở đâu?', 'Chùa Khmer Bảy Núi'] 
          });
          logChatEvent({ session_id: sessionId, query: queryStr, is_out_scope: true });
          controller.close();
          return;
        }

        // 2.5. Check Semantic Vector Cache (< 10ms response if similarity >= 0.90)
        if (queryVector) {
          const cacheHit = await lookupSemanticCache(queryVector, supabase, 0.90);
          if (cacheHit) {
            send({ 
              type: 'metadata', 
              places: cacheHit.places_json || [], 
              suggestions: buildSuggestions(lower),
              data: cacheHit.places_json || [] 
            });
            send({ type: 'token', token: cacheHit.answer_text, delta: cacheHit.answer_text });
            send({ 
              type: 'done', 
              full_text: cacheHit.answer_text,
              suggestions: buildSuggestions(lower),
              places: cacheHit.places_json || [] 
            });

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
          id: p.id, 
          slug: p.slug || p.id, 
          name: p.name,
          commune: p.commune, 
          category: p.category,
          rating: p.rating || 4.8, 
          image_url: p.image_url,
          imageUrl: p.image_url,
        }));

        const ragContext = places.length > 0
          ? places.map(p =>
              `- ${p.name} (${p.commune}): ${p.category}. Đánh giá: ${p.rating}/5. ${p.description ? String(p.description).slice(0, 150) : ''}`
            ).join('\n')
          : '';

        // Send metadata & place cards early
        send({ 
          type: 'metadata', 
          places: formattedPlaces, 
          suggestions: buildSuggestions(lower),
          data: formattedPlaces 
        });

        // Build system message with history & live weather context
        const activeSystemPrompt = await getDynamicSystemConfig('SYSTEM_PROMPT', BASE_SYSTEM_PROMPT);
        const historySnippet = history.length > 0
          ? '\n\nLịch sử hội thoại gần nhất:\n' +
            history.map(t => `${t.role === 'user' ? 'Bạn' : 'Tôi'}: ${t.content}`).join('\n')
          : '';
        const systemMsg = activeSystemPrompt + weatherContext + historySnippet;
        
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
            send({ 
              type: 'token', 
              token: chunk.content, 
              delta: chunk.content 
            });
          }
          if (chunk.type === 'done' && chunk.provider) {
            providerUsed = chunk.provider;
          }
        }

        // Send completion event
        send({ 
          type: 'done', 
          full_text: fullText,
          suggestions: buildSuggestions(lower),
          places: formattedPlaces 
        });

        // Save conversation turn
        if (fullText.trim()) {
          const updatedHistory: Turn[] = [
            ...history,
            { role: 'user', content: queryStr },
            { role: 'assistant', content: fullText },
          ];
          void saveHistory(sessionId, updatedHistory);

          // Cache in memory for subsequent identical queries
          HOT_QUERY_CACHE.set(cleanQ, {
            answer: fullText,
            places: formattedPlaces,
            suggestions: buildSuggestions(lower),
            timestamp: Date.now(),
          });
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
        const errMsg = 'Hiện tại hệ thống AI đang bận xử lý, bạn vui lòng thử lại sau giây lát nhé!';
        send({ type: 'token', token: errMsg, delta: errMsg });
        send({ type: 'done', full_text: errMsg, suggestions: ['Hồ Tà Pạ', 'Gà Đốt Ô Thum'] });
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
