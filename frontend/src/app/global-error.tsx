'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Next.js Global Root Error:', error);
  }, [error]);

  return (
    <html lang="vi">
      <body className="min-h-screen bg-[#FAF3E7] text-[#26221B] font-body flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#FFFDF7] rounded-[28px] border border-[#26221B]/10 p-6 sm:p-8 shadow-xl text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h1 className="font-display font-black text-xl text-[#26221B]">
              Đang Tải Lại Trang...
            </h1>
            <p className="text-xs sm:text-sm text-[#6B6355] leading-relaxed">
              Hệ thống đang đồng bộ dữ liệu thực địa mới nhất. Vui lòng bấm thử lại hoặc quay về trang chủ.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.reload();
                } else {
                  reset();
                }
              }}
              className="flex-1 py-3 px-4 rounded-full bg-[#0E8C7F] hover:bg-[#0B6B60] text-white text-xs font-bold font-display flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Thử Lại Ngay</span>
            </button>

            <Link
              href="/"
              className="flex-1 py-3 px-4 rounded-full bg-[#FAF3E7] hover:bg-[#26221B]/10 text-[#26221B] text-xs font-bold font-display flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Trang Chủ</span>
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
