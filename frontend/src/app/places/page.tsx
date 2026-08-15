"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import PlaceCard, { Place } from "@/components/PlaceCard";
import localMasterPois from "@/data/triton_pois_full.json";
import { getOptimizedImageUrl } from "@/lib/imageOptimizer";
import { fetchWithCache } from "@/lib/fastCache";
import {
  MapPin,
  Clock,
  Play,
  ChevronRight,
  Star,
  Sparkles,
  Navigation,
  Compass,
  Users,
  Search,
  Filter,
  Flame,
  Award
} from "lucide-react";

type AudienceFilter = "all" | "night" | "youth" | "family" | "trekking" | "spiritual";

export default function PlacesPage() {
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [selectedCommune, setSelectedCommune] = useState("Tất cả");
  const [activeAudience, setActiveAudience] = useState<AudienceFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [tiktokOnlyFilter, setTiktokOnlyFilter] = useState(false);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLivePlaces() {
      try {
        const rawData = await fetchWithCache("client-all-places-catalog-v1", async () => {
          const { data, error } = await supabase
            .from("places")
            .select("*")
            .eq("is_active", true)
            .order("rating", { ascending: false });
          if (!error && data && data.length > 0) return data;
          return localMasterPois as any[];
        });

        if (rawData && rawData.length > 0) {
          const list: Place[] = (rawData as any[]).map((p) => ({
            ...p,
            is_hot: Boolean(p.is_hot) || Boolean(p.rating && Number(p.rating) >= 4.8),
            open_late: Boolean(p.open_late),
          }));

          list.sort((a, b) => {
            if (a.is_hot && !b.is_hot) return -1;
            if (!a.is_hot && b.is_hot) return 1;
            return (b.rating || 0) - (a.rating || 0);
          });

          setPlaces(list);
        } else {
          fallbackToLocalMaster();
        }
      } catch (err) {
        console.warn("Fetch places error, fallback:", err);
        fallbackToLocalMaster();
      } finally {
        setLoading(false);
      }
    }

    function fallbackToLocalMaster() {
      const list: Place[] = (localMasterPois as any[]).map((p) => ({
        ...p,
        is_hot: Boolean(p.is_hot) || Boolean(p.rating && Number(p.rating) >= 4.8),
        open_late: Boolean(p.open_late),
      }));

      list.sort((a, b) => {
        if (a.is_hot && !b.is_hot) return -1;
        if (!a.is_hot && b.is_hot) return 1;
        return (b.rating || 0) - (a.rating || 0);
      });

      setPlaces(list);
    }

    loadLivePlaces();
  }, []);

  // Top 4 Spotlight Hot Places
  const topSpotlightPlaces = useMemo(() => {
    return places.slice(0, 4);
  }, [places]);

  // 100% Dynamic Commune List from Live Data
  const communes = useMemo(() => {
    const set = new Set<string>();
    places.forEach((p) => {
      if (p.commune && p.commune.trim()) set.add(p.commune.trim());
    });
    return ["Tất cả", ...Array.from(set).sort((a, b) => a.localeCompare(b, "vi"))];
  }, [places]);

  // 100% Dynamic Categories from Live Data
  const categories = useMemo(() => {
    const set = new Set<string>();
    places.forEach((p) => {
      const cat = p.tourism_category || p.category;
      if (cat && cat.trim()) set.add(cat.trim());
    });
    return ["Tất cả", ...Array.from(set).sort((a, b) => a.localeCompare(b, "vi"))];
  }, [places]);

  // Real-time filtering across POIs
  const filteredPlaces = useMemo(() => {
    return places.filter((p) => {
      const name = (p.name || "").toLowerCase();
      const desc = (p.description || "").toLowerCase();
      const q = searchQuery.toLowerCase().trim();

      // Search keyword filter
      if (q && !name.includes(q) && !desc.includes(q) && !(p.commune || "").toLowerCase().includes(q)) {
        return false;
      }

      // TikTok video filter
      if (tiktokOnlyFilter && (!p.video_url || !p.video_url.includes("tiktok"))) {
        return false;
      }

      // Commune filter
      if (selectedCommune !== "Tất cả" && p.commune !== selectedCommune) {
        return false;
      }

      // Category filter
      if (activeCategory !== "Tất cả") {
        const cat = (p.tourism_category || p.category || "").toLowerCase();
        if (!cat.includes(activeCategory.toLowerCase())) {
          return false;
        }
      }

      // Audience filters
      if (activeAudience === "night" && !p.open_late) return false;
      if (activeAudience === "trekking" && !name.includes("núi") && !name.includes("hồ") && !name.includes("đồi")) return false;
      if (activeAudience === "spiritual" && !name.includes("chùa") && !name.includes("miếu") && !name.includes("tâm linh")) return false;

      return true;
    });
  }, [places, searchQuery, tiktokOnlyFilter, selectedCommune, activeCategory, activeAudience]);

  return (
    <div className="min-h-screen bg-[#FAF3E7] font-body text-[#26221B]">
      {/* Background Graphic Accents */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-emerald-300/15 blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-[30rem] h-[30rem] rounded-full bg-amber-300/15 blur-3xl" />
      </div>

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10 space-y-8">
        {/* Banner Section */}
        <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#0E8C7F] to-[#085A52] p-6 text-white shadow-md md:p-10 border border-[#0B6B60]">
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FFD37A]/20 px-3 py-1 text-xs font-black text-[#FFD37A] uppercase tracking-wider backdrop-blur-xs font-display">
              <Compass className="h-3.5 w-3.5" />
              <span>149 Tọa Độ Du Lịch Bảy Núi Đã Xác Minh</span>
            </div>
            <h1 className="font-display text-2xl md:text-4xl font-extrabold tracking-tight text-[#FFFDF7] leading-tight">
              Khám Phá Danh Thắng & Di Tích Tri Tôn
            </h1>
            <p className="text-xs md:text-sm text-white/85 leading-relaxed font-body">
              Tra cứu đầy đủ 149 địa điểm: Hồ nước trên núi, ngôi chùa Khmer cổ kính, danh thắng thiên nhiên, ẩm thực đặc sản và tọa độ check-in tuyệt đẹp.
            </p>
          </div>
        </section>

        {/* 🌟 TOP 4 KỲ QUAN & TỌA ĐỘ CHECK-IN HOT NHẤT (HOT SPOTLIGHT) 🌟 */}
        {topSpotlightPlaces.length > 0 && !searchQuery && selectedCommune === "Tất cả" && activeCategory === "Tất cả" && activeAudience === "all" && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-black text-[#F26B3A] uppercase tracking-wider font-display">
                  <Flame className="w-4 h-4 fill-[#F26B3A]" />
                  <span>Điểm Đến Nổi Bật Nhất</span>
                </div>
                <h2 className="text-xl md:text-2xl font-black text-[#26221B] font-display mt-0.5">
                  Top Kỳ Quan & Tọa Độ Check-in Hot Nhất
                </h2>
              </div>
              <span className="text-xs font-bold text-[#0E8C7F] bg-[#0E8C7F]/10 px-3 py-1 rounded-full border border-[#0E8C7F]/20 hidden sm:inline-block">
                Ưu Tiên Check-in
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
              {topSpotlightPlaces.map((hotPlace, pidx) => (
                <div
                  key={hotPlace.id}
                  className="group relative bg-[#FFFDF7] rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-emerald-400/40 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div className="relative h-32 sm:h-44 w-full overflow-hidden bg-slate-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getOptimizedImageUrl(hotPlace.image_url || "https://images.unsplash.com/photo-1506744038136-46273834b3fb", { width: 900, dpr: 2, quality: 'best' })}
                      alt={hotPlace.name}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-black text-[10px] uppercase shadow-xs flex items-center gap-1 font-display">
                        <Award className="w-3 h-3 text-amber-300" /> TOP #{pidx + 1}
                      </span>
                    </div>

                    <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-[#FAF3E7]/95 text-[#26221B] font-extrabold text-[11px] flex items-center gap-1 shadow-xs">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                      <span>{hotPlace.rating || 4.9}</span>
                    </span>

                    <div className="absolute bottom-2.5 left-3 right-3 text-white">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-amber-300 font-mono">
                        {hotPlace.commune}
                      </span>
                      <h3 className="font-display font-black text-sm leading-tight text-white line-clamp-1">
                        {hotPlace.name}
                      </h3>
                    </div>
                  </div>

                  <div className="p-3.5 space-y-2 text-xs">
                    <p className="text-[11px] text-[#6B6355] line-clamp-2 leading-relaxed">
                      {hotPlace.description || "Tọa độ danh thắng tiêu biểu tại Tri Tôn với khung cảnh thiên nhiên tuyệt đẹp."}
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-[#26221B]/6">
                      <Link
                        href={`/places/${hotPlace.slug || hotPlace.id}`}
                        className="text-xs font-bold text-[#0E8C7F] hover:underline flex items-center gap-1 font-display"
                      >
                        <span>Chi tiết</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotPlace.name + " " + hotPlace.commune + " Tri Tôn")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center gap-1 transition-colors"
                      >
                        <Navigation className="w-3 h-3" />
                        <span>Chỉ đường</span>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Filter & Search Bar */}
        <section className="bg-[#FFFDF7] p-4 md:p-6 rounded-3xl border border-[#26221B]/8 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-[#6B6355] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm theo tên địa điểm, xã, câu chuyện sự tích..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#FAF3E7] border border-[#26221B]/10 text-xs font-medium text-[#26221B] placeholder-[#6B6355]/70 focus:outline-none focus:border-[#0E8C7F]"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <button
                onClick={() => setTiktokOnlyFilter(!tiktokOnlyFilter)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  tiktokOnlyFilter
                    ? "bg-rose-600 text-white shadow-xs"
                    : "bg-[#FAF3E7] text-[#6B6355] hover:bg-rose-50 hover:text-rose-700 border border-[#26221B]/10"
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Có Video TikTok</span>
              </button>
            </div>
          </div>

          {/* Quick Audience Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-bold text-[#6B6355] whitespace-nowrap mr-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Chủ Đề:
            </span>
            {[
              { id: "all", label: "Tất Cả" },
              { id: "night", label: "Tri Tôn Về Đêm 🌙" },
              { id: "youth", label: "Giới Trẻ Check-in 📸" },
              { id: "family", label: "Gia Đình & Nghỉ Dưỡng 👨‍👩‍👧" },
              { id: "trekking", label: "Leo Núi Săn Mây 🏔️" },
              { id: "spiritual", label: "Hành Hương Tâm Linh 🛕" },
            ].map((chip) => (
              <button
                key={chip.id}
                onClick={() => setActiveAudience(chip.id as AudienceFilter)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeAudience === chip.id
                    ? "bg-[#0E8C7F] text-white shadow-xs"
                    : "bg-[#FAF3E7] text-[#6B6355] hover:bg-[#FAF3E7]/80 border border-[#26221B]/8"
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Communes Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-t border-[#26221B]/5 pt-3">
            <span className="text-xs font-bold text-[#6B6355] whitespace-nowrap mr-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#0E8C7F]" /> Khu Vực:
            </span>
            {communes.map((commune) => (
              <button
                key={commune}
                onClick={() => setSelectedCommune(commune)}
                className={`whitespace-nowrap px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                  selectedCommune === commune
                    ? "bg-[#26221B] text-[#FAF3E7] shadow-xs"
                    : "bg-[#FAF3E7] text-[#6B6355] hover:bg-[#FAF3E7]/80 border border-[#26221B]/8"
                }`}
              >
                {commune}
              </button>
            ))}
          </div>
        </section>

        {/* Places Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base md:text-lg font-black text-[#26221B] font-display flex items-center gap-2">
              <Compass className="w-5 h-5 text-[#0E8C7F]" />
              <span>Danh Sách 149 Địa Điểm Đã Xác Minh ({filteredPlaces.length} Địa Điểm)</span>
            </h2>
            <span className="text-xs text-[#6B6355] font-medium font-mono">Dữ liệu thực địa 100%</span>
          </div>

          {loading ? (
            <div className="py-16 text-center text-[#6B6355] font-bold">
              Đang tải danh mục 149 địa điểm du lịch Tri Tôn...
            </div>
          ) : filteredPlaces.length === 0 ? (
            <div className="py-16 text-center bg-[#FFFDF7] rounded-3xl border border-[#26221B]/8 p-8 space-y-3">
              <Compass className="w-8 h-8 text-[#6B6355]/40 mx-auto" />
              <div className="font-bold text-sm text-[#26221B]">Không tìm thấy địa điểm nào phù hợp.</div>
              <button
                onClick={() => {
                  setSelectedCommune("Tất cả");
                  setActiveCategory("Tất cả");
                  setActiveAudience("all");
                  setSearchQuery("");
                }}
                className="px-4 py-2 rounded-xl bg-[#0E8C7F] text-white text-xs font-bold cursor-pointer"
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-5">
              {filteredPlaces.map((place) => (
                <PlaceCard key={place.id} place={place} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
