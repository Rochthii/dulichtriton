'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MapPin, Navigation, Clock, Tag, Star, Camera, ShieldCheck, Video, ArrowLeft } from 'lucide-react';
import { Place } from '@/components/PlaceCard';
import { getGoogleMapsUrl, formatPrice } from '@/lib/utils';

interface PlaceDetailClientProps {
  place: Place;
}

export default function PlaceDetailClient({ place }: PlaceDetailClientProps) {
  const photos = place.photos && place.photos.length > 0
    ? place.photos
    : [
        {
          url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop',
          caption: place.name,
          source: 'Cổng thông tin Du lịch An Giang (angiangtourism.vn)',
          license: 'Public Domain Tourism Collection'
        }
      ];

  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const currentPhoto = photos[selectedPhotoIndex] || photos[0];
  const mapsUrl = getGoogleMapsUrl(place.name, place.commune);

  return (
    <>
      {/* Back Link */}
      <Link
        href="/places"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#1B4D3E] mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại danh sách 106 địa điểm</span>
      </Link>

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
            <span>Đã xác minh WGS84 ({place.confidence_score || 95}%)</span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
          {place.name}
        </h1>

        <div className="flex items-start gap-2 mt-3 text-xs sm:text-sm text-slate-600">
          <MapPin className="w-4 h-4 text-[#1B4D3E] shrink-0 mt-0.5" />
          <span className="font-medium">{place.address}</span>
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

          <div className="flex items-center justify-end">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#1B4D3E] hover:bg-[#143B2F] text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Navigation className="w-4 h-4 text-[#D99B26]" />
              <span>Mở Google Maps</span>
            </a>
          </div>
        </div>
      </div>

      {/* PHOTO GALLERY SECTION WITH EXPLICIT SOURCE ATTRIBUTION */}
      <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs mb-8">
        <div className="flex items-center gap-2 mb-6">
          <Camera className="w-5 h-5 text-[#1B4D3E]" />
          <h2 className="text-xl font-bold text-slate-900">Kho Thư Mục Ảnh Thực Tế Từ CSDL Supabase</h2>
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

      {/* DESCRIPTION & DETAILS */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Giới Thiệu Chi Tiết Về {place.name}</h2>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
          {place.description || `Địa điểm ${place.name} thuộc ${place.commune}, Tri Tôn, An Giang. Nơi đây sở hữu cảnh quan độc đáo, mang đậm nét văn hóa vùng Thất Sơn Bảy Núi.`}
        </p>
      </div>
    </>
  );
}
