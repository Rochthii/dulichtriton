'use client';

import React from 'react';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export interface PagodaRuleItem {
  id: string;
  title: string;
  desc: string;
  badge: string;
  color: string;
}

export default function CulturePagodaRulesSection() {
  const { language, dict } = useLanguage();
  const cu = dict.culture;
  const isEn = language === 'en';

  const rules = (cu.pagodaRulesList || []) as PagodaRuleItem[];

  return (
    <section className="p-5 sm:p-7 rounded-[28px] bg-gradient-to-br from-emerald-500/10 via-[#FFFDF7] to-amber-500/10 border-2 border-[#0E8C7F]/30 shadow-xs space-y-4 font-body">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#26221B]/8 pb-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[#0E8C7F] font-display">
          <ShieldCheck className="w-5 h-5 text-[#0E8C7F]" />
          <h2 className="text-base sm:text-lg font-black text-[#26221B] font-display">
            {cu.hero.tabEtiquette || (isEn ? "Khmer Pagoda Visiting Etiquette" : "Quy Chuẩn Viếng 37 Chùa Khmer")}
          </h2>
        </div>
        <span className="text-xs font-medium text-[#6B6355] font-mono">
          {isEn ? "Theravada Buddhist Monastic Discipline" : "Nghi thức & Giới luật Phật giáo Nam Tông"}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {rules.map((item) => (
          <div
            key={item.id}
            className="p-3.5 rounded-2xl bg-white/95 border border-[#0E8C7F]/20 space-y-1.5 shadow-2xs hover:border-[#0E8C7F]/40 transition-colors"
          >
            <div className="flex items-center justify-between font-display">
              <span className="font-extrabold text-xs text-[#26221B] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#0E8C7F] shrink-0" />
                <span>{item.title}</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/15 text-amber-900 border border-amber-500/30">
                {item.badge}
              </span>
            </div>
            <p className="text-xs text-[#4A4336] leading-relaxed pl-5.5">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
