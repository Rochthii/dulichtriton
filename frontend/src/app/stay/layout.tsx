import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: 'Lưu Trú & Homestay Tri Tôn — Khách Sạn, Nhà Nghỉ & Điểm Cắm Trại Bảy Núi',
  description: 'Danh sách homestay view núi Cô Tô, khách sạn trung tâm thị trấn Tri Tôn & Ba Chúc, nhà nghỉ giá tốt và địa điểm cắm trại an toàn dưới chân núi Tà Pạ.',
  keywords: [
    'homestay tri tôn', 'khách sạn tri tôn', 'nhà nghỉ tri tôn', 'cắm trại núi cô tô',
    'chỗ ở tri tôn an giang', 'homestay bảy núi', 'khách sạn ba chúc'
  ],
  alternates: {
    canonical: `${SITE_URL}/stay`,
  },
  openGraph: {
    title: 'Lưu Trú & Homestay Tri Tôn — Khách Sạn & Nhà Nghỉ Bảy Núi',
    description: 'Tìm kiếm homestay yên bình, khách sạn tiện nghi và điểm cắm trại lý tưởng tại huyện Tri Tôn, An Giang.',
    url: `${SITE_URL}/stay`,
    siteName: 'Du Lịch Tri Tôn AI',
    images: [
      {
        url: 'https://res.cloudinary.com/dhjesnejt/image/upload/f_auto,q_auto:best,w_1200,c_fill/v1786758888/tri_ton_hero/hero_ho_ta_pa.avif',
        width: 1200,
        height: 630,
        alt: 'Lưu Trú Homestay Tri Tôn',
      },
    ],
    locale: 'vi_VN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lưu Trú & Homestay Tri Tôn',
    description: 'Cẩm nang chọn homestay view đẹp và khách sạn uy tín tại vùng Bảy Núi Tri Tôn.',
  },
};

export default function StayLayout({ children }: { children: React.ReactNode }) {
  return children;
}
