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
import { PlaceRecord, COMMUNES, CATEGORIES } from '../types';
import { PhotoGalleryStudio } from './PhotoGalleryStudio';
import { CheckinSpotsManager, CheckinSpotItem } from './CheckinSpotsManager';

interface PlaceModalProps {
  isEditMode: boolean;
  placeData: Partial<PlaceRecord>;
  onClose: () => void;
  onSave: (e: React.FormEvent) => void;
  onChange: (updated: Partial<PlaceRecord>) => void;
  syncingVector: boolean;
  setStatusMsg: (msg: string | null) => void;
}

export const PlaceModal: React.FC<PlaceModalProps> = ({
  isEditMode,
  placeData,
  onClose,
  onSave,
  onChange,
  syncingVector,
  setStatusMsg,
}) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'story' | 'service' | 'media' | 'checkin'>('basic');

  const photosList = Array.isArray(placeData.photos) && placeData.photos.length > 0
    ? placeData.photos
    : (placeData.image_url ? [placeData.image_url] : []);

  // Parse checkin_spots
  let parsedCheckinSpots: CheckinSpotItem[] = [];
  if (Array.isArray(placeData.checkin_spots)) {
    parsedCheckinSpots = placeData.checkin_spots as CheckinSpotItem[];
  } else if (typeof placeData.checkin_spots === 'string') {
    try {
      parsedCheckinSpots = JSON.parse(placeData.checkin_spots);
    } catch {
      parsedCheckinSpots = [];
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-100">
              {isEditMode ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-lg">
                {isEditMode ? `Chỉnh Sửa: ${placeData.name}` : 'Thêm Địa Điểm Mới Vào Hệ Thống'}
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
        <div className="flex items-center gap-2 pt-3 pb-1 border-b border-slate-100 overflow-x-auto text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'basic'
                ? 'bg-[#1B4D3E] text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Compass className="w-3.5 h-3.5" /> Cơ Bản
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('story')}
            className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'story'
                ? 'bg-[#1B4D3E] text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Bài Viết
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('service')}
            className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'service'
                ? 'bg-[#1B4D3E] text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" /> Dịch Vụ
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('media')}
            className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'media'
                ? 'bg-[#1B4D3E] text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" /> Album Ảnh ({photosList.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('checkin')}
            className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'checkin'
                ? 'bg-[#1B4D3E] text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Camera className="w-3.5 h-3.5" /> Góc Check-in ({parsedCheckinSpots.length})
          </button>
        </div>

        {/* Modal Body */}
        <form id="place-form" onSubmit={onSave} className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
          {/* Tab 1: Basic */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tên Địa Điểm / Quán Ăn / Chùa:</label>
                <input
                  type="text"
                  required
                  value={placeData.name || ''}
                  onChange={(e) => onChange({ ...placeData, name: e.target.value })}
                  placeholder="Ví dụ: Gà Đốt Ô Thum Kim Suổl"
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-600 outline-hidden font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Xã / Thị Trấn:</label>
                  <select
                    value={placeData.commune || 'Thị trấn Tri Tôn'}
                    onChange={(e) => onChange({ ...placeData, commune: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-600 outline-hidden font-medium"
                  >
                    {COMMUNES.filter((c) => c !== 'ALL').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phân Loại Du Lịch:</label>
                  <select
                    value={placeData.tourism_category || 'Địa Điểm Tham Quan'}
                    onChange={(e) => onChange({ ...placeData, tourism_category: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-600 outline-hidden font-medium"
                  >
                    <option value="Địa Điểm Tham Quan">Địa Điểm Tham Quan</option>
                    <option value="Ẩm Thực & Đặc Sản">Ẩm Thực & Đặc Sản</option>
                    <option value="Văn Hóa & Tâm Linh">Văn Hóa & Tâm Linh</option>
                    <option value="Quán Cà Phê">Quán Cà Phê</option>
                    <option value="Lưu Trú & Homestay">Lưu Trú & Homestay</option>
                    <option value="Di Tích Lịch Sử">Di Tích Lịch Sử</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Đánh Giá (Rating):</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={placeData.rating || 4.8}
                    onChange={(e) => onChange({ ...placeData, rating: parseFloat(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Vĩ Độ (Lat):</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={placeData.latitude || 10.42}
                    onChange={(e) => onChange({ ...placeData, latitude: parseFloat(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kinh Độ (Lng):</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={placeData.longitude || 105.01}
                    onChange={(e) => onChange({ ...placeData, longitude: parseFloat(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mô Tả Ngắn (Giới thiệu 1-2 câu):</label>
                <textarea
                  rows={2}
                  value={placeData.description || ''}
                  onChange={(e) => onChange({ ...placeData, description: e.target.value })}
                  placeholder="Mô tả tóm tắt điểm nổi bật..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white outline-hidden"
                />
              </div>
            </div>
          )}

          {/* Tab 2: Rich Story */}
          {activeTab === 'story' && (
            <div className="space-y-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Bài Viết Chi Tiết (Chuẩn Folk-Modern 5 Phần):
                </label>
                <p className="text-[11px] text-slate-500 mb-1.5">
                  Khuyến nghị cấu trúc: ### 1. Vị Trí... ### 2. Cảnh Quan / Hương Vị... ### 3. Di Sản... ### 4. Trải Nghiệm... ### 5. Lưu Ý...
                </p>
                <textarea
                  rows={10}
                  value={placeData.detailed_story || ''}
                  onChange={(e) => onChange({ ...placeData, detailed_story: e.target.value })}
                  placeholder="### 1. Vị Trí & Không Gian...&#10;### 2. Hương Vị Đặc Sản...&#10;### 3. Di Sản Văn Hóa...&#10;### 4. Hướng Dẫn Trải Nghiệm...&#10;### 5. Lưu Ý & Thời Điểm Đẹp..."
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs leading-relaxed focus:bg-white outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Khung Giờ Vàng (Golden Time Windows):</label>
                <input
                  type="text"
                  value={placeData.golden_time_windows || ''}
                  onChange={(e) => onChange({ ...placeData, golden_time_windows: e.target.value })}
                  placeholder="06:00-08:00 • 16:00-17:30"
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                />
              </div>
            </div>
          )}

          {/* Tab 3: Service & Hours */}
          {activeTab === 'service' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 flex items-center justify-between">
                <div>
                  <span className="font-bold text-purple-950 block text-xs">Chế Độ Mở Muộn Về Đêm (Night Life)</span>
                  <span className="text-[11px] text-purple-700 font-medium">
                    Địa điểm phục vụ du khách trải nghiệm ẩm thực, dạo mát sau 17:00
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(placeData.open_late)}
                    onChange={(e) => onChange({ ...placeData, open_late: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-800"></div>
                </label>
              </div>

              {placeData.open_late && (
                <div>
                  <label className="font-bold text-purple-900 block mb-1">Khung Giờ Phục Vụ Đêm:</label>
                  <input
                    type="text"
                    value={placeData.night_hours || ''}
                    onChange={(e) => onChange({ ...placeData, night_hours: e.target.value })}
                    placeholder="17:00 - 22:30"
                    className="w-full p-2.5 rounded-xl bg-purple-50/30 border border-purple-200 font-bold"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Số Điện Thoại Liên Hệ:</label>
                  <input
                    type="text"
                    value={placeData.phone || ''}
                    onChange={(e) => onChange({ ...placeData, phone: e.target.value })}
                    placeholder="0296 3874 113"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mức Giá / Vé Tham Quan:</label>
                  <input
                    type="text"
                    value={placeData.price_level || ''}
                    onChange={(e) => onChange({ ...placeData, price_level: e.target.value })}
                    placeholder="Miễn phí / 20k - 50k / 250k - 350k/con"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Photo Gallery Studio */}
          {activeTab === 'media' && (
            <PhotoGalleryStudio
              photos={photosList}
              coverUrl={placeData.image_url || ''}
              videoUrl={placeData.video_url || ''}
              onPhotosChange={(updatedPhotos, newCoverUrl) => {
                onChange({
                  ...placeData,
                  photos: updatedPhotos,
                  image_url: newCoverUrl,
                });
              }}
              onCoverChange={(newCoverUrl) => {
                onChange({
                  ...placeData,
                  image_url: newCoverUrl,
                });
              }}
              onVideoUrlChange={(newVideoUrl) => {
                onChange({
                  ...placeData,
                  video_url: newVideoUrl,
                });
              }}
              setStatusMsg={setStatusMsg}
            />
          )}

          {/* Tab 5: Check-in Spots Manager */}
          {activeTab === 'checkin' && (
            <CheckinSpotsManager
              checkinSpots={parsedCheckinSpots}
              photos={photosList}
              onChange={(updatedSpots) => {
                onChange({
                  ...placeData,
                  checkin_spots: updatedSpots,
                });
              }}
            />
          )}
        </form>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-[11px]">
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>Tự động sinh Vector Embeddings 768d khi bấm Lưu</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              form="place-form"
              disabled={syncingVector}
              className="px-5 py-2.5 rounded-xl bg-[#1B4D3E] hover:bg-[#153e32] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {syncingVector ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Đang Đồng Bộ Vector...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  {isEditMode ? 'Lưu Thay Đổi' : 'Tạo Địa Điểm Mới'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
