'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navigation, MapPin, Map, Sparkles, Compass, Star } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface MapPoint {
  id: string;
  name: string;
  category: string;
  commune: string;
  lat: number;
  lng: number;
}

export default function MiniGisMapBanner() {
  const [points, setPoints] = useState<MapPoint[]>([]);
  const [activePoint, setActivePoint] = useState<MapPoint | null>(null);

  useEffect(() => {
    async function loadMapCoordinates() {
      try {
        const { data, error } = await supabase
          .from('places')
          .select('id, name, category, commune, latitude, longitude')
          .not('latitude', 'is', null)
          .not('longitude', 'is', null)
          .limit(12);

        if (!error && data && data.length > 0) {
          const mapped: MapPoint[] = data.map((item: any) => ({
            id: item.id,
            name: item.name,
            category: item.category || 'Địa danh',
            commune: item.commune || 'Tri Tôn',
            lat: Number(item.latitude) || 10.42,
            lng: Number(item.longitude) || 105.01,
          }));
          setPoints(mapped);
          setActivePoint(mapped[0]);
        }
      } catch (err) {
        console.error('[MiniGisMapBanner] Coordinates fetch error:', err);
      }
    }
    loadMapCoordinates();
  }, []);

  return (
    <section className="rounded-3xl bg-slate-900 text-white p-6 sm:p-8 border border-slate-800 shadow-xl overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(#1B4D3E_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
        {/* Left Info Column */}
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-bold shadow-sm">
            <Navigation className="h-3.5 w-3.5 text-[#D99B26]" />
            <span>Hệ Thống Tọa Độ 149 Địa Điểm Đã Xác Minh</span>
          </div>

          <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
            Bản Đồ Số Du Lịch Tri Tôn
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
            Tra cứu vị trí chính xác của Hồ Tà Pạ, Núi Cô Tô, Chùa Khmer Xà Tón và các quán Gà Đốt Ô Thum trên bản đồ vệ tinh GPS.
          </p>

          {/* Quick Active Point Indicator */}
          {activePoint && (
            <div className="p-3 rounded-2xl bg-slate-800/90 border border-slate-700 flex items-center gap-3 backdrop-blur-md">
              <div className="w-8 h-8 rounded-xl bg-[#1B4D3E] border border-[#D99B26] flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-[#D99B26]" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-xs text-white truncate">{activePoint.name}</h4>
                <p className="text-[11px] text-emerald-400 truncate">{activePoint.commune} • {activePoint.category}</p>
              </div>
              <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-950/80 px-2 py-1 rounded-md border border-amber-500/30 shrink-0">
                {activePoint.lat.toFixed(4)}, {activePoint.lng.toFixed(4)}
              </span>
            </div>
          )}

          <div className="pt-1">
            <Link
              href="/map"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#1B4D3E] hover:bg-[#143B2F] text-white font-bold text-xs rounded-2xl shadow-lg transition-all border border-[#D99B26]/30 active:scale-95"
            >
              <Map className="h-4 w-4 text-[#D99B26]" />
              <span>Mở Bản Đồ Khám Phá 149 Địa Điểm</span>
            </Link>
          </div>
        </div>

        {/* Right Interactive Visual Card */}
        <div className="w-full lg:w-[420px] h-[220px] sm:h-[260px] rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden relative shadow-inner group flex items-center justify-center">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40 filter saturate-150 transition-transform duration-700 group-hover:scale-105"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=1200&auto=format&fit=crop')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />

          {/* Interactive Pins Overlay */}
          <div className="relative z-10 w-full h-full p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-400 bg-slate-900/80 px-2.5 py-1 rounded-full border border-emerald-500/30 backdrop-blur-md flex items-center gap-1">
                <Compass className="w-3 h-3 text-[#D99B26] animate-spin" />
                Live GPS Vector Pins
              </span>
              <span className="text-[10px] font-extrabold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded-md border border-amber-500/40">
                An Giang 67
              </span>
            </div>

            {/* Quick Selectable Pins Carousel */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none snap-x">
              {points.slice(0, 5).map((pt) => (
                <button
                  key={pt.id}
                  onClick={() => setActivePoint(pt)}
                  className={`px-3 py-1.5 rounded-xl text-left text-xs shrink-0 snap-start transition-all border ${
                    activePoint?.id === pt.id
                      ? 'bg-[#1B4D3E] border-[#D99B26] text-white shadow-md scale-105'
                      : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:border-emerald-500/50'
                  }`}
                >
                  <p className="font-bold text-[11px] truncate max-w-[120px]">{pt.name}</p>
                  <p className="text-[9px] text-emerald-300 truncate">{pt.commune}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
