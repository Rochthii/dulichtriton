'use client';

import React, { useState, useEffect } from 'react';
import {
  Video,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Trash2,
  ExternalLink,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Eye,
  Heart,
  Share2,
} from 'lucide-react';
import ImportTikTokModal from '@/components/admin/ImportTikTokModal';

interface VideoRecord {
  id: string;
  external_video_id: string;
  video_url: string;
  thumbnail_url: string;
  title: string;
  author_name: string;
  author_username: string;
  view_count: number;
  like_count: number;
  quality_score: number;
  matched_location: string;
  verification_status: 'VERIFIED' | 'PENDING' | 'REJECTED';
}

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<VideoRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'VERIFIED' | 'PENDING' | 'REJECTED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

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
      if (res.ok) {
        setVideos(prev => prev.map(v => v.id === id ? { ...v, verification_status: newStatus } : v));
      }
    } catch (e) {
      console.warn('Error updating status:', e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa video TikTok này khỏi CSDL Supabase?')) return;
    try {
      const res = await fetch(`/api/v1/admin/videos?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setVideos(prev => prev.filter(v => v.id !== id));
      }
    } catch (e) {
      console.warn('Error deleting video:', e);
    }
  };

  const filteredVideos = videos.filter(v => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (v.title && v.title.toLowerCase().includes(q)) ||
      (v.author_name && v.author_name.toLowerCase().includes(q)) ||
      (v.matched_location && v.matched_location.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-[#B45309] text-xs font-bold mb-2">
            <Video className="w-4 h-4" />
            <span>TikTok Video Manager</span>
          </div>
          <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Quản Lý Video TikTok Review
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Duyệt/xóa video, bóc tách oEmbed chính chủ TikTok và cập nhật dữ liệu video thực tế cho Chatbot AI & Trang chủ.
          </p>
        </div>

        <button
          onClick={() => setIsImportModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-[#1B4D3E] hover:bg-[#153e32] text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-amber-300" />
          Nhập Video TikTok Thật
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs font-semibold">
          {(['ALL', 'VERIFIED', 'PENDING', 'REJECTED'] as const).map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {st === 'ALL' && 'Tất cả'}
              {st === 'VERIFIED' && 'Đã duyệt (Verified)'}
              {st === 'PENDING' && 'Chờ duyệt'}
              {st === 'REJECTED' && 'Từ chối'}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tiêu đề, tác giả, địa danh..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
          />
        </div>
      </div>

      {/* Videos List Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-500 text-xs flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin" /> Đang nạp danh sách Video từ CSDL Supabase...
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <Video className="w-12 h-12 text-slate-300 mx-auto" />
          <h4 className="font-heading font-bold text-slate-700 text-sm">Chưa có video phù hợp</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Bấm nút &quot;Nhập Video TikTok Thật&quot; ở góc trên để nạp thêm video mới từ TikTok.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVideos.map(video => (
            <div
              key={video.id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              {/* Thumbnail & Badges */}
              <div className="relative h-48 bg-slate-900 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={video.thumbnail_url || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80'}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Status Badge */}
                <div className="absolute top-3 left-3">
                  {video.verification_status === 'VERIFIED' && (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-bold shadow-md flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Đã Duyệt
                    </span>
                  )}
                  {video.verification_status === 'PENDING' && (
                    <span className="px-2.5 py-1 rounded-full bg-amber-500 text-white text-[10px] font-bold shadow-md">
                      Chờ Duyệt
                    </span>
                  )}
                  {video.verification_status === 'REJECTED' && (
                    <span className="px-2.5 py-1 rounded-full bg-rose-500 text-white text-[10px] font-bold shadow-md flex items-center gap-1">
                      <XCircle className="w-3 h-3" /> Từ Chối
                    </span>
                  )}
                </div>

                {/* Quality Score Badge */}
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-xs text-amber-300 px-2.5 py-1 rounded-full text-[10px] font-bold border border-white/20 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Score: {video.quality_score || 0.90}
                </div>

                {/* Overlay Play & TikTok Link */}
                <a
                  href={video.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-3 right-3 bg-slate-900/80 hover:bg-slate-900 text-white p-2 rounded-xl border border-white/20 text-xs font-bold transition-all flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                  Mở TikTok
                </a>
              </div>

              {/* Info Body */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-[11px] font-bold text-emerald-800 mb-1">
                    📍 {video.matched_location || 'Tri Tôn, An Giang'}
                  </div>
                  <h4 className="font-heading font-bold text-slate-900 text-xs sm:text-sm line-clamp-2 leading-snug">
                    {video.title}
                  </h4>
                  <div className="text-[11px] text-slate-500 mt-1 font-medium">
                    Tác giả: <span className="font-bold text-slate-800">@{video.author_username || video.author_name}</span>
                  </div>
                </div>

                {/* Stats & Actions Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-3 text-slate-500 text-[11px] font-medium">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      {video.view_count ? (video.view_count > 1000000 ? `${(video.view_count / 1000000).toFixed(1)}M` : `${Math.round(video.view_count / 1000)}K`) : '0'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 text-rose-400" />
                      {video.like_count ? `${Math.round(video.like_count / 1000)}K` : '0'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    {video.verification_status !== 'VERIFIED' && (
                      <button
                        onClick={() => handleUpdateStatus(video.id, 'VERIFIED')}
                        className="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold transition-all cursor-pointer"
                        title="Duyệt Video"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                    {video.verification_status !== 'REJECTED' && (
                      <button
                        onClick={() => handleUpdateStatus(video.id, 'REJECTED')}
                        className="p-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold transition-all cursor-pointer"
                        title="Từ Chối Video"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(video.id)}
                      className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold transition-all cursor-pointer"
                      title="Xóa Video"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Import TikTok Modal Component */}
      <ImportTikTokModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={fetchVideos}
      />
    </div>
  );
}
