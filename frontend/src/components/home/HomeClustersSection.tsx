'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import {
  Mountain,
  ChevronRight,
  MapPin,
  ArrowRight,
  Navigation
} from 'lucide-react';
import { resolvePlaceExternalLinks } from '@/lib/externalLinks';
import { getCategoryFallbackImage, sanitizeDescription } from '@/lib/dataSanitizer';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export interface ClusterItem {
  id: string;
  name: string;
  commune: string;
  badge: string;
  desc: string;
  img: string;
  link: string;
  placeCount?: number;
  communeFilters?: string[];
  nameKeywords?: string[];
}

interface HomeClustersSectionProps {
  clusters: ClusterItem[];
  selectedClusterId: string | null;
  setSelectedClusterId: (id: string | null) => void;
  allPlaces: any[];
}

export default function HomeClustersSection({
  clusters,
  selectedClusterId,
  setSelectedClusterId,
  allPlaces,
}: HomeClustersSectionProps) {
  const { language, dict } = useLanguage();
  const isEn = language === 'en';

  const activeCluster = useMemo(() => {
    if (!selectedClusterId) return null;
    return clusters.find((c) => c.id === selectedClusterId) || null;
  }, [selectedClusterId, clusters]);

  const activeClusterSpots = useMemo(() => {
    if (!selectedClusterId || !activeCluster) return [];
    const matched = allPlaces.filter((p: any) => {
      const com = (p.commune || '').toLowerCase();
      const name = (p.name || '').toLowerCase();
      const matchCom = activeCluster.communeFilters?.some((f: string) => com.includes(f.toLowerCase()));
      const matchKey = activeCluster.nameKeywords?.some((k: string) => name.includes(k.toLowerCase()));
      return matchCom || matchKey;
    });

    return matched.map((item: any) => {
      let img = getCategoryFallbackImage(item.category, item.name);
      if (item.image_url && typeof item.image_url === 'string' && !item.image_url.includes('unsplash.com')) {
        img = item.image_url;
      } else if (Array.isArray(item.photos) && item.photos.length > 0) {
        const p0 = item.photos[0];
        const pUrl = typeof p0 === 'string' ? p0 : p0?.url;
        if (pUrl && typeof pUrl === 'string' && !pUrl.includes('unsplash.com')) img = pUrl;
      }

      return {
        id: item.id,
        slug: item.slug || item.id,
        name: item.name,
        name_en: item.name_en,
        category: item.category || 'check-in',
        commune: item.commune || 'Tri Tôn, An Giang',
        rating: item.rating ? Number(item.rating) : 4.8,
        image_url: img,
        description: sanitizeDescription(item.description, item.name, item.commune, item.category),
        description_en: item.description_en,
        golden_time_windows: Array.isArray(item.golden_time_windows) ? item.golden_time_windows : ['06:00–08:30', '16:00–17:30'],
        cost_vnd: item.category === 'food' ? '120.000đ - 250.000đ' : 'Miễn phí vé',
      };
    }).slice(0, 8);
  }, [selectedClusterId, activeCluster, allPlaces]);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#F0A32F] uppercase tracking-wider mb-1 font-display">
            <Mountain className="w-4 h-4" />
            <span>{isEn ? "Geographic Tourism Clusters" : "Quy Hoạch Địa Lý Du Lịch"}</span>
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[#26221B] tracking-tight">
            {isEn ? "4 Key Scenic Clusters of Seven Mountains" : "4 Cụm Thắng Cảnh Trọng Điểm Bảy Núi"}
          </h2>
        </div>
        <Link
          href="/places"
          prefetch={true}
          className="text-xs font-bold text-[#0E8C7F] hover:text-[#0B6B60] flex items-center gap-1 transition-colors font-display"
        >
          <span>{isEn ? "View all Verified spots" : "Xem tất cả 149 điểm"}</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6">
        {clusters.map((cluster) => {
          const isSelected = selectedClusterId === cluster.id;
          return (
            <button
              key={cluster.id}
              type="button"
              onClick={() => {
                const nextVal = isSelected ? null : cluster.id;
                setSelectedClusterId(nextVal);
                if (nextVal) {
                  setTimeout(() => {
                    const el = document.getElementById("cluster-spotlight-panel");
                    if (el) {
                      el.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                  }, 120);
                }
              }}
              className={`group relative text-left bg-[#FFFDF7] rounded-2xl sm:rounded-[28px] overflow-hidden transition-all duration-300 flex flex-col justify-between cursor-pointer tap-bounce ${
                isSelected
                  ? "border-2 border-[#0E8C7F] ring-4 ring-[#0E8C7F]/25 shadow-xl -translate-y-1.5"
                  : "border border-[#26221B]/8 shadow-[0_2px_8px_rgba(38,34,27,0.06)] hover:shadow-[0_8px_24px_rgba(38,34,27,0.12)] hover:-translate-y-1"
              }`}
            >
              {/* Image */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
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
                    {cluster.placeCount} {isEn ? "spots" : "điểm"}
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
                  <span>
                    {isSelected
                      ? (isEn ? "⚡ Active Filter View" : "⚡ Đang lọc xem danh sách")
                      : (isEn ? `Filter view (${cluster.placeCount} spots)` : `Lọc xem (${cluster.placeCount} điểm)`)}
                  </span>
                  <ArrowRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? "rotate-90 text-[#0E8C7F]" : "group-hover:translate-x-1"}`} />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Instant In-Memory Cluster Spotlight Panel */}
      {selectedClusterId && activeCluster && (
        <div id="cluster-spotlight-panel" className="mt-4 p-4 sm:p-6 rounded-3xl bg-[#FFFDF7] border-2 border-[#0E8C7F]/30 shadow-md space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#26221B]/8 font-display">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-2xl bg-[#0E8C7F]/10 text-[#0E8C7F]">
                <MapPin className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-display font-extrabold text-base sm:text-lg text-[#26221B]">
                  {isEn ? "Destinations in: " : "Điểm Đến Thuộc: "} {activeCluster.name}
                </h3>
                <p className="text-xs text-[#6B6355] font-body">{activeCluster.commune} • {activeClusterSpots.length} {isEn ? "typical locations" : "địa điểm tiêu biểu"}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={activeCluster.link}
                prefetch={true}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-[#0E8C7F] text-white text-xs font-bold hover:bg-[#0B6B60] transition-colors shadow-xs"
              >
                <span>{isEn ? "View all spots in this cluster" : "Xem tất cả điểm cụm này"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => setSelectedClusterId(null)}
                className="px-3 py-2 rounded-full bg-[#FAF3E7] hover:bg-[#26221B]/10 text-[#6B6355] hover:text-[#26221B] text-xs font-bold cursor-pointer"
              >
                {isEn ? "Close" : "Đóng"}
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

              const displayName = isEn && spot.name_en ? spot.name_en : spot.name;
              const displayDesc = isEn && spot.description_en ? spot.description_en : spot.description;

              return (
                <div
                  key={spot.id}
                  className="bg-[#FAF3E7] rounded-2xl sm:rounded-[22px] border border-[#26221B]/8 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                >
                  {/* Thumbnail Link */}
                  <Link
                    href={`/places/${spot.slug || spot.id}`}
                    prefetch={true}
                    className="block relative aspect-[4/3] w-full overflow-hidden bg-slate-200 cursor-pointer"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={spot.image_url}
                      alt={displayName}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#26221B]/80 via-transparent to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2 text-white">
                      <h4 className="font-display text-xs sm:text-sm font-bold line-clamp-1 drop-shadow-sm text-[#FFFDF7] group-hover:text-[#FFD37A] transition-colors">
                        {displayName}
                      </h4>
                      <p className="text-[10px] text-[#FAF3E7]/80 truncate">{spot.commune}</p>
                    </div>
                  </Link>

                  <div className="p-2.5 sm:p-3 space-y-2 flex-1 flex flex-col justify-between font-body">
                    <p className="text-[10px] sm:text-xs text-[#6B6355] line-clamp-2 leading-relaxed">
                      {displayDesc}
                    </p>
                    <div className="flex items-center gap-1 pt-1 font-display">
                      <Link
                        href={`/places/${spot.slug}`}
                        className="flex-1 text-center py-1.5 rounded-xl bg-white hover:bg-[#0E8C7F] hover:text-white text-[#0E8C7F] text-[10px] sm:text-xs font-bold transition-all border border-[#0E8C7F]/20"
                      >
                        {isEn ? "Details" : "Chi Tiết"}
                      </Link>
                      <a
                        href={maps.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 rounded-xl bg-[#F0A32F] hover:bg-[#C97F1B] text-[#26221B] hover:text-white text-[10px] sm:text-xs font-bold transition-all"
                      >
                        <Navigation className="w-3 h-3" />
                        <span>{isEn ? "Directions" : "Chỉ Đường"}</span>
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
  );
}
