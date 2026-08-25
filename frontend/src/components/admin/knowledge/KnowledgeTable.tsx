'use client';

import React from 'react';
import { Edit3, Trash2, Tag, CheckCircle2, XCircle } from 'lucide-react';
import { KNOWLEDGE_CATEGORIES } from './KnowledgeStatsBar';

export interface KnowledgeItem {
  id: string;
  title: string;
  category: 'food' | 'place' | 'festival' | 'transport' | 'emergency' | 'general';
  keywords: string[];
  content: string;
  is_active: boolean;
  priority: number;
  author: string;
  created_at: string;
  updated_at: string;
}

interface KnowledgeTableProps {
  items: KnowledgeItem[];
  onEdit: (item: KnowledgeItem) => void;
  onDelete: (id: string) => void;
  onToggleActive: (item: KnowledgeItem) => void;
}

export default function KnowledgeTable({
  items,
  onEdit,
  onDelete,
  onToggleActive,
}: KnowledgeTableProps) {
  if (items.length === 0) {
    return (
      <div className="py-16 text-center bg-[#FFFDF7] rounded-3xl border border-[#26221B]/8 p-8 space-y-2 font-body">
        <p className="text-sm font-bold text-[#26221B]">Không tìm thấy tri thức nào phù hợp.</p>
        <p className="text-xs text-[#6B6355]">Hãy thêm tri thức mới hoặc thay đổi bộ lọc tìm kiếm.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#FFFDF7] rounded-3xl border border-[#26221B]/10 overflow-hidden shadow-xs font-body">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#FAF3E7] border-b border-[#26221B]/10 text-[#26221B] font-display font-bold">
            <tr>
              <th className="p-3.5 pl-5">STT</th>
              <th className="p-3.5">Tiêu Đề Tri Thức</th>
              <th className="p-3.5">Danh Mục</th>
              <th className="p-3.5">Từ Khóa (Keywords)</th>
              <th className="p-3.5 text-center">Độ Ưu Tiên</th>
              <th className="p-3.5 text-center">Trạng Thái</th>
              <th className="p-3.5 pr-5 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#26221B]/6">
            {items.map((item, idx) => {
              const catDef = KNOWLEDGE_CATEGORIES.find((c) => c.key === item.category) || KNOWLEDGE_CATEGORIES[0];
              return (
                <tr key={item.id || idx} className="hover:bg-[#FAF3E7]/40 transition-colors">
                  <td className="p-3.5 pl-5 font-mono text-[#6B6355] font-bold">
                    #{idx + 1}
                  </td>
                  <td className="p-3.5 max-w-xs">
                    <span className="font-display font-bold text-sm text-[#26221B] block line-clamp-1">
                      {item.title}
                    </span>
                    <span className="text-[11px] text-[#6B6355] line-clamp-1 mt-0.5">
                      {item.content}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${catDef.color} inline-block font-display`}>
                      {catDef.label}
                    </span>
                  </td>
                  <td className="p-3.5 max-w-xs">
                    <div className="flex flex-wrap gap-1">
                      {(item.keywords || []).slice(0, 4).map((kw, kx) => (
                        <span key={kx} className="px-1.5 py-0.5 rounded-md bg-[#FAF3E7] text-[10px] text-[#6B6355] border border-[#26221B]/6">
                          {kw}
                        </span>
                      ))}
                      {(item.keywords || []).length > 4 && (
                        <span className="text-[10px] text-[#6B6355] font-mono">
                          +{item.keywords.length - 4}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3.5 text-center font-mono font-bold text-[#0E8C7F]">
                    {item.priority || 5}/10
                  </td>
                  <td className="p-3.5 text-center">
                    <button
                      onClick={() => onToggleActive(item)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-all ${
                        item.is_active
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                      }`}
                    >
                      {item.is_active ? 'Kích hoạt' : 'Tạm tắt'}
                    </button>
                  </td>
                  <td className="p-3.5 pr-5 text-right space-x-1.5 font-display">
                    <button
                      onClick={() => onEdit(item)}
                      className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#0E8C7F] transition-colors cursor-pointer"
                      title="Chỉnh sửa tri thức"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(item.id)}
                      className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                      title="Xóa tri thức"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
