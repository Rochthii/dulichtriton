'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Star, Clock, Navigation, Play, Heart, ChevronRight, Award, Flame } from 'lucide-react';
import { resolvePlaceExternalLinks } from '@/lib/externalLinks';
import { parseTravelGuide, sanitizeDescription, getCategoryFallbackImage } from '@/lib/dataSanitizer';
import { getOptimizedImageUrl } from '@/lib/imageOptimizer';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export interface PlacePhoto {
  url: string;
  caption?: string;
  source?: string;
  license?: string;
}

export interface Place {
  id: string;
  place_id: string;
  name: string;
  slug?: string;
  category: string;
  tourism_category?: string;
  description?: string;
  detailed_story?: string;
  travel_guide?: any;
  travel_guide_json?: any;
  checkin_spots?: any;
  highlights?: any;
  nearby_cafes_and_food?: any;
  google_maps_info?: any;
  tags_info?: any;
  tags_json?: any;
  tiktok_videos?: any;
  review_samples?: any;
  best_visit_time?: string;
  best_time?: string;
  address: string;
  commune: string;
  latitude: number;
  longitude: number;
  opening_hours?: string;
  price_level?: string;
  rating?: number;
  review_count?: number;
  confidence_score?: number;
  photos?: PlacePhoto[];
  image_url?: string;
  video_url?: string;
  phone?: string;
  ticket_required?: boolean;
  is_hot?: boolean;
  hot_rank?: number;
  open_late?: boolean;
  night_hours?: string;
  field_tips?: string;
  is_active?: boolean;
}

interface PlaceCardProps {
  place: Place;
}

const CATEGORY_LABELS: Record<string, string> = {
  nature: 'Thiên Nhiên',
  culture: 'Chùa & Di Sản',
  spiritual: 'Chùa Khmer',
  history: 'Di Tích Lịch Sử',
  food: 'Đặc Sản Ẩm Thực',
  gastronomy: 'Ẩm Thực',
  stay: 'Lưu Trú',
  'check-in': 'Check-in Hot',
};

