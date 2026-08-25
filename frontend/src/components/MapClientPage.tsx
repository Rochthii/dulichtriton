'use client';

import React, { useState, useMemo } from 'react';
import { Globe, MapPin, Download } from 'lucide-react';
import { Place } from '@/components/PlaceCard';
import PageHeaderBanner from './PageHeaderBanner';
import dynamic from 'next/dynamic';
import ItineraryExportModal from './ItineraryExportModal';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import MapGpsRadarBar from './map/MapGpsRadarBar';
import MapCategoryFilterBar from './map/MapCategoryFilterBar';
import MapSelectedPlaceSheet from './map/MapSelectedPlaceSheet';

const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[380px] sm:min-h-[580px] rounded-2xl sm:rounded-[28px] bg-[#151B34] border border-[#26221B]/10 flex items-center justify-center text-white font-display">
      <div className="flex flex-col items-center gap-3 animate-pulse">
        <MapPin className="w-7 h-7 sm:w-8 sm:h-8 text-[#F0A32F]" />
        <span className="text-xs sm:text-sm">Đang tải Bản Đồ Số GIS Tri Tôn...</span>
      </div>
    </div>
  ),
});

interface MapClientPageProps {
  places: Place[];
}

// Haversine Distance Formula in Kilometers
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
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

const COMMUNES_15 = [
  'all',
  'Thị trấn Tri Tôn',
  'Thị trấn Ba Chúc',
  'Xã Châu Lăng',
  'Xã Lương Phi',
  'Xã Lê Trì',
  'Xã Lạc Quới',
  'Xã Vĩnh Gia',
  'Xã Vĩnh Phước',
  'Xã Ô Lâm',
  'Xã An Tức',
  'Xã Cô Tô',
  'Xã Tân Tuyến',
  'Xã Tà Đảnh',
  'Xã Núi Tô',
  'Xã Lương An Trà',
];

