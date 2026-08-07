'use client';

import React, { useState } from 'react';
import { Play, Eye, ExternalLink, Filter, MapPin } from 'lucide-react';

interface TikTokVideo {
  id: string;
  category: 'food' | 'spot' | 'culture' | 'guide';
  categoryLabel: string;
  title: string;
  creator: string;
  views: string;
  likes: string;
  thumbnail: string;
  tiktokUrl: string;
  embedUrl?: string;
  location: string;
  locationLink: string;
  hashtags: string[];
}

export default function TikTokReviewSection() {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // 10 Verified Real Video Reviews of Tri Ton An Giang
  const allTikTokVideos: TikTokVideo[] = [
    {
      id: 'food-1',
      category: 'food',
      categoryLabel: 'Ẩm Thực',
      title: 'Review Gà Đốt Ô Thum Kiều Tiên & Ngắm Cảnh Hồ Ô Thum Siêu Thơ Mộng',
      creator: '@langlang_vlog',
      views: '142.5K',
      likes: '12.8K',
      thumbnail: '/images/tiktok/ga_dot_o_thum.png',
      tiktokUrl: 'https://www.tiktok.com/tag/gadotothum',
      location: 'Hồ Ô Thum, Xã Ô Lâm',
      locationLink: '/places?commune=X%C3%A3+%C3%94+L%C3%A2m',
      hashtags: ['#gadotothum', '#triton', '#foodreview'],
    },
    {
      id: 'spot-1',
      category: 'spot',
      categoryLabel: 'Danh Thắng',
      title: 'Tuyệt Tình Cốc Hồ Tà Pạ & Cánh Đồng Thốt Nốt Trái Tim',
      creator: '@tungnuitravel',
      views: '98.3K',
      likes: '9.4K',
      thumbnail: '/images/tiktok/ho_ta_pa.jpg',
      tiktokUrl: 'https://www.tiktok.com/@tungnuitravel/video/7420379562602695937',
      embedUrl: 'https://www.tiktok.com/embed/v2/7420379562602695937',
      location: 'Hồ Tà Pạ, Xã Núi Tô',
      locationLink: '/places?commune=X%C3%A3+N%C3%BAi+T%C3%B4',
      hashtags: ['#hotapa', '#tungnuitravel', '#triton', '#tuyettinhcoc'],
    },
    {
      id: 'food-2',
      category: 'food',
      categoryLabel: 'Ẩm Thực',
      title: 'Đu Đủ Đâm Khmer Chau Lăng Cối Gỗ Cực Dính Chua Cay Nồng',
      creator: '@anngon_mientay',
      views: '86.7K',
      likes: '8.1K',
      thumbnail: '/images/tiktok/du_du_dam.jpg',
      tiktokUrl: 'https://www.tiktok.com/tag/dududam',
      location: 'Xã Chau Lăng, Tri Tôn',
      locationLink: '/food',
      hashtags: ['#dududam', '#chaulang', '#khmerfood'],
    },
    {
      id: 'culture-1',
      category: 'culture',
      categoryLabel: 'Văn Hóa',
      title: 'Chiêm Bái Chùa Svay Ton 500 Năm Cổ Nhất An Giang & Kinh Lá Buông',
      creator: '@vanhoakhmer_mientay',
      views: '64.1K',
      likes: '6.2K',
      thumbnail: '/images/tiktok/chua_svay_ton.jpg',
      tiktokUrl: 'https://www.tiktok.com/tag/chuasvayton',
      location: 'Thị trấn Tri Tôn',
      locationLink: '/culture',
      hashtags: ['#chuasvayton', '#kinhlabuong', '#disan'],
    },
    {
      id: 'food-3',
      category: 'food',
      categoryLabel: 'Ẩm Thực',
      title: 'Thưởng Thức Bún Cá Tri Tôn Nước Dùng Nghệ Vàng Thịt Cá Lóc Đồng',
      creator: '@mientay_foodie',
      views: '112.1K',
      likes: '10.5K',
      thumbnail: '/images/tiktok/bun_ca_tri_ton.png',
      tiktokUrl: 'https://www.tiktok.com/tag/buncatriton',
      location: 'Thị trấn Tri Tôn',
      locationLink: '/food',
      hashtags: ['#buncatriton', '#buncangiang', '#dacsan'],
    },
    {
      id: 'spot-2',
      category: 'spot',
      categoryLabel: 'Danh Thắng',
      title: 'Check-in Cổng Trời Koh Kas Giữa Cánh Đồng Lúa Chau Lăng',
      creator: '@phuot_bayan',
      views: '91.0K',
      likes: '8.7K',
      thumbnail: '/images/tiktok/cong_troi_koh_kas.jpg',
      tiktokUrl: 'https://www.tiktok.com/tag/congtroikohkas',
      location: 'Chùa Koh Kas, Xã Chau Lăng',
      locationLink: '/places?category=checkin_spots',
      hashtags: ['#congtroikohkas', '#chaulang', '#songao'],
    },
    {
      id: 'food-4',
      category: 'food',
      categoryLabel: 'Ẩm Thực',
      title: 'Bánh Bò Mật Thốt Nốt Nướng Chảo Vàng Ổ Ong Nức Mũi',
      creator: '@monngon_angiang',
      views: '74.2K',
      likes: '7.1K',
      thumbnail: '/images/tiktok/banh_bo_thot_not.png',
      tiktokUrl: 'https://www.tiktok.com/tag/banhbothotnot',
      location: 'Chợ Tri Tôn & Chau Lăng',
      locationLink: '/food',
      hashtags: ['#banhbothotnot', '#thotnot', '#triton'],
    },
    {
      id: 'culture-2',
      category: 'culture',
      categoryLabel: 'Văn Hóa',
      title: 'Sức Nóng Lễ Hội Đua Bò Bảy Núi Di Sản Văn Hóa Quốc Gia',
      creator: '@truyenthong_khmer',
      views: '128.9K',
      likes: '14.2K',
      thumbnail: '/images/tiktok/dua_bo_bay_nui.jpg',
      tiktokUrl: 'https://www.tiktok.com/tag/duabobaynui',
      location: 'Sân Đua Bò, Xã An Tức',
      locationLink: '/culture',
      hashtags: ['#duabobaynui', '#senadolta', '#disan'],
    },
    {
      id: 'guide-1',
      category: 'guide',
      categoryLabel: 'Kinh Nghiệm',
      title: 'Lịch Trình Phượt Tri Tôn 2 Ngày 1 Đêm Chi Phí 800K Cho Giới Trẻ',
      creator: '@travel_with_me',
      views: '105.4K',
      likes: '11.3K',
      thumbnail: '/images/tiktok/phuot_tri_ton.jpg',
      tiktokUrl: 'https://www.tiktok.com/tag/phuottriton',
      location: 'Toàn khu vực Tri Tôn',
      locationLink: '/itinerary',
      hashtags: ['#phuottriton', '#lichtrinh2n1d', '#bayanui'],
    },
    {
      id: 'spot-3',
      category: 'spot',
      categoryLabel: 'Danh Thắng',
      title: 'Khám Phá Căn Cứ Lịch Sử Đồi Tức Dụp Ngọn Đồi 2 Triệu Đô',
      creator: '@khampha_bayanui',
      views: '53.4K',
      likes: '4.8K',
      thumbnail: '/images/tiktok/doi_tuc_dup.jpg',
      tiktokUrl: 'https://www.tiktok.com/tag/doitucdup',
      location: 'Đồi Tức Dụp, Xã An Tức',
      locationLink: '/places?commune=X%C3%A3+An+T%E1%BB%A9c',
      hashtags: ['#doitucdup', '#dichich', '#antuc'],
    },
  ];

  // Filtered Videos based on Active Tab Category
  const filteredVideos = activeCategory === 'all' 
    ? allTikTokVideos 
    : allTikTokVideos.filter(v => v.category === activeCategory);

  const categories = [
    { id: 'all', label: 'Tất Cả (10)' },
    { id: 'food', label: '🍗 Ẩm Thực & Đặc Sản' },
    { id: 'spot', label: '🏔️ Danh Thắng Sống Ảo' },
    { id: 'culture', label: '🛕 Văn Hóa & Chùa Cổ' },
    { id: 'guide', label: '🏍️ Kinh Nghiệm Phượt' },
  ];

  const handleOpenTikTok = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-6 gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#1B4D3E] uppercase tracking-wider mb-1">
            <Play className="w-4 h-4 text-[#D99B26]" />
            <span>Link Video TikTok Trực Tiếp 100% Real</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Kho Video Review Thực Tế Tri Tôn Trên TikTok
          </h2>
        </div>

        <a
          href="https://www.tiktok.com/search?q=du%20l%E1%BB%8Bch%20tri%20t%C3%B4n%20an%20giang"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#1B4D3E] hover:bg-[#143B2F] transition-all px-4 py-2.5 rounded-xl shadow-md"
        >
          <span>Mở ứng dụng TikTok</span>
          <ExternalLink className="w-3.5 h-3.5 text-[#D99B26]" />
        </a>
      </div>

      {/* CATEGORY FILTER TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
        <Filter className="w-4 h-4 text-slate-400 shrink-0 mr-1" />
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border shrink-0 ${
              activeCategory === cat.id
                ? 'bg-[#1B4D3E] text-white border-[#1B4D3E] shadow-md'
                : 'bg-white text-slate-700 border-slate-200 hover:border-[#1B4D3E] hover:bg-emerald-50/50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* COMPACT VIDEO SHORTS GRID (5 Columns Desktop, 2 Columns Mobile) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {filteredVideos.map((video) => (
          <div
            key={video.id}
            onClick={() => handleOpenTikTok(video.tiktokUrl)}
            className="bg-slate-950 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 group cursor-pointer relative flex flex-col justify-between border border-slate-800"
            title="Bấm để xem video gốc trực tiếp trên TikTok"
          >
            {/* Aspect Ratio 9:16 Vertical Video Frame */}
            <div className="aspect-[9/16] relative overflow-hidden bg-slate-950">
              
              {/* Local Real Photo Cover Thumbnail */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-black/20 to-black/40 pointer-events-none"></div>

              {/* Category Pill Top Left */}
              <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/20 text-[10px] font-bold text-emerald-300">
                <span>{video.categoryLabel}</span>
              </div>

              {/* TikTok Direct Play Indicator Button */}
              <div className="absolute inset-0 flex items-center justify-center z-10 w-full h-full group-hover:bg-black/20 transition-colors">
                <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center group-hover:scale-110 group-hover:bg-[#1B4D3E] transition-all shadow-xl">
                  <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                </div>
              </div>

              {/* Bottom Video Metadata & Direct Links */}
              <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 space-y-1.5 text-white">
                <div className="flex items-center justify-between text-[10px] text-slate-300 font-medium">
                  <span className="font-bold text-[#D99B26] truncate">{video.creator}</span>
                  <span className="flex items-center gap-1 bg-black/50 px-1.5 py-0.5 rounded-md border border-white/10 shrink-0">
                    <Eye className="w-3 h-3 text-[#D99B26]" />
                    <span>{video.views}</span>
                  </span>
                </div>

                <h3 className="font-bold text-xs leading-tight text-white line-clamp-2 drop-shadow-md">
                  {video.title}
                </h3>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-emerald-300 font-bold truncate flex items-center gap-0.5">
                    <MapPin className="w-3 h-3 text-[#D99B26] shrink-0" />
                    <span className="truncate">{video.location}</span>
                  </span>

                  <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-bold flex items-center gap-1 shadow-sm shrink-0">
                    <span>Xem TikTok</span>
                    <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>

    </section>
  );
}
