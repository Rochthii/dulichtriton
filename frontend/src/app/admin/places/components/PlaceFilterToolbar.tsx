'use client';

import React from 'react';
import {
  Search,
  Plus,
  Moon,
  Database,
  CheckSquare,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import { COMMUNES, CATEGORIES } from '../types';

interface PlaceFilterToolbarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  communeFilter: string;
  setCommuneFilter: (c: string) => void;
  categoryFilter: string;
  setCategoryFilter: (cat: string) => void;
  nightFilter: boolean;
  setNightFilter: (n: boolean) => void;
  activeStatusFilter: 'ALL' | 'ACTIVE' | 'INACTIVE';
  setActiveStatusFilter: (s: 'ALL' | 'ACTIVE' | 'INACTIVE') => void;
  selectedIds: string[];
  onSearchSubmit: (e: React.FormEvent) => void;
  onAddNew: () => void;
  onOpenAuditLogs: () => void;
  onBatchDelete: () => void;
  onBatchRestore: () => void;
}

export function PlaceFilterToolbar({
  searchQuery,
  setSearchQuery,
  communeFilter,
  setCommuneFilter,
  categoryFilter,
  setCategoryFilter,
  nightFilter,
  setNightFilter,
  activeStatusFilter,
  setActiveStatusFilter,
  selectedIds,
  onSearchSubmit,
  onAddNew,
  onOpenAuditLogs,
  onBatchDelete,
  onBatchRestore,
}: PlaceFilterToolbarProps) {
  return (
    <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-3 font-body">
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search bar */}
        <form onSubmit={onSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên, xã, mô tả..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:bg-white focus:border-emerald-600 outline-hidden transition-all"
          />
        </form>

        {/* Filters & Actions */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end font-display">
          <select
            value={communeFilter}
            onChange={(e) => setCommuneFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-hidden cursor-pointer"
          >
            {COMMUNES.map((c) => (
              <option key={c} value={c}>
                {c === 'ALL' ? '📍 Tất Cả Xã / Thị Trấn' : c}
              </option>
            ))}
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-hidden cursor-pointer"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'ALL' ? '🏷️ Tất Cả Danh Mục' : cat}
              </option>
            ))}
          </select>

          {/* Night Filter Button */}
          <button
            type="button"
            onClick={() => setNightFilter(!nightFilter)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
              nightFilter
                ? 'bg-purple-900 text-amber-300 border-purple-800 shadow-xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Moon className="w-3.5 h-3.5" /> Mở Đêm
          </button>

          {/* Status Filter */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setActiveStatusFilter('ACTIVE')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                activeStatusFilter === 'ACTIVE' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500'
              }`}
            >
              Đang Hiện
            </button>
            <button
              type="button"
              onClick={() => setActiveStatusFilter('INACTIVE')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                activeStatusFilter === 'INACTIVE' ? 'bg-white text-red-700 shadow-xs' : 'text-slate-500'
              }`}
            >
              Đã Ẩn
            </button>
            <button
              type="button"
              onClick={() => setActiveStatusFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                activeStatusFilter === 'ALL' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500'
              }`}
            >
              Tất Cả
            </button>
          </div>

          {/* Audit Logs */}
          <button
            type="button"
            onClick={onOpenAuditLogs}
            className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
            title="Xem Nhật Ký Kiểm Toán"
          >
            <Database className="w-4 h-4 text-slate-600" />
          </button>

          {/* Add New Button */}
          <button
            type="button"
            onClick={onAddNew}
            className="px-4 py-2 bg-[#1B4D3E] hover:bg-[#143d31] text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Thêm Địa Điểm
          </button>
        </div>
      </div>

      {/* Batch Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-900 animate-fade-in font-display">
          <span className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-emerald-700" />
            Đã chọn <strong className="text-emerald-950 font-mono">{selectedIds.length}</strong> địa điểm
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBatchDelete}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-[11px] shadow-xs transition-all flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Vô Hiệu Hóa ({selectedIds.length})
            </button>
            <button
              type="button"
              onClick={onBatchRestore}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-[11px] shadow-xs transition-all flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Khôi Phục ({selectedIds.length})
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
