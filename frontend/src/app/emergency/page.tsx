"use client";

import { Phone, ShieldAlert, Ambulance, Building2, MapPin, HeartHandshake } from "lucide-react";

export default function EmergencyPage() {
  const contacts = [
    {
      name: "Công an Huyện Tri Tôn",
      phone: "0296.3874.112",
      address: "Thị trấn Tri Tôn",
      icon: ShieldAlert,
      tag: "An ninh & Trật tự"
    },
    {
      name: "Trung tâm Y tế Huyện Tri Tôn",
      phone: "0296.3874.115",
      address: "Thị trấn Tri Tôn",
      icon: Ambulance,
      tag: "Cấp cứu 24/7"
    },
    {
      name: "Ủy Ban Nhân Dân Thị Trấn Tri Tôn",
      phone: "0296.3874.201",
      address: "Đường Tran Hưng Đạo, Thị trấn Tri Tôn",
      icon: Building2,
      tag: "Hành chính địa phương"
    },
    {
      name: "Đội Cứu Hộ & PCCC Bảy Núi",
      phone: "114",
      address: "Phụ trách khu vực Bảy Núi",
      icon: HeartHandshake,
      tag: "Cứu hộ PCCC"
    }
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="space-y-3 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-2 text-red-600 text-xs font-bold uppercase tracking-wider">
          <Phone className="h-4 w-4" />
          <span>Danh Bạ Hỗ Trợ Khẩn Cấp 24/7</span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900">
          Tổng Đài Cứu Hộ Du Lịch Tri Tôn
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl">
          Danh bạ liên hệ trực tiếp tới lực lượng công an, trung tâm y tế và đội cứu hộ cứu nạn khu vực Tri Tôn khi xảy ra sự cố ngoài ý muốn.
        </p>
      </div>

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {contacts.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:border-red-200 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <span className="inline-block px-2.5 py-0.5 rounded bg-red-100 text-red-800 text-[11px] font-bold">
                    {item.tag}
                  </span>
                  <h3 className="font-heading font-bold text-lg text-slate-900">{item.name}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    {item.address}
                  </p>
                </div>
              </div>

              <a
                href={`tel:${item.phone}`}
                className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
              >
                <Phone className="h-4 w-4" />
                <span>Gọi ngay: {item.phone}</span>
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
