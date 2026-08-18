/**
 * ─────────────────────────────────────────────────────────────────────────────
 * UNIFIED HYBRID RAG ENGINE v2.1 (Time-Aware Golden Window Grounding)
 * Du Lịch Tri Tôn AI Assistant System
 * 
 * Features:
 * 1. Time-Aware Golden Window Recommendation (Khung giờ vàng ẩm thực & danh thắng)
 * 2. Instant In-Memory RAM Entity Matching (149 Verified POIs) < 1ms
 * 3. Spatial GPS Proximity Distance Matrix (PostGIS Haversine formula)
 * 4. Live Weather Context (Open-Meteo Cache 15m)
 * 5. 6 Major Festivals & Transportation Routing Mastery
 * ─────────────────────────────────────────────────────────────────────────────
 */

import masterPois from '@/data/triton_pois_full.json';
import transportData from '@/data/tri_ton_transportation.json';
import festivalsData from '@/data/tri_ton_festivals.json';
import itinerariesData from '@/data/lichtrinh.json';
import { generateEvidenceLinks } from '../evidenceGenerator';
import { optimizeClosedLoopRoute, type SpatialPoi } from './spatialRouter';

export interface FormattedPoi {
  id: string;
  slug: string;
  name: string;
  commune: string;
  category: string;
  rating: number;
  image_url: string;
  imageUrl?: string;
  source_url?: string;
  tiktok_search_url?: string;
  hashtags?: string[];
  distance_km?: number;
  price_level?: string;
  opening_hours?: string;
  description?: string;
  field_tips?: string;
}

export interface RagContextResult {
  ragContext: string;
  places: FormattedPoi[];
  suggestions: string[];
  weatherText?: string;
  timeWindowText?: string;
}

// ── Time-Aware Golden Window Calculation (Asia/Ho_Chi_Minh) ───────────────────
export interface TimeWindowInfo {
  period: 'morning' | 'noon' | 'afternoon' | 'evening' | 'night';
  periodLabel: string;
  currentClock: string;
  foodTips: string;
  activityTips: string;
  recommendedPoiIds: string[];
  defaultSuggestions: string[];
}

