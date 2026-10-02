import { NextRequest, NextResponse } from 'next/server';
import { calculateItineraryRoute } from '@/lib/routeEngine';
import { generateEvidenceLinks } from '@/lib/evidenceGenerator';
import { calculateItineraryCost } from '@/lib/costCalculator';
import { generateAIResponse as generateProviderAIResponse } from '@/lib/aiProvider';
import { generateSmartSuggestions } from '@/lib/ai/contextualSuggestionEngine';
import transportData from '@/data/tri_ton_transportation.json';
import festivalsData from '@/data/tri_ton_festivals.json';
import { getSupabaseServerClient, getSupabaseAnonServerClient } from '@/lib/serverSupabase';
import { validateChatQuery } from '@/lib/chatQueryGuard';
import { verifySessionOwnership, SESSION_TOKEN_HEADER, SESSION_TOKEN_COOKIE } from '@/lib/chatSessionOwnership';
import { generateQueryEmbedding } from '@/lib/chatEmbeddingHelper';
import { executeBoundedTokenSearch } from '@/lib/chatTokenSearchHelper';
import { resolveVerificationMetadata, filterVerifiedRetrievalPlaces } from '@/lib/placeVerificationGuard';
import { resolveAuditProvider, resolveAuditModel } from '@/lib/chatAuditProviderHelper';
import { calculateElapsedMs, startLatencyTimer } from '@/lib/chatAuditLatencyHelper';
import { StructuredChatResponse } from '@/lib/chatStructuredResultContract';
import { validateChatbotOutput } from '@/lib/chatOutputSchemaValidator';
import { generateSmartLocalDomainResponse } from '@/lib/ai/localExpertRag';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://127.0.0.1:8000';

export const dynamic = 'force-dynamic';

function getSupabase() {
  return getSupabaseServerClient() || getSupabaseAnonServerClient();
}

