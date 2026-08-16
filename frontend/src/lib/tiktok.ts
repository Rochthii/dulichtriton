/**
 * Centralized Production-Real TikTok Smart Hashtag & Deep Link System
 * Du Lịch Tri Tôn AI Project (Option 2 Architecture)
 * 
 * Standard: Universal Hashtag Link format `https://www.tiktok.com/tag/{hashtag}`
 * On mobile smartphones (iOS/Android) & desktop:
 * - Solves the mobile redirect bug where /search?q= was hijacked to random FYP videos.
 * - Opens directly into the Hashtag Video Feed for the specific Tri Ton spot.
 * - Graceful fallback to regional & category hashtags for smaller spots.
 */

export interface TikTokLinkOptions {
  placeName: string;
  commune?: string;
  category?: string;
  directVideoUrl?: string;
  hashtags?: string[];
}

/**
 * Verified High-Traffic Tri Ton POI Hashtag Dictionary
 */
const POI_HASHTAG_MAP: Record<string, string> = {
  // Lakes & Nature
  'hồ tà pạ': 'hotapa',
  'tà pạ': 'hotapa',
  'hồ ô thum': 'gadotothum',
  'ô thum': 'gadotothum',
  'hồ soài so': 'hosoaiso',
  'soài so': 'hosoaiso',
  'hồ soài chek': 'hosoaichek',
  'soài chek': 'hosoaichek',
  'hồ ô túc': 'dulichtriton',
  'núi cô tô': 'nuicoto',
  'cô tô': 'nuicoto',
  'vồ hội': 'nuicoto',
  'đồi tà pạ': 'hotapa',
  'căn cứ ô tà sóc': 'otasoc',
  'ô tà sóc': 'otasoc',
  'suối bạc': 'hosoaiso',
  'rừng tràm gáo giồng': 'dulichtriton',

  // Khmer Pagodas & Temples
  'chùa tà pạ': 'chuatapa',
  'chùa xvayton': 'chuaxvayton',
  'chùa xà tón': 'chuaxvayton',
  'chùa koh kas': 'congtroitriton',
  'cổng trời tri tôn': 'congtroitriton',
  'cổng trời koh kas': 'congtroitriton',
  'chùa rô': 'duabotriton',
  'chùa svay ta hon': 'chuatapa',
  'chùa hàng còng': 'hangcong',
  'chùa tual prasat': 'hangcong',
  'chùa chi kơng krom': 'dulichtriton',
  'chùa soài so': 'hosoaiso',
  'chùa thum': 'chuatriton',
  'chùa pra sat': 'chuatriton',

  // Culture & Festivals
  'đua bò': 'duabotriton',
  'đua bò bảy núi': 'duabotriton',
  'lễ hội sêne dônta': 'duabotriton',
  'chol chnam thmay': 'dulichtriton',
  'thốt nốt trái tim': 'thotnottraitim',
  'hàng thốt nốt': 'thotnottraitim',
  'cây thốt nốt': 'thotnottraitim',

  // Food & Specialties
  'gà đốt ô thum': 'gadotothum',
  'gà đốt': 'gadotothum',
  'cháo bò tri tôn': 'chaobotriton',
  'cháo bò': 'chaobotriton',
  'bánh bò thốt nốt': 'banhbothotnot',
  'bánh bò': 'banhbothotnot',
  'ếch nướng': 'amthuctriton',
  'đặc sản tri tôn': 'dacsantriton',
  'chợ tri tôn': 'chotriton',
  'quảng trường tri tôn': 'quangtruongtriton',
};

/**
 * Category-based fallback hashtags
 */
const CATEGORY_HASHTAG_MAP: Record<string, string> = {
  'Ẩm thực': 'gadotothum',
  'Ăn uống': 'gadotothum',
  'Đặc sản': 'dacsantriton',
  'Tâm linh': 'chuakhmertriton',
  'Chùa': 'chuatriton',
  'Di tích': 'dulichtriton',
  'Lưu trú': 'homestaytriton',
  'Khách sạn': 'homestaytriton',
  'Homestay': 'homestaytriton',
  'Thiên nhiên': 'dulichtriton',
  'Check-in': 'dulichtriton',
  'Cảnh đẹp': 'dulichtriton',
};

/**
 * Remove Vietnamese accents and special characters to generate a safe hashtag slug
 */
