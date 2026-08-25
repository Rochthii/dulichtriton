'use client';

import React from 'react';
import { Sparkles, RefreshCw, Wand2, Search } from 'lucide-react';

interface StoryStatsHeaderProps {
  totalCount: number;
  hasStoryCount: number;
  filterType: 'all' | 'has_story' | 'no_story';
  setFilterType: (ft: 'all' | 'has_story' | 'no_story') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onRefresh: () => void;
  loading: boolean;
  onBatchFormat: () => void;
  isBatchProcessing: boolean;
}

export default function StoryStatsHeader({
  totalCount,
  hasStoryCount,
  filterType,
  setFilterType,
  searchQuery,
  setSearchQuery,
  onRefresh,
  loading,
  onBatchFormat,
  isBatchProcessing,
}: StoryStatsHeaderProps) {
  return (
    <div className="space-y-4 font-body">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-[#FFFDF7] border border-[#26221B]/10 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#0E8C7F] uppercase tracking-wider font-display">
            <Sparkles className="w-4 h-4 text-[#0E8C7F]" />
            <span>Cultural & Heritage Story Studio</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#26221B] font-display mt-1">
            Biên Tập Sự Tích & Di Sản Văn Hóa 149 Điểm Đến
          </h1>
          <p className="text-xs text-[#6B6355] mt-0.5">
            Soạn thảo câu chuyện bản địa, định dạng typography chuẩn và thuyết minh cho du khách.
          </p>
        </div>

        <div className="flex items-center gap-2 font-display">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2.5 rounded-2xl bg-[#FAF3E7] hover:bg-[#EBE1D0] text-[#26221B] border border-[#26221B]/10 transition-colors cursor-pointer"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={onBatchFormat}
            disabled={isBatchProcessing}
            className="px-4 py-2.5 rounded-2xl bg-[#0E8C7F] hover:bg-[#085A52] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <Wand2 className="w-4 h-4 text-amber-300" />
            <span>{isBatchProcessing ? 'Đang chuẩn hóa...' : 'Chuẩn Hóa Typography'}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-[#FFFDF7] p-4 rounded-3xl border border-[#26221B]/8 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-display">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                filterType === 'all'
                  ? 'bg-[#0E8C7F] text-white shadow-2xs'
                  : 'bg-[#FAF3E7] text-[#6B6355] hover:bg-[#FAF3E7]/80'
              }`}
            >
              Tất Cả ({totalCount})
            </button>
            <button
              onClick={() => setFilterType('has_story')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                filterType === 'has_story'
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'bg-emerald-50 text-emerald-800'
              }`}
            >
              Đã Có Sự Tích ({hasStoryCount})
            </button>
            <button
              onClick={() => setFilterType('no_story')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                filterType === 'no_story'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-amber-50 text-amber-800'
              }`}
            >
              Chưa Có Sự Tích ({totalCount - hasStoryCount})
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative pt-2 border-t border-[#26221B]/6">
          <Search className="w-4 h-4 text-[#6B6355] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên điểm đến hoặc xã..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#FAF3E7] border border-[#26221B]/10 text-xs text-[#26221B] placeholder-[#6B6355]/70 focus:outline-none focus:border-[#0E8C7F]"
          />
        </div>
      </div>
    </div>
  );
}
