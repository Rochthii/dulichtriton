'use client';

import React from 'react';
import { PlaceRecord } from '../types';

interface PlaceStoryServiceTabProps {
  placeData: Partial<PlaceRecord>;
  onChange: (updated: Partial<PlaceRecord>) => void;
  activeTab: 'story' | 'service';
}

export function PlaceStoryServiceTab({ placeData, onChange, activeTab }: PlaceStoryServiceTabProps) {
  if (activeTab === 'story') {
    return (
      <div className="space-y-3 font-body text-xs">
        <div>
          <label className="font-bold text-slate-700 block mb-1">Mô Tả Ngắn (Short Description):</label>
          <textarea
            rows={2}
            value={placeData.short_description || ''}
            onChange={(e) => onChange({ short_description: e.target.value })}
            placeholder="Tóm tắt điểm nhấn nổi bật trong 1-2 câu..."
            className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:border-emerald-600 outline-hidden"
          />
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Câu Chuyện Sự Tích & Di Sản Văn Hóa:</label>
          <textarea
            rows={6}
            value={placeData.detailed_story || ''}
            onChange={(e) => onChange({ detailed_story: e.target.value })}
            placeholder="Kể chi tiết sự tích nguồn gốc, ý nghĩa lịch sử hoặc truyền thuyết địa danh..."
            className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs leading-relaxed focus:bg-white focus:border-emerald-600 outline-hidden"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 font-body text-xs">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="font-bold text-slate-700 block mb-1">Giờ Mở Cửa:</label>
          <input
            type="text"
            value={placeData.opening_hours || ''}
            onChange={(e) => onChange({ opening_hours: e.target.value })}
            placeholder="07:00 - 18:00 (Hàng ngày)"
            className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:border-emerald-600 outline-hidden"
          />
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Giá Vé Vào Cổng:</label>
          <input
            type="text"
            value={placeData.price_level || ''}
            onChange={(e) => onChange({ price_level: e.target.value })}
            placeholder="Miễn phí / 20.000đ"
            className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:border-emerald-600 outline-hidden"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="font-bold text-slate-700 block mb-1">Khung Giờ Đẹp Nhất:</label>
          <input
            type="text"
            value={placeData.best_visit_time || ''}
            onChange={(e) => onChange({ best_visit_time: e.target.value })}
            placeholder="06:00 - 08:30 (Săn mây, đón bình minh)"
            className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:border-emerald-600 outline-hidden"
          />
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Số Điện Thoại Liên Hệ:</label>
          <input
            type="text"
            value={placeData.phone || ''}
            onChange={(e) => onChange({ phone: e.target.value })}
            placeholder="0912..."
            className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono focus:bg-white focus:border-emerald-600 outline-hidden"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-4 pt-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={!!placeData.is_hot}
            onChange={(e) => onChange({ is_hot: e.target.checked })}
            className="w-4 h-4 accent-[#0E8C7F]"
          />
          <span className="font-bold text-slate-700">Điểm Đến Hot (Nổi Bật)</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={!!placeData.open_late}
            onChange={(e) => onChange({ open_late: e.target.checked })}
            className="w-4 h-4 accent-purple-700"
          />
          <span className="font-bold text-slate-700">Mở Cửa Đêm (Night Spot)</span>
        </label>
      </div>
    </div>
  );
}
