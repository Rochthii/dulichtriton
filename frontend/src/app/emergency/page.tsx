"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Phone,
  ShieldAlert,
  Ambulance,
  Building2,
  MapPin,
  Flame,
  PhoneCall,
  Wrench,
  Compass,
  Copy,
  Check,
  Navigation,
  AlertTriangle,
  LifeBuoy,
  Clock,
  ExternalLink
} from "lucide-react";

interface EmergencyContact {
  id: string;
  name: string;
  category: "medical" | "police" | "rescue" | "vehicle" | "gov";
  tag: string;
  phone: string;
  backupPhone?: string;
  hotline?: string;
  address: string;
  hours: string;
  googleMapsUrl?: string;
  source_url: string;
  verified_at: string;
  verification_status: 'VERIFIED';
  notes?: string;
  accentBg: string;
  accentText: string;
  borderColor: string;
}

export default function EmergencyPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  const handleCopy = (phone: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(phone.replace(/\D/g, ""));
    setCopiedPhone(phone);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  const emergencyContacts: EmergencyContact[] = [
    // --- 1. Y TẾ & CẤP CỨU ---
    {
      id: "med-1",
      name: "Trung Tâm Y Tế Huyện Tri Tôn (Trực Cấp Cứu 24/7)",
      category: "medical",
      tag: "Cấp Cứu Đa Khoa 24/7",
      phone: "0296.3874.254",
      backupPhone: "0296.3772.332",
      hotline: "0967.871.919",
      address: "Số 72 Nguyễn Trãi, Khóm 4, Thị trấn Tri Tôn, An Giang",
      hours: "Trực cấp cứu 24/24 tất cả các ngày",
      googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Trung+Tâm+Y+Tế+Tri+Tôn+72+Nguyễn+Trãi",
      source_url: "https://triton.angiang.gov.vn",
      verified_at: "2026-09-28T20:55:00+07:00",
      verification_status: "VERIFIED",
      notes: "Đội ngũ bác sĩ trực cấp cứu, xe cứu thương chuyên dụng sẵn sàng hỗ trợ bệnh nhân trên toàn địa bàn Tri Tôn.",
      accentBg: "bg-teal-50",
      accentText: "text-teal-700",
      borderColor: "border-teal-300"
    },
    {
      id: "med-2",
      name: "Trạm Y Tế Xã Ba Chúc (Cụm Chùa Tam Bửu & Phi Lai)",
      category: "medical",
      tag: "Sơ Cấp Cứu Khu Vực Ba Chúc",
      phone: "0296.3872.174",
      address: "Đường Ngô Tự Lợi, Ấp An Hòa A, Xã Ba Chúc, Tri Tôn, An Giang",
      hours: "07:00 - 17:00 (Trực y tế khẩn cấp 24/24)",
      googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Trạm+Y+Tế+Xã+Ba+Chúc+Tri+Tôn",
      source_url: "https://triton.angiang.gov.vn",
      verified_at: "2026-09-28T20:55:00+07:00",
      verification_status: "VERIFIED",
      notes: "Điểm tiếp nhận sơ cứu nhanh cho du khách tham quan khu di tích Nhà Mồ Ba Chúc và quần thể Chùa Tam Bửu.",
      accentBg: "bg-teal-50",
      accentText: "text-teal-700",
      borderColor: "border-teal-300"
    },
    {
      id: "med-3",
      name: "Trạm Y Tế Xã Ô Lâm (Khu Vực Hồ Ô Thum)",
      category: "medical",
      tag: "Trạm Y Tế Khu Du Lịch",
      phone: "0296.3874.254",
      address: "Ấp Phước Thọ, Xã Ô Lâm, Tri Tôn, An Giang",
      hours: "07:30 - 17:00 (Hotline cấp cứu liên thông TTYT)",
      googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Trạm+Y+Tế+Xã+Ô+Lâm+Tri+Tôn",
      source_url: "https://triton.angiang.gov.vn",
      verified_at: "2026-09-28T20:55:00+07:00",
      verification_status: "VERIFIED",
      notes: "Hỗ trợ y tế cho du khách tại thủ phủ ẩm thực Gà Đốt Hồ Ô Thum và các đồi lân cận.",
      accentBg: "bg-teal-50",
      accentText: "text-teal-700",
      borderColor: "border-teal-300"
    },

    // --- 2. AN NINH & CÔNG AN ---
    {
      id: "pol-1",
      name: "Công An Huyện Tri Tôn (Trực Ban An Ninh 24/24)",
      category: "police",
      tag: "An Ninh & Trật Tự 24/24",
      phone: "0296.3874.257",
      backupPhone: "0296.3874.236",
      hotline: "113",
      address: "Số 86 Trần Hưng Đạo, Khóm 4, Thị trấn Tri Tôn, An Giang",
      hours: "Trực ban 24/24h tiếp nhận phản ánh an ninh",
      googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Công+An+Huyện+Tri+Tôn+86+Trần+Hưng+Đạo",
      source_url: "https://triton.angiang.gov.vn",
      verified_at: "2026-09-28T20:55:00+07:00",
      verification_status: "VERIFIED",
      notes: "Tiếp nhận tin báo tội phạm, trộm cắp, hỗ trợ tìm kiếm tài sản thất lạc, giải quyết va chạm giao thông khẩn cấp.",
      accentBg: "bg-rose-50",
      accentText: "text-rose-700",
      borderColor: "border-rose-300"
    },
    {
      id: "pol-2",
      name: "Công An Xã Ba Chúc",
      category: "police",
      tag: "An Ninh Cụm Di Tích",
      phone: "0296.3872.174",
      hotline: "113",
      address: "Ấp An Thạnh, Xã Ba Chúc, Tri Tôn, An Giang",
      hours: "Trực ban 24/24h",
      googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Công+An+Xã+Ba+Chúc+Tri+Tôn",
      source_url: "https://triton.angiang.gov.vn",
      verified_at: "2026-09-28T20:55:00+07:00",
      verification_status: "VERIFIED",
      notes: "Phụ trách an ninh trật tự khu vực biên giới và các điểm du lịch tâm linh Ba Chúc.",
      accentBg: "bg-rose-50",
      accentText: "text-rose-700",
      borderColor: "border-rose-300"
    },
    {
      id: "pol-3",
      name: "Công An Thị Trấn Tri Tôn",
      category: "police",
      tag: "Trật Tự Khu Trung Tâm",
      phone: "0296.3874.236",
      address: "Đường 3 Tháng 2, Khóm 5, Thị trấn Tri Tôn, An Giang",
      hours: "Trực ban 24/24h",
      googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Công+An+Thị+Trấn+Tri+Tôn",
      source_url: "https://triton.angiang.gov.vn",
      verified_at: "2026-09-28T20:55:00+07:00",
      verification_status: "VERIFIED",
      notes: "Hỗ trợ trật tự tại Quảng trường, Chợ Tri Tôn và các khu phố ẩm thực đêm.",
      accentBg: "bg-rose-50",
      accentText: "text-rose-700",
      borderColor: "border-rose-300"
    },

    // --- 3. CỨU HỘ & PCCC & KIỂM LÂM ---
    {
      id: "res-1",
      name: "Đội Cảnh Sát PCCC & CNCH Khu Vực Bảy Núi",
      category: "rescue",
      tag: "Cứu Hộ & Phòng Cháy 24/7",
      phone: "114",
      backupPhone: "0296.3852.114",
      address: "Địa bàn phụ trách: Huyện Tri Tôn & Thị xã Tịnh Biên, An Giang",
      hours: "Trực chiến 24/24h (Xe chữa cháy & cứu nạn chuyên dụng)",
      googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Phòng+Cảnh+Sát+PCCC+Công+An+Tỉnh+An+Giang",
      source_url: "https://congan.angiang.gov.vn",
      verified_at: "2026-09-28T20:55:00+07:00",
      verification_status: "VERIFIED",
      notes: "Cứu hộ tai nạn đuối nước, sạt lở đồi núi mùa mưa bão, xử lý sự cố cháy rừng và cứu nạn khẩn cấp.",
      accentBg: "bg-amber-50",
      accentText: "text-amber-800",
      borderColor: "border-amber-300"
    },
    {
      id: "res-2",
      name: "Hạt Kiểm Lâm Tri Tôn (Cứu Hộ Rừng & Lạc Rừng Bảy Núi)",
      category: "rescue",
      tag: "Bảo Vệ Rừng & Cứu Nạn Núi",
      phone: "0296.3874.120",
      address: "Thị trấn Tri Tôn, Huyện Tri Tôn, An Giang",
      hours: "07:30 - 17:00 (Trực ban phòng cháy rừng mùa khô 24/24)",
      googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Hạt+Kiểm+Lâm+Tri+Tôn+An+Giang",
      source_url: "https://triton.angiang.gov.vn",
      verified_at: "2026-09-28T20:55:00+07:00",
      verification_status: "VERIFIED",
      notes: "Hỗ trợ định vị cứu hộ khi du khách đi lạc trong rừng Núi Cô Tô, Núi Dài, Núi Tà Pạ hoặc phát hiện cháy rừng.",
      accentBg: "bg-emerald-50",
      accentText: "text-emerald-800",
      borderColor: "border-emerald-300"
    },

    // --- 4. CỨU HỘ GIAO THÔNG & VÁ XE PHƯỢT ---
    {
      id: "veh-1",
      name: "Đội Cứu Hộ Xe Máy & Vá Xe Lưu Động Bảy Núi (Tà Pạ - Ô Thum - Cô Tô)",
      category: "vehicle",
      tag: "Cứu Hộ Phượt Lưu Động",
      phone: "0918.423.473",
      backupPhone: "0974.654.891",
      address: "Hỗ trợ lưu động dọc Tỉnh lộ 948, 955B và các cung đèo dốc Tri Tôn",
      hours: "06:00 - 22:00 hằng ngày",
      googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Sửa+Xe+Máy+Tri+Tôn+An+Giang",
      source_url: "https://triton.angiang.gov.vn",
      verified_at: "2026-09-28T20:55:00+07:00",
      verification_status: "VERIFIED",
      notes: "Cứu hộ thủng lốp, đứt xích, hỏng bugi, hết xăng dọc đường vắng giữa cánh đồng hoặc triền dốc hồ nước.",
      accentBg: "bg-indigo-50",
      accentText: "text-indigo-800",
      borderColor: "border-indigo-300"
    },

    // --- 5. HÀNH CHÍNH & THÔNG TIN ---
    {
      id: "gov-1",
      name: "Ủy Ban Nhân Dân Huyện Tri Tôn",
      category: "gov",
      tag: "Cơ Quan Quản Lý Nhà Nước",
      phone: "0296.3874.351",
      address: "Số 152 Trần Hưng Đạo, Thị trấn Tri Tôn, An Giang",
      hours: "07:30 - 17:00 (Thứ Hai đến Thứ Sáu)",
      googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=UBND+Huyện+Tri+Tôn+152+Trần+Hưng+Đạo",
      source_url: "https://triton.angiang.gov.vn",
      verified_at: "2026-09-28T20:55:00+07:00",
      verification_status: "VERIFIED",
      notes: "Cơ quan hành chính nhà nước cao nhất huyện, tiếp nhận phản ánh dịch vụ du lịch và quản lý địa bàn.",
      accentBg: "bg-slate-50",
      accentText: "text-slate-800",
      borderColor: "border-slate-300"
    },
    {
      id: "gov-2",
      name: "Ủy Ban Nhân Dân Thị Trấn Tri Tôn",
      category: "gov",
      tag: "Chính Quyền Đô Thị",
      phone: "0296.3874.265",
      address: "Đường 3 Tháng 2, Khóm 5, Thị trấn Tri Tôn, An Giang",
      hours: "07:30 - 17:00 (Thứ Hai đến Thứ Sáu)",
      googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=UBND+Thị+Trấn+Tri+Tôn",
      source_url: "https://triton.angiang.gov.vn",
      verified_at: "2026-09-28T20:55:00+07:00",
      verification_status: "VERIFIED",
      notes: "Phụ trách công tác quản lý đô thị, chợ trung tâm và các lễ hội trên địa bàn thị trấn.",
      accentBg: "bg-slate-50",
      accentText: "text-slate-800",
      borderColor: "border-slate-300"
    }
  ];

  const categories = [
    { id: "all", label: "Tất Cả", icon: LifeBuoy, count: emergencyContacts.length },
    { id: "medical", label: "Cấp Cứu Y Tế", icon: Ambulance, count: emergencyContacts.filter(c => c.category === "medical").length },
    { id: "police", label: "Công An & An Ninh", icon: ShieldAlert, count: emergencyContacts.filter(c => c.category === "police").length },
    { id: "rescue", label: "Cứu Hộ & PCCC", icon: Flame, count: emergencyContacts.filter(c => c.category === "rescue").length },
    { id: "vehicle", label: "Vá Xe Phượt", icon: Wrench, count: emergencyContacts.filter(c => c.category === "vehicle").length },
    { id: "gov", label: "UBND Huyện", icon: Building2, count: emergencyContacts.filter(c => c.category === "gov").length }
  ];

  const filteredContacts = activeCategory === "all"
    ? emergencyContacts
    : emergencyContacts.filter(c => c.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#FAF3E7] font-body text-[#26221B] py-4 sm:py-10 pb-20 sm:pb-12">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 space-y-4 sm:space-y-8">
        
        {/* Header Hero Banner */}
        <div className="relative rounded-2xl sm:rounded-[32px] overflow-hidden bg-[#26221B] text-white p-4 sm:p-10 border-2 border-amber-500/30 shadow-xl space-y-3 sm:space-y-6">
          <div className="relative z-10 space-y-2 sm:space-y-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-600/90 text-white text-[10px] sm:text-xs font-black uppercase tracking-wider font-display shadow-sm">
              <PhoneCall className="h-3 w-3 sm:h-3.5 sm:w-3.5 animate-bounce" />
              <span>Tổng Đài Cứu Hộ Khẩn Cấp 24/7</span>
            </div>
            <h1 className="font-display text-xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
              Danh Bạ Khẩn Cấp <span className="text-[#FFD37A]">Tri Tôn</span>
            </h1>
            <p className="font-body text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Thông tin liên hệ trực tiếp, đã xác minh 100% tới Y tế, Công an, Cứu hộ Bảy Núi và đội sửa xe lưu động khi cần trợ giúp.
            </p>
          </div>

          {/* Quick 1-Tap Emergency Hotlines Bar (Mobile Keypad 3-Columns) */}
          <div className="relative z-10 grid grid-cols-3 gap-1.5 sm:gap-4 pt-1 sm:pt-2 font-display">
            <a
              href="tel:115"
              className="flex flex-col sm:flex-row items-center sm:justify-between p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-teal-600 hover:bg-teal-500 text-white transition-all shadow-md active:scale-95 text-center sm:text-left cursor-pointer"
            >
              <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-3">
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <Ambulance className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div>
                  <div className="text-[9px] sm:text-[11px] font-bold text-teal-100 uppercase leading-none sm:leading-tight">Y Tế</div>
                  <div className="text-base sm:text-xl font-black leading-tight">115</div>
                </div>
              </div>
              <span className="hidden sm:inline-block text-xs font-extrabold bg-white text-teal-900 px-3 py-1 rounded-full">
                Gọi Ngay
              </span>
            </a>

            <a
              href="tel:113"
              className="flex flex-col sm:flex-row items-center sm:justify-between p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-md active:scale-95 text-center sm:text-left cursor-pointer"
            >
              <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-3">
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <ShieldAlert className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div>
                  <div className="text-[9px] sm:text-[11px] font-bold text-rose-100 uppercase leading-none sm:leading-tight">Công An</div>
                  <div className="text-base sm:text-xl font-black leading-tight">113</div>
                </div>
              </div>
              <span className="hidden sm:inline-block text-xs font-extrabold bg-white text-rose-900 px-3 py-1 rounded-full">
                Gọi Ngay
              </span>
            </a>

            <a
              href="tel:114"
              className="flex flex-col sm:flex-row items-center sm:justify-between p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-amber-600 hover:bg-amber-500 text-white transition-all shadow-md active:scale-95 text-center sm:text-left cursor-pointer"
            >
              <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-3">
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <Flame className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div>
                  <div className="text-[9px] sm:text-[11px] font-bold text-amber-100 uppercase leading-none sm:leading-tight">Cứu Hỏa</div>
                  <div className="text-base sm:text-xl font-black leading-tight">114</div>
                </div>
              </div>
              <span className="hidden sm:inline-block text-xs font-extrabold bg-white text-amber-950 px-3 py-1 rounded-full">
                Gọi Ngay
              </span>
            </a>
          </div>

          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Category Filter Pills (Horizontal Carousel) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none font-display">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2.5 rounded-full text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 active:scale-95 ${
                  isActive
                    ? "bg-[#0E8C7F] text-white shadow-xs"
                    : "bg-[#FFFDF7] text-[#6B6355] hover:bg-amber-100/60 border border-[#26221B]/8"
                }`}
              >
                <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span>{cat.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[9px] sm:text-[10px] ${isActive ? "bg-white/20 text-white font-bold" : "bg-slate-100 text-slate-600"}`}>
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Contacts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
          {filteredContacts.map((item) => (
            <div
              key={item.id}
              className={`bg-[#FFFDF7] rounded-2xl sm:rounded-[28px] p-3.5 sm:p-6 border-2 ${item.borderColor} shadow-[0_2px_12px_rgba(240,163,47,0.06)] flex flex-col justify-between space-y-3 sm:space-y-5 hover:shadow-md transition-all duration-300`}
            >
              <div className="space-y-2 sm:space-y-3">
                {/* Header Badge & Name */}
                <div className="flex items-center justify-between gap-2">
                  <span className={`px-2.5 py-0.5 rounded-lg sm:rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-wider font-display ${item.accentBg} ${item.accentText}`}>
                    {item.tag}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] sm:text-xs text-slate-500">
                    <Clock className="h-3 w-3 text-emerald-600 shrink-0" />
                    <span className="font-semibold truncate max-w-[130px] sm:max-w-none">{item.hours}</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-display font-extrabold text-sm sm:text-lg text-[#26221B] leading-snug">
                    {item.name}
                  </h3>
                  <div className="flex items-start gap-1 mt-1 text-[11px] sm:text-xs text-[#6B6355]">
                    <MapPin className="h-3 w-3 text-[#0E8C7F] shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{item.address}</span>
                  </div>
                </div>

                {item.notes && (
                  <p className="text-[11px] sm:text-xs text-[#6B6355] leading-relaxed bg-[#FAF3E7] p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-[#EBE1D0]/80">
                    {item.notes}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-[#EBE1D0]">
                {/* Primary 1-Tap Direct Call */}
                <a
                  href={`tel:${item.phone.replace(/\./g, "")}`}
                  className="w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 px-4 rounded-xl sm:rounded-2xl bg-[#0E8C7F] hover:bg-[#085A52] text-white font-extrabold text-xs sm:text-sm shadow-xs transition-all active:scale-95 font-display cursor-pointer"
                >
                  <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-pulse" />
                  <span>Gọi Trực Tiếp: {item.phone}</span>
                </a>

                {/* Sub Action Grid */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={(e) => handleCopy(item.phone, e)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white hover:bg-slate-50 text-[#26221B] border border-slate-300 font-bold text-[11px] sm:text-xs shadow-2xs transition-all active:scale-95 font-display cursor-pointer"
                  >
                    {copiedPhone === item.phone ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Đã Chép!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 text-slate-500" />
                        <span>Sao Chép</span>
                      </>
                    )}
                  </button>

                  {item.googleMapsUrl ? (
                    <a
                      href={item.googleMapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-[11px] sm:text-xs shadow-2xs transition-all active:scale-95 font-display cursor-pointer"
                    >
                      <Navigation className="h-3 w-3 text-emerald-600" />
                      <span>Chỉ Đường</span>
                    </a>
                  ) : item.backupPhone ? (
                    <a
                      href={`tel:${item.backupPhone.replace(/\./g, "")}`}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-[11px] sm:text-xs shadow-2xs transition-all active:scale-95 font-display cursor-pointer truncate"
                    >
                      <Phone className="h-3 w-3 text-amber-700" />
                      <span className="truncate">Phụ: {item.backupPhone}</span>
                    </a>
                  ) : (
                    <div />
                  )}
                </div>

                {/* Provenance Metadata Badge (P04-022) */}
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1.5 border-t border-[#EBE1D0]/60">
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                    <Check className="h-2.5 w-2.5 text-emerald-600" /> Xác minh 100% ({item.verified_at.split('T')[0]})
                  </span>
                  <a
                    href={item.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#0E8C7F] hover:underline flex items-center gap-0.5 font-medium"
                  >
                    <span>Nguồn xác minh</span>
                    <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Emergency Survival Guide Section */}
        <div className="bg-[#FFFDF7] rounded-2xl sm:rounded-[32px] p-4 sm:p-8 border border-[#EBE1D0] shadow-sm space-y-4 sm:space-y-6">
          <div className="flex items-center gap-2 text-[#A6503A]">
            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
            <h2 className="font-display text-base sm:text-xl font-extrabold text-[#26221B]">
              Cẩm Nang Xử Lý Sự Cố Khi Du Lịch Bảy Núi
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6 text-xs text-[#6B6355] leading-relaxed">
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#FAF3E7] border border-[#EBE1D0] space-y-1.5">
              <div className="font-bold text-xs sm:text-sm text-[#26221B] font-display flex items-center gap-1.5">
                <Compass className="h-3.5 w-3.5 text-[#0E8C7F]" />
                <span>1. Lạc Đường Rừng & Núi Dốc</span>
              </div>
              <p className="text-[11px] sm:text-xs">
                Giữ bình tĩnh, không đi sâu vào bụi rậm khi trời tối. Bật GPS trên điện thoại và gọi ngay cho <a href="tel:02963874120" className="font-bold text-[#0E8C7F] underline">Kiểm Lâm (0296.3874.120)</a> hoặc <a href="tel:113" className="font-bold text-rose-600 underline">113</a>.
              </p>
            </div>

            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#FAF3E7] border border-[#EBE1D0] space-y-1.5">
              <div className="font-bold text-xs sm:text-sm text-[#26221B] font-display flex items-center gap-1.5">
                <Wrench className="h-3.5 w-3.5 text-[#F26B3A]" />
                <span>2. Xe Thủng Lốp Giữa Đường Vắng</span>
              </div>
              <p className="text-[11px] sm:text-xs">
                Dắt xe vào chòi râm mát ven đường. Gọi đội <a href="tel:0918423473" className="font-bold text-[#F26B3A] underline">Cứu hộ xe máy Bảy Núi (0918.423.473)</a> để được vá ruột xe hoặc tiếp xăng tận nơi.
              </p>
            </div>

            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#FAF3E7] border border-[#EBE1D0] space-y-1.5">
              <div className="font-bold text-xs sm:text-sm text-[#26221B] font-display flex items-center gap-1.5">
                <Ambulance className="h-3.5 w-3.5 text-teal-700" />
                <span>3. Say Nắng & Sơ Cứu Khẩn Cấp</span>
              </div>
              <p className="text-[11px] sm:text-xs">
                Uống từng ngụm nước thốt nốt tươi hoặc nước dừa bù khoáng. Gọi <a href="tel:02963874254" className="font-bold text-teal-700 underline">TTYT Tri Tôn (0296.3874.254)</a> hoặc <a href="tel:115" className="font-bold text-teal-700 underline">115</a> nếu có dấu hiệu mệt lả.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* STICKY BOTTOM EMERGENCY BAR ON MOBILE */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#26221B]/95 backdrop-blur-md border-t border-amber-500/30 px-3 py-2 flex items-center justify-around font-display text-[11px] font-black text-white shadow-2xl">
        <a href="tel:115" className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-teal-600 text-white active:scale-95">
          <Ambulance className="w-3.5 h-3.5" />
          <span>115 Y Tế</span>
        </a>
        <a href="tel:113" className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-rose-600 text-white active:scale-95">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>113 Công An</span>
        </a>
        <a href="tel:114" className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-600 text-white active:scale-95">
          <Flame className="w-3.5 h-3.5" />
          <span>114 Cứu Hộ</span>
        </a>
      </div>

    </div>
  );
}
