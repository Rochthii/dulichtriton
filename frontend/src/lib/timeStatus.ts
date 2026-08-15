/**
 * Dynamic Real-time Status & Seasonal Telemetry for Tri Tôn Tourism
 */

export interface TimeStatusResult {
  badgeText: string;
  badgeType: 'success' | 'warning' | 'info' | 'harvest' | 'alert';
  isGoldenHour: boolean;
  isPeakHour: boolean;
  seasonText: string;
  cautionText?: string;
}

export function calculateTimeStatus(category: string = '', bestTime: string = ''): TimeStatusResult {
  const now = new Date();
  const hour = now.getHours();
  const month = now.getMonth() + 1; // 1 - 12

  let badgeText = 'Đang mở cửa đón khách';
  let badgeType: TimeStatusResult['badgeType'] = 'success';
  let isGoldenHour = false;
  let isPeakHour = false;

  // Real-time time of day logic
  if (hour >= 5 && hour < 9) {
    badgeText = '🟢 Đang vắng vẻ - Giờ vàng săn mây';
    badgeType = 'success';
    isGoldenHour = true;
  } else if (hour >= 11 && hour <= 13) {
    badgeText = '🍗 Giờ cao điểm ẩm thực Bảy Núi';
    badgeType = 'warning';
    isPeakHour = true;
  } else if (hour >= 15 && hour < 18) {
    badgeText = '🌇 Hoàng hôn buông - Giờ vàng chụp ảnh';
    badgeType = 'info';
    isGoldenHour = true;
  } else if (hour >= 18 && hour <= 21) {
    badgeText = '🌙 Chợ đêm & Dạo phố Tri Tôn';
    badgeType = 'info';
  } else if (hour > 21 || hour < 5) {
    badgeText = '⚪ Đã đóng cửa - Nên đến vào sáng mai';
    badgeType = 'alert';
  }

  // Seasonal calculation for Tri Tôn
  let seasonText = '☀️ Mùa khô nắng ấm - Thời tiết thuận lợi';
  let cautionText: string | undefined = undefined;

  if (month >= 8 && month <= 11) {
    seasonText = '🌾 Đang mùa lúa chín vàng Tà Pạ';
    if (month >= 9 && month <= 10) {
      badgeText = '🌾 Mùa lúa chín vàng - Đẹp nhất trong năm';
      badgeType = 'harvest';
    }
  } else if (month >= 5 && month <= 7) {
    seasonText = '🌧️ Mùa mưa Bảy Núi - Cây cối xanh tươi';
    if (category.includes('mountain') || category.includes('nature')) {
      cautionText = 'Lưu ý: Đá có thể trơn trượt sau mưa rào, nên mang giày bám tốt.';
    }
  }

  return {
    badgeText,
    badgeType,
    isGoldenHour,
    isPeakHour,
    seasonText,
    cautionText,
  };
}
