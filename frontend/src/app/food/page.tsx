"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Utensils, MapPin, Star, Flame, ChevronRight, Clock, Search, Moon, Phone, Navigation, Play, Sparkles, Award } from "lucide-react";
import localMasterPois from "@/data/triton_pois_full.json";
import { getOptimizedImageUrl } from "@/lib/imageOptimizer";
import { fetchWithCache } from "@/lib/fastCache";

interface FoodItem {
  id: string;
  slug: string;
  name: string;
  category: string;
  tourism_category: string;
  commune: string;
  rating: number;
  image_url: string;
  video_url?: string;
  hours: string;
  description?: string;
  open_late?: boolean;
  night_hours?: string;
  phone?: string;
  price_level?: string;
  address?: string;
  is_hot?: boolean;
}

export default function FoodPage() {
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [selectedCommune, setSelectedCommune] = useState("Tất cả");
  const [nightOnly, setNightOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    function processFoodData(json: any) {
      if (json?.food && json.food.length > 0) {
        const formatted = json.food.map((item: any) => {
          let img = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop";
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
            category: item.category || "gastronomy",
            tourism_category: item.tourism_category || "Ẩm Thực Đặc Sản",
            commune: item.commune || "Thị trấn Tri Tôn",
            rating: item.rating ? Number(item.rating) : 4.8,
            image_url: img,
            video_url: item.video_url || `https://www.tiktok.com/search/video?q=${encodeURIComponent(item.name + " Tri Tôn")}`,
            hours: item.night_hours || item.opening_hours || (item.open_late ? "15:00 - 23:30" : "06:30 - 21:00"),
            description: item.description || "",
            open_late: !!item.open_late,
            night_hours: item.night_hours,
            phone: item.phone,
            price_level: item.price_level || "35k - 150k",
            address: item.address || "",
            is_hot: !!item.is_hot || (item.rating && item.rating >= 4.8),
          };
        });

        // Sort Rich Detailed Stories & Hot Top rated dishes to the very top!
        formatted.sort((a: any, b: any) => {
          const aHasStory = Boolean(a.detailed_story && a.detailed_story.length > 200);
          const bHasStory = Boolean(b.detailed_story && b.detailed_story.length > 200);
          if (aHasStory && !bHasStory) return -1;
          if (!aHasStory && bHasStory) return 1;
          if (a.is_hot && !b.is_hot) return -1;
          if (!a.is_hot && b.is_hot) return 1;
          return (b.rating || 0) - (a.rating || 0);
        });

        setFoods(formatted);
      }
    }

    async function loadLiveFoodData() {
      try {
        const json = await fetchWithCache(
          "client-food-places-catalog-v1",
          async () => {
            const res = await fetch("/api/v1/food?limit=100");
            return await res.json();
          },
          60 * 60 * 1000,
          (freshJson) => {
            // Reactive SWR: Updates UI in real-time when fresh data arrives!
            processFoodData(freshJson);
          }
        );

        processFoodData(json);
      } catch (err) {
        console.warn("API fetch failed, using local master:", err);
        fallbackToLocalMaster();
      } finally {
        setLoading(false);
      }
    }

    function fallbackToLocalMaster() {
      const gastronomyList = (localMasterPois as any[])
        .filter(
          (p) =>
            p.category === "gastronomy" ||
            p.category === "food" ||
            (p.id && (p.id.startsWith("AT") || p.id.startsWith("CF") || p.id.startsWith("DS")))
        )
        .map((p) => ({
          id: p.id,
          slug: p.slug || p.id,
          name: p.name,
          category: p.category || "gastronomy",
          tourism_category: p.tourism_category || "Ẩm Thực Đặc Sản",
          commune: p.commune || "Thị trấn Tri Tôn",
          rating: p.rating ? Number(p.rating) : 4.8,
          image_url: p.image_url || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop",
          video_url: p.video_url || `https://www.tiktok.com/search/video?q=${encodeURIComponent(p.name + " Tri Tôn")}`,
          hours: p.night_hours || p.opening_hours || (p.open_late ? "15:00 - 23:30" : "06:30 - 21:00"),
          description: p.description || "",
          detailed_story: p.detailed_story,
          open_late: !!p.open_late,
          night_hours: p.night_hours,
          phone: p.phone,
          price_level: p.price_level || "35k - 150k",
          address: p.address || "",
          is_hot: !!p.is_hot || (p.rating && p.rating >= 4.8),
        }));

      // Sort Rich Detailed Stories & Hot first
      gastronomyList.sort((a, b) => {
        const aHasStory = Boolean(a.detailed_story && a.detailed_story.length > 200);
        const bHasStory = Boolean(b.detailed_story && b.detailed_story.length > 200);
        if (aHasStory && !bHasStory) return -1;
        if (!aHasStory && bHasStory) return 1;
        if (a.is_hot && !b.is_hot) return -1;
        if (!a.is_hot && b.is_hot) return 1;
        return (b.rating || 0) - (a.rating || 0);
      });

      setFoods(gastronomyList);
    }

    loadLiveFoodData();
  }, []);

  // Top Signature Hot Dishes (Showcased prominently at top)
  const topSignatureHotFoods = useMemo(() => {
    return foods.slice(0, 4);
  }, [foods]);

  // Dynamic Commune List from Live Data
  const communes = useMemo(() => {
    const set = new Set<string>();
    foods.forEach((f) => {
      if (f.commune && f.commune.trim()) set.add(f.commune.trim());
    });
    return ["Tất cả", ...Array.from(set).sort((a, b) => a.localeCompare(b, "vi"))];
  }, [foods]);

  const filteredFoods = useMemo(() => {
    return foods.filter((f) => {
      if (nightOnly && !f.open_late) return false;
      if (selectedCommune !== "Tất cả" && f.commune !== selectedCommune) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = f.name.toLowerCase().includes(q);
        const matchDesc = (f.description || "").toLowerCase().includes(q);
        const matchCommune = f.commune.toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchCommune) return false;
      }
      return true;
    });
  }, [foods, selectedCommune, nightOnly, searchQuery]);

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF3E7] font-body text-[#26221B] antialiased">
      {/* Background Graphic Accents */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-emerald-300/15 blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-[30rem] h-[30rem] rounded-full bg-amber-300/15 blur-3xl" />
      </div>

      <main className="relative z-10 mx-auto w-full max-w-7xl flex-grow flex-col space-y-8 px-4 py-8 md:px-6 md:py-10">
        {/* Banner Section */}
        <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#0E8C7F] to-[#085A52] p-6 text-white shadow-md md:p-10 border border-[#0B6B60]">
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FFD37A]/20 px-3 py-1 text-xs font-black text-[#FFD37A] uppercase tracking-wider backdrop-blur-xs font-display">
              <Utensils className="h-3.5 w-3.5" />
              <span>Thiên Đường Ẩm Thực Bảy Núi</span>
            </div>
            <h1 className="font-display text-2xl md:text-4xl font-extrabold tracking-tight text-[#FFFDF7] leading-tight">
              Khám Phá Hương Vị Đặc Sản & Quán Ngon Tri Tôn
            </h1>
            <p className="text-xs md:text-sm text-white/85 leading-relaxed font-body">
              Gà đốt Ô Thum, Cháo bò Tri Tôn, Bánh canh Vĩnh Trung, Bún cá Châu Lăng, Đu đủ đâm Rếch Cô Tô và các quán cà phê ngắm cảnh mở muộn về đêm.
            </p>
          </div>
        </section>

        {/* 🌟 TOP 4 ĐẶC SẢN & QUÁN HOT NHẤT PHẢI THỬ (HOT SPOTLIGHT) 🌟 */}
        {topSignatureHotFoods.length > 0 && !searchQuery && selectedCommune === "Tất cả" && !nightOnly && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-black text-[#F26B3A] uppercase tracking-wider font-display">
                  <Flame className="w-4 h-4 fill-[#F26B3A]" />
                  <span>Tinh Hoa Ẩm Thực Bảy Núi</span>
                </div>
                <h2 className="text-xl md:text-2xl font-black text-[#26221B] font-display mt-0.5">
                  Top Đặc Sản & Quán Ăn Hot Nhất Phải Thử
                </h2>
              </div>
              <span className="text-xs font-bold text-[#0E8C7F] bg-[#0E8C7F]/10 px-3 py-1 rounded-full border border-[#0E8C7F]/20 hidden sm:inline-block">
                Ưu Tiên Khuyên Dùng
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
              {topSignatureHotFoods.map((hotItem, hidx) => (
                <div
                  key={hotItem.id}
                  className="group relative bg-[#FFFDF7] rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-amber-300 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div className="relative h-32 sm:h-44 w-full overflow-hidden bg-slate-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getOptimizedImageUrl(hotItem.image_url, { width: 900, dpr: 2, quality: 'best' })}
                      alt={hotItem.name}
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
                      <h3 className="font-display font-black text-xs sm:text-sm leading-tight text-white line-clamp-1">
                        {hotItem.name}
                      </h3>
                    </div>
                  </div>

                  <div className="p-2.5 sm:p-3.5 space-y-1.5 sm:space-y-2 text-xs">
                    <p className="text-[11px] text-[#6B6355] line-clamp-2 leading-relaxed">
                      {hotItem.description || "Món ăn đặc sản nức tiếng Bảy Núi với hương vị đậm đà truyền thống."}
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-[#26221B]/6">
                      <Link
                        href={`/places/${hotItem.slug || hotItem.id}`}
                        className="text-xs font-bold text-[#0E8C7F] hover:underline flex items-center gap-1 font-display"
                      >
                        <span>Xem quán</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotItem.name + " " + hotItem.commune + " Tri Tôn")}`}
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

        {/* Filter & Search Hub */}
        <section className="bg-[#FFFDF7] p-4 md:p-6 rounded-3xl border border-[#26221B]/8 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-[#6B6355] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm món ăn, quán gà đốt, cháo bò, quán cà phê..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#FAF3E7] border border-[#26221B]/10 text-xs font-medium text-[#26221B] placeholder-[#6B6355]/70 focus:outline-none focus:border-[#0E8C7F]"
              />
            </div>

            {/* Night Filter Button */}
            <button
              onClick={() => setNightOnly(!nightOnly)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                nightOnly
                  ? "bg-purple-900 text-purple-100 shadow-sm border border-purple-500"
                  : "bg-[#FAF3E7] text-[#6B6355] hover:bg-purple-50 hover:text-purple-900 border border-[#26221B]/10"
              }`}
            >
              <Moon className={`w-3.5 h-3.5 ${nightOnly ? "text-amber-300 fill-amber-300" : "text-purple-700"}`} />
              <span>Tri Tôn Về Đêm (Quán Mở Muộn)</span>
            </button>
          </div>

          {/* Communes Filter Horizontal Scroll */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-bold text-[#6B6355] whitespace-nowrap mr-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#0E8C7F]" /> Khu Vực:
            </span>
            {communes.map((commune) => (
              <button
                key={commune}
                onClick={() => setSelectedCommune(commune)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  selectedCommune === commune
                    ? "bg-[#0E8C7F] text-white shadow-xs"
                    : "bg-[#FAF3E7] text-[#6B6355] hover:bg-[#FAF3E7]/80 border border-[#26221B]/8"
                }`}
              >
                {commune}
              </button>
            ))}
          </div>
        </section>

        {/* Food Places Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base md:text-lg font-black text-[#26221B] font-display flex items-center gap-2">
              <Utensils className="w-5 h-5 text-[#0E8C7F]" />
              <span>Toàn Bộ Danh Sách Ẩm Thực ({filteredFoods.length} Địa Điểm)</span>
            </h2>
            <span className="text-xs text-[#6B6355] font-medium font-mono">Dữ liệu thực địa 100%</span>
          </div>

          {loading ? (
            <div className="py-16 text-center text-[#6B6355] font-bold">
              Đang tải danh sách quán ngon Bảy Núi...
            </div>
          ) : filteredFoods.length === 0 ? (
            <div className="py-16 text-center bg-[#FFFDF7] rounded-3xl border border-[#26221B]/8 p-8 space-y-3">
              <Utensils className="w-8 h-8 text-[#6B6355]/40 mx-auto" />
              <div className="font-bold text-sm text-[#26221B]">Không tìm thấy quán ăn nào phù hợp với bộ lọc.</div>
              <button
                onClick={() => {
                  setSelectedCommune("Tất cả");
                  setNightOnly(false);
                  setSearchQuery("");
                }}
                className="px-4 py-2 rounded-xl bg-[#0E8C7F] text-white text-xs font-bold cursor-pointer"
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-5">
              {filteredFoods.map((food) => (
                <div
                  key={food.id}
                  className="group bg-[#FFFDF7] rounded-2xl sm:rounded-3xl overflow-hidden border border-[#26221B]/8 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Image Header */}
                    <div className="relative h-32 sm:h-48 w-full overflow-hidden bg-slate-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getOptimizedImageUrl(food.image_url, { width: 800, dpr: 2, quality: 'best' })}
                        alt={food.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                      {food.open_late && (
                        <span className="absolute top-2 sm:top-3 left-2 sm:left-3 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-purple-900/90 text-purple-100 font-extrabold text-[9px] sm:text-[10px] backdrop-blur-xs flex items-center gap-1 border border-purple-400/30">
                          <Moon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-300 fill-amber-300" />
                          <span className="hidden sm:inline">Mở Muộn</span>
                        </span>
                      )}

                      <span className="absolute top-2 sm:top-3 right-2 sm:right-3 px-1.5 sm:px-2.5 py-0.5 rounded-md bg-[#FAF3E7]/95 text-[#26221B] font-extrabold text-[10px] sm:text-xs flex items-center gap-0.5 sm:gap-1 shadow-xs">
                        <Star className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 fill-amber-400 text-amber-500" />
                        <span>{food.rating}</span>
                      </span>

                      <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 right-2 sm:right-3 text-white">
                        <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-amber-300 truncate block font-mono">
                          {food.commune}
                        </span>
                        <h3 className="font-display font-bold text-xs sm:text-sm leading-snug line-clamp-1">
                          {food.name}
                        </h3>
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="p-2.5 sm:p-4 space-y-1.5 sm:space-y-2.5 text-[10px] sm:text-xs text-[#6B6355]">
                      <div className="flex items-center gap-1 sm:gap-1.5 text-[#26221B]">
                        <Clock className="w-3 h-3 text-[#0E8C7F] shrink-0" />
                        <span className="font-semibold truncate">{food.hours}</span>
                      </div>

                      {food.address && (
                        <div className="flex items-start gap-1 sm:gap-1.5 line-clamp-1">
                          <MapPin className="w-3 h-3 text-[#F26B3A] shrink-0 mt-0.5" />
                          <span className="truncate">{food.address}</span>
                        </div>
                      )}

                      {food.description && (
                        <p className="text-[10px] sm:text-[11px] text-[#6B6355] line-clamp-2 leading-relaxed">
                          {food.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="p-2.5 sm:p-4 pt-0 border-t border-[#26221B]/5 mt-1 sm:mt-2 flex items-center justify-between gap-1.5 sm:gap-2">
                    <Link
                      href={`/places/${food.slug || food.id}`}
                      className="flex-1 py-1.5 sm:py-2 rounded-xl bg-[#0E8C7F] hover:bg-[#085A52] text-white text-center font-bold text-[10px] sm:text-xs transition-colors shadow-2xs"
                    >
                      Chi Tiết
                    </Link>

                    {food.video_url && (
                      <a
                        href={food.video_url}
                        target="_blank"
                        rel="noreferrer"
                        title="Xem Video TikTok Thực Địa"
                        className="p-1.5 sm:p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors shrink-0"
                      >
                        <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-rose-600 text-rose-600" />
                      </a>
                    )}

                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(food.name + " " + food.commune + " Tri Tôn")}`}
                      target="_blank"
                      rel="noreferrer"
                      title="Mở Google Maps Chỉ Đường"
                      className="p-1.5 sm:p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition-colors shrink-0"
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
