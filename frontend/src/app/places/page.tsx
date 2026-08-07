import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PlaceCard from '@/components/PlaceCard';
import ChatbotWidget from '@/components/ChatbotWidget';
import { 
  MapPin, Search, Compass, Sparkles, SlidersHorizontal, 
  CheckCircle2, Mountain, Camera, Landmark, Utensils, Home, X, Map
} from 'lucide-react';
import Link from 'next/link';
import { getPlacesFiltered } from '@/lib/places';

export const revalidate = 60; // Revalidate every 60 seconds (ISR)

interface PlacesPageProps {
  searchParams: Promise<{
    commune?: string;
    category?: string;
    q?: string;
  }>;
}

export default async function PlacesPage({ searchParams }: PlacesPageProps) {
  const params = await searchParams;
  const selectedCommune = params?.commune || 'Tất cả';
  const selectedCategory = params?.category || 'Tất cả';
  const searchQuery = params?.q || '';

  const communes = [
    'Tất cả',
    'Thị trấn Tri Tôn',
    'Thị trấn Ba Chúc',
    'Xã Núi Tô',
    'Xã Chau Lăng',
    'Xã An Tức',
    'Xã Ô Lâm',
    'Xã Lương Phi',
    'Xã An Hảo',
    'Xã Tà Đảnh',
    'Xã Lê Trì'
  ];

  const categories = [
    { key: 'Tất cả', label: 'Tất cả danh mục', icon: Compass },
    { key: 'attractions_nature', label: 'Danh thắng Thiên nhiên', icon: Mountain },
    { key: 'checkin_spots', label: 'Điểm Check-in', icon: Camera },
    { key: 'khmer_pagodas_heritage', label: 'Chùa Khmer & Di tích', icon: Landmark },
    { key: 'food_and_restaurants', label: 'Ẩm thực & Quán ăn', icon: Utensils },
    { key: 'cafes_and_homestays', label: 'Homestay & Lưu trú', icon: Home },
  ];

  // Fetch real places dynamically from Supabase DB (0% Hardcoded data)
  let places = await getPlacesFiltered(selectedCommune, selectedCategory);

  // Client search query filter if provided
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    places = places.filter(
      p => p.name.toLowerCase().includes(q) || (p.address && p.address.toLowerCase().includes(q))
    );
  }

  const hasActiveFilters = selectedCommune !== 'Tất cả' || selectedCategory !== 'Tất cả' || searchQuery !== '';

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-slate-900 font-sans selection:bg-[#D99B26] selection:text-slate-900">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* HERO BANNER SECTION */}
        <div className="bg-[#1B4D3E] text-white p-6 sm:p-10 rounded-3xl mb-8 shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D99B26_1px,transparent_1px)] [background-size:16px_16px]"></div>
          
          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#D99B26] uppercase tracking-wider">
              <Compass className="w-4 h-4 text-[#D99B26]" />
              <span>Khám Phá Địa Điểm — CSDL Supabase Realtime</span>
            </div>
            
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Danh Thắng & Di Tích Bản Địa Tri Tôn
            </h1>
            
            <p className="text-xs sm:text-sm text-emerald-100 max-w-3xl leading-relaxed">
              Dữ liệu địa điểm đã xác minh tọa độ WGS84 chuẩn, có hình ảnh chất lượng cao kèm trích dẫn nguồn minh bạch và liên kết chỉ đường Google Maps trực tiếp.
            </p>

            {/* Live Counter Badge */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 text-xs font-semibold text-white border border-white/20 backdrop-blur-md">
                <CheckCircle2 className="w-4 h-4 text-[#D99B26]" />
                <span>Hiển thị <strong className="text-[#D99B26]">{places.length}</strong> địa điểm phù hợp</span>
              </div>

              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 text-xs font-semibold text-emerald-100 border border-white/10 backdrop-blur-md">
                <Map className="w-4 h-4 text-[#D99B26]" />
                <span>11 Xã & Thị Trấn Bản Địa</span>
              </div>
            </div>
          </div>
        </div>

        {/* SEARCH & FILTER SECTION CONTAINER */}
        <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 shadow-sm mb-8 space-y-6">
          
          {/* Top Search Input Bar */}
          <form method="GET" action="/places" className="flex items-center gap-2 bg-[#F8F9FA] p-2 rounded-2xl border border-slate-200">
            <Search className="w-5 h-5 text-[#1B4D3E] ml-2 shrink-0" />
            <input
              type="text"
              name="q"
              defaultValue={searchQuery}
              placeholder="Nhập tên địa điểm, Hồ Tà Pạ, Gà Đốt Ô Thum, Chùa Svay Ton..."
              className="flex-1 bg-transparent px-2 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none placeholder:text-slate-400 font-medium"
            />
            {selectedCommune !== 'Tất cả' && <input type="hidden" name="commune" value={selectedCommune} />}
            {selectedCategory !== 'Tất cả' && <input type="hidden" name="category" value={selectedCategory} />}
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#1B4D3E] hover:bg-[#143B2F] text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shadow-md shrink-0"
            >
              <Search className="w-4 h-4 text-[#D99B26]" />
              <span>Tìm kiếm</span>
            </button>
          </form>

          {/* Active Filters Display & Clear Button */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-[#1B4D3E]">Đang lọc theo:</span>
                {selectedCommune !== 'Tất cả' && (
                  <span className="px-3 py-1 rounded-lg bg-[#1B4D3E] text-white font-semibold flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#D99B26]" />
                    <span>{selectedCommune}</span>
                  </span>
                )}
                {selectedCategory !== 'Tất cả' && (
                  <span className="px-3 py-1 rounded-lg bg-[#D99B26] text-slate-900 font-bold flex items-center gap-1">
                    <SlidersHorizontal className="w-3 h-3 text-slate-900" />
                    <span>{categories.find(c => c.key === selectedCategory)?.label}</span>
                  </span>
                )}
                {searchQuery && (
                  <span className="px-3 py-1 rounded-lg bg-slate-900 text-white font-semibold">
                    "{searchQuery}"
                  </span>
                )}
              </div>

              <Link
                href="/places"
                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-white border border-slate-300 hover:border-red-500 text-slate-700 hover:text-red-600 font-bold transition-all"
              >
                <X className="w-3.5 h-3.5" />
                <span>Xóa bộ lọc</span>
              </Link>
            </div>
          )}

          {/* Iconic Category Filter Tabs */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              <SlidersHorizontal className="w-4 h-4 text-[#1B4D3E]" />
              <span>Phân Loại Danh Mục</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((cat) => {
                const IconComp = cat.icon;
                const isActive = selectedCategory === cat.key;
                const searchUrl = new URLSearchParams();
                if (selectedCommune !== 'Tất cả') searchUrl.set('commune', selectedCommune);
                if (cat.key !== 'Tất cả') searchUrl.set('category', cat.key);
                if (searchQuery) searchUrl.set('q', searchQuery);
                
                return (
                  <Link
                    key={cat.key}
                    href={`/places?${searchUrl.toString()}`}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-[#1B4D3E] text-white shadow-md'
                        : 'bg-[#F8F9FA] text-slate-700 hover:bg-emerald-50 hover:text-[#1B4D3E] border border-slate-200'
                    }`}
                  >
                    <IconComp className={`w-3.5 h-3.5 ${isActive ? 'text-[#D99B26]' : 'text-slate-500'}`} />
                    <span>{cat.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Commune Filter Chips */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              <MapPin className="w-4 h-4 text-[#D99B26]" />
              <span>Lọc Theo Xã / Thị Trấn Bản Địa</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {communes.map((c, i) => {
                const isActive = selectedCommune === c;
                const searchUrl = new URLSearchParams();
                if (c !== 'Tất cả') searchUrl.set('commune', c);
                if (selectedCategory !== 'Tất cả') searchUrl.set('category', selectedCategory);
                if (searchQuery) searchUrl.set('q', searchQuery);

                return (
                  <Link
                    key={i}
                    href={`/places?${searchUrl.toString()}`}
                    className={`px-3.5 py-1.5 rounded-full text-xs transition-all ${
                      isActive
                        ? 'bg-[#D99B26] text-slate-900 font-bold shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:border-[#D99B26] hover:text-slate-900 font-medium'
                    }`}
                  >
                    {c}
                  </Link>
                );
              })}
            </div>
          </div>

        </div>

        {/* Dynamic Places Grid */}
        {places.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {places.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        ) : (
          /* Smart Empty State */
          <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center shadow-xs space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-[#1B4D3E] flex items-center justify-center mx-auto border border-emerald-100">
              <Search className="w-8 h-8 text-[#D99B26]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Không tìm thấy địa điểm phù hợp</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
                Thử xóa từ khóa tìm kiếm hoặc chọn danh mục khác để khám phá các danh thắng nổi tiếng tại Tri Tôn.
              </p>
            </div>

            {/* Quick Redirect Chips */}
            <div className="pt-2">
              <span className="text-xs text-slate-400 block mb-2 font-medium">Gợi ý tìm nhanh:</span>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {[
                  { label: 'Hồ Tà Pạ', href: '/places?commune=X%C3%A3+N%C3%BAi+T%C3%B4' },
                  { label: 'Gà Đốt Ô Thum', href: '/places?category=food_and_restaurants' },
                  { label: 'Chùa Svay Ton', href: '/places?category=khmer_pagodas_heritage' },
                ].map((chip, idx) => (
                  <Link
                    key={idx}
                    href={chip.href}
                    className="px-3.5 py-1.5 rounded-full bg-[#F8F9FA] hover:bg-emerald-50 text-xs font-semibold text-[#1B4D3E] border border-slate-200 hover:border-[#1B4D3E] transition-all"
                  >
                    {chip.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <Link
                href="/places"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1B4D3E] text-white text-xs font-bold shadow-md hover:bg-[#143B2F] transition-all"
              >
                <Sparkles className="w-4 h-4 text-[#D99B26]" />
                <span>Xem Toàn Bộ Địa Điểm</span>
              </Link>
            </div>
          </div>
        )}

      </main>
      
      <ChatbotWidget />
      <Footer />
    </div>
  );
}
