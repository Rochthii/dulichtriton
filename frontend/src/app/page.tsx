"use client";

import React, { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { fetchWithCache } from "@/lib/fastCache";
import localMasterPois from "@/data/triton_pois_full.json";
import TriTonWeatherWidget from "@/components/TriTonWeatherWidget";
import SmartTripBuilderMini from "@/components/SmartTripBuilderMini";
import FeedbackSection from "@/components/FeedbackSection";
import HomeHeroSection from "@/components/home/HomeHeroSection";
import HomeTimeSlotSection, { TimeSlot, AudienceFilter, TimeSlotPlace } from "@/components/home/HomeTimeSlotSection";
import HomeClustersSection, { ClusterItem } from "@/components/home/HomeClustersSection";
import HomeItinerariesSection, { ItineraryCardItem } from "@/components/home/HomeItinerariesSection";
import HomeEmergencyBanner from "@/components/home/HomeEmergencyBanner";
import { getCategoryFallbackImage, sanitizeDescription } from "@/lib/dataSanitizer";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const CLUSTER_DEFS: ClusterItem[] = [
  {
    id: "cluster-tapa",
    name: "Cụm Tà Pạ & Núi Tô",
    commune: "Xã Núi Tô & Xã Châu Lăng",
    badge: "Check-in Biểu Tượng",
    desc: "Hồ Tà Pạ, Chùa Tà Pạ, Cánh đồng lúa Tà Pạ, Hàng thốt nốt trái tim, Cổng trời Koh Kas.",
    link: "/places?cluster=cluster-tapa",
    communeFilters: ["Núi Tô", "Châu Lăng"],
    nameKeywords: ["Tà Pạ", "Thốt Nốt", "Koh Kas", "Trái Tim", "Soài Chek", "Sân Cu"],
    img: "https://res.cloudinary.com/dhjesnejt/image/upload/f_auto,q_auto:best,w_1600,c_fill/v1786758888/tri_ton_hero/hero_ho_ta_pa.avif",
  },
  {
    id: "cluster-othum",
    name: "Cụm Ô Lâm & Hồ Ô Thum",
    commune: "Xã Ô Lâm & Xã An Tức",
    badge: "Ẩm Thực & Lịch Sử",
    desc: "Gà Đốt Ô Thum lá chúc, Hồ Ô Thum, Chùa Kirivong Ô Lâm, Khu Di Tích Đồi Tức Dụp.",
    link: "/places?cluster=cluster-othum",
    communeFilters: ["Ô Lâm", "An Tức"],
    nameKeywords: ["Ô Thum", "Tức Dụp", "Gà Đốt", "Kirivong", "Đồi Tức Dụp"],
    img: "https://res.cloudinary.com/dhjesnejt/image/upload/f_auto,q_auto:best,w_1600,c_fill/v1786758535/tri_ton_hero/hero_dong_thot_not.jpg",
  },
  {
    id: "cluster-coto",
    name: "Cụm Cô Tô & Soài So",
    commune: "Xã Cô Tô, Xã Núi Tô & TT Tri Tôn",
    badge: "Trekking & Săn Mây",
    desc: "Đỉnh Núi Cô Tô 614m, Đá Vồ Hội, Suối Vàng Soài So, Hồ Soài So, Chùa Sà Lôn.",
    link: "/places?cluster=cluster-coto",
    communeFilters: ["Cô Tô", "Thị trấn Tri Tôn"],
    nameKeywords: ["Cô Tô", "Soài So", "Suối Vàng", "Vồ Hội", "Sân Tiên", "Phụng Hoàng Sơn", "Chùa Sà Lôn", "Xà Tón"],
    img: "https://res.cloudinary.com/dhjesnejt/image/upload/f_auto,q_auto:best,w_1600,c_fill/v1786758531/tri_ton_hero/hero_hang_cong_ta_pa.jpg",
  },
  {
    id: "cluster-bachuc",
    name: "Cụm Ba Chúc & Lương Phi",
    commune: "Thị trấn Ba Chúc & Xã Lương Phi",
    badge: "Văn Hóa & Tâm Linh",
    desc: "Khu Di Tích Nhà Mồ Ba Chúc, Chùa Phi Lai, Chùa Tam Bửu, Căn cứ Ô Tà Sóc Núi Dài.",
    link: "/places?cluster=cluster-bachuc",
    communeFilters: ["Ba Chúc", "Lương Phi", "Lê Trì", "Lạc Quới", "Vĩnh Gia"],
    nameKeywords: ["Ba Chúc", "Nhà Mồ", "Phi Lai", "Tam Bửu", "Núi Tượng", "Núi Dài", "Ô Tà Sóc"],
    img: "https://res.cloudinary.com/dhjesnejt/image/upload/f_auto,q_auto:best,w_1600,c_fill/v1786758891/tri_ton_hero/hero_chua_khmer_chikaeng.avif",
  },
];

function getInitialHotPlaces(): TimeSlotPlace[] {
  return (localMasterPois as any[])
    .filter((p) => p.is_hot || p.rating >= 4.8)
    .slice(0, 16)
    .map((p) => {
      let img = getCategoryFallbackImage(p.category, p.name);
      if (p.image_url && typeof p.image_url === "string" && !p.image_url.includes("unsplash.com")) {
        img = p.image_url;
      }
      return {
        id: p.id,
        slug: p.slug || p.id,
        name: p.name,
        name_en: p.name_en,
        category: p.category || "check-in",
        category_en: p.category_en,
        commune: p.commune || "Tri Tôn, An Giang",
        rating: p.rating ? Number(p.rating) : 4.8,
        image_url: img,
        description: sanitizeDescription(p.detailed_story || p.description, p.name, p.commune, p.category),
        description_en: p.description_en,
        golden_time_windows: Array.isArray(p.golden_time_windows) ? p.golden_time_windows : ["06:00–08:30", "16:00–17:30"],
        cost_vnd: p.category === "food" ? "120.000đ - 250.000đ" : "Miễn phí vé",
        cost_vnd_en: p.cost_vnd_en || (p.category === "food" ? "$5 - $10" : "Free"),
        tiktok_videos: p.tiktok_videos,
      };
    });
}

function getInitialPresets(): ItineraryCardItem[] {
  return [
    {
      slug: "tour-1-ngay-tapa-othum",
      title: "Tri Tôn 1 Ngày: Tà Pạ & Gà Đốt Ô Thum",
      title_en: "Tri Ton 1 Day: Ta Pa & O Thum Roasted Chicken",
      tagline: "Lộ trình biểu tượng số 1 khám phá trọn vẹn điểm nhấn Bảy Núi trong 24h",
      tagline_en: "The #1 iconic route to explore Seven Mountains highlights in 24 hours",
      for_whom: "Du khách đi trong ngày, gia đình & nhóm bạn",
      for_whom_en: "Day-trippers, families & friend groups",
      duration: "1 Ngày (06:30 – 17:30)",
      duration_en: "1 Day (06:30 – 17:30)",
      budget_range: "350.000đ – 550.000đ/người",
      budget_range_en: "$14 – $22/person",
      emoji: "🌅",
    },
    {
      slug: "tour-2n1d-chinh-phuc-co-to",
      title: "Tri Tôn 2N1Đ: Săn Mây Cô Tô & Di Sản Khmer",
      title_en: "Tri Ton 2D1N: Mount Co To Clouds & Khmer Heritage",
      tagline: "Hành trình đêm ngắm sao Bảy Núi, đón bình minh Vồ Hội Mẹ và viếng 5 ngôi cổ tự",
      tagline_en: "Stargazing night, sunrise on Vo Hoi Me peak and visiting 5 ancient pagodas",
      for_whom: "Giới trẻ, phượt thủ & người yêu văn hóa",
      for_whom_en: "Youth, backpackers & cultural enthusiasts",
      duration: "2 Ngày 1 Đêm",
      duration_en: "2 Days 1 Night",
      budget_range: "850.000đ – 1.350.000đ/người",
      budget_range_en: "$34 – $54/person",
      emoji: "🏕️",
    },
    {
      slug: "tour-foodtour-bay-nui",
      title: "Food Tour Bảy Núi: Gà Đốt, Cháo Bò & Bò 7 Món",
      title_en: "Seven Mountains Food Tour: Chicken, Beef Porridge & 7 Dishes",
      tagline: "Trọn vẹn phong vị ẩm thực Khmer - Kinh độc nhất vô nhị xứ Bảy Núi",
      tagline_en: "Authentic fusion flavors of Khmer & Vietnamese culinary heritage",
      for_whom: "Tín đồ ẩm thực & trải nghiệm vị giác",
      for_whom_en: "Food lovers & culinary explorers",
      duration: "1–2 Ngày",
      duration_en: "1–2 Days",
      budget_range: "450.000đ – 750.000đ/người",
      budget_range_en: "$18 – $30/person",
      emoji: "🍗",
    },
    {
      slug: "tour-di-san-tam-linh",
      title: "Hành Trình Di Sản Tâm Linh & Làng Nghề Cổ",
      title_en: "Spiritual Heritage & Ancient Craft Villages",
      tagline: "Chiêm bái kinh lá buông cổ Chùa Xvayton và làng gốm đất nung Phnôm Pi",
      tagline_en: "Ancient leaf scriptures at Xvayton Pagoda & Phnom Pi terracotta pottery",
      for_whom: "Người lớn tuổi, gia đình & nhà nghiên cứu",
      for_whom_en: "Seniors, families & researchers",
      duration: "1 Ngày",
      duration_en: "1 Day",
      budget_range: "300.000đ – 500.000đ/người",
      budget_range_en: "$12 – $20/person",
      emoji: "🛕",
    }
  ];
}

export default function HomePage() {
  const { dict } = useLanguage();

  const [activeTimeSlot, setActiveTimeSlot] = useState<TimeSlot>("morning");
  const [activeAudience, setActiveAudience] = useState<AudienceFilter>("all");
  const [selectedClusterId, setSelectedClusterId] = useState<string | null>(null);
  const [allMasterPlaces, setAllMasterPlaces] = useState<any[]>(() => localMasterPois as any[]);
  const [hotPlaces, setHotPlaces] = useState<TimeSlotPlace[]>(() => getInitialHotPlaces());
  const [topPresets] = useState<ItineraryCardItem[]>(() => getInitialPresets());

  const liveClusters = useMemo(() => {
    const list = dict.home?.clustersList || CLUSTER_DEFS;
    return list.map((def: any) => {
      const origDef = CLUSTER_DEFS.find((d) => d.id === def.id) || def;
      const matched = (allMasterPlaces || []).filter((p: any) => {
        const com = (p.commune || "").toLowerCase();
        const name = (p.name || "").toLowerCase();
        const matchCom = origDef.communeFilters?.some((f: string) => com.includes(f.toLowerCase()));
        const matchKey = origDef.nameKeywords?.some((k: string) => name.includes(k.toLowerCase()));
        return matchCom || matchKey;
      });
      return {
        id: def.id,
        name: def.name,
        commune: def.commune,
        badge: def.badge,
        desc: def.desc,
        img: def.fallbackImg || origDef.img,
        link: def.link,
        placeCount: matched.length > 0 ? matched.length : 12,
        communeFilters: origDef.communeFilters,
        nameKeywords: origDef.nameKeywords,
      };
    });
  }, [dict.home, allMasterPlaces]);

  useEffect(() => {
    // Non-blocking Parallel Background SWR Revalidation (0ms Initial Paint)
    async function loadData() {
      try {
        Promise.allSettled([
          // 1. Fetch Hot Places live from Supabase
          fetchWithCache("home-hot-places-live", async () => {
            const { data } = await supabase
              .from("places")
              .select("id, slug, name, category, commune, rating, photos, image_url, description, golden_time_windows, tags_info, is_hot")
              .eq("is_verified", true)
              .order("is_hot", { ascending: false })
              .order("rating", { ascending: false })
              .limit(25);

            if (data && data.length > 0) {
              return data.map((item: any) => {
                let img = getCategoryFallbackImage(item.category, item.name);
                if (item.image_url && typeof item.image_url === "string" && !item.image_url.includes("unsplash.com")) {
                  img = item.image_url;
                } else if (Array.isArray(item.photos) && item.photos.length > 0) {
                  const p0 = item.photos[0];
                  const pUrl = typeof p0 === "string" ? p0 : p0?.url;
                  if (pUrl && typeof pUrl === "string" && !pUrl.includes("unsplash.com")) img = pUrl;
                }

                const localMatch = (localMasterPois as any[]).find(lp => lp.id === item.id || lp.slug === item.slug || lp.name === item.name);
                const cleanDesc = sanitizeDescription(localMatch?.detailed_story || item.description, item.name, item.commune, item.category);

                return {
                  id: item.id,
                  slug: item.slug || item.id,
                  name: item.name,
                  name_en: localMatch?.name_en,
                  category: item.category || "check-in",
                  category_en: localMatch?.category_en,
                  commune: item.commune || "Tri Tôn, An Giang",
                  rating: item.rating ? Number(item.rating) : 4.8,
                  image_url: img,
                  description: cleanDesc,
                  description_en: localMatch?.description_en,
                  golden_time_windows: Array.isArray(item.golden_time_windows) ? item.golden_time_windows : ["06:00–08:30", "16:00–17:30"],
                  cost_vnd: item.category === "food" ? "120.000đ - 250.000đ" : "Miễn phí vé",
                  cost_vnd_en: localMatch?.cost_vnd_en || (item.category === "food" ? "$5 - $10" : "Free"),
                  tiktok_videos: localMatch?.tiktok_videos,
                };
              });
            }
            return [];
          }).then((cachedHot) => {
            if (cachedHot && cachedHot.length > 0) setHotPlaces(cachedHot);
          }),

          // 2. Fetch all verified places for cluster lookup
          fetchWithCache("home-clusters-live-v3", async () => {
            const { data: allPlaces } = await supabase
              .from("places")
              .select("id, slug, name, commune, category, image_url, photos, rating, description, golden_time_windows")
              .eq("is_verified", true);

            if (allPlaces && allPlaces.length > 0) {
              setAllMasterPlaces(allPlaces);
            }
            return allPlaces;
          }),
        ]);
      } catch (err) {
        console.error("Home data load error:", err);
      }
    }

    loadData();
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF3E7] text-[#26221B] antialiased font-body">
      <main className="mx-auto flex w-full max-w-7xl flex-grow flex-col gap-6 sm:gap-10 px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        
        {/* ── 1. HERO SECTION & QUICK PAIN-POINT CHIPS ───────────────────── */}
        <HomeHeroSection onSelectAudience={(aud) => setActiveAudience(aud as AudienceFilter)} />

        {/* ── 2. REALTIME TRI TON WEATHER TELEMETRY ──────────────────────── */}
        <section>
          <TriTonWeatherWidget />
        </section>

        {/* ── 2.5. SMART TRIP BUILDER MINI (Find My Tour) ───────────────── */}
        <section>
          <SmartTripBuilderMini />
        </section>

        {/* ── 3. AUDIENCE PERSONA FILTER & TIME-SLOT TABS ───────────────── */}
        <HomeTimeSlotSection
          activeAudience={activeAudience}
          setActiveAudience={setActiveAudience}
          activeTimeSlot={activeTimeSlot}
          setActiveTimeSlot={setActiveTimeSlot}
          places={hotPlaces}
        />

        {/* ── 4. 4 GEOGRAPHIC TOURISM CLUSTERS (ACCURATE MULTI-COMMUNE) ───── */}
        <HomeClustersSection
          clusters={liveClusters}
          selectedClusterId={selectedClusterId}
          setSelectedClusterId={setSelectedClusterId}
          allPlaces={allMasterPlaces}
        />

        {/* ── 5. TOP ITINERARY TICKET-STUBS ──────────────────────────────── */}
        <HomeItinerariesSection presets={topPresets} />

        {/* ── 6. FEEDBACK & COMMUNITY CONTRIBUTION ──────────────────────── */}
        <FeedbackSection />

        {/* ── 7. 24/7 SOS EMERGENCY HOTLINE BANNER ──────────────────────── */}
        <HomeEmergencyBanner />

      </main>
    </div>
  );
}
