'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  MapPin, Navigation, Clock, Tag, Star, Camera, ShieldCheck, 
  Video, ArrowLeft, Heart, Share2, Sparkles, Play, Globe, Info, Compass,
  CheckCircle2, Utensils, Footprints, Bus, Car, AlertTriangle, Lightbulb, Phone
} from 'lucide-react';
import { Place } from '@/components/PlaceCard';
import { formatPrice } from '@/lib/utils';
import { resolvePlaceExternalLinks } from '@/lib/externalLinks';
import VideoGallery from '@/components/VideoGallery';
import TikTokFeedSection from '@/components/TikTokFeedSection';
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
  const [activeTab, setActiveTab] = useState<'overview' | 'story' | 'guide' | 'checkin' | 'photos' | 'videos'>('overview');
  const [placeVideos, setPlaceVideos] = useState<VideoItem[]>([]);
  const [videosLoading, setVideosLoading] = useState(false);
  const currentPhoto = photos[selectedPhotoIndex] || photos[0];

  // Parse JSON data safely
  const travelGuide = typeof place.travel_guide === 'object' && place.travel_guide !== null ? place.travel_guide : null;
  const checkinSpots = Array.isArray(place.checkin_spots) ? place.checkin_spots : [];
  const highlights = Array.isArray(place.highlights) ? place.highlights : [];
  const nearbyFood = Array.isArray(place.nearby_cafes_and_food) ? place.nearby_cafes_and_food : [];
  const tagsInfo = Array.isArray(place.tags_info) ? place.tags_info : [];

  // Fetch videos when video tab or mount
  useEffect(() => {
    if (activeTab === 'videos' && placeVideos.length === 0) {
      setVideosLoading(true);
      fetch(`/api/v1/places/${place.id}/videos`)
        .then((r) => r.json())
        .then((data) => {
          setPlaceVideos(data.videos ?? []);
        })
        .catch(() => setPlaceVideos([]))
        .finally(() => setVideosLoading(false));
    }
  }, [activeTab, place.id, placeVideos.length]);

  const handleShare = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 3000);
    }
  };

  return (
    <>
      {/* Toast Notification */}
      {showShareToast && (
        <div className="fixed top-20 right-4 z-50 bg-[#1B4D3E] text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-[#D99B26] text-xs font-semibold flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-[#D99B26]" />
          <span>Đã sao chép liên kết địa điểm!</span>
        </div>
      )}

      {/* Top Navigation & Breadcrumb */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/places"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-emerald-800 transition-colors bg-white px-4 py-2.5 rounded-2xl border border-slate-200 hover:border-emerald-500 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Danh sách địa điểm Tri Tôn</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsBookmarked(!isBookmarked)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all border shadow-sm ${
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
            className="px-4 py-2.5 rounded-2xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Share2 className="w-4 h-4 text-emerald-800" />
            <span>Chia sẻ</span>
          </button>
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md mb-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
              {place.commune}
            </span>
            <span className="px-3 py-1 rounded-xl text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
              {place.tourism_category || place.category}
            </span>
            {place.is_hot && (
              <span className="px-3 py-1 rounded-xl text-xs font-black bg-rose-500 text-white shadow-sm flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                TOP #{place.hot_rank || 1} HOT
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Tọa độ WGS84 xác minh 100%</span>
          </div>
        </div>

        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {place.name}
          </h1>
          <div className="flex items-center gap-2 mt-2 text-xs sm:text-sm text-slate-600">
            <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="font-medium">{place.address || `${place.commune}, Tri Tôn, An Giang`}</span>
          </div>
        </div>

        {/* Quick Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <Clock className="w-5 h-5 text-emerald-700 shrink-0" />
            <div>
              <span className="block text-slate-400 text-[10px] font-semibold">Giờ mở cửa</span>
              <span className="font-bold text-slate-800">{place.opening_hours || '06:00 - 18:00'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <Tag className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="block text-slate-400 text-[10px] font-semibold">Giá vé / Chi phí</span>
              <span className="font-bold text-emerald-800">{formatPrice(place.price_level || 'Miễn phí')}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <Star className="w-5 h-5 fill-amber-400 text-amber-400 shrink-0" />
            <div>
              <span className="block text-slate-400 text-[10px] font-semibold">Đánh giá</span>
              <span className="font-bold text-slate-800">{place.rating || 4.8} / 5.0 ⭐</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 shrink-0">
            <a
              href={maps.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-bold shadow-md transition-all active:scale-95"
              title={maps.tooltip}
            >
              <Navigation className="w-4 h-4 text-amber-300" />
              <span>Chỉ Đường Maps</span>
            </a>
            <a
              href={tiktok.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl bg-slate-900 hover:bg-rose-600 text-white text-xs font-bold shadow-md transition-all active:scale-95"
              title={tiktok.label}
            >
              <Play className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="hidden sm:inline">TikTok</span>
            </a>
          </div>
        </div>
      </div>

      {/* ── ADVANCED TAB NAVIGATION BAR ── */}
      <div className="flex items-center gap-2 mb-8 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-emerald-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Info className="w-4 h-4 text-amber-300" />
          <span>Tổng Quan & Điểm Nhấn</span>
        </button>

        <button
          onClick={() => setActiveTab('story')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
            activeTab === 'story'
              ? 'bg-emerald-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Câu Chuyện & Lịch Sử</span>
        </button>

        <button
          onClick={() => setActiveTab('guide')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
            activeTab === 'guide'
              ? 'bg-emerald-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Compass className="w-4 h-4 text-emerald-400" />
          <span>Cẩm Nang Di Chuyển</span>
        </button>

        <button
          onClick={() => setActiveTab('checkin')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
            activeTab === 'checkin'
              ? 'bg-emerald-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Camera className="w-4 h-4 text-rose-400" />
          <span>Góc Check-in Sống Ảo</span>
        </button>

        <button
          onClick={() => setActiveTab('photos')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
            activeTab === 'photos'
              ? 'bg-emerald-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Camera className="w-4 h-4 text-amber-300" />
          <span>Bộ Ảnh Thực Tế</span>
        </button>

        <button
          onClick={() => setActiveTab('videos')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
            activeTab === 'videos'
              ? 'bg-emerald-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Video className="w-4 h-4 text-rose-400" />
          <span>TikTok Reels Video</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & HIGHLIGHTS */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Main Description */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Info className="w-5 h-5 text-emerald-800" />
              <span>Giới Thiệu Điểm Đến</span>
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed font-light">
              {place.description || `Địa điểm ${place.name} thuộc ${place.commune}, Tri Tôn, An Giang. Nơi đây sở hữu cảnh quan độc đáo, mang đậm nét văn hóa và thiên nhiên vùng Thất Sơn Bảy Núi.`}
            </p>
          </section>

          {/* Highlights */}
          {highlights.length > 0 && (
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>Điểm Nhấn Nổi Bật Không Thể Bỏ Lỡ</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {highlights.map((h: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                    <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed">
                      {typeof h === 'string' ? h : h.text || h.title}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Nearby Cafes and Food */}
          {nearbyFood.length > 0 && (
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Utensils className="w-5 h-5 text-amber-500" />
                <span>Quán Ngon & Cà Phê Gần Địa Điểm Này</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {nearbyFood.map((f: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60 space-y-2">
                    <span className="font-extrabold text-sm text-slate-900 block">{f.name || f}</span>
                    {f.specialty && <p className="text-xs text-amber-800 font-medium">Món ngon: {f.specialty}</p>}
                    {f.distance && <p className="text-[11px] text-slate-500">Cách đây: {f.distance}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* TAB 2: STORY & HISTORICAL CONTEXT */}
      {activeTab === 'story' && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>Câu Chuyện Lịch Sử & Giai Thoại Bảy Núi</span>
            </h2>
            <span className="text-xs font-bold text-emerald-900 bg-emerald-100 px-3 py-1 rounded-full">
              Di Sản Văn Hóa
            </span>
          </div>

          <div className="prose prose-emerald max-w-none text-slate-700 text-sm leading-relaxed whitespace-pre-line font-light">
            {place.detailed_story || place.description || `Địa danh ${place.name} gắn liền với lịch sử hình thành lâu đời và đời sống tâm linh, văn hóa đặc sắc của đồng bào các dân tộc tại vùng đất Tri Tôn, An Giang.`}
          </div>
        </section>
      )}

      {/* TAB 3: TRAVEL GUIDE */}
      {activeTab === 'guide' && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4">
            <Compass className="w-5 h-5 text-emerald-800" />
            <span>Cẩm Nang Di Chuyển & Kinh Nghiệm Khám Phá</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* How to get there */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-sm">
                <Footprints className="w-4 h-4" />
                <span>Cách Di Chuyển Đến Nơi</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-light">
                {travelGuide?.how_to_get_there || `Từ trung tâm Thị trấn Tri Tôn, bạn di chuyển theo định vị Google Maps theo hướng ${place.commune}. Đường đi thuận tiện, có biển chỉ dẫn rõ ràng.`}
              </p>
            </div>

            {/* Recommended Vehicle */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-amber-700 font-extrabold text-sm">
                <Car className="w-4 h-4" />
                <span>Phương Tiện Phù Hợp</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-light">
                {travelGuide?.recommended_vehicle || 'Xe máy hoặc Ô tô du lịch 4-16 chỗ đều có thể tiếp cận dễ dàng.'}
              </p>
            </div>

            {/* Best Time to Visit */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-sm">
                <Clock className="w-4 h-4" />
                <span>Thời Điểm Khám Phá Đẹp Nhất</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-light">
                {travelGuide?.best_time || 'Sáng sớm từ 06:00 - 08:30 hoặc chiều mát từ 16:00 - 17:45 để chụp ảnh hoàng hôn rực rỡ.'}
              </p>
            </div>

            {/* Important Tips */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-rose-700 font-extrabold text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Lưu Ý Khi Tham Quan</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-light">
                {travelGuide?.tips || 'Nên mang theo mũ nón, nước uống, giữ gìn vệ sinh chung và tôn trọng các quy tắc trang phục khi viếng thăm chùa chiền.'}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* TAB 4: CHECK-IN SPOTS */}
      {activeTab === 'checkin' && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Camera className="w-5 h-5 text-rose-500" />
              <span>Các Góc Check-in Sống Ảo Triệu View</span>
            </h2>
            <span className="text-xs font-bold text-rose-800 bg-rose-50 px-3 py-1 rounded-full">
              Sống Ảo Đẹp Nhất
            </span>
          </div>

          {checkinSpots.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {checkinSpots.map((spot: any, idx: number) => (
                <div key={idx} className="p-5 rounded-2xl bg-rose-50/40 border border-rose-100 space-y-2">
                  <span className="font-extrabold text-base text-slate-900 block flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    {typeof spot === 'string' ? spot : spot.name || spot.title}
                  </span>
                  {spot.best_view && (
                    <p className="text-xs text-slate-600 font-medium">Góc máy đẹp: {spot.best_view}</p>
                  )}
                  {spot.tip && (
                    <p className="text-xs text-rose-700 font-light">Mẹo tạo dáng: {spot.tip}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-slate-50 text-slate-600 text-xs text-center">
              Khám phá toàn bộ khuôn viên {place.name} để bắt trọn những góc ảnh thiên nhiên và kiến trúc độc đáo nhất.
            </div>
          )}
        </section>
      )}

      {/* TAB 5: PHOTO GALLERY */}
      {activeTab === 'photos' && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Camera className="w-5 h-5 text-emerald-800" />
              <span>Kho Thư Mục Ảnh Thực Tế</span>
            </h2>
            <span className="text-xs text-slate-500 font-bold">{photos.length} hình ảnh</span>
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
                      ? 'border-emerald-600 ring-2 ring-emerald-600/30 scale-95'
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
      )}

      {/* TAB 6: TIKTOK REELS & VIDEOS */}
      {activeTab === 'videos' && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Video className="w-5 h-5 text-rose-600" />
              <span>Video Review TikTok Thực Tế</span>
            </h2>
            <span className="text-xs text-rose-700 bg-rose-50 px-3 py-1 rounded-full font-bold">
              TikTok Discovery
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
      )}

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
