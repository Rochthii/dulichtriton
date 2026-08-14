'use client';

import React from 'react';
import { MapPin, Clock, Bike, ChevronRight, Play, Navigation } from 'lucide-react';

export interface ItineraryStop {
  order: number;
  name: string;
  commune: string;
  category: 'check-in' | 'food' | 'spiritual' | 'nature' | 'history';
  time_start: string;
  time_end: string;
  duration_min: number;
  tip: string;
  travel_to_next_min: number;
  travel_to_next_km: number;
  photo_coords?: [number, number];
  cost_vnd?: string;        // from lichtrinh.json
  day?: number;             // for multi-day itineraries
  transport_to_next?: string;
  imageUrl?: string;
  rating?: number;
}

export interface ItineraryData {
  slug: string;
  emoji: string;
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
}

const CATEGORY_STYLE: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  'check-in': { bg: 'bg-blue-50',   text: 'text-blue-700',   dot: 'bg-blue-500',    label: 'Check-in' },
  'food':     { bg: 'bg-amber-50',  text: 'text-amber-700',  dot: 'bg-amber-500',   label: 'Ẩm thực' },
  'spiritual':{ bg: 'bg-violet-50', text: 'text-violet-700', dot: 'bg-violet-500',  label: 'Tâm linh' },
  'nature':   { bg: 'bg-emerald-50',text: 'text-emerald-700',dot: 'bg-emerald-500', label: 'Thiên nhiên' },
  'history':  { bg: 'bg-rose-50',   text: 'text-rose-700',   dot: 'bg-rose-500',    label: 'Lịch sử' },
};

const CATEGORY_ICON: Record<string, string> = {
  'check-in':  '📸',
  'food':      '🍽️',
  'spiritual': '🏛️',
  'nature':    '🌿',
  'history':   '📜',
};

function getTikTokUrl(name: string, commune: string): string {
  const q = encodeURIComponent(`${name} ${commune} Tri Tôn`);
  return `https://www.tiktok.com/search?q=${q}`;
}

