/**
 * CẤU HÌNH TẬP TRUNG TOÀN HỆ THỐNG (SINGLE SOURCE OF TRUTH)
 * ─────────────────────────────────────────────────────────────
 * Mọi URL, Domain, Thẻ xác minh SEO, Branding của hệ thống
 * được quản lý duy nhất tại tệp này.
 *
 * 👉 KHI MUA TÊN MIỀN MỚI (ví dụ dulichtriton.vn / dulichtriton.com):
 * Chỉ cần đổi DEFAULT_DOMAIN bên dưới HOẶC cài biến NEXT_PUBLIC_SITE_URL trên Vercel.
 */

const DEFAULT_DOMAIN = 'https://dulichtriton.vercel.app';

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_DOMAIN
).replace(/\/+$/, '');

export const SITE_CONFIG = {
  name: 'Du Lịch Tri Tôn AI — Nền Tảng Du Lịch Thông Minh Vùng Bảy Núi',
  shortName: 'Du Lịch Tri Tôn',
  tagline: 'Khám Phá Kỳ Quan Vùng Bảy Núi An Giang',
  description: 'Cẩm nang du lịch Tri Tôn, An Giang: 149 địa điểm xác minh thực tế, ẩm thực Gà Đốt Ô Thum, di sản Khmer và bản đồ tương tác thông minh.',
  url: SITE_URL,
  ogImage: 'https://res.cloudinary.com/dhjesnejt/image/upload/f_auto,q_auto:best,w_1600,c_fill/v1786758888/tri_ton_hero/hero_ho_ta_pa.avif',
  icon: `${SITE_URL}/icon.png`,
  themeColor: '#0E8C7F',
  googleVerification: 'googleb86c8a47cc2c384e',
  social: {
    facebook: 'https://www.facebook.com/dulichtriton',
    tiktok: 'https://www.tiktok.com/@dulichtriton',
  },
  geo: {
    region: 'VN-44', // An Giang
    placename: 'Tri Tôn, An Giang, Việt Nam',
    latitude: 10.3996,
    longitude: 104.9783,
  },
} as const;

/**
 * Helper sinh URL tuyệt đối chuẩn SEO cho toàn bộ trang
 */
export function getAbsoluteUrl(path: string = ''): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${cleanPath}`;
}
