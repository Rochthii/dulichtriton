'use client';

import React from 'react';
import Link from 'next/link';
import { Compass, Phone, ShieldCheck, MapPin, Lock, Sparkles, Heart } from 'lucide-react';

export default function SiteFooter() {
  return (
    <footer className="border-t border-[#1E2647] bg-[#151B34] text-[#FAF3E7]/80 pt-12 pb-24 md:pb-8 font-body">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Main 4-Column Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[#1E2647]">
          
          {/* Col 1: Brand & Emergency Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5 text-white font-display font-bold text-lg">
              <div className="h-10 w-10 rounded-2xl bg-[#0E8C7F] text-[#FFD37A] flex items-center justify-center shadow-md border border-[#0E8C7F]/30">
                <Compass className="h-5 w-5 text-[#FFD37A]" />
              </div>
              <div className="leading-tight">
                <span className="block text-[#FAF3E7]">DU LỊCH TRI TÔN</span>
                <span className="block text-[10px] text-[#F0A32F] tracking-widest font-mono font-bold">FOLK-MODERN AI PORTAL</span>
              </div>
            </div>
            <p className="text-xs text-[#FAF3E7]/70 leading-relaxed font-body">
              Trợ lý AI đồng hành thông minh, hỗ trợ du khách tra cứu 149 địa điểm danh thắng, ẩm thực đặc sản và di sản văn hóa Bảy Núi tại Tri Tôn, An Giang.
            </p>
            <div className="pt-1 space-y-1.5 text-xs">
              <div className="flex items-center gap-2 text-[#FAF3E7]/70">
                <MapPin className="h-3.5 w-3.5 text-[#0E8C7F] shrink-0" />
                <span>Tri Tôn, An Giang, Việt Nam</span>
              </div>
              <div className="flex items-center gap-2 text-[#FFD37A] font-bold">
                <Phone className="h-3.5 w-3.5 text-[#F0A32F] shrink-0" />
                <span>Hotline: 0296.3874.112 (Công an Tri Tôn)</span>
              </div>
            </div>
          </div>

          {/* Col 2: Khám Phá Tri Tôn */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#FFD37A] uppercase tracking-wider font-display">Khám Phá Tri Tôn</h4>
            <ul className="space-y-2 text-xs text-[#FAF3E7]/70">
              <li>
                <Link href="/places" className="hover:text-[#F0A32F] transition-colors">
                  Danh thắng & Hồ nước (Tà Pạ, Ô Thum)
                </Link>
              </li>
              <li>
                <Link href="/food" className="hover:text-[#F0A32F] transition-colors">
                  Đặc sản Gà Đốt Ô Thum & Cháo Bò
                </Link>
              </li>
              <li>
                <Link href="/stay" className="hover:text-[#F0A32F] transition-colors">
                  Homestay & Khách sạn Tri Tôn
                </Link>
              </li>
              <li>
                <Link href="/culture" className="hover:text-[#F0A32F] transition-colors">
                  Văn hóa & Lễ hội Đua bò Khmer
                </Link>
              </li>
              <li>
                <Link href="/guide" className="hover:text-[#F0A32F] transition-colors">
                  Cẩm nang & Lộ trình xe khách
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Tiện Ích Du Khách AI */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#FFD37A] uppercase tracking-wider font-display">Tiện Ích Du Khách AI</h4>
            <ul className="space-y-2 text-xs text-[#FAF3E7]/70">
              <li>
                <Link href="/planner" className="hover:text-[#0E8C7F] transition-colors flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#F0A32F]" />
                  <span>Lập Tour & Xuất Mã QR / PDF</span>
                </Link>
              </li>
              <li>
                <Link href="/map" className="hover:text-[#0E8C7F] transition-colors">
                  Bản đồ tương tác GIS Bảy Núi
                </Link>
              </li>
              <li>
                <Link href="/chatbot" className="hover:text-[#0E8C7F] transition-colors">
                  Hướng dẫn viên AI Chatbot 24/7
                </Link>
              </li>
              <li>
                <Link href="/emergency" className="hover:text-[#F26B3A] transition-colors">
                  Cứu hộ khẩn cấp & Hotline Y Tế
                </Link>
              </li>
              <li>
                <Link href="/partner" className="hover:text-[#0E8C7F] transition-colors">
                  Cổng đăng ký đối tác bản địa
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Địa Danh Thuộc Xã */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#FFD37A] uppercase tracking-wider font-display">Địa Danh Thuộc Xã / Thị Trấn</h4>
            <div className="space-y-2 text-xs text-[#FAF3E7]/70">
              <div className="border-l-2 border-[#0E8C7F] pl-2.5">
                <span className="font-bold text-[#FAF3E7] block">Xã Núi Tô</span>
                <span className="text-[11px] text-[#FAF3E7]/60">Hồ Tà Pạ, Chùa Tà Pạ, Núi Cô Tô</span>
              </div>
              <div className="border-l-2 border-[#0E8C7F] pl-2.5">
                <span className="font-bold text-[#FAF3E7] block">Xã Ô Lâm</span>
                <span className="text-[11px] text-[#FAF3E7]/60">Hồ Ô Thum, Chùa Rô (Đua bò)</span>
              </div>
              <div className="border-l-2 border-[#0E8C7F] pl-2.5">
                <span className="font-bold text-[#FAF3E7] block">Xã Lương Phi</span>
                <span className="text-[11px] text-[#FAF3E7]/60">Khu Căn cứ Lịch sử Ô Tà Sóc</span>
              </div>
              <div className="border-l-2 border-[#0E8C7F] pl-2.5">
                <span className="font-bold text-[#FAF3E7] block">Thị Trấn Tri Tôn</span>
                <span className="text-[11px] text-[#FAF3E7]/60">Quảng trường Tri Tôn, Chợ Tri Tôn</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Copyright & Discreet Admin Link Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#FAF3E7]/50 gap-4">
          <p>© {new Date().getFullYear()} Du Lịch Tri Tôn AI Platform • Phong cách Folk-Modern Bảy Núi.</p>
          
          <div className="flex items-center gap-6">
            <span className="text-[11px] text-[#FAF3E7]/60 font-mono hidden sm:inline">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0E8C7F] inline mr-1" />
              82 POIs Master Data • Supabase pgvector
            </span>

            {/* Discrete Admin Login Link in Footer */}
            <Link
              href="/admin/login"
              className="text-[#FAF3E7]/50 hover:text-[#FFD37A] font-mono text-[11px] flex items-center gap-1.5 transition-colors opacity-70 hover:opacity-100"
              title="Cổng Đăng nhập Quản trị Hệ thống"
            >
              <Lock className="w-3 h-3 text-[#FAF3E7]/50" />
              <span>Quản trị hệ thống</span>
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
