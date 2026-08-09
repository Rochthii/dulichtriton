'use client';

import React, { useEffect, useCallback, useState } from 'react';
import {
  X,
  ExternalLink,
  Eye,
  Play,
  MapPin,
  ChevronUp,
  ChevronDown,
  Shuffle,
  Sparkles,
  Layers,
} from 'lucide-react';

export interface VideoItem {
  id?: string;
  title: string;
  platform: 'tiktok' | 'youtube' | 'youtube_shorts' | 'facebook';
  video_url: string;
  embed_url: string;
  thumbnail_url?: string;
  author_name?: string;
  view_count?: number;
  hashtags?: string[];
  location?: string;
}

interface VideoModalProps {
  video: VideoItem | null;
  playlist?: VideoItem[];
  onClose: () => void;
}

export default function VideoModal({ video: initialVideo, playlist: initialPlaylist = [], onClose }: VideoModalProps) {
  const [currentVideo, setCurrentVideo] = useState<VideoItem | null>(initialVideo);
  const [playlist, setPlaylist] = useState<VideoItem[]>(initialPlaylist);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [loadingPlaylist, setLoadingPlaylist] = useState(false);

  // Sync initial props
  useEffect(() => {
    setCurrentVideo(initialVideo);
  }, [initialVideo]);

  // Auto fetch all real videos from API if playlist is empty
  useEffect(() => {
    if (!initialVideo) return;
    if (initialPlaylist.length > 0) {
      setPlaylist(initialPlaylist);
      return;
    }

    const fetchAllVideos = async () => {
      setLoadingPlaylist(true);
      try {
        const res = await fetch('/api/v1/videos?limit=50');
        const data = await res.json();
        if (data.videos && Array.isArray(data.videos) && data.videos.length > 0) {
          const mapped: VideoItem[] = data.videos.map((v: any) => ({
            id: v.id,
            title: v.title,
            platform: 'tiktok',
            video_url: v.video_url,
            embed_url: v.embed_url || `https://www.tiktok.com/embed/v2/${v.external_video_id}`,
            thumbnail_url: v.thumbnail_url,
            author_name: v.author_name || v.author_username,
            view_count: v.view_count,
            hashtags: v.hashtags || [],
            location: v.matched_location,
          }));
          setPlaylist(mapped);
        }
      } catch (e) {
        console.warn('Failed to auto-fetch video playlist:', e);
      } finally {
        setLoadingPlaylist(false);
      }
    };

    fetchAllVideos();
  }, [initialVideo, initialPlaylist]);

  // Filter playlist by category/location
  const filteredPlaylist = playlist.filter(v => {
    if (activeFilter === 'ALL') return true;
    const loc = (v.location || '').toLowerCase();
    const tit = (v.title || '').toLowerCase();
    const f = activeFilter.toLowerCase();
    return loc.includes(f) || tit.includes(f);
  });

  const activeIndex = filteredPlaylist.findIndex(
    v => v.id === currentVideo?.id || v.video_url === currentVideo?.video_url
  );

  const handleNext = useCallback(() => {
    if (filteredPlaylist.length === 0) return;
    const nextIdx = (activeIndex + 1) % filteredPlaylist.length;
    setCurrentVideo(filteredPlaylist[nextIdx]);
  }, [activeIndex, filteredPlaylist]);

  const handlePrev = useCallback(() => {
    if (filteredPlaylist.length === 0) return;
    const prevIdx = (activeIndex - 1 + filteredPlaylist.length) % filteredPlaylist.length;
    setCurrentVideo(filteredPlaylist[prevIdx]);
  }, [activeIndex, filteredPlaylist]);

  const handleRandom = useCallback(() => {
    if (filteredPlaylist.length === 0) return;
    const randIdx = Math.floor(Math.random() * filteredPlaylist.length);
    setCurrentVideo(filteredPlaylist[randIdx]);
  }, [filteredPlaylist]);

  // Keyboard navigation shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        handleNext();
      }
      if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        handlePrev();
      }
    },
    [onClose, handleNext, handlePrev]
  );

  useEffect(() => {
    if (!currentVideo) return;
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [currentVideo, handleKeyDown]);

  if (!currentVideo) return null;

  const isShorts = currentVideo.platform === 'youtube_shorts' || currentVideo.platform === 'tiktok';

  const categories = [
    { id: 'ALL', label: 'Tất cả 18+' },
    { id: 'Tà Pạ', label: 'Tà Pạ' },
    { id: 'Ẩm Thực', label: 'Ẩm Thực' },
    { id: 'Chùa Koh Kas', label: 'Chùa Koh Kas' },
    { id: 'Núi Cô Tô', label: 'Núi Cô Tô' },
    { id: 'Lễ Hội', label: 'Lễ Hội' },
  ];

  return (
    /* Backdrop overlay */
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md transition-all animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      {/* Modal container */}
      <div
        className="relative flex flex-col bg-[#0A0A0A] shadow-2xl overflow-hidden w-[390px] max-w-[95vw] rounded-3xl border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Category Filter Bar ── */}
        <div className="flex items-center gap-1 overflow-x-auto p-2 bg-[#111] border-b border-white/10 text-[10px] font-bold scrollbar-none">
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setActiveFilter(c.id)}
              className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                activeFilter === c.id
                  ? 'bg-amber-500 text-slate-950 font-extrabold shadow-xs'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* ── Header Bar ── */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#141414] border-b border-white/10">
          <div className="flex items-center gap-2 min-w-0">
            <span className="shrink-0 px-2 py-0.5 rounded-md bg-emerald-800 text-amber-300 text-[10px] font-bold uppercase tracking-wide">
              TikTok Reel
            </span>
            {filteredPlaylist.length > 0 && (
              <span className="text-[11px] font-mono text-slate-400 font-bold">
                [{activeIndex >= 0 ? activeIndex + 1 : 1}/{filteredPlaylist.length}]
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleRandom}
              title="Phát Video Ngẫu Nhiên"
              className="p-1.5 rounded-lg text-amber-400 hover:bg-amber-400/10 transition-colors flex items-center gap-1 text-[10px] font-bold cursor-pointer"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ngẫu Nhiên</span>
            </button>

            <button
              onClick={onClose}
              className="ml-1 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Đóng video"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* ── Main Video Player Frame & Side Navigation Controls ── */}
        <div className="relative w-full bg-black aspect-[9/16] group">
          <iframe
            src={currentVideo.embed_url}
            title={currentVideo.title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />

          {/* Floating Vertical Navigation Arrows (Next / Prev) */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-3">
            <button
              onClick={handlePrev}
              title="Video Trước (Phím Mũi Tên Lên)"
              className="w-10 h-10 rounded-full bg-black/70 hover:bg-emerald-600 text-white backdrop-blur-md border border-white/20 flex items-center justify-center shadow-xl transition-all hover:scale-110 cursor-pointer"
            >
              <ChevronUp className="w-6 h-6" />
            </button>

            <button
              onClick={handleNext}
              title="Video Tiếp Theo (Phím Mũi Tên Xuống / Space)"
              className="w-10 h-10 rounded-full bg-black/70 hover:bg-emerald-600 text-white backdrop-blur-md border border-white/20 flex items-center justify-center shadow-xl transition-all hover:scale-110 cursor-pointer animate-bounce"
            >
              <ChevronDown className="w-6 h-6" />
            </button>
          </div>

          {/* Fallback Direct Link Banner */}
          <div className="absolute bottom-3 left-3 right-14 z-20 flex items-center justify-between bg-black/85 backdrop-blur-md p-2 rounded-xl border border-white/20 shadow-lg">
            <span className="text-[10px] text-slate-300 font-medium truncate max-w-[50%]">
              Trải nghiệm gốc:
            </span>
            <a
              href={currentVideo.video_url || `https://www.tiktok.com/search?q=${encodeURIComponent(currentVideo.title + " Tri Tôn An Giang")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-extrabold text-white bg-rose-600 hover:bg-rose-700 px-3 py-1 rounded-lg shadow-md transition-all"
            >
              <span>Mở TikTok</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* ── Metadata & Quick Reel Controls Footer ── */}
        <div className="px-4 py-3 bg-[#111] space-y-2">
          <h4 className="text-white text-xs font-bold line-clamp-2">
            {currentVideo.title}
          </h4>

          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <Play className="w-3.5 h-3.5 text-amber-400" />
              <span>{currentVideo.author_name ?? '@tiktoker'}</span>
            </div>
            {currentVideo.view_count != null && (
              <div className="flex items-center gap-1 text-slate-400">
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                <span>{currentVideo.view_count.toLocaleString('vi-VN')} lượt xem</span>
              </div>
            )}
          </div>

          {/* Location Badge */}
          {currentVideo.location && (
            <div className="flex items-center gap-1 text-emerald-400 text-[11px] font-bold">
              <MapPin className="w-3.5 h-3.5" />
              <span>{currentVideo.location}</span>
            </div>
          )}

          {/* Bottom Next/Prev Action Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handlePrev}
              className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              <ChevronUp className="w-4 h-4" /> Video Trước
            </button>
            <button
              onClick={handleNext}
              className="flex-1 py-2 rounded-xl bg-[#1B4D3E] hover:bg-emerald-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer shadow-md"
            >
              Video Tiếp <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
