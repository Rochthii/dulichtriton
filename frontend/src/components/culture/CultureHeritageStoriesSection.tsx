'use client';

import React from 'react';
import { BookOpen, Music, Layers, MessageSquareText } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export interface HeritageStoryItem {
  id: string;
  title: string;
  subtitle: string;
  location: string;
  image_url: string;
  desc: string;
  tag: string;
  stamp: string;
}

interface CultureHeritageStoriesSectionProps {
  onAskAi: (query: string) => void;
}

export default function CultureHeritageStoriesSection({ onAskAi }: CultureHeritageStoriesSectionProps) {
  const { language, dict } = useLanguage();
  const cu = dict.culture;
  const isEn = language === 'en';

  const stories = (cu.heritageStoriesList || []) as HeritageStoryItem[];

  return (
    <section className="space-y-4 font-body">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#26221B]/10 pb-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[#F26B3A] font-display">
          <BookOpen className="w-4 h-4 text-[#F26B3A]" />
          <h2 className="text-xl md:text-2xl font-black text-[#26221B] font-display">
            {cu.hero.tabManuscripts || (isEn ? "Intangible Cultural Heritage Treasures" : "Kho Tàng Di Sản Văn Hóa & Nghệ Thuật")}
          </h2>
        </div>
        <span className="text-xs font-medium text-[#6B6355] font-mono">
          {isEn ? "National Treasures & Living Heritage" : "Bảo vật quốc gia & Di sản sống"}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stories.map((story) => (
          <div
            key={story.id}
            className="p-4 sm:p-5 rounded-2xl bg-[#FFFDF7] border border-[#26221B]/10 shadow-xs space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between font-display">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#FAF3E7] text-[#26221B] border border-[#26221B]/10">
                  {story.tag}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[9px] font-black bg-amber-500/20 text-amber-900 border border-amber-500/30">
                  {story.stamp}
                </span>
              </div>

              <div>
                <h3 className="font-display font-extrabold text-sm sm:text-base text-[#26221B] leading-snug">
                  {story.title}
                </h3>
                <span className="text-[11px] text-[#0E8C7F] font-bold font-display block mt-0.5">
                  {story.subtitle}
                </span>
              </div>

              <p className="text-xs text-[#4A4336] leading-relaxed line-clamp-4">
                {story.desc}
              </p>
            </div>

            <div className="pt-3 border-t border-[#26221B]/6 flex items-center justify-between font-display">
              <span className="text-[10px] text-[#6B6355] italic truncate max-w-[120px]">
                {story.location}
              </span>
              <button
                type="button"
                onClick={() => onAskAi(`Hãy kể chi tiết về ${story.title} ở Tri Tôn`)}
                className="text-xs font-bold text-[#0E8C7F] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <MessageSquareText className="w-3 h-3" />
                <span>{isEn ? "Ask AI" : "Hỏi AI"}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
