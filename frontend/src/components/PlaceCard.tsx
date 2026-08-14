import React from 'react';
import Link from 'next/link';
import { MapPin, Star, Clock, Tag, Navigation, Camera, Play } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { resolvePlaceExternalLinks } from '@/lib/externalLinks';

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
  checkin_spots?: any;
  highlights?: any;
  nearby_cafes_and_food?: any;
  google_maps_info?: any;
  tags_info?: any;
  tiktok_videos?: any;
  review_samples?: any;
  best_visit_time?: string;
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
  is_active?: boolean;
}

interface PlaceCardProps {
  place: Place;
}

export default function PlaceCard({ place }: PlaceCardProps) {
  const { maps, tiktok } = resolvePlaceExternalLinks({
    name: place.name,
    commune: place.commune,
    lat: place.latitude,
    lng: place.longitude,
    video_url: place.video_url,
  });

  const coverPhoto = place.photos && place.photos.length > 0
    ? place.photos[0]
    : {
        url: place.image_url || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop',
        caption: place.name,
        source: 'Cổng thông tin Du lịch An Giang'
      };

  const detailUrl = `/places/${place.slug || place.id}`;

  return (
    <div className="relative bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:-translate-y-1 cursor-pointer">
      
      {/* 1-Touch Card Main Navigation Overlay */}
      <Link href={detailUrl} className="absolute inset-0 z-0" aria-label={`Xem chi tiết địa điểm ${place.name}`} />

      {/* Image Cover Container */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100 pointer-events-none">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={coverPhoto.url}
          alt={coverPhoto.caption || place.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          decoding="async"
        />

        {/* Top Floating Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-[#1B4D3E]/90 text-white backdrop-blur-md shadow-xs">
            {place.commune}
          </span>
          <div className="flex items-center gap-1 bg-white/95 px-2.5 py-1 rounded-full border border-amber-200 backdrop-blur-md shadow-xs">
            <Star className="w-3.5 h-3.5 fill-[#D99B26] text-[#D99B26]" />
            <span className="text-xs font-bold text-slate-900">{place.rating || 4.5}</span>
          </div>
        </div>

        {/* Bottom Image Source Attribution Bar */}
        {coverPhoto.source && (
          <div className="absolute bottom-0 inset-x-0 bg-slate-900/80 backdrop-blur-xs px-3 py-1 text-[10px] text-slate-200 flex items-center gap-1.5 truncate">
            <Camera className="w-3 h-3 text-[#D99B26] shrink-0" />
            <span className="truncate">Nguồn: {coverPhoto.source}</span>
          </div>
        )}
      </div>

      {/* Place Content Body */}
      <div className="p-4 pb-2 flex-1 flex flex-col justify-between pointer-events-none">
        <div>
          {/* Place Title */}
          <h3 className="text-base font-bold text-slate-900 tracking-tight leading-snug line-clamp-1 group-hover:text-[#1B4D3E] transition-colors">
            {place.name}
          </h3>

          {/* Address */}
          <div className="flex items-start gap-1.5 mt-1.5 text-xs text-slate-600">
            <MapPin className="w-3.5 h-3.5 text-[#1B4D3E] shrink-0 mt-0.5" />
            <span className="line-clamp-2 leading-relaxed">{place.address}</span>
          </div>
        </div>

        {/* Metadata Bar */}
        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            <span className="truncate max-w-[110px]">{place.opening_hours || '07:00 - 18:00'}</span>
          </div>
          <div className="flex items-center gap-1 font-medium text-emerald-800">
            <Tag className="w-3 h-3 text-[#D99B26]" />
            <span>{formatPrice(place.price_level || 'Miễn phí')}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons: Chi Tiết + Chỉ Đường + Xem TikTok */}
      <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex items-center gap-1.5 relative z-10">
        <Link
          href={detailUrl}
          className="flex-1 text-center py-1.5 px-2 rounded-xl text-xs font-bold text-[#1B4D3E] bg-emerald-100/70 hover:bg-emerald-200/80 transition-colors"
        >
          Chi Tiết
        </Link>
        <a
          href={maps.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-xs font-bold text-white bg-[#1B4D3E] hover:bg-[#143B2F] shadow-2xs transition-colors shrink-0"
          title={maps.tooltip}
        >
          <Navigation className="w-3 h-3 text-[#D99B26]" />
          <span>Bản Đồ</span>
        </a>
        <a
          href={tiktok.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-xs font-extrabold text-white bg-slate-900 hover:bg-rose-600 transition-colors shrink-0 shadow-2xs"
          title={tiktok.label}
        >
          <Play className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span>TikTok</span>
        </a>
      </div>
    </div>
  );
}
