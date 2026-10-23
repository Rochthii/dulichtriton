"use client";

import { CatalogCard, CatalogFeedback, FilterChip } from '@/components/CatalogUI';
import SavePlaceButton from '@/components/SavePlaceButton';

import PlaceListingImage from '@/components/PlaceListingImage';
import { presentRating, presentPlaceImage } from '@/lib/publicPlacePresentation';

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import localStaysJson from "@/data/tri_ton_stays.json";
import { getOptimizedImageUrl } from "@/lib/imageOptimizer";
import { fetchWithCache } from "@/lib/fastCache";
import {
  Hotel,
  MapPin,
  Star,
  ChevronRight,
  Wifi,
  Car,
  Phone,
  Flame,
  Award,
  Navigation,
  Compass,
  Tent,
  Building2,
  CheckCircle2,
  Sparkles
} from "lucide-react";

interface StayItem {
  id: string;
  slug: string;
  name: string;
  category: string;
  subcategory?: string;
  tourism_category?: string;
  commune: string;
  rating?: number;
  image_url: string;
  video_url?: string;
  address?: string;
  phone?: string;
  hotline?: string;
  price_level?: string;
  description?: string;
  detailed_story?: string;
  amenities?: string[];
  stay_type?: "homestay" | "hotel" | "camping" | "motel";
  is_hot?: boolean;
}

type FilterGroup = "all" | "homestay_camping" | "hotel_resort" | "motel";

