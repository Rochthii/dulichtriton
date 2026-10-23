"use client";

import { CatalogFeedback, FilterChip } from '@/components/CatalogUI';

import { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSavedPlaces } from "@/hooks/useSavedPlaces";
import { isPlaceSaved } from "@/lib/savedPlaces";
import { useSearchParams } from "next/navigation";
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

const CLUSTERS_MAP: Record<string, { name: string; badge: string; communes: string[]; keywords: string[] }> = {
  "cluster-tapa": {
    name: "Cụm Tà Pạ & Núi Tô",
    badge: "Check-in Biểu Tượng",
    communes: ["Núi Tô", "Châu Lăng"],
    keywords: ["Tà Pạ", "Thốt Nốt", "Koh Kas", "Trái Tim", "Soài Chek", "Sân Cu"],
  },
  "cluster-othum": {
    name: "Cụm Ô Lâm & Hồ Ô Thum",
    badge: "Ẩm Thực & Lịch Sử",
    communes: ["Ô Lâm", "An Tức"],
    keywords: ["Ô Thum", "Tức Dụp", "Gà Đốt", "Kirivong", "Đồi Tức Dụp", "Vườn Nho"],
  },
  "cluster-coto": {
    name: "Cụm Cô Tô & Soài So",
    badge: "Trekking & Săn Mây",
    communes: ["Cô Tô", "Tri Tôn", "Núi Tô"],
    keywords: ["Cô Tô", "Soài So", "Suối Vàng", "Vồ Hội", "Sân Tiên", "Phụng Hoàng Sơn", "Chùa Sà Lôn", "Xà Tón"],
  },
  "cluster-bachuc": {
    name: "Cụm Ba Chúc & Lương Phi",
    badge: "Văn Hóa & Tâm Linh",
    communes: ["Ba Chúc", "Lương Phi", "Lê Trì", "Lạc Quới", "Vĩnh Gia"],
    keywords: ["Ba Chúc", "Nhà Mồ", "Phi Lai", "Tam Bửu", "Núi Tượng", "Núi Dài", "Ô Tà Sóc"],
  },
};

