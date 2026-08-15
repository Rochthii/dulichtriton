"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import HotPlacesSection from "@/components/HotPlacesSection";
import PlaceCard, { Place } from "@/components/PlaceCard";
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
  Filter
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
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("places")
          .select("*")
          .eq("is_active", true)
          .order("rating", { ascending: false });

        if (!error && data && data.length > 0) {
          setPlaces(data as Place[]);
        } else {
          setPlaces([]);
        }
      } catch (err) {
        console.error("Fetch places error:", err);
        setPlaces([]);
      } finally {
        setLoading(false);
      }
    }
    loadLivePlaces();
  }, []);

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
        const cat = p.tourism_category || p.category;
        if (cat !== activeCategory) return false;
      }

      // Audience persona filter
      if (activeAudience === "night") {
        const isNight = p.open_late || (p as any).open_late === true || name.includes("coffee") || name.includes("cà phê") || name.includes("chợ đêm") || name.includes("chạm") || name.includes("lang lang") || name.includes("quy") || name.includes("ny") || name.includes("quảng trường") || name.includes("phố đi bộ") || name.includes("trà sữa");
        if (!isNight) return false;
      } else if (activeAudience === "youth") {
        const matchYouth = name.includes("tà pạ") || name.includes("cổng trời") || name.includes("vồ hội") || name.includes("thốt nốt") || (p.category || "").includes("check-in");
        if (!matchYouth) return false;
      } else if (activeAudience === "family") {
        const matchFamily = name.includes("chùa") || name.includes("gà đốt") || name.includes("tức dụp") || name.includes("hồ ô thum") || name.includes("nhà mồ");
        if (!matchFamily) return false;
      } else if (activeAudience === "trekking") {
        const matchTrek = name.includes("cô tô") || name.includes("núi") || name.includes("suối vàng") || name.includes("vồ hội") || name.includes("săn mây");
        if (!matchTrek) return false;
      } else if (activeAudience === "spiritual") {
        const matchSpiritual = name.includes("chùa") || name.includes("nhà mồ") || name.includes("phi lai") || (p.category || "").includes("spiritual") || (p.category || "").includes("culture");
        if (!matchSpiritual) return false;
      }

      return true;
    });
  }, [places, searchQuery, tiktokOnlyFilter, selectedCommune, activeCategory, activeAudience]);

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF3E7] font-body text-[#26221B] antialiased">
      <main className="mx-auto w-full max-w-7xl flex-grow px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        
        {/* Dynamic Hot Places Section */}
        <HotPlacesSection limit={6} title="CÁC ĐỊA ĐIỂM HOT NỔI TIẾNG NHẤT" />

        {/* Section Title & Filter Controls */}
        <section className="mb-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#26221B]/8 pb-4">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#26221B] tracking-tight">
                Khám Phá Địa Điểm Tri Tôn
              </h1>
              <p className="font-body text-xs text-[#6B6355] mt-1 font-medium">
                Dữ liệu trực tiếp từ CSDL Master ({places.length} điểm đến đã xác minh thực địa)
              </p>
            </div>

            {/* Quick Search */}
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo tên địa điểm..."
                className="w-full pl-9 pr-4 py-2 rounded-full border border-[#26221B]/15 bg-[#FFFDF7] text-xs text-[#26221B] focus:outline-none focus:border-[#0E8C7F]"
              />
              <Search className="w-4 h-4 text-[#6B6355] absolute left-3 top-2.5" />
            </div>
          </div>

          {/* AUDIENCE PERSONA FILTER BAR */}
          <div className="bg-[#FFFDF7] p-4 rounded-[24px] border border-[#26221B]/8 shadow-xs space-y-3 font-display">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0E8C7F] uppercase tracking-wider">
              <Users className="w-4 h-4" />
              <span>Chuyên Đề & Đối Tượng Du Khách:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {[
                { key: "all", label: "Tất Cả" },
                { key: "night", label: "🌙 Tri Tôn Về Đêm (Quán Mở Muộn & Dạo Phố)" },
                { key: "youth", label: "📸 Săn Ảnh Sống Ảo" },
                { key: "family", label: "👨‍👩‍👧‍👦 Gia Đình & Người Lớn Tuổi" },
                { key: "trekking", label: "🥾 Phượt Thủ & Săn Mây" },
                { key: "spiritual", label: "🙏 Chiêm Bái Tâm Linh" },
              ].map((aud) => (
                <button
                  key={aud.key}
                  onClick={() => setActiveAudience(aud.key as AudienceFilter)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all tap-bounce ${
                    activeAudience === aud.key
                      ? "bg-[#0E8C7F] text-white shadow-xs"
                      : "bg-[#FAF3E7] border border-[#26221B]/8 text-[#6B6355] hover:border-[#0E8C7F]/30"
                  }`}
                >
                  {aud.label}
                </button>
              ))}
            </div>
          </div>

          {/* COMMUNE & CATEGORY PILLS */}
          <div className="bg-[#FFFDF7] p-4 sm:p-5 rounded-[24px] border border-[#26221B]/8 shadow-xs space-y-4 font-display">
            {/* Commune Filter */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#6B6355] uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5 text-[#F0A32F]" />
                <span>Khu vực Xã / Thị trấn:</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {communes.map((com) => (
                  <button
                    key={com}
                    onClick={() => setSelectedCommune(com)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all tap-bounce ${
                      selectedCommune === com
                        ? "bg-[#F0A32F] text-[#26221B] font-bold shadow-xs"
                        : "bg-[#FAF3E7] border border-[#26221B]/8 text-[#6B6355] hover:border-[#F0A32F]/40"
                    }`}
                  >
                    {com}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter & TikTok Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-[#26221B]/6">
              <div className="flex flex-wrap items-center gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all tap-bounce ${
                      activeCategory === cat
                        ? "bg-[#151B34] text-[#FFD37A] shadow-xs border border-[#FFD37A]/30"
                        : "bg-[#FAF3E7] border border-[#26221B]/8 text-[#6B6355] hover:border-[#151B34]/30"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* TikTok Toggle Button */}
              <button
                onClick={() => setTiktokOnlyFilter(!tiktokOnlyFilter)}
                className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all tap-bounce shrink-0 ${
                  tiktokOnlyFilter
                    ? "bg-[#F26B3A] text-white shadow-xs"
                    : "bg-[#FAF3E7] border border-[#26221B]/15 text-[#26221B] hover:border-[#F26B3A]"
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Chỉ hiện có TikTok Review</span>
              </button>
            </div>
          </div>
        </section>

        {/* POI Cards Grid (Enhanced PlaceCard with rich metrics) */}
        {loading ? (
          <div className="py-20 text-center text-[#6B6355] font-body">
            <Sparkles className="w-8 h-8 text-[#F0A32F] animate-spin mx-auto mb-3" />
            <p className="font-bold text-sm">Đang tải danh sách địa điểm đã xác minh...</p>
          </div>
        ) : filteredPlaces.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlaces.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        ) : (
          <div className="bg-[#FFFDF7] rounded-[28px] p-12 text-center border border-[#26221B]/8 space-y-3 font-body">
            <Compass className="w-10 h-10 text-[#6B6355]/40 mx-auto" />
            <p className="font-display font-bold text-base text-[#26221B]">Không tìm thấy địa điểm nào phù hợp.</p>
            <p className="text-xs text-[#6B6355]">Hãy thử xóa bớt bộ lọc hoặc tìm kiếm từ khóa khác.</p>
            <button
              onClick={() => {
                setSelectedCommune("Tất cả");
                setActiveCategory("Tất cả");
                setActiveAudience("all");
                setSearchQuery("");
                setTiktokOnlyFilter(false);
              }}
              className="px-5 py-2 rounded-full bg-[#0E8C7F] text-white text-xs font-bold font-display tap-bounce"
            >
              Xem Tất Cả Địa Điểm
            </button>
          </div>
        )}

      </main>
    </div>
  );
}