export default function StayPage() {
  const [stays, setStays] = useState<StayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterGroup>("all");

  const [reloadKey, setReloadKey] = useState(0);
  const [catalogError, setCatalogError] = useState('');

  useEffect(() => {
    let active = true;
    setCatalogError('');
    setLoading(true);
    function processStayData(data: any[]) {
      if (!active) return;
      if (Array.isArray(data)) {
        const formatted: StayItem[] = data.map((item: any) => {
          const img = presentPlaceImage(item);

          // Detect stay_type if not set
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
            category: item.category || "stay",
            subcategory: item.subcategory || "Cơ sở lưu trú",
            tourism_category: item.tourism_category || "Homestay & Khách Sạn",
            commune: item.commune || "Thị trấn Tri Tôn",
            rating: presentRating(item.rating),
            image_url: img,
            video_url: item.video_url || `https://www.tiktok.com/search/video?q=${encodeURIComponent(item.name + " Tri Tôn")}`,
            address: item.address || "",
            phone: item.phone || item.hotline || "",
            hotline: item.hotline || item.phone || "",
            price_level: item.price_level || "Chưa có thông tin giá",
            description: item.description || "",
            detailed_story: item.detailed_story || "",
            amenities: Array.isArray(item.amenities) ? item.amenities : [],
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

    async function loadLiveStayData() {
      const fetchCatalog = async () => {
        const response = await fetch('/api/v1/stays?limit=100');
        if (!response.ok) throw new Error('Catalog unavailable');
        const payload = await response.json();
        if (!Array.isArray(payload?.stays)) throw new Error('Invalid catalog response');
        return payload.stays;
      };
      try {
        const json = reloadKey > 0 ? await fetchCatalog() : await fetchWithCache(
          "client-stay-catalog-v3",
          fetchCatalog,
          30 * 60 * 1000,
          (freshData) => {
            processStayData(Array.isArray(freshData) ? freshData : (freshData?.stays || localStaysJson));
          }
        );

        processStayData(Array.isArray(json) ? json : (json?.stays || localStaysJson));
      } catch {
        if (!active) return;
        setCatalogError('Chưa cập nhật được danh mục. Đang hiển thị dữ liệu tham khảo có sẵn; hãy thử lại.');
        processStayData(localStaysJson as any[]);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadLiveStayData();
    return () => { active = false; };
  }, [reloadKey]);

  // Filtered Stays based on active tab
  const filteredStays = useMemo(() => {
    if (activeFilter === "all") return stays;
    if (activeFilter === "homestay_camping") {
      return stays.filter(s => s.stay_type === "homestay" || s.stay_type === "camping");
    }
    if (activeFilter === "hotel_resort") {
      return stays.filter(s => s.stay_type === "hotel");
    }
    if (activeFilter === "motel") {
      return stays.filter(s => s.stay_type === "motel");
    }
    return stays;
  }, [stays, activeFilter]);

  // Top 3 Hot Spotlight
  const topHotStays = useMemo(() => {
    return stays.filter(s => s.is_hot).slice(0, 3);
  }, [stays]);

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF3E7] font-body text-[#26221B] antialiased">
      {/* Background Graphic Accents */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-emerald-300/15 blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-[30rem] h-[30rem] rounded-full bg-amber-300/15 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl flex-grow flex-col space-y-6 sm:space-y-8 px-3.5 py-6 sm:px-6 sm:py-10">

        {/* Header Hero Section */}
        <section className="relative overflow-hidden rounded-2xl sm:rounded-[28px] bg-gradient-to-br from-[#0E8C7F] via-[#0B6B60] to-[#085A52] p-5 sm:p-8 md:p-10 text-white shadow-md border border-[#0B6B60]">
          <div className="relative z-10 max-w-3xl space-y-2.5 sm:space-y-3">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FFD37A]/20 px-3 py-1 text-xs font-black text-[#FFD37A] uppercase tracking-wider backdrop-blur-xs font-display">
              <Hotel className="h-3.5 w-3.5" />
              <span>Danh mục lưu trú tham khảo</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[#FFFDF7] leading-tight">
              Homestay, Khách Sạn & Cắm Trại Tri Tôn
            </h1>
            <p className="text-xs sm:text-sm text-white/85 leading-relaxed font-body">
              Tra cứu thông tin tham khảo về cơ sở lưu trú. Hãy xác nhận giá, phòng trống và dịch vụ trực tiếp với cơ sở trước khi đặt phòng.
            </p>
          </div>
        </section>

        {catalogError && <CatalogFeedback kind="error" message={catalogError} actionLabel="Thử tải lại" onAction={() => setReloadKey(value => value + 1)} />}

        {/* 🌟 BỘ LỌC PHÂN NHÓM CHUYÊN NGHIỆP 🌟 */}
        <section className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <FilterChip active={activeFilter === "all"}
            onClick={() => setActiveFilter("all")}
          >
            <Compass className="w-4 h-4" />
            <span>Tất Cả ({stays.length})</span>
          </FilterChip>

          <FilterChip active={activeFilter === "homestay_camping"}
            onClick={() => setActiveFilter("homestay_camping")}
          >
            <Tent className="w-4 h-4 text-emerald-500" />
            <span>Homestay & Cắm Trại View Núi ({stays.filter(s => s.stay_type === "homestay" || s.stay_type === "camping").length})</span>
          </FilterChip>

          <FilterChip active={activeFilter === "hotel_resort"}
            onClick={() => setActiveFilter("hotel_resort")}
          >
            <Building2 className="w-4 h-4 text-blue-500" />
            <span>Khách Sạn & Resort Trung Tâm ({stays.filter(s => s.stay_type === "hotel").length})</span>
          </FilterChip>

          <FilterChip active={activeFilter === "motel"}
            onClick={() => setActiveFilter("motel")}
          >
            <Hotel className="w-4 h-4 text-amber-500" />
            <span>Nhà Nghỉ Tiện Lợi ({stays.filter(s => s.stay_type === "motel").length})</span>
          </FilterChip>
        </section>

        {/* 🌟 SPOTLIGHT: TOP 3 LỰA CHỌN ĐẶC SẮC NHẤT 🌟 */}
        {activeFilter === "all" && topHotStays.length > 0 && (
          <section className="space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-black text-[#F26B3A] uppercase tracking-wider font-display">
                  <Flame className="w-4 h-4 fill-[#F26B3A]" />
                  <span>Điểm Lưu Trú Được Yêu Thích Nhất</span>
                </div>
                <h2 className="text-lg sm:text-2xl font-black text-[#26221B] font-display mt-0.5">
                  Top Điểm Nghỉ Dưỡng Nổi Bật Bảy Núi
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-5">
              {topHotStays.map((hotStay, sidx) => (
                <div
                  key={hotStay.id}
                  className="group relative bg-[#FFFDF7] rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-amber-300 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <PlaceListingImage
                      src={hotStay.image_url ? getOptimizedImageUrl(hotStay.image_url, { width: 900, dpr: 2, quality: 'best' }) : undefined}
                      alt={hotStay.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] uppercase shadow-xs flex items-center gap-1 font-display">
                        <Award className="w-3 h-3" /> TOP #{sidx + 1}
                      </span>
                    </div>

                    <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-[#FAF3E7]/95 text-[#26221B] font-extrabold text-[11px] flex items-center gap-1 shadow-xs font-display">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                      <span>{hotStay.rating ?? "Chưa có đánh giá"}</span>
                    </span>

                    <div className="absolute bottom-2.5 left-3 right-3 text-white">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 font-mono truncate block">
                        {hotStay.commune}
                      </span>
                      <h3 className="font-display font-black text-sm sm:text-base leading-tight text-white line-clamp-1">
                        {hotStay.name}
                      </h3>
                    </div>
                  </div>

                  <div className="p-3.5 sm:p-4 space-y-2.5 text-xs">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs font-bold text-[#F26B3A] font-display">
                        {hotStay.price_level}
                      </span>
                    </div>

                    {hotStay.address && (
                      <div className="flex items-center gap-1.5 text-[#6B6355] text-[11px]">
                        <MapPin className="w-3.5 h-3.5 text-[#F26B3A] shrink-0" />
                        <span className="truncate">{hotStay.address}</span>
                      </div>
                    )}

                    {/* Amenities chips */}
                    <div className="flex flex-wrap gap-1">
                      {hotStay.amenities?.slice(0, 3).map((am, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-semibold border border-emerald-200/50 flex items-center gap-0.5">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" /> {am}
                        </span>
                      ))}
                    </div>

                    <p className="text-[11px] text-[#6B6355] line-clamp-2 leading-relaxed">
                      {hotStay.description}
                    </p>
                  </div>

                  <div className="p-3.5 sm:p-4 pt-0 border-t border-[#26221B]/5 flex flex-wrap items-center justify-between gap-2">
                    {hotStay.phone ? (
                      <a
                        href={`tel:${hotStay.phone}`}
                        className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs text-center transition-colors shadow-xs font-display flex items-center justify-center gap-1.5"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Gọi Hotline ({hotStay.phone})</span>
                      </a>
                    ) : (
                      <Link
                        href={`/places/${hotStay.slug || hotStay.id}`}
                        className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs text-center transition-colors shadow-xs font-display"
                      >
                        Xem Chi Tiết
                      </Link>
                    )}

                    <a aria-label={`Chỉ đường đến ${hotStay.name}`}
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotStay.name + " " + hotStay.commune + " Tri Tôn An Giang")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 transition-colors shrink-0"
                      title="Chỉ đường Google Maps"
                    >
                      <Navigation className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── DANH SÁCH TOÀN BỘ CƠ SỞ LƯU TRÚ (12 CƠ SỞ ĐÃ XÁC MINH) ── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-xl font-black text-[#26221B] font-display flex items-center gap-2">
              <Hotel className="w-5 h-5 text-emerald-600" />
              <span>Danh Sách Lưu Trú ({filteredStays.length})</span>
            </h2>
            <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60 font-bold font-mono">
              Đối chiếu với cơ sở trước khi đặt phòng
            </span>
          </div>

          {loading ? (
            <CatalogFeedback kind="loading" message="Đang tải danh sách lưu trú..." />
          ) : filteredStays.length === 0 ? (
            <CatalogFeedback message="Chưa tìm thấy cơ sở lưu trú phù hợp trong danh mục này." actionLabel="Xóa tất cả bộ lọc" onAction={() => setActiveFilter('all')} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
              {filteredStays.map((stay) => (
                <CatalogCard
                  key={stay.id}

                >
                  <div>
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <PlaceListingImage
                        src={stay.image_url ? getOptimizedImageUrl(stay.image_url, { width: 800, dpr: 2, quality: 'best' }) : undefined}
                        alt={stay.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1">
                        <span className="px-2 py-0.5 rounded-lg bg-white/95 text-[#26221B] font-black text-[10px] uppercase shadow-xs font-display">
                          {stay.subcategory || "Lưu Trú"}
                        </span>
                      </div>

                      <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-lg bg-white/95 text-[#26221B] font-black text-[11px] flex items-center gap-0.5 shadow-xs font-display">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                        <span>{stay.rating ?? "Chưa có đánh giá"}</span>
                      </span>

                      <div className="absolute bottom-2.5 left-3 right-3 text-white space-y-0.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#FFD37A] font-mono truncate block">
                          {stay.commune}
                        </span>
                        <h3 className="font-display font-extrabold text-sm sm:text-base leading-snug text-white line-clamp-1">
                          {stay.name}
                        </h3>
                      </div>
                    </div>

                    <div className="p-3.5 space-y-2 text-xs text-[#6B6355]">
                      <div className="flex items-center justify-between text-xs font-bold text-[#F26B3A]">
                        <span>{stay.price_level}</span>
                      </div>

                      {stay.address && (
                        <div className="flex items-center gap-1.5 text-[#6B6355] text-[11px]">
                          <MapPin className="w-3.5 h-3.5 text-[#F26B3A] shrink-0" />
                          <span className="truncate">{stay.address}</span>
                        </div>
                      )}

                      {/* Amenities */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {stay.amenities?.slice(0, 2).map((am, idx) => (
                          <span key={idx} className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-900 text-[10px] font-medium border border-amber-200/40 truncate">
                            {am}
                          </span>
                        ))}
                      </div>

                      {stay.description && (
                        <p className="text-[11px] text-[#6B6355] line-clamp-2 leading-relaxed font-body">
                          {stay.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-3.5 pt-0 border-t border-[#EBE1D0]/60 flex flex-wrap items-center justify-between gap-2">

                    <SavePlaceButton place={stay} compact feedbackPlacement="above" />
                    {stay.phone ? (
                      <a
                        href={`tel:${stay.phone}`}
                        className="min-h-11 min-w-11 inline-flex items-center justify-center flex-1 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] text-center transition-colors font-display flex items-center justify-center gap-1"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Gọi ({stay.phone})</span>
                      </a>
                    ) : (
                      <Link
                        href={`/places/${stay.slug || stay.id}`}
                        className="min-h-11 min-w-11 inline-flex items-center justify-center flex-1 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[11px] text-center transition-colors font-display"
                      >
                        Chi Tiết
                      </Link>
                    )}

                    <a aria-label={`Chỉ đường đến ${stay.name}`}
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stay.name + " " + stay.commune + " Tri Tôn An Giang")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="min-h-11 min-w-11 inline-flex items-center justify-center p-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/60 font-bold text-[10px] flex items-center gap-1 transition-colors shrink-0"
                      title="Chỉ đường Google Maps"
                    >
                      <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                    </a>
                  </div>
                </CatalogCard>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
