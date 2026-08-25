'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Clock,
  Bike,
  ChevronRight,
  Play,
  Navigation,
  Sparkles,
  Camera,
  Utensils,
  Landmark,
  Trees,
  Scroll,
  Lightbulb,
  Coins,
  BarChart3,
  CheckCircle2,
  Printer,
  QrCode,
  Info,
  Download,
  Loader2,
  Check
} from 'lucide-react';
import ItineraryExportModal from './ItineraryExportModal';
import { getTikTokHashtagUrl } from '@/lib/tiktok';
import localMasterPois from '@/data/triton_pois_full.json';
import { downloadItineraryPDF } from '@/lib/pdfExporter';

export interface ItineraryStop {
  order: number;
  name: string;
  commune: string;
  category: 'check-in' | 'food' | 'spiritual' | 'nature' | 'history';
  time_start: string;
  time_end: string;
  duration_min: number;
  tip: string;
  description?: string;
  intro?: string;
  travel_to_next_min: number;
  travel_to_next_km: number;
  photo_coords?: [number, number];
  cost_vnd?: string;
  day?: number;
  transport_to_next?: string;
  imageUrl?: string;
  rating?: number;
}

export interface ItineraryData {
  slug: string;
  emoji?: string;
  title: string;
  tagline: string;
  for_whom: string;
  duration: string;
  budget_range: string;
  stops: ItineraryStop[];
  tips?: string[];
  best_season?: string;
}

interface WireDiagramItineraryProps {
  itinerary: ItineraryData;
  transport?: 'bike' | 'car' | string;
}

const CATEGORY_CONFIG: Record<string, { bg: string; text: string; border: string; label: string; icon: React.ElementType }> = {
  'check-in':  { bg: 'bg-[#0E8C7F]/10', text: 'text-[#0E8C7F]', border: 'border-[#0E8C7F]/30', label: 'Check-in', icon: Camera },
  'food':      { bg: 'bg-[#F26B3A]/10', text: 'text-[#F26B3A]', border: 'border-[#F26B3A]/30', label: 'Ẩm Thực', icon: Utensils },
  'spiritual': { bg: 'bg-[#D9822B]/10', text: 'text-[#D9822B]', border: 'border-[#D9822B]/30', label: 'Chùa Khmer', icon: Landmark },
  'nature':    { bg: 'bg-[#0E8C7F]/10', text: 'text-[#0E8C7F]', border: 'border-[#0E8C7F]/30', label: 'Thiên Nhiên', icon: Trees },
  'history':   { bg: 'bg-[#A6503A]/10', text: 'text-[#A6503A]', border: 'border-[#A6503A]/30', label: 'Di Tích', icon: Scroll },
};

function getTikTokUrl(name: string, commune?: string): string {
  return getTikTokHashtagUrl(name);
}

