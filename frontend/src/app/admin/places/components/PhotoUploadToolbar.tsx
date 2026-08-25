'use client';

import React, { useState } from 'react';
import { Upload, Link as LinkIcon, Sparkles, RefreshCw, Zap } from 'lucide-react';
import { compressImageFile } from '@/lib/imageCompressor';

interface PhotoUploadToolbarProps {
  onAddPhotos: (urls: string[]) => void;
  notify: (text: string, type?: 'success' | 'error' | 'info') => void;
  videoUrl?: string;
  onVideoUrlChange: (url: string) => void;
}

export function PhotoUploadToolbar({
  onAddPhotos,
  notify,
  videoUrl = '',
  onVideoUrlChange,
}: PhotoUploadToolbarProps) {
  const [urlInput, setUrlInput] = useState('');
  const [mapsUrlInput, setMapsUrlInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [compressionSavings, setCompressionSavings] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setCompressionSavings(null);

    try {
      let totalOriginalBytes = 0;
      let totalCompressedBytes = 0;

      const compressionPromises = Array.from(files).map(async (file) => {
        totalOriginalBytes += file.size;
        const res = await compressImageFile(file, { maxWidth: 1600, maxHeight: 1600, quality: 0.82 });
        totalCompressedBytes += res.compressedSize;
        return res.base64;
      });

      const compressedBase64Array = await Promise.all(compressionPromises);

      if (totalOriginalBytes > 0) {
        const savedPct = Math.round(((totalOriginalBytes - totalCompressedBytes) / totalOriginalBytes) * 100);
        const origMB = (totalOriginalBytes / (1024 * 1024)).toFixed(1);
        const compKB = (totalCompressedBytes / 1024).toFixed(0);
        setCompressionSavings(`Đã nén tiết kiệm ${savedPct}% dung lượng (${origMB}MB -> ${compKB}KB WebP)`);
      }

      const res = await fetch('/api/v1/admin/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: compressedBase64Array, folder: 'tri_ton_places' }),
      });

      const data = await res.json();
      if (data.urls && data.urls.length > 0) {
        onAddPhotos(data.urls);
        notify(`Đã tải lên thành công ${data.urls.length} ảnh đã nén WebP!`, 'success');
      }
    } catch (err: any) {
      notify('Lỗi tải ảnh: ' + err.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    onAddPhotos([urlInput.trim()]);
    setUrlInput('');
    notify('Đã thêm liên kết ảnh mới!', 'success');
  };

  const handleExtractGoogleMaps = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mapsUrlInput.trim()) return;

    setExtracting(true);
    try {
      const res = await fetch('/api/v1/admin/scrape-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: mapsUrlInput.trim() }),
      });
      const data = await res.json();
      if (data.images && data.images.length > 0) {
        onAddPhotos(data.images);
        notify(`Đã trích xuất ${data.images.length} ảnh từ Google Maps!`, 'success');
        setMapsUrlInput('');
      } else {
        notify('Không tìm thấy ảnh trên liên kết Google Maps này', 'info');
      }
    } catch (err: any) {
      notify('Lỗi trích xuất: ' + err.message, 'error');
    } finally {
      setExtracting(false);
    }
  };

  return (
    <div className="space-y-3 font-body text-xs">
      {/* Upload File Input */}
      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <label className="flex items-center gap-2 cursor-pointer font-bold text-[#0E8C7F] font-display">
          <Upload className="w-4 h-4 text-[#0E8C7F]" />
          <span>{uploading ? 'Đang nén & tải ảnh...' : 'Chọn ảnh từ máy tính (Tự động nén WebP)'}</span>
          <input
            type="file"
            multiple
            accept="image/*"
            disabled={uploading}
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
        {compressionSavings && (
          <span className="text-[10px] text-emerald-700 font-mono bg-emerald-50 px-2 py-0.5 rounded-md">
            {compressionSavings}
          </span>
        )}
      </div>

      {/* Manual URL / Google Maps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <form onSubmit={handleAddUrl} className="flex gap-1.5">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Dán link ảnh Cloudinary / CDN..."
            className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden"
          />
          <button type="submit" className="px-3 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer font-display">
            Thêm
          </button>
        </form>

        <form onSubmit={handleExtractGoogleMaps} className="flex gap-1.5">
          <input
            type="url"
            value={mapsUrlInput}
            onChange={(e) => setMapsUrlInput(e.target.value)}
            placeholder="Dán link Google Maps để cào ảnh..."
            className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden"
          />
          <button
            type="submit"
            disabled={extracting}
            className="px-3 py-2 bg-[#0E8C7F] text-white rounded-xl text-xs font-bold cursor-pointer font-display flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>{extracting ? 'Đang cào...' : 'Cào Ảnh'}</span>
          </button>
        </form>
      </div>

      {/* Video URL */}
      <div>
        <label className="font-bold text-slate-700 block mb-1">Link Video TikTok Review (Tùy chọn):</label>
        <input
          type="url"
          value={videoUrl}
          onChange={(e) => onVideoUrlChange(e.target.value)}
          placeholder="https://www.tiktok.com/@.../video/..."
          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden font-mono"
        />
      </div>
    </div>
  );
}
