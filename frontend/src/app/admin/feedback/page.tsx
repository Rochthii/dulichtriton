'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageSquareCode,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  User,
  AlertTriangle,
  RefreshCw,
  Search,
  ExternalLink,
  Filter,
} from 'lucide-react';

interface FeedbackItem {
  id: string;
  action: string;
  target_table?: string;
  target_id?: string;
  changes?: {
    place_id?: string;
    place_name?: string;
    issue_type?: string;
    comment?: string;
    reporter_name?: string;
    contact?: string;
    status?: 'PENDING' | 'APPROVED' | 'DISMISSED';
    reported_at?: string;
    resolved_at?: string;
    admin_notes?: string;
  };
  created_at: string;
}

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'DISMISSED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/feedback?limit=100');
      const data = await res.json();
      if (data.feedbacks) {
        setFeedbacks(data.feedbacks);
      }
    } catch (err) {
      console.warn('Failed to load feedbacks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleUpdateStatus = async (logId: string, newStatus: 'APPROVED' | 'DISMISSED') => {
    try {
      const res = await fetch('/api/v1/admin/feedback', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ log_id: logId, status: newStatus }),
      });

      if (res.ok) {
        setFeedbacks(
          feedbacks.map((f) => {
            if (f.id === logId) {
              return {
                ...f,
                changes: {
                  ...f.changes,
                  status: newStatus,
                  resolved_at: new Date().toISOString(),
                },
              };
            }
            return f;
          })
        );
        setActionMsg(`Đã chuyển trạng thái báo cáo sang "${newStatus === 'APPROVED' ? 'Đã duyệt' : 'Đã bỏ qua'}"!`);
        setTimeout(() => setActionMsg(null), 3000);
      }
    } catch (err) {
      console.warn('Failed to update status:', err);
    }
  };

  const filtered = feedbacks.filter((f) => {
    const changes = f.changes || {};
    const status = changes.status || 'PENDING';
    if (statusFilter !== 'ALL' && status !== statusFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const placeName = (changes.place_name || '').toLowerCase();
      const comment = (changes.comment || '').toLowerCase();
      const reporter = (changes.reporter_name || '').toLowerCase();
      return placeName.includes(q) || comment.includes(q) || reporter.includes(q);
    }

    return true;
  });

  const pendingCount = feedbacks.filter((f) => (f.changes?.status || 'PENDING') === 'PENDING').length;
  const approvedCount = feedbacks.filter((f) => f.changes?.status === 'APPROVED').length;

  return (
    <div className="space-y-6">
      {/* Floating Action Message Toast */}
      {actionMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-950 text-white px-5 py-3.5 rounded-2xl text-xs font-extrabold shadow-2xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="font-body text-slate-100">{actionMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
              Hộp Thư Báo Lỗi & Đóng Góp
            </span>
            {pendingCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold text-xs border border-rose-200 animate-pulse">
                {pendingCount} Chờ xử lý
              </span>
            )}
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Tiếp Nhận Phản Hồi Thực Địa Từ Du Khách
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Theo dõi các thông tin cập nhật ngoài hiện trường (quán đổi giờ bán, số điện thoại mới, cảnh báo đường xá...) do du khách gửi về.
          </p>
        </div>

        <button
          onClick={fetchFeedbacks}
          type="button"
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Làm mới hộp thư</span>
        </button>
      </div>

      {/* Action Toast */}
      {actionMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionMsg}</span>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm theo tên địa điểm, người báo cáo, nội dung..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {(['ALL', 'PENDING', 'APPROVED', 'DISMISSED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {st === 'ALL' && `Tất Cả (${feedbacks.length})`}
              {st === 'PENDING' && `Chờ Xử Lý (${pendingCount})`}
              {st === 'APPROVED' && `Đã Duyệt (${approvedCount})`}
              {st === 'DISMISSED' && `Đã Bỏ Qua`}
            </button>
          ))}
        </div>
      </div>

      {/* Feedback List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center text-slate-400 font-bold bg-white rounded-3xl border border-slate-200">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
            Đang tải dữ liệu phản hồi thực địa...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-bold bg-white rounded-3xl border border-slate-200">
            Không có phản hồi nào trong danh sách này.
          </div>
        ) : (
          filtered.map((item) => {
            const c = item.changes || {};
            const status = c.status || 'PENDING';
            const placeName = c.place_name || item.target_id || 'Địa điểm không xác định';

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        status === 'PENDING'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {status === 'PENDING' ? 'Chờ Xem Xét' : status === 'APPROVED' ? 'Đã Cập Nhật' : 'Đã Bỏ Qua'}
                    </span>

                    <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 text-[10px] font-bold">
                      {c.issue_type || 'Thông tin chung'}
                    </span>

                    <span className="text-[11px] text-slate-400 font-mono">
                      {item.created_at ? new Date(item.created_at).toLocaleString('vi-VN') : ''}
                    </span>
                  </div>

                  <div className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{placeName}</span>
                  </div>

                  <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-2xl border border-slate-100 leading-relaxed font-medium">
                    "{c.comment || 'Du khách gửi báo cáo thực địa.'}"
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500">
                    <div className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{c.reporter_name || 'Du khách'}</span>
                    </div>
                    {c.contact && (
                      <span className="font-mono text-slate-600">Liên hệ: {c.contact}</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  {c.place_id && (
                    <a
                      href={`/places/${c.place_id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition-all"
                      title="Mở trang địa điểm"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Xem POI</span>
                    </a>
                  )}

                  {status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(item.id, 'APPROVED')}
                        className="px-3.5 py-2.5 rounded-2xl bg-[#1B4D3E] hover:bg-[#143B2F] text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
                        <span>Duyệt & Ghi Nhận</span>
                      </button>

                      <button
                        onClick={() => handleUpdateStatus(item.id, 'DISMISSED')}
                        className="p-2.5 rounded-2xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-bold transition-all cursor-pointer"
                        title="Bỏ qua báo cáo"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
