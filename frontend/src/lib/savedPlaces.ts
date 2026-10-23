export const SAVED_PLACES_KEY = 'triton_fav_places';
export const SAVED_PLACES_CHANGED_EVENT = 'triton:saved-places-changed';
export type SavedPlaceIdentity = { id?: string; slug?: string; place_id?: string };

export function placeSaveKeys(place: SavedPlaceIdentity): string[] {
  // Prefer a stable route slug across static and DB IDs; accept existing saved IDs.
  return [...new Set([place.slug, place.id, place.place_id]
    .filter((value): value is string => typeof value === 'string' && !!value.trim())
    .map(value => value.trim()))];
}

export function readSavedPlaces(storage: Pick<Storage, 'getItem'>): string[] {
  const raw = storage.getItem(SAVED_PLACES_KEY);
  if (raw === null) return [];
  const values: unknown = JSON.parse(raw);
  if (!Array.isArray(values) || values.some(value => typeof value !== 'string' || !value.trim())) {
    throw new Error('Saved places are not a valid list');
  }
  return [...new Set((values as string[]).map(value => value.trim()))];
}

export function isPlaceSaved(saved: string[], place: SavedPlaceIdentity): boolean {
  return placeSaveKeys(place).some(key => saved.includes(key));
}

export function toggleSavedPlace(storage: Pick<Storage, 'getItem' | 'setItem'>, place: SavedPlaceIdentity) {
  const aliases = placeSaveKeys(place);
  if (!aliases.length) throw new Error('Missing place identity');
  const current = readSavedPlaces(storage);
  const wasSaved = isPlaceSaved(current, place);
  const next = wasSaved ? current.filter(key => !aliases.includes(key)) : [...current, aliases[0]];
  storage.setItem(SAVED_PLACES_KEY, JSON.stringify(next));
  return { saved: next, isSaved: !wasSaved };
}
