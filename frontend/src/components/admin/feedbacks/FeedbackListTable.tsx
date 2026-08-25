'use client';

import React from 'react';
import { Eye, Mail, Phone, Calendar, Star, MessageSquare } from 'lucide-react';
import { FEEDBACK_CATEGORIES } from './FeedbackStatsHeader';

export interface FeedbackItem {
  id: string;
  name: string;
  email: string;
  phone?: string;
  category: string;
  subject?: string;
  message: string;
  rating?: number;
  status: 'pending' | 'reviewed' | 'resolved';
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface FeedbackListTableProps {
  feedbacks: FeedbackItem[];
  onSelectFeedback: (item: FeedbackItem) => void;
}

export default function FeedbackListTable({
  feedbacks,
  onSelectFeedback,
}: FeedbackListTableProps) {
  if (feedbacks.length === 0) {
    return (
      <div className="py-16 text-center bg-[#FFFDF7] rounded-3xl border border-[#26221B]/8 p-8 space-y-2 font-body">
        <p className="text-sm font-bold text-[#26221B]">Không có phản hồi nào phù hợp với bộ lọc.</p>
        <p className="text-xs text-[#6B6355]">Hộp thư hiện đang trống hoặc chưa có đóng góp mới.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#FFFDF7] rounded-3xl border border-[#26221B]/10 overflow-hidden shadow-xs font-body">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#FAF3E7] border-b border-[#26221B]/10 text-[#26221B] font-display font-bold">
            <tr>
              <th className="p-3.5 pl-5">Người Gửi</th>
              <th className="p-3.5">Phân Loại</th>
              <th className="p-3.5">Nội Dung Đóng Góp</th>
              <th className="p-3.5">Thời Gian</th>
              <th className="p-3.5 text-center">Trạng Thái</th>
              <th className="p-3.5 pr-5 text-right">Chi Tiết</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#26221B]/6">
            {feedbacks.map((fb) => {
              const catLabel = FEEDBACK_CATEGORIES[fb.category] || fb.category || 'Góp ý';

              return (
                <tr key={fb.id} className="hover:bg-[#FAF3E7]/40 transition-colors">
                  <td className="p-3.5 pl-5 space-y-0.5">
                    <span className="font-display font-bold text-xs text-[#26221B] block">
                      {fb.name || 'Du khách ẩn danh'}
                    </span>
                    <div className="flex items-center gap-2 text-[10px] text-[#6B6355] font-mono">
                      {fb.phone && (
                        <span className="flex items-center gap-0.5">
                          <Phone className="w-2.5 h-2.5" />
                          <span>{fb.phone}</span>
                        </span>
                      )}
                      {fb.email && (
                        <span className="flex items-center gap-0.5">
                          <Mail className="w-2.5 h-2.5" />
                          <span className="truncate max-w-[100px]">{fb.email}</span>
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="p-3.5">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#FAF3E7] text-[#26221B] border border-[#26221B]/10 inline-block font-display">
                      {catLabel}
                    </span>
                  </td>

                  <td className="p-3.5 max-w-sm">
                    <p className="text-xs text-[#4A4336] line-clamp-2 leading-relaxed">
                      {fb.message}
                    </p>
                  </td>

                  <td className="p-3.5 text-[#6B6355] font-mono text-[11px] whitespace-nowrap">
                    {fb.created_at ? new Date(fb.created_at).toLocaleDateString('vi-VN') : 'Mới gửi'}
                  </td>

                  <td className="p-3.5 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        fb.status === 'resolved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : fb.status === 'reviewed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {fb.status === 'resolved'
                        ? 'Đã xử lý'
                        : fb.status === 'reviewed'
                        ? 'Đang duyệt'
                        : 'Chờ xử lý'}
                    </span>
                  </td>

                  <td className="p-3.5 pr-5 text-right font-display">
                    <button
                      onClick={() => onSelectFeedback(fb)}
                      className="px-3 py-1.5 rounded-xl bg-[#FAF3E7] hover:bg-[#0E8C7F] text-[#0E8C7F] hover:text-white font-bold text-xs transition-colors cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Xử lý</span>
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
