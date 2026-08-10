/**
 * Centralized Production-Real Google Maps Navigation & GIS Utility
 * Du Lịch Tri Tôn AI Project
 */

export interface GoogleMapsOptions {
  name: string;
  commune?: string;
  lat?: number;
  lng?: number;
  address?: string;
}

/**
 * Clean & normalize place name for Google Maps search
 */
export function cleanLocationName(text: string): string {
  if (!text) return 'Tri Tôn An Giang';
  return text.trim();
}

/**
 * Generate standard Google Maps search or directions URL
 * Prioritizes GPS coordinates if available within bounding box [10.25-10.55, 104.85-105.15]
 */
export function getGoogleMapsUrl(options: GoogleMapsOptions | string, commune?: string): string {
  if (typeof options === 'string') {
    const name = cleanLocationName(options);
    const com = commune ? cleanLocationName(commune) : '';
    const query = `${name}, ${com}, Tri Tôn, An Giang`.replace(/,\s*,/g, ',').trim();
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  }

  const { name, commune: com, lat, lng } = options;

  // Validate coordinates inside Tri Tôn Bounding Box [10.25-10.55, 104.85-105.15]
  if (lat && lng && lat >= 10.25 && lat <= 10.55 && lng >= 104.85 && lng <= 105.15) {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }

  const cleanName = cleanLocationName(name);
  const cleanCom = com ? cleanLocationName(com) : '';
  const query = `${cleanName}, ${cleanCom}, Tri Tôn, An Giang`.replace(/,\s*,/g, ',').trim();
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
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
    label: 'Chỉ đường',
    tooltip: `Mở Google Maps chỉ đường đến ${cleanName}`,
  };
}
