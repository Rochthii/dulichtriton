'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Map, Navigation, MapPin, Layers, Filter, Globe, 
  Search, Star, CheckCircle2, Compass, ShieldCheck, ExternalLink
} from 'lucide-react';
import { Place } from '@/components/PlaceCard';
import { getGoogleMapsUrl } from '@/lib/utils';
import PageHeaderBanner from './PageHeaderBanner';
import dynamic from 'next/dynamic';
import { Download } from 'lucide-react';
import ItineraryExportModal from './ItineraryExportModal';

const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[480px] sm:min-h-[580px] rounded-3xl bg-slate-900 border border-slate-200 flex items-center justify-center text-white">
      <div className="flex flex-col items-center gap-4 animate-pulse">
        <MapPin className="w-8 h-8 text-[#D99B26]" />
        <span>Đang tải Bản Đồ Số GIS...</span>
      </div>
    </div>
  )
});

interface MapClientPageProps {
  places: Place[];
}

export default function MapClientPage({ places }: MapClientPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCommune, setSelectedCommune] = useState<string>('all');
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(places[0] || null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const communes = [
    'all',
    'Thị trấn Tri Tôn',
    'Thị trấn Ba Chúc',
    'Xã Núi Tô',
    'Xã Chau Lăng',
    'Xã An Tức',
    'Xã Ô Lâm',
    'Xã Lương Phi',
    'Xã An Hảo'
  ];

  const categories = [
    { key: 'all', label: `Tất cả ${places.length} địa điểm` },
    { key: 'attractions_nature', label: 'Danh thắng Thiên nhiên' },
    { key: 'checkin_spots', label: 'Điểm Check-in' },
    { key: 'khmer_pagodas_heritage', label: 'Chùa Khmer & Di tích' },
    { key: 'food_and_restaurants', label: 'Ẩm thực & Quán ăn' },
    { key: 'cafes_and_homestays', label: 'Homestay & Lưu trú' },
  ];

  // Filter places based on selected category & commune
  const filteredPlaces = places.filter(p => {
    const matchCat = selectedCategory === 'all' || p.category === selectedCategory || p.tourism_category === selectedCategory;
    const matchCom = selectedCommune === 'all' || p.commune === selectedCommune;
    return matchCat && matchCom;
  });

  return (
    <>
      {/* Page Header Banner */}
      <PageHeaderBanner
        badgeText="PostGIS Spatial GIS Index WGS84"
        badgeIcon={Globe}
        title="Bản Đồ Số Tương Tác Bảy Núi Tri Tôn"
        subtitle="Hệ thống GIS định vị WGS84 chính xác trong khung Bounding Box [10.25 - 10.55 Lat, 104.85 - 105.15 Lng]. Lọc nhanh theo bán kính và điều hướng Google Maps trực tiếp."
        countLabel="Số địa điểm đã ghim bản đồ"
        countValue={`${filteredPlaces.length} điểm`}
      />

      {/* FILTER CONTROLS BAR */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm mb-8 space-y-4">
        
        {/* Layer Categories */}
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            <Layers className="w-4 h-4 text-[#1B4D3E]" />
            <span>Lớp Bản Đồ Danh Mục (GIS Layers)</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {categories.map(cat => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedCategory === cat.key
                    ? 'bg-[#1B4D3E] text-white shadow-xs'
                    : 'bg-[#F8F9FA] text-slate-700 hover:bg-emerald-50 border border-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Commune Filter */}
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            <MapPin className="w-4 h-4 text-[#D99B26]" />
            <span>Khu Vực Hành Chính Xã / Thị Trấn</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {communes.map((c, i) => (
              <button
                key={i}
                onClick={() => setSelectedCommune(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedCommune === c
                    ? 'bg-[#D99B26] text-slate-900 font-bold shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:border-[#D99B26]'
                }`}
              >
                {c === 'all' ? 'Tất cả Xã/Thị trấn' : c}
              </button>
            ))}
          </div>
        </div>
        
        {/* Export Button */}
        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button 
            onClick={() => setIsExportModalOpen(true)}
            className="px-4 py-2 bg-[#D99B26] hover:bg-[#c2891d] text-slate-900 font-bold text-xs rounded-xl flex items-center gap-2 shadow-md transition-all"
          >
            <Download className="w-4 h-4" />
            Lưu Lịch Trình (Offline PDF/QR)
          </button>
        </div>

      </div>

      {/* MAP & SIDE PANEL SPLIT VIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        
        {/* Main Map Container (2 Cols) */}
        <div className="lg:col-span-2 relative min-h-[480px] sm:min-h-[580px]">
          <MapComponent 
            places={filteredPlaces} 
            selectedPlace={selectedPlace} 
            onSelectPlace={setSelectedPlace} 
          />
        </div>

        {/* Selected Place Preview Side Panel (1 Col) */}
        <div className="space-y-6">
          {selectedPlace ? (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-md bg-emerald-50 text-[#1B4D3E] text-xs font-bold border border-emerald-100">
                  {selectedPlace.commune}
                </span>
                <div className="flex items-center gap-1 text-xs font-bold text-slate-800">
                  <Star className="w-4 h-4 fill-[#D99B26] text-[#D99B26]" />
                  <span>{selectedPlace.rating || 4.8}</span>
                </div>
              </div>

              {/* Photo */}
              <div className="h-44 bg-slate-900 rounded-2xl overflow-hidden relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    selectedPlace.image_url ||
                    selectedPlace.photos?.[0]?.url ||
                    '/images/tiktok/ho_ta_pa.jpg'
                  }
                  alt={selectedPlace.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/images/tiktok/ho_ta_pa.jpg'; }}
                />
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900">{selectedPlace.name}</h3>
                <p className="text-xs text-slate-500 flex items-start gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-[#1B4D3E] shrink-0 mt-0.5" />
                  <span>{selectedPlace.address || `${selectedPlace.commune}, Tri Tôn`}</span>
                </p>
              </div>

              {/* Coordinates */}
              <div className="bg-[#F8F9FA] p-3 rounded-xl border border-slate-200 text-xs space-y-1.5 font-mono">
                <div className="flex justify-between text-slate-600">
                  <span>Kinh độ (Lng):</span>
                  <span className="font-bold text-slate-900">{selectedPlace.longitude || '105.0125'}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Vĩ độ (Lat):</span>
                  <span className="font-bold text-slate-900">{selectedPlace.latitude || '10.4215'}</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                {selectedPlace.description || `Địa điểm nổi bật thuộc ${selectedPlace.commune}, Tri Tôn, An Giang.`}
              </p>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <a
                  href={getGoogleMapsUrl(selectedPlace.name, selectedPlace.commune)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-xl bg-[#1B4D3E] hover:bg-[#143B2F] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <Navigation className="w-4 h-4 text-[#D99B26]" />
                  <span>Chỉ Đường Bằng Google Maps</span>
                </a>

                <Link
                  href={`/places/${selectedPlace.id}`}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
                >
                  <span>Xem Chi Tiết Địa Điểm</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center">
              <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500">Chọn một ghim địa điểm trên bản đồ để xem thông tin chi tiết.</p>
            </div>
          )}
        </div>

      </div>
      
      {isExportModalOpen && <ItineraryExportModal onClose={() => setIsExportModalOpen(false)} />}
    </>
  );
}
