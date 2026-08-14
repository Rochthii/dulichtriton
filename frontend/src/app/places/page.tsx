"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import HotPlacesSection from "@/components/HotPlacesSection";
import {
  MapPin,
  Clock,
  Ticket,
  Play,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Flame,
  Filter,
  Star
} from "lucide-react";

interface Place {
  id: string;
  slug: string;
  name: string;
  category: string;
  tourism_category: string;
  commune: string;
  rating: number;
  image_url: string;
  video_url?: string;
  opening_hours?: string;
  ticket_required?: boolean;
  description?: string;
}

export default function PlacesPage() {
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [selectedCommune, setSelectedCommune] = useState("Tất cả");
  const [tiktokOnlyFilter, setTiktokOnlyFilter] = useState(false);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    "Tất cả",
    "Thiên nhiên & Cảnh quan",
    "Văn hóa & Tâm linh",
    "Ẩm thực & Đặc sản",
    "Homestay & Lưu trú",
    "Di tích lịch sử"
  ];

  const communes = [
    "Tất cả",
    "Thị trấn Tri Tôn",
    "Xã Núi Tô",
    "Xã Ô Lâm",
    "Xã Châu Lăng",
    "Thị trấn Ba Chúc",
    "Xã Lương Phi",
    "Xã An Tức",
    "Xã Cô Tô"
  ];

  useEffect(() => {
    async function loadLivePlaces() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("places")
          .select("id, slug, name, category, tourism_category, commune, rating, photos, image_url, video_url, opening_hours, ticket_required, description")
          .eq("is_active", true)
          .order("rating", { ascending: false });

        if (!error && data && data.length > 0) {
          const formatted: Place[] = data.map((item: any) => {
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
              category: item.category || "general",
              tourism_category: item.tourism_category || "Địa Điểm Tham Quan",
              commune: item.commune || "Thị trấn Tri Tôn",
              rating: item.rating ? Number(item.rating) : 4.8,
              image_url: img,
              video_url: item.video_url || `https://www.tiktok.com/search?q=${encodeURIComponent(item.name + " Tri Tôn")}`,
              opening_hours: item.opening_hours || "06:00 - 18:00",
              ticket_required: item.ticket_required || false,
              description: item.description || ""
            };
          });
          setPlaces(formatted);
        }
      } catch (err) {
        console.error("Fetch places error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadLivePlaces();
  }, []);

  // Real-time filtering across 174 POIs
  const filteredPlaces = places.filter((p) => {
    // 1. TikTok Reels Filter
    if (tiktokOnlyFilter && (!p.video_url || !p.video_url.includes("tiktok"))) {
      return false;
    }

    // 2. Commune Filter
    if (selectedCommune !== "Tất cả" && p.commune !== selectedCommune) {
      return false;
    }

    // 3. Category Filter
    if (activeCategory === "Tất cả") return true;
    if (activeCategory === "Thiên nhiên & Cảnh quan") {
      return p.category === "nature" || p.tourism_category.includes("Thiên Nhiên") || p.tourism_category.includes("Cảnh Quan");
    }
    if (activeCategory === "Văn hóa & Tâm linh") {
      return p.category === "culture" || p.tourism_category.includes("Văn Hóa") || p.tourism_category.includes("Tâm Linh") || p.tourism_category.includes("Chùa");
    }
    if (activeCategory === "Ẩm thực & Đặc sản") {
      return p.category === "food" || p.tourism_category.includes("Ẩm Thực") || p.tourism_category.includes("Cà Phê") || p.tourism_category.includes("Quán");
    }
    if (activeCategory === "Homestay & Lưu trú") {
      return p.category === "stay" || p.tourism_category.includes("Homestay") || p.tourism_category.includes("Khách Sạn") || p.tourism_category.includes("Resort");
    }
    if (activeCategory === "Di tích lịch sử") {
      return p.category === "history" || p.tourism_category.includes("Di Tích") || p.tourism_category.includes("Lịch Sử");
    }

    return true;
  });

  return (
    <div className="flex min-h-screen flex-col bg-[#F4F9F5] font-body-base text-slate-800 antialiased selection:bg-emerald-200">
      
      {/* Background Graphic Accents */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-emerald-300/20 blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-[30rem] h-[30rem] rounded-full bg-amber-300/15 blur-3xl" />
      </div>

      <main className="relative z-10 mx-auto w-full max-w-container-max flex-grow px-margin-mobile py-8 md:px-margin-desktop md:py-12">
        
        {/* Dynamic Hot Places Section */}
        <HotPlacesSection limit={6} title="🔥 CÁC ĐỊA ĐIỂM HOT NỔI TIẾNG NHẤT" />

        {/* Section Title & Filter Controls */}
        <section className="mb-10 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-emerald-200/80 pb-4">
            <div>
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Khám Phá Địa Điểm Tri Tôn
              </h1>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Dữ liệu trực tiếp từ CSDL Master ({places.length} điểm đến đã xác minh)
              </p>
            </div>

            {/* TikTok Reels Filter Toggle Button */}
            <button
              onClick={() => setTiktokOnlyFilter(!tiktokOnlyFilter)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-xs shadow-md transition-all ${
                tiktokOnlyFilter
                  ? "bg-slate-900 text-amber-400 border border-amber-400/50 shadow-amber-500/20"
                  : "bg-white border border-slate-200 text-slate-700 hover:border-emerald-500"
              }`}
            >
              <Play className={`h-4 w-4 ${tiktokOnlyFilter ? "fill-amber-400 text-amber-400" : "text-emerald-700"}`} />
              <span>BỘ LỌC TIKTOK REELS</span>
              {tiktokOnlyFilter && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black">
                  BẬT
                </span>
              )}
            </button>
          </div>

          {/* Commune Filter Pills */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Khu vực Xã / Thị trấn:</span>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                Hiển thị {filteredPlaces.length} / {places.length} địa điểm
              </span>
            </div>
            <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-none">
              {communes.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCommune(c)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all shadow-sm ${
                    selectedCommune === c
                      ? "bg-emerald-900 text-white shadow-emerald-900/20"
                      : "bg-white text-slate-700 border border-slate-200 hover:border-emerald-500"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Danh mục trải nghiệm:</span>
            <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all shadow-sm ${
                    activeCategory === cat
                      ? "bg-amber-500 text-slate-950 font-black shadow-amber-500/20"
                      : "bg-white text-slate-700 border border-slate-200 hover:border-amber-400"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Places Grid */}
        {loading ? (
          <div className="py-20 text-center text-slate-400 font-bold text-sm">
            Đang tải dữ liệu 174 địa điểm Tri Tôn...
          </div>
        ) : filteredPlaces.length === 0 ? (
          <div className="py-20 text-center text-slate-500 font-bold text-sm bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
            Không tìm thấy địa điểm nào phù hợp với bộ lọc hiện tại.
          </div>
        ) : (
          <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPlaces.map((place) => (
              <article
                key={place.id}
                className="group flex flex-col overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl justify-between"
              >
                <div>
                  <div className="relative h-56 overflow-hidden bg-slate-100">
                    <img
                      src={place.image_url}
                      alt={place.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-slate-900/80 backdrop-blur-md text-white font-bold text-xs">
                      {place.tourism_category}
                    </div>
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/90 text-amber-600 font-extrabold text-[11px] shadow-sm">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      {place.rating}
                    </div>
                  </div>

                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                      <span className="flex items-center gap-1 text-emerald-800">
                        <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
                        {place.commune}
                      </span>
                      <span className="flex items-center gap-1 text-slate-500">
                        <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        {place.opening_hours}
                      </span>
                    </div>

                    <h2 className="font-heading text-xl font-extrabold text-slate-900 group-hover:text-emerald-800 transition-colors">
                      {place.name}
                    </h2>

                    {place.description && (
                      <p className="text-xs text-slate-600 line-clamp-2 font-light leading-relaxed">
                        {place.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <Link
                    href={`/places/${place.slug || place.id}`}
                    className="w-full py-3 bg-slate-900 hover:bg-emerald-900 text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all"
                  >
                    <span>Xem chi tiết & Chỉ đường GPS</span>
                    <ChevronRight className="h-4 w-4 text-amber-300" />
                  </Link>
                </div>
              </article>
            ))}
          </section>
        )}

      </main>
    </div>
  );
}