function getMapsUrl(name: string, commune: string): string {
  const q = encodeURIComponent(`${name} ${commune} Tri Tôn An Giang`);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

function getPlaceSummary(stopName: string, stopDesc?: string): string {
  const normalized = stopName.toLowerCase().replace(/[()]/g, '').trim();

  // 1. Search directly in master Danh Mục Điểm Đến
  const found = (localMasterPois as any[]).find((p) => {
    const pName = p.name.toLowerCase();
    const pId = p.id.toLowerCase();
    const pSlug = (p.slug || '').toLowerCase();
    return (
      pName.includes(normalized) ||
      normalized.includes(pName) ||
      normalized.includes(pId) ||
      (pSlug && normalized.includes(pSlug))
    );
  });

  if (found) {
    if (found.short_description && found.short_description.trim().length > 15) {
      return found.short_description.trim();
    }
    if (found.description && found.description.trim().length > 15) {
      return found.description.trim().slice(0, 160) + '…';
    }
  }

  // 2. Fallback descriptions
  if (/tà pạ/i.test(normalized)) {
    return 'Thắng cảnh nổi tiếng bậc nhất Bảy Núi với hồ nước ngọc bích, cánh đồng lúa thanh bình và chùa Khmer uy nghiêm.';
  }
  if (/cô tô|tức dụp/i.test(normalized)) {
    return 'Di tích lịch sử và danh thắng kỳ vĩ với hệ thống hang động tự nhiên cùng tầm nhìn ôm trọn đồng bằng.';
  }
  if (/ô thum/i.test(normalized)) {
    return 'Thung lũng hồ xanh mát, trung tâm ẩm thực gà đốt lá chúc nức tiếng vùng Thất Sơn.';
  }
  if (/soài chek/i.test(normalized)) {
    return 'Hồ thủy lợi thơ mộng dưới chân núi Cô Tô, điểm ngắm hoàng hôn ngũ sắc tuyệt mỹ.';
  }
  if (/chùa|xvayton|sà tón|ro/i.test(normalized)) {
    return 'Ngôi chùa Khmer cổ kính lưu giữ kinh lá buông và di sản kiến trúc văn hóa độc đáo.';
  }
  if (/chợ tri tôn/i.test(normalized)) {
    return 'Chợ trung tâm sầm uất với các món điểm tâm bún cá, cháo bò, bánh bò thốt nốt đặc trưng.';
  }

  return 'Điểm tham quan tiêu biểu trong hành trình khám phá Tri Tôn, An Giang.';
}

export default function WireDiagramItinerary({ itinerary }: WireDiagramItineraryProps) {
  const { title, tagline, duration, budget_range, stops } = itinerary;

  const totalKm  = stops.reduce((s, st) => s + (st.travel_to_next_km || 0), 0);
  const isMultiDay = stops.some(s => (s.day || 1) > 1);
  const totalDays  = isMultiDay ? Math.max(...stops.map(s => s.day || 1)) : 1;

  const [visibleStops, setVisibleStops] = useState<Record<number, boolean>>({});
  const [showExportModal, setShowExportModal] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [downloadPdfSuccess, setDownloadPdfSuccess] = useState(false);
  const stopRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleDirectDownloadPDF = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDownloadingPdf) return;
    setIsDownloadingPdf(true);
    try {
      await downloadItineraryPDF(itinerary);
      setDownloadPdfSuccess(true);
      setTimeout(() => setDownloadPdfSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to download PDF:', err);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    stopRefs.current.forEach((el, index) => {
      if (!el) return;
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setVisibleStops((prev) => ({ ...prev, [index]: true }));
            }
          });
        },
        { threshold: 0.15, rootMargin: '0px 0px -30px 0px' }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
  }, [stops]);

  return (
    <div className="w-full max-w-full font-body select-none mx-auto">
      {/* ── HEADER (Folk-Modern Ticket-Stub Banner) ─────────────────────────── */}
      <div className="bg-gradient-to-br from-[#0E8C7F] to-[#0A6B61] rounded-2xl sm:rounded-[22px] p-3.5 sm:p-4 mb-3 sm:mb-4 text-white shadow-md relative overflow-hidden border border-[#0B6B60]">
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-radial from-white/10 to-transparent pointer-events-none" />

        <div className="flex items-start justify-between gap-2 relative z-10">
          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-extrabold text-[#FFD37A] uppercase tracking-wider mb-1 bg-black/20 px-2 py-0.5 rounded-full font-display">
              <CheckCircle2 className="w-3 h-3 text-[#FFD37A] shrink-0" />
              <span className="truncate">Lịch Trình Thực Địa Xác Minh</span>
            </div>
            <h3 className="font-display text-base sm:text-xl font-bold leading-tight text-[#FFFDF7]">
              {title}
            </h3>
            <p className="text-white/85 text-[11px] sm:text-xs mt-1 leading-snug font-body line-clamp-2">
              {tagline}
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleDirectDownloadPDF}
              disabled={isDownloadingPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFD37A] hover:bg-[#F0A32F] text-[#26221B] font-extrabold text-xs shadow-xs active:scale-95 transition-all cursor-pointer font-display disabled:opacity-75"
              title="Tải Ngay File PDF Sơ Đồ Lịch Trình Kèm Link Maps Dẫn Đường"
            >
              {isDownloadingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 text-[#0E8C7F] animate-spin" />
                  <span>Đang Tạo...</span>
                </>
              ) : downloadPdfSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-800" />
                  <span>Đã Tải!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-[#0E8C7F]" />
                  <span>Tải PDF Maps</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white font-extrabold text-xs shadow-xs active:scale-95 transition-all cursor-pointer font-display"
              title="Mã QR Lộ Trình"
            >
              <QrCode className="w-3.5 h-3.5 text-[#FFD37A]" />
              <span className="hidden sm:inline">QR</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-1 mt-2.5 pt-2 border-t border-white/15 text-[11px] sm:text-xs text-white/95 font-display">
          <span className="flex items-center gap-1 font-semibold">
            <Clock className="w-3.5 h-3.5 text-[#FFD37A]" /> {duration}
          </span>
          <span className="opacity-40">•</span>
          <span className="flex items-center gap-1 font-semibold">
            <Bike className="w-3.5 h-3.5 text-[#FFD37A]" /> ~{totalKm.toFixed(0)} km
          </span>
          {budget_range && (
            <>
              <span className="opacity-40">•</span>
              <span className="flex items-center gap-1 font-semibold">
                <Coins className="w-3.5 h-3.5 text-[#FFD37A]" /> {budget_range}
              </span>
            </>
          )}
        </div>
      </div>

      {/* ── METRO-LINE WIRE DIAGRAM STOPS (CENTERED & BALANCED ON MOBILE) ───── */}
      <div className="relative w-full">
        {stops.map((stop, idx) => {
          const cat = CATEGORY_CONFIG[stop.category] || CATEGORY_CONFIG['nature'];
          const CatIcon = cat.icon;
          const isLast = idx === stops.length - 1;
          const prevDay = idx > 0 ? (stops[idx-1].day || 1) : 1;
          const thisDay = stop.day || 1;
          const isNewDay = isMultiDay && thisDay > prevDay;
          const isVisible = visibleStops[idx] || idx === 0;
          const placeSummary = getPlaceSummary(stop.name, stop.description || stop.intro);

          return (
            <div
              key={stop.order}
              ref={(el) => { stopRefs.current[idx] = el; }}
              className={`relative transition-all duration-500 ease-out ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-30 translate-y-2'
              }`}
            >
              {/* ─ Day separator ─────────────────────────────────────────── */}
              {isNewDay && (
                <div className="flex items-center gap-2 my-3 ml-8 sm:ml-12">
                  <div className="flex-1 h-px bg-[#0E8C7F]/20" />
                  <span className="text-[11px] sm:text-xs font-bold text-[#0E8C7F] bg-[#0E8C7F]/10 px-3 py-0.5 rounded-full border border-[#0E8C7F]/30 font-display">
                    Ngày {thisDay}
                  </span>
                  <div className="flex-1 h-px bg-[#0E8C7F]/20" />
                </div>
              )}

              {/* ─ Metro Stop Row ─────────────────────────────────────────── */}
              <div className="flex items-stretch gap-2 sm:gap-3 mb-1">
                {/* Left: Compact Time + Metro-line station connector */}
                <div className="flex flex-col items-center shrink-0 w-8 sm:w-11 pt-2">
                  <span className="text-[10px] sm:text-[11px] font-black text-[#0E8C7F] bg-[#0E8C7F]/10 px-1 py-0.5 rounded-md tabular-nums leading-none font-display">
                    {stop.time_start}
                  </span>
                  
                  {/* Metro Station Node */}
                  <div className="station-node w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-[#0E8C7F] border-2 border-white shadow-xs my-1 shrink-0" />

                  {/* Connecting Metro-line */}
                  {!isLast && (
                    <div
                      className={`flex-1 w-1 bg-[#0E8C7F] rounded-full min-h-[36px] opacity-75 ${
                        isVisible ? 'metro-line-grow' : 'scale-y-0 opacity-20'
                      }`}
                    />
                  )}
                </div>

                {/* Right: Station Card (Full-width & Balanced) */}
                <div className="flex-1 min-w-0 bg-[#FFFDF7] rounded-2xl sm:rounded-[20px] border border-[#26221B]/10 p-3 sm:p-3.5 mb-2 shadow-xs hover:shadow-md transition-all duration-300">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <div className={`p-1.5 rounded-xl ${cat.bg} ${cat.text} shrink-0 mt-0.5 border ${cat.border}`}>
                        <CatIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-display font-extrabold text-xs sm:text-sm text-[#26221B] leading-tight break-words">
                          {stop.name}
                        </h4>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1 font-body">
                          <span className="flex items-center gap-0.5 text-[10px] sm:text-[11px] text-[#6B6355] font-medium truncate max-w-[140px] sm:max-w-none">
                            <MapPin className="w-3 h-3 text-[#0E8C7F] shrink-0" />
                            {stop.commune}
                          </span>
                          <span className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-md ${cat.bg} ${cat.text} border ${cat.border} font-display shrink-0`}>
                            {cat.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] sm:text-[11px] font-bold text-[#6B6355] shrink-0 tabular-nums bg-[#FAF3E7] px-2 py-0.5 rounded-full font-body border border-[#26221B]/5">
                      {stop.duration_min >= 60
                        ? `${Math.floor(stop.duration_min / 60)}h${stop.duration_min % 60 ? String(stop.duration_min % 60).padStart(2, '0') : ''}`
                        : `${stop.duration_min} phút`}
                    </span>
                  </div>

                  {/* ── GIỚI THIỆU TÓM TẮT ĐỊA ĐIỂM (PLACE SUMMARY) ── */}
                  {placeSummary && (
                    <div className="text-[11px] sm:text-xs text-slate-700 leading-relaxed font-body mb-2 bg-slate-50/80 p-2 sm:p-2.5 rounded-xl border border-slate-100">
                      <p className="line-clamp-2">
                        {placeSummary}
                      </p>
                    </div>
                  )}

                  {/* Field Tip Box */}
                  <div className="bg-[#FAF3E7] rounded-xl p-2 sm:p-2.5 mb-2.5 border border-[#26221B]/5 text-[11px] sm:text-xs">
                    <div className="flex items-start gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-[#F0A32F] shrink-0 mt-0.5" />
                      <p className="text-[#26221B] font-medium leading-relaxed flex-1">
                        {stop.tip}
                      </p>
                    </div>
                    {stop.cost_vnd && (
                      <p className="text-[10px] sm:text-[11px] text-[#D9822B] font-bold mt-1 pl-5 flex items-center gap-1 font-display">
                        <Coins className="w-3 h-3 text-[#D9822B]" />
                        <span>Chi phí: {stop.cost_vnd}</span>
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 font-display">
                    <a
                      href={getMapsUrl(stop.name, stop.commune)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 sm:py-2 rounded-full bg-[#F0A32F] hover:bg-[#C97F1B] text-[#26221B] hover:text-white text-xs font-bold active:scale-95 transition-all shadow-xs"
                      onClick={e => e.stopPropagation()}
                    >
                      <Navigation className="w-3 h-3" />
                      <span>Chỉ Đường</span>
                    </a>
                    <a
                      href={getTikTokUrl(stop.name, stop.commune)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1 py-1.5 sm:py-2 px-3 rounded-full bg-white border border-[#26221B]/15 hover:border-[#F26B3A] hover:text-[#F26B3A] text-xs font-bold active:scale-95 transition-all"
                      onClick={e => e.stopPropagation()}
                    >
                      <Play className="w-3 h-3 fill-current text-rose-500" />
                      <span>TikTok</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* ─ Travel Pill Connector between stops ──────────────────────────── */}
              {!isLast && stop.travel_to_next_min > 0 && (
                <div className="flex items-center gap-2 py-1 ml-0.5 sm:ml-1 font-display">
                  <div className="w-8 sm:w-11 flex justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#0E8C7F]/60 animate-pulse" />
                  </div>
                  <div className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] text-[#0E8C7F] font-bold bg-[#0E8C7F]/10 border border-[#0E8C7F]/20 px-2 py-0.5 rounded-full shadow-2xs">
                    <Bike className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    <span>Di chuyển {stop.travel_to_next_min} phút</span>
                    {stop.travel_to_next_km > 0 && (
                      <span className="text-[#0E8C7F]/70">• {stop.travel_to_next_km} km</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── SUMMARY FOOTER ─────────────────────────────────────────────────── */}
      <div className="mt-3 bg-[#FFFDF7] rounded-2xl sm:rounded-[22px] p-3.5 sm:p-4 border border-[#26221B]/8 shadow-xs font-body">
        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-extrabold text-[#6B6355] uppercase tracking-wider mb-2 font-display">
          <BarChart3 className="w-3.5 h-3.5 text-[#0E8C7F]" />
          <span>Tổng Quan Hành Trình</span>
        </div>
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2 text-center font-display">
          <div className="p-1.5 sm:p-2 bg-[#FAF3E7] rounded-xl">
            <p className="font-display text-sm sm:text-base font-bold text-[#0E8C7F]">{stops.length}</p>
            <p className="text-[9px] sm:text-[10px] text-[#6B6355] font-medium font-body">Điểm đến</p>
          </div>
          <div className="p-1.5 sm:p-2 bg-[#FAF3E7] rounded-xl">
            <p className="font-display text-sm sm:text-base font-bold text-[#0E8C7F]">{totalDays}</p>
            <p className="text-[9px] sm:text-[10px] text-[#6B6355] font-medium font-body">Số ngày</p>
          </div>
          <div className="p-1.5 sm:p-2 bg-[#FAF3E7] rounded-xl">
            <p className="font-display text-sm sm:text-base font-bold text-[#0E8C7F]">{duration.replace('ngày','ng').replace('đêm','đ')}</p>
            <p className="text-[9px] sm:text-[10px] text-[#6B6355] font-medium font-body">Thời gian</p>
          </div>
          <div className="p-1.5 sm:p-2 bg-[#FAF3E7] rounded-xl">
            <p className="font-display text-sm sm:text-base font-bold text-[#0E8C7F]">{totalKm > 0 ? `~${totalKm.toFixed(0)}km` : '—'}</p>
            <p className="text-[9px] sm:text-[10px] text-[#6B6355] font-medium font-body">Quãng đường</p>
          </div>
        </div>
        {budget_range && (
          <div className="mt-2.5 pt-2 border-t border-[#26221B]/6 flex items-center justify-between text-xs">
            <span className="text-[#6B6355] font-medium font-body text-[11px] sm:text-xs">Chi phí ước tính:</span>
            <span className="text-[#D9822B] font-bold font-display text-xs sm:text-sm">{budget_range}</span>
          </div>
        )}
        <p className="text-[9px] sm:text-[10px] text-[#6B6355]/70 text-center mt-2 font-body">
          Dữ liệu thực địa Tri Tôn, An Giang • Xác thực 100%
        </p>
      </div>

      {/* ── HIGH-RES PDF & QR EXPORT MODAL ─────────────────────────────── */}
      {showExportModal && (
        <ItineraryExportModal
          itinerary={itinerary}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
}
