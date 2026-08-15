'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search, MapPin, ArrowRight, X, Sparkles,
  Utensils, Hotel, Landmark, Compass, TrendingUp, Star,
} from 'lucide-react';

interface SearchResultItem {
  id: string;
  slug: string;
  name: string;
  category: string;
  commune: string;
  rating?: number;
  image_url?: string;
  group: 'place' | 'food' | 'stay' | 'culture';
  is_hot?: boolean;
}

const GROUP_META = {
  place:   { label: 'Thắng Cảnh',  icon: Compass,  color: 'text-[#0E8C7F]', bg: 'bg-[#0E8C7F]/10' },
  food:    { label: 'Ẩm Thực',   icon: Utensils,  color: 'text-[#F26B3A]', bg: 'bg-[#F26B3A]/10' },
  stay:    { label: 'Lưu Trú',   icon: Hotel,     color: 'text-[#8A5A33]', bg: 'bg-[#8A5A33]/10' },
  culture: { label: 'Di Sản',    icon: Landmark,  color: 'text-[#D9822B]', bg: 'bg-[#D9822B]/10' },
};

const TRENDING = [
  { label: 'Gà Đốt Ô Thum', icon: Utensils, href: '/food' },
  { label: 'Hồ Tà Pạ',      icon: Compass,  href: '/places/ho-ta-pa-tuyet-tinh-coc-pl001' },
  { label: 'Chùa Tà Pạ',    icon: Landmark, href: '/places/chua-ta-pa-chua-nui-hg001' },
  { label: 'Núi Cô Tô',     icon: Compass,  href: '/places/nui-co-to-phung-hoang-son-pl008' },
  { label: 'Đu Đủ Đâm',     icon: Utensils, href: '/food' },
  { label: 'Homestay view núi', icon: Hotel, href: '/stay' },
];

