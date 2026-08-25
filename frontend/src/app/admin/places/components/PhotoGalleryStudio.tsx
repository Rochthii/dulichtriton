'use client';

import React from 'react';
import { PhotoUploadToolbar } from './PhotoUploadToolbar';
import { PhotoGridList } from './PhotoGridList';

interface PhotoGalleryStudioProps {
  photos: string[];
  coverUrl?: string;
  currentCoverUrl?: string;
  videoUrl?: string;
  onPhotosChange: (updatedPhotos: string[], newCoverUrl?: string) => void;
  onCoverChange?: (newCoverUrl: string) => void;
  onVideoUrlChange?: (newVideoUrl: string) => void;
  setStatusMsg?: (msg: string | null) => void;
}

export const PhotoGalleryStudio: React.FC<PhotoGalleryStudioProps> = ({
  photos = [],
  coverUrl: propCoverUrl,
  currentCoverUrl: propCurrentCoverUrl,
  videoUrl = '',
  onPhotosChange,
  onCoverChange,
  onVideoUrlChange = () => {},
  setStatusMsg = () => {},
}) => {
  const activeCover = propCoverUrl || propCurrentCoverUrl || (photos.length > 0 ? photos[0] : '');

  const notify = (text: string) => {
    setStatusMsg(text);
    setTimeout(() => setStatusMsg(null), 3500);
  };

  const handleAddPhotos = (newUrls: string[]) => {
    const updated = Array.from(new Set([...photos, ...newUrls]));
    const newCover = activeCover || newUrls[0];
    onPhotosChange(updated, newCover);
    if (onCoverChange && !activeCover) {
      onCoverChange(newUrls[0]);
    }
  };

  const handleSetCover = (url: string) => {
    if (onCoverChange) {
      onCoverChange(url);
    } else {
      onPhotosChange(photos, url);
    }
    notify('Đã cập nhật ảnh bìa chính!');
  };

  const handleMovePhoto = (idx: number, direction: 'left' | 'right') => {
    const targetIdx = direction === 'left' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= photos.length) return;
    const copy = [...photos];
    const temp = copy[idx];
    copy[idx] = copy[targetIdx];
    copy[targetIdx] = temp;
    onPhotosChange(copy, activeCover);
  };

  const handleRemovePhoto = (idx: number) => {
    const targetUrl = photos[idx];
    const updated = photos.filter((_, i) => i !== idx);
    let newCover = activeCover;
    if (targetUrl === activeCover) {
      newCover = updated.length > 0 ? updated[0] : '';
    }
    onPhotosChange(updated, newCover);
    if (onCoverChange && targetUrl === activeCover) {
      onCoverChange(newCover);
    }
    notify('Đã xóa ảnh khỏi bộ sưu tập.');
  };

  return (
    <div className="space-y-4 font-body">
      {/* 1. Upload & Google Maps Scraper Toolbar */}
      <PhotoUploadToolbar
        onAddPhotos={handleAddPhotos}
        notify={notify}
        videoUrl={videoUrl}
        onVideoUrlChange={onVideoUrlChange}
      />

      {/* 2. Photo Grid List & Reordering */}
      <PhotoGridList
        photos={photos}
        coverUrl={activeCover}
        onSetCover={handleSetCover}
        onMovePhoto={handleMovePhoto}
        onRemovePhoto={handleRemovePhoto}
      />
    </div>
  );
};
