import React from 'react';
import { Sparkles, ArrowUp, X } from 'lucide-react';

interface NewVideoNotificationProps {
  count: number;
  onViewNewVideos: () => void;
  onDismiss?: () => void;
}

export const NewVideoNotification: React.FC<NewVideoNotificationProps> = ({
  count,
  onViewNewVideos,
  onDismiss,
}) => {
  if (count <= 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-bounce-gentle">
      <div className="flex items-center gap-3 p-2 pl-4 pr-3 rounded-full bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 text-white shadow-2xl shadow-orange-500/40 border border-orange-400/50 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-200"></span>
          </span>
          <Sparkles className="w-4 h-4 text-amber-300 animate-spin-slow" />
          <span className="text-xs md:text-sm font-semibold tracking-wide whitespace-nowrap">
            Có {count} video mới về Tri Tôn
          </span>
        </div>

        <button
          onClick={onViewNewVideos}
          className="px-3.5 py-1.5 rounded-full bg-white text-orange-950 font-bold text-xs hover:bg-orange-50 active:scale-95 transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
        >
          <span>Xem video mới</span>
          <ArrowUp className="w-3.5 h-3.5" />
        </button>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
            title="Đóng thông báo"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
