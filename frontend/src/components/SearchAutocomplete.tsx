'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Sparkles, ArrowRight, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface SearchResultItem {
  id: string;
  slug: string;
  name: string;
  category: string;
  commune: string;
  rating?: number;
  image_url?: string;
}

export default function SearchAutocomplete() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced live search query to Supabase
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const cleanQuery = query.trim();
        const { data, error } = await supabase
          .from('places')
          .select('id, slug, name, category, commune, rating, image_url, photos')
          .or(`name.ilike.%${cleanQuery}%,commune.ilike.%${cleanQuery}%,category.ilike.%${cleanQuery}%`)
          .limit(5);

        if (!error && data) {
          const formatted: SearchResultItem[] = data.map((item: any) => {
            let img = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600&auto=format&fit=crop';
            if (item.image_url && typeof item.image_url === 'string' && item.image_url.startsWith('http')) {
              img = item.image_url;
            } else if (Array.isArray(item.photos) && item.photos.length > 0) {
              const p0 = item.photos[0];
              if (typeof p0 === 'string' && p0.startsWith('http')) img = p0;
              else if (p0 && typeof p0 === 'object' && p0.url) img = p0.url;
            }
            return {
              id: item.id,
              slug: item.slug || item.id,
              name: item.name,
              category: item.category || 'Du lịch Bảy Núi',
              commune: item.commune || 'Tri Tôn',
              rating: item.rating || 4.8,
              image_url: img,
            };
          });
          setResults(formatted);
          setIsOpen(true);
        }
      } catch (err) {
        console.error('[SearchAutocomplete] Live fetch error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsOpen(false);
    // Dispatch event to open global ChatbotWidget with query
    window.dispatchEvent(new CustomEvent('triton:open-chat', { detail: { query: query.trim() } }));
  };

  const handleAskAI = () => {
    if (!query.trim()) return;
    setIsOpen(false);
    window.dispatchEvent(new CustomEvent('triton:open-chat', { detail: { query: query.trim() } }));
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-2xl pt-1 sm:pt-2 z-30">
      <form
        onSubmit={handleSubmit}
        className="flex items-center rounded-full p-1.5 sm:p-2 shadow-2xl transition-transform focus-within:scale-[1.01] bg-white/95 backdrop-blur-xl border border-white/60"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value.trim().length >= 2) setIsOpen(true);
          }}
          onFocus={() => {
            if (query.trim().length >= 2) setIsOpen(true);
          }}
          placeholder="Tìm Hồ Tà Pạ, Gà đốt Ô Thum, Chùa Khmer..."
          className="w-full flex-grow rounded-l-full border-none bg-transparent px-3.5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:ring-0 font-medium"
        />

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setResults([]);
              setIsOpen(false);
            }}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 mr-1"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <button
          type="submit"
          className="flex min-w-[42px] sm:min-w-[48px] items-center justify-center rounded-full bg-[#1B4D3E] hover:bg-[#143B2F] p-2.5 sm:p-3 text-white shadow-md transition-colors shrink-0 font-bold text-xs"
        >
          <Search className="h-4 w-4 sm:h-5 sm:w-5 text-[#D99B26]" />
          <span className="hidden md:inline ml-2 text-white">Tìm Kiếm AI</span>
        </button>
      </form>

      {/* Autocomplete Dropdown */}
      {isOpen && (query.trim().length >= 2 || results.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {loading ? (
            <div className="p-4 flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
              <span className="w-3 h-3 border-2 border-[#1B4D3E] border-t-transparent rounded-full animate-spin"></span>
              Đang tìm kiếm dữ liệu Tri Tôn...
            </div>
          ) : results.length > 0 ? (
            <div className="divide-y divide-slate-100">
              <div className="px-4 py-2 bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Kết quả tìm kiếm ({results.length})</span>
                <span className="text-[#1B4D3E]">Địa danh đã xác minh</span>
              </div>

              {results.map((item) => (
                <Link
                  key={item.id}
                  href={`/places/${item.slug}`}
                  onClick={() => setIsOpen(false)}
                  className="p-3 hover:bg-emerald-50/60 flex items-center gap-3 transition-colors group"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-11 h-11 rounded-xl object-cover bg-slate-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate group-hover:text-[#1B4D3E] transition-colors">
                      {item.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                      <span className="flex items-center gap-0.5 text-emerald-700 font-semibold">
                        <MapPin className="w-3 h-3 text-[#D99B26]" />
                        {item.commune}
                      </span>
                      <span>•</span>
                      <span className="truncate">{item.category}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#1B4D3E] group-hover:translate-x-0.5 transition-all shrink-0" />
                </Link>
              ))}

              {/* Ask AI Prompt Option */}
              <button
                type="button"
                onClick={handleAskAI}
                className="w-full p-3 bg-emerald-950 hover:bg-[#143B2F] text-white flex items-center justify-between text-xs font-bold transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#D99B26] animate-pulse" />
                  <span>Hỏi Trợ Lý AI về "{query}"</span>
                </div>
                <span className="text-[11px] text-emerald-300 font-medium">Tư vấn 24/7 &rarr;</span>
              </button>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              <p className="text-xs text-slate-600 font-medium text-center">
                Không tìm thấy địa điểm trùng khớp tên với "{query}"
              </p>
              <button
                type="button"
                onClick={handleAskAI}
                className="w-full p-3 bg-[#1B4D3E] hover:bg-[#143B2F] text-white rounded-2xl flex items-center justify-center gap-2 text-xs font-bold shadow-md transition-colors"
              >
                <Sparkles className="w-4 h-4 text-[#D99B26]" />
                <span>Hỏi Trợ Lý AI Tri Tôn ngay</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
