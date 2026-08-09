'use client';

import React from 'react';
import Link from 'next/link';
import { Compass, Phone, ShieldCheck, MapPin, Lock, Sparkles, Heart } from 'lucide-react';

export default function SiteFooter() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-300 pt-12 pb-24 md:pb-8 font-sans">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Main 4-Column Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800/80">
          
          {/* Col 1: Brand & Emergency Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5 text-white font-heading font-extrabold text-lg">
              <div className="h-9 w-9 rounded-xl bg-[#1B4D3E] text-amber-300 flex items-center justify-center shadow-md">
                <Compass className="h-5 w-5 text-amber-400" />
              </div>
              <div className="leading-tight">
                <span className="block text-white">DU LỊCH TRI TÔN</span>
                <span className="block text-[10px] text-amber-400 tracking-widest font-mono font-bold">AI TOURISM PORTAL</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Trợ lý AI đồng hành thông minh, hỗ trợ du khách tra cứu 95+ địa điểm danh thắng, ẩm thực đặc sản và di sản văn hóa Bảy Núi tại Tri Tôn, An Giang.
            </p>
            <div className="pt-1 space-y-1.5 text-xs">
              <div className="flex items-center gap-2 text-slate-400 font-medium">
                <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>Tri Tôn, An Giang, Việt Nam</span>
              </div>
              <div className="flex items-center gap-2 text-amber-300 font-bold">
                <Phone className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span>Hotline: 0296.3874.112 (Công an Tri Tôn)</span>
              </div>
            </div>
          </div>

          {/* Col 2: Khám Phá Tri Tôn */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Khám Phá Tri Tôn</h4>
            <ul className="space-y-2 text-xs text-slate-400 font-medium">
              <li>
                <Link href="/places" className="hover:text-amber-300 transition-colors">
                  📍 Danh thắng & Hồ nước (Tà Pạ, Ô Thum)
                </Link>
              </li>
              <li>
                <Link href="/food" className="hover:text-amber-300 transition-colors">
                  🍗 Đặc sản Gà Đốt Ô Thum & Cháo Bò
                </Link>
              </li>
              <li>
                <Link href="/stay" className="hover:text-amber-300 transition-colors">
                  🏡 Homestay & Khách sạn Tri Tôn
                </Link>
              </li>
              <li>
                <Link href="/culture" className="hover:text-amber-300 transition-colors">
                  🛕 Văn hóa & Lễ hội Đua bò Khmer
                </Link>
              </li>
              <li>
                <Link href="/guide" className="hover:text-amber-300 transition-colors">
                  📖 Cẩm nang & Lộ trình xe khách
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Tiện Ích Du Khách AI */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Tiện Ích Du Khách AI</h4>
            <ul className="space-y-2 text-xs text-slate-400 font-medium">
              <li>
                <Link href="/itinerary" className="hover:text-emerald-400 transition-colors flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Lập Tour & Xuất File PDF/Mã QR</span>
                </Link>
              </li>
              <li>
                <Link href="/map" className="hover:text-emerald-400 transition-colors">
                  🗺️ Bản đồ tương tác GIS Bảy Núi
                </Link>
              </li>
              <li>
                <Link href="/chatbot" className="hover:text-emerald-400 transition-colors">
                  🤖 Hướng dẫn viên AI Chatbot 24/7
                </Link>
              </li>
              <li>
                <Link href="/emergency" className="hover:text-rose-400 transition-colors">
                  🚨 Cứu hộ khẩn cấp & SĐT Y Tế
                </Link>
              </li>
              <li>
                <Link href="/partner" className="hover:text-emerald-400 transition-colors">
                  🤝 Cổng đăng ký đối tác kinh doanh
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Địa Danh Thuộc Xã */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Địa Danh Thuộc Xã / Thị Trấn</h4>
            <div className="space-y-2 text-xs text-slate-400 font-medium">
              <div className="border-l-2 border-emerald-500 pl-2.5">
                <span className="font-bold text-slate-200 block">Xã Núi Tô</span>
                <span className="text-[11px] text-slate-400">Hồ Tà Pạ, Chùa Tà Pạ, Núi Cô Tô</span>
              </div>
              <div className="border-l-2 border-emerald-500 pl-2.5">
                <span className="font-bold text-slate-200 block">Xã Ô Lâm</span>
                <span className="text-[11px] text-slate-400">Hồ Ô Thum, Chùa Rô (Đua bò)</span>
              </div>
              <div className="border-l-2 border-emerald-500 pl-2.5">
                <span className="font-bold text-slate-200 block">Xã Lương Phi</span>
                <span className="text-[11px] text-slate-400">Khu Căn cứ Lịch sử Ô Tà Sóc</span>
              </div>
              <div className="border-l-2 border-emerald-500 pl-2.5">
                <span className="font-bold text-slate-200 block">Thị Trấn Tri Tôn</span>
                <span className="text-[11px] text-slate-400">Quảng trường Tri Tôn, Chợ Tri Tôn</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Copyright & Discreet Admin Link Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Du Lịch Tri Tôn AI Tourism Platform. Bảo lưu mọi bản quyền.</p>
          
          <div className="flex items-center gap-6">
            <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 inline mr-1" />
              95 POIs NFC Standard • Supabase PostgreSQL
            </span>

            {/* Discrete Admin Login Link in Footer */}
            <Link
              href="/admin/login"
              className="text-slate-500 hover:text-amber-400 font-mono text-[11px] flex items-center gap-1.5 transition-colors opacity-70 hover:opacity-100"
              title="Cổng Đăng nhập Quản trị Hệ thống"
            >
              <Lock className="w-3 h-3 text-slate-400" />
              <span>Quản trị hệ thống</span>
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
