import { MISSING_PLACE_IMAGE } from './publicPlacePresentation';

/**
 * Utility to generate high-resolution, Retina-ready (2x/3x DPR) optimized image URLs
 * across Cloudinary, Unsplash, and local image assets.
 */

export function getOptimizedImageUrl(
  url?: string | null,
  options: {
    width?: number;
    height?: number;
    quality?: 'auto' | 'best' | number;
    dpr?: number;
    format?: 'auto' | 'webp' | 'avif';
    crop?: 'fill' | 'limit' | 'scale';
  } = {}
): string {
  if (!url || typeof url !== 'string') {
    return MISSING_PLACE_IMAGE;
  }

  const {
    width = 1200,
    height,
    quality = 'best',
    dpr = 2,
    format = 'auto',
    crop = 'fill',
  } = options;

  // 1. Cloudinary URL optimization
  if (url.includes('res.cloudinary.com')) {
    // Check if already transformed
    if (url.includes('/image/upload/') && !url.includes('/f_auto,')) {
      const qParam = typeof quality === 'number' ? `q_${quality}` : `q_auto:${quality}`;
      const hParam = height ? `,h_${height}` : '';
      const transforms = `f_${format},${qParam},dpr_${dpr}.0,w_${width}${hParam},c_${crop},g_auto`;
      return url.replace('/image/upload/', `/image/upload/${transforms}/`);
    }
    return url;
  }

  // 2. Unsplash URL optimization
  if (url.includes('images.unsplash.com')) {
    try {
      const u = new URL(url);
      u.searchParams.set('auto', 'format');
      u.searchParams.set('fit', 'crop');
      u.searchParams.set('q', typeof quality === 'number' ? quality.toString() : '85');
      u.searchParams.set('w', width.toString());
      if (height) u.searchParams.set('h', height.toString());
      u.searchParams.set('dpr', dpr.toString());
      return u.toString();
    } catch {
      return url;
    }
  }

  // 3. Other remote or local URLs
  return url;
}
