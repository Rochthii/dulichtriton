'use client';

import React from 'react';
import { 
  Edit, Trash2, Clock, Car, MapPin, DollarSign, 
  CheckCircle2, XCircle, ArrowUp, ArrowDown, Eye
} from 'lucide-react';

export interface StopItem {
  time?: string;
  time_start?: string;
  time_end?: string;
  id?: string;
  name: string;
  commune?: string;
  cluster?: string;
  category?: string;
  tip?: string;
  duration_min?: number;
  travel_to_next_km?: number;
  travel_to_next_min?: number;
  cost_vnd?: string;
  transport_to_next?: string;
  poi_id?: string;
  day?: number;
  order?: number;
}

export interface ItineraryRecord {
  itinerary_id: string;
  id?: string;
  slug?: string;
  emoji?: string;
  title: string;
  duration: string;
  total_distance_km: number;
  recommended_vehicle: string;
  suitable_for?: string;
  for_whom?: string;
  budget_estimate?: string;
  budget_range?: string;
  description?: string;
  tagline?: string;
  stops?: StopItem[];
  created_at?: string;
  is_active?: boolean;
  sort_order?: number;
}

interface ItineraryListTableProps {
  itineraries: ItineraryRecord[];
  onEdit: (tour: ItineraryRecord) => void;
  onDelete: (tourId: string) => void;
  onToggleActive: (tour: ItineraryRecord) => void;
}

export default function ItineraryListTable({
  itineraries,
  onEdit,
  onDelete,
  onToggleActive,
}: ItineraryListTableProps) {
  if (itineraries.length === 0) {
    return (
      <div className="py-16 text-center bg-[#FFFDF7] rounded-3xl border border-[#26221B]/8 p-8 space-y-2 font-body">
        <p className="text-sm font-bold text-[#26221B]">Không tìm thấy lịch trình nào phù hợp với bộ lọc.</p>
        <p className="text-xs text-[#6B6355]">Hãy thử tìm kiếm với từ khóa khác hoặc tạo lịch trình mới.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#FFFDF7] rounded-3xl border border-[#26221B]/10 overflow-hidden shadow-xs font-body">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#FAF3E7] border-b border-[#26221B]/10 text-[#26221B] font-display font-bold">
            <tr>
              <th className="p-3.5 pl-5">STT</th>
              <th className="p-3.5">Lịch Trình</th>
              <th className="p-3.5">Thời Lượng & Cự Ly</th>
              <th className="p-3.5">Điểm Dừng (Stops)</th>
              <th className="p-3.5">Phương Tiện & Chi Phí</th>
              <th className="p-3.5 text-center">Trạng Thái</th>
              <th className="p-3.5 pr-5 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#26221B]/6">
            {itineraries.map((tour, idx) => {
              const stopsCount = (tour.stops || []).length;
              return (
                <tr key={tour.itinerary_id || tour.id || idx} className="hover:bg-[#FAF3E7]/40 transition-colors">
                  <td className="p-3.5 pl-5 font-mono text-[#6B6355] font-bold">
                    #{idx + 1}
                  </td>
                  <td className="p-3.5">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{tour.emoji || '🧭'}</span>
                      <div>
                        <span className="font-display font-bold text-sm text-[#26221B] block">
                          {tour.title}
                        </span>
                        <span className="text-[11px] text-[#6B6355] line-clamp-1">
                          {tour.tagline || tour.description || 'Chưa có mô tả'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5 space-y-0.5">
                    <div className="flex items-center gap-1 font-semibold text-[#0E8C7F]">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{tour.duration}</span>
                    </div>
                    <span className="text-[11px] text-[#6B6355] font-mono block">
                      ~{tour.total_distance_km} km
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className="px-2.5 py-1 rounded-full bg-[#FAF3E7] text-[#26221B] font-bold text-[11px] border border-[#26221B]/10 inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#0E8C7F]" />
                      <span>{stopsCount} Điểm dừng</span>
                    </span>
                  </td>
                  <td className="p-3.5 space-y-0.5">
                    <div className="flex items-center gap-1 text-[11px] text-[#26221B]">
                      <Car className="w-3.5 h-3.5 text-amber-600" />
                      <span>{tour.recommended_vehicle}</span>
                    </div>
                    <span className="text-[10px] text-[#6B6355]">
                      {tour.budget_estimate || tour.budget_range || 'Miễn phí'}
                    </span>
                  </td>
                  <td className="p-3.5 text-center">
                    <button
                      onClick={() => onToggleActive(tour)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-all ${
                        tour.is_active !== false
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                      }`}
                    >
                      {tour.is_active !== false ? 'Kích hoạt' : 'Tạm ẩn'}
                    </button>
                  </td>
                  <td className="p-3.5 pr-5 text-right space-x-1.5 font-display">
                    <button
                      onClick={() => onEdit(tour)}
                      className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#0E8C7F] transition-colors cursor-pointer"
                      title="Chỉnh sửa lịch trình"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(tour.itinerary_id || tour.id || '')}
                      className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                      title="Xóa lịch trình"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
