'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Star, Clock, Tag, Navigation, Play, Camera, Heart, Ticket, Utensils, Sun, Sunset } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { resolvePlaceExternalLinks } from '@/lib/externalLinks';
import { parseTravelGuide, sanitizeDescription } from '@/lib/dataSanitizer';
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
  is_active?: boolean;
}

interface PlaceCardProps {
  place: Place;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string; label: string }> = {
  nature: { bg: 'bg-[#0E8C7F]/90', text: 'text-white', border: 'border-[#0E8C7F]/30', label: 'Thiên Nhiên' },
  culture: { bg: 'bg-[#D9822B]/90', text: 'text-white', border: 'border-[#D9822B]/30', label: 'Di Sản & Chùa' },
  history: { bg: 'bg-[#A6503A]/90', text: 'text-white', border: 'border-[#A6503A]/30', label: 'Lịch Sử' },
  food: { bg: 'bg-[#F26B3A]/90', text: 'text-white', border: 'border-[#F26B3A]/30', label: 'Ẩm Thực' },
  gastronomy: { bg: 'bg-[#F26B3A]/90', text: 'text-white', border: 'border-[#F26B3A]/30', label: 'Ẩm Thực' },
  stay: { bg: 'bg-[#0E8C7F]/90', text: 'text-white', border: 'border-[#0E8C7F]/30', label: 'Lưu Trú' },
  'check-in': { bg: 'bg-[#F0A32F]/90', text: 'text-[#26221B]', border: 'border-[#F0A32F]/30', label: 'Check-in' },
};

