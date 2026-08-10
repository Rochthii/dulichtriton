/**
 * Centralized Production Utility Exports
 * Du Lịch Tri Tôn AI Project
 */

import { getGoogleMapsUrl } from './maps';
import { getTikTokWebSearchUrl } from './tiktok';

export { getGoogleMapsUrl, getTikTokWebSearchUrl as getTikTokSearchUrl };

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
