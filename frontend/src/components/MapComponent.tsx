'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Place } from '@/components/PlaceCard';
import { getGoogleMapsUrl } from '@/lib/utils';
import { Navigation, MapPin } from 'lucide-react';
import Link from 'next/link';

// Fix Leaflet's default icon path issues in Next.js
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

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
    iconSize: [20, 33],
    iconAnchor: [10, 33],
    popupAnchor: [1, -28],
    shadowSize: [33, 33],
  });
}

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
        duration: 1.5
      });
    }
  }, [selectedPlace, map]);
  return null;
}

export default function MapComponent({ places, selectedPlace, onSelectPlace }: MapComponentProps) {
  // Tri Ton Bounding Box center roughly
  const defaultCenter: [number, number] = [10.4215, 105.0125]; 

  return (
    <div className="w-full h-full min-h-[480px] sm:min-h-[580px] rounded-3xl overflow-hidden border border-slate-200 shadow-lg relative z-0">
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
        
        {places.map((place) => {
          if (!place.latitude || !place.longitude) return null;

          const cat = place.tourism_category || place.category || '';
          const icon = getCategoryIcon(cat);

          // Extract best available thumbnail
          const thumbUrl =
            place.image_url ||
            (place.photos && place.photos.length > 0 ? place.photos[0].url : null) ||
            '/images/tiktok/ho_ta_pa.jpg';

          const rating = place.rating ? Number(place.rating).toFixed(1) : '4.8';

          return (
            <Marker
              key={place.id}
              position={[place.latitude, place.longitude]}
              icon={icon}
              eventHandlers={{
                click: () => onSelectPlace(place),
              }}
            >
              <Popup className="custom-popup" minWidth={220} maxWidth={260}>
                <div style={{ fontFamily: 'Inter, sans-serif', minWidth: 220 }}>
                  {/* Thumbnail */}
                  <div style={{ width: '100%', height: 110, overflow: 'hidden', borderRadius: 8, marginBottom: 8, background: '#0f2d24' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={thumbUrl}
                      alt={place.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { (e.target as HTMLImageElement).src = '/images/tiktok/ho_ta_pa.jpg'; }}
                    />
                  </div>

                  {/* Meta */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#1B4D3E', background: '#f0fdf4', padding: '2px 8px', borderRadius: 99, border: '1px solid #bbf7d0' }}>
                      {place.commune}
                    </span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#92400e', background: '#fef3c7', padding: '2px 6px', borderRadius: 99 }}>
                      {rating}
                    </span>
                  </div>

                  <h4 style={{ fontWeight: 700, fontSize: 13, color: '#0f172a', marginBottom: 2, lineHeight: 1.3 }}>{place.name}</h4>

                  {/* Buttons */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
                    <a
                      href={getGoogleMapsUrl(place.name, place.commune)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '7px 0', background: '#1B4D3E', color: '#fff', borderRadius: 8, fontSize: 11, fontWeight: 700, textDecoration: 'none' }}
                    >
                      <Navigation style={{ width: 13, height: 13, color: '#D99B26' }} />
                      <span>Chỉ đường</span>
                    </a>
                    <Link
                      href={`/places/${place.id}`}
                      style={{ display: 'block', textAlign: 'center', padding: '7px 0', background: '#f8fafc', color: '#1e293b', borderRadius: 8, fontSize: 11, fontWeight: 600, textDecoration: 'none', border: '1px solid #e2e8f0' }}
                    >
                      Xem chi tiết
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
        <div className="bg-slate-950/85 backdrop-blur-md px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border border-white/10 text-white pointer-events-auto shadow-md">
          <MapPin className="w-4 h-4 text-[#D99B26]" />
          <span>Bounding Box WGS84 [10.25 - 10.55 Lat]</span>
        </div>

        <div className="bg-[#1B4D3E] px-3.5 py-2 rounded-xl text-xs font-bold text-white shadow-md pointer-events-auto">
          Hiển thị {places.length} Pins
        </div>
      </div>
    </div>
  );
}
