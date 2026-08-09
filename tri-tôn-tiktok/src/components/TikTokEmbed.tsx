import React, { useState, useEffect, useRef } from 'react';

interface TikTokEmbedProps {
  tiktokVideoId: string;
  tiktokUrl: string;
  thumbnail: string;
  title: string;
  username: string;
  autoPlay?: boolean;
}

export const TikTokEmbed: React.FC<TikTokEmbedProps> = ({
  tiktokVideoId,
  tiktokUrl,
  thumbnail,
  title,
  username,
  autoPlay = true, // We want it to autoplay when scrolling into view
}) => {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // TikTok embed player iframe URL
  const playerIframeUrl = `https://www.tiktok.com/player/v1/${tiktokVideoId}?autoplay=${autoPlay ? 1 : 0}&music_info=1&description=1`;

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
          } else {
            // Unload the iframe when out of view to save memory and stop playing
            setIsInView(false);
            setIframeLoaded(false);
          }
        });
      },
      {
        rootMargin: '100% 0px', // Preload 1 full video ahead
        threshold: 0,
      }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isInView) return;
    
    setIframeLoaded(false);
    setIframeError(false);

    // Timeout if iframe doesn't trigger onLoad within 10s
    timeoutRef.current = setTimeout(() => {
      if (!iframeLoaded) {
        setIframeError(true);
      }
    }, 10000);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [tiktokVideoId, isInView]);

  const handleIframeLoad = () => {
    setIframeLoaded(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const handleIframeError = () => {
    setIframeError(true);
    setIframeLoaded(false);
  };

  return (
    <div ref={containerRef} className="relative w-full h-full bg-black overflow-hidden group">
      {/* 1. Official TikTok Player Iframe */}
      {isInView && !iframeError && (
        <iframe
          ref={iframeRef}
          src={playerIframeUrl}
          title={`TikTok video bởi ${username}`}
          className={`w-full h-full border-0 transition-opacity duration-500 ${
            iframeLoaded ? 'opacity-100 relative z-10' : 'opacity-0 absolute inset-0 pointer-events-none'
          }`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          onLoad={handleIframeLoad}
          onError={handleIframeError}
        />
      )}

      {/* 2. Loading Skeleton state before iframe loads */}
      {!iframeLoaded && (
        <div className="absolute inset-0 bg-neutral-900 z-0 flex flex-col items-center justify-center">
          {/* Background image preview with blur */}
          <div className="absolute inset-0 overflow-hidden">
            <img
              src={thumbnail}
              alt={title}
              className="w-full h-full object-cover filter brightness-50 scale-105 transition-transform duration-700"
              loading="lazy"
            />
          </div>
          
          {/* Spinner */}
          {!iframeError ? (
            <div className="relative z-10 flex flex-col items-center gap-3 text-white/80">
              <div className="w-8 h-8 border-2 border-white/50 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="relative z-10 text-white flex flex-col items-center gap-3">
               <a
                href={tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-full bg-[#fe2c55] text-white font-bold text-sm tracking-wide shadow-lg"
              >
                Mở trong TikTok
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
