'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Route Error:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#FFFDF7] rounded-[28px] border border-[#26221B]/10 p-6 sm:p-8 shadow-lg text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-[#D9822B] flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h2 className="font-display font-black text-lg text-[#26221B]">
            Đang Đồng Bộ Dữ Liệu
          </h2>
          <p className="text-xs text-[#6B6355] leading-relaxed">
            Phiên làm việc vừa được cập nhật. Bạn vui lòng bấm nút bên dưới để tải tiếp nhé!
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
            className="flex-1 py-2.5 px-4 rounded-full bg-[#0E8C7F] hover:bg-[#0B6B60] text-white text-xs font-bold font-display flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Tải Lại</span>
          </button>

          <Link
            href="/"
            className="flex-1 py-2.5 px-4 rounded-full bg-[#FAF3E7] hover:bg-[#26221B]/10 text-[#26221B] text-xs font-bold font-display flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Trang Chủ</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
