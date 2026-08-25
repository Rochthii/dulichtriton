'use client';

import React, { useState } from 'react';
import { X, Save, Sparkles } from 'lucide-react';
import { KnowledgeItem } from './KnowledgeTable';
import { KNOWLEDGE_CATEGORIES } from './KnowledgeStatsBar';
import { RichTextRenderer } from '@/components/RichTextRenderer';

interface KnowledgeModalProps {
  initialItem?: KnowledgeItem | null;
  onClose: () => void;
  onSave: (payload: Partial<KnowledgeItem>) => Promise<void>;
  saving: boolean;
}

export default function KnowledgeModal({
  initialItem,
  onClose,
  onSave,
  saving,
}: KnowledgeModalProps) {
  const [title, setTitle] = useState(initialItem?.title || '');
  const [category, setCategory] = useState<KnowledgeItem['category']>(initialItem?.category || 'food');
  const [keywords, setKeywords] = useState((initialItem?.keywords || []).join(', '));
  const [content, setContent] = useState(initialItem?.content || '');
  const [priority, setPriority] = useState(initialItem?.priority ?? 8);
  const [isActive, setIsActive] = useState(initialItem?.is_active ?? true);
  const [author, setAuthor] = useState(initialItem?.author || 'Admin');
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const kwArray = keywords
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    await onSave({
      id: initialItem?.id,
      title: title.trim(),
      category,
      keywords: kwArray,
      content: content.trim(),
      priority: Number(priority),
      is_active: isActive,
      author: author.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#FFFDF7] rounded-3xl max-w-2xl w-full border border-[#26221B]/10 shadow-2xl overflow-hidden my-6 font-body flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#FAF3E7] border-b border-[#26221B]/10 flex items-center justify-between font-display shrink-0">
          <div>
            <span className="text-[11px] font-bold text-[#0E8C7F] uppercase tracking-wider">
              {initialItem ? 'Chỉnh Sửa Tri Thức' : 'Thêm Tri Thức AI Mới'}
            </span>
            <h2 className="text-base sm:text-lg font-black text-[#26221B]">
              {title || 'Soạn Thảo Ngữ Cảnh Tri Thức'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#6B6355] hover:text-[#26221B] hover:bg-black/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#26221B] block mb-1">Tiêu Đề Tri Thức:</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Quy tắc gọi gà đốt Ô Thum trước 45 phút"
                className="w-full p-2.5 rounded-xl bg-[#FAF3E7] border border-[#26221B]/10 text-xs focus:outline-none focus:border-[#0E8C7F]"
              />
            </div>

            <div>
              <label className="font-bold text-[#26221B] block mb-1">Danh Mục:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full p-2.5 rounded-xl bg-[#FAF3E7] border border-[#26221B]/10 text-xs focus:outline-none focus:border-[#0E8C7F]"
              >
                {KNOWLEDGE_CATEGORIES.filter((c) => c.key !== 'all').map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-[#26221B] block mb-1">
              Từ Khóa Nhận Diện (Keywords, phân cách bằng dấu phẩy):
            </label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="gà đốt, ô thum, đặt gà, thời gian nấu..."
              className="w-full p-2.5 rounded-xl bg-[#FAF3E7] border border-[#26221B]/10 text-xs focus:outline-none focus:border-[#0E8C7F]"
            />
          </div>

          {/* Content Tabs (Edit / Preview) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between font-display">
              <label className="font-bold text-[#26221B]">Nội Dung Tri Thức (Markdown / Văn Bản):</label>
              <div className="flex items-center gap-1 bg-[#FAF3E7] p-0.5 rounded-lg border border-[#26221B]/6">
                <button
                  type="button"
                  onClick={() => setActiveTab('edit')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                    activeTab === 'edit' ? 'bg-[#0E8C7F] text-white shadow-2xs' : 'text-[#6B6355]'
                  }`}
                >
                  Soạn Thảo
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                    activeTab === 'preview' ? 'bg-[#0E8C7F] text-white shadow-2xs' : 'text-[#6B6355]'
                  }`}
                >
                  Xem Trước
                </button>
              </div>
            </div>

            {activeTab === 'edit' ? (
              <textarea
                rows={6}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Nhập nội dung cẩm nang, sự tích hoặc câu trả lời chuẩn xác cho AI..."
                className="w-full p-3 rounded-xl bg-[#FAF3E7] border border-[#26221B]/10 text-xs leading-relaxed focus:outline-none focus:border-[#0E8C7F]"
              />
            ) : (
              <div className="p-3 rounded-xl bg-white border border-[#26221B]/10 min-h-[140px] leading-relaxed">
                <RichTextRenderer content={content || '*Chưa có nội dung xem trước*'} />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="font-bold text-[#26221B] block mb-1">
                Độ Ưu Tiên AI (1 - 10): <span className="font-mono text-[#0E8C7F]">{priority}/10</span>
              </label>
              <input
                type="range"
                min={1}
                max={10}
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
                className="w-full accent-[#0E8C7F] cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-2 pt-4">
              <input
                type="checkbox"
                id="kb-active"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 accent-[#0E8C7F] cursor-pointer"
              />
              <label htmlFor="kb-active" className="font-bold text-[#26221B] cursor-pointer">
                Kích hoạt ngay cho AI RAG
              </label>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-[#26221B]/10 flex items-center justify-end gap-2 font-display">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#FAF3E7] hover:bg-[#EBE1D0] text-[#26221B] font-bold cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-[#0E8C7F] hover:bg-[#085A52] text-white font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Đang lưu...' : 'Lưu Tri Thức'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
