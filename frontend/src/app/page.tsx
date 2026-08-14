"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { fetchWithCache } from "@/lib/fastCache";
import SearchAutocomplete from "@/components/SearchAutocomplete";
import { getGoogleMapsUrl } from "@/lib/utils";
import {
  Utensils,
  MapPin,
  Camera,
  Play,
  Bot,
  Compass,
  Sparkles,
  PhoneCall,
  Clock,
  Navigation,
  CheckCircle2,
  ChevronRight,
  Sun,
  Moon,
  Sunset,
  Sunrise,
  Shield,
  Phone,
  ArrowRight,
  Mountain,
  Map
} from "lucide-react";

interface PlaceItem {
  id: string;
  slug: string;
  name: string;
  category: string;
  commune: string;
  rating: number;
  image_url: string;
  description?: string;
  golden_time_windows?: string[];
  cost_vnd?: string;
}

interface FoodItem {
  id: string;
  slug: string;
  name: string;
  commune: string;
  rating: number;
  image_url: string;
  description?: string;
  price_level?: string;
}

interface ClusterItem {
  id: string;
  name: string;
  commune: string;
  badge: string;
  desc: string;
  img: string;
  link: string;
  placeCount?: number;
}

interface ItineraryCardItem {
  slug: string;
  emoji: string;
  title: string;
  tagline: string;
  for_whom: string;
  duration: string;
  budget_range: string;
}

type TimeSlot = "morning" | "noon" | "afternoon" | "evening";

