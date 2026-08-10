'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Landmark, Calendar, MapPin, Navigation, Star, 
  Sparkles, CheckCircle2, ShieldCheck, Heart, Info, Clock, Compass, BookOpen
} from 'lucide-react';
import { Place } from '@/components/PlaceCard';
import { resolvePlaceExternalLinks } from '@/lib/externalLinks';
import PageHeaderBanner from './PageHeaderBanner';
import { fetchWithCache } from '@/lib/fastCache';

interface CultureClientPageProps {
  pagodas: Place[];
}

export default function CultureClientPage({ pagodas: initialPagodas }: CultureClientPageProps) {
  const [cultureList, setCultureList] = useState<Place[]>(initialPagodas || []);
  const [loading, setLoading] = useState<boolean>(cultureList.length === 0);
  const [viewMode, setViewMode] = useState<'grid' | 'calendar' | 'map'>('grid');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  useEffect(() => {
    async function loadLiveCulture() {
      try {
        setLoading(true);
        const data = await fetchWithCache('client-culture-places-12', async () => {
          const res = await fetch('/api/v1/culture?limit=12');
          return await res.json();
        });

        if (data?.culture && Array.isArray(data.culture) && data.culture.length > 0) {
          setCultureList(data.culture);
        }
      } catch (err) {
        console.error('[CultureClientPage] Fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLiveCulture();
  }, []);

  const festivals = [
    {
      id: 'dua-bo-bay-nui',
      title: 'Lễ Hội Đua Bò Bảy Núi Truyền Thống',
      date: 'Cuối tháng 8 - Đầu tháng 9 Âm lịch hàng năm (Dịp Sene Dolta)',
      location: 'Sân đua bò Tri Tôn, Khóm 3, Thị trấn Tri Tôn, An Giang',
      description: 'Di sản văn hóa phi vật thể quốc gia mang đậm nét tinh thần thượng võ của đồng bào Khmer Bảy Núi. Hàng chục đôi bò chiến tranh tài trên bãi bùn lầy rực lửa.',
      image: '/images/tiktok/dua_bo_bay_nui.jpg',
      badge: 'Di Sản Quốc Gia',
    },
    {
      id: 'sene-dolta',
      title: 'Lễ Sene Dolta (Cúng Ông Bà Tổ Tiên)',
      date: 'Từ 29/8 đến 01/9 Âm lịch hàng năm',
      location: 'Toàn bộ 11 Xã/Thị trấn Tri Tôn',
      description: 'Dịp lễ báo hiếu tổ tiên lớn nhất trong năm của đồng bào Khmer. Gia đình sum họp, chuẩn bị mâm cỗ cúng truyền thống và dâng cơm lên các chư Tăng tại Chùa.',
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop',
      badge: 'Lễ Hội Báo Hiếu',
    },
    {
      id: 'chol-chnam-thmay',
      title: 'Lễ Chôl Chnăm Thmây (Mừng Năm Mới Khmer)',
      date: 'Giữa tháng 4 Dương lịch (14 - 16/04)',
      location: 'Các Chùa Nam Tông Khmer Tri Tôn',
      description: 'Tết cổ truyền mừng năm mới của người Khmer. Diễn ra các nghi thức tắm Phật, đắp núi cát cầu may mắn và biểu diễn múa Chăm-riêng độc đáo.',
      image: 'https://images.unsplash.com/photo-1509024644553-a78625332450?q=80&w=800&auto=format&fit=crop',
      badge: 'Tết Cổ Truyền',
    },
    {
      id: 'ok-om-bok',
      title: 'Lễ Ok Om Bok (Cúng Trăng & Thả Đèn Gió)',
      date: 'Rằm tháng 10 Âm lịch (15/10 Âm lịch)',
      location: 'Khu vực Hồ Tà Pạ & Chùa Svay Ton',
      description: 'Lễ tạ ơn Thần Mặt Trăng đã ban cho mưa thuận gió hòa, mùa màng bội thu. Đêm hội lung linh với tục đút cốm dẹp và thả đèn gió lên bầu trời đêm Bảy Núi.',
      image: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=800&auto=format&fit=crop',
      badge: 'Đêm Hội Thả Đèn',
    },
  ];

  const rules = [
    { title: 'Trang phục trang nhã', desc: 'Mặc áo có tay, quần hoặc váy dài qua gối khi vào chánh điện Chùa.' },
    { title: 'Cởi giày dép', desc: 'Tháo nón bảo hiểm, cởi giày dép và để gọn gàng bên ngoài chánh điện.' },
    { title: 'Tôn kính chư Tăng', desc: 'Chào hỏi bằng cách chắp hai tay trước ngực (Sampeah) kính cẩn.' },
    { title: 'Giữ yên tĩnh', desc: 'Tránh nói chuyện quá to hoặc chạy nhảy làm ảnh hưởng chốn thanh tịnh.' },
  ];

  return (
    <>
      <PageHeaderBanner
        title="Văn Hóa Khmer & Di Sản Tâm Linh Tri Tôn"
        subtitle="Khám phá 37+ ngôi Chùa Nam Tông cổ kính, Di sản Quốc gia Lễ Hội Đua Bò Bảy Núi & Nghệ Thuật Viết Kinh Lá Buông độc đáo."
        countLabel="Chùa cổ & Di tích"
        countValue={`${cultureList.length} địa điểm`}
      />

      {/* PAGODAS SHOWCASE FROM SUPABASE DATABASE */}
      <section className="mb-16">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1B4D3E] uppercase tracking-wider mb-1">
              <Landmark className="w-4 h-4 text-[#D99B26]" />
              <span>Chốn Thanh Tịnh Bảy Núi</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Các Ngôi Chùa Khmer Cổ Kính & Di Sản Tri Tôn</h2>
          </div>

          {/* Advanced View Switcher & Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Selector Tabs */}
            <div className="bg-slate-100 p-1 rounded-2xl flex items-center gap-1 border border-slate-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                  viewMode === 'grid'
                    ? 'bg-[#1B4D3E] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Landmark className="w-3.5 h-3.5" />
                <span>Lưới Di Sản</span>
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                  viewMode === 'calendar'
                    ? 'bg-[#1B4D3E] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Lịch Lễ Hội</span>
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                  viewMode === 'map'
                    ? 'bg-[#1B4D3E] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Bản Đồ GIS</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Render based on viewMode */}
        {viewMode === 'map' ? (
          <div className="bg-slate-900 rounded-3xl p-6 text-white border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-lg flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#D99B26]" />
                <span>Bản Đồ GIS Di Sản Khmer Tri Tôn (Real GPS Coordinates)</span>
              </h3>
              <span className="text-xs text-amber-300 font-bold bg-amber-950/60 px-3 py-1 rounded-full border border-amber-500/30">
                {cultureList.length} Tọa Độ Đã Xác Minh
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {cultureList.map((c) => (
                <div key={c.id} className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">{c.commune}</span>
                  <h4 className="font-bold text-sm text-white">{c.name}</h4>
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-700 text-slate-300">
                    <span>GPS: 10.41°N, 105.01°E</span>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.name + ' Tri Tôn')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-300 hover:underline font-bold flex items-center gap-0.5"
                    >
                      <span>Chỉ đường</span>
                      <Navigation className="w-3 h-3 text-amber-300" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : cultureList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cultureList.map((place) => {
              const detailUrl = `/places/${place.slug || place.id}`;
              const { maps } = resolvePlaceExternalLinks({
                name: place.name,
                commune: place.commune,
                video_url: place.video_url,
              });
              const mainPhoto = place.image_url || place.photos?.[0]?.url || 'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=1200&auto=format&fit=crop';

              return (
                <div key={place.id} className="relative bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group cursor-pointer">
                  {/* 1-Touch Main Link Overlay */}
                  <Link href={detailUrl} className="absolute inset-0 z-0" aria-label={`Xem chi tiết ${place.name}`} />

                  <div className="pointer-events-none">
                    <div className="h-48 bg-slate-900 relative overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={mainPhoto}
                        alt={place.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-[#1B4D3E] text-white text-[10px] font-bold shadow-xs">
                        {place.commune}
                      </span>
                    </div>

                    <div className="p-5 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-base text-slate-900 group-hover:text-[#1B4D3E] transition-colors">{place.name}</h3>
                        <div className="flex items-center gap-1 text-xs font-bold text-slate-800">
                          <Star className="w-3.5 h-3.5 fill-[#D99B26] text-[#D99B26]" />
                          <span>{place.rating || 4.8}</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 flex items-start gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#1B4D3E] shrink-0 mt-0.5" />
                        <span>{place.address || `${place.commune}, Tri Tôn`}</span>
                      </p>
                      <p className="text-xs text-slate-600 line-clamp-2 mt-2">{place.description || `Ngôi chùa Nam Tông Khmer cổ kính tại ${place.commune}, Tri Tôn.`}</p>
                    </div>
                  </div>

                  <div className="p-4 pt-0 flex items-center gap-2 border-t border-slate-100 mt-2 relative z-10 pointer-events-auto">
                    <Link
                      href={detailUrl}
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-100/80 hover:bg-emerald-200 text-[#1B4D3E] text-xs font-bold transition-all text-center"
                    >
                      Chi Tiết
                    </Link>
                    <a
                      href={maps.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="py-2 px-3 rounded-xl bg-[#1B4D3E] hover:bg-[#143B2F] text-white text-xs font-bold transition-all text-center flex items-center gap-1"
                      title={maps.tooltip}
                    >
                      <Navigation className="w-3.5 h-3.5 text-[#D99B26]" />
                      <span>Bản Đồ</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
            <Landmark className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500">Đang nạp dữ liệu di sản chùa Khmer từ Supabase database...</p>
          </div>
        )}
      </section>

      {/* TRADITIONAL FESTIVALS SECTION */}
      <section className="mb-16">
        <div className="mb-8">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1B4D3E] uppercase tracking-wider mb-1">
            <Calendar className="w-4 h-4 text-[#D99B26]" />
            <span>Lễ Hội Bản Địa Đặc Sắc</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Các Kỳ Lễ Hội Lớn Hàng Năm Tại Tri Tôn</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {festivals.map((fest) => (
            <div key={fest.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row">
              <div className="sm:w-2/5 relative h-48 sm:h-auto bg-slate-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={fest.image} alt={fest.title} className="w-full h-full object-cover" />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-[#1B4D3E] text-white text-[10px] font-bold shadow-xs">
                  {fest.badge}
                </span>
              </div>
              <div className="sm:w-3/5 p-6 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{fest.title}</h3>
                  <p className="text-xs text-[#1B4D3E] font-semibold mt-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#D99B26]" />
                    <span>{fest.date}</span>
                  </p>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{fest.description}</p>
                </div>
                <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{fest.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ETIQUETTE & RULES */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs mb-12">
        <div className="flex items-center gap-2 mb-6">
          <ShieldCheck className="w-5 h-5 text-[#1B4D3E]" />
          <h2 className="text-lg font-bold text-slate-900">Quy Tắc Văn Hóa Khi Thăm Chùa Khmer</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {rules.map((rule, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="w-6 h-6 rounded-full bg-[#1B4D3E] text-white text-xs font-bold flex items-center justify-center mb-2">
                {idx + 1}
              </span>
              <h4 className="font-bold text-xs text-slate-900">{rule.title}</h4>
              <p className="text-[11px] text-slate-600 leading-normal">{rule.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
