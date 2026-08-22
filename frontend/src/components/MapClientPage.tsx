'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { 
  Map, Navigation, MapPin, Layers, Filter, Globe, 
  Search, Star, CheckCircle2, Compass, ShieldCheck, ExternalLink, Download, X,
  LocateFixed, Radio, Clock, Phone, AlertCircle
} from 'lucide-react';
import { Place } from '@/components/PlaceCard';
import { getGoogleMapsUrl } from '@/lib/utils';
import PageHeaderBanner from './PageHeaderBanner';
import dynamic from 'next/dynamic';
import ItineraryExportModal from './ItineraryExportModal';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[380px] sm:min-h-[580px] rounded-2xl sm:rounded-[28px] bg-[#151B34] border border-[#26221B]/10 flex items-center justify-center text-white font-display">
      <div className="flex flex-col items-center gap-3 animate-pulse">
        <MapPin className="w-7 h-7 sm:w-8 sm:h-8 text-[#F0A32F]" />
        <span className="text-xs sm:text-sm">Đang tải Bản Đồ Số GIS Tri Tôn...</span>
      </div>
    </div>
  )
});

interface MapClientPageProps {
  places: Place[];
}

// Haversine Distance Formula in Kilometers
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

export default function MapClientPage({ places }: MapClientPageProps) {
  const { language, dict } = useLanguage();
  const mp = dict.map;
  const isEn = language === 'en';

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCommune, setSelectedCommune] = useState<string>('all');
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(places[0] || null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isMobileCardOpen, setIsMobileCardOpen] = useState(true);

  // GPS & Radar Radius States
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [radiusKm, setRadiusKm] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const communes = [
    'all',
    'Thị trấn Tri Tôn',
    'Thị trấn Ba Chúc',
    'Xã Núi Tô',
    'Xã Châu Lăng',
    'Xã An Tức',
    'Xã Ô Lâm',
    'Xã Lương Phi',
    'Xã Cô Tô'
  ];

  const categories = [
    { key: 'all', label: `Tất cả (${places.length} điểm)` },
    { key: 'night_spots', label: '🌙 Tri Tôn Về Đêm' },
    { key: 'attractions_nature', label: 'Danh thắng Núi' },
    { key: 'checkin_spots', label: 'Điểm Check-in' },
    { key: 'khmer_pagodas_heritage', label: 'Chùa Khmer & Di tích' },
    { key: 'food_and_restaurants', label: 'Ẩm thực & Quán ăn' },
    { key: 'cafes_and_homestays', label: 'Homestay & Lưu trú' },
  ];

  // Request GPS Geolocation
  const handleGetLocation = () => {
    setIsLocating(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('Trình duyệt của bạn không hỗ trợ định vị GPS.');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const uLat = position.coords.latitude;
        const uLng = position.coords.longitude;
        setUserLocation({ lat: uLat, lng: uLng });
        setRadiusKm(5); // Default to 5km radar
        setIsLocating(false);
      },
      (error) => {
        console.warn('GPS Error:', error);
        // Fallback to Tri Tôn Center for demo testing if GPS denied
        setUserLocation({ lat: 10.4215, lng: 105.0035 });
        setRadiusKm(5);
        setLocationError('Đã đặt vị trí mẫu tại Trung tâm Thị trấn Tri Tôn.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Filter & Calculate Distances
  const filteredPlacesWithDistance = useMemo(() => {
    return places
      .map((p) => {
        let distance: number | null = null;
        let driveTimeMin: number | null = null;

        if (userLocation && p.latitude && p.longitude) {
          distance = calculateDistanceKm(userLocation.lat, userLocation.lng, p.latitude, p.longitude);
          driveTimeMin = Math.round((distance / 30) * 60); // 30km/h average motorbike speed
        }

        return {
          ...p,
          distance,
          driveTimeMin,
        };
      })
      .filter((p) => {
        // Category Filter
        let matchCat = true;
        if (selectedCategory !== 'all') {
          const c = (p.category || '').toLowerCase();
          const tc = (p.tourism_category || '').toLowerCase();
          if (selectedCategory === 'night_spots') matchCat = p.open_late || (p as any).open_late === true;
          else if (selectedCategory === 'attractions_nature') matchCat = c.includes('nature') || tc.includes('thiên nhiên') || tc.includes('thắng cảnh');
          else if (selectedCategory === 'checkin_spots') matchCat = c.includes('check-in') || tc.includes('check-in');
          else if (selectedCategory === 'khmer_pagodas_heritage') matchCat = c.includes('spiritual') || c.includes('history') || tc.includes('chùa') || tc.includes('di tích');
          else if (selectedCategory === 'food_and_restaurants') matchCat = c.includes('food') || tc.includes('ẩm thực') || tc.includes('quán ăn');
          else if (selectedCategory === 'cafes_and_homestays') matchCat = c.includes('stay') || tc.includes('lưu trú') || tc.includes('homestay');
        }

        // Commune Filter
        let matchCommune = true;
        if (selectedCommune !== 'all') {
          matchCommune = (p.commune || '').toLowerCase().includes(selectedCommune.toLowerCase());
        }

        // Radar Radius Filter
        let matchRadius = true;
        if (userLocation && radiusKm && radiusKm > 0) {
          if (p.distance !== null && p.distance > radiusKm) {
            matchRadius = false;
          }
        }

        return matchCat && matchCommune && matchRadius;
      })
      .sort((a, b) => {
        if (a.distance !== null && b.distance !== null) {
          return a.distance - b.distance;
        }
        return 0;
      });
  }, [places, selectedCategory, selectedCommune, userLocation, radiusKm]);

  const handleSelectPlaceOnMap = (place: Place) => {
    setSelectedPlace(place);
    setIsMobileCardOpen(true);
  };

  return (
    <div className="font-body bg-[#FAF3E7] text-[#26221B] min-h-screen">
      {/* Page Header Banner */}
      <PageHeaderBanner
        badgeText="Bản Đồ Thắng Cảnh & Du Lịch Tri Tôn"
        badgeIcon={Globe}
        title="BẢN ĐỒ DU LỊCH SỐ VÙNG BẢY NÚI TRI TÔN"
        subtitle="Định vị GPS vị trí của Bạn, quét radar bán kính 3km/5km/10km tìm quán ăn & homestay gần nhất, mở Google Maps chỉ đường 1 chạm."
        countLabel="Địa điểm trên bản đồ"
        countValue={`${filteredPlacesWithDistance.length} điểm hiển thị`}
      />

      {/* FILTER & INTERACTIVE RADAR CONTROLS */}
      <div className="bg-[#FFFDF7] p-3.5 sm:p-6 rounded-2xl sm:rounded-[28px] border border-[#26221B]/8 shadow-[0_2px_10px_rgba(38,34,27,0.06)] mb-4 sm:mb-8 space-y-3 sm:space-y-4">
        
        {/* 🌟 GPS & RADAR RADIUS SCAN BAR 🌟 */}
        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#0E8C7F]/10 via-[#F0A32F]/10 to-transparent border border-[#0E8C7F]/20 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleGetLocation}
              disabled={isLocating}
              className="px-3.5 py-2 rounded-xl bg-[#0E8C7F] hover:bg-[#085A52] text-white font-bold text-xs sm:text-sm font-display flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <LocateFixed className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{userLocation ? '📍 Đang Bật GPS Vị Trí Của Bạn' : '📍 Bật GPS Quét Điểm Gần Tôi'}</span>
            </button>

            {userLocation && (
              <button
                onClick={() => {
                  setUserLocation(null);
                  setRadiusKm(null);
                }}
                className="text-xs text-rose-600 hover:underline font-semibold font-display"
              >
                Tắt Radar
              </button>
            )}
          </div>

          {/* Radius Selector */}
          {userLocation && (
            <div className="flex items-center gap-1.5 font-display text-xs">
              <span className="font-bold text-[#26221B] flex items-center gap-1">
                <Radio className="w-3.5 h-3.5 text-[#0E8C7F]" /> Bán kính:
              </span>
              {[
                { label: '3 km', val: 3 },
                { label: '5 km', val: 5 },
                { label: '10 km', val: 10 },
                { label: 'Tất cả', val: null },
              ].map((r, i) => (
                <button
                  key={i}
                  onClick={() => setRadiusKm(r.val)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    radiusKm === r.val
                      ? 'bg-[#0E8C7F] text-white shadow-2xs'
                      : 'bg-white text-[#6B6355] border border-[#EBE1D0] hover:bg-slate-50'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {locationError && (
          <div className="text-xs text-amber-800 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>{locationError}</span>
          </div>
        )}

        {/* Category Filter */}
        <div>
          <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold text-[#26221B] uppercase tracking-wider mb-1.5 font-display">
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#0E8C7F]" />
              <span>Phân Loại Danh Mục</span>
            </div>
            <span className="text-[10px] text-[#6B6355] font-mono sm:hidden">Vuốt ngang ➔</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none font-display">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`whitespace-nowrap px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold transition-all shrink-0 active:scale-95 cursor-pointer ${
                  selectedCategory === cat.key
                    ? 'bg-[#0E8C7F] text-white shadow-xs'
                    : 'bg-[#FAF3E7] border border-[#26221B]/8 text-[#6B6355] hover:border-[#0E8C7F]/40'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Commune Filter */}
        <div>
          <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold text-[#26221B] uppercase tracking-wider mb-1.5 font-display">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#F0A32F]" />
              <span>Khu Vực Hành Chính Xã / Thị Trấn</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none font-display">
            {communes.map((c, i) => (
              <button
                key={i}
                onClick={() => setSelectedCommune(c)}
                className={`whitespace-nowrap px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold transition-all shrink-0 active:scale-95 cursor-pointer ${
                  selectedCommune === c
                    ? 'bg-[#F0A32F] text-[#26221B] shadow-xs'
                    : 'bg-[#FAF3E7] border border-[#26221B]/8 text-[#6B6355] hover:border-[#F0A32F]/40'
                }`}
              >
                {c === 'all' ? 'Tất cả Xã/Thị trấn' : c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MAP & DETAIL LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
        
        {/* Left Side: Leaflet OpenStreetMap with GPS Radar */}
        <div className="lg:col-span-8 h-[480px] sm:h-[620px] rounded-3xl relative z-0">
          <MapComponent
            places={filteredPlacesWithDistance}
            selectedPlace={selectedPlace}
            onSelectPlace={handleSelectPlaceOnMap}
            userLocation={userLocation}
            radiusKm={radiusKm}
          />
        </div>

        {/* Right Side: Selected Place Detail & Navigation Card */}
        <div className="lg:col-span-4 space-y-4">
          {selectedPlace ? (
            <div className="bg-[#FFFDF7] rounded-3xl p-4 sm:p-5 border border-[#26221B]/10 shadow-md space-y-3.5 sticky top-20">
              <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-slate-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedPlace.image_url || 'https://res.cloudinary.com/dhjesnejt/image/upload/f_auto,q_auto:best,w_1600,c_fill/v1786758535/tri_ton_hero/hero_dong_thot_not.jpg'}
                  alt={selectedPlace.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                
                <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-white/95 text-[#26221B] font-extrabold text-xs flex items-center gap-1 shadow-xs font-display">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                  <span>{selectedPlace.rating || 4.8}</span>
                </span>

                <div className="absolute bottom-2.5 left-3 right-3 text-white">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#FFD37A] font-mono">
                    {selectedPlace.commune}
                  </span>
                  <h3 className="font-display font-black text-base sm:text-lg leading-tight text-white line-clamp-1">
                    {selectedPlace.name}
                  </h3>
                </div>
              </div>

              {/* Distance from User GPS Badge */}
              {(selectedPlace as any).distance !== undefined && (selectedPlace as any).distance !== null && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/60 text-emerald-800 text-xs font-bold flex items-center justify-between font-display">
                  <span className="flex items-center gap-1">
                    <LocateFixed className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Cách Bạn: {(selectedPlace as any).distance} km</span>
                  </span>
                  <span className="flex items-center gap-1 text-emerald-700 font-mono text-[11px]">
                    <Clock className="w-3 h-3" /> ~{(selectedPlace as any).driveTimeMin} phút xe máy
                  </span>
                </div>
              )}

              <div className="space-y-1.5 text-xs text-[#6B6355]">
                {selectedPlace.address && (
                  <div className="flex items-center gap-1.5 text-[#26221B]">
                    <MapPin className="w-3.5 h-3.5 text-[#F26B3A] shrink-0" />
                    <span className="truncate">{selectedPlace.address}</span>
                  </div>
                )}
                <p className="text-[11px] leading-relaxed line-clamp-3">
                  {selectedPlace.description || 'Địa điểm nổi bật tại Tri Tôn với cảnh sắc thiên nhiên và văn hóa đặc sắc.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col gap-2">
                {/* 📍 NÚT MỞ APP GOOGLE MAPS DẪN ĐƯỜNG 1 CHẠM 📍 */}
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedPlace.name + ' ' + selectedPlace.commune + ' Tri Tôn An Giang')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-xs sm:text-sm text-center transition-all shadow-sm font-display flex items-center justify-center gap-2 active:scale-98"
                >
                  <Navigation className="w-4 h-4 fill-white" />
                  <span>📍 Mở App Google Maps Dẫn Đường</span>
                </a>

                <Link
                  href={`/places/${selectedPlace.slug || selectedPlace.id}`}
                  className="w-full py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs text-center transition-colors font-display"
                >
                  Xem Toàn Bộ Hình Ảnh & Video
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-[#FFFDF7] rounded-3xl p-8 border border-[#26221B]/10 text-center text-[#6B6355] font-display text-xs">
              Chọn một địa điểm trên bản đồ để xem chi tiết và dẫn đường Google Maps.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
