import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Utensils, Phone, MapPin, Clock } from 'lucide-react';

export default function FoodPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center">
          <Utensils className="w-10 h-10 text-[#D99B26] mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-slate-900">Trang Đặc Sản Ẩm Thực & Đặt Món Bản Địa (Màn hình 04)</h1>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-2">
            Khung thư mục `src/app/food/` đã được khởi tạo. Nơi giới thiệu Gà Đốt Ô Thum, Bún nước lèo, Bánh xèo thốt nốt & Nút Gọi đặt bàn trước 40 phút.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
