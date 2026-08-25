"use client";

import React, { useEffect, useState, useMemo } from "react";
import localMasterPois from "@/data/triton_pois_full.json";
import { fetchWithCache } from "@/lib/fastCache";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import FoodHeroBanner from "@/components/food/FoodHeroBanner";
import FoodCulinaryAdvisory from "@/components/food/FoodCulinaryAdvisory";
import FoodMustTrySection, { FoodItem } from "@/components/food/FoodMustTrySection";
import FoodFilterBar, { FoodSpecialtyCategory } from "@/components/food/FoodFilterBar";
import FoodPlacesGrid from "@/components/food/FoodPlacesGrid";

function getInitialFoodList(): FoodItem[] {
  const gastronomyList = (localMasterPois as any[])
    .filter(
      (p) =>
        p.category === "gastronomy" ||
        p.category === "food" ||
        (p.id && (p.id.startsWith("AT") || p.id.startsWith("CF") || p.id.startsWith("DS"))) ||
        (p.name && (p.name.toLowerCase().includes('gà đốt') || p.name.toLowerCase().includes('quán') || p.name.toLowerCase().includes('bò') || p.name.toLowerCase().includes('bún cá') || p.name.toLowerCase().includes('cà phê') || p.name.toLowerCase().includes('cafe')))
    )
    .map((p) => {
      let img = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop";
      if (p.image_url && typeof p.image_url === "string" && p.image_url.startsWith("http")) {
        img = p.image_url;
      } else if (Array.isArray(p.photos) && p.photos.length > 0) {
        const p0 = p.photos[0];
        if (typeof p0 === "string" && p0.startsWith("http")) img = p0;
        else if (p0 && typeof p0 === "object" && p0.url) img = p0.url;
      }

      return {
        id: p.id,
        slug: p.slug || p.id,
        name: p.name,
        name_en: p.name_en,
        category: p.category || "gastronomy",
        category_en: p.category_en,
        tourism_category: p.tourism_category || "Ẩm Thực Đặc Sản",
        commune: p.commune || "Thị trấn Tri Tôn",
        rating: p.rating ? Number(p.rating) : 4.8,
        image_url: img,
        video_url: p.video_url || `https://www.tiktok.com/search/video?q=${encodeURIComponent(p.name + " Tri Tôn")}`,
        hours: p.night_hours || p.opening_hours || (p.open_late ? "15:00 - 23:30" : "06:30 - 21:00"),
        description: p.description || "",
        description_en: p.description_en,
        detailed_story: p.detailed_story,
        detailed_story_en: p.detailed_story_en,
        open_late: !!p.open_late,
        night_hours: p.night_hours,
        phone: p.phone,
        price_level: p.price_level || "35k - 150k",
        address: p.address || "",
        is_hot: !!p.is_hot || (p.rating && p.rating >= 4.8),
      };
    });

  gastronomyList.sort((a, b) => {
    const aHasStory = Boolean(a.detailed_story && a.detailed_story.length > 200);
    const bHasStory = Boolean(b.detailed_story && b.detailed_story.length > 200);
    if (aHasStory && !bHasStory) return -1;
    if (!aHasStory && bHasStory) return 1;
    if (a.is_hot && !b.is_hot) return -1;
    if (!a.is_hot && b.is_hot) return 1;
    return (b.rating || 0) - (a.rating || 0);
  });

  return gastronomyList;
}

