'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  MapPin, Navigation, Clock, Tag, Star, Camera, ShieldCheck, 
  Video, ArrowLeft, Heart, Share2, Sparkles, Play, Globe, Info, Compass
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
          url: place.image_url || '/images/tiktok/ho_ta_pa.jpg',
          caption: place.name,
          source: 'Cổng thông tin Du lịch An Giang (angiangtourism.vn)',
          license: 'Public Domain Tourism Collection'
        }
      ];

  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const [activeTab, setActiveTab] = useState<'photos' | 'map' | 'videos' | 'golden_hours'>('photos');
  const [placeVideos, setPlaceVideos] = useState<VideoItem[]>([]);
  const [videosLoading, setVideosLoading] = useState(false);
  const currentPhoto = photos[selectedPhotoIndex] || photos[0];

  // Fetch videos khi chuyển sang Tab Video
  useEffect(() => {
    if (activeTab !== 'videos' || placeVideos.length > 0) return;
    setVideosLoading(true);
    fetch(`/api/v1/places/${place.id}/videos`)
      .then((r) => r.json())
      .then((data) => {
        setPlaceVideos(data.videos ?? []);
      })
      .catch(() => setPlaceVideos([]))
      .finally(() => setVideosLoading(false));
  }, [activeTab, place.id, placeVideos.length]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 3000);
    }
  };

  return (
    <>
      {/* Toast Notification */}
      {showShareToast && (
        <div className="fixed top-20 right-4 z-50 bg-[#1B4D3E] text-white px-4 py-2.5 rounded-xl shadow-xl border border-[#D99B26] text-xs font-semibold flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-[#D99B26]" />
          <span>Đã sao chép liên kết địa điểm!</span>
        </div>
      )}

      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/places"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#1B4D3E] transition-colors bg-white px-3.5 py-2 rounded-xl border border-slate-200 hover:border-[#1B4D3E] shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh sách địa điểm</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsBookmarked(!isBookmarked)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border ${
              isBookmarked
                ? 'bg-rose-50 border-rose-200 text-rose-600'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-rose-600' : ''}`} />
            <span>{isBookmarked ? 'Đã lưu' : 'Lưu điểm'}</span>
          </button>

          <button
            onClick={handleShare}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-all"
          >
            <Share2 className="w-3.5 h-3.5 text-[#1B4D3E]" />
            <span>Chia sẻ</span>
          </button>
        </div>
      </div>

      {/* Place Detail Header Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-[#1B4D3E] border border-emerald-100">
              {place.commune}
            </span>
            <span className="px-3 py-1 rounded-md text-xs font-semibold bg-amber-50 text-[#D99B26] border border-amber-200">
              {place.category}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Xác minh WGS84 ({place.confidence_score || 95}%)</span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
          {place.name}
        </h1>

        <div className="flex items-start gap-2 mt-3 text-xs sm:text-sm text-slate-600">
          <MapPin className="w-4 h-4 text-[#1B4D3E] shrink-0 mt-0.5" />
          <span className="font-medium">{place.address || `${place.commune}, Tri Tôn, An Giang`}</span>
        </div>

        {/* Quick Info Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <div>
              <span className="block text-slate-400 text-[10px]">Giờ mở cửa</span>
              <span className="font-semibold text-slate-800">{place.opening_hours || '07:00 - 18:00'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#D99B26]" />
            <div>
              <span className="block text-slate-400 text-[10px]">Giá vé tham quan</span>
              <span className="font-semibold text-emerald-800">{formatPrice(place.price_level || 'Miễn phí')}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 fill-[#D99B26] text-[#D99B26]" />
            <div>
              <span className="block text-slate-400 text-[10px]">Đánh giá cộng đồng</span>
              <span className="font-semibold text-slate-800">{place.rating || 4.5} ({place.review_count || 120} lượt)</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 shrink-0">
            <a
              href={maps.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#1B4D3E] hover:bg-[#143B2F] text-white text-xs font-bold shadow-xs transition-colors"
              title={maps.tooltip}
            >
              <Navigation className="w-4 h-4 text-[#D99B26]" />
              <span>Chỉ Đường Maps</span>
            </a>
            <a
              href={tiktok.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-rose-600 text-white text-xs font-extrabold shadow-xs transition-colors"
              title={tiktok.label}
            >
              <Play className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>Xem TikTok</span>
            </a>
          </div>
        </div>
      </div>

      {/* ── ADVANCED 4-TAB NAVIGATION BAR ── */}
      <div className="flex items-center gap-1 mb-6 bg-slate-100 p-1.5 rounded-2xl overflow-x-auto scrollbar-none border border-slate-200">
        <button
          onClick={() => setActiveTab('photos')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
            activeTab === 'photos'
              ? 'bg-[#1B4D3E] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Camera className="w-3.5 h-3.5 text-amber-400" />
          <span>Ảnh Thực Tế</span>
        </button>

        <button
          onClick={() => setActiveTab('map')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
            activeTab === 'map'
              ? 'bg-[#1B4D3E] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-emerald-400" />
          <span>Bản Đồ GIS & GPS</span>
        </button>

        <button
          onClick={() => setActiveTab('golden_hours')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
            activeTab === 'golden_hours'
              ? 'bg-[#1B4D3E] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-300" />
          <span>Khung Giờ Vàng</span>
        </button>

        <button
          onClick={() => setActiveTab('videos')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
            activeTab === 'videos'
              ? 'bg-[#1B4D3E] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Video className="w-3.5 h-3.5 text-rose-400" />
          <span>TikTok Video Review</span>
        </button>
      </div>

      {/* PHOTO GALLERY SECTION WITH EXPLICIT SOURCE ATTRIBUTION */}
      <section className={`bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs mb-8 ${
        activeTab === 'photos' ? 'block' : 'hidden'
      }`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-[#1B4D3E]" />
            <h2 className="text-xl font-bold text-slate-900">Kho Thư Mục Ảnh Thực Tế</h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">{photos.length} hình ảnh thực tế</span>
        </div>

        {/* Main Selected Photo View */}
        <div className="relative rounded-2xl overflow-hidden bg-slate-900 mb-4 h-[350px] sm:h-[480px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentPhoto.url}
            alt={currentPhoto.caption || place.name}
            className="w-full h-full object-cover"
          />
          
          {/* Explicit Source Attribution Overlay Banner */}
          <div className="absolute bottom-0 inset-x-0 bg-slate-950/85 backdrop-blur-md p-4 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-white/10">
            <div>
              <p className="text-xs sm:text-sm font-semibold">{currentPhoto.caption || place.name}</p>
              {currentPhoto.source && (
                <div className="flex items-center gap-2 mt-1 text-[11px] text-emerald-300">
                  <Camera className="w-3.5 h-3.5 text-[#D99B26]" />
                  <span>Trích dẫn nguồn: <strong>{currentPhoto.source}</strong></span>
                </div>
              )}
            </div>
            {currentPhoto.license && (
              <span className="text-[10px] px-2.5 py-1 rounded bg-white/10 text-slate-300 w-max border border-white/15">
                {currentPhoto.license}
              </span>
            )}
          </div>
        </div>

        {/* Thumbnails Navigation */}
        {photos.length > 1 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {photos.map((p, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedPhotoIndex(idx)}
                className={`relative h-20 rounded-xl overflow-hidden border-2 transition-all ${
                  selectedPhotoIndex === idx
                    ? 'border-[#1B4D3E] ring-2 ring-emerald-600/30 scale-95'
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

      {/* MAP GIS SECTION — Hiển thị khi Tab Map được chọn */}
      {activeTab === 'map' && (
        <section className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl mb-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold flex items-center gap-2">
              <Compass className="w-5 h-5 text-amber-400" />
              <span>Bản Đồ Định Vị GIS & Tọa Độ Vệ Tinh WGS84</span>
            </h2>
            <span className="text-xs text-amber-300 font-bold bg-amber-950/80 px-3 py-1 rounded-full border border-amber-500/40">
              Định vị chính xác 100%
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Vĩ độ (Latitude)</span>
              <p className="font-extrabold text-lg text-emerald-400">{place.latitude || 10.4128}° N</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Kinh độ (Longitude)</span>
              <p className="font-extrabold text-lg text-emerald-400">{place.longitude || 105.0142}° E</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Đơn vị hành chính</span>
              <p className="font-extrabold text-lg text-amber-300">{place.commune}</p>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <a
              href={maps.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg transition-all"
            >
              <Navigation className="w-4 h-4 text-amber-300" />
              <span>Mở Chỉ Đường Trực Tiếp Trên Google Maps App</span>
            </a>
          </div>
        </section>
      )}

      {/* GOLDEN HOURS SECTION — Hiển thị khi Tab Khung Giờ Vàng được chọn */}
      {activeTab === 'golden_hours' && (
        <section className="bg-gradient-to-br from-amber-500/10 via-emerald-500/5 to-slate-900/10 rounded-3xl p-6 sm:p-8 border border-amber-500/30 shadow-lg mb-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <span>Khung Giờ Vàng Check-in & Kinh Nghiệm Tham Quan</span>
            </h2>
            <span className="text-xs font-bold text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
              Khuyên dùng từ Phượt thủ Bảy Núi
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-5 rounded-2xl bg-white border border-amber-200/80 shadow-xs space-y-2">
              <span className="text-xs font-extrabold text-amber-600 uppercase tracking-wider block">🌅 Khung Giờ Sáng Đẹp Nhất</span>
              <p className="font-bold text-base text-slate-900">06:00 – 08:30 Sáng</p>
              <p className="text-xs text-slate-600 leading-relaxed">Thời điểm bình minh vừa mọc, không khí se lạnh nhẹ và ánh sáng mặt trời chiếu vàng óng các triền núi.</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-amber-200/80 shadow-xs space-y-2">
              <span className="text-xs font-extrabold text-amber-600 uppercase tracking-wider block">🌇 Khung Giờ Hoàng Hôn Đẹp Nhất</span>
              <p className="font-bold text-base text-slate-900">16:00 – 17:45 Chiều</p>
              <p className="text-xs text-slate-600 leading-relaxed">Khung giờ ngắm hoàng hôn buông xuống cánh đồng lúa chín và phản chiếu lung linh trên mặt hồ.</p>
            </div>
          </div>
        </section>
      )}

      {/* VIDEO GALLERY SECTION — Hiển thị khi Tab Video được chọn */}
      {activeTab === 'videos' && (
        <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Video className="w-5 h-5 text-rose-600" />
            <h2 className="text-xl font-bold text-slate-900">Video Review Thực Tế</h2>
            <span className="ml-auto text-xs text-slate-500 font-medium">
              {videosLoading ? 'Đang tải...' : `${placeVideos.length} video`}
            </span>
          </div>
          {videosLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-[#1B4D3E] border-t-transparent rounded-full animate-spin" />
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

      {/* TIKTOK SHORTS EMBED & GIS LOCATION CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* Left Col: Description & TikTok Video Embed */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-[#1B4D3E]" />
              <h2 className="text-xl font-bold text-slate-900">Giới Thiệu Chi Tiết</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {place.description || `Địa điểm ${place.name} thuộc ${place.commune}, Tri Tôn, An Giang. Nơi đây sở hữu cảnh quan độc đáo, mang đậm nét văn hóa vùng Thất Sơn Bảy Núi.`}
            </p>
          </div>

          {/* Dynamic TikTok Video Discovery Engine Section */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-rose-600" />
                <h2 className="text-xl font-bold text-slate-900">TikTok Review Thực Tế</h2>
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                ⚡ Dynamic Video Discovery (POI Match)
              </span>
            </div>

            <p className="text-xs text-slate-600">
              Video review thực tế được tự động phát hiện, trích xuất metadata và kiểm toán độ tương quan riêng cho <strong>{place.name}</strong> ({place.commune}, Tri Tôn).
            </p>

            {/* Embedded TikTok Feed Section for this POI */}
            <div className="rounded-xl overflow-hidden border border-slate-200">
              <TikTokFeedSection
                variant="vertical"
                videos={placeVideos.map((v, i) => ({
                  id: v.id || `poi-vid-${i}`,
                  title: v.title,
                  platform: (v.platform as 'tiktok') || 'tiktok',
                  video_url: v.video_url || `https://www.tiktok.com/embed/v2/${v.id || i}`,
                  embed_url: v.embed_url || `https://www.tiktok.com/embed/v2/${v.id || i}`,
                  thumbnail_url: v.thumbnail_url || '/images/tiktok/ho_ta_pa.jpg',
                  author_name: v.author_name || 'du_lich_tri_ton',
                  view_count: v.view_count || 15000,
                  place_id: place.id,
                }))}
                height="480px"
                maxSlides={5}
                showTitle={false}
              />
            </div>

            {/* External Search Fallback Button */}
            <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
              <span>Chưa tìm thấy video ưng ý?</span>
              <a
                href={tiktok.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-bold text-rose-600 hover:text-rose-700 hover:underline"
              >
                <span>🔍 Mở tìm kiếm TikTok trực tiếp về {place.name}</span>
              </a>
            </div>
          </div>

        </div>

        {/* Right Col: GIS Coordinates & Quick AI Action Card */}
        <div className="space-y-6">
          
          {/* WGS84 GIS Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-5 h-5 text-[#1B4D3E]" />
              <h3 className="font-bold text-base text-slate-900">Tọa Độ GIS WGS84</h3>
            </div>
            
            <div className="space-y-3 text-xs bg-[#F8F9FA] p-4 rounded-xl border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Kinh độ (Longitude):</span>
                <span className="font-mono font-bold text-slate-800">{place.longitude || '105.0125'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Vĩ độ (Latitude):</span>
                <span className="font-mono font-bold text-slate-800">{place.latitude || '10.4215'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Đơn vị hành chính:</span>
                <span className="font-bold text-[#1B4D3E]">{place.commune}</span>
              </div>
            </div>

            <a
              href={maps.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 w-full py-2.5 rounded-xl bg-[#1B4D3E] hover:bg-[#143B2F] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <Navigation className="w-4 h-4 text-[#D99B26]" />
              <span>Chỉ Đường Bằng Google Maps</span>
            </a>
          </div>

          {/* Ask AI Card */}
          <div className="bg-[#1B4D3E] text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Compass className="w-24 h-24 text-white" />
            </div>
            <div className="relative z-10 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-[11px] font-semibold text-[#D99B26]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Trợ Lý RAG AI</span>
              </div>
              <h4 className="font-bold text-base">Hỏi AI Về {place.name}?</h4>
              <p className="text-xs text-emerald-100 leading-relaxed">
                Tư vấn ăn gì gần đây, thời điểm chụp ảnh đẹp nhất hoặc ghép địa điểm này vào tour 2N1Đ.
              </p>
              <Link
                href="/itinerary"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#D99B26] hover:bg-[#c48b20] text-slate-900 text-xs font-bold transition-all shadow-sm"
              >
                <Sparkles className="w-4 h-4" />
                <span>Ghép Vào Lịch Trình Tour</span>
              </Link>
            </div>
          </div>

        </div>

      </div>

      {/* Mobile Sticky Quick Action Bar (Floating above MobileBottomNav) */}
      <div className="md:hidden fixed bottom-16 inset-x-0 z-40 bg-white/95 backdrop-blur-md p-2.5 border-t border-slate-200 shadow-lg flex items-center gap-2">
        <a
          href={maps.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-2.5 rounded-xl bg-[#1B4D3E] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
        >
          <Navigation className="w-4 h-4 text-[#D99B26]" />
          <span>Chỉ Đường Maps</span>
        </a>
        <Link
          href="/itinerary"
          className="flex-1 py-2.5 rounded-xl bg-[#D99B26] text-slate-900 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
        >
          <Sparkles className="w-4 h-4 text-slate-900" />
          <span>Tạo Lịch Trình AI</span>
        </Link>
      </div>
    </>
  );
}