export default function PlaceCard({ place }: PlaceCardProps) {
  const [isLiked, setIsLiked] = useState(false);

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

  const { maps, tiktok } = resolvePlaceExternalLinks({
    name: place.name,
    commune: place.commune,
    category: place.category,
    lat: place.latitude,
    lng: place.longitude,
    video_url: place.video_url,
  });

  const guide = parseTravelGuide(place.travel_guide_json || place.travel_guide);
  const cleanDescription = sanitizeDescription(place.description, place.name, place.commune, place.category);

  const isGaDotOThum =
    place.name.toLowerCase().includes('gà đốt') ||
    place.name.toLowerCase().includes('ô thum') ||
    (place.address && place.address.toLowerCase().includes('ô thum') && place.category.includes('food'));

  const bestTimeStr = (place.best_time || place.best_visit_time || '').toLowerCase();
  let bestTimeBadge = null;
  if (bestTimeStr.includes('sáng') || bestTimeStr.includes('6:00') || bestTimeStr.includes('7:00')) {
    bestTimeBadge = { icon: Sun, label: '06:00 - 08:30 (Sáng)' };
  } else if (bestTimeStr.includes('hoàng hôn') || bestTimeStr.includes('chiều') || bestTimeStr.includes('16:00') || bestTimeStr.includes('17:00')) {
    bestTimeBadge = { icon: Sunset, label: '16:00 - 17:30 (Chiều)' };
  } else if (place.category.includes('food')) {
    bestTimeBadge = { icon: Utensils, label: '11:00 - 13:30 (Trưa)' };
  }

  const coverPhoto =
    place.photos && place.photos.length > 0
      ? place.photos[0]
      : {
          url: place.image_url || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop',
          caption: place.name,
          source: 'Cổng thông tin Du lịch An Giang',
        };

  const catStyle = CATEGORY_COLORS[place.category] || {
    bg: 'bg-[#0E8C7F]/90',
    text: 'text-white',
    border: 'border-[#0E8C7F]/30',
    label: place.tourism_category || 'Địa Điểm',
  };

  const detailUrl = `/places/${place.slug || place.id}`;

  return (
    <div className="relative bg-[#FFFDF7] rounded-2xl sm:rounded-[26px] border border-[#26221B]/8 shadow-[0_2px_8px_rgba(38,34,27,0.06)] hover:shadow-[0_8px_24px_rgba(38,34,27,0.12)] transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:-translate-y-1 cursor-pointer font-body">
      {/* 1-Touch Card Main Navigation Overlay */}
      <Link href={detailUrl} className="absolute inset-0 z-0" aria-label={`Xem chi tiết địa điểm ${place.name}`} />

      {/* Image Cover Container (4:3 aspect ratio) */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#FAF3E7] pointer-events-none">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={getOptimizedImageUrl(coverPhoto.url, { width: 800, dpr: 2, quality: 'best' })}
          alt={coverPhoto.caption || place.name}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
          decoding="async"
        />

        {/* Bottom Gradient Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#26221B]/75 via-[#26221B]/15 to-transparent pointer-events-none" />

        {/* Top Floating Badges */}
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 right-2 sm:right-3 flex items-center justify-between pointer-events-none">
          <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 max-w-[70%] sm:max-w-none">
            <span className={`inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[11px] font-bold ${catStyle.bg} ${catStyle.text} backdrop-blur-md shadow-xs border ${catStyle.border} font-display truncate`}>
              {place.commune}
            </span>
            {isGaDotOThum && (
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-[#F26B3A] text-white shadow-xs font-display">
                🔥 Đặt trước
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5">
            <div className="flex items-center gap-0.5 sm:gap-1 bg-[#FFFDF7]/95 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-[#F0A32F]/40 backdrop-blur-md shadow-xs font-display">
              <Star className="w-3 h-3 fill-[#F0A32F] text-[#F0A32F]" />
              <span className="text-[10px] sm:text-xs font-bold text-[#26221B]">{place.rating || 4.5}</span>
            </div>

            {/* Like Heart Button */}
            <button
              type="button"
              onClick={handleToggleLike}
              className={`p-1 sm:p-1.5 rounded-full backdrop-blur-md transition-all pointer-events-auto tap-bounce ${
                isLiked
                  ? 'bg-[#F26B3A] text-white animate-heart-pop shadow-xs'
                  : 'bg-[#FFFDF7]/90 text-[#6B6355] hover:text-[#F26B3A] border border-[#26221B]/8'
              }`}
              title="Lưu địa điểm yêu thích"
            >
              <Heart className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isLiked ? 'fill-white' : ''}`} />
            </button>
          </div>
        </div>

        {/* Best Time Window Floating Pill (Bottom-left of image) */}
        {bestTimeBadge && (
          <div className="absolute bottom-2 left-2 sm:left-3 z-10 hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#151B34]/85 text-[#FFD37A] text-[9px] sm:text-[10px] font-bold backdrop-blur-md border border-[#FFD37A]/30 shadow-xs pointer-events-none font-display">
            <bestTimeBadge.icon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#F0A32F]" />
            <span>{bestTimeBadge.label}</span>
          </div>
        )}
      </div>

      {/* Place Content Body */}
      <div className="p-2.5 sm:p-4 pb-2 flex-1 flex flex-col justify-between pointer-events-none font-body">
        <div>
          {/* Place Title in Bricolage Grotesque */}
          <h3 className="font-display text-xs sm:text-base font-bold text-[#26221B] tracking-tight leading-snug line-clamp-1 group-hover:text-[#0E8C7F] transition-colors">
            {place.name}
          </h3>

          {/* Sanitized Clean Description */}
          <p className="mt-1 text-[10px] sm:text-xs text-[#6B6355] line-clamp-2 leading-relaxed font-body">
            {cleanDescription}
          </p>

          {/* Address */}
          <div className="flex items-start gap-1 mt-1.5 text-[10px] sm:text-xs text-[#6B6355]">
            <MapPin className="w-3 h-3 text-[#0E8C7F] shrink-0 mt-0.5" />
            <span className="line-clamp-1 leading-relaxed">{place.address}</span>
          </div>
        </div>

        {/* Travel Guide Key Metrics Bar */}
        <div className="mt-2 pt-1.5 sm:pt-2 border-t border-[#26221B]/6 flex items-center justify-between text-[9px] sm:text-[11px] text-[#6B6355]">
          <div className="flex items-center gap-1 truncate" title={guide.openingHours}>
            <Clock className="w-3 h-3 text-[#0E8C7F] shrink-0" />
            <span className="truncate font-medium">{guide.openingHours.split('(')[0].trim()}</span>
          </div>
          <div className="font-semibold text-[#D9822B] truncate font-display" title={guide.ticketPrice}>
            {guide.ticketPrice.split('.')[0]}
          </div>
        </div>
      </div>

      {/* Action Buttons: Chi Tiết + Chỉ Đường + TikTok */}
      <div className="p-2 sm:p-3 bg-[#FAF3E7]/60 border-t border-[#26221B]/6 flex items-center gap-1 sm:gap-1.5 relative z-10 font-display">
        <Link
          href={detailUrl}
          className="flex-1 text-center py-1.5 sm:py-2 px-1 sm:px-2 rounded-xl sm:rounded-full text-[10px] sm:text-xs font-bold text-[#0E8C7F] bg-[#0E8C7F]/10 hover:bg-[#0E8C7F]/20 transition-colors tap-bounce"
        >
          Chi Tiết
        </Link>
        <a
          href={maps.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex-1 inline-flex items-center justify-center gap-0.5 sm:gap-1 py-1.5 sm:py-2 px-1 sm:px-2 rounded-xl sm:rounded-full text-[10px] sm:text-xs font-bold text-[#26221B] bg-[#F0A32F] hover:bg-[#C97F1B] hover:text-white shadow-xs transition-all shrink-0 tap-bounce"
          title={maps.tooltip}
        >
          <Navigation className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          <span>Chỉ Đường</span>
        </a>
        <a
          href={tiktok.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center justify-center py-1.5 sm:py-2 px-2 sm:px-2.5 rounded-xl sm:rounded-full text-[10px] sm:text-xs font-bold text-[#26221B] bg-white border border-[#26221B]/15 hover:border-[#F26B3A] hover:text-[#F26B3A] transition-all shrink-0 tap-bounce"
          title={tiktok.label}
        >
          <Play className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current text-rose-500" />
        </a>
      </div>
    </div>
  );
}
