'use client';

import React from 'react';
import { PlaceRecord, COMMUNES, CATEGORIES } from '../types';

interface PlaceBasicTabProps {
  placeData: Partial<PlaceRecord>;
  onChange: (updated: Partial<PlaceRecord>) => void;
  isEditMode: boolean;
}

export function PlaceBasicTab({ placeData, onChange, isEditMode }: PlaceBasicTabProps) {
  return (
    <div className="space-y-4 font-body text-xs">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="font-bold text-slate-700 block mb-1">Tên Địa Điểm (Tiếng Việt):</label>
          <input
            type="text"
            required
            value={placeData.name || ''}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="Ví dụ: Hồ Tà Pạ"
            className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:border-emerald-600 outline-hidden"
          />
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Tên Tiếng Anh (English Name):</label>
          <input
            type="text"
            value={(placeData as any).name_en || ''}
            onChange={(e) => onChange({ name_en: e.target.value } as any)}
            placeholder="E.g., Ta Pa Lake"
            className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:border-emerald-600 outline-hidden"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="font-bold text-slate-700 block mb-1">Địa Giới Xã / Thị Trấn:</label>
          <select
            value={placeData.commune || 'Xã Núi Tô'}
            onChange={(e) => onChange({ commune: e.target.value })}
            className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:border-emerald-600 outline-hidden"
          >
            {COMMUNES.filter((c) => c !== 'ALL').map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Danh Mục Du Lịch:</label>
          <select
            value={placeData.tourism_category || placeData.category || 'Danh Thắng Thiên Nhiên'}
            onChange={(e) => onChange({ tourism_category: e.target.value, category: e.target.value })}
            className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:border-emerald-600 outline-hidden"
          >
            {CATEGORIES.filter((cat) => cat !== 'ALL').map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="font-bold text-slate-700 block mb-1">Địa Chỉ Thực Địa:</label>
        <input
          type="text"
          value={placeData.address || ''}
          onChange={(e) => onChange({ address: e.target.value })}
          placeholder="Ví dụ: Đỉnh Đồi Tà Pạ, Xã Núi Tô, Tri Tôn"
          className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:border-emerald-600 outline-hidden"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="font-bold text-slate-700 block mb-1">Vĩ Độ (Latitude):</label>
          <input
            type="number"
            step="0.000001"
            value={placeData.latitude || ''}
            onChange={(e) => onChange({ latitude: parseFloat(e.target.value) || 0 })}
            placeholder="10.3854..."
            className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono focus:bg-white focus:border-emerald-600 outline-hidden"
          />
        </div>
        <div>
          <label className="font-bold text-slate-700 block mb-1">Kinh Độ (Longitude):</label>
          <input
            type="number"
            step="0.000001"
            value={placeData.longitude || ''}
            onChange={(e) => onChange({ longitude: parseFloat(e.target.value) || 0 })}
            placeholder="104.9961..."
            className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono focus:bg-white focus:border-emerald-600 outline-hidden"
          />
        </div>
      </div>
    </div>
  );
}
