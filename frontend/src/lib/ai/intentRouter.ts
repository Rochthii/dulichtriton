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
const REALTIME_SEARCH_PATTERNS = [
  /hôm nay/i, /ngày mai/i, /tuần này/i, /thời tiết/i, /nhiệt độ/i, /dự báo/i,
  /mới nhất/i, /sắp tới/i, /tin tức/i, /vừa xảy ra/i, /đang diễn ra/i,
  /nước nổi năm nay/i, /mùa gặt năm nay/i, /khinh khí cầu năm nay/i,
  /tình hình giao thông/i, /kẹt xe không/i, /giá vé mới/i
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

  // ── LUỒNG 4: THỜI GIAN THỰC & GOOGLE SEARCH (20%) ─────────────────────────
  for (const pattern of REALTIME_SEARCH_PATTERNS) {
    if (pattern.test(lower)) {
      return {
        intent: 'REALTIME_GROUNDED_SEARCH',
        confidence: 0.95,
        reason: `Requires real-time Internet search: ${pattern}`,
      };
    }
  }

  // ── LUỒNG 3: TRA CỨU TĨNH 149 POIS, ẨM THỰC, LỊCH TRÌNH (80%) ──────────────
  return {
    intent: 'LOCAL_POI_FAST',
    confidence: 0.9,
    reason: 'Standard POI, Food, Culture, Itinerary lookup. Route to high-speed LPU.',
  };
}

/**
 * MỎ NEO CHÂN LÝ (TRUTH ANCHOR):
 * Kiểm duyệt và thanh lọc phản hồi từ LLM/Google Search trước khi trả về cho người dùng
 */
export function applyTruthAnchor(generatedText: string): string {
  let text = generatedText;

  // 1. Sửa lỗi dùng từ "Gà nướng Ô Thum" -> "Gà đốt Ô Thum"
  text = text.replace(/gà nướng ô thum/gi, 'Gà đốt Ô Thum');
  text = text.replace(/gà nướng lá chúc/gi, 'Gà đốt lá chúc');

  // 2. Sửa lỗi nhầm bún cá mắm
  if (/bún cá/i.test(text) && /mắm cá linh|bún nước lèo/i.test(text)) {
    text = text.replace(/mắm cá linh/gi, 'nghệ tươi và củ ngải bún');
    text = text.replace(/bún nước lèo/gi, 'bún cá củ ngải Khmer');
  }

  // 3. Loại bỏ các tên quán ảo không có thật
  text = text.replace(/quán sáu búp|quán rô thum|quán tuấn tới/gi, 'quán gà đốt Ô Thum bản địa');

  return text;
}
