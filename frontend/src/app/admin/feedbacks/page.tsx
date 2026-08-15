'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MessageSquareHeart,
  Star,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ChevronLeft,
  Sparkles,
  Mail,
  Phone,
  Calendar,
  AlertCircle,
  Tag,
  ShieldCheck
} from 'lucide-react';

interface FeedbackItem {
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

const CATEGORY_LABELS: Record<string, string> = {
  place_contribution: 'Đóng góp địa điểm mới',
  place_correction: 'Báo sai sót thông tin',
  photo_contribution: 'Gửi tặng ảnh đẹp',
  feature_request: 'Đề xuất tính năng',
  general: 'Góp ý chung',
};

export default function AdminFeedbacksPage() {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      let url = `/api/v1/admin/feedbacks?limit=100&`;
      if (statusFilter !== 'all') url += `status=${statusFilter}&`;
      if (categoryFilter !== 'all') url += `category=${categoryFilter}&`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.feedbacks) {
        setFeedbacks(data.feedbacks);
      }
    } catch (err) {
      console.error('Failed to load feedbacks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [statusFilter, categoryFilter]);

  const handleUpdateStatus = async (id: string, newStatus: 'pending' | 'reviewed' | 'resolved') => {
    setUpdating(true);
    try {
      const res = await fetch('/api/v1/admin/feedbacks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          status: newStatus,
          admin_notes: adminNotes || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedbacks((prev) =>
          prev.map((f) => (f.id === id ? { ...f, status: newStatus } : f))
        );
        if (selectedFeedback && selectedFeedback.id === id) {
          setSelectedFeedback((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
      }
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setUpdating(false);
    }
  };

  const filteredFeedbacks = feedbacks.filter((f) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (f.name || '').toLowerCase().includes(q) ||
      (f.email || '').toLowerCase().includes(q) ||
      (f.subject || '').toLowerCase().includes(q) ||
      (f.message || '').toLowerCase().includes(q)
    );
  });

  const pendingCount = feedbacks.filter((f) => f.status === 'pending').length;

  return (
    <div className="min-h-screen bg-[#FAF3E7] text-[#26221B] p-4 sm:p-8 font-body">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="p-2 rounded-2xl bg-white border border-[#26221B]/10 hover:bg-[#FAF3E7] text-[#6B6355] transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#0E8C7F] uppercase tracking-wider font-display">
                <MessageSquareHeart className="w-4 h-4" />
                <span>Hệ Thống Phản Hồi Người Dùng</span>
              </div>
              <h1 className="text-2xl font-extrabold text-[#26221B] font-display">
                Quản Lý Góp Ý & Đóng Góp
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold font-display border border-amber-300">
              {pendingCount} góp ý chờ xử lý
            </span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-3xl border border-[#26221B]/8 p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#6B6355] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên, email, nội dung..."
              className="w-full pl-10 pr-4 py-2 rounded-2xl bg-[#FAF3E7] border border-[#26221B]/10 text-xs sm:text-sm text-[#26221B] focus:outline-none focus:ring-2 focus:ring-[#0E8C7F]/30"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto font-display text-xs font-bold">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-2xl bg-[#FAF3E7] border border-[#26221B]/10 text-[#26221B] focus:outline-none"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">⏳ Chờ xử lý</option>
              <option value="reviewed">👀 Đang kiểm duyệt</option>
              <option value="resolved">✅ Đã giải quyết</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-2xl bg-[#FAF3E7] border border-[#26221B]/10 text-[#26221B] focus:outline-none"
            >
              <option value="all">Tất cả chủ đề</option>
              <option value="place_contribution">📍 Đóng góp địa điểm</option>
              <option value="place_correction">✏️ Báo sai sót</option>
              <option value="photo_contribution">📸 Gửi tặng ảnh</option>
              <option value="feature_request">💡 Đề xuất tính năng</option>
              <option value="general">💬 Góp ý chung</option>
            </select>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List Feedbacks */}
          <div className="lg:col-span-2 space-y-3">
            {loading ? (
              <div className="py-16 text-center text-[#6B6355] font-display">
                <Sparkles className="w-8 h-8 text-[#0E8C7F] animate-spin mx-auto mb-2" />
                <span>Đang tải danh sách góp ý...</span>
              </div>
            ) : filteredFeedbacks.length === 0 ? (
              <div className="py-16 text-center text-[#6B6355] bg-white rounded-3xl border border-[#26221B]/8 font-display">
                <MessageSquareHeart className="w-10 h-10 text-[#6B6355]/30 mx-auto mb-2" />
                <span className="font-bold">Không tìm thấy góp ý nào phù hợp.</span>
              </div>
            ) : (
              filteredFeedbacks.map((f) => {
                const isSelected = selectedFeedback?.id === f.id;
                return (
                  <div
                    key={f.id}
                    onClick={() => {
                      setSelectedFeedback(f);
                      setAdminNotes(f.metadata?.admin_notes || '');
                    }}
                    className={`p-4 rounded-3xl bg-white border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#0E8C7F] ring-2 ring-[#0E8C7F]/20 shadow-md'
                        : 'border-[#26221B]/8 hover:border-[#0E8C7F]/30 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF3E7] text-[#0E8C7F] border border-[#0E8C7F]/20 font-display">
                          {CATEGORY_LABELS[f.category] || f.category}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-display ${
                            f.status === 'resolved'
                              ? 'bg-emerald-100 text-emerald-700'
                              : f.status === 'reviewed'
                              ? 'bg-sky-100 text-sky-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {f.status === 'resolved'
                            ? '✅ Đã giải quyết'
                            : f.status === 'reviewed'
                            ? '👀 Đang duyệt'
                            : '⏳ Chờ xử lý'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-[#F0A32F]">
                        {[...Array(f.rating || 5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-[#F0A32F]" />
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-[#6B6355]">
                        <span className="font-bold text-[#26221B]">{f.name}</span>
                        <span>{new Date(f.created_at).toLocaleDateString('vi-VN')}</span>
                      </div>
                      {f.subject && (
                        <h4 className="text-sm font-bold text-[#26221B] line-clamp-1">{f.subject}</h4>
                      )}
                      <p className="text-xs text-[#6B6355] line-clamp-2 leading-relaxed">
                        {f.message}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Details & Actions Sidebar */}
          <div className="lg:col-span-1">
            {selectedFeedback ? (
              <div className="bg-white rounded-3xl border border-[#26221B]/8 p-5 shadow-sm space-y-4 sticky top-6">
                <div className="flex items-center justify-between pb-3 border-b border-[#26221B]/8 font-display">
                  <h3 className="font-extrabold text-sm text-[#26221B]">Chi Tiết Góp Ý</h3>
                  <span className="text-[10px] text-[#6B6355] font-mono">{selectedFeedback.id.slice(0, 8)}</span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <span className="text-[#6B6355]">Người gửi:</span>
                    <p className="font-bold text-[#26221B]">{selectedFeedback.name}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-[#0E8C7F]" />
                    <a href={`mailto:${selectedFeedback.email}`} className="text-[#0E8C7F] underline">
                      {selectedFeedback.email}
                    </a>
                  </div>

                  {selectedFeedback.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-[#0E8C7F]" />
                      <span>{selectedFeedback.phone}</span>
                    </div>
                  )}

                  <div>
                    <span className="text-[#6B6355]">Chủ đề:</span>
                    <p className="font-bold text-[#26221B]">{CATEGORY_LABELS[selectedFeedback.category]}</p>
                  </div>

                  {selectedFeedback.subject && (
                    <div>
                      <span className="text-[#6B6355]">Tiêu đề:</span>
                      <p className="font-bold text-[#26221B]">{selectedFeedback.subject}</p>
                    </div>
                  )}

                  <div>
                    <span className="text-[#6B6355]">Nội dung góp ý:</span>
                    <div className="p-3 mt-1 rounded-2xl bg-[#FAF3E7] text-xs text-[#26221B] leading-relaxed max-h-48 overflow-y-auto">
                      {selectedFeedback.message}
                    </div>
                  </div>

                  {selectedFeedback.metadata?.ip && (
                    <div className="text-[10px] text-[#6B6355]/70 font-mono">
                      IP: {selectedFeedback.metadata.ip}
                    </div>
                  )}
                </div>

                {/* Status Action Buttons */}
                <div className="pt-3 border-t border-[#26221B]/8 space-y-2 font-display">
                  <label className="text-xs font-bold text-[#26221B] block">Cập Nhật Trạng Thái</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      disabled={updating || selectedFeedback.status === 'pending'}
                      onClick={() => handleUpdateStatus(selectedFeedback.id, 'pending')}
                      className={`py-2 px-1 rounded-xl text-[11px] font-bold border transition-colors cursor-pointer disabled:opacity-50 ${
                        selectedFeedback.status === 'pending'
                          ? 'bg-amber-100 border-amber-300 text-amber-800'
                          : 'bg-white border-[#26221B]/10 text-[#6B6355]'
                      }`}
                    >
                      ⏳ Chờ xử lý
                    </button>
                    <button
                      type="button"
                      disabled={updating || selectedFeedback.status === 'reviewed'}
                      onClick={() => handleUpdateStatus(selectedFeedback.id, 'reviewed')}
                      className={`py-2 px-1 rounded-xl text-[11px] font-bold border transition-colors cursor-pointer disabled:opacity-50 ${
                        selectedFeedback.status === 'reviewed'
                          ? 'bg-sky-100 border-sky-300 text-sky-800'
                          : 'bg-white border-[#26221B]/10 text-[#6B6355]'
                      }`}
                    >
                      👀 Đang duyệt
                    </button>
                    <button
                      type="button"
                      disabled={updating || selectedFeedback.status === 'resolved'}
                      onClick={() => handleUpdateStatus(selectedFeedback.id, 'resolved')}
                      className={`py-2 px-1 rounded-xl text-[11px] font-bold border transition-colors cursor-pointer disabled:opacity-50 ${
                        selectedFeedback.status === 'resolved'
                          ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                          : 'bg-white border-[#26221B]/10 text-[#6B6355]'
                      }`}
                    >
                      ✅ Đã xử lý
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-[#26221B]/8 p-8 text-center text-[#6B6355] font-display">
                <MessageSquareHeart className="w-8 h-8 text-[#6B6355]/30 mx-auto mb-2" />
                <span className="text-xs">Chọn một góp ý từ danh sách để xem chi tiết và xử lý.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
