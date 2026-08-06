import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Compass, Car, Navigation, HelpCircle } from 'lucide-react';

export default function GuidePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center">
          <Compass className="w-10 h-10 text-[#D99B26] mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-slate-900">Trang Thông Tin Di Chuyển & Cẩm Nang Du Lịch (Màn hình 10)</h1>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-2">
            Khung thư mục `src/app/guide/` đã khởi tạo. Hướng dẫn di chuyển xe khách Sài Gòn - Tri Tôn, điểm thuê xe máy & Cẩm nang mùa nước nổi.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
