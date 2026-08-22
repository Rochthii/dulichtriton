'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Phone, ShieldCheck, MapPin, Lock, Sparkles, Heart, Scale, Shield, Code, ExternalLink } from 'lucide-react';
import AppLogo from './AppLogo';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function SiteFooter() {
  const { language, dict } = useLanguage();
  const f = dict.common.footer;
  const nav = dict.common.nav;
  const isEn = language === 'en';
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
                <span className="block text-[#FAF3E7]">{f.brandTitle}</span>
                <span className="block text-[10px] text-[#F0A32F] tracking-widest font-mono font-bold">{f.brandSubtitle}</span>
              </div>
            </Link>
            <p className="text-xs text-[#FAF3E7]/70 leading-relaxed font-body">
              {f.brandDesc}
            </p>
            
            {/* Developer Credit Signature Badge */}
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1.5 font-display">
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5 text-xs text-[#FFD37A] font-bold">
                  <Code className="w-3.5 h-3.5 text-[#F0A32F]" />
                  <span>{isEn ? 'Developed by Cham Roch Thi' : 'Phát triển bởi Chăm Rốch Thi'}</span>
                </div>
                <a
                  href="mailto:rochthi59@gmail.com"
                  className="text-[10px] text-[#0E8C7F] hover:text-[#FFD37A] font-mono font-bold bg-[#0E8C7F]/15 hover:bg-[#0E8C7F]/30 px-2 py-0.5 rounded-full transition-colors"
                  title="Email"
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
                <span>{f.addressText}</span>
              </div>
              <div className="flex items-center gap-2 text-[#FFD37A] font-bold">
                <Phone className="h-3.5 w-3.5 text-[#F0A32F] shrink-0" />
                <span>{f.emergencyTitle} {f.emergencyNumber}</span>
              </div>
            </div>
          </div>

          {/* Col 2: Khám Phá Tri Tôn */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#FFD37A] uppercase tracking-wider font-display">{f.tourismCategories}</h4>
            <ul className="space-y-2 text-xs text-[#FAF3E7]/70">
              <li>
                <Link href="/places" className="hover:text-[#F0A32F] transition-colors">
                  {isEn ? 'Scenic Lakes & Peaks (Ta Pa, O Thum, Co To)' : 'Danh thắng & Hồ nước (Tà Pạ, Ô Thum, Cô Tô)'}
                </Link>
              </li>
              <li>
                <Link href="/food" className="hover:text-[#F0A32F] transition-colors">
                  {isEn ? 'O Thum Roasted Chicken & Beef Porridge' : 'Đặc sản Gà Đốt Ô Thum & Cháo Bò Tri Tôn'}
                </Link>
              </li>
              <li>
                <Link href="/stay" className="hover:text-[#F0A32F] transition-colors">
                  {isEn ? 'Mountain-View Homestays & Hotels' : 'Homestay view núi & Khách sạn Tri Tôn'}
                </Link>
              </li>
              <li>
                <Link href="/culture" className="hover:text-[#F0A32F] transition-colors">
                  {isEn ? 'Cultural Relics & Ancient Khmer Pagodas' : 'Di tích văn hóa & Chùa Khmer Nam Tông'}
                </Link>
              </li>
              <li>
                <Link href="/guide" className="hover:text-[#F0A32F] transition-colors">
                  {isEn ? 'Travel Guide & Bus Routes to Tri Ton' : 'Cẩm nang & Lộ trình xe khách đến Tri Tôn'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Tiện Ích Du Khách AI */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#FFD37A] uppercase tracking-wider font-display">{isEn ? 'AI Services & Tools' : 'Tiện Ích & Dịch Vụ AI'}</h4>
            <ul className="space-y-2 text-xs text-[#FAF3E7]/70">
              <li>
                <Link href="/itinerary" className="hover:text-[#0E8C7F] transition-colors flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#F0A32F]" />
                  <span>{isEn ? 'Closed-Loop Itinerary & PDF Export' : 'Lập Tour Thực Địa & Xuất PDF/QR'}</span>
                </Link>
              </li>
              <li>
                <Link href="/map" className="hover:text-[#0E8C7F] transition-colors">
                  {isEn ? 'Seven Mountains Interactive GIS Map' : 'Bản đồ tương tác GPS Bảy Núi'}
                </Link>
              </li>
              <li>
                <Link href="/chatbot" className="hover:text-[#0E8C7F] transition-colors">
                  {isEn ? '24/7 Virtual AI Tour Guide' : 'Trợ lý AI hướng dẫn viên 24/7'}
                </Link>
              </li>
              <li>
                <Link href="/emergency" className="hover:text-[#F26B3A] transition-colors">
                  {isEn ? '24/7 Emergency SOS & Hotline Directory' : 'Cứu hộ khẩn cấp & Hotline Công An, Y Tế'}
                </Link>
              </li>
              <li>
                <Link href="/partner" className="hover:text-[#0E8C7F] transition-colors">
                  {isEn ? 'Local Merchant & Business Portal' : 'Cổng hợp tác đối tác bản địa'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Pháp Lý & Điều Khoản */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#FFD37A] uppercase tracking-wider font-display">{isEn ? 'Policies & Legal' : 'Chính Sách & Pháp Lý'}</h4>
            <ul className="space-y-2 text-xs text-[#FAF3E7]/70">
              <li>
                <Link href="/terms" className="hover:text-[#F0A32F] transition-colors flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-[#0E8C7F]" />
                  <span>{isEn ? 'Terms of Service' : 'Điều khoản dịch vụ'}</span>
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[#F0A32F] transition-colors flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[#0E8C7F]" />
                  <span>{isEn ? 'Privacy Policy' : 'Chính sách bảo mật'}</span>
                </Link>
              </li>
              <li>
                <Link href="/emergency" className="hover:text-[#F26B3A] transition-colors flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#F26B3A]" />
                  <span>{isEn ? 'Traveler Safety Protocol' : 'Quy chuẩn an toàn du khách'}</span>
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
                  <span>GitHub Repository</span>
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright, Attribution & Discreet Admin Link Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#FAF3E7]/60 gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <p>© {new Date().getFullYear()} {f.copyright}</p>
            <p className="text-[11px] text-[#FAF3E7]/40">
              {f.verifiedBadge}
            </p>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <Link
              href="/terms"
              className="text-[#FAF3E7]/60 hover:text-[#FFD37A] text-[11px] transition-colors"
            >
              {isEn ? 'Terms' : 'Điều khoản'}
            </Link>
            <span className="opacity-30">•</span>
            <Link
              href="/privacy"
              className="text-[#FAF3E7]/60 hover:text-[#FFD37A] text-[11px] transition-colors"
            >
              {isEn ? 'Privacy' : 'Bảo mật'}
            </Link>
            <span className="opacity-30">•</span>
            {/* Discrete Admin Login Link */}
            <Link
              href="/admin/login"
              className="text-[#FAF3E7]/50 hover:text-[#FFD37A] font-mono text-[11px] flex items-center gap-1 transition-colors opacity-70 hover:opacity-100"
              title="Admin Portal"
            >
              <Lock className="w-3 h-3 text-[#FAF3E7]/50" />
              <span>{isEn ? 'Admin' : 'Quản trị'}</span>
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
