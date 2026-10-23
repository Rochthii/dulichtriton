'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Star, Clock, Navigation, Play, Heart, ChevronRight, Award, Flame } from 'lucide-react';
import { resolvePlaceExternalLinks } from '@/lib/externalLinks';
import { parseTravelGuide, sanitizeDescription, getCategoryFallbackImage } from '@/lib/dataSanitizer';
import { getOptimizedImageUrl } from '@/lib/imageOptimizer';

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
  canonical_id?: string;
  is_verified?: boolean;
  verification_status?: string;
  review_id?: string;
  source_url?: string;
  verified_at?: string;
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

const CATEGORY_TOKENS: Record<string, string> = {
  nature: '--cat-nature', culture: '--cat-culture', spiritual: '--cat-culture',
  history: '--cat-history', food: '--cat-food', gastronomy: '--cat-food',
  stay: '--cat-stay', festival: '--cat-festival', 'check-in': '--cat-nature',
};

export default function PlaceCard({ place }: PlaceCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [saveError, setSaveError] = useState('');

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
    setSaveError('');
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
      setIsLiked(nextState);
    } catch {
      setSaveError('Chưa lưu được trên thiết bị này. Hãy kiểm tra quyền lưu trữ của trình duyệt.');
    }
  };

  const { maps, tiktok } = resolvePlaceExternalLinks({
    name: place.name,
    commune: place.commune,
    category: place.category,
    lat: place.latitude,
    lng: place.longitude,
    video_url: place.video_url,
    tiktok_videos: (place as any).tiktok_videos,
  });

  const cleanDescription = sanitizeDescription(place.description, place.name, place.commune, place.category);

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

  const categoryLabel = CATEGORY_LABELS[place.tourism_category || ''] || place.tourism_category || CATEGORY_LABELS[place.category] || 'Điểm Đến';
  const categoryColor = `var(${CATEGORY_TOKENS[place.category] || '--jade'})`;
  const detailUrl = `/places/${place.slug || place.id}`;

  return (
    <div className="group relative bg-[var(--surface)] rounded-[var(--r-l)] overflow-hidden border border-[#26221B]/10 shadow-[var(--shadow-1)] hover:shadow-[var(--shadow-2)] hover:border-[#0E8C7F]/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between font-body">
      <div>
        {/* Image Header with Scrim */}
        <div className="relative aspect-[4/3] overflow-hidden">
        <Link href={detailUrl} prefetch={true} className="block relative h-full w-full overflow-hidden bg-slate-900 cursor-pointer">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={getOptimizedImageUrl(resolvedCoverUrl, { width: 800, dpr: 2, quality: 'best' })}
            alt={place.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

          {/* Top Badges */}
          <div className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 max-w-[45%] flex items-center gap-1.5 pointer-events-none">
              <span style={{ backgroundColor: `color-mix(in srgb, ${categoryColor} 15%, var(--surface))`, borderColor: categoryColor }} className="px-2.5 py-1 rounded-full border text-[var(--ink)] font-bold text-[10px] sm:text-xs flex items-center gap-1 shadow-sm font-display">
                {place.is_hot ? <Flame className="w-3 h-3 shrink-0" /> : <Award className="w-3 h-3 shrink-0" />}
                <span>{categoryLabel}</span>
              </span>
          </div>

          </Link>
          {/* Separate controls from the detail link for valid keyboard navigation. */}
          <div className="absolute top-2.5 sm:top-3 right-2.5 sm:right-3 flex items-center gap-1.5 z-10" onClick={(e) => e.stopPropagation()}>
            <span className="px-2.5 py-1 rounded-xl bg-white/95 backdrop-blur-md text-[#26221B] font-black text-[10px] sm:text-xs flex items-center gap-1 shadow-sm font-display pointer-events-none">
              <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
              <span>{typeof place.rating === 'number' ? place.rating : 'Chưa có đánh giá'}</span>
            </span>

            <button
              type="button"
              onClick={handleToggleLike}
              className={`min-h-11 min-w-11 inline-flex items-center justify-center rounded-full backdrop-blur-md transition-all ${
                isLiked
                  ? 'bg-[#F26B3A] text-white shadow-xs'
                  : 'bg-white/80 text-[#26221B] hover:text-[#F26B3A]'
              }`}
              title="Lưu địa điểm yêu thích"
              aria-label={isLiked ? `Bỏ lưu ${place.name}` : `Lưu ${place.name}`}
              aria-pressed={isLiked}
            >
              <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-white' : ''}`} />
            </button>
          </div>

          {/* Bottom Text on Photo */}
          <Link href={detailUrl} className="absolute bottom-2.5 sm:bottom-3 left-3 right-3 text-white space-y-0.5">
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-[#FFD37A] drop-shadow-sm block font-mono">
              {place.commune}
            </span>
            <h3 className="font-display font-extrabold text-sm sm:text-base leading-snug text-white group-hover:text-[#FFD37A] transition-colors line-clamp-1 drop-shadow-md">
              {place.name}
            </h3>
          </Link>
        </div>
        <div className="sr-only" aria-live="polite">{isLiked ? `Đã lưu ${place.name}` : ''}</div>
        {saveError && <p role="status" className="px-4 py-2 text-xs text-[#A6503A]">{saveError}</p>}

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
          <span>Xem chi tiết</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>

        <div className="flex items-center gap-1.5">
          {tiktok?.url && (
            <a
              href={tiktok.url}
              target="_blank"
              rel="noreferrer"
              title="Xem Video TikTok"
              className="min-h-11 min-w-11 inline-flex items-center justify-center rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/60 transition-colors"
            >
              <Play className="w-3 h-3 fill-rose-600 text-rose-600" />
            </a>
          )}
          <a
            href={maps.url}
            target="_blank"
            rel="noreferrer"
            className="min-h-11 px-3 sm:px-3.5 py-1.5 btn-palm text-[11px] sm:text-xs flex items-center gap-1.5"
          >
            <Navigation className="w-3 h-3 text-emerald-600" />
            <span>Chỉ đường</span>
          </a>
        </div>
      </div>
    </div>
  );
}
