'use client';

import React, { useMemo } from 'react';
import { Sparkles, Flame, Calendar, MapPin, Clock, MessageSquareText, ChevronRight } from 'lucide-react';
import { getOptimizedImageUrl } from '@/lib/imageOptimizer';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export interface FestivalItem {
  id: string;
  name: string;
  time: string;
  monthsActive: number[];
  season_badge: string;
  location: string;
  tag: string;
  tagColor: string;
  image_url: string;
  desc: string;
  cradle: string;
  highlights: string[];
  golden_hours_tip: string;
  parking_tip: string;
  ai_query: string;
}

interface CultureFestivalsSectionProps {
  onAskAi: (query: string) => void;
}

export default function CultureFestivalsSection({ onAskAi }: CultureFestivalsSectionProps) {
  const { language, dict } = useLanguage();
  const cu = dict.culture;
  const isEn = language === 'en';

  const festivals = (cu.festivalsList || []) as FestivalItem[];

  const currentMonth = useMemo(() => {
    return new Date().getMonth() + 1;
  }, []);

  const sortedFestivals = useMemo(() => {
    return [...festivals].sort((a, b) => {
      const aActive = a.monthsActive.includes(currentMonth);
      const bActive = b.monthsActive.includes(currentMonth);
      if (aActive && !bActive) return -1;
      if (!aActive && bActive) return 1;
      return 0;
    });
  }, [festivals, currentMonth]);

  const spotlightFestival = sortedFestivals[0] || festivals[0];
  const otherFestivals = sortedFestivals.slice(1);

  if (!spotlightFestival) return null;

  return (
    <section className="space-y-6 font-body">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#26221B]/10 pb-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-black text-[#F26B3A] uppercase tracking-wider font-display">
            <Sparkles className="w-4 h-4 fill-[#F26B3A]" />
            <span>{isEn ? "Seven Mountains Big Festivals" : "6 Đại Lễ Hội Bảy Núi"}</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-[#26221B] font-display mt-0.5">
            {cu.hero.tabFestivals || (isEn ? "Signature Cultural Festivals" : "Lễ Hội Văn Hóa Đặc Sắc")}
          </h2>
        </div>
        <span className="text-xs font-medium text-[#6B6355] font-mono">
          {isEn ? "100% Verified Festival Calendar" : "Lịch sự kiện & văn hóa xác minh 100%"}
        </span>
      </div>

      {/* 🌟 Spotlight Festival Card 🌟 */}
      <div className="relative overflow-hidden rounded-[28px] bg-[#FFFDF7] border-2 border-amber-400/80 shadow-md">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Spotlight Left Photo */}
          <div className="lg:col-span-5 relative h-64 lg:h-auto min-h-[260px] overflow-hidden bg-slate-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getOptimizedImageUrl(spotlightFestival.image_url, { width: 900, dpr: 2, quality: 'best' })}
              alt={spotlightFestival.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

            <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 font-display">
              <span className="px-3 py-1 rounded-full bg-[#F26B3A] text-white font-black text-xs uppercase tracking-wider flex items-center gap-1 shadow-sm">
                <Flame className="w-3.5 h-3.5 fill-white" />
                <span>{isEn ? "Featured Festival" : "Lễ Hội Nổi Bật"}</span>
              </span>
              <span className="px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-[#26221B] font-extrabold text-xs">
                {spotlightFestival.season_badge}
              </span>
            </div>

            <div className="absolute bottom-3 left-3 right-3 text-white">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1 font-mono">
                <Calendar className="w-3.5 h-3.5" />
                <span>{spotlightFestival.time}</span>
              </span>
              <h3 className="font-display font-black text-lg sm:text-xl text-white mt-1 leading-tight">
                {spotlightFestival.name}
              </h3>
            </div>
          </div>

          {/* Spotlight Right Information */}
          <div className="lg:col-span-7 p-5 sm:p-7 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#6B6355]">
                <span className="flex items-center gap-1 text-[#0E8C7F] font-bold">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{spotlightFestival.location}</span>
                </span>
                <span>•</span>
                <span>{spotlightFestival.cradle}</span>
              </div>

              <p className="text-xs sm:text-sm text-[#4A4336] leading-relaxed">
                {spotlightFestival.desc}
              </p>

              {/* Highlights Bullet Matrix */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold text-[#6B6355] uppercase tracking-wider font-display block">
                  {isEn ? "Special Highlights:" : "Điểm Nhấn Nổi Bật:"}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {spotlightFestival.highlights.map((hl, hidx) => (
                    <div key={hidx} className="flex items-start gap-1.5 text-xs text-[#26221B] bg-[#FAF3E7] p-2 rounded-xl border border-[#26221B]/6">
                      <span className="text-[#0E8C7F] font-bold">✓</span>
                      <span>{hl}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tips Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[#8C501E]">
                  <span className="font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {isEn ? "Golden Hours Tip" : "Thời Gian Đẹp Nhất"}
                  </span>
                  <p className="text-[11px] mt-0.5">{spotlightFestival.golden_hours_tip}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[#0E8C7F]">
                  <span className="font-bold flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {isEn ? "Parking & Access" : "Bãi Đỗ Xe & Di Chuyển"}
                  </span>
                  <p className="text-[11px] mt-0.5">{spotlightFestival.parking_tip}</p>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#26221B]/8 font-display">
              <button
                type="button"
                onClick={() => onAskAi(spotlightFestival.ai_query)}
                className="px-4 py-2 rounded-full bg-[#0E8C7F] hover:bg-[#085A52] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <MessageSquareText className="w-3.5 h-3.5" />
                <span>{isEn ? "Ask AI Assistant About This Festival" : "Hỏi Trợ Lý AI Về Lễ Hội Này"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Other Festivals Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {otherFestivals.map((fest) => (
          <div
            key={fest.id}
            className="group bg-[#FFFDF7] rounded-2xl border border-[#26221B]/10 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="relative h-40 w-full overflow-hidden bg-slate-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getOptimizedImageUrl(fest.image_url, { width: 600, dpr: 2, quality: 'best' })}
                  alt={fest.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-white/95 text-[#26221B] font-bold text-[10px] font-display">
                  {fest.season_badge}
                </span>
                <div className="absolute bottom-2 left-2.5 right-2.5 text-white">
                  <span className="text-[10px] font-bold text-amber-300 font-mono block">
                    {fest.time}
                  </span>
                  <h3 className="font-display font-extrabold text-sm text-white line-clamp-1">
                    {fest.name}
                  </h3>
                </div>
              </div>

              <div className="p-3.5 space-y-2 text-xs text-[#6B6355]">
                <div className="flex items-center gap-1 text-[11px] text-[#0E8C7F] font-semibold">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span className="truncate">{fest.location}</span>
                </div>
                <p className="text-[11px] text-[#4A4336] line-clamp-2 leading-relaxed">
                  {fest.desc}
                </p>
              </div>
            </div>

            <div className="p-3.5 pt-0 border-t border-[#26221B]/6 flex items-center justify-between font-display">
              <span className="text-[10px] text-[#6B6355] italic truncate max-w-[150px]">
                {fest.cradle}
              </span>
              <button
                type="button"
                onClick={() => onAskAi(fest.ai_query)}
                className="text-xs font-bold text-[#0E8C7F] hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>{isEn ? "Ask AI" : "Hỏi AI"}</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
