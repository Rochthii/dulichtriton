'use client';

import React from 'react';
import { BookOpen, Sparkles, MessageSquareQuote, ShieldCheck } from 'lucide-react';
import { RichTextRenderer } from '@/components/RichTextRenderer';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface PlaceDetailStorySectionProps {
  placeName: string;
  story: string;
  commune: string;
  onAskAi: (query: string) => void;
}

export default function PlaceDetailStorySection({
  placeName,
  story,
  commune,
  onAskAi,
}: PlaceDetailStorySectionProps) {
  const { language, dict } = useLanguage();
  const isEn = language === 'en';

  if (!story || story.trim().length === 0) return null;

  return (
    <section className="p-5 sm:p-7 rounded-[28px] bg-[#FFFDF7] border border-[#26221B]/8 shadow-xs space-y-4 font-body">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#26221B]/8 pb-3 font-display">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#0E8C7F]" />
          <h2 className="text-base sm:text-lg font-black text-[#26221B]">
            {isEn ? `Origin Story & Cultural Heritage: ${placeName}` : `Sự Tích & Câu Chuyện Lịch Sử: ${placeName}`}
          </h2>
        </div>
        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60 flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-emerald-600" />
          <span>{isEn ? "Verified Local Chronicle" : "Tài liệu thực địa xác minh"}</span>
        </span>
      </div>

      {/* Story Content Rendering with RichTextRenderer */}
      <div className="text-xs sm:text-sm text-[#4A4336] leading-relaxed">
        <RichTextRenderer content={story} />
      </div>

      {/* Action Footer asking AI about this story */}
      <div className="pt-3 border-t border-[#26221B]/6 flex flex-wrap items-center justify-between gap-2 font-display">
        <span className="text-[11px] text-[#6B6355] italic">
          {isEn ? "Want deeper historical origins and local folklore?" : "Bạn muốn tìm hiểu thêm về truyền thuyết và nguồn gốc địa danh này?"}
        </span>
        <button
          type="button"
          onClick={() => onAskAi(`Kể chi tiết câu chuyện lịch sử, sự tích và ý nghĩa văn hóa của ${placeName} ở ${commune} Tri Tôn`)}
          className="px-3.5 py-1.5 rounded-full bg-[#FAF3E7] hover:bg-[#0E8C7F] text-[#0E8C7F] hover:text-white border border-[#0E8C7F]/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isEn ? "Ask AI Assistant" : "Hỏi AI chi tiết"}</span>
        </button>
      </div>
    </section>
  );
}
