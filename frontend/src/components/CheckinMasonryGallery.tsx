'use client';

import React from 'react';
import { Camera, Sparkles, MapPin, Eye } from 'lucide-react';
import { CheckinSpotItem } from '@/lib/dataSanitizer';

interface CheckinMasonryGalleryProps {
  spots: CheckinSpotItem[];
  placeName: string;
}

export default function CheckinMasonryGallery({ spots, placeName }: CheckinMasonryGalleryProps) {
  if (!spots || spots.length === 0) return null;

  return (
    <div className="space-y-4 font-body">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-base sm:text-lg font-bold text-[#26221B] flex items-center gap-2">
            <Camera className="w-5 h-5 text-[#0E8C7F]" />
            <span>Góc Sống Ảo & Tọa Độ Check-in Đẹp Nhất</span>
          </h3>
          <p className="text-xs text-[#6B6355] mt-0.5">
            Gợi ý các góc chụp ảnh bắt trọn khoảnh khắc đẹp tại {placeName}
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-[#FAF3E7] text-[#0E8C7F] text-xs font-bold font-display">
          {spots.length} Tọa độ
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {spots.map((spot, idx) => (
          <div
            key={idx}
            className="group relative rounded-[22px] overflow-hidden bg-[#FAF3E7] border border-[#26221B]/8 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
          >
            {/* Image */}
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-200">
              <img
                src={spot.photo_url || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop'}
                alt={spot.title}
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#26221B]/80 via-transparent to-transparent" />
              
              <div className="absolute top-2.5 left-2.5">
                <span className="px-2.5 py-0.5 rounded-full bg-[#151B34]/90 text-[#FFD37A] text-[10px] font-bold font-display border border-[#FFD37A]/30">
                  Góc #{idx + 1}
                </span>
              </div>

              <div className="absolute bottom-2 left-3 right-3 text-white">
                <h4 className="font-display text-sm font-bold text-[#FFFDF7] line-clamp-1">
                  {spot.title}
                </h4>
              </div>
            </div>

            {/* Tip body */}
            <div className="p-3.5 space-y-1 bg-[#FFFDF7]">
              <div className="flex items-start gap-1.5 text-xs text-[#6B6355]">
                <Sparkles className="w-3.5 h-3.5 text-[#F0A32F] shrink-0 mt-0.5" />
                <p className="line-clamp-2 leading-relaxed text-[11px] font-medium">{spot.tip}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
