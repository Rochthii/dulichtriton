import React, { useState, useEffect, useRef } from 'react';
import { TikTokVideo } from '../types';
import { TikTokVideoCard } from './TikTokVideoCard';
import {
  AlertTriangle,
  RefreshCw,
  ChevronUp
} from 'lucide-react';

interface TikTokFeedProps {
  videos: TikTokVideo[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

export const TikTokFeed: React.FC<TikTokFeedProps> = ({
  videos,
  isLoading = false,
  isError = false,
  onRetry,
}) => {
  const [hasScrolled, setHasScrolled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current && scrollRef.current.scrollTop > 50) {
        setHasScrolled(true);
      }
    };
    
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', handleScroll, { passive: true });
    }
    return () => {
      if (el) el.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Skeleton Card component
  const SkeletonCard = () => (
    <div className="w-full h-full bg-neutral-900 animate-pulse flex flex-col justify-center items-center">
      <div className="w-full h-[100dvh] bg-neutral-800 shrink-0" />
    </div>
  );

  return (
    <div className="w-full h-full overscroll-none">
      {/* 1. Loading State */}
      {isLoading && (
        <div className="w-full h-full overflow-hidden">
          <SkeletonCard />
        </div>
      )}

      {/* 2. Error State */}
      {!isLoading && isError && (
        <div className="flex flex-col h-full w-full items-center justify-center bg-neutral-900 p-8">
          <div className="w-12 h-12 rounded-full bg-rose-950/80 text-rose-400 flex items-center justify-center mb-4 border border-rose-800/50">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Không thể tải dữ liệu video</h3>
          <p className="text-xs text-neutral-400 mb-6 text-center">
            Đã xảy ra sự cố khi tải danh sách video TikTok. Vui lòng kiểm tra lại kết nối mạng.
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-xs inline-flex items-center gap-2 cursor-pointer shadow-lg"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Thử lại</span>
            </button>
          )}
        </div>
      )}

      {/* 3. Empty State */}
      {!isLoading && !isError && videos.length === 0 && (
        <div className="flex flex-col h-full w-full items-center justify-center bg-neutral-900 p-8">
          <h3 className="text-lg font-bold text-white mb-2">Chưa có video</h3>
          <p className="text-xs text-neutral-400 text-center">
            Hiện chưa có video TikTok nào.
          </p>
        </div>
      )}

      {/* 4. Main Feed Display */}
      {!isLoading && !isError && videos.length > 0 && (
        <div 
          ref={scrollRef}
          className="relative w-full h-full snap-y snap-mandatory overflow-y-scroll scroll-smooth hide-scrollbar bg-black overscroll-none"
        >
          {videos.map((video, index) => (
            <div key={`${video.id}-${index}`} className="relative w-full h-[100dvh] snap-start snap-always">
              <TikTokVideoCard
                video={video}
                isCompactMode={false}
              />
              
              {/* Swipe Up Indicator on first video */}
              {index === 0 && !hasScrolled && (
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none z-50 animate-bounce text-white/70">
                  <ChevronUp className="w-8 h-8 drop-shadow-md" />
                  <span className="text-xs font-semibold drop-shadow-md tracking-wide">Vuốt lên để xem tiếp</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
