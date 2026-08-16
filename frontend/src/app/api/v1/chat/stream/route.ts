import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { streamAIResponse, generateQueryEmbedding } from '@/lib/aiProvider';
import masterPois from '@/data/triton_pois_full.json';
import transportData from '@/data/tri_ton_transportation.json';

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
   - **Chỉ dẫn di chuyển đến 15 cung đường tuyệt cảnh & lối mòn check-in huyền thoại**:
     • *Con Đường Tơ Lụa Tri Tôn (Xã Núi Tô)*: Cung đường bê tông uốn lượn hình chữ S mềm mại giữa cánh đồng lúa Tà Pạ nối Hồ Soài Chek và Hàng Cây Trâm trăm tuổi. Từ chân đồi Tà Pạ đi theo đường bê tông liên ấp về hướng Hồ Soài Chek (đi xe máy/xe đạp lúc 06:00 sáng hoặc 16:30 chiều ngắm hoàng hôn).
     • *Đường Tuyến Tránh Tri Tôn & Nút Giao Chữ Y (Bao quanh TT. Tri Tôn)*: Tuyến đường 4.3km (4 làn xe rộng 11m) nối ĐT941 sang ĐT948. Nổi tiếng với nút giao hình chữ Y tuyệt đẹp giữa biển lúa, view panorama ôm trọn Núi Cô Tô & Núi Dài, điểm săn mây sườn núi và hoàng hôn triệu view.
     • *Cung Đường Hàng Cây Trâm Trăm Tuổi (Xã Núi Tô & Cô Tô)*: Hàng cây trâm cổ thụ trăm tuổi xanh ngắt mọc thẳng tắp giữa bờ ruộng lúa. Vào tháng 4 - tháng 6 hàng năm, cả hàng cây trĩu quả trâm chín mọng tím lịm, tạo nên khung cảnh đồng quê miền Tây độc nhất vô nhị.
     • *Cung Đường Hàng Me Cổ Thụ & Cầu Cây Me (Xã Châu Lăng)*: Tuyến ĐT948 rợp bóng mát bởi hàng me cổ thụ lâu đời, tập trung nhiều quán cháo bò trái chúc, đu đủ đâm Rina và bánh bò thốt nốt nướng than.
     • *Cung Đường Hoa Kèn Hồng & Bờ Kè Núi Tô (TT. Tri Tôn - Núi Tô)*: Tuyến đường hoa kèn hồng, kèn vàng rực rỡ sắc màu men theo bờ kè kênh dẫn vào Công viên Văn hóa và Hồ Soài Chek.
     • *Cung Đường Ô Tà Sóc & Rừng Tre Tầm Vông (Xã Lương Phi)*: Từ TT. Tri Tôn theo ĐT948 về hướng Ba Chúc 7km ➔ Ngã ba Xã Lương Phi rẽ trái vào đường Ô Tà Sóc chạy thẳng 2km. Con đường rợp bóng hàng ngàn bụi tầm vông xanh mướt dẫn vào Hang Chỉ Huy, Điện Trời Gầm, Suối Bạc và Đồi Ma Thiên Lãnh.
     • *Thung Lũng Tà Lọt & Cung Đường Hồ Tà Lọt / Suối Tà Lọt (Xã Lê Trì & An Hảo)*: Thung lũng hoang sơ kẹp giữa Núi Cấm và Núi Dài. Từ ĐT948 (đoạn Lê Trì) rẽ vào đường Tà Lọt men theo triền núi. Nơi có hồ thủy lợi Tà Lọt 531.000m³, suối đá trong vắt và các vườn cây ăn trái bản địa (sầu riêng, bơ, dâu da).
     • *Cung Đường Cây Thốt Nốt Trái Tim & Chân Núi Cô Tô (Xã Cô Tô & An Tức)*: Từ ngã 3 Tri Tôn đi ĐT941 hướng về Cô Tô 4km là tới cụm thốt nốt hình trái tim huyền thoại giữa cánh đồng lúa.
     • *Cung Đường Cổng Trời Chùa Koh Kas & Chùa Rô (Xã Châu Lăng)*: Từ ngã 3 Cây Me (ĐT948) rẽ vào đường bê tông liên ấp An Hòa xuyên qua cánh đồng lúa 1km. Xe máy vào tận nơi chụp ảnh, ô tô đậu ngoài đường nhựa lớn cách 200m rồi đi bộ vào.
     • *Cung Đường Đèo Sườn Núi Dài ĐT948 (Trục Phượt Bảy Núi)*: Tuyến huyết mạch uốn lượn ôm sát chân Núi Dài và Núi Cấm, nối Tri Tôn qua Châu Lăng, KDL Núi Cấm và Rừng tràm Trà Sư.
     • *Đường Vòng Hồ Soài So & Suối Vàng (Xã Núi Tô)*: Từ TT. Tri Tôn theo đường Trần Hưng Đạo 1.5km vào cổng KDL Suối Vàng - Hồ Soài So, ngắm vách đá dựng đứng của Núi Cô Tô in bóng xuống hồ nước 5ha.
     • *Cung Đường Hồ Soài Chek & Sân Đua Bò Hội Lớn (Xã Núi Tô)*: Tuyến đường hoa dẫn vào lòng hồ Soài Chek thơ mộng, công viên cây xanh và Sân đua bò Bảy Núi lớn nhất tỉnh An Giang.
     • *Cung Đường Đồi Tức Dụp & Hang C6 Lịch Sử (Xã An Tức)*: Từ TT. Tri Tôn theo ĐT948 đi 12km dẫn vào Đồi Tức Dụp (Ngọn đồi Hai Triệu Đô La) với hệ thống hang đá tự nhiên độc đáo.
     • *Cung Đường Làng Gốm Đất Nung Phnôm Pi (Xã Châu Lăng)*: Tuyến đường làng phum sóc Khmer dẫn vào làng nghề làm bếp Cà-ràng thủ công độc nhất miền Tây.
     • *Cung Đường Biên Giới Kênh Vĩnh Tế & Cửa Khẩu Vĩnh Gia (Xã Vĩnh Gia)*: Tuyến đường biên giới chạy dọc bờ Kênh Vĩnh Tế từ Ba Chúc đến Cửa khẩu Vĩnh Gia giáp Campuchia.
     • *Cung Đường Chinh Phục Chữ "TRI TÔN" Trên Núi Cô Tô (Khu vực Sân Tiên, Xã Núi Tô)*: Biểu tượng chữ "TRI TÔN" bằng bê tông cốt thép trắng sứ cao 7m nổi bật trên vách đá sườn núi Phụng Hoàng Sơn, có hệ thống đèn LED thắp sáng rực rỡ ban đêm. Điểm check-in kinh điển là đứng/ngồi trong lòng chữ "Ô" tạo hiệu ứng ô cửa sổ máy bay nhìn toàn cảnh cánh đồng Tà Pạ và thị trấn Tri Tôn. Cách đi: Khởi hành từ cổng KDL Hồ Soài So ➔ Thuê xe ôm bản địa (có phanh phụ chuyên dụng) hoặc trekking bộ qua Điện Năm Căn lên khu vực Sân Tiên (45 - 60 phút).
     • *Đường lên Hồ Tà Pạ & Chùa Tà Pạ (Xã Núi Tô)*: Từ đường Nguyễn Trãi (TT. Tri Tôn) rẽ vào dốc bê tông dài 1.2km lên Chùa Núi Tà Pạ. Xe máy (về số 1-2 khi lên/xuống, TUYỆT ĐỐI KHÔNG rà phanh liên tục), ô tô 4-7 chỗ lên tận sân chùa. Xe 16-29 chỗ nên đậu ở chân núi.
     • *Đường lên Đỉnh Núi Cô Tô & Vồ Hội Mẹ (Xã Cô Tô)*: Dốc đứng hơn 30 độ với cua tay áo cực gắt. CẢNH BÁO AN TOÀN: Tuyệt đối KHÔNG tự lái xe máy cá nhân nếu không quen đường dốc núi nguy hiểm. BẮT BUỘC thuê **Đội xe ôm bản địa Núi Cô Tô** (xe số độ phanh phụ chuyên dụng, khoảng 100k - 150k/người khứ hồi) hoặc trekking bộ 2-3 tiếng.
     • *Đường vào Hồ Ô Thum (Xã Ô Lâm)*: Từ TT. Tri Tôn theo đường ĐT955B đi Xã Ô Lâm ➔ Rẽ vào đường bờ hồ 1.5km. Đường trải nhựa và bê tông rộng rãi, ô tô 4-29 chỗ và xe máy vào tận bãi đỗ xe các quán gà đốt.

