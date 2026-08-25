import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: 'Bản Đồ Du Lịch Số GIS Tri Tôn — Định Vị GPS Thực Địa',
  description: 'Bản đồ tương tác GIS thông minh địa điểm Tri Tôn, An Giang: Phân loại theo 15 xã/thị trấn, lọc danh lam thắng cảnh, quán gà đốt, chùa Khmer, homestay và chỉ đường GPS.',
  keywords: [
    'bản đồ du lịch tri tôn', 'bản đồ tri tôn gis', 'định vị du lịch tri tôn',
    'bản đồ thất sơn', 'tọa độ hồ tà pạ', 'chỉ đường tri tôn', 'gps bảy núi'
  ],
  alternates: {
    canonical: `${SITE_URL}/map`,
  },
  openGraph: {
    title: 'Bản Đồ Du Lịch Số GIS Tri Tôn — Định Vị GPS Thực Địa',
    description: 'Bản đồ số du lịch Bảy Núi: Tra cứu vị trí, tìm quán ăn gần nhất, dẫn đường GPS chính xác 100%.',
    url: `${SITE_URL}/map`,
    siteName: 'Du Lịch Tri Tôn AI',
    images: [
      {
        url: 'https://res.cloudinary.com/dhjesnejt/image/upload/f_auto,q_auto:best,w_1200,c_fill/v1786758888/tri_ton_hero/hero_ho_ta_pa.avif',
        width: 1200,
        height: 630,
        alt: 'Bản Đồ Du Lịch Số GIS Tri Tôn',
      },
    ],
    locale: 'vi_VN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bản Đồ Số Du Lịch Tri Tôn',
    description: 'Định vị GPS các điểm tham quan và ẩm thực đặc sản Bảy Núi, An Giang.',
  },
};

export default function MapLayout({ children }: { children: React.ReactNode }) {
  return children;
}
