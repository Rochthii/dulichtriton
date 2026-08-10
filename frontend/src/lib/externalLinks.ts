/**
 * Unified External Action Link Resolvers
 * Single Source of Truth for Google Maps & TikTok Navigation across Du Lịch Tri Tôn AI Project
 */

import { getGoogleMapsUrl, resolveGoogleMapsAction, type GoogleMapsOptions } from './maps';
import { getTikTokWebSearchUrl, resolveTikTokAction, type TikTokLinkOptions } from './tiktok';

export {
  getGoogleMapsUrl,
  resolveGoogleMapsAction,
  getTikTokWebSearchUrl,
  resolveTikTokAction,
};

export type { GoogleMapsOptions, TikTokLinkOptions };

/**
 * Convenience helper to resolve both Google Maps AND TikTok actions at once for any place item
 */
export function resolvePlaceExternalLinks(place: {
  name: string;
  commune?: string;
  lat?: number;
  lng?: number;
  video_url?: string;
}) {
  const maps = resolveGoogleMapsAction({
    name: place.name,
    commune: place.commune,
    lat: place.lat,
    lng: place.lng,
  });

  const tiktok = resolveTikTokAction({
    placeName: place.name,
    commune: place.commune,
    directVideoUrl: place.video_url,
  });

  return { maps, tiktok };
}
