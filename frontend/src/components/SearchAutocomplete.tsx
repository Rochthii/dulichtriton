'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search, MapPin, ArrowRight, X, Sparkles,
  Utensils, Hotel, Landmark, Compass, TrendingUp, Star,
  History, Trash2, ChevronRight, Flame
} from 'lucide-react';
import localMasterPois from '@/data/triton_pois_full.json';
import { removeVietnameseTones } from '@/app/api/v1/search/route';

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

const CATEGORY_TABS = [
  { key: 'all',     label: 'Tất Cả',     icon: Compass },
  { key: 'food',    label: 'Ẩm Thực',   icon: Utensils },
  { key: 'place',   label: 'Thắng Cảnh', icon: Compass },
  { key: 'culture', label: 'Chùa Khmer', icon: Landmark },
  { key: 'stay',    label: 'Lưu Trú',   icon: Hotel },
];

const TRENDING_KEYWORDS = [
  { label: 'Gà Đốt Ô Thum', icon: Utensils, href: '/food' },
  { label: 'Hồ Tà Pạ',      icon: Compass,  href: '/places/ho-ta-pa-tuyet-tinh-coc-pl001' },
  { label: 'Chùa Tà Pạ',    icon: Landmark, href: '/places/chua-ta-pa-chua-nui-hg001' },
  { label: 'Núi Cô Tô',     icon: Compass,  href: '/places/nui-co-to-phung-hoang-son-pl008' },
  { label: 'Đu Đủ Đâm',     icon: Utensils, href: '/food' },
  { label: 'Homestay Núi',  icon: Hotel,    href: '/stay' },
];

const RECENT_KEY = 'triton_recent_searches_v2';

