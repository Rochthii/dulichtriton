import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { calculateItineraryRoute } from '@/lib/routeEngine';
import { generateEvidenceLinks } from '@/lib/evidenceGenerator';
import { calculateItineraryCost } from '@/lib/costCalculator';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://127.0.0.1:8000';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://knmlbwsmfljlabhvqfid.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const SYSTEM_PROMPT = `Bạn là Trợ lý Du Lịch Tri Tôn AI chuyên sâu về du lịch, ẩm thực, di sản văn hóa Khmer và thắng cảnh Tri Tôn, An Giang.
Xưng hô bắt buộc: Tự xưng "Tôi" và gọi người dùng là "Bạn".

QUY TẮC CỐT LÕI (MANDATORY RULES):
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
   - Cháo Bò Tri Tôn (Thị trấn Tri Tôn & Xã Châu Lăng): Gạo nàng nhen thơm lừng, thịt lòng bò tươi kèm lá chúc và vắt trái chúc nướng.
   - Bún Cá Củ Ngải Tri Tôn (Bún Cá Khmer): Nấu từ cá lóc đồng xào nghệ tươi, củ ngải bún giã nhuyễn thơm lừng, nước dùng xương ống thanh ngọt tự nhiên — TUYỆT ĐỐI KHÔNG DÙNG MẮM / KHÔNG PHẢI BÚN NƯỚC LÈO. Ăn kèm rau muống bào, bông điên điển, bắp chuối, rau nhút và heo quay da giòn.
   - Đu Đủ Đâm Rina (Xã Châu Lăng): Giã cối gỗ mắm ruốc, chanh ớt, ba khía cay nồng.
   - Bánh Bò Thốt Nốt Nướng Tân Lợi: Thơm béo nước cốt dừa và đường thốt nốt.

4. **Cẩm nang Tri Tôn Về Đêm (Quán Cà Phê Mở Muộn & Dạo Phố)**:
   - CHẠM Coffee & Tea (Đường 3/2, Thị trấn Tri Tôn): Sân vườn thoáng mát ngoài trời đón gió núi Bảy Núi về đêm, mở đến 22:00.
   - Lang Lang Coffee & Tea (Đường Trần Hưng Đạo, Thị trấn Tri Tôn): Không gian check-in hiện đại, trà thốt nốt tươi, mở đến 21:30.
   - Quy Coffee House (Đường Nam Kỳ Khởi Nghĩa, Thị trấn Tri Tôn): Phong cách mộc ấm cúng, acoustic cuối tuần, mở đến 22:00.
   - NY Coffee & Tea (Đường Nguyễn Trãi, Thị trấn Tri Tôn): Trà sữa & kem thốt nốt máy lạnh, mở đến 22:00.
   - Khu Ẩm Thực Chợ Đêm Tri Tôn: Ăn vặt đêm, cháo bò trái chúc, bánh xèo tép đồng, mở đến 22:30.
   - Quảng Trường & Phố Đi Bộ Trung Tâm: Dạo mát đón gió đồi, thả diều, trà chanh vỉa hè sôi động từ 17:00 - 23:00.

5. **XỬ LÝ CÂU HỎI ĐA VẾ / NHIỀU Ý CÙNG LÚC (MULTI-INTENT & COMPOUND QUESTIONS)**:
   - Khi người dùng đặt câu hỏi có từ 2-3 vế trở lên (Ví dụ: vừa hỏi cảnh đẹp/chùa, vừa hỏi quán ăn/gà đốt, vừa hỏi cafe tối hoặc homestay/lộ trình):
     1. BẮT BUỘC trả lời ĐẦY ĐỦ TỪNG VẾ câu hỏi, tuyệt đối không bỏ sót bất kỳ vế nào.
     2. Trình bày bài trả lời rõ ràng, tách bạch theo từng đề mục cụ thể:
        • ### 1. [Vế 1: Tên chủ đề/địa điểm] (Gợi ý chi tiết + Link Maps + Link TikTok)
        • ### 2. [Vế 2: Tên chủ đề/quán ăn] (Gợi ý chi tiết + Link Maps + Link TikTok)
        • ### 3. [Vế 3: Tên chủ đề/cafe/homestay] (Gợi ý chi tiết + Link Maps + Link TikTok)
     3. Đính kèm đầy đủ link Google Maps và TikTok cho từng địa điểm trong từng vế.
     4. Thêm mục '💡 Gợi ý sắp xếp thời gian di chuyển hợp lý' ở cuối để kết nối các điểm đến thành một hành trình thuận tiện (Sáng -> Trưa -> Chiều -> Tối).

