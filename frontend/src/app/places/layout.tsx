import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: 'Địa Điểm Du Lịch Tri Tôn — Danh Thắng, Check-in & Điểm Đến Thực Địa',
  description: 'Tra cứu danh mục điểm đến tại Tri Tôn, An Giang: Hồ Tà Pạ, Núi Cô Tô, Đồi Tức Dụp, Cổng Trời Tri Tôn, Hàng Thốt Nốt Trái Tim, Chùa Khmer cổ và tọa độ GPS tham khảo.',
  keywords: [
    'địa điểm du lịch tri tôn', 'điểm check in tri tôn', 'hồ tà pạ', 'núi cô tô',
    'đồi tức dụp', 'cổng trời tri tôn', 'thốt nốt trái tim', 'du lịch an giang',
    'danh thắng bảy núi', 'điểm phượt tri tôn'
  ],
  alternates: {
    canonical: `${SITE_URL}/places`,
  },
  openGraph: {
    title: 'Địa Điểm Du Lịch Tri Tôn — Bản Đồ & Điểm Đến Thực Địa 2026',
    description: 'Khám phá danh mục điểm đến tham khảo tại vùng Bảy Núi Tri Tôn: Danh lam thắng cảnh, check-in, ẩm thực và văn hóa Khmer.',
    url: `${SITE_URL}/places`,
    siteName: 'Du Lịch Tri Tôn AI',
    images: [
      {
        url: 'https://res.cloudinary.com/dhjesnejt/image/upload/f_auto,q_auto:best,w_1200,c_fill/v1786758888/tri_ton_hero/hero_ho_ta_pa.avif',
        width: 1200,
        height: 630,
        alt: 'Địa Điểm Du Lịch Tri Tôn An Giang',
      },
    ],
    locale: 'vi_VN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Địa Điểm Du Lịch Tri Tôn',
    description: 'Cẩm nang tra cứu các danh thắng và tọa độ check-in đẹp nhất Tri Tôn, An Giang.',
  },
};

export default function PlacesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
