'use client';

import React from 'react';
import { Compass, Tent, Building2, Hotel } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export type StayFilterGroup = "all" | "homestay_camping" | "hotel_resort" | "motel";

interface StayFilterBarProps {
  activeFilter: StayFilterGroup;
  setActiveFilter: (filter: StayFilterGroup) => void;
  counts: Record<StayFilterGroup, number>;
}

export default function StayFilterBar({
  activeFilter,
  setActiveFilter,
  counts,
}: StayFilterBarProps) {
  const { language, dict } = useLanguage();
  const st = dict.stay;
  const isEn = language === 'en';

  const filterTabs: { key: StayFilterGroup; label: string; icon: React.ReactNode }[] = [
    { key: "all", label: st.filters?.all || (isEn ? "All" : "Tất Cả"), icon: <Compass className="w-4 h-4" /> },
    { key: "homestay_camping", label: st.filters?.homestay || (isEn ? "Homestay & Camping" : "Homestay View Núi Hồ"), icon: <Tent className="w-4 h-4" /> },
    { key: "hotel_resort", label: st.filters?.hotel || (isEn ? "Hotels" : "Khách Sạn Tiện Nghi"), icon: <Hotel className="w-4 h-4" /> },
    { key: "motel", label: st.filters?.guesthouse || (isEn ? "Motels & Guesthouses" : "Nhà Nghỉ Bình Dân"), icon: <Building2 className="w-4 h-4" /> },
  ];

  return (
    <section className="bg-[#FFFDF7] p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-[#26221B]/8 shadow-xs font-display">
      <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
        {filterTabs.map((tab) => {
          const isSelected = activeFilter === tab.key;
          const count = counts[tab.key] || 0;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`whitespace-nowrap px-4 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                isSelected
                  ? "bg-[#0E8C7F] text-white shadow-xs"
                  : "bg-[#FAF3E7] text-[#6B6355] hover:bg-[#FAF3E7]/80 border border-[#26221B]/8"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                isSelected ? "bg-white/20 text-white" : "bg-[#26221B]/5 text-[#6B6355]"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
