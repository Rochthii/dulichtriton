'use client';

import React from 'react';
import Link from 'next/link';
import {
  Compass,
  ChevronRight,
  Coins
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export interface ItineraryCardItem {
  slug: string;
  emoji?: string;
  title: string;
  title_en?: string;
  tagline: string;
  tagline_en?: string;
  for_whom: string;
  for_whom_en?: string;
  duration: string;
  duration_en?: string;
  budget_range: string;
  budget_range_en?: string;
}

interface HomeItinerariesSectionProps {
  presets: ItineraryCardItem[];
}

export default function HomeItinerariesSection({ presets }: HomeItinerariesSectionProps) {
  const { language } = useLanguage();
  const isEn = language === 'en';

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#0E8C7F] uppercase tracking-wider mb-1 font-display">
            <Compass className="w-4 h-4" />
            <span>{isEn ? "Optimized Suggested Itineraries" : "Hành Trình Gợi Ý Tối Ưu"}</span>
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[#26221B] tracking-tight">
            {isEn ? "Most Popular Field Itineraries" : "Lịch Trình Thực Địa Phổ Biến Nhất"}
          </h2>
        </div>
        <Link
          href="/planner"
          className="text-xs font-bold text-[#0E8C7F] hover:text-[#0B6B60] flex items-center gap-1 transition-colors font-display"
        >
          <span>{isEn ? "View all 35 itineraries" : "Xem 35 lịch trình"}</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {presets.map((itin) => {
          const displayTitle = isEn && itin.title_en ? itin.title_en : itin.title;
          const displayTagline = isEn && itin.tagline_en ? itin.tagline_en : itin.tagline;
          const displayForWhom = isEn && itin.for_whom_en ? itin.for_whom_en : itin.for_whom;
          const displayDuration = isEn && itin.duration_en ? itin.duration_en : itin.duration;
          const displayBudget = isEn && itin.budget_range_en ? itin.budget_range_en : itin.budget_range;

          return (
            <Link
              key={itin.slug}
              href={`/itinerary?slug=${itin.slug}`}
              className="ticket-stub bg-[#FFFDF7] rounded-2xl sm:rounded-[26px] p-3 sm:p-5 border border-[#26221B]/8 shadow-[0_2px_8px_rgba(38,34,27,0.06)] hover:shadow-[0_8px_24px_rgba(38,34,27,0.12)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5 sm:mb-2 font-display">
                  <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-[#0E8C7F]/10 text-[#0E8C7F] text-[9px] sm:text-[11px] font-bold border border-[#0E8C7F]/20">
                    {displayDuration}
                  </span>
                  <span className="font-bold text-[#D9822B] text-[10px] sm:text-xs flex items-center gap-0.5 sm:gap-1">
                    <Coins className="w-3 h-3 text-[#D9822B]" />
                    <span>{displayBudget}</span>
                  </span>
                </div>

                <h3 className="font-display text-xs sm:text-base font-bold text-[#26221B] line-clamp-1 mb-1">
                  {displayTitle}
                </h3>
                <p className="font-body text-[10px] sm:text-xs text-[#6B6355] line-clamp-2 leading-relaxed">
                  {displayTagline}
                </p>
              </div>

              <div className="pt-2 sm:pt-3 mt-2 sm:mt-3 border-t border-[#26221B]/6 flex items-center justify-between text-[10px] sm:text-xs text-[#6B6355] font-display">
                <span className="truncate max-w-[80px] sm:max-w-[130px]">{displayForWhom}</span>
                <span className="text-[#0E8C7F] font-bold flex items-center gap-1">
                  <span>{isEn ? "View tour" : "Xem tour"}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