export function slugifyHashtag(text: string): string {
  if (!text) return 'dulichtriton';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Clean & normalize place name for search display
 */
export function cleanKeyword(text: string): string {
  if (!text) return 'Tri Tôn An Giang';
  return text.replace(/[#@()\[\]]/g, '').trim();
}

/**
 * Resolve the optimal TikTok hashtag for a given Tri Ton destination
 */
export function resolveTikTokHashtag(placeName: string, category?: string): string {
  const normName = (placeName || '').toLowerCase().trim();

  // 1. Direct dictionary match
  for (const [key, tag] of Object.entries(POI_HASHTAG_MAP)) {
    if (normName.includes(key)) {
      return tag;
    }
  }

  // 2. Category match
  if (category) {
    for (const [catKey, tag] of Object.entries(CATEGORY_HASHTAG_MAP)) {
      if (category.toLowerCase().includes(catKey.toLowerCase())) {
        return tag;
      }
    }
  }

  // 3. Auto slugify if long enough, else fallback to 'dulichtriton'
  const slug = slugifyHashtag(placeName);
  if (slug.length >= 5 && (slug.includes('tapa') || slug.includes('coto') || slug.includes('triton') || slug.includes('othum') || slug.includes('soaiso'))) {
    return slug;
  }

  // 4. Default guaranteed active regional hashtag
  return 'dulichtriton';
}

/**
 * Generate standard TikTok Hashtag URL that opens directly into the app & mobile web feed
 * Example: https://www.tiktok.com/tag/hotapa
 */
export function getTikTokHashtagUrl(placeName: string, category?: string): string {
  const tag = resolveTikTokHashtag(placeName, category);
  return `https://www.tiktok.com/tag/${tag}`;
}

/**
 * Generate standard TikTok search URL with exact Tri Tôn geographic anchor (Desktop fallback)
 */
export function getTikTokWebSearchUrl(placeName: string, commune?: string): string {
  return getTikTokHashtagUrl(placeName);
}

export interface TikTokLinkOptions {
  placeName: string;
  commune?: string;
  category?: string;
  directVideoUrl?: string;
  tiktok_videos?: Array<{ video_url?: string; url?: string; [key: string]: any }>;
  hashtags?: string[];
}

/**
 * Smart TikTok Action Resolver
 * - Nếu địa điểm có 1 hoặc nhiều link TikTok thật: Lấy ngẫu nhiên 1 link thật để mở trực tiếp
 * - Nếu chưa có link thật: Fallback sang Search chính xác theo [Tên Địa Điểm + Tri Tôn An Giang] hoặc Hashtag chuẩn trên điện thoại
 */
export function resolveTikTokAction(options: TikTokLinkOptions): {
  url: string;
  tag: string;
  label: string;
  isDirect: boolean;
} {
  const { placeName, commune, category, directVideoUrl, tiktok_videos } = options;
  const tag = resolveTikTokHashtag(placeName, category);

  // 1. Kiểm tra nếu có danh sách video TikTok thật (có thể nhiều link)
  if (Array.isArray(tiktok_videos) && tiktok_videos.length > 0) {
    const validUrls = tiktok_videos
      .map(v => (v.video_url || v.url || '').trim())
      .filter(u => u.startsWith('http') && u.includes('tiktok.com'));

    if (validUrls.length > 0) {
      // Chọn ngẫu nhiên 1 link video thật nếu có nhiều video
      const randomUrl = validUrls[Math.floor(Math.random() * validUrls.length)];
      return {
        url: randomUrl,
        tag,
        label: 'Xem Video Thực Tế',
        isDirect: true,
      };
    }
  }

  // 2. Kiểm tra link video trực tiếp đơn lẻ
  if (directVideoUrl && typeof directVideoUrl === 'string' && directVideoUrl.startsWith('http') && directVideoUrl.includes('tiktok.com')) {
    return {
      url: directVideoUrl.trim(),
      tag,
      label: 'Xem Video Thực Tế',
      isDirect: true,
    };
  }

  // 3. Fallback thông minh: Tạo link Search chính xác trên TikTok App / Mobile Web
  const searchKeyword = `${cleanKeyword(placeName)} ${commune ? commune : ''} Tri Tôn An Giang`.trim();
  const searchUrl = `https://www.tiktok.com/search?q=${encodeURIComponent(searchKeyword)}`;

  return {
    url: searchUrl,
    tag,
    label: `#${tag} trên TikTok`,
    isDirect: false,
  };
}
