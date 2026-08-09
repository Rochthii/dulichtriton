import React, { useState } from 'react';
import { Compass, Video, Menu, X, Sparkles, MapPin, Search, PlusCircle } from 'lucide-react';

interface HeaderProps {
  totalVideosCount: number;
  onSimulateNewVideo?: () => void;
  onOpenImportModal?: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalVideosCount,
  onSimulateNewVideo,
  onOpenImportModal,
  searchQuery,
  onSearchChange,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0a0502]/90 backdrop-blur-xl border-b border-white/10 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-600 to-red-500 flex items-center justify-center text-white shadow-lg shadow-orange-950/40 group-hover:scale-105 transition-transform">
              <Video className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg text-white tracking-tight">
                  Tri Tôn <span className="text-orange-500">TikTok</span>
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-950/80 text-orange-400 border border-orange-800/60">
                  An Giang
                </span>
              </div>
              <p className="text-[10px] text-white/50 font-medium">
                Khám phá du lịch Bảy Núi
              </p>
            </div>
          </a>
        </div>

        {/* Search Bar on Desktop */}
        <div className="hidden md:flex items-center flex-1 max-w-xs relative">
          <Search className="w-4 h-4 text-white/40 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm địa danh, người tạo content..."
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-full bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 text-white/40 hover:text-white text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Right Action Items */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-white/60 font-medium bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping"></span>
            <span>{totalVideosCount} Video Tri Tôn tuyển chọn</span>
          </div>

          {onOpenImportModal && (
            <button
              onClick={onOpenImportModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-orange-600 to-red-500 hover:from-orange-500 hover:to-red-400 text-white border border-orange-400/40 text-xs font-bold transition-all shadow-lg shadow-orange-950/40 active:scale-95 cursor-pointer"
              title="Nhập URL TikTok thật để phát trực tiếp"
            >
              <PlusCircle className="w-3.5 h-3.5 text-white" />
              <span>Tải TikTok Thật</span>
            </button>
          )}

          {onSimulateNewVideo && (
            <button
              onClick={onSimulateNewVideo}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-orange-950/60 hover:bg-orange-900/80 text-orange-300 border border-orange-500/40 text-xs font-semibold transition-all hover:border-orange-400 active:scale-95 cursor-pointer shadow-lg"
              title="Thêm ngẫu nhiên 1 video mới để kiểm tra tính năng Realtime"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin-slow" />
              <span>Thử video mới</span>
            </button>
          )}
        </div>

        {/* Mobile menu toggle */}
        <div className="flex items-center gap-2 md:hidden">
          {onOpenImportModal && (
            <button
              onClick={onOpenImportModal}
              className="px-2.5 py-1.5 rounded-xl bg-orange-600 text-white font-bold text-xs flex items-center gap-1 shadow-md"
              title="Tải TikTok Thật"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tải Video</span>
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-white/5 text-white/80 hover:text-white border border-white/10"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile search bar dropdown */}

      {/* Mobile search bar dropdown */}
      <div className="px-4 pb-3 md:hidden">
        <div className="relative">
          <Search className="w-4 h-4 text-white/40 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm địa danh, video Tri Tôn..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-orange-500"
          />
        </div>
      </div>
    </header>
  );
};
