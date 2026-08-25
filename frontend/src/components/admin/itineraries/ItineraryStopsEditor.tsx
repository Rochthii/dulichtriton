'use client';

import React, { useState } from 'react';
import { 
  Plus, Trash2, ArrowUp, ArrowDown, MapPin, Clock, 
  Car, Sparkles, AlertCircle, Check
} from 'lucide-react';
import { StopItem } from '@/components/admin/itineraries/ItineraryListTable';

export interface PlacePOI {
  id: string;
  name: string;
  commune?: string;
  category?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
}

// Haversine Distance with 1.25x mountain road winding factor
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
  return Math.round(R * c * 1.25 * 10) / 10;
}

function estimateTravelMinutes(distanceKm: number): number {
  if (distanceKm <= 0) return 0;
  const mins = Math.round((distanceKm / 35) * 60 + 3);
  return Math.max(5, mins);
}

interface ItineraryStopsEditorProps {
  stops: StopItem[];
  setStops: React.Dispatch<React.SetStateAction<StopItem[]>>;
  places: PlacePOI[];
}

export default function ItineraryStopsEditor({
  stops,
  setStops,
  places,
}: ItineraryStopsEditorProps) {
  const [selectedPoiId, setSelectedPoiId] = useState('');
  const [customStopName, setCustomStopName] = useState('');

  const handleAddPoiStop = () => {
    let newStop: StopItem;
    if (selectedPoiId) {
      const found = places.find((p) => p.id === selectedPoiId);
      if (!found) return;
      newStop = {
        id: found.id,
        poi_id: found.id,
        name: found.name,
        commune: found.commune || '',
        category: found.category || '',
        time: '08:00 - 09:30',
        duration_min: 90,
        tip: 'Khám phá và chụp ảnh check-in',
      };
    } else if (customStopName.trim()) {
      newStop = {
        name: customStopName.trim(),
        commune: 'Tri Tôn',
        time: '08:00 - 09:30',
        duration_min: 90,
        tip: 'Điểm dừng thực địa',
      };
    } else {
      return;
    }

    // Auto calculate distance from last stop if both have coords
    if (stops.length > 0) {
      const lastStop = stops[stops.length - 1];
      const lastPoi = places.find((p) => p.id === lastStop.poi_id || p.name === lastStop.name);
      const currentPoi = places.find((p) => p.id === newStop.poi_id || p.name === newStop.name);

      if (lastPoi?.latitude && lastPoi?.longitude && currentPoi?.latitude && currentPoi?.longitude) {
        const dist = calculateDistanceKm(
          lastPoi.latitude,
          lastPoi.longitude,
          currentPoi.latitude,
          currentPoi.longitude
        );
        const mins = estimateTravelMinutes(dist);
        lastStop.travel_to_next_km = dist;
        lastStop.travel_to_next_min = mins;
      }
    }

    setStops((prev) => [...prev, newStop]);
    setSelectedPoiId('');
    setCustomStopName('');
  };

  const handleRemoveStop = (idx: number) => {
    setStops((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleMoveStop = (idx: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && idx === 0) || (direction === 'down' && idx === stops.length - 1)) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    setStops((prev) => {
      const copy = [...prev];
      const temp = copy[idx];
      copy[idx] = copy[targetIdx];
      copy[targetIdx] = temp;
      return copy;
    });
  };

  const handleUpdateStop = (idx: number, field: keyof StopItem, val: any) => {
    setStops((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  return (
    <div className="space-y-4 font-body">
      <div className="flex items-center justify-between border-b border-[#26221B]/10 pb-2 font-display">
        <h3 className="font-extrabold text-sm text-[#26221B] flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-[#0E8C7F]" />
          <span>Danh Sách Điểm Dừng ({stops.length} Chặng)</span>
        </h3>
        <span className="text-xs text-[#6B6355]">Kéo thả hoặc nhấn mũi tên để đổi thứ tự</span>
      </div>

      {/* Add New Stop Selector */}
      <div className="p-3.5 rounded-2xl bg-[#FAF3E7] border border-[#26221B]/10 flex flex-col sm:flex-row items-center gap-2">
        <select
          value={selectedPoiId}
          onChange={(e) => {
            setSelectedPoiId(e.target.value);
            setCustomStopName('');
          }}
          className="w-full sm:flex-1 p-2 rounded-xl bg-white border border-[#26221B]/10 text-xs focus:outline-none focus:border-[#0E8C7F]"
        >
          <option value="">-- Chọn điểm đến từ 149 POIs xác minh --</option>
          {places.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.commune || 'Tri Tôn'})
            </option>
          ))}
        </select>

        <span className="text-xs text-[#6B6355] font-bold">hoặc</span>

        <input
          type="text"
          value={customStopName}
          onChange={(e) => {
            setCustomStopName(e.target.value);
            setSelectedPoiId('');
          }}
          placeholder="Nhập tên điểm dừng tự do..."
          className="w-full sm:w-52 p-2 rounded-xl bg-white border border-[#26221B]/10 text-xs focus:outline-none focus:border-[#0E8C7F]"
        />

        <button
          type="button"
          onClick={handleAddPoiStop}
          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#0E8C7F] hover:bg-[#085A52] text-white text-xs font-bold flex items-center justify-center gap-1 cursor-pointer shrink-0 font-display"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Thêm Chặng</span>
        </button>
      </div>

      {/* Stops List */}
      {stops.length === 0 ? (
        <div className="p-6 text-center text-xs text-[#6B6355] bg-white rounded-2xl border border-dashed border-[#26221B]/20">
          Chưa có điểm dừng nào trong tour. Hãy chọn điểm đến từ menu phía trên.
        </div>
      ) : (
        <div className="space-y-2.5">
          {stops.map((stop, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-white border border-[#26221B]/10 shadow-2xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-display">
                  <span className="w-6 h-6 rounded-full bg-[#0E8C7F] text-white font-bold text-xs flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="font-extrabold text-xs text-[#26221B]">{stop.name}</span>
                  {stop.commune && (
                    <span className="text-[10px] text-[#6B6355] font-mono">({stop.commune})</span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleMoveStop(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1 rounded-md text-[#6B6355] hover:text-[#26221B] disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveStop(idx, 'down')}
                    disabled={idx === stops.length - 1}
                    className="p-1 rounded-md text-[#6B6355] hover:text-[#26221B] disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveStop(idx)}
                    className="p-1 rounded-md text-rose-600 hover:bg-rose-50 cursor-pointer ml-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Editable Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-[#6B6355] font-bold block mb-0.5">Khung giờ:</label>
                  <input
                    type="text"
                    value={stop.time || ''}
                    onChange={(e) => handleUpdateStop(idx, 'time', e.target.value)}
                    placeholder="08:00 - 09:30"
                    className="w-full p-1.5 rounded-lg bg-[#FAF3E7] border border-[#26221B]/10 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#6B6355] font-bold block mb-0.5">Cự ly đến điểm tiếp theo (km):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={stop.travel_to_next_km || ''}
                    onChange={(e) => handleUpdateStop(idx, 'travel_to_next_km', parseFloat(e.target.value) || 0)}
                    placeholder="3.5"
                    className="w-full p-1.5 rounded-lg bg-[#FAF3E7] border border-[#26221B]/10 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#6B6355] font-bold block mb-0.5">Lưu ý / Trải nghiệm:</label>
                  <input
                    type="text"
                    value={stop.tip || ''}
                    onChange={(e) => handleUpdateStop(idx, 'tip', e.target.value)}
                    placeholder="Gợi ý ăn uống, chụp ảnh..."
                    className="w-full p-1.5 rounded-lg bg-[#FAF3E7] border border-[#26221B]/10 text-xs"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
