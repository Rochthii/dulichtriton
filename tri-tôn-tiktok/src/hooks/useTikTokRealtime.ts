import { useState, useEffect, useCallback } from 'react';
import { TikTokVideo } from '../types';

interface UseTikTokRealtimeReturn {
  videos: TikTokVideo[];
  isLoading: boolean;
  isError: boolean;
  newVideosQueue: TikTokVideo[];
  hasNewVideos: boolean;
  newVideosCount: number;
  triggerSimulatedVideo: () => void;
  prependNewVideos: () => void;
  dismissNotification: () => void;
  addCustomVideo: (video: TikTokVideo) => void;
  refetchServerVideos: () => Promise<void>;
}

export function useTikTokRealtime(): UseTikTokRealtimeReturn {
  const [videos, setVideos] = useState<TikTokVideo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [newVideosQueue, setNewVideosQueue] = useState<TikTokVideo[]>([]);

  // Fetch real videos directly from backend server endpoint /api/videos
  const refetchServerVideos = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const res = await fetch('/api/videos');
      if (!res.ok) {
        throw new Error('Lỗi từ server');
      }
      const data = await res.json();
      if (data.videos) {
        setVideos(data.videos);
      }
    } catch (err) {
      console.error('Fetch videos error:', err);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load on mount
  useEffect(() => {
    refetchServerVideos();
  }, [refetchServerVideos]);

  // Simulate real-time new video coming from server
  const triggerSimulatedVideo = useCallback(() => {
    const sampleReal: TikTokVideo = {
      id: `real-rt-${Date.now()}`,
      tiktokVideoId: '6718335390845095173',
      tiktokUrl: 'https://www.tiktok.com/@scout2015/video/6718335390845095173',
      username: '@triton_live',
      userDisplayName: 'Tri Tôn TikTok Live',
      userAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=triton_live',
      description: 'Mới cập nhật: Cảnh sắc tuyệt đẹp tại Tri Tôn An Giang vừa ghi nhận!',
      location: 'Tà Pạ',
      locationAddress: 'Cánh đồng Tà Pạ, Tri Tôn, An Giang',
      thumbnail: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
      publishedAt: 'Vừa xong',
      viewsCount: 'Thực tế',
      likesCount: 'Thực tế',
      sharesCount: 'Thực tế',
      musicTrack: 'Âm thanh gốc - Tri Tôn An Giang',
      isNew: true,
    };

    setNewVideosQueue((prev) => [sampleReal, ...prev]);
  }, []);

  // Merge queued new videos into active feed
  const prependNewVideos = useCallback(() => {
    if (newVideosQueue.length === 0) return;

    setVideos((prev) => [...newVideosQueue, ...prev]);
    setNewVideosQueue([]);

    // Scroll smoothly to top of feed
    window.scrollTo({ top: 400, behavior: 'smooth' });
  }, [newVideosQueue]);

  // Dismiss notification banner without appending
  const dismissNotification = useCallback(() => {
    setNewVideosQueue([]);
  }, []);

  // Add a custom real TikTok video directly
  const addCustomVideo = useCallback((customVideo: TikTokVideo) => {
    setVideos((prev) => {
      // Avoid duplicate keys
      const exists = prev.some((v) => v.id === customVideo.id);
      const safeVideo = exists
        ? { ...customVideo, id: `${customVideo.id}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}` }
        : customVideo;
      return [safeVideo, ...prev];
    });
  }, []);

  return {
    videos,
    isLoading,
    isError,
    newVideosQueue,
    hasNewVideos: newVideosQueue.length > 0,
    newVideosCount: newVideosQueue.length,
    triggerSimulatedVideo,
    prependNewVideos,
    dismissNotification,
    addCustomVideo,
    refetchServerVideos,
  };
}
