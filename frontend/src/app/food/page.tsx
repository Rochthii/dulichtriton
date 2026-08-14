"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import HotPlacesSection from "@/components/HotPlacesSection";
import { Utensils, MapPin, Star, Flame, ChevronRight, Clock, Sparkles, Coffee, Soup } from "lucide-react";

interface FoodItem {
  id: string;
  slug: string;
  name: string;
  category: string;
  tourism_category: string;
  commune: string;
  rating: number;
  image_url: string;
  video_url?: string;
  hours: string;
  description?: string;
}

export default function FoodPage() {
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [selectedCommune, setSelectedCommune] = useState("Tất cả");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLiveFoodData() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("places")
          .select("id, slug, name, category, tourism_category, commune, rating, photos, image_url, video_url, opening_hours, description")
          .or("category.eq.food,category.eq.Bún nước lèo,tourism_category.ilike.%Ẩm Thực%,tourism_category.ilike.%Cà Phê%,tourism_category.ilike.%Quán%")
          .eq("is_active", true)
          .order("rating", { ascending: false });

        if (!error && data && data.length > 0) {
          const formatted = data.map((item: any) => {
            let img = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop";
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
              category: item.category || "food",
              tourism_category: item.tourism_category || "Ẩm Thực Đặc Sản",
              commune: item.commune || "Thị trấn Tri Tôn",
              rating: item.rating ? Number(item.rating) : 4.8,
              image_url: img,
              video_url: item.video_url || `https://www.tiktok.com/search?q=${encodeURIComponent(item.name + " Tri Tôn")}`,
              hours: item.opening_hours || "06:00 - 21:00",
              description: item.description || ""
            };
          });
          setFoods(formatted);
        }
      } catch (err) {
        console.error("Supabase fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadLiveFoodData();
  }, []);

  const communes = ["Tất cả", "Thị trấn Tri Tôn", "Xã Ô Lâm", "Xã Núi Tô", "Xã Châu Lăng", "Thị trấn Ba Chúc", "Xã Lương Phi", "Xã An Tức"];

  const filteredFoods = selectedCommune === "Tất cả" 
    ? foods 
    : foods.filter(f => f.commune === selectedCommune);

  return (
    <div className="flex min-h-screen flex-col bg-[#F4F9F5] font-body-base text-slate-800 antialiased selection:bg-emerald-200">
      
      {/* Background Graphic Accents */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-emerald-300/20 blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-[30rem] h-[30rem] rounded-full bg-amber-300/15 blur-3xl" />
      </div>

      <main className="relative z-10 mx-auto w-full max-w-container-max flex-grow flex-col space-y-10 px-margin-mobile py-8 md:px-margin-desktop md:py-12">
        
        {/* Dynamic Food Hot Section */}
        <HotPlacesSection
          categoryFilter="ẩm thực"
          limit={3}
          title="🔥 TOP QUÁN ĂN & ĐẶC SẢN HOT NHẤT TRI TÔN"
          subtitle="Ma trận các quán ăn chuẩn giờ mở cửa, được đánh giá cao nhất bởi thực khách Bảy Núi"
        />
        
        {/* Header Hero Section */}
        <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#063821] via-[#0D4B2D] to-[#125C37] text-white p-8 sm:p-12 shadow-2xl border border-emerald-500/20">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-emerald-200 text-xs font-bold border border-white/20 backdrop-blur-md">
              <Flame className="h-4 w-4 text-amber-300" />
              <span>Dữ Liệu Trực Tuyến Live Database (46+ Quán Ăn & Cà Phê)</span>
            </div>
            <h1 className="font-heading font-extrabold text-3xl sm:text-5xl text-white tracking-tight leading-tight">
              Ẩm Thực Đặc Sản <br />
              <span className="text-amber-300">Đậm Đà Bản Vị Bảy Núi</span>
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-light max-w-2xl">
              Khám phá toàn bộ 46+ quán ăn, nhà hàng gà đốt Ô Thum lá chúc, quán cháo bò trái trúc, bánh bò thốt nốt và các quán cà phê view núi đẹp nhất Tri Tôn.
            </p>
          </div>
        </section>

        {/* Filter Pills */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-200/80 pb-4">
            <h2 className="font-heading text-2xl font-extrabold text-slate-900 flex items-center gap-2">
              <Utensils className="h-5 w-5 text-amber-500" />
              <span>Danh Sách Ẩm Thực & Quán Cà Phê</span>
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-full">
                {filteredFoods.length} / {foods.length} Địa Điểm
              </span>
            </div>
          </div>

          {/* Commune Filter Buttons */}
          <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-none">
            {communes.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCommune(c)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all shadow-sm ${
                  selectedCommune === c
                    ? "bg-emerald-900 text-white shadow-emerald-900/20"
                    : "bg-white text-slate-700 border border-slate-200 hover:border-emerald-500"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Food Cards Grid */}
          {loading ? (
            <div className="py-16 text-center text-slate-400 font-bold text-sm">
              Đang tải danh sách ẩm thực Tri Tôn...
            </div>
          ) : filteredFoods.length === 0 ? (
            <div className="py-16 text-center text-slate-500 font-bold text-sm bg-white rounded-3xl p-8 border border-slate-200">
              Không có quán ăn nào thuộc khu vực {selectedCommune}.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFoods.map((food) => (
                <article
                  key={food.id}
                  className="group flex flex-col overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl justify-between"
                >
                  <div>
                    <div className="relative h-56 overflow-hidden bg-slate-100">
                      <img
                        src={food.image_url}
                        alt={food.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-slate-900/80 backdrop-blur-md text-white font-bold text-xs">
                        {food.tourism_category}
                      </div>
                      <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/90 text-amber-600 font-extrabold text-[11px] shadow-sm">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        {food.rating}
                      </div>
                    </div>

                    <div className="p-6 space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                        <span className="flex items-center gap-1 text-emerald-800">
                          <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
                          {food.commune}
                        </span>
                        <span className="flex items-center gap-1 text-amber-700">
                          <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                          {food.hours}
                        </span>
                      </div>

                      <h3 className="font-heading text-xl font-extrabold text-slate-900 group-hover:text-emerald-800 transition-colors">
                        {food.name}
                      </h3>

                      {food.description && (
                        <p className="text-xs text-slate-600 line-clamp-2 font-light leading-relaxed">
                          {food.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-6 pt-0">
                    <Link
                      href={`/places/${food.slug || food.id}`}
                      className="w-full py-3 bg-slate-900 hover:bg-emerald-900 text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all"
                    >
                      <span>Xem chi tiết & Chỉ đường GPS</span>
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
