"use client";

import React, { useState } from "react";
import {
  MessageSquareHeart,
  Send,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Star,
  MapPin,
  Camera,
  Lightbulb,
  FileEdit,
  HelpCircle,
  ShieldCheck,
  RotateCcw
} from "lucide-react";

interface FeedbackCategory {
  key: string;
  label: string;
  icon: React.ElementType;
  placeholder: string;
}

const CATEGORIES: FeedbackCategory[] = [
  {
    key: "place_contribution",
    label: "Điểm mới",
    icon: MapPin,
    placeholder: "Tên địa điểm mới, địa chỉ/xã, điểm đặc sắc...",
  },
  {
    key: "place_correction",
    label: "Báo sai sót",
    icon: FileEdit,
    placeholder: "Địa điểm cần sửa giờ mở cửa, vị trí, giá vé...",
  },
  {
    key: "photo_contribution",
    label: "Gửi ảnh",
    icon: Camera,
    placeholder: "Mô tả ảnh chụp, link Google Drive/Cloudinary...",
  },
  {
    key: "feature_request",
    label: "Đề xuất AI",
    icon: Lightbulb,
    placeholder: "Ý tưởng nâng cấp website hoặc tính năng AI...",
  },
  {
    key: "general",
    label: "Góp ý chung",
    icon: HelpCircle,
    placeholder: "Chia sẻ cảm nhận, đóng góp xây dựng dự án...",
  },
];

export default function FeedbackSection() {
  const [category, setCategory] = useState("place_contribution");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successData, setSuccessData] = useState<{ id: string; created_at: string } | null>(null);

  const currentCategory = CATEGORIES.find((c) => c.key === category) || CATEGORIES[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim()) {
      setErrorMsg("Vui lòng nhập tên của bạn.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Vui lòng nhập email hợp lệ.");
      return;
    }

    if (message.trim().length < 6) {
      setErrorMsg("Nội dung góp ý cần có ít nhất 6 ký tự.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/v1/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          category,
          message: message.trim(),
          rating,
          metadata: {
            source: "compact_greenish_feedback_section",
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Lỗi gửi góp ý. Vui lòng thử lại sau.");
      }

      setSuccessData({
        id: data.id,
        created_at: data.created_at || new Date().toISOString(),
      });
    } catch (err: any) {
      setErrorMsg(err.message || "Đã xảy ra lỗi khi gửi. Vui lòng kiểm tra kết nối mạng.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSuccessData(null);
    setName("");
    setEmail("");
    setMessage("");
    setRating(5);
    setErrorMsg("");
  };

  return (
    <section id="feedback-section" className="pt-2 pb-1 font-body">
      {/* Compact Greenish Card */}
      <div className="bg-gradient-to-br from-[#E6F4F1] via-[#EDF8F5] to-[#E0F2EE] rounded-2xl sm:rounded-3xl border border-[#0E8C7F]/25 p-3.5 sm:p-5 shadow-xs relative overflow-hidden">
        
        {/* Subtle mint glow in corner */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#0E8C7F]/8 rounded-full blur-2xl pointer-events-none" />

        {successData ? (
          <div className="py-4 text-center space-y-2.5 animate-in fade-in zoom-in duration-200">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-[#0E8C7F] flex items-center justify-center mx-auto shadow-2xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-sm sm:text-base font-bold text-[#0B6B60]">
                Cảm Ơn Đóng Góp Của Bạn!
              </h3>
              <p className="text-[11px] text-emerald-900/70 mt-0.5">
                Ý kiến đã được lưu an toàn. Ban quản trị sẽ xác minh và phản hồi qua <span className="font-bold text-[#0B6B60]">{email}</span>.
              </p>
            </div>
            <button
              onClick={handleReset}
              type="button"
              className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-[#0E8C7F] text-white text-[11px] font-bold font-display hover:bg-[#0B6B60] transition-colors cursor-pointer active:scale-95 shadow-2xs"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Gửi Thêm Ý Kiến</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-2.5 relative z-10">
            
            {/* Header: Title + Star Rating (Compact Single Row) */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-lg bg-[#0E8C7F] text-white flex items-center justify-center shadow-2xs shrink-0">
                  <MessageSquareHeart className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h2 className="font-display text-xs sm:text-sm font-extrabold text-[#0B6B60] leading-tight">
                    Góp Ý & Báo Sai Sót
                  </h2>
                  <p className="text-[10px] text-emerald-800/70 hidden sm:block">
                    Cùng chung tay hoàn thiện dữ liệu du lịch Tri Tôn
                  </p>
                </div>
              </div>

              {/* Mini 5-Star Rating */}
              <div className="flex items-center gap-0.5 bg-white/80 backdrop-blur-xs px-2 py-1 rounded-full border border-[#0E8C7F]/20">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-0.5 hover:scale-125 transition-transform cursor-pointer"
                    aria-label={`${star} sao`}
                  >
                    <Star
                      className={`w-3.5 h-3.5 ${
                        (hoverRating || rating) >= star
                          ? "text-[#F0A32F] fill-[#F0A32F]"
                          : "text-emerald-900/20"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Category Pills (Horizontal Scroll Compact) */}
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none font-display">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.key;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setCategory(cat.key)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 active:scale-95 ${
                      isSelected
                        ? "bg-[#0E8C7F] text-white shadow-2xs"
                        : "bg-white/80 border border-[#0E8C7F]/20 text-[#0B6B60] hover:bg-white"
                    }`}
                  >
                    <Icon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Form Inputs (2-Columns on Mobile, Compact Heights) */}
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tên bạn *"
                required
                className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-[#0E8C7F]/25 text-xs text-[#26221B] placeholder:text-emerald-900/40 focus:outline-none focus:ring-1 focus:ring-[#0E8C7F]"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email nhận phản hồi *"
                required
                className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-[#0E8C7F]/25 text-xs text-[#26221B] placeholder:text-emerald-900/40 focus:outline-none focus:ring-1 focus:ring-[#0E8C7F]"
              />
            </div>

            {/* Textarea */}
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={currentCategory.placeholder}
              rows={2}
              required
              className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-[#0E8C7F]/25 text-xs text-[#26221B] placeholder:text-emerald-900/40 focus:outline-none focus:ring-1 focus:ring-[#0E8C7F] resize-none"
            />

            {/* Error Message if any */}
            {errorMsg && (
              <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[11px] flex items-center gap-1.5 font-display">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Footer Submit Bar */}
            <div className="flex items-center justify-between gap-2 pt-0.5">
              <div className="flex items-center gap-1 text-[10px] text-emerald-800/70">
                <ShieldCheck className="w-3 h-3 text-[#0E8C7F] shrink-0" />
                <span className="truncate">Bảo mật thông tin</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#0E8C7F] hover:bg-[#0B6B60] active:scale-95 text-white text-xs font-bold font-display shadow-xs transition-all cursor-pointer disabled:opacity-50 shrink-0"
              >
                {loading ? (
                  <>
                    <Sparkles className="w-3 h-3 animate-spin" />
                    <span>Đang gửi...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3 h-3" />
                    <span>Gửi Ngay</span>
                  </>
                )}
              </button>
            </div>

          </form>
        )}
      </div>
    </section>
  );
}
