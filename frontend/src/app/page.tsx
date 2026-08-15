"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { fetchWithCache } from "@/lib/fastCache";
import localMasterPois from "@/data/triton_pois_full.json";
import SearchAutocomplete from "@/components/SearchAutocomplete";
import TriTonWeatherWidget from "@/components/TriTonWeatherWidget";
import { resolvePlaceExternalLinks } from "@/lib/externalLinks";
import { sanitizeDescription, getCategoryFallbackImage } from "@/lib/dataSanitizer";
import heroImagesData from "@/data/hero_images.json";
import FeedbackSection from "@/components/FeedbackSection";
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
  Landmark,
  Coins,
  HeartHandshake,
  Users,
  Eye
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
  audiences?: string[];
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
  emoji?: string;
  title: string;
  tagline: string;
  for_whom: string;
  duration: string;
  budget_range: string;
}

const CLUSTER_DEFS = [
  {
    id: "cluster-tapa",
    name: "Cụm Tà Pạ & Núi Tô",
    commune: "Xã Núi Tô & Xã Châu Lăng",
    badge: "Check-in Biểu Tượng",
    desc: "Hồ Tà Pạ, Chùa Tà Pạ, Cánh đồng lúa Tà Pạ, Hàng thốt nốt trái tim, Cổng trời Koh Kas.",
    link: "/places?commune=Xã Núi Tô",
    communeFilters: ["Núi Tô", "Châu Lăng"],
    nameKeywords: ["Tà Pạ", "Thốt Nốt", "Koh Kas", "Trái Tim", "Soài Chek", "Sân Cu"],
    fallbackImg: "https://res.cloudinary.com/dhjesnejt/image/upload/f_auto,q_auto:best,w_1600,c_fill/v1786758888/tri_ton_hero/hero_ho_ta_pa.avif",
  },
  {
    id: "cluster-othum",
    name: "Cụm Ô Lâm & Hồ Ô Thum",
    commune: "Xã Ô Lâm & Xã An Tức",
    badge: "Ẩm Thực & Lịch Sử",
    desc: "Gà Đốt Ô Thum lá chúc, Hồ Ô Thum, Chùa Kirivong Ô Lâm, Khu Di Tích Đồi Tức Dụp.",
    link: "/places?commune=Xã Ô Lâm",
    communeFilters: ["Ô Lâm", "An Tức"],
    nameKeywords: ["Ô Thum", "Tức Dụp", "Gà Đốt", "Kirivong", "Đồi Tức Dụp"],
    fallbackImg: "https://res.cloudinary.com/dhjesnejt/image/upload/f_auto,q_auto:best,w_1600,c_fill/v1786758535/tri_ton_hero/hero_dong_thot_not.jpg",
  },
  {
    id: "cluster-coto",
    name: "Cụm Cô Tô & Soài So",
    commune: "Xã Cô Tô, Xã Núi Tô & TT Tri Tôn",
    badge: "Trekking & Săn Mây",
    desc: "Đỉnh Núi Cô Tô 614m, Đá Vồ Hội, Suối Vàng Soài So, Hồ Soài So, Chùa Sà Lôn.",
    link: "/places?commune=Xã Cô Tô",
    communeFilters: ["Cô Tô", "Thị trấn Tri Tôn"],
    nameKeywords: ["Cô Tô", "Soài So", "Suối Vàng", "Vồ Hội", "Sân Tiên", "Phụng Hoàng Sơn", "Chùa Sà Lôn", "Xà Tón"],
    fallbackImg: "https://res.cloudinary.com/dhjesnejt/image/upload/f_auto,q_auto:best,w_1600,c_fill/v1786758531/tri_ton_hero/hero_hang_cong_ta_pa.jpg",
  },
  {
    id: "cluster-bachuc",
    name: "Cụm Ba Chúc & Lương Phi",
    commune: "Thị trấn Ba Chúc & Xã Lương Phi",
    badge: "Văn Hóa & Tâm Linh",
    desc: "Khu Di Tích Nhà Mồ Ba Chúc, Chùa Phi Lai, Chùa Tam Bửu, Căn cứ Ô Tà Sóc Núi Dài.",
    link: "/places?commune=Thị trấn Ba Chúc",
    communeFilters: ["Ba Chúc", "Lương Phi", "Lê Trì", "Lạc Quới", "Vĩnh Gia"],
    nameKeywords: ["Ba Chúc", "Nhà Mồ", "Phi Lai", "Tam Bửu", "Núi Tượng", "Núi Dài", "Ô Tà Sóc"],
    fallbackImg: "https://res.cloudinary.com/dhjesnejt/image/upload/f_auto,q_auto:best,w_1600,c_fill/v1786758891/tri_ton_hero/hero_chua_khmer_chikaeng.avif",
  },
];

type TimeSlot = "morning" | "noon" | "afternoon" | "evening";
type AudienceFilter = "all" | "youth" | "family" | "trekking" | "spiritual";

