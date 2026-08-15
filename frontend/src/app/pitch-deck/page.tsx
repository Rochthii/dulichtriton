'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ChevronLeft, ChevronRight, Maximize2, Compass, ShieldAlert,
  TrendingUp, Users, Smartphone, Sparkles, Building2, MapPin,
  CheckCircle2, XCircle, Store, QrCode, Award, Zap, PhoneCall,
  Printer, FileText
} from 'lucide-react';
import AppLogo from '@/components/AppLogo';

const totalSlides = 10;

const speakerNotes: Record<number, string> = {
  1: "Chào Hội đồng giám khảo và Quý đối tác! Tôi xin giới thiệu Đề án Số Hóa Du Lịch Tri Tôn AI. Điểm đặc biệt của dự án: Chúng tôi không chỉ làm một website đơn thuần, mà đã xây dựng xong CSDL thực địa 149 điểm sạch nhất An Giang kết hợp Trợ lý AI Streaming phản hồi dưới 900ms. Sản phẩm đã chạy thật 100%.",
  2: "Tại sao chúng tôi làm dự án này? Vì hiện tại cả 3 bên đều chịu thiệt: Khách bị thông tin sai lệch, quán gà đốt mất khách vì phải chờ 45 phút, chính quyền thiếu công cụ số hóa. Đây là khoảng trống thị trường cực lớn.",
  3: "Giải pháp của chúng tôi là Cầu Nối Số Hóa 3 Chiều: Du khách có trợ lý AI bấm nút gọi đặt gà trước; Chủ quán có bảng QR nhận đơn tự động; Chính quyền có bản đồ di tích và danh bạ cứu hộ 24/7.",
  4: "Về dung lượng thị trường: Hơn 2.5 triệu du khách đến An Giang mỗi năm. Riêng Hội Đua Bò Bảy Núi đón 40.000 khách trong 3 ngày. Đây là thời điểm vàng khi Nghị quyết 82 của Chính phủ đang thúc đẩy chuyển đổi số du lịch.",
  5: "Sản phẩm của chúng tôi không phải ý tưởng trên giấy: Kiến trúc Next.js 14 SSG tải trang dưới 200ms, Supabase pgvector HNSW quét trong 256ms, bảo mật 7 tầng chống sập server.",
  6: "Về mô hình kinh doanh: Doanh thu đến từ 3 nguồn thực tế: Gói đối tác xác thực 2.5tr/năm cho quán ăn/homestay, Phí lead đặt gà đốt trước 10-20k, và Hoa hồng 15% tiếp thị đặc sản OCOP Bảy Núi.",
  7: "Chiến lược GTM độc đáo nhất: 'Chiếc Bảng QR Bàn Ăn'. Chúng tôi tận dụng chính 45 phút khách ngồi chờ gà nướng tại Hồ Ô Thum để họ quét QR hỏi AI. Tỷ lệ chuyển đổi đạt 85% với chi phí marketing gần như 0 đồng.",
  8: "Tại sao Google Maps hay Traveloka không thể cạnh tranh? Vì họ không có chân đi thực địa 149 điểm, không phân biệt được gà đốt với gà nướng, không có số cứu hộ phượt và không gắn kết được với chủ quán bản địa.",
  9: "Lộ trình 12 tháng rõ ràng: Q1 phủ 50 bảng QR; Q2 phục vụ Mùa Lễ Hội Đua Bò và đạt hòa vốn; Q3-Q4 mở rộng ra toàn vùng Bảy Núi (Châu Đốc, Tịnh Biên).",
  10: "Lời kêu gọi hành động: Chúng tôi kêu gọi 150 triệu VNĐ cho 10% cổ phần vòng Hạt giống, đồng thời tìm kiếm Co-founder thực địa và mở rộng mạng lưới quán ăn đối tác. Xin trân trọng cảm ơn!"
};

