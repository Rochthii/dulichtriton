import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: 'Trợ Lý AI Du Lịch Tri Tôn — Tư Vấn Lịch Trình & Hỏi Đáp Bảy Núi 24/7',
  description: 'Trò chuyện cùng Trợ lý AI bản địa: Hỏi đường đi, tìm quán gà đốt ngon nhất, gợi ý lịch trình cá nhân hóa và giải đáp mọi thắc mắc du lịch Tri Tôn theo thời gian thực.',
  keywords: [
    'chatbot du lịch tri tôn', 'trợ lý ai bảy núi', 'hỏi đáp du lịch tri tôn',
    'tư vấn du lịch an giang', 'ai du lịch'
  ],
  alternates: {
    canonical: `${SITE_URL}/chatbot`,
  },
  openGraph: {
    title: 'Trợ Lý AI Du Lịch Tri Tôn — Người Bạn Đồng Hành Bảy Núi',
    description: 'Hỏi đáp thông minh về địa điểm, quán ăn ngon và đường đi phượt an toàn tại Tri Tôn, An Giang.',
    url: `${SITE_URL}/chatbot`,
    siteName: 'Du Lịch Tri Tôn AI',
    locale: 'vi_VN',
    type: 'website',
  },
};

export default function ChatbotLayout({ children }: { children: React.ReactNode }) {
  return children;
}
