'use client';

import React from 'react';
import Link from 'next/link';
import { Flame, Award, Star, Phone, Navigation, ChevronRight } from 'lucide-react';
import { getOptimizedImageUrl } from '@/lib/imageOptimizer';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export interface StayItem {
  id: string;
  slug: string;
  name: string;
  name_en?: string;
  category: string;
  subcategory?: string;
  tourism_category?: string;
  commune: string;
  rating?: number;
  image_url: string;
  video_url?: string;
  address?: string;
  phone?: string;
  hotline?: string;
  price_level?: string;
  description?: string;
  description_en?: string;
  detailed_story?: string;
  detailed_story_en?: string;
  amenities?: string[];
  stay_type?: "homestay" | "hotel" | "camping" | "motel";
  is_hot?: boolean;
}

interface StayTopSpotlightProps {
  stays: StayItem[];
}

export default function StayTopSpotlight({ stays }: StayTopSpotlightProps) {
  const { language } = useLanguage();
  const isEn = language === 'en';

  if (!stays || stays.length === 0) return null;

  return (
    <section className="space-y-4 font-body">
      <div className="flex items-center justify-between font-display">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-black text-[#F26B3A] uppercase tracking-wider">
            <Flame className="w-4 h-4 fill-[#F26B3A]" />
            <span>{isEn ? "Featured Stays" : "Không Gian Lưu Trú Tiêu Biểu"}</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-[#26221B] mt-0.5">
            {isEn ? "Top Homestays & Relaxing Hotels in Tri Ton" : "Top Homestay & Khách Sạn Nghỉ Dưỡng Hot Nhất"}
          </h2>
        </div>
        <span className="text-xs font-bold text-[#0E8C7F] bg-[#0E8C7F]/10 px-3 py-1 rounded-full border border-[#0E8C7F]/20 hidden sm:inline-block">
          {isEn ? "Recommended Stays" : "Khuyên Dùng"}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stays.map((hotStay, hidx) => {
          const displayName = isEn && hotStay.name_en ? hotStay.name_en : hotStay.name;
          const displayDesc = isEn && hotStay.description_en ? hotStay.description_en : hotStay.description;

          return (
            <div
              key={hotStay.id}
              className="group relative bg-[#FFFDF7] rounded-3xl overflow-hidden border-2 border-amber-300/90 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <Link
                  href={`/places/${hotStay.slug || hotStay.id}`}
                  className="block relative h-48 w-full overflow-hidden bg-slate-200 cursor-pointer"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getOptimizedImageUrl(hotStay.image_url, { width: 800, dpr: 2, quality: 'best' })}
                    alt={displayName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  <div className="absolute top-3 left-3 flex items-center gap-1 font-display">
                    <span className="px-2.5 py-1 rounded-xl bg-amber-500 text-slate-950 font-black text-[10px] uppercase shadow-xs flex items-center gap-1">
                      <Award className="w-3 h-3" /> TOP #{hidx + 1}
                    </span>
                  </div>

                  <span className="absolute top-3 right-3 px-2 py-0.5 rounded-lg bg-[#FAF3E7]/95 text-[#26221B] font-extrabold text-xs flex items-center gap-1 shadow-xs font-display">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                    <span>{hotStay.rating || 4.8}</span>
                  </span>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 font-mono block">
                      {hotStay.commune}
                    </span>
                    <h3 className="font-display font-black text-base leading-snug text-white line-clamp-1 group-hover:text-amber-300 transition-colors">
                      {displayName}
                    </h3>
                  </div>
                </Link>

                <div className="p-4 space-y-2 text-xs text-[#6B6355]">
                  <p className="text-xs text-[#6B6355] line-clamp-2 leading-relaxed">
                    {displayDesc || (isEn ? "Ideal accommodation coordinate for vacation in Tri Ton." : "Không gian lưu trú lý tưởng cho chuyến nghỉ dưỡng tại Tri Tôn.")}
                  </p>
                </div>
              </div>

              <div className="p-4 pt-0 border-t border-[#26221B]/6 flex items-center justify-between font-display">
                <Link
                  href={`/places/${hotStay.slug || hotStay.id}`}
                  className="text-xs font-bold text-[#0E8C7F] hover:underline flex items-center gap-1"
                >
                  <span>{isEn ? "View details" : "Xem chi tiết"}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>

                <div className="flex items-center gap-1.5">
                  {hotStay.phone && (
                    <a
                      href={`tel:${hotStay.phone}`}
                      title={isEn ? "Call to book" : "Gọi đặt phòng"}
                      className="p-1.5 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-colors"
                    >
                      <Phone className="w-3 h-3 text-amber-700" />
                    </a>
                  )}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotStay.name + " " + hotStay.commune + " Tri Tôn")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1 transition-colors"
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
