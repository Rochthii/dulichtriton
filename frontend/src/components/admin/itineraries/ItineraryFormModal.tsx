'use client';

import React, { useState } from 'react';
import { X, Save, Sparkles, Check } from 'lucide-react';
import { ItineraryRecord, StopItem } from '@/components/admin/itineraries/ItineraryListTable';
import ItineraryStopsEditor, { PlacePOI } from '@/components/admin/itineraries/ItineraryStopsEditor';

interface ItineraryFormModalProps {
  initialTour?: ItineraryRecord | null;
  places: PlacePOI[];
  onClose: () => void;
  onSave: (payload: Partial<ItineraryRecord>) => Promise<void>;
  saving: boolean;
}

export default function ItineraryFormModal({
  initialTour,
  places,
  onClose,
  onSave,
  saving,
}: ItineraryFormModalProps) {
  const [formData, setFormData] = useState<Partial<ItineraryRecord>>(() => {
    if (initialTour) return { ...initialTour };
    return {
      title: '',
      emoji: '🧭',
      duration: '1 ngày (07:00 - 18:00)',
      total_distance_km: 25,
      recommended_vehicle: 'Xe máy / Ô tô',
      suitable_for: 'Gia đình & Giới trẻ',
      budget_estimate: '250.000đ - 450.000đ/người',
      tagline: '',
      description: '',
      is_active: true,
      sort_order: 10,
      stops: [],
    };
  });

  const [stops, setStops] = useState<StopItem[]>(() => initialTour?.stops || []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) return;

    // Recalculate total distance from stops if present
    const sumKm = stops.reduce((acc, s) => acc + (s.travel_to_next_km || 0), 0);
    const finalDistance = sumKm > 0 ? Math.round(sumKm * 10) / 10 : (formData.total_distance_km || 20);

    await onSave({
      ...formData,
      stops,
      total_distance_km: finalDistance,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#FFFDF7] rounded-3xl max-w-3xl w-full border border-[#26221B]/10 shadow-2xl overflow-hidden my-6 font-body flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-[#FAF3E7] border-b border-[#26221B]/10 flex items-center justify-between font-display shrink-0">
          <div>
            <span className="text-[11px] font-bold text-[#0E8C7F] uppercase tracking-wider">
              {initialTour ? 'Chỉnh Sửa Lịch Trình' : 'Tạo Lịch Trình Mới'}
            </span>
            <h2 className="text-base sm:text-lg font-black text-[#26221B]">
              {formData.title || 'Thông Tin Tour Khám Phá'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#6B6355] hover:text-[#26221B] hover:bg-black/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form (Scrollable) */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Basic Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="font-bold text-[#26221B] block mb-1">Tên Tour / Tiêu Đề:</label>
              <input
                type="text"
                required
                value={formData.title || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Ví dụ: Tour 1 Ngày: Tà Pạ – Soài Chek – Gà Đốt Ô Thum"
                className="w-full p-2.5 rounded-xl bg-[#FAF3E7] border border-[#26221B]/10 text-xs focus:outline-none focus:border-[#0E8C7F]"
              />
            </div>

            <div>
              <label className="font-bold text-[#26221B] block mb-1">Emoji Biểu Tượng:</label>
              <input
                type="text"
                value={formData.emoji || '🧭'}
                onChange={(e) => setFormData((prev) => ({ ...prev, emoji: e.target.value }))}
                placeholder="🧭"
                className="w-full p-2.5 rounded-xl bg-[#FAF3E7] border border-[#26221B]/10 text-xs text-center"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-[#26221B] block mb-1">Thời Lượng:</label>
              <input
                type="text"
                value={formData.duration || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, duration: e.target.value }))}
                placeholder="1 ngày (07:00 - 18:00)"
                className="w-full p-2.5 rounded-xl bg-[#FAF3E7] border border-[#26221B]/10 text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-[#26221B] block mb-1">Phương Tiện:</label>
              <input
                type="text"
                value={formData.recommended_vehicle || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, recommended_vehicle: e.target.value }))}
                placeholder="Xe máy / Ô tô"
                className="w-full p-2.5 rounded-xl bg-[#FAF3E7] border border-[#26221B]/10 text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-[#26221B] block mb-1">Chi Phí Dự Kiến:</label>
              <input
                type="text"
                value={formData.budget_estimate || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, budget_estimate: e.target.value }))}
                placeholder="250.000đ - 400.000đ"
                className="w-full p-2.5 rounded-xl bg-[#FAF3E7] border border-[#26221B]/10 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-[#26221B] block mb-1">Câu Khẩu Hiệu (Tagline):</label>
            <input
              type="text"
              value={formData.tagline || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, tagline: e.target.value }))}
              placeholder="Khám phá biểu tượng Bảy Núi trong một vòng khép kín trọn vẹn..."
              className="w-full p-2.5 rounded-xl bg-[#FAF3E7] border border-[#26221B]/10 text-xs"
            />
          </div>

          <div>
            <label className="font-bold text-[#26221B] block mb-1">Mô Tả Tổng Quan:</label>
            <textarea
              rows={3}
              value={formData.description || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Lịch trình khép vòng tối ưu cung đường, hạn chế quay đầu..."
              className="w-full p-2.5 rounded-xl bg-[#FAF3E7] border border-[#26221B]/10 text-xs"
            />
          </div>

          {/* Stops Editor Component */}
          <ItineraryStopsEditor stops={stops} setStops={setStops} places={places} />

          {/* Footer Submit Button */}
          <div className="pt-4 border-t border-[#26221B]/10 flex items-center justify-end gap-2 font-display">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-[#FAF3E7] hover:bg-[#EBE1D0] text-[#26221B] font-bold cursor-pointer transition-colors"
            >
              Hủy Bỏ
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-[#0E8C7F] hover:bg-[#085A52] text-white font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Đang lưu...' : 'Lưu Lịch Trình'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
