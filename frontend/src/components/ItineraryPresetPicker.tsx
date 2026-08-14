'use client';

import React, { useState } from 'react';

interface Preset {
  slug: string;
  emoji: string;
  title: string;
  for_whom: string;
  duration: string;
}

interface ItineraryPresetPickerProps {
  onSelect: (slug: string) => void;
}

// 27 lịch trình từ data/lichtrinh.json — đầy đủ, chuẩn xác, đa dạng
const PRESETS: Preset[] = [
  // ── 1 NGÀY ──────────────────────────────────────────────────────────────────
  { slug: 'kinh-dien-1-ngay',             emoji: '🔥', title: 'Kinh Điển 1 Ngày',                 for_whom: 'Lần đầu tới, muốn đủ món',        duration: '1 ngày'              },
  { slug: 'song-ao-checkin-1-ngay',       emoji: '📸', title: 'Sống Ảo Check-in',                  for_whom: 'Giới trẻ, cần content',            duration: '1 ngày'              },
  { slug: 'tam-linh-hanh-huong-1-ngay',  emoji: '🙏', title: 'Tâm Linh Hành Hương',               for_whom: 'Người lớn tuổi, gia đình',         duration: '1 ngày'              },
  { slug: 'food-tour-am-thuc-1-ngay-dem',emoji: '🍗', title: 'Food Tour Ẩm Thực',                  for_whom: 'Team mê ăn đặc sản Bảy Núi',       duration: '1 ngày + đêm'        },
  { slug: 'lich-su-ve-nguon-1-ngay',     emoji: '📜', title: 'Lịch Sử Về Nguồn',                  for_whom: 'Học sinh, muốn hiểu lịch sử',      duration: '1 ngày'              },
  { slug: 'trekking-cafe-chieu',          emoji: '🥾', title: 'Trekking + Cafe Chiều',              for_whom: 'Phượt thủ, thích vận động',        duration: '1 ngày'              },
  { slug: 'express-nua-ngay',             emoji: '🕰️', title: 'Express Nửa Ngày',                  for_whom: 'Khách ghé ngang, ít thời gian',    duration: '4–5 tiếng'           },
  { slug: 'photographer-tour',            emoji: '📷', title: 'Photographer Tour',                  for_whom: 'Nhiếp ảnh gia, săn ảnh đẹp',      duration: '1 ngày + đêm'        },
  { slug: 'mua-lua-chin-photography',    emoji: '🌾', title: 'Mùa Lúa Chín Photography',           for_whom: 'Nhiếp ảnh, thích cảnh đồng quê',  duration: '1 ngày'              },
  { slug: 'solo-traveler-1-ngay-dem',    emoji: '🎒', title: 'Solo Traveler',                      for_whom: 'Đi một mình, khám phá tự do',      duration: '1 ngày + đêm'        },
  // ── BUỔI TỐI ────────────────────────────────────────────────────────────────
  { slug: 'tri-ton-ve-dem-cafe-cho-dem', emoji: '🌙', title: 'Tri Tôn Về Đêm',                     for_whom: 'Giới trẻ, cần đêm chill',          duration: '4–5 tiếng (tối)'     },
  { slug: 'sunset-dinner-tour',           emoji: '💑', title: 'Sunset & Dinner Tour',               for_whom: 'Cặp đôi, lãng mạn',               duration: '5 tiếng (chiều-tối)' },
  { slug: 'cafe-hopping-tri-ton',         emoji: '☕', title: 'Cafe Hopping 3 Ca',                  for_whom: 'Giới trẻ, mê cafe độc đáo',        duration: '1 ngày'              },
  { slug: 'chay-xe-dem-tri-ton',          emoji: '🛵', title: 'Chạy Xe Đêm Tri Tôn',               for_whom: 'Nhóm bạn, thích phố đêm',          duration: '3–4 tiếng (tối)'     },
  { slug: 'hoang-hon-bbq-ga-dot-dem',    emoji: '🌅', title: 'Hoàng Hôn + BBQ Gà Đốt',            for_whom: 'Nhóm bạn, team ăn nhậu vui',       duration: '4 tiếng (chiều-tối)' },
  { slug: 'dem-tam-linh-chua-ve-dem',    emoji: '🕯️', title: 'Đêm Tâm Linh Chùa',                 for_whom: 'Người lớn tuổi, tâm linh đêm',    duration: '3 tiếng (tối)'       },
  { slug: 'dem-tri-ton-nha-thieu-nhi-pho-di-bo', emoji: '🎡', title: 'Đêm Nhà Thiếu Nhi & Phố Đi Bộ', for_whom: 'Gia đình, trẻ em',          duration: '3 tiếng (tối)'       },
  { slug: 'cafe-sang-kham-pha-cafe-chieu-cafe-dem', emoji: '🫗', title: 'Cafe Sáng + Cafe Chiều + Cafe Đêm', for_whom: 'Mê cafe, relaxed day',  duration: '1 ngày + đêm'        },
  // ── 2 NGÀY ──────────────────────────────────────────────────────────────────
  { slug: 'toan-canh-2n1d',              emoji: '🗺️', title: 'Toàn Cảnh 2N1Đ',                   for_whom: 'Muốn đi đủ các cụm',              duration: '2 ngày 1 đêm'        },
  { slug: 'weekend-2n1d-day-dem',        emoji: '🎯', title: 'Weekend 2N1Đ (Ngày + Đêm)',          for_whom: 'Mọi lứa tuổi',                    duration: '2 ngày 1 đêm'        },
  { slug: 'family-weekend-2n1d',         emoji: '👨‍👩‍👧', title: 'Family Weekend 2N1Đ',            for_whom: 'Gia đình có trẻ nhỏ',              duration: '2 ngày 1 đêm'        },
  { slug: 'backpacker-budget-2n1d',      emoji: '💰', title: 'Backpacker Budget 2N1Đ',             for_whom: 'Backpacker, tiết kiệm',            duration: '2 ngày 1 đêm'        },
  { slug: 'luxury-chill-2n1d',           emoji: '✨', title: 'Luxury Chill 2N1Đ',                  for_whom: 'Cặp đôi, nghỉ dưỡng cao cấp',     duration: '2 ngày 1 đêm'        },
  { slug: 'mua-nuoc-noi-le-hoi-khmer',  emoji: '🎭', title: 'Mùa Nước Nổi & Lễ Hội Khmer',       for_whom: 'Văn hóa, lễ hội truyền thống',    duration: '2 ngày 1 đêm'        },
  { slug: 'mua-le-hoi-dua-bo',           emoji: '🐃', title: 'Lễ Hội Đua Bò Bảy Núi',             for_whom: 'Đặc biệt — mùa lễ hội',           duration: '1–2 ngày'            },
  // ── 3 NGÀY ──────────────────────────────────────────────────────────────────
  { slug: 'kham-pha-sau-3n2d',           emoji: '🧭', title: 'Khám Phá Sâu 3N2Đ',                 for_whom: 'Phượt thủ, muốn đi kỹ',           duration: '3 ngày 2 đêm'        },
  { slug: 'full-experience-3n2d',        emoji: '🏆', title: 'Full Experience 3N2Đ',               for_whom: 'Muốn trải nghiệm hết Tri Tôn',    duration: '3 ngày 2 đêm'        },
];

