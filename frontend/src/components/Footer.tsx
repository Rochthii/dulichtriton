import React from 'react';
import Link from 'next/link';
import { Compass, MapPin, Phone, Mail, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0F172A] text-slate-300 pt-12 pb-24 md:pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-[#1B4D3E] flex items-center justify-center text-white">
                <Compass className="w-5 h-5 text-[#D99B26]" />
              </div>
              <span className="font-bold text-lg text-white tracking-tight">DU LỊCH TRI TÔN</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Cổng thông tin du lịch và trợ lý AI thông minh chuyên sâu về Huyện Tri Tôn, Tỉnh An Giang. 106 Địa điểm đã xác minh.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Khám Phá</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link href="/places" className="hover:text-[#D99B26] transition-colors">Danh thắng & Hồ nước</Link></li>
              <li><Link href="/places" className="hover:text-[#D99B26] transition-colors">Chùa Khmer Bảy Núi</Link></li>
              <li><Link href="/food" className="hover:text-[#D99B26] transition-colors">Đặc sản Gà Đốt Ô Thum</Link></li>
              <li><Link href="/food" className="hover:text-[#D99B26] transition-colors">Bún nước lèo & Bánh xèo</Link></li>
            </ul>
          </div>

          {/* Admin Communes */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Địa Điểm Thuộc Xã</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>Xã Núi Tô (Hồ Tà Pạ, Chùa Tà Pạ)</li>
              <li>Xã Ô Lâm (Hồ Ô Thum, Ô Tà Lọt)</li>
              <li>Xã Lương Phi (Khu Ô Tà Sóc)</li>
              <li>Xã Ba Chúc (Nhà mồ Ba Chúc)</li>
            </ul>
          </div>

          {/* Contact & Verify */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Xác Minh & Hỗ Trợ</h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#D99B26]" />
                <span>Tri Tôn, An Giang, Việt Nam</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>106 Bản ghi Master NFC Standard</span>
              </div>
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Du Lịch Tri Tôn AI System. Bảo lưu mọi bản quyền.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Thiết kế dành cho du khách trải nghiệm Tri Tôn</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
