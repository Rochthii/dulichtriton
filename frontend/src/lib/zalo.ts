/**
 * ZALO MINI APP & OPEN PLATFORM SDK WRAPPER
 * ─────────────────────────────────────────────────────────────
 * Bộ tiện ích hỗ trợ tích hợp sâu Hệ sinh thái Zalo:
 * - Nhận diện môi trường Zalo Client / Zalo Mini App
 * - Lấy tọa độ GPS người dùng thời gian thực (ZMP Geolocation)
 * - Chia sẻ Lịch trình vào Nhóm Chat Zalo (ZMP Share Sheet)
 * - Kết nối trực tiếp 1-chạm với Chủ quán / Homestay tại Tri Tôn
 */

import { SITE_CONFIG, SITE_URL } from '@/lib/siteConfig';

declare global {
  interface Window {
    ZMP?: any;
  }
}

/**
 * Kiểm tra xem người dùng có đang truy cập từ bên trong ứng dụng Zalo hay không
 */
export function isZaloEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  const userAgent = navigator.userAgent || navigator.vendor || '';
  return /zalo/i.test(userAgent) || Boolean(window.ZMP);
}

/**
 * Lấy tọa độ GPS thời gian thực của du khách
 * Ưu tiên gọi Zalo SDK getLocation, fallback sang Web Geolocation API
 */
export async function getTouristLocation(): Promise<{ latitude: number; longitude: number } | null> {
  if (typeof window === 'undefined') return null;

  // 1. Nếu đang ở môi trường Zalo Mini App và SDK sẵn sàng
  if (window.ZMP?.getLocation) {
    return new Promise((resolve) => {
      try {
        window.ZMP.getLocation({
          success: (data: { latitude: number; longitude: number }) => {
            if (data?.latitude && data?.longitude) {
              resolve({ latitude: data.latitude, longitude: data.longitude });
            } else {
              resolve(null);
            }
          },
          fail: (err: any) => {
            console.warn('[Zalo SDK] Không lấy được GPS ZMP, fallback Web GPS:', err);
            resolve(getBrowserLocation());
          },
        });
      } catch (e) {
        console.warn('[Zalo SDK] Exception getLocation:', e);
        resolve(getBrowserLocation());
      }
    });
  }

  // 2. Fallback sang Web Geolocation API tiêu chuẩn
  return getBrowserLocation();
}

function getBrowserLocation(): Promise<{ latitude: number; longitude: number } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      (err) => {
        console.warn('[Web Geolocation] Lỗi định vị:', err.message);
        resolve(null);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  });
}

/**
 * Chia sẻ Lịch trình hoặc Địa điểm vào Nhóm Chat Zalo
 */
export async function shareToZalo(options: {
  title: string;
  description: string;
  url?: string;
  thumbnail?: string;
}): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  const targetUrl = options.url || SITE_URL;
  const targetThumb = options.thumbnail || SITE_CONFIG.ogImage;

  // 1. Zalo SDK Native Share Sheet
  if (window.ZMP?.openShareSheet) {
    try {
      window.ZMP.openShareSheet({
        type: 'link',
        data: {
          title: options.title,
          description: options.description,
          thumbnail: targetThumb,
          link: targetUrl,
        },
        success: () => true,
        fail: (err: any) => {
          console.warn('[Zalo SDK] openShareSheet failed:', err);
          fallbackShare(options.title, targetUrl);
        },
      });
      return true;
    } catch (e) {
      console.warn('[Zalo SDK] openShareSheet exception:', e);
    }
  }

  // 2. Fallback Web Share API hoặc Mở Web Zalo Share link
  return fallbackShare(options.title, targetUrl);
}

function fallbackShare(title: string, url: string): boolean {
  if (typeof window === 'undefined') return false;
  if (navigator.share) {
    navigator.share({ title, url }).catch(() => {});
    return true;
  }
  // Mở popup Zalo Share web protocol
  const zaloShareUrl = `https://zalo.me/share?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;
  window.open(zaloShareUrl, '_blank', 'noopener,noreferrer');
  return true;
}

/**
 * Mở khung chat Zalo trực tiếp với Chủ quán / Homestay tại Tri Tôn
 */
export function openZaloChatWithHost(phoneNumber: string, defaultMessage: string = ''): void {
  if (typeof window === 'undefined') return;
  // Làm sạch số điện thoại (bỏ khoảng trắng, dấu gạch ngang)
  const cleanPhone = phoneNumber.replace(/[^0-9+]/g, '').replace(/^(\+84|84)/, '0');
  
  if (!cleanPhone) return;

  const directUrl = `https://zalo.me/${cleanPhone}`;
  window.open(directUrl, '_blank', 'noopener,noreferrer');
}