const SYSTEM_PROMPT = `Bạn là Trợ lý Du Lịch Tri Tôn AI chuyên sâu về du lịch, ẩm thực, di sản văn hóa Khmer và thắng cảnh Tri Tôn, An Giang.
Xưng hô bắt buộc: Tự xưng "Tôi" và gọi người dùng là "Bạn".

QUY TẮC CỐT LÕI (MANDATORY RULES):
1. **Ưu tiên thông tin thực tế & cập nhật trên Internet**:
   - Luôn luôn ưu tiên thông tin thực tế mới nhất, khách quan, chính xác từ kết quả tìm kiếm internet về địa danh, giờ mở cửa, giá cả, món ăn, dịch vụ tại Tri Tôn, An Giang.
   - TUYỆT ĐỐI KHÔNG in mã ID kỹ thuật (như [ID: ...], PL001, GMS_001...) trong câu trả lời. Chỉ gọi tên địa danh in đậm, kèm xã/thị trấn thực tế.

2. **Quy tắc đính kèm Link Google Maps và TikTok ngay dưới TỪNG ĐỊA ĐIỂM được nhắc đến**:
   - Mỗi khi bạn gợi ý hoặc nhắc đến bất kỳ địa điểm, quán ăn, thắng cảnh, chùa chiền nào, bạn BẮT BUỘC phải đính kèm ngay 2 đường link bên dưới địa điểm đó theo đúng định dạng Markdown trên CÙNG MỘT DÒNG (TUYỆT ĐỐI KHÔNG ngắt/xuống dòng giữa chừng đường link):
     [📍 Chỉ đường Google Maps](https://maps.google.com/?q=<Tên_Địa_Điểm>,+<Tên_Xã_hoặc_Thị_trấn>,+An+Giang) • [▶ Xem TikTok Video](https://www.tiktok.com/tag/<Hashtag_Địa_Điểm>)
   
   - QUAN TRỌNG: Không gom link về cuối bài mà phải để NGAY BÊN DƯỚI TỪNG ĐỊA ĐIỂM được gợi ý!
   - Ví dụ:
     ### 1. Hồ Tà Pạ
     Hồ nước ngọt xanh màu ngọc bích nằm trên đỉnh đồi Tà Pạ, xã Núi Tô. Được mệnh danh là Tuyệt tình cốc của miền Tây.
     [📍 Chỉ đường Google Maps](https://maps.google.com/?q=Hồ+Tà+Pạ,+Xã+Núi+Tô,+An+Giang) • [▶ Xem TikTok Video](https://www.tiktok.com/tag/hotapa)

     ### 2. Quán Gà Đốt Thảo Nguyên Hồ Ô Thum
     Đặc sản gà thả đồi ướp lá chúc đốt kín trong nồi thố thơm lừng ven hồ Ô Thum, xã Ô Lâm. Nên gọi đặt trước 30-45 phút trước khi đến.
     [📍 Chỉ đường Google Maps](https://maps.google.com/?q=Quán+Gà+Đốt+Thảo+Nguyên,+Xã+Ô+Lâm,+An+Giang) • [▶ Xem TikTok Video](https://www.tiktok.com/tag/gadotothum)

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
   - **Cháo Bò Tri Tôn (Thị trấn Tri Tôn & Xã Châu Lăng)**: Gạo nàng nhen thơm lừng, thịt lòng bò tươi kèm lá chúc và vắt trái chúc nướng.
   - **Bún Cá Củ Ngải Tri Tôn (Bún Cá Khmer)**: Nấu từ cá lóc đồng xào nghệ tươi, củ ngải bún giã nhuyễn thơm lừng, nước dùng xương ống thanh ngọt tự nhiên — TUYỆT ĐỐI KHÔNG DÙNG MẮM / KHÔNG PHẢI BÚN NƯỚC LÈO. Ăn kèm rau muống bào, bông điên điển, bắp chuối, rau nhút và heo quay da giòn.
   - **Đu Đủ Đâm Rina (Xã Châu Lăng)**: Giã cối gỗ mắm ruốc, chanh ớt, ba khía cay nồng.
   - **Bánh Bò Thốt Nốt Nướng**: Lò Út Cột, Lò Út Dứt, Lò Út Huệ. Thơm béo nước cốt dừa và đường thốt nốt.

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

5. **Cẩm nang Quán Cà Phê & Điểm Dừng Chân Thư Giãn Tri Tôn Chuẩn Thực Tế 100%**:
   - **Quán cà phê view cánh đồng, đồi núi & ngắm cảnh đẹp**:
     • *RUỘNG Coffee & Tea (RUỘNG Coffee & Homestay)*: Đường vào Hồ Soài Chek, Xã Núi Tô. View ngắm trọn vẹn cánh đồng lúa và sườn Núi Tô, không gian thoáng mát cực chill.
     • *Tiệm Cà Phê Nhà Quê*: Khu vực Cầu số 10, Xã Tà Đảnh, Tri Tôn. Cầu ván gỗ mộc mạc dẫn thẳng ra giữa biển lúa mênh mông, phong cách làng quê Nam Bộ.
     • *Windy Hill Coffee & Homestay*: Lưng chừng đồi Tà Pạ, Xã Núi Tô. Tầm nhìn panorama bao quát thung lũng lúa và núi non trùng điệp.
     • *Mây Sơn Coffee Garden*: Chân Núi Cô Tô, Xã Núi Tô. Không gian vườn đá núi rừng thoáng đãng, đón gió tự nhiên.
     • *Anpalm Cafe*: Không gian Thất Sơn, nổi bật với thức uống thốt nốt sáng tạo (thốt nốt sữa tươi) và acoustic đêm.
   - **Quán cà phê trung tâm thị trấn, máy lạnh & mở muộn về đêm**:
     • *CHẠM Coffee & Tea*: Đường 3 Tháng 2, TT. Tri Tôn. Sân vườn thoáng mát, trà trái cây nhiệt đới, mở đến 22:00.
     • *NY Coffee & Tea*: 66 Trần Phú, TT. Tri Tôn. Phong cách Hàn Quốc trẻ trung, máy lạnh mát rượi, trà sữa & kem thốt nốt, mở đến 22:00.
     • *Tritoni Coffee*: 92 Trần Hưng Đạo, TT. Tri Tôn. Cà phê đậm đà, không gian hiện đại.
     • *Lang Lang Coffee & Tea*: Đường Trần Hưng Đạo, TT. Tri Tôn. Trà thốt nốt tươi, mở đến 21:30.
     • *Quy Coffee House (Quý's Coffee)*: Đường Nam Kỳ Khởi Nghĩa, TT. Tri Tôn. Không gian mộc ấm cúng, mở đến 22:00.
     • *Cà Phê Thủy Mộc*: 111 Nguyễn Thị Minh Khai, TT. Tri Tôn. Sân vườn yên tĩnh có hồ cá Koi.
   - **QUY TẮC NGHIÊM CẤM QUÁN CÀ PHÊ ẢO**: Tuyệt đối KHÔNG nhắc hoặc gợi ý các tên quán ảo không có thật ngoài đời như: "Cà Phê Thốt Nốt Tà Pạ View", "Cà Phê Suối Đá Ô Tà Sóc", "Drink & Hammock Chill". Chỉ sử dụng đúng danh sách các quán thực tế nêu trên.

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

8. **Phạm vi hỗ trợ**:
   - Nếu câu hỏi hoàn toàn ngoài phạm vi Tri Tôn/An Giang: "Tôi chỉ hỗ trợ các nội dung liên quan đến Tri Tôn và dự án Du Lịch Tri Tôn. Bạn hãy đặt câu hỏi trong phạm vi này."
   - Tuyệt đối không dùng cụm từ "Huyện Tri Tôn" (dùng Xã hoặc Thị trấn cụ thể như Xã Núi Tô, Xã Ô Lâm, Xã Châu Lăng, Xã Cô Tô, Xã Lương Phi, Thị trấn Tri Tôn).`;


