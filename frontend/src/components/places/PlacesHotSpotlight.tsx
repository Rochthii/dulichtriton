'use client';

import React from 'react';
import Link from 'next/link';
import { Flame, Award, Star, ChevronRight, Navigation } from 'lucide-react';
import { getOptimizedImageUrl } from '@/lib/imageOptimizer';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Place } from '@/components/PlaceCard';

interface PlacesHotSpotlightProps {
  places: Place[];
}

export default function PlacesHotSpotlight({ places }: PlacesHotSpotlightProps) {
  const { language } = useLanguage();
  const isEn = language === 'en';

  if (!places || places.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-black text-[#F26B3A] uppercase tracking-wider font-display">
            <Flame className="w-4 h-4 fill-[#F26B3A]" />
            <span>{isEn ? "Featured Destinations" : "Điểm Đến Nổi Bật Nhất"}</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-[#26221B] font-display mt-0.5">
            {isEn ? "Top Wonders & Hottest Check-in Coordinates" : "Top Kỳ Quan & Tọa Độ Check-in Hot Nhất"}
          </h2>
        </div>
        <span className="text-xs font-bold text-[#0E8C7F] bg-[#0E8C7F]/10 px-3 py-1 rounded-full border border-[#0E8C7F]/20 hidden sm:inline-block">
          {isEn ? "Priority Check-in" : "Ưu Tiên Check-in"}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6">
        {places.map((hotPlace, pidx) => {
          const displayName = isEn && (hotPlace as any).name_en ? (hotPlace as any).name_en : hotPlace.name;
          const displayDesc = isEn && (hotPlace as any).description_en
            ? (hotPlace as any).description_en
            : (hotPlace.description || (isEn ? "Iconic scenic coordinate in Tri Ton with stunning natural landscapes." : "Tọa độ danh thắng tiêu biểu tại Tri Tôn với khung cảnh thiên nhiên tuyệt đẹp."));

          return (
            <div
              key={hotPlace.id}
              className="group relative bg-[#FFFDF7] rounded-2xl sm:rounded-[28px] overflow-hidden border-2 border-amber-400/80 shadow-[0_2px_12px_rgba(240,163,47,0.10)] hover:shadow-[0_12px_32px_rgba(240,163,47,0.22)] hover:border-amber-500 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getOptimizedImageUrl(hotPlace.image_url && !hotPlace.image_url.includes('unsplash.com') ? hotPlace.image_url : "https://res.cloudinary.com/dhjesnejt/image/upload/f_auto,q_auto:best,w_1600,c_fill/v1786758888/tri_ton_hero/hero_ho_ta_pa.avif", { width: 900, dpr: 2, quality: 'best' })}
                    alt={displayName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

                  <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex items-center gap-1">
                    <span className="px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-lg sm:rounded-xl bg-[#F0A32F] text-[#26221B] font-black text-[9px] sm:text-xs uppercase tracking-wider flex items-center gap-0.5 sm:gap-1 shadow-sm font-display">
                      <Award className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#26221B]" /> TOP #{pidx + 1}
                    </span>
                  </div>

                  <span className="absolute top-2 sm:top-3 right-2 sm:right-3 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-lg sm:rounded-xl bg-white/95 backdrop-blur-md text-[#26221B] font-black text-[10px] sm:text-xs flex items-center gap-0.5 sm:gap-1 shadow-sm font-display">
                    <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-400 text-amber-500" />
                    <span>{hotPlace.rating || 4.9}</span>
                  </span>

                  <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 right-2 sm:right-3 text-white space-y-0.5">
                    <span className="text-[9px] sm:text-[11px] font-black uppercase tracking-wider text-[#FFD37A] drop-shadow-sm block font-mono truncate">
                      {hotPlace.commune}
                    </span>
                    <h3 className="font-display font-extrabold text-xs sm:text-base leading-snug text-white group-hover:text-[#FFD37A] transition-colors line-clamp-1 drop-shadow-md">
                      {displayName}
                    </h3>
                  </div>
                </div>

                <div className="p-2.5 sm:p-4 space-y-1.5 sm:space-y-2 text-xs text-[#6B6355]">
                  <p className="text-[11px] sm:text-xs text-[#6B6355] line-clamp-2 leading-relaxed font-body">
                    {displayDesc}
                  </p>
                </div>
              </div>

              <div className="p-2.5 sm:p-4 pt-0 border-t border-[#EBE1D0]/70 flex items-center justify-between gap-1.5 sm:gap-2">
                <Link
                  href={`/places/${hotPlace.slug || hotPlace.id}`}
                  className="text-[11px] sm:text-sm font-extrabold text-[#0E8C7F] hover:text-[#085A52] flex items-center gap-0.5 sm:gap-1 transition-colors font-display truncate"
                >
                  <span>{isEn ? "View details" : "Xem chi tiết"}</span>
                  <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                </Link>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotPlace.name + " " + hotPlace.commune + " Tri Tôn")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/60 font-bold text-[10px] sm:text-xs flex items-center gap-1 transition-colors shadow-2xs"
                >
                  <Navigation className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-600 shrink-0" />
                  <span className="hidden sm:inline">{isEn ? "Directions" : "Chỉ đường"}</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
