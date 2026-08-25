'use client';

import React from 'react';
import { MessageSquareHeart, Search, RefreshCw, Filter } from 'lucide-react';

export const FEEDBACK_CATEGORIES: Record<string, string> = {
  all: 'Tất Cả Danh Mục',
  place_contribution: 'Đóng góp điểm mới',
  place_correction: 'Báo sai sót thông tin',
  photo_contribution: 'Gửi tặng ảnh đẹp',
  photo_report: 'Báo lỗi hình ảnh',
  feature_request: 'Đề xuất tính năng',
  general: 'Góp ý chung',
};

interface FeedbackStatsHeaderProps {
  totalCount: number;
  pendingCount: number;
  reviewedCount: number;
  resolvedCount: number;
  statusFilter: string;
  setStatusFilter: (st: string) => void;
  categoryFilter: string;
  setCategoryFilter: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onRefresh: () => void;
  loading: boolean;
}

export default function FeedbackStatsHeader({
  totalCount,
  pendingCount,
  reviewedCount,
  resolvedCount,
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
  searchQuery,
  setSearchQuery,
  onRefresh,
  loading,
}: FeedbackStatsHeaderProps) {
  return (
    <div className="space-y-4 font-body">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-[#FFFDF7] border border-[#26221B]/10 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#0E8C7F] uppercase tracking-wider font-display">
            <MessageSquareHeart className="w-4 h-4 text-[#0E8C7F]" />
            <span>Community Feedback & Contribution Portal</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#26221B] font-display mt-1">
            Hộp Thư Phản Hồi & Đóng Góp Thực Địa
          </h1>
          <p className="text-xs text-[#6B6355] mt-0.5">
            Tiếp nhận báo cáo sai lệch thông tin, đóng góp ảnh thực địa và ý kiến từ du khách.
          </p>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-2.5 rounded-2xl bg-[#FAF3E7] hover:bg-[#EBE1D0] text-[#26221B] border border-[#26221B]/10 transition-colors cursor-pointer self-start sm:self-auto"
          title="Làm mới danh sách"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filter Controls */}
      <div className="bg-[#FFFDF7] p-4 rounded-3xl border border-[#26221B]/8 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-display">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-[#0E8C7F] text-white shadow-2xs'
                  : 'bg-[#FAF3E7] text-[#6B6355] hover:bg-[#FAF3E7]/80'
              }`}
            >
              Tất Cả ({totalCount})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'pending'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-amber-50 text-amber-800'
              }`}
            >
              Chờ Xử Lý ({pendingCount})
            </button>
            <button
              onClick={() => setStatusFilter('reviewed')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'reviewed'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-blue-50 text-blue-800'
              }`}
            >
              Đang Xác Minh ({reviewedCount})
            </button>
            <button
              onClick={() => setStatusFilter('resolved')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'resolved'
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'bg-emerald-50 text-emerald-800'
              }`}
            >
              Đã Giải Quyết ({resolvedCount})
            </button>
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="p-2 rounded-xl bg-[#FAF3E7] border border-[#26221B]/10 text-xs focus:outline-none focus:border-[#0E8C7F]"
          >
            {Object.entries(FEEDBACK_CATEGORIES).map(([k, label]) => (
              <option key={k} value={k}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Search Bar */}
        <div className="relative pt-2 border-t border-[#26221B]/6">
          <Search className="w-4 h-4 text-[#6B6355] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên người gửi, số điện thoại, nội dung góp ý..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#FAF3E7] border border-[#26221B]/10 text-xs text-[#26221B] placeholder-[#6B6355]/70 focus:outline-none focus:border-[#0E8C7F]"
          />
        </div>
      </div>
    </div>
  );
}
