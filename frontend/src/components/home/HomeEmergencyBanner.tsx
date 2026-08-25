'use client';

import React from 'react';
import {
  Shield,
  Phone,
  HeartHandshake
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function HomeEmergencyBanner() {
  const { language } = useLanguage();
  const isEn = language === 'en';

  return (
    <section className="bg-gradient-to-br from-[#151B34] to-[#1E2647] rounded-[28px] p-6 sm:p-8 text-white border border-white/10 shadow-lg font-body">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#A6503A] text-white text-[11px] font-bold uppercase tracking-wider font-display">
            <Shield className="w-3.5 h-3.5" />
            <span>{isEn ? "24/7 Tourist Rescue & Security Hotline" : "Tổng Đài Cứu Hộ & An Ninh Du Khách 24/7"}</span>
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[#FFFDF7]">
            {isEn ? "Safe Travel Companion on All Seven Mountains Routes" : "Đồng Hành An Toàn Trên Mọi Cung Đường Bảy Núi"}
          </h2>
          <p className="text-xs text-white/80 leading-relaxed">
            {isEn
              ? "If you encounter vehicle breakdowns on mountain passes, get lost, or require urgent medical assistance, contact official local hotlines immediately."
              : "Khi gặp sự cố hỏng xe giữa đèo, lạc đường hoặc cần trợ giúp y tế khẩn cấp, vui lòng liên hệ ngay đường dây nóng chính thức của Công an & Trung tâm Y tế Tri Tôn."}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 shrink-0 font-display">
          <a
            href="tel:0296.3874.113"
            className="p-3.5 rounded-[20px] bg-white/10 hover:bg-[#F0A32F] hover:text-[#26221B] border border-white/15 text-center transition-all tap-bounce"
          >
            <Phone className="w-5 h-5 mx-auto mb-1 text-[#FFD37A]" />
            <span className="text-[11px] block text-white/70">{isEn ? "Tri Ton Police" : "Công An Tri Tôn"}</span>
            <strong className="text-xs block text-[#FFFDF7]">0296.3874.113</strong>
          </a>

          <a
            href="tel:0296.3874.115"
            className="p-3.5 rounded-[20px] bg-white/10 hover:bg-[#0E8C7F] hover:text-white border border-white/15 text-center transition-all tap-bounce"
          >
            <HeartHandshake className="w-5 h-5 mx-auto mb-1 text-[#FFD37A]" />
            <span className="text-[11px] block text-white/70">{isEn ? "Emergency Medical" : "Cấp Cứu Y Tế"}</span>
            <strong className="text-xs block text-[#FFFDF7]">0296.3874.115</strong>
          </a>
        </div>
      </div>
    </section>
  );
}