export default function HomePage() {
  const [activeTimeSlot, setActiveTimeSlot] = useState<TimeSlot>("morning");
  const [hotPlaces, setHotPlaces] = useState<PlaceItem[]>([]);
  const [liveFoods, setLiveFoods] = useState<FoodItem[]>([]);
  const [liveClusters, setLiveClusters] = useState<ClusterItem[]>([]);
  const [topPresets, setTopPresets] = useState<ItineraryCardItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        // 1. Fetch Hot Places live from Supabase (Zero Hardcoding)
        const cachedHot = await fetchWithCache("home-hot-places-live", async () => {
          const { data } = await supabase
            .from("places")
            .select("id, slug, name, category, commune, rating, photos, image_url, description, golden_time_windows, is_hot")
            .eq("is_verified", true)
            .order("is_hot", { ascending: false })
            .order("rating", { ascending: false })
            .limit(20);

          if (data && data.length > 0) {
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
                category: item.category || "check-in",
                commune: item.commune || "Tri Tôn, An Giang",
                rating: item.rating ? Number(item.rating) : 4.8,
                image_url: img,
                description: item.description || "",
                golden_time_windows: Array.isArray(item.golden_time_windows) ? item.golden_time_windows : [],
              };
            });
          }
          return [];
        });
        if (cachedHot) setHotPlaces(cachedHot);

        // 2. Fetch Gourmet Foods live from Supabase (Zero Hardcoding)
        const cachedFoods = await fetchWithCache("home-foods-live", async () => {
          const { data: foodData } = await supabase
            .from("places")
            .select("id, slug, name, commune, category, tourism_category, rating, photos, image_url, description, price_level")
            .or("category.eq.food,tourism_category.ilike.%Ẩm thực%,tourism_category.ilike.%Cà phê%,tourism_category.ilike.%Đặc sản%")
            .eq("is_verified", true)
            .order("rating", { ascending: false })
            .limit(8);

          if (foodData && foodData.length > 0) {
            return foodData.map((f: any) => {
              let img = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop";
              if (f.image_url && typeof f.image_url === "string" && f.image_url.startsWith("http")) {
                img = f.image_url;
              } else if (Array.isArray(f.photos) && f.photos.length > 0) {
                const p0 = f.photos[0];
                if (typeof p0 === "string" && p0.startsWith("http")) img = p0;
                else if (p0 && typeof p0 === "object" && p0.url) img = p0.url;
              }
              return {
                id: f.id,
                slug: f.slug || f.id,
                name: f.name,
                commune: f.commune || "Tri Tôn",
                rating: f.rating ? Number(f.rating) : 4.9,
                image_url: img,
                description: f.description || "Món ăn đặc sản độc bản Bảy Núi Tri Tôn.",
                price_level: f.price_level || "Đặc sản bản địa",
              };
            });
          }
          return [];
        });
        if (cachedFoods) setLiveFoods(cachedFoods);

        // 3. Build 4 Geographic Clusters live from Supabase data
        const cachedClusters = await fetchWithCache("home-clusters-live", async () => {
          const { data: allPlaces } = await supabase
            .from("places")
            .select("id, name, commune, image_url, photos, rating")
            .eq("is_verified", true);

          const clusterDefs = [
            {
              id: "cluster-tapa",
              name: "Cụm Tà Pạ & Núi Tô",
              commune: "Xã Núi Tô",
              badge: "Check-in Iconic",
              desc: "Hồ Tà Pạ, Chùa Tà Pạ, Cánh đồng lúa Tà Pạ, Hàng cây thốt nốt trái tim.",
              link: "/itinerary?slug=kinh-dien-1-ngay",
              communeFilter: "Núi Tô",
              fallbackImg: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop",
            },
            {
              id: "cluster-othum",
              name: "Cụm Ô Lâm & Hồ Ô Thum",
              commune: "Xã Ô Lâm & An Tức",
              badge: "Ẩm Thực & Lịch Sử",
              desc: "Gà Đốt Ô Thum lá chúc, Hồ Ô Thum, Chùa Koh Kas, Khu Di Tích Đồi Tức Dụp.",
              link: "/itinerary?slug=food-tour-am-thuc-1-ngay-dem",
              communeFilter: "Ô Lâm",
              fallbackImg: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop",
            },
            {
              id: "cluster-coto",
              name: "Cụm Cô Tô & Soài So",
              commune: "Xã Cô Tô & Núi Tô",
              badge: "Trekking & Săn Mây",
              desc: "Đỉnh Núi Cô Tô 614m, Vồ Hội, Suối Bạc Soài So, Hồ Soài So thơ mộng.",
              link: "/itinerary?slug=toan-canh-2n1d",
              communeFilter: "Cô Tô",
              fallbackImg: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1200&auto=format&fit=crop",
            },
            {
              id: "cluster-chaulang",
              name: "Cụm Châu Lăng & Ba Chúc",
              commune: "Xã Châu Lăng & Ba Chúc",
              badge: "Văn Hóa & Tâm Linh",
              desc: "Cổng Trời Chùa Koh Kas, Quán Đu Đủ Đâm Rina, Di tích Nhà Mồ Ba Chúc, Chùa Phi Lai.",
              link: "/itinerary?slug=tam-linh-hanh-huong-1-ngay",
              communeFilter: "Châu Lăng",
              fallbackImg: "https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=1200&auto=format&fit=crop",
            },
          ];

          return clusterDefs.map((def) => {
            let img = def.fallbackImg;
            let count = 0;
            if (allPlaces && allPlaces.length > 0) {
              const matched = allPlaces.filter((p: any) =>
                p.commune && p.commune.toLowerCase().includes(def.communeFilter.toLowerCase())
              );
              count = matched.length;
              const placeWithImg = matched.find((p: any) => p.image_url && p.image_url.startsWith("http"));
              if (placeWithImg) img = placeWithImg.image_url;
            }
            return {
              id: def.id,
              name: def.name,
              commune: def.commune,
              badge: def.badge,
              desc: def.desc,
              img,
              link: def.link,
              placeCount: count,
            };
          });
        });
        if (cachedClusters) setLiveClusters(cachedClusters);

        // 4. Fetch top presets dynamically from API / lichtrinh.json (Zero Hardcoding)
        const res = await fetch("/api/v1/chat/itinerary");
        if (res.ok) {
          const itinData = await res.json();
          if (Array.isArray(itinData.presets)) {
            setTopPresets(itinData.presets.slice(0, 4));
          }
        }
      } catch (err) {
        console.error("Home data load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter spots by time of day dynamically
  const timeSlotPlaces = hotPlaces.filter((p) => {
    const name = p.name.toLowerCase();
    const cat = p.category.toLowerCase();
    const desc = p.description?.toLowerCase() || "";

    if (activeTimeSlot === "morning") {
      return (
        name.includes("tà pạ") ||
        name.includes("cô tô") ||
        name.includes("săn mây") ||
        name.includes("koh kas") ||
        name.includes("chùa") ||
        cat.includes("spiritual")
      );
    }
    if (activeTimeSlot === "noon") {
      return (
        name.includes("gà đốt") ||
        name.includes("cháo bò") ||
        name.includes("ô thum") ||
        name.includes("quán") ||
        name.includes("ăn") ||
        cat.includes("food")
      );
    }
    if (activeTimeSlot === "afternoon") {
      return (
        name.includes("soài so") ||
        name.includes("soài chék") ||
        name.includes("châu lăng") ||
        name.includes("cổng trời") ||
        name.includes("đu đủ") ||
        name.includes("bánh bò")
      );
    }
    if (activeTimeSlot === "evening") {
      return (
        name.includes("chợ") ||
        name.includes("đêm") ||
        name.includes("cà phê") ||
        name.includes("coffee") ||
        name.includes("thị trấn") ||
        name.includes("lẩu")
      );
    }
    return true;
  }).slice(0, 4);

  return (
    <div className="flex min-h-screen flex-col bg-[#F8F9FA] text-slate-900 antialiased font-sans">
      <main className="mx-auto flex w-full max-w-7xl flex-grow flex-col gap-6 sm:gap-10 px-3 sm:px-6 lg:px-8 py-3 sm:py-6">
        
        {/* ── 1. HERO SECTION & 4 QUICK ACTION BUTTONS ───────────────────── */}
        <section className="relative w-full rounded-3xl overflow-hidden shadow-xl min-h-[440px] sm:min-h-[480px] flex items-center justify-center bg-slate-900">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1600&auto=format&fit=crop')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-900/40" />

          <div className="relative z-10 w-full max-w-4xl p-4 sm:p-8 text-center space-y-4 sm:space-y-6">
            {/* Verified Badge */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-900/80 backdrop-blur-md text-amber-300 text-xs font-extrabold border border-amber-400/40 shadow-md">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>Cổng Thông Tin Du Lịch Thông Minh Tri Tôn 2026</span>
            </div>

            {/* Main Title */}
            <h1 className="font-black text-2xl sm:text-4xl md:text-5xl text-white tracking-tight leading-tight drop-shadow-md">
              Khám Phá Vẻ Đẹp <br className="hidden sm:inline" />
              <span className="text-amber-400 drop-shadow-lg">Huyền Bí Bảy Núi Tri Tôn</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-200 max-w-2xl mx-auto font-medium leading-relaxed drop-shadow-xs">
              82 thắng cảnh đã xác minh • 35 lịch trình tối ưu thực địa • Bản đồ ẩm thực Gà Đốt Ô Thum & Di sản Khmer.
            </p>

            {/* Smart Search Bar */}
            <div className="w-full max-w-xl mx-auto">
              <SearchAutocomplete />
            </div>

            {/* 4 Instant Action Shortcuts (Mobile-First Tap Pills) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 max-w-2xl mx-auto">
              <Link
                href="/itinerary"
                className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xs group"
              >
                <Compass className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-black">35 Lịch Trình</span>
              </Link>

              <Link
                href="/food"
                className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xs group"
              >
                <Utensils className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-black">Ăn Gì Tri Tôn</span>
              </Link>

              <Link
                href="/map"
                className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xs group"
              >
                <Navigation className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-black">Bản Đồ GPS</span>
              </Link>

              <Link
                href="/chatbot"
                className="p-3 rounded-2xl bg-[#D99B26] hover:bg-[#c48b20] text-slate-950 flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md font-black"
              >
                <Bot className="w-4 h-4 text-slate-950" />
                <span className="text-xs">Hỏi AI Trợ Lý</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ── 2. "ĐI ĐÂU BÂY GIỜ?" — TIME-OF-DAY REAL-TIME DISCOVERY ─────── */}
        <section className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#1B4D3E]" />
                <h2 className="text-lg sm:text-xl font-black text-slate-900">
                  Đi Đâu Bây Giờ? Gợi Ý Theo Khung Giờ
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Chọn thời điểm trong ngày để khám phá điểm đến phù hợp nhất từ dữ liệu thực địa
              </p>
            </div>

            {/* Time Slot Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {[
                { key: "morning",   label: "Sáng Sớm", icon: Sunrise, time: "06:00 - 08:30" },
                { key: "noon",      label: "Buổi Trưa", icon: Sun,     time: "11:30 - 13:30" },
                { key: "afternoon", label: "Buổi Chiều", icon: Sunset,  time: "15:00 - 17:30" },
                { key: "evening",   label: "Buổi Tối",  icon: Moon,    time: "18:30 - 21:30" },
              ].map((slot) => {
                const Icon = slot.icon;
                const isActive = activeTimeSlot === slot.key;
                return (
                  <button
                    key={slot.key}
                    onClick={() => setActiveTimeSlot(slot.key as TimeSlot)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 active:scale-95 ${
                      isActive
                        ? "bg-[#1B4D3E] text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 text-amber-400" />
                    <span>{slot.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Slot Place Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {timeSlotPlaces.map((place) => {
              const mapsUrl = getGoogleMapsUrl({ name: place.name, commune: place.commune });
              const tikTokSearchUrl = `https://www.tiktok.com/search?q=${encodeURIComponent(`${place.name} Tri Tôn An Giang`)}`;

              return (
                <div
                  key={place.id}
                  className="group rounded-2xl bg-[#F8F9FA] border border-slate-200 hover:border-emerald-500/50 shadow-2xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
                >
                  <div className="relative h-40 w-full overflow-hidden bg-slate-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={place.image_url}
                      alt={place.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-slate-900/80 text-amber-300 text-[10px] font-extrabold border border-amber-300/30">
                      ⭐ {place.rating}/5
                    </span>
                    <div className="absolute bottom-2 left-2.5 right-2.5 text-white">
                      <p className="text-[10px] text-emerald-300 font-bold">{place.commune}</p>
                      <h4 className="text-xs font-black line-clamp-1">{place.name}</h4>
                    </div>
                  </div>

                  <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                      {place.description || `Địa điểm du lịch nổi tiếng tại ${place.commune}.`}
                    </p>

                    <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-slate-200">
                      <a
                        href={tikTokSearchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-extrabold transition-colors"
                      >
                        <Play className="w-2.5 h-2.5 fill-white" />
                        <span>TikTok</span>
                      </a>

                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-bold transition-colors"
                      >
                        <Navigation className="w-2.5 h-2.5 text-amber-300" />
                        <span>Chỉ Đường</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 3. SHOWCASE 4 TOP LỊCH TRÌNH DỰNG SẴN ───────────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#1B4D3E]" />
                <span>Lịch Trình Thực Địa Đã Tối Ưu</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Tuyển tập các bộ lịch trình chuẩn xác nhất từ 35 kịch bản thực địa Tri Tôn
              </p>
            </div>
            <Link
              href="/itinerary"
              className="text-xs font-black text-[#1B4D3E] hover:text-emerald-700 flex items-center gap-1"
            >
              <span>Xem tất cả 35 tour</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {topPresets.map((p) => (
              <Link
                key={p.slug}
                href={`/itinerary?slug=${p.slug}`}
                className="group p-4 rounded-3xl bg-white border border-slate-200 hover:border-emerald-500/60 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{p.emoji || "🗺️"}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-extrabold border border-emerald-200">
                      ⏱ {p.duration}
                    </span>
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-[#1B4D3E] transition-colors line-clamp-1">
                    {p.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                    {p.tagline}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[10px] font-bold text-amber-800">💰 {p.budget_range || "Tự túc"}</span>
                  <span className="text-[10px] font-extrabold text-[#1B4D3E] flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                    Xem Sơ Đồ <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── 4. BẢN ĐỒ 4 CỤM DU LỊCH LIỀN KỀ (DYNAMIC TỪ DB) ───────────────── */}
        <section className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs space-y-5">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#1B4D3E]" />
              <span>4 Cụm Du Lịch Liền Kề (Tránh Đi Vòng Vèo)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Phân cụm theo xã và cung đường địa lý thực tế từ 82 địa điểm đã xác minh
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {liveClusters.map((c) => (
              <Link
                key={c.id}
                href={c.link}
                className="group relative rounded-2xl overflow-hidden border border-slate-200 shadow-2xs hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div className="relative h-36 w-full overflow-hidden bg-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={c.img}
                    alt={c.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-[#1B4D3E] text-white text-[10px] font-bold">
                    {c.badge}
                  </span>
                  <div className="absolute bottom-2 left-2.5 right-2.5 text-white">
                    <h3 className="text-xs font-black">{c.name}</h3>
                    <p className="text-[10px] text-amber-300 font-semibold">{c.commune}</p>
                  </div>
                </div>

                <div className="p-3 bg-[#F8F9FA] flex-1 flex flex-col justify-between">
                  <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">
                    {c.desc}
                  </p>
                  <div className="mt-2 pt-1.5 border-t border-slate-200 flex items-center justify-between text-[10px] font-bold text-[#1B4D3E]">
                    <span>Khám phá cụm ({c.placeCount || 0} điểm)</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── SECTION: BÁCH KHOA TOÀN THƯ & GIỚI THIỆU TỔNG QUAN TRI TÔN ──── */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1B4D3E] via-[#143B2F] to-slate-900 p-6 sm:p-8 text-white shadow-lg border border-emerald-800/80">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-[11px] font-extrabold border border-white/20">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Bách Khoa Toàn Thư Vùng Đất Bảy Núi</span>
              </div>
              <h2 className="text-xl sm:text-3xl font-black tracking-tight leading-tight">
                Tìm Hiểu Toàn Cảnh Tri Tôn: Địa Lý, Lịch Sử & Di Sản Văn Hóa Khmer
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                Khám phá chi tiết 15 Xã/Thị trấn, lịch sử hơn 500 năm của 37 ngôi Chùa Khmer, lễ hội Đua Bò Bảy Núi rực lửa, kinh nghiệm mùa lúa chín Tà Pạ và hướng dẫn di chuyển từ TP.HCM, Cần Thơ.
              </p>

              {/* Mini Highlights Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="px-2.5 py-1 rounded-xl bg-white/10 text-emerald-200 text-[11px] font-bold">
                  🏞️ Diện tích ~600km²
                </span>
                <span className="px-2.5 py-1 rounded-xl bg-white/10 text-emerald-200 text-[11px] font-bold">
                  🏛️ 15 Xã & Thị trấn
                </span>
                <span className="px-2.5 py-1 rounded-xl bg-white/10 text-emerald-200 text-[11px] font-bold">
                  🪷 &gt;34% Dân tộc Khmer
                </span>
                <span className="px-2.5 py-1 rounded-xl bg-white/10 text-emerald-200 text-[11px] font-bold">
                  🐃 Lễ hội Đua Bò Quốc Gia
                </span>
              </div>
            </div>

            <Link
              href="/guide"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm transition-all shadow-md active:scale-95 shrink-0 group self-start lg:self-center"
            >
              <span>Xem Giới Thiệu Chi Tiết</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Background Decorative Icon */}
          <div className="absolute right-[-20px] bottom-[-20px] opacity-5 text-white pointer-events-none">
            <Compass className="w-80 h-80" />
          </div>
        </section>

        {/* ── 5. TOP MÓN ĐẶC SẢN NẠP ĐỘNG TỪ SUPABASE DATABASE ─────────────── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <Utensils className="w-5 h-5 text-amber-600" />
                <span>Đặc Sản & Quán Ăn Ngon Tri Tôn (Nạp Trực Tiếp Từ Dữ Liệu)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Các quán ăn đặc sản bản địa đã xác minh có hương vị lá chúc, trái chúc và bí quyết gia truyền
              </p>
            </div>
            <Link
              href="/food"
              className="text-xs font-black text-[#1B4D3E] hover:text-emerald-700 flex items-center gap-1"
            >
              <span>Xem tất cả quán ngon</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {liveFoods.slice(0, 4).map((f) => {
              const mapsUrl = getGoogleMapsUrl({ name: f.name, commune: f.commune });
              const tikTokSearchUrl = `https://www.tiktok.com/search?q=${encodeURIComponent(`${f.name} Tri Tôn`)}`;

              return (
                <div
                  key={f.id}
                  className="group rounded-3xl bg-white border border-slate-200 hover:border-amber-400/60 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
                >
                  <div className="relative h-36 w-full overflow-hidden bg-slate-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={f.image_url}
                      alt={f.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[10px] font-black">
                      ⭐ {f.rating}/5
                    </span>
                    <div className="absolute bottom-2 left-2.5 right-2.5 text-white">
                      <h3 className="text-xs font-black line-clamp-1">{f.name}</h3>
                      <p className="text-[10px] text-amber-300 font-semibold">{f.commune}</p>
                    </div>
                  </div>

                  <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                      {f.description || `Món ăn đặc sản Bảy Núi nổi tiếng tại ${f.commune}.`}
                    </p>

                    <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-slate-100">
                      <a
                        href={tikTokSearchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-extrabold transition-colors"
                      >
                        <Play className="w-2.5 h-2.5 fill-white" />
                        <span>TikTok</span>
                      </a>

                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-bold transition-colors"
                      >
                        <Navigation className="w-2.5 h-2.5 text-amber-300" />
                        <span>Quán Ngon</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 6. CẨM NANG THỰC ĐỊA & SOS CỨU HỘ 24/7 ──────────────────────── */}
        <section className="bg-gradient-to-br from-[#1B4D3E] to-[#143B2F] rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-emerald-700/60 pb-5">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block mb-1">
                🚨 An Toàn & Hỗ Trợ Thực Địa
              </span>
              <h2 className="text-xl sm:text-2xl font-black">
                Tổng Đài SOS Cứu Hộ Du Lịch Tri Tôn (24/7)
              </h2>
              <p className="text-xs text-emerald-100 mt-1 max-w-xl">
                Lưu lại danh bạ khẩn cấp trực ban để liên hệ hỗ trợ nhanh khi gặp sự cố, tai nạn hoặc cần hướng dẫn y tế trên cung đường Bảy Núi.
              </p>
            </div>

            <Link
              href="/emergency"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-all shadow-xs shrink-0 self-start md:self-auto"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Xem Toàn Bộ Danh Bạ</span>
            </Link>
          </div>

          {/* 3 Hotlines Grid (Direct Call Tap on Mobile) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <a
              href="tel:02963874113"
              className="p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all flex items-center gap-3.5 active:scale-95 group"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-black shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-emerald-200 font-bold">🚔 Công An Tri Tôn (Trực ban)</p>
                <p className="text-base font-black text-white group-hover:text-amber-300 transition-colors">
                  0296 3874 113
                </p>
              </div>
            </a>

            <a
              href="tel:02963874115"
              className="p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all flex items-center gap-3.5 active:scale-95 group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-emerald-200 font-bold">🚑 Y Tế Tri Tôn (Cấp cứu)</p>
                <p className="text-base font-black text-white group-hover:text-amber-300 transition-colors">
                  0296 3874 115
                </p>
              </div>
            </a>

            <a
              href="tel:02963771999"
              className="p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all flex items-center gap-3.5 active:scale-95 group"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-emerald-200 font-bold">🏛️ Hỗ Trợ Du Lịch Tri Tôn</p>
                <p className="text-base font-black text-white group-hover:text-amber-300 transition-colors">
                  0296 3771 999
                </p>
              </div>
            </a>
          </div>

          {/* Quick Cultural Etiquette Tips */}
          <div className="pt-2 text-xs text-emerald-200 grid grid-cols-1 sm:grid-cols-2 gap-2 border-t border-emerald-700/60">
            <p className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Viếng Chùa Khmer: Mặc trang phục lịch sự, che vai và đầu gối.</span>
            </p>
            <p className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Ăn Gà Đốt Ô Thum: Nên gọi điện đặt trước 45–60 phút để quán ướp than.</span>
            </p>
          </div>
        </section>

      </main>
    </div>
  );
}
