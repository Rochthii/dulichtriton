/**
 * Dynamic Google Maps Link Generator
 * Creates an exact search query link based on real location name and commune.
 * NO static hardcoded coordinates queries.
 */
export function getGoogleMapsUrl(name: string, commune: string): string {
  const query = `${name}, ${commune}, Tri Tôn, An Giang`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/**
 * NFC Vietnamese Unicode Normalizer
 */
export function normalizeNFC(text: string): string {
  return text ? text.normalize("NFC") : "";
}

/**
 * Format Price Level string
 */
export function formatPrice(price: string): string {
  if (!price || price === "0" || price.toLowerCase() === "miễn phí") {
    return "Miễn phí";
  }
  return price;
}
