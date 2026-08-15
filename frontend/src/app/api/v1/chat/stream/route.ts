import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { streamAIResponse, generateQueryEmbedding } from '@/lib/aiProvider';
import masterPois from '@/data/triton_pois_full.json';

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
     Đặc sản gà thả đồi ướp lá chúc đốt kín trong nồi thố thơm lừng ven hồ Ô Thum, xã Ô Lâm. Nên gọi đặt trước 30-45 phút trước khi đến.
     [📍 Chỉ đường Google Maps](https://www.google.com/maps/search/?api=1&query=Gà+Đốt+Ô+Thum+Xã+Ô+Lâm+Tri+Tôn+An+Giang)  •  [▶ Xem TikTok Video](https://www.tiktok.com/tag/gadotothum)

3. **Cẩm nang Ẩm thực & Đặc sản Bảy Núi 2026**:
   - Gà Đốt Ô Thum (Xã Ô Lâm): Chế biến theo phương pháp đốt truyền thống (đốt kín trong nồi/thố đậy nắp với sả và lá chúc tươi 35-45 phút — TUYỆT ĐỐI KHÔNG gọi là 'nướng' mà phải dùng từ 'đốt'). Luôn nhắc du khách nên gọi đặt trước 30-45 phút để quán chuẩn bị kịp.
   - Cháo Bò Tri Tôn (Thị trấn Tri Tôn & Xã Châu Lăng): Lòng bò tươi béo ngậy, nước lèo nấu trái chúc thơm thanh, ăn kèm bánh mì hoặc bún.
   - Bún Cá Củ Ngải Tri Tôn (Bún Cá Khmer): Nấu từ cá lóc đồng xào nghệ tươi, củ ngải bún giã nhuyễn thơm ngát, nước dùng xương ống thanh ngọt — TUYỆT ĐỐI KHÔNG DÙNG MẮM / KHÔNG PHẢI BÚN NƯỚC LÈO. Ăn kèm rau muống bào, bông điên điển, bắp chuối, rau nhút và heo quay da giòn.
   - Bánh Cống, Bánh Bò Thốt Nốt, Nước Thốt Nốt Tươi ướp lạnh.

4. **Tôn trọng văn hóa Chùa Tháp Khmer**:
   - Khi vào chánh điện: Mặc trang phục lịch sự, cởi giày dép, không chỉ ngón tay trực tiếp vào tượng Phật.

5. **Cẩm nang Tri Tôn Về Đêm (Quán Cà Phê Mở Muộn & Dạo Phố)**:
   - CHẠM Coffee & Tea (Đường 3/2, Thị trấn Tri Tôn): Sân vườn thoáng mát ngoài trời đón gió núi Bảy Núi về đêm, mở đến 22:00.
   - Lang Lang Coffee & Tea (Đường Trần Hưng Đạo, Thị trấn Tri Tôn): Không gian check-in hiện đại, trà thốt nốt tươi, mở đến 21:30.
   - Quy Coffee House (Đường Nam Kỳ Khởi Nghĩa, Thị trấn Tri Tôn): Phong cách mộc ấm cúng, acoustic cuối tuần, mở đến 22:00.
   - NY Coffee & Tea (Đường Nguyễn Trãi, Thị trấn Tri Tôn): Trà sữa & kem thốt nốt máy lạnh, mở đến 22:00.
   - Khu Ẩm Thực Chợ Đêm Tri Tôn & Quảng Trường: Dạo mát, ăn vặt, mở đến 22:30.

6. **XỬ LÝ CÂU HỎI ĐA VẾ / NHIỀU Ý CÙNG LÚC (MULTI-INTENT & COMPOUND QUESTIONS)**:
   - Khi người dùng đặt câu hỏi có từ 2-3 vế trở lên (Ví dụ: vừa hỏi cảnh đẹp/chùa, vừa hỏi quán ăn/gà đốt, vừa hỏi cafe tối hoặc homestay/lộ trình):
     1. BẮT BUỘC trả lời ĐẦY ĐỦ TỪNG VẾ câu hỏi, tuyệt đối không bỏ sót bất kỳ vế nào.
     2. Trình bày bài trả lời rõ ràng, tách bạch theo từng đề mục cụ thể:
        • ### 1. [Vế 1: Tên chủ đề/địa điểm] (Gợi ý chi tiết + Link Maps + Link TikTok)
        • ### 2. [Vế 2: Tên chủ đề/quán ăn] (Gợi ý chi tiết + Link Maps + Link TikTok)
        • ### 3. [Vế 3: Tên chủ đề/cafe/homestay] (Gợi ý chi tiết + Link Maps + Link TikTok)
     3. Đính kèm đầy đủ link Google Maps và TikTok cho từng địa điểm trong từng vế.
     4. Thêm mục '💡 Gợi ý sắp xếp thời gian di chuyển hợp lý' ở cuối để kết nối các điểm đến thành một hành trình thuận tiện (Sáng -> Trưa -> Chiều -> Tối).
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
  } catch { /* non-blocking */ }
}

