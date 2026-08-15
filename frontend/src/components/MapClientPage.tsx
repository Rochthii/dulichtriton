'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Map, Navigation, MapPin, Layers, Filter, Globe, 
  Search, Star, CheckCircle2, Compass, ShieldCheck, ExternalLink, Download
} from 'lucide-react';
import { Place } from '@/components/PlaceCard';
import { getGoogleMapsUrl } from '@/lib/utils';
import PageHeaderBanner from './PageHeaderBanner';
import dynamic from 'next/dynamic';
import ItineraryExportModal from './ItineraryExportModal';

const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[480px] sm:min-h-[580px] rounded-[28px] bg-[#151B34] border border-[#26221B]/10 flex items-center justify-center text-white font-display">
      <div className="flex flex-col items-center gap-4 animate-pulse">
        <MapPin className="w-8 h-8 text-[#F0A32F]" />
        <span>Đang tải Bản Đồ Số GIS Tri Tôn...</span>
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
    'Xã Châu Lăng',
    'Xã An Tức',
    'Xã Ô Lâm',
    'Xã Lương Phi',
    'Xã Cô Tô'
  ];

  const categories = [
    { key: 'all', label: `Tất cả (${places.length} điểm)` },
    { key: 'night_spots', label: '🌙 Tri Tôn Về Đêm (Mở Muộn)' },
    { key: 'attractions_nature', label: 'Danh thắng Thiên nhiên' },
    { key: 'checkin_spots', label: 'Điểm Check-in' },
    { key: 'khmer_pagodas_heritage', label: 'Chùa Khmer & Di tích' },
    { key: 'food_and_restaurants', label: 'Ẩm thực & Quán ăn' },
    { key: 'cafes_and_homestays', label: 'Homestay & Lưu trú' },
  ];

  // Filter places based on selected category & commune
  const filteredPlaces = places.filter(p => {
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

    let matchCommune = true;
    if (selectedCommune !== 'all') {
      matchCommune = (p.commune || '').toLowerCase().includes(selectedCommune.toLowerCase());
    }

    return matchCat && matchCommune;
  });

  return (
    <div className="font-body bg-[#FAF3E7] text-[#26221B] min-h-screen">
      {/* Page Header Banner */}
      <PageHeaderBanner
        badgeText="Bản Đồ Thắng Cảnh & Du Lịch Tri Tôn"
        badgeIcon={Globe}
        title="BẢN ĐỒ DU LỊCH SỐ VÙNG BẢY NÚI TRI TÔN"
        subtitle="Tra cứu trực quan 149 địa điểm đã xác minh thực tế, chỉ đường ngắn nhất giữa các cụm danh thắng, ẩm thực và chùa Khmer cổ kính."
        countLabel="Địa điểm trên bản đồ"
        countValue={`${filteredPlaces.length} điểm hiển thị`}
      />

      {/* FILTER & INTERACTIVE CONTROLS BAR */}
      <div className="bg-[#FFFDF7] p-5 sm:p-7 rounded-[28px] border border-[#26221B]/8 shadow-[0_2px_10px_rgba(38,34,27,0.08)] mb-8 space-y-4">
        {/* Category Filter */}
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#26221B] uppercase tracking-wider mb-2 font-display">
            <Layers className="w-4 h-4 text-[#0E8C7F]" />
            <span>Phân Loại Danh Mục Điểm Đến</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 font-display">
            {categories.map(cat => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 ${
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
          <div className="flex items-center gap-2 text-xs font-bold text-[#26221B] uppercase tracking-wider mb-2 font-display">
            <MapPin className="w-4 h-4 text-[#F0A32F]" />
            <span>Khu Vực Hành Chính Xã / Thị Trấn</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 font-display">
            {communes.map((c, i) => (
              <button
                key={i}
                onClick={() => setSelectedCommune(c)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 ${
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
        
        {/* Export Button */}
        <div className="pt-3 border-t border-[#26221B]/6 flex justify-end font-display">
          <button 
            onClick={() => setIsExportModalOpen(true)}
            className="px-5 py-2.5 bg-[#F0A32F] hover:bg-[#C97F1B] text-[#26221B] hover:text-white font-bold text-xs rounded-full flex items-center gap-2 shadow-xs transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Lưu Lịch Trình (Offline PDF/QR)</span>
          </button>
        </div>

      </div>

      {/* MAP & SIDE PANEL SPLIT VIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        
        {/* Main Map Container (2 Cols) */}
        <div className="lg:col-span-2 relative min-h-[480px] sm:min-h-[580px] rounded-[28px] overflow-hidden border border-[#26221B]/10 shadow-[0_4px_20px_rgba(38,34,27,0.1)]">
          <MapComponent 
            places={filteredPlaces} 
            selectedPlace={selectedPlace} 
            onSelectPlace={setSelectedPlace} 
          />
        </div>

        {/* Selected Place Preview Side Panel (1 Col) */}
        <div className="space-y-6">
          {selectedPlace ? (
            <div className="bg-[#FFFDF7] rounded-[28px] p-6 border border-[#26221B]/8 shadow-[0_2px_10px_rgba(38,34,27,0.08)] space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3.5 py-1 rounded-full bg-[#0E8C7F]/10 text-[#0E8C7F] text-xs font-bold border border-[#0E8C7F]/20 font-display">
                  {selectedPlace.commune}
                </span>
                <div className="flex items-center gap-1 text-xs font-bold text-[#26221B] font-display">
                  <Star className="w-4 h-4 fill-[#F0A32F] text-[#F0A32F]" />
                  <span>{selectedPlace.rating || 4.8}</span>
                </div>
              </div>

              {/* Photo */}
              <div className="aspect-[16/10] bg-slate-900 rounded-[20px] overflow-hidden relative">
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
                <h3 className="font-display text-xl font-bold text-[#26221B]">{selectedPlace.name}</h3>
                <p className="font-body text-xs text-[#6B6355] flex items-start gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-[#0E8C7F] shrink-0 mt-0.5" />
                  <span>{selectedPlace.address || `${selectedPlace.commune}, Tri Tôn`}</span>
                </p>
              </div>

              {/* Coordinates */}
              <div className="bg-[#FAF3E7] p-3.5 rounded-[18px] border border-[#26221B]/8 text-xs space-y-1.5 font-mono">
                <div className="flex justify-between text-[#6B6355]">
                  <span>Kinh độ (Lng):</span>
                  <span className="font-bold text-[#26221B]">{selectedPlace.longitude || '105.0125'}</span>
                </div>
                <div className="flex justify-between text-[#6B6355]">
                  <span>Vĩ độ (Lat):</span>
                  <span className="font-bold text-[#26221B]">{selectedPlace.latitude || '10.4215'}</span>
                </div>
              </div>

              <p className="font-body text-xs text-[#6B6355] leading-relaxed line-clamp-3">
                {selectedPlace.description || `Địa điểm nổi bật thuộc ${selectedPlace.commune}, Tri Tôn, An Giang.`}
              </p>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 font-display">
                <a
                  href={getGoogleMapsUrl({ name: selectedPlace.name, commune: selectedPlace.commune })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-full bg-[#F0A32F] hover:bg-[#C97F1B] text-[#26221B] hover:text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors active:scale-95"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Chỉ Đường Bằng Google Maps</span>
                </a>

                <Link
                  href={`/places/${selectedPlace.slug || selectedPlace.id}`}
                  className="w-full py-2.5 rounded-full bg-transparent hover:bg-[#FAF3E7] text-[#26221B] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-[#26221B]/15"
                >
                  <span>Xem Chi Tiết Địa Điểm</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>
          ) : (
            <div className="bg-[#FFFDF7] rounded-[28px] p-8 border border-[#26221B]/8 text-center font-body">
              <MapPin className="w-8 h-8 text-[#6B6355]/40 mx-auto mb-2" />
              <p className="text-xs text-[#6B6355]">Chọn một ghim địa điểm trên bản đồ để xem thông tin chi tiết.</p>
            </div>
          )}
        </div>

      </div>
      
      {isExportModalOpen && <ItineraryExportModal onClose={() => setIsExportModalOpen(false)} />}
    </div>
  );
}
