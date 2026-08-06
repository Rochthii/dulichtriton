import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Landmark, ShieldCheck, Heart } from 'lucide-react';

export default function CulturePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center">
          <Landmark className="w-10 h-10 text-[#1B4D3E] mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-slate-900">Trang Văn Hóa Khmer & Lễ Hội Bảy Núi (Màn hình 08)</h1>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-2">
            Khung thư mục `src/app/culture/` đã khởi tạo. Giới thiệu Lễ hội Đua bò Chùa Rô, Chùa Tà Pạ, Chùa Svay Ton & Quy tắc ứng xử Chùa cổ.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
