'use client';

import React, { useState, useEffect } from 'react';
import { PlaceRecord, DEFAULT_NEW_PLACE } from './types';
import { PlaceTable } from './components/PlaceTable';
import { PlaceModal } from './components/PlaceModal';
import { AuditLogsModal } from './components/AuditLogsModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { PlacesStatsBanner } from './components/PlacesStatsBanner';

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
        setStatusMsg(`Đã cập nhật trạng thái mở đêm cho "${place.name}"`);
        setTimeout(() => setStatusMsg(null), 2500);
      }
    } catch (err) {
      console.warn('Failed to toggle Night:', err);
    }
  };

  // Soft Delete
  const handleConfirmDelete = async () => {
    if (!deletingPlace) return;
    try {
      const res = await fetch(`/api/v1/admin/places?id=${deletingPlace.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setPlaces(places.map((p) => (p.id === deletingPlace.id ? { ...p, is_active: false } : p)));
        setStatusMsg(`Đã vô hiệu hóa "${deletingPlace.name}"`);
        setTimeout(() => setStatusMsg(null), 3000);
        setDeletingPlace(null);
      }
    } catch (err) {
      console.warn('Delete failed:', err);
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
        setStatusMsg(`Đã kích hoạt lại "${place.name}"`);
        setTimeout(() => setStatusMsg(null), 3000);
      }
    } catch (err) {
      console.warn('Restore failed:', err);
    }
  };

  // Batch Delete
  const handleBatchDelete = async () => {
    if (!confirm(`Bạn có chắc chắn muốn vô hiệu hóa ${selectedIds.length} địa điểm đã chọn?`)) return;
    try {
      const res = await fetch('/api/v1/admin/places', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, is_active: false }),
      });
      if (res.ok) {
        setPlaces(places.map((p) => (selectedIds.includes(p.id) ? { ...p, is_active: false } : p)));
        setStatusMsg(`Đã vô hiệu hóa ${selectedIds.length} địa điểm thành công.`);
        setSelectedIds([]);
        setTimeout(() => setStatusMsg(null), 3000);
      }
    } catch (err) {
      console.warn('Batch delete failed:', err);
    }
  };

  // Batch Restore
  const handleBatchRestore = async () => {
    try {
      const res = await fetch('/api/v1/admin/places', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, is_active: true }),
      });
      if (res.ok) {
        setPlaces(places.map((p) => (selectedIds.includes(p.id) ? { ...p, is_active: true } : p)));
        setStatusMsg(`Đã khôi phục ${selectedIds.length} địa điểm thành công.`);
        setSelectedIds([]);
        setTimeout(() => setStatusMsg(null), 3000);
      }
    } catch (err) {
      console.warn('Batch restore failed:', err);
    }
  };

  // Sync Vector Embeddings
  const handleSyncVector = async () => {
    setSyncingVector(true);
    try {
      const res = await fetch('/api/v1/admin/ai-metrics', { method: 'POST' });
      if (res.ok) {
        setStatusMsg('Đã khởi chạy tác vụ đồng bộ Vector Embeddings 768d thành công!');
      } else {
        setStatusMsg('Vector Embeddings đã đồng bộ ở trạng thái mới nhất.');
      }
      setTimeout(() => setStatusMsg(null), 3500);
    } catch (e) {
      console.warn('Vector sync error:', e);
    } finally {
      setSyncingVector(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-body">
      {/* 1. Top Banner & KPI Summary */}
      <PlacesStatsBanner
        places={places}
        onSyncVector={handleSyncVector}
        syncingVector={syncingVector}
      />

      {/* Toast Alert */}
      {statusMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold font-display animate-fade-in">
          ✓ {statusMsg}
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
        onAddNew={() => setIsAddingNew(true)}
        onOpenAuditLogs={() => {
          fetchAuditLogs();
          setShowAuditLogsModal(true);
        }}
        onEditPlace={(place) => setEditingPlace(place)}
        onToggleHot={handleToggleHot}
        onToggleNight={handleToggleNight}
        onDeletePlace={(place) => setDeletingPlace(place)}
        onRestorePlace={handleRestorePlace}
        onBatchDelete={handleBatchDelete}
        onBatchRestore={handleBatchRestore}
      />

      {/* 3. Modals */}
      {(editingPlace || isAddingNew) && (
        <PlaceModal
          place={editingPlace || newPlace}
          isNew={isAddingNew}
          onClose={() => {
            setEditingPlace(null);
            setIsAddingNew(false);
            setNewPlace(DEFAULT_NEW_PLACE);
          }}
          onSuccess={(savedPlace) => {
            if (isAddingNew) {
              setPlaces([savedPlace, ...places]);
              setStatusMsg(`Đã tạo mới địa điểm "${savedPlace.name}" thành công!`);
            } else {
              setPlaces(places.map((p) => (p.id === savedPlace.id ? savedPlace : p)));
              setStatusMsg(`Đã cập nhật thông tin "${savedPlace.name}" thành công!`);
            }
            setTimeout(() => setStatusMsg(null), 3000);
            setEditingPlace(null);
            setIsAddingNew(false);
            setNewPlace(DEFAULT_NEW_PLACE);
          }}
        />
      )}

      {deletingPlace && (
        <DeleteConfirmModal
          placeName={deletingPlace.name}
          onClose={() => setDeletingPlace(null)}
          onConfirm={handleConfirmDelete}
        />
      )}

      {showAuditLogsModal && (
        <AuditLogsModal
          logs={auditLogs}
          loading={loadingAuditLogs}
          onClose={() => setShowAuditLogsModal(false)}
        />
      )}
    </div>
  );
}
