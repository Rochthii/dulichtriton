/**
 * ─────────────────────────────────────────────────────────────────────────────
 * INTENT ROUTER & TRUTH ANCHOR GUARD (Single Responsibility)
 * Du Lịch Tri Tôn AI Assistant System
 * 
 * Phân luồng câu hỏi theo 4 Luồng Tối Ưu (Quad-Path Hybrid Architecture):
 * 1. SOS_EMERGENCY: Cứu hộ khẩn cấp (< 30ms)
 * 2. CACHED_HOT: Câu hỏi phổ biến trong RAM (< 50ms)
 * 3. LOCAL_POI_FAST: 80% tra cứu 149 POIs & văn hóa qua Groq LPU (< 250ms)
 * 4. REALTIME_GROUNDED_SEARCH: 20% tin tức/thời tiết qua Gemini Google Search
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type QueryIntent = 'SOS_EMERGENCY' | 'CACHED_HOT' | 'LOCAL_POI_FAST' | 'REALTIME_GROUNDED_SEARCH';

export interface IntentAnalysisResult {
  intent: QueryIntent;
  confidence: number;
  reason: string;
  emergencyPayload?: string;
}

// 1. Từ khóa khẩn cấp cứu hộ SOS
const EMERGENCY_PATTERNS = [
  /cứu hộ/i, /khẩn cấp/i, /công an/i, /bệnh viện/i, /cấp cứu/i,
  /té xe/i, /ngã xe/i, /tai nạn/i, /hỏng xe/i, /thủng lốp/i, /hết xăng/i,
  /lạc đường/i, /sạt lở/i, /cháy/i, /rắn cắn/i, /đuối nước/i, /sos/i,
];

// 2. Từ khóa cần thông tin thời gian thực Internet (Google Search)
// CHỈ kích hoạt khi THỰC SỰ cần live Internet data mà LocalRAG + WeatherCache không đáp ứng được.
// Các từ như "hôm nay", "bây giờ", "có mở không" → Groq + WeatherCache đủ xử lý, không cần Search.
const REALTIME_SEARCH_PATTERNS = [
  // 1. Xác nhận lịch sự kiện/lễ hội cụ thể của năm hiện tại
  /lễ hội.*năm nay.*có.*không|có tổ chức.*năm nay|năm nay có.*lễ hội/i,
  /khinh khí cầu.*năm nay|lịch bay.*khinh khí cầu|đua bò.*lịch.*năm nay/i,
  // 2. Giá vé / chi phí mới nhất (có thể thay đổi thường xuyên)
  /giá vé.*mới nhất|giá.*hiện tại.*vé|phí tham quan.*mới/i,
  // 3. Tin tức khẩn cấp / sự cố vừa xảy ra
  /tin tức.*mới|vừa xảy ra|đang xảy ra.*tai nạn|sự cố.*giao thông/i,
  // 4. Cảnh báo thời tiết/địa hình khẩn cấp
  /đường.*ngập.*chưa|sạt lở.*vừa|lũ.*hiện tại|nguy hiểm.*đường/i,
];


/**
 * Phân tích ý định câu hỏi chỉ trong < 1ms bằng High-Speed RegEx Matrix
 */
