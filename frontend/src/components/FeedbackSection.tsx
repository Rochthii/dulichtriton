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
    label: "Đóng góp địa điểm mới",
    icon: MapPin,
    placeholder: "Nhập tên địa điểm mới, địa chỉ/xã, điểm đặc sắc hoặc link ảnh...",
  },
  {
    key: "place_correction",
    label: "Báo sai sót thông tin",
    icon: FileEdit,
    placeholder: "Tên địa điểm cần sửa, thông tin chưa chuẩn xác (giờ mở cửa, giá vé, đường đi)...",
  },
  {
    key: "photo_contribution",
    label: "Gửi tặng ảnh đẹp",
    icon: Camera,
    placeholder: "Mô tả ảnh chụp thực tế tại Tri Tôn, link Google Drive/Cloudinary ảnh của bạn...",
  },
  {
    key: "feature_request",
    label: "Đề xuất tính năng AI/Web",
    icon: Lightbulb,
    placeholder: "Ý tưởng nâng cấp website, tính năng chatbot AI bạn mong muốn...",
  },
  {
    key: "general",
    label: "Góp ý chung",
    icon: HelpCircle,
    placeholder: "Chia sẻ cảm nhận, đóng góp xây dựng dự án du lịch Tri Tôn...",
  },
];

export default function FeedbackSection() {
  const [category, setCategory] = useState("place_contribution");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
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
      setErrorMsg("Vui lòng nhập họ và tên của bạn.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Vui lòng nhập địa chỉ email hợp lệ để chúng tôi phản hồi.");
      return;
    }

    if (message.trim().length < 10) {
      setErrorMsg("Nội dung góp ý cần có ít nhất 10 ký tự.");
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
          phone: phone.trim() || undefined,
          category,
          subject: subject.trim() || undefined,
          message: message.trim(),
          rating,
          metadata: {
            source: "home_page_feedback_section",
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
    setPhone("");
    setSubject("");
    setMessage("");
    setRating(5);
    setErrorMsg("");
  };

  return (
    <section id="feedback-section" className="space-y-4 pt-2">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#0E8C7F] uppercase tracking-wider mb-1 font-display">
            <MessageSquareHeart className="w-4 h-4" />
            <span>Đồng Hành Cùng Tri Tôn</span>
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[#26221B] tracking-tight">
            Góp Ý & Đóng Góp Dữ Liệu
          </h2>
        </div>
      </div>

      <div className="bg-[#FFFDF7] rounded-3xl border border-[#26221B]/8 p-5 sm:p-8 shadow-[0_4px_20px_rgba(38,34,27,0.06)] relative overflow-hidden">
        {/* Glow corner accents */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#0E8C7F]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#F0A32F]/5 rounded-full blur-3xl pointer-events-none" />

        {successData ? (
          <div className="py-8 text-center space-y-4 max-w-lg mx-auto animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-display text-xl font-bold text-[#26221B]">
                Cảm Ơn Đóng Góp Quý Báu Của Bạn!
              </h3>
              <p className="text-xs sm:text-sm text-[#6B6355] leading-relaxed">
                Ý kiến của bạn đã được lưu trữ an toàn vào cơ sở dữ liệu hệ thống. Ban quản trị sẽ xác minh và phản hồi qua email <span className="font-bold text-[#26221B]">{email}</span> trong thời gian sớm nhất.
              </p>
            </div>

            <div className="p-3 bg-[#FAF3E7] rounded-2xl border border-[#26221B]/8 inline-block text-left text-xs font-mono text-[#6B6355]">
              <div>Mã tiếp nhận: <span className="font-bold text-[#0E8C7F]">{successData.id.slice(0, 13)}...</span></div>
              <div className="text-[11px] text-[#6B6355]/70 mt-0.5">Thời gian: {new Date(successData.created_at).toLocaleString("vi-VN")}</div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleReset}
                type="button"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#0E8C7F] text-white text-xs font-bold font-display hover:bg-[#0B6B60] transition-colors shadow-xs cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Gửi Thêm Góp Ý Khác</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 relative z-10 font-body">
            {/* Category Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#26221B] uppercase tracking-wider font-display flex items-center gap-1">
                <span>1. Chọn Chủ Đề Góp Ý</span>
                <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5 sm:gap-2 font-display">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.key;
                  return (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => setCategory(cat.key)}
                      className={`p-2 sm:p-2.5 rounded-2xl border flex flex-col items-center text-center gap-1 transition-all tap-bounce cursor-pointer ${
                        isSelected
                          ? "bg-[#0E8C7F] border-[#0E8C7F] text-white shadow-xs font-bold"
                          : "bg-[#FAF3E7] border-[#26221B]/8 text-[#6B6355] hover:border-[#0E8C7F]/30"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isSelected ? "text-white" : "text-[#0E8C7F]"}`} />
                      <span className="text-[11px] sm:text-xs leading-tight line-clamp-1">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#26221B] font-display flex items-center gap-1">
                  <span>Họ và Tên</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  required
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FAF3E7] border border-[#26221B]/10 text-xs sm:text-sm text-[#26221B] placeholder:text-[#6B6355]/50 focus:outline-none focus:ring-2 focus:ring-[#0E8C7F]/30 focus:border-[#0E8C7F]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#26221B] font-display flex items-center gap-1">
                  <span>Email Nhận Phản Hồi</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FAF3E7] border border-[#26221B]/10 text-xs sm:text-sm text-[#26221B] placeholder:text-[#6B6355]/50 focus:outline-none focus:ring-2 focus:ring-[#0E8C7F]/30 focus:border-[#0E8C7F]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#26221B] font-display">
                  Số Điện Thoại / Zalo (Tùy chọn)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0987xxxxxx"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FAF3E7] border border-[#26221B]/10 text-xs sm:text-sm text-[#26221B] placeholder:text-[#6B6355]/50 focus:outline-none focus:ring-2 focus:ring-[#0E8C7F]/30 focus:border-[#0E8C7F]"
                />
              </div>
            </div>

            {/* Subject & Satisfaction Rating */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-end">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold text-[#26221B] font-display">
                  Tiêu Đề Ngắn Gọn (Tùy chọn)
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Ví dụ: Đóng góp quán Bún cá Khmer mới mở tại Xã Châu Lăng..."
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FAF3E7] border border-[#26221B]/10 text-xs sm:text-sm text-[#26221B] placeholder:text-[#6B6355]/50 focus:outline-none focus:ring-2 focus:ring-[#0E8C7F]/30 focus:border-[#0E8C7F]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#26221B] font-display block">
                  Đánh Giá Trải Nghiệm Website
                </label>
                <div className="flex items-center gap-1.5 p-2 bg-[#FAF3E7] rounded-2xl border border-[#26221B]/10 justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-0.5 hover:scale-110 transition-transform cursor-pointer"
                      aria-label={`${star} sao`}
                    >
                      <Star
                        className={`w-5 h-5 ${
                          (hoverRating || rating) >= star
                            ? "text-[#F0A32F] fill-[#F0A32F]"
                            : "text-[#26221B]/20"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-[#26221B] ml-1 font-display">{rating}/5</span>
                </div>
              </div>
            </div>

            {/* Message Area */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#26221B] font-display flex items-center gap-1">
                  <span>Nội Dung Chi Tiết</span>
                  <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] text-[#6B6355]/70 font-mono">
                  {message.length} ký tự (tối thiểu 10)
                </span>
              </div>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={currentCategory.placeholder}
                rows={4}
                required
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FAF3E7] border border-[#26221B]/10 text-xs sm:text-sm text-[#26221B] placeholder:text-[#6B6355]/50 focus:outline-none focus:ring-2 focus:ring-[#0E8C7F]/30 focus:border-[#0E8C7F] resize-y"
              />
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-display">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Submit Action */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1 border-t border-[#26221B]/6">
              <div className="flex items-center gap-1.5 text-[11px] text-[#6B6355]">
                <ShieldCheck className="w-4 h-4 text-[#0E8C7F]" />
                <span>Mọi thông tin đóng góp được kiểm duyệt và lưu trữ bảo mật 100%.</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#0E8C7F] hover:bg-[#0B6B60] text-white text-xs sm:text-sm font-bold font-display shadow-md transition-all tap-bounce cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Đang Gửi Vào Hệ Thống...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Gửi Góp Ý Đến Ban Quản Trị</span>
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
