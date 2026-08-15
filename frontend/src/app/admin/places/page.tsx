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
  RotateCcw,
  Image as ImageIcon,
  Moon,
  Phone,
  Compass,
  FileText,
  DollarSign,
  AlertCircle,
  Database,
  CheckSquare,
  Square,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  Upload,
  Link as LinkIcon,
} from 'lucide-react';

interface PlaceRecord {
  id: string;
  slug: string;
  name: string;
  commune: string;
  category: string;
  tourism_category?: string;
  rating: number;
  image_url: string;
  photos?: string[];
  description: string;
  detailed_story?: string;
  phone?: string;
  open_late?: boolean;
  night_hours?: string;
  golden_time_windows?: string;
  price_level?: string;
  video_url?: string;
  is_hot?: boolean;
  is_active?: boolean;
  latitude?: number;
  longitude?: number;
  address?: string;
  created_at?: string;
  updated_at?: string;
}

const communes = [
  'ALL',
  'Thị trấn Tri Tôn',
  'Thị trấn Ba Chúc',
  'Xã Núi Tô',
  'Xã Cô Tô',
  'Xã Ô Lâm',
  'Xã An Tức',
  'Xã Châu Lăng',
  'Xã Lương Phi',
  'Xã Lương An Trà',
  'Xã Tà Đảnh',
  'Xã Tân Tuyến',
  'Xã Vĩnh Phước',
  'Xã Vĩnh Gia',
  'Xã Lạc Quới',
  'Xã Lê Trì',
];

const categories = [
  'ALL',
  'Danh thắng check-in',
  'Văn hóa & Tâm linh',
  'Ẩm thực & Đặc sản',
  'Quán Cà Phê',
  'Homestay & Lưu Trú',
  'Di tích Lịch sử',
];

