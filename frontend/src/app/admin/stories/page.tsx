'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Search,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Save,
  Wand2,
  Eye,
  Edit3,
  Columns,
  RefreshCw,
  Layers,
  MapPin,
  FileText,
  Clock,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { RichTextRenderer } from '@/components/RichTextRenderer';
import { formatDetailedStory } from '@/lib/storyFormatter';
import localMasterPois from '@/data/triton_pois_full.json';

interface PlaceItem {
  id: string;
  slug: string;
  name: string;
  commune: string;
  category: string;
  tourism_category?: string;
  detailed_story?: string;
  description?: string;
  rating?: number;
  image_url?: string;
}

export default function AdminStoriesPage() {
  const [places, setPlaces] = useState<PlaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string>('');
  const [storyContent, setStoryContent] = useState<string>('');
  const [originalStoryContent, setOriginalStoryContent] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'has_story' | 'no_story'>('all');
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [batchStatus, setBatchStatus] = useState<string | null>(null);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);

  // Load places from API or local fallback
  useEffect(() => {
    async function loadPlaces() {
      try {
        setLoading(true);
        const res = await fetch('/api/v1/admin/places');
        const json = await res.json();
        if (json.success && Array.isArray(json.places) && json.places.length > 0) {
          // Merge with localMasterPois to guarantee full stories
          const merged = json.places.map((p: any) => {
            const local = (localMasterPois as any[]).find(
              lp => lp.id === p.id || lp.slug === p.slug || lp.name === p.name
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
            setOriginalStoryContent(merged[0].detailed_story || '');
          }
        } else {
          fallbackLocal();
        }
      } catch (err) {
        console.warn('Error loading places:', err);
        fallbackLocal();
      } finally {
        setLoading(false);
      }
    }

    function fallbackLocal() {
      const fallbackList = localMasterPois as any[];
      setPlaces(fallbackList);
      if (fallbackList.length > 0) {
        setSelectedPlaceId(fallbackList[0].id);
        setStoryContent(fallbackList[0].detailed_story || '');
        setOriginalStoryContent(fallbackList[0].detailed_story || '');
      }
    }

    loadPlaces();
  }, []);

  const selectedPlace = useMemo(() => {
    return places.find(p => p.id === selectedPlaceId) || null;
  }, [places, selectedPlaceId]);

  const handleSelectPlace = (place: PlaceItem) => {
    setSelectedPlaceId(place.id);
    const content = place.detailed_story || '';
    setStoryContent(content);
    setOriginalStoryContent(content);
    setSaveStatus('idle');
  };

  const filteredPlaces = useMemo(() => {
    return places.filter(p => {
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.commune.toLowerCase().includes(q) ||
        (p.category && p.category.toLowerCase().includes(q));

      const hasStory = Boolean(p.detailed_story && p.detailed_story.trim().length > 100);
      if (filterType === 'has_story' && !hasStory) return false;
      if (filterType === 'no_story' && hasStory) return false;

      return matchQuery;
    });
  }, [places, searchQuery, filterType]);

  // Format single story with algorithm
  const handleAutoFormatCurrent = () => {
    if (!storyContent) return;
    const formatted = formatDetailedStory(storyContent);
    setStoryContent(formatted);
  };

  // Insert snippet helper
  const handleInsertSnippet = (snippet: string) => {
    setStoryContent(prev => prev + '\n\n' + snippet);
  };

  // Save single story
  const handleSaveCurrent = async () => {
    if (!selectedPlace) return;
    setIsSaving(true);
    setSaveStatus('idle');

    try {
      const res = await fetch('/api/v1/admin/places', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedPlace.id,
          detailed_story: storyContent,
        }),
      });

      const json = await res.json();
      if (json.success || res.ok) {
        setSaveStatus('success');
        setOriginalStoryContent(storyContent);

        // Update local state
        setPlaces(prev =>
          prev.map(p => (p.id === selectedPlace.id ? { ...p, detailed_story: storyContent } : p))
        );

        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
      }
    } catch (err) {
      console.error('Save error:', err);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  // Batch auto-format all places
  const handleBatchFormatAll = async () => {
    if (
      !confirm(
        'Bạn có chắc chắn muốn TỰ ĐỘNG CĂN CHỈNH TOÀN BỘ bài viết của 155 địa điểm theo chuẩn Typography Bảy Núi?'
      )
    ) {
      return;
    }

    setIsBatchProcessing(true);
    setBatchStatus('Đang chuẩn hóa và đồng bộ 155 địa điểm lên Supabase...');

    try {
      let count = 0;
      for (const p of places) {
        if (p.detailed_story && p.detailed_story.length > 50) {
          const formatted = formatDetailedStory(p.detailed_story);
          if (formatted !== p.detailed_story) {
            await fetch('/api/v1/admin/places', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: p.id,
                detailed_story: formatted,
              }),
            });
            count++;
          }
        }
      }

      setBatchStatus(`🎉 Đã căn chỉnh và cập nhật thành công ${count} bài viết!`);
      // Update active selection
      if (selectedPlace) {
        setStoryContent(formatDetailedStory(storyContent));
      }
    } catch (err) {
      console.error('Batch error:', err);
      setBatchStatus('Lỗi trong quá trình cập nhật hàng loạt.');
    } finally {
      setIsBatchProcessing(false);
    }
  };

  const isDirty = storyContent !== originalStoryContent;

  return (
    <div className="space-y-6">
      {/* ── TOP HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-700 flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Studio Quản Lý Bài Viết & Typography
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Biên tập, căn chỉnh bố cục và chuẩn hóa định dạng Markdown cho 155 địa điểm du lịch Tri Tôn.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBatchFormatAll}
            disabled={isBatchProcessing}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            <Zap className="w-4 h-4 fill-slate-950" />
            <span>{isBatchProcessing ? 'Đang xử lý...' : '⚡ Căn Chỉnh Toàn Bộ 155 Địa Điểm'}</span>
          </button>
        </div>
      </div>

      {batchStatus && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between animate-in fade-in">
          <span>{batchStatus}</span>
          <button
            type="button"
            onClick={() => setBatchStatus(null)}
            className="text-emerald-600 hover:text-emerald-900"
          >
            Đóng
          </button>
        </div>
      )}

      {/* ── WORKSPACE 2-COLUMN PRO STUDIO ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── LEFT COLUMN: PLACE SELECTOR & SEARCH (4 COLS) ── */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[780px]">
          <div className="p-4 border-b border-slate-200 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm địa điểm, xã, ẩm thực..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filterType === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tất cả ({places.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('has_story')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filterType === 'has_story'
                    ? 'bg-teal-700 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Đã có bài ({places.filter(p => (p.detailed_story || '').length > 100).length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('no_story')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filterType === 'no_story'
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Chưa có ({places.filter(p => (p.detailed_story || '').length <= 100).length})
              </button>
            </div>
          </div>

          {/* Place List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin">
            {loading ? (
              <div className="py-12 text-center text-xs text-slate-400 font-medium">
                Đang tải danh sách địa điểm...
              </div>
            ) : filteredPlaces.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 font-medium">
                Không tìm thấy địa điểm phù hợp
              </div>
            ) : (
              filteredPlaces.map(p => {
                const isSelected = p.id === selectedPlaceId;
                const storyLen = (p.detailed_story || '').length;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPlace(p)}
                    className={`w-full text-left p-3 rounded-xl transition-all flex flex-col gap-1 border ${
                      isSelected
                        ? 'bg-teal-50 border-teal-600 shadow-xs'
                        : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-xs font-bold truncate ${
                          isSelected ? 'text-teal-900' : 'text-slate-900'
                        }`}
                      >
                        {p.name}
                      </span>
                      {storyLen > 200 ? (
                        <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                          {storyLen} ký tự
                        </span>
                      ) : (
                        <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                          Chưa có
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{p.commune}</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {p.slug || p.id}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN: STUDIO EDITOR & LIVE PREVIEW (8 COLS) ── */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[780px]">
          {selectedPlace ? (
            <>
              {/* Studio Header Bar */}
              <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60 rounded-t-2xl">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                      {selectedPlace.name}
                    </h2>
                    <a
                      href={`/places/${selectedPlace.slug || selectedPlace.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-700 hover:text-teal-900 flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-teal-50 border border-teal-200"
                      title="Xem trang thực tế trên Web"
                    >
                      <span>Xem trên Web</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {selectedPlace.commune} • {storyContent.length} ký tự •{' '}
                    {storyContent.split(/\s+/).filter(Boolean).length} từ
                  </p>
                </div>

                {/* View Mode Switcher */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-slate-200/80 p-1 rounded-xl text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setViewMode('split')}
                      className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all ${
                        viewMode === 'split' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                      }`}
                    >
                      <Columns className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Song song</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('edit')}
                      className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all ${
                        viewMode === 'edit' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                      }`}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Soạn thảo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('preview')}
                      className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all ${
                        viewMode === 'preview' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Xem trước</span>
                    </button>
                  </div>

                  {/* Save Button */}
                  <button
                    type="button"
                    onClick={handleSaveCurrent}
                    disabled={isSaving || !isDirty}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all ${
                      isDirty
                        ? 'bg-teal-700 hover:bg-teal-800 text-white active:scale-95 cursor-pointer'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Đang lưu...' : 'Lưu Thay Đổi'}</span>
                  </button>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="px-4 py-2 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[11px] font-bold bg-white">
                <button
                  type="button"
                  onClick={handleAutoFormatCurrent}
                  className="px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 flex items-center gap-1.5 shrink-0 transition-all"
                  title="Tự động sửa thụt dòng, đánh số tiêu đề và định dạng nhãn in đậm"
                >
                  <Wand2 className="w-3.5 h-3.5 text-teal-700" />
                  <span>🪄 Tự Động Căn Chỉnh Typography</span>
                </button>

                <div className="h-4 w-px bg-slate-200 mx-1 shrink-0" />

                <button
                  type="button"
                  onClick={() => handleInsertSnippet('### 1. Tiêu Đề Mục Mới\n\nNội dung mô tả chi tiết tại đây...')}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 shrink-0"
                >
                  + Tiêu Đề (H3)
                </button>

                <button
                  type="button"
                  onClick={() => handleInsertSnippet('- **Vị trí & Cách đi:** Hướng dẫn đường đi thực tế...')}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 shrink-0"
                >
                  + Nhãn In Đậm (- **...:**)
                </button>

                <button
                  type="button"
                  onClick={() => handleInsertSnippet('- **Lưu ý an toàn:** Đường đèo dốc quanh co, cần đi số thấp và kiểm tra phanh.')}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 shrink-0"
                >
                  + Lưu Ý An Toàn
                </button>

                <button
                  type="button"
                  onClick={() => handleInsertSnippet('- **Góc sống ảo đẹp nhất:** Thời điểm hoàng hôn 16:30 - 17:30 chụp ngược sáng.')}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 shrink-0"
                >
                  + Góc Check-in
                </button>
              </div>

              {/* Editor & Preview Panes */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 overflow-hidden">
                {/* Editor Pane */}
                {(viewMode === 'split' || viewMode === 'edit') && (
                  <div
                    className={`flex flex-col border-r border-slate-200 h-full ${
                      viewMode === 'edit' ? 'col-span-2 md:col-span-2' : ''
                    }`}
                  >
                    <textarea
                      value={storyContent}
                      onChange={e => setStoryContent(e.target.value)}
                      placeholder="Nhập toàn văn bài viết chi tiết theo định dạng Markdown (### Tiêu đề, - **Nhãn:** nội dung...)"
                      className="w-full flex-1 p-4 text-xs font-mono text-slate-800 leading-relaxed resize-none focus:outline-none bg-slate-50/30"
                    />
                  </div>
                )}

                {/* Live Preview Pane */}
                {(viewMode === 'split' || viewMode === 'preview') && (
                  <div
                    className={`p-6 overflow-y-auto bg-[#FAF3E7] h-full ${
                      viewMode === 'preview' ? 'col-span-2 md:col-span-2' : ''
                    }`}
                  >
                    <div className="bg-[#FFFDF7] rounded-[24px] p-6 border border-[#26221B]/8 shadow-sm space-y-4">
                      <div className="flex items-center gap-2 border-b border-[#26221B]/6 pb-3">
                        <Sparkles className="w-5 h-5 text-[#0E8C7F]" />
                        <h3 className="font-display text-base font-bold text-[#26221B]">
                          Xem Trước Thực Tế (Giao Diện Khách Du Lịch)
                        </h3>
                      </div>
                      <RichTextRenderer content={storyContent} />
                    </div>
                  </div>
                )}
              </div>

              {/* Status Footer */}
              <div className="p-3 border-t border-slate-200 flex items-center justify-between text-xs bg-slate-50 text-slate-600">
                <div className="flex items-center gap-2">
                  {saveStatus === 'success' && (
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Đã lưu thành công vào Supabase!
                    </span>
                  )}
                  {saveStatus === 'error' && (
                    <span className="text-rose-600 font-bold flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> Lỗi khi lưu dữ liệu!
                    </span>
                  )}
                  {saveStatus === 'idle' && isDirty && (
                    <span className="text-amber-600 font-bold">● Có thay đổi chưa lưu</span>
                  )}
                  {saveStatus === 'idle' && !isDirty && (
                    <span className="text-slate-400">Đã đồng bộ với CSDL</span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400">
                  Tự động căn chỉnh & chuẩn hóa bởi Antigravity Engine
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-xs font-medium">
              Vui lòng chọn một địa điểm từ danh sách bên trái
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
