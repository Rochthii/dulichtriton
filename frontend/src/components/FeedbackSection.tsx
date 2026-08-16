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
  RotateCcw,
  Tag,
  ThumbsUp,
  Clock
} from "lucide-react";

interface FeedbackCategory {
  key: string;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  placeholder: string;
  quickTags: string[];
}

const CATEGORIES: FeedbackCategory[] = [
  {
    key: "place_contribution",
    label: "Đóng góp điểm mới",
    shortLabel: "Điểm mới",
    icon: MapPin,
    placeholder: "Nhập tên địa điểm mới, địa chỉ/xã, điểm đặc sắc hoặc link ảnh...",
    quickTags: [
      "Quán ăn mới mở",
      "Điểm check-in view núi",
      "Quán cà phê view đồng lúa",
      "Homestay mới tại Tri Tôn"
    ],
  },
  {
    key: "place_correction",
    label: "Báo sai lệch thông tin",
    shortLabel: "Báo sai lệch",
    icon: FileEdit,
    placeholder: "Tên địa điểm cần sửa, thông tin chưa chuẩn xác (giờ mở cửa, giá vé, đường đi)...",
    quickTags: [
      "Sai giờ mở cửa",
      "Sai vị trí Google Maps",
      "Quán đã đổi địa chỉ",
      "Giá bán đã thay đổi"
    ],
  },
  {
    key: "photo_contribution",
    label: "Gửi ảnh thực địa",
    shortLabel: "Gửi ảnh",
    icon: Camera,
    placeholder: "Mô tả ảnh chụp thực tế tại Tri Tôn, link Google Drive/Cloudinary ảnh của bạn...",
    quickTags: [
      "Ảnh check-in bình minh",
      "Ảnh hoàng hôn thốt nốt",
      "Ảnh món ăn thực tế",
      "Ảnh toàn cảnh flycam"
    ],
  },
  {
    key: "feature_request",
    label: "Đề xuất tính năng AI",
    shortLabel: "Tính năng AI",
    icon: Lightbulb,
    placeholder: "Ý tưởng nâng cấp website, tính năng chatbot AI bạn mong muốn...",
    quickTags: [
      "Lập lịch trình tự động",
      "Thêm bản đồ vệ tinh 3D",
      "Tìm quán ăn theo ngân sách",
      "Dự báo thời tiết chi tiết"
    ],
  },
  {
    key: "general",
    label: "Góp ý & Cảm nhận",
    shortLabel: "Góp ý chung",
    icon: HelpCircle,
    placeholder: "Chia sẻ cảm nhận, đóng góp xây dựng dự án du lịch Tri Tôn...",
    quickTags: [
      "Website rất hữu ích",
      "Cần thêm thông tin xe buýt",
      "Giao diện điện thoại đẹp",
      "Muốn liên hệ hợp tác"
    ],
  },
];

