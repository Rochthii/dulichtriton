/**
 * Offline Mountain Survival Cache for Tri Tôn Hikers & Travelers
 * 
 * Provides local caching of critical travel guides, offline GPS directions,
 * and 24/7 emergency rescue hotlines for areas with no 4G signal (Núi Cô Tô, Vồ Hội, Tức Dụp).
 */

export interface OfflinePlaceRecord {
  id: string;
  name: string;
  commune: string;
  latitude: number;
  longitude: number;
  address: string;
  opening_hours: string;
  ticket_price: string;
  vehicle_suitability: string;
  how_to_get_there: string;
  emergency_hotline: string;
  cached_at: string;
}

const CACHE_KEY = 'triton_offline_mountain_cache';

export const EMERGENCY_CONTACTS = [
  { name: 'Công An Huyện Tri Tôn (Trực ban 24/7)', phone: '0296.3874.113', owner: 'Công an Huyện Tri Tôn', source_url: 'https://triton.angiang.gov.vn' },
  { name: 'Cấp Cứu Y Tế Trung Tâm Tri Tôn', phone: '0296.3874.115', owner: 'Trung tâm Y tế Huyện Tri Tôn', source_url: 'https://triton.angiang.gov.vn' },
  { name: 'UBND Huyện Tri Tôn (Đường dây nóng)', phone: '0296.3874.114', owner: 'UBND Huyện Tri Tôn', source_url: 'https://triton.angiang.gov.vn' },
];

/**
 * Save POI data into offline localStorage cache
 */
export function savePlaceToOfflineCache(place: any): void {
  if (typeof window === 'undefined' || !place || !place.id) return;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    const cache: Record<string, OfflinePlaceRecord> = raw ? JSON.parse(raw) : {};

    cache[place.id] = {
      id: place.id,
      name: place.name || 'Địa điểm Tri Tôn',
      commune: place.commune || 'Tri Tôn',
      latitude: place.latitude || 10.42,
      longitude: place.longitude || 105.01,
      address: place.address || '',
      opening_hours: place.opening_hours || '06:00 - 18:30',
      ticket_price: place.ticket_price || 'Miễn phí',
      vehicle_suitability: place.vehicle_suitability || 'Xe máy, đi bộ',
      how_to_get_there: place.how_to_get_there || 'Tuyến đường đèo bộ hoặc xe ôm địa phương.',
      emergency_hotline: '0296.3874.113',
      cached_at: new Date().toISOString(),
    };

    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (err) {
    console.error('Failed to write offline cache:', err);
  }
}

/**
 * Get all cached offline places
 */
export function getOfflineCachedPlaces(): OfflinePlaceRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return [];
    const cache: Record<string, OfflinePlaceRecord> = JSON.parse(raw);
    return Object.values(cache);
  } catch {
    return [];
  }
}
