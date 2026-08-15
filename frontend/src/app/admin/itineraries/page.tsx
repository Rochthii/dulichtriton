'use client';

import React, { useState, useEffect } from 'react';
import {
  FileCheck,
  Search,
  Plus,
  Edit,
  Trash2,
  Clock,
  Compass,
  DollarSign,
  Car,
  MapPin,
  CheckCircle2,
  X,
  RefreshCw,
  Eye,
} from 'lucide-react';

interface StopItem {
  time: string;
  id?: string;
  name: string;
  cluster?: string;
}

interface ItineraryRecord {
  itinerary_id: string;
  title: string;
  duration: string;
  total_distance_km: number;
  recommended_vehicle: string;
  suitable_for?: string;
  budget_estimate?: string;
  description?: string;
  stops?: StopItem[];
  created_at?: string;
}

export default function AdminItinerariesPage() {
  const [itineraries, setItineraries] = useState<ItineraryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTour, setEditingTour] = useState<ItineraryRecord | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const [newTour, setNewTour] = useState<Partial<ItineraryRecord>>({
    title: '',
    duration: '1 ngày (07:00 - 18:00)',
    total_distance_km: 30,
    recommended_vehicle: 'Xe máy / Ô tô',
    suitable_for: 'Gia đình & Nhóm bạn',
    budget_estimate: '350.000đ - 600.000đ/người',
    description: '',
    stops: [
      { time: '07:00', name: 'Hồ Tà Pạ (Check-in sáng)', cluster: 'Tà Pạ' },
      { time: '11:30', name: 'Gà Đốt Ô Thum (Ăn trưa)', cluster: 'Ô Lâm' },
      { time: '16:30', name: 'Ngắm hoàng hôn Tuyến Tránh', cluster: 'Tri Tôn' },
    ],
  });

  const fetchItineraries = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/itineraries');
      const data = await res.json();
      if (data.itineraries) {
        setItineraries(data.itineraries);
      }
    } catch (err) {
      console.warn('Failed to fetch itineraries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItineraries();
  }, []);

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTour) return;

    try {
      const res = await fetch('/api/v1/admin/itineraries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingTour),
      });

      if (res.ok) {
        setItineraries(itineraries.map((it) => (it.itinerary_id === editingTour.itinerary_id ? editingTour : it)));
        setEditingTour(null);
        setStatusMsg(`Đã cập nhật tour "${editingTour.title}" thành công!`);
        setTimeout(() => setStatusMsg(null), 3000);
      }
    } catch (err) {
      console.warn('Failed to save itinerary:', err);
    }
  };

  const handleCreateNew = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/admin/itineraries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTour),
      });

      if (res.ok) {
        const data = await res.json();
        setItineraries([data.itinerary, ...itineraries]);
        setIsAddingNew(false);
        setStatusMsg(`Đã tạo lịch trình mới thành công!`);
        setTimeout(() => setStatusMsg(null), 3000);
      }
    } catch (err) {
      console.warn('Failed to create itinerary:', err);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Bạn có chắc muốn xóa lịch trình "${title}"?`)) return;

    try {
      const res = await fetch(`/api/v1/admin/itineraries?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setItineraries(itineraries.filter((it) => it.itinerary_id !== id));
        setStatusMsg(`Đã xóa tour "${title}"!`);
        setTimeout(() => setStatusMsg(null), 3000);
      }
    } catch (err) {
      console.warn('Failed to delete itinerary:', err);
    }
  };

  const filtered = itineraries.filter((it) =>
    it.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (it.duration && it.duration.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
              CMS Lịch Trình & Tuyến Tour
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 font-bold text-xs border border-amber-200">
              {itineraries.length} Tour Presets
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Quản Lý 35 Lịch Trình & Kịch Bản Gợi Ý
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Thiết lập danh sách các điểm dừng, cự ly km, phương tiện di chuyển và chi phí dự kiến cho từng tour tham quan Tri Tôn.
          </p>
        </div>

        <button
          onClick={() => setIsAddingNew(true)}
          type="button"
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-[#1B4D3E] hover:bg-[#143B2F] text-white font-bold text-xs shadow-md cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 text-amber-300" />
          <span>Tạo Lịch Trình Mới</span>
        </button>
      </div>

      {/* Status Toast */}
      {statusMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{statusMsg}</span>
          </div>
          <button onClick={() => setStatusMsg(null)} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm tour theo tên hoặc thời lượng (1 ngày, 2N1Đ...)"
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold"
          />
        </div>
        <button
          onClick={fetchItineraries}
          className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold cursor-pointer"
          title="Làm mới"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Tour Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400 font-bold">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
            Đang tải dữ liệu kịch bản tour...
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 font-bold">
            Không tìm thấy lịch trình nào phù hợp.
          </div>
        ) : (
          filtered.map((tour) => (
            <div
              key={tour.itinerary_id}
              className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 font-extrabold text-[11px] border border-emerald-200 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-emerald-600" />
                    <span>{tour.duration}</span>
                  </span>
                  <span className="font-mono text-slate-400 text-[10px]">{tour.itinerary_id}</span>
                </div>

                <h3 className="font-extrabold text-sm text-slate-900 line-clamp-2 leading-snug">
                  {tour.title}
                </h3>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
                  <div className="flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{tour.total_distance_km || 30} km</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Car className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="truncate">{tour.recommended_vehicle || 'Xe máy'}</span>
                  </div>
                  <div className="flex items-center gap-1 col-span-2">
                    <DollarSign className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="truncate">{tour.budget_estimate || 'Bình dân'}</span>
                  </div>
                </div>

                {tour.stops && tour.stops.length > 0 && (
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 text-[11px]">
                    <div className="font-bold text-slate-700 text-[10px] uppercase">Các Chặng Dừng:</div>
                    {tour.stops.slice(0, 3).map((stop, sidx) => (
                      <div key={sidx} className="flex items-center gap-1.5 text-slate-600">
                        <span className="font-mono font-bold text-emerald-700">{stop.time}</span>
                        <span className="truncate">{stop.name}</span>
                      </div>
                    ))}
                    {tour.stops.length > 3 && (
                      <div className="text-[10px] text-slate-400 italic">
                        +{tour.stops.length - 3} chặng tiếp theo...
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-100">
                <a
                  href={`/itinerary`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-xs font-bold text-[#1B4D3E] hover:underline"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Xem Bản Đồ</span>
                </a>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setEditingTour(tour)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
                    title="Chỉnh sửa tour"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(tour.itinerary_id, tour.title)}
                    className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-all cursor-pointer"
                    title="Xóa tour"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Modal */}
      {editingTour && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-extrabold text-base text-slate-900">
                Chỉnh Sửa Lịch Trình: {editingTour.title}
              </h3>
              <button
                onClick={() => setEditingTour(null)}
                className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tên Lịch Trình:</label>
                <input
                  type="text"
                  value={editingTour.title}
                  onChange={(e) => setEditingTour({ ...editingTour, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Thời Lượng:</label>
                  <input
                    type="text"
                    value={editingTour.duration}
                    onChange={(e) => setEditingTour({ ...editingTour, duration: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tổng Quãng Đường (km):</label>
                  <input
                    type="number"
                    value={editingTour.total_distance_km}
                    onChange={(e) => setEditingTour({ ...editingTour, total_distance_km: parseInt(e.target.value) || 0 })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phương Tiện:</label>
                  <input
                    type="text"
                    value={editingTour.recommended_vehicle || ''}
                    onChange={(e) => setEditingTour({ ...editingTour, recommended_vehicle: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Ngân Sách Dự Kiến:</label>
                  <input
                    type="text"
                    value={editingTour.budget_estimate || ''}
                    onChange={(e) => setEditingTour({ ...editingTour, budget_estimate: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingTour(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#1B4D3E] hover:bg-[#143B2F] text-white font-bold shadow-md cursor-pointer"
                >
                  Lưu Thay Đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
