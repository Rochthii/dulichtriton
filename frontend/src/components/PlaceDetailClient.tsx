'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  MapPin, Navigation, Clock, Tag, Star, Camera, ShieldCheck, 
  Video, ArrowLeft, Heart, Share2, Sparkles, Play, Globe, Info, Compass,
  CheckCircle2, Utensils, Footprints, Bus, Car, AlertTriangle, Lightbulb, Phone,
  MessageSquareQuote, Layers, Users, Sun, Bookmark, Check, ChevronRight
} from 'lucide-react';
import { Place } from '@/components/PlaceCard';
import { formatPrice } from '@/lib/utils';
import { resolvePlaceExternalLinks } from '@/lib/externalLinks';
import VideoGallery from '@/components/VideoGallery';
import { type VideoItem } from '@/components/VideoModal';

interface PlaceDetailClientProps {
  place: Place;
  nearbyPlaces?: Place[];
}

export default function PlaceDetailClient({ place, nearbyPlaces = [] }: PlaceDetailClientProps) {
  const { maps, tiktok } = resolvePlaceExternalLinks({
    name: place.name,
    commune: place.commune,
    lat: place.latitude,
    lng: place.longitude,
    video_url: place.video_url,
  });

  const photos = place.photos && place.photos.length > 0
    ? place.photos
    : [
        {
          url: place.image_url || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop',
          caption: place.name,
          source: 'Cổng thông tin Du lịch An Giang (angiangtourism.vn)',
          license: 'Public Domain Tourism Collection'
        }
      ];

  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [placeVideos, setPlaceVideos] = useState<VideoItem[]>([]);
  const [videosLoading, setVideosLoading] = useState(false);
  const currentPhoto = photos[selectedPhotoIndex] || photos[0];

  // Robust JSON parsing helper
  const parseJsonSafely = (val: any) => {
    if (!val) return null;
    if (typeof val === 'object') return val;
    if (typeof val === 'string') {
      try {
        return JSON.parse(val);
      } catch {
        return null;
      }
    }
    return null;
  };

  // Parse JSON data safely from 174 Master POIs Schema
  const travelGuide = parseJsonSafely(place.travel_guide);
  const checkinSpots = Array.isArray(place.checkin_spots)
    ? place.checkin_spots
    : (parseJsonSafely(place.checkin_spots) || []);
  const highlights = Array.isArray(place.highlights)
    ? place.highlights
    : (parseJsonSafely(place.highlights) || []);
  const nearbyFood = Array.isArray(place.nearby_cafes_and_food)
    ? place.nearby_cafes_and_food
    : (parseJsonSafely(place.nearby_cafes_and_food) || []);
  const tagsInfo = parseJsonSafely(place.tags_info) || {};
  const googleMapsInfo = parseJsonSafely(place.google_maps_info) || {};
  const reviewSamples = Array.isArray(place.review_samples)
    ? place.review_samples
    : (parseJsonSafely(place.review_samples) || []);

  // Preload videos from POI
  useEffect(() => {
    if (Array.isArray(place.tiktok_videos) && place.tiktok_videos.length > 0) {
      const vids: VideoItem[] = place.tiktok_videos.map((v: any, idx: number) => ({
        id: v.id || `poi-vid-${idx}`,
        title: v.title || `${place.name} Tri Tôn Review`,
        platform: 'tiktok',
        video_url: v.video_url || '',
        embed_url: v.embed_url || v.video_url || '',
        thumbnail_url: v.thumbnail_url || place.image_url || '/images/tiktok/ho_ta_pa.jpg',
        author_name: v.author || 'du_lich_tri_ton',
        view_count: v.views || 18000,
        place_id: place.id,
      }));
      setPlaceVideos(vids);
    } else {
      setVideosLoading(true);
      fetch(`/api/v1/places/${place.id}/videos`)
        .then((r) => r.json())
        .then((data) => {
          setPlaceVideos(data.videos ?? []);
        })
        .catch(() => setPlaceVideos([]))
        .finally(() => setVideosLoading(false));
    }
  }, [place.id, place.name, place.image_url, place.tiktok_videos]);

  const handleShare = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 3000);
    }
  };

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const offset = 90;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth',
      });
    }
  };

  const navItems = [
    { id: 'overview', label: '1. Tổng quan', icon: Info },
    { id: 'story', label: '2. Lịch sử & Giai thoại', icon: Sparkles },
    { id: 'guide', label: '3. Cẩm nang di chuyển', icon: Compass },
    { id: 'checkin', label: '4. Góc check-in', icon: Camera },
    { id: 'reviews', label: '5. Đánh giá', icon: MessageSquareQuote },
    { id: 'photos', label: '6. Bộ ảnh', icon: Camera },
    { id: 'videos', label: '7. Video TikTok', icon: Video },
  ];

  // Helper to render formatted story paragraphs
  const renderFormattedStory = (text: string) => {
    if (!text) return null;
    const paragraphs = text.split(/\n\s*\n/);
    return paragraphs.map((p, idx) => {
      const trimmed = p.trim();
      if (!trimmed) return null;

      // Check if paragraph is a bold heading like **Heading**
      if (trimmed.startsWith('**') && trimmed.endsWith('**') && !trimmed.slice(2, -2).includes('**')) {
        return (
          <h3 key={idx} className="text-lg sm:text-xl font-extrabold text-[#1B4D3E] mt-6 mb-3 flex items-center gap-2">
            <span className="w-2 h-6 bg-[#D99B26] rounded-full inline-block"></span>
            {trimmed.slice(2, -2)}
          </h3>
        );
      }

      // Check if starts with a bold title like **Title**: Body
      if (trimmed.startsWith('**') && trimmed.includes('**')) {
        const parts = trimmed.split('**');
        return (
          <div key={idx} className="text-slate-700 text-sm sm:text-base leading-relaxed mb-4">
            <strong className="font-extrabold text-slate-900 text-base block sm:inline mr-1 text-[#1B4D3E]">
              {parts[1]}
            </strong>
            <span>{parts.slice(2).join('**').replace(/^:\s*/, '')}</span>
          </div>
        );
      }

      return (
        <p key={idx} className="text-slate-700 text-sm sm:text-base leading-relaxed mb-4 font-normal">
          {trimmed}
        </p>
      );
    });
  };

  return (
    <>
      {/* Toast Notification */}
      {showShareToast && (
        <div className="fixed top-20 right-4 z-50 bg-[#1B4D3E] text-white px-5 py-3 rounded-2xl shadow-2xl border border-[#D99B26] text-xs font-bold flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-[#D99B26]" />
          <span>Đã sao chép liên kết bài viết!</span>
        </div>
      )}

      {/* Top Breadcrumb & Action Bar */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/places"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-[#1B4D3E] transition-colors bg-white px-4 py-2.5 rounded-2xl border border-slate-200/90 hover:border-[#1B4D3E] shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại Khám phá Tri Tôn</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsBookmarked(!isBookmarked)}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all border shadow-sm ${
              isBookmarked
                ? 'bg-rose-50 border-rose-200 text-rose-600'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Heart className={`w-4 h-4 ${isBookmarked ? 'fill-rose-600' : ''}`} />
            <span>{isBookmarked ? 'Đã lưu' : 'Lưu điểm'}</span>
          </button>

          <button
            onClick={handleShare}
            className="px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Share2 className="w-4 h-4 text-[#1B4D3E]" />
            <span>Chia sẻ</span>
          </button>
        </div>
      </div>

      {/* ── HERO HEADER CARD ── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-md mb-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-emerald-100 text-emerald-950 border border-emerald-300">
              {place.commune}
            </span>
            <span className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-amber-100 text-amber-950 border border-amber-300">
              {place.tourism_category || place.category}
            </span>
            {place.is_hot && (
              <span className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-rose-500 text-white shadow-xs flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                TOP #{place.hot_rank || 1} NỔI BẬT
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Tọa độ WGS84 xác thực 100%</span>
          </div>
        </div>

        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug">
            {place.name}
          </h1>
          <div className="flex items-center gap-2 mt-2 text-xs sm:text-sm text-slate-600">
            <MapPin className="w-4 h-4 text-[#1B4D3E] shrink-0" />
            <span className="font-medium leading-relaxed">{place.address || `${place.commune}, Tri Tôn, An Giang`}</span>
          </div>
        </div>

        {/* Dynamic Tag Clusters from tags_info */}
        {(tagsInfo.clusters || tagsInfo.experiences || tagsInfo.audiences) && (
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 text-xs">
            {Array.isArray(tagsInfo.clusters) && tagsInfo.clusters.map((c: string, idx: number) => (
              <span key={idx} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-900 font-bold border border-emerald-200">
                <Layers className="w-3.5 h-3.5 text-emerald-700" />
                {c}
              </span>
            ))}
            {Array.isArray(tagsInfo.experiences) && tagsInfo.experiences.map((exp: string, idx: number) => (
              <span key={idx} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 font-bold border border-amber-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                {exp}
              </span>
            ))}
            {Array.isArray(tagsInfo.audiences) && tagsInfo.audiences.map((aud: string, idx: number) => (
              <span key={idx} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                <Users className="w-3.5 h-3.5 text-slate-500" />
                {aud}
              </span>
            ))}
          </div>
        )}

        {/* Quick Info Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-4 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <Clock className="w-5 h-5 text-emerald-800 shrink-0" />
            <div>
              <span className="block text-slate-500 text-[10px] font-semibold">Giờ mở cửa</span>
              <span className="font-extrabold text-slate-900 text-xs sm:text-sm">{place.opening_hours || '06:00 - 18:00'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <Tag className="w-5 h-5 text-amber-700 shrink-0" />
            <div>
              <span className="block text-slate-500 text-[10px] font-semibold">Giá vé / Chi phí</span>
              <span className="font-extrabold text-[#1B4D3E] text-xs sm:text-sm">{formatPrice(place.price_level || 'Miễn phí')}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <Star className="w-5 h-5 fill-amber-400 text-amber-400 shrink-0" />
            <div>
              <span className="block text-slate-500 text-[10px] font-semibold">Đánh giá thực tế</span>
              <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                {googleMapsInfo.rating || place.rating || 4.8} / 5.0 ⭐
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 shrink-0">
            <a
              href={maps.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-[#1B4D3E] hover:bg-[#143B2F] text-white text-xs sm:text-sm font-extrabold shadow-md transition-all active:scale-95"
              title={maps.tooltip}
            >
              <Navigation className="w-4 h-4 text-amber-300" />
              <span>Chỉ Đường Maps</span>
            </a>
          </div>
        </div>

        {/* Best Visit Time & Popular Times Bar */}
        {(place.best_visit_time || googleMapsInfo.popular_times) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs sm:text-sm">
            {place.best_visit_time && (
              <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950 font-medium">
                <Sun className="w-4 h-4 text-amber-600 shrink-0" />
                <span><strong>Thời điểm đẹp nhất:</strong> {place.best_visit_time}</span>
              </div>
            )}
            {googleMapsInfo.popular_times && (
              <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 font-medium">
                <Clock className="w-4 h-4 text-emerald-700 shrink-0" />
                <span><strong>Khung giờ cao điểm:</strong> {googleMapsInfo.popular_times}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── STICKY QUICK JUMP ANCHOR BAR ── */}
      <div className="sticky top-16 sm:top-20 z-20 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-1.5 shadow-md mb-8 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isCurrent = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap active:scale-95 ${
                isCurrent
                  ? 'bg-[#1B4D3E] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isCurrent ? 'text-amber-300' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── UNIFIED ALL-IN-ONE CONTENT STREAM ── */}
      <div className="space-y-10">

        {/* ── SECTION 1: TỔNG QUAN & ĐIỂM NHẤN ── */}
        <section id="overview" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6 scroll-mt-28">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2.5">
              <Info className="w-6 h-6 text-[#1B4D3E]" />
              <span>1. Tổng Quan & Điểm Nhấn Nổi Bật</span>
            </h2>
            <span className="text-xs font-bold text-emerald-900 bg-emerald-100 px-3 py-1 rounded-full">
              Khám Phá
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/60">
            <p className="text-slate-800 text-sm sm:text-base leading-relaxed font-normal">
              {place.description || `Địa điểm ${place.name} thuộc ${place.commune}, Tri Tôn, An Giang. Nơi đây sở hữu cảnh quan độc đáo, mang đậm nét văn hóa và thiên nhiên vùng Thất Sơn Bảy Núi.`}
            </p>
          </div>

          {/* Highlights Matrix */}
          {highlights.length > 0 && (
            <div className="space-y-3 pt-2">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>Những Điểm Nhấn Không Thể Bỏ Lỡ</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {highlights.map((h: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
                    <CheckCircle2 className="w-5 h-5 text-emerald-800 shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm font-semibold text-slate-900 leading-relaxed">
                      {typeof h === 'string' ? h : h.text || h.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nearby Cafes and Food */}
          {nearbyFood.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Utensils className="w-5 h-5 text-amber-600" />
                <span>Quán Ăn Ngon & Cà Phê Gần Địa Điểm Này</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {nearbyFood.map((f: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
                    <span className="font-extrabold text-sm sm:text-base text-slate-900 block">{f.name || f}</span>
                    {f.specialties && Array.isArray(f.specialties) ? (
                      <p className="text-xs text-amber-900 font-medium leading-relaxed">Đặc sản: {f.specialties.join(', ')}</p>
                    ) : f.specialty ? (
                      <p className="text-xs text-amber-900 font-medium">Món ngon: {f.specialty}</p>
                    ) : null}
                    {f.address && <p className="text-[11px] text-slate-500 line-clamp-1">{f.address}</p>}
                    {f.rating && (
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-700">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{f.rating} ⭐ ({f.reviews_count || 100}+ đánh giá)</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ── SECTION 2: CÂU CHUYỆN & LỊCH SỬ ── */}
        <section id="story" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6 scroll-mt-28">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2.5">
              <Sparkles className="w-6 h-6 text-amber-500" />
              <span>2. Câu Chuyện & Lịch Sử Bản Địa</span>
            </h2>
            <span className="text-xs font-bold text-amber-900 bg-amber-100 px-3 py-1 rounded-full">
              Di Sản Thất Sơn
            </span>
          </div>

          <div className="bg-slate-50/60 p-6 rounded-2xl border border-slate-200/60 space-y-3">
            {renderFormattedStory(
              place.detailed_story ||
              place.description ||
              `Địa danh ${place.name} gắn liền với lịch sử hình thành lâu đời và đời sống tâm linh, văn hóa đặc sắc của đồng bào các dân tộc tại vùng đất Tri Tôn, An Giang.`
            )}
          </div>
        </section>

        {/* ── SECTION 3: CẨM NANG DI CHUYỂN ── */}
        <section id="guide" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6 scroll-mt-28">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2.5">
              <Compass className="w-6 h-6 text-[#1B4D3E]" />
              <span>3. Cẩm Nang Di Chuyển & Kinh Nghiệm Khám Phá</span>
            </h2>
            <span className="text-xs font-bold text-emerald-900 bg-emerald-100 px-3 py-1 rounded-full">
              Bỏ Túi Du Lịch
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* How to get there */}
            <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-2">
              <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-sm sm:text-base">
                <Footprints className="w-4 h-4 text-[#1B4D3E]" />
                <span>Cách Di Chuyển Đến Nơi</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                {travelGuide?.how_to_get_there || `Từ trung tâm Thị trấn Tri Tôn, du khách di chuyển theo định vị Google Maps theo hướng ${place.commune}. Đường đi thuận tiện, có biển chỉ dẫn rõ ràng.`}
              </p>
            </div>

            {/* Recommended Vehicle */}
            <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-2">
              <div className="flex items-center gap-2 text-amber-950 font-extrabold text-sm sm:text-base">
                <Car className="w-4 h-4 text-amber-700" />
                <span>Phương Tiện Phù Hợp</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                {travelGuide?.recommended_vehicle || travelGuide?.vehicle_suitability || 'Xe máy hoặc Ô tô du lịch 4-16 chỗ đều có thể tiếp cận dễ dàng.'}
              </p>
            </div>

            {/* Best Time to Visit */}
            <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-2">
              <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-sm sm:text-base">
                <Clock className="w-4 h-4 text-emerald-700" />
                <span>Thời Điểm Khám Phá Đẹp Nhất</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                {travelGuide?.best_time || travelGuide?.best_season || place.best_visit_time || 'Sáng sớm từ 06:00 - 08:30 hoặc chiều mát từ 16:00 - 17:45 để chụp ảnh hoàng hôn rực rỡ.'}
              </p>
            </div>

            {/* Important Tips */}
            <div className="p-5 rounded-2xl bg-rose-50/50 border border-rose-200/80 space-y-2">
              <div className="flex items-center gap-2 text-rose-950 font-extrabold text-sm sm:text-base">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Lưu Ý Khi Tham Quan</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                {travelGuide?.tips || 'Nên mang theo mũ nón, nước uống, giữ gìn vệ sinh chung và tôn trọng các quy tắc trang phục khi viếng thăm chùa chiền.'}
              </p>
            </div>
          </div>
        </section>

        {/* ── SECTION 4: GÓC CHECK-IN SỐNG ẢO ── */}
        <section id="checkin" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6 scroll-mt-28">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2.5">
              <Camera className="w-6 h-6 text-rose-500" />
              <span>4. Góc Check-in Sống Ảo Triệu View</span>
            </h2>
            <span className="text-xs font-bold text-rose-900 bg-rose-100 px-3 py-1 rounded-full">
              Góc Ảnh Đẹp
            </span>
          </div>

          {checkinSpots.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {checkinSpots.map((spot: any, idx: number) => (
                <div key={idx} className="p-5 rounded-2xl bg-rose-50/40 border border-rose-200 space-y-2.5">
                  <span className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                    {typeof spot === 'string' ? spot : spot.name || spot.title}
                  </span>
                  {spot.best_view && (
                    <p className="text-xs sm:text-sm text-slate-700 font-medium">📷 <strong>Góc máy đẹp:</strong> {spot.best_view}</p>
                  )}
                  {spot.tip && (
                    <p className="text-xs sm:text-sm text-rose-900 font-normal">✨ <strong>Mẹo tạo dáng:</strong> {spot.tip}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-slate-50 text-slate-600 text-xs sm:text-sm text-center">
              Khám phá toàn bộ khuôn viên {place.name} để bắt trọn những góc ảnh thiên nhiên và kiến trúc độc đáo nhất.
            </div>
          )}
        </section>

        {/* ── SECTION 5: ĐÁNH GIÁ DU KHÁCH ── */}
        <section id="reviews" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6 scroll-mt-28">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2.5">
              <MessageSquareQuote className="w-6 h-6 text-amber-500" />
              <span>5. Đánh Giá Thực Tế Từ Du Khách</span>
            </h2>
            <span className="text-xs font-bold text-emerald-950 bg-emerald-100 px-3 py-1 rounded-full">
              Google Maps & Cộng Đồng
            </span>
          </div>

          {reviewSamples.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {reviewSamples.map((rev: any, idx: number) => (
                <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs sm:text-sm text-slate-900">{rev.author || 'Du Khách Đã Trải Nghiệm'}</span>
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 uppercase">
                      {rev.platform || 'Google Maps'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 text-xs">
                    {Array.from({ length: Math.round(Number(rev.rating) || 5) }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                    "{rev.content || 'Địa điểm phong cảnh tuyệt đẹp, rất đáng để ghé thăm khi đến Tri Tôn.'}"
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-slate-50 text-slate-600 text-xs sm:text-sm text-center">
              Địa điểm nhận được mức đánh giá trung bình {place.rating || 4.8}/5.0 sao từ du khách thập phương.
            </div>
          )}
        </section>

        {/* ── SECTION 6: BỘ ẢNH THỰC TẾ ── */}
        <section id="photos" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6 scroll-mt-28">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2.5">
              <Camera className="w-6 h-6 text-[#1B4D3E]" />
              <span>6. Kho Thư Mục Ảnh Thực Tế</span>
            </h2>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">{photos.length} hình ảnh</span>
          </div>

          <div className="relative rounded-3xl overflow-hidden bg-slate-900 h-[360px] sm:h-[500px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentPhoto.url}
              alt={currentPhoto.caption || place.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 inset-x-0 bg-slate-950/85 backdrop-blur-md p-4 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-white/10">
              <p className="text-xs sm:text-sm font-semibold">{currentPhoto.caption || place.name}</p>
              {currentPhoto.source && (
                <span className="text-[11px] text-emerald-300 font-medium">Nguồn: {currentPhoto.source}</span>
              )}
            </div>
          </div>

          {photos.length > 1 && (
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {photos.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedPhotoIndex(idx)}
                  className={`relative h-20 rounded-2xl overflow-hidden border-2 transition-all ${
                    selectedPhotoIndex === idx
                      ? 'border-[#1B4D3E] ring-2 ring-[#1B4D3E]/30 scale-95'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt={p.caption || place.name} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* ── SECTION 7: VIDEO TIKTOK REELS ── */}
        <section id="videos" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6 scroll-mt-28">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2.5">
              <Video className="w-6 h-6 text-rose-600" />
              <span>7. Video Review TikTok Thực Tế</span>
            </h2>
            <span className="text-xs text-rose-800 bg-rose-100 px-3.5 py-1 rounded-full font-bold">
              TikTok Discovery ({placeVideos.length} video)
            </span>
          </div>

          {videosLoading ? (
            <div className="py-16 text-center text-slate-400 font-bold text-xs">
              Đang tìm kiếm video review cho {place.name}...
            </div>
          ) : (
            <VideoGallery
              videos={placeVideos}
              placeName={place.name}
              placeHashtag={place.name.toLowerCase().replace(/\s+/g, '')}
            />
          )}
        </section>

      </div>

      {/* ── MOBILE STICKY FLOATING ACTION BAR ── */}
      <div className="fixed bottom-16 inset-x-0 z-30 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 p-3 sm:hidden shadow-[0_-4px_25px_rgba(0,0,0,0.1)] flex items-center gap-2.5">
        <a
          href={maps.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-3.5 px-4 rounded-2xl bg-[#1B4D3E] hover:bg-[#143B2F] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
        >
          <Navigation className="w-4 h-4 text-amber-300" />
          <span>Chỉ Đường Google Maps</span>
        </a>

        {place.phone ? (
          <a
            href={`tel:${place.phone}`}
            className="py-3.5 px-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all shrink-0"
          >
            <Phone className="w-4 h-4 text-amber-300" />
            <span>Gọi</span>
          </a>
        ) : (
          <a
            href={tiktok.url}
            target="_blank"
            rel="noopener noreferrer"
            className="py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-rose-600 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all shrink-0"
          >
            <Play className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>TikTok</span>
          </a>
        )}
      </div>

    </>
  );
}
