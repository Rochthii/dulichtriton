"use client";

import React, { useEffect, useState, useMemo } from "react";
import localStaysJson from "@/data/tri_ton_stays.json";
import { fetchWithCache } from "@/lib/fastCache";
import StayHeroBanner from "@/components/stay/StayHeroBanner";
import StayTopSpotlight, { StayItem } from "@/components/stay/StayTopSpotlight";
import StayFilterBar, { StayFilterGroup } from "@/components/stay/StayFilterBar";
import StayPlacesGrid from "@/components/stay/StayPlacesGrid";
import StayBookingTips from "@/components/stay/StayBookingTips";

export default function StayPage() {
  const [stays, setStays] = useState<StayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<StayFilterGroup>("all");

  useEffect(() => {
    function processStayData(data: any[]) {
      if (data && data.length > 0) {
        const formatted: StayItem[] = data.map((item: any) => {
          let img =
            "https://res.cloudinary.com/dhjesnejt/image/upload/f_auto,q_auto:best,w_1600,c_fill/v1786758535/tri_ton_hero/hero_dong_thot_not.jpg";
          if (item.image_url && typeof item.image_url === "string" && item.image_url.startsWith("http")) {
            img = item.image_url;
          } else if (Array.isArray(item.photos) && item.photos.length > 0) {
            const p0 = item.photos[0];
            if (typeof p0 === "string" && p0.startsWith("http")) img = p0;
            else if (p0 && typeof p0 === "object" && p0.url) img = p0.url;
          }

          let sType: "homestay" | "hotel" | "camping" | "motel" = item.stay_type || "hotel";
          const lowerName = (item.name || "").toLowerCase();
          const lowerSub = (item.subcategory || "").toLowerCase();
          if (lowerName.includes("camping") || lowerName.includes("cắm trại") || lowerSub.includes("cắm trại")) {
            sType = "camping";
          } else if (lowerName.includes("homestay") || lowerSub.includes("homestay")) {
            sType = "homestay";
          } else if (lowerName.includes("nhà nghỉ") || lowerName.includes("nhà trọ") || lowerSub.includes("nhà nghỉ")) {
            sType = "motel";
          } else if (lowerName.includes("hotel") || lowerName.includes("khách sạn") || lowerName.includes("resort")) {
            sType = "hotel";
          }

          return {
            id: item.id,
            slug: item.slug || item.id,
            name: item.name,
            name_en: item.name_en,
            category: item.category || "stay",
            subcategory: item.subcategory || "Cơ sở lưu trú",
            tourism_category: item.tourism_category || "Homestay & Khách Sạn",
            commune: item.commune || "Thị trấn Tri Tôn",
            rating: item.rating ? Number(item.rating) : 4.8,
            image_url: img,
            video_url: item.video_url || `https://www.tiktok.com/search/video?q=${encodeURIComponent(item.name + " Tri Tôn")}`,
            address: item.address || "",
            phone: item.phone || item.hotline,
            hotline: item.hotline || item.phone,
            price_level: item.price_level || "150k - 450k/đêm",
            description: item.description || "",
            description_en: item.description_en,
            detailed_story: item.detailed_story || "",
            detailed_story_en: item.detailed_story_en,
            stay_type: sType,
            is_hot: !!item.is_hot || (item.rating && item.rating >= 4.8),
          };
        });

        formatted.sort((a, b) => {
          if (a.is_hot && !b.is_hot) return -1;
          if (!a.is_hot && b.is_hot) return 1;
          return (b.rating || 0) - (a.rating || 0);
        });

        setStays(formatted);
      }
    }

    async function loadStays() {
      try {
        const json = await fetchWithCache(
          "client-stays-places-catalog-v1",
          async () => {
            const res = await fetch("/api/v1/stays");
            if (res.ok) {
              const resData = await res.json();
              if (resData.stays && resData.stays.length > 0) return resData.stays;
            }
            return localStaysJson as any[];
          },
          60 * 60 * 1000,
          (freshData) => {
            processStayData(freshData);
          }
        );
        processStayData(json);
      } catch (err) {
        console.warn("Fetch stays error, fallback:", err);
      } finally {
        setLoading(false);
      }
    }

    loadStays();
  }, []);

  const topSpotlightStays = useMemo(() => stays.slice(0, 3), [stays]);

  const counts = useMemo(() => {
    return {
      all: stays.length,
      homestay_camping: stays.filter((s) => s.stay_type === "homestay" || s.stay_type === "camping").length,
      hotel_resort: stays.filter((s) => s.stay_type === "hotel").length,
      motel: stays.filter((s) => s.stay_type === "motel").length,
    };
  }, [stays]);

  const filteredStays = useMemo(() => {
    if (activeFilter === "all") return stays;
    if (activeFilter === "homestay_camping") {
      return stays.filter((s) => s.stay_type === "homestay" || s.stay_type === "camping");
    }
    if (activeFilter === "hotel_resort") {
      return stays.filter((s) => s.stay_type === "hotel");
    }
    if (activeFilter === "motel") {
      return stays.filter((s) => s.stay_type === "motel");
    }
    return stays;
  }, [stays, activeFilter]);

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF3E7] font-body text-[#26221B] antialiased">
      {/* Background Graphics */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-emerald-300/15 blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-[30rem] h-[30rem] rounded-full bg-amber-300/15 blur-3xl" />
      </div>

      <main className="relative z-10 mx-auto w-full max-w-7xl flex-grow flex-col space-y-8 px-4 py-8 md:px-6 md:py-10">
        {/* 1. Hero Banner */}
        <StayHeroBanner />

        {/* 2. Top 3 Spotlight Stays */}
        {activeFilter === "all" && <StayTopSpotlight stays={topSpotlightStays} />}

        {/* 3. Filter Bar */}
        <StayFilterBar activeFilter={activeFilter} setActiveFilter={setActiveFilter} counts={counts} />

        {/* 4. Places Grid */}
        <StayPlacesGrid stays={filteredStays} loading={loading} onResetFilter={() => setActiveFilter("all")} />

        {/* 5. Booking Tips */}
        <StayBookingTips />
      </main>
    </div>
  );
}
