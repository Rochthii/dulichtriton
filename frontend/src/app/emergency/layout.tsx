import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: 'Cứu Hộ Khẩn Cấp & SOS Tri Tôn 24/7 — Y Tế, Công An & Cứu Hộ Xe Phượt',
  description: 'Danh bạ đường dây nóng hỗ trợ khẩn cấp tại huyện Tri Tôn, An Giang: Công an huyện, Trung tâm y tế, Bệnh viện đa khoa, Cứu hộ giao thông và hotline hỗ trợ du khách 24/7.',
  keywords: [
    'cứu hộ tri tôn', 'sos tri tôn', 'hotline công an tri tôn', 'bệnh viện tri tôn',
    'cứu hộ xe máy bảy núi', 'hỗ trợ du khách tri tôn'
  ],
  alternates: {
    canonical: `${SITE_URL}/emergency`,
  },
  openGraph: {
    title: 'Cứu Hộ Khẩn Cấp & Hotline Hỗ Trợ Du Khách Tri Tôn 24/7',
    description: 'Thông tin liên hệ y tế, công an và đội ngũ cứu hộ phượt khẩn cấp trên địa bàn huyện Tri Tôn.',
    url: `${SITE_URL}/emergency`,
    siteName: 'Du Lịch Tri Tôn AI',
    locale: 'vi_VN',
    type: 'website',
  },
};

export default function EmergencyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
