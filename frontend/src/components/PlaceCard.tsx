'use client';

import React from 'react';
import { CatalogCard } from '@/components/CatalogUI';
import SavePlaceButton from '@/components/SavePlaceButton';
import { VerifiedStamp } from '@/components/FolkModernDesignSystem';
import Link from 'next/link';
import { Star, Navigation, Play, ChevronRight, Award, Flame } from 'lucide-react';
import { resolvePlaceExternalLinks } from '@/lib/externalLinks';
import { sanitizeDescription, getCategoryFallbackImage } from '@/lib/dataSanitizer';
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
    <CatalogCard data-place={place.slug || place.id}>
      <div>
        {/* Image Header with Scrim */}
        <div className="relative aspect-[4/3]">
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
          <div className="absolute top-2 sm:top-3 left-2 sm:left-3 max-w-[50%] flex items-center gap-1 sm:gap-1.5 pointer-events-none">
              <span style={{ backgroundColor: `color-mix(in srgb, ${categoryColor} 15%, var(--surface))`, borderColor: categoryColor }} className="px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full border text-[var(--ink)] font-bold text-[9px] sm:text-xs flex items-center gap-1 shadow-sm font-display truncate">
                {place.is_hot ? <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" /> : <Award className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />}
                <span className="truncate">{categoryLabel}</span>
              </span>
          </div>

          </Link>
          {/* Separate controls from the detail link for valid keyboard navigation. */}
          <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex items-center gap-1 sm:gap-1.5 z-10" onClick={(e) => e.stopPropagation()}>
            <span className="px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-lg sm:rounded-xl bg-white/95 backdrop-blur-md text-[#26221B] font-black text-[9px] sm:text-xs flex items-center gap-0.5 sm:gap-1 shadow-sm font-display pointer-events-none">
              <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-400 text-amber-500 shrink-0" />
              <span>{typeof place.rating === 'number' ? place.rating : 'Chưa có đánh giá'}</span>
            </span>

            <SavePlaceButton place={place} compact />
          </div>

          {/* Verified Stamp (12deg) if authenticated */}
          {Boolean(place.is_verified || place.verification_status === 'VERIFIED') && (
            <div className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 pointer-events-none z-10 scale-[0.55] sm:scale-[0.65] origin-bottom-right">
              <VerifiedStamp label="Xác minh" variant="jade" />
            </div>
          )}

          {/* Bottom Text on Photo */}
          <Link href={detailUrl} className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 right-2 sm:right-3 text-white space-y-0.5">
            <span className="text-[9px] sm:text-[11px] font-black uppercase tracking-wider text-[#FFD37A] drop-shadow-sm block font-mono truncate">
              {place.commune}
            </span>
            <h3 className="font-display font-extrabold text-xs sm:text-base leading-snug text-white group-hover:text-[#FFD37A] transition-colors line-clamp-1 drop-shadow-md">
              {place.name}
            </h3>
          </Link>
        </div>

        {/* Content Details */}
        <Link href={detailUrl} prefetch={true} className="block p-2.5 sm:p-4 space-y-1 sm:space-y-2 text-xs text-[#6B6355] cursor-pointer hover:bg-amber-50/30 transition-colors">
          {cleanDescription && (
            <p className="text-[11px] sm:text-xs text-[#6B6355] line-clamp-2 leading-relaxed font-body">
              {cleanDescription}
            </p>
          )}
        </Link>
      </div>

      {/* Card Footer Actions */}
      <div className="p-2 sm:p-3 md:p-4 pt-0 border-t border-[#EBE1D0]/70 flex items-center justify-between gap-1 sm:gap-2">
        <Link
          href={detailUrl}
          className="min-h-8 sm:min-h-11 inline-flex items-center text-[11px] sm:text-xs md:text-sm font-extrabold text-[#0E8C7F] hover:text-[#085A52] gap-0.5 sm:gap-1 transition-colors font-display truncate"
        >
          <span>Xem chi tiết</span>
          <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
        </Link>

        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {tiktok?.url && (
            <a
              href={tiktok.url}
              target="_blank"
              rel="noreferrer"
              title="Xem Video TikTok"
              className="min-h-8 min-w-8 sm:min-h-11 sm:min-w-11 inline-flex items-center justify-center rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/60 transition-colors"
            >
              <Play className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-rose-600 text-rose-600" />
            </a>
          )}
          <a
            href={maps.url}
            target="_blank"
            rel="noreferrer"
            aria-label={`Chỉ đường đến ${place.name}`}
            className="min-h-8 sm:min-h-11 px-2.5 sm:px-3.5 py-1 sm:py-1.5 btn-palm text-[11px] sm:text-xs flex items-center justify-center gap-1 rounded-full"
          >
            <Navigation className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-700 stroke-[2.25] translate-y-[-0.5px] translate-x-[0.5px] shrink-0" />
            <span>Chỉ đường</span>
          </a>
        </div>
      </div>
    </CatalogCard>
  );
}
