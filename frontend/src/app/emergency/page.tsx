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
  TreePine,
  LifeBuoy,
  ChevronRight,
  ShieldCheck,
  Clock,
  HeartHandshake
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
      hours: "Trực chiến 24/24h (Xe chữa cháy & thiết bị cứu hộ chuyên dụng)",
      googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Phòng+Cảnh+Sát+PCCC+Công+An+Tỉnh+An+Giang",
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
      notes: "Phụ trách công tác quản lý đô thị, chợ trung tâm và các lễ hội trên địa bàn thị trấn.",
      accentBg: "bg-slate-50",
      accentText: "text-slate-800",
      borderColor: "border-slate-300"
    }
  ];

  const categories = [
    { id: "all", label: "Tất Cả Danh Bạ", icon: LifeBuoy, count: emergencyContacts.length },
    { id: "medical", label: "Cấp Cứu Y Tế", icon: Ambulance, count: emergencyContacts.filter(c => c.category === "medical").length },
    { id: "police", label: "Công An & An Ninh", icon: ShieldAlert, count: emergencyContacts.filter(c => c.category === "police").length },
    { id: "rescue", label: "Cứu Hộ & PCCC", icon: Flame, count: emergencyContacts.filter(c => c.category === "rescue").length },
    { id: "vehicle", label: "Cứu Hộ Xe Máy Phượt", icon: Wrench, count: emergencyContacts.filter(c => c.category === "vehicle").length },
    { id: "gov", label: "Chính Quyền UBND", icon: Building2, count: emergencyContacts.filter(c => c.category === "gov").length }
  ];

  const filteredContacts = activeCategory === "all"
    ? emergencyContacts
    : emergencyContacts.filter(c => c.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#FAF3E7] font-body text-[#26221B] py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header Hero Banner */}
        <div className="relative rounded-[32px] overflow-hidden bg-[#26221B] text-white p-6 sm:p-10 border-2 border-amber-500/30 shadow-xl space-y-6">
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-600/90 text-white text-xs font-black uppercase tracking-wider font-display shadow-sm">
              <PhoneCall className="h-3.5 w-3.5 animate-bounce" />
              <span>Tổng Đài Cứu Hộ & Trợ Giúp Khẩn Cấp 24/7</span>
            </div>
            <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
              Danh Bạ Khẩn Cấp <span className="text-[#FFD37A]">Du Lịch Tri Tôn</span>
            </h1>
            <p className="font-body text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Thông tin liên hệ trực tiếp, đã được xác minh 100% tới Trung tâm Y tế, Công an Huyện, Lực lượng Cứu nạn Cứu hộ Bảy Núi và đội hỗ trợ xe máy lưu động khi xảy ra sự cố ngoài ý muốn.
            </p>
          </div>

          {/* Quick 1-Tap Emergency Hotlines Bar */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <a
              href="tel:115"
              className="flex items-center justify-between p-4 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-display transition-all shadow-md active:scale-95 group"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Ambulance className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-teal-100 uppercase">Cấp Cứu Toàn Quốc</div>
                  <div className="text-xl font-black">115</div>
                </div>
              </div>
              <span className="text-xs font-extrabold bg-white text-teal-900 px-3 py-1 rounded-full group-hover:scale-105 transition-transform">
                Gọi Ngay
              </span>
            </a>

            <a
              href="tel:113"
              className="flex items-center justify-between p-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-display transition-all shadow-md active:scale-95 group"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <ShieldAlert className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-rose-100 uppercase">Công An & Cảnh Sát</div>
                  <div className="text-xl font-black">113</div>
                </div>
              </div>
              <span className="text-xs font-extrabold bg-white text-rose-900 px-3 py-1 rounded-full group-hover:scale-105 transition-transform">
                Gọi Ngay
              </span>
            </a>

            <a
              href="tel:114"
              className="flex items-center justify-between p-4 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-display transition-all shadow-md active:scale-95 group"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Flame className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-amber-100 uppercase">Cứu Hộ & PCCC</div>
                  <div className="text-xl font-black">114</div>
                </div>
              </div>
              <span className="text-xs font-extrabold bg-white text-amber-950 px-3 py-1 rounded-full group-hover:scale-105 transition-transform">
                Gọi Ngay
              </span>
            </a>
          </div>

          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer font-display ${
                  isActive
                    ? "bg-[#0E8C7F] text-white shadow-md shadow-[#0E8C7F]/20 scale-105"
                    : "bg-white text-[#6B6355] hover:bg-amber-100/60 border border-[#EBE1D0] hover:text-[#26221B]"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{cat.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"}`}>
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Contacts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredContacts.map((item) => (
            <div
              key={item.id}
              className={`bg-[#FFFDF7] rounded-[28px] p-6 border-2 ${item.borderColor} shadow-[0_4px_20px_rgba(240,163,47,0.08)] flex flex-col justify-between space-y-5 hover:shadow-lg transition-all duration-300`}
            >
              <div className="space-y-4">
                {/* Header Badge & Name */}
                <div className="flex items-start justify-between gap-3">
                  <span className={`px-3 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider font-display ${item.accentBg} ${item.accentText}`}>
                    {item.tag}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Clock className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span className="font-semibold">{item.hours}</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-display font-extrabold text-base sm:text-lg text-[#26221B] leading-snug">
                    {item.name}
                  </h3>
                  <div className="flex items-start gap-1.5 mt-2 text-xs text-[#6B6355]">
                    <MapPin className="h-3.5 w-3.5 text-[#0E8C7F] shrink-0 mt-0.5" />
                    <span>{item.address}</span>
                  </div>
                </div>

                {item.notes && (
                  <p className="text-xs text-[#6B6355] leading-relaxed bg-[#FAF3E7] p-3 rounded-2xl border border-[#EBE1D0]/80">
                    {item.notes}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-3 border-t border-[#EBE1D0]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <a
                    href={`tel:${item.phone.replace(/\./g, "")}`}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#0E8C7F] hover:bg-[#085A52] text-white font-extrabold text-xs shadow-xs transition-all active:scale-95 font-display"
                  >
                    <Phone className="h-4 w-4" />
                    <span>Gọi: {item.phone}</span>
                  </a>

                  <button
                    type="button"
                    onClick={(e) => handleCopy(item.phone, e)}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 text-[#26221B] border border-slate-300 font-bold text-xs shadow-2xs transition-all active:scale-95 font-display"
                  >
                    {copiedPhone === item.phone ? (
                      <>
                        <Check className="h-4 w-4 text-emerald-600" />
                        <span className="text-emerald-700">Đã Sao Chép!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 text-slate-500" />
                        <span>Sao Chép Số</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  {item.backupPhone && (
                    <a
                      href={`tel:${item.backupPhone.replace(/\./g, "")}`}
                      className="text-[11px] font-bold text-[#0E8C7F] hover:underline flex items-center gap-1 font-display"
                    >
                      <span>Số phụ: {item.backupPhone}</span>
                    </a>
                  )}

                  {item.googleMapsUrl && (
                    <a
                      href={item.googleMapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-bold text-slate-600 hover:text-emerald-700 ml-auto flex items-center gap-1 font-display"
                    >
                      <Navigation className="h-3 w-3 text-emerald-600" />
                      <span>Chỉ đường Maps</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Emergency Survival Guide Section */}
        <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-[#EBE1D0] shadow-sm space-y-6">
          <div className="flex items-center gap-2 text-[#A6503A]">
            <AlertTriangle className="h-5 w-5" />
            <h2 className="font-display text-lg sm:text-xl font-extrabold text-[#26221B]">
              Cẩm Nang Xử Lý Sự Cố Khi Du Lịch Bảy Núi
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-[#6B6355] leading-relaxed">
            <div className="p-4 rounded-2xl bg-[#FAF3E7] border border-[#EBE1D0] space-y-2">
              <div className="font-bold text-sm text-[#26221B] font-display flex items-center gap-1.5">
                <Compass className="h-4 w-4 text-[#0E8C7F]" />
                <span>1. Lạc Đường Rừng & Núi Dốc</span>
              </div>
              <p>
                Giữ bình tĩnh, không tiếp tục di chuyển sâu vào bụi rậm khi trời tối. Tìm điểm cao có sóng điện thoại, chụp màn hình tọa độ GPS trên Google Maps và gọi ngay cho <strong>Hạt Kiểm Lâm (0296.3874.120)</strong> hoặc <strong>113</strong>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF3E7] border border-[#EBE1D0] space-y-2">
              <div className="font-bold text-sm text-[#26221B] font-display flex items-center gap-1.5">
                <Wrench className="h-4 w-4 text-[#F26B3A]" />
                <span>2. Xe Thủng Lốp Giữa Đồng Vắng</span>
              </div>
              <p>
                Bật đèn khẩn cấp hoặc dắt xe vào bóng râm ven đường. Liên hệ đội <strong>Cứu hộ xe máy Bảy Núi (0918.423.473)</strong> hoặc tìm quán nước mía/thốt nốt gần nhất nhờ người dân gọi thợ vá ruột xe lưu động.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF3E7] border border-[#EBE1D0] space-y-2">
              <div className="font-bold text-sm text-[#26221B] font-display flex items-center gap-1.5">
                <Ambulance className="h-4 w-4 text-teal-700" />
                <span>3. Say Nắng & Sơ Cứu Khẩn Cấp</span>
              </div>
              <p>
                Nhanh chóng đưa người bệnh vào chòi râm mát, nới lỏng trang phục, uống từng ngụm nước thốt nốt tươi hoặc nước dừa bù khoáng. Gọi ngay <strong>Cấp cứu TTYT Tri Tôn (0296.3874.254 hoặc 115)</strong> nếu có dấu hiệu ngất xỉu.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
