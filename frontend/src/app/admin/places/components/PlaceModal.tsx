'use client';

import React, { useState } from 'react';
import {
  X,
  Database,
  RefreshCw,
  Edit,
  Plus,
  Compass,
  FileText,
  DollarSign,
  Image as ImageIcon,
  CheckCircle2,
  Camera,
} from 'lucide-react';
import { PlaceRecord } from '../types';
import { PlaceBasicTab } from './PlaceBasicTab';
import { PlaceStoryServiceTab } from './PlaceStoryServiceTab';
import { PhotoGalleryStudio } from './PhotoGalleryStudio';
import { CheckinSpotsManager, CheckinSpotItem } from './CheckinSpotsManager';

interface PlaceModalProps {
  place?: Partial<PlaceRecord>;
  placeData?: Partial<PlaceRecord>;
  isNew?: boolean;
  isEditMode?: boolean;
  onClose: () => void;
  onSuccess?: (place: PlaceRecord) => void;
  onSave?: (e: React.FormEvent) => void;
  onChange?: (updated: Partial<PlaceRecord>) => void;
  syncingVector?: boolean;
  setStatusMsg?: (msg: string | null) => void;
}

export const PlaceModal: React.FC<PlaceModalProps> = ({
  place,
  placeData: propPlaceData,
  isNew,
  isEditMode: propIsEditMode,
  onClose,
  onSuccess,
  onSave: propOnSave,
  onChange: propOnChange,
  syncingVector = false,
  setStatusMsg,
}) => {
  const isEditMode = propIsEditMode !== undefined ? propIsEditMode : !isNew;
  const initialData = propPlaceData || place || {};

  const [formData, setFormData] = useState<Partial<PlaceRecord>>(initialData);
  const [activeTab, setActiveTab] = useState<'basic' | 'story' | 'service' | 'media' | 'checkin'>('basic');
  const [saving, setSaving] = useState(false);

  const currentData = propOnChange ? (propPlaceData || formData) : formData;

  const handleChange = (updated: Partial<PlaceRecord>) => {
    if (propOnChange) {
      propOnChange(updated);
    } else {
      setFormData((prev) => ({ ...prev, ...updated }));
    }
  };

  const handleSaveInternal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (propOnSave) {
      propOnSave(e);
      return;
    }

    setSaving(true);
    try {
      const method = isEditMode ? 'PUT' : 'POST';
      const res = await fetch('/api/v1/admin/places', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success && onSuccess) {
        onSuccess(data.place || formData);
      } else if (!data.success) {
        alert(data.error || 'Lỗi lưu địa điểm');
      }
    } catch (err: any) {
      alert('Lỗi kết nối: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const photosList = Array.isArray(currentData.photos) && currentData.photos.length > 0
    ? currentData.photos
    : (currentData.image_url ? [currentData.image_url] : []);

  let parsedCheckinSpots: CheckinSpotItem[] = [];
  if (Array.isArray(currentData.checkin_spots)) {
    parsedCheckinSpots = currentData.checkin_spots as CheckinSpotItem[];
  } else if (typeof currentData.checkin_spots === 'string') {
    try {
      parsedCheckinSpots = JSON.parse(currentData.checkin_spots);
    } catch {
      parsedCheckinSpots = [];
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in font-body">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-100">
              {isEditMode ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-base sm:text-lg font-display">
                {isEditMode ? `Chỉnh Sửa: ${currentData.name || 'Địa Điểm'}` : 'Thêm Địa Điểm Mới Vào Hệ Thống'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {isEditMode
                  ? 'Cập nhật nội dung, ảnh, góc check-in và tự động đồng bộ Vector Embeddings 768d'
                  : 'Nạp địa điểm mới chuẩn thực địa Tri Tôn'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 pt-3 pb-1 border-b border-slate-100 overflow-x-auto text-xs font-bold font-display">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'basic' ? 'bg-[#1B4D3E] text-white shadow-xs' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Compass className="w-3.5 h-3.5" /> Cơ Bản
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('story')}
            className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'story' ? 'bg-[#1B4D3E] text-white shadow-xs' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Sự Tích
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('service')}
            className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'service' ? 'bg-[#1B4D3E] text-white shadow-xs' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" /> Dịch Vụ
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('media')}
            className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'media' ? 'bg-[#1B4D3E] text-white shadow-xs' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" /> Thư Viện Ảnh
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('checkin')}
            className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'checkin' ? 'bg-[#1B4D3E] text-white shadow-xs' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Camera className="w-3.5 h-3.5" /> Góc Check-in
          </button>
        </div>

        {/* Tab Contents */}
        <form id="place-form" onSubmit={handleSaveInternal} className="py-4 overflow-y-auto max-h-[50vh]">
          {activeTab === 'basic' && (
            <PlaceBasicTab placeData={currentData} onChange={handleChange} isEditMode={isEditMode} />
          )}

          {(activeTab === 'story' || activeTab === 'service') && (
            <PlaceStoryServiceTab placeData={currentData} onChange={handleChange} activeTab={activeTab} />
          )}

          {activeTab === 'media' && (
            <PhotoGalleryStudio
              photos={photosList}
              currentCoverUrl={currentData.image_url || ''}
              videoUrl={currentData.video_url || ''}
              onPhotosChange={(newPhotos) => handleChange({ photos: newPhotos })}
              onCoverChange={(newCoverUrl) => handleChange({ image_url: newCoverUrl })}
              onVideoUrlChange={(newVideoUrl) => handleChange({ video_url: newVideoUrl })}
              setStatusMsg={setStatusMsg || (() => {})}
            />
          )}

          {activeTab === 'checkin' && (
            <CheckinSpotsManager
              checkinSpots={parsedCheckinSpots}
              photos={photosList}
              onChange={(updatedSpots) => handleChange({ checkin_spots: updatedSpots })}
            />
          )}
        </form>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 font-display">
          <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-[11px]">
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>Tự động đồng bộ Vector 768d khi lưu</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              form="place-form"
              disabled={syncingVector || saving}
              className="px-5 py-2.5 rounded-xl bg-[#1B4D3E] hover:bg-[#153e32] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving || syncingVector ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Đang Lưu...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  {isEditMode ? 'Lưu Thay Đổi' : 'Tạo Địa Điểm'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
