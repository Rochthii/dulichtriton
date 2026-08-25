'use client';

import React from 'react';
import {
  RefreshCw,
  Moon,
  Flame,
  Star,
  Edit,
  Trash2,
  RotateCcw,
  CheckSquare,
  Square,
} from 'lucide-react';
import { PlaceRecord } from '../types';
import { PlaceFilterToolbar } from './PlaceFilterToolbar';

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
    <div className="space-y-4 font-body">
      {/* Filter Toolbar */}
      <PlaceFilterToolbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        communeFilter={communeFilter}
        setCommuneFilter={setCommuneFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        nightFilter={nightFilter}
        setNightFilter={setNightFilter}
        activeStatusFilter={activeStatusFilter}
        setActiveStatusFilter={setActiveStatusFilter}
        selectedIds={selectedIds}
        onSearchSubmit={onSearchSubmit}
        onAddNew={onAddNew}
        onOpenAuditLogs={onOpenAuditLogs}
        onBatchDelete={onBatchDelete}
        onBatchRestore={onBatchRestore}
      />

      {/* Places Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-500">Đang tải 149 địa điểm thực địa...</p>
          </div>
        ) : filteredPlaces.length === 0 ? (
          <div className="py-20 text-center text-slate-400 text-xs">
            Không tìm thấy địa điểm nào phù hợp.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-700 font-display font-bold">
                <tr>
                  <th className="p-3.5 pl-5 w-10">
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="text-slate-400 hover:text-emerald-700 cursor-pointer"
                    >
                      {selectedIds.length === filteredPlaces.length && filteredPlaces.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-emerald-700" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="p-3.5">Ảnh & Tên Điểm Đến</th>
                  <th className="p-3.5">Địa Giới Xã & Danh Mục</th>
                  <th className="p-3.5 text-center">Huy Hiệu</th>
                  <th className="p-3.5 text-center">Trạng Thái</th>
                  <th className="p-3.5 pr-5 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {filteredPlaces.map((place) => {
                  const isSelected = selectedIds.includes(place.id);
                  const isInactive = place.is_active === false;

                  return (
                    <tr
                      key={place.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? 'bg-emerald-50/50' : ''
                      } ${isInactive ? 'opacity-60 bg-slate-50/30' : ''}`}
                    >
                      <td className="p-3.5 pl-5">
                        <button
                          type="button"
                          onClick={() => handleToggleSelect(place.id)}
                          className="text-slate-400 hover:text-emerald-700 cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-emerald-700" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={place.image_url || 'https://res.cloudinary.com/dhjesnejt/image/upload/f_auto,q_auto:best,w_800,c_fill/v1786758533/tri_ton_hero/hero_cong_troi_koh_kas.jpg'}
                              alt={place.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-xs font-display flex items-center gap-1.5">
                              <span>{place.name}</span>
                              {place.rating && (
                                <span className="text-[10px] text-amber-700 flex items-center gap-0.5 bg-amber-50 px-1.5 py-0.5 rounded-md font-mono">
                                  <Star className="w-2.5 h-2.5 fill-amber-500" />
                                  {place.rating}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500 font-mono block">
                              ID: {place.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5 space-y-0.5">
                        <span className="font-bold text-slate-700 block font-display">
                          {place.commune}
                        </span>
                        <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md inline-block font-display">
                          {place.tourism_category || place.category}
                        </span>
                      </td>

                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5 font-display">
                          <button
                            type="button"
                            onClick={() => onToggleHot(place)}
                            className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              place.is_hot
                                ? 'bg-orange-500 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-400 hover:text-orange-500'
                            }`}
                            title="Gắn nhãn HOT"
                          >
                            <Flame className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onToggleNight(place)}
                            className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              place.open_late
                                ? 'bg-purple-900 text-amber-300 shadow-xs'
                                : 'bg-slate-100 text-slate-400 hover:text-purple-700'
                            }`}
                            title="Mở đêm"
                          >
                            <Moon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      <td className="p-3.5 text-center font-display">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            !isInactive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {!isInactive ? 'Hoạt động' : 'Tạm ẩn'}
                        </span>
                      </td>

                      <td className="p-3.5 pr-5 text-right font-display space-x-1">
                        <button
                          type="button"
                          onClick={() => onEditPlace(place)}
                          className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition-all cursor-pointer"
                          title="Sửa thông tin"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {!isInactive ? (
                          <button
                            type="button"
                            onClick={() => onDeletePlace(place)}
                            className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-all cursor-pointer"
                            title="Vô hiệu hóa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onRestorePlace(place)}
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition-all cursor-pointer"
                            title="Khôi phục"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
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
