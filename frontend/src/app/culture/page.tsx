"use client";

import { Landmark, MapPin, Calendar, Compass, Clock, Star, Sparkles, ChevronRight, Award, ShieldCheck } from "lucide-react";
import Link from "next/link";
import HotPlacesSection from "@/components/HotPlacesSection";

export default function CulturePage() {
  const cultures = [
    {
      name: "Chùa Xvayton (Chùa Xà Tón) 500 Tuổi",
      category: "Kiến Trúc Nam Tông",
      desc: "Ngôi chùa Khmer cổ nhất An Giang mang nghệ thuật kiến trúc tháp nhọn rực rỡ và nơi lưu giữ bộ kinh lá buông độc bản quý hiếm.",
      location: "Thị trấn Tri Tôn",
      time: "Mở cửa 06:00 - 18:00 hàng ngày",
      badge: "Di sản Quốc gia",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCIkt4mKcSMtN9qwWrnCavUNbd04V9-GYHPHeebFZyKXuiRnw6MUL1Qw2bsIsFB9nvNb4nwM87r5AbatwHdBlVeQ6ENzVwUmrHSBEYkmJ-cjCHYFjZRl6fz6VwL9RqMKrXt9pUigCmz71KjXxWSbsdcL3WCIX30VH8iXFopWhWSndEEy2G6dEqkpAdYMEoHcl-n0bTUj6Z7O50iAwa7xx_6bYi5N00srNzVSwgRc_6FXYAO_50JqasE4w",
      alt: "Ancient 500 year Chua Xvayton Pagoda"
    },
    {
      name: "Lễ Hội Đua Bò Bảy Núi (Dolta Khmer)",
      category: "Di Sản Phi Vật Thể",
      desc: "Lễ hội thể thao dân gian độc nhất vô nhị miền Tây, quy tụ hàng trăm đôi bò chiến tranh tài gay cấn dịp lễ Sene Dolta.",
      location: "Chùa Thơm Mít (Xã Vĩnh Trung)",
      time: "Tháng 8 - Tháng 9 Âm lịch",
      badge: "Sắp diễn ra",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuA0a_ShvHqoLBzzQeBZPBVukoFsxHkKwXzcTE2T6K_xPyk67rYycDNJbkuK17L9mWsVhNHt61xA_rUHEZVNHKRhdP_2FifG80aCCtsRoh5M6AnzI1M0-Ph_03-SGI5d3LxCK8Tci5VwUmdtgQTARcov5Z1dut3OWHedU55-M9Smk9jgkYBSvoqmN9XIH3zKtZx8pZY9PYDY29mHsuXs8YFP921mu6oTsHeKkO9mBiIH2Z3DCkVCnXsbsg",
      alt: "Hội đua bò Bảy Núi"
    },
    {
      name: "Tết Chol Chnam Thmay Khmer",
      category: "Lễ Hội Cổ Truyền",
      desc: "Tết cổ truyền rộn ràng của đồng bào Khmer với các nghi thức tắm Phật, đắp núi cát cầu may và múa mâm khèn Chhay-dăm.",
      location: "Toàn bộ Xã / Thị trấn Tri Tôn",
      time: "14/04 - 16/04 Hàng năm",
      badge: "Tết Truyền Thống",
      img: "https://images.unsplash.com/photo-1540555700478-4be289fbecef",
      alt: "Tet Chol Chnam Thmay Khmer"
    },
    {
      name: "Chùa Tà Pạ & Cổng Trời Tri Tôn",
      category: "Tâm Linh Thắng Cảnh",
      desc: "Ngôi chùa nổi trên đỉnh núi Tà Pạ sở hữu tầm nhìn 360 độ ngắm trọn vẹn cánh đồng lúa chín vàng óng và hồ nước xanh ngọc.",
      location: "Xã Núi Tô",
      time: "Mở cửa quanh năm",
      badge: "Must Visit",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAzEBJmMN9MDBMXjMxP__-ZHcR4SsumjDwneLDOiMeMeEnxO5L4-OXzwn9OtdG-7P1gnd7zxD9cpALjSM2Ti_GScFrGSZmaSOTLBEjWyssKW2a_zyVT6uxtzDhGhlW-J1BH7WYuCSv7XEjhNSVpjWpILzIuSP4k4VBbUTyFSd5SPdfBz9jpuhRXHkXoyqd0fe8203OOVA2FouxJ4U81kV1ol1Yq--EAkhGhU5dI13wt71HUBMIGst8cSg",
      alt: "Chua Ta Pa"
    }
  ];

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
              <span>Bảo Tồn Di Sản Phi Vật Thể Bảy Núi</span>
            </div>
            <h1 className="font-heading font-extrabold text-3xl sm:text-5xl text-white tracking-tight leading-tight">
              Văn Hóa & Lễ Hội <br />
              <span className="text-amber-300">Khmer Độc Đáo Tri Tôn</span>
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-light">
              Khám phá không khí rộn ràng của Lễ hội Đua Bò Bảy Núi, chiêm bái những ngôi chùa Khmer Nam Tông 500 năm tuổi và hòa mình vào phong tục tập quán bản địa sắc màu.
            </p>
          </div>
        </section>

        {/* Culture & Festival Cards Grid */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-emerald-200/80 pb-4">
            <h2 className="font-heading text-2xl font-extrabold text-slate-900 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              <span>Danh Sách Di Sản & Lễ Hội Nổi Bật</span>
            </h2>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
              4 Di Sản Đặc Sắc
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {cultures.map((item, idx) => (
              <article
                key={idx}
                className="group flex flex-col overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl justify-between"
              >
                <div>
                  <div className="relative h-64 overflow-hidden bg-slate-100">
                    <img
                      src={item.img}
                      alt={item.alt}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4 px-3 py-1 rounded-xl bg-amber-400 text-slate-950 font-extrabold text-xs shadow-md">
                      {item.badge}
                    </div>
                    <div className="absolute top-4 right-4 px-3 py-1 rounded-xl bg-slate-900/80 text-white font-bold text-xs backdrop-blur-md">
                      {item.category}
                    </div>
                  </div>

                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                      <span className="flex items-center gap-1 text-emerald-800">
                        <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
                        {item.location}
                      </span>
                      <span className="flex items-center gap-1 text-amber-600">
                        <Calendar className="h-4 w-4 text-amber-500 shrink-0" />
                        {item.time}
                      </span>
                    </div>

                    <h2 className="font-heading text-2xl font-extrabold text-slate-900 group-hover:text-emerald-800 transition-colors">
                      {item.name}
                    </h2>
                    <p className="text-xs text-slate-600 leading-relaxed font-light">
                      {item.desc}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <Link
                    href="/planner"
                    className="w-full py-3.5 bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-extrabold rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all"
                  >
                    <span>Lên lịch trình tham quan</span>
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