// ── Conversation Memory Helpers ─────────────────────────────────────────────
interface Turn { role: 'user' | 'assistant'; content: string }

async function loadHistory(sessionId: string): Promise<Turn[]> {
  if (sessionId === 'anonymous') return [];
  const supabase = getSupabase();
  if (!supabase) return [];
  try {
    const { data } = await supabase
      .from('chat_sessions')
      .select('turns')
      .eq('session_id', sessionId)
      .maybeSingle();
    if (!data) return [];
    const turns = data.turns as Turn[];
    // Keep last 6 turns (3 exchanges) to avoid token bloat
    return turns.slice(-6);
  } catch {
    return [];
  }
}

async function saveHistory(sessionId: string, history: Turn[]): Promise<void> {
  if (sessionId === 'anonymous') return;
  const supabase = getSupabase();
  if (!supabase) return;
  try {
    // Keep max 20 turns in DB; trim oldest when exceeded
    const trimmed = history.slice(-20);
    await supabase
      .from('chat_sessions')
      .upsert({ session_id: sessionId, turns: trimmed }, { onConflict: 'session_id' });
  } catch (e) {
    console.warn('[Memory] saveHistory failed:', e);
  }
}

// ── Observability ────────────────────────────────────────────────────────────
function logChatEvent(entry: {
  session_id: string; query: string; response_preview?: string;
  provider_used?: string; model_used?: string; rag_method?: string; places_count?: number;
  latency_ms?: number; is_out_scope?: boolean;
}): void {
  const supabase = getSupabase();
  if (!supabase) return;
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
  const supabase = getSupabase();
  if (!supabase) return [];
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



// ── High-Speed AI Engine (Groq LPU Primary <800ms + Gemini Failover) ──────────
async function generateAIResponse(
  userQuery: string,
  ragContext: string,
  history: Turn[] = []
): Promise<{ text: string; provider: string; model: string }> {
  const historySnippet = history.length > 0
    ? '\n\nLịch sử hội thoại gần nhất:\n' +
      history.map(t => `${t.role === 'user' ? 'Bạn' : 'Tôi'}: ${t.content}`).join('\n')
    : '';
  const systemMsg = SYSTEM_PROMPT + historySnippet;
  const userMsg   = `Thông tin bối cảnh xác minh từ CSDL Tri Tôn:\n${ragContext}\n\nCâu hỏi của Bạn: ${userQuery}`;

  const aiResult = await generateProviderAIResponse(systemMsg, userMsg);
  return {
    text: aiResult.text,
    provider: resolveAuditProvider(aiResult.provider),
    model: resolveAuditModel(aiResult.model, aiResult.provider),
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const validation = validateChatQuery(body?.query);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: validation.error,
          code: validation.code,
          max_length: validation.maxLength,
          current_length: validation.currentLength,
        },
        { status: validation.status }
      );
    }

    const queryStr  = validation.sanitizedQuery;
    // session_id: frontend gửi kèm; fallback sang 'anonymous' cho widget
    const sessionId = (typeof body.session_id === 'string' && body.session_id.trim())
      ? body.session_id.trim()
      : 'anonymous';

    const supabase = getSupabase();

    // Verify session ownership before reading chat history (P04-005)
    const ownership = await verifySessionOwnership({
      sessionId,
      req,
      body,
      supabase,
    });

    if (!ownership.isOwner) {
      return NextResponse.json(
        {
          error: 'Truy cập lịch sử hội thoại bị từ chối do không có quyền sở hữu phiên.',
          code: ownership.error || 'INVALID_SESSION_OWNERSHIP',
        },
        { status: ownership.status || 403 }
      );
    }

    const t0 = startLatencyTimer(); // latency tracking (P04-013)

    // Load conversation history
    const history = await loadHistory(sessionId);

    // 1. Direct Next.js Multi-LLM RAG Engine Execution
    const lowerQuery = queryStr.toLowerCase();

    if (checkIsOutOfScope(queryStr, history)) {
      const oosProvider = resolveAuditProvider(undefined, true);
      const oosModel = resolveAuditModel(undefined, undefined, true);
      const oosMessage = 'Tôi chỉ hỗ trợ các nội dung liên quan đến Tri Tôn và dự án Du Lịch Tri Tôn. Bạn hãy đặt câu hỏi trong phạm vi này.';
      const oosLatencyMs = calculateElapsedMs(t0);
      logChatEvent({
        session_id: sessionId,
        query: queryStr,
        response_preview: oosMessage,
        provider_used: oosProvider,
        model_used: oosModel,
        is_out_scope: true,
        latency_ms: oosLatencyMs,
      });
      const oosRes = NextResponse.json({
        text_response: oosMessage,
        provider: oosProvider,
        model: oosModel,
        latency_ms: oosLatencyMs,
        ui_components: [],
        videos: [],
        suggestions: ['Hồ Tà Pạ có gì đẹp?', 'Ăn Gà Đốt Ô Thum ở đâu?', 'Chùa Khmer Bảy Núi'],
      });
      if (ownership.token) {
        oosRes.headers.set(SESSION_TOKEN_HEADER, ownership.token);
        oosRes.cookies.set(SESSION_TOKEN_COOKIE, ownership.token, {
          path: '/',
          httpOnly: true,
          sameSite: 'lax',
        });
      }
      return oosRes;
    }

    // ── STEP 1: EMBEDDING & DYNAMIC CONTEXT PREPARATION ──────────────────────
    let goldenFewShotsSnippet = '';
    const qEmbedding = await generateQueryEmbedding(queryStr);

    if (qEmbedding) {
      // Dynamic Few-shot context for style/formatting guidance (non-blocking)
      try {
        if (supabase) {
          const { data: shotHits } = await supabase.rpc('match_golden', {
            query_embedding: qEmbedding,
            thresh: 0.70,
            match_count: 2
          });

          if (shotHits && shotHits.length > 0) {
            goldenFewShotsSnippet = '\n\n[THAM KHẢO PHONG CÁCH TRẢ LỜI ĐỊNH DẠNG]:\n' +
              shotHits.map((shot: any, i: number) => `Mẫu ${i + 1}: ${typeof shot.answer_json === 'string' ? shot.answer_json : JSON.stringify(shot.answer_json)}`).join('\n\n');
          }
        }
      } catch { /* non-blocking */ }
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
    if (lowerQuery.includes('khinh khí cầu') || lowerQuery.includes('dù lượn') || lowerQuery.includes('thất sơn bay')) {
      targetPoiIds.push("PL020", "PL009", "HG001", "PL001");
    }
    if (lowerQuery.includes('đua bò') || lowerQuery.includes('sêne đônta') || lowerQuery.includes('sene donta')) {
      targetPoiIds.push("PL020", "HG005", "HG002");
    }
    if (lowerQuery.includes('chôl chnăm thmây') || lowerQuery.includes('chol chnam thmay') || lowerQuery.includes('tết khmer')) {
      targetPoiIds.push("HG002", "HG001", "HG005");
    }
    if (lowerQuery.includes('ok om bok') || lowerQuery.includes('cúng trăng') || lowerQuery.includes('đèn gió') || lowerQuery.includes('kathina') || lowerQuery.includes('dâng y')) {
      targetPoiIds.push("HG002", "PL001", "PL004");
    }

    if (targetPoiIds.length > 0 && supabase) {
      const { data: clusteredPlaces } = await supabase
        .from('places')
        .select('id, slug, name, commune, category, rating, image_url, description, golden_time_windows, price_level, opening_hours, is_verified, verification_status, verified_at, source_url')
        .in('id', targetPoiIds)
        .eq('is_verified', true)
        .eq('verification_status', 'VERIFIED');
      if (clusteredPlaces) {
        filterVerifiedRetrievalPlaces(clusteredPlaces).forEach(p => placesMap.set(p.id, p));
      }
    }

    // 1. Precision POI matching via single bounded token search (P04-007, P04-010)
    if (supabase) {
      const tokenMatches = await executeBoundedTokenSearch(supabase, lowerQuery, { maxTerms: 6, limit: 8 });
      filterVerifiedRetrievalPlaces(tokenMatches).forEach((p: any) => {
        if (!placesMap.has(p.id)) placesMap.set(p.id, p);
      });
    }

    let kbSnippet = '';
    // Hybrid Vector Search (pgvector RPC match_places & match_kb)
    // P04-006: Reuse the single embedding generated at STEP 1
    const queryVector = qEmbedding;
    if (queryVector && supabase) {
      const { data: vectorMatches } = await supabase.rpc('match_places', {
        query_embedding: queryVector,
        match_threshold: 0.35,
        match_count: 5,
      });
      if (vectorMatches) {
        filterVerifiedRetrievalPlaces(vectorMatches).forEach((p: any) => {
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
    if (isNearbyQuery && supabase) {
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
        filterVerifiedRetrievalPlaces(nearbyPlaces).forEach((p: any) => {
          if (!placesMap.has(p.id)) placesMap.set(p.id, p);
        });
      }
    }

    let places = filterVerifiedRetrievalPlaces(Array.from(placesMap.values())).slice(0, 6);

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
        const vMeta = resolveVerificationMetadata(p);
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
          is_verified: vMeta.is_verified,
          verification_status: vMeta.verification_status,
          verified_at: vMeta.verified_at,
          distance_km: p.distance_km ? Number(p.distance_km.toFixed(1)) : undefined,
        });
      });
    } else {
      // Fetch top 3 hot places as fallback context (P04-010: strictly VERIFIED only)
      if (supabase) {
        const { data: hotPlaces } = await supabase
          .from('places')
          .select('id, slug, name, commune, category, rating, image_url, golden_time_windows, price_level, opening_hours, description, source_url, is_verified, verification_status, verified_at')
          .eq('is_hot', true)
          .eq('is_verified', true)
          .eq('verification_status', 'VERIFIED')
          .limit(3);

        const verifiedHotPlaces = filterVerifiedRetrievalPlaces(hotPlaces || []);
        if (verifiedHotPlaces.length > 0) {
          ragContext = verifiedHotPlaces
            .map((p) => `- [ID: ${p.id}] ${p.name} (Thuộc Xã/Thị trấn ${p.commune}): Thể loại ${p.category}. Nguồn xác minh: ${p.source_url || 'https://maps.google.com'}. Mô tả: ${p.description || ''}`)
            .join('\n');
          verifiedHotPlaces.forEach((p) => {
            const evidence = generateEvidenceLinks(p.name, p.commune);
            const vMeta = resolveVerificationMetadata(p);
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
              is_verified: vMeta.is_verified,
              verification_status: vMeta.verification_status,
              verified_at: vMeta.verified_at,
            });
          });
        }
      }
    }

    // Detect if query is about transportation, directions, scenic pathways, or bus lines
    let transportSnippet = '';
    if (/đi|xe|đường|tuyến|phương trang|huệ nghĩa|xe khách|thuê xe|leo núi|vồ hội|cô tô|tà pạ|ô thum|ô tà sóc|tà lọt|tơ lụa|chữ y|nút giao|chỉ đường|di chuyển/i.test(queryStr)) {
      transportSnippet = `\n\nCSDL HƯỚNG DẪN GIAO THÔNG, XE CỘ & CÁC CUNG ĐƯỜNG DANH THẮNG TRI TÔN ĐÃ XÁC MINH:\n${JSON.stringify(transportData, null, 2)}`;
    }

    // Detect if query is about festivals, aerial sports, hot air balloons, or traditional events
    let festivalsSnippet = '';
    if (/khinh khí cầu|dù lượn|lễ hội|hội|đua bò|chôl chnăm|sêne đônta|sene donta|ok om bok|cúng trăng|kathina|dâng y|tết khmer|hoa đăng/i.test(queryStr)) {
      festivalsSnippet = `\n\nCSDL 6 ĐẠI LỄ HỘI & SỰ KIỆN VĂN HÓA THỂ THAO TRI TÔN ĐÃ XÁC MINH 100%:\n${JSON.stringify(festivalsData, null, 2)}`;
    }

    // Generate AI response with Multi-LLM provider fallback + conversation history + dynamic few-shots + knowledge base
    const combinedRagContext = [ragContext, kbSnippet, transportSnippet, festivalsSnippet, goldenFewShotsSnippet].filter(Boolean).join('\n\n');
    const aiResult = await generateAIResponse(queryStr, combinedRagContext, history);
    let aiTextResponse = aiResult.text;
    let actualProvider = aiResult.provider;
    let actualModel = aiResult.model;

    // P04-018: Defense-in-depth output schema validation (chặn malformed và fallback)
    const outValidation = validateChatbotOutput(aiTextResponse);
    if (!outValidation.isValid) {
      console.warn(
        `[ChatQuery] Malformed response detected (${outValidation.code}: ${outValidation.reason}). Fallback to Local Expert RAG.`
      );
      aiTextResponse = generateSmartLocalDomainResponse(queryStr);
      actualProvider = 'local_expert_rag';
      actualModel = 'local-expert-rag-v1';
    } else if (outValidation.sanitizedText) {
      aiTextResponse = outValidation.sanitizedText;
    }

    // Persist this turn to chat_sessions (fire-and-forget, non-blocking)
    if (outValidation.isValid || aiTextResponse.trim().length > 0) {
      saveHistory(sessionId, [
        ...history,
        { role: 'user',      content: queryStr },
        { role: 'assistant', content: aiTextResponse.slice(0, 1200) }, // cap to avoid DB bloat
      ]).catch(e => console.warn('[Memory] saveHistory failed:', e));
    }

    // Fetch context-aware videos (POI matched or Topic matched)
    const videos = await fetchContextAwareVideos(queryStr, places);

    // 100% Dynamic Context-aware suggestions based on query, AI answer and matched places
    const suggestions = generateSmartSuggestions({
      query: queryStr,
      assistantAnswer: aiTextResponse,
      matchedPlaces: formattedPlaces,
    });

    const actualLatencyMs = calculateElapsedMs(t0);

    // Audit log before returning
    logChatEvent({
      session_id: sessionId,
      query: queryStr,
      response_preview: aiTextResponse.slice(0, 300),
      provider_used: actualProvider,
      model_used: actualModel,
      rag_method: places && places.length > 0 ? 'vector-or-ilike' : 'hot_fallback',
      places_count: formattedPlaces.length,
      latency_ms: actualLatencyMs,
      is_out_scope: false,
    });

    const mainPayload: StructuredChatResponse = {
      text_response: aiTextResponse,
      provider: actualProvider,
      model: actualModel,
      latency_ms: actualLatencyMs,
      ui_components: formattedPlaces.length > 0 ? [{ type: 'place_grid', data: formattedPlaces }] : [],
      places: formattedPlaces,
      videos: videos || [],
      suggestions,
    };

    const mainRes = NextResponse.json(mainPayload);

    if (ownership.token) {
      mainRes.headers.set(SESSION_TOKEN_HEADER, ownership.token);
      mainRes.cookies.set(SESSION_TOKEN_COOKIE, ownership.token, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
      });
    }

    return mainRes;
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
