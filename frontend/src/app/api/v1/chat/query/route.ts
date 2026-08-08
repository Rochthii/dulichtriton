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

// Multi-LLM Fallback Generator
async function generateAIResponse(userQuery: string, ragContext: string): Promise<string> {
  const fullPrompt = `${SYSTEM_PROMPT}\n\nThông tin bối cảnh xác minh từ CSDL Tri Tôn:\n${ragContext}\n\nCâu hỏi của Bạn: ${userQuery}`;

  const geminiKeys = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_2,
  ].filter(Boolean) as string[];

  // 1. Try Gemini Keys
  for (let i = 0; i < geminiKeys.length; i++) {
    const key = geminiKeys[i];
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: fullPrompt }] }],
          }),
          signal: AbortSignal.timeout(6000),
        }
      );
      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text.trim();
      }
    } catch (e) {
      console.warn(`[NextAI] Gemini key #${i + 1} failed:`, e);
    }
  }

  // 2. Try Groq AI
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: `Bối cảnh: ${ragContext}\n\nCâu hỏi: ${userQuery}` },
          ],
        }),
        signal: AbortSignal.timeout(6000),
      });
      if (res.ok) {
        const data = await res.json();
        const text = data?.choices?.[0]?.message?.content;
        if (text) return text.trim();
      }
    } catch (e) {
      console.warn('[NextAI] Groq AI failed:', e);
    }
  }

  // 3. Try OpenRouter Free AI
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  if (openrouterKey) {
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openrouterKey}`,
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.3-70b-instruct:free',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: `Bối cảnh: ${ragContext}\n\nCâu hỏi: ${userQuery}` },
          ],
        }),
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) {
        const data = await res.json();
        const text = data?.choices?.[0]?.message?.content;
        if (text) return text.trim();
      }
    } catch (e) {
      console.warn('[NextAI] OpenRouter failed:', e);
    }
  }

  return 'Tôi đã tổng hợp dữ liệu địa điểm Tri Tôn cho Bạn. Vui lòng tham khảo các gợi ý địa danh bên dưới!';
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

    const queryStr = body.query.trim();

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
    const isOutScope =
      (lowerQuery.includes('hà nội') || lowerQuery.includes('sài gòn') || lowerQuery.includes('đà nẵng') || lowerQuery.includes('thời tiết mỹ') || lowerQuery.includes('cổ phiếu')) &&
      !lowerQuery.includes('tri tôn') && !lowerQuery.includes('an giang');

    if (isOutScope) {
      return NextResponse.json({
        text_response: 'Tôi chỉ hỗ trợ các nội dung liên quan đến Tri Tôn và dự án Du Lịch Tri Tôn. Bạn hãy đặt câu hỏi trong phạm vi này.',
        ui_components: [],
        videos: [],
        suggestions: ['Hồ Tà Pạ có gì đẹp?', 'Ăn Gà Đốt Ô Thum ở đâu?', 'Chùa Khmer Bảy Núi'],
      });
    }

    // Query Supabase for enriched place metadata
    const { data: places } = await supabase
      .from('places')
      .select('id, slug, name, commune, category, rating, image_url, description, golden_time_windows, price_range, best_time_to_visit')
      .or(`name.ilike.%${queryStr}%,category.ilike.%${queryStr}%,commune.ilike.%${queryStr}%,description.ilike.%${queryStr}%`)
      .limit(4);

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

    // Generate AI response with Multi-LLM provider fallback
    const aiTextResponse = await generateAIResponse(queryStr, ragContext);

    // Fetch related videos from video_discoveries
    const { data: videos } = await supabase
      .from('video_discoveries')
      .select('id, title, video_url, thumbnail_url, author_name, view_count')
      .limit(2);

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
