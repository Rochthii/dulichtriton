/**
 * Evidence Generator (Google Maps 1-click & TikTok Search Links) & Hashtag Generator
 */

export interface EvidenceLinks {
  googleMapsUrl: string;
  tiktokSearchUrl: string;
  hashtags: string[];
}

/**
 * Convert Vietnamese string with accents to non-accented string for Hashtags
 */
export function removeVietnameseAccents(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

/**
 * Generate CamelCase hashtag from place name
 */
export function formatHashtag(name: string): string {
  const clean = removeVietnameseAccents(name)
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('');
  return `#${clean}`;
}

/**
 * Generate Google Maps & TikTok Search links + Hashtags for a POI
 */
export function generateEvidenceLinks(name: string, commune?: string): EvidenceLinks {
  const cleanCommune = commune || 'Tri Tôn';
  const encodedGmaps = encodeURIComponent(`${name} ${cleanCommune} An Giang`);
  const encodedTiktok = encodeURIComponent(`${name} Tri Tôn`);

  const mainHashtag = formatHashtag(name);
  const hashtags = [mainHashtag, '#TriTon', '#AnGiang', '#DuLichTriTon'];

  return {
    googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodedGmaps}`,
    tiktokSearchUrl: `https://www.tiktok.com/search?q=${encodedTiktok}`,
    hashtags,
  };
}
