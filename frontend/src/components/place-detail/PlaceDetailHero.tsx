'use client';

import React from 'react';
import Link from 'next/link';
import { 
  MapPin, Navigation, Star, ArrowLeft, Heart, Share2, 
  Play, Compass, Award, Smartphone, Check
} from 'lucide-react';
import { Place } from '@/components/PlaceCard';
import { getOptimizedImageUrl } from '@/lib/imageOptimizer';
import PoiWeatherWidget from '@/components/PoiWeatherWidget';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface PlaceDetailHeroProps {
  place: Place;
  displayName: string;
  photos: { url: string; caption: string; source: string; license: string }[];
  selectedPhotoIndex: number;
  setSelectedPhotoIndex: (idx: number) => void;
  isBookmarked: boolean;
  setIsBookmarked: (v: boolean | ((prev: boolean) => boolean)) => void;
  showShareToast: boolean;
  setShowShareToast: (v: boolean) => void;
  distanceKm: number | null;
  drivingMinutes: number | null;
  userGpsCoords: { latitude: number; longitude: number } | null;
  isLocatingGps: boolean;
  gpsError: string;
  onFetchGps: () => void;
  mapsUrl: string;
  tiktokUrl?: string;
}

export default function PlaceDetailHero({
  place,
  displayName,
  photos,
  selectedPhotoIndex,
  setSelectedPhotoIndex,
  isBookmarked,
  setIsBookmarked,
  showShareToast,
  setShowShareToast,
  distanceKm,
  drivingMinutes,
  userGpsCoords,
  isLocatingGps,
  gpsError,
  onFetchGps,
  mapsUrl,
  tiktokUrl,
}: PlaceDetailHeroProps) {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const currentPhoto = photos[selectedPhotoIndex] || photos[0];

  const handleShare = async () => {
    const shareData = {
      title: `${displayName} — Du Lịch Tri Tôn`,
      text: place.description || `Khám phá ${displayName} tại ${place.commune}, Tri Tôn`,
      url: typeof window !== 'undefined' ? window.location.href : '',
    };
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // Fallback to clipboard
      }
    } else if (typeof navigator !== 'undefined') {
      await navigator.clipboard.writeText(window.location.href);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2500);
    }
  };

  return (
    <section className="space-y-4 font-body">
      {/* Top Breadcrumb & Quick Actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/places"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFFDF7] border border-[#26221B]/10 text-xs font-bold text-[#6B6355] hover:text-[#26221B] transition-colors shadow-2xs font-display"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{isEn ? "Back to Catalog" : "Quay lại danh mục"}</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsBookmarked((prev) => !prev)}
            title={isBookmarked ? "Bỏ lưu" : "Lưu địa điểm"}
            className={`p-2 rounded-full border transition-all cursor-pointer ${
              isBookmarked
                ? "bg-rose-50 border-rose-300 text-rose-600"
                : "bg-[#FFFDF7] border-[#26221B]/10 text-[#6B6355] hover:text-rose-600"
            }`}
          >
            <Heart className={`w-4 h-4 ${isBookmarked ? "fill-rose-600" : ""}`} />
          </button>

          <button
            onClick={handleShare}
            title="Chia sẻ địa điểm"
            className="p-2 rounded-full bg-[#FFFDF7] border border-[#26221B]/10 text-[#6B6355] hover:text-[#26221B] transition-colors cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showShareToast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2 rounded-2xl bg-[#26221B] text-white text-xs font-bold shadow-lg flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{isEn ? "Link copied to clipboard!" : "Đã sao chép liên kết vào bộ nhớ tạm!"}</span>
        </div>
      )}

      {/* Hero Visual Card */}
      <div className="relative overflow-hidden rounded-[28px] sm:rounded-[36px] bg-slate-900 border border-[#26221B]/10 shadow-md aspect-[16/10] sm:aspect-[21/9] max-h-[480px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={getOptimizedImageUrl(currentPhoto.url, { width: 1400, dpr: 2, quality: 'best' })}
          alt={displayName}
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />

        {/* Top Badges on Hero Image */}
        <div className="absolute top-3 sm:top-5 left-3 sm:left-5 flex flex-wrap items-center gap-2 font-display">
          <span className="px-3 py-1 rounded-full bg-[#F0A32F] text-[#26221B] font-black text-xs uppercase tracking-wider flex items-center gap-1 shadow-sm">
            <Award className="w-3.5 h-3.5 text-[#26221B]" />
            <span>{place.tourism_category || place.category}</span>
          </span>
          <span className="px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-[#26221B] font-extrabold text-xs flex items-center gap-1 shadow-sm">
            <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
            <span>{place.rating || 4.9}</span>
          </span>
        </div>

        {/* Bottom Hero Title & Telemetry */}
        <div className="absolute bottom-3 sm:bottom-6 left-3 sm:left-6 right-3 sm:right-6 text-white space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-300 font-mono">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>{place.commune}, Tri Tôn, An Giang</span>
          </div>

          <h1 className="font-display text-xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight drop-shadow-md">
            {displayName}
          </h1>

          {/* Action CTAs inside Hero */}
          <div className="flex flex-wrap items-center gap-2 pt-1 font-display">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-full bg-[#0E8C7F] hover:bg-[#085A52] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Navigation className="w-3.5 h-3.5 text-emerald-300" />
              <span>{isEn ? "Google Maps Navigation" : "Chỉ đường Google Maps"}</span>
            </a>

            {tiktokUrl && (
              <a
                href={tiktokUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Play className="w-3.5 h-3.5 fill-white text-white" />
                <span>{isEn ? "Watch Video Review" : "Xem Video Review"}</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Photo Thumbnails if multiple */}
      {photos.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {photos.map((p, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedPhotoIndex(idx)}
              className={`relative h-14 w-20 sm:h-16 sm:w-24 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                selectedPhotoIndex === idx ? "border-[#0E8C7F] scale-105 shadow-sm" : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* GPS Telemetry & Weather Quick Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* GPS Distance Widget */}
        <div className="p-3.5 rounded-2xl bg-[#FFFDF7] border border-[#26221B]/8 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-[#0E8C7F]">
              <Compass className="w-4 h-4" />
            </span>
            <div>
              <span className="text-[11px] font-bold text-[#6B6355] block font-display">
                {userGpsCoords ? (isEn ? "From Your Current Location:" : "Từ vị trí hiện tại của bạn:") : (isEn ? "From Tri Ton Center:" : "Từ TT. Tri Tôn:")}
              </span>
              <span className="text-xs font-extrabold text-[#26221B] font-mono">
                {distanceKm !== null ? `~${distanceKm} km (${drivingMinutes} phút lái xe)` : "Chưa có tọa độ"}
              </span>
            </div>
          </div>
          <button
            onClick={onFetchGps}
            disabled={isLocatingGps}
            className="text-[11px] font-bold text-[#0E8C7F] hover:underline flex items-center gap-1 cursor-pointer font-display"
          >
            <Smartphone className="w-3 h-3" />
            <span>{isLocatingGps ? (isEn ? "Locating..." : "Đang tìm...") : (isEn ? "GPS Check" : "Định vị")}</span>
          </button>
        </div>

        {/* Micro-climate Weather Widget */}
        <PoiWeatherWidget 
          latitude={Number(place.latitude)} 
          longitude={Number(place.longitude)} 
          placeName={place.name} 
          category={place.category}
        />
      </div>
      {gpsError && <p className="text-[11px] text-rose-600 font-medium px-2">{gpsError}</p>}
    </section>
  );
}
