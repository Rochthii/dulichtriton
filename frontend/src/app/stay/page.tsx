"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import localMasterPois from "@/data/triton_pois_full.json";
import { getOptimizedImageUrl } from "@/lib/imageOptimizer";
import { Hotel, MapPin, Star, ChevronRight, Wifi, Car, ShieldCheck, Phone, Flame, Award, Navigation, Play } from "lucide-react";

interface StayItem {
  id: string;
  slug: string;
  name: string;
  category: string;
  tourism_category: string;
  commune: string;
  rating?: number;
  image_url: string;
  video_url?: string;
  address?: string;
  phone?: string;
  description?: string;
  is_hot?: boolean;
}

export default function StayPage() {
  const [stays, setStays] = useState<StayItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLiveStayData() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("places")
          .select("id, slug, name, category, tourism_category, commune, rating, photos, image_url, video_url, address, phone, description, is_hot")
          .or("category.eq.stay,tourism_category.ilike.%Homestay%,tourism_category.ilike.%Khách Sạn%,tourism_category.ilike.%Resort%,tourism_category.ilike.%Lưu Trú%,id.ilike.KS%,id.ilike.HS%,id.ilike.NT%")
          .eq("is_active", true)
          .order("rating", { ascending: false });

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
              slug: item.slug || item.id,
              name: item.name,
              category: item.category || "stay",
              tourism_category: item.tourism_category || "Homestay & Lưu Trú",
              commune: item.commune || "Thị trấn Tri Tôn",
              rating: item.rating ? Number(item.rating) : 4.8,
              image_url: img,
              video_url: item.video_url || `https://www.tiktok.com/search/video?q=${encodeURIComponent(item.name + " Tri Tôn")}`,
              address: item.address || "",
              phone: item.phone || "",
              description: item.description || "",
              is_hot: !!item.is_hot || (item.rating && item.rating >= 4.8),
            };
          });

          // Sort Hot stays to top!
          formatted.sort((a: StayItem, b: StayItem) => {
            if (a.is_hot && !b.is_hot) return -1;
            if (!a.is_hot && b.is_hot) return 1;
            return (b.rating || 0) - (a.rating || 0);
          });

          setStays(formatted);
        } else {
          fallbackToLocalMaster();
        }
      } catch (err) {
        console.warn("Supabase fetch error, fallback:", err);
        fallbackToLocalMaster();
      } finally {
        setLoading(false);
      }
    }

    function fallbackToLocalMaster() {
      const stayList = (localMasterPois as any[])
        .filter(
          (p) =>
            p.category === "stay" ||
            (p.tourism_category && p.tourism_category.includes("Lưu Trú")) ||
            (p.id && (p.id.startsWith("KS") || p.id.startsWith("HS") || p.id.startsWith("NT") || p.id.startsWith("ST")))
        )
        .map((p) => ({
          id: p.id,
          slug: p.slug || p.id,
          name: p.name,
          category: p.category || "stay",
          tourism_category: p.tourism_category || "Homestay & Lưu Trú",
          commune: p.commune || "Thị trấn Tri Tôn",
          rating: p.rating ? Number(p.rating) : 4.8,
          image_url: p.image_url || "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=1200&auto=format&fit=crop",
          video_url: p.video_url || `https://www.tiktok.com/search/video?q=${encodeURIComponent(p.name + " Tri Tôn")}`,
          address: p.address || "",
          phone: p.phone || "",
          description: p.description || "",
          is_hot: !!p.is_hot || (p.rating && p.rating >= 4.8),
        }));

      stayList.sort((a, b) => {
        if (a.is_hot && !b.is_hot) return -1;
        if (!a.is_hot && b.is_hot) return 1;
        return (b.rating || 0) - (a.rating || 0);
      });

      setStays(stayList);
    }

    loadLiveStayData();
  }, []);

  // Top 3 Hot Stays Spotlight
  const topHotStays = useMemo(() => {
    return stays.slice(0, 3);
  }, [stays]);

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF3E7] font-body text-[#26221B] antialiased">
      {/* Background Graphic Accents */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-emerald-300/15 blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-[30rem] h-[30rem] rounded-full bg-amber-300/15 blur-3xl" />
      </div>

      <main className="relative z-10 mx-auto w-full max-w-7xl flex-grow flex-col space-y-8 px-4 py-8 md:px-6 md:py-10">
        {/* Header Hero Section */}
        <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#0E8C7F] to-[#085A52] p-6 text-white shadow-md md:p-10 border border-[#0B6B60]">
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FFD37A]/20 px-3 py-1 text-xs font-black text-[#FFD37A] uppercase tracking-wider backdrop-blur-xs font-display">
              <Hotel className="h-3.5 w-3.5" />
              <span>Nghỉ Dưỡng & Chữa Lành Bảy Núi</span>
            </div>
            <h1 className="font-display text-2xl md:text-4xl font-extrabold tracking-tight text-[#FFFDF7] leading-tight">
              Homestay & Khách Sạn View Núi Tri Tôn
            </h1>
            <p className="text-xs md:text-sm text-white/85 leading-relaxed font-body">
              Danh sách các homestay sinh thái, bungalow và nhà nghỉ tiện nghi giữa không gian thiên nhiên trong lành, ngắm trọn vẹn cảnh bình minh và hoàng hôn Thất Sơn.
            </p>
          </div>
        </section>

        {/* 🌟 TOP HOMESTAY & NGHỈ DƯỠNG HOT TRI TÔN (SPOTLIGHT) 🌟 */}
        {topHotStays.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-black text-[#F26B3A] uppercase tracking-wider font-display">
                  <Flame className="w-4 h-4 fill-[#F26B3A]" />
                  <span>Điểm Nghỉ Dưỡng Yêu Thích Nhất</span>
                </div>
                <h2 className="text-xl md:text-2xl font-black text-[#26221B] font-display mt-0.5">
                  Top Homestay & Chỗ Nghỉ Hot Nhất Bảy Núi
                </h2>
              </div>
              <span className="text-xs font-bold text-[#0E8C7F] bg-[#0E8C7F]/10 px-3 py-1 rounded-full border border-[#0E8C7F]/20 hidden sm:inline-block">
                View Núi & Hồ Nước
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {topHotStays.map((hotStay, sidx) => (
                <div
                  key={hotStay.id}
                  className="group relative bg-[#FFFDF7] rounded-3xl overflow-hidden border-2 border-amber-300 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div className="relative h-48 w-full overflow-hidden bg-slate-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getOptimizedImageUrl(hotStay.image_url, { width: 900, dpr: 2, quality: 'best' })}
                      alt={hotStay.name}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] uppercase shadow-xs flex items-center gap-1 font-display">
                        <Award className="w-3 h-3" /> TOP #{sidx + 1}
                      </span>
                    </div>

                    <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-[#FAF3E7]/95 text-[#26221B] font-extrabold text-[11px] flex items-center gap-1 shadow-xs">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                      <span>{hotStay.rating}</span>
                    </span>

                    <div className="absolute bottom-2.5 left-3 right-3 text-white">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-amber-300 font-mono">
                        {hotStay.commune}
                      </span>
                      <h3 className="font-display font-black text-sm leading-tight text-white line-clamp-1">
                        {hotStay.name}
                      </h3>
                    </div>
                  </div>

                  <div className="p-4 space-y-2.5 text-xs">
                    {hotStay.address && (
                      <div className="flex items-center gap-1.5 text-[11px] text-[#6B6355]">
                        <MapPin className="w-3.5 h-3.5 text-[#F26B3A] shrink-0" />
                        <span className="line-clamp-1">{hotStay.address}</span>
                      </div>
                    )}
                    {hotStay.phone && (
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800">
                        <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Hotline: {hotStay.phone}</span>
                      </div>
                    )}
                    <p className="text-[11px] text-[#6B6355] line-clamp-2 leading-relaxed">
                      {hotStay.description || "Chỗ nghỉ tiện nghi, không gian thoáng đãng ngắm trọn vẹn cảnh sắc Tri Tôn."}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-[#26221B]/6">
                      <Link
                        href={`/places/${hotStay.slug || hotStay.id}`}
                        className="text-xs font-bold text-[#0E8C7F] hover:underline flex items-center gap-1 font-display"
                      >
                        <span>Xem phòng & Giá</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotStay.name + " " + hotStay.commune + " Tri Tôn")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center gap-1 transition-colors"
                      >
                        <Navigation className="w-3 h-3" />
                        <span>Chỉ đường</span>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Live Stays Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base md:text-lg font-black text-[#26221B] font-display flex items-center gap-2">
              <Hotel className="h-5 w-5 text-[#0E8C7F]" />
              <span>Toàn Bộ Danh Sách Lưu Trú ({stays.length} Điểm Nghỉ)</span>
            </h2>
            <span className="text-xs text-[#6B6355] font-medium font-mono">Dữ liệu thực địa 100%</span>
          </div>

          {loading ? (
            <div className="py-16 text-center text-[#6B6355] font-bold text-sm">
              Đang tải danh sách lưu trú...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {stays.map((stay) => (
                <div
                  key={stay.id}
                  className="group bg-[#FFFDF7] rounded-3xl overflow-hidden border border-[#26221B]/8 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-52 overflow-hidden bg-slate-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getOptimizedImageUrl(stay.image_url, { width: 800, dpr: 2, quality: 'best' })}
                        alt={stay.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-slate-900/80 backdrop-blur-md text-white font-bold text-xs">
                        {stay.tourism_category}
                      </div>
                      <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/90 text-amber-600 font-extrabold text-[11px] shadow-sm">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        {stay.rating}
                      </div>
                    </div>

                    <div className="p-5 space-y-3 text-xs">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                        <span className="flex items-center gap-1 text-emerald-800">
                          <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          {stay.commune}
                        </span>
                        {stay.phone && (
                          <span className="flex items-center gap-1 text-slate-600">
                            <Phone className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                            {stay.phone}
                          </span>
                        )}
                      </div>

                      <h3 className="font-display text-base font-extrabold text-[#26221B] group-hover:text-emerald-800 transition-colors line-clamp-1">
                        {stay.name}
                      </h3>

                      {stay.description && (
                        <p className="text-xs text-[#6B6355] line-clamp-2 leading-relaxed">
                          {stay.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-5 pt-0 border-t border-[#26221B]/5 mt-2 flex items-center justify-between gap-2">
                    <Link
                      href={`/places/${stay.slug || stay.id}`}
                      className="flex-1 py-2.5 rounded-xl bg-[#0E8C7F] hover:bg-[#085A52] text-white text-center font-bold text-xs transition-colors shadow-2xs"
                    >
                      Xem Chi Tiết & Giá
                    </Link>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stay.name + " " + stay.commune + " Tri Tôn")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition-colors"
                      title="Chỉ đường Google Maps"
                    >
                      <Navigation className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
