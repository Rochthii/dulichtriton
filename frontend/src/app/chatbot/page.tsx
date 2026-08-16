'use client';

import React from 'react';
import dynamicImport from 'next/dynamic';

const ChatbotPageClient = dynamicImport(
  () => import('@/components/ChatbotPageClient'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[100dvh] w-full items-center justify-center bg-[#FAF3E7] font-body text-[#26221B]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-[#0E8C7F] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-bold text-sm">Đang tải Trợ Lý Du Lịch Tri Tôn AI...</p>
        </div>
      </div>
    ),
  }
);

export default function ChatbotPage() {
  return <ChatbotPageClient />;
}
