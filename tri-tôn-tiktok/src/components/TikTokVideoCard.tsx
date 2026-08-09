import React from 'react';
import { TikTokVideo } from '../types';
import { TikTokEmbed } from './TikTokEmbed';

interface TikTokVideoCardProps {
  video: TikTokVideo;
  isCompactMode?: boolean;
}

export const TikTokVideoCard: React.FC<TikTokVideoCardProps> = ({
  video,
}) => {
  return (
    <article className="relative w-full h-full bg-black overflow-hidden snap-start">
      {/* Fullscreen Embed */}
      <div className="absolute inset-0 w-full h-full">
        <TikTokEmbed
          tiktokVideoId={video.tiktokVideoId}
          tiktokUrl={video.tiktokUrl}
          thumbnail={video.thumbnail}
          title={video.description}
          username={video.username}
        />
      </div>
    </article>
  );
};
