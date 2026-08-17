import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: 'Lập Lịch Trình Du Lịch Tri Tôn AI — 35 Tour Tối Ưu Khoảng Cách & Chi Phí',
  description: 'Tự động tạo lịch trình du lịch Tri Tôn theo sở thích: Tour 1 ngày kinh điển, Tour phượt săn mây Cô Tô 2N1Đ, Tour tâm linh chùa Khmer, Tour ẩm thực Gà Đốt Ô Thum kèm xuất mã QR offline.',
  keywords: [
    'lịch trình du lịch tri tôn', 'lập tour tri tôn ai', 'tour tri tôn 1 ngày',
    'lịch trình phượt tri tôn 2 ngày 1 đêm', 'chi phí du lịch tri tôn', 'tour bảy núi an giang'
  ],
  alternates: {
    canonical: `${SITE_URL}/planner`,
  },
  openGraph: {
    title: 'Lập Lịch Trình Du Lịch Tri Tôn AI — Tour Tối Ưu Tọa Độ WGS84',
    description: 'Trợ lý AI tự động lên lịch trình du lịch Tri Tôn chuẩn xác từng km, gợi ý điểm dừng chân và dự toán ngân sách chi tiết.',
    url: `${SITE_URL}/planner`,
    siteName: 'Du Lịch Tri Tôn AI',
    images: [
      {
        url: 'https://res.cloudinary.com/dhjesnejt/image/upload/f_auto,q_auto:best,w_1200,c_fill/v1786758888/tri_ton_hero/hero_ho_ta_pa.avif',
        width: 1200,
        height: 630,
        alt: 'Lập Lịch Trình Du Lịch Tri Tôn AI',
      },
    ],
    locale: 'vi_VN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lập Lịch Trình Du Lịch Tri Tôn AI',
    description: 'Tạo tour du lịch Tri Tôn 1 ngày hoặc 2 ngày 1 đêm tối ưu cung đường chỉ trong 3 giây.',
  },
};

export default function PlannerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
