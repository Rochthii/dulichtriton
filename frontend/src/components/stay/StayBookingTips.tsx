'use client';

import React from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function StayBookingTips() {
  const { language, dict } = useLanguage();
  const st = dict.stay;
  const isEn = language === 'en';

  return (
    <section className="p-5 sm:p-7 rounded-[28px] bg-gradient-to-br from-amber-50/90 via-[#FFFDF7] to-emerald-50/60 border border-amber-300/60 shadow-xs space-y-4 font-body">
      <div className="flex items-center gap-2 text-xs font-bold text-amber-900 font-display">
        <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
        <h2 className="text-base sm:text-lg font-black text-[#26221B] font-display">
          {st.bookingTips?.title || (isEn ? "Weekend & Festival Booking Tips" : "Kinh Nghiệm Đặt Phòng Dịp Cuối Tuần & Lễ Hội")}
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3.5 rounded-2xl bg-white/90 border border-amber-200/60 space-y-1">
          <span className="font-bold text-[#F26B3A] flex items-center gap-1.5 font-display">
            <CheckCircle2 className="w-4 h-4 text-[#F26B3A]" />
            <span>{isEn ? "Book Early During Festivals:" : "Đặt Sớm Mùa Lễ Hội:"}</span>
          </span>
          <p className="text-[#6B6355] leading-relaxed">
            {st.bookingTips?.tip1 || (isEn ? "During Bull Racing Festival and Sept 2nd, book at least 2-3 weeks in advance." : "Dịp Lễ Hội Đua Bò (tháng 8-9 âm lịch) và 2/9, nên đặt phòng trước tối thiểu 2-3 tuần.")}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/90 border border-amber-200/60 space-y-1">
          <span className="font-bold text-[#0E8C7F] flex items-center gap-1.5 font-display">
            <CheckCircle2 className="w-4 h-4 text-[#0E8C7F]" />
            <span>{isEn ? "Mountain Foot Homestays:" : "Lưu Ý Homestay Núi Tô:"}</span>
          </span>
          <p className="text-[#6B6355] leading-relaxed">
            {st.bookingTips?.tip2 || (isEn ? "Homestays around Mount To and Ta Pa hill usually fill up early on Saturday nights." : "Các homestay quanh chân núi Tô và đồi Tà Pạ thường kín phòng sớm vào tối Thứ 7.")}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/90 border border-amber-200/60 space-y-1">
          <span className="font-bold text-[#D9822B] flex items-center gap-1.5 font-display">
            <CheckCircle2 className="w-4 h-4 text-[#D9822B]" />
            <span>{isEn ? "Direct Hotline Contact:" : "Liên Hệ Trực Tiếp:"}</span>
          </span>
          <p className="text-[#6B6355] leading-relaxed">
            {st.bookingTips?.tip3 || (isEn ? "Contact directly via host hotline for accurate special rates." : "Liên hệ trực tiếp qua số hotline của chủ cơ sở để nhận giá ưu đãi chính xác.")}
          </p>
        </div>
      </div>
    </section>
  );
}
