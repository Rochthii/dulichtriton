'use client';

import React, { useState } from 'react';
import { Play, Eye, ExternalLink, Filter, MapPin } from 'lucide-react';
import VideoModal, { type VideoItem } from '@/components/VideoModal';

interface TikTokVideo {
  id: string;
  category: 'food' | 'spot' | 'culture' | 'guide';
  categoryLabel: string;
  title: string;
  creator: string;
  views: string;
  likes: string;
  thumbnail: string;
  tiktokUrl: string;
  embedUrl?: string;
  location: string;
  locationLink: string;
  hashtags: string[];
}

export default function TikTokReviewSection() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [videos, setVideos] = useState<TikTokVideo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  React.useEffect(() => {
    async function loadLiveVideos() {
      try {
        setLoading(true);
        const res = await fetch('/api/v1/videos?limit=12');
        const data = await res.json();
        if (data.videos && Array.isArray(data.videos) && data.videos.length > 0) {
          const mapped: TikTokVideo[] = data.videos.map((v: any, i: number) => ({
            id: v.id || `v-${i}`,
            category: i % 2 === 0 ? 'spot' : 'food',
            categoryLabel: v.location || 'Tri Tôn',
            title: v.description || v.title || 'Video Review Tri Tôn',
            creator: v.userDisplayName || v.username || '@triton.review',
            views: v.viewsCount || '50K',
            likes: v.likesCount || '10K',
            thumbnail: v.thumbnail || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop',
            tiktokUrl: v.tiktokUrl || 'https://www.tiktok.com',
            embedUrl: v.embedUrl,
            location: v.location || 'Tri Tôn, An Giang',
            locationLink: '/map',
            hashtags: v.hashtags || ['#TriTon', '#AnGiang'],
          }));
          setVideos(mapped);
        } else {
          setVideos([]);
        }
      } catch (err) {
        console.error('[TikTokReviewSection] Fetch error:', err);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    }
    loadLiveVideos();
  }, []);

  // Filtered Videos based on Active Tab Category
  const filteredVideos = activeCategory === 'all' 
    ? videos 
    : videos.filter(v => v.category === activeCategory);

  const categories = [
    { id: 'all', label: 'Tất Cả (10)' },
    { id: 'food', label: 'Ẩm Thực & Đặc Sản' },
    { id: 'spot', label: 'Danh Thắng Sống Ảo' },
    { id: 'culture', label: 'Văn Hóa & Chùa Cổ' },
    { id: 'guide', label: 'Kinh Nghiệm Phượt' },
  ];

  const handleOpenVideo = (video: TikTokVideo) => {
    if (video.embedUrl) {
      // Có embed URL → mở VideoModal nhúng trong trang
      setSelectedVideo({
        title: video.title,
        platform: 'tiktok',
        video_url: video.tiktokUrl,
        embed_url: video.embedUrl,
        thumbnail_url: video.thumbnail,
        author_name: video.creator,
        view_count: parseInt(video.views.replace(/[^0-9]/g, '')) * (video.views.includes('K') ? 1000 : 1),
        hashtags: video.hashtags,
        location: video.location,
      });
    } else {
      // Không có embed URL → fallback mở tab TikTok
      window.open(video.tiktokUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const mappedPlaylist: VideoItem[] = videos.map((v: TikTokVideo) => ({
    id: v.id,
    title: v.title,
    platform: 'tiktok',
    video_url: v.tiktokUrl,
    embed_url: v.embedUrl || `https://www.tiktok.com/embed/v2/${v.tiktokUrl.match(/video\/(\d+)/)?.[1] || ''}`,
    thumbnail_url: v.thumbnail,
    author_name: v.creator,
    location: v.location,
    hashtags: v.hashtags,
  }));

  return (
    <>
      {/* VideoModal — render khi user click vào video có embedUrl */}
      <VideoModal video={selectedVideo} playlist={mappedPlaylist} onClose={() => setSelectedVideo(null)} />
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-6 gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#1B4D3E] uppercase tracking-wider mb-1">
            <Play className="w-4 h-4 text-[#D99B26]" />
            <span>Link Video TikTok Trực Tiếp 100% Real</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Kho Video Review Thực Tế Tri Tôn Trên TikTok
          </h2>
        </div>

        <a
          href="https://www.tiktok.com/search?q=du%20l%E1%BB%8Bch%20tri%20t%C3%B4n%20an%20giang"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#1B4D3E] hover:bg-[#143B2F] transition-all px-4 py-2.5 rounded-xl shadow-md"
        >
          <span>Mở ứng dụng TikTok</span>
          <ExternalLink className="w-3.5 h-3.5 text-[#D99B26]" />
        </a>
      </div>

      {/* CATEGORY FILTER TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
        <Filter className="w-4 h-4 text-slate-400 shrink-0 mr-1" />
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border shrink-0 ${
              activeCategory === cat.id
                ? 'bg-[#1B4D3E] text-white border-[#1B4D3E] shadow-md'
                : 'bg-white text-slate-700 border-slate-200 hover:border-[#1B4D3E] hover:bg-emerald-50/50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* COMPACT VIDEO SHORTS GRID (5 Columns Desktop, 2 Columns Mobile) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {filteredVideos.map((video) => (
          <div
            key={video.id}
            onClick={() => handleOpenVideo(video)}
            className="bg-slate-950 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 group cursor-pointer relative flex flex-col justify-between border border-slate-800"
            title={video.embedUrl ? 'Bấm để xem video ngay tại đây' : 'Bấm để xem video gốc trên TikTok'}
          >
            {/* Aspect Ratio 9:16 Vertical Video Frame */}
            <div className="aspect-[9/16] relative overflow-hidden bg-slate-950">
              
              {/* Local Real Photo Cover Thumbnail */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-black/20 to-black/40 pointer-events-none"></div>

              {/* Category Pill Top Left */}
              <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/20 text-[10px] font-bold text-emerald-300">
                <span>{video.categoryLabel}</span>
              </div>

              {/* TikTok Direct Play Indicator Button */}
              <div className="absolute inset-0 flex items-center justify-center z-10 w-full h-full group-hover:bg-black/20 transition-colors">
                <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center group-hover:scale-110 group-hover:bg-[#1B4D3E] transition-all shadow-xl">
                  <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                </div>
              </div>

              {/* Bottom Video Metadata & Direct Links */}
              <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 space-y-1.5 text-white">
                <div className="flex items-center justify-between text-[10px] text-slate-300 font-medium">
                  <span className="font-bold text-[#D99B26] truncate">{video.creator}</span>
                  <span className="flex items-center gap-1 bg-black/50 px-1.5 py-0.5 rounded-md border border-white/10 shrink-0">
                    <Eye className="w-3 h-3 text-[#D99B26]" />
                    <span>{video.views}</span>
                  </span>
                </div>

                <h3 className="font-bold text-xs leading-tight text-white line-clamp-2 drop-shadow-md">
                  {video.title}
                </h3>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-emerald-300 font-bold truncate flex items-center gap-0.5">
                    <MapPin className="w-3 h-3 text-[#D99B26] shrink-0" />
                    <span className="truncate">{video.location}</span>
                  </span>

                  <span className={`px-2 py-0.5 rounded-md text-white text-[10px] font-bold flex items-center gap-1 shadow-sm shrink-0 ${
                    video.embedUrl ? 'bg-[#1B4D3E]' : 'bg-rose-600'
                  }`}>
                    <span>{video.embedUrl ? 'Xem ngay' : 'TikTok'}</span>
                    {video.embedUrl ? <Play className="w-3 h-3 fill-white" /> : <ExternalLink className="w-3 h-3" />}
                  </span>
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>

    </section>
    </>
  );
}