function getMapsUrl(name: string, commune: string): string {
  const q = encodeURIComponent(`${name} ${commune} Tri Tôn An Giang`);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

export default function WireDiagramItinerary({ itinerary }: WireDiagramItineraryProps) {
  const { emoji, title, tagline, duration, budget_range, stops } = itinerary;

  const totalKm  = stops.reduce((s, st) => s + (st.travel_to_next_km || 0), 0);
  const isMultiDay = stops.some(s => (s.day || 1) > 1);
  const totalDays  = isMultiDay ? Math.max(...stops.map(s => s.day || 1)) : 1;

  return (
    <div className="w-full font-sans select-none">
      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div className="bg-[#1B4D3E] rounded-2xl px-4 py-3 mb-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-xs font-bold text-emerald-300 uppercase tracking-widest mb-0.5">
              Lịch trình đã xác minh
            </div>
            <h3 className="text-white font-extrabold text-base leading-tight">
              {emoji} {title}
            </h3>
            <p className="text-emerald-200 text-xs mt-0.5 leading-snug">{tagline}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2.5 text-xs text-emerald-200">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {duration}</span>
          <span>•</span>
          <span className="flex items-center gap-1"><Bike className="w-3 h-3" /> ~{totalKm.toFixed(0)} km</span>
          {budget_range && (
            <>
              <span>•</span>
              <span>💰 {budget_range}</span>
            </>
          )}
        </div>
      </div>

      {/* ── WIRE DIAGRAM STOPS ─────────────────────────────────────────────── */}
      <div className="relative">
        {stops.map((stop, idx) => {
          const cat   = CATEGORY_STYLE[stop.category] || CATEGORY_STYLE['nature'];
          const icon  = CATEGORY_ICON[stop.category]  || '📍';
          const isLast = idx === stops.length - 1;
          const prevDay = idx > 0 ? (stops[idx-1].day || 1) : 1;
          const thisDay = stop.day || 1;
          const isNewDay = isMultiDay && thisDay > prevDay;

          return (
            <div key={stop.order} className="relative">
              {/* ─ Day separator ─────────────────────────────────────────── */}
              {isNewDay && (
                <div className="flex items-center gap-2 my-3 ml-15">
                  <div className="flex-1 h-px bg-[#1B4D3E]/20" />
                  <span className="text-[10px] font-extrabold text-[#1B4D3E] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Ngày {thisDay}
                  </span>
                  <div className="flex-1 h-px bg-[#1B4D3E]/20" />
                </div>
              )}

              {/* ─ Stop Card ─────────────────────────────────────────────── */}
              <div className="flex items-stretch gap-3 mb-0">
                {/* Left: Time + vertical connector line */}
                <div className="flex flex-col items-center shrink-0 w-12">
                  <span className="text-[10px] font-black text-slate-500 tabular-nums leading-none pt-3.5">
                    {stop.time_start}
                  </span>
                  {!isLast && (
                    <div className="flex-1 w-0.5 bg-gradient-to-b from-[#1B4D3E] to-slate-200 mt-1 mb-0 rounded-full" />
                  )}
                </div>

                {/* Right: Card */}
                <div className={`flex-1 rounded-2xl border ${cat.bg} border-transparent mb-0 overflow-hidden shadow-2xs`}
                  style={{ borderColor: 'rgba(0,0,0,0.04)' }}
                >
                  {/* Card header */}
                  <div className="px-3 pt-3 pb-2">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        <span className="text-base leading-none">{icon}</span>
                        <div>
                          <p className="font-extrabold text-sm text-slate-900 leading-tight line-clamp-1">
                            {stop.name}
                          </p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <MapPin className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                            <span className="text-[10px] text-slate-500 font-medium truncate">{stop.commune}</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0 rounded-full ${cat.bg} ${cat.text} border border-current/20`}>
                              {cat.label}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 shrink-0 tabular-nums">
                        {stop.duration_min >= 60
                          ? `${Math.floor(stop.duration_min / 60)}h${stop.duration_min % 60 ? String(stop.duration_min % 60).padStart(2, '0') : ''}`
                          : `${stop.duration_min}p`}
                      </span>
                    </div>

                    {/* Tip + cost */}
                    <div className="bg-white/70 rounded-xl px-2.5 py-1.5 mb-2">
                      <p className="text-[11px] text-slate-600 leading-snug">
                        <span className="font-bold text-[#B45309]">💡 </span>
                        {stop.tip}
                      </p>
                      {stop.cost_vnd && (
                        <p className="text-[10px] text-[#B45309] font-bold mt-1">
                          💰 {stop.cost_vnd}
                        </p>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      <a
                        href={getTikTokUrl(stop.name, stop.commune)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-slate-900 text-white text-[11px] font-extrabold active:scale-95 transition-all"
                        onClick={e => e.stopPropagation()}
                      >
                        <Play className="w-3 h-3 fill-white" />
                        TikTok Review
                      </a>
                      <a
                        href={getMapsUrl(stop.name, stop.commune)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-blue-600 text-white text-[11px] font-extrabold active:scale-95 transition-all"
                        onClick={e => e.stopPropagation()}
                      >
                        <Navigation className="w-3 h-3" />
                        Chỉ Đường
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* ─ Travel connector between stops ──────────────────────────── */}
              {!isLast && stop.travel_to_next_min > 0 && (
                <div className="flex items-center gap-3 py-2">
                  <div className="w-12 flex justify-center">
                    <ChevronRight className="w-4 h-4 text-slate-300 rotate-90" />
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold">
                    <Bike className="w-3 h-3" />
                    <span>{stop.travel_to_next_min} phút</span>
                    {stop.travel_to_next_km > 0 && (
                      <span className="text-slate-300">•  {stop.travel_to_next_km} km</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── SUMMARY FOOTER ─────────────────────────────────────────────────── */}
      <div className="mt-3 bg-slate-50 rounded-2xl px-4 py-3 border border-slate-100">
        <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">📊 Tổng Hành Trình</p>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div>
            <p className="text-sm font-extrabold text-[#1B4D3E]">{stops.length}</p>
            <p className="text-[9px] text-slate-500 font-medium">Điểm</p>
          </div>
          <div>
            <p className="text-sm font-extrabold text-[#1B4D3E]">{totalDays}</p>
            <p className="text-[9px] text-slate-500 font-medium">{totalDays > 1 ? 'Ngày' : 'Ngày'}</p>
          </div>
          <div>
            <p className="text-sm font-extrabold text-[#1B4D3E]">{duration.replace('ngày','ng').replace('đêm','đ')}</p>
            <p className="text-[9px] text-slate-500 font-medium">Thời gian</p>
          </div>
          <div>
            <p className="text-sm font-extrabold text-[#1B4D3E]">{totalKm > 0 ? `~${totalKm.toFixed(0)}km` : '—'}</p>
            <p className="text-[9px] text-slate-500 font-medium">Quãng đường</p>
          </div>
        </div>
        {budget_range && (
          <div className="mt-2 pt-2 border-t border-slate-200 text-center">
            <p className="text-[11px] font-bold text-slate-600">
              💰 Chi phí ước tính: <span className="text-[#B45309] font-extrabold">{budget_range}</span>
            </p>
          </div>
        )}
        <p className="text-[9px] text-slate-400 text-center mt-1.5">
          Dữ liệu thực địa Tri Tôn, An Giang • Cập nhật 2026
        </p>
      </div>
    </div>
  );
}
