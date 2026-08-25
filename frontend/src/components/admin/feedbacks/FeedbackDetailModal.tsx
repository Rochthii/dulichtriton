'use client';

import React, { useState } from 'react';
import { X, Save, CheckCircle2, AlertCircle, Phone, Mail, Clock } from 'lucide-react';
import { FeedbackItem } from './FeedbackListTable';
import { FEEDBACK_CATEGORIES } from './FeedbackStatsHeader';

interface FeedbackDetailModalProps {
  feedback: FeedbackItem;
  onClose: () => void;
  onUpdateStatus: (id: string, status: FeedbackItem['status'], notes?: string) => Promise<void>;
  updating: boolean;
}

export default function FeedbackDetailModal({
  feedback,
  onClose,
  onUpdateStatus,
  updating,
}: FeedbackDetailModalProps) {
  const [status, setStatus] = useState<FeedbackItem['status']>(feedback.status);
  const [adminNotes, setAdminNotes] = useState(
    feedback.metadata?.admin_notes || ''
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateStatus(feedback.id, status, adminNotes);
  };

  const catLabel = FEEDBACK_CATEGORIES[feedback.category] || feedback.category;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-body">
      <div className="bg-[#FFFDF7] rounded-3xl max-w-xl w-full border border-[#26221B]/10 shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#FAF3E7] border-b border-[#26221B]/10 flex items-center justify-between font-display shrink-0">
          <div>
            <span className="text-[11px] font-bold text-[#0E8C7F] uppercase tracking-wider">
              Chi Tiết Phản Hồi Du Khách
            </span>
            <h2 className="text-base sm:text-lg font-black text-[#26221B]">
              {feedback.name || 'Người dùng gửi ý kiến'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#6B6355] hover:text-[#26221B] hover:bg-black/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Sender metadata */}
          <div className="p-3.5 rounded-2xl bg-[#FAF3E7] border border-[#26221B]/8 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[#6B6355] block text-[10px]">Phân loại:</span>
              <span className="font-bold text-[#26221B] font-display">{catLabel}</span>
            </div>
            <div>
              <span className="text-[#6B6355] block text-[10px]">Thời gian gửi:</span>
              <span className="font-bold text-[#26221B] font-mono">
                {feedback.created_at ? new Date(feedback.created_at).toLocaleString('vi-VN') : 'N/A'}
              </span>
            </div>
            {feedback.phone && (
              <div>
                <span className="text-[#6B6355] block text-[10px]">Số điện thoại:</span>
                <a href={`tel:${feedback.phone}`} className="font-bold text-[#0E8C7F] font-mono hover:underline">
                  {feedback.phone}
                </a>
              </div>
            )}
            {feedback.email && (
              <div>
                <span className="text-[#6B6355] block text-[10px]">Email liên hệ:</span>
                <span className="font-bold text-[#26221B] font-mono truncate block">
                  {feedback.email}
                </span>
              </div>
            )}
          </div>

          {/* Message Content */}
          <div className="space-y-1">
            <label className="font-bold text-[#26221B] block">Nội dung góp ý / Báo lỗi:</label>
            <div className="p-3.5 rounded-2xl bg-white border border-[#26221B]/10 text-xs text-[#26221B] leading-relaxed whitespace-pre-wrap">
              {feedback.message}
            </div>
          </div>

          {/* Admin Notes */}
          <div className="space-y-1">
            <label className="font-bold text-[#26221B] block">Ghi chú xác minh của Ban Quản Trị:</label>
            <textarea
              rows={3}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Nhập ghi chú xử lý (ví dụ: đã sửa giá vé, đã cập nhật ảnh mới trên Supabase)..."
              className="w-full p-3 rounded-xl bg-[#FAF3E7] border border-[#26221B]/10 text-xs focus:outline-none focus:border-[#0E8C7F]"
            />
          </div>

          {/* Status Selection */}
          <div className="space-y-1.5 font-display">
            <label className="font-bold text-[#26221B] block">Cập nhật trạng thái xử lý:</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStatus('pending')}
                className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  status === 'pending'
                    ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-2xs'
                    : 'bg-white text-[#6B6355] border-[#26221B]/10'
                }`}
              >
                Chờ Xử Lý
              </button>
              <button
                type="button"
                onClick={() => setStatus('reviewed')}
                className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  status === 'reviewed'
                    ? 'bg-blue-600 text-white border-blue-700 shadow-2xs'
                    : 'bg-white text-[#6B6355] border-[#26221B]/10'
                }`}
              >
                Đang Duyệt
              </button>
              <button
                type="button"
                onClick={() => setStatus('resolved')}
                className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  status === 'resolved'
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                    : 'bg-white text-[#6B6355] border-[#26221B]/10'
                }`}
              >
                Đã Xong
              </button>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-[#26221B]/10 flex items-center justify-end gap-2 font-display">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#FAF3E7] hover:bg-[#EBE1D0] text-[#26221B] font-bold cursor-pointer"
            >
              Đóng
            </button>
            <button
              type="submit"
              disabled={updating}
              className="px-5 py-2 rounded-xl bg-[#0E8C7F] hover:bg-[#085A52] text-white font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{updating ? 'Đang lưu...' : 'Lưu Thay Đổi'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