const RATING_LABELS: Record<number, string> = {
  1: "Cần cải thiện",
  2: "Bình thường",
  3: "Khá tốt",
  4: "Rất hài lòng",
  5: "Tuyệt vời xuất sắc",
};

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

  const handleQuickTagClick = (tag: string) => {
    setMessage((prev) => {
      if (!prev.trim()) return `[${tag}]: `;
      if (prev.includes(tag)) return prev;
      return `${prev}\n• [${tag}]: `;
    });
  };

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
            source: "mobile_optimized_feedback_section",
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
    <section id="feedback-section" className="space-y-3 sm:space-y-4 pt-2">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-[#0E8C7F] uppercase tracking-wider mb-1 font-display">
            <MessageSquareHeart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Đồng Hành Cùng Tri Tôn</span>
          </div>
          <h2 className="font-display text-lg sm:text-2xl font-extrabold text-[#26221B] tracking-tight">
            Góp Ý & Đóng Góp Dữ Liệu Thực Địa
          </h2>
        </div>
      </div>

      <div className="bg-[#FFFDF7] rounded-2xl sm:rounded-3xl border border-[#26221B]/8 p-4 sm:p-8 shadow-[0_4px_20px_rgba(38,34,27,0.06)] relative overflow-hidden">
        {/* Glow corner accents */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#0E8C7F]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#F0A32F]/5 rounded-full blur-3xl pointer-events-none" />

        {successData ? (
          <div className="py-6 sm:py-8 text-center space-y-4 max-w-lg mx-auto animate-in fade-in zoom-in duration-300">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8 sm:w-9 sm:h-9" />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-display text-lg sm:text-xl font-bold text-[#26221B]">
                Cảm Ơn Đóng Góp Quý Báu Của Bạn!
              </h3>
              <p className="text-xs sm:text-sm text-[#6B6355] leading-relaxed">
                Ý kiến của bạn đã được ghi nhận trực tiếp vào cơ sở dữ liệu hệ thống. Ban quản trị sẽ xác minh thực tế và phản hồi qua email <span className="font-bold text-[#26221B]">{email}</span>.
              </p>
            </div>

            <div className="p-3 bg-[#FAF3E7] rounded-2xl border border-[#26221B]/8 inline-block text-left text-xs font-mono text-[#6B6355] w-full sm:w-auto">
              <div>Mã tiếp nhận: <span className="font-bold text-[#0E8C7F]">{successData.id.slice(0, 13)}...</span></div>
              <div className="text-[11px] text-[#6B6355]/70 mt-0.5">Thời gian: {new Date(successData.created_at).toLocaleString("vi-VN")}</div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleReset}
                type="button"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-6 py-3 rounded-full bg-[#0E8C7F] text-white text-xs sm:text-sm font-bold font-display hover:bg-[#0B6B60] transition-colors shadow-xs cursor-pointer active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Gửi Thêm Đóng Góp Khác</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 relative z-10 font-body">
            
            {/* 1. Category Selector (Mobile-First 2-Column Responsive Grid) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] sm:text-xs font-bold text-[#26221B] uppercase tracking-wider font-display flex items-center gap-1">
                  <span>1. Chọn Chủ Đề Góp Ý</span>
                  <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] text-[#6B6355] font-mono hidden sm:inline">5 Danh mục</span>
              </div>

              {/* 2-Column on Mobile, 5-Column on Desktop */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 font-display">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.key;
                  return (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => setCategory(cat.key)}
                      className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border flex items-center sm:flex-col sm:justify-center text-left sm:text-center gap-2 sm:gap-1.5 transition-all cursor-pointer active:scale-95 ${
                        isSelected
                          ? "bg-[#0E8C7F] border-[#0E8C7F] text-white shadow-xs font-bold ring-2 ring-[#0E8C7F]/20"
                          : "bg-[#FAF3E7] border-[#26221B]/8 text-[#6B6355] hover:border-[#0E8C7F]/40"
                      }`}
                    >
                      <Icon className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 ${isSelected ? "text-white" : "text-[#0E8C7F]"}`} />
                      <span className="text-[11px] sm:text-xs leading-tight line-clamp-1 truncate">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Rating & Satisfaction Bar (Touch Optimized on Mobile) */}
            <div className="p-3 sm:p-3.5 bg-[#FAF3E7] rounded-2xl border border-[#26221B]/8 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#26221B] font-display">Đánh giá trải nghiệm ứng dụng</span>
                <span className="font-extrabold text-[#F0A32F] font-display text-xs">
                  {rating}/5 • {RATING_LABELS[hoverRating || rating]}
                </span>
              </div>
              <div className="flex items-center justify-between max-w-sm mx-auto pt-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-2 hover:scale-125 active:scale-90 transition-transform cursor-pointer touch-manipulation"
                    aria-label={`${star} sao`}
                  >
                    <Star
                      className={`w-6 h-6 sm:w-7 sm:h-7 ${
                        (hoverRating || rating) >= star
                          ? "text-[#F0A32F] fill-[#F0A32F] drop-shadow-xs"
                          : "text-[#26221B]/20"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Quick Tag Pills (Giảm 80% Thao Tác Gõ Phím Trên Mobile) */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1 text-[11px] font-bold text-[#6B6355]">
                <Tag className="w-3 h-3 text-[#0E8C7F]" />
                <span>Gợi ý nhanh (Chạm để chèn nội dung):</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {currentCategory.quickTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleQuickTagClick(tag)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 border border-emerald-200 text-emerald-800 text-[10px] sm:text-[11px] font-medium transition-colors cursor-pointer active:scale-95"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Form Input Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4">
              <div className="space-y-1">
                <label className="text-[11px] sm:text-xs font-bold text-[#26221B] font-display flex items-center gap-1">
                  <span>Họ và Tên</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl sm:rounded-2xl bg-[#FAF3E7] border border-[#26221B]/10 text-xs sm:text-sm text-[#26221B] placeholder:text-[#6B6355]/50 focus:outline-none focus:ring-2 focus:ring-[#0E8C7F]/30 focus:border-[#0E8C7F]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] sm:text-xs font-bold text-[#26221B] font-display flex items-center gap-1">
                  <span>Email Nhận Phản Hồi</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl sm:rounded-2xl bg-[#FAF3E7] border border-[#26221B]/10 text-xs sm:text-sm text-[#26221B] placeholder:text-[#6B6355]/50 focus:outline-none focus:ring-2 focus:ring-[#0E8C7F]/30 focus:border-[#0E8C7F]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] sm:text-xs font-bold text-[#26221B] font-display">
                  Số Điện Thoại / Zalo (Tùy chọn)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0987xxxxxx"
                  className="w-full px-3.5 py-2.5 rounded-xl sm:rounded-2xl bg-[#FAF3E7] border border-[#26221B]/10 text-xs sm:text-sm text-[#26221B] placeholder:text-[#6B6355]/50 focus:outline-none focus:ring-2 focus:ring-[#0E8C7F]/30 focus:border-[#0E8C7F]"
                />
              </div>
            </div>

            {/* 5. Message Content Area */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] sm:text-xs font-bold text-[#26221B] font-display flex items-center gap-1">
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
                className="w-full px-3.5 py-2.5 rounded-xl sm:rounded-2xl bg-[#FAF3E7] border border-[#26221B]/10 text-xs sm:text-sm text-[#26221B] placeholder:text-[#6B6355]/50 focus:outline-none focus:ring-2 focus:ring-[#0E8C7F]/30 focus:border-[#0E8C7F] resize-y"
              />
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 rounded-xl sm:rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-display">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Submit Action */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1 border-t border-[#26221B]/6">
              <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-[#6B6355]">
                <ShieldCheck className="w-4 h-4 text-[#0E8C7F] shrink-0" />
                <span>Mọi thông tin đóng góp được xác minh và lưu trữ an toàn.</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#0E8C7F] hover:bg-[#0B6B60] active:scale-95 text-white text-xs sm:text-sm font-bold font-display shadow-md transition-all cursor-pointer disabled:opacity-50"
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
