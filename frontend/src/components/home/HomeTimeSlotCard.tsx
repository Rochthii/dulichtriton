'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, Navigation } from 'lucide-react';
import { resolvePlaceExternalLinks } from '@/lib/externalLinks';
import { sanitizeDescription } from '@/lib/dataSanitizer';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { TimeSlotPlace } from './HomeTimeSlotSection';

interface HomeTimeSlotCardProps {
  place: TimeSlotPlace;
}

export default function HomeTimeSlotCard({ place }: HomeTimeSlotCardProps) {
  const { language, dict } = useLanguage();
  const isEn = language === 'en';

  const { maps } = resolvePlaceExternalLinks({
    name: place.name,
    commune: place.commune,
    category: place.category,
    tiktok_videos: place.tiktok_videos,
  });

  const displayName = isEn && place.name_en ? place.name_en : place.name;
  const displayDesc = isEn && place.description_en ? place.description_en : sanitizeDescription(place.description, place.name, place.commune, place.category);
  const displayCost = isEn && place.cost_vnd_en ? place.cost_vnd_en : place.cost_vnd;

  return (
    <div className="bg-[#FFFDF7] rounded-2xl sm:rounded-[26px] border border-[#26221B]/8 shadow-[0_2px_8px_rgba(38,34,27,0.06)] hover:shadow-[0_8px_24px_rgba(38,34,27,0.12)] transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:-translate-y-1">
      {/* Thumbnail & Title */}
      <Link
        href={`/places/${place.slug || place.id}`}
        prefetch={true}
        className="block relative aspect-[4/3] w-full overflow-hidden bg-slate-100 cursor-pointer"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={place.image_url}
          alt={displayName}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#26221B]/75 via-[#26221B]/15 to-transparent" />
        
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
          <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[11px] font-bold bg-[#0E8C7F]/90 text-white backdrop-blur-md shadow-xs border border-[#0E8C7F]/30 font-display">
            {place.commune}
          </span>
        </div>

        <div className="absolute bottom-2 left-2 sm:left-3 right-2 sm:right-3 text-white">
          <h3 className="font-display text-xs sm:text-base font-bold line-clamp-1 drop-shadow-sm text-[#FFFDF7] group-hover:text-[#FFD37A] transition-colors">
            {displayName}
          </h3>
        </div>
      </Link>

      {/* Body Content */}
      <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2 sm:space-y-3 font-body">
        <p className="text-[10px] sm:text-xs text-[#6B6355] line-clamp-2 leading-relaxed">
          {displayDesc}
        </p>

        <div className="pt-1.5 sm:pt-2 border-t border-[#26221B]/6 flex items-center justify-between text-[9px] sm:text-xs font-display">
          <div className="flex items-center gap-1 text-[#0E8C7F] truncate">
            <Clock className="w-3 h-3 shrink-0" />
            <span className="truncate">{place.golden_time_windows?.[0] || '06:00 - 08:30'}</span>
          </div>
          <span className="font-bold text-[#D9822B] shrink-0 text-[10px] sm:text-[11px]">{displayCost}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-2 pt-1 font-display">
          <Link
            href={`/places/${place.slug || place.id}`}
            className="flex-1 text-center py-2 px-1 sm:px-3 rounded-xl sm:rounded-full bg-[#FAF3E7] hover:bg-[#0E8C7F] hover:text-white text-[#0E8C7F] text-[10px] sm:text-xs font-bold transition-all tap-bounce min-h-[38px] flex items-center justify-center touch-manipulation"
          >
            {dict.common.actions?.viewDetail || (isEn ? 'Details' : 'Chi Tiết')}
          </Link>
          <a
            href={maps.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-0.5 sm:gap-1 py-2 px-1 sm:px-3 rounded-xl sm:rounded-full bg-[#F0A32F] hover:bg-[#C97F1B] text-[#26221B] hover:text-white text-[10px] sm:text-xs font-bold shadow-xs transition-all tap-bounce min-h-[38px] touch-manipulation"
          >
            <Navigation className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <span>{dict.common.actions?.directions || (isEn ? 'Directions' : 'Chỉ Đường')}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
