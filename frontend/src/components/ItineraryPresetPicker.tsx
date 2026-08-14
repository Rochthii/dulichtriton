'use client';

import React, { useState, useEffect } from 'react';

export interface PresetItem {
  slug: string;
  emoji: string;
  title: string;
  for_whom: string;
  duration: string;
}

interface ItineraryPresetPickerProps {
  onSelect: (slug: string) => void;
  initialPresets?: PresetItem[];
}

type FilterType = 'all' | '1-day' | 'evening' | '2-day' | '3-day';

export default function ItineraryPresetPicker({ onSelect, initialPresets }: ItineraryPresetPickerProps) {
  const [presets, setPresets] = useState<PresetItem[]>(initialPresets || []);
  const [filter, setFilter] = useState<FilterType>('all');
  const [isLoading, setIsLoading] = useState(!initialPresets || initialPresets.length === 0);

  useEffect(() => {
    if (initialPresets && initialPresets.length > 0) {
      setPresets(initialPresets);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    async function fetchPresets() {
      try {
        const res = await fetch('/api/v1/chat/itinerary');
        if (!res.ok) throw new Error('Failed to load presets');
        const data = await res.json();
        if (isMounted && Array.isArray(data.presets)) {
          setPresets(data.presets);
        }
      } catch (err) {
        console.error('Error fetching itinerary presets:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    fetchPresets();
    return () => { isMounted = false; };
  }, [initialPresets]);

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all',     label: 'Tất cả' },
    { key: '1-day',   label: '1 Ngày'  },
    { key: 'evening', label: 'Buổi Tối' },
    { key: '2-day',   label: '2N1Đ'    },
    { key: '3-day',   label: '3N2Đ'    },
  ];

  const filtered = presets.filter(p => {
    if (filter === 'all') return true;
    const d = (p.duration || '').toLowerCase();
    if (filter === '1-day')   return d.includes('1 ngày') && !d.includes('đêm') && !d.includes('tối');
    if (filter === 'evening') return d.includes('tối') || d.includes('chiều-tối') || d.includes('đêm');
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
            {f.label} {f.key === 'all' && presets.length > 0 ? `(${presets.length})` : ''}
          </button>
        ))}
      </div>

      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
        Chọn lịch trình phù hợp với bạn
      </p>

      {/* Grid */}
      {isLoading ? (
        <div className="py-6 text-center text-slate-400 text-xs font-semibold">
          Đang nạp danh sách lịch trình thực địa...
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-4 text-center text-slate-400 text-xs">
          Không có lịch trình phù hợp bộ lọc
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-1.5 max-h-64 overflow-y-auto scrollbar-thin pr-0.5">
          {filtered.map((p) => (
            <button
              key={p.slug}
              onClick={() => onSelect(p.slug)}
              type="button"
              className="text-left p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 transition-all active:scale-95 group"
            >
              <div className="text-base leading-none mb-1">{p.emoji || '🔥'}</div>
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
      )}

      <p className="text-[9px] text-slate-400 mt-2 text-center">
        {presets.length} lịch trình được biên soạn thực địa • Tri Tôn, An Giang
      </p>
    </div>
  );
}
