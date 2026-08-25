'use client';

import React from 'react';
import { Hotel } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function StayHeroBanner() {
  const { dict } = useLanguage();
  const st = dict.stay;

  return (
    <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#0E8C7F] to-[#085A52] p-6 text-white shadow-md md:p-10 border border-[#0B6B60]">
      <div className="relative z-10 max-w-3xl space-y-3">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FFD37A]/20 px-3 py-1 text-xs font-black text-[#FFD37A] uppercase tracking-wider backdrop-blur-xs font-display">
          <Hotel className="h-3.5 w-3.5" />
          <span>{st.hero.badge}</span>
        </div>
        <h1 className="font-display text-2xl md:text-4xl font-extrabold tracking-tight text-[#FFFDF7] leading-tight">
          {st.hero.title}
        </h1>
        <p className="text-xs md:text-sm text-white/85 leading-relaxed font-body">
          {st.hero.subtitle}
        </p>
      </div>
    </section>
  );
}