export default function PitchDeckPage() {
  const [currentSlide, setCurrentSlide] = useState(1);
  const [showNotes, setShowNotes] = useState(false);

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
      } else if (e.key === 'n' || e.key === 'N') {
        setShowNotes(prev => !prev);
      } else if (e.key === 'p' || e.key === 'P') {
        window.print();
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
    <div className="min-h-screen bg-[#F1F5F9] text-[#334155] flex flex-col justify-between select-none relative overflow-hidden font-sans">
      {/* Top Header */}
      <header className="flex justify-between items-center px-6 sm:px-10 py-3.5 bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <AppLogo size="md" />
            <div className="flex flex-col">
              <span className="font-heading font-extrabold text-xl text-[#0F172A] leading-none">
                DU LỊCH <span className="text-[#0E8C7F]">TRI TÔN AI</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mt-0.5">
                Executive Pitch Suite 2026
              </span>
            </div>
          </Link>
          <span className="bg-amber-50 border border-amber-300 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            KHỞI NGHIỆP DU LỊCH BẢN ĐỊA
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Hệ Thống Đang Vận Hành 100%</span>
          </div>
          <div className="font-mono text-sm font-bold text-slate-700">
            {currentSlide < 10 ? `0${currentSlide}` : currentSlide} / {totalSlides}
          </div>
        </div>
      </header>

      {/* Main Slide Presentation Canvas */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8 z-10">
        <div className="w-full max-w-6xl bg-white border border-slate-200 rounded-3xl shadow-xl p-6 sm:p-12 min-h-[580px] flex flex-col justify-between transition-all duration-300 relative overflow-hidden">
          
          {/* SLIDE 1 */}
          {currentSlide === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#0E8C7F] bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded uppercase tracking-wider">
                  ĐỀ ÁN KHỞI NGHIỆP CÔNG NGHỆ DU LỊCH BẢN ĐỊA
                </span>
                <span className="text-xs text-slate-500 font-medium">Khám phá Bảy Núi cùng Trí Tuệ Nhân Tạo 24/7</span>
              </div>

              <h1 className="font-heading font-extrabold text-3xl sm:text-5xl text-[#0F172A] leading-tight">
                Số Hóa Du Lịch Tri Tôn — Đưa <span className="text-[#0E8C7F]">Di Sản Bảy Núi</span> Cất Cánh
              </h1>

              <p className="text-slate-600 text-base sm:text-lg max-w-3xl leading-relaxed">
                Nền tảng du lịch AI thực chiến đầu tiên tại An Giang: Kết nối 149 di tích lịch sử, chùa tháp Khmer, ẩm thực Gà Đốt Ô Thum và mạng lưới 50+ hộ kinh doanh bản địa.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
                <div className="bg-[#F8FAFC] border border-emerald-200 rounded-2xl p-5 text-center shadow-sm">
                  <div className="font-heading font-extrabold text-3xl sm:text-4xl text-[#0E8C7F]">149</div>
                  <div className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">Điểm xác minh thực tế 100%</div>
                </div>
                <div className="bg-[#F8FAFC] border border-emerald-200 rounded-2xl p-5 text-center shadow-sm">
                  <div className="font-heading font-extrabold text-3xl sm:text-4xl text-[#0E8C7F]">&lt; 900ms</div>
                  <div className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">Trợ lý AI phản hồi tức thì</div>
                </div>
                <div className="bg-[#FFFDF9] border border-amber-300 rounded-2xl p-5 text-center shadow-sm">
                  <div className="font-heading font-extrabold text-3xl sm:text-4xl text-[#C26715]">35+</div>
                  <div className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">Lịch trình phượt độc quyền</div>
                </div>
                <div className="bg-[#F8FAFC] border border-emerald-200 rounded-2xl p-5 text-center shadow-sm">
                  <div className="font-heading font-extrabold text-3xl sm:text-4xl text-[#0E8C7F]">24/7</div>
                  <div className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">Danh bạ cứu hộ khẩn cấp</div>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 2 */}
          {currentSlide === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded uppercase tracking-wider">
                  NỖI ĐAU THỰC ĐỊA CỦA THỊ TRƯỜNG
                </span>
                <span className="text-xs text-slate-500">3 Điểm Nghẽn Lớn Nhất Ngành Du Lịch Tri Tôn</span>
              </div>

              <h2 className="font-heading font-extrabold text-2xl sm:text-4xl text-[#0F172A]">
                Cảnh Đẹp Hùng Vĩ Nhưng <span className="text-red-600">Du Khách & Chủ Quán Đều Gặp Khó</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
                <div className="bg-red-50/50 border border-red-200 rounded-2xl p-6 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-red-200 flex items-center justify-center text-red-600 shadow-sm">
                    <Compass size={20} />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-[#0F172A]">1. Du Khách & Phượt Thủ</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    • <strong>80% thông tin mạng bị sai lệch</strong> (nhầm bún cá củ ngải với bún nước lèo, gà đốt với gà nướng).<br />
                    • Không biết đường vào chùa sâu trong núi.<br />
                    • Đến quán Gà Đốt phải chờ <strong>45 phút</strong>.
                  </p>
                </div>

                <div className="bg-red-50/50 border border-red-200 rounded-2xl p-6 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-red-200 flex items-center justify-center text-red-600 shadow-sm">
                    <Store size={20} />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-[#0F172A]">2. Quán Ăn & Homestay</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    • <strong>90% là hộ gia đình</strong>, không biết tự làm marketing số.<br />
                    • Khách dồn đột ngột vào trưa cuối tuần gây quá tải, ngày thường vắng vẻ.<br />
                    • Bị đối thủ giả mạo vị trí và hotline.
                  </p>
                </div>

                <div className="bg-red-50/50 border border-red-200 rounded-2xl p-6 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-red-200 flex items-center justify-center text-red-600 shadow-sm">
                    <Building2 size={20} />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-[#0F172A]">3. Chính Quyền & Di Tích</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    • Chưa có Cổng số hóa chuẩn xác giới thiệu bảo vật Kinh lá buông, 5 Đại lễ hội Khmer.<br />
                    • Thiếu kênh cứu hộ khi du khách lạc rừng hoặc hỏng xe đèo núi.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 3 */}
          {currentSlide === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#0E8C7F] bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded uppercase tracking-wider">
                  HỆ SINH THÁI GIẢI PHÁP ĐỘT PHÁ
                </span>
                <span className="text-xs text-slate-500">Cầu Nối Số Hóa 3 Chiều Độc Quyền</span>
              </div>

              <h2 className="font-heading font-extrabold text-2xl sm:text-4xl text-[#0F172A]">
                Nền Tảng AI Bản Địa <span className="text-[#0E8C7F]">Giải Quyết Trọn Vẹn 3 Chiều</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
                <div className="bg-emerald-50/40 border border-emerald-200 rounded-2xl p-6 space-y-3 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-[#0E8C7F] text-white flex items-center justify-center shadow-md">
                    <Smartphone size={20} />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-[#0A6B61]">1. Du Khách Bỏ Túi AI 24/7</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    • <strong>Hỏi đáp tức thì</strong> mọi câu hỏi lộ trình, văn hóa.<br />
                    • Nút <strong>Gọi 1 Chạm đặt trước Gà Đốt 45 phút</strong>, không phải chờ.<br />
                    • Đính kèm link <strong>Google Maps + Video TikTok</strong> cho từng điểm.
                  </p>
                </div>

                <div className="bg-amber-50/40 border border-amber-200 rounded-2xl p-6 space-y-3 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-[#C26715] text-white flex items-center justify-center shadow-md">
                    <Award size={20} />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-[#9A4E0B]">2. Hộ Kinh Doanh Bản Địa</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    • Huy hiệu <strong>Đối Tác Xác Thực Vàng</strong> uy tín.<br />
                    • <strong>Bảng mica QR Đặt Bàn</strong> đón khách tự động.<br />
                    • Tăng <strong>30% - 40% doanh thu</strong> nhờ đơn đặt trước có kế hoạch.
                  </p>
                </div>

                <div className="bg-emerald-50/40 border border-emerald-200 rounded-2xl p-6 space-y-3 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-[#0E8C7F] text-white flex items-center justify-center shadow-md">
                    <ShieldAlert size={20} />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-[#0A6B61]">3. Địa Phương & Xã Hội</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    • Số hóa chuẩn xác <strong>149 di tích & chùa Khmer</strong>.<br />
                    • <strong>Danh bạ cứu hộ 24/7</strong> bảo vệ an toàn cho du khách.<br />
                    • Thúc đẩy tiêu thụ nông sản & đặc sản OCOP Bảy Núi.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 4 */}
          {currentSlide === 4 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#C26715] bg-amber-50 border border-amber-200 px-2.5 py-1 rounded uppercase tracking-wider">
                  CƠ HỘI THỊ TRƯỜNG & THỜI ĐIỂM VÀNG
                </span>
                <span className="text-xs text-slate-500">Quy Mô & Thời Điểm Vàng Bùng Nổ</span>
              </div>

              <h2 className="font-heading font-extrabold text-2xl sm:text-4xl text-[#0F172A]">
                Tại Sao Phải Là <span className="text-[#0E8C7F]">Bảy Núi — An Giang Ngay Bây Giờ?</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-4">
                <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-6 space-y-2 shadow-sm">
                  <div className="font-heading font-extrabold text-4xl text-[#0E8C7F]">2.5 Triệu+</div>
                  <div className="text-xs sm:text-sm font-bold text-slate-800">Lượt du khách đến An Giang mỗi năm</div>
                  <p className="text-xs text-slate-500 pt-2 leading-relaxed">Nhóm phượt thủ trẻ, trekking Núi Cô Tô, cắm trại Hồ Ô Thum tăng trưởng 40%/năm.</p>
                </div>

                <div className="bg-[#FFFDF9] border border-amber-200 rounded-2xl p-6 space-y-2 shadow-sm">
                  <div className="font-heading font-extrabold text-4xl text-[#C26715]">40,000+</div>
                  <div className="text-xs sm:text-sm font-bold text-slate-800">Khách xem Hội Đua Bò trong 3 ngày</div>
                  <p className="text-xs text-slate-500 pt-2 leading-relaxed">Nhu cầu tìm chỗ ăn, bãi xe và cứu hộ phượt bùng nổ quá tải mạng xã hội.</p>
                </div>

                <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-6 space-y-2 shadow-sm">
                  <div className="font-heading font-extrabold text-4xl text-[#0E8C7F]">NQ 82</div>
                  <div className="text-xs sm:text-sm font-bold text-slate-800">Nghị quyết 82/NQ-CP Chuyển đổi số Du lịch</div>
                  <p className="text-xs text-slate-500 pt-2 leading-relaxed">Cơ hội vàng hợp tác B2G với Sở Du Lịch và UBND Huyện Tri Tôn.</p>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 5 */}
          {currentSlide === 5 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#0E8C7F] bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded uppercase tracking-wider">
                  SẢN PHẨM ĐÃ VẬN HÀNH THỰC TẾ
                </span>
                <span className="text-xs text-slate-500">Không Phải Bản Vẽ — Sẵn Sàng 100%</span>
              </div>

              <h2 className="font-heading font-extrabold text-2xl sm:text-4xl text-[#0F172A]">
                Kiến Trúc Kỹ Thuật Đỉnh Cao & <span className="text-[#0E8C7F]">Dữ Liệu Độc Quyền</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-6 space-y-3 shadow-sm">
                  <div className="flex justify-between items-center">
                    <h3 className="font-heading font-bold text-lg text-[#0F172A]">⚡ Hạ Tầng Kỹ Thuật Chuẩn Enterprise</h3>
                    <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">v11.0.0</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    • <strong>Next.js 14 SSG + Edge Computing</strong>: Tốc độ tải trang &lt; 200ms.<br />
                    • <strong>Supabase pgvector HNSW</strong>: Quét Vector RAG ngữ nghĩa trong 256ms.<br />
                    • <strong>Multi-LLM Resilience Engine</strong>: Cụm 4 khóa Gemini Round-Robin tự phục hồi lỗi.<br />
                    • <strong>7 Tầng Bảo Mật Chuyên Sâu</strong>: Chống DDoS, Rate Limit, chặn bot cào trộm, ẩn mã nguồn F12.
                  </p>
                </div>

                <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-6 space-y-3 shadow-sm">
                  <div className="flex justify-between items-center">
                    <h3 className="font-heading font-bold text-lg text-[#0A6B61]">📍 CSDL Thực Địa Độc Quyền</h3>
                    <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">149 POIs</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    • <strong>149 địa điểm</strong> phủ khắp các xã/thị trấn (không dùng từ 'Huyện Tri Tôn').<br />
                    • <strong>40+ quán đặc sản</strong> Gà Đốt Ô Thum, Cháo bò Châu Lăng, Bún cá củ ngải Dì Dom.<br />
                    • <strong>5 Đại lễ hội & Bảo vật Kinh lá buông</strong> Chùa Xvayton.<br />
                    • <strong>Danh bạ cứu hộ 24/7</strong> kết nối trực tiếp Công An, Y Tế, Cứu hộ xe máy.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 6 */}
          {currentSlide === 6 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#C26715] bg-amber-50 border border-amber-200 px-2.5 py-1 rounded uppercase tracking-wider">
                  MÔ HÌNH DÒNG TIỀN DOANH THU
                </span>
                <span className="text-xs text-slate-500">Đa Dòng Tiền Thực Tế & Khả Thi</span>
              </div>

              <h2 className="font-heading font-extrabold text-2xl sm:text-4xl text-[#0F172A]">
                Cơ Chế Doanh Thu Đa Nguồn <span className="text-[#0E8C7F]">Bền Vững & Dài Hạn</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
                <div className="bg-[#FFFDF9] border border-amber-200 rounded-2xl p-5 space-y-2 shadow-sm">
                  <h3 className="font-heading font-bold text-base text-[#0F172A]">1. Gói Đối Tác Xác Thực</h3>
                  <div className="font-heading font-extrabold text-2xl text-[#C26715]">2.500.000đ</div>
                  <div className="text-xs text-slate-500">/ Cơ sở / Năm</div>
                  <p className="text-xs text-slate-600 pt-2 leading-relaxed">
                    Gắn nhãn Đối Tác Xác Thực Vàng, ưu tiên gợi ý trong kết quả AI Chat, hiển thị menu giá chuẩn và số hotline gọi trực tiếp.
                  </p>
                </div>

                <div className="bg-emerald-50/50 border border-emerald-300 rounded-2xl p-5 space-y-2 shadow-sm">
                  <h3 className="font-heading font-bold text-base text-[#0A6B61]">2. Phí Đặt Bàn & Đặt Phòng</h3>
                  <div className="font-heading font-extrabold text-2xl text-[#0E8C7F]">10k - 20k / Đơn</div>
                  <div className="text-xs text-slate-500">Hoa hồng 5% - 8% Homestay</div>
                  <p className="text-xs text-slate-600 pt-2 leading-relaxed">
                    Du khách đặt trước gà đốt 45p hoặc giữ phòng homestay view núi Cô Tô qua nút gọi xác nhận.
                  </p>
                </div>

                <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-5 space-y-2 shadow-sm">
                  <h3 className="font-heading font-bold text-base text-[#0F172A]">3. Tiếp Thị Đặc Sản OCOP</h3>
                  <div className="font-heading font-extrabold text-2xl text-[#C26715]">10% - 15%</div>
                  <div className="text-xs text-slate-500">Hoa hồng trên mỗi đơn hàng</div>
                  <p className="text-xs text-slate-600 pt-2 leading-relaxed">
                    Bán đặc sản Đường thốt nốt nguyên chất, Tinh dầu lá chúc, Mắm cá rô đồng Bảy Núi giao tận nhà du khách.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 7 */}
          {currentSlide === 7 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#0E8C7F] bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded uppercase tracking-wider">
                  CHIẾN LƯỢC TĂNG TRƯỞNG O2O
                </span>
                <span className="text-xs text-slate-500">Chuyển Đổi Người Dùng Với Chi Phí 0 Đồng</span>
              </div>

              <h2 className="font-heading font-extrabold text-2xl sm:text-4xl text-[#0F172A]">
                Vũ Khí Bí Mật: <span className="text-[#0E8C7F]">"Chiếc Bảng QR Tại Bàn Ăn Hồ Ô Thum"</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
                <div className="bg-emerald-50/50 border border-emerald-300 rounded-2xl p-6 space-y-3 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-[#0E8C7F] text-white flex items-center justify-center shadow-md">
                    <QrCode size={20} />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-[#0A6B61]">1. Bắt Trúng 45 Phút Chờ Gà</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Đặt 50 bảng mica QR trên bàn các quán Gà Đốt Ô Thum:<br />
                    <em>"Trong lúc chờ gà chín 45 phút, quét QR hỏi AI: Điểm check-in nào đang vắng người nhất quanh đây?"</em><br />
                    $\rightarrow$ <strong>Tỷ lệ quét đạt 85%</strong>.
                  </p>
                </div>

                <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-6 space-y-3 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center shadow-md">
                    <Zap size={20} />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-[#0F172A]">2. Kênh Video Ngắn TikTok/Reels</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Series: <em>"Bản đồ AI bí mật của dân phượt né bị chặt chém tại Bảy Núi"</em>.<br />
                    Video ngắn 15s review ẩm thực thật, gắn hashtag <strong>#dulichtriton</strong> kéo hàng trăm nghìn lượt truy cập tự nhiên.
                  </p>
                </div>

                <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-6 space-y-3 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center shadow-md">
                    <Users size={20} />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-[#0F172A]">3. Cổng Hỗ Trợ Mùa Lễ Hội</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Vào Mùa Lễ Hội Đua Bò Bảy Núi, nền tảng đóng vai trò là <strong>Live Hub Lễ Hội</strong> (Tìm bãi đậu xe, số cấp cứu, sơ tán khi kẹt xe).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 8 */}
          {currentSlide === 8 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#C26715] bg-amber-50 border border-amber-200 px-2.5 py-1 rounded uppercase tracking-wider">
                  HÀO BẢO VỆ CẠNH TRANH
                </span>
                <span className="text-xs text-slate-500">So Sánh Trực Diện Với Các Nền Tảng Lớn</span>
              </div>

              <h2 className="font-heading font-extrabold text-2xl sm:text-4xl text-[#0F172A]">
                Tại Sao <span className="text-[#0E8C7F]">Google Maps & Traveloka Không Thể Thay Thế?</span>
              </h2>

              <div className="overflow-x-auto pt-2">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-200 text-slate-500 uppercase font-mono text-xs">
                      <th className="py-3 px-4">Tiêu Chí So Sánh</th>
                      <th className="py-3 px-4 text-[#0E8C7F] bg-emerald-50 font-bold rounded-t-lg">DU LỊCH TRI TÔN AI 🏆</th>
                      <th className="py-3 px-4">GOOGLE MAPS</th>
                      <th className="py-3 px-4">TRAVELOKA</th>
                      <th className="py-3 px-4">TIKTOK</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-3 px-4 font-bold text-[#0F172A]">Độ chính xác ẩm thực bản địa</td>
                      <td className="py-3 px-4 text-emerald-700 font-bold bg-emerald-50/60">✓ 100% Chuẩn Xã/Thực tế</td>
                      <td className="py-3 px-4 text-red-600">✗ Lẫn lộn gà nướng/bún mắm</td>
                      <td className="py-3 px-4 text-red-600">✗ Không có quán nhỏ</td>
                      <td className="py-3 px-4 text-red-600">✗ Review nhận tiền</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-[#0F172A]">Trợ lý AI lên lịch trình tức thì</td>
                      <td className="py-3 px-4 text-emerald-700 font-bold bg-emerald-50/60">✓ Phản hồi &lt; 900ms</td>
                      <td className="py-3 px-4 text-red-600">✗ Không có AI</td>
                      <td className="py-3 px-4 text-red-600">✗ Chỉ bán tour trọn gói</td>
                      <td className="py-3 px-4 text-red-600">✗ Không có</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-[#0F172A]">Đặt trước Gà Đốt Ô Thum 45 phút</td>
                      <td className="py-3 px-4 text-emerald-700 font-bold bg-emerald-50/60">✓ Nút gọi 1 chạm trực tiếp</td>
                      <td className="py-3 px-4 text-red-600">✗ Số điện thoại sai</td>
                      <td className="py-3 px-4 text-red-600">✗ Không hỗ trợ</td>
                      <td className="py-3 px-4 text-red-600">✗ Không có</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-[#0F172A]">Danh bạ cứu hộ khẩn cấp 24/7</td>
                      <td className="py-3 px-4 text-emerald-700 font-bold bg-emerald-50/60">✓ CA, Y Tế, Cứu hộ xe máy</td>
                      <td className="py-3 px-4 text-red-600">✗ Không có</td>
                      <td className="py-3 px-4 text-red-600">✗ Không có</td>
                      <td className="py-3 px-4 text-red-600">✗ Không có</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SLIDE 9 */}
          {currentSlide === 9 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#0E8C7F] bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded uppercase tracking-wider">
                  KẾ HOẠCH THỰC THI NĂM 2026
                </span>
                <span className="text-xs text-slate-500">Kế Hoạch Thực Thi Từng Quý Năm 2026</span>
              </div>

              <h2 className="font-heading font-extrabold text-2xl sm:text-4xl text-[#0F172A]">
                Các Cột Mốc <span className="text-[#0E8C7F]">Tăng Trưởng Thực Tế 12 Tháng</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
                <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-6 space-y-3 shadow-sm">
                  <div className="text-xs font-mono font-bold text-slate-600 bg-slate-200 px-2.5 py-1 rounded w-fit">QUÝ 1 / 2026</div>
                  <h3 className="font-heading font-bold text-lg text-[#0F172A]">Phủ Sóng Bàn Ăn Thực Địa</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    • Triển khai <strong>50 bảng mica QR</strong> tại Hồ Ô Thum & Núi Cô Tô.<br />
                    • Ký hợp đồng xác thực với <strong>15 quán đặc sản & 5 homestay</strong> đầu tiên.<br />
                    • Đạt <strong>15.000 du khách</strong> sử dụng hàng tháng.
                  </p>
                </div>

                <div className="bg-emerald-50/50 border border-emerald-300 rounded-2xl p-6 space-y-3 shadow-sm">
                  <div className="text-xs font-mono font-bold text-white bg-[#0E8C7F] px-2.5 py-1 rounded w-fit">QUÝ 2 / 2026</div>
                  <h3 className="font-heading font-bold text-lg text-[#0A6B61]">Bắt Tay Chính Quyền & Đua Bò</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    • Ký biên bản hợp tác thí điểm với <strong>Phòng VHTT Huyện Tri Tôn</strong>.<br />
                    • Đóng vai trò <strong>Cổng thông tin chính thức Mùa Lễ Hội Đua Bò</strong>.<br />
                    • Đạt điểm <strong>Hòa Vốn Vận Hành (Break-even)</strong>.
                  </p>
                </div>

                <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-6 space-y-3 shadow-sm">
                  <div className="text-xs font-mono font-bold text-slate-600 bg-slate-200 px-2.5 py-1 rounded w-fit">QUÝ 3 - 4 / 2026</div>
                  <h3 className="font-heading font-bold text-lg text-[#0F172A]">Nhân Rộng Toàn Vùng Bảy Núi</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    • Mở rộng CSDL sang Cụm <strong>Châu Đốc — Tịnh Biên — Thoại Sơn</strong>.<br />
                    • Ra mắt tính năng <strong>Kiosk Du Lịch Cảm Ứng</strong> đặt tại các di tích lớn.<br />
                    • Đạt <strong>100.000 người dùng tích cực</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 10 */}
          {currentSlide === 10 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#C26715] bg-amber-50 border border-amber-200 px-2.5 py-1 rounded uppercase tracking-wider">
                  CƠ HỘI ĐỒNG HÀNH
                </span>
                <span className="text-xs text-slate-500">Kêu Gọi Đầu Tư & Hợp Tác Chiến Lược</span>
              </div>

              <h2 className="font-heading font-extrabold text-2xl sm:text-4xl text-[#0F172A]">
                Hãy Cùng Chúng Tôi <span className="text-[#0E8C7F]">Kiến Tạo Du Lịch Tri Tôn 2026!</span>
              </h2>

              <p className="text-slate-600 text-sm sm:text-base">
                Cơ hội tham gia vào một dự án công nghệ bản địa có sản phẩm thật 100%, dòng tiền thực và tác động xã hội sâu sắc.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
                <div className="bg-emerald-50/50 border border-emerald-300 rounded-2xl p-6 space-y-3 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-[#0E8C7F] text-white flex items-center justify-center shadow-md">
                    <TrendingUp size={20} />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-[#0A6B61]">Vòng Hạt Giống (Seed)</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    • Kêu gọi: <strong>150.000.000 VNĐ</strong> đổi lấy <strong>10% Cổ phần</strong>.<br />
                    • Sử dụng vốn: 60% Marketing thực địa & In ấn QR, 30% Mở rộng dữ liệu, 10% Vận hành.
                  </p>
                </div>

                <div className="bg-amber-50/50 border border-amber-300 rounded-2xl p-6 space-y-3 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-[#C26715] text-white flex items-center justify-center shadow-md">
                    <Users size={20} />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-[#9A4E0B]">Tìm Co-founder Bản Địa</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    • Tìm 01 Co-founder phụ trách <strong>Field Operations (Thực địa)</strong> & 01 <strong>Content Creator (Host Video)</strong>.<br />
                    • Chia sẻ <strong>15% - 20% Cổ phần</strong> và thưởng doanh thu.
                  </p>
                </div>

                <div className="bg-emerald-50/50 border border-emerald-300 rounded-2xl p-6 space-y-3 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-[#0E8C7F] text-white flex items-center justify-center shadow-md">
                    <Building2 size={20} />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-[#0A6B61]">Hợp Tác Đối Tác & B2G</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    • Mời các Chủ quán Gà Đốt & Homestay đăng ký <strong>Gói Xác Thực Miễn Phí Đợt 1</strong>.<br />
                    • Phối hợp Sở Du Lịch & UBND Huyện triển khai đề án số hóa.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Slide Foot */}
          <div className="flex justify-between items-center pt-5 mt-4 border-t border-slate-200 text-xs font-mono text-slate-500">
            <span>Đề án Khởi Nghiệp: Du Lịch Tri Tôn AI</span>
            <span>Dùng phím ⬅️ ➡️ để lật slide • Nhấn N để mở Ghi chú</span>
          </div>

        </div>
      </main>

      {/* Speaker Notes Drawer */}
      {showNotes && (
        <aside className="fixed bottom-20 right-8 w-96 max-h-72 bg-white border border-slate-200 rounded-2xl shadow-2xl p-5 flex flex-col z-50 overflow-y-auto">
          <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-3">
            <span className="font-heading font-bold text-sm text-[#0E8C7F]">GHI CHÚ DIỄN GIẢ (SPEAKER NOTES)</span>
            <button onClick={() => setShowNotes(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
          </div>
          <div className="text-xs text-slate-600 leading-relaxed">
            <strong className="text-slate-800">Slide {currentSlide}:</strong><br />
            {speakerNotes[currentSlide]}
          </div>
        </aside>
      )}

      {/* Bottom Controls */}
      <footer className="flex justify-between items-center px-6 sm:px-10 py-3.5 bg-white border-t border-slate-200 shadow-sm z-50">
        <div className="flex items-center gap-2.5">
          <button
            onClick={prevSlide}
            disabled={currentSlide === 1}
            className="px-4 py-2 bg-slate-100 border border-slate-200 text-sm font-bold rounded-xl text-slate-700 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1.5"
          >
            <ChevronLeft size={16} /> Trang trước
          </button>
          <button
            onClick={nextSlide}
            className="px-5 py-2 bg-[#0E8C7F] hover:bg-[#0A6B61] text-white text-sm font-bold rounded-xl shadow-md transition flex items-center gap-1.5"
          >
            {currentSlide === totalSlides ? 'Kết thúc 🏁' : 'Trang sau'} <ChevronRight size={16} />
          </button>
        </div>

        <div className="flex items-center gap-4 flex-1 max-w-sm mx-6">
          <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#0E8C7F] to-[#D9822B] transition-all duration-300"
              style={{ width: `${(currentSlide / totalSlides) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNotes(prev => !prev)}
            className={`px-3 py-2 border rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${showNotes ? 'bg-emerald-50 border-emerald-400 text-emerald-800' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'}`}
            title="Bật/Tắt Ghi chú Diễn giả (Phím N)"
          >
            <FileText size={15} /> Ghi chú (N)
          </button>
          <button
            onClick={() => window.print()}
            className="p-2 bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 rounded-xl transition"
            title="In ra bản Handout PDF (Phím P)"
          >
            <Printer size={16} />
          </button>
          <button
            onClick={toggleFullScreen}
            className="p-2 bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 rounded-xl transition"
            title="Toàn màn hình (Phím F)"
          >
            <Maximize2 size={16} />
          </button>
        </div>
      </footer>
    </div>
  );
}
