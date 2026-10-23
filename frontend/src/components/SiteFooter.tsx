'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Phone, ShieldCheck, MapPin, Lock, Sparkles, Heart, Scale, Shield, Code, ExternalLink } from 'lucide-react';
import AppLogo from './AppLogo';

export default function SiteFooter() {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return null;
  return (
    <footer className="border-t border-[#1E2647] bg-[#151B34] text-[#FAF3E7]/80 pt-12 pb-24 md:pb-8 font-body">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Main 4-Column Footer Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 pb-10 border-b border-[#1E2647]">
          
          {/* Col 1: Brand & Developer Signature */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5 text-white font-display font-bold text-lg">
              <AppLogo size="md" />
              <div className="leading-tight">
                <span className="block text-[#FAF3E7]">DU LỊCH TRI TÔN</span>
                <span className="block text-[10px] text-[#F0A32F] tracking-widest font-mono font-bold">FOLK-MODERN AI PORTAL</span>
              </div>
            </Link>
            <p className="text-xs text-[#FAF3E7]/70 leading-relaxed font-body">
              Cổng thông tin & Trợ lý AI du lịch Bảy Núi, hỗ trợ khám phá cảnh quan, di sản và ẩm thực Tri Tôn. Xem nguồn và trạng thái xác minh tại từng địa điểm.
            </p>
            
            {/* Developer Credit Signature Badge */}
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1.5 font-display">
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5 text-xs text-[#FFD37A] font-bold">
                  <Code className="w-3.5 h-3.5 text-[#F0A32F]" />
                  <span>Phát triển bởi Chăm Rốch Thi</span>
                </div>
                <a
                  href="mailto:rochthi59@gmail.com"
                  className="text-[10px] text-[#0E8C7F] hover:text-[#FFD37A] font-mono font-bold bg-[#0E8C7F]/15 hover:bg-[#0E8C7F]/30 px-2 py-0.5 rounded-full transition-colors"
                  title="Gửi email cho tác giả"
                >
                  rochthi59@gmail.com
                </a>
              </div>
              <p className="text-[11px] text-[#FAF3E7]/60 font-body">
                Developed with passion by <strong>Cham Roch Thi</strong> for Tri Tôn Tourism Community.
              </p>
            </div>

            <div className="pt-1 space-y-1.5 text-xs">
              <div className="flex items-center gap-2 text-[#FAF3E7]/70">
                <MapPin className="h-3.5 w-3.5 text-[#0E8C7F] shrink-0" />
                <span>Tri Tôn, Tỉnh An Giang, Việt Nam</span>
              </div>
              <div className="flex items-center gap-2 text-[#FFD37A] font-bold">
                <Phone className="h-3.5 w-3.5 text-[#F0A32F] shrink-0" />
                <Link href="/emergency" className="min-h-11 inline-flex items-center underline">SOS · Xem tổng đài và nguồn thông tin</Link>
              </div>
            </div>
          </div>

          {/* Col 2: Khám Phá Tri Tôn */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#FFD37A] uppercase tracking-wider font-display">Khám Phá Tri Tôn</h4>
            <ul className="space-y-2 text-xs text-[#FAF3E7]/70">
              <li>
                <Link href="/places" className="hover:text-[#F0A32F] transition-colors">
                  Danh thắng & Hồ nước (Tà Pạ, Ô Thum, Cô Tô)
                </Link>
              </li>
              <li>
                <Link href="/food" className="hover:text-[#F0A32F] transition-colors">
                  Đặc sản Gà Đốt Ô Thum & Cháo Bò Tri Tôn
                </Link>
              </li>
              <li>
                <Link href="/stay" className="hover:text-[#F0A32F] transition-colors">
                  Homestay view núi & Khách sạn Tri Tôn
                </Link>
              </li>
              <li>
                <Link href="/culture" className="hover:text-[#F0A32F] transition-colors">
                  Di tích văn hóa & Chùa Khmer Nam Tông
                </Link>
              </li>
              <li>
                <Link href="/guide" className="hover:text-[#F0A32F] transition-colors">
                  Cẩm nang & Lộ trình xe khách đến Tri Tôn
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Tiện Ích Du Khách AI */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#FFD37A] uppercase tracking-wider font-display">Tiện Ích & Dịch Vụ AI</h4>
            <ul className="space-y-2 text-xs text-[#FAF3E7]/70">
              <li>
                <Link href="/planner" className="hover:text-[#0E8C7F] transition-colors flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#F0A32F]" />
                  <span>Lập Tour Thực Địa & Xuất PDF/QR</span>
                </Link>
              </li>
              <li>
                <Link href="/map" className="hover:text-[#0E8C7F] transition-colors">
                  Bản đồ tương tác GPS Bảy Núi
                </Link>
              </li>
              <li>
                <Link href="/chatbot" className="hover:text-[#0E8C7F] transition-colors">
                  Trợ lý AI hướng dẫn viên 24/7
                </Link>
              </li>
              <li>
                <Link href="/emergency" className="hover:text-[#F26B3A] transition-colors">
                  Cứu hộ khẩn cấp & Hotline Công An, Y Tế
                </Link>
              </li>
              <li>
                <Link href="/partner" className="hover:text-[#0E8C7F] transition-colors">
                  Cổng hợp tác đối tác bản địa
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Pháp Lý & Điều Khoản */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#FFD37A] uppercase tracking-wider font-display">Chính Sách & Pháp Lý</h4>
            <ul className="space-y-2 text-xs text-[#FAF3E7]/70">
              <li>
                <Link href="/terms" className="hover:text-[#F0A32F] transition-colors flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-[#0E8C7F]" />
                  <span>Điều khoản dịch vụ (Terms)</span>
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[#F0A32F] transition-colors flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[#0E8C7F]" />
                  <span>Chính sách bảo mật (Privacy)</span>
                </Link>
              </li>
              <li>
                <Link href="/emergency" className="hover:text-[#F26B3A] transition-colors flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#F26B3A]" />
                  <span>Quy chuẩn an toàn du khách</span>
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/Rochthii/dulichtriton"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#FFD37A] transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  <span>Mã nguồn mở GitHub</span>
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright, Attribution & Discreet Admin Link Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#FAF3E7]/60 gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <p>© {new Date().getFullYear()} Du Lịch Tri Tôn AI Platform • Phong cách Folk-Modern Bảy Núi.</p>
            <p className="text-[11px] text-[#FAF3E7]/40">
              Thiết kế & phát triển bởi <strong>Chăm Rốch Thi</strong> (Cham Roch Thi) • Đối chiếu thông tin trước khi khởi hành.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <Link
              href="/terms"
              className="text-[#FAF3E7]/60 hover:text-[#FFD37A] text-[11px] transition-colors"
            >
              Điều khoản
            </Link>
            <span className="opacity-30">•</span>
            <Link
              href="/privacy"
              className="text-[#FAF3E7]/60 hover:text-[#FFD37A] text-[11px] transition-colors"
            >
              Bảo mật
            </Link>
            <span className="opacity-30">•</span>
            {/* Discrete Admin Login Link */}
            <Link
              href="/admin/login"
              className="text-[#FAF3E7]/50 hover:text-[#FFD37A] font-mono text-[11px] flex items-center gap-1 transition-colors opacity-70 hover:opacity-100"
              title="Cổng Đăng nhập Quản trị Hệ thống"
            >
              <Lock className="w-3 h-3 text-[#FAF3E7]/50" />
              <span>Quản trị</span>
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
