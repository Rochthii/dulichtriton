"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Flame, Star, Clock, MapPin, Sparkles, Play, ChevronRight } from "lucide-react";

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
          const formatted = data.map((item: any) => {
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
    <section className="my-10 w-full rounded-3xl bg-gradient-to-br from-amber-500/10 via-emerald-500/5 to-slate-900/10 p-6 md:p-8 border border-amber-500/20 shadow-xl backdrop-blur-md">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-700 text-xs font-bold uppercase tracking-wider mb-2 border border-amber-500/30">
            <Flame className="h-4 w-4 text-amber-600 animate-pulse fill-amber-500" />
            <span>Xếp Hạng Đội Ngũ Phượt Bảy Núi</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            {title}
          </h2>
          <p className="mt-1 text-sm md:text-base text-slate-600 max-w-2xl">
            {subtitle}
          </p>
        </div>

        <Link
          href="/places"
          className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
        >
          <span>Xem tất cả 95 địa điểm</span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Grid Cards (Touch-Swipe Snap Carousel on Mobile) */}
      <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-2 scrollbar-none sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:overflow-visible">
        {hotPlaces.map((place) => (
          <div
            key={place.id}
            className="snap-start shrink-0 w-[82vw] max-w-[300px] sm:w-auto sm:max-w-none group relative flex flex-col overflow-hidden rounded-2xl bg-white border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            {/* Top Rank Badge */}
            <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/85 backdrop-blur-md text-amber-400 font-extrabold text-xs shadow-md border border-amber-400/40">
              <Flame className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span>TOP #{place.hot_rank} HOT</span>
            </div>

            {/* Rating Badge */}
            <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-600/90 text-white font-bold text-xs shadow-md">
              <Star className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
              <span>{place.rating}</span>
            </div>

            {/* Thumbnail Image */}
            <div className="relative h-48 w-full overflow-hidden bg-slate-100">
              <img
                src={place.image_url}
                alt={place.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/20 to-transparent" />
              
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 px-2 py-0.5 rounded bg-slate-900/60 inline-block mb-1">
                  {place.category}
                </span>
                <h3 className="text-lg font-bold line-clamp-1 group-hover:text-amber-300 transition-colors">
                  {place.name}
                </h3>
              </div>
            </div>

            {/* Content Body */}
            <div className="flex flex-1 flex-col justify-between p-4 space-y-3">
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <MapPin className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                  <span className="font-semibold">{place.commune}</span>
                </div>

                {place.golden_time_windows && place.golden_time_windows.length > 0 && (
                  <div className="flex items-start gap-1.5 text-amber-800 bg-amber-50 rounded-lg p-2 border border-amber-200/60">
                    <Clock className="h-3.5 w-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[11px]">Khung giờ vàng:</span>
                      <p className="font-medium text-[11px] text-amber-900">
                        {place.golden_time_windows.join(" • ")}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <Link
                  href={`/places/${place.slug}`}
                  className="flex-1 text-center py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-sm"
                >
                  Xem chi tiết
                </Link>

                {place.video_url && (
                  <a
                    href={place.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center p-2 rounded-xl bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-700 transition-colors"
                    title="Xem TikTok Review thực tế"
                  >
                    <Play className="h-4 w-4 fill-amber-500 text-amber-600" />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
