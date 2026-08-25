'use client';

import React, { useState, useEffect, useMemo } from 'react';
import FeedbackStatsHeader from '@/components/admin/feedbacks/FeedbackStatsHeader';
import FeedbackListTable, { FeedbackItem } from '@/components/admin/feedbacks/FeedbackListTable';
import FeedbackDetailModal from '@/components/admin/feedbacks/FeedbackDetailModal';

export default function AdminFeedbacksPage() {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [updating, setUpdating] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

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
    } catch (err: any) {
      showToast('Lỗi tải danh sách phản hồi: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [statusFilter, categoryFilter]);

  const handleUpdateStatus = async (id: string, newStatus: FeedbackItem['status'], notes?: string) => {
    setUpdating(true);
    try {
      const res = await fetch('/api/v1/admin/feedbacks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          status: newStatus,
          admin_notes: notes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Đã cập nhật trạng thái phản hồi thành công!');
        setSelectedFeedback(null);
        fetchFeedbacks();
      } else {
        showToast(data.error || 'Lỗi cập nhật', 'error');
      }
    } catch (err: any) {
      showToast('Lỗi: ' + err.message, 'error');
    } finally {
      setUpdating(false);
    }
  };

  const filteredFeedbacks = useMemo(() => {
    if (!searchQuery.trim()) return feedbacks;
    const q = searchQuery.toLowerCase();
    return feedbacks.filter((fb) => {
      const matchName = (fb.name || '').toLowerCase().includes(q);
      const matchMsg = (fb.message || '').toLowerCase().includes(q);
      const matchPhone = (fb.phone || '').toLowerCase().includes(q);
      return matchName || matchMsg || matchPhone;
    });
  }, [feedbacks, searchQuery]);

  const pendingCount = useMemo(() => feedbacks.filter((f) => f.status === 'pending').length, [feedbacks]);
  const reviewedCount = useMemo(() => feedbacks.filter((f) => f.status === 'reviewed').length, [feedbacks]);
  const resolvedCount = useMemo(() => feedbacks.filter((f) => f.status === 'resolved').length, [feedbacks]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-body">
      {/* 1. Stats Header & Search */}
      <FeedbackStatsHeader
        totalCount={feedbacks.length}
        pendingCount={pendingCount}
        reviewedCount={reviewedCount}
        resolvedCount={resolvedCount}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onRefresh={fetchFeedbacks}
        loading={loading}
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

      {/* 2. Feedback Table */}
      <FeedbackListTable
        feedbacks={filteredFeedbacks}
        onSelectFeedback={(item) => setSelectedFeedback(item)}
      />

      {/* 3. Detail Modal */}
      {selectedFeedback && (
        <FeedbackDetailModal
          feedback={selectedFeedback}
          onClose={() => setSelectedFeedback(null)}
          onUpdateStatus={handleUpdateStatus}
          updating={updating}
        />
      )}
    </div>
  );
}
