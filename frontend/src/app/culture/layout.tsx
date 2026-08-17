import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: 'Di Sản & Văn Hóa Khmer Bảy Núi — Chùa Cổ, Lễ Hội & Kinh Lá Buông',
  description: 'Tìm hiểu nét đẹp tâm linh và văn hóa Khmer Nam Bộ tại Tri Tôn: Chùa Xà Tón, Chùa Tà Pạ, Lễ hội Đua Bò Bảy Núi, Lễ Sen Dolta, Chôl Chnăm Thmây và nghệ thuật Kinh Lá Buông độc bản.',
  keywords: [
    'văn hóa khmer tri tôn', 'chùa khmer tri tôn', 'chùa xà tón', 'chùa tà pạ',
    'lễ hội đua bò bảy núi', 'lễ sen dolta', 'kinh lá buông', 'chôl chnăm thmây',
    'di sản bảy núi', 'chùa svay ton', 'văn hóa an giang'
  ],
  alternates: {
    canonical: `${SITE_URL}/culture`,
  },
  openGraph: {
    title: 'Di Sản & Văn Hóa Khmer Bảy Núi — Tri Tôn, An Giang',
    description: 'Chiêm bái những ngôi chùa Khmer hàng trăm năm tuổi, di sản Kinh Lá Buông và không khí rộn ràng của Lễ hội Đua Bò Thất Sơn.',
    url: `${SITE_URL}/culture`,
    siteName: 'Du Lịch Tri Tôn AI',
    images: [
      {
        url: 'https://res.cloudinary.com/dhjesnejt/image/upload/f_auto,q_auto:best,w_1200,c_fill/v1786758888/tri_ton_hero/hero_ho_ta_pa.avif',
        width: 1200,
        height: 630,
        alt: 'Văn Hóa Khmer Tri Tôn An Giang',
      },
    ],
    locale: 'vi_VN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Di Sản & Văn Hóa Khmer Tri Tôn',
    description: 'Khám phá chùa cổ trăm năm và lễ hội đua bò Bảy Núi độc đáo tại An Giang.',
  },
};

export default function CultureLayout({ children }: { children: React.ReactNode }) {
  return children;
}
