'use client';

import React, { useEffect, useCallback } from 'react';
import { X, ExternalLink, Eye, Play, MapPin } from 'lucide-react';

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
  onClose: () => void;
}

export default function VideoModal({ video, onClose }: VideoModalProps) {
  // Close on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!video) return;
    document.addEventListener('keydown', handleKeyDown);
    // Prevent body scroll when modal open
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [video, handleKeyDown]);

  if (!video) return null;

  const isShorts =
    video.platform === 'youtube_shorts' || video.platform === 'tiktok';

  // Build safe embed URL with autoplay muted params
  const buildEmbedUrl = (url: string, platform: string) => {
    try {
      const u = new URL(url);
      if (platform === 'youtube' || platform === 'youtube_shorts') {
        u.searchParams.set('autoplay', '1');
        u.searchParams.set('mute', '1');
        u.searchParams.set('rel', '0');
      }
      // TikTok embed: auto-play controlled by TikTok oEmbed player natively
      return u.toString();
    } catch {
      return url;
    }
  };

  const platformLabel = {
    tiktok: 'TikTok',
    youtube: 'YouTube',
    youtube_shorts: 'YouTube Shorts',
    facebook: 'Facebook',
  }[video.platform] ?? 'Video';

  return (
    /* Backdrop overlay */
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={video.title}
    >
      {/* Modal container — stop propagation so clicking inside won't close */}
      <div
        className={`relative flex flex-col bg-[#0A0A0A] shadow-2xl overflow-hidden
          ${isShorts
            ? 'w-[360px] max-w-[95vw] rounded-2xl'
            : 'w-full max-w-[900px] mx-4 rounded-2xl'
          }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header Bar ── */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#111] border-b border-white/10">
          <div className="flex items-center gap-2 min-w-0">
            <span className="shrink-0 px-2 py-0.5 rounded-md bg-[#1B4D3E] text-[#D99B26] text-[10px] font-bold uppercase tracking-wide">
              {platformLabel}
            </span>
            <h3 className="text-white text-xs font-semibold truncate">
              {video.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 ml-3 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Đóng video"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Video Player ── */}
        <div
          className={`w-full bg-black ${isShorts ? 'aspect-[9/16]' : 'aspect-video'}`}
        >
          <iframe
            src={buildEmbedUrl(video.embed_url, video.platform)}
            title={video.title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />
        </div>

        {/* ── Metadata Footer ── */}
        <div className="px-4 py-3 bg-[#111] space-y-2">
          {/* Creator + Views */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Play className="w-3.5 h-3.5 text-[#D99B26]" />
              <span className="text-slate-300 text-xs font-semibold">
                {video.author_name ?? 'Unknown Creator'}
              </span>
            </div>
            {video.view_count != null && (
              <div className="flex items-center gap-1 text-slate-400 text-[11px]">
                <Eye className="w-3.5 h-3.5 text-[#D99B26]" />
                <span>{video.view_count.toLocaleString('vi-VN')} lượt xem</span>
              </div>
            )}
          </div>

          {/* Location + Hashtags */}
          <div className="flex flex-wrap items-center gap-1.5">
            {video.location && (
              <span className="flex items-center gap-1 text-emerald-400 text-[11px] font-medium">
                <MapPin className="w-3 h-3" />
                {video.location}
              </span>
            )}
            {video.hashtags?.map((tag) => (
              <span
                key={tag}
                className="text-[10px] text-slate-400 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded-md"
              >
                {tag.startsWith('#') ? tag : `#${tag}`}
              </span>
            ))}
          </div>

          {/* CTA: Xem gốc */}
          <a
            href={video.video_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#1B4D3E] hover:bg-[#143B2F] px-3.5 py-2 rounded-xl transition-colors border border-[#D99B26]/20"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#D99B26]" />
            Xem trên {platformLabel}
          </a>
        </div>
      </div>
    </div>
  );
}
