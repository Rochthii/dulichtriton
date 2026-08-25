'use client';

import React from 'react';
import { Compass } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function PlacesHeroBanner() {
  const { language, dict } = useLanguage();
  const isEn = language === 'en';

  return (
    <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#0E8C7F] to-[#085A52] p-6 text-white shadow-md md:p-10 border border-[#0B6B60]">
      <div className="relative z-10 max-w-3xl space-y-3">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FFD37A]/20 px-3 py-1 text-xs font-black text-[#FFD37A] uppercase tracking-wider backdrop-blur-xs font-display">
          <Compass className="h-3.5 w-3.5" />
          <span>{isEn ? "149 Verified Seven Mountains Coordinates" : "149 Tọa Độ Du Lịch Bảy Núi Đã Xác Minh"}</span>
        </div>
        <h1 className="font-display text-2xl md:text-4xl font-extrabold tracking-tight text-[#FFFDF7] leading-tight">
          {dict.places?.header?.title || (isEn ? "Explore Tri Ton Scenic Wonders & Relics" : "Khám Phá Danh Thắng & Di Tích Tri Tôn")}
        </h1>
        <p className="text-xs md:text-sm text-white/85 leading-relaxed font-body">
          {dict.places?.header?.subtitle || (isEn ? "Comprehensive guide to 149 destinations: Mountain lakes, ancient Khmer pagodas, natural landmarks, culinary specialties, and scenic check-in coordinates." : "Tra cứu đầy đủ 149 địa điểm: Hồ nước trên núi, ngôi chùa Khmer cổ kính, danh thắng thiên nhiên, ẩm thực đặc sản và tọa độ check-in tuyệt đẹp.")}
        </p>
      </div>
    </section>
  );
}
