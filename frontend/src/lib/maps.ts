/**
 * Centralized Production-Real Google Maps Navigation & GIS Utility
 * Du Lịch Tri Tôn AI Project
 * 
 * Standard: ALWAYS search by verified Place Name + Commune + Tri Tôn, An Giang
 * Avoids raw GPS pinning or IP mislocation, guarantees Google Business Profile & Navigation routing
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
 * Generate standard Google Maps search URL based on place name and geographic context
 * Uses search query format: `https://www.google.com/maps/search/?api=1&query=${name} ${commune} Tri Tôn An Giang`
 */
export function getGoogleMapsUrl(options: GoogleMapsOptions | string, commune?: string): string {
  let name = '';
  let com = '';

  if (typeof options === 'string') {
    name = cleanLocationName(options);
    com = commune ? cleanLocationName(commune) : '';
  } else {
    name = cleanLocationName(options.name);
    com = options.commune ? cleanLocationName(options.commune) : '';
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
