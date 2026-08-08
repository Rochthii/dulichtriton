'use client';

import React, { useState } from 'react';
import { Play } from 'lucide-react';
import VideoModal, { VideoItem } from './VideoModal';

interface VideoChatCardProps {
  title: string;
  views: string;
  imageUrl: string;
  embedUrl?: string;
}

export default function VideoChatCard({ title, views, imageUrl, embedUrl }: VideoChatCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Parse views string (e.g. "28.9K") to number approximately for type compliance
  const parsedViews = parseInt(views.replace(/[^0-9]/g, '')) * 1000 || 10000;

  const videoItem: VideoItem = {
    id: Date.now().toString(),
    title,
    embed_url: embedUrl || '',
    thumbnail_url: imageUrl,
    video_url: embedUrl || '', // Fallback
    platform: 'tiktok',
    author_name: 'TikTok Creator',
    view_count: parsedViews,
    hashtags: ['#triton', '#review']
  };

  return (
    <>
      <div 
        onClick={() => {
          if (embedUrl) {
            setIsModalOpen(true);
          } else {
            // Fallback if no embedUrl (open TikTok directly or search)
            window.open(`https://www.tiktok.com/search?q=${encodeURIComponent(title)}`, '_blank');
          }
        }}
        className="bg-slate-900 text-white rounded-xl p-3 shadow-xs flex items-center gap-3 border border-slate-800 cursor-pointer hover:bg-slate-800 transition-colors group"
      >
        <div className="w-12 h-14 bg-slate-800 rounded-lg overflow-hidden relative shrink-0 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt={title} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
          <Play className="w-5 h-5 text-white absolute z-10 drop-shadow-md group-hover:scale-110 transition-transform" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[10px] text-rose-400 font-bold uppercase block mb-0.5">▶ Video Review</span>
          <h5 className="font-bold text-xs text-white truncate">{title}</h5>
          <span className="text-[10px] text-slate-400 block mt-0.5">{views}</span>
        </div>
      </div>

      {isModalOpen && (
        <VideoModal video={videoItem} onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
}
