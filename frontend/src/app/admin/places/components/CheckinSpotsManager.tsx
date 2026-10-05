'use client';

import React from 'react';
import { Camera, Plus, Trash2, Image as ImageIcon, Sparkles, ImageOff } from 'lucide-react';

export interface CheckinSpotItem {
  title: string;
  photo_url: string;
  tip?: string;
  best_time?: string;
}

/**
 * Generates canonical rendered DOM snapshot fragment for Checkin Spot image preview
 * Used to verify honest failure state (zero unverified stock photos)
 */
export function renderCheckinSpotPreviewSnapshot(photoUrl?: string | null, title: string = 'Góc check-in'): string {
  const hasAuthenticPhoto = Boolean(
    photoUrl && typeof photoUrl === 'string' && photoUrl.trim().length > 0 && !photoUrl.includes('unsplash.com')
  );
  if (hasAuthenticPhoto) {
    return `<img src="${photoUrl}" alt="${title}" class="w-full h-full object-cover" />`;
  }
  return `<div class="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 p-2 text-center" data-testid="honest-failure-state"><svg class="lucide lucide-image-off w-6 h-6 mb-1 text-slate-400"></svg><span class="text-[10px] font-medium text-slate-500">Chưa có ảnh thực địa</span></div>`;
}

interface CheckinSpotsManagerProps {
  checkinSpots: CheckinSpotItem[];
  photos: string[];
  onChange: (updatedSpots: CheckinSpotItem[]) => void;
}

export const CheckinSpotsManager: React.FC<CheckinSpotsManagerProps> = ({
  checkinSpots,
  photos,
  onChange,
}) => {
  const handleAddSpot = () => {
    const fallbackPhoto = photos && photos.length > 0 ? photos[checkinSpots.length % photos.length] : '';
    const newSpot: CheckinSpotItem = {
      title: `Góc check-in #${checkinSpots.length + 1}`,
      photo_url: fallbackPhoto,
      tip: 'Góc chụp bắt sáng tự nhiên đẹp nhất vào buổi sáng sớm hoặc hoàng hôn.',
    };
    onChange([...checkinSpots, newSpot]);
  };

  const handleUpdateSpot = (index: number, field: keyof CheckinSpotItem, value: string) => {
    const newSpots = [...checkinSpots];
    newSpots[index] = { ...newSpots[index], [field]: value };
    onChange(newSpots);
  };

  const handleDeleteSpot = (index: number) => {
    const newSpots = checkinSpots.filter((_, i) => i !== index);
    onChange(newSpots);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-emerald-800" /> Danh Sách Góc Check-in & Tọa Độ Sống Ảo ({checkinSpots.length})
          </h4>
          <p className="text-[11px] text-slate-500 font-medium">
            Tùy chỉnh tiêu đề, ảnh thực tế và mẹo chụp góc ảnh cho từng tọa độ
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddSpot}
          className="px-3 py-1.5 bg-[#1B4D3E] hover:bg-[#143c30] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" /> Thêm Góc Mới
        </button>
      </div>

      {checkinSpots.length === 0 ? (
        <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
          <Camera className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-medium">Chưa có góc check-in nào được định cấu hình.</p>
          <button
            type="button"
            onClick={handleAddSpot}
            className="mt-2 px-3 py-1.5 bg-emerald-800 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Tạo Góc Check-in Đầu Tiên
          </button>
        </div>
      ) : (
        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
          {checkinSpots.map((spot, idx) => (
            <div
              key={idx}
              className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5 relative group hover:border-emerald-500 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="bg-emerald-100 text-emerald-900 text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-700" /> Góc #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => handleDeleteSpot(idx)}
                  className="p-1 rounded-lg text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                  title="Xóa góc này"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* Image Preview & Quick Picker */}
                <div className="space-y-1">
                  <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-200 border border-slate-300 relative flex items-center justify-center">
                    {spot.photo_url && !spot.photo_url.includes('unsplash.com') ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={spot.photo_url}
                        alt={spot.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 p-2 text-center"
                        data-testid="honest-failure-state"
                      >
                        <ImageOff className="w-6 h-6 mb-1 text-slate-400" />
                        <span className="text-[10px] font-medium text-slate-500">Chưa có ảnh thực địa</span>
                      </div>
                    )}
                  </div>

                  {/* Album Quick Selector */}
                  {photos && photos.length > 0 && (
                    <div className="flex gap-1 overflow-x-auto py-1 scrollbar-none">
                      {photos.map((pUrl, pIdx) => (
                        <button
                          key={pIdx}
                          type="button"
                          onClick={() => handleUpdateSpot(idx, 'photo_url', pUrl)}
                          className={`w-6 h-6 rounded-md overflow-hidden border shrink-0 cursor-pointer ${
                            spot.photo_url === pUrl ? 'border-amber-500 ring-1 ring-amber-400' : 'border-slate-300 opacity-60 hover:opacity-100'
                          }`}
                          title="Chọn ảnh này từ Album"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={pUrl} alt="Thumb" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Form fields */}
                <div className="sm:col-span-2 space-y-2">
                  <div>
                    <label className="font-bold text-slate-700 block mb-0.5 text-[11px]">Tên Góc Check-in:</label>
                    <input
                      type="text"
                      value={spot.title || ''}
                      onChange={(e) => handleUpdateSpot(idx, 'title', e.target.value)}
                      placeholder="Ví dụ: Góc chụp chính diện Cổng Thời Gian..."
                      className="w-full p-2 rounded-xl bg-white border border-slate-200 text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-0.5 text-[11px]">Link Ảnh Check-in:</label>
                    <input
                      type="text"
                      value={spot.photo_url || ''}
                      onChange={(e) => handleUpdateSpot(idx, 'photo_url', e.target.value)}
                      placeholder="https://..."
                      className="w-full p-2 rounded-xl bg-white border border-slate-200 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-0.5 text-[11px]">Mẹo Chụp & Góc Bắt Sáng:</label>
                    <input
                      type="text"
                      value={spot.tip || ''}
                      onChange={(e) => handleUpdateSpot(idx, 'tip', e.target.value)}
                      placeholder="Mẹo chụp: Khuyên dùng ống kính góc rộng, chụp lúc 6:30 sáng..."
                      className="w-full p-2 rounded-xl bg-white border border-slate-200 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
