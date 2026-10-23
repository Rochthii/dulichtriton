/** Presentation gates only: never rewrite category or verification in source data. */
export const MISSING_PLACE_IMAGE = `data:image/svg+xml;charset=utf-8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><rect width="800" height="600" fill="#FFFDF7"/><text x="400" y="300" text-anchor="middle" fill="#26221B" font-family="sans-serif" font-size="24">Chưa có ảnh địa điểm</text></svg>')}`;

export function isFoodListing(place: { category?: string; subcategory?: string }): boolean {
  if (!['food', 'gastronomy'].includes(place.category?.toLowerCase() || '')) return false;
  return !['cultural_event', 'artwork', 'water', 'điểm check-in sống ảo'].includes(place.subcategory?.toLowerCase() || '');
}

export function presentRating(value: unknown): number | undefined {
  if (value === null || value === undefined || (typeof value === 'string' && !value.trim())) return undefined;
  const number = typeof value === 'number' || typeof value === 'string' ? Number(value) : NaN;
  return Number.isFinite(number) && number >= 0 && number <= 5 ? number : undefined;
}

export function presentPlaceImage(place: { image_url?: string; photos?: unknown }): string {
  const photos = Array.isArray(place.photos) ? place.photos : [];
  const candidates = [place.image_url, ...photos.map(photo => typeof photo === 'string' ? photo : photo?.url)];
  return candidates.find(url => typeof url === 'string' && /^https?:\/\//.test(url)
    && !url.includes('unsplash.com') && !url.includes('/tri_ton_hero/')) || '';
}
