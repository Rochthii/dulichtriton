import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PlaceCard from '@/components/PlaceCard';
import ChatbotWidget from '@/components/ChatbotWidget';
import { MapPin, Filter, Search } from 'lucide-react';
import { getPlacesByCommune } from '@/lib/places';

export const revalidate = 60; // Revalidate every 60 seconds (ISR)

export default async function PlacesPage({ searchParams }: { searchParams: Promise<{ commune?: string }> }) {
  const params = await searchParams;
  const selectedCommune = params?.commune || 'Tất cả';
  const communes = ['Tất cả', 'Xã Núi Tô', 'Xã Ô Lâm', 'Xã Lương Phi', 'Xã An Hảo', 'Xã Ba Chúc', 'Thị trấn Tri Tôn'];

  // Fetch real places dynamically from Supabase CSDL (0% hardcoded sample data)
  const places = await getPlacesByCommune(selectedCommune);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#1B4D3E] uppercase tracking-wider mb-1">
            <MapPin className="w-4 h-4 text-[#D99B26]" />
            <span>Khám Phá Địa Điểm Real Supabase DB</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            106 Danh Thắng & Di Tích Lịch Sử Tri Tôn
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Dữ liệu địa điểm đã xác minh tọa độ WGS84, hình ảnh sắc nét kèm nguồn trích dẫn & địa chỉ Ấp/Khóm/Đường thực tế.
          </p>
        </div>

        {/* Commune Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 mb-8 pb-4 border-b border-slate-200">
          <Filter className="w-4 h-4 text-slate-400 mr-2" />
          {communes.map((c, i) => (
            <a
              key={i}
              href={c === 'Tất cả' ? '/places' : `/places?commune=${encodeURIComponent(c)}`}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedCommune === c
                  ? 'bg-[#1B4D3E] text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:border-[#1B4D3E] hover:text-[#1B4D3E]'
              }`}
            >
              {c}
            </a>
          ))}
        </div>

        {/* Dynamic Places Grid */}
        {places.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {places.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center">
            <Search className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-800">Không tìm thấy địa điểm phù hợp</h3>
            <p className="text-xs text-slate-500 mt-1">Thử chọn xã/thị trấn khác hoặc xem toàn bộ địa điểm.</p>
          </div>
        )}

      </main>
      
      <ChatbotWidget />
      <Footer />
    </div>
  );
}
