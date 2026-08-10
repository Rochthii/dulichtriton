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
  place:   { label: 'Địa Điểm',  icon: Compass,  color: 'text-emerald-700', bg: 'bg-emerald-50' },
  food:    { label: 'Ẩm Thực',   icon: Utensils,  color: 'text-orange-600',  bg: 'bg-orange-50' },
  stay:    { label: 'Lưu Trú',   icon: Hotel,     color: 'text-blue-600',    bg: 'bg-blue-50' },
  culture: { label: 'Văn Hóa',   icon: Landmark,  color: 'text-purple-600',  bg: 'bg-purple-50' },
};

const TRENDING = [
  { label: 'Gà Đốt Ô Thum', icon: Utensils, href: '/places/quan-sieu-ga-dot-o-thum-chau-sieu-fd001' },
  { label: 'Hồ Tà Pạ',      icon: Compass,  href: '/places/ho-ta-pa-tuyet-tinh-coc-pl001' },
  { label: 'Chùa Tà Pạ',    icon: Landmark, href: '/places/chua-ta-pa-chua-nui-hg001' },
  { label: 'Núi Cô Tô',     icon: Compass,  href: '/places/nui-co-to-phung-hoang-son-pl008' },
  { label: 'Bún Nước Lèo',  icon: Utensils, href: '/places/quan-bun-nuoc-leo-so-nuong-khmer-fd009' },
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
      const res = await fetch(
        `/api/v1/search?q=${encodeURIComponent(q)}`,
        { signal: abortRef.current.signal }
      );
      if (!res.ok) throw new Error('Search error');
      const json = await res.json();
      setResults(json.results || []);
      setActiveIdx(-1);
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('[SmartSearch]', err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    const timer = setTimeout(() => doSearch(q), 150);
    return () => clearTimeout(timer);
  }, [query, doSearch]);

  // Keyboard navigation
  const allItems = results;
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx(i => Math.min(i + 1, allItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(i => Math.max(i - 1, -1));
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      e.preventDefault();
      const item = allItems[activeIdx];
      if (item) {
        setIsOpen(false);
        router.push(`/places/${item.slug}`);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
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
    <div ref={wrapperRef} className="relative w-full max-w-2xl pt-1 sm:pt-2 z-30">
      {/* Search Input */}
      <form
        onSubmit={handleSubmit}
        className={`flex items-center rounded-full p-1.5 sm:p-2 shadow-2xl transition-all duration-200 bg-white/95 backdrop-blur-xl border ${
          focused ? 'border-emerald-400/60 ring-2 ring-emerald-100' : 'border-white/60'
        }`}
      >
        <Search className="ml-3 h-4 w-4 text-slate-400 shrink-0 hidden sm:block" />
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
            else setIsOpen(true); // show trending
          }}
          onKeyDown={handleKeyDown}
          placeholder="Tìm Hồ Tà Pạ, Gà Đốt Ô Thum, Chùa Khmer..."
          className="w-full flex-grow border-none bg-transparent px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:ring-0 font-medium"
          aria-label="Tìm kiếm địa điểm Tri Tôn"
          autoComplete="off"
        />

        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 mr-1 transition-colors"
            aria-label="Xóa tìm kiếm"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <button
          type="submit"
          className="flex min-w-[42px] sm:min-w-[100px] items-center justify-center rounded-full bg-[#1B4D3E] hover:bg-[#143B2F] active:scale-95 p-2.5 sm:p-3 text-white shadow-md transition-all shrink-0 font-bold text-xs"
          aria-label="Tìm kiếm"
        >
          <Search className="h-4 w-4 sm:h-4 sm:w-4 text-[#D99B26]" />
          <span className="hidden sm:inline ml-2 text-white">Tìm Ngay</span>
        </button>
      </form>

      {/* Dropdown */}
      {(showTrending || showResults) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">

          {/* TRENDING (shown when focused + no query) */}
          {showTrending && (
            <div className="p-3">
              <div className="flex items-center gap-1.5 px-1 mb-2">
                <TrendingUp className="w-3.5 h-3.5 text-[#D99B26]" />
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Phổ biến hôm nay</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {TRENDING.map(t => {
                  const Icon = t.icon;
                  return (
                    <Link
                      key={t.label}
                      href={t.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-xs font-semibold text-slate-700 transition-colors"
                    >
                      <Icon className="w-3 h-3" />
                      {t.label}
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
                <div className="p-4 flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
                  <span className="w-3 h-3 border-2 border-[#1B4D3E] border-t-transparent rounded-full animate-spin" />
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
                        <div className={`px-4 py-1.5 flex items-center gap-1.5 border-t border-slate-100 ${meta.bg}`}>
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
                                isActive ? 'bg-emerald-50' : 'hover:bg-slate-50'
                              }`}
                            >
                              {/* Thumbnail */}
                              {item.image_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={item.image_url}
                                  alt={item.name}
                                  className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0"
                                  loading="lazy"
                                />
                              ) : (
                                <div className={`w-10 h-10 rounded-lg shrink-0 flex items-center justify-center ${meta.bg}`}>
                                  <GroupIcon className={`w-5 h-5 ${meta.color}`} />
                                </div>
                              )}

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <h4 className={`font-bold text-xs sm:text-sm text-slate-900 truncate transition-colors ${
                                    isActive ? 'text-emerald-800' : 'group-hover:text-[#1B4D3E]'
                                  }`}>
                                    {item.name}
                                  </h4>
                                  {item.is_hot && (
                                    <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full shrink-0">HOT</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                                  <span className="flex items-center gap-0.5 text-emerald-700 font-semibold">
                                    <MapPin className="w-3 h-3 text-[#D99B26]" />
                                    {item.commune}
                                  </span>
                                  {item.rating && (
                                    <>
                                      <span>•</span>
                                      <span className="flex items-center gap-0.5">
                                        <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                                        {item.rating}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <ArrowRight className={`w-4 h-4 shrink-0 transition-all ${
                                isActive ? 'text-emerald-600 translate-x-0.5' : 'text-slate-300 group-hover:text-emerald-400'
                              }`} />
                            </Link>
                          );
                        })}
                      </div>
                    );
                  })}

                  {/* Footer: View all + Ask AI */}
                  <div className="grid grid-cols-2 border-t border-slate-100">
                    <Link
                      href={`/places?q=${encodeURIComponent(query.trim())}`}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center gap-1.5 p-3 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors border-r border-slate-100"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      Xem tất cả kết quả
                    </Link>
                    <button
                      type="button"
                      onClick={handleAskAI}
                      className="flex items-center justify-center gap-1.5 p-3 text-xs font-bold text-emerald-800 hover:bg-emerald-50 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#D99B26] animate-pulse" />
                      Hỏi Trợ Lý AI
                    </button>
                  </div>
                </div>
              ) : (
                /* No results */
                <div className="p-4 space-y-3">
                  <p className="text-xs text-slate-500 font-medium text-center">
                    Không tìm thấy "<span className="font-bold text-slate-700">{query}</span>"
                  </p>
                  <button
                    type="button"
                    onClick={handleAskAI}
                    className="w-full p-3 bg-[#1B4D3E] hover:bg-[#143B2F] text-white rounded-xl flex items-center justify-center gap-2 text-xs font-bold shadow-md transition-colors"
                  >
                    <Sparkles className="w-4 h-4 text-[#D99B26]" />
                    Hỏi Trợ Lý AI Tri Tôn ngay
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
