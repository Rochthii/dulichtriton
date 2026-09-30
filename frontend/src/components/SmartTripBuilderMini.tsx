'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Sparkles, ChevronRight } from 'lucide-react';

type Duration = 'half-day' | '1-day' | '2-day' | '3-day';
type Budget = 'budget' | 'comfort' | 'luxury';

const MINI_LOOKUP: Record<Duration, Record<Budget, { slug: string; name: string; cost: string }>> = {
  'half-day': {
    budget:  { slug: 'express-nua-ngay', name: 'Express Nửa Ngày', cost: '50k–100k' },
    comfort: { slug: 'sunset-dinner-tour', name: 'Sunset & Dinner Tour', cost: '300k–500k' },
    luxury:  { slug: 'hoang-hon-bbq-ga-dot-dem', name: 'Hoàng Hôn + BBQ Gà Đốt', cost: '300k–500k' },
  },
  '1-day': {
    budget:  { slug: 'song-ao-checkin-1-ngay', name: 'Sống Ảo Check-in 1 Ngày', cost: '200k–400k' },
    comfort: { slug: 'kinh-dien-1-ngay', name: 'Kinh Điển 1 Ngày Tri Tôn', cost: '300k–500k' },
    luxury:  { slug: 'food-tour-am-thuc-1-ngay-dem', name: 'Food Tour Ẩm Thực', cost: '600k–1tr' },
  },
  '2-day': {
    budget:  { slug: 'backpacker-budget-2n1d', name: 'Backpacker Budget 2N1Đ', cost: '250k–450k' },
    comfort: { slug: 'weekend-2n1d-day-dem', name: 'Weekend 2N1Đ Đầy Đủ', cost: '900k–1.5tr' },
    luxury:  { slug: 'luxury-chill-2n1d', name: 'Luxury Chill 2N1Đ', cost: '1tr–2tr' },
  },
  '3-day': {
    budget:  { slug: 'kham-pha-sau-3n2d', name: 'Khám Phá Sâu 3N2Đ', cost: '1.5tr–2.5tr' },
    comfort: { slug: 'full-experience-3n2d', name: 'Full Experience 3N2Đ', cost: '1.8tr–3tr' },
    luxury:  { slug: 'full-experience-3n2d', name: 'Full Experience 3N2Đ', cost: '1.8tr–3tr' },
  },
};

const DURATIONS: { key: Duration; label: string }[] = [
  { key: 'half-day', label: 'Nửa Ngày' },
  { key: '1-day', label: '1 Ngày' },
  { key: '2-day', label: '2N1Đ' },
  { key: '3-day', label: '3N2Đ' },
];

const BUDGETS: { key: Budget; label: string }[] = [
  { key: 'budget', label: 'Tiết Kiệm' },
  { key: 'comfort', label: 'Thoải Mái' },
  { key: 'luxury', label: 'Nghỉ Dưỡng' },
];

export default function SmartTripBuilderMini() {
  const [duration, setDuration] = useState<Duration>('1-day');
  const [budget, setBudget] = useState<Budget>('comfort');

  const result = useMemo(() => MINI_LOOKUP[duration][budget], [duration, budget]);

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
          Tìm Nhanh Lịch Trình Phù Hợp
        </span>
      </div>

      {/* Duration Pills */}
      <div className="flex flex-wrap gap-1.5">
        {DURATIONS.map(d => (
          <button key={d.key} onClick={() => setDuration(d.key)} className={pill(duration === d.key)}>
            {d.label}
          </button>
        ))}
      </div>

      {/* Budget Pills */}
      <div className="flex flex-wrap gap-1.5">
        {BUDGETS.map(b => (
          <button key={b.key} onClick={() => setBudget(b.key)} className={pill(budget === b.key)}>
            {b.label}
          </button>
        ))}
      </div>

      {/* Result */}
      <Link
        href={`/itinerary?slug=${result.slug}`}
        className="flex items-center justify-between w-full px-4 py-2.5 rounded-[14px] bg-[#0E8C7F] text-white hover:bg-[#085A52] transition-colors group"
      >
        <div>
          <span className="block text-[10px] text-white/70 font-display">Tour gợi ý • ~{result.cost}/người</span>
          <span className="block text-xs font-extrabold font-display leading-tight">{result.name}</span>
        </div>
        <ChevronRight className="w-4 h-4 shrink-0 group-hover:translate-x-0.5 transition-transform" />
      </Link>
    </div>
  );
}