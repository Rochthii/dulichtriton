'use client';

import React from 'react';
import { Compass, Plus, Search, RefreshCw, Layers } from 'lucide-react';

interface ItineraryStatsHeaderProps {
  totalCount: number;
  activeCount: number;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onAddNew: () => void;
  onRefresh: () => void;
  loading: boolean;
}

export default function ItineraryStatsHeader({
  totalCount,
  activeCount,
  searchQuery,
  setSearchQuery,
  onAddNew,
  onRefresh,
  loading,
}: ItineraryStatsHeaderProps) {
  return (
    <div className="space-y-4 font-body">
      {/* Top Banner & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-[#FFFDF7] border border-[#26221B]/10 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#0E8C7F] uppercase tracking-wider font-display">
            <Compass className="w-4 h-4 text-[#0E8C7F]" />
            <span>Hệ Thống Quản Trị Tuyến Điểm & Lịch Trình</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#26221B] font-display mt-1">
            Quản Trị 27 Lịch Trình Khép Vòng (Loop Itineraries)
          </h1>
          <p className="text-xs text-[#6B6355] mt-0.5">
            Quản lý các tour du lịch tối ưu cự ly, thời gian và chi phí thực địa tại Tri Tôn.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2.5 rounded-2xl bg-[#FAF3E7] hover:bg-[#EBE1D0] text-[#26221B] border border-[#26221B]/10 transition-colors cursor-pointer"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={onAddNew}
            className="px-4 py-2.5 rounded-2xl bg-[#0E8C7F] hover:bg-[#085A52] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer font-display"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Lịch Trình Mới</span>
          </button>
        </div>
      </div>

      {/* KPI Cards & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#26221B]/8 flex items-center justify-between">
          <div>
            <span className="text-xs text-[#6B6355] font-bold font-display">Tổng Lịch Trình:</span>
            <span className="text-xl font-black text-[#26221B] font-display block">{totalCount} Tour</span>
          </div>
          <span className="p-2.5 rounded-xl bg-emerald-50 text-[#0E8C7F]">
            <Layers className="w-5 h-5" />
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#26221B]/8 flex items-center justify-between">
          <div>
            <span className="text-xs text-[#6B6355] font-bold font-display">Đang Kích Hoạt:</span>
            <span className="text-xl font-black text-emerald-700 font-display block">{activeCount} Tour</span>
          </div>
          <span className="p-2.5 rounded-xl bg-amber-50 text-amber-700">
            <Compass className="w-5 h-5" />
          </span>
        </div>

        {/* Search Input */}
        <div className="relative p-2 rounded-2xl bg-[#FFFDF7] border border-[#26221B]/8 flex items-center">
          <Search className="w-4 h-4 text-[#6B6355] absolute left-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên tour, điểm dừng, cự ly..."
            className="w-full pl-9 pr-3 py-2 bg-transparent text-xs text-[#26221B] placeholder-[#6B6355]/70 focus:outline-none font-body"
          />
        </div>
      </div>
    </div>
  );
}
