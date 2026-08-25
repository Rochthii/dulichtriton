'use client';

import React, { useState, useEffect, useMemo } from 'react';
import localMasterPois from '@/data/triton_pois_full.json';
import ItineraryStatsHeader from '@/components/admin/itineraries/ItineraryStatsHeader';
import ItineraryListTable, { ItineraryRecord } from '@/components/admin/itineraries/ItineraryListTable';
import ItineraryFormModal from '@/components/admin/itineraries/ItineraryFormModal';
import { PlacePOI } from '@/components/admin/itineraries/ItineraryStopsEditor';

export default function AdminItinerariesPage() {
  const [itineraries, setItineraries] = useState<ItineraryRecord[]>([]);
  const [places, setPlaces] = useState<PlacePOI[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTour, setEditingTour] = useState<ItineraryRecord | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // 1. Fetch itineraries from Real API
  const fetchItineraries = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/itineraries');
      if (res.ok) {
        const data = await res.json();
        if (data.itineraries && Array.isArray(data.itineraries)) {
          setItineraries(data.itineraries);
        }
      }
    } catch (err) {
      console.warn('Fetch itineraries error:', err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch Places from Real API / Fallback to Local
  const fetchPlaces = async () => {
    try {
      const res = await fetch('/api/v1/admin/places?limit=200');
      if (res.ok) {
        const data = await res.json();
        if (data.places && Array.isArray(data.places)) {
          setPlaces(data.places);
          return;
        }
      }
    } catch (e) {
      console.warn('Fetch places error, fallback:', e);
    }
    setPlaces(localMasterPois as any[]);
  };

  useEffect(() => {
    fetchItineraries();
    fetchPlaces();
  }, []);

  // Filter itineraries
  const filteredItineraries = useMemo(() => {
    if (!searchQuery.trim()) return itineraries;
    const q = searchQuery.toLowerCase();
    return itineraries.filter((t) => {
      const titleMatch = (t.title || '').toLowerCase().includes(q);
      const descMatch = (t.description || t.tagline || '').toLowerCase().includes(q);
      const stopsMatch = (t.stops || []).some((s) => (s.name || '').toLowerCase().includes(q));
      return titleMatch || descMatch || stopsMatch;
    });
  }, [itineraries, searchQuery]);

  const activeCount = useMemo(() => {
    return itineraries.filter((t) => t.is_active !== false).length;
  }, [itineraries]);

  // Handle Save
  const handleSaveTour = async (payload: Partial<ItineraryRecord>) => {
    setSaving(true);
    try {
      const isEdit = Boolean(editingTour);
      const method = isEdit ? 'PUT' : 'POST';
      const url = '/api/v1/admin/itineraries';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          id: editingTour?.itinerary_id || editingTour?.id,
          itinerary_id: editingTour?.itinerary_id || editingTour?.id,
        }),
      });

      if (res.ok) {
        setStatusMsg(isEdit ? 'Đã cập nhật lịch trình thành công!' : 'Đã tạo lịch trình mới thành công!');
        setTimeout(() => setStatusMsg(null), 3000);
        setIsAddingNew(false);
        setEditingTour(null);
        await fetchItineraries();
      } else {
        const err = await res.json();
        alert(`Lỗi lưu lịch trình: ${err.error || 'Vui lòng thử lại'}`);
      }
    } catch (e: any) {
      alert(`Lỗi hệ thống: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Handle Delete
  const handleDeleteTour = async (tourId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa lịch trình này khỏi cơ sở dữ liệu Supabase?')) return;
    try {
      const res = await fetch(`/api/v1/admin/itineraries?id=${tourId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setStatusMsg('Đã xóa lịch trình thành công!');
        setTimeout(() => setStatusMsg(null), 3000);
        await fetchItineraries();
      }
    } catch (e: any) {
      alert(`Lỗi xóa: ${e.message}`);
    }
  };

  // Handle Toggle Active
  const handleToggleActive = async (tour: ItineraryRecord) => {
    const nextActive = tour.is_active === false ? true : false;
    try {
      await fetch('/api/v1/admin/itineraries', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: tour.itinerary_id || tour.id,
          is_active: nextActive,
        }),
      });
      setItineraries((prev) =>
        prev.map((t) => ((t.itinerary_id || t.id) === (tour.itinerary_id || tour.id) ? { ...t, is_active: nextActive } : t))
      );
    } catch (e) {
      console.error('Toggle active error:', e);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-body">
      {/* 1. Header & KPI Stats */}
      <ItineraryStatsHeader
        totalCount={itineraries.length}
        activeCount={activeCount}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onAddNew={() => {
          setEditingTour(null);
          setIsAddingNew(true);
        }}
        onRefresh={fetchItineraries}
        loading={loading}
      />

      {/* Success Notification Toast */}
      {statusMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
          ✓ {statusMsg}
        </div>
      )}

      {/* 2. Itineraries List Table */}
      <ItineraryListTable
        itineraries={filteredItineraries}
        onEdit={(tour) => {
          setEditingTour(tour);
          setIsAddingNew(true);
        }}
        onDelete={handleDeleteTour}
        onToggleActive={handleToggleActive}
      />

      {/* 3. Form Modal for Create & Edit */}
      {isAddingNew && (
        <ItineraryFormModal
          initialTour={editingTour}
          places={places}
          onClose={() => {
            setIsAddingNew(false);
            setEditingTour(null);
          }}
          onSave={handleSaveTour}
          saving={saving}
        />
      )}
    </div>
  );
}