function logChatEvent(payload: {
  session_id: string;
  query: string;
  response_preview?: string;
  provider_used?: string;
  rag_method?: string;
  places_count?: number;
  latency_ms?: number;
  is_out_scope?: boolean;
}): void {
  try {
    void supabase.from('chat_logs').insert({
      ...payload,
      created_at: new Date().toISOString(),
    });
  } catch { /* non-blocking */ }
}

async function lookupSemanticCache(
  queryVector: number[],
  supabaseClient: typeof supabase,
  threshold = 0.90
): Promise<{ answer_text: string; places_json: any[] } | null> {
  try {
    const { data, error } = await supabaseClient.rpc('match_semantic_cache', {
      query_embedding: queryVector,
      similarity_threshold: threshold,
      match_count: 1,
    });
    if (!error && data && data.length > 0) {
      return {
        answer_text: data[0].answer_text,
        places_json: data[0].places_json || [],
      };
    }
  } catch { /* non-blocking */ }
  return null;
}

async function fetchLiveWeatherContext(): Promise<string> {
  try {
    const res = await fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=10.4128&longitude=105.0068&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia%2FHo_Chi_Minh',
      { next: { revalidate: 1800 } }
    );
    if (!res.ok) return '';
    const data = await res.json();
    const cur = data?.current_weather;
    if (!cur) return '';
    return `\n\n[Dữ liệu thời tiết Tri Tôn thực tế hiện tại: Nhiệt độ ${Math.round(cur.temperature)}°C, Gió cấp ${Math.round(cur.windspeed)} km/h. Khuyên du khách đội nón lá/mũ rộng vành, mang kem chống nắng nếu đi vào buổi trưa.]`;
  } catch {
    return '';
  }
}

