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
import { useLanguage } from "@/lib/i18n/LanguageContext";

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
  const { language, dict } = useLanguage();
  const em = dict.emergency;
  const isEn = language === 'en';

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  const handleCopy = (phone: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(phone.replace(/\D/g, ""));
    setCopiedPhone(phone);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  const emergencyContacts = (em.contactsList || []) as EmergencyContact[];

  const categories = [
    { id: "all", label: em.hero.filterAll || "Tất Cả", icon: LifeBuoy, count: emergencyContacts.length },
    { id: "medical", label: isEn ? "Medical" : "Cấp Cứu Y Tế", icon: Ambulance, count: emergencyContacts.filter(c => c.category === "medical").length },
    { id: "police", label: isEn ? "Police & Security" : "Công An & An Ninh", icon: ShieldAlert, count: emergencyContacts.filter(c => c.category === "police").length },
    { id: "rescue", label: isEn ? "Fire & Rescue" : "Cứu Hộ & PCCC", icon: Flame, count: emergencyContacts.filter(c => c.category === "rescue").length },
    { id: "vehicle", label: isEn ? "Roadside Repair" : "Vá Xe Phượt", icon: Wrench, count: emergencyContacts.filter(c => c.category === "vehicle").length },
    { id: "gov", label: isEn ? "Government" : "UBND Huyện", icon: Building2, count: emergencyContacts.filter(c => c.category === "gov").length }
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
              <span>{em.hero.badge}</span>
            </div>
            <h1 className="font-display text-xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
              {isEn ? (
                <>Tri Ton <span className="text-[#FFD37A]">Emergency Directory</span></>
              ) : (
                <>Danh Bạ Khẩn Cấp <span className="text-[#FFD37A]">Tri Tôn</span></>
              )}
            </h1>
            <p className="font-body text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              {em.hero.subtitle}
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
