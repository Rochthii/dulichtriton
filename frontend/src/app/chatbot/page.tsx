'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ChatbotRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home and trigger chat widget popup
    router.replace('/');
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('triton:open-chat'));
      }
    }, 100);
  }, [router]);

  return (
    <div className="flex h-[100dvh] w-full items-center justify-center bg-[#FAF3E7] font-body text-[#26221B]">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 border-3 border-[#0E8C7F] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="font-bold text-sm">Đang mở Trợ Lý Du Lịch Tri Tôn AI...</p>
      </div>
    </div>
  );
}
