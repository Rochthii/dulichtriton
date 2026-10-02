import { NextRequest } from 'next/server';
import { streamAIResponse, buildUnifiedRagContext } from '@/lib/aiProvider';
import { generateSmartSuggestions } from '@/lib/ai/contextualSuggestionEngine';
import { getSupabaseServerClient } from '@/lib/serverSupabase';
import { validateChatQuery } from '@/lib/chatQueryGuard';
import { verifySessionOwnership, SESSION_TOKEN_HEADER, SESSION_TOKEN_COOKIE } from '@/lib/chatSessionOwnership';
import { resolveAuditProvider, resolveAuditModel } from '@/lib/chatAuditProviderHelper';
import { calculateElapsedMs, startLatencyTimer } from '@/lib/chatAuditLatencyHelper';
import { StructuredStreamDoneEvent } from '@/lib/chatStructuredResultContract';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface Turn {
  role: 'user' | 'assistant';
  content: string;
}

const BASE_SYSTEM_PROMPT = `Bạn là Trợ Lý AI Du Lịch Tri Tôn chuyên sâu, chuyên gia hướng dẫn bản địa 24/7 của huyện Tri Tôn, tỉnh An Giang, Việt Nam.
Xưng hô bắt buộc: Tự xưng "Tôi" và gọi người dùng là "Bạn".

QUY TẮC CỐT LÕI:
1. **Ưu tiên thông tin thực tế & cập nhật trên Internet**:
   - Luôn luôn ưu tiên thông tin thực tế mới nhất, khách quan, chính xác về địa danh, giờ mở cửa, giá cả, món ăn, dịch vụ tại Tri Tôn, An Giang.
   - TUYỆT ĐỐI KHÔNG in mã ID kỹ thuật (như [ID: ...], PL001, GMS_001...) trong câu trả lời. Chỉ gọi tên địa danh in đậm, kèm xã/thị trấn thực tế.

2. **Quy tắc đính kèm Link Google Maps và TikTok ngay dưới TỪNG ĐỊA ĐIỂM được nhắc đến**:
   - Mỗi khi gợi ý hoặc nhắc đến bất kỳ địa điểm, quán ăn, thắng cảnh, chùa chiền nào, BẮT BUỘC đính kèm ngay 2 đường link bên dưới địa điểm đó theo đúng định dạng Markdown trên CÙNG MỘT DÒNG (TUYỆT ĐỐI KHÔNG ngắt/xuống dòng giữa chừng đường link):
     [📍 Chỉ đường Google Maps](https://maps.google.com/?q=<Tên_Địa_Điểm>,+<Tên_Xã_hoặc_Thị_trấn>,+An+Giang) • [▶ Xem TikTok Video](https://www.tiktok.com/tag/<Hashtag_Địa_Điểm>)

3. **Cẩm nang Ẩm thực & Đặc sản Bảy Núi 2026 (Chỉ dùng các quán đã xác minh thực tế 100%)**:
   - **Gà Đốt Ô Thum**: Chế biến theo phương pháp đốt truyền thống (đốt kín trong nồi/thố đậy nắp với sả và lá chúc tươi 35-45 phút — TUYỆT ĐỐI KHÔNG gọi là 'nướng' mà phải dùng từ 'đốt').
   - **Cháo Bò Tri Tôn**: Gạo nàng nhen, lòng bò tươi chấm mắm ruốc pha ớt sả và vắt trái chúc nướng.
   - **Bún Cá Củ Ngải Khmer**: Nấu từ cá lóc đồng xào nghệ tươi, củ ngải bún giã nhuyễn thơm lừng, nước dùng xương ống thanh ngọt — TUYỆT ĐỐI KHÔNG DÙNG MẮM / KHÔNG PHẢI BÚN NƯỚC LÈO.
   - **Đu Đủ Đâm Rina (Xã Châu Lăng)**: Giã cối gỗ mắm ruốc, chanh ớt, ba khía cay nồng.

4. **Phạm vi hỗ trợ**:
   - Nếu câu hỏi hoàn toàn ngoài phạm vi Tri Tôn/An Giang: "Tôi chỉ hỗ trợ các nội dung liên quan đến Tri Tôn và dự án Du Lịch Tri Tôn. Bạn hãy đặt câu hỏi trong phạm vi này."
   - Tuyệt đối không dùng cụm từ "Huyện Tri Tôn" (dùng Xã hoặc Thị trấn cụ thể như Xã Núi Tô, Xã Ô Lâm, Xã Châu Lăng, Xã Cô Tô, Xã Lương Phi, Thị trấn Tri Tôn).`;

