'use client';

import React from 'react';
import {
  Search,
  RefreshCw,
  Plus,
  Moon,
  Flame,
  Star,
  Edit,
  Trash2,
  RotateCcw,
  ExternalLink,
  MapPin,
  CheckSquare,
  Square,
  Sparkles,
  Database,
  Image as ImageIcon,
} from 'lucide-react';
import { PlaceRecord, COMMUNES, CATEGORIES } from '../types';

interface PlaceTableProps {
  places: PlaceRecord[];
  loading: boolean;
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
  setSelectedIds: (ids: string[]) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  onAddNew: () => void;
  onOpenAuditLogs: () => void;
  onEditPlace: (place: PlaceRecord) => void;
  onToggleHot: (place: PlaceRecord) => void;
  onToggleNight: (place: PlaceRecord) => void;
  onDeletePlace: (place: PlaceRecord) => void;
  onRestorePlace: (place: PlaceRecord) => void;
  onBatchDelete: () => void;
  onBatchRestore: () => void;
}

export const PlaceTable: React.FC<PlaceTableProps> = ({
  places,
  loading,
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
  setSelectedIds,
  onSearchSubmit,
  onAddNew,
  onOpenAuditLogs,
  onEditPlace,
  onToggleHot,
  onToggleNight,
  onDeletePlace,
  onRestorePlace,
  onBatchDelete,
  onBatchRestore,
}) => {
  // Client-side filtering for fast interactive responsiveness
  const filteredPlaces = places.filter((place) => {
    if (activeStatusFilter === 'ACTIVE' && place.is_active === false) return false;
    if (activeStatusFilter === 'INACTIVE' && place.is_active !== false) return false;
    if (nightFilter && !place.open_late) return false;
    return true;
  });

  const handleSelectAll = () => {
    if (selectedIds.length === filteredPlaces.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredPlaces.map((p) => p.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-3">
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
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
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
          <div className="flex items-center justify-between p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-900 animate-fade-in">
            <span className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-emerald-700" />
              Đã chọn <strong className="text-emerald-950">{selectedIds.length}</strong> địa điểm
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

      {/* 2. Places Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-slate-400 mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-bold">Đang tải danh sách địa điểm Tri Tôn...</p>
          </div>
        ) : filteredPlaces.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            Không tìm thấy địa điểm nào phù hợp với bộ lọc.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                  <th className="p-3.5 w-10 text-center">
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="cursor-pointer text-slate-400 hover:text-slate-600"
                    >
                      {selectedIds.length === filteredPlaces.length && filteredPlaces.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-emerald-700" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="p-3.5">Địa Điểm & Xã</th>
                  <th className="p-3.5">Danh Mục</th>
                  <th className="p-3.5 text-center">Đánh Giá</th>
                  <th className="p-3.5 text-center">Album Ảnh</th>
                  <th className="p-3.5 text-center">Mở Đêm</th>
                  <th className="p-3.5 text-center">Nổi Bật (HOT)</th>
                  <th className="p-3.5 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredPlaces.map((place) => {
                  const isSelected = selectedIds.includes(place.id);
                  const photosCount = Array.isArray(place.photos) ? place.photos.length : (place.image_url ? 1 : 0);

                  return (
                    <tr
                      key={place.id}
                      className={`hover:bg-slate-50/60 transition-all ${
                        place.is_active === false ? 'opacity-50 bg-slate-50/30' : ''
                      } ${isSelected ? 'bg-emerald-50/30' : ''}`}
                    >
                      {/* Checkbox */}
                      <td className="p-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleSelect(place.id)}
                          className="cursor-pointer text-slate-400 hover:text-slate-600"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-emerald-700" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Name & Commune */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          {/* Thumbnail */}
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={place.image_url}
                            alt={place.name}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-100"
                          />
                          <div>
                            <div className="font-extrabold text-slate-800 flex items-center gap-1.5">
                              {place.name}
                              {place.is_hot && (
                                <span className="bg-amber-100 text-amber-800 text-[9px] font-black px-1.5 py-0.2 rounded-md">
                                  HOT
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-400" /> {place.commune}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-3.5">
                        <span className="bg-slate-100 text-slate-700 text-[11px] font-bold px-2.5 py-1 rounded-lg">
                          {place.tourism_category || place.category}
                        </span>
                      </td>

                      {/* Rating */}
                      <td className="p-3.5 text-center">
                        <div className="inline-flex items-center gap-1 text-amber-500 font-bold bg-amber-50 px-2 py-0.5 rounded-md text-[11px]">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {place.rating}
                        </div>
                      </td>

                      {/* Photo Album Count */}
                      <td className="p-3.5 text-center">
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md font-bold text-[11px]">
                          <ImageIcon className="w-3 h-3 text-emerald-600" /> {photosCount} ảnh
                        </span>
                      </td>

                      {/* Open Late Toggle */}
                      <td className="p-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => onToggleNight(place)}
                          className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                            place.open_late
                              ? 'bg-purple-900 text-amber-300 border-purple-700 shadow-xs'
                              : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'
                          }`}
                          title={place.open_late ? 'Đang mở đêm (Bấm để tắt)' : 'Chưa mở đêm (Bấm để bật)'}
                        >
                          <Moon className="w-3.5 h-3.5" />
                        </button>
                      </td>

                      {/* HOT Toggle */}
                      <td className="p-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => onToggleHot(place)}
                          className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                            place.is_hot
                              ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                              : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'
                          }`}
                          title={place.is_hot ? 'Bấm để bỏ HOT' : 'Bấm để gắn HOT'}
                        >
                          <Flame className="w-3.5 h-3.5 fill-current" />
                        </button>
                      </td>

                      {/* Action Buttons */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => onEditPlace(place)}
                            className="p-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 border border-slate-200 transition-all cursor-pointer"
                            title="Chỉnh sửa chi tiết & Album ảnh"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          <a
                            href={`/places/${place.slug || place.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 border border-slate-200 transition-all cursor-pointer"
                            title="Xem trang công khai"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>

                          {place.is_active === false ? (
                            <button
                              type="button"
                              onClick={() => onRestorePlace(place)}
                              className="p-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-all cursor-pointer"
                              title="Khôi phục hiển thị"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onDeletePlace(place)}
                              className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-all cursor-pointer"
                              title="Vô hiệu hóa"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
