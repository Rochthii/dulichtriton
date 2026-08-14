"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Flame, Star, Clock, MapPin, Sparkles, Play, ChevronRight } from "lucide-react";
import { resolveTikTokAction } from "@/lib/tiktok";
import { fetchWithCache } from "@/lib/fastCache";

interface HotPlace {
  id: string;
  slug: string;
  name: string;
  commune: string;
  category: string;
  rating: number;
  hot_rank: number;
  golden_time_windows?: string[];
  image_url: string;
  video_url?: string;
}

interface HotPlacesSectionProps {
  title?: string;
  subtitle?: string;
  limit?: number;
  categoryFilter?: string;
}

export default function HotPlacesSection({
  title = "🔥 TOP ĐỊA ĐIỂM HOT & NỔI TIẾNG NHẤT TRI TÔN",
  subtitle = "Danh sách các điểm check-in, di sản và ẩm thực nổi tiếng được cộng đồng phượt Bảy Núi săn đón nhiều nhất",
  limit = 6,
  categoryFilter
}: HotPlacesSectionProps) {
  const [hotPlaces, setHotPlaces] = useState<HotPlace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHotPlaces() {
      try {
        setLoading(true);
        const cacheKey = `hot-places-sec-${limit}-${categoryFilter || "all"}`;

        const formatted = await fetchWithCache(cacheKey, async () => {
          let query = supabase
            .from("places")
            .select("id, slug, name, commune, category, rating, hot_rank, golden_time_windows, image_url, video_url, photos")
            .eq("is_hot", true)
            .order("hot_rank", { ascending: true })
            .limit(limit);

          if (categoryFilter) {
            query = query.ilike("category", `%${categoryFilter}%`);
          }

          const { data, error } = await query;

          if (!error && data && data.length > 0) {
            return data.map((item: any) => {
              let img = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop";
              if (item.image_url && typeof item.image_url === "string" && item.image_url.startsWith("http")) {
                img = item.image_url;
              } else if (Array.isArray(item.photos) && item.photos.length > 0) {
                const p0 = item.photos[0];
                if (typeof p0 === "string" && p0.startsWith("http")) img = p0;
                else if (p0 && typeof p0 === "object" && p0.url) img = p0.url;
              }

              return {
                id: item.id,
                slug: item.slug || item.id,
                name: item.name,
                commune: item.commune || "Tri Tôn",
                category: item.category || "Địa điểm HOT",
                rating: item.rating || 4.8,
                hot_rank: item.hot_rank || 1,
                golden_time_windows: item.golden_time_windows || ["06:00 - 18:00"],
                image_url: img,
                video_url: item.video_url || `https://www.tiktok.com/search?q=${encodeURIComponent(item.name)}`
              };
            });
          }
          return null;
        });

        if (formatted && formatted.length > 0) {
          setHotPlaces(formatted);
        } else {
          // Fallback verified top hot places
          setHotPlaces([
            {
              id: "PL001",
              slug: "ho-ta-pa",
              name: "Hồ Tà Pạ (Tuyệt Tình Cốc)",
              commune: "Xã Núi Tô",
              category: "Hồ nước & Sinh thái",
              rating: 4.7,
              hot_rank: 1,
              golden_time_windows: ["05:30–07:00", "16:00–17:30"],
              image_url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop",
              video_url: "https://www.tiktok.com/search?q=H%E1%BB%93%20T%C3%A0%20P%E1%BA%A1"
            },
            {
              id: "PL010",
              slug: "doi-tuc-dup",
              name: "Khu Du Lịch Đồi Tức Dụp",
              commune: "Xã An Tức",
              category: "Di tích lịch sử",
              rating: 4.6,
              hot_rank: 2,
              golden_time_windows: ["07:00–16:00"],
              image_url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1200&auto=format&fit=crop",
              video_url: "https://www.tiktok.com/search?q=%C4%90%E1%BB%93i%20T%E1%BB%A9c%20D%E1%BB%A5p"
            },
            {
              id: "CK010",
              slug: "cong-troi-koh-kas",
              name: "Cổng Trời Tri Tôn (Koh Kas)",
              commune: "Xã Châu Lăng",
              category: "Check-in Biểu tượng",
              rating: 4.8,
              hot_rank: 3,
              golden_time_windows: ["06:00–08:00", "16:00–17:30"],
              image_url: "https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=1200&auto=format&fit=crop",
              video_url: "https://www.tiktok.com/search?q=cong%20troi%20koh%20kas"
            }
          ]);
        }
      } catch (err) {
        console.error("Error loading hot places:", err);
      } finally {
        setLoading(false);
      }
    }

    loadHotPlaces();
  }, [limit, categoryFilter]);

  if (loading) {
    return (
      <div className="w-full py-8 text-center text-slate-500">
        <Sparkles className="mx-auto h-6 w-6 animate-spin text-amber-500 mb-2" />
        <span>Đang tải các địa điểm Hot nhất Tri Tôn...</span>
      </div>
    );
  }

  return (
    <section className="my-4 sm:my-6 w-full rounded-3xl bg-gradient-to-br from-amber-500/10 via-emerald-500/5 to-slate-900/10 p-4 sm:p-6 border border-amber-500/20 shadow-lg backdrop-blur-md">
      
      {/* Section Header */}
      <div className="flex flex-row items-end justify-between gap-3 mb-4 sm:mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-800 text-[11px] font-bold uppercase tracking-wider mb-1 border border-amber-500/30">
            <Flame className="h-3.5 w-3.5 text-amber-600 animate-pulse fill-amber-500" />
            <span>Top Xếp Hạng Bảy Núi</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {title}
          </h2>
          <p className="mt-0.5 text-xs text-slate-600 max-w-xl hidden sm:block">
            {subtitle}
          </p>
        </div>

        <Link
          href="/places"
          className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-900 transition-colors shrink-0"
        >
          <span>Tất cả địa điểm</span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Grid Cards (1 Row of 3 Cards on Desktop, Touch Carousel on Mobile) */}
      <div className="flex overflow-x-auto snap-x snap-mandatory gap-3.5 pb-1 scrollbar-none sm:grid sm:grid-cols-3 sm:overflow-visible">
        {hotPlaces.map((place) => (
          <div
            key={place.id}
            className="snap-start shrink-0 w-[85vw] max-w-[310px] sm:w-auto sm:max-w-none group relative flex flex-col overflow-hidden rounded-3xl bg-white border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
          >
            {/* Full Card 1-Click Navigation Link */}
            <Link
              href={`/places/${place.slug || place.id}`}
              className="absolute inset-0 z-0"
              aria-label={`Xem chi tiết địa điểm ${place.name}`}
            />

            {/* Top Rank Badge */}
            <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-900/85 backdrop-blur-md text-amber-400 font-extrabold text-[11px] shadow-md border border-amber-400/40 pointer-events-none">
              <Flame className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span>TOP #{place.hot_rank}</span>
            </div>

            {/* Rating Badge */}
            <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-700/90 text-white font-bold text-[11px] shadow-md pointer-events-none">
              <Star className="h-3 w-3 fill-amber-300 text-amber-300" />
              <span>{place.rating}</span>
            </div>

            {/* Thumbnail Image */}
            <div className="relative h-40 sm:h-44 w-full overflow-hidden bg-slate-100 pointer-events-none">
              <img
                src={place.image_url}
                alt={place.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/20 to-transparent" />
              
              <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 px-2 py-0.5 rounded bg-slate-900/70 inline-block mb-1">
                  {place.category}
                </span>
                <h3 className="text-base font-extrabold line-clamp-1 group-hover:text-amber-300 transition-colors drop-shadow">
                  {place.name}
                </h3>
              </div>
            </div>

            {/* Content Body */}
            <div className="flex flex-1 flex-col justify-between p-3.5 space-y-2.5 pointer-events-none">
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-1 text-slate-700 text-[11px]">
                  <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span className="font-semibold">{place.commune}</span>
                </div>

                {place.golden_time_windows && place.golden_time_windows.length > 0 && (
                  <div className="flex items-center gap-1.5 text-amber-900 bg-amber-50/90 rounded-lg px-2 py-1 border border-amber-200/60 text-[10px] font-medium">
                    <Clock className="h-3 w-3 text-amber-600 shrink-0" />
                    <span className="truncate">{place.golden_time_windows.join(" • ")}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1.5 border-t border-slate-100 pointer-events-auto relative z-10">
                <Link
                  href={`/places/${place.slug || place.id}`}
                  className="flex-1 text-center py-2 px-3 rounded-xl bg-[#1B4D3E] hover:bg-[#143B2F] text-white font-bold text-xs transition-colors shadow-xs active:scale-95"
                >
                  Xem chi tiết
                </Link>

                {(() => {
                  const tiktok = resolveTikTokAction({
                    placeName: place.name,
                    commune: place.commune,
                    directVideoUrl: place.video_url,
                  });
                  return (
                    <a
                      href={tiktok.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-rose-600 text-white font-extrabold text-[11px] transition-all shadow-xs shrink-0 active:scale-95 border border-slate-800 hover:border-rose-500"
                      title={`Mở ứng dụng TikTok tìm kiếm video review: ${place.name}`}
                    >
                      <Play className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" />
                      <span>TikTok</span>
                    </a>
                  );
                })()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
