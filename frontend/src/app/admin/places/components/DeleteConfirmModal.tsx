'use client';

import React from 'react';
import { AlertCircle, Trash2, X } from 'lucide-react';
import { PlaceRecord } from '../types';

interface DeleteConfirmModalProps {
  place?: PlaceRecord | null;
  placeName?: string;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  place,
  placeName,
  onClose,
  onConfirm,
}) => {
  const name = placeName || place?.name;
  if (!name) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in font-body">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
        <div className="flex items-center justify-between">
          <div className="p-3 rounded-2xl bg-red-50 text-red-600 border border-red-100">
            <AlertCircle className="w-6 h-6" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <h3 className="font-extrabold text-slate-800 text-base font-display">
            Xác Nhận Vô Hiệu Hóa Địa Điểm?
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Bạn có chắc chắn muốn vô hiệu hóa &quot;<strong className="text-slate-800">{name}</strong>&quot;?
            Địa điểm sẽ bị ẩn khỏi cổng thông tin công khai và có thể khôi phục lại bất kỳ lúc nào.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 font-display">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
          >
            Hủy Bỏ
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Xác Nhận Ẩn</span>
          </button>
        </div>
      </div>
    </div>
  );
};
