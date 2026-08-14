'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, MapPin, Navigation, Sparkles, QrCode, 
  Car, Bike, Compass, Utensils, ChevronRight, Share2, Info, AlertTriangle, 
  Sun, Moon, Play, ArrowDown, ExternalLink, Star, Filter, CheckCircle2
} from 'lucide-react';
import PageHeaderBanner from './PageHeaderBanner';
import ItineraryExportModal from './ItineraryExportModal';
import { getGoogleMapsUrl } from '@/lib/utils';
import type { ItineraryData, ItineraryStop } from './WireDiagramItinerary';

interface PresetSummary {
  slug: string;
  emoji: string;
  title: string;
  tagline: string;
  for_whom: string;
  duration: string;
  budget_range: string;
  sort_order: number;
}

// Visual image lookup dictionary based on place name keywords
const PLACE_IMAGES: Record<string, string> = {
  'tapa': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop',
  'tà pạ': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop',
  'chùa tà pạ': 'https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=1200&auto=format&fit=crop',
  'xà tón': 'https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=1200&auto=format&fit=crop',
  'svayton': 'https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=1200&auto=format&fit=crop',
  'cổng trời': 'https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=1200&auto=format&fit=crop',
  'koh kas': 'https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=1200&auto=format&fit=crop',
  'gà đốt': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop',
  'ô thum': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop',
  'soài so': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop',
  'soài chék': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop',
  'cô tô': 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1200&auto=format&fit=crop',
  'tơ lụa': 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200&auto=format&fit=crop',
  'đồng lúa': 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200&auto=format&fit=crop',
  'thốt nốt': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop',
  'chợ đêm': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop',
  'chợ tri tôn': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop',
  'đu đủ đâm': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=1200&auto=format&fit=crop',
  'lẩu bò': 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop',
  'bò nướng': 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop',
  'ba chúc': 'https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=1200&auto=format&fit=crop',
  'tức dụp': 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1200&auto=format&fit=crop',
  'ô tà sóc': 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1200&auto=format&fit=crop',
  'cà phê': 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=1200&auto=format&fit=crop',
  'coffee': 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=1200&auto=format&fit=crop',
  'thả diều': 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1200&auto=format&fit=crop',
  'tuyến tránh': 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1200&auto=format&fit=crop',
  'hàng còng': 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1200&auto=format&fit=crop',
  'vòm còng': 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1200&auto=format&fit=crop',
  'bánh bò': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1200&auto=format&fit=crop',
  'bún cá': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=1200&auto=format&fit=crop',
  'cháo bò': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=1200&auto=format&fit=crop',
  'vồ hội': 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1200&auto=format&fit=crop',
  'săn mây': 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1200&auto=format&fit=crop',
  'suối': 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?q=80&w=1200&auto=format&fit=crop',
};

function getPlaceImage(name: string): string {
  const low = name.toLowerCase();
  for (const [key, url] of Object.entries(PLACE_IMAGES)) {
    if (low.includes(key)) return url;
  }
  return 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop';
}

