/**
 * Centralized Production-Real TikTok Integration & Deep Link Utility
 * Du Lịch Tri Tôn AI Project
 * 
 * Standard: Universal Link format `https://www.tiktok.com/search?q={query}`
 * On mobile smartphones (iOS/Android), this automatically invokes the native TikTok App
 * searching directly for the place reviews, while providing graceful web fallback.
 */

export interface TikTokLinkOptions {
  placeName: string;
  commune?: string;
  category?: string;
  directVideoUrl?: string;
  hashtags?: string[];
}

/**
 * Clean & normalize place name for search
 */
export function cleanKeyword(text: string): string {
  if (!text) return 'Tri Tôn An Giang';
  return text.replace(/[#@]/g, '').trim();
}

/**
 * Generate standard TikTok search URL with exact Tri Tôn geographic anchor
 * Opens directly in the TikTok app on mobile devices
 */
export function getTikTokWebSearchUrl(placeName: string, commune?: string): string {
  const cleanName = cleanKeyword(placeName);
  const cleanCom = commune ? cleanKeyword(commune) : '';
  
  const parts: string[] = [cleanName];
  if (cleanCom && !cleanName.toLowerCase().includes(cleanCom.toLowerCase())) {
    parts.push(cleanCom);
  }
  if (!cleanName.toLowerCase().includes('tri tôn')) {
    parts.push('Tri Tôn');
  }

  const query = parts.join(' ').replace(/\s+/g, ' ').trim();
  return `https://www.tiktok.com/search?q=${encodeURIComponent(query)}`;
}

/**
 * Smart TikTok Action Resolver
 * Resolves direct video URL if available, otherwise fallback to anchor search query
 */
export function resolveTikTokAction(options: TikTokLinkOptions): {
  url: string;
  label: string;
  isDirect: boolean;
} {
  const { placeName, commune, directVideoUrl } = options;

  if (directVideoUrl && directVideoUrl.startsWith('http') && directVideoUrl.includes('tiktok.com')) {
    return {
      url: directVideoUrl,
      label: 'Xem TikTok Video',
      isDirect: true,
    };
  }

  const searchUrl = getTikTokWebSearchUrl(placeName, commune);
  return {
    url: searchUrl,
    label: `Mở TikTok "${cleanKeyword(placeName)}"`,
    isDirect: false,
  };
}
