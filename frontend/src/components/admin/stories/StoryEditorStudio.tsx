'use client';

import React, { useState } from 'react';
import { Save, Wand2, Eye, Edit3, Columns, ExternalLink, Sparkles } from 'lucide-react';
import { RichTextRenderer } from '@/components/RichTextRenderer';
import { formatDetailedStory } from '@/lib/storyFormatter';
import { PlaceItem } from './StoryPlaceList';

interface StoryEditorStudioProps {
  selectedPlace: PlaceItem | null;
  storyContent: string;
  setStoryContent: (content: string) => void;
  onSave: () => Promise<void>;
  isSaving: boolean;
}

export default function StoryEditorStudio({
  selectedPlace,
  storyContent,
  setStoryContent,
  onSave,
  isSaving,
}: StoryEditorStudioProps) {
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');

  if (!selectedPlace) {
    return (
      <div className="p-12 text-center text-xs text-[#6B6355] bg-[#FFFDF7] rounded-3xl border border-[#26221B]/8">
        Hãy chọn một địa điểm ở danh sách bên trái để bắt đầu biên tập.
      </div>
    );
  }

  const handleFormat = () => {
    const formatted = formatDetailedStory(storyContent, selectedPlace.name);
    setStoryContent(formatted);
  };

  return (
    <div className="bg-[#FFFDF7] rounded-3xl border border-[#26221B]/10 overflow-hidden shadow-xs font-body flex flex-col max-h-[680px]">
      {/* Studio Header */}
      <div className="p-4 bg-[#FAF3E7] border-b border-[#26221B]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-display">
        <div>
          <span className="text-[11px] font-bold text-[#0E8C7F] uppercase tracking-wider block">
            {selectedPlace.commune} • {selectedPlace.tourism_category || selectedPlace.category}
          </span>
          <h2 className="text-base font-black text-[#26221B]">{selectedPlace.name}</h2>
        </div>

        {/* View Mode & Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white p-0.5 rounded-xl border border-[#26221B]/10">
            <button
              onClick={() => setViewMode('split')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'split' ? 'bg-[#0E8C7F] text-white shadow-2xs' : 'text-[#6B6355]'
              }`}
              title="Song song 2 cột"
            >
              <Columns className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('edit')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'edit' ? 'bg-[#0E8C7F] text-white shadow-2xs' : 'text-[#6B6355]'
              }`}
              title="Chỉ soạn thảo"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'preview' ? 'bg-[#0E8C7F] text-white shadow-2xs' : 'text-[#6B6355]'
              }`}
              title="Chỉ xem trước"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleFormat}
            className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
            title="Tự động chuẩn hóa dấu câu và bố cục"
          >
            <Wand2 className="w-3.5 h-3.5 text-amber-700" />
            <span className="hidden sm:inline">Format</span>
          </button>

          <button
            onClick={onSave}
            disabled={isSaving}
            className="px-4 py-1.5 rounded-xl bg-[#0E8C7F] hover:bg-[#085A52] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Đang lưu...' : 'Lưu Sự Tích'}</span>
          </button>
        </div>
      </div>

      {/* Editor / Preview Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {viewMode === 'split' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
            <textarea
              rows={16}
              value={storyContent}
              onChange={(e) => setStoryContent(e.target.value)}
              placeholder="Nhập nội dung sự tích lịch sử, truyền thuyết và cẩm nang văn hóa..."
              className="w-full h-full p-3 rounded-2xl bg-[#FAF3E7] border border-[#26221B]/10 text-xs leading-relaxed font-mono focus:outline-none focus:border-[#0E8C7F] resize-none"
            />
            <div className="p-4 rounded-2xl bg-white border border-[#26221B]/10 overflow-y-auto max-h-[500px] text-xs leading-relaxed">
              <RichTextRenderer content={storyContent || '*Chưa có nội dung xem trước*'} />
            </div>
          </div>
        )}

        {viewMode === 'edit' && (
          <textarea
            rows={18}
            value={storyContent}
            onChange={(e) => setStoryContent(e.target.value)}
            placeholder="Nhập nội dung sự tích lịch sử, truyền thuyết và cẩm nang văn hóa..."
            className="w-full p-4 rounded-2xl bg-[#FAF3E7] border border-[#26221B]/10 text-xs leading-relaxed font-mono focus:outline-none focus:border-[#0E8C7F]"
          />
        )}

        {viewMode === 'preview' && (
          <div className="p-6 rounded-2xl bg-white border border-[#26221B]/10 max-w-2xl mx-auto text-xs leading-relaxed">
            <RichTextRenderer content={storyContent || '*Chưa có nội dung xem trước*'} />
          </div>
        )}
      </div>
    </div>
  );
}
