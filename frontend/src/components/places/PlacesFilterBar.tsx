'use client';

import React from 'react';
import { Search, Play, Sparkles, MapPin } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export type AudienceFilter = "all" | "night" | "youth" | "family" | "trekking" | "spiritual";

interface PlacesFilterBarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  tiktokOnlyFilter: boolean;
  setTiktokOnlyFilter: (v: boolean) => void;
  activeAudience: AudienceFilter;
  setActiveAudience: (aud: AudienceFilter) => void;
  selectedCommune: string;
  setSelectedCommune: (com: string) => void;
  communes: string[];
}

export default function PlacesFilterBar({
  searchQuery,
  setSearchQuery,
  tiktokOnlyFilter,
  setTiktokOnlyFilter,
  activeAudience,
  setActiveAudience,
  selectedCommune,
  setSelectedCommune,
  communes,
}: PlacesFilterBarProps) {
  const { language, dict } = useLanguage();
  const isEn = language === 'en';

  return (
    <section className="bg-[#FFFDF7] p-4 md:p-6 rounded-3xl border border-[#26221B]/8 shadow-xs space-y-4 font-body">
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#6B6355] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={dict.places?.header?.searchPlaceholder || (isEn ? "Search by place name, commune, or keyword..." : "Tìm kiếm theo tên địa điểm, xã, câu chuyện sự tích...")}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#FAF3E7] border border-[#26221B]/10 text-xs font-medium text-[#26221B] placeholder-[#6B6355]/70 focus:outline-none focus:border-[#0E8C7F]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setTiktokOnlyFilter(!tiktokOnlyFilter)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              tiktokOnlyFilter
                ? "bg-rose-600 text-white shadow-xs"
                : "bg-[#FAF3E7] text-[#6B6355] hover:bg-rose-50 hover:text-rose-700 border border-[#26221B]/10"
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isEn ? "With TikTok Video" : "Có Video TikTok"}</span>
          </button>
        </div>
      </div>

      {/* Quick Audience Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none font-display">
        <span className="text-xs font-bold text-[#6B6355] whitespace-nowrap mr-1 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" /> {isEn ? "Themes:" : "Chủ Đề:"}
        </span>
        {[
          { id: "all", label: isEn ? "All" : "Tất Cả" },
          { id: "night", label: isEn ? "Nightlife & Evening 🌙" : "Tri Tôn Về Đêm 🌙" },
          { id: "youth", label: isEn ? "Photo Check-in 📸" : "Giới Trẻ Check-in 📸" },
          { id: "family", label: isEn ? "Family & Leisure 👨‍👩‍👧" : "Gia Đình & Nghỉ Dưỡng 👨‍👩‍👧" },
          { id: "trekking", label: isEn ? "Trekking & Clouds 🏔️" : "Leo Núi Săn Mây 🏔️" },
          { id: "spiritual", label: isEn ? "Spiritual Pilgrimage 🛕" : "Hành Hương Tâm Linh 🛕" },
        ].map((chip) => (
          <button
            key={chip.id}
            onClick={() => setActiveAudience(chip.id as AudienceFilter)}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeAudience === chip.id
                ? "bg-[#0E8C7F] text-white shadow-xs"
                : "bg-[#FAF3E7] text-[#6B6355] hover:bg-[#FAF3E7]/80 border border-[#26221B]/8"
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Communes Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-t border-[#26221B]/5 pt-3 font-display">
        <span className="text-xs font-bold text-[#6B6355] whitespace-nowrap mr-1 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-[#0E8C7F]" /> {isEn ? "Area:" : "Khu Vực:"}
        </span>
        {communes.map((commune) => (
          <button
            key={commune}
            onClick={() => setSelectedCommune(commune)}
            className={`whitespace-nowrap px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
              selectedCommune === commune
                ? "bg-[#26221B] text-[#FAF3E7] shadow-xs"
                : "bg-[#FAF3E7] text-[#6B6355] hover:bg-[#FAF3E7]/80 border border-[#26221B]/8"
            }`}
          >
            {commune === "Tất cả" ? (isEn ? "All Areas" : "Tất cả") : commune}
          </button>
        ))}
      </div>
    </section>
  );
}
