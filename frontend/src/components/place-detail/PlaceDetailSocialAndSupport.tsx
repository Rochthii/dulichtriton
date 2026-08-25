'use client';

import React from 'react';
import { 
  Phone, ShieldCheck, CheckCircle2, 
  Video, Landmark
} from 'lucide-react';
import TikTokReelsViewer from '@/components/TikTokReelsViewer';
import ReviewSentimentWidget from '@/components/ReviewSentimentWidget';
import { type VideoItem } from '@/components/VideoModal';
import { KHMER_TEMPLE_RULES } from '@/lib/constants';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface PlaceDetailSocialAndSupportProps {
  placeName: string;
  category: string;
  commune: string;
  communeEmergency: { policePhone: string; healthPhone: string; policeName?: string; healthName?: string };
  placeVideos: VideoItem[];
  isReelsOpen: boolean;
  setIsReelsOpen: (v: boolean) => void;
  selectedReelIndex: number;
  setSelectedReelIndex: (idx: number) => void;
  reviews: any[];
}

export default function PlaceDetailSocialAndSupport({
  placeName,
  category,
  commune,
  communeEmergency,
  placeVideos,
  isReelsOpen,
  setIsReelsOpen,
  selectedReelIndex,
  setSelectedReelIndex,
  reviews,
}: PlaceDetailSocialAndSupportProps) {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const isTemple = category === 'pagoda' || placeName.toLowerCase().includes('chùa') || placeName.toLowerCase().includes('wat');

  return (
    <div className="space-y-6 font-body">
      {/* 1. TikTok Reels Viewer if videos exist */}
      {placeVideos.length > 0 && (
        <section className="p-5 sm:p-7 rounded-[28px] bg-[#FFFDF7] border border-[#26221B]/8 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#26221B]/8 pb-3 font-display">
            <div className="flex items-center gap-2">
              <Video className="w-5 h-5 text-rose-600" />
              <h2 className="text-base sm:text-lg font-black text-[#26221B]">
                {isEn ? `TikTok Video Reviews: ${placeName}` : `Video Review & Khoảnh Khắc Thực Tế: ${placeName}`}
              </h2>
            </div>
            <span className="text-xs font-mono text-[#6B6355]">
              {placeVideos.length} {isEn ? "Videos" : "Video"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {placeVideos.map((vid, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setSelectedReelIndex(idx);
                  setIsReelsOpen(true);
                }}
                className="relative rounded-2xl overflow-hidden aspect-[9/16] bg-slate-900 cursor-pointer group shadow-sm"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={vid.thumbnail_url} alt={vid.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3 text-white">
                  <span className="text-xs font-bold font-display line-clamp-2">{vid.title}</span>
                  <span className="text-[10px] text-white/70 font-mono">@{vid.author_name}</span>
                </div>
              </div>
            ))}
          </div>

          <TikTokReelsViewer
            videos={placeVideos}
            isOpen={isReelsOpen}
            onClose={() => setIsReelsOpen(false)}
            initialIndex={selectedReelIndex}
            placeName={placeName}
          />
        </section>
      )}

      {/* 2. Review Sentiment Analysis Widget */}
      {reviews && reviews.length > 0 && (
        <ReviewSentimentWidget reviews={reviews} placeName={placeName} />
      )}

      {/* 3. Sacred Khmer Pagoda Etiquette (if temple) */}
      {isTemple && (
        <section className="p-5 sm:p-7 rounded-[28px] bg-gradient-to-br from-emerald-500/10 via-[#FFFDF7] to-amber-500/10 border-2 border-[#0E8C7F]/30 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#0E8C7F] font-display">
            <Landmark className="w-5 h-5 text-[#0E8C7F]" />
            <h2 className="text-base sm:text-lg font-black text-[#26221B]">
              {isEn ? "Sacred Khmer Pagoda Etiquette & Guidelines" : KHMER_TEMPLE_RULES.title}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            {KHMER_TEMPLE_RULES.rules.map((ruleText, ridx) => (
              <div key={ridx} className="p-3.5 rounded-2xl bg-white/95 border border-[#0E8C7F]/20 space-y-1">
                <span className="font-bold text-[#26221B] flex items-center gap-1.5 font-display">
                  <CheckCircle2 className="w-4 h-4 text-[#0E8C7F]" />
                  <span>Quy tắc #{ridx + 1}</span>
                </span>
                <p className="text-[#4A4336] leading-relaxed text-[11px]">{ruleText}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. Commune Emergency SOS Directory */}
      <section className="p-5 sm:p-7 rounded-[28px] bg-gradient-to-br from-rose-50/80 via-[#FFFDF7] to-amber-50/60 border border-rose-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-[#26221B]/8 pb-3 font-display">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-rose-600" />
            <h2 className="text-base sm:text-lg font-black text-[#26221B]">
              {isEn ? `Emergency & Tourist Support Directory: ${commune}` : `Danh Bạ Cứu Hộ & An Ninh Du Khách 24/7: ${commune}`}
            </h2>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white uppercase">
            SOS 24/7
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-white/90 border border-rose-200/80 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-[#6B6355] block font-display">
                {isEn ? "Commune Police:" : (communeEmergency.policeName || "Công An Xã:")}
              </span>
              <span className="font-extrabold text-[#26221B] font-mono text-sm">
                {communeEmergency.policePhone || "113"}
              </span>
            </div>
            <a
              href={`tel:${communeEmergency.policePhone || "113"}`}
              className="p-2 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors"
            >
              <Phone className="w-4 h-4 text-rose-600" />
            </a>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/90 border border-rose-200/80 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-[#6B6355] block font-display">
                {isEn ? "Medical Station:" : (communeEmergency.healthName || "Trạm Y Tế Xã:")}
              </span>
              <span className="font-extrabold text-[#26221B] font-mono text-sm">
                {communeEmergency.healthPhone || "115"}
              </span>
            </div>
            <a
              href={`tel:${communeEmergency.healthPhone || "115"}`}
              className="p-2 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors"
            >
              <Phone className="w-4 h-4 text-rose-600" />
            </a>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/90 border border-rose-200/80 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-[#6B6355] block font-display">
                {isEn ? "District Center Support:" : "Trung Tâm Cứu Hộ Tri Tôn:"}
              </span>
              <span className="font-extrabold text-[#26221B] font-mono text-sm">
                0296 3874 213
              </span>
            </div>
            <a
              href="tel:02963874213"
              className="p-2 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors"
            >
              <Phone className="w-4 h-4 text-rose-600" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
