'use client';

import React from 'react';
import { Compass } from 'lucide-react';
import PlaceCard, { Place } from '@/components/PlaceCard';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface PlacesGridProps {
  places: Place[];
  loading: boolean;
  onResetFilters: () => void;
}

export default function PlacesGrid({
  places,
  loading,
  onResetFilters,
}: PlacesGridProps) {
  const { language, dict } = useLanguage();
  const isEn = language === 'en';

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base md:text-lg font-black text-[#26221B] font-display flex items-center gap-2">
          <Compass className="w-5 h-5 text-[#0E8C7F]" />
          <span>
            {isEn
              ? `List of 149 Verified Destinations (${places.length} Spots)`
              : `Danh Sách 149 Địa Điểm Đã Xác Minh (${places.length} Địa Điểm)`}
          </span>
        </h2>
        <span className="text-xs text-[#6B6355] font-medium font-mono">
          {isEn ? "100% Verified Field Data" : "Dữ liệu thực địa 100%"}
        </span>
      </div>

      {loading ? (
        <div className="py-16 text-center text-[#6B6355] font-bold font-body">
          {isEn ? "Loading 149 Tri Ton tourism destinations..." : "Đang tải danh mục 149 địa điểm du lịch Tri Tôn..."}
        </div>
      ) : places.length === 0 ? (
        <div className="py-16 text-center bg-[#FFFDF7] rounded-3xl border border-[#26221B]/8 p-8 space-y-3 font-body">
          <Compass className="w-8 h-8 text-[#6B6355]/40 mx-auto" />
          <div className="font-bold text-sm text-[#26221B]">
            {dict.places?.header?.noResults || (isEn ? "No destinations found matching the selected filters." : "Không tìm thấy địa điểm nào phù hợp.")}
          </div>
          <button
            onClick={onResetFilters}
            className="px-4 py-2 rounded-xl bg-[#0E8C7F] text-white text-xs font-bold cursor-pointer font-display"
          >
            {dict.places?.header?.clearFilters || (isEn ? "Clear all filters" : "Xóa tất cả bộ lọc")}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-5">
          {places.map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </div>
      )}
    </section>
  );
}