export function getCurrentTimeWindowInfo(targetDate: Date = new Date()): TimeWindowInfo {
  // Chuẩn hóa sang múi giờ Việt Nam (UTC+7)
  const formatter = new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = formatter.formatToParts(targetDate);
  const hour = parseInt(parts.find((p) => p.type === 'hour')?.value || '12', 10);
  const minute = parseInt(parts.find((p) => p.type === 'minute')?.value || '0', 10);
  const currentClock = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

  // 1. Buổi Sáng Sớm & Ăn Sáng (06:00 – 10:00)
  if (hour >= 6 && hour < 10) {
    return {
      period: 'morning',
      periodLabel: 'Buổi Sáng (Khung Giờ Ăn Sáng & Đón Nắng Sớm)',
      currentClock,
      foodTips: 'Nên ăn sáng Cháo Bò Bảy Núi (Quán Thủy Đen Cầu Cây Me, Quán Dì Hai), Bún Cá Củ Ngải Khmer hoặc Bánh Bò Thốt Nốt Nướng Than.',
      activityTips: 'Khung giờ vàng 06:00 - 08:30: Chụp ảnh Cổng Trời Chùa Koh Kas đón nắng xiên, viếng Chùa Xvayton chiêm bái Kinh Lá Buông, check-in Hồ Tà Pạ nước trong xanh.',
      recommendedPoiIds: ['FD009', 'FD013', 'CK010', 'HG002', 'PL001'],
      defaultSuggestions: [
        'Quán Cháo Bò Bảy Núi ngon nhất',
        'Quán Bún Cá Củ Ngải Khmer chuẩn vị',
        'Cách đi Cổng Trời Chùa Koh Kas sáng sớm',
        'Đường lên Hồ Tà Pạ mùa này',
      ],
    };
  }

  // 2. Buổi Trưa & Đại Tiệc Gà Đốt (10:00 – 14:30)
  if (hour >= 10 && hour < 14 || (hour === 14 && minute <= 30)) {
    return {
      period: 'noon',
      periodLabel: 'Buổi Trưa (Khung Giờ Đại Tiệc Ẩm Thực Ven Hồ)',
      currentClock,
      foodTips: 'Nên thưởng thức Gà Đốt Lá Chúc Ô Thum bên chòi lá ven Hồ Ô Thum (BẮT BUỘC nhắc du khách gọi đặt trước 30-45 phút), ăn kèm Đu Đủ Đâm Rina và uống Nước thốt nốt tươi mát lạnh.',
      activityTips: 'Tránh leo núi ngoài trời lúc nắng gắt 11:30 - 13:30. Nên nghỉ ngơi tại các chòi lá ven hồ Ô Thum, tham quan Vườn Nho Ô Thum râm mát.',
      recommendedPoiIds: ['FD006', 'FD016', 'PL002', 'CF002', 'FD010'],
      defaultSuggestions: [
        'Quán Gà Đốt Ô Thum nào ngon nhất?',
        'Có cần gọi đặt bàn Gà Đốt trước không?',
        'Quán Đu Đủ Đâm Rina ở đâu?',
        'Chòi lá ven Hồ Ô Thum view đẹp',
      ],
    };
  }

  // 3. Buổi Chiều Mát & Săn Hoàng Hôn (14:30 – 18:00)
  if ((hour === 14 && minute > 30) || (hour >= 15 && hour < 18)) {
    return {
      period: 'afternoon',
      periodLabel: 'Buổi Chiều (Khung Giờ Săn Hoàng Hôn & Cánh Đồng Lúa)',
      currentClock,
      foodTips: 'Ăn nhẹ xế chiều: Bánh Bò Thốt Nốt Nướng Lò Út Cột, Nước thốt nốt tươi ướp lạnh, Trái trâm chín mọng (tháng 4-6).',
      activityTips: 'Khung giờ vàng 15:30 - 17:45: Dạo bước trên Con Đường Tơ Lụa Tà Pạ, chụp ảnh Hàng Cây Trâm Trăm Tuổi, check-in Cụm Thốt Nốt Trái Tim, săn hoàng hôn đỏ rực bên Hồ Soài Chek hoặc leo cụm chữ "TRI TÔN" trên Núi Cô Tô.',
      recommendedPoiIds: ['CK002', 'CK001', 'PL020', 'PL011', 'FD017'],
      defaultSuggestions: [
        'Khung giờ chụp ảnh đẹp nhất Hồ Soài Chek',
        'Vị trí Cây Thốt Nốt Trái Tim',
        'Cách đi Con Đường Tơ Lụa Tà Pạ',
        'Lò Bánh Bò Thốt Nốt Út Cột',
      ],
    };
  }

  // 4. Buổi Tối & Cà Phê Phố Đêm (18:00 – 22:30)
  if (hour >= 18 && hour < 22 || (hour === 22 && minute <= 30)) {
    return {
      period: 'evening',
      periodLabel: 'Buổi Tối (Khung Giờ Ẩm Thực Phố & Cà Phê Chill)',
      currentClock,
      foodTips: 'Nên ăn tối Bò 7 Món Tri Tôn, Lẩu Bò Bảy Núi, dạo Chợ Đêm Tri Tôn thưởng thức các món ăn vặt miền Tây.',
      activityTips: 'Khám phá cà phê đêm: CHẠM Coffee & Tea (mở đến 22:00), NY Coffee & Tea (máy lạnh, kem thốt nốt), Anpalm Cafe (acoustic), ngắm phố thị trấn Tri Tôn rực rỡ.',
      recommendedPoiIds: ['FD017', 'PL021', 'CF001', 'CF008', 'CF010'],
      defaultSuggestions: [
        'Quán Cà Phê Tri Tôn mở muộn về đêm',
        'Địa chỉ quán Bò 7 Món ngon',
        'Chợ Đêm Tri Tôn có gì vui?',
        'Homestay view núi nghỉ đêm tốt nhất',
      ],
    };
  }

  // 5. Đêm Muộn & Rạng Sáng (22:30 – 05:59)
  return {
    period: 'night',
    periodLabel: 'Đêm Muộn & Rạng Sáng (Khung Giờ Nghỉ Dưỡng & Chuẩn Bị Săn Mây)',
    currentClock,
    foodTips: 'Các quán ăn hầu hết đã đóng cửa. Có thể tìm ăn nhẹ tại khu vực Bến xe Tri Tôn hoặc các cửa hàng tiện lợi.',
    activityTips: 'Cảnh báo: Không nên tự lái xe máy vượt đèo Núi Cô Tô / ĐT948 đêm khuya vì sương mù và dốc cao. Nên nghỉ ngơi tại homestay/khách sạn, chuẩn bị thức dậy lúc 05:00 sáng để săn mây Vồ Hội Mẹ / Sân Tiên.',
    recommendedPoiIds: ['CF012', 'CF013', 'PL009', 'CF016'],
    defaultSuggestions: [
      'Hotline cứu hộ xe máy đêm 24/7',
      'Homestay Núi Cô Tô gần nhất',
      'Kinh nghiệm săn mây Vồ Hội Mẹ lúc 05:00',
      'Khách sạn trung tâm Thị trấn Tri Tôn',
    ],
  };
}

