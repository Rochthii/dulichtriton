'use client';

import React from 'react';
import { Star, ArrowLeft, ArrowRight, Trash2, Image as ImageIcon } from 'lucide-react';

interface PhotoGridListProps {
  photos: string[];
  coverUrl: string;
  onSetCover: (url: string) => void;
  onMovePhoto: (index: number, direction: 'left' | 'right') => void;
  onRemovePhoto: (index: number) => void;
}

export function PhotoGridList({
  photos,
  coverUrl,
  onSetCover,
  onMovePhoto,
  onRemovePhoto,
}: PhotoGridListProps) {
  if (photos.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-400 font-body">
        <ImageIcon className="w-8 h-8 text-slate-300 mx-auto mb-1" />
        <span>Chưa có hình ảnh nào trong bộ sưu tập.</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-body">
      {photos.map((url, idx) => {
        const isCover = url === coverUrl || (idx === 0 && !coverUrl);

        return (
          <div
            key={idx}
            className={`group relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-900 border-2 transition-all ${
              isCover ? 'border-[#0E8C7F] shadow-sm' : 'border-transparent'
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={`Ảnh ${idx + 1}`} className="w-full h-full object-cover" />

            {/* Cover Badge */}
            {isCover && (
              <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#0E8C7F] text-white text-[10px] font-bold font-display shadow-xs flex items-center gap-1">
                <Star className="w-2.5 h-2.5 fill-white" />
                <span>Ảnh Bìa</span>
              </span>
            )}

            {/* Hover Actions Bar */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 p-2">
              {!isCover && (
                <button
                  type="button"
                  onClick={() => onSetCover(url)}
                  className="p-1.5 rounded-lg bg-white/90 text-slate-800 hover:bg-white text-[10px] font-bold cursor-pointer"
                  title="Đặt làm ảnh bìa"
                >
                  <Star className="w-3 h-3 text-amber-500" />
                </button>
              )}

              <button
                type="button"
                onClick={() => onMovePhoto(idx, 'left')}
                disabled={idx === 0}
                className="p-1.5 rounded-lg bg-white/90 text-slate-800 hover:bg-white disabled:opacity-30 cursor-pointer"
                title="Di chuyển sang trái"
              >
                <ArrowLeft className="w-3 h-3" />
              </button>

              <button
                type="button"
                onClick={() => onMovePhoto(idx, 'right')}
                disabled={idx === photos.length - 1}
                className="p-1.5 rounded-lg bg-white/90 text-slate-800 hover:bg-white disabled:opacity-30 cursor-pointer"
                title="Di chuyển sang phải"
              >
                <ArrowRight className="w-3 h-3" />
              </button>

              <button
                type="button"
                onClick={() => onRemovePhoto(idx)}
                className="p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 cursor-pointer ml-1"
                title="Xóa ảnh"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
