'use client';

import React from 'react';
import { Layers, MapPin } from 'lucide-react';

interface CategoryItem {
  key: string;
  label: string;
}

interface MapCategoryFilterBarProps {
  categories: CategoryItem[];
  communes: string[];
  selectedCategory: string;
  selectedCommune: string;
  onSelectCategory: (key: string) => void;
  onSelectCommune: (commune: string) => void;
}

export default function MapCategoryFilterBar({
  categories,
  communes,
  selectedCategory,
  selectedCommune,
  onSelectCategory,
  onSelectCommune,
}: MapCategoryFilterBarProps) {
  return (
    <div className="space-y-3">
      {/* Category Filter */}
      <div>
        <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold text-[#26221B] uppercase tracking-wider mb-1.5 font-display">
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#0E8C7F]" />
            <span>Phân Loại Danh Mục</span>
          </div>
          <span className="text-[10px] text-[#6B6355] font-mono sm:hidden">Vuốt ngang ➔</span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none font-display">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => onSelectCategory(cat.key)}
              className={`min-h-[38px] whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 active:scale-95 cursor-pointer touch-manipulation ${
                selectedCategory === cat.key
                  ? 'bg-[#0E8C7F] text-white shadow-xs'
                  : 'bg-[#FAF3E7] border border-[#26221B]/8 text-[#6B6355] hover:border-[#0E8C7F]/40'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Commune Filter (15 Xã / Thị Trấn) */}
      <div>
        <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold text-[#26221B] uppercase tracking-wider mb-1.5 font-display">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#F0A32F]" />
            <span>Khu Vực Hành Chính (15 Xã & Thị Trấn)</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none font-display">
          {communes.map((c, i) => (
            <button
              key={i}
              onClick={() => onSelectCommune(c)}
              className={`min-h-[38px] whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 active:scale-95 cursor-pointer touch-manipulation ${
                selectedCommune === c
                  ? 'bg-[#F0A32F] text-white shadow-xs'
                  : 'bg-[#FAF3E7] border border-[#26221B]/8 text-[#6B6355] hover:border-[#F0A32F]/40'
              }`}
            >
              {c === 'all' ? 'Toàn Tri Tôn (15 Xã/TT)' : c}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
