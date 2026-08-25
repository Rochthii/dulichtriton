'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  MapPin,
  Compass,
  Utensils,
  Navigation,
  Bot
} from 'lucide-react';
import SearchAutocomplete from '@/components/SearchAutocomplete';
import heroImagesData from '@/data/hero_images.json';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface HomeHeroSectionProps {
  onSelectAudience?: (aud: string) => void;
}

export default function HomeHeroSection({ onSelectAudience }: HomeHeroSectionProps) {
  const { language, dict } = useLanguage();
  const hm = dict.home;
  const isEn = language === 'en';

  const [currentHeroIdx, setCurrentHeroIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroIdx((prev) => (prev + 1) % heroImagesData.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full rounded-[28px] overflow-hidden shadow-[0_10px_30px_rgba(38,34,27,0.14)] min-h-[480px] sm:min-h-[540px] flex items-center justify-center bg-[#151B34] border border-[#26221B]/10 group">
      {/* Rotating Hero Background Slideshow */}
      {heroImagesData.map((img, idx) => (
        <div
          key={img.id}
          className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out ${
            idx === currentHeroIdx
              ? "opacity-100 scale-100"
              : "opacity-0 scale-105 pointer-events-none"
          }`}
          style={{
            backgroundImage: `url('${img.image_url}')`,
          }}
        />
      ))}

      {/* Folk-Modern Dark Scrim */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#151B34] via-[#151B34]/60 to-[#0E8C7F]/35 backdrop-blur-[0.5px]" />

      {/* Location Indicator Tag (Bottom Right) */}
      <div className="absolute bottom-4 right-4 z-20 hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md text-white text-[11px] font-medium border border-white/20 shadow-sm">
        <MapPin className="w-3.5 h-3.5 text-[#FFD37A]" />
        <span>{heroImagesData[currentHeroIdx]?.title} ({heroImagesData[currentHeroIdx]?.location})</span>
      </div>

      {/* Hero Carousel Navigation Dots (Bottom Left) */}
      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 shadow-sm">
        {heroImagesData.map((_, dotIdx) => (
          <button
            key={dotIdx}
            onClick={() => setCurrentHeroIdx(dotIdx)}
            aria-label={`Slide ${dotIdx + 1}`}
            className={`h-2 rounded-full transition-all cursor-pointer ${
              dotIdx === currentHeroIdx
                ? "w-6 bg-[#FFD37A]"
                : "w-2 bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-4xl p-4 sm:p-8 text-center space-y-4 sm:space-y-6">
        {/* Verified Stamp Badge */}
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#0E8C7F]/90 backdrop-blur-md text-[#FFD37A] text-xs font-bold border border-[#FFD37A]/30 shadow-md font-display">
          <Sparkles className="h-3.5 w-3.5 text-[#FFD37A]" />
          <span>{hm?.hero?.badge}</span>
        </div>

        {/* Main Title in Bricolage Grotesque */}
        <h1 className="font-display font-extrabold text-3xl sm:text-5xl md:text-6xl text-[#FFFDF7] tracking-tight leading-tight drop-shadow-md">
          {isEn ? (
            <>Discover Tri Ton <br className="hidden sm:inline" /><span className="text-[#F0A32F] drop-shadow-lg">The Realm of Seven Mountains</span></>
          ) : (
            <>Khám Phá Vẻ Đẹp <br className="hidden sm:inline" /><span className="text-[#F0A32F] drop-shadow-lg">Huyền Bí Bảy Núi Tri Tôn</span></>
          )}
        </h1>

        <p className="font-body text-xs sm:text-sm text-[#FAF3E7]/90 max-w-2xl mx-auto font-medium leading-relaxed drop-shadow-xs">
          {hm?.hero?.subtitle}
        </p>

        {/* Smart Search Bar */}
        <div className="w-full max-w-xl mx-auto">
          <SearchAutocomplete />
        </div>

        {/* Pain-Point Search Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          <span className="text-[11px] font-bold text-[#FAF3E7]/70 font-display">{hm?.hero?.quickNeedsLabel}</span>
          <Link
            href="/itinerary?slug=kinh-dien-1-ngay"
            className="px-3 py-1 rounded-full bg-[#FAF3E7]/15 hover:bg-[#F0A32F] hover:text-[#26221B] text-[#FFFDF7] text-xs font-bold backdrop-blur-sm border border-white/20 transition-all active:scale-95"
          >
            {hm?.hero?.quickChip1Day}
          </Link>
          <Link
            href="/food"
            className="px-3 py-1 rounded-full bg-[#FAF3E7]/15 hover:bg-[#F0A32F] hover:text-[#26221B] text-[#FFFDF7] text-xs font-bold backdrop-blur-sm border border-white/20 transition-all active:scale-95"
          >
            {hm?.hero?.quickChipChicken}
          </Link>
          <button
            type="button"
            onClick={() => onSelectAudience?.("trekking")}
            className="px-3 py-1 rounded-full bg-[#FAF3E7]/15 hover:bg-[#F0A32F] hover:text-[#26221B] text-[#FFFDF7] text-xs font-bold backdrop-blur-sm border border-white/20 transition-all active:scale-95 cursor-pointer"
          >
            {hm?.hero?.quickChipCoTo}
          </button>
          <Link
            href="/culture"
            className="px-3 py-1 rounded-full bg-[#FAF3E7]/15 hover:bg-[#F0A32F] hover:text-[#26221B] text-[#FFFDF7] text-xs font-bold backdrop-blur-sm border border-white/20 transition-all active:scale-95"
          >
            {hm?.hero?.quickChipPagodas}
          </Link>
        </div>

        {/* 4 Instant Action Shortcuts (Pills) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 max-w-2xl mx-auto">
          <Link
            href="/planner"
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xs group font-display"
          >
            <Compass className="w-4 h-4 text-[#F0A32F] group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold">{isEn ? "35 Itineraries" : "35 Lịch Trình"}</span>
          </Link>

          <Link
            href="/food"
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xs group font-display"
          >
            <Utensils className="w-4 h-4 text-[#F26B3A] group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold">{isEn ? "Food Guide" : "Ăn Gì Tri Tôn"}</span>
          </Link>

          <Link
            href="/map"
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xs group font-display"
          >
            <Navigation className="w-4 h-4 text-[#0E8C7F] group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold">{isEn ? "GPS Map" : "Bản Đồ GPS"}</span>
          </Link>

          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("triton:open-chat"));
              }
            }}
            className="p-3 rounded-full bg-[#F0A32F] hover:bg-[#C97F1B] text-[#26221B] hover:text-white flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md group font-display cursor-pointer"
          >
            <Bot className="w-4 h-4 text-[#26221B] group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold">{isEn ? "Ask AI Guide" : "Hỏi AI Trợ Lý"}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
