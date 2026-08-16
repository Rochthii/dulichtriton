'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Place } from '@/components/PlaceCard';
import { resolvePlaceExternalLinks } from '@/lib/externalLinks';
import { getCategoryFallbackImage } from '@/lib/dataSanitizer';
import { Navigation, MapPin, Play, Star, Sparkles, LocateFixed } from 'lucide-react';
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

// User GPS Pulse Marker Icon
const userGpsIcon = new L.DivIcon({
  className: 'user-gps-pulse-marker',
  html: `
    <div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; width: 24px; height: 24px; border-radius: 50%; background: rgba(14, 140, 127, 0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div style="position: relative; width: 14px; height: 14px; border-radius: 50%; background: #0E8C7F; border: 2.5px solid #FFFFFF; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

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
  userLocation?: { lat: number; lng: number } | null;
  radiusKm?: number | null;
}

// Helper component to center map on selected place or user GPS
function MapController({
  selectedPlace,
  userLocation,
}: {
  selectedPlace: Place | null;
  userLocation?: { lat: number; lng: number } | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (selectedPlace && selectedPlace.latitude && selectedPlace.longitude) {
      map.flyTo([selectedPlace.latitude, selectedPlace.longitude], 15, {
        animate: true,
        duration: 1.2,
      });
    }
  }, [selectedPlace, map]);

  return null;
}

export default function MapComponent({
  places,
  selectedPlace,
  onSelectPlace,
  userLocation,
  radiusKm,
}: MapComponentProps) {
  // Tri Tôn Bounding Box center
  const defaultCenter: [number, number] = [10.4215, 105.0125];

  return (
    <div className="w-full h-full min-h-[480px] sm:min-h-[580px] rounded-3xl overflow-hidden border border-[#26221B]/10 shadow-lg relative z-0">
      <MapContainer
        center={userLocation ? [userLocation.lat, userLocation.lng] : defaultCenter}
        zoom={userLocation ? 13 : 12}
        scrollWheelZoom={true}
        className="w-full h-full absolute inset-0 z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User GPS Live Marker & Radar Circle */}
        {userLocation && (
          <>
            <Marker position={[userLocation.lat, userLocation.lng]} icon={userGpsIcon}>
              <Popup>
                <div className="text-xs font-bold font-display text-emerald-800">
                  📍 Vị trí hiện tại của Bạn
                </div>
              </Popup>
            </Marker>

            {radiusKm && radiusKm > 0 && (
              <Circle
                center={[userLocation.lat, userLocation.lng]}
                radius={radiusKm * 1000}
                pathOptions={{
                  color: '#0E8C7F',
                  fillColor: '#0E8C7F',
                  fillOpacity: 0.12,
                  weight: 2,
                  dashArray: '4, 6',
                }}
              />
            )}
          </>
        )}

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
          let catKey = 'attractions_nature';
          if (cat.toLowerCase().includes('ẩm thực') || cat.toLowerCase().includes('food')) catKey = 'food_and_restaurants';
          else if (cat.toLowerCase().includes('chùa') || cat.toLowerCase().includes('tâm linh') || cat.toLowerCase().includes('heritage')) catKey = 'khmer_pagodas_heritage';
          else if (cat.toLowerCase().includes('check-in')) catKey = 'checkin_spots';
          else if (cat.toLowerCase().includes('lưu trú') || cat.toLowerCase().includes('homestay') || cat.toLowerCase().includes('khách sạn')) catKey = 'cafes_and_homestays';

          const icon = getCategoryIcon(catKey);

          return (
            <Marker
              key={place.id}
              position={[place.latitude, place.longitude]}
              icon={icon}
              eventHandlers={{
                click: () => onSelectPlace(place),
              }}
            >
              <Popup className="custom-map-popup">
                <div className="p-1 space-y-2 max-w-[240px]">
                  <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={place.image_url || getCategoryFallbackImage(place.category)}
                      alt={place.name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-white/95 text-[#26221B] font-bold text-[10px] flex items-center gap-0.5">
                      <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-500" />
                      {place.rating || 4.8}
                    </span>
                  </div>

                  <div>
                    <span className="text-[9px] font-bold text-[#F0A32F] uppercase tracking-wider block font-mono">
                      {place.commune}
                    </span>
                    <h4 className="font-display font-bold text-xs text-[#26221B] line-clamp-1">
                      {place.name}
                    </h4>
                  </div>

                  <div className="flex items-center gap-1.5 pt-1">
                    <Link
                      href={`/places/${place.slug || place.id}`}
                      className="flex-1 py-1 rounded-lg bg-[#0E8C7F] text-white text-center font-bold text-[10px] font-display hover:bg-[#085A52] transition-colors"
                    >
                      Chi Tiết
                    </Link>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' ' + place.commune + ' Tri Tôn An Giang')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                      title="Mở Google Maps chỉ đường"
                    >
                      <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        <MapController selectedPlace={selectedPlace} userLocation={userLocation} />
      </MapContainer>
    </div>
  );
}