export default function AdminPlacesPage() {
  const [places, setPlaces] = useState<PlaceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [communeFilter, setCommuneFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [nightFilter, setNightFilter] = useState(false);
  const [activeStatusFilter, setActiveStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ACTIVE');

  // Selected items for batch actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals state
  const [editingPlace, setEditingPlace] = useState<PlaceRecord | null>(null);
  const [activeEditTab, setActiveEditTab] = useState<'basic' | 'story' | 'service' | 'media'>('basic');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [activeAddTab, setActiveAddTab] = useState<'basic' | 'story' | 'service' | 'media'>('basic');
  const [showAuditLogsModal, setShowAuditLogsModal] = useState(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loadingAuditLogs, setLoadingAuditLogs] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [syncingVector, setSyncingVector] = useState(false);

  // URL Input for Gallery Studio
  const [urlInputAdd, setUrlInputAdd] = useState('');
  const [urlInputEdit, setUrlInputEdit] = useState('');

  // Delete Confirm Modal
  const [deletingPlace, setDeletingPlace] = useState<PlaceRecord | null>(null);

  const [newPlace, setNewPlace] = useState<Partial<PlaceRecord>>({
    name: '',
    commune: 'Thị trấn Tri Tôn',
    category: 'Danh thắng check-in',
    tourism_category: 'Địa Điểm Tham Quan',
    rating: 4.8,
    image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop',
    photos: ['https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop'],
    description: '',
    detailed_story: '',
    phone: '',
    open_late: false,
    night_hours: '17:00 - 22:00',
    golden_time_windows: '06:00-08:00 • 16:00-17:30',
    price_level: 'Bình dân',
    video_url: '',
    latitude: 10.42,
    longitude: 105.01,
    is_hot: false,
    is_active: true,
  });

  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const fetchPlaces = async () => {
    setLoading(true);
    try {
      let url = '/api/v1/admin/places?';
      if (communeFilter !== 'ALL') url += `commune=${encodeURIComponent(communeFilter)}&`;
      if (categoryFilter !== 'ALL') url += `category=${encodeURIComponent(categoryFilter)}&`;
      if (searchQuery.trim()) url += `search=${encodeURIComponent(searchQuery.trim())}&`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.places) {
        setPlaces(data.places);
      }
    } catch (err) {
      console.warn('Failed to load places:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaces();
  }, [communeFilter, categoryFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPlaces();
  };

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

  // 1. Tải Lên Hàng Loạt Từ Máy Tính (Cloudinary)
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
        if (isEditMode && editingPlace) {
          const currentPhotos = Array.isArray(editingPlace.photos) && editingPlace.photos.length > 0
            ? editingPlace.photos
            : (editingPlace.image_url ? [editingPlace.image_url] : []);
          const updatedPhotos = Array.from(new Set([...currentPhotos, ...data.urls]));
          const newCover = editingPlace.image_url || data.urls[0];
          setEditingPlace({ ...editingPlace, photos: updatedPhotos, image_url: newCover });
        } else {
          const currentPhotos = Array.isArray(newPlace.photos) && newPlace.photos.length > 0
            ? newPlace.photos
            : (newPlace.image_url ? [newPlace.image_url] : []);
          const updatedPhotos = Array.from(new Set([...currentPhotos, ...data.urls]));
          const newCover = newPlace.image_url || data.urls[0];
          setNewPlace({ ...newPlace, photos: updatedPhotos, image_url: newCover });
        }
        setStatusMsg(`Đã tải lên thành công ${data.urls.length} hình ảnh vào Album Cloudinary!`);
        setTimeout(() => setStatusMsg(null), 3000);
      }
    } catch (err) {
      console.warn('Cloudinary upload error:', err);
    } finally {
      setUploadingImages(false);
      // Reset input file target value
      e.target.value = '';
    }
  };

  // 2. Thêm Ảnh Nhanh Từ URL
  const handleAddPhotoByUrl = (isEditMode: boolean) => {
    const rawInput = isEditMode ? urlInputEdit : urlInputAdd;
    if (!rawInput.trim()) return;

    // Split by comma, newline or whitespace
    const incomingUrls = rawInput
      .split(/[\n,\s]+/)
      .map((u) => u.trim())
      .filter((u) => u.startsWith('http://') || u.startsWith('https://'));

    if (incomingUrls.length === 0) {
      setStatusMsg('Vui lòng nhập đường link URL ảnh hợp lệ (bắt đầu bằng http:// hoặc https://)');
      setTimeout(() => setStatusMsg(null), 3000);
      return;
    }

    if (isEditMode && editingPlace) {
      const currentPhotos = Array.isArray(editingPlace.photos) && editingPlace.photos.length > 0
        ? editingPlace.photos
        : (editingPlace.image_url ? [editingPlace.image_url] : []);
      const updatedPhotos = Array.from(new Set([...currentPhotos, ...incomingUrls]));
      const newCover = editingPlace.image_url || incomingUrls[0];
      setEditingPlace({ ...editingPlace, photos: updatedPhotos, image_url: newCover });
      setUrlInputEdit('');
    } else {
      const currentPhotos = Array.isArray(newPlace.photos) && newPlace.photos.length > 0
        ? newPlace.photos
        : (newPlace.image_url ? [newPlace.image_url] : []);
      const updatedPhotos = Array.from(new Set([...currentPhotos, ...incomingUrls]));
      const newCover = newPlace.image_url || incomingUrls[0];
      setNewPlace({ ...newPlace, photos: updatedPhotos, image_url: newCover });
      setUrlInputAdd('');
    }

    setStatusMsg(`Đã thêm thành công ${incomingUrls.length} ảnh từ URL vào Album!`);
    setTimeout(() => setStatusMsg(null), 3000);
  };

  // 3. Đặt Làm Ảnh Bìa Chính (Cover Photo)
  const handleSetCoverPhoto = (url: string, isEditMode: boolean) => {
    if (isEditMode && editingPlace) {
      setEditingPlace({ ...editingPlace, image_url: url });
    } else {
      setNewPlace({ ...newPlace, image_url: url });
    }
    setStatusMsg('Đã chọn làm ⭐ Ảnh Bìa Chính của địa điểm!');
    setTimeout(() => setStatusMsg(null), 2500);
  };

  // 4. Sắp Xếp Thứ Tự Ảnh (Di Chuyển Trái / Phải)
  const handleMovePhoto = (index: number, direction: 'left' | 'right', isEditMode: boolean) => {
    const target = isEditMode ? editingPlace : newPlace;
    if (!target) return;

    const photos = Array.isArray(target.photos) ? [...target.photos] : [];
    if (photos.length <= 1) return;

    const targetIdx = direction === 'left' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= photos.length) return;

    const temp = photos[index];
    photos[index] = photos[targetIdx];
    photos[targetIdx] = temp;

    if (isEditMode && editingPlace) {
      setEditingPlace({ ...editingPlace, photos });
    } else {
      setNewPlace({ ...newPlace, photos });
    }
  };

  // 5. Xóa Ảnh Khỏi Album
  const handleDeletePhoto = (index: number, isEditMode: boolean) => {
    const target = isEditMode ? editingPlace : newPlace;
    if (!target) return;

    const photos = Array.isArray(target.photos) ? [...target.photos] : [];
    const removedUrl = photos[index];
    const updatedPhotos = photos.filter((_, i) => i !== index);

    // If deleting the current cover, fallback to first available photo
    let newCover: string = target.image_url || '';
    if (target.image_url === removedUrl) {
      newCover = updatedPhotos[0] || '';
    }

    if (isEditMode && editingPlace) {
      setEditingPlace({ ...editingPlace, photos: updatedPhotos, image_url: newCover });
    } else {
      setNewPlace({ ...newPlace, photos: updatedPhotos, image_url: newCover });
    }

    setStatusMsg('Đã xóa ảnh khỏi Album!');
    setTimeout(() => setStatusMsg(null), 2000);
  };

  const handleToggleHot = async (place: PlaceRecord) => {
    const newHotStatus = !place.is_hot;
    try {
      const res = await fetch('/api/v1/admin/places', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: place.id, is_hot: newHotStatus }),
      });
      if (res.ok) {
        setPlaces(places.map((p) => (p.id === place.id ? { ...p, is_hot: newHotStatus } : p)));
        setStatusMsg(`Đã ${newHotStatus ? 'gắn' : 'bỏ'} huy hiệu HOT cho "${place.name}"`);
        setTimeout(() => setStatusMsg(null), 2500);
      }
    } catch (err) {
      console.warn('Failed to toggle HOT status:', err);
    }
  };

  const handleToggleNight = async (place: PlaceRecord) => {
    const newNightStatus = !place.open_late;
    try {
      const res = await fetch('/api/v1/admin/places', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: place.id, open_late: newNightStatus }),
      });
      if (res.ok) {
        setPlaces(places.map((p) => (p.id === place.id ? { ...p, open_late: newNightStatus } : p)));
        setStatusMsg(`Đã ${newNightStatus ? 'bật' : 'tắt'} chế độ Mở Muộn Về Đêm cho "${place.name}"`);
        setTimeout(() => setStatusMsg(null), 2500);
      }
    } catch (err) {
      console.warn('Failed to toggle Night status:', err);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlace) return;

    setSyncingVector(true);
    try {
      const res = await fetch('/api/v1/admin/places', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPlace),
      });

      if (res.ok) {
        const data = await res.json();
        setPlaces(places.map((p) => (p.id === editingPlace.id ? { ...p, ...data.place } : p)));
        setEditingPlace(null);
        setStatusMsg(`Đã cập nhật dữ liệu & Vector Embeddings 768d cho "${editingPlace.name}"!`);
        setTimeout(() => setStatusMsg(null), 3500);
      }
    } catch (err) {
      console.warn('Failed to save place edit:', err);
    } finally {
      setSyncingVector(false);
    }
  };

  const handleCreateNew = async (e: React.FormEvent) => {
    e.preventDefault();
    setSyncingVector(true);
    try {
      const res = await fetch('/api/v1/admin/places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPlace),
      });

      if (res.ok) {
        const data = await res.json();
        setPlaces([data.place, ...places]);
        setIsAddingNew(false);
        setNewPlace({
          name: '',
          commune: 'Thị trấn Tri Tôn',
          category: 'Danh thắng check-in',
          tourism_category: 'Địa Điểm Tham Quan',
          rating: 4.8,
          image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop',
          description: '',
          detailed_story: '',
          phone: '',
          open_late: false,
          night_hours: '17:00 - 22:00',
          golden_time_windows: '06:00-08:00 • 16:00-17:30',
          price_level: 'Bình dân',
          video_url: '',
          latitude: 10.42,
          longitude: 105.01,
          is_hot: false,
          is_active: true,
        });
        setStatusMsg(`Đã thêm địa điểm mới & sinh Vector Embeddings thành công!`);
        setTimeout(() => setStatusMsg(null), 3500);
      }
    } catch (err) {
      console.warn('Failed to create new place:', err);
    } finally {
      setSyncingVector(false);
    }
  };

  const handleDeletePlace = async () => {
    if (!deletingPlace) return;

    try {
      const res = await fetch(`/api/v1/admin/places?id=${deletingPlace.id}`, { method: 'DELETE' });
      if (res.ok) {
        setPlaces(places.map((p) => (p.id === deletingPlace.id ? { ...p, is_active: false } : p)));
        setDeletingPlace(null);
        setStatusMsg(`Đã tắt kích hoạt / chuyển vào thùng rác địa điểm "${deletingPlace.name}"!`);
        setTimeout(() => setStatusMsg(null), 3500);
      }
    } catch (err) {
      console.warn('Failed to delete place:', err);
    }
  };

  const handleRestorePlace = async (place: PlaceRecord) => {
    try {
      const res = await fetch('/api/v1/admin/places', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: place.id, is_active: true }),
      });
      if (res.ok) {
        setPlaces(places.map((p) => (p.id === place.id ? { ...p, is_active: true } : p)));
        setStatusMsg(`Đã khôi phục hoạt động cho "${place.name}"!`);
        setTimeout(() => setStatusMsg(null), 3000);
      }
    } catch (err) {
      console.warn('Failed to restore place:', err);
    }
  };

  // Filter places
  const filteredPlaces = places.filter((p) => {
    if (nightFilter && !p.open_late) return false;
    if (activeStatusFilter === 'ACTIVE' && p.is_active === false) return false;
    if (activeStatusFilter === 'INACTIVE' && p.is_active !== false) return false;
    return true;
  });

  const activeCount = places.filter((p) => p.is_active !== false).length;
  const inactiveCount = places.filter((p) => p.is_active === false).length;

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
              CMS Quản Trị Địa Điểm Toàn Diện
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 font-bold text-xs border border-amber-200">
              {activeCount} Địa Điểm Hoạt Động
            </span>
            {inactiveCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 font-bold text-xs border border-rose-200">
                {inactiveCount} Đã Ẩn / Thùng Rác
              </span>
            )}
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Quản Lý 149 Địa Điểm & Rich Content (CRUD Đầy Đủ)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Thêm mới, sửa chi tiết Rich Story, xóa/khôi phục, gắn hotline đặt bàn, bật Tri Tôn Về Đêm và tự động đồng bộ Vector Embeddings 768d cho AI Chatbot.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleOpenAuditLogs}
            type="button"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
          >
            <Clock className="w-4 h-4 text-slate-500" />
            <span>Audit Logs</span>
          </button>

          <button
            onClick={() => {
              setIsAddingNew(true);
              setActiveAddTab('basic');
            }}
            type="button"
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-[#1B4D3E] hover:bg-[#143B2F] text-white font-bold text-xs shadow-md shadow-emerald-900/10 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>Thêm Địa Điểm Mới</span>
          </button>
        </div>
      </div>

      {/* Status Toast */}
      {statusMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs flex items-center justify-between shadow-xs animate-in fade-in duration-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{statusMsg}</span>
          </div>
          <button onClick={() => setStatusMsg(null)} className="text-emerald-600 hover:text-emerald-900 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm theo tên địa điểm, xã/thị trấn, mô tả..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]/20 focus:border-[#1B4D3E]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={communeFilter}
              onChange={(e) => setCommuneFilter(e.target.value)}
              aria-label="Lọc theo Xã / Thị trấn"
              className="px-3 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none"
            >
              {communes.map((c) => (
                <option key={c} value={c}>
                  {c === 'ALL' ? 'Tất cả Xã / Thị trấn' : c}
                </option>
              ))}
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Lọc theo Thể loại"
              className="px-3 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'ALL' ? 'Tất cả Thể loại' : cat}
                </option>
              ))}
            </select>

            {/* Active Status Tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveStatusFilter('ACTIVE')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  activeStatusFilter === 'ACTIVE' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                Hoạt Động ({activeCount})
              </button>
              <button
                type="button"
                onClick={() => setActiveStatusFilter('INACTIVE')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  activeStatusFilter === 'INACTIVE' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-500'
                }`}
              >
                Thùng Rác ({inactiveCount})
              </button>
            </div>

            <button
              type="button"
              onClick={() => setNightFilter(!nightFilter)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                nightFilter
                  ? 'bg-purple-900 text-amber-300 border border-purple-700 shadow-xs'
                  : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Chỉ Tri Tôn Về Đêm</span>
            </button>

            <button
              type="submit"
              className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all cursor-pointer"
            >
              Lọc Dữ Liệu
            </button>
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="text-xs font-bold text-slate-600">
            Hiển thị <span className="text-slate-900 font-extrabold">{filteredPlaces.length}</span> địa điểm phù hợp
          </div>
          <button
            onClick={fetchPlaces}
            className="flex items-center gap-1 text-xs font-bold text-[#1B4D3E] hover:underline cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Làm mới bảng</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="p-4">Địa Điểm & Ảnh</th>
                <th className="p-4">Khu Vực (Xã/Thị Trấn)</th>
                <th className="p-4">Chuyên Đề & Đêm</th>
                <th className="p-4">Hotline Đặt Bàn</th>
                <th className="p-4 text-center">Trạng Thái HOT</th>
                <th className="p-4 text-right">Quản Trị Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400 font-bold">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
                    Đang tải danh sách địa điểm Master từ Supabase...
                  </td>
                </tr>
              ) : filteredPlaces.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400 font-bold">
                    Không tìm thấy địa điểm nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredPlaces.map((place) => (
                  <tr
                    key={place.id}
                    className={`transition-colors ${
                      place.is_active === false ? 'bg-rose-50/40 hover:bg-rose-50/70' : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                          {place.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={place.image_url} alt={place.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <ImageIcon className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                            <span>{place.name}</span>
                            {place.is_hot && (
                              <span className="px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-black">
                                HOT
                              </span>
                            )}
                            {place.is_active === false && (
                              <span className="px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[10px] font-black">
                                ĐÃ ẨN
                              </span>
                            )}
                          </div>
                          <div className="text-slate-500 text-[11px] line-clamp-1 mt-0.5 max-w-xs">
                            {place.description || 'Chưa có mô tả ngắn.'}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 font-bold text-slate-700">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{place.commune}</span>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[11px]">
                          {place.tourism_category || place.category}
                        </span>
                        {place.open_late && (
                          <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-extrabold text-[11px] flex items-center gap-1">
                            <Moon className="w-3 h-3" />
                            <span>Mở Muộn ({place.night_hours || 'Tối'})</span>
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-4">
                      {place.phone ? (
                        <a
                          href={`tel:${place.phone}`}
                          className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 text-[11px]"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{place.phone}</span>
                        </a>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Chưa gắn</span>
                      )}
                    </td>

                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleToggleHot(place)}
                        type="button"
                        className={`p-2 rounded-xl border transition-all cursor-pointer ${
                          place.is_hot
                            ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                            : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'
                        }`}
                        title={place.is_hot ? 'Bấm để bỏ HOT' : 'Bấm để bật HOT'}
                      >
                        <Flame className="w-4 h-4 fill-current" />
                      </button>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleToggleNight(place)}
                          type="button"
                          className={`p-2 rounded-xl border transition-all cursor-pointer ${
                            place.open_late
                              ? 'bg-purple-900 text-amber-300 border-purple-700'
                              : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'
                          }`}
                          title="Bật/Tắt chế độ Mở Muộn Về Đêm"
                        >
                          <Moon className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            setEditingPlace({
                              ...place,
                              photos: Array.isArray(place.photos) && place.photos.length > 0 ? place.photos : (place.image_url ? [place.image_url] : []),
                            });
                            setActiveEditTab('basic');
                          }}
                          type="button"
                          className="p-2 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 border border-slate-200 transition-all cursor-pointer"
                          title="Chỉnh sửa chi tiết (Rich Story)"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {place.is_active === false ? (
                          <button
                            onClick={() => handleRestorePlace(place)}
                            type="button"
                            className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-all cursor-pointer"
                            title="Khôi phục hoạt động"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => setDeletingPlace(place)}
                            type="button"
                            className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-all cursor-pointer"
                            title="Xóa / Tắt kích hoạt"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}

                        <a
                          href={`/places/${place.id || place.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition-all"
                          title="Xem trang du khách"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deletingPlace && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Xác Nhận Xóa / Ẩn Địa Điểm</h3>
                <p className="text-xs text-slate-500 font-medium">Hành động này sẽ thay đổi trạng thái trên CSDL</p>
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed bg-rose-50 p-3.5 rounded-2xl border border-rose-100">
              Bạn có chắc chắn muốn tắt kích hoạt địa điểm <strong className="text-rose-900">{deletingPlace.name}</strong>? Địa điểm sẽ bị ẩn khỏi danh sách gợi ý cho du khách và AI Chatbot.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingPlace(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleDeletePlace}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Xác Nhận Ẩn</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New POI Modal (Full 4 Tabs) */}
      {isAddingNew && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <span className="text-xs text-slate-500 font-bold">Tạo mới điểm đến Bảy Núi</span>
                <h3 className="font-black text-lg text-slate-900 mt-0.5">Thêm Địa Điểm Mới Vào Master Data</h3>
              </div>
              <button
                onClick={() => setIsAddingNew(false)}
                className="p-2 rounded-full hover:bg-slate-200 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Add Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-100 px-5 gap-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveAddTab('basic')}
                className={`py-3 px-3 border-b-2 transition-all cursor-pointer ${
                  activeAddTab === 'basic' ? 'border-[#1B4D3E] text-[#1B4D3E] bg-white' : 'text-slate-600'
                }`}
              >
                1. Thông Tin Cơ Bản
              </button>
              <button
                type="button"
                onClick={() => setActiveAddTab('story')}
                className={`py-3 px-3 border-b-2 transition-all cursor-pointer ${
                  activeAddTab === 'story' ? 'border-[#1B4D3E] text-[#1B4D3E] bg-white' : 'text-slate-600'
                }`}
              >
                2. Rich Story & Câu Chuyện
              </button>
              <button
                type="button"
                onClick={() => setActiveAddTab('service')}
                className={`py-3 px-3 border-b-2 transition-all cursor-pointer ${
                  activeAddTab === 'service' ? 'border-[#1B4D3E] text-[#1B4D3E] bg-white' : 'text-slate-600'
                }`}
              >
                3. Đêm & Hotline Đặt Chỗ
              </button>
              <button
                type="button"
                onClick={() => setActiveAddTab('media')}
                className={`py-3 px-3 border-b-2 transition-all cursor-pointer ${
                  activeAddTab === 'media' ? 'border-[#1B4D3E] text-[#1B4D3E] bg-white' : 'text-slate-600'
                }`}
              >
                4. Ảnh & Video TikTok
              </button>
            </div>

            <form onSubmit={handleCreateNew} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              {activeAddTab === 'basic' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Tên Địa Điểm:</label>
                      <input
                        type="text"
                        value={newPlace.name}
                        onChange={(e) => setNewPlace({ ...newPlace, name: e.target.value })}
                        placeholder="VD: Cà Phê Mây Hồ Soài Chék"
                        className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                        required
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Xã / Thị Trấn:</label>
                      <select
                        value={newPlace.commune}
                        onChange={(e) => setNewPlace({ ...newPlace, commune: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                      >
                        {communes.filter((c) => c !== 'ALL').map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Phân Nhóm Du Lịch:</label>
                      <select
                        value={newPlace.tourism_category}
                        onChange={(e) => setNewPlace({ ...newPlace, tourism_category: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                      >
                        <option value="Danh thắng check-in">Danh thắng check-in</option>
                        <option value="Văn hóa & Tâm linh">Văn hóa & Tâm linh</option>
                        <option value="Ẩm thực & Đặc sản">Ẩm thực & Đặc sản</option>
                        <option value="Quán Cà Phê">Quán Cà Phê</option>
                        <option value="Homestay & Lưu Trú">Homestay & Lưu Trú</option>
                        <option value="Di tích Lịch sử">Di tích Lịch sử</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Đánh Giá (Rating):</label>
                      <input
                        type="number"
                        step="0.1"
                        min="1"
                        max="5"
                        value={newPlace.rating}
                        onChange={(e) => setNewPlace({ ...newPlace, rating: parseFloat(e.target.value) })}
                        className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Vĩ độ (Latitude):</label>
                      <input
                        type="number"
                        step="0.000001"
                        value={newPlace.latitude}
                        onChange={(e) => setNewPlace({ ...newPlace, latitude: parseFloat(e.target.value) })}
                        className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Kinh độ (Longitude):</label>
                      <input
                        type="number"
                        step="0.000001"
                        value={newPlace.longitude}
                        onChange={(e) => setNewPlace({ ...newPlace, longitude: parseFloat(e.target.value) })}
                        className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Mô Tả Tóm Tắt:</label>
                    <textarea
                      rows={2}
                      value={newPlace.description}
                      onChange={(e) => setNewPlace({ ...newPlace, description: e.target.value })}
                      placeholder="Mô tả nổi bật ngắn gọn..."
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                    />
                  </div>
                </div>
              )}

              {activeAddTab === 'story' && (
                <div className="space-y-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Câu Chuyện Chi Tiết & Sự Tích Bảy Núi (Detailed Story):
                    </label>
                    <textarea
                      rows={8}
                      value={newPlace.detailed_story}
                      onChange={(e) => setNewPlace({ ...newPlace, detailed_story: e.target.value })}
                      placeholder="Nhập nội dung cẩm nang, truyền thuyết, sự tích..."
                      className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Khung Giờ Vàng Check-in:</label>
                    <input
                      type="text"
                      value={newPlace.golden_time_windows}
                      onChange={(e) => setNewPlace({ ...newPlace, golden_time_windows: e.target.value })}
                      placeholder="06:00–08:00 • 16:00–17:30"
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                    />
                  </div>
                </div>
              )}

              {activeAddTab === 'service' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Moon className="w-5 h-5 text-purple-700" />
                        <div>
                          <div className="font-bold text-purple-900">Chuyên Đề "Tri Tôn Về Đêm"</div>
                          <div className="text-[11px] text-purple-600">Bật nếu địa điểm mở cửa phục vụ sau 17:30</div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={Boolean(newPlace.open_late)}
                        onChange={(e) => setNewPlace({ ...newPlace, open_late: e.target.checked })}
                        className="w-5 h-5 rounded text-purple-700 focus:ring-purple-500"
                      />
                    </div>

                    {newPlace.open_late && (
                      <div>
                        <label className="font-bold text-purple-900 block mb-1">Khung Giờ Mở Cửa Buổi Tối:</label>
                        <input
                          type="text"
                          value={newPlace.night_hours}
                          onChange={(e) => setNewPlace({ ...newPlace, night_hours: e.target.value })}
                          placeholder="17:00 - 22:30"
                          className="w-full p-2 rounded-xl bg-white border border-purple-200 font-bold text-xs"
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Hotline Đặt Bàn / Homestay:</label>
                      <input
                        type="text"
                        value={newPlace.phone}
                        onChange={(e) => setNewPlace({ ...newPlace, phone: e.target.value })}
                        placeholder="0296 3874 113"
                        className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Mức Giá / Vé Tham Quan:</label>
                      <input
                        type="text"
                        value={newPlace.price_level}
                        onChange={(e) => setNewPlace({ ...newPlace, price_level: e.target.value })}
                        placeholder="Miễn phí / 20k - 50k"
                        className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeAddTab === 'media' && (
                <div className="space-y-4">
                  {/* 1. Tải Lên Hàng Loạt Từ Máy Tính */}
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                        <Upload className="w-4 h-4 text-emerald-700" /> Tải Lên Hàng Loạt Ảnh (Cloudinary):
                      </label>
                      <span className="text-[11px] text-slate-500 font-medium">Hỗ trợ chọn 5–10 ảnh cùng lúc</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleCloudinaryUpload(e, false)}
                      disabled={uploadingImages}
                      className="w-full p-2 rounded-xl bg-white border border-slate-200 text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#1B4D3E] file:text-white hover:file:bg-[#143c30] cursor-pointer"
                    />
                    {uploadingImages && (
                      <div className="text-emerald-700 font-bold text-[11px] mt-2 flex items-center gap-1.5">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Đang tải và tối ưu hóa ảnh lên Cloudinary...
                      </div>
                    )}
                  </div>

                  {/* 2. Thêm Ảnh Từ URL */}
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                    <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5 mb-1.5">
                      <LinkIcon className="w-4 h-4 text-blue-600" /> Thêm Ảnh Từ URL (Google Maps, FB, Báo chí, CDN):
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={urlInputAdd}
                        onChange={(e) => setUrlInputAdd(e.target.value)}
                        placeholder="Dán link ảnh (hỗ trợ nhiều link cách nhau bởi dấu phẩy)..."
                        className="flex-1 p-2 rounded-xl bg-white border border-slate-200 text-xs"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddPhotoByUrl(false);
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleAddPhotoByUrl(false)}
                        className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Thêm Vào Album
                      </button>
                    </div>
                  </div>

                  {/* 3. Lưới Quản Lý Album Ảnh */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-emerald-800" />
                        <span className="font-bold text-slate-800 text-xs">
                          Album Ảnh Của Địa Điểm ({Array.isArray(newPlace.photos) ? newPlace.photos.length : (newPlace.image_url ? 1 : 0)} ảnh)
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium">
                        ⭐ Viền vàng là <strong className="text-amber-700 font-bold">Ảnh Bìa Chính</strong>
                      </span>
                    </div>

                    {(!newPlace.photos || newPlace.photos.length === 0) ? (
                      <div className="text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                        <ImageIcon className="w-7 h-7 text-slate-300 mx-auto mb-1.5" />
                        <p className="text-xs text-slate-500">Chưa có ảnh nào trong Album. Hãy tải ảnh lên từ máy hoặc nhập URL.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto p-1 bg-slate-50/50 rounded-xl border border-slate-100">
                        {newPlace.photos.map((url, idx) => {
                          const isCover = newPlace.image_url === url;
                          return (
                            <div
                              key={idx}
                              className={`group relative rounded-xl overflow-hidden border-2 transition-all bg-white shadow-xs ${
                                isCover ? 'border-amber-500 ring-2 ring-amber-400/40' : 'border-slate-200 hover:border-emerald-500'
                              }`}
                            >
                              <div className="aspect-video w-full relative overflow-hidden bg-slate-100">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={url}
                                  alt={`Photo ${idx + 1}`}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                {isCover && (
                                  <span className="absolute top-1 left-1 bg-amber-500 text-slate-900 text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm flex items-center gap-0.5">
                                    <Star className="w-2.5 h-2.5 fill-slate-900" /> Bìa Chính
                                  </span>
                                )}
                                <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] font-bold px-1 rounded">
                                  #{idx + 1}
                                </span>
                              </div>

                              <div className="p-1 bg-white flex items-center justify-between border-t border-slate-100">
                                <div className="flex items-center gap-1">
                                  {!isCover && (
                                    <button
                                      type="button"
                                      onClick={() => handleSetCoverPhoto(url, false)}
                                      title="Đặt làm Ảnh Bìa Chính"
                                      className="px-1.5 py-0.5 rounded bg-amber-50 hover:bg-amber-100 text-amber-700 text-[10px] font-bold flex items-center gap-0.5 transition-all cursor-pointer"
                                    >
                                      <Star className="w-2.5 h-2.5" /> Bìa
                                    </button>
                                  )}
                                  {idx > 0 && (
                                    <button
                                      type="button"
                                      onClick={() => handleMovePhoto(idx, 'left', false)}
                                      title="Di chuyển sang trái"
                                      className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
                                    >
                                      <ArrowLeft className="w-2.5 h-2.5" />
                                    </button>
                                  )}
                                  {idx < (newPlace.photos?.length || 0) - 1 && (
                                    <button
                                      type="button"
                                      onClick={() => handleMovePhoto(idx, 'right', false)}
                                      title="Di chuyển sang phải"
                                      className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
                                    >
                                      <ArrowRight className="w-2.5 h-2.5" />
                                    </button>
                                  )}
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleDeletePhoto(idx, false)}
                                  title="Xóa ảnh khỏi Album"
                                  className="p-1 rounded bg-red-50 hover:bg-red-100 text-red-600 transition-all cursor-pointer"
                                >
                                  <Trash2 className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* 4. Link Video TikTok */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1 text-xs">Link Video TikTok:</label>
                    <input
                      type="text"
                      value={newPlace.video_url || ''}
                      onChange={(e) => setNewPlace({ ...newPlace, video_url: e.target.value })}
                      placeholder="https://www.tiktok.com/@..."
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-[11px]">
                  <Database className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Tự động sinh Vector Embeddings 768d cho AI Chatbot</span>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingNew(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={syncingVector}
                    className="px-5 py-2 rounded-xl bg-[#1B4D3E] hover:bg-[#143B2F] text-white font-bold shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {syncingVector ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Đang Tạo & Đồng Bộ Vector...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
                        <span>Tạo Mới & Đồng Bộ</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Place Modal */}
      {editingPlace && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    ID: {editingPlace.id}
                  </span>
                  <span className="text-xs text-slate-500 font-bold">Chỉnh sửa địa điểm Master</span>
                </div>
                <h3 className="font-black text-lg text-slate-900 mt-0.5">{editingPlace.name}</h3>
              </div>
              <button
                onClick={() => setEditingPlace(null)}
                className="p-2 rounded-full hover:bg-slate-200 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-100 px-5 gap-2 text-xs font-bold">
              <button
                onClick={() => setActiveEditTab('basic')}
                className={`py-3 px-3 border-b-2 transition-all cursor-pointer ${
                  activeEditTab === 'basic'
                    ? 'border-[#1B4D3E] text-[#1B4D3E] bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                1. Thông Tin Cơ Bản
              </button>
              <button
                onClick={() => setActiveEditTab('story')}
                className={`py-3 px-3 border-b-2 transition-all cursor-pointer ${
                  activeEditTab === 'story'
                    ? 'border-[#1B4D3E] text-[#1B4D3E] bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                2. Câu Chuyện & Lịch Sử (Rich Story)
              </button>
              <button
                onClick={() => setActiveEditTab('service')}
                className={`py-3 px-3 border-b-2 transition-all cursor-pointer ${
                  activeEditTab === 'service'
                    ? 'border-[#1B4D3E] text-[#1B4D3E] bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                3. Đêm & Hotline Đặt Chỗ
              </button>
              <button
                onClick={() => setActiveEditTab('media')}
                className={`py-3 px-3 border-b-2 transition-all cursor-pointer ${
                  activeEditTab === 'media'
                    ? 'border-[#1B4D3E] text-[#1B4D3E] bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                4. Ảnh Cloudinary & Video
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSaveEdit} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              {activeEditTab === 'basic' && (
                <div className="space-y-4">
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
                        {communes.filter((c) => c !== 'ALL').map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Phân Nhóm Du Lịch:</label>
                      <select
                        value={editingPlace.tourism_category || editingPlace.category}
                        onChange={(e) => setEditingPlace({ ...editingPlace, tourism_category: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                      >
                        <option value="Danh thắng check-in">Danh thắng check-in</option>
                        <option value="Văn hóa & Tâm linh">Văn hóa & Tâm linh</option>
                        <option value="Ẩm thực & Đặc sản">Ẩm thực & Đặc sản</option>
                        <option value="Quán Cà Phê">Quán Cà Phê</option>
                        <option value="Homestay & Lưu Trú">Homestay & Lưu Trú</option>
                        <option value="Di tích Lịch sử">Di tích Lịch sử</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Đánh Giá (Rating / 5.0):</label>
                      <input
                        type="number"
                        step="0.1"
                        min="1"
                        max="5"
                        value={editingPlace.rating}
                        onChange={(e) => setEditingPlace({ ...editingPlace, rating: parseFloat(e.target.value) })}
                        className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Vĩ độ (Latitude):</label>
                      <input
                        type="number"
                        step="0.000001"
                        value={editingPlace.latitude || 10.42}
                        onChange={(e) => setEditingPlace({ ...editingPlace, latitude: parseFloat(e.target.value) })}
                        className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Kinh độ (Longitude):</label>
                      <input
                        type="number"
                        step="0.000001"
                        value={editingPlace.longitude || 105.01}
                        onChange={(e) => setEditingPlace({ ...editingPlace, longitude: parseFloat(e.target.value) })}
                        className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Mô Tả Ngắn:</label>
                    <textarea
                      rows={2}
                      value={editingPlace.description || ''}
                      onChange={(e) => setEditingPlace({ ...editingPlace, description: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                    />
                  </div>
                </div>
              )}

              {activeEditTab === 'story' && (
                <div className="space-y-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Câu Chuyện Chi Tiết & Sự Tích Bảy Núi (Detailed Story):
                    </label>
                    <textarea
                      rows={8}
                      value={editingPlace.detailed_story || ''}
                      onChange={(e) => setEditingPlace({ ...editingPlace, detailed_story: e.target.value })}
                      placeholder="Nhập câu chuyện lịch sử, sự tích hồ/chùa, nguồn gốc tên gọi..."
                      className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Khung Giờ Vàng Check-in:</label>
                    <input
                      type="text"
                      value={editingPlace.golden_time_windows || ''}
                      onChange={(e) => setEditingPlace({ ...editingPlace, golden_time_windows: e.target.value })}
                      placeholder="05:30–07:00 • 16:00–17:30"
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                    />
                  </div>
                </div>
              )}

              {activeEditTab === 'service' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Moon className="w-5 h-5 text-purple-700" />
                        <div>
                          <div className="font-bold text-purple-900">Chuyên Đề "Tri Tôn Về Đêm"</div>
                          <div className="text-[11px] text-purple-600">Bật nếu địa điểm mở cửa phục vụ sau 17:30</div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={Boolean(editingPlace.open_late)}
                        onChange={(e) => setEditingPlace({ ...editingPlace, open_late: e.target.checked })}
                        className="w-5 h-5 rounded text-purple-700 focus:ring-purple-500"
                      />
                    </div>

                    {editingPlace.open_late && (
                      <div>
                        <label className="font-bold text-purple-900 block mb-1">Khung Giờ Mở Cửa Buổi Tối:</label>
                        <input
                          type="text"
                          value={editingPlace.night_hours || ''}
                          onChange={(e) => setEditingPlace({ ...editingPlace, night_hours: e.target.value })}
                          placeholder="17:00 - 22:30"
                          className="w-full p-2 rounded-xl bg-white border border-purple-200 font-bold text-xs"
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Hotline Đặt Bàn / Liên Hệ:</label>
                      <input
                        type="text"
                        value={editingPlace.phone || ''}
                        onChange={(e) => setEditingPlace({ ...editingPlace, phone: e.target.value })}
                        placeholder="0296 3874 113 / 09xx..."
                        className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Mức Giá / Vé Tham Quan:</label>
                      <input
                        type="text"
                        value={editingPlace.price_level || ''}
                        onChange={(e) => setEditingPlace({ ...editingPlace, price_level: e.target.value })}
                        placeholder="Miễn phí / 20k - 50k / 250k - 350k/con"
                        className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeEditTab === 'media' && (
                <div className="space-y-4">
                  {/* 1. Tải Lên Hàng Loạt Từ Máy Tính */}
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                        <Upload className="w-4 h-4 text-emerald-700" /> Tải Lên Hàng Loạt Ảnh (Cloudinary):
                      </label>
                      <span className="text-[11px] text-slate-500 font-medium">Hỗ trợ chọn 5–10 ảnh cùng lúc</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleCloudinaryUpload(e, true)}
                      disabled={uploadingImages}
                      className="w-full p-2 rounded-xl bg-white border border-slate-200 text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#1B4D3E] file:text-white hover:file:bg-[#143c30] cursor-pointer"
                    />
                    {uploadingImages && (
                      <div className="text-emerald-700 font-bold text-[11px] mt-2 flex items-center gap-1.5">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Đang tải và tối ưu hóa ảnh lên Cloudinary...
                      </div>
                    )}
                  </div>

                  {/* 2. Thêm Ảnh Từ URL */}
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                    <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5 mb-1.5">
                      <LinkIcon className="w-4 h-4 text-blue-600" /> Thêm Ảnh Từ URL (Google Maps, FB, Báo chí, CDN):
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={urlInputEdit}
                        onChange={(e) => setUrlInputEdit(e.target.value)}
                        placeholder="Dán link ảnh (hỗ trợ nhiều link cách nhau bởi dấu phẩy)..."
                        className="flex-1 p-2 rounded-xl bg-white border border-slate-200 text-xs"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddPhotoByUrl(true);
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleAddPhotoByUrl(true)}
                        className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Thêm Vào Album
                      </button>
                    </div>
                  </div>

                  {/* 3. Lưới Quản Lý Album Ảnh */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-emerald-800" />
                        <span className="font-bold text-slate-800 text-xs">
                          Album Ảnh Của Địa Điểm ({Array.isArray(editingPlace.photos) ? editingPlace.photos.length : (editingPlace.image_url ? 1 : 0)} ảnh)
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium">
                        ⭐ Viền vàng là <strong className="text-amber-700 font-bold">Ảnh Bìa Chính</strong>
                      </span>
                    </div>

                    {(!editingPlace.photos || editingPlace.photos.length === 0) ? (
                      <div className="text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                        <ImageIcon className="w-7 h-7 text-slate-300 mx-auto mb-1.5" />
                        <p className="text-xs text-slate-500">Chưa có ảnh nào trong Album. Hãy tải ảnh lên từ máy hoặc nhập URL.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto p-1 bg-slate-50/50 rounded-xl border border-slate-100">
                        {editingPlace.photos.map((url, idx) => {
                          const isCover = editingPlace.image_url === url;
                          return (
                            <div
                              key={idx}
                              className={`group relative rounded-xl overflow-hidden border-2 transition-all bg-white shadow-xs ${
                                isCover ? 'border-amber-500 ring-2 ring-amber-400/40' : 'border-slate-200 hover:border-emerald-500'
                              }`}
                            >
                              <div className="aspect-video w-full relative overflow-hidden bg-slate-100">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={url}
                                  alt={`Photo ${idx + 1}`}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                {isCover && (
                                  <span className="absolute top-1 left-1 bg-amber-500 text-slate-900 text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm flex items-center gap-0.5">
                                    <Star className="w-2.5 h-2.5 fill-slate-900" /> Bìa Chính
                                  </span>
                                )}
                                <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] font-bold px-1 rounded">
                                  #{idx + 1}
                                </span>
                              </div>

                              <div className="p-1 bg-white flex items-center justify-between border-t border-slate-100">
                                <div className="flex items-center gap-1">
                                  {!isCover && (
                                    <button
                                      type="button"
                                      onClick={() => handleSetCoverPhoto(url, true)}
                                      title="Đặt làm Ảnh Bìa Chính"
                                      className="px-1.5 py-0.5 rounded bg-amber-50 hover:bg-amber-100 text-amber-700 text-[10px] font-bold flex items-center gap-0.5 transition-all cursor-pointer"
                                    >
                                      <Star className="w-2.5 h-2.5" /> Bìa
                                    </button>
                                  )}
                                  {idx > 0 && (
                                    <button
                                      type="button"
                                      onClick={() => handleMovePhoto(idx, 'left', true)}
                                      title="Di chuyển sang trái"
                                      className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
                                    >
                                      <ArrowLeft className="w-2.5 h-2.5" />
                                    </button>
                                  )}
                                  {idx < (editingPlace.photos?.length || 0) - 1 && (
                                    <button
                                      type="button"
                                      onClick={() => handleMovePhoto(idx, 'right', true)}
                                      title="Di chuyển sang phải"
                                      className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
                                    >
                                      <ArrowRight className="w-2.5 h-2.5" />
                                    </button>
                                  )}
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleDeletePhoto(idx, true)}
                                  title="Xóa ảnh khỏi Album"
                                  className="p-1 rounded bg-red-50 hover:bg-red-100 text-red-600 transition-all cursor-pointer"
                                >
                                  <Trash2 className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* 4. Link Video TikTok */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1 text-xs">Link Video TikTok Trực Tiếp:</label>
                    <input
                      type="text"
                      value={editingPlace.video_url || ''}
                      onChange={(e) => setEditingPlace({ ...editingPlace, video_url: e.target.value })}
                      placeholder="https://www.tiktok.com/@user/video/..."
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Modal Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-[11px]">
                  <Database className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Tự động sinh Vector Embeddings 768d khi bấm Lưu</span>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingPlace(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                  >
                    Hủy bỏ
                  </button>

                  <button
                    type="submit"
                    disabled={syncingVector}
                    className="px-5 py-2 rounded-xl bg-[#1B4D3E] hover:bg-[#143B2F] text-white font-bold shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {syncingVector ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Đang Cập Nhật Vector...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
                        <span>Lưu & Đồng Bộ Vector</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Audit Logs Modal */}
      {showAuditLogsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl max-h-[85vh] rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" />
                <span>Nhật Ký Quản Trị Bất Biến (Audit Logs)</span>
              </h3>
              <button
                onClick={() => setShowAuditLogsModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 space-y-2 text-xs">
              {loadingAuditLogs ? (
                <div className="text-center py-8 text-slate-400">Đang tải lịch sử audit logs...</div>
              ) : auditLogs.length === 0 ? (
                <div className="text-center py-8 text-slate-400">Chưa có bản ghi audit log nào.</div>
              ) : (
                auditLogs.map((log, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-extrabold text-emerald-800">{log.action}</span>
                      <span className="text-slate-400 font-mono">
                        {log.created_at ? new Date(log.created_at).toLocaleString('vi-VN') : ''}
                      </span>
                    </div>
                    <div className="text-slate-600 font-mono text-[10px] truncate">
                      {JSON.stringify(log.changes || log.details || {})}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
