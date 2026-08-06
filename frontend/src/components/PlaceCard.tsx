import React from 'react';
import Link from 'next/link';
import { MapPin, Star, Clock, Tag, Navigation, Camera, ShieldCheck } from 'lucide-react';
import { getGoogleMapsUrl, formatPrice } from '@/lib/utils';

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
}

interface PlaceCardProps {
  place: Place;
}

export default function PlaceCard({ place }: PlaceCardProps) {
  const mapsUrl = getGoogleMapsUrl(place.name, place.commune);
  const coverPhoto = place.photos && place.photos.length > 0
    ? place.photos[0]
    : {
        url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop',
        caption: place.name,
        source: 'Cổng thông tin Du lịch An Giang'
      };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:-translate-y-1">
      
      {/* Image Cover Container with Source Badge */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={coverPhoto.url}
          alt={coverPhoto.caption || place.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Top Floating Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
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
      <div className="p-5 pb-3 flex-1 flex flex-col justify-between">
        <div>
          {/* Place Title */}
          <Link href={`/places/${place.id}`} className="group-hover:text-[#1B4D3E] transition-colors">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-snug line-clamp-1">
              {place.name}
            </h3>
          </Link>

          {/* Address */}
          <div className="flex items-start gap-1.5 mt-2 text-xs text-slate-600">
            <MapPin className="w-4 h-4 text-[#1B4D3E] shrink-0 mt-0.5" />
            <span className="line-clamp-2 leading-relaxed">{place.address}</span>
          </div>
        </div>

        {/* Metadata Bar */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{place.opening_hours || '07:00 - 18:00'}</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium text-emerald-800">
            <Tag className="w-3.5 h-3.5 text-[#D99B26]" />
            <span>{formatPrice(place.price_level || 'Miễn phí')}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-5 pb-5 bg-white flex items-center justify-between gap-3">
        <Link
          href={`/places/${place.id}`}
          className="flex-1 text-center py-2 px-3 rounded-xl text-xs font-semibold text-[#1B4D3E] bg-emerald-50 hover:bg-emerald-100 transition-colors"
        >
          Chi Tiết
        </Link>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold text-white bg-[#1B4D3E] hover:bg-[#143B2F] shadow-xs transition-colors"
        >
          <Navigation className="w-3.5 h-3.5 text-[#D99B26]" />
          <span>Chỉ Đường</span>
        </a>
      </div>
    </div>
  );
}
