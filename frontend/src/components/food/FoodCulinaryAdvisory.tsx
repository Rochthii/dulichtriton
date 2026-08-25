'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function FoodCulinaryAdvisory() {
  const { language, dict } = useLanguage();
  const fd = dict.food;
  const isEn = language === 'en';

  return (
    <section className="p-4 sm:p-6 rounded-[24px] bg-gradient-to-br from-amber-50/90 via-[#FFFDF7] to-emerald-50/60 border border-amber-300/60 shadow-xs space-y-3 font-body">
      <div className="flex items-center gap-2 text-xs font-bold text-amber-900 font-display">
        <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
        <span>{fd.rules.title}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3.5 rounded-[18px] bg-white/90 border border-amber-200/60 space-y-1">
          <span className="font-bold text-[#F26B3A] flex items-center gap-1.5 font-display">
            🍗 {isEn ? 'O Thum Roasted Chicken:' : 'Gà Đốt Ô Thum:'}
          </span>
          <p className="text-[#6B6355] leading-relaxed">
            {fd.rules.gaDotRule}
          </p>
        </div>

        <div className="p-3.5 rounded-[18px] bg-white/90 border border-amber-200/60 space-y-1">
          <span className="font-bold text-[#0E8C7F] flex items-center gap-1.5 font-display">
            🍲 {isEn ? 'Tri Ton Beef Porridge & Fish Noodles:' : 'Cháo Bò Tri Tôn & Bún Cá:'}
          </span>
          <p className="text-[#6B6355] leading-relaxed">
            {fd.rules.chaoBoRule}
          </p>
        </div>

        <div className="p-3.5 rounded-[18px] bg-white/90 border border-amber-200/60 space-y-1">
          <span className="font-bold text-[#D9822B] flex items-center gap-1.5 font-display">
            🥞 {isEn ? 'Khmer Fish Noodles & Palm Sugar Cakes:' : 'Bún Cá Củ Ngải & Bánh Bò:'}
          </span>
          <p className="text-[#6B6355] leading-relaxed">
            {fd.rules.bunCaRule}
          </p>
        </div>
      </div>
    </section>
  );
}
