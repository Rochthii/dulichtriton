/**
 * Centralized Production-Real Google Maps Navigation & Road GIS Utility
 * Du Lịch Tri Tôn AI Project
 * 
 * Standard:
 * 1. ZERO IP Geolocation: Never approximate user position via IP (which erroneously maps to Cần Thơ / TP.HCM).
 * 2. Real GPS Hardware & WGS84 Coordinates: Uses browser native High-Accuracy GPS or verified Master Coordinates.
 * 3. Exact Google Maps Turn-by-Turn Navigation Routing with driving mode.
 */

export interface GoogleMapsOptions {
  name: string;
  commune?: string;
  lat?: number;
  lng?: number;
  address?: string;
}

export const TRI_TON_CENTER_COORDS = {
  latitude: 10.4215,
  longitude: 105.0125,
  name: 'Trung tâm Thị trấn Tri Tôn',
};

/**
 * Clean & normalize place name for Google Maps search
 */
export function cleanLocationName(text: string): string {
  if (!text) return 'Tri Tôn An Giang';
  return text.trim();
}

/**
 * Generate standard Google Maps turn-by-turn navigation URL
 * Directly prompts Google Maps app to route from device's native GPS to the exact destination
 */
export function getGoogleMapsUrl(options: GoogleMapsOptions | string, commune?: string): string {
  let name = '';
  let com = '';
  let lat: number | undefined;
  let lng: number | undefined;

  if (typeof options === 'string') {
    name = cleanLocationName(options);
    com = commune ? cleanLocationName(commune) : '';
  } else {
    name = cleanLocationName(options.name);
    com = options.commune ? cleanLocationName(options.commune) : '';
    lat = options.lat;
    lng = options.lng;
  }

  // If coordinates are valid WGS84 within Tri Tôn bounding box, use exact coords for pin-point accuracy
  if (lat && lng && lat >= 10.25 && lat <= 10.65 && lng >= 104.8 && lng <= 105.25) {
    const label = encodeURIComponent(`${name}, ${com}`);
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${label}&travelmode=driving`;
  }

  const parts: string[] = [name];
  if (com && !name.toLowerCase().includes(com.toLowerCase())) {
    parts.push(com);
  }
  if (!name.toLowerCase().includes('tri tôn')) {
    parts.push('Tri Tôn');
  }
  if (!name.toLowerCase().includes('an giang')) {
    parts.push('An Giang');
  }

  const query = parts.join(' ').replace(/\s+/g, ' ').trim();
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}&travelmode=driving`;
}

/**
 * Generate Google Maps navigation URL from specific origin to destination
 */
export function getGoogleMapsDirectionUrl(
  destination: { name: string; commune?: string; lat?: number; lng?: number },
  origin?: { lat: number; lng: number }
): string {
  const destStr = destination.lat && destination.lng
    ? `${destination.lat},${destination.lng}`
    : encodeURIComponent(`${destination.name}, ${destination.commune || ''}, Tri Tôn, An Giang`);

  if (origin && origin.lat && origin.lng) {
    return `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${destStr}&travelmode=driving`;
  }

  return `https://www.google.com/maps/dir/?api=1&destination=${destStr}&travelmode=driving`;
}

/**
 * Resolve full Google Maps action metadata
 */
export function resolveGoogleMapsAction(options: GoogleMapsOptions): {
  url: string;
  label: string;
  tooltip: string;
} {
  const url = getGoogleMapsUrl(options);
  const cleanName = cleanLocationName(options.name);
  return {
    url,
    label: 'Chỉ đường Google Maps',
    tooltip: `Mở Google Maps dẫn đường đến ${cleanName} (không dùng IP)`,
  };
}

/**
 * Get device High-Accuracy GPS (HTML5 Hardware Sensor)
 * Strictly avoids IP lookups
 */
export function getDeviceHardwareGps(
  onSuccess: (coords: { latitude: number; longitude: number }) => void,
  onError: (errMsg: string) => void
): void {
  if (typeof window === 'undefined' || !navigator.geolocation) {
    onError('Thiết bị của bạn không hỗ trợ định vị GPS.');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      onSuccess({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    },
    (err) => {
      let msg = 'Không thể lấy vị trí GPS.';
      if (err.code === err.PERMISSION_DENIED) {
        msg = 'Bạn đã từ chối quyền truy cập vị trí GPS. Đang dùng Trung tâm Tri Tôn làm điểm xuất phát.';
      } else if (err.code === err.POSITION_UNAVAILABLE) {
        msg = 'Vị trí GPS không khả dụng. Đang dùng Trung tâm Tri Tôn làm điểm xuất phát.';
      } else if (err.code === err.TIMEOUT) {
        msg = 'Hết thời gian tìm tín hiệu GPS. Đang dùng Trung tâm Tri Tôn làm điểm xuất phát.';
      }
      onError(msg);
    },
    {
      enableHighAccuracy: true,
      timeout: 9000,
      maximumAge: 30000,
    }
  );
}
