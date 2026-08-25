'use client';

import React, { useState, useEffect, useMemo } from 'react';
import VideoStatsHeader from '@/components/admin/videos/VideoStatsHeader';
import VideoGridTable, { VideoRecord } from '@/components/admin/videos/VideoGridTable';
import ImportTikTokModal from '@/components/admin/ImportTikTokModal';

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<VideoRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'VERIFIED' | 'PENDING' | 'REJECTED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const url = statusFilter !== 'ALL' ? `/api/v1/admin/videos?status=${statusFilter}` : '/api/v1/admin/videos';
      const res = await fetch(url);
      const data = await res.json();
      if (data.videos) setVideos(data.videos);
    } catch (e) {
      console.warn('Failed to fetch admin videos:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [statusFilter]);

  const handleUpdateStatus = async (id: string, newStatus: 'VERIFIED' | 'REJECTED') => {
    try {
      const res = await fetch('/api/v1/admin/videos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, verification_status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(newStatus === 'VERIFIED' ? 'Đã duyệt video thành công!' : 'Đã ẩn video khỏi danh sách!');
        setVideos((prev) =>
          prev.map((v) => (v.id === id ? { ...v, verification_status: newStatus } : v))
        );
      }
    } catch (e: any) {
      showToast('Lỗi cập nhật trạng thái: ' + e.message, 'error');
    }
  };

  const handleDeleteVideo = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa video này khỏi hệ thống?')) return;
    try {
      const res = await fetch(`/api/v1/admin/videos?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Đã xóa video thành công!');
        setVideos((prev) => prev.filter((v) => v.id !== id));
      }
    } catch (e: any) {
      showToast('Lỗi khi xóa: ' + e.message, 'error');
    }
  };

  const filteredVideos = useMemo(() => {
    if (!searchQuery.trim()) return videos;
    const q = searchQuery.toLowerCase();
    return videos.filter((v) => {
      const matchTitle = (v.title || '').toLowerCase().includes(q);
      const matchAuthor = (v.author_username || v.author_name || '').toLowerCase().includes(q);
      const matchLoc = (v.matched_location || '').toLowerCase().includes(q);
      return matchTitle || matchAuthor || matchLoc;
    });
  }, [videos, searchQuery]);

  const verifiedCount = useMemo(() => videos.filter((v) => v.verification_status === 'VERIFIED').length, [videos]);
  const pendingCount = useMemo(() => videos.filter((v) => v.verification_status === 'PENDING').length, [videos]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-body">
      {/* 1. Header, KPIs & Search Bar */}
      <VideoStatsHeader
        totalCount={videos.length}
        verifiedCount={verifiedCount}
        pendingCount={pendingCount}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenImport={() => setIsImportModalOpen(true)}
        onRefresh={fetchVideos}
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

      {/* 2. Videos Grid Table */}
      <VideoGridTable
        videos={filteredVideos}
        onUpdateStatus={handleUpdateStatus}
        onDelete={handleDeleteVideo}
      />

      {/* 3. Import TikTok AI Scan Modal */}
      {isImportModalOpen && (
        <ImportTikTokModal
          onClose={() => setIsImportModalOpen(false)}
          onSuccess={() => {
            setIsImportModalOpen(false);
            fetchVideos();
            showToast('Đã quét và thêm video mới thành công!');
          }}
        />
      )}
    </div>
  );
}
