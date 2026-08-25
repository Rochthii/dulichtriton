'use client';

import React, { useState, useEffect, useMemo } from 'react';
import StoryStatsHeader from '@/components/admin/stories/StoryStatsHeader';
import StoryPlaceList, { PlaceItem } from '@/components/admin/stories/StoryPlaceList';
import StoryEditorStudio from '@/components/admin/stories/StoryEditorStudio';
import localMasterPois from '@/data/triton_pois_full.json';
import { formatDetailedStory } from '@/lib/storyFormatter';

export default function AdminStoriesPage() {
  const [places, setPlaces] = useState<PlaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string>('');
  const [storyContent, setStoryContent] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'has_story' | 'no_story'>('all');
  const [isSaving, setIsSaving] = useState(false);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const loadPlaces = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/admin/places');
      const json = await res.json();
      if (json.success && Array.isArray(json.places) && json.places.length > 0) {
        const merged = json.places.map((p: any) => {
          const local = (localMasterPois as any[]).find(
            (lp) => lp.id === p.id || lp.slug === p.slug || lp.name === p.name
          );
          return {
            ...p,
            detailed_story: p.detailed_story || local?.detailed_story || '',
          };
        });
        setPlaces(merged);
        if (merged.length > 0) {
          setSelectedPlaceId(merged[0].id);
          setStoryContent(merged[0].detailed_story || '');
        }
      } else {
        fallbackLocal();
      }
    } catch {
      fallbackLocal();
    } finally {
      setLoading(false);
    }
  };

  function fallbackLocal() {
    const fallbackList = localMasterPois as any[];
    setPlaces(fallbackList);
    if (fallbackList.length > 0) {
      setSelectedPlaceId(fallbackList[0].id);
      setStoryContent(fallbackList[0].detailed_story || '');
    }
  }

  useEffect(() => {
    loadPlaces();
  }, []);

  const selectedPlace = useMemo(() => {
    return places.find((p) => p.id === selectedPlaceId) || null;
  }, [places, selectedPlaceId]);

  const handleSelectPlace = (place: PlaceItem) => {
    setSelectedPlaceId(place.id);
    setStoryContent(place.detailed_story || '');
  };

  const handleSave = async () => {
    if (!selectedPlace) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/v1/admin/places', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedPlace.id,
          detailed_story: storyContent,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Đã lưu sự tích cho ${selectedPlace.name} thành công!`);
        setPlaces((prev) =>
          prev.map((p) => (p.id === selectedPlace.id ? { ...p, detailed_story: storyContent } : p))
        );
      } else {
        showToast(data.error || 'Lỗi khi lưu sự tích', 'error');
      }
    } catch (e: any) {
      showToast('Lỗi: ' + e.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBatchFormat = () => {
    setIsBatchProcessing(true);
    try {
      const updated = places.map((p) => {
        if (p.detailed_story && p.detailed_story.length > 20) {
          return {
            ...p,
            detailed_story: formatDetailedStory(p.detailed_story, p.name),
          };
        }
        return p;
      });
      setPlaces(updated);
      if (selectedPlace) {
        setStoryContent(formatDetailedStory(storyContent, selectedPlace.name));
      }
      showToast('Đã chuẩn hóa định dạng typography cho toàn bộ danh sách!');
    } finally {
      setIsBatchProcessing(false);
    }
  };

  const filteredPlaces = useMemo(() => {
    return places.filter((p) => {
      const hasStory = !!(p.detailed_story && p.detailed_story.trim().length > 20);
      if (filterType === 'has_story' && !hasStory) return false;
      if (filterType === 'no_story' && hasStory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (p.name || '').toLowerCase().includes(q);
        const matchCommune = (p.commune || '').toLowerCase().includes(q);
        return matchName || matchCommune;
      }
      return true;
    });
  }, [places, filterType, searchQuery]);

  const hasStoryCount = useMemo(() => {
    return places.filter((p) => p.detailed_story && p.detailed_story.trim().length > 20).length;
  }, [places]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-body">
      {/* 1. Header & Filters */}
      <StoryStatsHeader
        totalCount={places.length}
        hasStoryCount={hasStoryCount}
        filterType={filterType}
        setFilterType={setFilterType}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onRefresh={loadPlaces}
        loading={loading}
        onBatchFormat={handleBatchFormat}
        isBatchProcessing={isBatchProcessing}
      />

      {/* Toast Alert */}
      {toastMsg && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-bold border transition-all ${
            toastMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {toastMsg.type === 'success' ? '✓' : '✕'} {toastMsg.text}
        </div>
      )}

      {/* 2. Studio Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        {/* Left: Place Selector */}
        <div className="lg:col-span-1">
          <StoryPlaceList
            places={filteredPlaces}
            selectedPlaceId={selectedPlaceId}
            onSelectPlace={handleSelectPlace}
          />
        </div>

        {/* Right: Story Editor */}
        <div className="lg:col-span-2">
          <StoryEditorStudio
            selectedPlace={selectedPlace}
            storyContent={storyContent}
            setStoryContent={setStoryContent}
            onSave={handleSave}
            isSaving={isSaving}
          />
        </div>
      </div>
    </div>
  );
}
