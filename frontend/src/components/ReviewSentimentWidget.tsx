'use client';

import React from 'react';
import { Sparkles, ThumbsUp, AlertCircle, MessageSquareQuote, CheckCircle2 } from 'lucide-react';
import { extractReviewHighlights } from '@/lib/dataSanitizer';

interface ReviewSentimentWidgetProps {
  reviews: any[];
  placeName: string;
}

export default function ReviewSentimentWidget({ reviews, placeName }: ReviewSentimentWidgetProps) {
  const { positiveKeywords, cautionKeywords, positivePercentage } = extractReviewHighlights(reviews);

  return (
    <div className="bg-[#FAF3E7] rounded-[24px] p-5 border border-[#26221B]/8 space-y-4 font-body">
      {/* Header & Percentage Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#26221B]/6 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#0E8C7F]" />
          <div>
            <h3 className="font-display text-sm font-bold text-[#26221B]">
              Tóm Tắt Trải Nghiệm Thực Tế (AI NLP Sentiment)
            </h3>
            <p className="text-[11px] text-[#6B6355]">
              Tổng hợp nhanh từ nhận xét cộng đồng phượt Bảy Núi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-[#FFFDF7] px-3.5 py-1.5 rounded-full border border-[#0E8C7F]/20 font-display">
          <ThumbsUp className="w-3.5 h-3.5 text-[#0E8C7F]" />
          <span className="text-xs font-bold text-[#0E8C7F]">
            {positivePercentage}% Hài lòng
          </span>
        </div>
      </div>

      {/* Sentiment Progress Bar */}
      <div className="space-y-1.5">
        <div className="w-full h-2.5 rounded-full bg-[#26221B]/10 overflow-hidden flex">
          <div
            className="h-full bg-[#0E8C7F] transition-all duration-1000"
            style={{ width: `${positivePercentage}%` }}
          />
          <div
            className="h-full bg-[#F26B3A] transition-all duration-1000"
            style={{ width: `${100 - positivePercentage}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[10px] text-[#6B6355] font-display">
          <span className="text-[#0E8C7F] font-bold">Cảnh quan & Ẩm thực đặc sắc ({positivePercentage}%)</span>
          <span className="text-[#F26B3A] font-bold">Lưu ý đường đi ({100 - positivePercentage}%)</span>
        </div>
      </div>

      {/* Keywords Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* Positive Highlights */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-[#0E8C7F] flex items-center gap-1 font-display">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Điểm khen ngợi nhiều nhất:</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {positiveKeywords.map((kw, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#FFFDF7] text-[#0E8C7F] border border-[#0E8C7F]/20 shadow-2xs"
              >
                ✓ {kw}
              </span>
            ))}
          </div>
        </div>

        {/* Caution / Need to know */}
        {cautionKeywords.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-[#D9822B] flex items-center gap-1 font-display">
              <AlertCircle className="w-3.5 h-3.5 text-[#F26B3A]" />
              <span>Kinh nghiệm cần lưu ý:</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {cautionKeywords.map((ck, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#FFFDF7] text-[#F26B3A] border border-[#F26B3A]/20 shadow-2xs"
                >
                  ⚠️ {ck}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
