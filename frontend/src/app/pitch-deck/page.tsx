'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ChevronLeft, ChevronRight, Maximize2, Compass, ShieldCheck,
  TrendingUp, Users, Smartphone, Sparkles, Building2, MapPin
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
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide]);

  return (
    <div className="min-h-screen bg-[#FAF3E7] text-[#26221B] flex flex-col justify-between select-none">
      {/* Top Bar */}
      <header className="flex justify-between items-center px-6 py-4 bg-[#FAF3E7]/90 backdrop-blur-md border-b border-[#E8DCC8] sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <AppLogo size="md" />
            <span className="font-heading font-extrabold text-xl text-[#0E8C7F]">DU LỊCH TRI TÔN AI</span>
          </Link>
          <span className="bg-[#D9822B] text-white text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wide">
            PITCH DECK 2026
          </span>
        </div>
        <div className="font-medium text-sm text-[#6B655B]">
          Trang <span className="text-[#0E8C7F] font-bold text-base">{currentSlide}</span> / {totalSlides}
        </div>
      </header>

      {/* Main Slide Presentation Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-5xl bg-white border border-[#E8DCC8] rounded-2xl shadow-xl p-6 sm:p-12 min-h-[540px] flex flex-col justify-between transition-all duration-300">
          
          {/* SLIDE 1 */}
          {currentSlide === 1 && (
            <div className="space-y-6">
              <div className="text-xs font-bold text-[#D9822B] uppercase tracking-wider">ĐỀ ÁN KHỞI NGHIỆP DU LỊCH SỐ</div>
              <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#26221B] leading-tight">
                Số Hóa Du Lịch Tri Tôn — Đưa <span className="text-[#0E8C7F]">Di Sản Bảy Núi</span> Cất Cánh
              </h1>
              <p className="text-[#6B655B] text-lg">
                Nền tảng du lịch AI thực chiến đầu tiên tại An Giang: Kết nối 149 điểm di tích, ẩm thực Gà Đốt Ô Thum và cộng đồng kinh doanh bản địa.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                <div className="bg-[#0E8C7F]/5 border border-[#0E8C7F]/20 rounded-xl p-5 text-center">
                  <div className="font-heading font-extrabold text-4xl text-[#0E8C7F]">149</div>
                  <div className="text-sm font-medium text-[#6B655B] mt-1">Điểm đến xác minh thực tế 100%</div>
                </div>
                <div className="bg-[#0E8C7F]/5 border border-[#0E8C7F]/20 rounded-xl p-5 text-center">
                  <div className="font-heading font-extrabold text-4xl text-[#0E8C7F]">&lt; 900ms</div>
                  <div className="text-sm font-medium text-[#6B655B] mt-1">Tốc độ Trợ lý AI phản hồi du khách</div>
                </div>
                <div className="bg-[#0E8C7F]/5 border border-[#0E8C7F]/20 rounded-xl p-5 text-center">
                  <div className="font-heading font-extrabold text-4xl text-[#0E8C7F]">35+</div>
                  <div className="text-sm font-medium text-[#6B655B] mt-1">Lịch trình phượt thực tế độc quyền</div>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 2 */}
          {currentSlide === 2 && (
            <div className="space-y-6">
              <div className="text-xs font-bold text-[#D9822B] uppercase tracking-wider">NỖI ĐAU THỰC TẾ</div>
              <h2 className="font-heading font-extrabold text-3xl text-[#26221B]">
                Tại Sao Tri Tôn Có Cảnh Đẹp Nhưng <span className="text-[#0E8C7F]">Du Khách & Chủ Quán Vẫn Khổ?</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
                <div className="bg-[#FDFBF7] border border-[#E8DCC8] rounded-xl p-5 space-y-2">
                  <div className="text-2xl">🧭</div>
                  <h3 className="font-heading font-bold text-lg text-[#26221B]">1. Du Khách & Phượt Thủ</h3>
                  <p className="text-sm text-[#6B655B] leading-relaxed">
                    • Thông tin trên mạng bị sai lệch, nhầm món ăn.<br />
                    • Không biết đường vào chùa sâu trong núi.<br />
                    • Đến quán Gà Đốt phải chờ 45 phút.
                  </p>
                </div>
                <div className="bg-[#FDFBF7] border border-[#E8DCC8] rounded-xl p-5 space-y-2">
                  <div className="text-2xl">🍗</div>
                  <h3 className="font-heading font-bold text-lg text-[#26221B]">2. Quán Ăn & Homestay</h3>
                  <p className="text-sm text-[#6B655B] leading-relaxed">
                    • 90% là hộ gia đình, không biết tự marketing số.<br />
                    • Khách dồn vào giờ cao điểm gây quá tải.<br />
                    • Bị đối thủ giả mạo số điện thoại.
                  </p>
                </div>
                <div className="bg-[#FDFBF7] border border-[#E8DCC8] rounded-xl p-5 space-y-2">
                  <div className="text-2xl">🏛️</div>
                  <h3 className="font-heading font-bold text-lg text-[#26221B]">3. Chính Quyền & Di Tích</h3>
                  <p className="text-sm text-[#6B655B] leading-relaxed">
                    • Chưa có cổng số hóa văn hóa Khmer đồng bộ.<br />
                    • Thiếu kênh hỗ trợ cứu hộ khẩn cấp 24/7 cho du khách phượt leo núi.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 3 */}
          {currentSlide === 3 && (
            <div className="space-y-6">
              <div className="text-xs font-bold text-[#D9822B] uppercase tracking-wider">GIẢI PHÁP ĐỘT PHÁ</div>
              <h2 className="font-heading font-extrabold text-3xl text-[#26221B]">
                Nền Tảng Thông Minh <span className="text-[#0E8C7F]">Giải Quyết Trọn Vẹn 3 Chiều</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
                <div className="bg-[#0E8C7F]/5 border border-[#0E8C7F]/30 rounded-xl p-5 space-y-2">
                  <div className="text-2xl">📱</div>
                  <h3 className="font-heading font-bold text-lg text-[#0E8C7F]">Cho Du Khách</h3>
                  <p className="text-sm text-[#6B655B] leading-relaxed">
                    Trợ lý AI bỏ túi 24/7: Hỏi là có lộ trình, nút gọi đặt trước món ăn chỉ 1 chạm, link Google Maps và TikTok cho từng điểm.
                  </p>
                </div>
                <div className="bg-[#0E8C7F]/5 border border-[#0E8C7F]/30 rounded-xl p-5 space-y-2">
                  <div className="text-2xl">🏪</div>
                  <h3 className="font-heading font-bold text-lg text-[#0E8C7F]">Cho Hộ Kinh Doanh</h3>
                  <p className="text-sm text-[#6B655B] leading-relaxed">
                    Gói "Xác Thực Bản Địa" + Bảng mã QR đặt bàn tại quán: Nhận đơn đặt trước 45 phút, tăng 30% doanh thu mùa cao điểm.
                  </p>
                </div>
                <div className="bg-[#0E8C7F]/5 border border-[#0E8C7F]/30 rounded-xl p-5 space-y-2">
                  <div className="text-2xl">🚨</div>
                  <h3 className="font-heading font-bold text-lg text-[#0E8C7F]">Cho Địa Phương</h3>
                  <p className="text-sm text-[#6B655B] leading-relaxed">
                    Bản đồ số hóa 149 di tích chuẩn xác + Danh bạ cứu hộ 24/7 (Công an, Y tế, Cứu hộ xe máy) bảo đảm du lịch văn minh, an toàn.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 4 */}
          {currentSlide === 4 && (
            <div className="space-y-6">
              <div className="text-xs font-bold text-[#D9822B] uppercase tracking-wider">DUNG LƯỢNG THỊ TRƯỜNG & THỜI ĐIỂM VÀNG</div>
              <h2 className="font-heading font-extrabold text-3xl text-[#26221B]">
                Tại Sao Phải Là <span className="text-[#0E8C7F]">Bảy Núi — An Giang Ngay Bây Giờ?</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-4">
                <div className="bg-[#FDFBF7] border border-[#E8DCC8] rounded-xl p-6 text-center space-y-2">
                  <div className="font-heading font-extrabold text-4xl text-[#0E8C7F]">2.5 Triệu+</div>
                  <div className="text-sm text-[#6B655B]">Lượt du khách đổ về An Giang mỗi năm (Châu Đốc - Tri Tôn - Tịnh Biên)</div>
                </div>
                <div className="bg-[#FDFBF7] border border-[#E8DCC8] rounded-xl p-6 text-center space-y-2">
                  <div className="font-heading font-extrabold text-4xl text-[#0E8C7F]">40,000+</div>
                  <div className="text-sm text-[#6B655B]">Du khách xem Hội Đua Bò Bảy Núi chỉ trong 3 ngày lễ hội</div>
                </div>
                <div className="bg-[#FDFBF7] border border-[#E8DCC8] rounded-xl p-6 text-center space-y-2">
                  <div className="font-heading font-extrabold text-4xl text-[#0E8C7F]">NQ 82</div>
                  <div className="text-sm text-[#6B655B]">Chính phủ thúc đẩy Chuyển đổi số du lịch địa phương & kinh tế đêm</div>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 5 */}
          {currentSlide === 5 && (
            <div className="space-y-6">
              <div className="text-xs font-bold text-[#D9822B] uppercase tracking-wider">SẢN PHẨM ĐÃ CHẠY THỰC TẾ</div>
              <h2 className="font-heading font-extrabold text-3xl text-[#26221B]">
                Không Phải Ý Tưởng Trên Giấy — <span className="text-[#0E8C7F]">Sản Phẩm Đã Hoàn Thiện 100%</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <div className="bg-[#FDFBF7] border border-[#E8DCC8] rounded-xl p-6 space-y-3">
                  <h3 className="font-heading font-bold text-lg text-[#26221B]">⚡ Năng Lực Kỹ Thuật Đã Vận Hành</h3>
                  <p className="text-sm text-[#6B655B] leading-relaxed">
                    • Next.js 14 SSG + PostgreSQL Vector pgvector HNSW.<br />
                    • Tốc độ tải trang: <strong>&lt; 200ms</strong>, Build hoàn tất <strong>8.6s</strong>.<br />
                    • 7 tầng bảo vệ chống DDoS, chống cào bot, bảo mật OWASP.<br />
                    • Tích hợp PWA chạy mượt như ứng dụng điện thoại.
                  </p>
                </div>
                <div className="bg-[#0E8C7F]/5 border border-[#0E8C7F]/30 rounded-xl p-6 space-y-3">
                  <h3 className="font-heading font-bold text-lg text-[#0E8C7F]">📍 Dữ Liệu Thực Địa Độc Quyền</h3>
                  <p className="text-sm text-[#6B655B] leading-relaxed">
                    • <strong>149 địa điểm</strong> phân bổ khắp các xã/thị trấn Tri Tôn.<br />
                    • <strong>40+ quán đặc sản</strong> Gà Đốt Ô Thum, Cháo bò, Bún cá củ ngải.<br />
                    • <strong>5 Đại lễ hội Khmer</strong> và Bảo vật kinh lá buông chùa Xvayton.<br />
                    • Danh bạ cứu hộ khẩn cấp 24/7 trực tiếp.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 6 */}
          {currentSlide === 6 && (
            <div className="space-y-6">
              <div className="text-xs font-bold text-[#D9822B] uppercase tracking-wider">MÔ HÌNH DÒNG TIỀN DOANH THU</div>
              <h2 className="font-heading font-extrabold text-3xl text-[#26221B]">
                Kiếm Tiền Như Thế Nào Để <span className="text-[#0E8C7F]">Bền Vững & Khả Thi?</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
                <div className="bg-[#FDFBF7] border border-[#E8DCC8] rounded-xl p-5 space-y-2">
                  <div className="text-2xl">⭐</div>
                  <h3 className="font-heading font-bold text-lg text-[#26221B]">1. Gói Đối Tác Xác Thực</h3>
                  <p className="text-sm text-[#6B655B] leading-relaxed">
                    Thu phí thường niên <strong>2.500.000đ/năm</strong> cho quán Gà Đốt, Homestay, Quán cafe để được gắn nhãn Uy Tín & ưu tiên gợi ý AI.
                  </p>
                </div>
                <div className="bg-[#0E8C7F]/5 border border-[#0E8C7F]/30 rounded-xl p-5 space-y-2">
                  <div className="text-2xl">🍗</div>
                  <h3 className="font-heading font-bold text-lg text-[#0E8C7F]">2. Hoa Hồng Đặt Bàn / Phòng</h3>
                  <p className="text-sm text-[#6B655B] leading-relaxed">
                    Thu <strong>10.000đ - 20.000đ/đơn đặt gà trước 45p</strong> và 5-8% trên mỗi lượt đặt phòng Homestay thành công.
                  </p>
                </div>
                <div className="bg-[#FDFBF7] border border-[#E8DCC8] rounded-xl p-5 space-y-2">
                  <div className="text-2xl">🥥</div>
                  <h3 className="font-heading font-bold text-lg text-[#26221B]">3. Affiliate Đặc Sản OCOP</h3>
                  <p className="text-sm text-[#6B655B] leading-relaxed">
                    Chiết khấu <strong>10% - 15%</strong> khi du khách bấm mua Đường thốt nốt, Tinh dầu chúc, Mắm cá rô đồng gửi về tận nhà.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 7 */}
          {currentSlide === 7 && (
            <div className="space-y-6">
              <div className="text-xs font-bold text-[#D9822B] uppercase tracking-wider">CHIẾN LƯỢC TIẾP CẬN & VIRAL</div>
              <h2 className="font-heading font-extrabold text-3xl text-[#26221B]">
                Đòn Bẩy <span className="text-[#0E8C7F]">"Chiếc Bảng QR Tại Bàn Ăn Hồ Ô Thum"</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
                <div className="bg-[#0E8C7F]/5 border border-[#0E8C7F]/30 rounded-xl p-5 space-y-2">
                  <div className="text-2xl">🪧</div>
                  <h3 className="font-heading font-bold text-lg text-[#0E8C7F]">1. Bảng QR Thực Địa (O2O)</h3>
                  <p className="text-sm text-[#6B655B] leading-relaxed">
                    Đặt mica QR tại 50 bàn ăn Gà Đốt: Tận dụng 45 phút du khách ngồi chờ nướng gà để quét QR hỏi AI $\rightarrow$ Chuyển đổi 100% người dùng thật.
                  </p>
                </div>
                <div className="bg-[#FDFBF7] border border-[#E8DCC8] rounded-xl p-5 space-y-2">
                  <div className="text-2xl">🎬</div>
                  <h3 className="font-heading font-bold text-lg text-[#26221B]">2. Video Ngắn TikTok & Reels</h3>
                  <p className="text-sm text-[#6B655B] leading-relaxed">
                    Series "Bản đồ bí mật của dân phượt né bị chặt chém khi đi Bảy Núi" kéo hàng trăm nghìn lượt xem và tải cẩm nang du lịch.
                  </p>
                </div>
                <div className="bg-[#FDFBF7] border border-[#E8DCC8] rounded-xl p-5 space-y-2">
                  <div className="text-2xl">🐂</div>
                  <h3 className="font-heading font-bold text-lg text-[#26221B]">3. Mùa Lễ Hội Đua Bò</h3>
                  <p className="text-sm text-[#6B655B] leading-relaxed">
                    Độc quyền "Cổng Hỗ Trợ Lễ Hội Đua Bò": Tìm bãi gửi xe, tránh kẹt xe, số cứu hộ xe máy phượt lưu động.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 8 */}
          {currentSlide === 8 && (
            <div className="space-y-6">
              <div className="text-xs font-bold text-[#D9822B] uppercase tracking-wider">LỢI THẾ CẠNH TRANH ĐỘC QUYỀN</div>
              <h2 className="font-heading font-extrabold text-3xl text-[#26221B]">
                Tại Sao <span className="text-[#0E8C7F]">Google Maps & Traveloka Không Thể Thắng?</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
                <div className="bg-[#FDFBF7] border border-[#E8DCC8] rounded-xl p-5 space-y-2">
                  <h3 className="font-heading font-bold text-lg text-[#26221B]">🌐 Nền Tảng Lớn (Google / Agoda)</h3>
                  <p className="text-sm text-[#6B655B] leading-relaxed">
                    • Thông tin vùng sâu bị bỏ hoang, sai tên xã.<br />
                    • Không phân biệt được Gà đốt vs Gà nướng.<br />
                    • Không có số cứu hộ xe máy phượt.<br />
                    • Không có hướng dẫn viên AI trò chuyện.
                  </p>
                </div>
                <div className="bg-[#0E8C7F]/5 border border-[#0E8C7F]/30 rounded-xl p-5 space-y-2">
                  <h3 className="font-heading font-bold text-lg text-[#0E8C7F]">🏆 Du Lịch Tri Tôn AI (Dự Án)</h3>
                  <p className="text-sm text-[#6B655B] leading-relaxed">
                    • <strong>100% dữ liệu thực địa bản địa</strong> chính xác tuyệt đối.<br />
                    • Hiểu sâu văn hóa Phật giáo Nam tông Khmer.<br />
                    • Nhận đơn đặt trước gà đốt tiết kiệm thời gian.<br />
                    • Có mặt trực tiếp trên bàn ăn và homestay.
                  </p>
                </div>
                <div className="bg-[#FDFBF7] border border-[#E8DCC8] rounded-xl p-5 space-y-2">
                  <h3 className="font-heading font-bold text-lg text-[#26221B]">🛡️ Hào Bảo Vệ (Moat)</h3>
                  <p className="text-sm text-[#6B655B] leading-relaxed">
                    • Dữ liệu 149 POIs làm thủ công bằng chân đi thực địa không thể cào tự động.<br />
                    • Mối quan hệ gắn kết trực tiếp với chủ quán bản địa và chính quyền.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 9 */}
          {currentSlide === 9 && (
            <div className="space-y-6">
              <div className="text-xs font-bold text-[#D9822B] uppercase tracking-wider">LỘ TRÌNH 12 THÁNG</div>
              <h2 className="font-heading font-extrabold text-3xl text-[#26221B]">
                Các Cột Mốc <span className="text-[#0E8C7F]">Tăng Trưởng Thực Tế</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
                <div className="bg-[#FDFBF7] border border-[#E8DCC8] rounded-xl p-5 space-y-2">
                  <div className="text-2xl">🚀</div>
                  <h3 className="font-heading font-bold text-lg text-[#26221B]">Quý 1: Phủ Sóng Thực Địa</h3>
                  <p className="text-sm text-[#6B655B] leading-relaxed">
                    • Triển khai 50 bảng QR tại Hồ Ô Thum & Núi Cô Tô.<br />
                    • Ký hợp tác với 10 quán Gà Đốt đầu tiên.<br />
                    • Đạt 10.000 lượt truy cập/tháng.
                  </p>
                </div>
                <div className="bg-[#0E8C7F]/5 border border-[#0E8C7F]/30 rounded-xl p-5 space-y-2">
                  <div className="text-2xl">🏛️</div>
                  <h3 className="font-heading font-bold text-lg text-[#0E8C7F]">Quý 2: Bắt Tay Chính Quyền</h3>
                  <p className="text-sm text-[#6B655B] leading-relaxed">
                    • Trình đề án số hóa với Phòng VHTT Huyện Tri Tôn.<br />
                    • Phục vụ chính thức Mùa Lễ Hội Đua Bò.<br />
                    • Doanh thu đạt điểm hòa vốn (Break-even).
                  </p>
                </div>
                <div className="bg-[#FDFBF7] border border-[#E8DCC8] rounded-xl p-5 space-y-2">
                  <div className="text-2xl">🗺️</div>
                  <h3 className="font-heading font-bold text-lg text-[#26221B]">Quý 3 - 4: Nhân Rộng Toàn Vùng</h3>
                  <p className="text-sm text-[#6B655B] leading-relaxed">
                    • Mở rộng sang Cụm Châu Đốc - Tịnh Biên - Thoại Sơn.<br />
                    • Ra mắt Kiosk Du Lịch Thông Minh tại di tích.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 10 */}
          {currentSlide === 10 && (
            <div className="space-y-6">
              <div className="text-xs font-bold text-[#D9822B] uppercase tracking-wider">CƠ HỘI ĐỒNG HÀNH</div>
              <h2 className="font-heading font-extrabold text-3xl text-[#26221B]">
                Hãy Cùng Chúng Tôi <span className="text-[#0E8C7F]">Kiến Tạo Du Lịch Tri Tôn 2026!</span>
              </h2>
              <p className="text-[#6B655B]">
                Chúng tôi tìm kiếm Đối tác địa phương, Nhà đầu tư hạt giống & Cơ quan quản lý cùng đồng hành.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
                <div className="bg-[#0E8C7F]/5 border border-[#0E8C7F]/30 rounded-xl p-5 space-y-2">
                  <div className="text-2xl">🤝</div>
                  <h3 className="font-heading font-bold text-lg text-[#0E8C7F]">Đối Tác & Chủ Cơ Sở</h3>
                  <p className="text-sm text-[#6B655B]">
                    Đăng ký tham gia Mạng lưới Xác thực Du lịch để đón dòng khách phượt chất lượng cao.
                  </p>
                </div>
                <div className="bg-[#0E8C7F]/5 border border-[#0E8C7F]/30 rounded-xl p-5 space-y-2">
                  <div className="text-2xl">💼</div>
                  <h3 className="font-heading font-bold text-lg text-[#0E8C7F]">Nhà Đầu Tư Hạt Giống</h3>
                  <p className="text-sm text-[#6B655B]">
                    Đồng hành cùng dự án công nghệ bản địa có dòng tiền thực và rào cản phòng thủ vững chắc.
                  </p>
                </div>
                <div className="bg-[#0E8C7F]/5 border border-[#0E8C7F]/30 rounded-xl p-5 space-y-2">
                  <div className="text-2xl">🏛️</div>
                  <h3 className="font-heading font-bold text-lg text-[#0E8C7F]">Cơ Quan Quản Lý</h3>
                  <p className="text-sm text-[#6B655B]">
                    Phối hợp thí điểm đề án chuyển đổi số du lịch an toàn, văn minh cho địa phương.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Slide Footer */}
          <div className="flex justify-between items-center pt-6 mt-6 border-t border-[#E8DCC8] text-xs text-[#6B655B]">
            <span>Đề án Khởi Nghiệp: Du Lịch Tri Tôn AI</span>
            <span>Dùng phím ⬅️ ➡️ để chuyển slide</span>
          </div>

        </div>
      </main>

      {/* Bottom Controls */}
      <footer className="flex justify-center items-center gap-4 px-6 py-4 bg-[#FAF3E7]/95 border-t border-[#E8DCC8]">
        <button
          onClick={prevSlide}
          disabled={currentSlide === 1}
          className="px-4 py-2 bg-white border border-[#E8DCC8] text-sm font-semibold rounded-lg hover:bg-[#F4E8D4] disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1"
        >
          <ChevronLeft size={16} /> Trang trước
        </button>

        <div className="flex-1 max-w-xs h-1.5 bg-[#E8DCC8] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#0E8C7F] transition-all duration-300"
            style={{ width: `${(currentSlide / totalSlides) * 100}%` }}
          />
        </div>

        <button
          onClick={nextSlide}
          className="px-5 py-2 bg-[#0E8C7F] text-white text-sm font-semibold rounded-lg hover:bg-[#0A6B61] transition flex items-center gap-1"
        >
          {currentSlide === totalSlides ? 'Kết thúc 🏁' : 'Trang sau'} <ChevronRight size={16} />
        </button>

        <button
          onClick={toggleFullScreen}
          className="p-2 bg-white border border-[#E8DCC8] rounded-lg hover:bg-[#F4E8D4] transition"
          title="Toàn màn hình"
        >
          <Maximize2 size={16} />
        </button>
      </footer>
    </div>
  );
}