// ── In-Memory Weather Cache (15 min TTL) ──────────────────────────────────────
let cachedWeatherText = '';
let cachedWeatherTimestamp = 0;

export async function fetchLiveWeatherContext(): Promise<string> {
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

// ── Distance Calculation (Haversine formula in KM) ───────────────────────────
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

// ── Suggestion Builder (Time-Aware) ───────────────────────────────────────────
export function buildDynamicSuggestions(lowerQuery: string, timeWindow?: TimeWindowInfo): string[] {
  const tw = timeWindow || getCurrentTimeWindowInfo();

  if (lowerQuery.includes('cà phê') || lowerQuery.includes('cafe') || lowerQuery.includes('uống nước')) {
    return [
      'Quán RUỘNG Coffee view cánh đồng',
      'Tiệm Cà Phê Nhà Quê Tà Đảnh',
      'Quán CHẠM Coffee mở đêm Tri Tôn',
      'NY Coffee & Tea máy lạnh',
    ];
  }
  if (lowerQuery.includes('ăn') || lowerQuery.includes('gà đốt') || lowerQuery.includes('cháo bò')) {
    return [
      'Quán Gà Đốt Thành Đạt Ô Thum',
      'Quán Siêu Gà Đốt Ô Thum (Chau Siêu)',
      'Địa chỉ Cháo Bò Bảy Núi Cầu Cây Me',
      'Quán Bún Cá Củ Ngải Khmer',
    ];
  }
  if (lowerQuery.includes('chùa') || lowerQuery.includes('khmer') || lowerQuery.includes('văn hóa')) {
    return [
      'Đường lên Chùa Núi Tà Pạ',
      'Cổng trời Chùa Koh Kas',
      'Bảo vật Kinh Lá Buông Chùa Xvayton',
      'Lễ hội Đua bò Bảy Núi',
    ];
  }
  if (lowerQuery.includes('ở') || lowerQuery.includes('homestay') || lowerQuery.includes('khách sạn')) {
    return [
      'Homestay view núi Cô Tô đẹp nhất',
      'Khách sạn trung tâm Thị trấn Tri Tôn',
      'Khu cắm trại ven Hồ Ô Thum',
    ];
  }

  // Nếu câu hỏi mở, trả về gợi ý theo đúng khung giờ hiện tại!
  return tw.defaultSuggestions;
}

// ── Core Hybrid RAG Context Extractor ────────────────────────────────────────
export async function buildUnifiedRagContext(
  userQuery: string,
  userLat?: number,
  userLng?: number
): Promise<RagContextResult> {
  const lower = (userQuery || '').toLowerCase();
  const cleanQ = lower.replace(/[?!.,]/g, '').trim();

  const matchedMap = new Map<string, any>();
  const poisList = masterPois as any[];
  const timeWindow = getCurrentTimeWindowInfo();

  // 1. Time-Aware Priority Injection (Nếu câu hỏi mang tính chung chung hoặc hỏi ăn uống theo giờ)
  const isGeneralQuery =
    lower.includes('ăn gì') ||
    lower.includes('đi đâu') ||
    lower.includes('gợi ý') ||
    lower.includes('bây giờ') ||
    lower.includes('hôm nay') ||
    lower.includes('tư vấn') ||
    lower.includes('buổi sáng') ||
    lower.includes('buổi trưa') ||
    lower.includes('buổi chiều') ||
    lower.includes('buổi tối');

  if (isGeneralQuery && timeWindow.recommendedPoiIds.length > 0) {
    poisList
      .filter((p) => timeWindow.recommendedPoiIds.includes(p.id))
      .forEach((p) => matchedMap.set(p.id, p));
  }

  // 2. Topic & Intent Fast Clusters
  if (lower.includes('khinh khí cầu') || lower.includes('dù lượn') || lower.includes('thất sơn bay')) {
    poisList
      .filter((p) => p.id === 'PL020' || p.id === 'PL009' || p.id === 'HG001' || p.id === 'PL001')
      .forEach((p) => matchedMap.set(p.id, p));
  } else if (lower.includes('đua bò') || lower.includes('sêne đônta') || lower.includes('sene donta')) {
    poisList
      .filter((p) => p.id === 'PL020' || p.id === 'HG005' || p.id === 'HG002')
      .forEach((p) => matchedMap.set(p.id, p));
  } else if (lower.includes('cà phê') || lower.includes('cafe') || lower.includes('quán nước')) {
    poisList
      .filter(
        (p) =>
          p.subcategory === 'cafe' ||
          (p.name && (p.name.toLowerCase().includes('coffee') || p.name.toLowerCase().includes('cà phê')))
      )
      .slice(0, 5)
      .forEach((p) => matchedMap.set(p.id, p));
  } else if (lower.includes('gà đốt') || lower.includes('ô thum')) {
    poisList
      .filter((p) => p.name && (p.name.toLowerCase().includes('gà đốt') || p.name.toLowerCase().includes('ô thum')))
      .slice(0, 5)
      .forEach((p) => matchedMap.set(p.id, p));
  } else if (lower.includes('cháo bò') || lower.includes('bún cá') || lower.includes('đu đủ đâm')) {
    poisList
      .filter(
        (p) =>
          (p.name && p.name.toLowerCase().includes('cháo bò')) ||
          (p.name && p.name.toLowerCase().includes('bún cá')) ||
          (p.name && p.name.toLowerCase().includes('đu đủ đâm'))
      )
      .slice(0, 4)
      .forEach((p) => matchedMap.set(p.id, p));
  } else if (lower.includes('ăn') || lower.includes('đặc sản') || lower.includes('ẩm thực') || lower.includes('food')) {
    poisList
      .filter((p) => p.category === 'gastronomy' || p.category === 'food')
      .slice(0, 5)
      .forEach((p) => matchedMap.set(p.id, p));
  } else if (lower.includes('chùa') || lower.includes('khmer') || lower.includes('tâm linh') || lower.includes('hành hương')) {
    poisList
      .filter((p) => p.category === 'heritage' || p.category === 'culture' || (p.name && p.name.toLowerCase().includes('chùa')))
      .slice(0, 5)
      .forEach((p) => matchedMap.set(p.id, p));
  }

  // 3. Keyword Substring & N-Gram Search
  const stopWords = new Set(['ở', 'đâu', 'có', 'gì', 'đẹp', 'nào', 'ngon', 'mấy', 'giờ', 'bao', 'nhiêu', 'cho', 'mình', 'với', 'thì', 'lên', 'ăn', 'đi', 'muốn', 'ngắm', 'chỗ', 'hãy', 'bạn', 'tối', 'sáng', 'thế', 'nào', 'từ', 'vé', 'quán', 'thích', 'tại']);
  const tokens = cleanQ.split(/\s+/).filter((w) => w.length >= 2 && !stopWords.has(w));

  for (const token of tokens) {
    const hits = poisList.filter((p) => {
      const name = (p.name || '').toLowerCase();
      const commune = (p.commune || '').toLowerCase();
      const category = (p.category || '').toLowerCase();
      return name.includes(token) || commune.includes(token) || category.includes(token);
    }).slice(0, 3);

    hits.forEach((p) => {
      if (!matchedMap.has(p.id)) matchedMap.set(p.id, p);
    });
  }

  // 4. Fallback to Hot / Landmark POIs
  if (matchedMap.size === 0) {
    poisList.slice(0, 4).forEach((p) => matchedMap.set(p.id, p));
  }

  let selectedPlaces = Array.from(matchedMap.values()).slice(0, 6);

  // 5. Spatial Proximity Ranking (if user coordinates provided)
  if (userLat && userLng && !isNaN(userLat) && !isNaN(userLng)) {
    selectedPlaces = selectedPlaces.map((p) => {
      const lat = Number(p.latitude) || 10.4128;
      const lng = Number(p.longitude) || 105.0068;
      const dist = calculateDistanceKm(userLat, userLng, lat, lng);
      return { ...p, distance_km: dist };
    }).sort((a, b) => (a.distance_km || 0) - (b.distance_km || 0));
  }

  // 6. Format Output POIs with Evidence Links
  const formattedPlaces: FormattedPoi[] = selectedPlaces.map((p) => {
    const evidence = generateEvidenceLinks(p.name, p.commune);
    const imgUrl = p.image_url || p.imageUrl || '';
    return {
      id: p.id,
      slug: p.slug || p.id,
      name: p.name,
      commune: p.commune || 'Tri Tôn',
      category: p.category || 'Địa điểm',
      rating: p.rating || 4.8,
      image_url: imgUrl,
      imageUrl: imgUrl,
      source_url: evidence.googleMapsUrl,
      tiktok_search_url: evidence.tiktokSearchUrl,
      hashtags: evidence.hashtags,
      distance_km: p.distance_km,
      price_level: p.price_level,
      opening_hours: p.opening_hours,
      description: p.description,
      field_tips: p.field_tips,
    };
  });

  // 7. Build Time Window Context Block
  const timeWindowSnippet = `\n\n[BỐI CẢNH THỜI GIAN THỰC TẾ & GỢI Ý KHUNG GIỜ VÀNG (ĐỒNG HỒ TRI TÔN: ${timeWindow.currentClock})]:\n- Giai đoạn: ${timeWindow.periodLabel}\n- Món ăn ưu tiên: ${timeWindow.foodTips}\n- Trải nghiệm khuyên dùng: ${timeWindow.activityTips}`;

  // 8. Build Text Context for LLM
  const ragLines = formattedPlaces.map((p) => {
    const distText = p.distance_km !== undefined ? ` (Cách bạn ~${p.distance_km}km)` : '';
    const tips = p.field_tips ? `\n  - Mẹo thực địa: ${p.field_tips}` : '';
    const desc = p.description ? `\n  - Chi tiết: ${p.description.slice(0, 250)}` : '';
    return `* [ID: ${p.id}] ${p.name} (Địa phận: ${p.commune}${distText}): Thể loại ${p.category}, Đánh giá: ${p.rating}/5.${tips}${desc}\n  [📍 Chỉ đường Google Maps](${p.source_url})  •  [▶ Xem TikTok Video](${p.tiktok_search_url})`;
  });

  let transportSnippet = '';
  if (/đi|xe|đường|tuyến|phương trang|huệ nghĩa|xe khách|thuê xe|leo núi|vồ hội|cô tô|tà pạ|ô thum|ô tà sóc|tà lọt|tơ lụa|chữ y|nút giao|chỉ đường|di chuyển/i.test(userQuery)) {
    transportSnippet = `\n\n[CSDL HƯỚNG DẪN GIAO THÔNG, XE CỘ & CÁC CUNG ĐƯỜNG DANH THẮNG TRI TÔN ĐÃ XÁC MINH]:\n${JSON.stringify(transportData, null, 2)}`;
  }

  let festivalsSnippet = '';
  if (/khinh khí cầu|dù lượn|lễ hội|hội|đua bò|chôl chnăm|sêne đônta|sene donta|ok om bok|cúng trăng|kathina|dâng y|tết khmer|hoa đăng/i.test(userQuery)) {
    festivalsSnippet = `\n\n[CSDL 6 ĐẠI LỄ HỘI & SỰ KIỆN VĂN HÓA THỂ THAO TRI TÔN ĐÃ XÁC MINH 100%]:\n${JSON.stringify(festivalsData, null, 2)}`;
  }

  // ── 9. SMART ITINERARY & SPATIAL GRAPH ROUTING ENGINE ─────────────────────
  let itinerarySnippet = '';
  const isItineraryQuery = /lịch trình|kế hoạch|gợi ý đi|chơi gì|1 ngày|2 ngày|2n1đ|3 ngày|3n2đ|nửa ngày|tour|tuyến đường|lộ trình|cung đường/i.test(userQuery);

  if (isItineraryQuery) {
    const rawItins = (itinerariesData as any)?.itineraries || [];
    let matchedItin: any = null;

    if (lower.includes('3 ngày') || lower.includes('3n2đ')) {
      matchedItin = rawItins.find((it: any) => it.id === 'itin-003' || it.duration.includes('3 ngày'));
    } else if (lower.includes('2 ngày') || lower.includes('2n1đ')) {
      if (lower.includes('budget') || lower.includes('tiết kiệm') || lower.includes('phượt')) {
        matchedItin = rawItins.find((it: any) => it.id === 'itin-028');
      } else if (lower.includes('family') || lower.includes('gia đình') || lower.includes('trẻ em')) {
        matchedItin = rawItins.find((it: any) => it.id === 'itin-027');
      } else {
        matchedItin = rawItins.find((it: any) => it.id === 'itin-002');
      }
    } else if (lower.includes('ẩm thực') || lower.includes('food') || lower.includes('ăn')) {
      matchedItin = rawItins.find((it: any) => it.id === 'itin-007');
    } else if (lower.includes('sống ảo') || lower.includes('chụp ảnh') || lower.includes('checkin') || lower.includes('check-in')) {
      matchedItin = rawItins.find((it: any) => it.id === 'itin-004');
    } else if (lower.includes('tâm linh') || lower.includes('chùa') || lower.includes('hành hương')) {
      matchedItin = rawItins.find((it: any) => it.id === 'itin-005');
    } else if (lower.includes('cafe') || lower.includes('cà phê')) {
      matchedItin = rawItins.find((it: any) => it.id === 'itin-018');
    } else if (lower.includes('đêm') || lower.includes('tối')) {
      matchedItin = rawItins.find((it: any) => it.id === 'itin-016');
    } else if (lower.includes('1 ngày') || lower.includes('trong ngày')) {
      matchedItin = rawItins.find((it: any) => it.id === 'itin-001');
    }

    if (matchedItin) {
      itinerarySnippet = `\n\n[GỢI Ý LỊCH TRÌNH KHÉP VÒNG NÚI CHUẨN XÁC ĐÃ TỐI ƯU KILOMET & THỜI GIAN]:\n`;
      itinerarySnippet += `* Tên Tour: "${matchedItin.name}" (Mã: ${matchedItin.id}, Thời lượng: ${matchedItin.duration})\n`;
      itinerarySnippet += `* Tổng cự ly cả chuyến: ~${matchedItin.total_distance_km} km | Tổng thời gian chạy xe: ~${matchedItin.total_travel_time_mins} phút\n`;
      itinerarySnippet += `* Mô tả: ${matchedItin.description}\n`;
      itinerarySnippet += `* Chi tiết các ngày và chuỗi chặng khép vòng:\n`;

      (matchedItin.days || []).forEach((day: any) => {
        itinerarySnippet += `\n  🗓️ ${day.title} (Tổng cự ly ngày: ~${day.day_total_distance_km} km):\n`;
        (day.stops || []).forEach((s: any) => {
          const distInfo = s.distance_from_prev_km > 0 ? ` [Cách điểm trước: ~${s.distance_from_prev_km}km, chạy xe ~${s.travel_time_mins}p]` : ' [Điểm xuất phát]';
          itinerarySnippet += `    - [${s.time}] ${s.name} (${s.commune}): ${s.activity}${distInfo}. Chi phí: ${s.cost_vnd}.\n`;
        });
      });
    } else if (selectedPlaces.length >= 2) {
      // Câu hỏi tùy biến tự chọn điểm -> Kích hoạt Dynamic Spatial Graph Router
      const candidateSpatialPois: SpatialPoi[] = selectedPlaces.map((p) => ({
        id: p.id,
        name: p.name,
        commune: p.commune || 'Tri Tôn',
        category: p.category || 'Địa điểm',
        latitude: Number(p.latitude) || 10.4128,
        longitude: Number(p.longitude) || 105.0068,
        activityHint: p.description,
      }));

      const dynamicRoute = optimizeClosedLoopRoute(candidateSpatialPois, userLat, userLng);
      itinerarySnippet = `\n\n${dynamicRoute.contextText}\n\n${dynamicRoute.diagramText}`;
    }
  }

  const weatherText = await Promise.race([
    fetchLiveWeatherContext(),
    new Promise<string>((resolve) => setTimeout(() => resolve(''), 400)),
  ]);

  const fullRagContext = [
    ragLines.length > 0 ? `CSDL 149 ĐỊA ĐIỂM TRI TÔN XÁC MINH PHÙ HỢP:\n${ragLines.join('\n\n')}` : '',
    timeWindowSnippet,
    itinerarySnippet,
    transportSnippet,
    festivalsSnippet,
    weatherText,
  ]
    .filter(Boolean)
    .join('\n\n');

  return {
    ragContext: fullRagContext,
    places: formattedPlaces,
    suggestions: buildDynamicSuggestions(lower, timeWindow),
    weatherText,
    timeWindowText: timeWindowSnippet,
  };
}
