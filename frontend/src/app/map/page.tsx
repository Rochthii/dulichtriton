import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Map, Navigation, MapPin } from 'lucide-react';

export default function MapPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center">
          <Map className="w-10 h-10 text-[#1B4D3E] mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-slate-900">Trang Bản Đồ GIS Tương Tác Bounding Box (Màn hình 09)</h1>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-2">
            Khung thư mục `src/app/map/` đã khởi tạo. Tích hợp PostGIS GiST Index WGS84 [10.25-10.55 lat, 104.85-105.15 lng] tính bán kính 5km.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
