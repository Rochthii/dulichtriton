import React from 'react';
import Link from 'next/link';
import { Compass, Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 bg-[#FAF3E7]">
      <div className="max-w-md w-full bg-[#FFFDF7] rounded-[28px] border border-[#26221B]/10 p-6 sm:p-8 shadow-lg text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-[#0E8C7F] flex items-center justify-center mx-auto">
          <Compass className="w-8 h-8 animate-spin-slow" />
        </div>

        <div className="space-y-2">
          <span className="text-4xl font-display font-black text-[#0E8C7F]">404</span>
          <h1 className="font-display font-black text-lg text-[#26221B]">
            Không Tìm Thấy Trang
          </h1>
          <p className="text-xs text-[#6B6355] leading-relaxed">
            Địa điểm hoặc trang bạn đang tìm kiếm có thể đã được cập nhật hoặc di chuyển sang mục khác.
          </p>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <Link
            href="/"
            className="flex-1 py-2.5 px-4 rounded-full bg-[#0E8C7F] hover:bg-[#0B6B60] text-white text-xs font-bold font-display flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Về Trang Chủ</span>
          </Link>

          <Link
            href="/places"
            className="flex-1 py-2.5 px-4 rounded-full bg-[#F0A32F] hover:bg-[#C97F1B] text-[#26221B] hover:text-white text-xs font-bold font-display flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Xem 149 Điểm</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
