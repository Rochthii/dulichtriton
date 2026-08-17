import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { streamAIResponse, generateQueryEmbedding } from '@/lib/aiProvider';
import masterPois from '@/data/triton_pois_full.json';
import transportData from '@/data/tri_ton_transportation.json';
import festivalsData from '@/data/tri_ton_festivals.json';

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

3. **Cẩm nang Ẩm thực & Đặc sản Bảy Núi 2026 (Chỉ dùng các quán đã xác minh thực tế 100%)**:
   - **Gà Đốt Ô Thum & Tri Tôn**: Chế biến theo phương pháp đốt truyền thống (đốt kín trong nồi/thố đậy nắp với sả và lá chúc tươi 35-45 phút — TUYỆT ĐỐI KHÔNG gọi là 'nướng' mà phải dùng từ 'đốt'). Luôn nhắc du khách nên gọi đặt trước 30-45 phút.
     • **Các quán gà đốt thực tế đã xác minh 100%**:
       1. *Quán Siêu Gà Đốt Ô Thum (Chau Siêu)*: Quán gốc tiên phong ven hồ Ô Thum, Xã Ô Lâm.
       2. *Gà Đốt Ô Thum Kim Suổl*: Quán nổi tiếng da giòn, tẩm ướp đậm đà, Ấp Phước An, Xã Ô Lâm.
       3. *Quán Kiều Tiên Gà Đốt Ô Thum*: Quán ven hồ nổi tiếng có Cầu gỗ & Nấc thang thiên đường, Xã Ô Lâm.
       4. *Gà Đốt Vương Ngọc Ô Thum*: Quán lâu đời với nước chấm mắm chúc độc quyền, Xã Ô Lâm.
       5. *Gà Đốt Thảo Nguyên Hồ Ô Thum*: Sân vườn chòi lá thoáng mát ven hồ Ô Thum, Xã Ô Lâm.
       6. *Gà Đốt Thành Đạt Ô Thum*: Phục vụ chu đáo, chòi lá rộng rãi cho gia đình và đoàn phượt tại KDL Hồ Ô Thum, Xã Ô Lâm.
       7. *Gà Đốt Ốc Đảo Quán Hồ Ô Thum*: Mỏm đất ốc đảo nhô ra giữa hồ Ô Thum với tầm nhìn 360 độ ngắm trọn mặt nước xanh, Xã Ô Lâm.
       8. *Quán Gà Đốt Ai Đó Ô Thum*: Quán gia đình ven hồ Ô Thum, giá bình dân, Xã Ô Lâm.
       9. *Quán Gà Đốt Hoa Mặt Trời (Núi Dài)*: Quán nổi tiếng sườn Núi Dài ĐT948, gà thả đồi tươi ngon, Xã Lê Trì.
       10. *Gà Đốt Danh Hây Ô Thum*: Quán gia đình người Khmer mộc mạc bản địa, Xã Ô Lâm.
       11. *Quán Gà Đốt & Vườn Nho Ô Thum*: Trải nghiệm hái nho 2ha kết hợp gà đốt chòi lá ven hồ, Xã Ô Lâm.
       12. *Gà Đốt Trí Hải Ô Thum*: Đường 3/2 và cơ sở ven hồ Ô Thum, Xã Ô Lâm.
       13. *Gà Đốt Ô Thum Mây Mây*: Phong cách trẻ trung kết hợp xôi thốt nốt chiên phồng, Xã Ô Lâm.
       14. *Gà Đốt 7 Núi Ô Thum*: Gà thả đồi Bảy Núi đốt nồi đất than hồng rực, Xã Ô Lâm.
     • **NGHIÊM CẤM TỰ BỊA TÊN QUÁN**: Tuyệt đối không nhắc hoặc gợi ý các tên quán không có thật ngoài đời như Sáu Búp, Rô THUM, Tuấn Tới.