export default function SearchAutocomplete() {
  const [query, setQuery]     = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen]   = useState(false);
  const [focused, setFocused] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);

  const wrapperRef  = useRef<HTMLDivElement>(null);
  const inputRef    = useRef<HTMLInputElement>(null);
  const router      = useRouter();
  const abortRef    = useRef<AbortController | null>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setFocused(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Debounced search — 150ms, fetch from unified API
  const doSearch = useCallback(async (q: string) => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    try {
      const res = await fetch(`/api/v1/search?q=${encodeURIComponent(q)}&limit=8`, {
        signal: abortRef.current.signal,
      });
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();

      const mapped: SearchResultItem[] = (data.results || []).map((item: any) => {
        let grp: 'place' | 'food' | 'stay' | 'culture' = 'place';
        const cat = (item.category || '').toLowerCase();
        const tCat = (item.tourism_category || '').toLowerCase();
        if (cat.includes('food') || tCat.includes('ẩm thực') || tCat.includes('quán')) grp = 'food';
        else if (cat.includes('stay') || tCat.includes('lưu trú') || tCat.includes('homestay')) grp = 'stay';
        else if (cat.includes('spiritual') || cat.includes('history') || tCat.includes('chùa') || tCat.includes('di tích')) grp = 'culture';

        return {
          id: item.id,
          slug: item.slug || item.id,
          name: item.name,
          category: item.tourism_category || item.category || 'Điểm đến',
          commune: item.commune || 'Tri Tôn',
          rating: item.rating ? Number(item.rating) : 4.8,
          image_url: item.image_url || (Array.isArray(item.photos) && item.photos[0]?.url) || undefined,
          group: grp,
          is_hot: item.is_hot,
        };
      });

      setResults(mapped);
      setActiveIdx(-1);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Autocomplete error:', err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(() => doSearch(trimmed), 150);
    return () => clearTimeout(timer);
  }, [query, doSearch]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx(prev => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(prev => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIdx >= 0 && results[activeIdx]) {
        setIsOpen(false);
        router.push(`/places/${results[activeIdx].slug}`);
      } else {
        handleSubmit(e);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setIsOpen(false);
    window.dispatchEvent(new CustomEvent('triton:open-chat', { detail: { query: q } }));
  };

  const handleAskAI = () => {
    const q = query.trim();
    if (!q) return;
    setIsOpen(false);
    window.dispatchEvent(new CustomEvent('triton:open-chat', { detail: { query: q } }));
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setIsOpen(focused);
    setActiveIdx(-1);
    inputRef.current?.focus();
  };

  // Group results for display
  const grouped = (['place', 'food', 'stay', 'culture'] as const).reduce(
    (acc, g) => {
      acc[g] = results.filter(r => r.group === g);
      return acc;
    },
    {} as Record<string, SearchResultItem[]>
  );

  const showTrending = focused && query.trim().length === 0;
  const showResults  = isOpen && query.trim().length >= 2;

  let itemIndex = 0; // For keyboard navigation tracking

  return (
    <div ref={wrapperRef} className="relative w-full max-w-2xl pt-1 sm:pt-2 z-30 font-body">
      {/* Search Input */}
      <form
        onSubmit={handleSubmit}
        className={`flex items-center rounded-full p-1.5 sm:p-2 shadow-2xl transition-all duration-200 bg-[#FFFDF7]/95 backdrop-blur-xl border ${
          focused ? 'border-[#0E8C7F] ring-2 ring-[#0E8C7F]/20' : 'border-[#26221B]/15'
        }`}
      >
        <Search className="ml-3 h-4 w-4 text-[#6B6355] shrink-0 hidden sm:block" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            if (e.target.value.trim().length >= 2) setIsOpen(true);
          }}
          onFocus={() => {
            setFocused(true);
            if (query.trim().length >= 2) setIsOpen(true);
            else setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Tìm Hồ Tà Pạ, Gà Đốt Ô Thum, Chùa Khmer..."
          className="w-full flex-grow border-none bg-transparent px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-[#26221B] outline-none placeholder:text-[#6B6355]/60 focus:ring-0 font-medium"
          aria-label="Tìm kiếm địa điểm Tri Tôn"
          autoComplete="off"
        />

        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="p-1.5 rounded-full text-[#6B6355] hover:text-[#26221B] mr-1 transition-colors"
            aria-label="Xóa tìm kiếm"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <button
          type="submit"
          className="flex min-w-[42px] sm:min-w-[110px] items-center justify-center rounded-full bg-[#F0A32F] hover:bg-[#C97F1B] active:scale-95 p-2.5 sm:p-3 text-[#26221B] hover:text-white shadow-md transition-all shrink-0 font-bold text-xs font-display"
          aria-label="Tìm kiếm"
        >
          <Search className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline ml-1.5">Tìm Ngay</span>
        </button>
      </form>

      {/* Dropdown */}
      {(showTrending || showResults) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#FFFDF7] rounded-[24px] shadow-2xl border border-[#26221B]/10 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150 font-body">

          {/* TRENDING (shown when focused + no query) */}
          {showTrending && (
            <div className="p-3.5">
              <div className="flex items-center gap-1.5 px-1 mb-2 font-display">
                <TrendingUp className="w-3.5 h-3.5 text-[#F0A32F]" />
                <span className="text-[11px] font-bold text-[#6B6355] uppercase tracking-wider">Phổ biến hôm nay</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {TRENDING.map(t => {
                  const Icon = t.icon;
                  return (
                    <Link
                      key={t.label}
                      href={t.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FAF3E7] hover:bg-[#0E8C7F] hover:text-white text-xs font-semibold text-[#26221B] transition-all"
                    >
                      <Icon className="w-3 h-3 text-[#F0A32F]" />
                      <span>{t.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* SEARCH RESULTS */}
          {showResults && (
            <>
              {loading ? (
                <div className="p-4 flex items-center justify-center gap-2 text-xs text-[#6B6355] font-medium font-body">
                  <span className="w-3 h-3 border-2 border-[#0E8C7F] border-t-transparent rounded-full animate-spin" />
                  Đang tìm kiếm...
                </div>
              ) : results.length > 0 ? (
                <div>
                  {/* Grouped results */}
                  {(['place', 'food', 'stay', 'culture'] as const).map(group => {
                    const items = grouped[group];
                    if (!items || items.length === 0) return null;
                    const meta = GROUP_META[group];
                    const GroupIcon = meta.icon;
                    return (
                      <div key={group}>
                        {/* Group header */}
                        <div className={`px-4 py-1.5 flex items-center gap-1.5 border-t border-[#26221B]/6 ${meta.bg} font-display`}>
                          <GroupIcon className={`w-3 h-3 ${meta.color}`} />
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${meta.color}`}>
                            {meta.label}
                          </span>
                        </div>
                        {/* Items */}
                        {items.map(item => {
                          const idx = itemIndex++;
                          const isActive = idx === activeIdx;
                          return (
                            <Link
                              key={item.id}
                              href={`/places/${item.slug}`}
                              onClick={() => setIsOpen(false)}
                              onMouseEnter={() => setActiveIdx(idx)}
                              className={`flex items-center gap-3 px-4 py-2.5 transition-colors group ${
                                isActive ? 'bg-[#FAF3E7]' : 'hover:bg-[#FAF3E7]/60'
                              }`}
                            >
                              {/* Thumbnail */}
                              {item.image_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={item.image_url}
                                  alt={item.name}
                                  className="w-10 h-10 rounded-xl object-cover bg-slate-100 shrink-0"
                                  loading="lazy"
                                />
                              ) : (
                                <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center ${meta.bg}`}>
                                  <GroupIcon className={`w-5 h-5 ${meta.color}`} />
                                </div>
                              )}

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <h4 className={`font-display font-bold text-xs sm:text-sm text-[#26221B] truncate transition-colors ${
                                    isActive ? 'text-[#0E8C7F]' : 'group-hover:text-[#0E8C7F]'
                                  }`}>
                                    {item.name}
                                  </h4>
                                  {item.is_hot && (
                                    <span className="text-[9px] font-bold text-[#F26B3A] bg-[#F26B3A]/10 px-1.5 py-0.5 rounded-full shrink-0 font-display">HOT</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#6B6355] font-body">
                                  <span className="flex items-center gap-0.5 text-[#0E8C7F] font-semibold">
                                    <MapPin className="w-3 h-3 text-[#F0A32F]" />
                                    {item.commune}
                                  </span>
                                  {item.rating && (
                                    <>
                                      <span>•</span>
                                      <span className="flex items-center gap-0.5">
                                        <Star className="w-2.5 h-2.5 text-[#F0A32F] fill-[#F0A32F]" />
                                        {item.rating}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <ArrowRight className={`w-4 h-4 shrink-0 transition-all ${
                                isActive ? 'text-[#0E8C7F] translate-x-0.5' : 'text-[#6B6355]/40 group-hover:text-[#0E8C7F]'
                              }`} />
                            </Link>
                          );
                        })}
                      </div>
                    );
                  })}

                  {/* Footer: View all + Ask AI */}
                  <div className="grid grid-cols-2 border-t border-[#26221B]/6 font-display">
                    <Link
                      href={`/places?q=${encodeURIComponent(query.trim())}`}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center gap-1.5 p-3 text-xs font-bold text-[#6B6355] hover:bg-[#FAF3E7] transition-colors border-r border-[#26221B]/6"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>Xem tất cả kết quả</span>
                    </Link>
                    <button
                      type="button"
                      onClick={handleAskAI}
                      className="flex items-center justify-center gap-1.5 p-3 text-xs font-bold text-[#0E8C7F] hover:bg-[#0E8C7F]/10 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#F0A32F] animate-pulse" />
                      <span>Hỏi Trợ Lý AI</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* No results */
                <div className="p-4 space-y-3 font-body">
                  <p className="text-xs text-[#6B6355] font-medium text-center">
                    Không tìm thấy "<span className="font-bold text-[#26221B]">{query}</span>"
                  </p>
                  <button
                    type="button"
                    onClick={handleAskAI}
                    className="w-full p-3 bg-[#F0A32F] hover:bg-[#C97F1B] text-[#26221B] hover:text-white rounded-full flex items-center justify-center gap-2 text-xs font-bold shadow-md transition-all font-display active:scale-95"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Hỏi Trợ Lý AI Tri Tôn ngay</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
