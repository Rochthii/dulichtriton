"use client";

import { useEffect, useState } from "react";
import { Landmark, MapPin, Calendar, Compass, Clock, Star, Sparkles, ChevronRight, Award, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import HotPlacesSection from "@/components/HotPlacesSection";

interface CulturePlace {
  id: string;
  slug: string;
  name: string;
  category: string;
  tourism_category: string;
  commune: string;
  rating?: number;
  image_url: string;
  description?: string;
}

export default function CulturePage() {
  const [cultures, setCultures] = useState<CulturePlace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLiveCultureData() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("places")
          .select("id, slug, name, category, tourism_category, commune, rating, photos, image_url, description")
          .or("category.eq.culture,category.eq.history,tourism_category.ilike.%Văn Hóa%,tourism_category.ilike.%Tâm Linh%,tourism_category.ilike.%Di Tích%,tourism_category.ilike.%Chùa%")
          .eq("is_active", true)
          .order("rating", { ascending: false });

        if (!error && data && data.length > 0) {
          const formatted = data.map((item: any) => {
            let img = "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1200&auto=format&fit=crop";
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
              category: item.category || "culture",
              tourism_category: item.tourism_category || "Văn Hóa & Tâm Linh",
              commune: item.commune || "Thị trấn Tri Tôn",
              rating: item.rating ? Number(item.rating) : 4.8,
              image_url: img,
              description: item.description || ""
            };
          });
          setCultures(formatted);
        }
      } catch (err) {
        console.error("Culture fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadLiveCultureData();
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-[#F4F9F5] font-body-base text-slate-800 antialiased selection:bg-emerald-200">
      
      {/* Background Ornaments */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-emerald-300/20 blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-[30rem] h-[30rem] rounded-full bg-amber-300/15 blur-3xl" />
      </div>

      <main className="relative z-10 mx-auto w-full max-w-container-max flex-grow flex-col space-y-10 px-margin-mobile py-8 md:px-margin-desktop md:py-12">
        
        {/* Dynamic Culture Hot Section */}
        <HotPlacesSection
          categoryFilter="chùa"
          limit={3}
          title="🔥 TOP DI SẢN & VĂN HÓA KHMER HOT"
          subtitle="Những ngôi chùa Khmer cổ kính và di sản văn hóa tâm linh nổi tiếng nhất Tri Tôn"
        />
        
        {/* Header Hero Section */}
        <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#063821] via-[#0D4B2D] to-[#125C37] text-white p-8 sm:p-12 shadow-2xl border border-emerald-500/20">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-emerald-200 text-xs font-bold border border-white/20 backdrop-blur-md">
              <Landmark className="h-4 w-4 text-amber-300" />
              <span>Bảo Tồn Di Sản & Văn Hóa Bản Địa Bảy Núi</span>
            </div>
            <h1 className="font-heading font-extrabold text-3xl sm:text-5xl text-white tracking-tight leading-tight">
              Văn Hóa & Lễ Hội <br />
              <span className="text-amber-300">Khmer Độc Đáo Tri Tôn</span>
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-light">
              Khám phá toàn bộ 58+ ngôi chùa Khmer Nam Tông cổ kính, di sản kinh lá buông, căn cứ lịch sử Ô Tà Sóc, Đồi Tức Dụp và Lễ hội Đua Bò Bảy Núi trứ danh.
            </p>
          </div>
        </section>

        {/* Culture Cards Grid */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-emerald-200/80 pb-4">
            <h2 className="font-heading text-2xl font-extrabold text-slate-900 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              <span>Danh Sách Di Sản & Chùa Chiền Đã Xác Minh</span>
            </h2>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
              {cultures.length} Địa Điểm Văn Hóa
            </span>
          </div>

          {loading ? (
            <div className="py-16 text-center text-slate-400 font-bold text-sm">
              Đang tải danh sách di sản văn hóa...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {cultures.map((item) => (
                <article
                  key={item.id}
                  className="group flex flex-col overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl justify-between"
                >
                  <div>
                    <div className="relative h-56 overflow-hidden bg-slate-100">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-slate-900/80 text-white font-bold text-xs backdrop-blur-md">
                        {item.tourism_category}
                      </div>
                      <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/90 text-amber-600 font-extrabold text-[11px] shadow-sm">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        {item.rating}
                      </div>
                    </div>

                    <div className="p-6 space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                        <span className="flex items-center gap-1 text-emerald-800">
                          <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
                          {item.commune}
                        </span>
                      </div>

                      <h3 className="font-heading text-xl font-extrabold text-slate-900 group-hover:text-emerald-800 transition-colors">
                        {item.name}
                      </h3>
                      {item.description && (
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-light">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-6 pt-0">
                    <Link
                      href={`/places/${item.slug || item.id}`}
                      className="w-full py-3 bg-slate-900 hover:bg-emerald-900 text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all"
                    >
                      <span>Xem chi tiết di tích & Chỉ đường</span>
                      <ChevronRight className="h-4 w-4 text-amber-300" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
