'use client';

import React from 'react';
import { 
  Brain, Plus, Search, RefreshCw, Utensils, 
  MapPin, Calendar, Compass, AlertTriangle, FileText 
} from 'lucide-react';

export const KNOWLEDGE_CATEGORIES = [
  { key: 'all', label: 'Tất Cả', icon: Brain, color: 'bg-slate-100 text-slate-700 border-slate-200' },
  { key: 'food', label: 'Ẩm Thực', icon: Utensils, color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { key: 'place', label: 'Địa Điểm & Chùa', icon: MapPin, color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { key: 'festival', label: 'Lễ Hội', icon: Calendar, color: 'bg-rose-100 text-rose-800 border-rose-200' },
  { key: 'transport', label: 'Giao Thông', icon: Compass, color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { key: 'emergency', label: 'Cứu Hộ / SOS', icon: AlertTriangle, color: 'bg-red-100 text-red-800 border-red-200' },
  { key: 'general', label: 'Lưu Ý Chung', icon: FileText, color: 'bg-purple-100 text-purple-800 border-purple-200' },
];

interface KnowledgeStatsBarProps {
  totalCount: number;
  activeCount: number;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onAddNew: () => void;
  onRefresh: () => void;
  loading: boolean;
}

export default function KnowledgeStatsBar({
  totalCount,
  activeCount,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  onAddNew,
  onRefresh,
  loading,
}: KnowledgeStatsBarProps) {
  return (
    <div className="space-y-4 font-body">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-[#FFFDF7] border border-[#26221B]/10 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#0E8C7F] uppercase tracking-wider font-display">
            <Brain className="w-4 h-4 text-[#0E8C7F]" />
            <span>AI RAG Knowledge Base Management</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#26221B] font-display mt-1">
            Cơ Sở Tri Thức & Cẩm Nang AI (Knowledge Base)
          </h1>
          <p className="text-xs text-[#6B6355] mt-0.5">
            Quản trị ngữ cảnh chuyên sâu, sự tích, quy chuẩn và kiến thức thực địa cho Trợ lý Du Lịch AI.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2.5 rounded-2xl bg-[#FAF3E7] hover:bg-[#EBE1D0] text-[#26221B] border border-[#26221B]/10 transition-colors cursor-pointer"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={onAddNew}
            className="px-4 py-2.5 rounded-2xl bg-[#0E8C7F] hover:bg-[#085A52] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer font-display"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Tri Thức Mới</span>
          </button>
        </div>
      </div>

      {/* Category Pills & Search */}
      <div className="bg-[#FFFDF7] p-4 rounded-3xl border border-[#26221B]/8 shadow-xs space-y-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none font-display">
          {KNOWLEDGE_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  isSelected
                    ? 'bg-[#0E8C7F] text-white shadow-2xs'
                    : 'bg-[#FAF3E7] text-[#6B6355] hover:bg-[#FAF3E7]/80 border border-[#26221B]/8'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative pt-2 border-t border-[#26221B]/6">
          <Search className="w-4 h-4 text-[#6B6355] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm theo tiêu đề, từ khóa keywords, nội dung tri thức..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#FAF3E7] border border-[#26221B]/10 text-xs text-[#26221B] placeholder-[#6B6355]/70 focus:outline-none focus:border-[#0E8C7F]"
          />
        </div>
      </div>
    </div>
  );
}
