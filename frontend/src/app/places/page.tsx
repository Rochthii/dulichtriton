"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import HotPlacesSection from "@/components/HotPlacesSection";
import GoldenTimeWidget from "@/components/GoldenTimeWidget";
import {
  MapPin,
  Clock,
  Ticket,
  Car,
  Bus,
  Map,
  Play,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Flame,
  Filter
} from "lucide-react";

interface Place {
  id: string;
  slug: string;
  name: string;
  commune: string;
  rating?: number;
  image_url: string;
  video_url?: string;
  opening_hours?: string;
  ticket_required?: boolean;
}

export default function PlacesPage() {
  const [activeCategory, setActiveCategory] = useState("Thiên nhiên");
  const [selectedCommune, setSelectedCommune] = useState("Tất cả Xã/Thị trấn");
  const [tiktokOnlyFilter, setTiktokOnlyFilter] = useState(false);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    "Thiên nhiên",
    "Văn hóa Khmer",
    "Check-in",
    "Gia đình",
    "Ẩm thực",
    "Phiêu lưu"
  ];

  useEffect(() => {
    async function loadLivePlaces() {
      setLoading(true);
      try {
        let query = supabase.from("places").select("*");

        if (selectedCommune !== "Tất cả Xã/Thị trấn") {
          query = query.eq("commune", selectedCommune);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          const formatted = data.map((item: any) => {
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
              commune: item.commune || "Tri Tôn",
              rating: item.rating || 4.8,
              image_url: img,
              video_url: item.video_url || `https://www.tiktok.com/search?q=${encodeURIComponent(item.name)}`,
              opening_hours: item.opening_hours || "Giờ mở cửa: 06:00 - 18:00",
              ticket_required: item.ticket_required || false
            };
          });
          setPlaces(formatted);
        } else {
          // Fallback verified data
          setPlaces([
            {
              id: "ho-ta-pa",
              slug: "ho-ta-pa",
              name: "Hồ Tà Pạ",
              commune: "Xã Núi Tô",
              image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuD16roz3p1vraj03J4TQ8pQjmkh22cgNqp6a26uh-IFkusv0Uv7iDQRvFHoxUYbly7_cQzS71RTtuKLxY0iRpj7jodngL55PUCTF7a0mTswwkWhW1dmlthPCcmIta6Y46GLZ8CoV3ddp_0Gc6mJzU_PntX-QD1rHTl0lAp9D9E3Kt2SpBx3WC4wDf9hUOWPFQ0j6woDZ7pQ7y8ly28ev_qzIzGzizwkcpusDMEbJ7b5_SBb5CuhuVXijA",
              opening_hours: "Giờ mở cửa: 06:00 - 18:00",
              ticket_required: false
            },
            {
              id: "chua-xvayton",
              slug: "chua-xvayton",
              name: "Chùa Xvayton",
              commune: "Thị trấn Tri Tôn",
              image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBAY74ptSCWY71V3s8s2Vw3B4Z4CIq-cXn9GQRLKigy5-JF2AYQO0HoAFvZQo1bbCtRrqrUk9vKHuBgyLU-uQBmIe3kc6TCgwBJ2Dx-r5woinSyrlTIoJuNZmmAOaHkOrapHZxsNygpDq16o168WAJSE9YOGB-zlJstjKoAhLfRfHD_bqvYjundbKtmS4CHKdA2zr2ToJ0bRnuzBi8uwVCEkmFMmxnq4Q2l-13vV99BFG5o3e8msgXq9Q",
              opening_hours: "Giờ mở cửa: 07:00 - 17:00",
              ticket_required: false
            },
            {
              id: "khu-di-tich-ba-chuc",
              slug: "khu-di-tich-ba-chuc",
              name: "Khu di tích Ba Chúc",
              commune: "Thị trấn Ba Chúc",
              image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCNzyuNGbE0cx9OXLA5pq7NaLHE4wOGcD8IVHsgxyUf-vGzNdg7o6xUa-X6g8fXJDflNfYAuOihSA3DfqZnmCaUgCnSzmZ-_-g_bldScCR6atBtvubVsSWe4xEiggaoVMvJ0LRjjWogy_DtPWulnILIUitYaqyg5H_citYCRD5YEsoj1_Va1cX4xSIOIHbesek4EIcOTvGErE97-REnIrpcjlmnEx1_bC1BlrRN8KEtTO-bBF0zdX1YGQ",
              opening_hours: "Giờ mở cửa: 07:00 - 18:00",
              ticket_required: false
            }
          ]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadLivePlaces();
  }, [selectedCommune]);

  return (
    <div className="flex min-h-screen flex-col bg-background font-body-base text-on-background antialiased">
      <main className="mx-auto w-full max-w-container-max flex-grow px-margin-mobile py-8 md:px-margin-desktop md:py-12">
        
        {/* Dynamic Hot Places Section */}
        <HotPlacesSection limit={6} title="🔥 CÁC ĐỊA ĐIỂM HOT NỔI TIẾNG NHẤT" />

        {/* Real-time Golden Time Widget */}
        <GoldenTimeWidget />

        {/* Section Title & Filter Dropdowns */}
        <section className="mb-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <h1 className="font-display-lg text-display-lg-mobile text-primary md:text-display-lg font-bold">
              Lọc địa điểm ({(tiktokOnlyFilter ? places.filter(p => p.video_url).length : places.length)} Địa Điểm Live)
            </h1>

            {/* TikTok Reels Filter Toggle Button */}
            <button
              onClick={() => setTiktokOnlyFilter(!tiktokOnlyFilter)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-xs shadow-md transition-all ${
                tiktokOnlyFilter
                  ? "bg-slate-900 text-amber-400 border border-amber-400/50 shadow-amber-500/20"
                  : "bg-surface border border-outline-variant text-on-surface hover:border-primary"
              }`}
            >
              <Play className={`h-4 w-4 ${tiktokOnlyFilter ? "fill-amber-400 text-amber-400" : "text-emerald-700"}`} />
              <span>🎵 BỘ LỌC TIKTOK REELS HOT-TREND</span>
              {tiktokOnlyFilter && <span className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black">BẬT</span>}
            </button>
          </div>

          {/* 4 Select Dropdowns */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            
            <div className="relative">
              <select
                value={selectedCommune}
                onChange={(e) => setSelectedCommune(e.target.value)}
                className="w-full appearance-none rounded-full border border-outline-variant bg-surface py-3 pl-4 pr-10 font-body-base text-on-surface focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary text-xs font-semibold"
              >
                <option value="Tất cả Xã/Thị trấn">Tất cả Xã/Thị trấn</option>
                <option value="Thị trấn Tri Tôn">Thị trấn Tri Tôn</option>
                <option value="Thị trấn Ba Chúc">Thị trấn Ba Chúc</option>
                <option value="Xã Cô Tô">Xã Cô Tô</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-outline">
                <ChevronDown className="h-5 w-5" />
              </div>
            </div>

            <div className="relative">
              <select
                onChange={(e) => setSelectedCommune(e.target.value)}
                className="w-full appearance-none rounded-full border border-outline-variant bg-surface py-3 pl-4 pr-10 font-body-base text-on-surface focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary text-xs font-semibold"
              >
                <option value="Xã Núi Tô">Xã Núi Tô</option>
                <option value="Xã An Tức">Xã An Tức</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-outline">
                <ChevronDown className="h-5 w-5" />
              </div>
            </div>

            <div className="relative">
              <select
                onChange={(e) => setSelectedCommune(e.target.value)}
                className="w-full appearance-none rounded-full border border-outline-variant bg-surface py-3 pl-4 pr-10 font-body-base text-on-surface focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary text-xs font-semibold"
              >
                <option value="Xã Châu Lăng">Xã Châu Lăng</option>
                <option value="Xã Lương Phi">Xã Lương Phi</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-outline">
                <ChevronDown className="h-5 w-5" />
              </div>
            </div>

            <div className="relative">
              <select
                onChange={(e) => setSelectedCommune(e.target.value)}
                className="w-full appearance-none rounded-full border border-outline-variant bg-surface py-3 pl-4 pr-10 font-body-base text-on-surface focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary text-xs font-semibold"
              >
                <option value="Xã Ô Lâm">Xã Ô Lâm</option>
                <option value="Xã Lê Trì">Xã Lê Trì</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-outline">
                <ChevronDown className="h-5 w-5" />
              </div>
            </div>

          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="mr-2 font-label-bold text-on-surface-variant text-xs font-bold">
              Category:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={
                  activeCategory === cat
                    ? "rounded-full border border-transparent bg-primary px-5 py-2 font-badge-tag font-bold text-white transition-all shadow-sm text-xs"
                    : "rounded-full border border-outline-variant bg-surface px-5 py-2 font-badge-tag text-on-surface-variant transition-all hover:border-primary text-xs font-semibold"
                }
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* Places Grid */}
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {(tiktokOnlyFilter ? places.filter(p => p.video_url && p.video_url.length > 0) : places).map((place) => (
            <article
              key={place.id}
              className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-lowest shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <Link href={`/places/${place.slug}`} className="relative aspect-video overflow-hidden">
                <img
                  src={place.image_url}
                  alt={place.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute left-4 top-4 rounded-full bg-secondary/90 px-3 py-1 font-badge-tag text-white shadow-sm backdrop-blur-sm text-xs font-semibold">
                  {place.commune}
                </div>
                {place.video_url && (
                  <div className="absolute right-4 top-4 rounded-full bg-slate-900/90 text-amber-400 px-2.5 py-1 font-badge-tag text-[10px] font-black shadow-sm backdrop-blur-sm flex items-center gap-1">
                    <Play className="h-3 w-3 fill-amber-400" />
                    <span>TikTok Reels</span>
                  </div>
                )}
              </Link>

              <div className="flex flex-grow flex-col p-6">
                <Link href={`/places/${place.slug}`}>
                  <h3 className="mb-3 flex items-center gap-2 font-headline-md text-headline-md text-primary font-bold text-lg group-hover:text-emerald-700 transition-colors">
                    <MapPin className="h-5 w-5 text-secondary fill-secondary shrink-0" />
                    {place.name}
                  </h3>
                </Link>

                <div className="mb-6 flex-grow space-y-2 font-body-sm text-body-sm text-on-surface-variant text-xs font-medium">
                  <p className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-outline" />
                    {place.opening_hours}
                  </p>
                  <p className="flex items-center gap-2">
                    <Ticket className="h-4 w-4 text-outline" />
                    {place.ticket_required ? "Vé: Có thu phí" : "Vé: Miễn phí"}
                  </p>
                  <p className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-outline" />
                    Đường ô tô di chuyển tốt
                  </p>
                </div>

                <div className="mt-auto flex gap-2">
                  <Link
                    href={`/places/${place.slug}`}
                    className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary py-2.5 font-label-bold text-xs font-bold text-white shadow-sm hover:bg-emerald-800 transition-colors"
                  >
                    Chi tiết
                  </Link>

                  {place.video_url && (
                    <a
                      href={place.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center p-2.5 rounded-full bg-slate-900 text-amber-400 hover:bg-slate-800 transition-colors shadow-sm"
                      title="Xem TikTok Review thực tế"
                    >
                      <Play className="h-4 w-4 fill-amber-400" />
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </section>

      </main>
    </div>
  );
}
