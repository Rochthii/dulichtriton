import React, { Suspense } from 'react';
import ChatbotPageClient from '@/components/ChatbotPageClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Trợ Lý AI Du Lịch Tri Tôn 2026 • Lập Kế Hoạch & Hỏi Đáp Bảy Núi',
  description: 'Trợ lý AI hướng dẫn du lịch Tri Tôn, An Giang: Lập sơ đồ lịch trình thực địa 27 tour, tư vấn chùa Khmer, quán ăn ngon, lễ hội và bản đồ dẫn đường GPS.',
};

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[100dvh] w-full items-center justify-center bg-[#FAF3E7] font-body text-[#26221B]">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-3 border-[#0E8C7F] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="font-bold text-sm text-[#0E8C7F]">Đang tải Trợ Lý Du Lịch Tri Tôn AI...</p>
          </div>
        </div>
      }
    >
      <ChatbotPageClient />
    </Suspense>
  );
}