function PlacesPageContent() {
  const searchParams = useSearchParams();
  const savedPlaces = useSavedPlaces();
  const savedOnly = searchParams.get("saved") === "1";
  const initialCommune = searchParams.get("commune") || "Tất cả";
  const initialCategory = searchParams.get("category") || "Tất cả";
  const initialCluster = searchParams.get("cluster");

  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [selectedCommune, setSelectedCommune] = useState(initialCommune);
  const [selectedClusterId, setSelectedClusterId] = useState<string | null>(() => {
    return initialCluster && CLUSTERS_MAP[initialCluster] ? initialCluster : null;
  });
  const [activeAudience, setActiveAudience] = useState<AudienceFilter>("all");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [tiktokOnlyFilter, setTiktokOnlyFilter] = useState(false);
  const [places, setPlaces] = useState<Place[]>(() => {
    const list: Place[] = (localMasterPois as any[]).map((p) => ({
      ...p,
      is_hot: Boolean(p.is_hot) || Boolean(p.rating && Number(p.rating) >= 4.8),
      open_late: Boolean(p.open_late),
    }));
    return list.sort((a, b) => {
      const aHasStory = Boolean(a.detailed_story && a.detailed_story.length > 200);
      const bHasStory = Boolean(b.detailed_story && b.detailed_story.length > 200);
      if (aHasStory && !bHasStory) return -1;
      if (!aHasStory && bHasStory) return 1;
      return (b.rating || 0) - (a.rating || 0);
    });
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cParam = searchParams.get("commune");
    const catParam = searchParams.get("category");
    const clParam = searchParams.get("cluster");
    setSearchQuery(searchParams.get("q") || "");
    setSelectedClusterId(clParam && CLUSTERS_MAP[clParam] ? clParam : null);
    setSelectedCommune(cParam || "Tất cả");
    setActiveCategory(catParam || "Tất cả");
    setActiveAudience("all");
    setTiktokOnlyFilter(false);
  }, [searchParams]);

  useEffect(() => {
    function processPlacesData(rawData: any[]) {
      if (rawData && rawData.length > 0) {
        const list: Place[] = rawData.map((p) => ({
          ...p,
          is_hot: Boolean(p.is_hot) || Boolean(p.rating && Number(p.rating) >= 4.8),
          open_late: Boolean(p.open_late),
        }));

        list.sort((a, b) => {
          const aHasStory = Boolean(a.detailed_story && a.detailed_story.length > 200);
          const bHasStory = Boolean(b.detailed_story && b.detailed_story.length > 200);
          if (aHasStory && !bHasStory) return -1;
          if (!aHasStory && bHasStory) return 1;
          if (a.is_hot && !b.is_hot) return -1;
          if (!a.is_hot && b.is_hot) return 1;
          return (b.rating || 0) - (a.rating || 0);
        });

        setPlaces(list);
      } else {
        fallbackToLocalMaster();
      }
    }

    async function loadLivePlaces() {
      try {
        const rawData = await fetchWithCache(
          "client-all-places-catalog-v1",
          async () => {
            const { data, error } = await supabase
              .from("places")
              .select("*")
              .eq("is_active", true)
              .order("rating", { ascending: false });
            if (!error && data && data.length > 0) return data;
            return localMasterPois as any[];
          },
          60 * 60 * 1000,
          (freshData) => {
            // Reactive SWR: Updates UI in real-time when fresh data arrives!
            processPlacesData(freshData);
          }
        );

        processPlacesData(rawData);
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
        const aHasStory = Boolean(a.detailed_story && a.detailed_story.length > 200);
        const bHasStory = Boolean(b.detailed_story && b.detailed_story.length > 200);
        if (aHasStory && !bHasStory) return -1;
        if (!aHasStory && bHasStory) return 1;
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
      if (savedOnly && !isPlaceSaved(savedPlaces.saved, p)) return false;
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

      // Cluster filter
      if (selectedClusterId && CLUSTERS_MAP[selectedClusterId]) {
        const clusterDef = CLUSTERS_MAP[selectedClusterId];
        const com = (p.commune || "").toLowerCase();
        const pName = name;
        const matchCom = clusterDef.communes.some((f) => com.includes(f.toLowerCase()));
        const matchKey = clusterDef.keywords.some((k) => pName.includes(k.toLowerCase()));
        if (!matchCom && !matchKey) {
          return false;
        }
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
  }, [places, searchQuery, tiktokOnlyFilter, selectedCommune, activeCategory, activeAudience, selectedClusterId, savedOnly, savedPlaces.saved]);

  return (
    <div className="min-h-screen bg-[#FAF3E7] font-body text-[#26221B]">
      {/* Background Graphic Accents */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-emerald-300/15 blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-[30rem] h-[30rem] rounded-full bg-amber-300/15 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10 space-y-8">
        {/* Banner Section */}
        <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#0E8C7F] to-[#085A52] p-6 text-white shadow-md md:p-10 border border-[#0B6B60]">
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FFD37A]/20 px-3 py-1 text-xs font-black text-[#FFD37A] uppercase tracking-wider backdrop-blur-xs font-display">
              <Compass className="h-3.5 w-3.5" />
              <span>Danh mục khám phá Bảy Núi</span>
            </div>
            <h1 className="font-display text-2xl md:text-4xl font-extrabold tracking-tight text-[#FFFDF7] leading-tight">
              Khám Phá Danh Thắng & Di Tích Tri Tôn
            </h1>
            <p className="text-xs md:text-sm text-white/85 leading-relaxed font-body">
              Tra cứu danh mục tham khảo: Hồ nước trên núi, ngôi chùa Khmer cổ kính, danh thắng thiên nhiên, ẩm thực đặc sản và tọa độ check-in tuyệt đẹp.
            </p>
          </div>
        </section>
        <section aria-label="Chế độ xem điểm đến" className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Link href="/places" aria-current={!savedOnly ? 'page' : undefined} className={`min-h-11 inline-flex items-center rounded-full px-4 text-sm font-bold border ${!savedOnly ? 'bg-[var(--jade-deep)] text-white' : 'bg-[var(--surface)] text-[var(--ink)]'}`}>Tất cả điểm</Link>
            <Link href="/places?saved=1" aria-current={savedOnly ? 'page' : undefined} className={`min-h-11 inline-flex items-center rounded-full px-4 text-sm font-bold border ${savedOnly ? 'bg-[var(--jade-deep)] text-white' : 'bg-[var(--surface)] text-[var(--ink)]'}`}>Đã lưu trên thiết bị</Link>
          </div>
          {savedOnly && <p className="text-sm text-[var(--ink-soft)]">Danh sách chỉ nằm trên trình duyệt này. Điểm đã lưu và lịch trình nháp là hai mục riêng.</p>}
          {savedOnly && savedPlaces.error && <div role="alert" className="rounded-[var(--r-m)] bg-[var(--surface)] border border-[var(--terracotta)] p-4 text-sm">
            <p>{savedPlaces.error}</p>
            <button type="button" className="min-h-11 underline text-[var(--jade-deep)]" onClick={savedPlaces.refresh}>Thử đọc lại danh sách</button>
          </div>}
        </section>


        {/* 🌟 TOP 4 KỲ QUAN & TỌA ĐỘ CHECK-IN HOT NHẤT (HOT SPOTLIGHT) 🌟 */}
        {!savedOnly && topSpotlightPlaces.length > 0 && !searchQuery && selectedCommune === "Tất cả" && activeCategory === "Tất cả" && activeAudience === "all" && (
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

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6">
              {topSpotlightPlaces.map((hotPlace, pidx) => (
                <div
                  key={hotPlace.id}
                  className="group relative bg-[#FFFDF7] rounded-2xl sm:rounded-[28px] overflow-hidden border-2 border-amber-400/80 shadow-[0_2px_12px_rgba(240,163,47,0.10)] hover:shadow-[0_12px_32px_rgba(240,163,47,0.22)] hover:border-amber-500 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-900">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getOptimizedImageUrl(hotPlace.image_url && !hotPlace.image_url.includes('unsplash.com') ? hotPlace.image_url : "https://res.cloudinary.com/dhjesnejt/image/upload/f_auto,q_auto:best,w_1600,c_fill/v1786758888/tri_ton_hero/hero_ho_ta_pa.avif", { width: 900, dpr: 2, quality: 'best' })}
                        alt={hotPlace.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

                      <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex items-center gap-1">
                        <span className="px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-lg sm:rounded-xl bg-[#F0A32F] text-[#26221B] font-black text-[9px] sm:text-xs uppercase tracking-wider flex items-center gap-0.5 sm:gap-1 shadow-sm font-display">
                          <Award className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#26221B]" /> TOP #{pidx + 1}
                        </span>
                      </div>

                      <span className="absolute top-2 sm:top-3 right-2 sm:right-3 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-lg sm:rounded-xl bg-white/95 backdrop-blur-md text-[#26221B] font-black text-[10px] sm:text-xs flex items-center gap-0.5 sm:gap-1 shadow-sm font-display">
                        <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-400 text-amber-500" />
                        <span>{hotPlace.rating ?? 'Chưa có đánh giá'}</span>
                      </span>

                      <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 right-2 sm:right-3 text-white space-y-0.5">
                        <span className="text-[9px] sm:text-[11px] font-black uppercase tracking-wider text-[#FFD37A] drop-shadow-sm block font-mono truncate">
                          {hotPlace.commune}
                        </span>
                        <h3 className="font-display font-extrabold text-xs sm:text-base leading-snug text-white group-hover:text-[#FFD37A] transition-colors line-clamp-1 drop-shadow-md">
                          {hotPlace.name}
                        </h3>
                      </div>
                    </div>

                    <div className="p-2.5 sm:p-4 space-y-1.5 sm:space-y-2 text-xs text-[#6B6355]">
                      <p className="text-[11px] sm:text-xs text-[#6B6355] line-clamp-2 leading-relaxed font-body">
                        {hotPlace.description || "Tọa độ danh thắng tiêu biểu tại Tri Tôn với khung cảnh thiên nhiên tuyệt đẹp."}
                      </p>
                    </div>
                  </div>

                  <div className="p-2.5 sm:p-4 pt-0 border-t border-[#EBE1D0]/70 flex items-center justify-between gap-1.5 sm:gap-2">
                    <Link
                      href={`/places/${hotPlace.slug || hotPlace.id}`}
                      className="text-[11px] sm:text-sm font-extrabold text-[#0E8C7F] hover:text-[#085A52] flex items-center gap-0.5 sm:gap-1 transition-colors font-display truncate"
                    >
                      <span>Xem chi tiết</span>
                      <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                    </Link>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotPlace.name + " " + hotPlace.commune + " Tri Tôn")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/60 font-bold text-[10px] sm:text-xs flex items-center gap-1 transition-colors shadow-2xs"
                    >
                      <Navigation className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-600 shrink-0" />
                      <span className="hidden sm:inline">Chỉ đường</span>
                    </a>
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
                aria-label="Tìm kiếm trong danh mục"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm theo tên địa điểm, xã, câu chuyện sự tích..."
                className="min-h-11 w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#FAF3E7] border border-[#26221B]/10 text-xs font-medium text-[#26221B] placeholder-[#6B6355]/70 focus-visible:outline-2 focus-visible:outline-[var(--jade)] focus:border-[#0E8C7F]"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <FilterChip active={tiktokOnlyFilter}
                onClick={() => setTiktokOnlyFilter(!tiktokOnlyFilter)}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Có Video TikTok</span>
              </FilterChip>
            </div>
          </div>

          {/* Quick Audience Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-bold text-[#6B6355] whitespace-nowrap mr-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Chủ Đề:
            </span>
            {[
              { id: "all", label: "Tất Cả" },
              { id: "night", label: "Tri Tôn về đêm" },
              { id: "trekking", label: "Leo núi săn mây" },
              { id: "spiritual", label: "Hành hương tâm linh" },
            ].map((chip) => (
              <FilterChip active={activeAudience === chip.id}
                key={chip.id}
                onClick={() => setActiveAudience(chip.id as AudienceFilter)}
              >
                {chip.label}
              </FilterChip>
            ))}
          </div>

          {/* Communes Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-t border-[#26221B]/5 pt-3">
            <span className="text-xs font-bold text-[#6B6355] whitespace-nowrap mr-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#0E8C7F]" /> Khu Vực:
            </span>
            {communes.map((commune) => (
              <FilterChip active={selectedCommune === commune}
                key={commune}
                onClick={() => setSelectedCommune(commune)}
              >
                {commune}
              </FilterChip>
            ))}
          </div>
        </section>

        {/* Places Grid */}
        <section className="space-y-4">
          {/* Active Cluster Filter Banner */}
          {selectedClusterId && CLUSTERS_MAP[selectedClusterId] && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-[#0E8C7F]/15 to-amber-500/10 border-2 border-[#0E8C7F]/40 shadow-xs">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-[#0E8C7F] text-white shrink-0">
                  <Compass className="w-4 h-4" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-[#0E8C7F] uppercase tracking-wider font-display">
                      Đang lọc theo cụm trọng điểm
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#F0A32F] text-[#26221B] font-display">
                      {CLUSTERS_MAP[selectedClusterId].badge}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-extrabold text-[#26221B] font-display">
                    {CLUSTERS_MAP[selectedClusterId].name} ({filteredPlaces.length} địa điểm)
                  </h3>
                  <p className="text-[11px] text-[#6B6355] font-body">
                    Bao gồm các xã: {CLUSTERS_MAP[selectedClusterId].communes.join(", ")}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedClusterId(null)}
                className="self-start sm:self-center inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 shadow-2xs transition-all cursor-pointer font-display"
              >
                <span>Xóa lọc cụm (Xem tất cả điểm đến)</span>
              </button>
            </div>
          )}

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-base md:text-lg font-black text-[#26221B] font-display flex items-center gap-2">
              <Compass className="w-5 h-5 text-[#0E8C7F]" />
              <span>{savedOnly ? "Điểm đã lưu" : "Danh sách điểm đến"} ({filteredPlaces.length} kết quả)</span>
            </h2>
            <span className="text-xs text-[#6B6355] font-medium">Xem trạng thái xác minh tại chi tiết</span>
          </div>

          {loading || (savedOnly && !savedPlaces.ready) ? (
            <CatalogFeedback kind="loading" message={savedOnly ? "Đang đọc điểm đã lưu trên thiết bị..." : "Đang tải danh mục điểm đến..."} />
          ) : savedOnly && savedPlaces.error ? null : filteredPlaces.length === 0 ? (
            <div className="py-16 text-center bg-[#FFFDF7] rounded-3xl border border-[#26221B]/8 p-8 space-y-3">
              <CatalogFeedback message={savedOnly ? (savedPlaces.saved.length ? "Không có điểm đã lưu khớp danh mục hoặc bộ lọc hiện tại." : "Bạn chưa lưu điểm nào trên thiết bị này.") : "Không tìm thấy địa điểm nào phù hợp."}
                actionLabel="Xóa tất cả bộ lọc" onAction={() => {
                  setSelectedCommune("Tất cả"); setActiveCategory("Tất cả"); setActiveAudience("all");
                  setSearchQuery(""); setSelectedClusterId(null); setTiktokOnlyFilter(false);
                }} />
              {savedOnly && !savedPlaces.saved.length && <Link href="/places" className="inline-flex min-h-11 items-center rounded-full bg-[var(--palm)] px-4 text-[var(--ink)] font-bold text-sm">Khám phá để lưu điểm</Link>}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-5">
              {filteredPlaces.map((place) => (
                <PlaceCard key={place.id} place={place} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default function PlacesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF3E7] flex items-center justify-center">
          <div className="text-center">
            <Sparkles className="w-8 h-8 text-[#0E8C7F] animate-spin mx-auto mb-2" />
            <span className="text-xs font-bold text-[#6B6355]">Đang tải danh sách địa điểm...</span>
          </div>
        </div>
      }
    >
      <PlacesPageContent />
    </Suspense>
  );
}
