'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Sparkles, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

type Duration = 'half-day' | '1-day' | '2-day' | '3-day';
type Budget = 'budget' | 'comfort' | 'luxury';

const MINI_LOOKUP: Record<
  Duration,
  Record<Budget, { slug: string; name: string; name_en: string; cost: string; cost_en: string }>
> = {
  'half-day': {
    budget:  { slug: 'express-nua-ngay', name: 'Express Nửa Ngày', name_en: 'Express Half-Day', cost: '50k–100k', cost_en: '$2–$4' },
    comfort: { slug: 'sunset-dinner-tour', name: 'Sunset & Dinner Tour', name_en: 'Sunset & Dinner Tour', cost: '300k–500k', cost_en: '$12–$20' },
    luxury:  { slug: 'hoang-hon-bbq-ga-dot-dem', name: 'Hoàng Hôn + BBQ Gà Đốt', name_en: 'Sunset + BBQ Chicken Tour', cost: '300k–500k', cost_en: '$12–$20' },
  },
  '1-day': {
    budget:  { slug: 'song-ao-checkin-1-ngay', name: 'Sống Ảo Check-in 1 Ngày', name_en: '1-Day Photo Check-in', cost: '200k–400k', cost_en: '$8–$16' },
    comfort: { slug: 'kinh-dien-1-ngay', name: 'Kinh Điển 1 Ngày Tri Tôn', name_en: 'Classic 1-Day Tri Ton', cost: '300k–500k', cost_en: '$12–$20' },
    luxury:  { slug: 'food-tour-am-thuc-1-ngay-dem', name: 'Food Tour Ẩm Thực', name_en: 'Seven Mountains Food Tour', cost: '600k–1tr', cost_en: '$24–$40' },
  },
  '2-day': {
    budget:  { slug: 'backpacker-budget-2n1d', name: 'Backpacker Budget 2N1Đ', name_en: 'Backpacker Budget 2D1N', cost: '250k–450k', cost_en: '$10–$18' },
    comfort: { slug: 'weekend-2n1d-day-dem', name: 'Weekend 2N1Đ Đầy Đủ', name_en: 'Full Weekend 2D1N', cost: '900k–1.5tr', cost_en: '$36–$60' },
    luxury:  { slug: 'luxury-chill-2n1d', name: 'Luxury Chill 2N1Đ', name_en: 'Luxury Chill 2D1N', cost: '1tr–2tr', cost_en: '$40–$80' },
  },
  '3-day': {
    budget:  { slug: 'kham-pha-sau-3n2d', name: 'Khám Phá Sâu 3N2Đ', name_en: 'Deep Discovery 3D2N', cost: '1.5tr–2.5tr', cost_en: '$60–$100' },
    comfort: { slug: 'full-experience-3n2d', name: 'Full Experience 3N2Đ', name_en: 'Full Experience 3D2N', cost: '1.8tr–3tr', cost_en: '$72–$120' },
    luxury:  { slug: 'full-experience-3n2d', name: 'Full Experience 3N2Đ', name_en: 'Full Experience 3D2N', cost: '1.8tr–3tr', cost_en: '$72–$120' },
  },
};

export default function SmartTripBuilderMini() {
  const { language, dict } = useLanguage();
  const stm = dict.home.smartTripMini;
  const isEn = language === 'en';

  const [duration, setDuration] = useState<Duration>('1-day');
  const [budget, setBudget] = useState<Budget>('comfort');

  const durationsList: { key: Duration; label: string }[] = useMemo(() => [
    { key: 'half-day', label: stm?.durations?.halfDay || 'Nửa Ngày' },
    { key: '1-day', label: stm?.durations?.oneDay || '1 Ngày' },
    { key: '2-day', label: stm?.durations?.twoDays || '2N1Đ' },
    { key: '3-day', label: stm?.durations?.threeDays || '3N2Đ' },
  ], [stm]);

  const budgetsList: { key: Budget; label: string }[] = useMemo(() => [
    { key: 'budget', label: stm?.budgets?.budget || 'Tiết Kiệm' },
    { key: 'comfort', label: stm?.budgets?.comfort || 'Thoải Mái' },
    { key: 'luxury', label: stm?.budgets?.luxury || 'Nghỉ Dưỡng' },
  ], [stm]);

  const rawResult = useMemo(() => MINI_LOOKUP[duration][budget], [duration, budget]);
  const tourName = isEn && rawResult.name_en ? rawResult.name_en : rawResult.name;
  const tourCost = isEn && rawResult.cost_en ? rawResult.cost_en : rawResult.cost;

  const pill = (active: boolean) =>
    `px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-bold border transition-all tap-bounce font-display cursor-pointer ${
      active
        ? 'bg-[#0E8C7F] text-white border-[#0E8C7F]'
        : 'bg-white/70 text-[#6B6355] border-[#26221B]/10 hover:border-[#0E8C7F]/30'
    }`;

  return (
    <div className="bg-gradient-to-r from-[#FFFDF7] to-amber-50/60 rounded-[22px] border border-amber-300/50 p-4 sm:p-5 space-y-3 font-body shadow-xs">
      {/* Title */}
      <div className="flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-[#0E8C7F] shrink-0" />
        <span className="font-display font-extrabold text-xs sm:text-sm text-[#26221B]">
          {stm?.title || 'Tìm Nhanh Lịch Trình Phù Hợp'}
        </span>
      </div>

      {/* Duration Pills */}
      <div className="flex flex-wrap gap-1.5">
        {durationsList.map(d => (
          <button key={d.key} onClick={() => setDuration(d.key)} className={pill(duration === d.key)}>
            {d.label}
          </button>
        ))}
      </div>

      {/* Budget Pills */}
      <div className="flex flex-wrap gap-1.5">
        {budgetsList.map(b => (
          <button key={b.key} onClick={() => setBudget(b.key)} className={pill(budget === b.key)}>
            {b.label}
          </button>
        ))}
      </div>

      {/* Result */}
      <Link
        href={`/itinerary?slug=${rawResult.slug}`}
        className="flex items-center justify-between w-full px-4 py-2.5 rounded-[14px] bg-[#0E8C7F] text-white hover:bg-[#085A52] transition-colors group"
      >
        <div>
          <span className="block text-[10px] text-white/70 font-display">
            {stm?.tourSuggestPrefix || 'Tour gợi ý • ~'}{tourCost}{stm?.perPerson || '/người'}
          </span>
          <span className="block text-xs font-extrabold font-display leading-tight">{tourName}</span>
        </div>
        <ChevronRight className="w-4 h-4 shrink-0 group-hover:translate-x-0.5 transition-transform" />
      </Link>
    </div>
  );
}