export default function MapClientPage({ places }: MapClientPageProps) {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCommune, setSelectedCommune] = useState<string>('all');
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(places[0] || null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // GPS & Radar Radius States
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [radiusKm, setRadiusKm] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const categories = [
    { key: 'all', label: `Tất cả (${places.length} điểm)` },
    { key: 'night_spots', label: '🌙 Tri Tôn Về Đêm' },
    { key: 'attractions_nature', label: 'Danh thắng Núi' },
    { key: 'checkin_spots', label: 'Điểm Check-in' },
    { key: 'khmer_pagodas_heritage', label: 'Chùa Khmer & Di tích' },
    { key: 'food_and_restaurants', label: 'Ẩm thực & Quán ăn' },
    { key: 'cafes_and_homestays', label: 'Homestay & Lưu trú' },
  ];

  // 1-Touch GPS Location Handlers
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
          driveTimeMin = Math.round((distance / 30) * 60);
        }

        return {
          ...p,
          distance,
          driveTimeMin,
        };
      })
      .filter((p) => {
        let matchCat = true;
        if (selectedCategory !== 'all') {
          const c = (p.category || '').toLowerCase();
          const tc = (p.tourism_category || '').toLowerCase();
          if (selectedCategory === 'night_spots') matchCat = Boolean(p.open_late || (p as any).open_late);
          else if (selectedCategory === 'attractions_nature') matchCat = c.includes('nature') || tc.includes('thiên nhiên') || tc.includes('thắng cảnh');
          else if (selectedCategory === 'checkin_spots') matchCat = c.includes('check-in') || tc.includes('check-in');
          else if (selectedCategory === 'khmer_pagodas_heritage') matchCat = c.includes('spiritual') || c.includes('history') || tc.includes('chùa') || tc.includes('di tích');
          else if (selectedCategory === 'food_and_restaurants') matchCat = c.includes('food') || tc.includes('ẩm thực') || tc.includes('quán ăn');
          else if (selectedCategory === 'cafes_and_homestays') matchCat = c.includes('stay') || tc.includes('lưu trú') || tc.includes('homestay');
        }

        let matchCommune = true;
        if (selectedCommune !== 'all') {
          matchCommune = (p.commune || '').toLowerCase().includes(selectedCommune.toLowerCase());
        }

        let matchRadius = true;
        if (userLocation && radiusKm && radiusKm > 0) {
          if (p.distance !== null && p.distance > radiusKm) {
            matchRadius = false;
          }
        }

        return matchCat && matchCommune && matchRadius;
      })
      .sort((a, b) => {
        if (a.distance !== null && b.distance !== null) return a.distance - b.distance;
        return 0;
      });
  }, [places, selectedCategory, selectedCommune, userLocation, radiusKm]);

  return (
    <div className="font-body bg-[#FAF3E7] text-[#26221B] min-h-screen">
      <PageHeaderBanner
        badgeText="Bản Đồ Thắng Cảnh & Du Lịch Tri Tôn"
        badgeIcon={Globe}
        title="BẢN ĐỒ DU LỊCH SỐ VÙNG BẢY NÚI TRI TÔN"
        subtitle="Định vị GPS vị trí của Bạn, quét radar bán kính 1km/3km/5km/10km tìm quán ăn & homestay gần nhất, mở Google Maps chỉ đường 1 chạm."
        countLabel="Địa điểm trên bản đồ"
        countValue={`${filteredPlacesWithDistance.length} điểm hiển thị`}
      />

      {/* FILTER & INTERACTIVE RADAR CONTROLS */}
      <div className="bg-[#FFFDF7] p-3.5 sm:p-6 rounded-2xl sm:rounded-[28px] border border-[#26221B]/8 shadow-[0_2px_10px_rgba(38,34,27,0.06)] mb-4 sm:mb-8 space-y-3 sm:space-y-4">
        <MapGpsRadarBar
          userLocation={userLocation}
          radiusKm={radiusKm}
          isLocating={isLocating}
          locationError={locationError}
          onGetLocation={handleGetLocation}
          onClearLocation={() => {
            setUserLocation(null);
            setRadiusKm(null);
          }}
          onSelectRadius={(val) => setRadiusKm(val)}
        />

        <MapCategoryFilterBar
          categories={categories}
          communes={COMMUNES_15}
          selectedCategory={selectedCategory}
          selectedCommune={selectedCommune}
          onSelectCategory={(k) => setSelectedCategory(k)}
          onSelectCommune={(c) => setSelectedCommune(c)}
        />
      </div>

      {/* MAP CANVAS & SELECTED PLACE SIDEBAR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-8 items-start">
        <div className="lg:col-span-8 h-[450px] sm:h-[620px] rounded-2xl sm:rounded-[28px] overflow-hidden border border-[#26221B]/10 shadow-lg relative bg-[#151B34]">
          <MapComponent
            places={filteredPlacesWithDistance}
            selectedPlace={selectedPlace}
            onSelectPlace={(p) => setSelectedPlace(p)}
            userLocation={userLocation}
            radiusKm={radiusKm}
          />
        </div>

        <div className="lg:col-span-4 space-y-4">
          <MapSelectedPlaceSheet place={selectedPlace} />

          {/* ITINERARY EXPORT BANNER */}
          <div className="p-4 rounded-2xl bg-[#0E8C7F]/10 border border-[#0E8C7F]/20 flex items-center justify-between gap-3">
            <div className="text-xs">
              <span className="font-bold text-[#0E8C7F] font-display block">Tạo Lộ Trình PDF / KML</span>
              <span className="text-[#6B6355]">Xuất bản đồ tuyến tham quan cho nhóm</span>
            </div>
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#0E8C7F] hover:bg-[#085A52] text-white font-bold text-xs font-display flex items-center gap-1.5 shadow-xs transition-transform active:scale-95 cursor-pointer touch-manipulation"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất File</span>
            </button>
          </div>
        </div>
      </div>

      {isExportModalOpen && (
        <ItineraryExportModal
          onClose={() => setIsExportModalOpen(false)}
        />
      )}
    </div>
  );
}