type FilterType = 'all' | '1-day' | 'evening' | '2-day' | '3-day';

export default function ItineraryPresetPicker({ onSelect }: ItineraryPresetPickerProps) {
  const [filter, setFilter] = useState<FilterType>('all');

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all',     label: 'Tất cả' },
    { key: '1-day',   label: '1 Ngày'  },
    { key: 'evening', label: 'Buổi Tối' },
    { key: '2-day',   label: '2N1Đ'    },
    { key: '3-day',   label: '3N2Đ'    },
  ];

  const filtered = PRESETS.filter(p => {
    if (filter === 'all') return true;
    const d = p.duration.toLowerCase();
    if (filter === '1-day')   return d.includes('1 ngày') && !d.includes('đêm') && !d.includes('tối');
    if (filter === 'evening') return d.includes('tối') || d.includes('chiều-tối');
    if (filter === '2-day')   return d.includes('2 ngày');
    if (filter === '3-day')   return d.includes('3 ngày');
    return true;
  });

  return (
    <div className="w-full">
      {/* Filter tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-2.5 scrollbar-none touch-pan-x">
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            type="button"
            className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-extrabold transition-all ${
              filter === f.key
                ? 'bg-[#1B4D3E] text-white'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            {f.label} {f.key === 'all' ? `(${PRESETS.length})` : ''}
          </button>
        ))}
      </div>

      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
        Chọn lịch trình phù hợp với bạn
      </p>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-1.5 max-h-64 overflow-y-auto scrollbar-thin pr-0.5">
        {filtered.map((p) => (
          <button
            key={p.slug}
            onClick={() => onSelect(p.slug)}
            type="button"
            className="text-left p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 transition-all active:scale-95 group"
          >
            <div className="text-base leading-none mb-1">{p.emoji}</div>
            <p className="text-[11px] font-extrabold text-slate-800 group-hover:text-[#1B4D3E] leading-tight line-clamp-2">
              {p.title}
            </p>
            <p className="text-[10px] text-slate-400 leading-tight mt-0.5 line-clamp-1">
              {p.for_whom}
            </p>
            <p className="text-[10px] font-bold text-[#D99B26] mt-1">⏱ {p.duration}</p>
          </button>
        ))}
      </div>

      <p className="text-[9px] text-slate-400 mt-2 text-center">
        {PRESETS.length} lịch trình được biên soạn thực địa • Tri Tôn, An Giang
      </p>
    </div>
  );
}
