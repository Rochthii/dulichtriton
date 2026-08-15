"use client";

import { useEffect, useState, useMemo } from "react";
import { Landmark, MapPin, Calendar, Compass, Clock, Star, Sparkles, ChevronRight, Award, ShieldCheck, Flame, Navigation } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import localMasterPois from "@/data/triton_pois_full.json";
import { getOptimizedImageUrl } from "@/lib/imageOptimizer";
import { fetchWithCache } from "@/lib/fastCache";

interface CulturePlace {
  id: string;
  slug: string;
  name: string;
  category: string;
  tourism_category: string;
  commune: string;
  rating?: number;
  image_url: string;
  description?: string;
  is_hot?: boolean;
}

export default function CulturePage() {
  const [cultures, setCultures] = useState<CulturePlace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    function processCultureData(json: any) {
      const data = json?.culture || [];
      if (data && data.length > 0) {
        const formatted = data.map((item: any) => {
          let img = "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1200&auto=format&fit=crop";
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
            category: item.category || "culture",
            tourism_category: item.tourism_category || "Văn Hóa & Di Tích",
            commune: item.commune || "Thị trấn Tri Tôn",
            rating: item.rating ? Number(item.rating) : 4.9,
            image_url: img,
            description: item.description || "",
            is_hot: !!item.is_hot || (item.rating && item.rating >= 4.8),
          };
        });

        formatted.sort((a: CulturePlace, b: CulturePlace) => {
          if (a.is_hot && !b.is_hot) return -1;
          if (!a.is_hot && b.is_hot) return 1;
          return (b.rating || 0) - (a.rating || 0);
        });

        setCultures(formatted);
      }
    }

    async function loadLiveCultureData() {
      try {
        const json = await fetchWithCache(
          "client-culture-catalog-v1",
          async () => {
            const res = await fetch("/api/v1/culture?limit=100");
            return await res.json();
          },
          60 * 60 * 1000,
          (freshJson) => {
            // Reactive SWR: Updates UI in real-time when fresh data arrives!
            processCultureData(freshJson);
          }
        );

        processCultureData(json);
      } catch (err) {
        console.warn("API fetch failed, using local master:", err);
        fallbackToLocalMaster();
      } finally {
        setLoading(false);
      }
    }

    function fallbackToLocalMaster() {
      const list = (localMasterPois as any[])
        .filter(
          (p) =>
            p.category === "culture" ||
            p.category === "spiritual" ||
            p.category === "history" ||
            (p.tourism_category && (p.tourism_category.includes("Văn Hóa") || p.tourism_category.includes("Di Tích") || p.tourism_category.includes("Chùa"))) ||
            (p.id && (p.id.startsWith("CH") || p.id.startsWith("DT") || p.id.startsWith("VH")))
        )
        .map((p) => ({
          id: p.id,
          slug: p.slug || p.id,
          name: p.name,
          category: p.category || "culture",
          tourism_category: p.tourism_category || "Văn Hóa & Di Tích",
          commune: p.commune || "Thị trấn Tri Tôn",
          rating: p.rating ? Number(p.rating) : 4.9,
          image_url: p.image_url || "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1200&auto=format&fit=crop",
          description: p.description || "",
          is_hot: !!p.is_hot || (p.rating && p.rating >= 4.8),
        }));

      list.sort((a, b) => {
        if (a.is_hot && !b.is_hot) return -1;
        if (!a.is_hot && b.is_hot) return 1;
        return (b.rating || 0) - (a.rating || 0);
      });

      setCultures(list);
    }

    loadLiveCultureData();
  }, []);

  const topHotCultures = useMemo(() => {
    return cultures.slice(0, 3);
  }, [cultures]);

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF3E7] font-body text-[#26221B] antialiased">
      {/* Background Graphic Accents */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-emerald-300/15 blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-[30rem] h-[30rem] rounded-full bg-amber-300/15 blur-3xl" />
      </div>

      <main className="relative z-10 mx-auto w-full max-w-7xl flex-grow flex-col space-y-8 px-4 py-8 md:px-6 md:py-10">
        {/* Header Hero Section */}
        <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#0E8C7F] to-[#085A52] p-6 text-white shadow-md md:p-10 border border-[#0B6B60]">
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FFD37A]/20 px-3 py-1 text-xs font-black text-[#FFD37A] uppercase tracking-wider backdrop-blur-xs font-display">
              <Landmark className="h-3.5 w-3.5" />
              <span>Di Sản Văn Hóa & Lịch Sử Bản Địa Bảy Núi</span>
            </div>
            <h1 className="font-display text-2xl md:text-4xl font-extrabold tracking-tight text-[#FFFDF7] leading-tight">
              Di Tích Lịch Sử & Chùa Khmer Cổ Kính
            </h1>
            <p className="text-xs md:text-sm text-white/85 leading-relaxed font-body">
              Chiêm ngưỡng các ngôi chùa Khmer Nam Tông cổ kính, di sản kinh lá buông, di tích lịch sử Đồi Tức Dụp, Căn cứ Ô Tà Sóc và Lễ hội Đua Bò Bảy Núi truyền thống.
            </p>
          </div>
        </section>

        {/* 🌟 TOP DI SẢN & NGÔI CHÙA KHMER TIÊU BIỂU NHẤT (SPOTLIGHT) 🌟 */}
        {topHotCultures.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-black text-[#F26B3A] uppercase tracking-wider font-display">
                  <Flame className="w-4 h-4 fill-[#F26B3A]" />
                  <span>Di Sản Quốc Gia Tiêu Biểu</span>
                </div>
                <h2 className="text-xl md:text-2xl font-black text-[#26221B] font-display mt-0.5">
                  Top Di Tích & Ngôi Chùa Khmer Cổ Kính Nhất
                </h2>
              </div>
              <span className="text-xs font-bold text-[#0E8C7F] bg-[#0E8C7F]/10 px-3 py-1 rounded-full border border-[#0E8C7F]/20 hidden sm:inline-block">
                Hành Hương & Chiêm Bái
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-5">
              {topHotCultures.map((hotCulture, cidx) => (
                <div
                  key={hotCulture.id}
                  className="group relative bg-[#FFFDF7] rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-amber-300 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div className="relative h-32 sm:h-48 w-full overflow-hidden bg-slate-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getOptimizedImageUrl(hotCulture.image_url, { width: 900, dpr: 2, quality: 'best' })}
                      alt={hotCulture.name}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

                    <div className="absolute top-2 sm:top-2.5 left-2 sm:left-2.5 flex items-center gap-1">
                      <span className="px-2 sm:px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[9px] sm:text-[10px] uppercase shadow-xs flex items-center gap-1 font-display">
                        <Award className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> TOP #{cidx + 1}
                      </span>
                    </div>

                    <span className="absolute top-2 sm:top-2.5 right-2 sm:right-2.5 px-1.5 sm:px-2 py-0.5 rounded-md bg-[#FAF3E7]/95 text-[#26221B] font-extrabold text-[10px] sm:text-[11px] flex items-center gap-1 shadow-xs">
                      <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-400 text-amber-500" />
                      <span>{hotCulture.rating}</span>
                    </span>

                    <div className="absolute bottom-2 sm:bottom-2.5 left-2 sm:left-3 right-2 sm:right-3 text-white">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-amber-300 font-mono truncate block">
                        {hotCulture.commune}
                      </span>
                      <h3 className="font-display font-black text-xs sm:text-sm leading-tight text-white line-clamp-1">
                        {hotCulture.name}
                      </h3>
                    </div>
                  </div>

                  <div className="p-2.5 sm:p-4 space-y-1.5 sm:space-y-2.5 text-[10px] sm:text-xs">
                    <p className="text-[10px] sm:text-[11px] text-[#6B6355] line-clamp-2 leading-relaxed">
                      {hotCulture.description || "Di sản văn hóa tâm linh lâu đời mang đậm kiến trúc nghệ thuật Khmer độc đáo."}
                    </p>
                  </div>

                  <div className="p-2.5 sm:p-4 pt-0 border-t border-[#26221B]/5 mt-1 sm:mt-2 flex items-center justify-between gap-1.5 sm:gap-2">
                    <Link
                      href={`/places/${hotCulture.slug || hotCulture.id}`}
                      className="flex-1 py-1.5 sm:py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[10px] sm:text-xs text-center transition-colors shadow-2xs font-display"
                    >
                      Xem Sự Tích
                    </Link>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotCulture.name + " " + hotCulture.commune + " Tri Tôn")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 sm:p-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 transition-colors shrink-0"
                      title="Chỉ đường"
                    >
                      <Navigation className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Live Culture Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-xl font-black text-[#26221B] font-display flex items-center gap-2">
              <Landmark className="w-5 h-5 text-[#0E8C7F]" />
              <span>Toàn Bộ Danh Sách Di Tích & Chùa Chiền ({cultures.length} Địa Điểm)</span>
            </h2>
            <span className="text-xs text-[#6B6355] font-medium font-mono hidden sm:inline">Dữ liệu thực địa 100%</span>
          </div>

          {loading ? (
            <div className="py-16 text-center text-[#6B6355] font-bold text-sm">
              Đang tải danh sách di tích văn hóa...
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6">
              {cultures.map((culture) => (
                <div
                  key={culture.id}
                  className="group bg-[#FFFDF7] rounded-2xl sm:rounded-3xl overflow-hidden border border-[#26221B]/8 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-32 sm:h-52 overflow-hidden bg-slate-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getOptimizedImageUrl(culture.image_url, { width: 800, dpr: 2, quality: 'best' })}
                        alt={culture.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="absolute top-2 sm:top-3 left-2 sm:left-3 px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg sm:rounded-xl bg-slate-900/80 backdrop-blur-md text-white font-bold text-[9px] sm:text-xs">
                        {culture.tourism_category}
                      </div>
                      <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-lg sm:rounded-xl bg-white/90 text-amber-600 font-extrabold text-[10px] sm:text-[11px] shadow-sm">
                        <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-amber-400 text-amber-400" />
                        {culture.rating}
                      </div>
                    </div>

                    <div className="p-2.5 sm:p-5 space-y-1.5 sm:space-y-3 text-[10px] sm:text-xs">
                      <div className="flex items-center gap-1 text-emerald-800 font-bold">
                        <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{culture.commune}</span>
                      </div>

                      <h3 className="font-display text-xs sm:text-base font-extrabold text-[#26221B] group-hover:text-emerald-800 transition-colors line-clamp-1">
                        {culture.name}
                      </h3>

                      {culture.description && (
                        <p className="text-[10px] sm:text-xs text-[#6B6355] line-clamp-2 leading-relaxed">
                          {culture.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-2.5 sm:p-5 pt-0 border-t border-[#26221B]/5 mt-1 sm:mt-2 flex items-center justify-between gap-1.5 sm:gap-2">
                    <Link
                      href={`/places/${culture.slug || culture.id}`}
                      className="flex-1 py-1.5 sm:py-2.5 rounded-xl bg-[#0E8C7F] hover:bg-[#085A52] text-white text-center font-bold text-[10px] sm:text-xs transition-colors shadow-2xs"
                    >
                      Xem Chi Tiết
                    </Link>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(culture.name + " " + culture.commune + " Tri Tôn")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 sm:p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition-colors shrink-0"
                      title="Chỉ đường Google Maps"
                    >
                      <Navigation className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
