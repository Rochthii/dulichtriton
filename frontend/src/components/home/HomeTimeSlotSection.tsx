'use client';

import React from 'react';
import {
  Users,
  Sunrise,
  Sun,
  Sunset,
  Moon
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import HomeTimeSlotCard from './HomeTimeSlotCard';

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
          <h2 className="text-xl sm:text-2xl font-black text-[#26221B] font-display">
            {tsDict?.title || (isEn ? 'Plan by Golden Time & Travel Persona' : 'Lịch Trình Theo Giờ Vàng & Phong Cách')}
          </h2>
        </div>

        {/* Persona Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none font-display">
          {[
            { key: 'all', label: tsDict?.audiences?.all || (isEn ? 'All' : 'Tất cả') },
            { key: 'youth', label: tsDict?.audiences?.youth || (isEn ? 'Check-in & Youth' : 'Giới trẻ & Check-in') },
            { key: 'family', label: tsDict?.audiences?.family || (isEn ? 'Family & Dining' : 'Gia đình & Ẩm thực') },
            { key: 'trekking', label: tsDict?.audiences?.trekking || (isEn ? 'Trekking & Mountains' : 'Trekking & Leo núi') },
            { key: 'spiritual', label: tsDict?.audiences?.spiritual || (isEn ? 'Spiritual Heritage' : 'Tâm linh & Di sản') },
          ].map((aud) => (
            <button
              key={aud.key}
              onClick={() => setActiveAudience(aud.key as AudienceFilter)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all tap-bounce cursor-pointer ${
                activeAudience === aud.key
                  ? 'bg-[#0E8C7F] text-white shadow-xs'
                  : 'bg-[#FFFDF7] text-[#6B6355] border border-[#26221B]/8 hover:border-[#0E8C7F]/40'
              }`}
            >
              {aud.label}
            </button>
          ))}
        </div>
      </div>

      {/* Time Slot Tab Bar */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2 p-1 sm:p-1.5 rounded-2xl bg-[#FFFDF7] border border-[#26221B]/8 font-display">
        {[
          { key: 'morning', icon: Sunrise, desktopLabel: tsDict?.slots?.morning?.desktopLabel || (isEn ? 'Early Morning (05:00 - 08:30)' : 'Sáng sớm (05:00 - 08:30)'), mobileLabel: tsDict?.slots?.morning?.mobileLabel || (isEn ? 'Morning' : 'Sáng sớm'), desc: tsDict?.slots?.morning?.desc || (isEn ? 'Cloud hunting, sunrise' : 'Săn mây, ngắm bình minh') },
          { key: 'noon', icon: Sun, desktopLabel: tsDict?.slots?.noon?.desktopLabel || (isEn ? 'Midday (11:00 - 13:30)' : 'Trưa tròn (11:00 - 13:30)'), mobileLabel: tsDict?.slots?.noon?.mobileLabel || (isEn ? 'Noon' : 'Buổi trưa'), desc: tsDict?.slots?.noon?.desc || (isEn ? 'O Thum roasted chicken' : 'Gà đốt Ô Thum, cháo bò') },
          { key: 'afternoon', icon: Sunset, desktopLabel: tsDict?.slots?.afternoon?.desktopLabel || (isEn ? 'Afternoon (15:00 - 17:30)' : 'Chiều tà (15:00 - 17:30)'), mobileLabel: tsDict?.slots?.afternoon?.mobileLabel || (isEn ? 'Afternoon' : 'Chiều tà'), desc: tsDict?.slots?.afternoon?.desc || (isEn ? 'Heart palm trees, snacks' : 'Thốt nốt trái tim, ăn vặt') },
          { key: 'evening', icon: Moon, desktopLabel: tsDict?.slots?.evening?.desktopLabel || (isEn ? 'Night (18:30 - 22:00)' : 'Đêm về (18:30 - 22:00)'), mobileLabel: tsDict?.slots?.evening?.mobileLabel || (isEn ? 'Night' : 'Buổi tối'), desc: tsDict?.slots?.evening?.desc || (isEn ? 'Night market, acoustic cafe' : 'Chợ đêm, cà phê nhạc') },
        ].map((slot) => {
          const Icon = slot.icon;
          const isActive = activeTimeSlot === slot.key;
          return (
            <button
              key={slot.key}
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
        {filteredSpots.map((place) => (
          <HomeTimeSlotCard key={place.id} place={place} />
        ))}
      </div>
    </section>
  );
}
