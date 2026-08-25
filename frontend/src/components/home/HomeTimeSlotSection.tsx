'use client';

import React from 'react';
import Link from 'next/link';
import {
  Users,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  Clock,
  Navigation
} from 'lucide-react';
import { resolvePlaceExternalLinks } from '@/lib/externalLinks';
import { sanitizeDescription } from '@/lib/dataSanitizer';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export type TimeSlot = 'morning' | 'noon' | 'afternoon' | 'evening';
export type AudienceFilter = 'all' | 'youth' | 'family' | 'trekking' | 'spiritual';

export interface TimeSlotPlace {
  id: string;
  slug: string;
  name: string;
  name_en?: string;
  category: string;
  category_en?: string;
  commune: string;
  rating: number;
  image_url: string;
  description?: string;
  description_en?: string;
  golden_time_windows?: string[];
  cost_vnd?: string;
  cost_vnd_en?: string;
  tiktok_videos?: any;
}

interface HomeTimeSlotSectionProps {
  activeAudience: AudienceFilter;
  setActiveAudience: (aud: AudienceFilter) => void;
  activeTimeSlot: TimeSlot;
  setActiveTimeSlot: (slot: TimeSlot) => void;
  places: TimeSlotPlace[];
}

export default function HomeTimeSlotSection({
  activeAudience,
  setActiveAudience,
  activeTimeSlot,
  setActiveTimeSlot,
  places,
}: HomeTimeSlotSectionProps) {
  const { language, dict } = useLanguage();
  const tsDict = dict.home.timeSlotsSection;
  const isEn = language === 'en';

  // Filter spots by time of day & audience persona
  const filteredSpots = places.filter((p) => {
    const name = (p.name || '').toLowerCase();
    const cat = (p.category || '').toLowerCase();

    // Audience filtering
    if (activeAudience === 'youth') {
      const matchYouth = name.includes('tà pạ') || name.includes('cổng trời') || name.includes('vồ hội') || name.includes('thốt nốt') || cat.includes('check-in');
      if (!matchYouth) return false;
    } else if (activeAudience === 'family') {
      const matchFamily = name.includes('chùa') || name.includes('gà đốt') || name.includes('tức dụp') || name.includes('hồ ô thum') || name.includes('nhà mồ');
      if (!matchFamily) return false;
    } else if (activeAudience === 'trekking') {
      const matchTrek = name.includes('cô tô') || name.includes('núi') || name.includes('suối vàng') || name.includes('vồ hội') || name.includes('săn mây');
      if (!matchTrek) return false;
    } else if (activeAudience === 'spiritual') {
      const matchSpiritual = name.includes('chùa') || name.includes('nhà mồ') || name.includes('phi lai') || cat.includes('spiritual') || cat.includes('culture');
      if (!matchSpiritual) return false;
    }

    // Time slot filtering
    if (activeTimeSlot === 'morning') {
      return (
        name.includes('tà pạ') ||
        name.includes('cô tô') ||
        name.includes('săn mây') ||
        name.includes('koh kas') ||
        name.includes('chùa') ||
        cat.includes('spiritual') ||
        cat.includes('nature')
      );
    }
    if (activeTimeSlot === 'noon') {
      return (
        name.includes('gà đốt') ||
        name.includes('cháo bò') ||
        name.includes('ô thum') ||
        name.includes('quán') ||
        name.includes('ăn') ||
        cat.includes('food')
      );
    }
    if (activeTimeSlot === 'afternoon') {
      return (
        name.includes('soài so') ||
        name.includes('soài chék') ||
        name.includes('châu lăng') ||
        name.includes('cổng trời') ||
        name.includes('đu đủ') ||
        name.includes('bánh bò') ||
        cat.includes('check-in')
      );
    }
    if (activeTimeSlot === 'evening') {
      return (
        name.includes('chợ') ||
        name.includes('đêm') ||
        name.includes('cà phê') ||
        name.includes('coffee') ||
        name.includes('thị trấn') ||
        name.includes('lẩu')
      );
    }
    return true;
  }).slice(0, 4);

  return (
    <section className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#0E8C7F] uppercase tracking-wider mb-1 font-display">
            <Users className="w-4 h-4" />
            <span>{tsDict?.badge || (isEn ? 'Custom Experience Recommendations' : 'Gợi Ý Trải Nghiệm Tùy Chỉnh')}</span>
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[#26221B] tracking-tight">
            {tsDict?.title || (isEn ? 'Ideal Destinations by Time Slot & Audience' : 'Điểm Đến Lý Tưởng Theo Khung Giờ & Đối Tượng')}
          </h2>
        </div>

        {/* Persona Chips */}
        <div className="flex flex-wrap items-center gap-1.5 font-display">
          {[
            { key: 'all', label: tsDict?.audiences?.all || (isEn ? 'All' : 'Tất Cả') },
            { key: 'youth', label: tsDict?.audiences?.youth || (isEn ? '📸 Photo Check-in' : '📸 Sống Ảo') },
            { key: 'family', label: tsDict?.audiences?.family || (isEn ? '👨‍👩‍👧‍👦 Family' : '👨‍👩‍👧‍👦 Gia Đình') },
            { key: 'trekking', label: tsDict?.audiences?.trekking || (isEn ? '🥾 Trekking & Clouds' : '🥾 Săn Mây') },
            { key: 'spiritual', label: tsDict?.audiences?.spiritual || (isEn ? '🙏 Spiritual' : '🙏 Tâm Linh') },
          ].map((aud) => (
            <button
              key={aud.key}
              onClick={() => setActiveAudience(aud.key as AudienceFilter)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all tap-bounce cursor-pointer ${
                activeAudience === aud.key
                  ? 'bg-[#0E8C7F] text-white shadow-xs'
                  : 'bg-[#FFFDF7] border border-[#26221B]/8 text-[#6B6355] hover:border-[#0E8C7F]/30'
              }`}
            >
              {aud.label}
            </button>
          ))}
        </div>
      </div>

      {/* Time Slots Filter Tabs */}
      <div className="grid grid-cols-4 gap-1 sm:gap-2 bg-[#FFFDF7] p-1 sm:p-1.5 rounded-2xl sm:rounded-[22px] border border-[#26221B]/8 shadow-xs font-display">
        {[
          {
            key: 'morning',
            mobileLabel: tsDict?.slots?.morning?.mobileLabel || (isEn ? 'Morning' : 'Sáng sớm'),
            desktopLabel: tsDict?.slots?.morning?.desktopLabel || (isEn ? 'Early Morning (06:00 - 08:30)' : 'Sáng sớm (06:00 - 08:30)'),
            icon: Sunrise,
            desc: tsDict?.slots?.morning?.desc || (isEn ? 'Cloud Hunting & Ta Pa Lake' : 'Săn mây & Hồ Tà Pạ'),
          },
          {
            key: 'noon',
            mobileLabel: tsDict?.slots?.noon?.mobileLabel || (isEn ? 'Noon' : 'Buổi trưa'),
            desktopLabel: tsDict?.slots?.noon?.desktopLabel || (isEn ? 'Noon (11:00 - 13:30)' : 'Buổi trưa (11:00 - 13:30)'),
            icon: Sun,
            desc: tsDict?.slots?.noon?.desc || (isEn ? 'O Thum Roasted Chicken' : 'Gà Đốt Ô Thum'),
          },
          {
            key: 'afternoon',
            mobileLabel: tsDict?.slots?.afternoon?.mobileLabel || (isEn ? 'Afternoon' : 'Chiều tà'),
            desktopLabel: tsDict?.slots?.afternoon?.desktopLabel || (isEn ? 'Late Afternoon (15:30 - 17:30)' : 'Chiều tà (15:30 - 17:30)'),
            icon: Sunset,
            desc: tsDict?.slots?.afternoon?.desc || (isEn ? 'Koh Kas Heaven Gate' : 'Cổng trời Koh Kas'),
          },
          {
            key: 'evening',
            mobileLabel: tsDict?.slots?.evening?.mobileLabel || (isEn ? 'Evening' : 'Buổi tối'),
            desktopLabel: tsDict?.slots?.evening?.desktopLabel || (isEn ? 'Evening (18:00 - 21:00)' : 'Buổi tối (18:00 - 21:00)'),
            icon: Moon,
            desc: tsDict?.slots?.evening?.desc || (isEn ? 'Night Market & Town' : 'Chợ đêm & Phố'),
          },
        ].map((slot) => {
          const Icon = slot.icon;
          const isActive = activeTimeSlot === slot.key;
          return (
            <button
              key={slot.key}
              type="button"
              onClick={() => setActiveTimeSlot(slot.key as TimeSlot)}
              className={`py-1.5 sm:py-2.5 px-1 sm:px-2 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center text-center transition-all tap-bounce cursor-pointer ${
                isActive
                  ? 'bg-[#F0A32F] text-[#26221B] shadow-xs font-black'
                  : 'hover:bg-[#FAF3E7] text-[#6B6355]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 mb-0.5 sm:mb-1 ${isActive ? 'text-[#26221B]' : 'text-[#0E8C7F]'}`} />
              <span className="text-[10px] sm:text-xs font-bold leading-tight line-clamp-1">
                <span className="sm:hidden">{slot.mobileLabel}</span>
                <span className="hidden sm:inline">{slot.desktopLabel}</span>
              </span>
              <span className={`text-[9px] hidden sm:block mt-0.5 ${isActive ? 'text-[#26221B]/80' : 'text-[#6B6355]/70'}`}>
                {slot.desc}
              </span>
            </button>
          );
        })}
      </div>

      {/* Time Slot POI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 pt-2">
        {filteredSpots.map((place) => {
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
            <div
              key={place.id}
              className="bg-[#FFFDF7] rounded-2xl sm:rounded-[26px] border border-[#26221B]/8 shadow-[0_2px_8px_rgba(38,34,27,0.06)] hover:shadow-[0_8px_24px_rgba(38,34,27,0.12)] transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:-translate-y-1"
            >
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
                    href={`/places/${place.slug}`}
                    className="flex-1 text-center py-1.5 sm:py-2 px-1 sm:px-3 rounded-xl sm:rounded-full bg-[#FAF3E7] hover:bg-[#0E8C7F] hover:text-white text-[#0E8C7F] text-[10px] sm:text-xs font-bold transition-all tap-bounce"
                  >
                    {dict.common.actions?.viewDetail || (isEn ? 'Details' : 'Chi Tiết')}
                  </Link>
                  <a
                    href={maps.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-0.5 sm:gap-1 py-1.5 sm:py-2 px-1 sm:px-3 rounded-xl sm:rounded-full bg-[#F0A32F] hover:bg-[#C97F1B] text-[#26221B] hover:text-white text-[10px] sm:text-xs font-bold shadow-xs transition-all tap-bounce"
                  >
                    <Navigation className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    <span>{dict.common.actions?.directions || (isEn ? 'Directions' : 'Chỉ Đường')}</span>
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
