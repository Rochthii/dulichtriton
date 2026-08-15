'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ChevronLeft, ChevronRight, Maximize2, Compass, ShieldAlert,
  TrendingUp, Users, Smartphone, Sparkles, Building2, MapPin,
  CheckCircle2, XCircle, Store, QrCode, Award, Zap, PhoneCall
} from 'lucide-react';
import AppLogo from '@/components/AppLogo';

const totalSlides = 10;

export default function PitchDeckPage() {
  const [currentSlide, setCurrentSlide] = useState(1);

  const nextSlide = () => {
    if (currentSlide < totalSlides) setCurrentSlide(prev => prev + 1);
  };

  const prevSlide = () => {
    if (currentSlide > 1) setCurrentSlide(prev => prev - 1);
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullScreen();
      } else if (e.key >= '1' && e.key <= '9') {
        setCurrentSlide(parseInt(e.key));
      } else if (e.key === '0') {
        setCurrentSlide(10);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide]);

  return (
    <div className="min-h-screen bg-[#0D0C0A] text-[#E2E8F0] flex flex-col justify-between select-none relative overflow-hidden font-sans">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#0E8C7F]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#D9822B]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar */}
      <header className="flex justify-between items-center px-6 sm:px-10 py-4 bg-[#0D0C0A]/85 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <AppLogo size="md" />
            <span className="font-heading font-extrabold text-xl text-white">DU LỊCH <span className="text-[#14B8A6]">TRI TÔN AI</span></span>
          </Link>
          <span className="bg-[#D9822B]/20 border border-[#D9822B]/40 text-[#F59E0B] text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            EXECUTIVE PITCH DECK
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Hệ Thống Đang Vận Hành 100%</span>
          </div>
          <div className="font-mono text-sm text-slate-400">
            Trang <span className="text-[#14B8A6] font-bold text-base">{currentSlide < 10 ? `0${currentSlide}` : currentSlide}</span> / {totalSlides}
          </div>
        </div>
      </header>

      {/* Main Slide Presentation Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8 z-10">
        <div className="w-full max-w-6xl bg-[#161412] border border-white/10 rounded-3xl shadow-2xl p-6 sm:p-12 min-h-[580px] flex flex-col justify-between transition-all duration-300 relative overflow-hidden">
          
          {/* SLIDE 1: HOOK & VISION */}
          {currentSlide === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-[#F59E0B] bg-[#D9822B]/15 border border-[#D9822B]/30 px-2.5 py-1 rounded uppercase tracking-wider">
                  ĐỀ ÁN KHỞI NGHIỆP DU LỊCH BẢN ĐỊA
                </span>
                <span className="text-xs text-slate-400">Khám phá Bảy Núi cùng Trí Tuệ Nhân Tạo 24/7</span>
              </div>

              <h1 className="font-heading font-extrabold text-3xl sm:text-5xl text-white leading-tight">
                Số Hóa Du Lịch Tri Tôn — Đưa <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2DD4BF] to-[#F59E0B]">Di Sản Bảy Núi</span> Cất Cánh
              </h1>

              <p className="text-slate-300 text-base sm:text-lg max-w-3xl leading-relaxed">
                Nền tảng du lịch AI thực chiến đầu tiên tại An Giang: Kết nối 149 di tích lịch sử, chùa tháp Khmer, ẩm thực Gà Đốt Ô Thum và mạng lưới 50+ hộ kinh doanh bản địa.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
                <div className="bg-white/[0.03] border border-teal-500/30 rounded-2xl p-5 text-center">
                  <div className="font-heading font-extrabold text-3xl sm:text-4xl text-[#14B8A6]">149</div>
                  <div className="text-xs sm:text-sm font-medium text-slate-400 mt-1">Điểm xác minh thực tế 100%</div>
                </div>
                <div className="bg-white/[0.03] border border-teal-500/30 rounded-2xl p-5 text-center">
                  <div className="font-heading font-extrabold text-3xl sm:text-4xl text-[#14B8A6]">&lt; 900ms</div>
                  <div className="text-xs sm:text-sm font-medium text-slate-400 mt-1">Trợ lý AI phản hồi tức thì</div>
                </div>
                <div className="bg-white/[0.03] border border-amber-500/30 rounded-2xl p-5 text-center">
                  <div className="font-heading font-extrabold text-3xl sm:text-4xl text-[#F59E0B]">35+</div>
                  <div className="text-xs sm:text-sm font-medium text-slate-400 mt-1">Lịch trình phượt độc quyền</div>
                </div>
                <div className="bg-white/[0.03] border border-teal-500/30 rounded-2xl p-5 text-center">
                  <div className="font-heading font-extrabold text-3xl sm:text-4xl text-[#14B8A6]">24/7</div>
                  <div className="text-xs sm:text-sm font-medium text-slate-400 mt-1">Danh bạ cứu hộ khẩn cấp</div>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 2: THE 3 PAIN POINTS */}
          {currentSlide === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-red-400 bg-red-950/40 border border-red-500/30 px-2.5 py-1 rounded uppercase tracking-wider">
                  NỖI ĐAU THỰC ĐỊA
                </span>
                <span className="text-xs text-slate-400">3 Điểm Nghẽn Lớn Nhất Ngành Du Lịch Tri Tôn</span>
              </div>

              <h2 className="font-heading font-extrabold text-2xl sm:text-4xl text-white">
                Cảnh Đẹp Hùng Vĩ Nhưng <span className="text-[#F87171]">Du Khách & Chủ Quán Đều Gặp Khó</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
                <div className="bg-red-950/10 border border-red-500/20 rounded-2xl p-6 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                    <Compass size={20} />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-white">1. Du Khách & Phượt Thủ</h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    • <strong>80% thông tin mạng bị sai lệch</strong> (nhầm bún cá với bún nước lèo, gà đốt với gà nướng).<br />
                    • Không biết đường vào chùa sâu trong núi.<br />
                    • Đến quán Gà Đốt phải chờ <strong>45 phút</strong>.
                  </p>
                </div>

                <div className="bg-red-950/10 border border-red-500/20 rounded-2xl p-6 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                    <Store size={20} />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-white">2. Quán Ăn & Homestay</h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    • <strong>90% là hộ gia đình</strong>, không biết tự làm marketing số.<br />
                    • Khách dồn đột ngột vào trưa cuối tuần gây quá tải, ngày thường vắng vẻ.<br />
                    • Bị đối thủ giả mạo vị trí và hotline.
                  </p>
                </div>

                <div className="bg-red-950/10 border border-red-500/20 rounded-2xl p-6 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                    <Building2 size={20} />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-white">3. Chính Quyền & Di Tích</h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    • Chưa có Cổng số hóa chuẩn xác giới thiệu bảo vật Kinh lá buông, 5 Đại lễ hội Khmer.<br />
                    • Thiếu kênh cứu hộ khi du khách lạc rừng hoặc hỏng xe đèo núi.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 3: THE SOLUTION */}
          {currentSlide === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-[#14B8A6] bg-teal-950/40 border border-teal-500/30 px-2.5 py-1 rounded uppercase tracking-wider">
                  GIẢI PHÁP ĐỘT PHÁ
                </span>
                <span className="text-xs text-slate-400">Hệ Sinh Thái Số Hóa 3 Chiều Độc Quyền</span>
              </div>

              <h2 className="font-heading font-extrabold text-2xl sm:text-4xl text-white">
                Nền Tảng AI Bản Địa <span className="text-[#14B8A6]">Giải Quyết Trọn Vẹn 3 Chiều</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
                <div className="bg-teal-950/15 border border-teal-500/30 rounded-2xl p-6 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-[#14B8A6] flex items-center justify-center">
                    <Smartphone size={20} />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-[#2DD4BF]">1. Du Khách Bỏ Túi AI 24/7</h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    • <strong>Hỏi đáp tức thì</strong> mọi câu hỏi lộ trình, văn hóa.<br />
                    • Nút <strong>Gọi 1 Chạm đặt trước Gà Đốt 45 phút</strong>, không phải chờ.<br />
                    • Đính kèm link <strong>Google Maps + Video TikTok</strong> cho từng điểm.
                  </p>
                </div>

                <div className="bg-amber-950/15 border border-amber-500/30 rounded-2xl p-6 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-[#F59E0B] flex items-center justify-center">
                    <Award size={20} />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-[#F59E0B]">2. Hộ Kinh Doanh Bản Địa</h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    • Huy hiệu <strong>Đối Tác Xác Thực Vàng</strong> uy tín.<br />
                    • <strong>Bảng mica QR Đặt Bàn</strong> đón khách tự động.<br />
                    • Tăng <strong>30% - 40% doanh thu</strong> nhờ đơn đặt trước có kế hoạch.
                  </p>
                </div>

                <div className="bg-teal-950/15 border border-teal-500/30 rounded-2xl p-6 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-[#14B8A6] flex items-center justify-center">
                    <ShieldAlert size={20} />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-[#2DD4BF]">3. Địa Phương & Xã Hội</h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    • Số hóa chuẩn xác <strong>149 di tích & chùa Khmer</strong>.<br />
                    • <strong>Danh bạ cứu hộ 24/7</strong> bảo vệ an toàn cho du khách.<br />
                    • Thúc đẩy tiêu thụ nông sản & đặc sản OCOP Bảy Núi.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 4: MARKET SIZE */}
          {currentSlide === 4 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-[#F59E0B] bg-[#D9822B]/15 border border-[#D9822B]/30 px-2.5 py-1 rounded uppercase tracking-wider">
                  CƠ HỘI THỊ TRƯỜNG
                </span>
                <span className="text-xs text-slate-400">Quy Mô & Thời Điểm Vàng Bùng Nổ</span>
              </div>

              <h2 className="font-heading font-extrabold text-2xl sm:text-4xl text-white">
                Tại Sao Phải Là <span className="text-[#14B8A6]">Bảy Núi — An Giang Ngay Bây Giờ?</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-4">
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-2">
                  <div className="font-heading font-extrabold text-4xl text-[#14B8A6]">2.5 Triệu+</div>
                  <div className="text-xs sm:text-sm font-semibold text-white">Lượt du khách đến An Giang mỗi năm</div>
                  <p className="text-xs text-slate-400 pt-2">Nhóm phượt thủ trẻ, trekking Núi Cô Tô, cắm trại Hồ Ô Thum tăng trưởng 40%/năm.</p>
                </div>

                <div className="bg-white/[0.03] border border-amber-500/30 rounded-2xl p-6 space-y-2">
                  <div className="font-heading font-extrabold text-4xl text-[#F59E0B]">40,000+</div>
                  <div className="text-xs sm:text-sm font-semibold text-white">Khách xem Hội Đua Bò trong 3 ngày</div>
                  <p className="text-xs text-slate-400 pt-2">Nhu cầu tìm chỗ ăn, bãi xe và cứu hộ phượt bùng nổ quá tải mạng xã hội.</p>
                </div>

                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-2">
                  <div className="font-heading font-extrabold text-4xl text-[#14B8A6]">NQ 82</div>
                  <div className="text-xs sm:text-sm font-semibold text-white">Nghị quyết 82/NQ-CP Chuyển đổi số Du lịch</div>
                  <p className="text-xs text-slate-400 pt-2">Cơ hội vàng hợp tác B2G với Sở Du Lịch và UBND Huyện Tri Tôn.</p>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 5: LIVE PRODUCT & TECH MOAT */}
          {currentSlide === 5 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-1 rounded uppercase tracking-wider">
                  SẢN PHẨM ĐÃ CHẠY THẬT
                </span>
                <span className="text-xs text-slate-400">Không Phải Bản Vẽ — Sẵn Sàng 100%</span>
              </div>

              <h2 className="font-heading font-extrabold text-2xl sm:text-4xl text-white">
                Kiến Trúc Kỹ Thuật Đỉnh Cao & <span className="text-[#14B8A6]">Dữ Liệu Độc Quyền</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-heading font-bold text-lg text-white">⚡ Hạ Tầng Kỹ Thuật Chuẩn Enterprise</h3>
                    <span className="text-xs font-mono text-emerald-400">v11.0.0</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    • <strong>Next.js 14 SSG + Edge Computing</strong>: Tốc độ tải trang &lt; 200ms.<br />
                    • <strong>Supabase pgvector HNSW</strong>: Quét Vector RAG ngữ nghĩa trong 256ms.<br />
                    • <strong>Multi-LLM Resilience Engine</strong>: Cụm 4 khóa Gemini Round-Robin tự phục hồi lỗi.<br />
                    • <strong>7 Tầng Bảo Mật Chuyên Sâu</strong>: Chống DDoS, Rate Limit, chặn bot cào trộm, ẩn mã nguồn F12.
                  </p>
                </div>

                <div className="bg-teal-950/15 border border-teal-500/30 rounded-2xl p-6 space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-heading font-bold text-lg text-[#2DD4BF]">📍 CSDL Thực Địa Độc Quyền</h3>
                    <span className="text-xs font-mono text-[#F59E0B]">149 POIs</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    • <strong>149 địa điểm</strong> phủ khắp các xã/thị trấn (không dùng từ 'Huyện Tri Tôn').<br />
                    • <strong>40+ quán đặc sản</strong> Gà Đốt Ô Thum, Cháo bò Châu Lăng, Bún cá củ ngải Dì Dom.<br />
                    • <strong>5 Đại lễ hội & Bảo vật Kinh lá buông</strong> Chùa Xvayton.<br />
                    • <strong>Danh bạ cứu hộ 24/7</strong> kết nối trực tiếp Công An, Y Tế, Cứu hộ xe máy.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 6: BUSINESS MODEL */}
          {currentSlide === 6 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-[#F59E0B] bg-[#D9822B]/15 border border-[#D9822B]/30 px-2.5 py-1 rounded uppercase tracking-wider">
                  MÔ HÌNH KINH DOANH
                </span>
                <span className="text-xs text-slate-400">Đa Dòng Tiền Thực Tế & Khả Thi</span>
              </div>

              <h2 className="font-heading font-extrabold text-2xl sm:text-4xl text-white">
                Cơ Chế Doanh Thu Đa Nguồn <span className="text-[#14B8A6]">Bền Vững & Dài Hạn</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-2">
                  <h3 className="font-heading font-bold text-base text-white">1. Gói Đối Tác Xác Thực</h3>
                  <div className="font-heading font-extrabold text-2xl text-[#F59E0B]">2.500.000đ</div>
                  <div className="text-xs text-slate-400">/ Cơ sở / Năm</div>
                  <p className="text-xs text-slate-400 pt-2 leading-relaxed">
                    Gắn nhãn Đối Tác Xác Thực Vàng, ưu tiên gợi ý trong kết quả AI Chat, hiển thị menu giá chuẩn và số hotline gọi trực tiếp.
                  </p>
                </div>

                <div className="bg-teal-950/20 border border-teal-500/40 rounded-2xl p-5 space-y-2">
                  <h3 className="font-heading font-bold text-base text-[#2DD4BF]">2. Phí Đặt Bàn & Đặt Phòng</h3>
                  <div className="font-heading font-extrabold text-2xl text-[#14B8A6]">10k - 20k / Đơn</div>
                  <div className="text-xs text-slate-400">Hoa hồng 5% - 8% Homestay</div>
                  <p className="text-xs text-slate-300 pt-2 leading-relaxed">
                    Du khách đặt trước gà đốt 45p hoặc giữ phòng homestay view núi Cô Tô qua nút gọi xác nhận.
                  </p>
                </div>

                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-2">
                  <h3 className="font-heading font-bold text-base text-white">3. Tiếp Thị Đặc Sản OCOP</h3>
                  <div className="font-heading font-extrabold text-2xl text-[#F59E0B]">10% - 15%</div>
                  <div className="text-xs text-slate-400">Hoa hồng trên mỗi đơn hàng</div>
                  <p className="text-xs text-slate-400 pt-2 leading-relaxed">
                    Bán đặc sản Đường thốt nốt nguyên chất, Tinh dầu lá chúc, Mắm cá rô đồng Bảy Núi giao tận nhà du khách.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 7: GTM & O2O */}
          {currentSlide === 7 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-[#14B8A6] bg-teal-950/40 border border-teal-500/30 px-2.5 py-1 rounded uppercase tracking-wider">
                  CHIẾN LƯỢC TĂNG TRƯỞNG O2O
                </span>
                <span className="text-xs text-slate-400">Chuyển Đổi Người Dùng Với Chi Phí 0 Đồng</span>
              </div>

              <h2 className="font-heading font-extrabold text-2xl sm:text-4xl text-white">
                Vũ Khí Bí Mật: <span className="text-[#14B8A6]">"Chiếc Bảng QR Tại Bàn Ăn Hồ Ô Thum"</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
                <div className="bg-teal-950/20 border border-teal-500/40 rounded-2xl p-6 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-[#14B8A6] flex items-center justify-center">
                    <QrCode size={20} />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-[#2DD4BF]">1. Bắt Trúng 45 Phút Chờ Gà</h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Đặt 50 bảng mica QR trên bàn các quán Gà Đốt Ô Thum:<br />
                    <em>"Trong lúc chờ gà chín 45 phút, quét QR hỏi AI: Điểm check-in nào đang vắng người nhất quanh đây?"</em><br />
                    $\rightarrow$ <strong>Tỷ lệ quét đạt 85%</strong>.
                  </p>
                </div>

                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center">
                    <Zap size={20} />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-white">2. Kênh Video Ngắn TikTok/Reels</h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    Series: <em>"Bản đồ AI bí mật của dân phượt né bị chặt chém tại Bảy Núi"</em>.<br />
                    Video ngắn 15s review ẩm thực thật, gắn hashtag <strong>#dulichtriton</strong> kéo hàng trăm nghìn lượt truy cập tự nhiên.
                  </p>
                </div>

                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center">
                    <Users size={20} />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-white">3. Cổng Hỗ Trợ Mùa Lễ Hội</h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    Vào Mùa Lễ Hội Đua Bò Bảy Núi, nền tảng đóng vai trò là <strong>Live Hub Lễ Hội</strong> (Tìm bãi đậu xe, số cấp cứu, sơ tán khi kẹt xe).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 8: COMPETITIVE MOAT MATRIX */}
          {currentSlide === 8 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-[#F59E0B] bg-[#D9822B]/15 border border-[#D9822B]/30 px-2.5 py-1 rounded uppercase tracking-wider">
                  HÀO BẢO VỆ CẠNH TRANH
                </span>
                <span className="text-xs text-slate-400">So Sánh Trực Diện Với Các Nền Tảng Lớn</span>
              </div>

              <h2 className="font-heading font-extrabold text-2xl sm:text-4xl text-white">
                Tại Sao <span className="text-[#14B8A6]">Google Maps & Traveloka Không Thể Thay Thế?</span>
              </h2>

              <div className="overflow-x-auto pt-2">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 uppercase font-mono text-xs">
                      <th className="py-3 px-4">Tiêu Chí So Sánh</th>
                      <th className="py-3 px-4 text-[#14B8A6] bg-teal-950/30 rounded-t-lg">DU LỊCH TRI TÔN AI 🏆</th>
                      <th className="py-3 px-4">GOOGLE MAPS</th>
                      <th className="py-3 px-4">TRAVELOKA</th>
                      <th className="py-3 px-4">TIKTOK</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <tr>
                      <td className="py-3 px-4 font-semibold text-white">Độ chính xác ẩm thực bản địa</td>
                      <td className="py-3 px-4 text-emerald-400 font-bold bg-teal-950/20">✓ 100% Chuẩn Xã/Thực tế</td>
                      <td className="py-3 px-4 text-red-400">✗ Lẫn lộn gà nướng/bún mắm</td>
                      <td className="py-3 px-4 text-red-400">✗ Không có quán nhỏ</td>
                      <td className="py-3 px-4 text-red-400">✗ Review nhận tiền</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-white">Trợ lý AI lên lịch trình tức thì</td>
                      <td className="py-3 px-4 text-emerald-400 font-bold bg-teal-950/20">✓ Phản hồi &lt; 900ms</td>
                      <td className="py-3 px-4 text-red-400">✗ Không có AI</td>
                      <td className="py-3 px-4 text-red-400">✗ Chỉ bán tour trọn gói</td>
                      <td className="py-3 px-4 text-red-400">✗ Không có</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-white">Đặt trước Gà Đốt Ô Thum 45 phút</td>
                      <td className="py-3 px-4 text-emerald-400 font-bold bg-teal-950/20">✓ Nút gọi 1 chạm trực tiếp</td>
                      <td className="py-3 px-4 text-red-400">✗ Số điện thoại sai</td>
                      <td className="py-3 px-4 text-red-400">✗ Không hỗ trợ</td>
                      <td className="py-3 px-4 text-red-400">✗ Không có</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-white">Danh bạ cứu hộ khẩn cấp 24/7</td>
                      <td className="py-3 px-4 text-emerald-400 font-bold bg-teal-950/20">✓ CA, Y Tế, Cứu hộ xe máy</td>
                      <td className="py-3 px-4 text-red-400">✗ Không có</td>
                      <td className="py-3 px-4 text-red-400">✗ Không có</td>
                      <td className="py-3 px-4 text-red-400">✗ Không có</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SLIDE 9: 12-MONTH MILESTONES */}
          {currentSlide === 9 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-[#14B8A6] bg-teal-950/40 border border-teal-500/30 px-2.5 py-1 rounded uppercase tracking-wider">
                  LỘ TRÌNH PHÁT TRIỂN
                </span>
                <span className="text-xs text-slate-400">Kế Hoạch Thực Thi Từng Quý Năm 2026</span>
              </div>

              <h2 className="font-heading font-extrabold text-2xl sm:text-4xl text-white">
                Các Cột Mốc <span className="text-[#14B8A6]">Tăng Trưởng Thực Tế 12 Tháng</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-3">
                  <div className="text-xs font-mono font-bold text-slate-400 bg-white/5 px-2.5 py-1 rounded w-fit">QUÝ 1 / 2026</div>
                  <h3 className="font-heading font-bold text-lg text-white">Phủ Sóng Bàn Ăn Thực Địa</h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    • Triển khai <strong>50 bảng mica QR</strong> tại Hồ Ô Thum & Núi Cô Tô.<br />
                    • Ký hợp đồng xác thực với <strong>15 quán đặc sản & 5 homestay</strong> đầu tiên.<br />
                    • Đạt <strong>15.000 du khách</strong> sử dụng hàng tháng.
                  </p>
                </div>

                <div className="bg-teal-950/20 border border-teal-500/40 rounded-2xl p-6 space-y-3">
                  <div className="text-xs font-mono font-bold text-[#14B8A6] bg-teal-500/20 px-2.5 py-1 rounded w-fit">QUÝ 2 / 2026</div>
                  <h3 className="font-heading font-bold text-lg text-[#2DD4BF]">Bắt Tay Chính Quyền & Đua Bò</h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    • Ký biên bản hợp tác thí điểm với <strong>Phòng VHTT Huyện Tri Tôn</strong>.<br />
                    • Đóng vai trò <strong>Cổng thông tin chính thức Mùa Lễ Hội Đua Bò</strong>.<br />
                    • Đạt điểm <strong>Hòa Vốn Vận Hành (Break-even)</strong>.
                  </p>
                </div>

                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-3">
                  <div className="text-xs font-mono font-bold text-slate-400 bg-white/5 px-2.5 py-1 rounded w-fit">QUÝ 3 - 4 / 2026</div>
                  <h3 className="font-heading font-bold text-lg text-white">Nhân Rộng Toàn Vùng Bảy Núi</h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    • Mở rộng CSDL sang Cụm <strong>Châu Đốc — Tịnh Biên — Thoại Sơn</strong>.<br />
                    • Ra mắt tính năng <strong>Kiosk Du Lịch Cảm Ứng</strong> đặt tại các di tích lớn.<br />
                    • Đạt <strong>100.000 người dùng tích cực</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 10: THE ASK */}
          {currentSlide === 10 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-[#F59E0B] bg-[#D9822B]/15 border border-[#D9822B]/30 px-2.5 py-1 rounded uppercase tracking-wider">
                  CƠ HỘI ĐỒNG HÀNH
                </span>
                <span className="text-xs text-slate-400">Kêu Gọi Đầu Tư & Hợp Tác Chiến Lược</span>
              </div>

              <h2 className="font-heading font-extrabold text-2xl sm:text-4xl text-white">
                Hãy Cùng Chúng Tôi <span className="text-[#14B8A6]">Kiến Tạo Du Lịch Tri Tôn 2026!</span>
              </h2>

              <p className="text-slate-300 text-sm sm:text-base">
                Cơ hội tham gia vào một dự án công nghệ bản địa có sản phẩm thật 100%, dòng tiền thực và tác động xã hội sâu sắc.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
                <div className="bg-teal-950/20 border border-teal-500/40 rounded-2xl p-6 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-[#14B8A6] flex items-center justify-center">
                    <TrendingUp size={20} />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-[#2DD4BF]">Vòng Hạt Giống (Seed)</h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    • Kêu gọi: <strong>150.000.000 VNĐ</strong> đổi lấy <strong>10% Cổ phần</strong>.<br />
                    • Sử dụng vốn: 60% Marketing thực địa & In ấn QR, 30% Mở rộng dữ liệu, 10% Vận hành.
                  </p>
                </div>

                <div className="bg-teal-950/20 border border-teal-500/40 rounded-2xl p-6 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-[#14B8A6] flex items-center justify-center">
                    <Users size={20} />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-[#2DD4BF]">Tìm Co-founder Bản Địa</h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    • Tìm 01 Co-founder phụ trách <strong>Field Operations (Thực địa)</strong> & 01 <strong>Content Creator (Host Video)</strong>.<br />
                    • Chia sẻ <strong>15% - 20% Cổ phần</strong> và thưởng doanh thu.
                  </p>
                </div>

                <div className="bg-teal-950/20 border border-teal-500/40 rounded-2xl p-6 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-[#14B8A6] flex items-center justify-center">
                    <Building2 size={20} />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-[#2DD4BF]">Hợp Tác Đối Tác & B2G</h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    • Mời các Chủ quán Gà Đốt & Homestay đăng ký <strong>Gói Xác Thực Miễn Phí Đợt 1</strong>.<br />
                    • Phối hợp Sở Du Lịch & UBND Huyện triển khai đề án số hóa.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Slide Footer */}
          <div className="flex justify-between items-center pt-6 mt-6 border-t border-white/10 text-xs font-mono text-slate-400">
            <span>Đề án Khởi Nghiệp: Du Lịch Tri Tôn AI</span>
            <span>Dùng phím ⬅️ ➡️ hoặc 1-9 để chuyển slide</span>
          </div>

        </div>
      </main>

      {/* Bottom Controls */}
      <footer className="flex justify-between items-center px-6 sm:px-10 py-4 bg-[#0D0C0A]/95 border-t border-white/10 z-50">
        <div className="flex items-center gap-3">
          <button
            onClick={prevSlide}
            disabled={currentSlide === 1}
            className="px-4 py-2 bg-white/5 border border-white/10 text-sm font-semibold rounded-xl hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center gap-1.5"
          >
            <ChevronLeft size={16} /> Trang trước
          </button>
          <button
            onClick={nextSlide}
            className="px-5 py-2 bg-gradient-to-r from-[#0E8C7F] to-[#14B8A6] text-white text-sm font-bold rounded-xl hover:brightness-110 shadow-lg shadow-teal-900/40 transition flex items-center gap-1.5"
          >
            {currentSlide === totalSlides ? 'Kết thúc 🏁' : 'Trang sau'} <ChevronRight size={16} />
          </button>
        </div>

        <div className="flex items-center gap-4 flex-1 max-w-md mx-6">
          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#14B8A6] to-[#F59E0B] transition-all duration-300"
              style={{ width: `${(currentSlide / totalSlides) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1 text-xs text-slate-400">
            <span>Phím tắt:</span>
            <kbd className="bg-white/10 border border-white/20 px-1.5 py-0.5 rounded text-[10px]">⬅️</kbd>
            <kbd className="bg-white/10 border border-white/20 px-1.5 py-0.5 rounded text-[10px]">➡️</kbd>
            <kbd className="bg-white/10 border border-white/20 px-1.5 py-0.5 rounded text-[10px]">F</kbd>
          </div>
          <button
            onClick={toggleFullScreen}
            className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-slate-300 transition"
            title="Chế độ toàn màn hình (F)"
          >
            <Maximize2 size={16} />
          </button>
        </div>
      </footer>
    </div>
  );
}
