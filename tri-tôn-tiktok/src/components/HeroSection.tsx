import React from 'react';
import { Play, MapPin, Compass, Sparkles, Eye, Film } from 'lucide-react';
import { LocationFilter } from '../types';

interface HeroSectionProps {
  activeFilter: LocationFilter;
  onFilterChange: (filter: LocationFilter) => void;
  totalVideos: number;
}

const POPULAR_LOCATIONS: { name: LocationFilter; desc: string }[] = [
  { name: 'Tất cả', desc: 'Toàn bộ Video' },
  { name: 'Tà Pạ', desc: 'Cánh đồng & Chùa' },
  { name: 'Chùa Koh Kas', desc: 'Cổng Trời An Giang' },
  { name: 'Núi Cô Tô', desc: 'Sân Tiên & Đỉnh Phụng Hoàng' },
  { name: 'Hồ Soài Chek', desc: 'Hồ nước dưới chân núi' },
  { name: 'Cây Thốt Nốt', desc: 'Biểu tượng Bảy Núi' },
  { name: 'Ẩm Thực', desc: 'Bánh bò & Gà đốt' },
  { name: 'Lễ Hội', desc: 'Đua bò Chùa Rô' },
];

export const HeroSection: React.FC<HeroSectionProps> = ({
  activeFilter,
  onFilterChange,
  totalVideos,
}) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#0a0502] via-orange-950/20 to-[#0a0502] py-10 md:py-16 border-b border-white/10">
      {/* Decorative backdrop graphics */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none opacity-25 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-orange-600/30 blur-3xl"></div>
        <div className="absolute top-1/2 right-0 w-80 h-80 rounded-full bg-red-600/20 blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-orange-400 font-semibold text-xs mb-6 shadow-2xl backdrop-blur-xl">
            <Compass className="w-3.5 h-3.5 text-orange-400" />
            <span>Chuyên trang TikTok Du Lịch Tri Tôn, An Giang</span>
          </div>

          {/* Explicit Main Title - Elegant Dark match */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-none uppercase mb-4">
            KHÁM PHÁ TRI TÔN <span className="text-orange-500">QUA VIDEO</span>
          </h1>

          {/* Explicit Subtitle */}
          <p className="text-base sm:text-lg text-white/60 font-medium tracking-wide leading-relaxed max-w-2xl mb-8">
            Những khoảnh khắc mới nhất từ Tri Tôn, An Giang
          </p>

          {/* Key Stats Bar */}
          <div className="grid grid-cols-3 gap-3 md:gap-6 w-full max-w-xl mb-10">
            <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-white/10 backdrop-blur-md shadow-xl">
              <div className="flex items-center justify-center gap-1.5 text-orange-400 mb-1">
                <Film className="w-4 h-4" />
                <span className="text-lg md:text-xl font-black text-white">{totalVideos}</span>
              </div>
              <span className="text-[11px] text-white/50 font-medium">Video TikTok</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-white/10 backdrop-blur-md shadow-xl">
              <div className="flex items-center justify-center gap-1.5 text-orange-400 mb-1">
                <MapPin className="w-4 h-4" />
                <span className="text-lg md:text-xl font-black text-white">8+</span>
              </div>
              <span className="text-[11px] text-white/50 font-medium">Địa danh nổi tiếng</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-white/10 backdrop-blur-md shadow-xl">
              <div className="flex items-center justify-center gap-1.5 text-orange-400 mb-1">
                <Eye className="w-4 h-4" />
                <span className="text-lg md:text-xl font-black text-white">1.5M+</span>
              </div>
              <span className="text-[11px] text-white/50 font-medium">Tổng lượt xem</span>
            </div>
          </div>

          {/* Quick Location Filter Tabs - Matching Design spec */}
          <div className="w-full mb-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-3 text-left sm:text-center">
              Lọc theo điểm đến Tri Tôn:
            </p>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none sm:justify-center">
              {POPULAR_LOCATIONS.map((loc) => {
                const isActive = activeFilter === loc.name;
                return (
                  <button
                    key={loc.name}
                    onClick={() => onFilterChange(loc.name)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-1.5 shrink-0 ${
                      isActive
                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25 ring-2 ring-orange-400 font-bold'
                        : 'bg-white/5 hover:bg-white/10 text-white/80 border border-white/10'
                    }`}
                  >
                    <span>{loc.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Popular TikTok Hashtags for Tri Tôn - An Giang */}
          <div className="w-full pt-4 border-t border-white/10">
            <p className="text-xs font-semibold uppercase tracking-widest text-orange-400/80 mb-3 text-left sm:text-center flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
              <span>Hashtag TikTok Chuẩn Hàng Đầu Về Tri Tôn:</span>
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2">
              {[
                { tag: '#triton', label: 'Tri Tôn' },
                { tag: '#comtamtriton', label: 'Cơm Tấm Tri Tôn' },
                { tag: '#tapa', label: 'Cánh Đồng Tà Pạ' },
                { tag: '#gadotothum', label: 'Gà Đốt Ô Thum' },
                { tag: '#chuakohkas', label: 'Cổng Trời Koh Kas' },
                { tag: '#thotnotraitim', label: 'Thốt Nốt Trái Tim' },
                { tag: '#nuicoto', label: 'Núi Cô Tô' },
                { tag: '#duabo', label: 'Đua Bò Bảy Núi' },
                { tag: '#baynuiangiang', label: 'Bảy Núi An Giang' },
                { tag: '#dulichangiang', label: 'Du Lịch An Giang' },
              ].map((item) => (
                <button
                  key={item.tag}
                  onClick={() => {
                    // Filter by hashtag name or filter item
                    if (item.label === 'Cánh Đồng Tà Pạ') onFilterChange('Tà Pạ');
                    else if (item.label === 'Cổng Trời Koh Kas') onFilterChange('Chùa Koh Kas');
                    else if (item.label === 'Núi Cô Tô') onFilterChange('Núi Cô Tô');
                    else if (item.label === 'Thốt Nốt Trái Tim') onFilterChange('Cây Thốt Nốt');
                    else if (item.label === 'Cơm Tấm Tri Tôn' || item.label === 'Gà Đốt Ô Thum') onFilterChange('Ẩm Thực');
                    else if (item.label === 'Đua Bò Bảy Núi') onFilterChange('Lễ Hội');
                    else onFilterChange('Tất cả');
                  }}
                  className="px-3 py-1 rounded-lg bg-orange-950/40 hover:bg-orange-600/30 border border-orange-500/30 text-orange-300 hover:text-white text-xs font-medium transition-all cursor-pointer flex items-center gap-1 group"
                >
                  <span className="font-bold text-orange-400 group-hover:text-amber-300">#</span>
                  <span>{item.tag.replace('#', '')}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