4. **Cẩm nang Giao Thông, Tuyến Đường Di Chuyển & Chỉ Dẫn Leo Núi An Toàn (Transit & Route Mastery)**:
   - **Xe khách chất lượng cao từ TP.HCM**:
     • *Nhà xe Huệ Nghĩa (Hotline 1900 636497)*: Xe Limousine VIP & Giường nằm chạy tuyến thẳng TP.HCM (BX Miền Tây, trạm An Sương) ➔ Bến xe Tri Tôn & Ba Chúc (mỗi 1-2 tiếng có 1 chuyến 24/7).
     • *Nhà xe Phương Trang FUTA (Hotline 1900 6067 - Văn phòng Tri Tôn: 51 Đường 3 Tháng 2, TT. Tri Tôn)*: Tuyến xe giường nằm cao cấp chạy thẳng TP.HCM (BX Miền Tây) ➔ Bến xe Tri Tôn & Văn phòng 51 Đường 3/2 (nhiều chuyến liên tục trong ngày, có thể đặt vé trực tiếp trên ứng dụng FUTA App hoặc website futabus.vn).
   - **Cung đường tự lái tối ưu**:
     • *Từ TP.HCM*: Cao tốc TP.HCM - Trung Lương - Mỹ Thuận ➔ Cầu Vàm Cống ➔ TP. Long Xuyên ➔ Rẽ trái vào Tỉnh lộ ĐT941 (ngã ba Lộ Tẻ Tri Tôn) ➔ Chạy thẳng 45km đến TT. Tri Tôn (khoảng 210km, 4.5 - 5 tiếng).
     • *Từ TP. Cần Thơ*: QL91 ➔ TP. Long Xuyên ➔ ĐT941 ➔ Tri Tôn (khoảng 110km, 2.5 tiếng).
     • *Từ TP. Châu Đốc*: QL91 ➔ Rẽ vào Tỉnh lộ ĐT948 (qua Rừng tràm Trà Sư, KDL Núi Cấm) ➔ Men theo sườn Núi Dài qua Xã Châu Lăng ➔ TT. Tri Tôn (khoảng 45km, 1 tiếng - cung đường ngắm cảnh đẹp nhất).
     • *Từ TP. Rạch Giá (Kiên Giang)*: QL80 ➔ Kênh Tám Ngàn ➔ Xã Cô Tô ➔ TT. Tri Tôn (khoảng 75km, 1.8 tiếng).
   - **Chỉ dẫn di chuyển đến các danh thắng & đèo núi**:
     • *Con Đường Tơ Lụa Tri Tôn (Xã Núi Tô)*: Cung đường bê tông uốn lượn hình chữ S mềm mại giữa cánh đồng lúa Tà Pạ nối Hồ Soài Chek và Hàng Cây Trâm trăm tuổi.
     • *Đường Tuyến Tránh Tri Tôn & Nút Giao Chữ Y (Bao quanh TT. Tri Tôn)*: Nút giao hình chữ Y tuyệt đẹp giữa biển lúa ngắm Núi Cô Tô & Núi Dài.
     • *Đường lên Hồ Tà Pạ & Chùa Tà Pạ (Xã Núi Tô)*: Dốc bê tông 1.2km từ đường Nguyễn Trãi lên chùa. Xe máy số, ô tô 4-7 chỗ lên tận nơi.
     • *Đường lên Đỉnh Núi Cô Tô & Vồ Hội Mẹ (Xã Cô Tô)*: Dốc đứng hơn 30 độ. Khuyến cáo thuê **Đội xe ôm bản địa Núi Cô Tô** (xe số phanh phụ chuyên dụng) hoặc trekking bộ.

