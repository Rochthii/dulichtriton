'use client';

import React from 'react';
import { MapPin, Sparkles, RefreshCw, Zap } from 'lucide-react';
import { PlaceRecord } from '../types';

interface PlacesStatsBannerProps {
  places: PlaceRecord[];
  onSyncVector: () => void;
  syncingVector: boolean;
}

export function PlacesStatsBanner({
  places,
  onSyncVector,
  syncingVector,
}: PlacesStatsBannerProps) {
  const activeCount = places.filter((p) => p.is_active !== false).length;
  const hotCount = places.filter((p) => p.is_hot).length;
  const nightCount = places.filter((p) => p.open_late).length;

  return (
    <div className="space-y-4 font-body">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-[#FFFDF7] border border-[#26221B]/10 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#0E8C7F] uppercase tracking-wider font-display">
            <MapPin className="w-4 h-4 text-[#0E8C7F]" />
            <span>Master 149 Verified Coordinates</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#26221B] font-display mt-1">
            Quản Lý 149 Địa Điểm Du Lịch Thực Địa Tri Tôn
          </h1>
          <p className="text-xs text-[#6B6355] mt-0.5">
            Cập nhật tọa độ GPS, hình ảnh CDN, câu chuyện văn hóa, giờ mở cửa và tiện ích.
          </p>
        </div>

        <button
          type="button"
          onClick={onSyncVector}
          disabled={syncingVector}
          className="px-4 py-2.5 rounded-2xl bg-[#0E8C7F] hover:bg-[#085A52] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer font-display self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{syncingVector ? 'Đang đồng bộ AI...' : 'Đồng Bộ Vector AI RAG'}</span>
        </button>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-display">
        <div className="p-3.5 rounded-2xl bg-white border border-slate-100 shadow-2xs">
          <span className="text-[10px] text-slate-500 font-bold uppercase block">Tổng Địa Điểm</span>
          <span className="text-lg font-black text-slate-900 font-mono">{places.length} POIs</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-white border border-slate-100 shadow-2xs">
          <span className="text-[10px] text-slate-500 font-bold uppercase block">Đang Kích Hoạt</span>
          <span className="text-lg font-black text-emerald-700 font-mono">{activeCount} POIs</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-white border border-slate-100 shadow-2xs">
          <span className="text-[10px] text-slate-500 font-bold uppercase block">Điểm Đến Hot</span>
          <span className="text-lg font-black text-orange-600 font-mono">{hotCount} Điểm</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-white border border-slate-100 shadow-2xs">
          <span className="text-[10px] text-slate-500 font-bold uppercase block">Mở Cửa Đêm</span>
          <span className="text-lg font-black text-purple-700 font-mono">{nightCount} Điểm</span>
        </div>
      </div>
    </div>
  );
}
