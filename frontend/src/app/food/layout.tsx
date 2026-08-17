import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: 'Ẩm Thực Tri Tôn — Gà Đốt Ô Thum, Bò 7 Món & Đặc Sản Bảy Núi',
  description: 'Khám phá thiên đường ẩm thực Tri Tôn: Gà đốt lá chúc Ô Thum, Bò 7 món Ba Chúc, Bánh bò thốt nốt nướng lá chuối, Đu đủ đâm, Bún cá Châu Lăng và ẩm thực đêm Bảy Núi.',
  keywords: [
    'gà đốt ô thum', 'ẩm thực tri tôn', 'đặc sản tri tôn', 'bò 7 món ba chúc',
    'bánh bò thốt nốt', 'đu đủ đâm tri tôn', 'cháo bò tri tôn', 'quán ăn tri tôn ngon',
    'lá chúc thất sơn', 'đặc sản an giang', 'món ngon bảy núi', 'gà đốt lá chúc'
  ],
  alternates: {
    canonical: `${SITE_URL}/food`,
  },
  openGraph: {
    title: 'Ẩm Thực Tri Tôn — Gà Đốt Ô Thum, Bò 7 Món & Đặc Sản Bảy Núi',
    description: 'Thưởng thức ẩm thực trứ danh vùng Bảy Núi An Giang: Gà đốt lá chúc Ô Thum, Bò 7 món, Bánh canh Vĩnh Trung và đặc sản thốt nốt.',
    url: `${SITE_URL}/food`,
    siteName: 'Du Lịch Tri Tôn AI',
    images: [
      {
        url: 'https://res.cloudinary.com/dhjesnejt/image/upload/f_auto,q_auto:best,w_1200,c_fill/v1786758888/tri_ton_hero/hero_ho_ta_pa.avif',
        width: 1200,
        height: 630,
        alt: 'Ẩm Thực Đặc Sản Tri Tôn An Giang',
      },
    ],
    locale: 'vi_VN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ẩm Thực Tri Tôn — Đặc Sản Bảy Núi',
    description: 'Khám phá gà đốt Ô Thum, bò 7 món và bánh bò thốt nốt trứ danh Tri Tôn, An Giang.',
  },
};

export default function FoodLayout({ children }: { children: React.ReactNode }) {
  return children;
}
