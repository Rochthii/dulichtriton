/**
 * Centralized Production-Real TikTok Integration & Deep Link Utility
 * Du Lịch Tri Tôn AI Project
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
 * Generate standard TikTok web search URL with exact Tri Tôn geographic anchor
 */
export function getTikTokWebSearchUrl(placeName: string, commune?: string): string {
  const cleanName = cleanKeyword(placeName);
  const cleanCom = commune ? cleanKeyword(commune) : '';
  const query = `${cleanName} ${cleanCom} Tri Tôn An Giang`.replace(/\s+/g, ' ').trim();
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
    label: `Tìm TikTok "${cleanKeyword(placeName)}"`,
    isDirect: false,
  };
}
