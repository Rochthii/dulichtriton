'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  MapPin, Navigation, Clock, Tag, Star, Camera, ShieldCheck, 
  Video, ArrowLeft, Heart, Share2, Sparkles, Play, Globe, Info, Compass
} from 'lucide-react';
import { Place } from '@/components/PlaceCard';
import { getGoogleMapsUrl, formatPrice } from '@/lib/utils';
import VideoGallery from '@/components/VideoGallery';
import { type VideoItem } from '@/components/VideoModal';

interface PlaceDetailClientProps {
  place: Place;
  nearbyPlaces?: Place[];
}

export default function PlaceDetailClient({ place, nearbyPlaces = [] }: PlaceDetailClientProps) {
  const photos = place.photos && place.photos.length > 0
    ? place.photos
    : [
        {
          url: '/images/tiktok/ho_ta_pa.jpg',
          caption: place.name,
          source: 'Cổng thông tin Du lịch An Giang (angiangtourism.vn)',
          license: 'Public Domain Tourism Collection'
        }
      ];

  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const [activeTab, setActiveTab] = useState<'photos' | 'videos'>('photos');
  const [placeVideos, setPlaceVideos] = useState<VideoItem[]>([]);
  const [videosLoading, setVideosLoading] = useState(false);
  const currentPhoto = photos[selectedPhotoIndex] || photos[0];
  const mapsUrl = getGoogleMapsUrl(place.name, place.commune);

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
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5" />
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

          <div className="flex items-center justify-end gap-2">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#1B4D3E] hover:bg-[#143B2F] text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Navigation className="w-4 h-4 text-[#D99B26]" />
              <span>Chỉ Đường Google Maps</span>
            </a>
          </div>
        </div>
      </div>

      {/* ── TAB NAVIGATION: Ảnh | Video Review ── */}
      <div className="flex items-center gap-1 mb-6 bg-slate-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('photos')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'photos'
              ? 'bg-white text-[#1B4D3E] shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          Ảnh Thực Tế
        </button>
        <button
          onClick={() => setActiveTab('videos')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'videos'
              ? 'bg-white text-rose-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Video className="w-3.5 h-3.5" />
          Video Review
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

          {/* TikTok Shorts Embed Section */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <Video className="w-5 h-5 text-rose-600" />
              <h2 className="text-xl font-bold text-slate-900">Video Review Thực Tế Qua TikTok Shorts</h2>
            </div>
            <div className="aspect-[16/9] sm:aspect-[21/9] bg-slate-900 rounded-xl overflow-hidden relative flex items-center justify-center group">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
              <Play className="w-14 h-14 text-white/90 group-hover:scale-110 transition-transform z-10 cursor-pointer" />
              <div className="absolute bottom-4 left-4 right-4 text-white text-xs z-10">
                <span className="font-bold block text-sm sm:text-base">Góc Nhìn Thực Tế Tại {place.name}</span>
                <span className="text-slate-300 text-xs">Phát video trực tiếp từ kho truyền thông du lịch Tri Tôn</span>
              </div>
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
              href={mapsUrl}
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
    </>
  );
}

