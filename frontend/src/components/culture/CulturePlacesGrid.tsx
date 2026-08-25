'use client';

import React from 'react';
import Link from 'next/link';
import { Landmark, Star, ChevronRight, Navigation } from 'lucide-react';
import { getOptimizedImageUrl } from '@/lib/imageOptimizer';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export interface CulturePlace {
  id: string;
  slug: string;
  name: string;
  name_en?: string;
  category: string;
  category_en?: string;
  tourism_category: string;
  commune: string;
  rating?: number;
  image_url: string;
  description?: string;
  description_en?: string;
  detailed_story?: string;
  detailed_story_en?: string;
  is_hot?: boolean;
}

interface CulturePlacesGridProps {
  cultures: CulturePlace[];
  loading: boolean;
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
}

export default function CulturePlacesGrid({
  cultures,
  loading,
  selectedTab,
  setSelectedTab,
}: CulturePlacesGridProps) {
  const { language, dict } = useLanguage();
  const cu = dict.culture;
  const isEn = language === 'en';

  const filterTabs = [
    { key: "ALL", label: isEn ? "All Cultural Spots" : "Tất Cả Di Tích" },
    { key: "PAGODA", label: isEn ? "37 Khmer Pagodas" : "Chùa Khmer Cổ Tự" },
    { key: "RELIC", label: isEn ? "Historical Relics" : "Di Tích Lịch Sử" },
    { key: "HERITAGE", label: isEn ? "Scenic Heritage" : "Danh Thắng & Lễ Hội" },
  ];

  return (
    <section className="space-y-4 font-body">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#26221B]/10 pb-3 font-display">
        <div className="flex items-center gap-2">
          <Landmark className="w-5 h-5 text-[#0E8C7F]" />
          <h2 className="text-xl md:text-2xl font-black text-[#26221B]">
            {isEn ? `37 Ancient Khmer Pagodas & Historic Relics (${cultures.length})` : `Danh Sách 37 Ngôi Chùa & Di Tích Lịch Sử (${cultures.length})`}
          </h2>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedTab(tab.key)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedTab === tab.key
                  ? "bg-[#0E8C7F] text-white shadow-xs"
                  : "bg-[#FFFDF7] text-[#6B6355] hover:bg-[#FAF3E7] border border-[#26221B]/10"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-[#6B6355] font-bold">
          {isEn ? "Loading Tri Ton sacred culture & heritage places..." : "Đang tải danh sách chùa Khmer và di tích Tri Tôn..."}
        </div>
      ) : cultures.length === 0 ? (
        <div className="py-16 text-center bg-[#FFFDF7] rounded-3xl border border-[#26221B]/8 p-8 space-y-3">
          <Landmark className="w-8 h-8 text-[#6B6355]/40 mx-auto" />
          <div className="font-bold text-sm text-[#26221B]">
            {isEn ? "No cultural places found matching this category." : "Không tìm thấy địa điểm văn hóa nào phù hợp."}
          </div>
          <button
            onClick={() => setSelectedTab("ALL")}
            className="px-4 py-2 rounded-xl bg-[#0E8C7F] text-white text-xs font-bold cursor-pointer font-display"
          >
            {isEn ? "Show all cultural places" : "Xem tất cả di tích"}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6">
          {cultures.map((place) => {
            const displayName = isEn && place.name_en ? place.name_en : place.name;
            const displayDesc = isEn && place.description_en ? place.description_en : place.description;

            return (
              <div
                key={place.id}
                className="group relative bg-[#FFFDF7] rounded-2xl sm:rounded-[28px] overflow-hidden border-2 border-amber-400/80 shadow-[0_2px_12px_rgba(240,163,47,0.10)] hover:shadow-[0_12px_32px_rgba(240,163,47,0.22)] hover:border-amber-500 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <Link
                    href={`/places/${place.slug || place.id}`}
                    className="block relative aspect-[4/3] w-full overflow-hidden bg-slate-900 cursor-pointer"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getOptimizedImageUrl(place.image_url, { width: 800, dpr: 2, quality: 'best' })}
                      alt={displayName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

                    <span className="absolute top-2 sm:top-3 right-2 sm:right-3 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-lg sm:rounded-xl bg-white/95 backdrop-blur-md text-[#26221B] font-black text-[10px] sm:text-xs flex items-center gap-0.5 sm:gap-1 shadow-sm font-display">
                      <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-400 text-amber-500" />
                      <span>{place.rating || 4.9}</span>
                    </span>

                    <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 right-2 sm:right-3 text-white space-y-0.5">
                      <span className="text-[9px] sm:text-[11px] font-black uppercase tracking-wider text-[#FFD37A] drop-shadow-sm block font-mono truncate">
                        {place.commune}
                      </span>
                      <h3 className="font-display font-extrabold text-xs sm:text-base leading-snug text-white group-hover:text-[#FFD37A] transition-colors line-clamp-1 drop-shadow-md">
                        {displayName}
                      </h3>
                    </div>
                  </Link>

                  <div className="p-2.5 sm:p-4 space-y-1.5 sm:space-y-2 text-xs text-[#6B6355]">
                    <p className="text-[11px] sm:text-xs text-[#6B6355] line-clamp-2 leading-relaxed">
                      {displayDesc || (isEn ? "Historic cultural monument in Tri Ton." : "Địa điểm di tích văn hóa tâm linh đặc sắc tại Tri Tôn.")}
                    </p>
                  </div>
                </div>

                <div className="p-2.5 sm:p-4 pt-0 border-t border-[#EBE1D0]/70 flex items-center justify-between gap-1.5 sm:gap-2 font-display">
                  <Link
                    href={`/places/${place.slug || place.id}`}
                    className="text-[11px] sm:text-sm font-extrabold text-[#0E8C7F] hover:text-[#085A52] flex items-center gap-0.5 sm:gap-1 transition-colors truncate"
                  >
                    <span>{isEn ? "Details" : "Chi tiết"}</span>
                    <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                  </Link>

                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + " " + place.commune + " Tri Tôn")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/60 font-bold text-[10px] sm:text-xs flex items-center gap-1 transition-colors shadow-2xs"
                  >
                    <Navigation className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-600 shrink-0" />
                    <span className="hidden sm:inline">{isEn ? "Directions" : "Chỉ đường"}</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
