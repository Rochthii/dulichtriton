'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, X, ChevronUp, ChevronDown, Heart, Navigation, Eye, Share2, Sparkles, Volume2 } from 'lucide-react';
import { VideoItem } from './VideoModal';

interface TikTokReelsViewerProps {
  videos: VideoItem[];
  isOpen: boolean;
  initialIndex?: number;
  onClose: () => void;
  placeName?: string;
  placeSlug?: string;
}

export default function TikTokReelsViewer({
  videos,
  isOpen,
  initialIndex = 0,
  onClose,
  placeName = 'Tri Tôn',
  placeSlug = '',
}: TikTokReelsViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isLiked, setIsLiked] = useState(false);
  const touchStartY = useRef<number>(0);
  const touchEndY = useRef<number>(0);

  const handleNext = useCallback(() => {
    if (currentIndex < videos.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsLiked(false);
    }
  }, [currentIndex, videos.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsLiked(false);
    }
  }, [currentIndex]);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown' || e.key === 'j') handleNext();
      if (e.key === 'ArrowUp' || e.key === 'k') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose]);

  if (!isOpen || videos.length === 0) return null;

  const currentVideo = videos[currentIndex] || videos[0];

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    const diff = touchStartY.current - touchEndY.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleNext(); // swipe up -> next video
      } else {
        handlePrev(); // swipe down -> prev video
      }
    }
  };

  // Convert TikTok watch url to embed if needed
  const getEmbedUrl = (v: VideoItem) => {
    if (v.embed_url && v.embed_url.includes('tiktok.com')) return v.embed_url;
    if (v.video_url && v.video_url.includes('/video/')) {
      const vidId = v.video_url.split('/video/')[1]?.split('?')[0];
      if (vidId) return `https://www.tiktok.com/embed/v2/${vidId}`;
    }
    return v.embed_url || v.video_url;
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#151B34]/95 backdrop-blur-md flex items-center justify-center font-body select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all tap-bounce"
        aria-label="Đóng Reels"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Main Reels Phone Container (9:16 Aspect Ratio) */}
      <div className="relative w-full max-w-sm h-full max-h-[85vh] sm:max-h-[720px] rounded-[32px] overflow-hidden bg-black shadow-2xl border border-white/10 flex flex-col justify-between">
        
        {/* Video / Embed Frame */}
        <div className="absolute inset-0 z-0 bg-[#151B34]">
          {getEmbedUrl(currentVideo) ? (
            <iframe
              src={getEmbedUrl(currentVideo)}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-white/70 p-6 text-center space-y-3">
              <Play className="w-12 h-12 text-[#F0A32F]" />
              <p className="text-xs">Không thể phát trực tiếp video này trong trình duyệt.</p>
              <a
                href={currentVideo.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-full bg-[#F0A32F] text-[#26221B] font-bold text-xs"
              >
                Mở Trên Ứng Dụng TikTok
              </a>
            </div>
          )}
        </div>

        {/* Top Header Scrim */}
        <div className="relative z-10 p-4 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#F0A32F] text-[#26221B] text-[10px] font-extrabold font-display uppercase tracking-wider">
              TikTok Reel #{currentIndex + 1}/{videos.length}
            </span>
          </div>
          <span className="text-xs font-bold font-display text-[#FFD37A]">
            {placeName}
          </span>
        </div>

        {/* Right Floating Actions (Like, Share, Swipe Nav) */}
        <div className="absolute right-3 bottom-24 z-20 flex flex-col items-center gap-4 text-white">
          {/* Like */}
          <button
            onClick={() => setIsLiked(!isLiked)}
            className="flex flex-col items-center gap-1 group"
          >
            <div className={`p-3 rounded-full backdrop-blur-md transition-all tap-bounce ${isLiked ? 'bg-[#F26B3A] text-white' : 'bg-black/40 text-white hover:bg-black/60'}`}>
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-white' : ''}`} />
            </div>
            <span className="text-[10px] font-bold">Thích</span>
          </button>

          {/* Views */}
          <div className="flex flex-col items-center gap-1">
            <div className="p-3 rounded-full bg-black/40 text-white backdrop-blur-md">
              <Eye className="w-5 h-5 text-[#FFD37A]" />
            </div>
            <span className="text-[10px] font-bold">{currentVideo.view_count || '12.5k'}</span>
          </div>

          {/* Desktop Navigation Arrows */}
          <div className="hidden sm:flex flex-col gap-2 pt-2 border-t border-white/20">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="p-2 rounded-full bg-black/50 text-white disabled:opacity-30 hover:bg-[#0E8C7F] transition-all"
              title="Video trước"
            >
              <ChevronUp className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex === videos.length - 1}
              className="p-2 rounded-full bg-black/50 text-white disabled:opacity-30 hover:bg-[#0E8C7F] transition-all"
              title="Video tiếp theo"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Bottom Details & CTA Bar */}
        <div className="relative z-10 p-4 pb-5 bg-gradient-to-t from-black/95 via-black/70 to-transparent text-white space-y-2.5">
          <div>
            <p className="text-[11px] font-bold text-[#F0A32F] font-display">@{currentVideo.author_name || 'du_lich_tri_ton'}</p>
            <h3 className="text-xs font-semibold text-white/95 line-clamp-2 leading-relaxed">
              {currentVideo.title}
            </h3>
          </div>

          <div className="flex items-center gap-2 pt-1 font-display">
            {placeSlug && (
              <a
                href={`/places/${placeSlug}`}
                className="flex-1 py-2 px-3 rounded-full bg-[#0E8C7F] hover:bg-[#0B6B60] text-white font-bold text-xs text-center transition-all tap-bounce"
              >
                Xem Thông Tin Địa Điểm
              </a>
            )}
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${placeName} Tri Tôn An Giang`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-3.5 rounded-full bg-[#F0A32F] hover:bg-[#C97F1B] text-[#26221B] font-bold text-xs flex items-center justify-center gap-1 shadow-md transition-all tap-bounce"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Chỉ Đường</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