const CATEGORY_STYLE: Record<string, { bg: string; label: string }> = {
  'check-in':  { bg: 'bg-blue-50 text-blue-700 border-blue-200',     label: 'Check-in Sống Ảo' },
  'food':      { bg: 'bg-amber-50 text-amber-800 border-amber-200',   label: 'Ẩm Thực Đặc Sản' },
  'spiritual': { bg: 'bg-violet-50 text-violet-700 border-violet-200', label: 'Chùa & Tâm Linh' },
  'nature':    { bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', label: 'Thiên Nhiên & Núi' },
  'history':   { bg: 'bg-rose-50 text-rose-800 border-rose-200',     label: 'Di Tích Lịch Sử' },
};

type DurationFilter = 'all' | '1-day' | 'evening' | '2-day' | '3-day';

export default function ItineraryClientPage() {
  const [presets, setPresets] = useState<PresetSummary[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>('kinh-dien-1-ngay');
  const [currentItinerary, setCurrentItinerary] = useState<ItineraryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [durationFilter, setDurationFilter] = useState<DurationFilter>('all');
  const [transport, setTransport] = useState<'bike' | 'car'>('bike');
  const [showExportModal, setShowExportModal] = useState(false);

  // ── Fetch presets list on mount ───────────────────────────────────────────
  useEffect(() => {
    async function loadPresets() {
      try {
        const res = await fetch('/api/v1/chat/itinerary');
        if (!res.ok) throw new Error('Failed to load presets');
        const data = await res.json();
        if (Array.isArray(data.presets)) {
          setPresets(data.presets);
        }
      } catch (err) {
        console.error('Error fetching itinerary presets:', err);
      }
    }
    loadPresets();
  }, []);

  // ── Fetch specific itinerary when slug changes ────────────────────────────
  useEffect(() => {
    async function loadItinerary(slug: string) {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/v1/chat/itinerary?slug=${slug}`);
        if (!res.ok) throw new Error('Failed to fetch itinerary');
        const data = await res.json();
        if (data.itinerary) {
          setCurrentItinerary(data.itinerary);
        }
      } catch (err) {
        console.error('Error fetching itinerary detail:', err);
      } finally {
        setIsLoading(false);
      }
    }
    if (selectedSlug) {
      loadItinerary(selectedSlug);
    }
  }, [selectedSlug]);

  // ── Filter presets by duration ───────────────────────────────────────────
  const filteredPresets = presets.filter(p => {
    if (durationFilter === 'all') return true;
    const d = p.duration.toLowerCase();
    if (durationFilter === '1-day') return d.includes('1 ngày') && !d.includes('đêm') && !d.includes('tối');
    if (durationFilter === 'evening') return d.includes('tối') || d.includes('chiều-tối') || d.includes('đêm');
    if (durationFilter === '2-day') return d.includes('2 ngày');
    if (durationFilter === '3-day') return d.includes('3 ngày');
    return true;
  });

  // Group stops by day for rendering
  const stopsByDay: Record<number, ItineraryStop[]> = {};
  if (currentItinerary?.stops) {
    for (const stop of currentItinerary.stops) {
      const dayNum = stop.day || 1;
      if (!stopsByDay[dayNum]) stopsByDay[dayNum] = [];
      stopsByDay[dayNum].push(stop);
    }
  }

  const daysList = Object.keys(stopsByDay).map(Number).sort((a, b) => a - b);
  const totalStopsCount = currentItinerary?.stops?.length || 0;

  return (
    <>
      {/* Page Header Banner */}
      <PageHeaderBanner
        badgeText="Dữ Liệu Thực Địa Tri Tôn Đã Xác Minh 2026"
        badgeIcon={Sparkles}
        title="35 BỘ LỊCH TRÌNH CHUẨN DU LỊCH TRI TÔN"
        subtitle="Hệ thống lịch trình tối ưu theo từng nhu cầu: 1 ngày, 2N1Đ, 3N2Đ, tour ẩm thực, tâm linh, trekking, săn ảnh và trải nghiệm đêm Tri Tôn."
        countLabel="Lịch trình đang xem"
        countValue={currentItinerary ? `${currentItinerary.emoji} ${currentItinerary.title}` : 'Đang tải...'}
      />

      {/* ── ITINERARY PRESET SELECTOR BAR ─────────────────────────────────── */}
      <section className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <Compass className="w-5 h-5 text-[#1B4D3E]" />
              <span>Chọn Lịch Trình Phù Hợp Với Bạn</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Chọn theo số ngày hoặc chủ đề bạn muốn khám phá tại Bảy Núi
            </p>
          </div>

          {/* Duration Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { key: 'all',     label: 'Tất Cả' },
              { key: '1-day',   label: '1 Ngày' },
              { key: 'evening', label: 'Buổi Tối' },
              { key: '2-day',   label: '2N1Đ' },
              { key: '3-day',   label: '3N2Đ' },
            ].map(f => (
              <button
                key={f.key}
                type="button"
                onClick={() => setDurationFilter(f.key as DurationFilter)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                  durationFilter === f.key
                    ? 'bg-[#1B4D3E] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Preset Cards Carousel / Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 pt-4 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
          {filteredPresets.map(p => {
            const isSelected = selectedSlug === p.slug;
            return (
              <button
                key={p.slug}
                type="button"
                onClick={() => setSelectedSlug(p.slug)}
                className={`text-left p-3 rounded-2xl border transition-all active:scale-95 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-emerald-50/80 border-[#1B4D3E] ring-2 ring-[#1B4D3E]/20 shadow-xs'
                    : 'bg-[#F8F9FA] border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30'
                }`}
              >
                <div>
                  <div className="text-xl leading-none mb-1.5">{p.emoji}</div>
                  <h4 className={`text-xs font-extrabold line-clamp-1 leading-tight ${isSelected ? 'text-[#1B4D3E]' : 'text-slate-900'}`}>
                    {p.title}
                  </h4>
                  <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                    {p.for_whom}
                  </p>
                </div>
                <div className="mt-2 pt-1.5 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#D99B26]">{p.duration}</span>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#1B4D3E]" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Transport & Controls */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-600">Phương tiện:</span>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setTransport('bike')}
                className={`px-3 py-1 rounded-xl font-bold flex items-center gap-1 transition-all ${
                  transport === 'bike'
                    ? 'bg-[#D99B26] text-slate-950 shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Bike className="w-3.5 h-3.5" />
                <span>Xe Máy</span>
              </button>
              <button
                type="button"
                onClick={() => setTransport('car')}
                className={`px-3 py-1 rounded-xl font-bold flex items-center gap-1 transition-all ${
                  transport === 'car'
                    ? 'bg-[#D99B26] text-slate-950 shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Car className="w-3.5 h-3.5" />
                <span>Ô Tô</span>
              </button>
            </div>
          </div>

          <button
            onClick={() => setShowExportModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#D99B26] hover:bg-[#c48b20] text-slate-950 font-extrabold transition-all shadow-xs"
          >
            <QrCode className="w-4 h-4" />
            <span>Xuất QR / PDF Lịch Trình</span>
          </button>
        </div>
      </section>

      {/* ── ITINERARY DETAIL CONTENT ─────────────────────────────────────── */}
      {isLoading ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-3">
          <div className="inline-block w-8 h-8 border-4 border-[#1B4D3E] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-slate-600">Đang nạp lịch trình thực địa...</p>
        </div>
      ) : currentItinerary ? (
        <div className="space-y-8 mb-12">
          {/* Header Card Summary */}
          <div className="bg-[#1B4D3E] text-white rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-emerald-300 uppercase tracking-widest block mb-1">
                  🗺️ Lịch Trình Xác Thực Tri Tôn
                </span>
                <h1 className="text-2xl sm:text-3xl font-black">
                  {currentItinerary.emoji} {currentItinerary.title}
                </h1>
                <p className="text-emerald-100 text-sm mt-1 max-w-2xl leading-relaxed">
                  {currentItinerary.tagline}
                </p>
              </div>

              {/* Metrics Badge */}
              <div className="flex flex-wrap gap-2 md:flex-col md:items-end">
                <div className="px-3.5 py-1.5 rounded-2xl bg-[#143B2F] border border-emerald-700/60 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#D99B26]" />
                  <span className="text-xs font-extrabold">{currentItinerary.duration}</span>
                </div>
                {currentItinerary.budget_range && (
                  <div className="px-3.5 py-1.5 rounded-2xl bg-[#143B2F] border border-emerald-700/60 text-xs font-extrabold text-amber-300">
                    💰 {currentItinerary.budget_range}
                  </div>
                )}
                <div className="px-3.5 py-1.5 rounded-2xl bg-[#143B2F] border border-emerald-700/60 text-xs text-emerald-200">
                  👥 {currentItinerary.for_whom}
                </div>
              </div>
            </div>
          </div>

          {/* Day by Day Sections */}
          {daysList.map(dayNum => {
            const stops = stopsByDay[dayNum] || [];
            return (
              <div key={dayNum} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
                {/* Day Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#1B4D3E]" />
                    <span>{daysList.length > 1 ? `Ngày ${dayNum}` : 'Lộ Trình Trong Ngày'}</span>
                  </h3>
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                    {stops.length} Điểm Dừng
                  </span>
                </div>

                {/* Stops Flow */}
                <div className="relative space-y-6">
                  {stops.map((stop, idx) => {
                    const catStyle = CATEGORY_STYLE[stop.category] || CATEGORY_STYLE['nature'];
                    const imgUrl = getPlaceImage(stop.name);
                    const isLast = idx === stops.length - 1;
                    const mapsUrl = getGoogleMapsUrl({ name: stop.name, commune: stop.commune });
                    const tikTokSearchUrl = `https://www.tiktok.com/search?q=${encodeURIComponent(`${stop.name} Tri Tôn An Giang`)}`;

                    return (
                      <React.Fragment key={stop.order || idx}>
                        {/* Stop Card Node */}
                        <div className="group relative flex flex-col md:flex-row items-stretch rounded-3xl bg-[#F8F9FA] border border-slate-200 hover:border-emerald-500/50 shadow-xs hover:shadow-lg transition-all duration-300 overflow-hidden">
                          {/* Left Photo Thumbnail */}
                          <div className="relative w-full md:w-72 h-48 md:h-auto overflow-hidden shrink-0 bg-slate-200">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={imgUrl}
                              alt={stop.name}
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />

                            {/* Node Index Badge */}
                            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 text-amber-300 font-extrabold text-xs shadow-xs border border-amber-300/40">
                              <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-black text-[11px]">
                                {stop.order || idx + 1}
                              </span>
                              <span>NODE #{stop.order || idx + 1}</span>
                            </div>

                            {/* Category Label */}
                            <div className="absolute bottom-3 left-3 right-3 text-white">
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300 px-2 py-0.5 rounded bg-slate-900/70 inline-block mb-1">
                                {catStyle.label}
                              </span>
                              <h4 className="text-base font-extrabold line-clamp-1">
                                {stop.name}
                              </h4>
                            </div>
                          </div>

                          {/* Right Content Body */}
                          <div className="flex flex-1 flex-col justify-between p-5 space-y-3">
                            <div className="space-y-2">
                              {/* Time & Commune */}
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="px-3 py-1 rounded-xl bg-[#1B4D3E] text-white font-mono font-bold text-xs flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5 text-amber-300" />
                                    <span>{stop.time_start}</span>
                                    {stop.duration_min > 0 && (
                                      <span className="text-emerald-300 text-[10px]">
                                        ({stop.duration_min >= 60 ? `${Math.floor(stop.duration_min / 60)}h${stop.duration_min % 60 ? String(stop.duration_min % 60).padStart(2, '0') : ''}` : `${stop.duration_min}p`})
                                      </span>
                                    )}
                                  </span>

                                  <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${catStyle.bg}`}>
                                    {catStyle.label}
                                  </span>

                                  {stop.cost_vnd && (
                                    <span className="px-2.5 py-1 rounded-xl bg-amber-100 text-amber-900 text-xs font-bold border border-amber-200">
                                      💰 {stop.cost_vnd}
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
                                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  <span>{stop.commune || 'Tri Tôn'}</span>
                                </div>
                              </div>

                              {/* Title */}
                              <h3 className="text-lg font-black text-slate-900 group-hover:text-emerald-800 transition-colors">
                                {stop.name}
                              </h3>

                              {/* Tip / Activity / Notes */}
                              {stop.tip && (
                                <div className="bg-white rounded-2xl p-3 border border-slate-200/80">
                                  <p className="text-xs text-slate-700 leading-relaxed">
                                    <span className="font-bold text-[#B45309]">💡 Trải nghiệm & Mẹo: </span>
                                    {stop.tip}
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Action Links (TikTok & Google Maps) */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200/80">
                              {/* TikTok Search CTA */}
                              <a
                                href={tikTokSearchUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold shadow-2xs transition-colors"
                              >
                                <Play className="w-3.5 h-3.5 fill-white text-white" />
                                <span>Xem TikTok Video Review</span>
                              </a>

                              {/* Google Maps GPS Route */}
                              <a
                                href={mapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-2xs transition-colors"
                              >
                                <Navigation className="w-3.5 h-3.5 text-amber-300" />
                                <span>Chỉ Đường Google Maps</span>
                              </a>
                            </div>
                          </div>
                        </div>

                        {/* Transit Arrow to Next Stop */}
                        {!isLast && (
                          <div className="flex items-center justify-center my-3">
                            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100/80 text-emerald-900 border border-emerald-300 text-xs font-black shadow-2xs">
                              <ArrowDown className="w-4 h-4 text-emerald-700" />
                              <span>
                                {stop.transport_to_next || (
                                  stop.travel_to_next_min > 0
                                    ? `🛵 Di chuyển ${stop.travel_to_next_min} phút${stop.travel_to_next_km > 0 ? ` • ${stop.travel_to_next_km} km` : ''}`
                                    : '📍 Di chuyển sang điểm kế tiếp'
                                )}
                              </span>
                            </div>
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center">
          <p className="text-slate-600 font-bold">Không tìm thấy lịch trình này.</p>
        </div>
      )}

      {/* Seasonal & Emergency Guidance */}
      <div className="my-10">
        <div className="bg-gradient-to-br from-amber-50 via-white to-amber-100/50 rounded-3xl p-6 sm:p-8 border border-amber-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Sun className="w-5 h-5 text-amber-600" />
            <h3 className="text-lg font-black text-slate-900">🎚️ Lưu Ý & Biến Thể Mùa Du Lịch Tri Tôn</h3>
          </div>
          <p className="text-xs text-slate-600">Những lưu ý thực tế để chuyến đi thuận lợi nhất:</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-2xs space-y-1">
              <span className="font-extrabold text-amber-800 block mb-1">🌾 Mùa lúa chín (T9–T11):</span>
              <p className="text-slate-700">Cánh đồng Tà Pạ vàng rực rỡ, thích hợp chụp ảnh sáng sớm 6:00–7:30 và hoàng hôn 16:30–17:30.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-2xs space-y-1">
              <span className="font-extrabold text-rose-800 block mb-1">🐂 Dịp Lễ hội Đua Bò Sene Dolta (T9–T10 Âm lịch):</span>
              <p className="text-slate-700">Đua bò diễn ra tại sân chùa Tà Pạ hoặc chùa Thơ Mít, lượng khách rất đông, cần chuẩn bị sớm từ 6h sáng.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-2xs space-y-1">
              <span className="font-extrabold text-amber-900 block mb-1">🍗 Đặt món Gà Đốt Ô Thum:</span>
              <p className="text-slate-700">Nên gọi điện đặt trước 45–60 phút để quán ướp và đốt than kịp, tránh phải chờ lâu vào giờ trưa.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-2xs space-y-1">
              <span className="font-extrabold text-indigo-900 block mb-1">🛵 Di chuyển & Trang phục:</span>
              <p className="text-slate-700">Xe máy là phương tiện cơ động nhất. Khi viếng chùa Khmer cần mặc trang phục lịch sự, che vai và đầu gối.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-2xs space-y-1 md:col-span-2 lg:col-span-2">
              <span className="font-extrabold text-emerald-900 block mb-1">💵 Tiền mặt & Điện thoại:</span>
              <p className="text-slate-700">Chuẩn bị sẵn tiền mặt cho các quán nhỏ và hàng nước ven đường. Tải trước bản đồ offline khi đi sâu vào vùng núi.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && currentItinerary && (
        <ItineraryExportModal
          onClose={() => setShowExportModal(false)}
          tourTitle={currentItinerary.title}
          duration={currentItinerary.duration}
          totalSpots={totalStopsCount}
        />
      )}
    </>
  );
}
