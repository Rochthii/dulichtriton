'use client';

import React from 'react';
import { Compass } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface PlacesClusterBannerProps {
  cluster: {
    name: string;
    name_en?: string;
    badge: string;
    badge_en?: string;
    communes: string[];
  } | null;
  onClear: () => void;
  placesCount: number;
}

export default function PlacesClusterBanner({
  cluster,
  onClear,
  placesCount,
}: PlacesClusterBannerProps) {
  const { language } = useLanguage();
  const isEn = language === 'en';

  if (!cluster) return null;

  const clusterName = isEn && cluster.name_en ? cluster.name_en : cluster.name;
  const clusterBadge = isEn && cluster.badge_en ? cluster.badge_en : cluster.badge;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-[#0E8C7F]/15 to-amber-500/10 border-2 border-[#0E8C7F]/40 shadow-xs font-body">
      <div className="flex items-center gap-2.5">
        <span className="p-2 rounded-xl bg-[#0E8C7F] text-white shrink-0">
          <Compass className="w-4 h-4" />
        </span>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#0E8C7F] uppercase tracking-wider font-display">
              {isEn ? "Filtering by Key Cluster" : "Đang lọc theo cụm trọng điểm"}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#F0A32F] text-[#26221B] font-display">
              {clusterBadge}
            </span>
          </div>
          <h3 className="text-sm sm:text-base font-extrabold text-[#26221B] font-display">
            {clusterName} ({placesCount} {isEn ? "destinations" : "địa điểm"})
          </h3>
          <p className="text-[11px] text-[#6B6355] font-body">
            {isEn ? "Including communes:" : "Bao gồm các xã:"} {cluster.communes.join(", ")}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onClear}
        className="self-start sm:self-center inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 shadow-2xs transition-all cursor-pointer font-display"
      >
        <span>{isEn ? "✕ Clear cluster filter (View all Verified spots)" : "✕ Xóa lọc cụm (Xem tất cả 149 điểm)"}</span>
      </button>
    </div>
  );
}
