"use client";

import { Phone, ShieldAlert, Ambulance, Building2, MapPin, HeartHandshake, PhoneCall } from "lucide-react";

export default function EmergencyPage() {
  const contacts = [
    {
      name: "Công an Tri Tôn (Trực ban)",
      phone: "0296.3874.113",
      address: "Thị trấn Tri Tôn, An Giang",
      icon: ShieldAlert,
      tag: "An ninh & Trật tự",
      accent: "bg-[#A6503A] text-white"
    },
    {
      name: "Trung tâm Y tế Tri Tôn (Cấp cứu)",
      phone: "0296.3874.115",
      address: "Thị trấn Tri Tôn, An Giang",
      icon: Ambulance,
      tag: "Cấp cứu 24/7",
      accent: "bg-[#0E8C7F] text-white"
    },
    {
      name: "Ủy Ban Nhân Dân Thị Trấn Tri Tôn",
      phone: "0296.3874.201",
      address: "Đường Trần Hưng Đạo, Thị trấn Tri Tôn",
      icon: Building2,
      tag: "Hành chính địa phương",
      accent: "bg-[#D9822B] text-white"
    },
    {
      name: "Đội Cứu Hộ & PCCC Bảy Núi",
      phone: "114",
      address: "Phụ trách khu vực Bảy Núi",
      icon: HeartHandshake,
      tag: "Cứu hộ PCCC",
      accent: "bg-[#A6503A] text-white"
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF3E7] font-body text-[#26221B] py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="space-y-3 border-b border-[#26221B]/8 pb-6">
          <div className="flex items-center gap-2 text-[#A6503A] text-xs font-bold uppercase tracking-wider font-display">
            <PhoneCall className="h-4 w-4" />
            <span>Danh Bạ Hỗ Trợ Khẩn Cấp 24/7</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#26221B]">
            Tổng Đài Cứu Hộ Du Lịch Tri Tôn
          </h1>
          <p className="font-body text-xs sm:text-sm text-[#6B6355] max-w-2xl leading-relaxed">
            Danh bạ liên hệ trực tiếp tới lực lượng công an, trung tâm y tế và đội cứu hộ cứu nạn khu vực Tri Tôn khi xảy ra sự cố ngoài ý muốn trên cung đường du lịch Bảy Núi.
          </p>
        </div>

        {/* Contacts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {contacts.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-[#FFFDF7] rounded-[26px] p-6 border border-[#26221B]/8 shadow-[0_2px_10px_rgba(38,34,27,0.08)] flex flex-col justify-between space-y-5 hover:border-[#0E8C7F]/40 transition-all hover:-translate-y-1"
              >
                <div className="flex items-start gap-4">
                  <div className={`h-12 w-12 rounded-2xl ${item.accent} flex items-center justify-center shrink-0 shadow-xs`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="space-y-1.5">
                    <span className="inline-block px-3 py-0.5 rounded-full bg-[#FAF3E7] text-[#26221B] text-[11px] font-bold border border-[#26221B]/10 font-display">
                      {item.tag}
                    </span>
                    <h3 className="font-display font-bold text-base sm:text-lg text-[#26221B]">{item.name}</h3>
                    <p className="font-body text-xs text-[#6B6355] flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-[#0E8C7F] shrink-0" />
                      {item.address}
                    </p>
                  </div>
                </div>

                <a
                  href={`tel:${item.phone}`}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-[#F0A32F] hover:bg-[#C97F1B] text-[#26221B] hover:text-white font-bold text-xs shadow-xs transition-all font-display active:scale-95"
                >
                  <Phone className="h-4 w-4" />
                  <span>Gọi ngay: {item.phone}</span>
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