5. **Cẩm nang Quán Cà Phê & Điểm Dừng Chân Thư Giãn Tri Tôn Chuẩn Thực Tế 100%**:
   - **Quán cà phê view cánh đồng, đồi núi & ngắm cảnh đẹp**:
     • *RUỘNG Coffee & Tea (RUỘNG Coffee & Homestay)*: Đường vào Hồ Soài Chek, Xã Núi Tô. View ngắm trọn vẹn cánh đồng lúa và sườn Núi Tô.
     • *Tiệm Cà Phê Nhà Quê*: Khu vực Cầu số 10, Xã Tà Đảnh, Tri Tôn. Cầu ván gỗ mộc mạc dẫn thẳng ra giữa biển lúa mênh mông.
     • *Windy Hill Coffee & Homestay*: Lưng chừng đồi Tà Pạ, Xã Núi Tô.
     • *Mây Sơn Coffee Garden*: Chân Núi Cô Tô, Xã Núi Tô.
     • *Anpalm Cafe*: Nổi bật với thức uống thốt nốt sáng tạo và acoustic đêm.
   - **Quán cà phê trung tâm thị trấn, máy lạnh & mở muộn về đêm**:
     • *CHẠM Coffee & Tea*: Đường 3 Tháng 2, TT. Tri Tôn (mở đến 22:00).
     • *NY Coffee & Tea*: 66 Trần Phú, TT. Tri Tôn (máy lạnh, kem thốt nốt, mở đến 22:00).
     • *Tritoni Coffee*: 92 Trần Hưng Đạo, TT. Tri Tôn.
     • *Lang Lang Coffee & Tea*: Đường Trần Hưng Đạo, TT. Tri Tôn.
     • *Quy Coffee House*: Đường Nam Kỳ Khởi Nghĩa, TT. Tri Tôn.
     • *Cà Phê Thủy Mộc*: 111 Nguyễn Thị Minh Khai, TT. Tri Tôn.

6. **Cẩm nang 6 Đại Lễ Hội & Thể Thao Hàng Không Tri Tôn Chuẩn Xác Minh 100%**:
   - **Lễ Hội Khinh Khí Cầu & Dù Lượn Thất Sơn ("Bay giữa mùa lễ hội" / "Bay trên Phụng Hoàng Sơn")**:
     • **Thời gian**: Thường niên vào dịp **Lễ Quốc Khánh 2/9 (01/9 - 03/9)** và dịp **Lễ Sêne Đônta / Đua Bò (tháng 8 - 9 âm lịch)**; đợt dù lượn thể thao vào dịp **30/4 - 1/5**.
     • **Địa điểm chính**: **Khu Thể thao - Du lịch Tà Pạ - Soài Chek / Sân Đua Bò Tri Tôn (Xã Núi Tô)**. Điểm cất cánh dù lượn: **Đỉnh Phụng Hoàng Sơn (Núi Cô Tô - khu vực Vồ Hội Mẹ / Sân Tiên >500m)**, hạ cánh xuống Sân Tà Pạ. Khuôn viên bay khinh khí cầu: Cánh đồng Tà Pạ và Hồ Soài Chek.
     • **Nghi thức & Trải nghiệm đỉnh cao**: Thượng cờ Tổ quốc khổng lồ 200m² bằng khinh khí cầu cấp 7; Trình diễn 17 khinh khí cầu rực rỡ; Bay treo khinh khí cầu (Tethered Flight) cao 30-50m ngắm núi Cô Tô; Trình diễn dù lượn Paragliding & Paramotor xả khói ngũ sắc; Đêm Hoa Đăng thổi lửa khinh khí cầu (Night Glow) kết hợp âm nhạc Acoustic.
     • **Kinh nghiệm đi xem thực tế**: Khung giờ vàng buổi sáng (06:00 - 08:30) xem cất cánh và khinh khí cầu bay êm gió nhất; chiều mát (15:30 - 17:30) xem dù lượn hạ cánh; tối (18:30 - 21:00) xem Đêm hoa đăng. Vị trí ngắm đẹp nhất: Khán đài Sân Đua Bò Tri Tôn và Bờ kè Hồ Soài Chek.
   - **Lễ Hội Đua Bò Bảy Núi Truyền Thống**: Di sản phi vật thể quốc gia dịp Lễ Sêne Đônta (cuối tháng 8 - đầu tháng 9 âm lịch) tại Sân Đua Bò Tri Tôn (Xã Núi Tô) & Chùa Rô (Xã Châu Lăng). Kịch tính với Vòng Hô lấy đà và Vòng Thả bứt tốc rẽ sóng bùn nước.
   - **Tết Cổ Truyền Chôl Chnăm Thmây**: 13 - 16/4 dương lịch tại 37 Chùa Khmer Tri Tôn (Nghi thức Đắp Núi Cát tích phúc, Lễ Tắm Phật Srong Preah, Dàn nhạc Ngũ Âm Pinpeat, múa Răm-vông).
   - **Lễ Hội Sêne Đônta (Lễ Cúng Ông Bà)**: 29/8 - 01/9 âm lịch (Lễ Đặt Cơm Vắt Bay Ben, Cúng Ông Bà tại tư gia, Thả Thuyền Cà Tang).
   - **Lễ Hội Cúng Trăng Ok Om Bok & Thả Đèn Gió / Đèn Nước**: Đêm rằm tháng 10 âm lịch tại Chùa Xvayton, Hồ Tà Pạ & Hồ Soài So (Cúng trăng, đút Cốm dẹp Om Bok cầu may, thả đèn hoa đăng và đèn gió).
   - **Đại Lễ Dâng Y Kathina**: Rằm tháng 9 - Rằm tháng 10 âm lịch (Rước Y Cà Sa quanh phum sóc, hòa tấu Nhạc Ngũ Âm).

