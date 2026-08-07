"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import HotPlacesSection from "@/components/HotPlacesSection";
import { Hotel, MapPin, Star, ChevronRight, Wifi, Car, ShieldCheck } from "lucide-react";

interface StayItem {
  id: string;
  name: string;
  category: string;
  commune: string;
  rating?: number;
  image_url: string;
}

export default function StayPage() {
  const [stays, setStays] = useState<StayItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLiveStayData() {
      try {
        const { data, error } = await supabase
          .from("places")
          .select("id, slug, name, category, commune, rating, photos, image_url, video_url")
          .or("category.ilike.%lưu trú%,category.ilike.%homestay%,category.ilike.%khách sạn%,category.ilike.%nhà nghỉ%");

        if (!error && data && data.length > 0) {
          const formatted = data.map((item: any) => {
            let img = "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=1200&auto=format&fit=crop";
            if (item.image_url && typeof item.image_url === "string" && item.image_url.startsWith("http")) {
              img = item.image_url;
            } else if (Array.isArray(item.photos) && item.photos.length > 0) {
              const p0 = item.photos[0];
              if (typeof p0 === "string" && p0.startsWith("http")) img = p0;
              else if (p0 && typeof p0 === "object" && p0.url) img = p0.url;
            }
            return {
              id: item.id,
              name: item.name,
              category: item.category || "Lưu Trú Tri Tôn",
              commune: item.commune || "Tri Tôn",
              rating: item.rating || 4.8,
              image_url: img,
              video_url: item.video_url || `https://www.tiktok.com/search?q=${encodeURIComponent(item.name)}`
            };
          });
          setStays(formatted);
        } else {
          // Fallback master stays
          setStays([
            {
              id: "soai-chek-homestay",
              name: "Soài Chek Eco Homestay View Hồ",
              category: "Homestay Sinh Thái",
              commune: "Xã Núi Tô",
              rating: 4.9,
              image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCEZigADSpj84ieydADEOQHzdJZkN0zsctfaByCdnhe7Kptx1Rh3rpQPiK_hjkkL8vcmOG_-QNX9DqegPHEImIum516b2ArKqeKj_Vbp100cfGcbYNgqKDSGzFPxRW0_JVid0sV9Cn7iq3iDqYedl_zXYdczxg_yNfXTv7mVYhB7Q7iYVr0Au6Gnca0TseXgBfR-tcZ93cZSXI4kPrWVLj7_bPRI6BrolBWKhcxcdwLrQlroi3tOWw7Iw"
            },
            {
              id: "co-to-farmstay",
              name: "Cô Tô View Farmstay Chân Núi",
              category: "Farmstay View Núi",
              commune: "Xã Cô Tô",
              rating: 4.85,
              image_url: "https://images.unsplash.com/photo-1510798831971-661eb04b3739"
            },
            {
              id: "sang-nhan-hotel",
              name: "Khách Sạn Sang Nhân Tri Tôn",
              category: "Khách Sạn Trung Tâm",
              commune: "Thị trấn Tri Tôn",
              rating: 4.7,
              image_url: "https://images.unsplash.com/photo-1566073771259-6a8506099945"
            }
          ]);
        }
      } catch (err) {
        console.error("Supabase fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadLiveStayData();
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-[#F4F9F5] font-body-base text-slate-800 antialiased selection:bg-emerald-200">
      
      {/* Background Graphic Accents */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-emerald-300/20 blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-[30rem] h-[30rem] rounded-full bg-amber-300/15 blur-3xl" />
      </div>

      <main className="relative z-10 mx-auto w-full max-w-container-max flex-grow flex-col space-y-10 px-margin-mobile py-8 md:px-margin-desktop md:py-12">
        
        {/* Dynamic Stay Hot Section */}
        <HotPlacesSection
          limit={3}
          title="🔥 TOP ĐIỂM DỪNG CHÂN & LƯU TRÚ HOT"
          subtitle="Các Homestay & Khách sạn view đồi núi thơ mộng được du khách yêu thích nhất Tri Tôn"
        />
        
        {/* Header Hero Section */}
        <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#063821] via-[#0D4B2D] to-[#125C37] text-white p-8 sm:p-12 shadow-2xl border border-emerald-500/20">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-emerald-200 text-xs font-bold border border-white/20 backdrop-blur-md">
              <Hotel className="h-4 w-4 text-amber-300" />
              <span>Dữ Liệu Trực Tuyến Supabase (Live DB)</span>
            </div>
            <h1 className="font-heading font-extrabold text-3xl sm:text-5xl text-white tracking-tight leading-tight">
              Lưu Trú & Homestay <br />
              <span className="text-amber-300">View Đẹp Bảy Núi</span>
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-light max-w-2xl">
              Khám phá các điểm nghỉ dưỡng Homestay, Farmstay view đồng lúa Tà Pạ và khách sạn trung tâm Thị trấn Tri Tôn được kết nối cơ sở dữ liệu Supabase thực tế.
            </p>
          </div>
        </section>

        {/* Live Supabase Stay Cards Grid */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-emerald-200/80 pb-4">
            <h2 className="font-heading text-2xl font-extrabold text-slate-900 flex items-center gap-2">
              <Hotel className="h-5 w-5 text-emerald-700" />
              <span>Chỗ Ở Live Database</span>
            </h2>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
              {stays.length} Điểm Lưu Trú
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {stays.map((stay) => (
              <article
                key={stay.id}
                className="group flex flex-col overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl justify-between"
              >
                <div>
                  <div className="relative h-56 overflow-hidden bg-slate-100">
                    <img
                      src={stay.image_url}
                      alt={stay.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-slate-900/80 backdrop-blur-md text-white font-bold text-xs">
                      {stay.category}
                    </div>
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/90 text-amber-600 font-extrabold text-[11px] shadow-sm">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      {stay.rating}
                    </div>
                  </div>

                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-1 text-xs font-bold text-emerald-800">
                      <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>{stay.commune}</span>
                    </div>

                    <h3 className="font-heading text-xl font-extrabold text-slate-900 group-hover:text-emerald-800 transition-colors">
                      {stay.name}
                    </h3>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <Link
                    href={`/places`}
                    className="w-full py-3 bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all"
                  >
                    <span>Xem thông tin & Đặt phòng</span>
                    <ChevronRight className="h-4 w-4 text-amber-300" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
