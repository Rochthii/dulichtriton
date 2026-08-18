/**
 * ─────────────────────────────────────────────────────────────────────────────
 * DYNAMIC SPATIAL GRAPH LOOP ROUTER & REAL-TIME ITINERARY GENERATOR
 * Du Lịch Tri Tôn AI Assistant System
 * 
 * Tự động tính toán sơ đồ chuỗi chặng khép vòng ngắn nhất (No Zigzag)
 * và ma trận Kilomet cho 100% câu hỏi lịch trình tùy biến thời gian thực.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface SpatialPoi {
  id: string;
  name: string;
  commune: string;
  category: string;
  latitude: number;
  longitude: number;
  activityHint?: string;
}

export interface RouteLeg {
  fromPoi: SpatialPoi;
  toPoi: SpatialPoi;
  distanceKm: number;
  travelTimeMins: number;
  recommendedTime: string;
  activityNote: string;
}

export interface DynamicClosedLoopResult {
  orderedPois: SpatialPoi[];
  legs: RouteLeg[];
  totalDistanceKm: number;
  totalTravelTimeMins: number;
  diagramText: string;
  contextText: string;
}

/**
 * Tính khoảng cách đường bộ Haversine hiệu chỉnh K_road = 1.25
 */
export function calculateRoadDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): { km: number; mins: number } {
  if (!lat1 || !lon1 || !lat2 || !lon2) return { km: 1.0, mins: 3 };
  if (lat1 === lat2 && lon1 === lon2) return { km: 0, mins: 0 };

  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const rawKm = R * c;
  const roadKm = Math.round(rawKm * 1.25 * 10) / 10;
  const mins = Math.max(2, Math.round((roadKm / 30) * 60)); // 30km/h tốc độ xe máy/ô tô trong huyện
  return { km: roadKm, mins };
}

/**
 * Thuật toán Nearest-Neighbor Loop Optimization (Sắp xếp chuỗi chặng ngắn nhất khép vòng)
 */
export function optimizeClosedLoopRoute(
  candidatePois: SpatialPoi[],
  startLat?: number,
  startLng?: number
): DynamicClosedLoopResult {
  if (!candidatePois || candidatePois.length === 0) {
    return {
      orderedPois: [],
      legs: [],
      totalDistanceKm: 0,
      totalTravelTimeMins: 0,
      diagramText: '',
      contextText: '',
    };
  }

  // Nếu chỉ có 1 POI
  if (candidatePois.length === 1) {
    const p = candidatePois[0];
    return {
      orderedPois: [p],
      legs: [],
      totalDistanceKm: 0,
      totalTravelTimeMins: 0,
      diagramText: `[📍 ${p.name} (${p.commune})]`,
      contextText: `Điểm đến duy nhất: ${p.name} tại ${p.commune}.`,
    };
  }

  // 1. Tìm điểm bắt đầu gần tọa độ start nhất (hoặc lấy điểm đầu tiên)
  let currentIdx = 0;
  if (startLat && startLng) {
    let minD = Infinity;
    candidatePois.forEach((p, idx) => {
      const d = calculateRoadDistance(startLat, startLng, p.latitude, p.longitude).km;
      if (d < minD) {
        minD = d;
        currentIdx = idx;
      }
    });
  }

  const unvisited = [...candidatePois];
  const ordered: SpatialPoi[] = [];
  
  // Lấy điểm xuất phát
  let current = unvisited.splice(currentIdx, 1)[0];
  ordered.push(current);

  // 2. Tham lam tìm điểm gần nhất kế tiếp (Nearest Neighbor)
  while (unvisited.length > 0) {
    let nearestIdx = 0;
    let minD = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const dist = calculateRoadDistance(
        current.latitude,
        current.longitude,
        unvisited[i].latitude,
        unvisited[i].longitude
      ).km;

      if (dist < minD) {
        minD = dist;
        nearestIdx = i;
      }
    }

    current = unvisited.splice(nearestIdx, 1)[0];
    ordered.push(current);
  }

  // 3. Xây dựng danh sách chặng (Legs) và tính toán Km
  const legs: RouteLeg[] = [];
  let totalKm = 0;
  let totalMins = 0;

  for (let i = 0; i < ordered.length; i++) {
    const from = ordered[i];
    const to = ordered[(i + 1) % ordered.length]; // Chặng cuối khép vòng về điểm đầu
    const { km, mins } = calculateRoadDistance(
      from.latitude,
      from.longitude,
      to.latitude,
      to.longitude
    );

    totalKm += km;
    totalMins += mins;

    legs.push({
      fromPoi: from,
      toPoi: to,
      distanceKm: km,
      travelTimeMins: mins,
      recommendedTime: `Chặng ${i + 1}`,
      activityNote: from.activityHint || `Tham quan, trải nghiệm tại ${from.name}`,
    });
  }

  // 4. Sinh sơ đồ chuỗi chặng Text ASCII & Markdown
  let diagramText = `🗺️ SƠ ĐỒ CUNG ĐƯỜNG KHÉP VÒNG LIÊN HOÀN (TỰ ĐỘNG TỐI ƯU KM):\n`;
  for (let i = 0; i < ordered.length; i++) {
    const p = ordered[i];
    const leg = legs[i];
    diagramText += `[📍 Chặng ${i + 1}: ${p.name} (${p.commune})]\n`;
    if (i < ordered.length - 1) {
      diagramText += `      │  di chuyển ~${leg.distanceKm} km (khoảng ${leg.travelTimeMins} phút đi xe)\n      ▼\n`;
    } else {
      diagramText += `      │  di chuyển ~${leg.distanceKm} km (khoảng ${leg.travelTimeMins} phút - Khép vòng về lại điểm đầu)\n      ▼\n`;
      diagramText += `[📍 Kết thúc: ${ordered[0].name} / Trung tâm Tri Tôn]\n`;
    }
  }

  const roundedTotalKm = Math.round(totalKm * 10) / 10;
  diagramText += `\n🎯 TỔNG CỰ LY TOÀN VÒNG: ~${roundedTotalKm} km | Tổng thời gian di chuyển: ~${totalMins} phút.\n`;

  // 5. Đóng gói Context cho Prompt Engine
  let contextText = `[SƠ ĐỒ LỘ TRÌNH KHÉP VÒNG TỰ ĐỘNG TÍNH THEO BẢN ĐỒ GPS TRI TÔN]:\n`;
  contextText += `- Tổng cự ly vòng cung: ~${roundedTotalKm} km (Thời gian lái xe: ~${totalMins} phút).\n`;
  contextText += `- Chuỗi điểm dừng tối ưu (không bị quay đầu hay chạy lòng vòng):\n`;

  ordered.forEach((p, idx) => {
    const leg = legs[idx];
    contextText += `  ${idx + 1}. ${p.name} (${p.commune}) ➔ Chặng kế tiếp: ~${leg.distanceKm}km (${leg.travelTimeMins} phút)\n`;
  });

  return {
    orderedPois: ordered,
    legs,
    totalDistanceKm: roundedTotalKm,
    totalTravelTimeMins: totalMins,
    diagramText,
    contextText,
  };
}