export function routeQueryIntent(userQuery: string): IntentAnalysisResult {
  const clean = (userQuery || '').trim();
  const lower = clean.toLowerCase();

  // ── LUỒNG 1: SOS KHẨN CẤP (< 30ms) ─────────────────────────────────────────
  for (const pattern of EMERGENCY_PATTERNS) {
    if (pattern.test(lower)) {
      return {
        intent: 'SOS_EMERGENCY',
        confidence: 1.0,
        reason: `Matched emergency pattern: ${pattern}`,
        emergencyPayload: `### 🚨 ĐƯỜNG DÂY NÓNG CỨU HỘ & KHẨN CẤP TRI TÔN (24/7)

Du Lịch Tri Tôn AI đã kích hoạt chế độ hỗ trợ khẩn cấp. Hãy bình tĩnh và liên hệ ngay các đầu số trực ban sau:

### 📞 Các Đầu Số Hỗ Trợ 24/7:
- **Công an Huyện Tri Tôn**: [0296.3874.113](tel:02963874113)  *(Trực ban hình sự, an ninh, tai nạn giao thông)*
- **Cấp Cứu Y Tế / TTYT Huyện Tri Tôn**: [0296.3874.115](tel:02963874115) hoặc [115](tel:115)  *(Cấp cứu 24/24)*
- **Cứu Hỏa & Cứu Nạn**: [114](tel:114)
- **Đội Cứu Hộ Phượt Xe Máy & Vá Vỏ Lưu Động**: [0296.3771.999](tel:02963771999)

📍 **Trụ sở Trung tâm Y tế**: Đường Trần Hưng Đạo, TT. Tri Tôn, Huyện Tri Tôn, An Giang.  
[📍 Mở vị trí TTYT Tri Tôn trên Google Maps](https://www.google.com/maps/search/?api=1&query=Trung+tâm+Y+tế+Huyện+Tri+Tôn+An+Giang)

💡 *Nếu đang ở vùng núi đèo mất sóng thoại, hãy cố gắng di chuyển lên gờ cao hoặc tìm nhà dân/chùa Khmer gần nhất để nhờ trợ giúp.*`
      };
    }
  }

  // ── LUỒNG 4: THỜI GIAN THỰC & GOOGLE SEARCH (<5%) ───────────────────────
  // Chỉ kích hoạt cho xác nhận sự kiện năm nay, giá vé mới nhất, tin tức/sự cố khẩn.
  for (const pattern of REALTIME_SEARCH_PATTERNS) {
    if (pattern.test(lower)) {
      return {
        intent: 'REALTIME_GROUNDED_SEARCH',
        confidence: 0.95,
        reason: `Requires real-time Internet search: ${pattern}`,
      };
    }
  }

  // ── LUỒNG 3: TRA CỨU TĨNH 149 POIS, ẨM THỰC, LỊCH TRÌNH (>95%) ─────────
  // Mọi câu hỏi còn lại (kể cả "hôm nay", "bây giờ", "có mở không"...) → Groq LPU + WeatherCache
  return {
    intent: 'LOCAL_POI_FAST',
    confidence: 0.9,
    reason: 'Standard POI, Food, Culture, Itinerary lookup. Route to high-speed LPU.',
  };
}

/**
 * MỎ NEO CHÂN LÝ (TRUTH ANCHOR) — VIỆC 3: Mở rộng RegEx ngữ nghĩa biến thể
 * Kiểm duyệt và thanh lọc phản hồi từ LLM/Google Search trước khi trả về cho người dùng
 */
