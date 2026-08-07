"use client";

import { useState } from "react";
import { Sparkles, Clock, MapPin, CheckCircle2, ChevronRight, Compass, Calendar, Route, ArrowRight, ShieldCheck, Car, Coffee, Navigation } from "lucide-react";
import Link from "next/link";

export default function PlannerPage() {
  const [selectedDuration, setSelectedDuration] = useState("1day");
  const [selectedStyle, setSelectedStyle] = useState("culture");

  const itineraryItems = [
    {
      time: "07:30 - 08:30",
      title: "Thưởng Thức Cháo Bò Trái Trúc Rô 31",
      location: "Thị trấn Tri Tôn",
      distance: "1.5km từ bến xe Tri Tôn",
      tag: "Ăn Sáng Đặc Sản",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBkHUDKiIJE4KJWt-00IzsRQDsKl5vybNI3P9LIGOjuRMdjrJdhiUH5dOucUHcg-zW-umlBu-mSWAsGVjE0n8H8jYDsKtcmyQQvogwqey9foKt3C1bb7nNGvC7-Kirf-csJPIMgIVc8gUAYmaT0QDsKy7v4VH7QbOofMDn8b4viEqW3cWXy5bawuYPjdKiMTRamLLDtFXWVhAQ653wbJsFgvYCxz3Kb3tHvnCyUagVBrZ27cZrEvz-I8g",
      note: "Quán đông vào khoảng 8h, nên ghé sớm để chọn phần lòng nầm tươi ngon."
    },
    {
      time: "08:30 - 10:30",
      title: "Check-in Tuyệt Tình Cốc Hồ Tà Pạ & Chùa Tà Pạ",
      location: "Xã Núi Tô",
      distance: "3.2km (10 phút di chuyển)",
      tag: "Check-in & Tâm Linh",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAzEBJmMN9MDBMXjMxP__-ZHcR4SsumjDwneLDOiMeMeEnxO5L4-OXzwn9OtdG-7P1gnd7zxD9cpALjSM2Ti_GScFrGSZmaSOTLBEjWyssKW2a_zyVT6uxtzDhGhlW-J1BH7WYuCSv7XEjhNSVpjWpILzIuSP4k4VBbUTyFSd5SPdfBz9jpuhRXHkXoyqd0fe8203OOVA2FouxJ4U81kV1ol1Yq--EAkhGhU5dI13wt71HUBMIGst8cSg",
      note: "Nắng sáng chiếu xuống mặt hồ đổi màu xanh ngọc tuyệt đẹp, thời gian chụp ảnh đẹp nhất trong ngày."
    },
    {
      time: "11:30 - 13:00",
      title: "Ăn Trưa Gà Đốt Ô Thum Lá Trúc Bên Hồ",
      location: "Xã Ô Lâm",
      distance: "6.5km (15 phút di chuyển)",
      tag: "Ẩm Thực Nổi Tiếng",
      img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5",
      note: "Gà đốt tại chỗ khoảng 25-30 phút, nên gọi trước khi tới trạm ngắm cảnh hồ Ô Thum."
    },
    {
      time: "14:00 - 16:30",
      title: "Chiêm Bái Chùa Xvayton 500 Tuổi & Cổng Trời Tri Tôn",
      location: "Thị trấn Tri Tôn",
      distance: "4.0km (12 phút di chuyển)",
      tag: "Di Sản Văn Hóa Khmer",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCIkt4mKcSMtN9qwWrnCavUNbd04V9-GYHPHeebFZyKXuiRnw6MUL1Qw2bsIsFB9nvNb4nwM87r5AbatwHdBlVeQ6ENzVwUmrHSBEYkmJ-cjCHYFjZRl6fz6VwL9RqMKrXt9pUigCmz71KjXxWSbsdcL3WCIX30VH8iXFopWhWSndEEy2G6dEqkpAdYMEoHcl-n0bTUj6Z7O50iAwa7xx_6bYi5N00srNzVSwgRc_6FXYAO_50JqasE4w",
      note: "Trang phục lịch sự khi viếng chùa tháp Nam Tông cổ kính."
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
        
        {/* Header Hero Section */}
        <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#063821] via-[#0D4B2D] to-[#125C37] text-white p-8 sm:p-12 shadow-2xl border border-emerald-500/20">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-emerald-200 text-xs font-bold border border-white/20 backdrop-blur-md">
              <Sparkles className="h-4 w-4 text-amber-300" />
              <span>AI Trip Planner 2.0 - Lập Lịch Trình Tối Ưu</span>
            </div>
            <h1 className="font-heading font-extrabold text-3xl sm:text-5xl text-white tracking-tight leading-tight">
              Kế Hoạch Du Lịch <br />
              <span className="text-amber-300">Thông Minh Cùng Trợ Lý AI</span>
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-light max-w-2xl">
              Chỉ cần chọn thời gian chuyến đi và sở thích cá nhân, hệ thống AI sẽ tự động phân bổ đường đi ngắn nhất, sắp xếp thời gian hợp lý và đề xuất món ăn chuẩn vị Bảy Núi.
            </p>
          </div>
        </section>

        {/* AI Filter Selectors */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-emerald-100 shadow-sm space-y-6">
          <h2 className="font-heading text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Route className="h-5 w-5 text-emerald-700" />
            <span>Tùy Chỉnh Chuyến Đi Của Bạn</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Thời gian chuyến đi</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedDuration("1day")}
                  className={selectedDuration === "1day" ? "flex-1 py-3 px-4 rounded-2xl bg-emerald-900 text-white font-extrabold text-xs shadow-md" : "flex-1 py-3 px-4 rounded-2xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200"}
                >
                  Phượt 1 Ngày (Trong ngày)
                </button>
                <button
                  onClick={() => setSelectedDuration("2day")}
                  className={selectedDuration === "2day" ? "flex-1 py-3 px-4 rounded-2xl bg-emerald-900 text-white font-extrabold text-xs shadow-md" : "flex-1 py-3 px-4 rounded-2xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200"}
                >
                  Trải Nghiệm 2 Ngày 1 Đêm
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Phong cách ưu tiên</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedStyle("culture")}
                  className={selectedStyle === "culture" ? "flex-1 py-3 px-4 rounded-2xl bg-amber-500 text-slate-950 font-extrabold text-xs shadow-md" : "flex-1 py-3 px-4 rounded-2xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200"}
                >
                  Check-in & Văn Hóa Khmer
                </button>
                <button
                  onClick={() => setSelectedStyle("food")}
                  className={selectedStyle === "food" ? "flex-1 py-3 px-4 rounded-2xl bg-amber-500 text-slate-950 font-extrabold text-xs shadow-md" : "flex-1 py-3 px-4 rounded-2xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200"}
                >
                  Foodtour Ẩm Thực Bảy Núi
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Generated Itinerary Flow */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-emerald-200/80 pb-4">
            <h2 className="font-heading text-2xl font-extrabold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              <span>Lịch Trình AI Gợi Ý Tối Ưu (07:30 - 17:00)</span>
            </h2>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-full">
              Khoảng cách tổng: 15.2 km
            </span>
          </div>

          <div className="space-y-6">
            {itineraryItems.map((item, idx) => (
              <div
                key={idx}
                className="group bg-white rounded-3xl border border-emerald-100 p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row items-center gap-6 justify-between"
              >
                <div className="h-44 w-full md:w-64 rounded-2xl bg-slate-100 overflow-hidden shrink-0 relative">
                  <img src={item.img} alt={item.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-slate-900/80 backdrop-blur-md text-amber-300 font-extrabold text-[11px]">
                    {item.tag}
                  </div>
                </div>

                <div className="space-y-3 flex-grow w-full">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-extrabold border border-emerald-200/60">
                    <Clock className="h-3.5 w-3.5 text-emerald-600" />
                    <span>{item.time}</span>
                  </div>

                  <h3 className="font-heading font-extrabold text-xl text-slate-900 group-hover:text-emerald-800 transition-colors">
                    {item.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-500">
                    <span className="flex items-center gap-1 text-emerald-800">
                      <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
                      {item.location}
                    </span>
                    <span className="flex items-center gap-1 text-amber-700">
                      <Navigation className="h-4 w-4 text-amber-500 shrink-0" />
                      {item.distance}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100 leading-relaxed font-light">
                    💡 <strong className="font-bold text-slate-800">Lưu ý AI:</strong> {item.note}
                  </p>
                </div>

                <div className="shrink-0 w-full md:w-auto">
                  <Link
                    href="/map"
                    className="w-full md:w-auto py-3 px-5 bg-slate-900 hover:bg-emerald-900 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all"
                  >
                    <span>Mở bản đồ GPS</span>
                    <ArrowRight className="h-4 w-4 text-amber-300" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
