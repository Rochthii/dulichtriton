'use client';

import React, { useState } from 'react';
import {
  Upload,
  Link as LinkIcon,
  Image as ImageIcon,
  Star,
  ArrowLeft,
  ArrowRight,
  Trash2,
  RefreshCw,
  Plus,
  Zap,
} from 'lucide-react';
import { compressImageFile } from '@/lib/imageCompressor';

interface PhotoGalleryStudioProps {
  photos: string[];
  coverUrl: string;
  videoUrl?: string;
  onPhotosChange: (updatedPhotos: string[], newCoverUrl: string) => void;
  onCoverChange: (newCoverUrl: string) => void;
  onVideoUrlChange: (newVideoUrl: string) => void;
  setStatusMsg: (msg: string | null) => void;
}

export const PhotoGalleryStudio: React.FC<PhotoGalleryStudioProps> = ({
  photos,
  coverUrl,
  videoUrl = '',
  onPhotosChange,
  onCoverChange,
  onVideoUrlChange,
  setStatusMsg,
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [compressionSavings, setCompressionSavings] = useState<string | null>(null);

  // 1. Multi-file upload with client-side Canvas WebP compression
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setCompressionSavings(null);

    try {
      let totalOriginalBytes = 0;
      let totalCompressedBytes = 0;

      // Compress all selected images on client-side before sending
      const compressionPromises = Array.from(files).map(async (file) => {
        totalOriginalBytes += file.size;
        const res = await compressImageFile(file, { maxWidth: 1600, maxHeight: 1600, quality: 0.82 });
        totalCompressedBytes += res.compressedSize;
        return res.base64;
      });

      const compressedBase64Array = await Promise.all(compressionPromises);

      // Calculate bandwidth savings percentage
      if (totalOriginalBytes > 0) {
        const savedPct = Math.round(((totalOriginalBytes - totalCompressedBytes) / totalOriginalBytes) * 100);
        const origMB = (totalOriginalBytes / (1024 * 1024)).toFixed(1);
        const compKB = (totalCompressedBytes / 1024).toFixed(0);
        setCompressionSavings(`Đã nén tiết kiệm ${savedPct}% dung lượng (${origMB}MB ➔ ${compKB}KB WebP)`);
      }

      // Upload compressed base64 to Cloudinary API
      const res = await fetch('/api/v1/admin/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: compressedBase64Array, folder: 'tri_ton_places' }),
      });

      const data = await res.json();
      if (data.urls && data.urls.length > 0) {
        const currentPhotos = Array.isArray(photos) && photos.length > 0 ? photos : (coverUrl ? [coverUrl] : []);
        const updatedPhotos = Array.from(new Set([...currentPhotos, ...data.urls]));
        const newCover = coverUrl || data.urls[0];
        
        onPhotosChange(updatedPhotos, newCover);
        setStatusMsg(`Đã tải lên thành công ${data.urls.length} ảnh đã nén WebP vào Cloudinary!`);
        setTimeout(() => setStatusMsg(null), 3500);
      }
    } catch (err) {
      console.warn('Upload error:', err);
      setStatusMsg('Có lỗi xảy ra khi tải ảnh lên. Vui lòng thử lại.');
      setTimeout(() => setStatusMsg(null), 3000);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  // 2. Add photos by URLs
  const handleAddUrl = () => {
    if (!urlInput.trim()) return;

    const incomingUrls = urlInput
      .split(/[\n,\s]+/)
      .map((u) => u.trim())
      .filter((u) => u.startsWith('http://') || u.startsWith('https://'));

    if (incomingUrls.length === 0) {
      setStatusMsg('Vui lòng nhập đường link URL ảnh hợp lệ (http:// hoặc https://)');
      setTimeout(() => setStatusMsg(null), 3000);
      return;
    }

    const currentPhotos = Array.isArray(photos) && photos.length > 0 ? photos : (coverUrl ? [coverUrl] : []);
    const updatedPhotos = Array.from(new Set([...currentPhotos, ...incomingUrls]));
    const newCover = coverUrl || incomingUrls[0];

    onPhotosChange(updatedPhotos, newCover);
    setUrlInput('');
    setStatusMsg(`Đã thêm thành công ${incomingUrls.length} ảnh từ URL vào Album!`);
    setTimeout(() => setStatusMsg(null), 3000);
  };

  // 3. Move Photo Left / Right
  const handleMove = (index: number, direction: 'left' | 'right') => {
    if (!photos || photos.length <= 1) return;
    const targetIdx = direction === 'left' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= photos.length) return;

    const newPhotos = [...photos];
    const temp = newPhotos[index];
    newPhotos[index] = newPhotos[targetIdx];
    newPhotos[targetIdx] = temp;

    onPhotosChange(newPhotos, coverUrl);
  };

  // 4. Delete Photo
  const handleDelete = (index: number) => {
    const removedUrl = photos[index];
    const newPhotos = photos.filter((_, i) => i !== index);
    let newCover = coverUrl;
    if (coverUrl === removedUrl) {
      newCover = newPhotos[0] || '';
    }
    onPhotosChange(newPhotos, newCover);
    setStatusMsg('Đã xóa ảnh khỏi Album!');
    setTimeout(() => setStatusMsg(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* 1. Multi-file upload with compression */}
      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
        <div className="flex items-center justify-between mb-1.5">
          <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
            <Upload className="w-4 h-4 text-emerald-700" /> Tải Lên Hàng Loạt Ảnh (Tự Động Nén WebP):
          </label>
          <span className="text-[11px] text-slate-500 font-medium">Hỗ trợ chọn 5–10 ảnh cùng lúc</span>
        </div>
        
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileUpload}
          disabled={uploading}
          className="w-full p-2 rounded-xl bg-white border border-slate-200 text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#1B4D3E] file:text-white hover:file:bg-[#143c30] cursor-pointer"
        />

        {uploading && (
          <div className="text-emerald-700 font-bold text-[11px] mt-2 flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Đang nén Canvas WebP và tải lên Cloudinary...
          </div>
        )}

        {compressionSavings && !uploading && (
          <div className="text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg text-[11px] font-bold mt-2 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-emerald-600 fill-emerald-500" /> {compressionSavings}
          </div>
        )}
      </div>

      {/* 2. Add from URL */}
      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
        <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5 mb-1.5">
          <LinkIcon className="w-4 h-4 text-blue-600" /> Thêm Ảnh Từ URL (Google Maps, FB, Báo chí, CDN):
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Dán link ảnh (hỗ trợ nhiều link cách nhau bởi dấu phẩy)..."
            className="flex-1 p-2 rounded-xl bg-white border border-slate-200 text-xs"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddUrl();
              }
            }}
          />
          <button
            type="button"
            onClick={handleAddUrl}
            className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Thêm Vào Album
          </button>
        </div>
      </div>

      {/* 3. Photo Gallery Grid */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-emerald-800" />
            <span className="font-bold text-slate-800 text-xs">
              Album Ảnh Của Địa Điểm ({photos?.length || (coverUrl ? 1 : 0)} ảnh)
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            ⭐ Viền vàng là <strong className="text-amber-700 font-bold">Ảnh Bìa Chính</strong>
          </span>
        </div>

        {(!photos || photos.length === 0) ? (
          <div className="text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
            <ImageIcon className="w-7 h-7 text-slate-300 mx-auto mb-1.5" />
            <p className="text-xs text-slate-500">Chưa có ảnh nào trong Album. Hãy tải ảnh lên từ máy hoặc nhập URL.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto p-1 bg-slate-50/50 rounded-xl border border-slate-100">
            {photos.map((url, idx) => {
              const isCover = coverUrl === url;
              return (
                <div
                  key={idx}
                  className={`group relative rounded-xl overflow-hidden border-2 transition-all bg-white shadow-xs ${
                    isCover ? 'border-amber-500 ring-2 ring-amber-400/40' : 'border-slate-200 hover:border-emerald-500'
                  }`}
                >
                  <div className="aspect-video w-full relative overflow-hidden bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Photo ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {isCover && (
                      <span className="absolute top-1 left-1 bg-amber-500 text-slate-900 text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-slate-900" /> Bìa Chính
                      </span>
                    )}
                    <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] font-bold px-1 rounded">
                      #{idx + 1}
                    </span>
                  </div>

                  <div className="p-1 bg-white flex items-center justify-between border-t border-slate-100">
                    <div className="flex items-center gap-1">
                      {!isCover && (
                        <button
                          type="button"
                          onClick={() => onCoverChange(url)}
                          title="Đặt làm Ảnh Bìa Chính"
                          className="px-1.5 py-0.5 rounded bg-amber-50 hover:bg-amber-100 text-amber-700 text-[10px] font-bold flex items-center gap-0.5 transition-all cursor-pointer"
                        >
                          <Star className="w-2.5 h-2.5" /> Bìa
                        </button>
                      )}
                      {idx > 0 && (
                        <button
                          type="button"
                          onClick={() => handleMove(idx, 'left')}
                          title="Di chuyển sang trái"
                          className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
                        >
                          <ArrowLeft className="w-2.5 h-2.5" />
                        </button>
                      )}
                      {idx < photos.length - 1 && (
                        <button
                          type="button"
                          onClick={() => handleMove(idx, 'right')}
                          title="Di chuyển sang phải"
                          className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
                        >
                          <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDelete(idx)}
                      title="Xóa ảnh khỏi Album"
                      className="p-1 rounded bg-red-50 hover:bg-red-100 text-red-600 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Link Video TikTok */}
      <div>
        <label className="font-bold text-slate-700 block mb-1 text-xs">Link Video TikTok Trực Tiếp:</label>
        <input
          type="text"
          value={videoUrl}
          onChange={(e) => onVideoUrlChange(e.target.value)}
          placeholder="https://www.tiktok.com/@user/video/..."
          className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
        />
      </div>
    </div>
  );
};