export default function FoodPage() {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [foods, setFoods] = useState<FoodItem[]>(getInitialFoodList);
  const [selectedCategory, setSelectedCategory] = useState<FoodSpecialtyCategory>('all');
  const [selectedCommune, setSelectedCommune] = useState("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    function processFoodData(json: any) {
      if (json?.food && json.food.length > 0) {
        const formatted: FoodItem[] = json.food.map((item: any) => {
          let img = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop";
          if (item.image_url && typeof item.image_url === "string" && item.image_url.startsWith("http")) {
            img = item.image_url;
          } else if (Array.isArray(item.photos) && item.photos.length > 0) {
            const p0 = item.photos[0];
            if (typeof p0 === "string" && p0.startsWith("http")) img = p0;
            else if (p0 && typeof p0 === "object" && p0.url) img = p0.url;
          }

          const localMatch = (localMasterPois as any[]).find(lp => lp.id === item.id || lp.slug === item.slug || lp.name === item.name);

          return {
            id: item.id,
            slug: item.slug || item.id,
            name: item.name,
            name_en: localMatch?.name_en,
            category: item.category || "gastronomy",
            category_en: localMatch?.category_en,
            tourism_category: item.tourism_category || "Ẩm Thực Đặc Sản",
            commune: item.commune || "Thị trấn Tri Tôn",
            rating: item.rating ? Number(item.rating) : 4.8,
            image_url: img,
            video_url: item.video_url || `https://www.tiktok.com/search/video?q=${encodeURIComponent(item.name + " Tri Tôn")}`,
            hours: item.night_hours || item.opening_hours || (item.open_late ? "15:00 - 23:30" : "06:30 - 21:00"),
            description: item.description || "",
            description_en: localMatch?.description_en,
            detailed_story: item.detailed_story,
            detailed_story_en: localMatch?.detailed_story_en,
            open_late: !!item.open_late,
            night_hours: item.night_hours,
            phone: item.phone,
            price_level: item.price_level || "35k - 150k",
            address: item.address || "",
            is_hot: !!item.is_hot || (item.rating && item.rating >= 4.8),
          };
        });

        formatted.sort((a, b) => {
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
            processFoodData(freshJson);
          }
        );
        processFoodData(json);
      } catch (err) {
        console.warn("API fetch failed, using local master:", err);
      }
    }
    loadLiveFoodData();
  }, []);

  const topSignatureHotFoods = useMemo(() => foods.slice(0, 4), [foods]);

  const communes = useMemo(() => {
    const set = new Set<string>();
    foods.forEach((f) => {
      if (f.commune && f.commune.trim()) set.add(f.commune.trim());
    });
    return ["Tất cả", ...Array.from(set).sort((a, b) => a.localeCompare(b, "vi"))];
  }, [foods]);

  const categoryCounts = useMemo(() => {
    return {
      all: foods.length,
      ga_dot: foods.filter(p => p.name.toLowerCase().includes('gà đốt') || p.name.toLowerCase().includes('ô thum')).length,
      bo_7_mon: foods.filter(p => p.name.toLowerCase().includes('bò 7 món') || p.name.toLowerCase().includes('bò nướng') || (p.name.toLowerCase().includes('ba chúc') && p.name.toLowerCase().includes('bò'))).length,
      chao_bo: foods.filter(p => p.name.toLowerCase().includes('cháo bò') || p.name.toLowerCase().includes('bún cá') || p.name.toLowerCase().includes('bánh canh')).length,
      banh_bo: foods.filter(p => p.name.toLowerCase().includes('bánh bò') || p.name.toLowerCase().includes('đu đủ đâm') || p.name.toLowerCase().includes('thốt nốt') || p.name.toLowerCase().includes('chè') || p.name.toLowerCase().includes('bánh kẹp')).length,
      cafe: foods.filter(p => p.name.toLowerCase().includes('cà phê') || p.name.toLowerCase().includes('cafe') || p.name.toLowerCase().includes('coffee')).length,
      night: foods.filter(p => p.open_late || (p.night_hours && p.night_hours.length > 0) || (p.hours && (p.hours.includes('21:') || p.hours.includes('22:') || p.hours.includes('23:')))).length,
    };
  }, [foods]);

  const filteredFoods = useMemo(() => {
    return foods.filter((f) => {
      const n = f.name.toLowerCase();
      
      if (selectedCategory === 'ga_dot' && !(n.includes('gà đốt') || n.includes('ô thum'))) return false;
      if (selectedCategory === 'bo_7_mon' && !(n.includes('bò 7 món') || n.includes('bò nướng') || (n.includes('ba chúc') && n.includes('bò')))) return false;
      if (selectedCategory === 'chao_bo' && !(n.includes('cháo bò') || n.includes('bún cá') || n.includes('bánh canh'))) return false;
      if (selectedCategory === 'banh_bo' && !(n.includes('bánh bò') || n.includes('đu đủ đâm') || n.includes('thốt nốt') || n.includes('chè') || n.includes('bánh kẹp'))) return false;
      if (selectedCategory === 'cafe' && !(n.includes('cà phê') || n.includes('cafe') || n.includes('coffee'))) return false;
      if (selectedCategory === 'night' && !(f.open_late || (f.night_hours && f.night_hours.length > 0) || (f.hours && (f.hours.includes('21:') || f.hours.includes('22:') || f.hours.includes('23:'))))) return false;

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
  }, [foods, selectedCategory, selectedCommune, searchQuery]);

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF3E7] font-body text-[#26221B] antialiased">
      {/* Background Graphic Accents */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-emerald-300/15 blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-[30rem] h-[30rem] rounded-full bg-amber-300/15 blur-3xl" />
      </div>

      <main className="relative z-10 mx-auto w-full max-w-7xl flex-grow flex-col space-y-8 px-4 py-8 md:px-6 md:py-10">
        {/* 1. Banner */}
        <FoodHeroBanner />

        {/* 2. Cẩm nang thực khách */}
        <FoodCulinaryAdvisory />

        {/* 3. Top 4 Đặc Sản Hot Nhất */}
        {!searchQuery && selectedCommune === "Tất cả" && selectedCategory === 'all' && (
          <FoodMustTrySection foods={topSignatureHotFoods} />
        )}

        {/* 4. Bộ lọc & Tìm kiếm */}
        <FoodFilterBar
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedCommune={selectedCommune}
          setSelectedCommune={setSelectedCommune}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          communes={communes}
          categoryCounts={categoryCounts}
        />

        {/* 5. Food Places Grid */}
        <FoodPlacesGrid
          foods={filteredFoods}
          loading={loading}
          onResetFilters={() => {
            setSelectedCategory("all");
            setSelectedCommune("Tất cả");
            setSearchQuery("");
          }}
        />
      </main>
    </div>
  );
}
