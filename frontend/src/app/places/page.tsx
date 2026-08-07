"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  MapPin,
  Clock,
  Ticket,
  Car,
  Bus,
  Map,
  Play,
  ChevronRight,
  ChevronDown
} from "lucide-react";

interface Place {
  id: string;
  slug: string;
  name: string;
  commune: string;
  rating?: number;
  image_url: string;
  opening_hours?: string;
  ticket_required?: boolean;
}

export default function PlacesPage() {
  const [activeCategory, setActiveCategory] = useState("Thiên nhiên");
  const [selectedCommune, setSelectedCommune] = useState("Tất cả Xã/Thị trấn");
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
            let img = "https://images.unsplash.com/photo-1506744038136-46273834b3fb";
            if (Array.isArray(item.photos) && item.photos.length > 0) {
              img = item.photos[0];
            }
            return {
              id: item.id,
              slug: item.slug || item.id,
              name: item.name,
              commune: item.commune || "Tri Tôn",
              rating: item.rating || 4.8,
              image_url: img,
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
        
        {/* Section Title & Filter Dropdowns */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h1 className="font-display-lg text-display-lg-mobile text-primary md:text-display-lg font-bold">
              Lọc địa điểm ({places.length} Địa Điểm Live)
            </h1>
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
          {places.map((place) => (
            <article
              key={place.id}
              className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-lowest shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <Link href={`/places`} className="relative aspect-video overflow-hidden">
                <img
                  src={place.image_url}
                  alt={place.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute left-4 top-4 rounded-full bg-secondary/90 px-3 py-1 font-badge-tag text-white shadow-sm backdrop-blur-sm text-xs font-semibold">
                  {place.commune}
                </div>
              </Link>

              <div className="flex flex-grow flex-col p-6">
                <Link href={`/places`}>
                  <h3 className="mb-3 flex items-center gap-2 font-headline-md text-headline-md text-primary font-bold text-lg">
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

                <div className="mt-auto flex gap-3">
                  <Link
                    href={`/map`}
                    className="flex flex-1 items-center justify-center gap-2 rounded-full border border-primary bg-surface py-2.5 font-label-bold text-xs font-bold text-primary transition-colors hover:bg-emerald-light"
                  >
                    <Map className="h-4 w-4" /> Xem bản đồ
                  </Link>
                  <a
                    href={`https://www.tiktok.com/search?q=${encodeURIComponent(place.name + " Tri Tôn An Giang")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary py-2.5 font-label-bold text-xs font-bold text-white shadow-sm transition-colors hover:bg-emerald-800 relative z-20 cursor-pointer"
                  >
                    <Play className="h-4 w-4 fill-white" /> Xem TikTok
                  </a>
                </div>
              </div>
            </article>
          ))}
        </section>

      </main>
    </div>
  );
}
