"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { checkIsGoldenTime, GoldenTimeResult } from "@/lib/goldenTime";
import { Sparkles, Clock, MapPin, Play, Sun, Sunset, Coffee, Moon } from "lucide-react";

interface GoldenPlace {
  id: string;
  slug: string;
  name: string;
  commune: string;
  category: string;
  rating: number;
  golden_time_windows?: string[];
  image_url: string;
  video_url?: string;
  goldenStatus?: GoldenTimeResult;
}

export default function GoldenTimeWidget() {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [simulatedHour, setSimulatedHour] = useState<number | null>(null);
  const [goldenPlaces, setGoldenPlaces] = useState<GoldenPlace[]>([]);
  const [loading, setLoading] = useState(true);

  // Update live clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      if (simulatedHour === null) {
        setCurrentTime(new Date());
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [simulatedHour]);

  // Load places and evaluate active golden time
  useEffect(() => {
    async function loadPlaces() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("places")
          .select("id, slug, name, commune, category, rating, golden_time_windows, image_url, video_url, photos")
          .eq("is_active", true);

        if (!error && data && data.length > 0) {
          const effectiveDate = simulatedHour !== null 
            ? new Date(2026, 7, 7, simulatedHour, 30, 0)
            : currentTime;

          const evaluated = data.map((item: any) => {
            let img = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop";
            if (item.image_url && typeof item.image_url === "string" && item.image_url.startsWith("http")) {
              img = item.image_url;
            } else if (Array.isArray(item.photos) && item.photos.length > 0) {
              const p0 = item.photos[0];
              if (typeof p0 === "string" && p0.startsWith("http")) img = p0;
              else if (p0 && typeof p0 === "object" && p0.url) img = p0.url;
            }

            const windows = item.golden_time_windows || [];
            const gStatus = checkIsGoldenTime(windows, effectiveDate);

            return {
              id: item.id,
              slug: item.slug || item.id,
              name: item.name,
              commune: item.commune || "Tri Tôn",
              category: item.category || "Địa điểm",
              rating: item.rating || 4.8,
              golden_time_windows: windows,
              image_url: img,
              video_url: item.video_url || `https://www.tiktok.com/search?q=${encodeURIComponent(item.name)}`,
              goldenStatus: gStatus
            };
          });

          // Filter currently active golden time places
          const activeGolden = evaluated.filter((p) => p.goldenStatus?.isGolden);
          setGoldenPlaces(activeGolden);
        }
      } catch (err) {
        console.error("Error evaluating golden time places:", err);
      } finally {
        setLoading(false);
      }
    }

    loadPlaces();
  }, [simulatedHour, currentTime.getMinutes(), currentTime.getHours()]);

  const timeFormatted = simulatedHour !== null
    ? `${String(simulatedHour).padStart(2, "0")}:30`
    : `${String(currentTime.getHours()).padStart(2, "0")}:${String(currentTime.getMinutes()).padStart(2, "0")}:${String(currentTime.getSeconds()).padStart(2, "0")}`;

  return (
    <section className="my-8 w-full rounded-3xl bg-gradient-to-br from-[#0F2D24] via-[#1B4D3E] to-[#143B2F] p-6 md:p-8 text-white shadow-2xl relative overflow-hidden border border-[#D99B26]/30">
      
      {/* Background Glow */}
      <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-[#D99B26]/15 blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/10 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2.5 border border-amber-400/30 backdrop-blur-md">
            <Sparkles className="h-4 w-4 text-amber-300 animate-pulse" />
            <span>Phát Hiện Giờ Hệ Thống Real-Time</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>✨ ĐANG TRONG KHUNG GIỜ VÀNG TRẢI NGHIỆM</span>
          </h2>
          <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl font-light">
            Tự động gợi ý địa điểm nổi bật theo đúng thời điểm đẹp nhất trong ngày (Bình minh, Ẩm thực trưa, Hoàng hôn, Chợ đêm)
          </p>
        </div>

        {/* Live Clock & Time Preset Switcher */}
        <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-950/80 backdrop-blur-md border border-amber-400/40 shadow-lg">
            <Clock className="h-5 w-5 text-amber-400 animate-pulse" />
            <span className="font-mono text-lg font-black text-amber-300 tracking-wider">
              {timeFormatted}
            </span>
            {simulatedHour !== null && (
              <button
                onClick={() => setSimulatedHour(null)}
                className="ml-2 text-[10px] font-bold text-amber-200 hover:text-white bg-amber-900/60 px-2 py-0.5 rounded-full border border-amber-500/40"
              >
                Reset Real-Time
              </button>
            )}
          </div>

          {/* Quick Preset Hour Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold">
            <span className="text-amber-200/80 mr-1">Thử khung giờ:</span>
            <button
              onClick={() => setSimulatedHour(6)}
              className={`px-2.5 py-1 rounded-xl border transition-all flex items-center gap-1 ${simulatedHour === 6 ? "bg-[#D99B26] text-slate-950 border-[#D99B26] font-black shadow-md" : "bg-white/10 text-white border-white/20 hover:bg-white/20"}`}
            >
              <Sun className="h-3 w-3" /> 06:00 Sáng
            </button>
            <button
              onClick={() => setSimulatedHour(12)}
              className={`px-2.5 py-1 rounded-xl border transition-all flex items-center gap-1 ${simulatedHour === 12 ? "bg-[#D99B26] text-slate-950 border-[#D99B26] font-black shadow-md" : "bg-white/10 text-white border-white/20 hover:bg-white/20"}`}
            >
              <Coffee className="h-3 w-3" /> 12:00 Trưa
            </button>
            <button
              onClick={() => setSimulatedHour(16)}
              className={`px-2.5 py-1 rounded-xl border transition-all flex items-center gap-1 ${simulatedHour === 16 ? "bg-[#D99B26] text-slate-950 border-[#D99B26] font-black shadow-md" : "bg-white/10 text-white border-white/20 hover:bg-white/20"}`}
            >
              <Sunset className="h-3 w-3" /> 16:30 Chiều
            </button>
            <button
              onClick={() => setSimulatedHour(19)}
              className={`px-2.5 py-1 rounded-xl border transition-all flex items-center gap-1 ${simulatedHour === 19 ? "bg-[#D99B26] text-slate-950 border-[#D99B26] font-black shadow-md" : "bg-white/10 text-white border-white/20 hover:bg-white/20"}`}
            >
              <Moon className="h-3 w-3" /> 19:00 Tối
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Active Golden Places */}
      {loading ? (
        <div className="py-8 text-center text-amber-200 font-medium text-sm">
          Đang kiểm tra thời điểm trải nghiệm đẹp nhất...
        </div>
      ) : goldenPlaces.length > 0 ? (
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-2 scrollbar-none sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:overflow-visible relative z-10">
          {goldenPlaces.map((place) => (
            <div
              key={place.id}
              className="snap-start shrink-0 w-[82vw] max-w-[300px] sm:w-auto sm:max-w-none flex flex-col rounded-2xl bg-white text-slate-900 shadow-xl overflow-hidden border border-amber-300/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
            >
              <div className="relative h-44 w-full bg-slate-100">
                <img
                  src={place.image_url}
                  alt={place.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#D99B26] text-slate-950 font-black text-[11px] shadow-lg flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 fill-slate-950" />
                  <span>GIỜ VÀNG LÝ TƯỞNG</span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300">
                    {place.category}
                  </p>
                  <h3 className="text-base font-extrabold line-clamp-1">
                    {place.name}
                  </h3>
                </div>
              </div>

              <div className="p-4 flex flex-1 flex-col justify-between space-y-3">
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-1 text-slate-700 font-medium">
                    <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>{place.commune}</span>
                  </div>

                  {place.goldenStatus?.activeWindow && (
                    <div className="bg-amber-50 text-amber-900 p-2 rounded-xl border border-amber-200 text-[11px] font-semibold flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                      <span>{place.goldenStatus.activeWindow}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <Link
                    href={`/places/${place.slug}`}
                    className="flex-1 text-center py-2 px-3 rounded-xl bg-[#1B4D3E] hover:bg-[#143B2F] text-white font-bold text-xs shadow-md transition-colors"
                  >
                    Đến ngay lúc này
                  </Link>
                  {place.video_url && (
                    <a
                      href={place.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-slate-100 hover:bg-amber-100 text-slate-800 transition-colors"
                      title="Xem TikTok Review"
                    >
                      <Play className="h-4 w-4 fill-amber-600 text-amber-600" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="relative z-10 rounded-2xl bg-white/10 border border-white/15 p-6 text-center text-slate-100 backdrop-blur-md">
          <Clock className="mx-auto h-8 w-8 text-amber-300 mb-2 opacity-90" />
          <p className="font-bold text-base">Hiện không có địa điểm nào rơi vào khung giờ vàng vào lúc này ({timeFormatted})</p>
          <p className="text-xs text-slate-300 mt-1">
            Hãy thử bấm các nút chọn khung giờ 06:00 Sáng (Bình minh), 12:00 Trưa (Gà đốt), 16:30 Chiều (Hoàng hôn) ở trên để khám phá!
          </p>
        </div>
      )}
    </section>
  );
}
