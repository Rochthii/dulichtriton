'use client';

import React from 'react';
import Link from 'next/link';
import { Utensils, Star, Moon, Clock, Phone, Navigation, Play, ChevronRight, Award } from 'lucide-react';
import { getOptimizedImageUrl } from '@/lib/imageOptimizer';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { FoodItem, getFoodPriceBadge } from '@/components/food/FoodMustTrySection';

interface FoodPlacesGridProps {
  foods: FoodItem[];
  loading: boolean;
  onResetFilters: () => void;
}

export default function FoodPlacesGrid({
  foods,
  loading,
  onResetFilters,
}: FoodPlacesGridProps) {
  const { language } = useLanguage();
  const isEn = language === 'en';

  return (
    <section className="space-y-4 font-body">
      <div className="flex items-center justify-between font-display">
        <h2 className="text-base md:text-lg font-black text-[#26221B] flex items-center gap-2">
          <Utensils className="w-5 h-5 text-[#0E8C7F]" />
          <span>
            {isEn
              ? `Restaurants & Specialties (${foods.length} Places)`
              : `Danh Sách Quán Ăn & Đặc Sản (${foods.length} Địa Điểm)`}
          </span>
        </h2>
        <span className="text-xs text-[#6B6355] font-medium font-mono">
          {isEn ? '100% Verified Field Data' : 'Dữ liệu thực địa 100%'}
        </span>
      </div>

      {loading ? (
        <div className="py-16 text-center text-[#6B6355] font-bold">
          {isEn ? "Loading Seven Mountains delicious eateries..." : "Đang tải danh sách quán ngon Bảy Núi..."}
        </div>
      ) : foods.length === 0 ? (
        <div className="py-16 text-center bg-[#FFFDF7] rounded-3xl border border-[#26221B]/8 p-8 space-y-3">
          <Utensils className="w-8 h-8 text-[#6B6355]/40 mx-auto" />
          <div className="font-bold text-sm text-[#26221B]">
            {isEn ? "No food places found matching your filters." : "Không tìm thấy quán ăn nào phù hợp với bộ lọc."}
          </div>
          <button
            onClick={onResetFilters}
            className="px-4 py-2 rounded-xl bg-[#0E8C7F] text-white text-xs font-bold cursor-pointer font-display"
          >
            {isEn ? "Clear all filters" : "Xóa tất cả bộ lọc"}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6">
          {foods.map((food) => {
            const priceInfo = getFoodPriceBadge(food, isEn);
            const displayName = isEn && food.name_en ? food.name_en : food.name;
            const displayDesc = isEn && food.description_en ? food.description_en : food.description;

            return (
              <div
                key={food.id}
                className="group relative bg-[#FFFDF7] rounded-2xl sm:rounded-[28px] overflow-hidden border-2 border-amber-400/80 shadow-[0_2px_12px_rgba(240,163,47,0.10)] hover:shadow-[0_12px_32px_rgba(240,163,47,0.22)] hover:border-amber-500 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Photo with Overlay */}
                  <Link
                    href={`/places/${food.slug || food.id}`}
                    prefetch={true}
                    className="block relative aspect-[4/3] w-full overflow-hidden bg-slate-900 cursor-pointer"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getOptimizedImageUrl(food.image_url, { width: 800, dpr: 2, quality: 'best' })}
                      alt={displayName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

                    {/* Top Badges */}
                    <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex items-center gap-1 font-display">
                      <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg sm:rounded-xl bg-[#F0A32F] text-[#26221B] font-black text-[9px] sm:text-xs uppercase tracking-wider flex items-center gap-0.5 sm:gap-1 shadow-sm">
                        <Award className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#26221B]" />
                        <span>{priceInfo.priceText}</span>
                      </span>
                    </div>

                    <span className="absolute top-2 sm:top-3 right-2 sm:right-3 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-lg sm:rounded-xl bg-white/95 backdrop-blur-md text-[#26221B] font-black text-[10px] sm:text-xs flex items-center gap-0.5 sm:gap-1 shadow-sm font-display">
                      <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-400 text-amber-500" />
                      <span>{food.rating}</span>
                    </span>

                    {/* Open Late / Hours Badge on Photo */}
                    {food.open_late && (
                      <div className="absolute top-10 sm:top-12 left-2 sm:left-3 font-display">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-900/90 text-amber-300 font-extrabold text-[9px] sm:text-[10px] flex items-center gap-1 border border-indigo-500/40 backdrop-blur-sm">
                          <Moon className="w-2.5 h-2.5 fill-amber-300" />
                          <span>{isEn ? "Open late after 21:00" : "Mở khuya sau 21h"}</span>
                        </span>
                      </div>
                    )}

                    {/* Bottom Title on Photo */}
                    <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 right-2 sm:right-3 text-white space-y-0.5">
                      <span className="text-[9px] sm:text-[11px] font-black uppercase tracking-wider text-[#FFD37A] drop-shadow-sm block font-mono truncate">
                        {food.commune}
                      </span>
                      <h3 className="font-display font-extrabold text-xs sm:text-base leading-snug text-white group-hover:text-[#FFD37A] transition-colors line-clamp-1 drop-shadow-md">
                        {displayName}
                      </h3>
                    </div>
                  </Link>

                  {/* Body Content */}
                  <div className="p-2.5 sm:p-4 space-y-1.5 sm:space-y-2 text-xs text-[#6B6355]">
                    {/* Hours Info */}
                    <div className="flex items-center gap-1.5 text-[11px] text-[#0E8C7F] font-semibold font-display">
                      <Clock className="w-3 h-3 shrink-0" />
                      <span className="truncate">{food.hours}</span>
                    </div>

                    <p className="text-[11px] sm:text-xs text-[#6B6355] line-clamp-2 leading-relaxed">
                      {displayDesc || (isEn ? "Authentic local dining spot in Tri Ton." : "Địa điểm ẩm thực đặc sản hấp dẫn tại Tri Tôn.")}
                    </p>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="p-2.5 sm:p-4 pt-0 border-t border-[#EBE1D0]/70 flex items-center justify-between gap-1.5 sm:gap-2 font-display">
                  <Link
                    href={`/places/${food.slug || food.id}`}
                    className="text-[11px] sm:text-sm font-extrabold text-[#0E8C7F] hover:text-[#085A52] flex items-center gap-0.5 sm:gap-1 transition-colors truncate"
                  >
                    <span>{isEn ? "Details" : "Chi tiết"}</span>
                    <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                  </Link>

                  <div className="flex items-center gap-1 sm:gap-1.5">
                    {food.phone && (
                      <a
                        href={`tel:${food.phone}`}
                        title={isEn ? "Call to book table" : "Gọi điện đặt bàn"}
                        className="p-1.5 sm:p-2 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-colors"
                      >
                        <Phone className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-700" />
                      </a>
                    )}
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(food.name + " " + food.commune + " Tri Tôn")}`}
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
