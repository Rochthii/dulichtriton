import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://127.0.0.1:8000';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://knmlbwsmfljlabhvqfid.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

async function generateQueryEmbedding(text: string): Promise<number[] | null> {
  const geminiKeys = [process.env.GEMINI_API_KEY, process.env.GEMINI_API_KEY_2].filter(Boolean) as string[];
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

  // ── helper callers ────────────────────────────────────────────────────────
  async function callGemini(key: string, label: string): Promise<LLMResult> {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: fullPrompt }] }] }),
        signal: AbortSignal.timeout(4500),
      }
    );
    if (!res.ok) throw new Error(`Gemini ${label} HTTP ${res.status}`);
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error(`Gemini ${label} empty`);
    return { text: text.trim(), provider: label };
  }

  async function callGroq(): Promise<LLMResult> {
    const key = process.env.GROQ_API_KEY;
    if (!key) throw new Error('no groq key');
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'system', content: systemMsg }, { role: 'user', content: userMsg }],
      }),
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) throw new Error(`Groq HTTP ${res.status}`);
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content;
    if (!text) throw new Error('Groq empty');
    return { text: text.trim(), provider: 'groq' };
  }

  async function callOpenRouter(): Promise<LLMResult> {
    const key = process.env.OPENROUTER_API_KEY;
    if (!key) throw new Error('no openrouter key');
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.3-70b-instruct:free',
        messages: [{ role: 'system', content: systemMsg }, { role: 'user', content: userMsg }],
      }),
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) throw new Error(`OpenRouter HTTP ${res.status}`);
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content;
    if (!text) throw new Error('OpenRouter empty');
    return { text: text.trim(), provider: 'openrouter' };
  }

  // ── fire all in parallel, return the first success ────────────────────────
  const geminiKeys = [process.env.GEMINI_API_KEY, process.env.GEMINI_API_KEY_2]
    .filter(Boolean) as string[];

  const races: Promise<LLMResult>[] = [
    ...geminiKeys.map((k, i) => callGemini(k, `gemini-key${i + 1}`)),
    callGroq(),
    callOpenRouter(),
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

    // 1. Attempt proxying to FastAPI Backend if running locally
    try {
      const backendRes = await fetch(`${BACKEND_API_URL}/api/v1/chat/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryStr,
          session_id: body.session_id || 'anonymous',
        }),
        signal: AbortSignal.timeout(2500),
      });

      if (backendRes.ok) {
        const data = await backendRes.json();
        return NextResponse.json(data);
      }
    } catch {
      // Backend not running -> Fallback to Next.js Direct Multi-LLM RAG Engine
    }

    // 2. Direct Next.js RAG Engine Execution
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

    // Hybrid Semantic Vector Search (pgvector RPC match_places -> ILIKE Fallback)
    let places: any[] = [];
    const queryVector = await generateQueryEmbedding(queryStr);

    if (queryVector) {
      const { data: vectorMatches } = await supabase.rpc('match_places', {
        query_embedding: queryVector,
        match_threshold: 0.3,
        match_count: 5,
      });
      if (vectorMatches && vectorMatches.length > 0) {
        places = vectorMatches;
      }
    }

    // Fallback to Full-Text ILIKE if no vector matches found
    if (!places || places.length === 0) {
      const { data: textMatches } = await supabase
        .from('places')
        .select('id, slug, name, commune, category, rating, image_url, description, golden_time_windows, price_range, best_time_to_visit')
        .or(`name.ilike.%${queryStr}%,category.ilike.%${queryStr}%,commune.ilike.%${queryStr}%,description.ilike.%${queryStr}%`)
        .limit(4);
      if (textMatches) places = textMatches;
    }

    let ragContext = '';
    const formattedPlaces: any[] = [];

    if (places && places.length > 0) {
      ragContext = places
        .map(
          (p) =>
            `- ${p.name} (Thuộc ${p.commune}): Thể loại ${p.category}. Đánh giá: ${p.rating}/5. Khung giờ vàng: ${
              Array.isArray(p.golden_time_windows) ? p.golden_time_windows.join(', ') : 'Cả ngày'
            }. Mô tả: ${p.description || ''}`
        )
        .join('\n');

      places.forEach((p) => {
        formattedPlaces.push({
          id: p.id,
          slug: p.slug || p.id,
          name: p.name,
          commune: p.commune,
          category: p.category,
          rating: p.rating,
          image_url: p.image_url,
        });
      });
    } else {
      // Fetch top 3 hot places as fallback context
      const { data: hotPlaces } = await supabase
        .from('places')
        .select('id, slug, name, commune, category, rating, image_url, golden_time_windows')
        .eq('is_hot', true)
        .limit(3);

      if (hotPlaces) {
        ragContext = hotPlaces
          .map((p) => `- ${p.name} (Thuộc ${p.commune}): Thể loại ${p.category}`)
          .join('\n');
        hotPlaces.forEach((p) => formattedPlaces.push(p));
      }
    }

    // Generate AI response with Multi-LLM provider fallback + conversation history
    const aiTextResponse = await generateAIResponse(queryStr, ragContext, history);

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
        'Bún nước lèo Khmer Tri Tôn',
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
