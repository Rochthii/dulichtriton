"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Place } from "@/components/PlaceCard";
import localMasterPois from "@/data/triton_pois_full.json";
import { fetchWithCache } from "@/lib/fastCache";
import { Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import PlacesHeroBanner from "@/components/places/PlacesHeroBanner";
import PlacesHotSpotlight from "@/components/places/PlacesHotSpotlight";
import PlacesFilterBar, { AudienceFilter } from "@/components/places/PlacesFilterBar";
import PlacesClusterBanner from "@/components/places/PlacesClusterBanner";
import PlacesGrid from "@/components/places/PlacesGrid";

export const CLUSTERS_MAP: Record<string, { name: string; name_en?: string; badge: string; badge_en?: string; communes: string[]; keywords: string[] }> = {
  "cluster-tapa": {
    name: "Cụm Tà Pạ & Núi Tô",
    name_en: "Ta Pa & Mount To Cluster",
    badge: "Check-in Biểu Tượng",
    badge_en: "Iconic Check-in",
    communes: ["Núi Tô", "Châu Lăng"],
    keywords: ["Tà Pạ", "Thốt Nốt", "Koh Kas", "Trái Tim", "Soài Chek", "Sân Cu"],
  },
  "cluster-othum": {
    name: "Cụm Ô Lâm & Hồ Ô Thum",
    name_en: "O Lam & O Thum Lake Cluster",
    badge: "Ẩm Thực & Lịch Sử",
    badge_en: "Cuisine & History",
    communes: ["Ô Lâm", "An Tức"],
    keywords: ["Ô Thum", "Tức Dụp", "Gà Đốt", "Kirivong", "Đồi Tức Dụp", "Vườn Nho"],
  },
  "cluster-coto": {
    name: "Cụm Cô Tô & Soài So",
    name_en: "Mount Co To & Soai So Cluster",
    badge: "Trekking & Săn Mây",
    badge_en: "Trekking & Clouds",
    communes: ["Cô Tô", "Tri Tôn", "Núi Tô"],
    keywords: ["Cô Tô", "Soài So", "Suối Vàng", "Vồ Hội", "Sân Tiên", "Phụng Hoàng Sơn", "Chùa Sà Lôn", "Xà Tón"],
  },
  "cluster-bachuc": {
    name: "Cụm Ba Chúc & Lương Phi",
    name_en: "Ba Chuc & Luong Phi Cluster",
    badge: "Văn Hóa & Tâm Linh",
    badge_en: "Culture & Spiritual",
    communes: ["Ba Chúc", "Lương Phi", "Lê Trì", "Lạc Quới", "Vĩnh Gia"],
    keywords: ["Ba Chúc", "Nhà Mồ", "Phi Lai", "Tam Bửu", "Núi Tượng", "Núi Dài", "Ô Tà Sóc"],
  },
};

function PlacesPageContent() {
  const { language } = useLanguage();
  const isEn = language === "en";

  const searchParams = useSearchParams();
  const initialCommune = searchParams.get("commune") || (isEn ? "All Areas" : "Tất cả");
  const initialCategory = searchParams.get("category") || (isEn ? "All Categories" : "Tất cả");
  const initialCluster = searchParams.get("cluster");

  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [selectedCommune, setSelectedCommune] = useState(initialCommune);
  const [selectedClusterId, setSelectedClusterId] = useState<string | null>(() => {
    return initialCluster && CLUSTERS_MAP[initialCluster] ? initialCluster : null;
  });
  const [activeAudience, setActiveAudience] = useState<AudienceFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
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
    if (clParam && CLUSTERS_MAP[clParam]) {
      setSelectedClusterId(clParam);
    }
    if (cParam) setSelectedCommune(cParam);
    if (catParam) setActiveCategory(catParam);
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
            processPlacesData(freshData);
          }
        );

        processPlacesData(rawData);
      } catch (err) {
        console.warn("Fetch places error, fallback:", err);
      } finally {
        setLoading(false);
      }
    }

    loadLivePlaces();
  }, []);

  const topSpotlightPlaces = useMemo(() => places.slice(0, 4), [places]);

  const communes = useMemo(() => {
    const set = new Set<string>();
    places.forEach((p) => {
      if (p.commune && p.commune.trim()) set.add(p.commune.trim());
    });
    return [isEn ? "All Areas" : "Tất cả", ...Array.from(set).sort((a, b) => a.localeCompare(b, "vi"))];
  }, [places, isEn]);

  const filteredPlaces = useMemo(() => {
    return places.filter((p) => {
      const name = (p.name || "").toLowerCase();
      const desc = (p.description || "").toLowerCase();
      const q = searchQuery.toLowerCase().trim();

      if (q && !name.includes(q) && !desc.includes(q) && !(p.commune || "").toLowerCase().includes(q)) {
        return false;
      }

      if (tiktokOnlyFilter && (!p.video_url || !p.video_url.includes("tiktok"))) {
        return false;
      }

      if (selectedClusterId && CLUSTERS_MAP[selectedClusterId]) {
        const clusterDef = CLUSTERS_MAP[selectedClusterId];
        const com = (p.commune || "").toLowerCase();
        const matchCom = clusterDef.communes.some((f) => com.includes(f.toLowerCase()));
        const matchKey = clusterDef.keywords.some((k) => name.includes(k.toLowerCase()));
        if (!matchCom && !matchKey) return false;
      }

      if (selectedCommune !== "Tất cả" && selectedCommune !== "All Areas" && p.commune !== selectedCommune) {
        return false;
      }

      if (activeCategory !== "Tất cả" && activeCategory !== "All Categories") {
        const cat = (p.tourism_category || p.category || "").toLowerCase();
        if (!cat.includes(activeCategory.toLowerCase())) return false;
      }

      if (activeAudience === "night" && !p.open_late) return false;
      if (activeAudience === "trekking" && !name.includes("núi") && !name.includes("hồ") && !name.includes("đồi")) return false;
      if (activeAudience === "spiritual" && !name.includes("chùa") && !name.includes("miếu") && !name.includes("tâm linh")) return false;

      return true;
    });
  }, [places, searchQuery, tiktokOnlyFilter, selectedCommune, activeCategory, activeAudience, selectedClusterId]);

  return (
    <div className="min-h-screen bg-[#FAF3E7] font-body text-[#26221B]">
      {/* Background Graphic Accents */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-emerald-300/15 blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-[30rem] h-[30rem] rounded-full bg-amber-300/15 blur-3xl" />
      </div>

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10 space-y-8">
        {/* 1. Hero Banner */}
        <PlacesHeroBanner />

        {/* 2. Top 4 Hot Spotlight */}
        {!searchQuery && (selectedCommune === "Tất cả" || selectedCommune === "All Areas") && (activeCategory === "Tất cả" || activeCategory === "All Categories") && activeAudience === "all" && (
          <PlacesHotSpotlight places={topSpotlightPlaces} />
        )}

        {/* 3. Search & Filter Bar */}
        <PlacesFilterBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          tiktokOnlyFilter={tiktokOnlyFilter}
          setTiktokOnlyFilter={setTiktokOnlyFilter}
          activeAudience={activeAudience}
          setActiveAudience={setActiveAudience}
          selectedCommune={selectedCommune}
          setSelectedCommune={setSelectedCommune}
          communes={communes}
        />

        {/* 4. Active Cluster Banner */}
        {selectedClusterId && CLUSTERS_MAP[selectedClusterId] && (
          <PlacesClusterBanner
            cluster={CLUSTERS_MAP[selectedClusterId]}
            onClear={() => setSelectedClusterId(null)}
            placesCount={filteredPlaces.length}
          />
        )}

        {/* 5. Main Places Grid */}
        <PlacesGrid
          places={filteredPlaces}
          loading={loading}
          onResetFilters={() => {
            setSelectedCommune(isEn ? "All Areas" : "Tất cả");
            setActiveCategory(isEn ? "All Categories" : "Tất cả");
            setActiveAudience("all");
            setSearchQuery("");
            setSelectedClusterId(null);
          }}
        />
      </main>
    </div>
  );
}

export default function PlacesPage() {
  const { language } = useLanguage();
  const isEn = language === "en";

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF3E7] flex items-center justify-center">
          <div className="text-center">
            <Sparkles className="w-8 h-8 text-[#0E8C7F] animate-spin mx-auto mb-2" />
            <span className="text-xs font-bold text-[#6B6355]">
              {isEn ? "Loading destinations directory..." : "Đang tải danh sách địa điểm..."}
            </span>
          </div>
        </div>
      }
    >
      <PlacesPageContent />
    </Suspense>
  );
}
