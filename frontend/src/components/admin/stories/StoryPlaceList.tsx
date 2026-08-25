'use client';

import React from 'react';
import { MapPin, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

export interface PlaceItem {
  id: string;
  slug: string;
  name: string;
  commune: string;
  category: string;
  tourism_category?: string;
  detailed_story?: string;
  description?: string;
  rating?: number;
  image_url?: string;
}

interface StoryPlaceListProps {
  places: PlaceItem[];
  selectedPlaceId: string;
  onSelectPlace: (place: PlaceItem) => void;
}

export default function StoryPlaceList({
  places,
  selectedPlaceId,
  onSelectPlace,
}: StoryPlaceListProps) {
  if (places.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-[#6B6355] bg-[#FFFDF7] rounded-3xl border border-[#26221B]/8">
        Không có địa điểm nào phù hợp với bộ lọc.
      </div>
    );
  }

  return (
    <div className="bg-[#FFFDF7] rounded-3xl border border-[#26221B]/10 overflow-hidden shadow-xs font-body max-h-[680px] flex flex-col">
      <div className="p-3.5 bg-[#FAF3E7] border-b border-[#26221B]/10 font-display font-bold text-xs text-[#26221B] flex items-center justify-between">
        <span>Danh Sách 149 Điểm Đến</span>
        <span className="text-[11px] text-[#6B6355] font-mono">{places.length} POIs</span>
      </div>

      <div className="divide-y divide-[#26221B]/6 overflow-y-auto flex-1 scrollbar-thin">
        {places.map((place) => {
          const isSelected = place.id === selectedPlaceId;
          const hasStory = !!(place.detailed_story && place.detailed_story.trim().length > 20);

          return (
            <button
              key={place.id}
              onClick={() => onSelectPlace(place)}
              className={`w-full text-left p-3.5 transition-all cursor-pointer flex items-start justify-between gap-2 ${
                isSelected
                  ? 'bg-[#0E8C7F]/10 border-l-4 border-[#0E8C7F]'
                  : 'hover:bg-[#FAF3E7]/50'
              }`}
            >
              <div className="space-y-1">
                <span className={`font-display font-bold text-xs block line-clamp-1 ${isSelected ? 'text-[#0E8C7F]' : 'text-[#26221B]'}`}>
                  {place.name}
                </span>
                <span className="text-[11px] text-[#6B6355] flex items-center gap-1 font-mono">
                  <MapPin className="w-3 h-3 text-[#6B6355]" />
                  <span>{place.commune}</span>
                </span>
              </div>

              <div className="shrink-0">
                {hasStory ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                    <span>Có sự tích</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
                    <AlertCircle className="w-2.5 h-2.5 text-amber-600" />
                    <span>Trống</span>
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
