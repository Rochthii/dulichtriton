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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("place_contribution");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const currentCategory = CATEGORIES.find((c) => c.key === category) || CATEGORIES[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setErrorMsg("Vui lòng điền đầy đủ các thông tin bắt buộc!");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/v1/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          category,
          rating,
          message: message.trim(),
        }),
      });

      if (!res.ok) throw new Error("Gửi phản hồi thất bại");

      setSubmitted(true);
      setMessage("");
    } catch {
      setErrorMsg("Có lỗi xảy ra khi gửi phản hồi. Vui lòng thử lại sau!");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setMessage("");
    setErrorMsg("");
  };

  return (
    <section className="bg-[#FFFDF7] rounded-3xl p-5 sm:p-7 border border-[#26221B]/8 shadow-[0_2px_10px_rgba(38,34,27,0.06)] space-y-4">
      <div className="flex items-center justify-between gap-3 border-b border-[#26221B]/6 pb-3">
        <div className="flex items-center gap-2 text-[#0E8C7F]">
          <MessageSquareHeart className="w-5 h-5" />
          <h3 className="font-display font-black text-sm sm:text-base text-[#26221B]">
            Đóng Góp Dữ Liệu & Ý Kiến Du Lịch
          </h3>
        </div>
        <span className="text-[11px] text-[#6B6355] font-display hidden sm:inline">
          Dữ liệu của bạn giúp bản đồ hoàn thiện hơn
        </span>
      </div>

      {submitted ? (
        <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
          <div className="space-y-1">
            <h4 className="font-display font-bold text-sm text-emerald-900">
              Cảm ơn bạn đã đóng góp cho Du Lịch Tri Tôn!
            </h4>
            <p className="text-xs text-emerald-700">
              Đội ngũ kiểm duyệt thực địa sẽ tiếp nhận và cập nhật thông tin trong thời gian sớm nhất.
            </p>
          </div>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold font-display shadow-xs transition-transform active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Gửi thêm góp ý khác</span>
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3.5 font-body">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none font-display">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = category === cat.key;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setCategory(cat.key)}
                  className={`min-h-[36px] flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 active:scale-95 touch-manipulation ${
                    isSelected
                      ? "bg-[#0E8C7F] text-white shadow-xs"
                      : "bg-[#FAF3E7] text-[#6B6355] border border-[#26221B]/8 hover:border-[#0E8C7F]/40"
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tên của bạn *"
              required
              className="w-full px-3 py-2 rounded-xl bg-white border border-[#26221B]/15 text-xs text-[#26221B] placeholder:text-[#6B6355]/50 focus:outline-none focus:ring-1 focus:ring-[#0E8C7F]"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email nhận phản hồi *"
              required
              className="w-full px-3 py-2 rounded-xl bg-white border border-[#26221B]/15 text-xs text-[#26221B] placeholder:text-[#6B6355]/50 focus:outline-none focus:ring-1 focus:ring-[#0E8C7F]"
            />
          </div>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={currentCategory.placeholder}
            rows={3}
            required
            className="w-full px-3 py-2 rounded-xl bg-white border border-[#26221B]/15 text-xs text-[#26221B] placeholder:text-[#6B6355]/50 focus:outline-none focus:ring-1 focus:ring-[#0E8C7F] resize-none"
          />

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-1.5 font-display">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit Action */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1 text-[11px] text-[#6B6355]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0E8C7F]" />
              <span>Bảo mật thông tin người gửi</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="min-h-[40px] px-5 py-2 rounded-xl bg-[#0E8C7F] hover:bg-[#085A52] text-white font-bold text-xs font-display flex items-center gap-1.5 shadow-xs transition-transform active:scale-95 cursor-pointer touch-manipulation disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang gửi...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Gửi Phản Hồi</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
