'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Place } from '@/components/PlaceCard';
import { resolvePlaceExternalLinks } from '@/lib/externalLinks';
import { getCategoryFallbackImage } from '@/lib/dataSanitizer';
import { Navigation, MapPin, Play, Star, Sparkles } from 'lucide-react';
import Link from 'next/link';

// Color-coded icons by category
const CATEGORY_COLORS: Record<string, string> = {
  attractions_nature: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  food_and_restaurants: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  khmer_pagodas_heritage: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  checkin_spots: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
  cafes_and_homestays: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
};

function getCategoryIcon(category: string) {
  const url = CATEGORY_COLORS[category] || 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
  return new L.Icon({
    iconUrl: url,
    iconRetinaUrl: url,
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [22, 36],
    iconAnchor: [11, 36],
    popupAnchor: [1, -30],
    shadowSize: [36, 36],
  });
}

// 2 Signature Scenic Routes in Tri Tôn
const SCENIC_ROUTES = [
  {
    name: 'Cung Đường Thốt Nốt & Hồ Nước (Tà Pạ → Soài So → Ô Thum)',
    color: '#0E8C7F',
    positions: [
      [10.4165, 105.0042], // Hồ Tà Pạ
      [10.4120, 104.9980], // Đồng lúa Tà Pạ
      [10.3889, 105.0056], // Núi Cô Tô
      [10.3820, 105.0120], // Hồ Soài So
      [10.4560, 104.9820], // Hồ Ô Thum
    ] as [number, number][],
  },
  {
    name: 'Cung Đường Di Sản & Lịch Sử (Ba Chúc → Ô Tà Sóc → Tức Dụp)',
    color: '#F0A32F',
    positions: [
      [10.4995, 104.8988], // Nhà mồ Ba Chúc
      [10.4850, 104.9200], // Chùa Tam Bửu
      [10.4350, 104.9600], // Căn cứ Ô Tà Sóc
      [10.4000, 104.9700], // Đồi Tức Dụp
    ] as [number, number][],
  },
];

interface MapComponentProps {
  places: Place[];
  selectedPlace: Place | null;
  onSelectPlace: (place: Place) => void;
}

// Helper component to center map on selected place
function MapController({ selectedPlace }: { selectedPlace: Place | null }) {
  const map = useMap();
  useEffect(() => {
    if (selectedPlace && selectedPlace.latitude && selectedPlace.longitude) {
      map.flyTo([selectedPlace.latitude, selectedPlace.longitude], 15, {
        animate: true,
        duration: 1.5,
      });
    }
  }, [selectedPlace, map]);
  return null;
}

export default function MapComponent({ places, selectedPlace, onSelectPlace }: MapComponentProps) {
  // Tri Tôn Bounding Box center
  const defaultCenter: [number, number] = [10.4215, 105.0125];

  return (
    <div className="w-full h-full min-h-[480px] sm:min-h-[580px] rounded-3xl overflow-hidden border border-[#26221B]/10 shadow-lg relative z-0">
      <MapContainer 
        center={defaultCenter} 
        zoom={12} 
        scrollWheelZoom={true} 
        className="w-full h-full absolute inset-0 z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Scenic Routes Highlight Lines */}
        {SCENIC_ROUTES.map((route, rIdx) => (
          <Polyline
            key={rIdx}
            positions={route.positions}
            pathOptions={{
              color: route.color,
              weight: 4,
              opacity: 0.85,
              dashArray: '6, 8',
            }}
          >
            <Tooltip sticky>
              <div className="text-xs font-bold font-display text-[#26221B]">
                {route.name}
              </div>
            </Tooltip>
          </Polyline>
        ))}
        
        {places.map((place) => {
          if (!place.latitude || !place.longitude) return null;

          const cat = place.tourism_category || place.category || '';
          const icon = getCategoryIcon(cat);
          const defaultThumb = getCategoryFallbackImage(place.category, place.name);

          const thumbUrl =
            place.image_url ||
            (place.photos && place.photos.length > 0 ? place.photos[0].url : null) ||
            defaultThumb;

          const rating = place.rating ? Number(place.rating).toFixed(1) : '4.8';

          const { maps, tiktok } = resolvePlaceExternalLinks({
            name: place.name,
            commune: place.commune,
            category: place.category,
            lat: place.latitude,
            lng: place.longitude,
            video_url: place.video_url,
            tiktok_videos: (place as any).tiktok_videos,
          });

          return (
            <Marker
              key={place.id}
              position={[place.latitude, place.longitude]}
              icon={icon}
              eventHandlers={{
                click: () => onSelectPlace(place),
              }}
            >
              <Popup className="custom-popup" minWidth={230} maxWidth={270}>
                <div style={{ fontFamily: 'Be Vietnam Pro, sans-serif', minWidth: 230 }}>
                  {/* Thumbnail */}
                  <div style={{ width: '100%', height: 115, overflow: 'hidden', borderRadius: 12, marginBottom: 8, background: '#151B34' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={thumbUrl}
                      alt={place.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      loading="lazy"
                    />
                  </div>

                  {/* Meta Bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#0E8C7F', background: '#FAF3E7', padding: '2px 8px', borderRadius: 99, border: '1px solid rgba(14,140,127,0.2)' }}>
                      {place.commune}
                    </span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#26221B', background: '#F0A32F', padding: '2px 6px', borderRadius: 99 }}>
                      ★ {rating}
                    </span>
                  </div>

                  <h4 style={{ fontWeight: 700, fontSize: 13, color: '#26221B', marginBottom: 6, lineHeight: 1.3, fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                    {place.name}
                  </h4>

                  {/* Buttons */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 8 }}>
                    <a
                      href={maps.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '7px 0', background: '#F0A32F', color: '#26221B', borderRadius: 99, fontSize: 11, fontWeight: 700, textDecoration: 'none' }}
                    >
                      <Navigation style={{ width: 12, height: 12 }} />
                      <span>Chỉ đường Google Maps</span>
                    </a>
                    <Link
                      href={`/places/${place.slug || place.id}`}
                      style={{ display: 'block', textAlign: 'center', padding: '6px 0', background: '#FAF3E7', color: '#0E8C7F', borderRadius: 99, fontSize: 11, fontWeight: 700, textDecoration: 'none', border: '1px solid rgba(14,140,127,0.2)' }}
                    >
                      Xem chi tiết cẩm nang
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
        
        <MapController selectedPlace={selectedPlace} />
      </MapContainer>
      
      {/* Top Map Status Overlay */}
      <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 z-[400] pointer-events-none">
        <div className="bg-[#151B34]/90 backdrop-blur-md px-3.5 py-2 rounded-2xl text-xs font-semibold flex items-center gap-2 border border-white/10 text-white pointer-events-auto shadow-md font-display">
          <MapPin className="w-4 h-4 text-[#F0A32F]" />
          <span>Bản đồ du lịch thực địa Bảy Núi</span>
        </div>

        <div className="bg-[#0E8C7F] px-3.5 py-2 rounded-2xl text-xs font-bold text-white shadow-md pointer-events-auto font-display">
          {places.length} Địa điểm đã xác minh
        </div>
      </div>
    </div>
  );
}
