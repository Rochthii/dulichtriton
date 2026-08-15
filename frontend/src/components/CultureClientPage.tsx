'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Landmark, Calendar, MapPin, Navigation, Star, 
  Sparkles, CheckCircle2, ShieldCheck, Heart, Info, Clock, Compass, BookOpen
} from 'lucide-react';
import { Place } from '@/components/PlaceCard';
import { resolvePlaceExternalLinks } from '@/lib/externalLinks';
import { getGoogleMapsUrl } from '@/lib/maps';
import PageHeaderBanner from './PageHeaderBanner';
import { fetchWithCache } from '@/lib/fastCache';

interface CultureClientPageProps {
  pagodas: Place[];
}

export default function CultureClientPage({ pagodas: initialPagodas }: CultureClientPageProps) {
  const [cultureList, setCultureList] = useState<Place[]>(initialPagodas || []);
  const [loading, setLoading] = useState<boolean>(cultureList.length === 0);
  const [viewMode, setViewMode] = useState<'grid' | 'calendar' | 'map'>('grid');

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
      location: 'Toàn bộ các Xã/Thị trấn Tri Tôn',
      description: 'Dịp lễ tri ân tổ tiên trang trọng nhất của người Khmer, bà con làm bánh tét, cúng cơm tại các chùa và dâng lễ vật lên các vị chư tăng.',
      image: 'https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=1200&auto=format&fit=crop',
      badge: 'Lễ Hội Cổ Truyền',
    },
    {
      id: 'chol-chnam-thmay',
      title: 'Tết Cổ Truyền Chol Chnam Thmay',
      date: 'Khoảng 13 - 16 tháng 4 Dương lịch',
      location: 'Các chùa Nam Tông Khmer Tri Tôn',
      description: 'Mừng năm mới rực rỡ với nghi thức đắp núi cát, tắm Phật, té nước cầu may và múa lâm thôn truyền thống trong khuôn viên chùa.',
      image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=1200&auto=format&fit=crop',
      badge: 'Tết Khmer',
    },
  ];

  return (
    <div className="font-body bg-[#FAF3E7] text-[#26221B] min-h-screen">
      {/* Page Header Banner */}
      <PageHeaderBanner
        badgeText="Di Sản & Tín Ngưỡng Dân Tộc Khmer"
        badgeIcon={Landmark}
        title="Văn Hóa Khmer & Lễ Hội Bảy Núi Tri Tôn"
        subtitle="Khám phá 37 ngôi chùa Nam Tông cổ kính, nghệ thuật Kinh lá buông di sản quốc gia và ngày hội Đua Bò Bảy Núi rực lửa truyền thống."
        countLabel="Địa điểm tâm linh đã xác minh"
        countValue={`${cultureList.length} ngôi chùa`}
      />

      {/* FESTIVALS SECTION */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#D9822B] uppercase tracking-wider mb-1 font-display">
              <Calendar className="w-4 h-4 text-[#D9822B]" />
              <span>Sự Kiện Lễ Hội Bản Địa</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#26221B]">Lễ Hội Văn Hóa Đặc Sắc Nhất Tri Tôn</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {festivals.map(fest => (
            <div key={fest.id} className="bg-[#FFFDF7] rounded-[26px] border border-[#26221B]/8 overflow-hidden shadow-[0_2px_10px_rgba(38,34,27,0.08)] hover:shadow-[0_10px_30px_rgba(38,34,27,0.14)] transition-all flex flex-col justify-between group hover:-translate-y-1">
              <div>
                <div className="h-48 relative overflow-hidden bg-slate-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={fest.image}
                    alt={fest.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#26221B]/70 via-transparent to-transparent" />
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#7C5CBF] text-white text-[10px] font-bold shadow-xs font-display">
                    {fest.badge}
                  </span>
                </div>

                <div className="p-5 space-y-3">
                  <h3 className="font-display font-bold text-base text-[#26221B] group-hover:text-[#0E8C7F] transition-colors">{fest.title}</h3>
                  <div className="space-y-1.5 text-xs text-[#6B6355] font-body">
                    <p className="flex items-start gap-1.5 text-[#D9822B] font-semibold">
                      <Clock className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>{fest.date}</span>
                    </p>
                    <p className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#0E8C7F] shrink-0 mt-0.5" />
                      <span>{fest.location}</span>
                    </p>
                  </div>
                  <p className="font-body text-xs text-[#6B6355] line-clamp-3 leading-relaxed">{fest.description}</p>
                </div>
              </div>

              <div className="p-4 pt-0 border-t border-[#26221B]/6 mt-2 font-display">
                <Link
                  href={`/places?search=${encodeURIComponent(fest.title)}`}
                  className="w-full py-2.5 px-4 rounded-full bg-[#0E8C7F]/10 hover:bg-[#0E8C7F] text-[#0E8C7F] hover:text-white text-xs font-bold transition-all text-center block"
                >
                  Khám Phá Địa Điểm Tổ Chức
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PAGODAS SHOWCASE FROM SUPABASE DATABASE */}
      <section className="mb-16">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#D9822B] uppercase tracking-wider mb-1 font-display">
              <Landmark className="w-4 h-4 text-[#D9822B]" />
              <span>Chốn Thanh Tịnh Bảy Núi</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#26221B]">Các Ngôi Chùa Khmer Cổ Kính & Di Sản Tri Tôn</h2>
          </div>

          {/* View Mode Selector Tabs */}
          <div className="flex items-center gap-1 bg-[#FFFDF7] p-1.5 rounded-full border border-[#26221B]/8 shadow-xs font-display">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-full font-bold text-xs flex items-center gap-1.5 transition-all ${
                viewMode === 'grid'
                  ? 'bg-[#0E8C7F] text-white shadow-xs'
                  : 'text-[#6B6355] hover:text-[#26221B]'
              }`}
            >
              <Landmark className="w-3.5 h-3.5" />
              <span>Lưới Di Sản</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded-full font-bold text-xs flex items-center gap-1.5 transition-all ${
                viewMode === 'calendar'
                  ? 'bg-[#0E8C7F] text-white shadow-xs'
                  : 'text-[#6B6355] hover:text-[#26221B]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Lịch Lễ Hội</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-4 py-2 rounded-full font-bold text-xs flex items-center gap-1.5 transition-all ${
                viewMode === 'map'
                  ? 'bg-[#0E8C7F] text-white shadow-xs'
                  : 'text-[#6B6355] hover:text-[#26221B]'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Bản Đồ GIS</span>
            </button>
          </div>
        </div>

        {/* Dynamic Render based on viewMode */}
        {viewMode === 'map' ? (
          <div className="bg-[#151B34] rounded-[28px] p-6 text-white border border-[#1E2647] shadow-xl space-y-4 font-body">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-extrabold text-lg flex items-center gap-2 text-[#FFFDF7]">
                <Compass className="w-5 h-5 text-[#F0A32F]" />
                <span>Bản Đồ Di Sản & Văn Hóa Khmer Tri Tôn</span>
              </h3>
              <span className="text-xs text-[#FFD37A] font-bold bg-white/10 px-3.5 py-1 rounded-full border border-[#FFD37A]/30 font-display">
                {cultureList.length} Địa Điểm Đã Xác Minh
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {cultureList.map((c) => (
                <div key={c.id} className="p-4 rounded-[22px] bg-[#1E2647] border border-white/10 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#FFD37A] font-display">{c.commune}</span>
                  <h4 className="font-display font-bold text-sm text-[#FFFDF7]">{c.name}</h4>
                  <div className="flex items-center justify-between text-xs pt-1.5 border-t border-white/10 text-white/80">
                    <span>GPS: 10.41°N, 105.01°E</span>
                    <a
                      href={getGoogleMapsUrl({ name: c.name, commune: c.commune })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#F0A32F] hover:underline font-bold flex items-center gap-1 font-display"
                    >
                      <span>Chỉ đường</span>
                      <Navigation className="w-3 h-3" />
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
                <div key={place.id} className="relative bg-[#FFFDF7] rounded-[26px] border border-[#26221B]/8 overflow-hidden shadow-[0_2px_10px_rgba(38,34,27,0.08)] hover:shadow-[0_10px_30px_rgba(38,34,27,0.14)] transition-all flex flex-col justify-between group cursor-pointer hover:-translate-y-1">
                  {/* 1-Touch Main Link Overlay */}
                  <Link href={detailUrl} className="absolute inset-0 z-0" aria-label={`Xem chi tiết ${place.name}`} />

                  <div className="pointer-events-none">
                    <div className="aspect-[4/3] bg-slate-900 relative overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={mainPhoto}
                        alt={place.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#26221B]/70 via-transparent to-transparent" />
                      <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#D9822B] text-white text-[10px] font-bold shadow-xs font-display">
                        {place.commune}
                      </span>
                    </div>

                    <div className="p-5 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-display font-bold text-base text-[#26221B] group-hover:text-[#0E8C7F] transition-colors">{place.name}</h3>
                        <div className="flex items-center gap-1 text-xs font-bold text-[#26221B]">
                          <Star className="w-3.5 h-3.5 fill-[#F0A32F] text-[#F0A32F]" />
                          <span>{place.rating || 4.8}</span>
                        </div>
                      </div>
                      <p className="font-body text-xs text-[#6B6355] flex items-start gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#0E8C7F] shrink-0 mt-0.5" />
                        <span>{place.address || `${place.commune}, Tri Tôn`}</span>
                      </p>
                      <p className="font-body text-xs text-[#6B6355] line-clamp-2 mt-2">{place.description || `Ngôi chùa Nam Tông Khmer cổ kính tại ${place.commune}, Tri Tôn.`}</p>
                    </div>
                  </div>

                  <div className="p-4 pt-0 flex items-center gap-2 border-t border-[#26221B]/6 mt-2 relative z-10 pointer-events-auto font-display">
                    <Link
                      href={detailUrl}
                      className="flex-1 py-2.5 px-3 rounded-full bg-[#0E8C7F]/10 hover:bg-[#0E8C7F] text-[#0E8C7F] hover:text-white text-xs font-bold transition-all text-center"
                    >
                      Chi Tiết
                    </Link>
                    <a
                      href={maps.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="py-2.5 px-4 rounded-full bg-[#F0A32F] hover:bg-[#C97F1B] text-[#26221B] hover:text-white text-xs font-bold transition-all text-center flex items-center justify-center gap-1 shadow-xs"
                      title={maps.tooltip}
                    >
                      <Navigation className="w-3 h-3 text-[#26221B]" />
                      <span>Bản Đồ</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-[#FFFDF7] rounded-[26px] p-8 text-center border border-[#26221B]/8">
            <Landmark className="w-8 h-8 text-[#6B6355]/40 mx-auto mb-2" />
            <p className="text-xs text-[#6B6355]">Đang cập nhật danh sách chùa Khmer từ Supabase database...</p>
          </div>
        )}
      </section>

      {/* CULTURAL ETIQUETTE ADVISORY (Field Notebook Card) */}
      <section className="bg-[#FFFDF7] border-l-4 border-[#D9822B] rounded-[22px] p-6 shadow-[0_2px_10px_rgba(38,34,27,0.08)] mb-12">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-[#D9822B] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-display font-bold text-sm text-[#26221B]">Quy Tắc Văn Hóa & Tâm Linh Khi Viếng Chùa Khmer</h4>
            <p className="font-body text-xs text-[#6B6355] leading-relaxed">
              Khi vào chính điện, du khách vui lòng bỏ giày dép bên ngoài, mặc trang phục lịch sự che kín vai và đầu gối. Không chỉ tay trực tiếp vào tượng Phật và giữ trật tự tôn nghiêm.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
