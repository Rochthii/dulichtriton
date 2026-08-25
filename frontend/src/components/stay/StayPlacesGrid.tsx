'use client';

import React from 'react';
import Link from 'next/link';
import { Hotel, Star, Wifi, Car, Phone, Navigation, ChevronRight } from 'lucide-react';
import { getOptimizedImageUrl } from '@/lib/imageOptimizer';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { StayItem } from '@/components/stay/StayTopSpotlight';

interface StayPlacesGridProps {
  stays: StayItem[];
  loading: boolean;
  onResetFilter: () => void;
}

export default function StayPlacesGrid({
  stays,
  loading,
  onResetFilter,
}: StayPlacesGridProps) {
  const { language, dict } = useLanguage();
  const st = dict.stay;
  const isEn = language === 'en';

  return (
    <section className="space-y-4 font-body">
      <div className="flex items-center justify-between font-display">
        <h2 className="text-base md:text-lg font-black text-[#26221B] flex items-center gap-2">
          <Hotel className="w-5 h-5 text-[#0E8C7F]" />
          <span>
            {isEn
              ? `List of Accommodations (${stays.length} Places)`
              : `Danh Sách Cơ Sở Lưu Trú (${stays.length} Địa Điểm)`}
          </span>
        </h2>
        <span className="text-xs text-[#6B6355] font-medium font-mono">
          {isEn ? '100% Verified Field Data' : 'Dữ liệu thực địa 100%'}
        </span>
      </div>

      {loading ? (
        <div className="py-16 text-center text-[#6B6355] font-bold">
          {isEn ? "Loading Tri Ton accommodations list..." : "Đang tải danh sách cơ sở lưu trú Tri Tôn..."}
        </div>
      ) : stays.length === 0 ? (
        <div className="py-16 text-center bg-[#FFFDF7] rounded-3xl border border-[#26221B]/8 p-8 space-y-3">
          <Hotel className="w-8 h-8 text-[#6B6355]/40 mx-auto" />
          <div className="font-bold text-sm text-[#26221B]">
            {isEn ? "No accommodations found matching this filter." : "Không tìm thấy cơ sở lưu trú nào phù hợp."}
          </div>
          <button
            onClick={onResetFilter}
            className="px-4 py-2 rounded-xl bg-[#0E8C7F] text-white text-xs font-bold cursor-pointer font-display"
          >
            {isEn ? "Show all accommodations" : "Xem tất cả cơ sở lưu trú"}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6">
          {stays.map((stay) => {
            const displayName = isEn && stay.name_en ? stay.name_en : stay.name;
            const displayDesc = isEn && stay.description_en ? stay.description_en : stay.description;

            return (
              <div
                key={stay.id}
                className="group relative bg-[#FFFDF7] rounded-2xl sm:rounded-[28px] overflow-hidden border border-[#26221B]/10 shadow-xs hover:shadow-md hover:border-[#0E8C7F]/30 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <Link
                    href={`/places/${stay.slug || stay.id}`}
                    className="block relative aspect-[4/3] w-full overflow-hidden bg-slate-900 cursor-pointer"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getOptimizedImageUrl(stay.image_url, { width: 800, dpr: 2, quality: 'best' })}
                      alt={displayName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

                    <span className="absolute top-2 sm:top-3 right-2 sm:right-3 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-lg sm:rounded-xl bg-white/95 backdrop-blur-md text-[#26221B] font-black text-[10px] sm:text-xs flex items-center gap-0.5 sm:gap-1 shadow-sm font-display">
                      <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-400 text-amber-500" />
                      <span>{stay.rating || 4.8}</span>
                    </span>

                    <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 right-2 sm:right-3 text-white space-y-0.5">
                      <span className="text-[9px] sm:text-[11px] font-black uppercase tracking-wider text-[#FFD37A] drop-shadow-sm block font-mono truncate">
                        {stay.commune}
                      </span>
                      <h3 className="font-display font-extrabold text-xs sm:text-base leading-snug text-white group-hover:text-[#FFD37A] transition-colors line-clamp-1 drop-shadow-md">
                        {displayName}
                      </h3>
                    </div>
                  </Link>

                  <div className="p-2.5 sm:p-4 space-y-1.5 sm:space-y-2 text-xs text-[#6B6355]">
                    {stay.price_level && (
                      <div className="font-display font-extrabold text-xs text-[#D9822B]">
                        {stay.price_level}
                      </div>
                    )}
                    <p className="text-[11px] sm:text-xs text-[#6B6355] line-clamp-2 leading-relaxed">
                      {displayDesc || (isEn ? "Quality accommodation in Tri Ton." : "Địa điểm lưu trú tiện nghi tại Tri Tôn.")}
                    </p>
                  </div>
                </div>

                <div className="p-2.5 sm:p-4 pt-0 border-t border-[#EBE1D0]/70 flex items-center justify-between gap-1.5 sm:gap-2 font-display">
                  <Link
                    href={`/places/${stay.slug || stay.id}`}
                    className="text-[11px] sm:text-sm font-extrabold text-[#0E8C7F] hover:text-[#085A52] flex items-center gap-0.5 sm:gap-1 transition-colors truncate"
                  >
                    <span>{isEn ? "Details" : "Chi tiết"}</span>
                    <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                  </Link>

                  <div className="flex items-center gap-1 sm:gap-1.5">
                    {stay.phone && (
                      <a
                        href={`tel:${stay.phone}`}
                        title={isEn ? "Call to book" : "Gọi điện"}
                        className="p-1.5 sm:p-2 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-colors"
                      >
                        <Phone className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-700" />
                      </a>
                    )}
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stay.name + " " + stay.commune + " Tri Tôn")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/60 font-bold text-[10px] sm:text-xs flex items-center gap-1 transition-colors shadow-2xs"
                    >
                      <Navigation className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-600 shrink-0" />
                      <span className="hidden sm:inline">{isEn ? "Directions" : "Chỉ đường"}</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
