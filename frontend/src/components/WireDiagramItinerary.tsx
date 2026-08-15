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
  Info
} from 'lucide-react';
import ItineraryExportModal from './ItineraryExportModal';
import localMasterPois from '@/data/triton_pois_full.json';

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

function getTikTokUrl(name: string, commune: string): string {
  const q = encodeURIComponent(`${name} ${commune} Tri Tôn`);
  return `https://www.tiktok.com/search/video?q=${q}`;
}

function getMapsUrl(name: string, commune: string): string {
  const q = encodeURIComponent(`${name} ${commune} Tri Tôn An Giang`);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

function getPlaceSummary(stopName: string, stopDesc?: string): string {
  if (stopDesc && stopDesc.trim().length > 15) return stopDesc;

  const normalized = stopName.toLowerCase().replace(/[()]/g, '').trim();

  // 1. Search directly in master 149 POIs
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

  if (found && found.description) {
    return found.description;
  }

  // 2. Curated descriptive summaries for common tour stops
  if (normalized.includes('tuyến tránh') || normalized.includes('đt941') || normalized.includes('đt948')) {
    return 'Cung đường nhựa phẳng phiu uốn lượn tuyệt đẹp giữa cánh đồng lúa và dãy núi Thất Sơn, là điểm hóng gió, ngắm hoàng hôn đỏ rực và chụp ảnh thốt nốt lý tưởng.';
  }
  if (normalized.includes('chợ đêm') || normalized.includes('phố đi bộ')) {
    return 'Khu ẩm thực đêm sôi động nhất trung tâm Tri Tôn với hàng chục quầy xiên que nướng khói thơm nức, chè thốt nốt cốt dừa, lẩu bò và các món ăn vặt đường phố Khmer.';
  }
  if (normalized.includes('gà đốt') || normalized.includes('ô thum')) {
    return 'Thưởng thức món đặc sản gà đồi ướp lá chúc nướng than giòn da thơm nức bên lòng hồ Ô Thum trong lành mát rượi.';
  }
  if (normalized.includes('tà pạ') || normalized.includes('tuyệt tình cốc')) {
    return 'Hồ nước ngọt xanh ngọc bích nằm trên đỉnh đồi Tà Pạ, bao quanh bởi vách đá dựng đứng và rặng thốt nốt cổ thụ nhìn ra cánh đồng lúa Bảy Núi.';
  }
  if (normalized.includes('chùa xà tón') || normalized.includes('xatón')) {
    return 'Ngôi chùa Khmer cổ kính nhất An Giang (trên 300 năm tuổi), di tích kiến trúc nghệ thuật quốc gia lưu giữ bộ kinh lá buông quý giá.';
  }
  if (normalized.includes('hàng còng') || normalized.includes('kraing ta pốch')) {
    return 'Con đường làng rợp bóng hai hàng cây còng cổ thụ đan vòm xanh mướt, tạo nên khung cảnh thanh bình như trong truyện cổ tích.';
  }
  if (normalized.includes('vồ hội') || normalized.includes('cô tô')) {
    return 'Mỏm đá thần kỳ vươn ra không trung trên đỉnh núi Cô Tô, điểm săn mây bình minh và ngắm trọn vẹn toàn cảnh đồng lúa Tri Tôn.';
  }
  if (normalized.includes('tức dụp') || normalized.includes('2 triệu đô')) {
    return 'Di tích lịch sử hào hùng với hệ thống hang đá tự nhiên kiên cố gắn liền với truyền thuyết kháng chiến oanh liệt của quân dân Bảy Núi.';
  }
  if (normalized.includes('thốt nốt trái tim') || normalized.includes('cụm trái tim')) {
    return 'Cụm cây thốt nốt mọc tự nhiên kết thành hình trái tim độc đáo giữa cánh đồng lúa bát ngát, tọa độ sống ảo triệu view của giới trẻ.';
  }
  if (normalized.includes('soài so') || normalized.includes('suối vàng')) {
    return 'Hồ nước nhân tạo lớn nhất vùng Bảy Núi nép mình dưới chân núi Cô Tô, không khí mát lành với dòng suối Bạc róc rách quanh năm.';
  }

  return 'Điểm dừng chân trải nghiệm đặc sắc trong hành trình khám phá cảnh sắc và văn hóa bản địa Tri Tôn.';
}

export default function WireDiagramItinerary({ itinerary }: WireDiagramItineraryProps) {
  const { title, tagline, duration, budget_range, stops } = itinerary;

  const totalKm  = stops.reduce((s, st) => s + (st.travel_to_next_km || 0), 0);
  const isMultiDay = stops.some(s => (s.day || 1) > 1);
  const totalDays  = isMultiDay ? Math.max(...stops.map(s => s.day || 1)) : 1;

  // Scroll detection for animated metro line drawing
  const [visibleStops, setVisibleStops] = useState<Record<number, boolean>>({});
  const [showExportModal, setShowExportModal] = useState(false);
  const stopRefs = useRef<(HTMLDivElement | null)[]>([]);

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
        { threshold: 0.2, rootMargin: '0px 0px -50px 0px' }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
  }, [stops]);

  return (
    <div className="w-full font-body select-none">
      {/* ── HEADER (Folk-Modern Ticket-Stub Banner) ─────────────────────────── */}
      <div className="bg-[#0E8C7F] rounded-[22px] p-4 mb-4 text-white shadow-[0_2px_10px_rgba(38,34,27,0.08)] relative overflow-hidden border border-[#0B6B60] transition-all">
        {/* Subtle Background Pattern */}
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-radial from-white/10 to-transparent pointer-events-none" />

        <div className="flex items-start justify-between gap-2 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#FFD37A] uppercase tracking-wider mb-1 bg-black/20 px-2 py-0.5 rounded-full font-display">
              <CheckCircle2 className="w-3 h-3 text-[#FFD37A]" />
              <span>Lịch Trình Thực Địa Đã Xác Minh</span>
            </div>
            <h3 className="font-display text-lg sm:text-xl font-bold leading-tight text-[#FFFDF7]">
              {title}
            </h3>
            <p className="text-white/80 text-xs mt-1 leading-snug font-body">{tagline}</p>
          </div>

          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F0A32F] hover:bg-[#D98E20] text-[#26221B] font-bold text-xs shadow-xs active:scale-95 transition-all cursor-pointer shrink-0"
            title="Xuất Bản Đồ Sơ Đồ Lịch Trình PDF & Mã QR"
          >
            <Printer className="w-3.5 h-3.5 text-[#26221B]" />
            <span className="hidden sm:inline">Xuất Sơ Đồ PDF/QR</span>
            <span className="sm:hidden">Xuất PDF</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 pt-2.5 border-t border-white/15 text-xs text-white/90 font-display">
          <span className="flex items-center gap-1 font-medium">
            <Clock className="w-3.5 h-3.5 text-[#FFD37A]" /> {duration}
          </span>
          <span className="opacity-40">•</span>
          <span className="flex items-center gap-1 font-medium">
            <Bike className="w-3.5 h-3.5 text-[#FFD37A]" /> ~{totalKm.toFixed(0)} km
          </span>
          {budget_range && (
            <>
              <span className="opacity-40">•</span>
              <span className="flex items-center gap-1 font-medium">
                <Coins className="w-3.5 h-3.5 text-[#FFD37A]" /> {budget_range}
              </span>
            </>
          )}
        </div>
      </div>

      {/* ── METRO-LINE WIRE DIAGRAM STOPS ─────────────────────────────────── */}
      <div className="relative pl-1">
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
              className={`relative transition-all duration-700 ease-out ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-20 translate-y-4'
              }`}
            >
              {/* ─ Day separator ─────────────────────────────────────────── */}
              {isNewDay && (
                <div className="flex items-center gap-2 my-4 ml-14">
                  <div className="flex-1 h-px bg-[#0E8C7F]/20" />
                  <span className="text-xs font-bold text-[#0E8C7F] bg-[#0E8C7F]/10 px-3 py-1 rounded-full border border-[#0E8C7F]/30 font-display">
                    Ngày {thisDay}
                  </span>
                  <div className="flex-1 h-px bg-[#0E8C7F]/20" />
                </div>
              )}

              {/* ─ Metro Stop Row ─────────────────────────────────────────── */}
              <div className="flex items-stretch gap-3 mb-0">
                {/* Left: Time + Metro-line station connector */}
                <div className="flex flex-col items-center shrink-0 w-12 pt-3">
                  <span className="text-[11px] font-bold text-[#6B6355] tabular-nums leading-none font-display">
                    {stop.time_start}
                  </span>
                  
                  {/* Metro Station Circle with Station Node Pulse Ring */}
                  <div className="station-node w-3.5 h-3.5 rounded-full bg-[#0E8C7F] border-2 border-[#FAF3E7] shadow-xs my-1.5 shrink-0 transition-transform duration-300 group-hover:scale-125" />

                  {/* 4px Jade Connecting Metro-line with Grow Animation */}
                  {!isLast && (
                    <div
                      className={`flex-1 w-1 bg-[#0E8C7F] rounded-full min-h-[40px] opacity-80 ${
                        isVisible ? 'metro-line-grow' : 'scale-y-0 opacity-20'
                      }`}
                    />
                  )}
                </div>

                {/* Right: Station Card (Tactile Micro-interaction) */}
                <div className="flex-1 bg-[#FFFDF7] rounded-[20px] border border-[#26221B]/8 p-3.5 mb-2 shadow-[0_2px_8px_rgba(38,34,27,0.06)] hover:shadow-[0_8px_24px_rgba(38,34,27,0.12)] hover:-translate-y-0.5 transition-all duration-300">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <div className={`p-1.5 rounded-xl ${cat.bg} ${cat.text} shrink-0 mt-0.5 border ${cat.border}`}>
                        <CatIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-display font-bold text-sm sm:text-base text-[#26221B] leading-tight line-clamp-1">
                          {stop.name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1 font-body">
                          <MapPin className="w-3 h-3 text-[#0E8C7F] shrink-0" />
                          <span className="text-[11px] text-[#6B6355] font-medium truncate">{stop.commune}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cat.bg} ${cat.text} border ${cat.border} font-display`}>
                            {cat.label}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-[#6B6355] shrink-0 tabular-nums bg-[#FAF3E7] px-2 py-0.5 rounded-full font-body">
                      {stop.duration_min >= 60
                        ? `${Math.floor(stop.duration_min / 60)}h${stop.duration_min % 60 ? String(stop.duration_min % 60).padStart(2, '0') : ''}`
                        : `${stop.duration_min} phút`}
                    </span>
                  </div>

                  {/* ── GIỚI THIỆU TÓM TẮT ĐỊA ĐIỂM (PLACE SUMMARY / INTRO) ── */}
                  {placeSummary && (
                    <div className="text-xs text-slate-700 leading-relaxed font-body mb-2.5 bg-white/80 p-2.5 rounded-xl border border-slate-100 shadow-2xs">
                      <p className="line-clamp-2">
                        {placeSummary}
                      </p>
                    </div>
                  )}

                  {/* Field Tip (Patrick Hand Handwritten Feel) */}
                  <div className="bg-[#FAF3E7] rounded-xl px-3 py-2 mb-3 border border-[#26221B]/5">
                    <div className="flex items-start gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-[#F0A32F] shrink-0 mt-0.5" />
                      <p className="text-sm text-[#26221B] font-note leading-relaxed">
                        {stop.tip}
                      </p>
                    </div>
                    {stop.cost_vnd && (
                      <p className="text-[11px] text-[#D9822B] font-bold mt-1.5 pl-5 flex items-center gap-1 font-display">
                        <Coins className="w-3 h-3 text-[#D9822B]" />
                        <span>Chi phí: {stop.cost_vnd}</span>
                      </p>
                    )}
                  </div>

                  {/* Action Buttons: Solid Palm CTA + Outline TikTok with tactile tap feedback */}
                  <div className="flex gap-2 font-display">
                    <a
                      href={getMapsUrl(stop.name, stop.commune)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-full bg-[#F0A32F] hover:bg-[#C97F1B] text-[#26221B] hover:text-white text-xs font-bold active:scale-95 transition-all shadow-xs"
                      onClick={e => e.stopPropagation()}
                    >
                      <Navigation className="w-3 h-3" />
                      <span>Chỉ Đường</span>
                    </a>
                    <a
                      href={getTikTokUrl(stop.name, stop.commune)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1 py-2 px-3.5 rounded-full bg-transparent border border-[#26221B]/20 hover:border-[#F26B3A] hover:text-[#F26B3A] hover:bg-white text-xs font-bold active:scale-95 transition-all"
                      onClick={e => e.stopPropagation()}
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>TikTok</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* ─ Travel Pill Connector between stops ──────────────────────────── */}
              {!isLast && stop.travel_to_next_min > 0 && (
                <div className="flex items-center gap-3 py-1.5 ml-1 font-display">
                  <div className="w-10 flex justify-center">
                    <div className="w-2 h-2 rounded-full bg-[#0E8C7F]/50 animate-pulse" />
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-[10px] text-[#0E8C7F] font-bold bg-[#0E8C7F]/10 border border-[#0E8C7F]/20 px-2.5 py-0.5 rounded-full shadow-2xs">
                    <Bike className="w-3 h-3" />
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
      <div className="mt-4 bg-[#FFFDF7] rounded-[22px] p-4 border border-[#26221B]/8 shadow-xs font-body">
        <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#6B6355] uppercase tracking-wider mb-2.5 font-display">
          <BarChart3 className="w-4 h-4 text-[#0E8C7F]" />
          <span>Tổng Quan Hành Trình</span>
        </div>
        <div className="grid grid-cols-4 gap-2 text-center font-display">
          <div className="p-2 bg-[#FAF3E7] rounded-xl">
            <p className="font-display text-base font-bold text-[#0E8C7F]">{stops.length}</p>
            <p className="text-[10px] text-[#6B6355] font-medium font-body">Điểm đến</p>
          </div>
          <div className="p-2 bg-[#FAF3E7] rounded-xl">
            <p className="font-display text-base font-bold text-[#0E8C7F]">{totalDays}</p>
            <p className="text-[10px] text-[#6B6355] font-medium font-body">Số ngày</p>
          </div>
          <div className="p-2 bg-[#FAF3E7] rounded-xl">
            <p className="font-display text-base font-bold text-[#0E8C7F]">{duration.replace('ngày','ng').replace('đêm','đ')}</p>
            <p className="text-[10px] text-[#6B6355] font-medium font-body">Thời gian</p>
          </div>
          <div className="p-2 bg-[#FAF3E7] rounded-xl">
            <p className="font-display text-base font-bold text-[#0E8C7F]">{totalKm > 0 ? `~${totalKm.toFixed(0)}km` : '—'}</p>
            <p className="text-[10px] text-[#6B6355] font-medium font-body">Quãng đường</p>
          </div>
        </div>
        {budget_range && (
          <div className="mt-3 pt-2.5 border-t border-[#26221B]/6 flex items-center justify-between text-xs">
            <span className="text-[#6B6355] font-medium font-body">Chi phí ước tính:</span>
            <span className="text-[#D9822B] font-bold font-display">{budget_range}</span>
          </div>
        )}
        <p className="text-[10px] text-[#6B6355]/70 text-center mt-2.5 font-body">
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
