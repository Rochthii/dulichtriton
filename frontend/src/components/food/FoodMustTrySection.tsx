'use client';

import React from 'react';
import Link from 'next/link';
import { Flame, Award, Star, ChevronRight, Navigation } from 'lucide-react';
import { getOptimizedImageUrl } from '@/lib/imageOptimizer';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export interface FoodItem {
  id: string;
  slug: string;
  name: string;
  name_en?: string;
  category: string;
  category_en?: string;
  tourism_category: string;
  commune: string;
  rating: number;
  image_url: string;
  video_url?: string;
  hours: string;
  description?: string;
  description_en?: string;
  detailed_story?: string;
  detailed_story_en?: string;
  open_late?: boolean;
  night_hours?: string;
  phone?: string;
  price_level?: string;
  address?: string;
  is_hot?: boolean;
}

export function getFoodPriceBadge(food: FoodItem, isEn = false): { priceText: string; note?: string } {
  const n = food.name.toLowerCase();
  if (n.includes('gà đốt') || n.includes('ô thum')) {
    return {
      priceText: isEn ? '~$11 – $13 / whole' : '~280k – 320k / con',
      note: isEn ? 'Sticky rice ordered separately' : 'Xôi/cơm lam gọi riêng'
    };
  }
  if (n.includes('bò 7 món') || n.includes('bò nướng')) {
    return {
      priceText: isEn ? '~$5 – $7 / portion' : '~120k – 180k / phần',
      note: isEn ? 'Hotpot / Charcoal grill' : 'Lẩu/Nướng than'
    };
  }
  if (n.includes('cháo bò') || n.includes('bún cá') || n.includes('bánh canh')) {
    return {
      priceText: isEn ? '~$1.2 – $1.8 / bowl' : '~30k – 45k / tô',
      note: isEn ? 'Breakfast 06:00–10:00' : 'Ăn sáng 06:00–10:00'
    };
  }
  if (n.includes('bánh bò')) {
    return {
      priceText: isEn ? '~$1.6 – $2.4 / cake' : '~40k – 60k / ổ',
      note: isEn ? 'Fresh from oven 9h & 14h' : 'Ra lò 9h & 14h'
    };
  }
  if (n.includes('đu đủ đâm')) {
    return {
      priceText: isEn ? '~$0.8 – $1.4 / dish' : '~20k – 35k / dĩa',
      note: isEn ? 'Spicy Khmer taste' : 'Vị cay nồng Khmer'
    };
  }
  if (n.includes('cà phê') || n.includes('cafe') || n.includes('coffee') || n.includes('thốt nốt')) {
    return {
      priceText: isEn ? '~$0.6 – $1.4 / cup' : '~15k – 35k / ly',
      note: isEn ? 'Rice field & lake view' : 'View ngắm lúa & hồ'
    };
  }
  return { priceText: food.price_level || (isEn ? '~$1.5 – $6' : '~35k – 150k'), note: undefined };
}

interface FoodMustTrySectionProps {
  foods: FoodItem[];
}

export default function FoodMustTrySection({ foods }: FoodMustTrySectionProps) {
  const { language } = useLanguage();
  const isEn = language === 'en';

  if (!foods || foods.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-black text-[#F26B3A] uppercase tracking-wider font-display">
            <Flame className="w-4 h-4 fill-[#F26B3A]" />
            <span>{isEn ? "Seven Mountains Culinary Essence" : "Tinh Hoa Ẩm Thực Bảy Núi"}</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-[#26221B] font-display mt-0.5">
            {isEn ? "Top Signature Dishes & Must-Try Spots" : "Top Đặc Sản & Quán Ăn Hot Nhất Phải Thử"}
          </h2>
        </div>
        <span className="text-xs font-bold text-[#0E8C7F] bg-[#0E8C7F]/10 px-3 py-1 rounded-full border border-[#0E8C7F]/20 hidden sm:inline-block">
          {isEn ? "Recommended Must-Try" : "Ưu Tiên Khuyên Dùng"}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {foods.map((hotItem, hidx) => {
          const priceInfo = getFoodPriceBadge(hotItem, isEn);
          const displayName = isEn && hotItem.name_en ? hotItem.name_en : hotItem.name;
          const displayDesc = isEn && hotItem.description_en
            ? hotItem.description_en
            : (hotItem.description || (isEn ? "Famous Seven Mountains signature dish with authentic traditional flavors." : "Món ăn đặc sản nức tiếng Bảy Núi với hương vị đậm đà truyền thống."));

          return (
            <div
              key={hotItem.id}
              className="group relative bg-[#FFFDF7] rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-amber-300 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
            >
              {/* Clickable Direct Thumbnail Link */}
              <Link
                href={`/places/${hotItem.slug || hotItem.id}`}
                prefetch={true}
                className="block relative h-32 sm:h-44 w-full overflow-hidden bg-slate-200 cursor-pointer"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getOptimizedImageUrl(hotItem.image_url, { width: 900, dpr: 2, quality: 'best' })}
                  alt={displayName}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

                <div className="absolute top-2 sm:top-2.5 left-2 sm:left-2.5 flex items-center gap-1">
                  <span className="px-2 sm:px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[9px] sm:text-[10px] uppercase shadow-xs flex items-center gap-1 font-display">
                    <Award className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> TOP #{hidx + 1}
                  </span>
                </div>

                <span className="absolute top-2 sm:top-2.5 right-2 sm:right-2.5 px-1.5 sm:px-2 py-0.5 rounded-md bg-[#FAF3E7]/95 text-[#26221B] font-extrabold text-[10px] sm:text-[11px] flex items-center gap-1 shadow-xs">
                  <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-400 text-amber-500" />
                  <span>{hotItem.rating}</span>
                </span>

                <div className="absolute bottom-2 sm:bottom-2.5 left-2 sm:left-3 right-2 sm:right-3 text-white">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-amber-300 font-mono truncate block">
                    {hotItem.commune}
                  </span>
                  <h3 className="font-display font-black text-xs sm:text-sm leading-tight text-white line-clamp-1 group-hover:text-amber-300 transition-colors">
                    {displayName}
                  </h3>
                </div>
              </Link>

              <div className="p-2.5 sm:p-3.5 space-y-1.5 sm:space-y-2 text-xs font-body">
                <div className="flex items-center justify-between">
                  <span className="font-display font-extrabold text-xs text-[#D9822B]">
                    {priceInfo.priceText}
                  </span>
                  {priceInfo.note && (
                    <span className="text-[10px] text-[#6B6355] italic">({priceInfo.note})</span>
                  )}
                </div>

                <p className="text-[11px] text-[#6B6355] line-clamp-2 leading-relaxed">
                  {displayDesc}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-[#26221B]/6 font-display">
                  <Link
                    href={`/places/${hotItem.slug || hotItem.id}`}
                    className="text-xs font-bold text-[#0E8C7F] hover:underline flex items-center gap-1 font-display"
                  >
                    <span>{isEn ? "View eatery" : "Xem quán"}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotItem.name + " " + hotItem.commune + " Tri Tôn")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center gap-1 transition-colors"
                  >
                    <Navigation className="w-3 h-3" />
                    <span>{isEn ? "Directions" : "Chỉ đường"}</span>
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
