'use client';

import React from 'react';
import Link from 'next/link';
import { Star, MapPin, LocateFixed, Clock, Navigation } from 'lucide-react';
import { Place } from '@/components/PlaceCard';

interface MapSelectedPlaceSheetProps {
  place: Place | null;
}

export default function MapSelectedPlaceSheet({ place }: MapSelectedPlaceSheetProps) {
  if (!place) {
    return (
      <div className="bg-[#FFFDF7] rounded-3xl p-6 border border-[#26221B]/10 text-center text-xs text-[#6B6355] font-display">
        Chọn một địa điểm trên bản đồ để xem thông tin chi tiết và dẫn đường.
      </div>
    );
  }

  const distanceVal = (place as any).distance;
  const driveTime = (place as any).driveTimeMin;

  return (
    <div className="bg-[#FFFDF7] rounded-3xl p-4 sm:p-5 border border-[#26221B]/10 shadow-md space-y-3.5 sticky top-20">
      <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-slate-900">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={place.image_url || 'https://res.cloudinary.com/dhjesnejt/image/upload/f_auto,q_auto:best,w_1600,c_fill/v1786758535/tri_ton_hero/hero_dong_thot_not.jpg'}
          alt={place.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        
        <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-white/95 text-[#26221B] font-extrabold text-xs flex items-center gap-1 shadow-xs font-display">
          <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
          <span>{place.rating || 4.8}</span>
        </span>

        <div className="absolute bottom-2.5 left-3 right-3 text-white">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#FFD37A] font-mono">
            {place.commune}
          </span>
          <h3 className="font-display font-black text-base sm:text-lg leading-tight text-white line-clamp-1">
            {place.name}
          </h3>
        </div>
      </div>

      {/* Distance from User GPS Badge */}
      {distanceVal !== undefined && distanceVal !== null && (
        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/60 text-emerald-800 text-xs font-bold flex items-center justify-between font-display">
          <span className="flex items-center gap-1">
            <LocateFixed className="w-3.5 h-3.5 text-emerald-600" />
            <span>Cách Bạn: {distanceVal} km</span>
          </span>
          <span className="flex items-center gap-1 text-emerald-700 font-mono text-[11px]">
            <Clock className="w-3 h-3" /> ~{driveTime} phút xe máy
          </span>
        </div>
      )}

      <div className="space-y-1.5 text-xs text-[#6B6355]">
        {place.address && (
          <div className="flex items-center gap-1.5 text-[#26221B]">
            <MapPin className="w-3.5 h-3.5 text-[#F26B3A] shrink-0" />
            <span className="truncate">{place.address}</span>
          </div>
        )}
        <p className="text-[11px] leading-relaxed line-clamp-3">
          {place.description || 'Địa điểm nổi bật tại Tri Tôn với cảnh sắc thiên nhiên và văn hóa đặc sắc.'}
        </p>
      </div>

      {/* Action Buttons with 1-Touch Turn-by-Turn GPS */}
      <div className="pt-2 flex flex-col gap-2">
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' ' + place.commune + ' Tri Tôn An Giang')}`}
          target="_blank"
          rel="noreferrer"
          className="min-h-[44px] w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 active:bg-emerald-900 text-white font-black text-xs sm:text-sm text-center transition-all shadow-sm font-display flex items-center justify-center gap-2 active:scale-98 cursor-pointer touch-manipulation"
        >
          <Navigation className="w-4 h-4 fill-white" />
          <span>📍 Mở App Google Maps Dẫn Đường</span>
        </a>

        <Link
          href={`/places/${place.slug || place.id}`}
          className="min-h-[40px] w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-slate-950 font-black text-xs text-center transition-colors font-display flex items-center justify-center cursor-pointer touch-manipulation"
        >
          Xem Toàn Bộ Hình Ảnh & Video
        </Link>
      </div>
    </div>
  );
}