async function loadHistory(sessionId: string): Promise<Turn[]> {
  if (sessionId === 'anonymous') return [];
  try {
    const supabase = getSupabaseServerClient();
    if (!supabase) return [];
    const { data } = await supabase
      .from('chat_sessions')
      .select('turns')
      .eq('session_id', sessionId)
      .maybeSingle();
    return (data?.turns as Turn[]) || [];
  } catch {
    return [];
  }
}

async function saveHistory(sessionId: string, turns: Turn[]): Promise<void> {
  if (sessionId === 'anonymous') return;
  try {
    const supabase = getSupabaseServerClient();
    if (!supabase) return;
    await supabase.from('chat_sessions').upsert(
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
  model_used?: string;
  rag_method?: string;
  places_count?: number;
  latency_ms?: number;
  is_out_scope?: boolean;
}): void {
  try {
    const supabase = getSupabaseServerClient();
    if (!supabase) return;
    void supabase.from('chat_logs').insert({
      ...payload,
      created_at: new Date().toISOString(),
    });
  } catch { /* non-blocking */ }
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
  if (travelKeywords.some((kw) => lower.includes(kw))) {
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
  if (hardOutOfScope.some((topic) => lower.includes(topic))) {
    return true;
  }

  const externalPlaces = ['hà nội', 'sài gòn', 'đà nẵng', 'nha trang', 'vũng tàu', 'đà lạt', 'phú quốc', 'sapa'];
  if (externalPlaces.some((p) => lower.includes(p))) {
    return true;
  }

  return false;
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const rawQuery = body.query ?? body.question ?? body.message ?? body.prompt;
  const validation = validateChatQuery(rawQuery);
  if (!validation.isValid) {
    return new Response(
      JSON.stringify({
        error: validation.error,
        code: validation.code,
        max_length: validation.maxLength,
        current_length: validation.currentLength,
      }),
      {
        status: validation.status,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  const queryStr = validation.sanitizedQuery;

  const sessionId = (body.session_id as string)?.trim() || 'anonymous';

  // Verify session ownership before reading chat history (P04-005)
  const ownership = await verifySessionOwnership({
    sessionId,
    req,
    body,
    supabase: getSupabaseServerClient(),
  });

  if (!ownership.isOwner) {
    return new Response(
      JSON.stringify({
        error: 'Truy cập lịch sử hội thoại bị từ chối do không có quyền sở hữu phiên.',
        code: ownership.error || 'INVALID_SESSION_OWNERSHIP',
      }),
      {
        status: ownership.status || 403,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  const userLat = typeof body.latitude === 'number' ? body.latitude : (typeof body.user_lat === 'number' ? body.user_lat : undefined);
  const userLng = typeof body.longitude === 'number' ? body.longitude : (typeof body.user_lng === 'number' ? body.user_lng : undefined);

  const clientHistory: Turn[] = Array.isArray(body.history)
    ? (body.history as any[]).map((t) => ({
        role: t.role || (t.sender === 'user' ? 'user' : 'assistant'),
        content: t.content || t.text || '',
      })).slice(-5)
    : [];

  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      const send = (obj: object) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
        } catch { /* closed */ }
      };

      const t0 = startLatencyTimer();
      let fullText = '';
      let providerUsed = '';
      let modelUsed = '';

      try {
        const lower = queryStr.toLowerCase();
        const cleanQ = lower.replace(/[?!.,]/g, '').trim();

        // 1. Unified Hybrid RAG Context Extraction (<10ms)
        const ragResult = await buildUnifiedRagContext(queryStr, userLat, userLng);
        send({
          type: 'metadata',
          places: ragResult.places,
          suggestions: ragResult.suggestions,
          data: ragResult.places,
        });

        // 2. Load History & Out-of-Scope Protection
        const history: Turn[] = clientHistory.length > 0
          ? clientHistory
          : await loadHistory(sessionId);

        if (checkIsOutOfScope(queryStr, history)) {
          const oosMsg = 'Tôi chỉ hỗ trợ các nội dung liên quan đến Tri Tôn và dự án Du Lịch Tri Tôn. Bạn hãy đặt câu hỏi trong phạm vi này.';
          const oosProvider = resolveAuditProvider(undefined, true);
          const oosModel = resolveAuditModel(undefined, undefined, true);
          const oosLatencyMs = calculateElapsedMs(t0);
          send({ type: 'token', token: oosMsg, delta: oosMsg });
          send({
            type: 'done',
            full_text: oosMsg,
            latency_ms: oosLatencyMs,
            suggestions: ['Hồ Tà Pạ có gì đẹp?', 'Ăn Gà Đốt Ô Thum ở đâu?', 'Chùa Khmer Bảy Núi'],
          });
          logChatEvent({
            session_id: sessionId,
            query: queryStr,
            response_preview: oosMsg.slice(0, 300),
            provider_used: oosProvider,
            model_used: oosModel,
            is_out_scope: true,
            latency_ms: oosLatencyMs,
          });
          controller.close();
          return;
        }

        const historySnippet = history.length > 0
          ? '\n\n[NGỮ CẢNH HỘI THOẠI TRƯỚC ĐÓ]:\n' +
            history.map((t) => `${t.role === 'user' ? '[Du Khách]' : '[Tôi - Trợ lý]'}: ${t.content.slice(0, 300)}`).join('\n')
          : '';

        const systemMsg = BASE_SYSTEM_PROMPT + historySnippet;
        const userMsg = ragResult.ragContext
          ? `Câu hỏi của Bạn: ${queryStr}\n\n[Lưu ý: Luôn ưu tiên thông tin thực tế mới nhất. CSDL Tri Tôn xác minh:\n${ragResult.ragContext}]`
          : `Câu hỏi của Bạn: ${queryStr}\n\n[Lưu ý: Hãy cung cấp thông tin thực tế, chính xác nhất về Tri Tôn, An Giang]`;

        // 3. Realtime Native SSE Token Streaming (<300ms TTFT)
        for await (const chunk of streamAIResponse(systemMsg, userMsg)) {
          if (chunk.type === 'delta' && chunk.content) {
            fullText += chunk.content;
            if (chunk.provider) {
              providerUsed = chunk.provider;
            }
            if (chunk.model) {
              modelUsed = chunk.model;
            }
            send({
              type: 'token',
              token: chunk.content,
              delta: chunk.content,
            });
          }
          if (chunk.type === 'done') {
            if (chunk.provider) {
              providerUsed = chunk.provider;
            }
            if (chunk.model) {
              modelUsed = chunk.model;
            }
          }
        }

        const actualLatencyMs = calculateElapsedMs(t0);

        // 4. Send Completion Event with 100% Dynamic Contextual Suggestions
        const dynamicSuggestions = generateSmartSuggestions({
          query: queryStr,
          assistantAnswer: fullText,
          matchedPlaces: ragResult.places,
        });

        const donePayload: StructuredStreamDoneEvent = {
          type: 'done',
          full_text: fullText,
          latency_ms: actualLatencyMs,
          suggestions: dynamicSuggestions,
          places: ragResult.places,
          provider: resolveAuditProvider(providerUsed),
          model: resolveAuditModel(modelUsed, providerUsed),
        };

        send(donePayload);

        // 5. Save Conversation Turn (Non-blocking)
        if (fullText.trim()) {
          const updatedHistory: Turn[] = [
            ...history,
            { role: 'user', content: queryStr },
            { role: 'assistant', content: fullText },
          ];
          void saveHistory(sessionId, updatedHistory);
        }

        logChatEvent({
          session_id: sessionId,
          query: queryStr,
          response_preview: fullText.slice(0, 300),
          provider_used: resolveAuditProvider(providerUsed),
          model_used: resolveAuditModel(modelUsed, providerUsed),
          rag_method: 'unified-rag-native-stream',
          places_count: ragResult.places.length,
          latency_ms: actualLatencyMs,
          is_out_scope: false,
        });
      } catch (err) {
        console.error('Chat stream error:', err);
        if (fullText.trim().length === 0) {
          const errMsg = 'Hiện tại hệ thống AI đang bận xử lý, bạn vui lòng thử lại sau giây lát nhé!';
          send({ type: 'token', token: errMsg, delta: errMsg });
          send({ type: 'done', full_text: errMsg, suggestions: [] });
        } else {
          // Bảo toàn fullText đã gửi ra client, không trả partial sai lệch (P04-017)
          const actualLatencyMs = calculateElapsedMs(t0);
          send({
            type: 'done',
            full_text: fullText,
            latency_ms: actualLatencyMs,
            suggestions: ['Hồ Tà Pạ có gì đẹp?', 'Ăn Gà Đốt Ô Thum ở đâu?'],
            provider: resolveAuditProvider(providerUsed || 'stream_error_recovery'),
            model: resolveAuditModel(modelUsed, providerUsed),
          });
        }
      } finally {
        controller.close();
      }
    },
  });

  const responseHeaders = new Headers({
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  if (ownership.token) {
    responseHeaders.set(SESSION_TOKEN_HEADER, ownership.token);
    responseHeaders.set('Set-Cookie', `${SESSION_TOKEN_COOKIE}=${ownership.token}; Path=/; HttpOnly; SameSite=Lax`);
  }

  return new Response(readable, {
    headers: responseHeaders,
  });
}

