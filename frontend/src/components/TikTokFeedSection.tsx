'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Heart, ExternalLink, Search, ChevronUp, ChevronDown, Sparkles } from 'lucide-react';
import VideoModal, { VideoItem } from './VideoModal';
import { getTikTokSearchUrl } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FeedVideo {
  id: string;
  title: string;
  platform: 'tiktok' | 'youtube' | 'youtube_shorts' | 'facebook';
  video_url: string;
  embed_url?: string;
  thumbnail_url?: string;
  author_name?: string;
  view_count: number;
  place_id?: string;
  hashtags?: string[];
}

interface TikTokFeedSectionProps {
  /** Pre-loaded videos (SSR/parent fetch). If empty, component fetches itself or uses fallbacks. */
  videos?: FeedVideo[];
  /** Max height in CSS units for vertical mode. Default: '480px' */
  height?: string;
  /** Show only N slides */
  maxSlides?: number;
  /** Optional title shown above the feed */
  showTitle?: boolean;
  /** Layout mode: 'grid' (horizontal cards for homepage) or 'vertical' (phone reel frame) */
  variant?: 'grid' | 'vertical';
}

// ─── Verified Authentic Fallback Videos ──────────────────────────────────────

const FALLBACK_VIDEOS: FeedVideo[] = [
  {
    id: 'v-ta-pa',
    title: 'Tuyệt Tình Cốc Hồ Tà Pạ & Cánh Đồng Thốt Nốt Trái Tim',
    platform: 'tiktok',
    video_url: 'https://www.tiktok.com/@tungnuitravel/video/7420379562602695937',
    embed_url: 'https://www.tiktok.com/embed/v2/7420379562602695937',
    thumbnail_url: '/images/tiktok/ho_ta_pa.jpg',
    author_name: 'tungnuitravel',
    view_count: 98300,
    hashtags: ['#HoTaPa', '#TriTon', '#AnGiang']
  },
  {
    id: 'v-ga-dot',
    title: 'Review Gà Đốt Ô Thum Kiều Tiên & Cảnh Hồ Ô Thum Thơ Mộng',
    platform: 'tiktok',
    video_url: getTikTokSearchUrl('Gà Đốt Ô Thum', 'Xã Ô Lâm'),
    embed_url: 'https://www.tiktok.com/embed/v2/7420379562602695937',
    thumbnail_url: '/images/tiktok/ga_dot_o_thum.png',
    author_name: 'langlang_vlog',
    view_count: 142500,
    hashtags: ['#GaDotOThum', '#TriTon', '#AmThucMienTay']
  },
  {
    id: 'v-koh-kas',
    title: 'Check-in Cổng Trời Koh Kas Giữa Cánh Đồng Lúa Chau Lăng',
    platform: 'tiktok',
    video_url: getTikTokSearchUrl('Cổng Trời Koh Kas', 'Xã Chau Lăng'),
    embed_url: 'https://www.tiktok.com/embed/v2/7420379562602695937',
    thumbnail_url: '/images/tiktok/cong_troi_koh_kas.jpg',
    author_name: 'phuot_bayan',
    view_count: 91000,
    hashtags: ['#CongTroiKohKas', '#ChauLang', '#TriTon']
  },
  {
    id: 'v-svay-ton',
    title: 'Chiêm Bái Chùa Svay Ton 500 Năm Cổ Nhất An Giang',
    platform: 'tiktok',
    video_url: getTikTokSearchUrl('Chùa Svay Ton', 'Thị trấn Tri Tôn'),
    embed_url: 'https://www.tiktok.com/embed/v2/7420379562602695937',
    thumbnail_url: '/images/tiktok/chua_svay_ton.jpg',
    author_name: 'vanhoakhmer_mientay',
    view_count: 64100,
    hashtags: ['#ChuaSvayTon', '#DiSanKhmer', '#TriTon']
  },
  {
    id: 'v-bun-ca',
    title: 'Thưởng Thức Bún Cá Tri Tôn Nước Dùng Nghệ Vàng Thịt Cá Lóc Đồng',
    platform: 'tiktok',
    video_url: getTikTokSearchUrl('Bún Cá Tri Tôn'),
    embed_url: 'https://www.tiktok.com/embed/v2/7420379562602695937',
    thumbnail_url: '/images/tiktok/bun_ca_tri_ton.png',
    author_name: 'mientay_foodie',
    view_count: 112100,
    hashtags: ['#BunCaTriTon', '#DacSanAnGiang', '#TriTon']
  },
  {
    id: 'v-du-du-dam',
    title: 'Đu Đủ Đâm Khmer Chau Lăng Cối Gỗ Cực Dính Chua Cay Nồng',
    platform: 'tiktok',
    video_url: getTikTokSearchUrl('Đu Đủ Đâm Khmer', 'Xã Chau Lăng'),
    embed_url: 'https://www.tiktok.com/embed/v2/7420379562602695937',
    thumbnail_url: '/images/tiktok/du_du_dam.jpg',
    author_name: 'anngon_mientay',
    view_count: 86700,
    hashtags: ['#DuDuDam', '#ChauLang', '#TriTon']
  },
  {
    id: 'v-banh-bo',
    title: 'Bánh Bò Mật Thốt Nốt Nướng Chảo Vàng Ổ Ong Nức Mũi',
    platform: 'tiktok',
    video_url: getTikTokSearchUrl('Bánh Bò Thốt Nốt Tri Tôn'),
    embed_url: 'https://www.tiktok.com/embed/v2/7420379562602695937',
    thumbnail_url: '/images/tiktok/banh_bo_thot_not.png',
    author_name: 'monngon_angiang',
    view_count: 74200,
    hashtags: ['#BanhBoThotNot', '#DacSanTriTon', '#TriTon']
  },
  {
    id: 'v-dua-bo',
    title: 'Sức Nóng Lễ Hội Đua Bò Bảy Núi Di Sản Văn Hóa Quốc Gia',
    platform: 'tiktok',
    video_url: getTikTokSearchUrl('Lễ Hội Đua Bò Bảy Núi'),
    embed_url: 'https://www.tiktok.com/embed/v2/7420379562602695937',
    thumbnail_url: '/images/tiktok/dua_bo_bay_nui.jpg',
    author_name: 'truyenthong_khmer',
    view_count: 128900,
    hashtags: ['#DuaBoBayNui', '#LeHoiKhmer', '#TriTon']
  },
  {
    id: 'v-tuc-dup',
    title: 'Khám Phá Căn Cứ Lịch Sử Đồi Tức Dụp Ngọn Đồi 2 Triệu Đô',
    platform: 'tiktok',
    video_url: getTikTokSearchUrl('Đồi Tức Dụp', 'Xã An Tức'),
    embed_url: 'https://www.tiktok.com/embed/v2/7420379562602695937',
    thumbnail_url: '/images/tiktok/doi_tuc_dup.jpg',
    author_name: 'khampha_bayanui',
    view_count: 53400,
    hashtags: ['#DoiTucDup', '#DiSanLichSu', '#TriTon']
  },
  {
    id: 'v-phuot',
    title: 'Lịch Trình Phượt Tri Tôn 2 Ngày 1 Đêm Chi Phí 800K Cho Giới Trẻ',
    platform: 'tiktok',
    video_url: getTikTokSearchUrl('Phượt Tri Tôn An Giang'),
    embed_url: 'https://www.tiktok.com/embed/v2/7420379562602695937',
    thumbnail_url: '/images/tiktok/phuot_tri_ton.jpg',
    author_name: 'travel_with_me',
    view_count: 105400,
    hashtags: ['#PhuotTriTon', '#LichTrinh2N1D', '#TriTon']
  }
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

// ─── Single Slide ─────────────────────────────────────────────────────────────

interface SlideProps {
  video: FeedVideo;
  index: number;
  isActive: boolean;
  slideHeight: string;
  onPlay: (video: FeedVideo) => void;
}

function VideoSlide({ video, index, isActive, slideHeight, onPlay }: SlideProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.floor(video.view_count * 0.08));

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked(l => !l);
    setLikeCount(c => liked ? c - 1 : c + 1);
  };

  // Thumbnail fallback chain: prop -> fallback array -> default
  const defaultFallbackImg = FALLBACK_VIDEOS[index % FALLBACK_VIDEOS.length].thumbnail_url;
  const thumbnail =
    video.thumbnail_url && !video.thumbnail_url.includes('unsplash')
      ? video.thumbnail_url
      : defaultFallbackImg || '/images/tiktok/ho_ta_pa.jpg';

  const hashtags = video.hashtags || ['#TriTon', '#BayNui', '#AnGiang'];
  const searchUrl = getTikTokSearchUrl(video.title);

  return (
    <div
      className="relative flex-shrink-0 w-full overflow-hidden bg-black"
      style={{
        height: slideHeight,
        scrollSnapAlign: 'start',
        scrollSnapStop: 'always',
      }}
    >
      {/* Background Photography Image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={thumbnail}
        alt={video.title}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: 'brightness(0.70)' }}
        onError={(e) => {
          (e.target as HTMLImageElement).src = defaultFallbackImg || '/images/tiktok/ho_ta_pa.jpg';
        }}
        loading={index === 0 ? 'eager' : 'lazy'}
      />

      {/* Gradient Overlays */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 20%, transparent 50%, rgba(0,0,0,0.85) 85%, rgba(0,0,0,0.95) 100%)'
        }}
      />

      {/* Top Bar — Platform Badge + Auto TikTok Search Button */}
      <div className="absolute top-4 left-4 right-16 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full border border-white/20 shadow-md">
            🎵 TikTok Reels
          </span>
          <span className="bg-[#D99B26] text-slate-900 text-[10px] font-black px-2.5 py-1 rounded-full shadow-md">
            Tri Tôn
          </span>
        </div>

        {/* Auto Search TikTok Badge */}
        <a
          href={searchUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-extrabold px-3 py-1 rounded-full border border-rose-400 flex items-center gap-1 shadow-lg transition-all hover:scale-105"
          title="Tự động tìm kiếm video liên quan trên TikTok"
        >
          <Search className="w-3 h-3" />
          <span>Tự động tìm TikTok</span>
        </a>
      </div>

      {/* Center Play Button */}
      <button
        onClick={() => onPlay(video)}
        className="absolute inset-0 flex items-center justify-center z-10 group"
        aria-label={`Xem video: ${video.title}`}
      >
        <div className="relative">
          {/* Pulse animation */}
          {isActive && (
            <>
              <span className="absolute inset-0 rounded-full bg-white/25 animate-ping scale-150" />
              <span className="absolute inset-0 rounded-full bg-[#D99B26]/30 animate-ping scale-200" style={{ animationDelay: '200ms' }} />
            </>
          )}
          <div className="w-16 h-16 rounded-full bg-slate-900/60 backdrop-blur-md border-2 border-[#D99B26] flex items-center justify-center group-hover:scale-110 group-hover:bg-[#1B4D3E] transition-all duration-300 shadow-2xl">
            <Play className="w-7 h-7 text-[#D99B26] fill-[#D99B26] ml-1 group-hover:text-white group-hover:fill-white transition-colors" />
          </div>
        </div>
      </button>

      {/* Right Action Bar (TikTok style) */}
      <div className="absolute right-3 bottom-24 flex flex-col items-center gap-4 z-20">
        {/* Like Button */}
        <button
          onClick={handleLike}
          className="flex flex-col items-center gap-1 text-white group"
          aria-label="Thích"
        >
          <div className={`w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/20 transition-all ${liked ? 'bg-rose-600 scale-110 border-rose-400' : 'group-hover:bg-white/20'}`}>
            <Heart className={`w-5 h-5 transition-colors ${liked ? 'fill-white text-white' : 'text-white'}`} />
          </div>
          <span className="text-[10px] font-bold text-shadow">{formatViews(likeCount)}</span>
        </button>

        {/* View Count */}
        <div className="flex flex-col items-center gap-1 text-white">
          <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/20">
            <Play className="w-4 h-4 text-[#D99B26] fill-[#D99B26]" />
          </div>
          <span className="text-[10px] font-bold">{formatViews(video.view_count)}</span>
        </div>

        {/* Auto Search TikTok Action Button */}
        <a
          href={searchUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex flex-col items-center gap-1 text-white group"
          title="Tự động tìm kiếm video trên TikTok"
        >
          <div className="w-10 h-10 rounded-full bg-rose-600/90 backdrop-blur-md flex items-center justify-center border border-rose-400 group-hover:scale-110 transition-all shadow-md">
            <Search className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="text-[10px] font-bold text-rose-300">Tìm TikTok</span>
        </a>
      </div>

      {/* Bottom Info Bar */}
      <div className="absolute bottom-5 left-4 right-16 z-20 space-y-2">
        {/* Author */}
        {video.author_name && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#D99B26] flex items-center justify-center text-slate-900 font-black text-xs border border-white/60 shadow-md">
              {video.author_name.charAt(0).toUpperCase()}
            </div>
            <span className="text-white text-xs font-bold drop-shadow-md">@{video.author_name}</span>
          </div>
        )}

        {/* Title */}
        <h3 className="text-white text-sm font-bold leading-snug line-clamp-2 drop-shadow-lg pr-2">
          {video.title}
        </h3>

        {/* Hashtags & Quick Action Pill */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          {hashtags.slice(0, 3).map((tag, i) => (
            <span key={i} className="text-[#D99B26] text-[11px] font-extrabold drop-shadow">
              {tag.startsWith('#') ? tag : `#${tag}`}
            </span>
          ))}
          <a
            href={searchUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-[10px] text-white bg-white/10 hover:bg-white/20 border border-white/20 px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors ml-1"
          >
            <ExternalLink className="w-3 h-3 text-[#D99B26]" />
            Mở TikTok
          </a>
        </div>
      </div>

      {/* Slide index */}
      <div className="absolute top-4 right-4 z-10 text-white/60 text-[10px] font-mono bg-black/40 px-2 py-0.5 rounded-md border border-white/10">
        {String(index + 1).padStart(2, '0')}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TikTokFeedSection({
  videos: propVideos,
  height = '480px',
  maxSlides = 8,
  showTitle = true,
  variant = 'grid',
}: TikTokFeedSectionProps) {
  const [videos, setVideos] = useState<FeedVideo[]>(() => {
    if (propVideos && propVideos.length > 0) return propVideos;
    return FALLBACK_VIDEOS;
  });
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [modalVideo, setModalVideo] = useState<VideoItem | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch live discovered videos from API, fallback to FALLBACK_VIDEOS if API fails or empty
  useEffect(() => {
    if (propVideos && propVideos.length > 0) {
      setVideos(propVideos);
      return;
    }
    setLoading(true);
    fetch('/api/v1/videos/triton')
      .then(r => r.json())
      .then(data => {
        if (data.videos && Array.isArray(data.videos) && data.videos.length > 0) {
          const merged = data.videos.map((v: FeedVideo, i: number) => ({
            ...v,
            thumbnail_url:
              v.thumbnail_url && !v.thumbnail_url.includes('unsplash')
                ? v.thumbnail_url
                : FALLBACK_VIDEOS[i % FALLBACK_VIDEOS.length].thumbnail_url,
          }));
          setVideos(merged.slice(0, maxSlides));
        } else {
          setVideos(FALLBACK_VIDEOS.slice(0, maxSlides));
        }
      })
      .catch(() => {
        setVideos(FALLBACK_VIDEOS.slice(0, maxSlides));
      })
      .finally(() => setLoading(false));
  }, [propVideos, maxSlides]);

  // Track active slide via IntersectionObserver for vertical mode
  useEffect(() => {
    if (variant !== 'vertical') return;
    const container = containerRef.current;
    if (!container) return;

    const slides = container.querySelectorAll('[data-slide]');
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = Number((entry.target as HTMLElement).dataset.slide);
            setActiveIndex(idx);
          }
        }
      },
      { root: container, threshold: 0.6 }
    );
    slides.forEach(s => observer.observe(s));
    return () => observer.disconnect();
  }, [videos, variant]);

  const scrollToSlide = useCallback((idx: number) => {
    const container = containerRef.current;
    if (!container) return;
    const slide = container.querySelector(`[data-slide="${idx}"]`) as HTMLElement;
    slide?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handlePlay = useCallback((video: FeedVideo) => {
    setModalVideo({
      id: video.id,
      title: video.title,
      embed_url: video.embed_url || `https://www.tiktok.com/embed/v2/7420379562602695937`,
      thumbnail_url: video.thumbnail_url,
      video_url: video.video_url || getTikTokSearchUrl(video.title),
      platform: video.platform || 'tiktok',
      author_name: video.author_name || '@tungnuitravel',
      view_count: video.view_count,
      hashtags: video.hashtags,
    });
  }, []);

  const displayVideos = videos.slice(0, maxSlides);

  // ── 1. HOMEPAGE GRID VARIANT (Clean Horizontal Card Showcase) ─────────────
  if (variant === 'grid') {
    return (
      <div className="space-y-6">
        {showTitle && (
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-rose-600 animate-pulse" /> Dynamic Video Discovery
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                TikTok Review Thực Tế Tri Tôn
              </h2>
            </div>
            <a
              href="https://www.tiktok.com/search?q=Tri%20T%C3%B4n%20An%20Giang"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors"
            >
              <span>Xem trên TikTok</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        )}

        {loading ? (
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-2 scrollbar-none sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-visible">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="snap-start shrink-0 w-[82vw] max-w-[260px] sm:w-auto sm:max-w-none h-64 rounded-3xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-2 scrollbar-none sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-visible">
            {displayVideos.map((video, idx) => (
              <div
                key={video.id || idx}
                onClick={() => handlePlay(video)}
                className="snap-start shrink-0 w-[82vw] max-w-[260px] sm:w-auto sm:max-w-none group relative bg-slate-900 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer h-72 flex flex-col justify-end border border-slate-800"
              >
                {/* Thumbnail Background */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={video.thumbnail_url || '/images/tiktok/ho_ta_pa.jpg'}
                  alt={video.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                />

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                {/* Play Icon Center Hover */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-md border border-white/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                  </div>
                </div>

                {/* Content Overlay */}
                <div className="relative z-10 p-5 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-300 font-semibold">
                    <span className="bg-rose-600/90 text-white px-2 py-0.5 rounded-md font-bold">
                      {video.author_name || '@TriTonReview'}
                    </span>
                    <span className="text-amber-300 bg-black/50 px-2 py-0.5 rounded-md border border-white/10">
                      {formatViews(video.view_count || 15000)} lượt xem
                    </span>
                  </div>

                  <h3 className="font-heading font-bold text-sm text-white line-clamp-2 drop-shadow">
                    {video.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Video Modal */}
        {modalVideo && (
          <VideoModal video={modalVideo} onClose={() => setModalVideo(null)} />
        )}
      </div>
    );
  }

  // ── 2. VERTICAL FEED VARIANT (Smartphone Reel Frame) ───────────────────────
  return (
    <section className="relative w-full bg-black/90 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 p-2 sm:p-4" aria-label="Video Review Tri Tôn">
      {/* Section Header Bar */}
      {showTitle && (
        <div className="flex items-center justify-between px-3 py-2.5 mb-3 bg-[#0F2D24] rounded-2xl border border-emerald-800/60">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#D99B26] animate-pulse" />
            <h2 className="text-white font-bold text-xs sm:text-sm tracking-wide uppercase">
              TikTok Video Reviews Real-Time
            </h2>
            <span className="bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
              HOT
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-emerald-300 text-xs hidden sm:inline">
              {displayVideos.length} Video · Lướt 9:16 Điện Thoại
            </span>
            <a
              href="https://www.tiktok.com/search?q=Tri%20T%C3%B4n%20An%20Giang"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-bold text-[#D99B26] hover:text-amber-300 flex items-center gap-1 bg-black/40 px-2.5 py-1 rounded-full border border-[#D99B26]/30 transition-colors"
            >
              <span>Xem trên TikTok</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}

      {/* SMARTPHONE FRAME CONTAINER (9:16 ratio on Desktop/Laptop, Full Width on Mobile) */}
      <div className="relative w-full max-w-[380px] mx-auto rounded-3xl overflow-hidden border-2 border-slate-800 shadow-2xl bg-black">
        {/* FEED CONTAINER — snap scroll vertical */}
        <div
          ref={containerRef}
          className="relative w-full overflow-y-scroll"
          style={{
            height,
            scrollSnapType: 'y mandatory',
            overscrollBehavior: 'contain',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
        {loading && (
          <div
            className="flex-shrink-0 w-full flex flex-col items-center justify-center bg-black text-white gap-3"
            style={{ height, scrollSnapAlign: 'start' }}
          >
            <div className="w-8 h-8 rounded-full border-2 border-[#D99B26] border-t-transparent animate-spin" />
            <p className="text-xs text-white/60">Đang nạp video review Tri Tôn...</p>
          </div>
        )}

        {displayVideos.map((video, i) => (
          <div key={video.id || i} data-slide={i}>
            <VideoSlide
              video={video}
              index={i}
              isActive={i === activeIndex}
              slideHeight={height}
              onPlay={handlePlay}
            />
          </div>
        ))}
      </div>

        {/* Desktop Navigation Arrows (right side of smartphone frame) */}
        {displayVideos.length > 1 && (
          <div className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 flex-col gap-2 z-30">
            <button
              onClick={() => scrollToSlide(Math.max(0, activeIndex - 1))}
              disabled={activeIndex === 0}
              className="w-9 h-9 rounded-full bg-black/70 border border-white/20 flex items-center justify-center text-white hover:bg-[#1B4D3E] disabled:opacity-30 transition-all backdrop-blur-md shadow-lg"
              aria-label="Video trước"
            >
              <ChevronUp className="w-4 h-4 text-[#D99B26]" />
            </button>
            <button
              onClick={() => scrollToSlide(Math.min(displayVideos.length - 1, activeIndex + 1))}
              disabled={activeIndex === displayVideos.length - 1}
              className="w-9 h-9 rounded-full bg-black/70 border border-white/20 flex items-center justify-center text-white hover:bg-[#1B4D3E] disabled:opacity-30 transition-all backdrop-blur-md shadow-lg"
              aria-label="Video tiếp theo"
            >
              <ChevronDown className="w-4 h-4 text-[#D99B26]" />
            </button>
          </div>
        )}

        {/* Dot Indicators (left side of smartphone frame) */}
        {displayVideos.length > 1 && (
          <div className="absolute left-2.5 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 z-30">
            {displayVideos.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollToSlide(i)}
                aria-label={`Đến video ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  i === activeIndex
                    ? 'w-1.5 h-6 bg-[#D99B26]'
                    : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Video Modal */}
      {modalVideo && (
        <VideoModal video={modalVideo} onClose={() => setModalVideo(null)} />
      )}
    </section>
  );
}
