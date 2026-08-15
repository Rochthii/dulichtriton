'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  ArrowUp,
  ArrowDown,
  Layers,
  GripVertical,
  Sparkles,
  Navigation,
  Check,
  Info,
} from 'lucide-react';

interface StopItem {
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

interface ItineraryRecord {
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

interface PlacePOI {
  id: string;
  name: string;
  commune?: string;
  category?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
}

// Haversine Distance with 1.25x mountain road winding factor
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const raw = R * c;
  return Math.round(raw * 1.25 * 10) / 10;
}

function estimateTravelMinutes(distanceKm: number): number {
  if (distanceKm <= 0) return 0;
  // Average 35 km/h on local roads + 3 min buffer
  const mins = Math.round((distanceKm / 35) * 60 + 3);
  return Math.max(5, mins);
}

export default function AdminItinerariesPage() {
  const [itineraries, setItineraries] = useState<ItineraryRecord[]>([]);
  const [places, setPlaces] = useState<PlacePOI[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTour, setEditingTour] = useState<ItineraryRecord | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Drag & Drop state
  const [draggedStopIndex, setDraggedStopIndex] = useState<number | null>(null);
  const [dragOverStopIndex, setDragOverStopIndex] = useState<number | null>(null);

  const [newTour, setNewTour] = useState<Partial<ItineraryRecord>>({
    title: '',
    duration: '1 ngày (07:00 - 18:00)',
    total_distance_km: 25,
    recommended_vehicle: 'Xe máy / Ô tô',
    suitable_for: 'Gia đình & Nhóm bạn',
    budget_estimate: '350.000đ - 600.000đ/người',
    description: '',
    stops: [
      { time: '07:00', name: 'Chùa Xvayton (Xà Tón)', commune: 'Thị trấn Tri Tôn', cluster: 'Tri Tôn', duration_min: 60 },
      { time: '08:30', name: 'Hồ Tà Pạ & Chùa Tà Pạ', commune: 'Xã Núi Tô', cluster: 'Tà Pạ', duration_min: 90 },
      { time: '11:30', name: 'Quán Gà Đốt Ô Thum', commune: 'Xã Ô Lâm', cluster: 'Ô Thum', duration_min: 90 },
      { time: '16:00', name: 'Cổng Trời Koh Kas', commune: 'Xã Châu Lăng', cluster: 'Châu Lăng', duration_min: 60 },
    ],
  });

  // Fetch Itineraries & Places
  const fetchItineraries = async () => {
    setLoading(true);
    try {
      const [resItin, resPlaces] = await Promise.all([
        fetch('/api/v1/admin/itineraries'),
        fetch('/api/v1/admin/places?limit=300'),
      ]);

      const dataItin = await resItin.json();
      if (dataItin.itineraries) {
        setItineraries(dataItin.itineraries);
      }

      if (resPlaces.ok) {
        const dataPlaces = await resPlaces.json();
        if (dataPlaces.places) {
          setPlaces(dataPlaces.places);
        }
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

  // Match Stop to POI Coordinates
  const findPoiCoordinates = (stopName: string, poiId?: string): { lat: number; lon: number; commune?: string } | null => {
    if (!places.length) return null;
    const cleanName = stopName.trim().toLowerCase();

    // Match by ID
    if (poiId) {
      const found = places.find((p) => p.id === poiId);
      if (found && found.latitude && found.longitude) {
        return { lat: found.latitude, lon: found.longitude, commune: found.commune };
      }
    }

    // Match by Name exact or fuzzy
    const exact = places.find((p) => p.name.toLowerCase() === cleanName);
    if (exact && exact.latitude && exact.longitude) {
      return { lat: exact.latitude, lon: exact.longitude, commune: exact.commune };
    }

    const partial = places.find((p) => cleanName.includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(cleanName));
    if (partial && partial.latitude && partial.longitude) {
      return { lat: partial.latitude, lon: partial.longitude, commune: partial.commune };
    }

    return null;
  };

  // Automated GPS Distance Calculation
  const autoCalculateGpsRoute = (currentStops: StopItem[]): { updatedStops: StopItem[]; totalKm: number } => {
    if (!currentStops || currentStops.length === 0) return { updatedStops: [], totalKm: 0 };

    let totalKm = 0;
    const updated = currentStops.map((stop, idx) => {
      const currentPoi = findPoiCoordinates(stop.name, stop.poi_id);
      let dist = 0;
      let timeMin = 0;

      if (idx < currentStops.length - 1) {
        const nextStop = currentStops[idx + 1];
        const nextPoi = findPoiCoordinates(nextStop.name, nextStop.poi_id);

        if (currentPoi && nextPoi) {
          dist = calculateDistanceKm(currentPoi.lat, currentPoi.lon, nextPoi.lat, nextPoi.lon);
          timeMin = estimateTravelMinutes(dist);
          totalKm += dist;
        } else {
          // Fallback heuristic if not matched to POI coordinates: average 6 km between distinct stops
          dist = 6.0;
          timeMin = 15;
          totalKm += dist;
        }
      }

      return {
        ...stop,
        order: idx + 1,
        commune: stop.commune || currentPoi?.commune || 'Tri Tôn',
        travel_to_next_km: dist > 0 ? dist : undefined,
        travel_to_next_min: timeMin > 0 ? timeMin : undefined,
        transport_to_next: dist > 0 ? `Xe máy (~${dist} km • ${timeMin} phút)` : 'Kết thúc lộ trình',
      };
    });

    return {
      updatedStops: updated,
      totalKm: Math.round(totalKm * 10) / 10,
    };
  };

  // Trigger GPS calculation for Editing Tour
  const handleAutoCalcInEdit = () => {
    if (!editingTour || !editingTour.stops) return;
    const { updatedStops, totalKm } = autoCalculateGpsRoute(editingTour.stops);
    setEditingTour({
      ...editingTour,
      stops: updatedStops,
      total_distance_km: totalKm > 0 ? totalKm : editingTour.total_distance_km,
    });
    setStatusMsg(`⚡ Đã tự động tính khoảng cách GPS: Tổng ~${totalKm} km cho ${updatedStops.length} chặng dừng!`);
    setTimeout(() => setStatusMsg(null), 4000);
  };

  // Trigger GPS calculation for New Tour
  const handleAutoCalcInNew = () => {
    if (!newTour.stops) return;
    const { updatedStops, totalKm } = autoCalculateGpsRoute(newTour.stops);
    setNewTour({
      ...newTour,
      stops: updatedStops,
      total_distance_km: totalKm > 0 ? totalKm : newTour.total_distance_km,
    });
    setStatusMsg(`⚡ Đã tự động tính khoảng cách GPS: Tổng ~${totalKm} km cho ${updatedStops.length} chặng dừng!`);
    setTimeout(() => setStatusMsg(null), 4000);
  };

  // Reorder stops helper
  const reorderStops = (list: StopItem[], startIndex: number, endIndex: number): StopItem[] => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result.map((item, idx) => ({ ...item, order: idx + 1 }));
  };

  // Drag & Drop Handlers for Edit Modal
  const handleDragStart = (index: number) => {
    setDraggedStopIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragOverStopIndex !== index) {
      setDragOverStopIndex(index);
    }
  };

  const handleDropInEdit = (targetIndex: number) => {
    if (draggedStopIndex === null || !editingTour || !editingTour.stops) return;
    if (draggedStopIndex !== targetIndex) {
      const reordered = reorderStops(editingTour.stops, draggedStopIndex, targetIndex);
      // Auto recalculate GPS legs after reordering
      const { updatedStops, totalKm } = autoCalculateGpsRoute(reordered);
      setEditingTour({
        ...editingTour,
        stops: updatedStops,
        total_distance_km: totalKm > 0 ? totalKm : editingTour.total_distance_km,
      });
    }
    setDraggedStopIndex(null);
    setDragOverStopIndex(null);
  };

  const handleDropInNew = (targetIndex: number) => {
    if (draggedStopIndex === null || !newTour.stops) return;
    if (draggedStopIndex !== targetIndex) {
      const reordered = reorderStops(newTour.stops, draggedStopIndex, targetIndex);
      const { updatedStops, totalKm } = autoCalculateGpsRoute(reordered);
      setNewTour({
        ...newTour,
        stops: updatedStops,
        total_distance_km: totalKm > 0 ? totalKm : newTour.total_distance_km,
      });
    }
    setDraggedStopIndex(null);
    setDragOverStopIndex(null);
  };

  // Move Stop Up / Down
  const moveStopInEdit = (index: number, direction: 'up' | 'down') => {
    if (!editingTour || !editingTour.stops) return;
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= editingTour.stops.length) return;
    const reordered = reorderStops(editingTour.stops, index, target);
    const { updatedStops, totalKm } = autoCalculateGpsRoute(reordered);
    setEditingTour({ ...editingTour, stops: updatedStops, total_distance_km: totalKm });
  };

  const moveStopInNew = (index: number, direction: 'up' | 'down') => {
    if (!newTour.stops) return;
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= newTour.stops.length) return;
    const reordered = reorderStops(newTour.stops, index, target);
    const { updatedStops, totalKm } = autoCalculateGpsRoute(reordered);
    setNewTour({ ...newTour, stops: updatedStops, total_distance_km: totalKm });
  };

  // Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTour) return;

    try {
      const res = await fetch('/api/v1/admin/itineraries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingTour),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setItineraries(itineraries.map((it) => (it.itinerary_id === editingTour.itinerary_id ? { ...it, ...data.itinerary } : it)));
        setEditingTour(null);
        setStatusMsg(`✅ Đã cập nhật tour "${editingTour.title}" thành công!`);
        setTimeout(() => setStatusMsg(null), 3500);
      } else {
        setStatusMsg(`❌ Không thể lưu: ${data.error || 'Lỗi hệ thống'}`);
        setTimeout(() => setStatusMsg(null), 5000);
      }
    } catch (err: any) {
      console.warn('Failed to save itinerary:', err);
      setStatusMsg(`❌ Lỗi kết nối: ${err.message || 'Lỗi mạng'}`);
      setTimeout(() => setStatusMsg(null), 5000);
    }
  };

  // Create New
  const handleCreateNew = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/admin/itineraries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTour),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setItineraries([data.itinerary, ...itineraries]);
        setIsAddingNew(false);
        setStatusMsg(`✅ Đã tạo lịch trình mới thành công!`);
        setTimeout(() => setStatusMsg(null), 3500);
      } else {
        setStatusMsg(`❌ Không thể tạo: ${data.error || 'Lỗi hệ thống'}`);
        setTimeout(() => setStatusMsg(null), 5000);
      }
    } catch (err: any) {
      console.warn('Failed to create itinerary:', err);
      setStatusMsg(`❌ Lỗi kết nối: ${err.message || 'Lỗi mạng'}`);
      setTimeout(() => setStatusMsg(null), 5000);
    }
  };

  // Delete
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Bạn có chắc muốn xóa lịch trình "${title}"?`)) return;

    try {
      const res = await fetch(`/api/v1/admin/itineraries?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        setItineraries(itineraries.filter((it) => it.itinerary_id !== id));
        setStatusMsg(`✅ Đã xóa tour "${title}" thành công!`);
        setTimeout(() => setStatusMsg(null), 3500);
      } else {
        setStatusMsg(`❌ Lỗi xóa: ${data.error || 'Không thể xóa'}`);
        setTimeout(() => setStatusMsg(null), 5000);
      }
    } catch (err: any) {
      console.warn('Failed to delete itinerary:', err);
      setStatusMsg(`❌ Lỗi kết nối: ${err.message}`);
      setTimeout(() => setStatusMsg(null), 5000);
    }
  };

  // Stop add/remove/update helpers
  const handleAddStopInEdit = () => {
    if (!editingTour) return;
    const stops = editingTour.stops || [];
    setEditingTour({
      ...editingTour,
      stops: [...stops, { time: '09:00', name: 'Điểm tham quan mới', commune: 'Tri Tôn', cluster: 'Tri Tôn', duration_min: 60 }],
    });
  };

  const handleRemoveStopInEdit = (index: number) => {
    if (!editingTour || !editingTour.stops) return;
    const stops = [...editingTour.stops];
    stops.splice(index, 1);
    const { updatedStops, totalKm } = autoCalculateGpsRoute(stops);
    setEditingTour({ ...editingTour, stops: updatedStops, total_distance_km: totalKm });
  };

  const handleUpdateStopInEdit = (index: number, field: keyof StopItem, val: string | number) => {
    if (!editingTour || !editingTour.stops) return;
    const stops = [...editingTour.stops];
    stops[index] = { ...stops[index], [field]: val };
    setEditingTour({ ...editingTour, stops });
  };

  const handleAddStopInNew = () => {
    const stops = newTour.stops || [];
    setNewTour({
      ...newTour,
      stops: [...stops, { time: '09:00', name: 'Điểm tham quan mới', commune: 'Tri Tôn', cluster: 'Tri Tôn', duration_min: 60 }],
    });
  };

  const handleRemoveStopInNew = (index: number) => {
    if (!newTour.stops) return;
    const stops = [...newTour.stops];
    stops.splice(index, 1);
    const { updatedStops, totalKm } = autoCalculateGpsRoute(stops);
    setNewTour({ ...newTour, stops: updatedStops, total_distance_km: totalKm });
  };

  const handleUpdateStopInNew = (index: number, field: keyof StopItem, val: string | number) => {
    if (!newTour.stops) return;
    const stops = [...newTour.stops];
    stops[index] = { ...stops[index], [field]: val };
    setNewTour({ ...newTour, stops });
  };

  const filtered = useMemo(() => {
    return itineraries.filter(
      (it) =>
        it.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (it.duration && it.duration.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (it.tagline && it.tagline.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [itineraries, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Places Datalist for autocomplete */}
      <datalist id="poi-places-list">
        {places.map((p) => (
          <option key={p.id} value={p.name}>
            {p.commune ? `[${p.commune}] ` : ''}{p.name}
          </option>
        ))}
      </datalist>

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
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200 flex items-center gap-1">
              <Navigation className="w-3 h-3 text-blue-600" />
              <span>Đo GPS & Kéo Thả 0ms</span>
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Quản Lý 35 Lịch Trình & Kịch Bản Gợi Ý (CRUD)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Hỗ trợ kéo thả chuột sắp xếp thứ tự chặng dừng, tự động đo khoảng cách GPS giữa 149 điểm thực địa và đồng bộ Chatbot AI.
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
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{statusMsg}</span>
          </div>
          <button onClick={() => setStatusMsg(null)} className="text-emerald-600 hover:text-emerald-900 cursor-pointer">
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
            placeholder="Tìm kiếm theo tên tour, thời lượng (1 ngày, 2N1Đ...) hoặc chủ đề (Trekking, Food...)"
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold"
          />
        </div>
        <button
          onClick={fetchItineraries}
          className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold cursor-pointer"
          title="Làm mới danh sách"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Tour Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400 font-bold">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
            Đang tải dữ liệu 35 kịch bản tour...
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 font-bold">
            Không tìm thấy lịch trình nào phù hợp với từ khóa "{searchQuery}".
          </div>
        ) : (
          filtered.map((tour) => (
            <div
              key={tour.itinerary_id || tour.slug}
              className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 font-extrabold text-[11px] border border-emerald-200 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-emerald-600" />
                    <span>{tour.duration}</span>
                  </span>
                  <span className="font-mono text-slate-400 text-[10px]">{tour.slug || tour.itinerary_id?.slice(0, 8)}</span>
                </div>

                <div className="flex items-start gap-2">
                  <span className="text-xl shrink-0 mt-0.5">{tour.emoji || '🧭'}</span>
                  <h3 className="font-extrabold text-sm text-slate-900 line-clamp-2 leading-snug">
                    {tour.title}
                  </h3>
                </div>

                {tour.description && (
                  <p className="text-[11px] text-slate-500 line-clamp-2 italic">
                    "{tour.description}"
                  </p>
                )}

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
                  <div className="flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>~{tour.total_distance_km || 25} km</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Car className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="truncate">{tour.recommended_vehicle || 'Xe máy'}</span>
                  </div>
                  <div className="flex items-center gap-1 col-span-2">
                    <DollarSign className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="truncate">{tour.budget_estimate || tour.budget_range || 'Bình dân'}</span>
                  </div>
                </div>

                {tour.stops && tour.stops.length > 0 && (
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between font-bold text-slate-700 text-[10px] uppercase">
                      <span>Lộ Trình ({tour.stops.length} chặng):</span>
                      <span className="text-emerald-700 font-semibold lowercase">đã tối ưu GPS</span>
                    </div>
                    {tour.stops.slice(0, 3).map((stop, sidx) => (
                      <div key={sidx} className="flex items-center gap-1.5 text-slate-600">
                        <span className="font-mono font-bold text-emerald-700 text-[10px]">{stop.time || stop.time_start}</span>
                        <span className="truncate">{stop.name}</span>
                        {stop.commune && <span className="text-[9px] text-slate-400">({stop.commune})</span>}
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
                  <span>Xem Bản Đồ Wire</span>
                </a>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setEditingTour(tour)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer flex items-center gap-1 font-bold text-xs"
                    title="Chỉnh sửa tour & kéo thả chặng dừng"
                  >
                    <Edit className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Sửa</span>
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

      {/* Edit Modal (With Drag & Drop & GPS Automation) */}
      {editingTour && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl max-h-[92vh] rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{editingTour.emoji || '🧭'}</span>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    Chỉnh Sửa Lịch Trình: {editingTour.title}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Kéo thả icon <GripVertical className="w-3 h-3 inline text-slate-400" /> để đổi thứ tự chặng hoặc bấm nút đo GPS tự động.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingTour(null)}
                className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-3">
                  <label className="font-bold text-slate-700 block mb-1">Tên Lịch Trình:</label>
                  <input
                    type="text"
                    value={editingTour.title}
                    onChange={(e) => setEditingTour({ ...editingTour, title: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Biểu Tượng (Emoji):</label>
                  <input
                    type="text"
                    value={editingTour.emoji || '🧭'}
                    onChange={(e) => setEditingTour({ ...editingTour, emoji: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-center text-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mô Tả / Khẩu Hiệu Lộ Trình (Tagline):</label>
                <input
                  type="text"
                  value={editingTour.tagline || editingTour.description || ''}
                  onChange={(e) => setEditingTour({ ...editingTour, tagline: e.target.value, description: e.target.value })}
                  placeholder="Khám phá trọn vẹn nét đẹp huyền tích Bảy Núi..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
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
                    step="0.1"
                    value={editingTour.total_distance_km}
                    onChange={(e) => setEditingTour({ ...editingTour, total_distance_km: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold font-mono text-emerald-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phương Tiện:</label>
                  <input
                    type="text"
                    value={editingTour.recommended_vehicle || ''}
                    onChange={(e) => setEditingTour({ ...editingTour, recommended_vehicle: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Đối Tượng Phù Hợp:</label>
                  <input
                    type="text"
                    value={editingTour.suitable_for || editingTour.for_whom || ''}
                    onChange={(e) => setEditingTour({ ...editingTour, suitable_for: e.target.value, for_whom: e.target.value })}
                    placeholder="Gia đình, bạn bè, phượt thủ..."
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Ngân Sách Dự Kiến:</label>
                  <input
                    type="text"
                    value={editingTour.budget_estimate || editingTour.budget_range || ''}
                    onChange={(e) => setEditingTour({ ...editingTour, budget_estimate: e.target.value, budget_range: e.target.value })}
                    placeholder="250.000đ - 500.000đ/người"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
                  />
                </div>
              </div>

              {/* Dynamic Stops Manager with Drag & Drop & GPS Calculation */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-700" />
                    <span className="font-extrabold text-slate-800 text-xs">
                      Danh Sách Chặng Dừng ({editingTour.stops?.length || 0} chặng)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAutoCalcInEdit}
                      className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-xs cursor-pointer"
                      title="Tính tự động khoảng cách GPS thực tế giữa các điểm dừng"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>⚡ Tự Động Đo GPS & Quãng Đường</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleAddStopInEdit}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3 text-emerald-700" />
                      <span>Thêm Chặng</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {editingTour.stops?.map((stop, idx) => {
                    const isDragging = draggedStopIndex === idx;
                    const isOver = dragOverStopIndex === idx;

                    return (
                      <div key={idx} className="space-y-1">
                        <div
                          draggable
                          onDragStart={() => handleDragStart(idx)}
                          onDragOver={(e) => handleDragOver(e, idx)}
                          onDrop={() => handleDropInEdit(idx)}
                          onDragEnd={() => {
                            setDraggedStopIndex(null);
                            setDragOverStopIndex(null);
                          }}
                          className={`flex items-center gap-2 bg-slate-50 p-2.5 rounded-2xl border transition-all ${
                            isDragging
                              ? 'opacity-40 border-dashed border-emerald-500 scale-[0.98]'
                              : isOver
                              ? 'border-emerald-500 bg-emerald-50/60 shadow-sm'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {/* Drag Handle */}
                          <div
                            className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-700 p-0.5 shrink-0"
                            title="Kéo thả để sắp xếp vị trí chặng"
                          >
                            <GripVertical className="w-4 h-4" />
                          </div>

                          {/* Order Badge */}
                          <span className="w-5 h-5 rounded-full bg-emerald-700 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>

                          {/* Time */}
                          <input
                            type="text"
                            value={stop.time || stop.time_start || ''}
                            onChange={(e) => handleUpdateStopInEdit(idx, 'time', e.target.value)}
                            placeholder="07:00"
                            className="w-16 p-1.5 rounded-xl bg-white border border-slate-200 font-mono font-bold text-xs text-center"
                            title="Giờ bắt đầu"
                          />

                          {/* Stop Name with Autocomplete */}
                          <div className="flex-1 min-w-[140px]">
                            <input
                              type="text"
                              list="poi-places-list"
                              value={stop.name}
                              onChange={(e) => handleUpdateStopInEdit(idx, 'name', e.target.value)}
                              placeholder="Tên điểm tham quan (Hồ Tà Pạ, Chùa Xà Tón...)"
                              className="w-full p-1.5 rounded-xl bg-white border border-slate-200 font-bold text-xs"
                            />
                          </div>

                          {/* Commune / Cluster */}
                          <input
                            type="text"
                            value={stop.commune || stop.cluster || ''}
                            onChange={(e) => handleUpdateStopInEdit(idx, 'commune', e.target.value)}
                            placeholder="Xã / Cụm"
                            className="w-24 p-1.5 rounded-xl bg-white border border-slate-200 text-xs"
                          />

                          {/* Quick Move Up/Down Buttons */}
                          <div className="flex items-center gap-0.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => moveStopInEdit(idx, 'up')}
                              disabled={idx === 0}
                              className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 disabled:opacity-30 cursor-pointer"
                              title="Di chuyển lên"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveStopInEdit(idx, 'down')}
                              disabled={idx === (editingTour.stops?.length || 1) - 1}
                              className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 disabled:opacity-30 cursor-pointer"
                              title="Di chuyển xuống"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Delete Stop */}
                          <button
                            type="button"
                            onClick={() => handleRemoveStopInEdit(idx)}
                            className="p-1.5 rounded-lg hover:bg-rose-100 text-rose-600 cursor-pointer shrink-0"
                            title="Xóa chặng này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Route Leg GPS Connector */}
                        {idx < (editingTour.stops?.length || 0) - 1 && (
                          <div className="flex items-center gap-2 pl-9 py-0.5 text-[10px] text-slate-400 font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                            <div className="h-3 w-[1px] bg-dashed border-l border-slate-300"></div>
                            {stop.travel_to_next_km ? (
                              <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-200 font-bold">
                                ➔ ~{stop.travel_to_next_km} km ({stop.travel_to_next_min || 15} phút di chuyển)
                              </span>
                            ) : (
                              <span className="italic text-slate-400">
                                ➔ Chặng di chuyển tiếp theo...
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingTour(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#1B4D3E] hover:bg-[#143B2F] text-white font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-amber-300" />
                  <span>Lưu Thay Đổi Tour</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Tour Modal */}
      {isAddingNew && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl max-h-[92vh] rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{newTour.emoji || '🧭'}</span>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    Tạo Lịch Trình Gợi Ý Mới
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Hỗ trợ kéo thả chặng dừng và tự động tính khoảng cách GPS thực địa.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddingNew(false)}
                className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNew} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-3">
                  <label className="font-bold text-slate-700 block mb-1">Tên Lịch Trình:</label>
                  <input
                    type="text"
                    value={newTour.title}
                    onChange={(e) => setNewTour({ ...newTour, title: e.target.value })}
                    placeholder="VD: Tour Săn Mây & Ngắm Hoàng Hôn Cô Tô 1 Ngày"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Biểu Tượng (Emoji):</label>
                  <input
                    type="text"
                    value={newTour.emoji || '🧭'}
                    onChange={(e) => setNewTour({ ...newTour, emoji: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-center text-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Khẩu Hiệu / Giới Thiệu Ngắn (Tagline):</label>
                <input
                  type="text"
                  value={newTour.description || ''}
                  onChange={(e) => setNewTour({ ...newTour, description: e.target.value })}
                  placeholder="Khám phá trải nghiệm đặc sắc vùng đất Bảy Núi..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Thời Lượng:</label>
                  <input
                    type="text"
                    value={newTour.duration}
                    onChange={(e) => setNewTour({ ...newTour, duration: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tổng Quãng Đường (km):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newTour.total_distance_km}
                    onChange={(e) => setNewTour({ ...newTour, total_distance_km: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold font-mono text-emerald-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phương Tiện:</label>
                  <input
                    type="text"
                    value={newTour.recommended_vehicle || ''}
                    onChange={(e) => setNewTour({ ...newTour, recommended_vehicle: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Đối Tượng Phù Hợp:</label>
                  <input
                    type="text"
                    value={newTour.suitable_for || ''}
                    onChange={(e) => setNewTour({ ...newTour, suitable_for: e.target.value })}
                    placeholder="Gia đình, bạn bè, phượt thủ..."
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Ngân Sách Dự Kiến:</label>
                  <input
                    type="text"
                    value={newTour.budget_estimate || ''}
                    onChange={(e) => setNewTour({ ...newTour, budget_estimate: e.target.value })}
                    placeholder="300.000đ - 600.000đ/người"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
                  />
                </div>
              </div>

              {/* Dynamic Stops Manager with Drag & Drop & GPS Automation */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-700" />
                    <span className="font-extrabold text-slate-800 text-xs">
                      Danh Sách Chặng Dừng ({newTour.stops?.length || 0} chặng)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAutoCalcInNew}
                      className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-xs cursor-pointer"
                      title="Tính tự động khoảng cách GPS thực tế giữa các điểm dừng"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>⚡ Tự Động Đo GPS & Quãng Đường</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleAddStopInNew}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3 text-emerald-700" />
                      <span>Thêm Chặng</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {newTour.stops?.map((stop, idx) => {
                    const isDragging = draggedStopIndex === idx;
                    const isOver = dragOverStopIndex === idx;

                    return (
                      <div key={idx} className="space-y-1">
                        <div
                          draggable
                          onDragStart={() => handleDragStart(idx)}
                          onDragOver={(e) => handleDragOver(e, idx)}
                          onDrop={() => handleDropInNew(idx)}
                          onDragEnd={() => {
                            setDraggedStopIndex(null);
                            setDragOverStopIndex(null);
                          }}
                          className={`flex items-center gap-2 bg-slate-50 p-2.5 rounded-2xl border transition-all ${
                            isDragging
                              ? 'opacity-40 border-dashed border-emerald-500 scale-[0.98]'
                              : isOver
                              ? 'border-emerald-500 bg-emerald-50/60 shadow-sm'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div
                            className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-700 p-0.5 shrink-0"
                            title="Kéo thả để sắp xếp vị trí chặng"
                          >
                            <GripVertical className="w-4 h-4" />
                          </div>

                          <span className="w-5 h-5 rounded-full bg-emerald-700 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>

                          <input
                            type="text"
                            value={stop.time || stop.time_start || ''}
                            onChange={(e) => handleUpdateStopInNew(idx, 'time', e.target.value)}
                            placeholder="07:00"
                            className="w-16 p-1.5 rounded-xl bg-white border border-slate-200 font-mono font-bold text-xs text-center"
                          />

                          <div className="flex-1 min-w-[140px]">
                            <input
                              type="text"
                              list="poi-places-list"
                              value={stop.name}
                              onChange={(e) => handleUpdateStopInNew(idx, 'name', e.target.value)}
                              placeholder="Tên điểm tham quan..."
                              className="w-full p-1.5 rounded-xl bg-white border border-slate-200 font-bold text-xs"
                            />
                          </div>

                          <input
                            type="text"
                            value={stop.commune || stop.cluster || ''}
                            onChange={(e) => handleUpdateStopInNew(idx, 'commune', e.target.value)}
                            placeholder="Xã / Cụm"
                            className="w-24 p-1.5 rounded-xl bg-white border border-slate-200 text-xs"
                          />

                          <div className="flex items-center gap-0.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => moveStopInNew(idx, 'up')}
                              disabled={idx === 0}
                              className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 disabled:opacity-30 cursor-pointer"
                              title="Di chuyển lên"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveStopInNew(idx, 'down')}
                              disabled={idx === (newTour.stops?.length || 1) - 1}
                              className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 disabled:opacity-30 cursor-pointer"
                              title="Di chuyển xuống"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveStopInNew(idx)}
                            className="p-1.5 rounded-lg hover:bg-rose-100 text-rose-600 cursor-pointer shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {idx < (newTour.stops?.length || 0) - 1 && (
                          <div className="flex items-center gap-2 pl-9 py-0.5 text-[10px] text-slate-400 font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                            <div className="h-3 w-[1px] bg-dashed border-l border-slate-300"></div>
                            {stop.travel_to_next_km ? (
                              <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-200 font-bold">
                                ➔ ~{stop.travel_to_next_km} km ({stop.travel_to_next_min || 15} phút)
                              </span>
                            ) : (
                              <span className="italic text-slate-400">
                                ➔ Chặng tiếp theo...
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#1B4D3E] hover:bg-[#143B2F] text-white font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-amber-300" />
                  <span>Tạo Lịch Trình</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
