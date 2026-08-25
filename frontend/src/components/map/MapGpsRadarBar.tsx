'use client';

import React from 'react';
import { LocateFixed, Radio, AlertCircle } from 'lucide-react';

interface MapGpsRadarBarProps {
  userLocation: { lat: number; lng: number } | null;
  radiusKm: number | null;
  isLocating: boolean;
  locationError: string | null;
  onGetLocation: () => void;
  onClearLocation: () => void;
  onSelectRadius: (val: number | null) => void;
}

export default function MapGpsRadarBar({
  userLocation,
  radiusKm,
  isLocating,
  locationError,
  onGetLocation,
  onClearLocation,
  onSelectRadius,
}: MapGpsRadarBarProps) {
  return (
    <div className="space-y-2">
      <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#0E8C7F]/10 via-[#F0A32F]/10 to-transparent border border-[#0E8C7F]/20 flex flex-wrap items-center justify-between gap-3">
        {/* Large 1-Touch GPS Button for Mobile (min 44px height) */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={onGetLocation}
            disabled={isLocating}
            className="flex-1 sm:flex-none min-h-[44px] sm:min-h-[40px] px-4 py-2.5 rounded-xl bg-[#0E8C7F] hover:bg-[#085A52] active:bg-[#06423c] text-white font-bold text-xs sm:text-sm font-display flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95 cursor-pointer touch-manipulation"
          >
            <LocateFixed className={`w-4 h-4 shrink-0 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{userLocation ? '📍 Đang Bật GPS Vị Trí Của Bạn' : '📍 Bật GPS Quét Điểm Gần Tôi'}</span>
          </button>

          {userLocation && (
            <button
              onClick={onClearLocation}
              className="min-h-[44px] px-3 py-2 text-xs text-rose-600 hover:text-rose-700 active:bg-rose-50 rounded-lg font-bold font-display cursor-pointer transition-colors"
            >
              Tắt Radar
            </button>
          )}
        </div>

        {/* 1-Touch Radius Chips */}
        {userLocation && (
          <div className="flex items-center gap-1.5 font-display text-xs w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <span className="font-bold text-[#26221B] flex items-center gap-1 shrink-0 mr-1">
              <Radio className="w-3.5 h-3.5 text-[#0E8C7F]" /> Bán kính:
            </span>
            {[
              { label: '1 km', val: 1 },
              { label: '3 km', val: 3 },
              { label: '5 km', val: 5 },
              { label: '10 km', val: 10 },
              { label: 'Tất cả', val: null },
            ].map((r, i) => (
              <button
                key={i}
                onClick={() => onSelectRadius(r.val)}
                className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95 cursor-pointer touch-manipulation ${
                  radiusKm === r.val
                    ? 'bg-[#0E8C7F] text-white shadow-xs'
                    : 'bg-white text-[#6B6355] border border-[#EBE1D0] hover:bg-slate-50'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {locationError && (
        <div className="text-xs text-amber-800 bg-amber-50 px-3 py-2 rounded-xl border border-amber-200 flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{locationError}</span>
        </div>
      )}
    </div>
  );
}
