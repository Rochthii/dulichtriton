'use client';

import React from 'react';

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

const PRESETS: Preset[] = [
  { slug: 'classic-1day',       emoji: '🔥', title: 'Kinh Điển 1 Ngày',         for_whom: 'Lần đầu tới, muốn đủ món',         duration: '8 tiếng'  },
  { slug: 'tiktok-viral',       emoji: '📸', title: 'Sống Ảo TikTok',            for_whom: 'Giới trẻ, cần content & ảnh đẹp',  duration: '7 tiếng'  },
  { slug: 'spiritual-family',   emoji: '🙏', title: 'Tâm Linh Khmer',            for_whom: 'Gia đình có người lớn tuổi',        duration: '6 tiếng'  },
  { slug: 'trekking-adventure', emoji: '🥾', title: 'Trekking Bảy Núi',          for_whom: 'Phượt thủ, thích leo núi',          duration: '9 tiếng'  },
  { slug: 'food-tour',          emoji: '🍗', title: 'Food Tour Bảy Núi',         for_whom: 'Team mê ăn đặc sản',               duration: '6 tiếng'  },
  { slug: 'half-day',           emoji: '🕰️', title: 'Nửa Ngày Ghé Ngang',       for_whom: 'Ít thời gian, tiện đường',          duration: '3.5 tiếng'},
  { slug: 'history-memorial',   emoji: '📜', title: 'Lịch Sử & Tưởng Niệm',     for_whom: 'Muốn hiểu vùng đất Bảy Núi',       duration: '7 tiếng'  },
  { slug: 'couple-chill',       emoji: '💑', title: 'Couple Chill & Hoàng Hôn',  for_whom: 'Cặp đôi, không gian riêng tư',     duration: '7 tiếng'  },
];

export default function ItineraryPresetPicker({ onSelect }: ItineraryPresetPickerProps) {
  return (
    <div className="w-full">
      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
        <span className="w-4 h-0.5 bg-[#D99B26] rounded-full inline-block" />
        Chọn lịch trình phù hợp với bạn
        <span className="w-4 h-0.5 bg-[#D99B26] rounded-full inline-block" />
      </p>
      <div className="grid grid-cols-2 gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.slug}
            onClick={() => onSelect(p.slug)}
            type="button"
            className="text-left p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 transition-all active:scale-95 group"
          >
            <div className="text-lg leading-none mb-1">{p.emoji}</div>
            <p className="text-xs font-extrabold text-slate-800 group-hover:text-[#1B4D3E] leading-tight line-clamp-1">
              {p.title}
            </p>
            <p className="text-[10px] text-slate-400 leading-tight mt-0.5 line-clamp-2">
              {p.for_whom}
            </p>
            <p className="text-[10px] font-bold text-[#D99B26] mt-1">⏱ {p.duration}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
