"use client";

import React, { useEffect, useState, useMemo } from "react";
import localMasterPois from "@/data/triton_pois_full.json";
import { fetchWithCache } from "@/lib/fastCache";
import CultureHeroBanner from "@/components/culture/CultureHeroBanner";
import CultureFestivalsSection from "@/components/culture/CultureFestivalsSection";
import CulturePagodaRulesSection from "@/components/culture/CulturePagodaRulesSection";
import CultureHeritageStoriesSection from "@/components/culture/CultureHeritageStoriesSection";
import CulturePlacesGrid, { CulturePlace } from "@/components/culture/CulturePlacesGrid";

export default function CulturePage() {
  const [cultures, setCultures] = useState<CulturePlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<string>("ALL");

  const handleAskAi = (query: string) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("triton:open-chat", { detail: { query } }));
    }
  };

  useEffect(() => {
    function processCultureData(json: any) {
      const data = Array.isArray(json) ? json : (json?.culture || []);
      if (data && data.length > 0) {
        const formatted: CulturePlace[] = data.map((item: any) => {
          let img = "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1200&auto=format&fit=crop";
          if (item.image_url && typeof item.image_url === "string" && item.image_url.startsWith("http")) {
            img = item.image_url;
          } else if (Array.isArray(item.photos) && item.photos.length > 0) {
            const p0 = item.photos[0];
            if (typeof p0 === "string" && p0.startsWith("http")) img = p0;
            else if (p0 && typeof p0 === "object" && p0.url) img = p0.url;
          }

          const localMatch = (localMasterPois as any[]).find(
            (lp) => lp.id === item.id || lp.slug === item.slug || lp.name === item.name
          );

          return {
            id: item.id,
            slug: item.slug || item.id,
            name: item.name,
            name_en: localMatch?.name_en,
            category: item.category || "culture",
            category_en: localMatch?.category_en,
            tourism_category: item.tourism_category || "Văn Hóa & Di Tích",
            commune: item.commune || "Thị trấn Tri Tôn",
            rating: item.rating ? Number(item.rating) : 4.9,
            image_url: img,
            description: item.description || "",
            description_en: localMatch?.description_en,
            detailed_story: item.detailed_story || "",
            detailed_story_en: localMatch?.detailed_story_en,
            is_hot: !!item.is_hot || (item.rating && item.rating >= 4.8),
          };
        });

        formatted.sort((a, b) => {
          if (a.is_hot && !b.is_hot) return -1;
          if (!a.is_hot && b.is_hot) return 1;
          return (b.rating || 0) - (a.rating || 0);
        });

        setCultures(formatted);
      }
    }

    async function loadCulturePlaces() {
      try {
        const json = await fetchWithCache(
          "client-culture-places-catalog-v1",
          async () => {
            const res = await fetch("/api/v1/culture?limit=60");
            return await res.json();
          },
          60 * 60 * 1000,
          (freshJson) => {
            processCultureData(freshJson);
          }
        );
        processCultureData(json);
      } catch (err) {
        console.warn("Fetch culture places error, using local:", err);
      } finally {
        setLoading(false);
      }
    }

    loadCulturePlaces();
  }, []);

  const filteredCultures = useMemo(() => {
    if (selectedTab === "ALL") return cultures;
    if (selectedTab === "PAGODA") {
      return cultures.filter(
        (c) =>
          c.name.toLowerCase().includes("chùa") ||
          c.name.toLowerCase().includes("pagoda") ||
          c.name.toLowerCase().includes("wat")
      );
    }
    if (selectedTab === "RELIC") {
      return cultures.filter(
        (c) =>
          c.name.toLowerCase().includes("nhà mồ") ||
          c.name.toLowerCase().includes("di tích") ||
          c.name.toLowerCase().includes("ô tà sóc") ||
          c.name.toLowerCase().includes("tức dụp") ||
          c.name.toLowerCase().includes("đồi")
      );
    }
    if (selectedTab === "HERITAGE") {
      return cultures.filter(
        (c) =>
          !c.name.toLowerCase().includes("chùa") &&
          !c.name.toLowerCase().includes("nhà mồ") &&
          !c.name.toLowerCase().includes("di tích")
      );
    }
    return cultures;
  }, [cultures, selectedTab]);

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF3E7] font-body text-[#26221B] antialiased">
      {/* Background Graphics */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-emerald-300/15 blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-[30rem] h-[30rem] rounded-full bg-amber-300/15 blur-3xl" />
      </div>

      <main className="relative z-10 mx-auto w-full max-w-7xl flex-grow flex-col space-y-10 px-4 py-8 md:px-6 md:py-10">
        {/* 1. Hero Banner */}
        <CultureHeroBanner />

        {/* 2. 6 Đại Lễ Hội Bảy Núi */}
        <CultureFestivalsSection onAskAi={handleAskAi} />

        {/* 3. 5 Quy Chuẩn Viếng Chùa Khmer */}
        <CulturePagodaRulesSection />

        {/* 4. Kho Tàng Di Sản Văn Hóa Bảy Núi */}
        <CultureHeritageStoriesSection onAskAi={handleAskAi} />

        {/* 5. Danh Sách 37 Chùa & Di Tích Lịch Sử */}
        <CulturePlacesGrid
          cultures={filteredCultures}
          loading={loading}
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
        />
      </main>
    </div>
  );
}
