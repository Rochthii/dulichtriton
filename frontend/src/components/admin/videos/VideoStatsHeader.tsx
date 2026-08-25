'use client';

import React from 'react';
import { Video, Plus, Search, RefreshCw, Sparkles, ShieldCheck } from 'lucide-react';

interface VideoStatsHeaderProps {
  totalCount: number;
  verifiedCount: number;
  pendingCount: number;
  statusFilter: 'ALL' | 'VERIFIED' | 'PENDING' | 'REJECTED';
  setStatusFilter: (st: 'ALL' | 'VERIFIED' | 'PENDING' | 'REJECTED') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onOpenImport: () => void;
  onRefresh: () => void;
  loading: boolean;
}

export default function VideoStatsHeader({
  totalCount,
  verifiedCount,
  pendingCount,
  statusFilter,
  setStatusFilter,
  searchQuery,
  setSearchQuery,
  onOpenImport,
  onRefresh,
  loading,
}: VideoStatsHeaderProps) {
  return (
    <div className="space-y-4 font-body">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-[#FFFDF7] border border-[#26221B]/10 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-rose-600 uppercase tracking-wider font-display">
            <Video className="w-4 h-4 text-rose-600" />
            <span>TikTok & Short Video Review Matrix</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#26221B] font-display mt-1">
            Quản Lý Video TikTok & Đa Phương Tiện Thực Tế
          </h1>
          <p className="text-xs text-[#6B6355] mt-0.5">
            Duyệt, gán nhãn địa điểm và kiểm soát nội dung video review ẩm thực, check-in Bảy Núi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2.5 rounded-2xl bg-[#FAF3E7] hover:bg-[#EBE1D0] text-[#26221B] border border-[#26221B]/10 transition-colors cursor-pointer"
            title="Làm mới danh sách"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={onOpenImport}
            className="px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer font-display"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Quét / Thêm Video TikTok</span>
          </button>
        </div>
      </div>

      {/* KPI Filters & Search */}
      <div className="bg-[#FFFDF7] p-4 rounded-3xl border border-[#26221B]/8 shadow-xs space-y-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none font-display">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-[#0E8C7F] text-white shadow-2xs'
                : 'bg-[#FAF3E7] text-[#6B6355] hover:bg-[#FAF3E7]/80'
            }`}
          >
            Tất Cả ({totalCount})
          </button>

          <button
            onClick={() => setStatusFilter('VERIFIED')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'VERIFIED'
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'bg-emerald-50 text-emerald-800'
            }`}
          >
            Đã Xác Minh ({verifiedCount})
          </button>

          <button
            onClick={() => setStatusFilter('PENDING')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'PENDING'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-amber-50 text-amber-800'
            }`}
          >
            Chờ Phê Duyệt ({pendingCount})
          </button>

          <button
            onClick={() => setStatusFilter('REJECTED')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'REJECTED'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'bg-rose-50 text-rose-800'
            }`}
          >
            Đã Ẩn / Loại Bỏ
          </button>
        </div>

        {/* Search Box */}
        <div className="relative pt-2 border-t border-[#26221B]/6">
          <Search className="w-4 h-4 text-[#6B6355] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tiêu đề, kênh TikTok (@user), hoặc địa điểm gán nhãn..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#FAF3E7] border border-[#26221B]/10 text-xs text-[#26221B] placeholder-[#6B6355]/70 focus:outline-none focus:border-[#0E8C7F]"
          />
        </div>
      </div>
    </div>
  );
}