5. **Tôn trọng văn hóa Chùa Tháp Khmer**:
   - Khi vào chánh điện: Mặc trang phục lịch sự, cởi giày dép, không chỉ ngón tay trực tiếp vào tượng Phật.

6. **Cẩm nang Tri Tôn Về Đêm (Quán Cà Phê Mở Muộn & Dạo Phố)**:
   - CHẠM Coffee & Tea (Đường 3/2, Thị trấn Tri Tôn): Sân vườn thoáng mát ngoài trời đón gió núi Bảy Núi về đêm, mở đến 22:00.
   - Lang Lang Coffee & Tea (Đường Trần Hưng Đạo, Thị trấn Tri Tôn): Không gian check-in hiện đại, trà thốt nốt tươi, mở đến 21:30.
   - Quy Coffee House (Đường Nam Kỳ Khởi Nghĩa, Thị trấn Tri Tôn): Phong cách mộc ấm cúng, acoustic cuối tuần, mở đến 22:00.
   - NY Coffee & Tea (Đường Nguyễn Trãi, Thị trấn Tri Tôn): Trà sữa & kem thốt nốt máy lạnh, mở đến 22:00.
   - Khu Ẩm Thực Chợ Đêm Tri Tôn & Quảng Trường: Dạo mát, ăn vặt, mở đến 22:30.

7. **XỬ LÝ CÂU HỎI ĐA VẾ / NHIỀU Ý CÙNG LÚC (MULTI-INTENT & COMPOUND QUESTIONS)**:
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

        // Detect if query is about transportation, directions, scenic pathways, or bus lines
        let transportContext = '';
        if (/đi|xe|đường|tuyến|phương trang|huệ nghĩa|xe khách|thuê xe|leo núi|vồ hội|cô tô|tà pạ|ô thum|ô tà sóc|tà lọt|tơ lụa|chữ y|nút giao|chỉ đường|di chuyển/i.test(queryStr)) {
          transportContext = `\n\n[CSDL HƯỚNG DẪN GIAO THÔNG, XE CỘ & CÁC CUNG ĐƯỜNG DANH THẮNG TRI TÔN ĐÃ XÁC MINH]:\n${JSON.stringify(transportData, null, 2)}`;
        }

        const activeSystemPrompt = await getDynamicSystemConfig('SYSTEM_PROMPT', BASE_SYSTEM_PROMPT);
        const historySnippet = history.length > 0
          ? '\n\nLịch sử hội thoại gần nhất:\n' +
            history.map(t => `${t.role === 'user' ? 'Bạn' : 'Tôi'}: ${t.content}`).join('\n')
          : '';
        const systemMsg = activeSystemPrompt + historySnippet;
        
        const combinedContext = (ragContext || '') + (transportContext || '');
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
