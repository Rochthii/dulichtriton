'use client';

import React, { useState } from 'react';
import { Play, Eye, ExternalLink, Video } from 'lucide-react';
import VideoModal, { type VideoItem } from '@/components/VideoModal';

interface VideoGalleryProps {
  videos: VideoItem[];
  placeName?: string;
  placeHashtag?: string; // VD: "hotapa" để build TikTok search URL
}

export default function VideoGallery({
  videos,
  placeName,
  placeHashtag,
}: VideoGalleryProps) {
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [featuredIndex, setFeaturedIndex] = useState(0);

  // Build TikTok search URL fallback khi không có video
  const tiktokSearchUrl = placeHashtag
    ? `https://www.tiktok.com/search?q=${encodeURIComponent(placeHashtag)}`
    : `https://www.tiktok.com/search?q=${encodeURIComponent(placeName ?? 'tri ton an giang')}`;

  // ── Empty State ──
  if (!videos || videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-5 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
          <Video className="w-8 h-8 text-slate-400" />
        </div>
        <div>
          <p className="text-slate-700 font-semibold text-sm mb-1">
            Chưa có video review cho địa điểm này
          </p>
          <p className="text-slate-400 text-xs">
            Tìm video trải nghiệm thực tế từ cộng đồng du khách trên TikTok
          </p>
        </div>
        <a
          href={tiktokSearchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1B4D3E] text-white text-xs font-bold hover:bg-[#143B2F] transition-colors border border-[#D99B26]/20"
        >
          <ExternalLink className="w-4 h-4 text-[#D99B26]" />
          Tìm video {placeName ? `"${placeName}"` : 'địa điểm này'} trên TikTok
        </a>
      </div>
    );
  }

  const featured = videos[featuredIndex];
  const sideVideos = videos.filter((_, i) => i !== featuredIndex);

  return (
    <>
      {/* VideoModal */}
      <VideoModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />

      <div className="space-y-4">
        {/* ── Layout: Featured (lớn) + Side Shorts ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_200px] gap-4">
          {/* Featured Video */}
          <div
            className="relative aspect-video bg-slate-950 rounded-2xl overflow-hidden group cursor-pointer border border-slate-800 hover:border-[#1B4D3E] transition-all shadow-lg"
            onClick={() => setSelectedVideo(featured)}
          >
            {/* Thumbnail */}
            {featured.thumbnail_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={featured.thumbnail_url}
                alt={featured.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-800" />
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

            {/* Play Button Center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm border border-white/40 flex items-center justify-center group-hover:scale-110 group-hover:bg-[#1B4D3E] transition-all shadow-2xl">
                <Play className="w-7 h-7 text-white fill-white ml-1" />
              </div>
            </div>

            {/* Bottom Metadata */}
            <div className="absolute bottom-3 left-3 right-3 text-white">
              <p className="text-xs font-bold line-clamp-2 drop-shadow-md mb-1">
                {featured.title}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#D99B26] font-semibold">
                  {featured.author_name}
                </span>
                {featured.view_count != null && (
                  <span className="flex items-center gap-1 text-[11px] text-slate-300">
                    <Eye className="w-3 h-3" />
                    {featured.view_count.toLocaleString('vi-VN')}
                  </span>
                )}
              </div>
            </div>

            {/* Platform badge */}
            <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-[#1B4D3E]/90 text-[#D99B26] text-[10px] font-bold uppercase backdrop-blur-sm">
              {featured.platform === 'tiktok' ? 'TikTok' : 'YouTube'}
            </div>
          </div>

          {/* Side Shorts Stack (9:16 dọc) */}
          {sideVideos.length > 0 && (
            <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-visible">
              {sideVideos.slice(0, 3).map((v, i) => {
                const originalIdx = videos.findIndex((vid) => vid === v);
                return (
                  <div
                    key={v.embed_url + i}
                    className="shrink-0 w-36 lg:w-auto aspect-[9/16] lg:aspect-[9/7] relative bg-slate-950 rounded-xl overflow-hidden group cursor-pointer border border-slate-800 hover:border-[#1B4D3E] transition-all"
                    onClick={() => {
                      setFeaturedIndex(originalIdx);
                      setSelectedVideo(v);
                    }}
                  >
                    {v.thumbnail_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={v.thumbnail_url}
                        alt={v.title}
                        className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-900" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center group-hover:bg-[#1B4D3E] transition-colors">
                        <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                      </div>
                    </div>
                    <p className="absolute bottom-2 left-2 right-2 text-white text-[10px] font-semibold line-clamp-2 drop-shadow-md">
                      {v.title}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Hashtags Row ── */}
        {featured.hashtags && featured.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {featured.hashtags.map((tag) => (
              <a
                key={tag}
                href={`https://www.tiktok.com/search?q=${encodeURIComponent(tag)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-[#1B4D3E] bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg hover:bg-emerald-100 transition-colors font-medium"
              >
                {tag.startsWith('#') ? tag : `#${tag}`}
              </a>
            ))}
            <a
              href={tiktokSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-white bg-[#1B4D3E] px-2.5 py-1 rounded-lg hover:bg-[#143B2F] transition-colors font-bold flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3 text-[#D99B26]" />
              Xem thêm trên TikTok
            </a>
          </div>
        )}
      </div>
    </>
  );
}
