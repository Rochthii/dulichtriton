import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PlaceCard from '@/components/PlaceCard';
import ChatbotWidget from '@/components/ChatbotWidget';
import TikTokReviewSection from '@/components/TikTokReviewSection';
import { 
  Compass, MapPin, Utensils, Calendar, 
  Landmark, Bed, ArrowRight, Clock, BookOpen, Search, Sparkles, ShieldCheck, Mountain, Map, Navigation, CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { getFeaturedPlaces } from '@/lib/places';

export const revalidate = 60; // Revalidate every 60 seconds (ISR)

export default async function HomePage() {
  // Fetch live places dynamically from Supabase DB (0% Hardcoded Data)
  const featuredPlaces = await getFeaturedPlaces(6);

  // 11 Communes & Towns of Tri Ton with signature highlights, icons & verified counts
  const communeHighlights = [
    { name: 'Thị trấn Tri Tôn', spot: 'Chùa Svay Ton 300 Năm', count: '14 điểm', icon: Landmark },
    { name: 'Xã Núi Tô', spot: 'Hồ Tà Pạ & Cổng Trời Koh Kas', count: '12 điểm', icon: Mountain },
    { name: 'Xã Ô Lâm', spot: 'Hồ Ô Thum & Gà Đốt Lá Chúc', count: '10 điểm', icon: Utensils },
    { name: 'Thị trấn Ba Chúc', spot: 'Khu Di Tích Ba Chúc', count: '8 điểm', icon: Landmark },
    { name: 'Xã An Tức', spot: 'Đồi Tức Dụp & Sân Đua Bò', count: '9 điểm', icon: Compass },
    { name: 'Xã Chau Lăng', spot: 'Đu Đủ Đâm Khmer & Bún Cá', count: '11 điểm', icon: Utensils },
    { name: 'Xã Lương Phi', spot: 'Suối Vàng & Vườn Trái Cây', count: '6 điểm', icon: Mountain },
    { name: 'Xã An Hảo', spot: 'Chân Núi Cấm & Đường Bảy Núi', count: '7 điểm', icon: Navigation },
    { name: 'Xã Tà Đảnh', spot: 'Cánh Đồng Lúa Bạt Ngàn', count: '5 điểm', icon: MapPin },
    { name: 'Xã Lê Trì', spot: 'Vườn Trái Cây Chân Núi Dài', count: '4 điểm', icon: Compass },
  ];

  const travelGuides = [
    {
      id: 'cam-nang-dua-bo-tri-ton',
      title: 'Cẩm Nang Xem Lễ Hội Đua Bò Bảy Núi Tại Sân Đua Bò Khóm 3, Thị Trấn Tri Tôn',
      category: 'Di Sản Văn Hóa',
      date: '06/08/2026',
      readTime: '5 phút đọc',
      image: '/images/tiktok/dua_bo_bay_nui.jpg',
      desc: 'Trải nghiệm không khí rực lửa tại Sân đua bò Tri Tôn (Khóm 3, Thị trấn Tri Tôn). Tìm hiểu thể thức Vòng Hô & Vòng Thả bứt tốc cán đích.',
      url: '/culture',
    },
    {
      id: 'bi-quyet-ga-dot-o-thum',
      title: 'Bí Quyết Thưởng Thức Gà Đốt Ô Thum Lá Chúc & Bún Cá Tri Tôn Chuẩn Vị Bảy Núi',
      category: 'Ẩm Thực Bản Địa',
      date: '05/08/2026',
      readTime: '4 phút đọc',
      image: '/images/tiktok/ga_dot_o_thum.png',
      desc: 'Món gà thả đồi nướng niêu đất 45 phút ướp lá chúc rừng thơm nức ăn cùng bún cá lóc đồng màu nghệ vàng tươi.',
      url: '/food',
    },
    {
      id: 'san-anh-ho-ta-pa',
      title: 'Kinh Nghiệm Săn Ảnh Bình Minh Hồ Tà Pạ & Cổng Trời Koh Kas Chau Lăng',
      category: 'Cảnh Quan & Sống Ảo',
      date: '04/08/2026',
      readTime: '6 phút đọc',
      image: '/images/tiktok/ho_ta_pa.jpg',
      desc: 'Tọa độ tuyệt tình cốc ngọc bích soi bóng Chùa Tà Pạ và cổng trời Khmer cổ kính giữa cánh đồng lúa bạt ngàn.',
      url: '/places?commune=X%C3%A3+N%C3%BAi+T%C3%B4',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-slate-900 font-sans selection:bg-[#D99B26] selection:text-slate-900">
      <Header />

      <main className="flex-1">
        
        {/* 1. HERO SHOWCASE SECTION OVER SCENIC BẢY NÚI PHOTOGRAPHY */}
        <section className="relative text-white py-20 sm:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden bg-slate-950">
          {/* Hero Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-100 transition-transform duration-1000"
            style={{ backgroundImage: `url('https://cdn.tgdd.vn/Files/2023/11/06/1554179/top-8-dia-diem-du-lich-tri-ton-an-giang-nen-trai-nghiem-202311061412586340.jpg')` }}
          ></div>
          {/* Layered Gradient Overlay for Optimal Contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-900/65 to-slate-950/95"></div>

          {/* Centered Glassmorphic Hero Content */}
          <div className="relative z-10 max-w-4xl mx-auto space-y-6 text-center">
            
            {/* Verified Heritage Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1B4D3E]/90 border border-emerald-500/30 text-xs font-bold text-[#D99B26] backdrop-blur-md shadow-xl">
              <Compass className="w-4 h-4 text-[#D99B26]" />
              <span>Cẩm Nang Du Lịch Bản Địa Bảy Núi Tri Tôn</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#D99B26] animate-pulse"></span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white drop-shadow-2xl">
              Khám Phá Vẻ Đẹp Kỳ Vĩ <br />
              <span className="bg-gradient-to-r from-[#D99B26] via-amber-300 to-amber-500 bg-clip-text text-transparent">
                Vùng Đất Bảy Núi Tri Tôn
              </span>
            </h1>

            <p className="text-xs sm:text-base text-slate-100 max-w-2xl mx-auto font-normal leading-relaxed drop-shadow-lg">
              Trải nghiệm danh thắng Hồ Tà Pạ ngọc bích, thưởng thức ẩm thực Gà Đốt Ô Thum lá chúc trứ danh và chiêm bái di sản Chùa Khmer cổ kính 300 năm.
            </p>

            {/* Smart Search Bar Container */}
            <div className="max-w-2xl mx-auto bg-white/95 backdrop-blur-xl p-2 sm:p-2.5 rounded-2xl shadow-2xl border border-emerald-900/10 flex flex-col sm:flex-row items-center gap-2">
              <div className="flex items-center gap-2 flex-1 w-full pl-3 text-slate-400">
                <Search className="w-5 h-5 text-[#1B4D3E] shrink-0" />
                <input
                  type="text"
                  placeholder="Tìm điểm đến, Gà Đốt Ô Thum, Chùa Svay Ton, Homestay..."
                  className="w-full px-1 py-2.5 text-xs sm:text-sm text-slate-900 bg-transparent focus:outline-none placeholder:text-slate-400 font-medium"
                />
              </div>
              <Link 
                href="/places"
                className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#1B4D3E] hover:bg-[#143B2F] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg transition-all shrink-0 hover:scale-[1.02]"
              >
                <span>Tìm kiếm</span>
                <ArrowRight className="w-4 h-4 text-[#D99B26]" />
              </Link>
            </div>

            {/* Quick Suggestion Chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-200 pt-2">
              <span className="text-[#D99B26] font-bold">Gợi ý tìm nhanh:</span>
              {[
                { name: 'Hồ Tà Pạ', href: '/places?commune=X%C3%A3+N%C3%BAi+T%C3%B4' },
                { name: 'Gà Đốt Ô Thum', href: '/food' },
                { name: 'Chùa Svay Ton', href: '/culture' },
                { name: 'Cổng Trời Koh Kas', href: '/places?category=checkin_spots' },
                { name: 'Đồi Tức Dụp', href: '/places' },
              ].map((chip, idx) => (
                <Link
                  key={idx}
                  href={chip.href}
                  className="px-3.5 py-1.5 rounded-full bg-slate-900/70 hover:bg-[#1B4D3E] transition-all font-medium border border-white/20 text-white backdrop-blur-md hover:border-[#D99B26]"
                >
                  {chip.name}
                </Link>
              ))}
            </div>

          </div>
        </section>

        {/* 4 KEY METRICS STATS BAR */}
        <section className="bg-white border-b border-slate-200 py-4 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 divide-x divide-slate-100">
            <div className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#1B4D3E] flex items-center justify-center shrink-0 border border-emerald-100">
                <MapPin className="w-5 h-5 text-[#D99B26]" />
              </div>
              <div>
                <span className="text-lg font-extrabold text-slate-900 block leading-none">82+ Địa Điểm</span>
                <span className="text-[11px] font-medium text-slate-500">Đã xác minh 100%</span>
              </div>
            </div>

            <div className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#D99B26] flex items-center justify-center shrink-0 border border-amber-200">
                <Compass className="w-5 h-5 text-[#1B4D3E]" />
              </div>
              <div>
                <span className="text-lg font-extrabold text-slate-900 block leading-none">11 Xã & Thị Trấn</span>
                <span className="text-[11px] font-medium text-slate-500">Bản địa Tri Tôn</span>
              </div>
            </div>

            <div className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#1B4D3E] flex items-center justify-center shrink-0 border border-emerald-100">
                <Landmark className="w-5 h-5 text-[#D99B26]" />
              </div>
              <div>
                <span className="text-lg font-extrabold text-slate-900 block leading-none">4 Lễ Hội Di Sản</span>
                <span className="text-[11px] font-medium text-slate-500">Đua bò & Khmer</span>
              </div>
            </div>

            <div className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#D99B26] flex items-center justify-center shrink-0 border border-amber-200">
                <ShieldCheck className="w-5 h-5 text-[#1B4D3E]" />
              </div>
              <div>
                <span className="text-lg font-extrabold text-slate-900 block leading-none">100% WGS84</span>
                <span className="text-[11px] font-medium text-slate-500">Bản đồ GIS chuẩn</span>
              </div>
            </div>
          </div>
        </section>

        {/* 2. COMPACT 11 COMMUNES SELECTION CHIPS BAR */}
        <section className="bg-[#F8F9FA] border-b border-slate-200 py-6 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <MapPin className="w-4 h-4 text-[#1B4D3E]" />
                <span>Khám Phá Theo 11 Xã & Thị Trấn Bản Địa</span>
              </div>
              <span className="text-[11px] font-semibold text-[#1B4D3E] hidden sm:inline-flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#D99B26]" />
                <span>Nạp Động từ Supabase DB</span>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {communeHighlights.map((item, idx) => {
                const IconComp = item.icon;
                return (
                  <Link
                    key={idx}
                    href={`/places?commune=${encodeURIComponent(item.name)}`}
                    className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-emerald-50 hover:border-[#1B4D3E] border border-slate-200 text-xs font-medium text-slate-800 transition-all flex items-center gap-2 hover:shadow-sm group"
                  >
                    <IconComp className="w-3.5 h-3.5 text-[#D99B26] group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-[#1B4D3E]">{item.name}:</span>
                    <span className="text-slate-600">{item.spot}</span>
                    <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-[10px] font-bold text-[#1B4D3E] border border-emerald-100">
                      {item.count}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* 3. 4 PILLARS DESTINATION EXPLORER */}
        <section className="py-14 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-2">
              <div>
                <span className="text-xs font-bold text-[#D99B26] uppercase tracking-wider block">Trải Nghiệm Đa Dạng</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  4 Chủ Đề Du Lịch Nổi Bật Tại Tri Tôn
                </h2>
              </div>
              <p className="text-xs text-slate-500 max-w-md">
                Tận hưởng trọn vẹn vẻ đẹp thiên nhiên Bảy Núi, ẩm thực độc đáo và bản sắc văn hóa di sản Khmer.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              
              {/* Card 1: Danh Thắng */}
              <Link 
                href="/places" 
                className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-[#1B4D3E] hover:shadow-xl transition-all duration-300 group flex flex-col justify-between hover:-translate-y-1"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#1B4D3E] flex items-center justify-center mb-4 border border-emerald-100 group-hover:bg-[#1B4D3E] group-hover:text-white transition-colors">
                    <Mountain className="w-6 h-6 text-[#D99B26]" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 group-hover:text-[#1B4D3E] transition-colors">
                    Danh Thắng Thốt Nốt
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Hồ Tà Pạ ngọc bích, Cổng Trời Koh Kas, Hồ Soài Chek & Di tích Đồi Tức Dụp.
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#1B4D3E] mt-5">
                  <span>Khám phá 82 điểm</span>
                  <ArrowRight className="w-4 h-4 text-[#D99B26] group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              {/* Card 2: Ẩm Thực */}
              <Link 
                href="/food" 
                className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-[#1B4D3E] hover:shadow-xl transition-all duration-300 group flex flex-col justify-between hover:-translate-y-1"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#D99B26] flex items-center justify-center mb-4 border border-amber-200 group-hover:bg-[#D99B26] group-hover:text-slate-900 transition-colors">
                    <Utensils className="w-6 h-6 text-[#1B4D3E]" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 group-hover:text-[#1B4D3E] transition-colors">
                    Ẩm Thực Bản Địa
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Gà Đốt Ô Thum lá chúc, Bún cá lóc đồng, Đu đủ đâm Khmer & Bánh bò thốt nốt.
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#1B4D3E] mt-5">
                  <span>Xem menu đặc sản</span>
                  <ArrowRight className="w-4 h-4 text-[#D99B26] group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              {/* Card 3: Chùa Cổ & Lễ Hội */}
              <Link 
                href="/culture" 
                className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-[#1B4D3E] hover:shadow-xl transition-all duration-300 group flex flex-col justify-between hover:-translate-y-1"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#1B4D3E] flex items-center justify-center mb-4 border border-emerald-100 group-hover:bg-[#1B4D3E] group-hover:text-white transition-colors">
                    <Landmark className="w-6 h-6 text-[#D99B26]" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 group-hover:text-[#1B4D3E] transition-colors">
                    Chùa Cổ & Lễ Hội
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Chùa Svay Ton 300 năm, Chùa Tà Pạ & Lễ hội Đua bò Bảy Núi truyền thống.
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#1B4D3E] mt-5">
                  <span>Tìm hiểu di sản</span>
                  <ArrowRight className="w-4 h-4 text-[#D99B26] group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              {/* Card 4: Homestay View Núi */}
              <Link 
                href="/stay" 
                className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-[#1B4D3E] hover:shadow-xl transition-all duration-300 group flex flex-col justify-between hover:-translate-y-1"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#D99B26] flex items-center justify-center mb-4 border border-amber-200 group-hover:bg-[#D99B26] group-hover:text-slate-900 transition-colors">
                    <Bed className="w-6 h-6 text-[#1B4D3E]" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 group-hover:text-[#1B4D3E] transition-colors">
                    Homestay View Núi
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Nghỉ dưỡng view Núi Cô Tô, bãi đỗ ô tô 7-16 chỗ & tiệc BBQ ngoài trời.
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#1B4D3E] mt-5">
                  <span>Xem chỗ nghỉ</span>
                  <ArrowRight className="w-4 h-4 text-[#D99B26] group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

            </div>

          </div>
        </section>

        {/* 4. DYNAMIC FEATURED PLACES GRID FROM SUPABASE */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#1B4D3E] uppercase tracking-wider mb-1">
                <Map className="w-4 h-4 text-[#D99B26]" />
                <span>Địa Điểm Yêu Thích</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Top Địa Điểm Nổi Bật Tại Tri Tôn
              </h2>
            </div>
            
            <Link
              href="/places"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1B4D3E] hover:text-[#143B2F] transition-colors bg-emerald-50 px-4 py-2.5 rounded-xl border border-emerald-100 hover:shadow-xs"
            >
              <span>Xem toàn bộ 106 địa điểm</span>
              <ArrowRight className="w-4 h-4 text-[#D99B26]" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredPlaces.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        </section>

        {/* 5. EDITORIAL TRAVEL GUIDES & STORIES (100% REAL PHOTOGRAPHY) */}
        <section className="bg-white border-t border-b border-slate-200 py-14 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#1B4D3E] uppercase tracking-wider mb-1">
                  <BookOpen className="w-4 h-4 text-[#D99B26]" />
                  <span>Cẩm Nang Trải Nghiệm</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Kinh Nghiệm Du Lịch Bản Địa
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Main Featured Master Article */}
              <div className="lg:col-span-2 bg-[#F8F9FA] rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group">
                <div>
                  <div className="h-64 sm:h-80 bg-slate-900 relative overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/images/tiktok/ho_ta_pa.jpg"
                      alt="Bình minh Hồ Tà Pạ"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-lg bg-[#1B4D3E] text-white text-xs font-bold shadow-md">
                        CẨM NANG NỔI BẬT
                      </span>
                    </div>
                  </div>

                  <div className="p-6 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                      <span className="text-[#1B4D3E] font-bold">Cảnh Quan & Săn Ảnh</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#D99B26]" />
                        <span>06/08/2026</span>
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-[#1B4D3E] transition-colors">
                      Kinh Nghiệm Săn Ảnh Bình Minh Hồ Tà Pạ & Đồng Lúa Vàng Bảy Núi
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      Hồ Tà Pạ được mệnh danh là "tuyệt tình cốc" của miền Bảy Núi với lòng hồ ngọc bích soi bóng ngọn tháp Chùa Tà Pạ. Nơi ghi lại những bức ảnh kỷ niệm đẹp nhất lúc bình minh.
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <Link
                    href="/places?commune=X%C3%A3+N%C3%BAi+T%C3%B4"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1B4D3E] hover:underline"
                  >
                    <span>Đọc cẩm nang chi tiết</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#D99B26]" />
                  </Link>
                </div>
              </div>

              {/* Curated Guides List */}
              <div className="space-y-4">
                {travelGuides.map(art => (
                  <Link
                    key={art.id}
                    href={art.url}
                    className="bg-[#F8F9FA] rounded-2xl p-4 border border-slate-200 shadow-xs hover:shadow-md transition-all flex gap-3 group"
                  >
                    <div className="w-20 h-20 rounded-xl bg-slate-900 overflow-hidden shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={art.image} alt={art.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>

                    <div className="space-y-1 flex-1">
                      <span className="text-[10px] font-bold text-[#1B4D3E] uppercase tracking-wider block">{art.category}</span>
                      <h4 className="font-bold text-xs text-slate-900 group-hover:text-[#1B4D3E] transition-colors line-clamp-2">{art.title}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{art.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>

            </div>
          </div>
        </section>

        {/* 6. TIKTOK SHORTS VIDEO REVIEW SECTION */}
        <TikTokReviewSection />

        {/* 7. TOUR PLANNER LANDING CTA BANNER */}
        <section className="bg-gradient-to-r from-[#1B4D3E] via-[#143B2F] to-[#0F2F25] text-white py-14 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-xl text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/10 text-xs font-semibold text-[#D99B26] backdrop-blur-md">
                <Calendar className="w-3.5 h-3.5 text-[#D99B26]" />
                <span>Trợ Lý Tự Động Lập Tour AI 2N1Đ</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">Lập Lịch Trình Tour Tri Tôn Tự Động</h2>
              <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed font-normal">
                Tối ưu hóa cung đường di chuyển ngắn nhất giữa các điểm đến Bảy Núi, gợi ý món ăn đặc sản và tạo mã QR Code lưu tour ngoại tuyến không cần 4G.
              </p>
            </div>

            <Link
              href="/itinerary"
              className="px-7 py-3.5 rounded-xl bg-[#D99B26] hover:bg-[#c48b20] text-slate-900 font-bold text-xs sm:text-sm shadow-2xl transition-all hover:scale-105 flex items-center gap-2 shrink-0"
            >
              <Sparkles className="w-4 h-4 text-slate-900" />
              <span>Bắt Đầu Lập Lịch Trình</span>
            </Link>
          </div>
        </section>

      </main>

      {/* 8. FOOTER & FLOATING AI CHATBOT WIDGET */}
      <ChatbotWidget />
      <Footer />
    </div>
  );
}
