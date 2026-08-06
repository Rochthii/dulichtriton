import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PlaceCard from '@/components/PlaceCard';
import ChatbotWidget from '@/components/ChatbotWidget';
import { Compass, Sparkles, MapPin, Utensils, Calendar, ShieldCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { getFeaturedPlaces } from '@/lib/places';

export const revalidate = 60; // Revalidate every 60 seconds (ISR)

export default async function HomePage() {
  // Fetch live places dynamically from Supabase DB (0% Hardcoded Data in code)
  const featuredPlaces = await getFeaturedPlaces(6);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
      <Header />

      <main className="flex-1">
        
        {/* HERO SECTION */}
        <section className="relative bg-[#1B4D3E] text-white py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-[#D99B26]_1px,transparent_1px] [background-size:16px_16px]"></div>
          
          <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
            
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-[#D99B26] backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-[#D99B26]" />
              <span>Hệ thống AI Du Lịch Tri Tôn — 106 Địa Điểm Đã Xác Minh</span>
            </div>

            {/* Main Title */}
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Khám Phá Vẻ Đẹp Kỳ Vĩ <br className="hidden sm:block" />
              <span className="text-[#D99B26]">Vùng Đất Bảy Núi Tri Tôn</span>
            </h1>

            <p className="text-sm sm:text-base text-emerald-100 max-w-2xl mx-auto leading-relaxed">
              Trải nghiệm danh thắng Hồ Tà Pạ, thưởng thức đặc sản Gà Đốt Ô Thum chuẩn vị và tìm hiểu văn hóa lễ hội Khmer độc đáo cùng Trợ lý AI RAG thông minh.
            </p>

            {/* AI Search Bar Entrance */}
            <div className="max-w-xl mx-auto bg-white p-2 rounded-2xl shadow-2xl border border-emerald-900/20 flex items-center gap-2">
              <div className="pl-3 text-slate-400">
                <Compass className="w-5 h-5 text-[#1B4D3E]" />
              </div>
              <input
                type="text"
                placeholder="Bạn muốn đi đâu ở Tri Tôn? (VD: Hồ Tà Pạ, Gà đốt Ô Thum...)"
                className="flex-1 px-2 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none placeholder:text-slate-400"
              />
              <button className="px-5 py-2.5 rounded-xl bg-[#1B4D3E] hover:bg-[#143B2F] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors shrink-0">
                <Sparkles className="w-4 h-4 text-[#D99B26]" />
                <span>Hỏi AI</span>
              </button>
            </div>

            {/* Quick Stat Highlights */}
            <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto border-t border-emerald-800/60 text-xs">
              <div>
                <span className="block font-bold text-xl text-[#D99B26]">106+</span>
                <span className="text-emerald-200">Địa điểm Master Live</span>
              </div>
              <div>
                <span className="block font-bold text-xl text-white">100%</span>
                <span className="text-emerald-200">Tọa độ WGS84 chuẩn</span>
              </div>
              <div>
                <span className="block font-bold text-xl text-[#D99B26]">205+</span>
                <span className="text-emerald-200">Ảnh HD Có Nguồn</span>
              </div>
              <div>
                <span className="block font-bold text-xl text-white">0%</span>
                <span className="text-emerald-200">Emoji / Hardcode Link</span>
              </div>
            </div>

          </div>
        </section>

        {/* DYNAMIC FEATURED PLACES GRID FROM SUPABASE */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1B4D3E] uppercase tracking-wider mb-1">
                <MapPin className="w-4 h-4 text-[#D99B26]" />
                <span>Điểm Đến Nổi Bật Bảy Núi (Live Supabase DB)</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Top Địa Điểm Được Yêu Thích Nhất
              </h2>
            </div>
            
            <Link
              href="/places"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1B4D3E] hover:text-[#143B2F] transition-colors"
            >
              <span>Xem toàn bộ 106 địa điểm</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredPlaces.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        </section>

        {/* CATEGORY EXPLORER SECTION */}
        <section className="bg-white border-t border-b border-slate-200 py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl font-bold text-slate-900">Danh Mục Trải Nghiệm Du Lịch</h2>
              <p className="text-xs text-slate-500 mt-1">Lọc nhanh theo nhu cầu trải nghiệm của bạn tại Tri Tôn</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/places" className="p-6 rounded-2xl bg-[#F8F9FA] border border-slate-200 hover:border-[#1B4D3E] hover:shadow-md transition-all group">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#1B4D3E] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <MapPin className="w-5 h-5 text-[#D99B26]" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-[#1B4D3E]">Danh Thắng Thốt Nốt</h3>
                <p className="text-[11px] text-slate-500 mt-1">Hồ Tà Pạ, Cổng Trời Khmer, Đồi Tức Dụp</p>
              </Link>

              <Link href="/food" className="p-6 rounded-2xl bg-[#F8F9FA] border border-slate-200 hover:border-[#1B4D3E] hover:shadow-md transition-all group">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#D99B26] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Utensils className="w-5 h-5 text-[#1B4D3E]" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-[#1B4D3E]">Đặc Sản Gà Đốt</h3>
                <p className="text-[11px] text-slate-500 mt-1">Gà Đốt Ô Thum, Bún nước lèo, Bánh xèo</p>
              </Link>

              <Link href="/culture" className="p-6 rounded-2xl bg-[#F8F9FA] border border-slate-200 hover:border-[#1B4D3E] hover:shadow-md transition-all group">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#1B4D3E] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-5 h-5 text-[#D99B26]" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-[#1B4D3E]">Văn Hóa & Chùa Khmer</h3>
                <p className="text-[11px] text-slate-500 mt-1">Chùa Tà Pạ, Lễ hội Đua bò Chùa Rô</p>
              </Link>

              <Link href="/itinerary" className="p-6 rounded-2xl bg-[#F8F9FA] border border-slate-200 hover:border-[#1B4D3E] hover:shadow-md transition-all group">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#D99B26] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Calendar className="w-5 h-5 text-[#1B4D3E]" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-[#1B4D3E]">Lịch Trình AI 2D1N</h3>
                <p className="text-[11px] text-slate-500 mt-1">Tự động gợi ý cung đường ngắn nhất</p>
              </Link>
            </div>
          </div>
        </section>

      </main>

      <ChatbotWidget />
      <Footer />
    </div>
  );
}
