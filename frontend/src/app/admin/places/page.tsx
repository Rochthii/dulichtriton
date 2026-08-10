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
  Plus,
  Trash2,
  Image as ImageIcon,
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
  video_url?: string;
  is_hot: boolean;
}

export default function AdminPlacesPage() {
  const [places, setPlaces] = useState<PlaceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [communeFilter, setCommuneFilter] = useState('ALL');
  
  // Modals state
  const [editingPlace, setEditingPlace] = useState<PlaceRecord | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [showAuditLogsModal, setShowAuditLogsModal] = useState(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loadingAuditLogs, setLoadingAuditLogs] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [newPlace, setNewPlace] = useState({
    name: '',
    commune: 'Thị trấn Tri Tôn',
    category: 'Danh thắng check-in',
    rating: 4.8,
    image_url: '',
    description: '',
    golden_time_windows: '06:00-08:00 • 16:00-17:30',
    video_url: '',
    is_hot: false,
  });

  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const fetchAuditLogs = async () => {
    setLoadingAuditLogs(true);
    try {
      const res = await fetch('/api/v1/admin/audit-logs?limit=30');
      const data = await res.json();
      if (data.logs) setAuditLogs(data.logs);
    } catch (e) {
      console.warn('Failed to fetch audit logs:', e);
    } finally {
      setLoadingAuditLogs(false);
    }
  };

  const handleOpenAuditLogs = () => {
    setShowAuditLogsModal(true);
    fetchAuditLogs();
  };

  const handleCloudinaryUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEditMode: boolean) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    try {
      const filePromises = Array.from(files).map((file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => resolve(event.target?.result as string);
          reader.readAsDataURL(file);
        });
      });

      const base64Files = await Promise.all(filePromises);

      const res = await fetch('/api/v1/admin/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: base64Files, folder: 'tri_ton_places' }),
      });

      const data = await res.json();
      if (data.urls && data.urls.length > 0) {
        const firstUrl = data.urls[0];
        if (isEditMode && editingPlace) {
          setEditingPlace({ ...editingPlace, image_url: firstUrl });
        } else {
          setNewPlace({ ...newPlace, image_url: firstUrl });
        }
        setStatusMsg(`Đã tải lên thành công ${data.urls.length} hình ảnh Cloudinary!`);
        setTimeout(() => setStatusMsg(null), 2000);
      }
    } catch (err) {
      console.warn('Cloudinary upload error:', err);
    } finally {
      setUploadingImages(false);
    }
  };

  const fetchPlaces = async () => {
    setLoading(true);
    try {
      let url = '/api/v1/admin/places';
      const params = new URLSearchParams();
      if (communeFilter !== 'ALL') params.append('commune', communeFilter);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const res = await fetch(`${url}?${params.toString()}`);
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
          image_url: editingPlace.image_url,
          description: editingPlace.description,
          golden_time_windows: editingPlace.golden_time_windows,
          video_url: editingPlace.video_url,
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

  const handleCreateNew = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/admin/places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPlace),
      });

      if (res.ok) {
        const data = await res.json();
        setStatusMsg('Đã tạo thành công địa điểm mới vào CSDL Supabase!');
        if (data.place) {
          setPlaces(prev => [data.place, ...prev]);
        }
        setTimeout(() => {
          setIsAddingNew(false);
          setStatusMsg(null);
          setNewPlace({
            name: '',
            commune: 'Thị trấn Tri Tôn',
            category: 'Danh thắng check-in',
            rating: 4.8,
            image_url: '',
            description: '',
            golden_time_windows: '06:00-08:00 • 16:00-17:30',
            video_url: '',
            is_hot: false,
          });
        }, 1200);
      }
    } catch (e) {
      console.warn('Error creating place:', e);
    }
  };

  const handleDeletePlace = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa địa điểm "${name}" khỏi CSDL Supabase không?`)) return;
    try {
      const res = await fetch(`/api/v1/admin/places?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setPlaces(prev => prev.filter(p => p.id !== id));
      }
    } catch (e) {
      console.warn('Error deleting place:', e);
    }
  };

  const filteredPlaces = places.filter(p => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.commune.toLowerCase().includes(q);
  });

  const communes = [
    'ALL',
    'Thị trấn Tri Tôn',
    'Thị trấn Ba Chúc',
    'Xã Châu Lăng',
    'Xã Núi Tô',
    'Xã Ô Lâm',
    'Xã An Tức',
    'Xã Cô Tô',
    'Xã Lương Phi',
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>CMS Admin Portal · Live Supabase DB</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Quản Lý 95 Địa Điểm Du Lịch Tri Tôn</h1>
          <p className="text-xs text-slate-300 mt-1">Cập nhật ảnh đại diện, thông tin chi tiết, khung giờ vàng & bật tắt HOT thực tế.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenAuditLogs}
            className="px-4 py-2 rounded-xl bg-amber-600/90 hover:bg-amber-600 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md text-white border border-amber-500/40"
          >
            <Clock className="w-4 h-4" />
            <span>Audit Log Viewer</span>
          </button>
          <button
            onClick={fetchPlaces}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Tải Lại CSDL</span>
          </button>
          <button
            onClick={() => setIsAddingNew(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md text-white"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Địa Điểm Mới</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm địa điểm, xã..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#1B4D3E]"
          />
        </div>

        {/* Commune Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none text-xs">
          {communes.map((com) => (
            <button
              key={com}
              onClick={() => setCommuneFilter(com)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
                communeFilter === com
                  ? 'bg-[#1B4D3E] text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {com === 'ALL' ? 'Tất cả Xã/Thị trấn' : com}
            </button>
          ))}
        </div>
      </div>

      {/* Places Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <RefreshCw className="w-8 h-8 text-[#1B4D3E] animate-spin mx-auto" />
            <p className="text-xs font-bold">Đang tải dữ liệu địa điểm từ Supabase CSDL...</p>
          </div>
        ) : filteredPlaces.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <MapPin className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-bold">Không tìm thấy địa điểm nào phù hợp.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="p-4">Hình ảnh & Tên địa điểm</th>
                  <th className="p-4">Đơn vị hành chính</th>
                  <th className="p-4">Thể loại</th>
                  <th className="p-4">Khung Giờ Vàng</th>
                  <th className="p-4 text-center">Nổi Bật (HOT)</th>
                  <th className="p-4 text-right">Thao tác CMS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPlaces.map((place) => (
                  <tr key={place.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={place.image_url || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop'}
                          alt={place.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-sm line-clamp-1">{place.name}</h4>
                          <span className="text-[10px] text-slate-400 font-mono">ID: {place.id.slice(0, 8)}...</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-slate-800">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{place.commune}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-medium text-[11px]">
                        {place.category}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600">
                      <div className="flex items-center gap-1 text-[11px]">
                        <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[140px]">
                          {Array.isArray(place.golden_time_windows)
                            ? place.golden_time_windows.join(' • ')
                            : (place.golden_time_windows || 'N/A')}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleToggleHot(place.id, place.is_hot)}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-bold text-[11px] transition-all cursor-pointer ${
                          place.is_hot
                            ? 'bg-rose-500 text-white shadow-xs hover:bg-rose-600'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        <Flame className={`w-3 h-3 ${place.is_hot ? 'fill-white' : ''}`} />
                        <span>{place.is_hot ? 'HOT #1' : 'Bình thường'}</span>
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingPlace(place)}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 transition-colors shadow-xs"
                        >
                          <Edit className="w-3 h-3" />
                          <span>Chỉnh Sửa</span>
                        </button>
                        <button
                          onClick={() => handleDeletePlace(place.id, place.name)}
                          className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                          title="Xóa khỏi CSDL"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit POI Modal */}
      {editingPlace && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden space-y-4 p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                <Edit className="w-5 h-5 text-emerald-600" />
                <span>Chỉnh Sửa Chi Tiết Địa Điểm (CMS)</span>
              </h3>
              <button onClick={() => setEditingPlace(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {statusMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{statusMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tên Địa Điểm:</label>
                  <input
                    type="text"
                    value={editingPlace.name}
                    onChange={(e) => setEditingPlace({ ...editingPlace, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Xã / Thị Trấn:</label>
                  <select
                    value={editingPlace.commune}
                    onChange={(e) => setEditingPlace({ ...editingPlace, commune: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                  >
                    {communes.filter(c => c !== 'ALL').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">URL Ảnh Đại Diện (Cloudinary / Unsplash):</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editingPlace.image_url || ''}
                    onChange={(e) => setEditingPlace({ ...editingPlace, image_url: e.target.value })}
                    className="flex-1 p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                    placeholder="https://..."
                  />
                  {editingPlace.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={editingPlace.image_url} alt="Preview" className="w-10 h-10 rounded-lg object-cover border border-slate-300" />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Thể Loại:</label>
                  <input
                    type="text"
                    value={editingPlace.category}
                    onChange={(e) => setEditingPlace({ ...editingPlace, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Khung Giờ Vàng (Golden Time):</label>
                  <input
                    type="text"
                    value={editingPlace.golden_time_windows || ''}
                    onChange={(e) => setEditingPlace({ ...editingPlace, golden_time_windows: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mô Tả Chi Tiết:</label>
                <textarea
                  rows={3}
                  value={editingPlace.description || ''}
                  onChange={(e) => setEditingPlace({ ...editingPlace, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingPlace(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#1B4D3E] hover:bg-[#143B2F] text-white font-bold shadow-md"
                >
                  Lưu Vào CSDL Supabase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New POI Modal */}
      {isAddingNew && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden space-y-4 p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" />
                <span>Thêm Địa Điểm Mới Vào CSDL (CMS)</span>
              </h3>
              <button onClick={() => setIsAddingNew(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {statusMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{statusMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateNew} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tên Địa Điểm Mới (*):</label>
                  <input
                    type="text"
                    value={newPlace.name}
                    onChange={(e) => setNewPlace({ ...newPlace, name: e.target.value })}
                    placeholder="Ví dụ: Chùa Tà Pạ..."
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Xã / Thị Trấn (*):</label>
                  <select
                    value={newPlace.commune}
                    onChange={(e) => setNewPlace({ ...newPlace, commune: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                  >
                    {communes.filter(c => c !== 'ALL').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">URL Ảnh Đại Diện (Cloudinary / Unsplash):</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newPlace.image_url}
                    onChange={(e) => setNewPlace({ ...newPlace, image_url: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                  />
                  <label className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer flex items-center gap-1.5 shrink-0 border border-slate-700">
                    <ImageIcon className="w-4 h-4 text-amber-400" />
                    <span>{uploadingImages ? 'Đang tải...' : 'Upload Cloudinary'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handleCloudinaryUpload(e, false)}
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Thể Loại:</label>
                  <input
                    type="text"
                    value={newPlace.category}
                    onChange={(e) => setNewPlace({ ...newPlace, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Khung Giờ Vàng:</label>
                  <input
                    type="text"
                    value={newPlace.golden_time_windows}
                    onChange={(e) => setNewPlace({ ...newPlace, golden_time_windows: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mô Tả Địa Điểm:</label>
                <textarea
                  rows={3}
                  value={newPlace.description}
                  onChange={(e) => setNewPlace({ ...newPlace, description: e.target.value })}
                  placeholder="Nhập giới thiệu địa điểm..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md"
                >
                  Tạo Địa Điểm CSDL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Audit Log Viewer Modal */}
      {showAuditLogsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Immutable System Audit Trail</span>
                </div>
                <h3 className="font-extrabold text-xl text-white">Nhật Ký Thao Tác Hệ Thống (Audit Log Viewer)</h3>
              </div>
              <button
                onClick={() => setShowAuditLogsModal(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Table */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {loadingAuditLogs ? (
                <div className="py-12 text-center text-slate-500 font-bold flex flex-col items-center gap-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
                  <span>Đang truy vấn nhật ký thao tác từ CSDL...</span>
                </div>
              ) : auditLogs.length === 0 ? (
                <div className="py-12 text-center text-slate-400 font-bold">Chưa có bản ghi nhật ký thao tác nào.</div>
              ) : (
                <div className="space-y-3">
                  {auditLogs.map((log) => {
                    const isCreate = log.action.includes('CREATE');
                    const isDelete = log.action.includes('DELETE');
                    return (
                      <div
                        key={log.id}
                        className="p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2.5 py-0.5 rounded-full font-extrabold text-[10px] ${
                                isCreate
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : isDelete
                                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                  : 'bg-amber-100 text-amber-900 border border-amber-300'
                              }`}
                            >
                              {log.action}
                            </span>
                            <span className="font-extrabold text-slate-900">{log.user_name || 'Admin'}</span>
                            <span className="text-slate-400">({log.user_role || 'ADMIN'})</span>
                          </div>
                          <p className="text-slate-700 font-mono text-[11px] truncate max-w-lg">
                            Resource ID: <span className="font-bold text-slate-900">{log.resource_id}</span> • Details:{' '}
                            {JSON.stringify(log.details)}
                          </p>
                        </div>
                        <div className="text-[11px] font-semibold text-slate-500 shrink-0">
                          {new Date(log.created_at).toLocaleString('vi-VN')}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-slate-600">
              <span>Tổng số bản ghi: {auditLogs.length}</span>
              <button
                onClick={() => setShowAuditLogsModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors"
              >
                Đóng Viewer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
