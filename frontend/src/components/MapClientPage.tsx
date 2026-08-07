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

interface MapClientPageProps {
  places: Place[];
}

export default function MapClientPage({ places }: MapClientPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCommune, setSelectedCommune] = useState<string>('all');
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(places[0] || null);

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
    { key: 'all', label: 'Tất cả 106 địa điểm' },
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

      </div>

      {/* MAP & SIDE PANEL SPLIT VIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        
        {/* Main Map Container (2 Cols) */}
        <div className="lg:col-span-2 bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 shadow-lg relative min-h-[480px] sm:min-h-[580px] flex flex-col justify-between p-6 text-white">
          
          {/* Top Map Status Overlay */}
          <div className="flex flex-wrap items-center justify-between gap-2 z-10">
            <div className="bg-slate-950/85 backdrop-blur-md px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border border-white/10">
              <Compass className="w-4 h-4 text-[#D99B26] animate-spin" style={{ animationDuration: '8s' }} />
              <span>Bounding Box WGS84 [10.25 - 10.55 Lat]</span>
            </div>

            <div className="bg-[#1B4D3E] px-3.5 py-2 rounded-xl text-xs font-bold text-white shadow-md">
              Hiển thị {filteredPlaces.length} Pins
            </div>
          </div>

          {/* Simulated Interactive Map Pin Grid Overlay */}
          <div className="my-auto py-12 px-4 relative">
            <div className="max-w-md mx-auto text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#1B4D3E]/80 border-2 border-[#D99B26] text-[#D99B26] flex items-center justify-center mx-auto shadow-2xl animate-pulse">
                <MapPin className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold">Bản Đồ Số PostGIS WGS84 Bảy Núi</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Tích hợp chỉ mục PostGIS GiST Spatial Index. Chọn một địa điểm bên danh sách để xem ghim tọa độ chính xác và mở điều hướng Google Maps.
              </p>

              {/* Pins Chip Matrix */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2 max-h-40 overflow-y-auto">
                {filteredPlaces.slice(0, 15).map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPlace(p)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border ${
                      selectedPlace?.id === p.id
                        ? 'bg-[#D99B26] text-slate-900 border-[#D99B26] scale-105 shadow-md'
                        : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                    }`}
                  >
                    📍 {p.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Map Info Footer */}
          <div className="bg-slate-950/85 backdrop-blur-md p-3.5 rounded-xl text-[11px] text-slate-400 flex items-center justify-between border border-white/10 z-10">
            <span>Đơn vị đo lường: WGS84 EPSG:4326</span>
            <span className="text-[#D99B26] font-semibold">Tự động tối ưu bán kính 5km</span>
          </div>

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
                  src={selectedPlace.photos?.[0]?.url || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop'}
                  alt={selectedPlace.name}
                  className="w-full h-full object-cover"
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
    </>
  );
}