6. **Phạm vi hỗ trợ**:
   - Nếu câu hỏi hoàn toàn ngoài phạm vi Tri Tôn/An Giang: "Tôi chỉ hỗ trợ các nội dung liên quan đến Tri Tôn và dự án Du Lịch Tri Tôn. Bạn hãy đặt câu hỏi trong phạm vi này."
   - Tuyệt đối không dùng cụm từ "Huyện Tri Tôn" (dùng Xã hoặc Thị trấn cụ thể như Xã Núi Tô, Xã Ô Lâm, Xã Châu Lăng, Xã Cô Tô, Xã Lương Phi, Thị trấn Tri Tôn).`;

async function generateQueryEmbedding(text: string): Promise<number[] | null> {
  const geminiKeys = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY_4,
  ].filter(Boolean) as string[];
  for (const key of geminiKeys) {
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
        const vector = data?.embedding?.values;
        if (Array.isArray(vector) && vector.length > 0) return vector;
      }
    } catch {
      // fallback silently
    }
  }
  return null;
}

// ── Conversation Memory Helpers ─────────────────────────────────────────────
interface Turn { role: 'user' | 'assistant'; content: string }

async function loadHistory(sessionId: string): Promise<Turn[]> {
  const { data } = await supabase
    .from('chat_sessions')
    .select('turns')
    .eq('session_id', sessionId)
    .single();
  if (!data) return [];
  const turns = data.turns as Turn[];
  // Keep last 6 turns (3 exchanges) to avoid token bloat
  return turns.slice(-6);
}

async function saveHistory(sessionId: string, history: Turn[]): Promise<void> {
  // Keep max 20 turns in DB; trim oldest when exceeded
  const trimmed = history.slice(-20);
  await supabase
    .from('chat_sessions')
    .upsert({ session_id: sessionId, turns: trimmed }, { onConflict: 'session_id' });
}

// ── Observability ────────────────────────────────────────────────────────────
function logChatEvent(entry: {
  session_id: string; query: string; response_preview?: string;
  provider_used?: string; rag_method?: string; places_count?: number;
  latency_ms?: number; is_out_scope?: boolean;
}): void {
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
    'python', 'code', 'lập trình', 'viết code', 'toán học', 'hóa học', 'ngôn ngữ c++'
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



// ── Parallel LLM Race: fastest winner wins, worst-case ~3s not 20s ──────────
async function generateAIResponse(
  userQuery: string,
  ragContext: string,
  history: Turn[] = []
): Promise<string> {
  // Build conversation history snippet injected into system prompt
  const historySnippet = history.length > 0
    ? '\n\nLịch sử hội thoại gần nhất:\n' +
      history.map(t => `${t.role === 'user' ? 'Bạn' : 'Tôi'}: ${t.content}`).join('\n')
    : '';
  const systemMsg = SYSTEM_PROMPT + historySnippet;
  const userMsg   = `Thông tin bối cảnh xác minh từ CSDL Tri Tôn:\n${ragContext}\n\nCâu hỏi của Bạn: ${userQuery}`;
  const fullPrompt = `${systemMsg}\n\n${userMsg}`;

  type LLMResult = { text: string; provider: string };

  // ── helper callers with Google Search Grounding ───────────────────────────
  async function callGemini(key: string, label: string): Promise<LLMResult> {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: fullPrompt }] }],
            tools: [{ googleSearch: {} }],
          }),
          signal: AbortSignal.timeout(7000),
        }
      );
      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return { text: text.trim(), provider: `${label}-search-grounded` };
      }
    } catch {
      // Fallback silently to non-grounded call
    }

    // Fallback without tools if needed
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: fullPrompt }] }] }),
        signal: AbortSignal.timeout(5000),
      }
    );
    if (!res.ok) throw new Error(`Gemini ${label} HTTP ${res.status}`);
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error(`Gemini ${label} empty`);
    return { text: text.trim(), provider: label };
  }

  async function callOpenRouter(modelName: string): Promise<LLMResult> {
    const key = process.env.OPENROUTER_API_KEY;
    if (!key) throw new Error('no openrouter key');
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
        'HTTP-Referer': 'https://dulichtriton.vn',
        'X-Title': 'Du Lich Tri Ton AI',
      },
      body: JSON.stringify({
        model: modelName,
        messages: [{ role: 'system', content: systemMsg }, { role: 'user', content: userMsg }],
      }),
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) throw new Error(`OpenRouter (${modelName}) HTTP ${res.status}`);
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content;
    if (!text) throw new Error(`OpenRouter (${modelName}) empty`);
    return { text: text.trim(), provider: `openrouter-${modelName}` };
  }

  // ── fire all in parallel, return the first success ────────────────────────
  const geminiKeys = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY_4,
  ].filter(Boolean) as string[];

  const openRouterFreeModels = [
    'nvidia/nemotron-3-nano-30b-a3b:free',
    'nvidia/nemotron-3.5-lightning:free',
    'nvidia/nemotron-nano-9b-v2:free',
    'nvidia/nemotron-3-ultra-550b-a55b:free',
    'openai/gpt-oss-20b:free',
    'cohere/north-mini-code:free',
    'google/gemma-4-31b-it:free',
    'google/gemma-4-26b-a4b-it:free',
  ];

  const races: Promise<LLMResult>[] = [
    ...geminiKeys.map((k, i) => callGemini(k, `gemini-key${i + 1}`)),
    ...openRouterFreeModels.map(m => callOpenRouter(m)),
  ];

  try {
    const winner = await Promise.any(races);
    console.log(`[NextAI] Provider winner: ${winner.provider}`);
    return winner.text;
  } catch {
    return 'Tôi đã tổng hợp dữ liệu địa điểm Tri Tôn cho Bạn. Vui lòng tham khảo các gợi ý địa danh bên dưới!';
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.query || typeof body.query !== 'string' || !body.query.trim()) {
      return NextResponse.json(
        { error: 'Missing or invalid query parameter' },
        { status: 400 }
      );
    }

    const queryStr  = body.query.trim();
    // session_id: frontend gửi kèm; fallback sang 'anonymous' cho widget
    const sessionId = (typeof body.session_id === 'string' && body.session_id.trim())
      ? body.session_id.trim()
      : 'anonymous';

    const t0 = Date.now(); // latency tracking

    // Load conversation history
    const history = await loadHistory(sessionId);

    // 1. Direct Next.js Multi-LLM RAG Engine Execution
    const lowerQuery = queryStr.toLowerCase();

    if (checkIsOutOfScope(queryStr, history)) {
      logChatEvent({ session_id: sessionId, query: queryStr, is_out_scope: true, latency_ms: Date.now() - t0 });
      return NextResponse.json({
        text_response: 'Tôi chỉ hỗ trợ các nội dung liên quan đến Tri Tôn và dự án Du Lịch Tri Tôn. Bạn hãy đặt câu hỏi trong phạm vi này.',
        ui_components: [],
        videos: [],
        suggestions: ['Hồ Tà Pạ có gì đẹp?', 'Ăn Gà Đốt Ô Thum ở đâu?', 'Chùa Khmer Bảy Núi'],
      });
    }

    // ── STEP 1: GOLDEN CACHE & DYNAMIC FEW-SHOT RETRIEVAL ──────────────────────
    let goldenFewShotsSnippet = '';
    const qEmbedding = await generateQueryEmbedding(queryStr);

    if (qEmbedding) {
      // 1a. Check GOLDEN CACHE (thresh >= 0.88) -> Fast exit <30ms, Zero LLM cost
      const { data: cacheHits, error: cacheErr } = await supabase.rpc('match_golden', {
        query_embedding: qEmbedding,
        thresh: 0.88,
        match_count: 1
      });

      if (!cacheErr && cacheHits && cacheHits.length > 0) {
        const cacheHit = cacheHits[0];
        console.log(`[RAG Golden Cache] 🎯 HIT ${cacheHit.id} (similarity: ${cacheHit.similarity})`);
        
        // Extract content from answer_json
        const answerData = cacheHit.answer_json;
        let responseText = '';
        if (typeof answerData === 'string') {
          responseText = answerData;
        } else if (answerData?.content) {
          responseText = typeof answerData.content === 'string' ? answerData.content : JSON.stringify(answerData.content, null, 2);
        } else {
          responseText = JSON.stringify(answerData, null, 2);
        }

        const contextVideos = await fetchContextAwareVideos(queryStr);
        // Also fetch places for Golden Cache hit so places array is populated
        const { data: cachePlaces } = await supabase
          .from('places')
          .select('id, slug, name, commune, category, rating, image_url, source_url, is_verified, verified_at')
          .limit(4);

        logChatEvent({
          session_id: sessionId,
          query: queryStr,
          provider_used: 'golden_cache_hit',
          rag_method: 'vector_golden_cache',
          places_count: cachePlaces ? cachePlaces.length : 0,
          latency_ms: Date.now() - t0,
          is_out_scope: false
        });

        return NextResponse.json({
          text_response: responseText,
          ui_components: cachePlaces && cachePlaces.length > 0 ? [{ type: 'place_grid', data: cachePlaces }] : [],
          places: cachePlaces || [],
          videos: contextVideos,
          suggestions: ['Hồ Tà Pạ có gì đẹp?', 'Ăn Gà Đốt Ô Thum ở đâu?', 'Chùa Khmer Bảy Núi']
        });
      }

      // 1b. DYNAMIC FEW-SHOT RETRIEVAL (thresh >= 0.55, top-3) -> Inject into prompt for LLM format cloning
      const { data: shotHits } = await supabase.rpc('match_golden', {
        query_embedding: qEmbedding,
        thresh: 0.55,
        match_count: 3
      });

      if (shotHits && shotHits.length > 0) {
        goldenFewShotsSnippet = '\n\nVÍ DỤ CÂU TRẢ LỜI MẪU CHUẨN ĐỊNH DẠNG (Hãy bắt chước định dạng và cấu trúc này):\n' +
          shotHits.map((shot: any, i: number) => `Ví dụ ${i + 1} - Hỏi: "${shot.question}" -> Đáp: ${JSON.stringify(shot.answer_json)}`).join('\n\n');
      }
    }

    // High-Precision Hybrid RAG Retrieval Strategy
    let placesMap = new Map<string, any>();

    // 0. Intent-Clustered RAG Router for Broad & Itinerary Queries
    let targetPoiIds: string[] = [];

    if (lowerQuery.includes('3 ngày') || lowerQuery.includes('3n2đ') || lowerQuery.includes('3d2n') || lowerQuery.includes('tour 3 ngày')) {
      targetPoiIds.push("PL001", "PL004", "HG005", "PL010", "CK002", "FD006", "CF002");
    } else if (lowerQuery.includes('2 ngày 1 đêm') || lowerQuery.includes('2n1đ') || lowerQuery.includes('tour 2 ngày') || lowerQuery.includes('2 ngày')) {
      targetPoiIds.push("PL001", "PL004", "HG005", "PL010");
    } else if (lowerQuery.includes('lịch trình 1 ngày') || lowerQuery.includes('đi 1 ngày') || (lowerQuery.includes('lịch trình') && !lowerQuery.includes('săn mây'))) {
      targetPoiIds.push("PL001", "CK002", "FD006", "CK010", "CK001");
    }

    if (lowerQuery.includes('gà đốt') || lowerQuery.includes('ô thum')) {
      targetPoiIds.push("FD006", "PL002");
    }
    if (lowerQuery.includes('cháo bò') || lowerQuery.includes('bún cá') || lowerQuery.includes('đu đủ đâm')) {
      targetPoiIds.push("FD009", "FD013", "FD016");
    }
    if (lowerQuery.includes('food tour') || (lowerQuery.includes('ăn') && !lowerQuery.includes('ăn chay'))) {
      targetPoiIds.push("FD009", "FD006", "FD016", "FD017");
    }
    if (lowerQuery.includes('săn mây') || lowerQuery.includes('bình minh')) {
      targetPoiIds.push("PL009", "PL001", "CK002");
    }
    if (lowerQuery.includes('trẻ nhỏ') || lowerQuery.includes('gia đình')) {
      targetPoiIds.push("PL014", "PL020", "CF001");
    }
    if (lowerQuery.includes('chùa') || lowerQuery.includes('văn hóa khmer') || lowerQuery.includes('văn hoá khmer') || lowerQuery.includes('tâm linh')) {
      targetPoiIds.push("HG002", "HG001", "EV002", "FD024");
    }
    if (lowerQuery.includes('chợ tri tôn') || lowerQuery.includes('chợ đêm')) {
      targetPoiIds.push("PL021", "HG002", "FD009");
    }
    if (lowerQuery.includes('ngủ đêm') || lowerQuery.includes('homestay') || lowerQuery.includes('khách sạn')) {
      targetPoiIds.push("CF012", "CF013", "CF016");
    }
    if (lowerQuery.includes('sống ảo') || lowerQuery.includes('chụp hình đẹp') || lowerQuery.includes('checkin') || lowerQuery.includes('cổng trời')) {
      targetPoiIds.push("CK010", "CK009", "CK002");
    }
    if (lowerQuery.includes('hoàng hôn')) {
      targetPoiIds.push("PL020", "CK001");
    }
    if (lowerQuery.includes('cánh đồng lúa') || lowerQuery.includes('đồng lúa') || lowerQuery.includes('thốt nốt trái tim')) {
      targetPoiIds.push("PL011", "CK002");
    }
    if (lowerQuery.includes('cầu gỗ')) {
      targetPoiIds.push("CK012", "CK013", "CK015");
    }
    if (lowerQuery.includes('ít người biết') || lowerQuery.includes('chill mà ít người')) {
      targetPoiIds.push("CK018", "CK020", "PL019", "CF015");
    }
    if (lowerQuery.includes('tối') || lowerQuery.includes('đêm') || lowerQuery.includes('cafe') || lowerQuery.includes('cà phê')) {
      targetPoiIds.push("CF001", "CF002", "CF008", "CF010", "FD017");
    }
    if (lowerQuery.includes('ăn chay') || lowerQuery.includes('chay')) {
      targetPoiIds.push("FD021", "FD024");
    }

    if (targetPoiIds.length > 0) {
      const { data: clusteredPlaces } = await supabase
        .from('places')
        .select('id, slug, name, commune, category, rating, image_url, description, golden_time_windows, price_level, opening_hours')
        .in('id', targetPoiIds);
      if (clusteredPlaces) {
        clusteredPlaces.forEach(p => placesMap.set(p.id, p));
      }
    }

    // 1. Extract N-grams (2-word & 3-word phrases) for precision POI matching
    const stopWords = ['ở', 'đâu', 'có', 'gì', 'đẹp', 'nào', 'ngon', 'mấy', 'giờ', 'bao', 'nhiêu', 'cho', 'mình', 'với', 'thì', 'lên', 'ăn', 'đi', 'muốn', 'ngắm', 'chỗ', 'hãy', 'bạn', 'tối', 'sáng', 'thế', 'nào', 'từ', 'vé', 'quán', 'thích'];
    const rawTokens = lowerQuery.replace(/[?,.!]/g, '').split(/\s+/).filter(Boolean);
    const filteredTokens = rawTokens.filter((w: string) => !stopWords.includes(w));

    const nGramPhrases: string[] = [];
    // 2-word bigrams
    for (let i = 0; i < filteredTokens.length - 1; i++) {
      nGramPhrases.push(`${filteredTokens[i]} ${filteredTokens[i+1]}`);
    }
    // 3-word trigrams
    for (let i = 0; i < filteredTokens.length - 2; i++) {
      nGramPhrases.push(`${filteredTokens[i]} ${filteredTokens[i+1]} ${filteredTokens[i+2]}`);
    }

    // Query DB for n-gram matches first (Highest Priority)
    for (const phrase of nGramPhrases) {
      if (phrase.length < 3) continue;
      const { data: phraseMatches } = await supabase
        .from('places')
        .select('id, slug, name, commune, category, rating, image_url, description, golden_time_windows, price_level, opening_hours')
        .or(`name.ilike.%${phrase}%,category.ilike.%${phrase}%,commune.ilike.%${phrase}%`)
        .limit(4);
      if (phraseMatches) {
        phraseMatches.forEach(p => {
          if (!placesMap.has(p.id)) placesMap.set(p.id, p);
        });
      }
    }

    // Fallback: Individual tokens matching
    if (placesMap.size < 2 && filteredTokens.length > 0) {
      for (const token of filteredTokens) {
        if (token.length < 2) continue;
        const { data: tokenMatches } = await supabase
          .from('places')
          .select('id, slug, name, commune, category, rating, image_url, description, golden_time_windows, price_level, opening_hours')
          .or(`name.ilike.%${token}%,category.ilike.%${token}%,commune.ilike.%${token}%`)
          .limit(4);
        if (tokenMatches) {
          tokenMatches.forEach(p => {
            if (!placesMap.has(p.id)) placesMap.set(p.id, p);
          });
        }
      }
    }

    let kbSnippet = '';
    // Hybrid Vector Search (pgvector RPC match_places & match_kb)
    const queryVector = await generateQueryEmbedding(queryStr);
    if (queryVector) {
      const { data: vectorMatches } = await supabase.rpc('match_places', {
        query_embedding: queryVector,
        match_threshold: 0.35,
        match_count: 5,
      });
      if (vectorMatches) {
        vectorMatches.forEach((p: any) => {
          if (!placesMap.has(p.id)) placesMap.set(p.id, p);
        });
      }

      // Knowledge Base Retrieval (RPC match_kb) cho bài viết tri thức tổng quan & văn hóa
      const { data: kbMatches } = await supabase.rpc('match_kb', {
        query_embedding: queryVector,
        match_threshold: 0.40,
        match_count: 2,
      });
      if (kbMatches && kbMatches.length > 0) {
        kbSnippet = '\n\nTRI THỨC TỔNG QUAN & VĂN HÓA TRI TÔN BỔ SUNG (Từ CSDL Knowledge Base):\n' +
          kbMatches.map((kb: any) => `- [Bài viết: ${kb.title}] (Category: ${kb.category})\n  Tóm tắt: ${kb.summary}\n  Nội dung: ${kb.content}`).join('\n\n');
      }
    }

    // 2. PostGIS Geo Proximity Spatial Router (Search nearby POIs by distance)
    const isNearbyQuery = lowerQuery.includes('gần') || lowerQuery.includes('xung quanh') || lowerQuery.includes('khoảng cách') || lowerQuery.includes('bao xa');
    if (isNearbyQuery) {
      // Default to Tri Tôn Town Center coordinates if query doesn't specify origin
      const originLat = 10.4128;
      const originLng = 105.0068;
      const { data: nearbyPlaces } = await supabase.rpc('match_places_nearby', {
        origin_lat: originLat,
        origin_lng: originLng,
        radius_meters: 10000.0,
        match_count: 4
      });
      if (nearbyPlaces) {
        nearbyPlaces.forEach((p: any) => {
          if (!placesMap.has(p.id)) placesMap.set(p.id, p);
        });
      }
    }

    let places = Array.from(placesMap.values()).slice(0, 6);

    let ragContext = '';
    const formattedPlaces: any[] = [];

    // Calculate Route & Cost Breakdown if itinerary intent
    const isItineraryQuery = 
      lowerQuery.includes('lịch trình') || 
      lowerQuery.includes('tour') || 
      lowerQuery.includes('đi đâu') || 
      lowerQuery.includes('1 ngày') || 
      lowerQuery.includes('2 ngày') || 
      lowerQuery.includes('3 ngày') || 
      lowerQuery.includes('3n2đ') || 
      lowerQuery.includes('2n1đ');
    let routeSummarySnippet = '';
    let costSnippet = '';

    if (places && places.length > 0) {
      if (isItineraryQuery) {
        const numDays = (lowerQuery.includes('3 ngày') || lowerQuery.includes('3n2đ')) ? 3 : (lowerQuery.includes('2 ngày') || lowerQuery.includes('2n1đ')) ? 2 : 1;
        const routeData = calculateItineraryRoute(places.map((p: any) => ({
          id: p.id,
          name: p.name,
          latitude: p.latitude ? Number(p.latitude) : 10.4128,
          longitude: p.longitude ? Number(p.longitude) : 105.0068,
        })));
        const costData = calculateItineraryCost(numDays, places.length, numDays > 1);
        
        routeSummarySnippet = `\n📊 TỔNG HÀNH TRÌNH TÍNH TOÁN POSTGIS (${numDays} NGÀY):\n- Tổng quãng đường: ~${routeData.totalDistanceKm} km\n- Phút di chuyển xe máy: ~${routeData.totalTravelTimeMinutes} phút\n- Ngân sách ước tính: ${costData.formattedRange}`;
        costSnippet = `\n💰 CHI TIẾT NGÂN SÁCH DỰ KIẾN:\n- Ăn uống: ~${Math.round((costData.breakfastEst + costData.lunchEst + costData.dinnerEst)/1000)}k\n- Thuê xe máy & xăng: ~${Math.round((costData.motorbikeRentalEst + costData.fuelEst)/1000)}k\n- Vé tham quan & lưu trú: ~${Math.round(costData.ticketEst/1000)}k`;
      }

      ragContext = places
        .map((p) => {
          const evidence = generateEvidenceLinks(p.name, p.commune);
          return `- [ID: ${p.id}] ${p.name} (Thuộc ${p.commune}): Thể loại ${p.category}. Đánh giá: ${p.rating}/5. Giá vé: ${p.price_level || 'Miễn phí'}. Giờ mở cửa: ${p.opening_hours || 'Cả ngày'}.\n  🗺️ Google Maps: ${evidence.googleMapsUrl}\n  🎵 TikTok Review: ${evidence.tiktokSearchUrl}\n  🔎 Hashtags: ${evidence.hashtags.join(' ')}`;
        })
        .join('\n') + routeSummarySnippet + costSnippet;

      places.forEach((p) => {
        const evidence = generateEvidenceLinks(p.name, p.commune);
        formattedPlaces.push({
          id: p.id,
          slug: p.slug || p.id,
          name: p.name,
          commune: p.commune,
          category: p.category,
          rating: p.rating,
          image_url: p.image_url,
          source_url: evidence.googleMapsUrl,
          tiktok_search_url: evidence.tiktokSearchUrl,
          hashtags: evidence.hashtags,
          is_verified: p.is_verified ?? true,
          verified_at: p.verified_at,
          distance_km: p.distance_km ? Number(p.distance_km.toFixed(1)) : undefined,
        });
      });
    } else {
      // Fetch top 3 hot places as fallback context
      const { data: hotPlaces } = await supabase
        .from('places')
        .select('id, slug, name, commune, category, rating, image_url, golden_time_windows, price_level, opening_hours, description, source_url, is_verified, verified_at')
        .eq('is_hot', true)
        .limit(3);

      if (hotPlaces) {
        ragContext = hotPlaces
          .map((p) => `- [ID: ${p.id}] ${p.name} (Thuộc Xã/Thị trấn ${p.commune}): Thể loại ${p.category}. Nguồn xác minh: ${p.source_url || 'https://maps.google.com'}. Mô tả: ${p.description || ''}`)
          .join('\n');
        hotPlaces.forEach((p) => formattedPlaces.push(p));
      }
    }

    // Generate AI response with Multi-LLM provider fallback + conversation history + dynamic few-shots + knowledge base
    const combinedRagContext = [ragContext, kbSnippet, goldenFewShotsSnippet].filter(Boolean).join('\n\n');
    const aiTextResponse = await generateAIResponse(queryStr, combinedRagContext, history);


    // Persist this turn to chat_sessions (fire-and-forget, non-blocking)
    saveHistory(sessionId, [
      ...history,
      { role: 'user',      content: queryStr },
      { role: 'assistant', content: aiTextResponse.slice(0, 1200) }, // cap to avoid DB bloat
    ]).catch(e => console.warn('[Memory] saveHistory failed:', e));

    // Fetch context-aware videos (POI matched or Topic matched)
    const videos = await fetchContextAwareVideos(queryStr, places);

    // Context-aware dynamic suggestions
    let suggestions = [
      'Đặc sản Gà Đốt Ô Thum ở đâu ngon?',
      'Lộ trình tham quan 2 ngày 1 đêm Tri Tôn',
      'Khung giờ chụp ảnh đẹp nhất Hồ Tà Pạ',
    ];

    if (lowerQuery.includes('ăn') || lowerQuery.includes('gà đốt') || lowerQuery.includes('cháo bò')) {
      suggestions = [
        'Quán Gà Đốt Ô Thum chuẩn vị nhất',
        'Địa chỉ quán Cháo Bò lá trúc nổi tiếng',
        'Quán Bún cá Khmer Tri Tôn',
      ];
    } else if (lowerQuery.includes('chùa') || lowerQuery.includes('khmer') || lowerQuery.includes('văn hóa')) {
      suggestions = [
        'Đường lên Chùa Tà Pạ',
        'Cổng trời Chùa Koh Kas',
        'Lễ hội Đua bò Khmer Tri Tôn diễn ra khi nào?',
      ];
    } else if (lowerQuery.includes('ở') || lowerQuery.includes('homestay') || lowerQuery.includes('khách sạn')) {
      suggestions = [
        'Homestay view núi Cô Tô đẹp nhất',
        'Khách sạn trung tâm Thị trấn Tri Tôn',
        'Khu cắm trại Hồ Ô Thum',
      ];
    }

    // Audit log before returning
    logChatEvent({
      session_id: sessionId,
      query: queryStr,
      response_preview: aiTextResponse.slice(0, 300),
      provider_used: 'parallel-race',
      rag_method: places && places.length > 0 ? 'vector-or-ilike' : 'hot_fallback',
      places_count: formattedPlaces.length,
      latency_ms: Date.now() - t0,
      is_out_scope: false,
    });

    return NextResponse.json({
      text_response: aiTextResponse,
      ui_components: formattedPlaces.length > 0 ? [{ type: 'place_grid', data: formattedPlaces }] : [],
      places: formattedPlaces,
      videos: videos || [],
      suggestions,
    });
  } catch (error: unknown) {
    console.error('[ChatProxy] Error:', error);
    return NextResponse.json(
      {
        error: 'Service Error',
        text_response: 'Tôi gặp sự cố kết nối tạm thời. Vui lòng bấm thử lại hoặc chọn một trong các gợi ý bên dưới!',
        ui_components: [],
        videos: [],
        suggestions: ['Hồ Tà Pạ', 'Gà Đốt Ô Thum', 'Chùa Tà Pạ'],
      },
      { status: 200 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'Tri Ton Tourism AI — Direct Multi-LLM RAG Engine',
    status: 'ready',
  });
}
