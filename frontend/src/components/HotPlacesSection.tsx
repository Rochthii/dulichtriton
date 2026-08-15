"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Flame, Star, Clock, MapPin, Sparkles, Play, ChevronRight, Navigation } from "lucide-react";
import { resolveTikTokAction } from "@/lib/tiktok";
import { fetchWithCache } from "@/lib/fastCache";
import { getCategoryFallbackImage } from "@/lib/dataSanitizer";

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
  title = "TOP ĐỊA ĐIỂM HOT & NỔI TIẾNG NHẤT TRI TÔN",
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
              let img = getCategoryFallbackImage(item.category, item.name);
              if (item.image_url && typeof item.image_url === "string" && !item.image_url.includes("unsplash.com")) {
                img = item.image_url;
              } else if (Array.isArray(item.photos) && item.photos.length > 0) {
                const p0 = item.photos[0];
                const pUrl = typeof p0 === "string" ? p0 : p0?.url;
                if (pUrl && typeof pUrl === "string" && !pUrl.includes("unsplash.com")) img = pUrl;
              }

              return {
                id: item.id,
                slug: item.slug || item.id,
                name: item.name,
                commune: item.commune || "Thị trấn Tri Tôn",
                category: item.category || "Điểm đến nổi bật",
                rating: item.rating ? Number(item.rating) : 4.9,
                hot_rank: item.hot_rank || 1,
                golden_time_windows: Array.isArray(item.golden_time_windows) ? item.golden_time_windows : ["06:00–08:30", "16:00–17:30"],
                image_url: img,
                video_url: item.video_url || ""
              };
            });
          }
          return [];
        });

        if (formatted && formatted.length > 0) {
          setHotPlaces(formatted);
        } else {
          setHotPlaces([
            {
              id: "ho-ta-pa",
              slug: "ho-ta-pa",
              name: "Hồ Tà Pạ (Tuyệt Tình Cốc)",
              commune: "Xã Núi Tô",
              category: "Check-in Danh thắng",
              rating: 4.9,
              hot_rank: 1,
              golden_time_windows: ["06:30–08:30", "15:30–17:30"],
              image_url: "https://res.cloudinary.com/dhjesnejt/image/upload/f_auto,q_auto:best,w_1600,c_fill/v1786758888/tri_ton_hero/hero_ho_ta_pa.avif",
              video_url: "https://www.tiktok.com/search?q=ho%20ta%20pa%20tri%20ton"
            },
            {
              id: "ga-dot-o-thum",
              slug: "ga-dot-o-thum",
              name: "Gà Đốt Lá Chúc Ô Thum",
              commune: "Xã Ô Lâm",
              category: "Đặc sản Ẩm thực",
              rating: 4.9,
              hot_rank: 2,
              golden_time_windows: ["11:00–13:30", "17:00–19:30"],
              image_url: "https://res.cloudinary.com/dhjesnejt/image/upload/f_auto,q_auto:best,w_1600,c_fill/v1786758535/tri_ton_hero/hero_dong_thot_not.jpg",
              video_url: "https://www.tiktok.com/search?q=ga%20dot%20o%20thum"
            },
            {
              id: "cong-troi-koh-kas",
              slug: "cong-troi-koh-kas",
              name: "Cổng Trời Chùa Koh Kas",
              commune: "Xã Châu Lăng",
              category: "Check-in Biểu tượng",
              rating: 4.8,
              hot_rank: 3,
              golden_time_windows: ["06:00–08:00", "16:00–17:30"],
              image_url: "https://res.cloudinary.com/dhjesnejt/image/upload/f_auto,q_auto:best,w_1600,c_fill/v1786758533/tri_ton_hero/hero_cong_troi_koh_kas.jpg",
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
      <div className="w-full py-8 text-center text-[#6B6355] font-body">
        <Sparkles className="mx-auto h-6 w-6 animate-spin text-[#F0A32F] mb-2" />
        <span>Đang tải các địa điểm Hot nhất Tri Tôn...</span>
      </div>
    );
  }

  return (
    <section className="my-4 sm:my-6 w-full rounded-[28px] bg-gradient-to-br from-[#0E8C7F]/10 via-[#F0A32F]/5 to-[#151B34]/5 p-4 sm:p-6 border border-[#26221B]/8 shadow-[0_2px_10px_rgba(38,34,27,0.08)]">
      
      {/* Section Header */}
      <div className="flex flex-row items-end justify-between gap-3 mb-4 sm:mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F26B3A]/15 text-[#F26B3A] text-[11px] font-bold uppercase tracking-wider mb-1 font-display">
            <Flame className="h-3.5 w-3.5 fill-current" />
            <span>Top Xếp Hạng Bảy Núi</span>
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[#26221B] tracking-tight">
            {title}
          </h2>
          <p className="mt-0.5 text-xs text-[#6B6355] max-w-xl hidden sm:block font-body">
            {subtitle}
          </p>
        </div>

        <Link
          href="/places"
          className="inline-flex items-center gap-1 text-xs font-bold text-[#0E8C7F] hover:text-[#0B6B60] transition-colors shrink-0 font-display"
        >
          <span>Tất cả địa điểm</span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Grid Cards (1 Row of 3 Cards on Desktop, Touch Carousel on Mobile) */}
      <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-1 scrollbar-none sm:grid sm:grid-cols-3 sm:overflow-visible">
        {hotPlaces.map((place) => (
          <div
            key={place.id}
            className="snap-start shrink-0 w-[85vw] max-w-[310px] sm:w-auto sm:max-w-none group relative flex flex-col overflow-hidden rounded-[26px] bg-[#FFFDF7] border border-[#26221B]/8 shadow-[0_2px_10px_rgba(38,34,27,0.08)] hover:shadow-[0_10px_30px_rgba(38,34,27,0.14)] transition-all duration-300 hover:-translate-y-1 cursor-pointer"
          >
            {/* Full Card 1-Click Navigation Link */}
            <Link
              href={`/places/${place.slug || place.id}`}
              className="absolute inset-0 z-0"
              aria-label={`Xem chi tiết địa điểm ${place.name}`}
            />

            {/* Top Rank Badge */}
            <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1 px-3 py-1 rounded-full bg-[#151B34]/90 backdrop-blur-md text-[#FFD37A] font-bold text-[11px] shadow-xs border border-[#FFD37A]/30 pointer-events-none font-display">
              <Flame className="h-3 w-3 fill-[#F0A32F] text-[#F0A32F]" />
              <span>TOP #{place.hot_rank}</span>
            </div>

            {/* Rating Badge */}
            <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#0E8C7F]/90 text-white font-bold text-[11px] shadow-xs pointer-events-none font-display">
              <Star className="h-3 w-3 fill-[#FFD37A] text-[#FFD37A]" />
              <span>{place.rating}</span>
            </div>

            {/* Thumbnail Image */}
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 pointer-events-none">
              <img
                src={place.image_url}
                alt={place.name}
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#26221B]/80 via-transparent to-transparent" />
              
              <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#FFD37A] px-2 py-0.5 rounded-full bg-[#151B34]/80 inline-block mb-1 font-display">
                  {place.category}
                </span>
                <h3 className="font-display text-base font-bold line-clamp-1 group-hover:text-[#FFD37A] transition-colors drop-shadow text-[#FFFDF7]">
                  {place.name}
                </h3>
              </div>
            </div>

            {/* Content Body */}
            <div className="flex flex-1 flex-col justify-between p-4 space-y-2.5 pointer-events-none font-body">
              <div className="space-y-1.5 text-xs text-[#6B6355]">
                <div className="flex items-center gap-1 text-[#26221B] text-[11px]">
                  <MapPin className="h-3.5 w-3.5 text-[#0E8C7F] shrink-0" />
                  <span className="font-semibold">{place.commune}</span>
                </div>

                {place.golden_time_windows && place.golden_time_windows.length > 0 && (
                  <div className="flex items-center gap-1.5 text-[#D9822B] bg-[#FAF3E7] rounded-xl px-2.5 py-1 border border-[#26221B]/8 text-[11px] font-medium font-note text-xs">
                    <Clock className="h-3 w-3 text-[#D9822B] shrink-0" />
                    <span className="truncate">{place.golden_time_windows.join(" • ")}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1.5 border-t border-[#26221B]/6 pointer-events-auto relative z-10 font-display">
                <Link
                  href={`/places/${place.slug || place.id}`}
                  className="flex-1 text-center py-2 px-3 rounded-full bg-[#F0A32F] hover:bg-[#C97F1B] text-[#26221B] hover:text-white font-bold text-xs transition-colors shadow-2xs active:scale-95"
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
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-transparent border border-[#26221B]/20 hover:border-[#F26B3A] hover:text-[#F26B3A] text-[#26221B] font-bold text-[11px] transition-all shadow-2xs shrink-0 active:scale-95"
                      title={`Mở video TikTok review: ${place.name}`}
                    >
                      <Play className="h-3 w-3 fill-current shrink-0" />
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