7. **XỬ LÝ CÂU HỎI ĐA VẾ / NHIỀU Ý CÙNG LÚC (MULTI-INTENT & COMPOUND QUESTIONS)**:
   - Khi người dùng đặt câu hỏi có từ 2-3 vế trở lên (Ví dụ: hỏi lễ hội kèm thời gian, địa điểm, nghi thức, kinh nghiệm thực tế; hoặc hỏi cảnh đẹp + quán ăn + cafe):
     1. BẮT BUỘC trả lời ĐẦY ĐỦ TỪNG VẾ câu hỏi theo đúng cấu trúc tiêu đề rõ ràng, mạch lạc:
        • ### 1. Thời Gian & Địa Điểm Tổ Chức
        • ### 2. Các Nghi Thức & Hoạt Động Trải Nghiệm Đỉnh Cao
        • ### 3. Kinh Nghiệm Đi Xem Thực Tế (Khung giờ vàng, vị trí ngắm, trang phục, ăn uống kết hợp)
     2. Đính kèm đầy đủ link Google Maps và TikTok cho từng địa điểm xuất hiện trong bài viết.
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

let cachedWeatherText = '';
let cachedWeatherTimestamp = 0;

async function fetchLiveWeatherContext(): Promise<string> {
  // Cache in-memory 15 phút (900,000ms)
  if (cachedWeatherText && Date.now() - cachedWeatherTimestamp < 15 * 60 * 1000) {
    return cachedWeatherText;
  }
  try {
    const res = await fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=10.4128&longitude=105.0068&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia%2FHo_Chi_Minh',
      { signal: AbortSignal.timeout(1200) }
    );
    if (!res.ok) return cachedWeatherText;
    const data = await res.json();
    const cur = data?.current_weather;
    if (!cur) return cachedWeatherText;
    cachedWeatherText = `\n\n[Dữ liệu thời tiết Tri Tôn thực tế hiện tại: Nhiệt độ ${Math.round(cur.temperature)}°C, Gió cấp ${Math.round(cur.windspeed)} km/h. Khuyên du khách đội nón lá/mũ rộng vành, mang kem chống nắng nếu đi vào buổi trưa.]`;
    cachedWeatherTimestamp = Date.now();
    return cachedWeatherText;
  } catch {
    return cachedWeatherText;
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
  if (lower.includes('cà phê') || lower.includes('cafe') || lower.includes('uống nước'))
    return ['Quán RUỘNG Coffee view cánh đồng', 'Tiệm Cà Phê Nhà Quê Tà Đảnh', 'Quán CHẠM Coffee mở đêm Tri Tôn', 'NY Coffee & Tea máy lạnh'];
  if (lower.includes('ăn') || lower.includes('gà đốt') || lower.includes('cháo bò'))
    return ['Quán Gà Đốt Thành Đạt Ô Thum', 'Quán Siêu Gà Đốt Ô Thum', 'Địa chỉ Cháo Bò Bảy Núi'];
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

  // VIỆC 1: Nhận conversationHistory trực tiếp từ Client body (ưu tiên hơn DB load)
  // Client gửi 5 lượt gần nhất → 0ms latency, không cần DB roundtrip
  const clientHistory: Turn[] = Array.isArray(body.history)
    ? (body.history as Turn[]).slice(-5)
    : [];
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

        // 0. Check In-Memory Instant Hot Cache
        const hotHit = HOT_QUERY_CACHE.get(cleanQ);
        if (hotHit && Date.now() - hotHit.timestamp < 24 * 60 * 60 * 1000) {
          if (hotHit.places && hotHit.places.length > 0) {
            send({ type: 'metadata', places: hotHit.places, suggestions: hotHit.suggestions, data: hotHit.places });
          }
          const words = hotHit.answer.split(' ');
          for (let i = 0; i < words.length; i += 3) {
            const chunk = words.slice(i, i + 3).join(' ') + ' ';
            send({ type: 'token', token: chunk, delta: chunk });
            await new Promise(r => setTimeout(r, 15));
          }
          send({ type: 'done', full_text: hotHit.answer, suggestions: hotHit.suggestions, places: hotHit.places });
          controller.close();
          return;
        }

        // 1. Instant In-Memory RAM Entity Matching
        const subQueries = extractSubQueries(queryStr);
        const matchedPlacesMap = new Map<string, any>();

        for (const sq of subQueries) {
          const cleanSq = sq.toLowerCase().replace(/[?!.,]/g, '').trim();
          if (cleanSq.length < 2) continue;

          if (lower.includes('khinh khí cầu') || lower.includes('dù lượn') || lower.includes('thất sơn bay')) {
            (masterPois as any[])
              .filter(p => p.id === 'PL020' || p.id === 'PL009' || p.id === 'HG001' || p.id === 'PL001')
              .forEach(p => matchedPlacesMap.set(p.id, p));
          } else if (lower.includes('đua bò') || lower.includes('sêne đônta') || lower.includes('sene donta')) {
            (masterPois as any[])
              .filter(p => p.id === 'PL020' || p.id === 'HG005' || p.id === 'HG002')
              .forEach(p => matchedPlacesMap.set(p.id, p));
          } else if (lower.includes('cà phê') || lower.includes('cafe') || lower.includes('quán nước')) {
            (masterPois as any[])
              .filter(p => p.subcategory === 'cafe' || (p.name && (p.name.toLowerCase().includes('coffee') || p.name.toLowerCase().includes('cà phê'))))
              .slice(0, 4)
              .forEach(p => matchedPlacesMap.set(p.id, p));
          } else if (lower.includes('ăn') || lower.includes('đặc sản') || lower.includes('gà đốt')) {
            (masterPois as any[])
              .filter(p => p.category === 'gastronomy' || p.category === 'food' || (p.name && p.name.toLowerCase().includes('gà đốt')))
              .slice(0, 4)
              .forEach(p => matchedPlacesMap.set(p.id, p));
          } else {
            const words = cleanQ.split(' ').filter(w => w.length >= 2);
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

        send({ type: 'metadata', places: formattedPlaces, suggestions: buildSuggestions(lower), data: formattedPlaces });

        // 2. Load History & Out-of-scope check
        // Ưu tiên: client-sent history (0ms) > DB load (200ms)
        const history: Turn[] = clientHistory.length > 0
          ? clientHistory
          : await loadHistory(sessionId);
        if (checkIsOutOfScope(queryStr, history)) {
          const oosMsg = 'Tôi chỉ hỗ trợ các nội dung liên quan đến Tri Tôn và dự án Du Lịch Tri Tôn. Bạn hãy đặt câu hỏi trong phạm vi này.';
          send({ type: 'token', token: oosMsg, delta: oosMsg });
          send({ type: 'done', full_text: oosMsg, suggestions: ['Hồ Tà Pạ có gì đẹp?', 'Ăn Gà Đốt Ô Thum ở đâu?', 'Chùa Khmer Bảy Núi'] });
          logChatEvent({ session_id: sessionId, query: queryStr, is_out_scope: true });
          controller.close();
          return;
        }

        const ragContext = places.length > 0
          ? places.map(p => {
              const storySnippet = p.detailed_story ? String(p.detailed_story).slice(0, 600) : (p.description ? String(p.description).slice(0, 200) : '');
              const tipsSnippet = (p as any).field_tips ? `\n  - Mẹo thực địa: ${(p as any).field_tips}` : '';
              return `* Địa điểm: ${p.name} (Địa phận: ${p.commune || 'Tri Tôn'})\n  - Phân loại: ${p.category} (Đánh giá: ${p.rating || 4.8}/5)${tipsSnippet}\n  - Thông tin thực địa chi tiết: ${storySnippet}`;
            }).join('\n\n')
          : '';

        let transportContext = '';
        if (/đi|xe|đường|tuyến|phương trang|huệ nghĩa|xe khách|thuê xe|leo núi|vồ hội|cô tô|tà pạ|ô thum|ô tà sóc|tà lọt|tơ lụa|chữ y|nút giao|chỉ đường|di chuyển/i.test(queryStr)) {
          transportContext = `\n\n[CSDL HƯỚNG DẪN GIAO THÔNG, XE CỘ & CÁC CUNG ĐƯỜNG DANH THẮNG TRI TÔN ĐÃ XÁC MINH]:\n${JSON.stringify(transportData, null, 2)}`;
        }

        let festivalsContext = '';
        if (/khinh khí cầu|dù lượn|lễ hội|hội|đua bò|chôl chnăm|sêne đônta|sene donta|ok om bok|cúng trăng|kathina|dâng y|tết khmer|hoa đăng/i.test(queryStr)) {
          festivalsContext = `\n\n[CSDL 6 ĐẠI LỄ HỘI & SỰ KIỆN VĂN HÓA THỂ THAO TRI TÔN ĐÃ XÁC MINH 100%]:\n${JSON.stringify(festivalsData, null, 2)}`;
        }

        const activeSystemPrompt = await getDynamicSystemConfig('SYSTEM_PROMPT', BASE_SYSTEM_PROMPT);

        // VIỆC 1: Inject conversation history vào System Prompt với context rõ ràng
        const historySnippet = history.length > 0
          ? '\n\n[NGỮ CẢNH HỘI THOẠI TRƯỚC ĐÓ — Dùng để hiểu đại từ "đó", "chỗ đó", "ở đây", "đó" v.v.]:\n' +
            history.map(t => `${t.role === 'user' ? '[Du Khách]' : '[Tôi - Trợ lý]'}: ${t.content.slice(0, 300)}`).join('\n')
          : '';

        // VIỆC 4: Luôn inject thời tiết thực tế vào mọi câu hỏi (Promise.race với timeout 500ms)
        const weatherContext = await Promise.race([
          fetchLiveWeatherContext(),
          new Promise<string>(resolve => setTimeout(() => resolve(''), 500)),
        ]);

        const systemMsg = activeSystemPrompt + historySnippet + weatherContext;

        const combinedContext = [ragContext, transportContext, festivalsContext].filter(Boolean).join('\n\n');
        const userMsg = combinedContext
          ? `Câu hỏi của Bạn: ${queryStr}\n\n[Lưu ý: Luôn ưu tiên kiến thức thực tế và kết quả tìm kiếm internet mới nhất. Tham khảo thêm CSDL địa phương đã xác minh nếu phù hợp:\n${combinedContext}]`
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

          if (fullText.trim().length >= 80 && !fullText.includes('Tôi đã tổng hợp các địa điểm danh thắng')) {
            HOT_QUERY_CACHE.set(cleanQ, {
              answer: fullText,
              places: formattedPlaces,
              suggestions: buildSuggestions(lower),
              timestamp: Date.now(),
            });
          }
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
