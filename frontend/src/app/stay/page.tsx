"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import localMasterPois from "@/data/triton_pois_full.json";
import { getOptimizedImageUrl } from "@/lib/imageOptimizer";
import { fetchWithCache } from "@/lib/fastCache";
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
    function processStayData(json: any) {
      const data = json?.stays || [];
      if (data && data.length > 0) {
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

        formatted.sort((a: StayItem, b: StayItem) => {
          if (a.is_hot && !b.is_hot) return -1;
          if (!a.is_hot && b.is_hot) return 1;
          return (b.rating || 0) - (a.rating || 0);
        });

        setStays(formatted);
      }
    }

    async function loadLiveStayData() {
      try {
        const json = await fetchWithCache(
          "client-stays-catalog-v1",
          async () => {
            const res = await fetch("/api/v1/stays?limit=100");
            return await res.json();
          },
          60 * 60 * 1000,
          (freshJson) => {
            // Reactive SWR: Updates UI in real-time when fresh data arrives!
            processStayData(freshJson);
          }
        );

        processStayData(json);
      } catch (err) {
        console.warn("API fetch failed, using local master:", err);
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

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-5">
              {topHotStays.map((hotStay, sidx) => (
                <div
                  key={hotStay.id}
                  className="group relative bg-[#FFFDF7] rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-amber-300 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div className="relative h-32 sm:h-48 w-full overflow-hidden bg-slate-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getOptimizedImageUrl(hotStay.image_url, { width: 900, dpr: 2, quality: 'best' })}
                      alt={hotStay.name}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

                    <div className="absolute top-2 sm:top-2.5 left-2 sm:left-2.5 flex items-center gap-1">
                      <span className="px-2 sm:px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[9px] sm:text-[10px] uppercase shadow-xs flex items-center gap-1 font-display">
                        <Award className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> TOP #{sidx + 1}
                      </span>
                    </div>

                    <span className="absolute top-2 sm:top-2.5 right-2 sm:right-2.5 px-1.5 sm:px-2 py-0.5 rounded-md bg-[#FAF3E7]/95 text-[#26221B] font-extrabold text-[10px] sm:text-[11px] flex items-center gap-1 shadow-xs">
                      <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-400 text-amber-500" />
                      <span>{hotStay.rating}</span>
                    </span>

                    <div className="absolute bottom-2 sm:bottom-2.5 left-2 sm:left-3 right-2 sm:right-3 text-white">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-amber-300 font-mono truncate block">
                        {hotStay.commune}
                      </span>
                      <h3 className="font-display font-black text-xs sm:text-sm leading-tight text-white line-clamp-1">
                        {hotStay.name}
                      </h3>
                    </div>
                  </div>

                  <div className="p-2.5 sm:p-4 space-y-1.5 sm:space-y-2.5 text-[10px] sm:text-xs">
                    {hotStay.address && (
                      <div className="flex items-center gap-1 sm:gap-1.5 text-[#6B6355]">
                        <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#F26B3A] shrink-0" />
                        <span className="truncate">{hotStay.address}</span>
                      </div>
                    )}
                    {hotStay.phone && (
                      <div className="flex items-center gap-1 sm:gap-1.5 font-semibold text-emerald-800">
                        <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">Hotline: {hotStay.phone}</span>
                      </div>
                    )}
                    <p className="text-[10px] sm:text-[11px] text-[#6B6355] line-clamp-2 leading-relaxed">
                      {hotStay.description || "Chỗ nghỉ tiện nghi, không gian thoáng đãng ngắm trọn vẹn cảnh sắc Tri Tôn."}
                    </p>
                  </div>

                  <div className="p-2.5 sm:p-4 pt-0 border-t border-[#26221B]/5 mt-1 sm:mt-2 flex items-center justify-between gap-1.5 sm:gap-2">
                    <Link
                      href={`/places/${hotStay.slug || hotStay.id}`}
                      className="flex-1 py-1.5 sm:py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[10px] sm:text-xs text-center transition-colors shadow-2xs font-display"
                    >
                      Đặt Phòng Ngay
                    </Link>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotStay.name + " " + hotStay.commune + " Tri Tôn")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 sm:p-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 transition-colors shrink-0"
                      title="Chỉ đường"
                    >
                      <Navigation className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── DANH SÁCH LƯU TRÚ TOÀN HUYỆN ── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-xl font-black text-[#26221B] font-display flex items-center gap-2">
              <Hotel className="w-5 h-5 text-emerald-600" />
              <span>Tất Cả Địa Điểm Lưu Trú ({stays.length})</span>
            </h2>
            <span className="text-xs text-[#6B6355] font-medium font-mono hidden sm:inline">
              Xác thực thực địa
            </span>
          </div>

          {loading ? (
            <div className="py-16 text-center text-[#6B6355] font-bold text-sm">
              Đang tải danh sách lưu trú...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {stays.map((stay, sidx) => (
                <div
                  key={stay.id}
                  className="group relative bg-[#FFFDF7] rounded-[24px] sm:rounded-[28px] overflow-hidden border-2 border-amber-400/80 shadow-[0_4px_20px_rgba(240,163,47,0.12)] hover:shadow-[0_12px_32px_rgba(240,163,47,0.22)] hover:border-amber-500 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-900">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getOptimizedImageUrl(stay.image_url, { width: 800, dpr: 2, quality: 'best' })}
                        alt={stay.name}
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

                      <div className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 flex items-center gap-1">
                        <span className="px-2.5 py-1 rounded-xl bg-[#F0A32F] text-[#26221B] font-black text-[10px] sm:text-xs uppercase tracking-wider flex items-center gap-1 shadow-sm font-display">
                          <Award className="w-3 h-3 text-[#26221B]" />
                          <span>{stay.tourism_category || "Lưu Trú"}</span>
                        </span>
                      </div>

                      <span className="absolute top-2.5 sm:top-3 right-2.5 sm:right-3 px-2.5 py-1 rounded-xl bg-white/95 backdrop-blur-md text-[#26221B] font-black text-[10px] sm:text-xs flex items-center gap-1 shadow-sm font-display">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                        <span>{stay.rating || 4.8}</span>
                      </span>

                      <div className="absolute bottom-2.5 sm:bottom-3 left-3 right-3 text-white space-y-0.5">
                        <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-[#FFD37A] drop-shadow-sm block font-mono">
                          {stay.commune}
                        </span>
                        <h3 className="font-display font-extrabold text-sm sm:text-base leading-snug text-white group-hover:text-[#FFD37A] transition-colors line-clamp-1 drop-shadow-md">
                          {stay.name}
                        </h3>
                      </div>
                    </div>

                    <div className="p-3.5 sm:p-4 space-y-2 text-xs text-[#6B6355]">
                      {stay.description && (
                        <p className="text-xs text-[#6B6355] line-clamp-2 leading-relaxed font-body">
                          {stay.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-3.5 sm:p-4 pt-0 border-t border-[#EBE1D0]/70 flex items-center justify-between gap-2">
                    <Link
                      href={`/places/${stay.slug || stay.id}`}
                      className="text-xs sm:text-sm font-extrabold text-[#0E8C7F] hover:text-[#085A52] flex items-center gap-1 transition-colors font-display"
                    >
                      <span>Chi tiết phòng</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stay.name + " " + stay.commune + " Tri Tôn")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 sm:px-3.5 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/60 font-bold text-[11px] sm:text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <Navigation className="w-3 h-3 text-emerald-600" />
                      <span>Chỉ đường</span>
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
