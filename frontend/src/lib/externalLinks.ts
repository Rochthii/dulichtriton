/**
 * Unified External Action Link Resolvers
 * Single Source of Truth for Google Maps & TikTok Navigation across Du Lịch Tri Tôn AI Project
 */

import { getGoogleMapsUrl, resolveGoogleMapsAction, type GoogleMapsOptions } from './maps';
import { getTikTokHashtagUrl, getTikTokWebSearchUrl, resolveTikTokAction, resolveTikTokHashtag, type TikTokLinkOptions } from './tiktok';

export {
  getGoogleMapsUrl,
  resolveGoogleMapsAction,
  getTikTokHashtagUrl,
  getTikTokWebSearchUrl,
  resolveTikTokAction,
  resolveTikTokHashtag,
};

export type { GoogleMapsOptions, TikTokLinkOptions };

/**
 * Convenience helper to resolve both Google Maps AND TikTok actions at once for any place item
 */
export function resolvePlaceExternalLinks(place: {
  name: string;
  commune?: string;
  category?: string;
  lat?: number;
  lng?: number;
  video_url?: string;
  tiktok_videos?: any[];
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
    category: place.category,
    directVideoUrl: place.video_url,
    tiktok_videos: place.tiktok_videos,
  });

  return { maps, tiktok };
}
