'use client';

import React from 'react';
import { Utensils, Search, MapPin } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export type FoodSpecialtyCategory = 'all' | 'ga_dot' | 'bo_7_mon' | 'chao_bo' | 'banh_bo' | 'cafe' | 'night';

interface FoodFilterBarProps {
  selectedCategory: FoodSpecialtyCategory;
  setSelectedCategory: (cat: FoodSpecialtyCategory) => void;
  selectedCommune: string;
  setSelectedCommune: (com: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  communes: string[];
  categoryCounts: Record<string, number>;
}

export default function FoodFilterBar({
  selectedCategory,
  setSelectedCategory,
  selectedCommune,
  setSelectedCommune,
  searchQuery,
  setSearchQuery,
  communes,
  categoryCounts,
}: FoodFilterBarProps) {
  const { language, dict } = useLanguage();
  const fd = dict.food;
  const isEn = language === 'en';

  const specialtyFilters: { key: FoodSpecialtyCategory; label: string; icon: string }[] = [
    { key: 'all', label: fd.filters.all, icon: '🍽️' },
    { key: 'ga_dot', label: fd.filters.ga_dot, icon: '🍗' },
    { key: 'bo_7_mon', label: fd.filters.bo_7_mon, icon: '🥩' },
    { key: 'chao_bo', label: fd.filters.chao_bo, icon: '🍲' },
    { key: 'banh_bo', label: fd.filters.banh_bo, icon: '🥞' },
    { key: 'cafe', label: fd.filters.cafe, icon: '☕' },
    { key: 'night', label: fd.filters.night, icon: '🌙' },
  ];

  return (
    <section className="bg-[#FFFDF7] p-4 md:p-6 rounded-[28px] border border-[#26221B]/8 shadow-xs space-y-4 font-body">
      {/* Specialty Category Pills */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-[#6B6355] uppercase tracking-wider font-display flex items-center gap-1.5">
          <Utensils className="w-3.5 h-3.5 text-[#0E8C7F]" />
          <span>{isEn ? 'Seven Mountains Cuisine Categories:' : 'Phân Loại Đặc Sản Bảy Núi:'}</span>
        </span>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none font-display">
          {specialtyFilters.map((cat) => {
            const count = categoryCounts[cat.key] || 0;
            const isSelected = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 tap-bounce ${
                  isSelected
                    ? "bg-[#0E8C7F] text-white shadow-xs"
                    : "bg-[#FAF3E7] text-[#6B6355] hover:bg-[#FAF3E7]/80 border border-[#26221B]/8"
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isSelected ? "bg-white/20 text-white" : "bg-[#26221B]/5 text-[#6B6355]"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Input & Communes Filter */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between pt-2 border-t border-[#26221B]/6 font-body">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#6B6355] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={fd.hero.searchPlaceholder}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#FAF3E7] border border-[#26221B]/10 text-xs font-medium text-[#26221B] placeholder-[#6B6355]/70 focus:outline-none focus:border-[#0E8C7F]"
          />
        </div>

        {/* Communes Filter Horizontal Scroll */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none w-full md:w-auto font-display">
          <span className="text-xs font-bold text-[#6B6355] whitespace-nowrap mr-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#0E8C7F]" /> {isEn ? 'Commune:' : 'Xã:'}
          </span>
          {communes.map((commune) => (
            <button
              key={commune}
              onClick={() => setSelectedCommune(commune)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
                selectedCommune === commune
                  ? "bg-[#26221B] text-white shadow-xs"
                  : "bg-[#FAF3E7] text-[#6B6355] hover:bg-[#FAF3E7]/80 border border-[#26221B]/8"
              }`}
            >
              {commune === 'Tất cả' && isEn ? 'All' : commune}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
