'use client';

import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Search,
  Star,
  Flame,
  Edit,
  RefreshCw,
  Clock,
  Sparkles,
  ExternalLink,
  X,
  CheckCircle2,
} from 'lucide-react';

interface PlaceRecord {
  id: string;
  slug: string;
  name: string;
  commune: string;
  category: string;
  rating: number;
  image_url: string;
  description: string;
  golden_time_windows: string;
  price_range: string;
  is_hot: boolean;
}

export default function AdminPlacesPage() {
  const [places, setPlaces] = useState<PlaceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [communeFilter, setCommuneFilter] = useState('ALL');
  const [editingPlace, setEditingPlace] = useState<PlaceRecord | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const fetchPlaces = async () => {
    setLoading(true);
    try {
      let url = '/api/v1/admin/places';
      if (communeFilter !== 'ALL') {
        url += `?commune=${encodeURIComponent(communeFilter)}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (data.places) setPlaces(data.places);
    } catch (e) {
      console.warn('Failed to fetch admin places:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaces();
  }, [communeFilter]);

  const handleToggleHot = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/v1/admin/places', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_hot: !currentStatus }),
      });
      if (res.ok) {
        setPlaces(prev => prev.map(p => p.id === id ? { ...p, is_hot: !currentStatus } : p));
      }
    } catch (e) {
      console.warn('Error toggling hot status:', e);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlace) return;

    try {
      const res = await fetch('/api/v1/admin/places', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingPlace.id,
          name: editingPlace.name,
          commune: editingPlace.commune,
          category: editingPlace.category,
          rating: editingPlace.rating,
          description: editingPlace.description,
          golden_time_windows: editingPlace.golden_time_windows,
        }),
      });

      if (res.ok) {
        setStatusMsg('Đã cập nhật thông tin POI thành công vào CSDL Supabase!');
        setPlaces(prev => prev.map(p => p.id === editingPlace.id ? editingPlace : p));
        setTimeout(() => {
          setEditingPlace(null);
          setStatusMsg(null);
        }, 1200);
      }
    } catch (e) {
      console.warn('Error saving POI edit:', e);
    }
  };

  const filteredPlaces = places.filter(p => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.commune && p.commune.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q))
    );
  });

  const communes = ['ALL', 'Núi Tô', 'Ô Lâm', 'Tri Tôn', 'Lương Phi', 'Ba Chúc', 'An Tức', 'Châu Lăng'];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold mb-2">
            <MapPin className="w-4 h-4" />
            <span>Master Data 95 POIs</span>
          </div>
          <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Quản Lý Master Data 95 Địa Điểm Tri Tôn
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Xem và cập nhật 95 POIs đã xác minh chuẩn 100% (Xã/Thị trấn), bật/tắt Địa điểm Hot & Cảnh đẹp Giờ vàng.
          </p>
        </div>

        <button
          onClick={fetchPlaces}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all flex items-center gap-2 cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Làm Mới POIs
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        {/* Commune Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs font-semibold scrollbar-none">
          {communes.map(c => (
            <button
              key={c}
              onClick={() => setCommuneFilter(c)}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                communeFilter === c
                  ? 'bg-[#1B4D3E] text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {c === 'ALL' ? 'Tất cả 95 POIs' : `Xã/Thị trấn ${c}`}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên địa danh, Xã, mô tả..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
          />
        </div>
      </div>

      {/* POI Table Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-500 text-xs flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin" /> Đang tải 95 POI Master Data từ Supabase...
        </div>
      ) : filteredPlaces.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-2">
          <MapPin className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="font-bold text-slate-700 text-sm">Không tìm thấy địa điểm phù hợp</h4>
          <p className="text-xs text-slate-500">Thử thay đổi từ khóa hoặc bộ lọc Xã/Thị trấn.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Hiển thị <strong className="text-slate-900">{filteredPlaces.length}</strong> / 95 địa điểm đã xác minh</span>
            <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md font-bold">
              PostgreSQL Vector 768 Ready
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Địa danh / POI</th>
                  <th className="py-3.5 px-4">Xã / Thị Trấn</th>
                  <th className="py-3.5 px-4">Danh mục</th>
                  <th className="py-3.5 px-4">Đánh giá</th>
                  <th className="py-3.5 px-4">Giờ vàng</th>
                  <th className="py-3.5 px-4">Trạng thái Hot</th>
                  <th className="py-3.5 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {filteredPlaces.map(place => (
                  <tr key={place.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-bold text-slate-900 text-xs sm:text-sm">{place.name}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{place.description}</div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-700 font-semibold">
                      {place.commune}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-[11px] font-bold">
                        {place.category || 'Địa điểm'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap font-bold text-amber-600">
                      <span className="inline-flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {place.rating || 4.8}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 text-[11px]">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3 text-emerald-600" />
                        {place.golden_time_windows || '05:30 - 08:30'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleHot(place.id, place.is_hot)}
                        className={`px-3 py-1 rounded-full text-[10px] font-extrabold transition-all cursor-pointer inline-flex items-center gap-1 ${
                          place.is_hot
                            ? 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        <Flame className={`w-3 h-3 ${place.is_hot ? 'text-rose-600 fill-rose-600' : 'text-slate-400'}`} />
                        {place.is_hot ? 'HOT POI' : 'Bình thường'}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setEditingPlace(place)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        Chỉnh sửa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit POI Modal */}
      {editingPlace && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setEditingPlace(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-heading font-extrabold text-slate-900 text-lg mb-1 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Chỉnh Sửa POI: {editingPlace.name}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Cập nhật thông tin Master Data trực tiếp vào CSDL Supabase PostgreSQL.
            </p>

            {statusMsg && (
              <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {statusMsg}
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên Địa Danh POI</label>
                <input
                  type="text"
                  required
                  value={editingPlace.name}
                  onChange={e => setEditingPlace({ ...editingPlace, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Xã / Thị Trấn</label>
                  <input
                    type="text"
                    required
                    value={editingPlace.commune}
                    onChange={e => setEditingPlace({ ...editingPlace, commune: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Danh Mục</label>
                  <input
                    type="text"
                    required
                    value={editingPlace.category}
                    onChange={e => setEditingPlace({ ...editingPlace, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Khung Giờ Vàng (Golden Hours)</label>
                <input
                  type="text"
                  value={editingPlace.golden_time_windows || ''}
                  onChange={e => setEditingPlace({ ...editingPlace, golden_time_windows: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  placeholder="05:30 - 08:30 & 16:00 - 18:00"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mô Tả Chi Tiết</label>
                <textarea
                  rows={3}
                  value={editingPlace.description || ''}
                  onChange={e => setEditingPlace({ ...editingPlace, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingPlace(null)}
                  className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-all cursor-pointer"
                >
                  Hủy Thao Tác
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-[#1B4D3E] text-white font-bold hover:bg-[#153e32] transition-all cursor-pointer shadow-md"
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