export default function HomePage() {
  const [activeTimeSlot, setActiveTimeSlot] = useState<TimeSlot>("morning");
  const [activeAudience, setActiveAudience] = useState<AudienceFilter>("all");
  const [selectedClusterId, setSelectedClusterId] = useState<string | null>(null);
  const [allMasterPlaces, setAllMasterPlaces] = useState<any[]>(() => localMasterPois as any[]);
  const [hotPlaces, setHotPlaces] = useState<PlaceItem[]>([]);
  const [liveFoods, setLiveFoods] = useState<FoodItem[]>([]);
  const [liveClusters, setLiveClusters] = useState<ClusterItem[]>(() => {
    return CLUSTER_DEFS.map((def) => {
      const matched = (localMasterPois as any[]).filter((p: any) => {
        const com = (p.commune || "").toLowerCase();
        const name = (p.name || "").toLowerCase();
        const matchCom = def.communeFilters.some((f) => com.includes(f.toLowerCase()));
        const matchKey = def.nameKeywords.some((k) => name.includes(k.toLowerCase()));
        return matchCom || matchKey;
      });
      return {
        id: def.id,
        name: def.name,
        commune: def.commune,
        badge: def.badge,
        desc: def.desc,
        img: def.fallbackImg,
        link: def.link,
        placeCount: matched.length > 0 ? matched.length : 12,
      };
    });
  });
  const [topPresets, setTopPresets] = useState<ItineraryCardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentHeroIdx, setCurrentHeroIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroIdx((prev) => (prev + 1) % heroImagesData.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        // 1. Fetch Hot Places live from Supabase (Zero Hardcoding)
        const cachedHot = await fetchWithCache("home-hot-places-live", async () => {
          const { data } = await supabase
            .from("places")
            .select("id, slug, name, category, commune, rating, photos, image_url, description, golden_time_windows, tags_info, is_hot")
            .eq("is_verified", true)
            .order("is_hot", { ascending: false })
            .order("rating", { ascending: false })
            .limit(25);

          if (data && data.length > 0) {
            const mapped = data.map((item: any) => {
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
                category: item.category || "check-in",
                commune: item.commune || "Tri Tôn, An Giang",
                rating: item.rating ? Number(item.rating) : 4.8,
                image_url: img,
                description: cleanDesc,
                has_story: Boolean(localMatch?.detailed_story && localMatch.detailed_story.length > 200),
                golden_time_windows: Array.isArray(item.golden_time_windows)
                  ? item.golden_time_windows
                  : ["06:00–08:30", "16:00–17:30"],
                cost_vnd: item.category === "food" ? "120.000đ - 250.000đ" : "Miễn phí vé",
              };
            });

            // Prioritize places with rich detailed stories
            mapped.sort((a: any, b: any) => {
              if (a.has_story && !b.has_story) return -1;
              if (!a.has_story && b.has_story) return 1;
              return (b.rating || 0) - (a.rating || 0);
            });

            return mapped;
          }
          return [];
        });
        if (cachedHot) setHotPlaces(cachedHot);

        // 2. Fetch Top Foods live from Supabase
        const cachedFoods = await fetchWithCache("home-foods-live", async () => {
          const { data: foodsData } = await supabase
            .from("places")
            .select("id, slug, name, commune, rating, photos, image_url, description, price_level")
            .ilike("category", "%food%")
            .order("rating", { ascending: false })
            .limit(10);

          if (foodsData && foodsData.length > 0) {
            const mappedFoods = foodsData.map((f: any) => {
              let img = getCategoryFallbackImage("food", f.name);
              if (f.image_url && typeof f.image_url === "string" && !f.image_url.includes("unsplash.com")) {
                img = f.image_url;
              } else if (Array.isArray(f.photos) && f.photos.length > 0) {
                const p0 = f.photos[0];
                const pUrl = typeof p0 === "string" ? p0 : p0?.url;
                if (pUrl && typeof pUrl === "string" && !pUrl.includes("unsplash.com")) img = pUrl;
              }

              const localMatch = (localMasterPois as any[]).find(lp => lp.id === f.id || lp.slug === f.slug || lp.name === f.name);

              return {
                id: f.id,
                slug: f.slug || f.id,
                name: f.name,
                commune: f.commune || "Tri Tôn",
                rating: f.rating ? Number(f.rating) : 4.9,
                image_url: img,
                description: sanitizeDescription(localMatch?.detailed_story || f.description, f.name, f.commune, 'food'),
                price_level: f.price_level || "Đặc sản bản địa",
                has_story: Boolean(localMatch?.detailed_story && localMatch.detailed_story.length > 200),
              };
            });

            mappedFoods.sort((a: any, b: any) => {
              if (a.has_story && !b.has_story) return -1;
              if (!a.has_story && b.has_story) return 1;
              return (b.rating || 0) - (a.rating || 0);
            });

            return mappedFoods.slice(0, 6);
          }
          return [];
        });
        if (cachedFoods) setLiveFoods(cachedFoods);

        // 3. Build 4 Geographic Clusters with accurate multi-commune matching
        const cachedClusters = await fetchWithCache("home-clusters-live-v3", async () => {
          const { data: allPlaces } = await supabase
            .from("places")
            .select("id, slug, name, commune, category, image_url, photos, rating, description, golden_time_windows")
            .eq("is_verified", true);

          const placesPool = (allPlaces && allPlaces.length > 0) ? allPlaces : (localMasterPois as any[]);
          setAllMasterPlaces(placesPool);

          return CLUSTER_DEFS.map((def) => {
            const matched = placesPool.filter((p: any) => {
              const com = (p.commune || "").toLowerCase();
              const name = (p.name || "").toLowerCase();
              const matchCom = def.communeFilters.some((f) => com.includes(f.toLowerCase()));
              const matchKey = def.nameKeywords.some((k) => name.includes(k.toLowerCase()));
              return matchCom || matchKey;
            });

            let img = def.fallbackImg;
            const placeWithImg = matched.find((p: any) => p.image_url && !p.image_url.includes("unsplash.com"));
            if (placeWithImg) img = placeWithImg.image_url;

            return {
              id: def.id,
              name: def.name,
              commune: def.commune,
              badge: def.badge,
              desc: def.desc,
              img,
              link: def.link,
              placeCount: matched.length > 0 ? matched.length : 12,
            };
          });
        });
        if (cachedClusters) setLiveClusters(cachedClusters);

        // 4. Fetch top presets dynamically from API / lichtrinh.json
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

  const activeCluster = useMemo(() => {
    if (!selectedClusterId) return null;
    return liveClusters.find((c) => c.id === selectedClusterId) || CLUSTER_DEFS.find((c) => c.id === selectedClusterId) || null;
  }, [selectedClusterId, liveClusters]);

  const activeClusterSpots = useMemo(() => {
    if (!selectedClusterId) return [];
    const def = CLUSTER_DEFS.find((c) => c.id === selectedClusterId);
    if (!def) return [];
    const placesPool = allMasterPlaces.length > 0 ? allMasterPlaces : (localMasterPois as any[]);
    const matched = placesPool.filter((p: any) => {
      const com = (p.commune || "").toLowerCase();
      const name = (p.name || "").toLowerCase();
      const matchCom = def.communeFilters.some((f) => com.includes(f.toLowerCase()));
      const matchKey = def.nameKeywords.some((k) => name.includes(k.toLowerCase()));
      return matchCom || matchKey;
    });

    return matched.map((item: any) => {
      let img = getCategoryFallbackImage(item.category, item.name);
      if (item.image_url && typeof item.image_url === "string" && !item.image_url.includes("unsplash.com")) {
        img = item.image_url;
      } else if (Array.isArray(item.photos) && item.photos.length > 0) {
        const p0 = item.photos[0];
        const pUrl = typeof p0 === "string" ? p0 : p0?.url;
        if (pUrl && typeof pUrl === "string" && !pUrl.includes("unsplash.com")) img = pUrl;
      }

      return {
        id: item.id,
        slug: item.slug || item.id,
        name: item.name,
        category: item.category || "check-in",
        commune: item.commune || "Tri Tôn, An Giang",
        rating: item.rating ? Number(item.rating) : 4.8,
        image_url: img,
        description: sanitizeDescription(item.description, item.name, item.commune, item.category),
        golden_time_windows: Array.isArray(item.golden_time_windows) ? item.golden_time_windows : ["06:00–08:30", "16:00–17:30"],
        cost_vnd: item.category === "food" ? "120.000đ - 250.000đ" : "Miễn phí vé",
      };
    }).slice(0, 8);
  }, [selectedClusterId, allMasterPlaces]);

  // Filter spots by time of day & audience persona
  const filteredSpots = hotPlaces.filter((p) => {
    const name = p.name.toLowerCase();
    const cat = p.category.toLowerCase();

    // Audience filtering
    if (activeAudience === "youth") {
      const matchYouth = name.includes("tà pạ") || name.includes("cổng trời") || name.includes("vồ hội") || name.includes("thốt nốt") || cat.includes("check-in");
      if (!matchYouth) return false;
    } else if (activeAudience === "family") {
      const matchFamily = name.includes("chùa") || name.includes("gà đốt") || name.includes("tức dụp") || name.includes("hồ ô thum") || name.includes("nhà mồ");
      if (!matchFamily) return false;
    } else if (activeAudience === "trekking") {
      const matchTrek = name.includes("cô tô") || name.includes("núi") || name.includes("suối vàng") || name.includes("vồ hội") || name.includes("săn mây");
      if (!matchTrek) return false;
    } else if (activeAudience === "spiritual") {
      const matchSpiritual = name.includes("chùa") || name.includes("nhà mồ") || name.includes("phi lai") || cat.includes("spiritual") || cat.includes("culture");
      if (!matchSpiritual) return false;
    }

    // Time slot filtering
    if (activeTimeSlot === "morning") {
      return (
        name.includes("tà pạ") ||
        name.includes("cô tô") ||
        name.includes("săn mây") ||
        name.includes("koh kas") ||
        name.includes("chùa") ||
        cat.includes("spiritual") ||
        cat.includes("nature")
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
        name.includes("bánh bò") ||
        cat.includes("check-in")
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
    <div className="flex min-h-screen flex-col bg-[#FAF3E7] text-[#26221B] antialiased font-body">
      <main className="mx-auto flex w-full max-w-7xl flex-grow flex-col gap-6 sm:gap-10 px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        
        {/* ── 1. HERO SECTION & QUICK PAIN-POINT CHIPS ───────────────────── */}
        <section className="relative w-full rounded-[28px] overflow-hidden shadow-[0_10px_30px_rgba(38,34,27,0.14)] min-h-[480px] sm:min-h-[540px] flex items-center justify-center bg-[#151B34] border border-[#26221B]/10 group">
          {/* Rotating Hero Background Slideshow */}
          {heroImagesData.map((img, idx) => (
            <div
              key={img.id}
              className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out ${
                idx === currentHeroIdx
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-105 pointer-events-none"
              }`}
              style={{
                backgroundImage: `url('${img.image_url}')`,
              }}
            />
          ))}

          {/* Folk-Modern Dark Scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#151B34] via-[#151B34]/60 to-[#0E8C7F]/35 backdrop-blur-[0.5px]" />

          {/* Location Indicator Tag (Bottom Right) */}
          <div className="absolute bottom-4 right-4 z-20 hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md text-white text-[11px] font-medium border border-white/20 shadow-sm">
            <MapPin className="w-3.5 h-3.5 text-[#FFD37A]" />
            <span>{heroImagesData[currentHeroIdx]?.title} ({heroImagesData[currentHeroIdx]?.location})</span>
          </div>

          {/* Hero Carousel Navigation Dots (Bottom Left) */}
          <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 shadow-sm">
            {heroImagesData.map((_, dotIdx) => (
              <button
                key={dotIdx}
                onClick={() => setCurrentHeroIdx(dotIdx)}
                aria-label={`Slide ${dotIdx + 1}`}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  dotIdx === currentHeroIdx
                    ? "w-6 bg-[#FFD37A]"
                    : "w-2 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>

          <div className="relative z-10 w-full max-w-4xl p-4 sm:p-8 text-center space-y-4 sm:space-y-6">
            {/* Verified Stamp Badge */}
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#0E8C7F]/90 backdrop-blur-md text-[#FFD37A] text-xs font-bold border border-[#FFD37A]/30 shadow-md font-display">
              <Sparkles className="h-3.5 w-3.5 text-[#FFD37A]" />
              <span>Cổng Thông Tin Du Lịch Thông Minh Tri Tôn 2026</span>
            </div>

            {/* Main Title in Bricolage Grotesque */}
            <h1 className="font-display font-extrabold text-3xl sm:text-5xl md:text-6xl text-[#FFFDF7] tracking-tight leading-tight drop-shadow-md">
              Khám Phá Vẻ Đẹp <br className="hidden sm:inline" />
              <span className="text-[#F0A32F] drop-shadow-lg">Huyền Bí Bảy Núi Tri Tôn</span>
            </h1>

            <p className="font-body text-xs sm:text-sm text-[#FAF3E7]/90 max-w-2xl mx-auto font-medium leading-relaxed drop-shadow-xs">
              149 thắng cảnh đã xác minh thực tế • 35 lịch trình gợi ý • Bản đồ ẩm thực Gà Đốt Ô Thum & Di sản Chùa Khmer.
            </p>

            {/* Smart Search Bar */}
            <div className="w-full max-w-xl mx-auto">
              <SearchAutocomplete />
            </div>

            {/* Pain-Point Search Chips (Giải quyết điểm mù du khách) */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <span className="text-[11px] font-bold text-[#FAF3E7]/70 font-display">Tìm nhanh theo nhu cầu:</span>
              <Link
                href="/itinerary?slug=kinh-dien-1-ngay"
                className="px-3 py-1 rounded-full bg-[#FAF3E7]/15 hover:bg-[#F0A32F] hover:text-[#26221B] text-[#FFFDF7] text-xs font-bold backdrop-blur-sm border border-white/20 transition-all active:scale-95"
              >
                Sợ hết giờ
              </Link>
              <button
                type="button"
                onClick={() => setActiveAudience("family")}
                className="px-3 py-1 rounded-full bg-[#FAF3E7]/15 hover:bg-[#F0A32F] hover:text-[#26221B] text-[#FFFDF7] text-xs font-bold backdrop-blur-sm border border-white/20 transition-all active:scale-95"
              >
                Đi với người lớn tuổi
              </button>
              <Link
                href="/food"
                className="px-3 py-1 rounded-full bg-[#FAF3E7]/15 hover:bg-[#F0A32F] hover:text-[#26221B] text-[#FFFDF7] text-xs font-bold backdrop-blur-sm border border-white/20 transition-all active:scale-95"
              >
                Muốn ăn gà đốt Ô Thum
              </Link>
              <Link
                href="/culture"
                className="px-3 py-1 rounded-full bg-[#FAF3E7]/15 hover:bg-[#F0A32F] hover:text-[#26221B] text-[#FFFDF7] text-xs font-bold backdrop-blur-sm border border-white/20 transition-all active:scale-95"
              >
                Viếng Chùa Xvayton
              </Link>
            </div>

            {/* 4 Instant Action Shortcuts (Pills) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 max-w-2xl mx-auto">
              <Link
                href="/planner"
                className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xs group font-display"
              >
                <Compass className="w-4 h-4 text-[#F0A32F] group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold">35 Lịch Trình</span>
              </Link>

              <Link
                href="/food"
                className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xs group font-display"
              >
                <Utensils className="w-4 h-4 text-[#F26B3A] group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold">Ăn Gì Tri Tôn</span>
              </Link>

              <Link
                href="/map"
                className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xs group font-display"
              >
                <Navigation className="w-4 h-4 text-[#0E8C7F] group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold">Bản Đồ GPS</span>
              </Link>

              <Link
                href="/chatbot"
                className="p-3 rounded-full bg-[#F0A32F] hover:bg-[#C97F1B] text-[#26221B] hover:text-white flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md group font-display"
              >
                <Bot className="w-4 h-4 text-[#26221B] group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold">Hỏi AI Trợ Lý</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ── 2. REALTIME TRI TON WEATHER TELEMETRY ──────────────────────── */}
        <section>
          <TriTonWeatherWidget />
        </section>

        {/* ── 3. AUDIENCE PERSONA FILTER & TIME-SLOT TABS ───────────────── */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#0E8C7F] uppercase tracking-wider mb-1 font-display">
                <Users className="w-4 h-4" />
                <span>Gợi Ý Trải Nghiệm Tùy Chỉnh</span>
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[#26221B] tracking-tight">
                Điểm Đến Lý Tưởng Theo Khung Giờ & Đối Tượng
              </h2>
            </div>

            {/* Persona Chips */}
            <div className="flex flex-wrap items-center gap-1.5 font-display">
              {[
                { key: "all", label: "Tất Cả" },
                { key: "youth", label: "📸 Sống Ảo" },
                { key: "family", label: "👨‍👩‍👧‍👦 Gia Đình" },
                { key: "trekking", label: "🥾 Săn Mây" },
                { key: "spiritual", label: "🙏 Tâm Linh" },
              ].map((aud) => (
                <button
                  key={aud.key}
                  onClick={() => setActiveAudience(aud.key as AudienceFilter)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all tap-bounce ${
                    activeAudience === aud.key
                      ? "bg-[#0E8C7F] text-white shadow-xs"
                      : "bg-[#FFFDF7] border border-[#26221B]/8 text-[#6B6355] hover:border-[#0E8C7F]/30"
                  }`}
                >
                  {aud.label}
                </button>
              ))}
            </div>
          </div>

          {/* Time Slots Filter Tabs - Compact & Sleek */}
          <div className="grid grid-cols-4 gap-1 sm:gap-2 bg-[#FFFDF7] p-1 sm:p-1.5 rounded-2xl sm:rounded-[22px] border border-[#26221B]/8 shadow-xs font-display">
            {[
              { key: "morning", mobileLabel: "Sáng sớm", desktopLabel: "Sáng sớm (06:00 - 08:30)", icon: Sunrise, desc: "Săn mây & Hồ Tà Pạ" },
              { key: "noon", mobileLabel: "Buổi trưa", desktopLabel: "Buổi trưa (11:00 - 13:30)", icon: Sun, desc: "Gà Đốt Ô Thum" },
              { key: "afternoon", mobileLabel: "Chiều tà", desktopLabel: "Chiều tà (15:30 - 17:30)", icon: Sunset, desc: "Cổng trời Koh Kas" },
              { key: "evening", mobileLabel: "Buổi tối", desktopLabel: "Buổi tối (18:00 - 21:00)", icon: Moon, desc: "Chợ đêm & Phố" },
            ].map((slot) => {
              const Icon = slot.icon;
              const isActive = activeTimeSlot === slot.key;
              return (
                <button
                  key={slot.key}
                  type="button"
                  onClick={() => setActiveTimeSlot(slot.key as TimeSlot)}
                  className={`py-1.5 sm:py-2.5 px-1 sm:px-2 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center text-center transition-all tap-bounce cursor-pointer ${
                    isActive
                      ? "bg-[#F0A32F] text-[#26221B] shadow-xs font-black"
                      : "hover:bg-[#FAF3E7] text-[#6B6355]"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 mb-0.5 sm:mb-1 ${isActive ? "text-[#26221B]" : "text-[#0E8C7F]"}`} />
                  <span className="text-[10px] sm:text-xs font-bold leading-tight line-clamp-1">
                    <span className="sm:hidden">{slot.mobileLabel}</span>
                    <span className="hidden sm:inline">{slot.desktopLabel}</span>
                  </span>
                  <span className={`text-[9px] hidden sm:block mt-0.5 ${isActive ? "text-[#26221B]/80" : "text-[#6B6355]/70"}`}>
                    {slot.desc}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Time Slot POI Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 pt-2">
            {filteredSpots.map((place) => {
              const { maps, tiktok } = resolvePlaceExternalLinks({
                name: place.name,
                commune: place.commune,
              });
              return (
                <div
                  key={place.id}
                  className="bg-[#FFFDF7] rounded-2xl sm:rounded-[26px] border border-[#26221B]/8 shadow-[0_2px_8px_rgba(38,34,27,0.06)] hover:shadow-[0_8px_24px_rgba(38,34,27,0.12)] transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:-translate-y-1"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                    <img
                      src={place.image_url}
                      alt={place.name}
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#26221B]/75 via-[#26221B]/15 to-transparent" />
                    
                    <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
                      <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[11px] font-bold bg-[#0E8C7F]/90 text-white backdrop-blur-md shadow-xs border border-[#0E8C7F]/30 font-display">
                        {place.commune}
                      </span>
                    </div>

                    <div className="absolute bottom-2 left-2 sm:left-3 right-2 sm:right-3 text-white">
                      <h3 className="font-display text-xs sm:text-base font-bold line-clamp-1 drop-shadow-sm text-[#FFFDF7]">
                        {place.name}
                      </h3>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2 sm:space-y-3 font-body">
                    <p className="text-[10px] sm:text-xs text-[#6B6355] line-clamp-2 leading-relaxed">
                      {sanitizeDescription(place.description, place.name, place.commune, place.category)}
                    </p>

                    <div className="pt-1.5 sm:pt-2 border-t border-[#26221B]/6 flex items-center justify-between text-[9px] sm:text-xs font-display">
                      <div className="flex items-center gap-1 text-[#0E8C7F] truncate">
                        <Clock className="w-3 h-3 shrink-0" />
                        <span className="truncate">{place.golden_time_windows?.[0] || "06:00 - 08:30"}</span>
                      </div>
                      <span className="font-bold text-[#D9822B] shrink-0 text-[10px] sm:text-[11px]">{place.cost_vnd}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 sm:gap-2 pt-1 font-display">
                      <Link
                        href={`/places/${place.slug}`}
                        className="flex-1 text-center py-1.5 sm:py-2 px-1 sm:px-3 rounded-xl sm:rounded-full bg-[#FAF3E7] hover:bg-[#0E8C7F] hover:text-white text-[#0E8C7F] text-[10px] sm:text-xs font-bold transition-all tap-bounce"
                      >
                        Chi Tiết
                      </Link>
                      <a
                        href={maps.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-0.5 sm:gap-1 py-1.5 sm:py-2 px-1 sm:px-3 rounded-xl sm:rounded-full bg-[#F0A32F] hover:bg-[#C97F1B] text-[#26221B] hover:text-white text-[10px] sm:text-xs font-bold shadow-xs transition-all tap-bounce"
                      >
                        <Navigation className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        <span>Chỉ Đường</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 4. 4 GEOGRAPHIC TOURISM CLUSTERS (ACCURATE MULTI-COMMUNE) ───── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#F0A32F] uppercase tracking-wider mb-1 font-display">
                <Mountain className="w-4 h-4" />
                <span>Quy Hoạch Địa Lý Du Lịch</span>
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[#26221B] tracking-tight">
                4 Cụm Thắng Cảnh Trọng Điểm Bảy Núi
              </h2>
            </div>
            <Link
              href="/places"
              prefetch={true}
              className="text-xs font-bold text-[#0E8C7F] hover:text-[#0B6B60] flex items-center gap-1 transition-colors font-display"
            >
              <span>Xem tất cả 149 điểm</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6">
            {liveClusters.map((cluster) => {
              const isSelected = selectedClusterId === cluster.id;
              return (
                <button
                  key={cluster.id}
                  type="button"
                  onClick={() => setSelectedClusterId(isSelected ? null : cluster.id)}
                  className={`group relative text-left bg-[#FFFDF7] rounded-2xl sm:rounded-[28px] overflow-hidden transition-all duration-300 flex flex-col justify-between cursor-pointer tap-bounce ${
                    isSelected
                      ? "border-2 border-[#0E8C7F] ring-4 ring-[#0E8C7F]/25 shadow-xl -translate-y-1.5"
                      : "border border-[#26221B]/8 shadow-[0_2px_8px_rgba(38,34,27,0.06)] hover:shadow-[0_8px_24px_rgba(38,34,27,0.12)] hover:-translate-y-1"
                  }`}
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                    <img
                      src={cluster.img}
                      alt={cluster.name}
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#26221B]/80 via-[#26221B]/15 to-transparent" />
                    
                    <div className="absolute top-2 sm:top-3 left-2 sm:left-3 right-2 sm:right-3 flex items-center justify-between">
                      <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[11px] font-bold bg-[#F0A32F] text-[#26221B] shadow-xs font-display">
                        {cluster.badge}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[11px] font-bold bg-[#151B34]/90 text-[#FFD37A] border border-[#FFD37A]/30 font-display">
                        {cluster.placeCount} điểm
                      </span>
                    </div>

                    <div className="absolute bottom-2 left-2 sm:left-3 right-2 sm:right-3 text-white">
                      <h3 className="font-display text-xs sm:text-base font-bold drop-shadow-sm text-[#FFFDF7] line-clamp-1">
                        {cluster.name}
                      </h3>
                      <p className="text-[10px] sm:text-[11px] text-[#FAF3E7]/80 flex items-center gap-1 mt-0.5 font-body truncate">
                        <MapPin className="w-3 h-3 text-[#0E8C7F] shrink-0" />
                        <span className="truncate">{cluster.commune}</span>
                      </p>
                    </div>
                  </div>

                  {/* Desc */}
                  <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2 sm:space-y-3 font-body">
                    <p className="text-[10px] sm:text-xs text-[#6B6355] leading-relaxed line-clamp-2">
                      {cluster.desc}
                    </p>

                    <div className="pt-1.5 sm:pt-2 border-t border-[#26221B]/6 flex items-center justify-between text-[10px] sm:text-xs font-bold text-[#0E8C7F] font-display">
                      <span>{isSelected ? "⚡ Đang lọc xem danh sách" : `Lọc xem (${cluster.placeCount} điểm)`}</span>
                      <ArrowRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? "rotate-90 text-[#0E8C7F]" : "group-hover:translate-x-1"}`} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Instant In-Memory Cluster Spotlight Panel */}
          {selectedClusterId && activeCluster && (
            <div className="mt-4 p-4 sm:p-6 rounded-3xl bg-[#FFFDF7] border-2 border-[#0E8C7F]/30 shadow-md space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#26221B]/8 font-display">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-2xl bg-[#0E8C7F]/10 text-[#0E8C7F]">
                    <MapPin className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="font-display font-extrabold text-base sm:text-lg text-[#26221B]">
                      Điểm Đến Thuộc: {activeCluster.name}
                    </h3>
                    <p className="text-xs text-[#6B6355] font-body">{activeCluster.commune} • {activeClusterSpots.length} địa điểm tiêu biểu</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={activeCluster.link}
                    prefetch={true}
                    className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-[#0E8C7F] text-white text-xs font-bold hover:bg-[#0B6B60] transition-colors shadow-xs"
                  >
                    <span>Xem tất cả điểm cụm này</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    onClick={() => setSelectedClusterId(null)}
                    className="px-3 py-2 rounded-full bg-[#FAF3E7] hover:bg-[#26221B]/10 text-[#6B6355] hover:text-[#26221B] text-xs font-bold cursor-pointer"
                  >
                    Đóng
                  </button>
                </div>
              </div>

              {/* POI Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
                {activeClusterSpots.map((spot: any) => {
                  const { maps } = resolvePlaceExternalLinks({
                    name: spot.name,
                    commune: spot.commune,
                  });
                  return (
                    <div
                      key={spot.id}
                      className="bg-[#FAF3E7] rounded-2xl sm:rounded-[22px] border border-[#26221B]/8 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                    >
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-200">
                        <img
                          src={spot.image_url}
                          alt={spot.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#26221B]/80 via-transparent to-transparent" />
                        <div className="absolute bottom-2 left-2 right-2 text-white">
                          <h4 className="font-display text-xs sm:text-sm font-bold line-clamp-1 drop-shadow-sm text-[#FFFDF7]">
                            {spot.name}
                          </h4>
                          <p className="text-[10px] text-[#FAF3E7]/80 truncate">{spot.commune}</p>
                        </div>
                      </div>

                      <div className="p-2.5 sm:p-3 space-y-2 flex-1 flex flex-col justify-between font-body">
                        <p className="text-[10px] sm:text-xs text-[#6B6355] line-clamp-2 leading-relaxed">
                          {spot.description}
                        </p>
                        <div className="flex items-center gap-1 pt-1 font-display">
                          <Link
                            href={`/places/${spot.slug}`}
                            className="flex-1 text-center py-1.5 rounded-xl bg-white hover:bg-[#0E8C7F] hover:text-white text-[#0E8C7F] text-[10px] sm:text-xs font-bold transition-all border border-[#0E8C7F]/20"
                          >
                            Chi Tiết
                          </Link>
                          <a
                            href={maps.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 rounded-xl bg-[#F0A32F] hover:bg-[#C97F1B] text-[#26221B] hover:text-white text-[10px] sm:text-xs font-bold transition-all"
                          >
                            <Navigation className="w-3 h-3" />
                            <span>Chỉ Đường</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* ── 5. TOP ITINERARY TICKET-STUBS ──────────────────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#0E8C7F] uppercase tracking-wider mb-1 font-display">
                <Compass className="w-4 h-4" />
                <span>Hành Trình Gợi Ý Tối Ưu</span>
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[#26221B] tracking-tight">
                Lịch Trình Thực Địa Phổ Biến Nhất
              </h2>
            </div>
            <Link
              href="/planner"
              className="text-xs font-bold text-[#0E8C7F] hover:text-[#0B6B60] flex items-center gap-1 transition-colors font-display"
            >
              <span>Xem 35 lịch trình</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {topPresets.map((itin) => (
              <Link
                key={itin.slug}
                href={`/itinerary?slug=${itin.slug}`}
                className="ticket-stub bg-[#FFFDF7] rounded-2xl sm:rounded-[26px] p-3 sm:p-5 border border-[#26221B]/8 shadow-[0_2px_8px_rgba(38,34,27,0.06)] hover:shadow-[0_8px_24px_rgba(38,34,27,0.12)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5 sm:mb-2 font-display">
                    <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-[#0E8C7F]/10 text-[#0E8C7F] text-[9px] sm:text-[11px] font-bold border border-[#0E8C7F]/20">
                      {itin.duration}
                    </span>
                    <span className="font-bold text-[#D9822B] text-[10px] sm:text-xs flex items-center gap-0.5 sm:gap-1">
                      <Coins className="w-3 h-3 text-[#D9822B]" />
                      <span>{itin.budget_range}</span>
                    </span>
                  </div>

                  <h3 className="font-display text-xs sm:text-base font-bold text-[#26221B] line-clamp-1 mb-1">
                    {itin.title}
                  </h3>
                  <p className="font-body text-[10px] sm:text-xs text-[#6B6355] line-clamp-2 leading-relaxed">
                    {itin.tagline}
                  </p>
                </div>

                <div className="pt-2 sm:pt-3 mt-2 sm:mt-3 border-t border-[#26221B]/6 flex items-center justify-between text-[10px] sm:text-xs text-[#6B6355] font-display">
                  <span className="truncate max-w-[80px] sm:max-w-[130px]">{itin.for_whom}</span>
                  <span className="text-[#0E8C7F] font-bold flex items-center gap-1">
                    <span>Xem tour</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── 6. FEEDBACK & COMMUNITY CONTRIBUTION ──────────────────────── */}
        <FeedbackSection />

        {/* ── 7. 24/7 SOS EMERGENCY HOTLINE BANNER ──────────────────────── */}
        <section className="bg-gradient-to-br from-[#151B34] to-[#1E2647] rounded-[28px] p-6 sm:p-8 text-white border border-white/10 shadow-lg font-body">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#A6503A] text-white text-[11px] font-bold uppercase tracking-wider font-display">
                <Shield className="w-3.5 h-3.5" />
                <span>Tổng Đài Cứu Hộ & An Ninh Du Khách 24/7</span>
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[#FFFDF7]">
                Đồng Hành An Toàn Trên Mọi Cung Đường Bảy Núi
              </h2>
              <p className="text-xs text-white/80 leading-relaxed">
                Khi gặp sự cố hỏng xe giữa đèo, lạc đường hoặc cần trợ giúp y tế khẩn cấp, vui lòng liên hệ ngay đường dây nóng chính thức của Công an & Trung tâm Y tế Tri Tôn.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 shrink-0 font-display">
              <a
                href="tel:0296.3874.113"
                className="p-3.5 rounded-[20px] bg-white/10 hover:bg-[#F0A32F] hover:text-[#26221B] border border-white/15 text-center transition-all tap-bounce"
              >
                <Phone className="w-5 h-5 mx-auto mb-1 text-[#FFD37A]" />
                <span className="text-[11px] block text-white/70">Công An Tri Tôn</span>
                <strong className="text-xs block text-[#FFFDF7]">0296.3874.113</strong>
              </a>

              <a
                href="tel:0296.3874.115"
                className="p-3.5 rounded-[20px] bg-white/10 hover:bg-[#0E8C7F] hover:text-white border border-white/15 text-center transition-all tap-bounce"
              >
                <HeartHandshake className="w-5 h-5 mx-auto mb-1 text-[#FFD37A]" />
                <span className="text-[11px] block text-white/70">Cấp Cứu Y Tế</span>
                <strong className="text-xs block text-[#FFFDF7]">0296.3874.115</strong>
              </a>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