function checkIsOutOfScope(queryStr: string, history: Turn[]): boolean {
  const lower = queryStr.toLowerCase();

  if (lower.includes('tri tôn') || lower.includes('an giang') || lower.includes('bảy núi') || lower.includes('thất sơn')) {
    return false;
  }

  const travelKeywords = [
    'đi từ', 'từ ', 'xe ', 'bến xe', 'vé xe', 'phương tiện', 'khoảng cách',
    'bao xa', 'bao nhiêu km', 'mất bao lâu', 'mất mấy tiếng', 'mất mấy giờ',
    'đường đi', 'di chuyển', 'bằng xe', 'chặng', 'lịch trình', 'tour', 'khách sạn', 'homestay', 'quán ăn', 'chùa'
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
    return ['Quán Gà Đốt Ô Thum chuẩn vị nhất', 'Địa chỉ quán Cháo Bò lá chúc', 'Quán Bún Cá Củ Ngải Dì Dom'];
  if (lower.includes('chùa') || lower.includes('khmer') || lower.includes('văn hóa'))
    return ['Đường lên Chùa Tà Pạ', 'Cổng trời Chùa Koh Kas', 'Lễ hội Đua bò Bảy Núi'];
  if (lower.includes('ở') || lower.includes('homestay') || lower.includes('khách sạn'))
    return ['Homestay view núi Cô Tô đẹp nhất', 'Khách sạn trung tâm Thị trấn Tri Tôn', 'Khu cắm trại Hồ Ô Thum'];
  return ['Thời tiết Tri Tôn hôm nay thế nào?', 'Gà Đốt Ô Thum có cần đặt trước?', 'Lịch trình 1 ngày tối ưu'];
}

function extractSubQueries(query: string): string[] {
  const separators = [/ và /i, / rồi /i, / sau đó /i, / còn /i, / thế còn /i, / mà /i, /,/, /;/, /\?/, /\./];
  let segments = [query];
  for (const sep of separators) {
    segments = segments.flatMap(s => s.split(sep));
  }
  const cleanSegments = segments
    .map(s => s.trim())
    .filter(s => s.length >= 2);
  return cleanSegments.length > 0 ? cleanSegments : [query];
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

          controller.close();
          return;
        }

        // 1. Instant In-Memory RAM Entity Matching (0.001ms) from Master Data
        const subQueries = extractSubQueries(queryStr);
        const matchedPlacesMap = new Map<string, any>();

        for (const sq of subQueries) {
          const cleanSq = sq.toLowerCase().replace(/[?!.,]/g, '').trim();
          if (cleanSq.length < 2) continue;

          const localMatches = (masterPois as any[]).filter(p => {
            const pName = (p.name || '').toLowerCase();
            const pCommune = (p.commune || '').toLowerCase();
            const pCategory = (p.category || '').toLowerCase();
            return pName.includes(cleanSq) || 
                   cleanSq.includes(pName) ||
                   (pCategory && cleanSq.includes(pCategory)) ||
                   (pCommune && cleanSq.includes(pCommune));
          }).slice(0, 2);

          localMatches.forEach(p => {
            if (!matchedPlacesMap.has(p.id)) matchedPlacesMap.set(p.id, p);
          });
        }

        // Fallback: match by individual keywords or featured places
        if (matchedPlacesMap.size === 0) {
          const words = cleanQ.split(/\s+/).filter(w => w.length >= 3);
          for (const w of words) {
            const localMatches = (masterPois as any[]).filter(p => {
              const pName = (p.name || '').toLowerCase();
              const pCat = (p.category || '').toLowerCase();
              return pName.includes(w) || pCat.includes(w);
            }).slice(0, 2);
            localMatches.forEach(p => {
              if (!matchedPlacesMap.has(p.id)) matchedPlacesMap.set(p.id, p);
            });
          }
        }

        if (matchedPlacesMap.size === 0) {
          (masterPois as any[]).slice(0, 4).forEach(p => matchedPlacesMap.set(p.id, p));
        }

        const places = Array.from(matchedPlacesMap.values()).slice(0, 6);
        const formattedPlaces = places.map(p => ({
          id: p.id, 
          slug: p.slug || p.id, 
          name: p.name,
          commune: p.commune, 
          category: p.category,
          rating: p.rating || 4.8, 
          image_url: p.image_url || (p as any).imageUrl,
          imageUrl: p.image_url || (p as any).imageUrl,
        }));

        // Send metadata & place cards immediately (< 50ms)
        send({ 
          type: 'metadata', 
          places: formattedPlaces, 
          suggestions: buildSuggestions(lower),
          data: formattedPlaces 
        });

        // 2. Load History & Out-of-scope check
        const history = await loadHistory(sessionId);
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

        // Rich RAG Context containing full verified field stories, tips, and guidelines
        const ragContext = places.length > 0
          ? places.map(p => {
              const storySnippet = p.detailed_story ? String(p.detailed_story).slice(0, 600) : (p.description ? String(p.description).slice(0, 200) : '');
              const tipsSnippet = (p as any).field_tips ? `\n  - Mẹo thực địa: ${(p as any).field_tips}` : '';
              const hoursSnippet = (p as any).opening_hours ? `\n  - Giờ mở cửa: ${(p as any).opening_hours}` : '';
              const priceSnippet = (p as any).ticket_price ? `\n  - Mức giá: ${(p as any).ticket_price}` : '';
              return `* Địa điểm: ${p.name} (Địa phận: ${p.commune || 'Tri Tôn'})\n  - Phân loại: ${p.category} (Đánh giá: ${p.rating || 4.8}/5)${hoursSnippet}${priceSnippet}${tipsSnippet}\n  - Thông tin thực địa chi tiết: ${storySnippet}`;
            }).join('\n\n')
          : '';

        const activeSystemPrompt = await getDynamicSystemConfig('SYSTEM_PROMPT', BASE_SYSTEM_PROMPT);
        const historySnippet = history.length > 0
          ? '\n\nLịch sử hội thoại gần nhất:\n' +
            history.map(t => `${t.role === 'user' ? 'Bạn' : 'Tôi'}: ${t.content}`).join('\n')
          : '';
        const systemMsg = activeSystemPrompt + historySnippet;
        
        const userMsg = ragContext
          ? `Câu hỏi của Bạn: ${queryStr}\n\n[Lưu ý: Luôn ưu tiên kiến thức thực tế và kết quả tìm kiếm internet mới nhất. Tham khảo thêm CSDL địa phương nếu phù hợp:\n${ragContext}]`
          : `Câu hỏi của Bạn: ${queryStr}\n\n[Lưu ý: Hãy tìm kiếm và cung cấp thông tin thực tế, chính xác nhất về Tri Tôn, An Giang trên internet]`;

        let fullText = '';
        let providerUsed = 'none';

        // 3. Stream AI Tokens immediately (sub-second TTFT)
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

          HOT_QUERY_CACHE.set(cleanQ, {
            answer: fullText,
            places: formattedPlaces,
            suggestions: buildSuggestions(lower),
            timestamp: Date.now(),
          });
        }

        logChatEvent({
          session_id: sessionId,
          query: queryStr,
          response_preview: fullText.slice(0, 300),
          provider_used: providerUsed,
          rag_method: 'instant-ram-stream',
          places_count: formattedPlaces.length,
          latency_ms: Date.now() - t0,
          is_out_scope: false,
        });

      } catch (err) {
        console.error('Chat stream error:', err);
        const errMsg = 'Hiện tại hệ thống AI đang bận xử lý, bạn vui lòng thử lại sau giây lát nhé!';
        send({ type: 'token', token: errMsg, delta: errMsg });
        send({ type: 'done', full_text: errMsg, suggestions: [] });
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