export default function SearchAutocomplete() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('all');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const abortRef = useRef<AbortController | null>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  const saveRecentSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 5);
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const clearRecentSearches = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_KEY);
    } catch {
      // ignore
    }
  };

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

  // Instant In-Memory 0ms Search matching both Vietnamese & Non-diacritics
  const runInstantClientSearch = useCallback((q: string) => {
    const qClean = removeVietnameseTones(q);
    if (!qClean) return [];

    const matches = (localMasterPois as any[]).filter((p) => {
      const nameClean = removeVietnameseTones(p.name || '');
      const communeClean = removeVietnameseTones(p.commune || '');
      const catClean = removeVietnameseTones(p.tourism_category || p.category || '');
      const descClean = removeVietnameseTones(p.description || '');

      return (
        nameClean.includes(qClean) ||
        communeClean.includes(qClean) ||
        catClean.includes(qClean) ||
        descClean.includes(qClean)
      );
    });

    const scored = matches.map((item) => {
      const nameClean = removeVietnameseTones(item.name || '');
      let score = 0;
      if (nameClean.startsWith(qClean)) score += 120;
      else if (nameClean.includes(qClean)) score += 80;

      if (removeVietnameseTones(item.category || '').includes(qClean)) score += 30;
      if (removeVietnameseTones(item.commune || '').includes(qClean)) score += 25;
      if (item.is_hot) score += 15;
      return { ...item, _score: score };
    }).sort((a, b) => b._score - a._score);

    return scored.slice(0, 10).map((item) => {
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
        is_hot: Boolean(item.is_hot),
      };
    });
  }, []);

  // Hybrid Search: Immediate 0ms local match + async background API sync
  const doSearch = useCallback(async (q: string) => {
    // 1. Instant 0ms local result
    const localMatches = runInstantClientSearch(q);
    if (localMatches.length > 0) {
      setResults(localMatches);
      setActiveIdx(-1);
    }

    // 2. Fetch server API
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    try {
      const res = await fetch(`/api/v1/search?q=${encodeURIComponent(q)}&limit=10`, {
        signal: abortRef.current.signal,
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.results) && data.results.length > 0) {
          setResults(data.results);
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.warn('Search fallback to client cache:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [runInstantClientSearch]);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length === 0) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(() => doSearch(trimmed), 100);
    return () => clearTimeout(timer);
  }, [query, doSearch]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx(prev => (prev < filteredResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(prev => (prev > 0 ? prev - 1 : filteredResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIdx >= 0 && filteredResults[activeIdx]) {
        saveRecentSearch(filteredResults[activeIdx].name);
        setIsOpen(false);
        router.push(`/places/${filteredResults[activeIdx].slug}`);
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
    saveRecentSearch(q);
    setIsOpen(false);
    window.dispatchEvent(new CustomEvent('triton:open-chat', { detail: { query: q } }));
  };

  const handleAskAI = () => {
    const q = query.trim();
    if (!q) return;
    saveRecentSearch(q);
    setIsOpen(false);
    window.dispatchEvent(new CustomEvent('triton:open-chat', { detail: { query: q } }));
  };

  const handleSelectRecent = (term: string) => {
    setQuery(term);
    saveRecentSearch(term);
    inputRef.current?.focus();
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setIsOpen(focused);
    setActiveIdx(-1);
    inputRef.current?.focus();
  };

  // Filtered by Category Tab
  const filteredResults = useMemo(() => {
    if (selectedGroupFilter === 'all') return results;
    return results.filter((r) => r.group === selectedGroupFilter);
  }, [results, selectedGroupFilter]);

  // Group results for display
  const grouped = (['place', 'food', 'stay', 'culture'] as const).reduce(
    (acc, g) => {
      acc[g] = filteredResults.filter(r => r.group === g);
      return acc;
    },
    {} as Record<string, SearchResultItem[]>
  );

  const showInitial = focused && query.trim().length === 0;
  const showResults = isOpen && query.trim().length > 0;

  let itemIndex = 0;

  return (
    <div ref={wrapperRef} className="relative w-full max-w-2xl pt-1 sm:pt-2 z-30 font-body">
      
      {/* Search Input Bar */}
      <form
        onSubmit={handleSubmit}
        className={`flex items-center rounded-full p-1.5 sm:p-2 shadow-2xl transition-all duration-200 bg-[#FFFDF7]/98 backdrop-blur-xl border ${
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
            if (e.target.value.trim().length > 0) setIsOpen(true);
          }}
          onFocus={() => {
            setFocused(true);
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Tìm Hồ Tà Pạ, Gà Đốt Ô Thum, Chùa Khmer..."
          className="w-full flex-grow border-none bg-transparent px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-[#26221B] outline-none placeholder:text-[#6B6355]/60 focus:ring-0 font-medium"
          aria-label="Tìm kiếm địa điểm Tri Tôn"
          autoComplete="off"
        />

        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="p-1.5 rounded-full text-[#6B6355] hover:text-[#26221B] mr-1 transition-colors cursor-pointer"
            aria-label="Xóa tìm kiếm"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <button
          type="submit"
          className="flex min-w-[42px] sm:min-w-[110px] items-center justify-center rounded-full bg-[#F0A32F] hover:bg-[#C97F1B] active:scale-95 p-2 sm:p-2.5 text-[#26221B] hover:text-white shadow-md transition-all shrink-0 font-bold text-xs font-display cursor-pointer"
          aria-label="Tìm kiếm"
        >
          <Search className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline ml-1.5">Tìm Ngay</span>
        </button>
      </form>

      {/* DROPDOWN RESULTS & INITIAL STATE */}
      {(showInitial || showResults) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#FFFDF7] rounded-2xl sm:rounded-[24px] shadow-2xl border border-[#26221B]/10 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150 font-body max-h-[68vh] overflow-y-auto">

          {/* INITIAL STATE: RECENT SEARCHES + TRENDING */}
          {showInitial && (
            <div className="p-3 sm:p-4 space-y-3">
              
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="space-y-1.5 pb-2 border-b border-[#26221B]/6">
                  <div className="flex items-center justify-between font-display text-[11px] text-[#6B6355]">
                    <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
                      <History className="w-3.5 h-3.5 text-[#0E8C7F]" />
                      <span>Lịch sử tra cứu gần đây</span>
                    </div>
                    <button
                      type="button"
                      onClick={clearRecentSearches}
                      className="text-[10px] text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Xóa lịch sử</span>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {recentSearches.map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => handleSelectRecent(term)}
                        className="px-3 py-1 rounded-full bg-[#FAF3E7] hover:bg-[#0E8C7F]/15 text-[#26221B] text-[11px] font-semibold flex items-center gap-1.5 border border-[#26221B]/8 transition-colors cursor-pointer active:scale-95"
                      >
                        <History className="w-3 h-3 text-[#6B6355]" />
                        <span>{term}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending Destinations */}
              <div>
                <div className="flex items-center gap-1.5 px-1 mb-2 font-display">
                  <TrendingUp className="w-3.5 h-3.5 text-[#F0A32F]" />
                  <span className="text-[11px] font-bold text-[#6B6355] uppercase tracking-wider">Tọa độ nổi bật hôm nay</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {TRENDING_KEYWORDS.map(t => {
                    const Icon = t.icon;
                    return (
                      <Link
                        key={t.label}
                        href={t.href}
                        onClick={() => {
                          saveRecentSearch(t.label);
                          setIsOpen(false);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF3E7] hover:bg-[#0E8C7F] hover:text-white text-xs font-semibold text-[#26221B] transition-all cursor-pointer"
                      >
                        <Icon className="w-3 h-3 text-[#F0A32F]" />
                        <span>{t.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* ACTIVE SEARCH RESULTS STATE */}
          {showResults && (
            <>
              {/* Quick Filter Category Pills inside dropdown */}
              <div className="flex items-center gap-1 px-3 py-2 bg-[#FAF3E7] border-b border-[#26221B]/8 overflow-x-auto scrollbar-none font-display">
                {CATEGORY_TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isSelected = selectedGroupFilter === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setSelectedGroupFilter(tab.key)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 active:scale-95 ${
                        isSelected
                          ? 'bg-[#0E8C7F] text-white shadow-2xs'
                          : 'bg-[#FFFDF7] text-[#6B6355] border border-[#26221B]/8 hover:border-[#0E8C7F]/30'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {loading && filteredResults.length === 0 ? (
                <div className="p-4 flex items-center justify-center gap-2 text-xs text-[#6B6355] font-medium font-body">
                  <span className="w-3 h-3 border-2 border-[#0E8C7F] border-t-transparent rounded-full animate-spin" />
                  Đang tìm kiếm...
                </div>
              ) : filteredResults.length > 0 ? (
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
                        <div className={`px-3.5 py-1.5 flex items-center gap-1.5 border-t border-[#26221B]/6 ${meta.bg} font-display`}>
                          <GroupIcon className={`w-3 h-3 ${meta.color}`} />
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${meta.color}`}>
                            {meta.label} ({items.length})
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
                              onClick={() => {
                                saveRecentSearch(item.name);
                                setIsOpen(false);
                              }}
                              onMouseEnter={() => setActiveIdx(idx)}
                              className={`flex items-center gap-2.5 sm:gap-3 px-3.5 py-2 transition-colors group cursor-pointer ${
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
                              <ChevronRight className={`w-4 h-4 shrink-0 transition-all ${
                                isActive ? 'text-[#0E8C7F] translate-x-0.5' : 'text-[#6B6355]/40 group-hover:text-[#0E8C7F]'
                              }`} />
                            </Link>
                          );
                        })}
                      </div>
                    );
                  })}

                  {/* Footer: View all in catalog + Ask AI Assistant */}
                  <div className="grid grid-cols-2 border-t border-[#26221B]/6 font-display">
                    <Link
                      href={`/places?q=${encodeURIComponent(query.trim())}`}
                      onClick={() => {
                        saveRecentSearch(query.trim());
                        setIsOpen(false);
                      }}
                      className="flex items-center justify-center gap-1.5 p-2.5 sm:p-3 text-xs font-bold text-[#6B6355] hover:bg-[#FAF3E7] transition-colors border-r border-[#26221B]/6"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>Xem tất cả ({filteredResults.length})</span>
                    </Link>
                    <button
                      type="button"
                      onClick={handleAskAI}
                      className="flex items-center justify-center gap-1.5 p-2.5 sm:p-3 text-xs font-bold text-[#0E8C7F] hover:bg-[#0E8C7F]/10 transition-colors cursor-pointer"
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
                    Không tìm thấy địa điểm "<span className="font-bold text-[#26221B]">{query}</span>"
                  </p>
                  <button
                    type="button"
                    onClick={handleAskAI}
                    className="w-full p-2.5 sm:p-3 bg-[#F0A32F] hover:bg-[#C97F1B] text-[#26221B] hover:text-white rounded-full flex items-center justify-center gap-2 text-xs font-bold shadow-md transition-all font-display active:scale-95 cursor-pointer"
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
