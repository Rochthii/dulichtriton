'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, Search, Clock, Coins, Users, Compass, 
  ChevronRight, ArrowRight, Filter, Flame, Utensils,
  Camera, Landmark, Mountain, Heart
} from 'lucide-react';

export interface PresetItem {
  slug: string;
  emoji: string;
  title: string;
  for_whom: string;
  duration: string;
  budget_range?: string;
  category?: string;
  experiences?: string[];
  best_season?: string;
  tagline?: string;
}

interface ItineraryPresetPickerProps {
  onSelect: (slug: string, title?: string) => void;
  initialPresets?: PresetItem[];
}

type ModeFilter = 'duration' | 'theme';
type DurationFilter = 'all' | 'half-day' | '1-day' | 'evening' | '2-day' | '3-day';
type ThemeFilter = 'all' | 'classic' | 'food' | 'spiritual' | 'trekking' | 'relax';

export default function ItineraryPresetPicker({ onSelect, initialPresets }: ItineraryPresetPickerProps) {
  const [presets, setPresets] = useState<PresetItem[]>(initialPresets || []);
  const [mode, setMode] = useState<ModeFilter>('duration');
  const [durationFilter, setDurationFilter] = useState<DurationFilter>('all');
  const [themeFilter, setThemeFilter] = useState<ThemeFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSmartMatcher, setShowSmartMatcher] = useState(false);
  const [isLoading, setIsLoading] = useState(!initialPresets || initialPresets.length === 0);

  // Smart Matcher State
  const [smartDuration, setSmartDuration] = useState<'half-day' | '1-day' | '2-day' | '3-day'>('1-day');
  const [smartBudget, setSmartBudget] = useState<'budget' | 'comfort' | 'luxury'>('comfort');
  const [smartGroup, setSmartGroup] = useState<'solo' | 'couple' | 'family' | 'friends'>('couple');

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

  // Duration Filter options
  const durationFilters: { key: DurationFilter; label: string; icon: string }[] = [
    { key: 'all',      label: 'Tất cả (27)',     icon: '🧭' },
    { key: '1-day',    label: '1 Ngày',          icon: '☀️' },
    { key: '2-day',    label: '2N1Đ',            icon: '🗺️' },
    { key: '3-day',    label: '3N2Đ',            icon: '🏆' },
    { key: 'evening',  label: 'Buổi Tối & Đêm',  icon: '🌙' },
    { key: 'half-day', label: 'Nửa Ngày (4-5h)', icon: '⏱️' },
  ];

  // Theme Filter options
  const themeFilters: { key: ThemeFilter; label: string; icon: string }[] = [
    { key: 'all',       label: 'Tất cả (27)',       icon: '✨' },
    { key: 'classic',   label: 'Kinh Điển & Check-in', icon: '🔥' },
    { key: 'food',      label: 'Ẩm Thực & Cafe',    icon: '🍗' },
    { key: 'spiritual', label: 'Tâm Linh & Khmer',   icon: '🙏' },
    { key: 'trekking',  label: 'Trekking & Phượt',  icon: '🥾' },
    { key: 'relax',     label: 'Nghỉ Dưỡng & Gia Đình', icon: '💑' },
  ];

  // Smart Lookup Matrix
  const smartMatchedSlug = useMemo(() => {
    if (smartDuration === 'half-day') {
      if (smartBudget === 'luxury' || smartGroup === 'couple') return 'sunset-dinner-tour';
      return 'express-nua-ngay';
    }
    if (smartDuration === '1-day') {
      if (smartBudget === 'budget') return 'song-ao-checkin-1-ngay';
      if (smartGroup === 'friends' || smartBudget === 'luxury') return 'food-tour-am-thuc-1-ngay-dem';
      if (smartGroup === 'family') return 'tam-linh-hanh-huong-1-ngay';
      return 'kinh-dien-1-ngay';
    }
    if (smartDuration === '2-day') {
      if (smartBudget === 'budget') return 'backpacker-budget-2n1d';
      if (smartBudget === 'luxury') return 'luxury-chill-2n1d';
      if (smartGroup === 'family') return 'family-weekend-2n1d';
      return 'toan-canh-2n1d';
    }
    // 3-day
    if (smartBudget === 'budget') return 'kham-pha-sau-3n2d';
    return 'full-experience-3n2d';
  }, [smartDuration, smartBudget, smartGroup]);

  const smartMatchedPreset = useMemo(() => {
    return presets.find(p => p.slug === smartMatchedSlug);
  }, [presets, smartMatchedSlug]);

  // Filtered presets
  const filtered = useMemo(() => {
    return presets.filter(p => {
      // 1. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchText = `${p.title} ${p.tagline || ''} ${p.for_whom} ${p.duration} ${p.category || ''} ${(p.experiences || []).join(' ')}`.toLowerCase();
        if (!matchText.includes(q)) return false;
      }

      // 2. Tab Filter
      if (mode === 'duration') {
        if (durationFilter === 'all') return true;
        const d = (p.duration || '').toLowerCase();
        if (durationFilter === 'half-day') return d.includes('nửa ngày') || d.includes('4-5 tiếng');
        if (durationFilter === '1-day')    return d.includes('1 ngày') && !d.includes('2 ngày') && !d.includes('3 ngày');
        if (durationFilter === 'evening')  return d.includes('tối') || d.includes('chiều-tối') || d.includes('đêm') || d.includes('buổi tối');
        if (durationFilter === '2-day')    return d.includes('2 ngày') || d.includes('2n1đ') || d.includes('2d1n');
        if (durationFilter === '3-day')    return d.includes('3 ngày') || d.includes('3n2đ') || d.includes('3d2n');
      } else {
        if (themeFilter === 'all') return true;
        const slug = p.slug.toLowerCase();
        const cat = (p.category || '').toLowerCase();
        const exps = (p.experiences || []).map(e => e.toLowerCase()).join(' ');

        if (themeFilter === 'classic') {
          return slug.includes('kinh-dien') || slug.includes('song-ao') || slug.includes('toan-canh') || slug.includes('express') || cat.includes('classic') || cat.includes('photography');
        }
        if (themeFilter === 'food') {
          return slug.includes('food') || slug.includes('cafe') || slug.includes('bbq') || slug.includes('dinner') || cat.includes('gastronomy') || cat.includes('cafe');
        }
        if (themeFilter === 'spiritual') {
          return slug.includes('tam-linh') || slug.includes('lich-su') || slug.includes('chua') || slug.includes('dua-bo') || slug.includes('khmer') || cat.includes('spiritual') || cat.includes('history') || cat.includes('festival');
        }
        if (themeFilter === 'trekking') {
          return slug.includes('trekking') || slug.includes('kham-pha') || slug.includes('photographer') || slug.includes('chay-xe') || slug.includes('lua-chin') || cat.includes('adventure') || cat.includes('deep_exploration');
        }
        if (themeFilter === 'relax') {
          return slug.includes('luxury') || slug.includes('family') || slug.includes('weekend') || slug.includes('solo') || slug.includes('budget') || cat.includes('family') || cat.includes('luxury') || cat.includes('weekend');
        }
      }
      return true;
    });
  }, [presets, mode, durationFilter, themeFilter, searchQuery]);

  return (
    <div className="w-full font-body space-y-3">
      {/* ── TOP HEADER & MODE SWITCHER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-lg bg-[#0E8C7F]/10 flex items-center justify-center text-[#0E8C7F]">
            <Compass className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-extrabold text-[#26221B] font-display uppercase tracking-wide">
              Lịch Trình Khép Vòng Núi Tri Tôn
            </h4>
            <p className="text-[10px] text-[#6B6355]">
              {presets.length > 0 ? `${presets.length} tour chuẩn hóa thực địa` : 'Đang nạp dữ liệu...'}
            </p>
          </div>
        </div>

        {/* Toggle Mode & Smart Matcher */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setShowSmartMatcher(!showSmartMatcher)}
            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1 border transition-all tap-bounce ${
              showSmartMatcher
                ? 'bg-[#F0A32F] text-[#26221B] border-[#F0A32F] shadow-xs'
                : 'bg-[#FAF3E7] text-[#6B6355] border-[#26221B]/10 hover:border-[#F0A32F]/50'
            }`}
          >
            <Sparkles className="w-3 h-3 text-[#0E8C7F]" />
            <span>Gợi Ý Thông Minh</span>
          </button>

          <div className="bg-[#FAF3E7] p-0.5 rounded-full flex border border-[#26221B]/10">
            <button
              type="button"
              onClick={() => setMode('duration')}
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold transition-all ${
                mode === 'duration'
                  ? 'bg-[#0E8C7F] text-white shadow-2xs'
                  : 'text-[#6B6355] hover:text-[#26221B]'
              }`}
            >
              Thời Gian
            </button>
            <button
              type="button"
              onClick={() => setMode('theme')}
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold transition-all ${
                mode === 'theme'
                  ? 'bg-[#0E8C7F] text-white shadow-2xs'
                  : 'text-[#6B6355] hover:text-[#26221B]'
              }`}
            >
              Chủ Đề
            </button>
          </div>
        </div>
      </div>

      {/* ── SMART TRIP MATCHER (EXPANDABLE) ── */}
      {showSmartMatcher && (
        <div className="bg-gradient-to-br from-[#FFFDF7] via-amber-50/50 to-emerald-50/30 rounded-[18px] p-3 sm:p-4 border border-amber-300/60 shadow-xs space-y-3 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-[#26221B] font-display flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#0E8C7F]" />
              Chọn 3 tiêu chí để AI chọn tour chính xác nhất:
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {/* Duration Selector */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-[#6B6355] uppercase block">1. Thời gian</label>
              <select
                value={smartDuration}
                onChange={(e) => setSmartDuration(e.target.value as any)}
                className="w-full text-[11px] font-bold bg-white rounded-xl px-2 py-1.5 border border-[#26221B]/15 text-[#26221B] focus:outline-none focus:border-[#0E8C7F]"
              >
                <option value="half-day">Nửa Ngày</option>
                <option value="1-day">1 Ngày</option>
                <option value="2-day">2N1Đ</option>
                <option value="3-day">3N2Đ</option>
              </select>
            </div>

            {/* Budget Selector */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-[#6B6355] uppercase block">2. Ngân sách</label>
              <select
                value={smartBudget}
                onChange={(e) => setSmartBudget(e.target.value as any)}
                className="w-full text-[11px] font-bold bg-white rounded-xl px-2 py-1.5 border border-[#26221B]/15 text-[#26221B] focus:outline-none focus:border-[#0E8C7F]"
              >
                <option value="budget">Tiết Kiệm</option>
                <option value="comfort">Thoải Mái</option>
                <option value="luxury">Nghỉ Dưỡng</option>
              </select>
            </div>

            {/* Group Selector */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-[#6B6355] uppercase block">3. Đi cùng ai</label>
              <select
                value={smartGroup}
                onChange={(e) => setSmartGroup(e.target.value as any)}
                className="w-full text-[11px] font-bold bg-white rounded-xl px-2 py-1.5 border border-[#26221B]/15 text-[#26221B] focus:outline-none focus:border-[#0E8C7F]"
              >
                <option value="solo">Solo (1 mình)</option>
                <option value="couple">Cặp Đôi</option>
                <option value="friends">Nhóm Bạn</option>
                <option value="family">Gia Đình</option>
              </select>
            </div>
          </div>

          {/* Smart Result Action */}
          {smartMatchedPreset && (
            <button
              type="button"
              onClick={() => onSelect(smartMatchedPreset.slug, smartMatchedPreset.title)}
              className="w-full p-2.5 rounded-xl bg-[#0E8C7F] hover:bg-[#085A52] text-white flex items-center justify-between transition-all tap-bounce shadow-xs group"
            >
              <div className="text-left">
                <span className="text-[9px] text-[#FFD37A] font-bold uppercase tracking-wider block">
                  ✨ Tour đề xuất cho bạn • {smartMatchedPreset.budget_range || 'Chi phí hợp lý'}
                </span>
                <span className="text-xs font-extrabold font-display leading-tight block">
                  {smartMatchedPreset.emoji} {smartMatchedPreset.title} ({smartMatchedPreset.duration})
                </span>
              </div>
              <div className="flex items-center gap-1 bg-white/20 px-2.5 py-1 rounded-lg text-[10px] font-bold shrink-0">
                <span>Xem Sơ Đồ</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          )}
        </div>
      )}

      {/* ── SEARCH & FILTER PILLS ── */}
      <div className="space-y-2">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6355]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm tour theo tên, địa điểm, gà đốt, chùa, trekking..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-[#FAF3E7] border border-[#26221B]/10 text-[#26221B] placeholder-[#6B6355]/60 focus:outline-none focus:border-[#0E8C7F] transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[#6B6355] hover:text-[#26221B]"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none touch-pan-x">
          {mode === 'duration' ? (
            durationFilters.map(f => (
              <button
                key={f.key}
                type="button"
                onClick={() => setDurationFilter(f.key)}
                className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1 transition-all tap-bounce ${
                  durationFilter === f.key
                    ? 'bg-[#0E8C7F] text-white shadow-xs'
                    : 'bg-[#FAF3E7] text-[#6B6355] hover:bg-[#FAF3E7]/80 hover:text-[#26221B] border border-[#26221B]/8'
                }`}
              >
                <span>{f.icon}</span>
                <span>{f.label}</span>
              </button>
            ))
          ) : (
            themeFilters.map(f => (
              <button
                key={f.key}
                type="button"
                onClick={() => setThemeFilter(f.key)}
                className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1 transition-all tap-bounce ${
                  themeFilter === f.key
                    ? 'bg-[#0E8C7F] text-white shadow-xs'
                    : 'bg-[#FAF3E7] text-[#6B6355] hover:bg-[#FAF3E7]/80 hover:text-[#26221B] border border-[#26221B]/8'
                }`}
              >
                <span>{f.icon}</span>
                <span>{f.label}</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ── PRESETS GRID ── */}
      {isLoading ? (
        <div className="py-8 text-center text-[#6B6355] text-xs font-semibold space-y-1">
          <div className="w-5 h-5 border-2 border-[#0E8C7F] border-t-transparent rounded-full animate-spin mx-auto" />
          <p>Đang nạp 27 lịch trình thực địa...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-6 text-center text-[#6B6355] text-xs bg-[#FAF3E7] rounded-xl border border-dashed border-[#26221B]/15 p-4">
          <p className="font-bold">Không tìm thấy lịch trình phù hợp</p>
          <p className="text-[10px] mt-0.5">Thử đổi từ khóa hoặc bấm &quot;Tất cả (27)&quot;</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto scrollbar-thin pr-1">
          {filtered.map((p) => (
            <button
              key={p.slug}
              type="button"
              onClick={() => onSelect(p.slug, p.title)}
              className="text-left p-2.5 sm:p-3 rounded-2xl bg-[#FFFDF7] hover:bg-[#FAF3E7] border border-[#26221B]/10 hover:border-[#0E8C7F]/60 transition-all active:scale-98 group flex flex-col justify-between shadow-2xs hover:shadow-xs"
            >
              <div>
                {/* Header: Emoji + Title */}
                <div className="flex items-start gap-2 mb-1">
                  <span className="text-base shrink-0 leading-none mt-0.5">{p.emoji || '🔥'}</span>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-[11px] sm:text-xs font-extrabold text-[#26221B] group-hover:text-[#0E8C7F] leading-tight line-clamp-2 font-display">
                      {p.title}
                    </h5>
                  </div>
                </div>

                {/* For Whom / Description */}
                <p className="text-[10px] text-[#6B6355] leading-tight line-clamp-1 mb-2">
                  👥 {p.for_whom || 'Mọi lứa tuổi'}
                </p>
              </div>

              {/* Badges Footer */}
              <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-[#26221B]/6 text-[9px] font-bold text-[#6B6355]">
                <span className="flex items-center gap-1 text-[#0E8C7F]">
                  <Clock className="w-2.5 h-2.5" />
                  <span>{p.duration}</span>
                </span>
                {p.budget_range && (
                  <span className="text-[#D9822B] truncate max-w-[120px]">
                    💰 {p.budget_range.replace('/người', '').replace('/gia đình', '/GĐ')}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* ── FOOTER SUBTITLE ── */}
      <div className="flex items-center justify-between text-[9px] text-[#6B6355]/80 pt-1">
        <span>✅ Đã tối ưu cự ly Kilomet & thứ tự ghé thăm</span>
        <span className="font-bold text-[#0E8C7F]">27 Lịch Trình</span>
      </div>
    </div>
  );
}