export function applyTruthAnchor(generatedText: string): string {
  let text = generatedText;

  // 1. Sửa "gà nướng" → "gà đốt" trong mọi bối cảnh Ô Thum / lá chúc
  //    RegEx ngữ nghĩa: bắt bất kỳ biến thể nào của "gà + nướng" khi có yếu tố Ô Thum / Hồ Ô Thum / lá chúc
  text = text.replace(
    /gà\s+(\w+\s+){0,3}nướng(\s+\w+){0,4}(ô\s*thum|o\s*thum|lá\s*chúc|thát\s*sơn)/gi,
    (match) => match.replace(/nướng/gi, 'đốt')
  );
  // Bắt chiều ngược: "nướng ... ô thum"
  text = text.replace(
    /(nướng)(\s+\w+){0,4}(ô\s*thum|hồ\s*ô\s*thum)/gi,
    (match) => match.replace(/nướng/gi, 'đốt')
  );
  // Trường hợp trực tiếp
  text = text.replace(/gà nướng ô thum/gi, 'Gà đốt Ô Thum');
  text = text.replace(/gà nướng lá chúc/gi, 'Gà đốt lá chúc');
  text = text.replace(/gà nướng than hồng/gi, 'Gà đốt than hồng');
  text = text.replace(/gà nướng thủ công/gi, 'Gà đốt thủ công');
  text = text.replace(/gà nướng truyền thống/gi, 'Gà đốt truyền thống');

  // 2. Sửa lỗi bún cá Tri Tôn bị mô tả sai (nấu mắm / bún nước lèo)
  if (/bún cá/i.test(text)) {
    text = text.replace(/mắm cá linh/gi, 'nghệ tươi và củ ngải bún');
    text = text.replace(/bún nước lèo/gi, 'bún cá củ ngải Khmer');
    text = text.replace(/nước dùng mắm/gi, 'nước dùng xương ống thanh ngọt');
    text = text.replace(/nấu bằng mắm/gi, 'nấu bằng nghệ tươi và củ ngải bún giã nhuyễn');
  }

  // 3. Sửa lỗi chính tả bản địa: "trái trúc", "lá trúc" -> "trái chúc", "lá chúc"
  text = text.replace(/trái trúc/gi, 'trái chúc');
  text = text.replace(/lá trúc/gi, 'lá chúc');
  text = text.replace(/cây trúc bảy núi/gi, 'cây chúc Bảy Núi');

  // 4. Loại bỏ các tên quán ảo không có thật
  text = text.replace(
    /quán sáu búp|quán rô thum|quán tuấn tới|quán mười hai|quán tám lúa/gi,
    'quán gà đốt Ô Thum bản địa'
  );

  // 5. Sửa nhầm địa giới hành chính xã
  //    Quán gà đốt ven hồ thuộc XÃ Ô LÂM, không phải TT. Tri Tôn
  text = text.replace(
    /(gà đốt|gà nướng|ô thum)[^.]{0,50}(thị trấn tri tôn|tt\. tri tôn)/gi,
    (match) => match.replace(/thị trấn tri tôn|tt\. tri tôn/gi, 'Xã Ô Lâm, Tri Tôn')
  );

  // 6. Deterministic Evidence Link Injection (Nếu chưa có link trong text)
  if (!text.includes('google.com/maps') && !text.includes('Tôi chỉ hỗ trợ các nội dung liên quan')) {
    const knownSpots = [
      { name: 'Hồ Tà Pạ', query: 'Hồ+Tà+Pạ+Xã+Núi+Tô+Tri+Tôn+An+Giang', tag: 'hotapa' },
      { name: 'Gà Đốt Ô Thum', query: 'Gà+Đốt+Ô+Thum+Xã+Ô+Lâm+Tri+Tôn+An+Giang', tag: 'gadotothum' },
      { name: 'Đồi Tức Dụp', query: 'Khu+du+lịch+Đồi+Tức+Dụp+Xã+An+Tức+Tri+Tôn+An+Giang', tag: 'doitucdup' },
      { name: 'Chùa Xvayton', query: 'Chùa+Xvayton+Thị+trấn+Tri+Tôn+An+Giang', tag: 'chuaxvayton' },
      { name: 'Chùa Xà Tón', query: 'Chùa+Xvayton+Thị+trấn+Tri+Tôn+An+Giang', tag: 'chuaxvayton' },
      { name: 'Cổng Trời Koh Kas', query: 'Cổng+Trời+Koh+Kas+Xã+Châu+Lăng+Tri+Tôn+An+Giang', tag: 'congtroikohkas' },
      { name: 'Cổng Trời Tri Tôn', query: 'Cổng+Trời+Koh+Kas+Xã+Châu+Lăng+Tri+Tôn+An+Giang', tag: 'congtroikohkas' },
      { name: 'Núi Cô Tô', query: 'Núi+Cô+Tô+Xã+Cô+Tô+Tri+Tôn+An+Giang', tag: 'nuicoto' },
      { name: 'Hồ Soài Chek', query: 'Hồ+Soài+Chek+Xã+Núi+Tô+Tri+Tôn+An+Giang', tag: 'hosoaichek' },
      { name: 'Con Đường Tơ Lụa', query: 'Con+Đường+Tơ+Lụa+Xã+Núi+Tô+Tri+Tôn+An+Giang', tag: 'conduongtoluatriton' },
      { name: 'Đu Đủ Đâm Rina', query: 'Đu+Đủ+Đâm+Rina+Xã+Châu+Lăng+Tri+Tôn+An+Giang', tag: 'dududamrina' },
    ];

    const matchedSpot = knownSpots.find((s) => text.toLowerCase().includes(s.name.toLowerCase()));
    if (matchedSpot) {
      text += `\n\n[📍 Chỉ đường Google Maps](https://www.google.com/maps/search/?api=1&query=${matchedSpot.query})  •  [▶ Xem TikTok Video](https://www.tiktok.com/tag/${matchedSpot.tag})`;
    }
  }

  return text;
}