export default function PlaceCard({ place }: PlaceCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const { language, dict } = useLanguage();
  const isEn = language === 'en';

  useEffect(() => {
    try {
      const favs: string[] = JSON.parse(localStorage.getItem('triton_fav_places') || '[]');
      setIsLiked(favs.includes(place.id || place.slug || ''));
    } catch {
      // ignore
    }
  }, [place.id, place.slug]);

  const handleToggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nextState = !isLiked;
    setIsLiked(nextState);
    try {
      const key = 'triton_fav_places';
      const favs: string[] = JSON.parse(localStorage.getItem(key) || '[]');
      const id = place.id || place.slug || '';
      if (nextState) {
        if (!favs.includes(id)) favs.push(id);
      } else {
        const idx = favs.indexOf(id);
        if (idx >= 0) favs.splice(idx, 1);
      }
      localStorage.setItem(key, JSON.stringify(favs));
    } catch {
      // ignore
    }
  };

  const displayName = language === 'en' && (place as any).name_en ? (place as any).name_en : place.name;
  const rawDescription = language === 'en' && (place as any).description_en ? (place as any).description_en : place.description;
  const cleanDescription = sanitizeDescription(rawDescription, displayName, place.commune, place.category);

  const { maps, tiktok } = resolvePlaceExternalLinks({
    name: place.name,
    commune: place.commune,
    category: place.category,
    lat: place.latitude,
    lng: place.longitude,
    video_url: place.video_url,
    tiktok_videos: (place as any).tiktok_videos,
  });

  const fallbackImg = getCategoryFallbackImage(place.category, place.name);
  let resolvedCoverUrl = fallbackImg;

  if (place.image_url && typeof place.image_url === 'string' && place.image_url.trim()) {
    resolvedCoverUrl = place.image_url;
  } else if (Array.isArray(place.photos) && place.photos.length > 0) {
    const p0 = place.photos[0];
    const pUrl = typeof p0 === 'string' ? p0 : p0?.url;
    if (pUrl && typeof pUrl === 'string' && pUrl.trim()) {
      resolvedCoverUrl = pUrl;
    }
  }

  const categoryLabel = language === 'en' && (place as any).category_en
    ? (place as any).category_en
    : (place.tourism_category || CATEGORY_LABELS[place.category] || 'Điểm Đến');
    
  const detailUrl = `/places/${place.slug || place.id}`;

  return (
    <div className="group relative bg-[#FFFDF7] rounded-[24px] sm:rounded-[28px] overflow-hidden border-2 border-amber-400/80 shadow-[0_4px_20px_rgba(240,163,47,0.12)] hover:shadow-[0_12px_32px_rgba(240,163,47,0.22)] hover:border-amber-500 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between font-body">
      <div>
        {/* Image Header with Scrim */}
        <Link href={detailUrl} prefetch={true} className="block relative aspect-[4/3] w-full overflow-hidden bg-slate-900 cursor-pointer">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={getOptimizedImageUrl(resolvedCoverUrl, { width: 800, dpr: 2, quality: 'best' })}
            alt={displayName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

          {/* Top Badges */}
          <div className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 flex items-center gap-1.5 pointer-events-none">
            {place.is_hot ? (
              <span className="px-2.5 py-1 rounded-xl bg-[#F0A32F] text-[#26221B] font-black text-[10px] sm:text-xs uppercase tracking-wider flex items-center gap-1 shadow-sm font-display">
                <Flame className="w-3 h-3 text-[#26221B] fill-[#26221B]" />
                <span>HOT #{place.hot_rank || 1}</span>
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-xl bg-[#F0A32F] text-[#26221B] font-black text-[10px] sm:text-xs uppercase tracking-wider flex items-center gap-1 shadow-sm font-display">
                <Award className="w-3 h-3 text-[#26221B]" />
                <span>{categoryLabel}</span>
              </span>
            )}
          </div>

          {/* Rating & Favorite Badges */}
          <div className="absolute top-2.5 sm:top-3 right-2.5 sm:right-3 flex items-center gap-1.5 z-10" onClick={(e) => e.stopPropagation()}>
            <span className="px-2.5 py-1 rounded-xl bg-white/95 backdrop-blur-md text-[#26221B] font-black text-[10px] sm:text-xs flex items-center gap-1 shadow-sm font-display pointer-events-none">
              <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
              <span>{place.rating || 4.8}</span>
            </span>

            <button
              type="button"
              onClick={handleToggleLike}
              className={`p-1.5 rounded-xl backdrop-blur-md transition-all cursor-pointer ${
                isLiked
                  ? 'bg-[#F26B3A] text-white shadow-xs'
                  : 'bg-white/80 text-[#26221B] hover:text-[#F26B3A]'
              }`}
              title={language === 'en' ? 'Save to favorites' : 'Lưu địa điểm yêu thích'}
            >
              <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-white' : ''}`} />
            </button>
          </div>

          {/* Bottom Text on Photo */}
          <div className="absolute bottom-2.5 sm:bottom-3 left-3 right-3 text-white space-y-0.5">
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-[#FFD37A] drop-shadow-sm block font-mono">
              {place.commune}
            </span>
            <h3 className="font-display font-extrabold text-sm sm:text-base leading-snug text-white group-hover:text-[#FFD37A] transition-colors line-clamp-1 drop-shadow-md">
              {displayName}
            </h3>
          </div>
        </Link>

        {/* Content Details */}
        <Link href={detailUrl} prefetch={true} className="block p-3.5 sm:p-4 space-y-2 text-xs text-[#6B6355] cursor-pointer hover:bg-amber-50/30 transition-colors">
          {cleanDescription && (
            <p className="text-xs text-[#6B6355] line-clamp-2 leading-relaxed font-body">
              {cleanDescription}
            </p>
          )}
        </Link>
      </div>

      {/* Card Footer Actions */}
      <div className="p-3.5 sm:p-4 pt-0 border-t border-[#EBE1D0]/70 flex items-center justify-between gap-2">
        <Link
          href={detailUrl}
          className="text-xs sm:text-sm font-extrabold text-[#0E8C7F] hover:text-[#085A52] flex items-center gap-1 transition-colors font-display"
        >
          <span>{dict.common?.actions?.viewDetail || (isEn ? 'View Details' : 'Xem chi tiết')}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>

        <div className="flex items-center gap-1.5">
          {tiktok?.url && (
            <a
              href={tiktok.url}
              target="_blank"
              rel="noreferrer"
              title={isEn ? 'Watch TikTok Video' : 'Xem Video TikTok'}
              className="p-1.5 sm:p-2 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/60 transition-colors"
            >
              <Play className="w-3 h-3 fill-rose-600 text-rose-600" />
            </a>
          )}
          <a
            href={maps.url}
            target="_blank"
            rel="noreferrer"
            className="px-3 sm:px-3.5 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/60 font-bold text-[11px] sm:text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Navigation className="w-3 h-3 text-emerald-600" />
            <span>{dict.common?.actions?.directions || (isEn ? 'Directions' : 'Chỉ đường')}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
