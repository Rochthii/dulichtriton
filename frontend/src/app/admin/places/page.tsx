'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, MapPin, CheckCircle2 } from 'lucide-react';
import { PlaceRecord, DEFAULT_NEW_PLACE } from './types';
import { PlaceTable } from './components/PlaceTable';
import { PlaceModal } from './components/PlaceModal';
import { AuditLogsModal } from './components/AuditLogsModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';

export default function AdminPlacesPage() {
  const [places, setPlaces] = useState<PlaceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [communeFilter, setCommuneFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [nightFilter, setNightFilter] = useState(false);
  const [activeStatusFilter, setActiveStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals state
  const [editingPlace, setEditingPlace] = useState<PlaceRecord | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newPlace, setNewPlace] = useState<Partial<PlaceRecord>>(DEFAULT_NEW_PLACE);
  const [deletingPlace, setDeletingPlace] = useState<PlaceRecord | null>(null);
  const [showAuditLogsModal, setShowAuditLogsModal] = useState(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loadingAuditLogs, setLoadingAuditLogs] = useState(false);

  const [syncingVector, setSyncingVector] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Fetch places from Supabase REST API
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

  // Toggle HOT
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
      console.warn('Failed to toggle HOT:', err);
    }
  };

  // Toggle Night Mode
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

  // Save Edit
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

      const data = await res.json();

      if (res.ok && data.success) {
        setPlaces(places.map((p) => (p.id === editingPlace.id ? { ...p, ...data.place } : p)));
        setEditingPlace(null);
        setStatusMsg(`✅ Đã cập nhật thành công "${editingPlace.name}"!`);
        setTimeout(() => setStatusMsg(null), 3500);
      } else {
        setStatusMsg(`❌ Không thể lưu: ${data.error || 'Lỗi hệ thống'}`);
        setTimeout(() => setStatusMsg(null), 5000);
      }
    } catch (err: any) {
      console.warn('Failed to save place edit:', err);
      setStatusMsg(`❌ Lỗi mạng: ${err.message || 'Không thể kết nối máy chủ'}`);
      setTimeout(() => setStatusMsg(null), 5000);
    } finally {
      setSyncingVector(false);
    }
  };

  // Create New
  const handleCreateNew = async (e: React.FormEvent) => {
    e.preventDefault();
    setSyncingVector(true);
    try {
      const res = await fetch('/api/v1/admin/places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPlace),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setPlaces([data.place, ...places]);
        setIsAddingNew(false);
        setNewPlace(DEFAULT_NEW_PLACE);
        setStatusMsg(`✅ Đã thêm địa điểm mới & sinh Vector Embeddings thành công!`);
        setTimeout(() => setStatusMsg(null), 3500);
      } else {
        setStatusMsg(`❌ Không thể tạo: ${data.error || 'Lỗi hệ thống'}`);
        setTimeout(() => setStatusMsg(null), 5000);
      }
    } catch (err: any) {
      console.warn('Failed to create new place:', err);
      setStatusMsg(`❌ Lỗi mạng: ${err.message || 'Không thể kết nối máy chủ'}`);
      setTimeout(() => setStatusMsg(null), 5000);
    } finally {
      setSyncingVector(false);
    }
  };

  // Soft Delete
  const handleDeleteConfirm = async () => {
    if (!deletingPlace) return;
    try {
      const res = await fetch('/api/v1/admin/places', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deletingPlace.id, is_active: false }),
      });
      if (res.ok) {
        setPlaces(places.map((p) => (p.id === deletingPlace.id ? { ...p, is_active: false } : p)));
        setDeletingPlace(null);
        setStatusMsg(`Đã vô hiệu hóa "${deletingPlace.name}"`);
        setTimeout(() => setStatusMsg(null), 2500);
      }
    } catch (err) {
      console.warn('Failed to soft delete place:', err);
    }
  };

  // Restore Place
  const handleRestorePlace = async (place: PlaceRecord) => {
    try {
      const res = await fetch('/api/v1/admin/places', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: place.id, is_active: true }),
      });
      if (res.ok) {
        setPlaces(places.map((p) => (p.id === place.id ? { ...p, is_active: true } : p)));
        setStatusMsg(`Đã khôi phục hoạt động cho "${place.name}"`);
        setTimeout(() => setStatusMsg(null), 2500);
      }
    } catch (err) {
      console.warn('Failed to restore place:', err);
    }
  };

  // Batch Delete
  const handleBatchDelete = async () => {
    try {
      await Promise.all(
        selectedIds.map((id) =>
          fetch('/api/v1/admin/places', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, is_active: false }),
          })
        )
      );
      setPlaces(places.map((p) => (selectedIds.includes(p.id) ? { ...p, is_active: false } : p)));
      setSelectedIds([]);
      setStatusMsg(`Đã vô hiệu hóa hàng loạt ${selectedIds.length} địa điểm`);
      setTimeout(() => setStatusMsg(null), 2500);
    } catch (err) {
      console.warn('Failed batch delete:', err);
    }
  };

  // Batch Restore
  const handleBatchRestore = async () => {
    try {
      await Promise.all(
        selectedIds.map((id) =>
          fetch('/api/v1/admin/places', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, is_active: true }),
          })
        )
      );
      setPlaces(places.map((p) => (selectedIds.includes(p.id) ? { ...p, is_active: true } : p)));
      setSelectedIds([]);
      setStatusMsg(`Đã khôi phục hàng loạt ${selectedIds.length} địa điểm`);
      setTimeout(() => setStatusMsg(null), 2500);
    } catch (err) {
      console.warn('Failed batch restore:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* 1. Header & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-2 border border-emerald-100">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Studio Quản Trị Địa Điểm & Photo Gallery</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
            Quản Lý Địa Điểm & Media Tri Tôn
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Toàn quyền thêm mới, chỉnh sửa chi tiết, tối ưu hóa ảnh nén WebP và đồng bộ CSDL Supabase PostgreSQL
          </p>
        </div>

        {/* Total places count pill */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white rounded-2xl border border-slate-200 shadow-xs text-xs font-bold text-slate-700 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-700" />
            <span>Tổng cộng: <strong className="text-emerald-800">{places.length}</strong> POIs</span>
          </div>
        </div>
      </div>

      {/* Status Toast Notification */}
      {statusMsg && (
        <div className="bg-emerald-800 text-white px-4 py-3 rounded-2xl text-xs font-bold shadow-lg flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* 2. Main Places Table */}
      <PlaceTable
        places={places}
        loading={loading}
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
        setSelectedIds={setSelectedIds}
        onSearchSubmit={handleSearchSubmit}
        onAddNew={() => {
          setNewPlace(DEFAULT_NEW_PLACE);
          setIsAddingNew(true);
        }}
        onOpenAuditLogs={() => {
          setShowAuditLogsModal(true);
          fetchAuditLogs();
        }}
        onEditPlace={(place) => setEditingPlace(place)}
        onToggleHot={handleToggleHot}
        onToggleNight={handleToggleNight}
        onDeletePlace={(place) => setDeletingPlace(place)}
        onRestorePlace={handleRestorePlace}
        onBatchDelete={handleBatchDelete}
        onBatchRestore={handleBatchRestore}
      />

      {/* 3. Add Modal */}
      {isAddingNew && (
        <PlaceModal
          isEditMode={false}
          placeData={newPlace}
          onClose={() => setIsAddingNew(false)}
          onSave={handleCreateNew}
          onChange={(updated) => setNewPlace(updated)}
          syncingVector={syncingVector}
          setStatusMsg={setStatusMsg}
        />
      )}

      {/* 4. Edit Modal */}
      {editingPlace && (
        <PlaceModal
          isEditMode={true}
          placeData={editingPlace}
          onClose={() => setEditingPlace(null)}
          onSave={handleSaveEdit}
          onChange={(updated) => setEditingPlace(updated as PlaceRecord)}
          syncingVector={syncingVector}
          setStatusMsg={setStatusMsg}
        />
      )}

      {/* 5. Audit Logs Modal */}
      <AuditLogsModal
        isOpen={showAuditLogsModal}
        onClose={() => setShowAuditLogsModal(false)}
        logs={auditLogs}
        loading={loadingAuditLogs}
        onRefresh={fetchAuditLogs}
      />

      {/* 6. Delete Confirm Modal */}
      <DeleteConfirmModal
        place={deletingPlace}
        onClose={() => setDeletingPlace(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
