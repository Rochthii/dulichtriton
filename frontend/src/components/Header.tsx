'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Compass, MapPin, Utensils, Bed, Calendar, Map, 
  Landmark, BookOpen, Briefcase, ShieldAlert, Sparkles, Menu, X, ChevronDown 
} from 'lucide-react';
import MobileBottomNav from '@/components/MobileBottomNav';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // 6 Primary navigation links according to y-tuong-du-an.md
  const mainNav = [
    { href: '/', label: 'Trang chủ', icon: Compass },
    { href: '/places', label: 'Địa điểm', icon: MapPin },
    { href: '/food', label: 'Ẩm thực', icon: Utensils },
    { href: '/stay', label: 'Lưu trú', icon: Bed },
    { href: '/itinerary', label: 'Lập lịch trình', icon: Calendar },
    { href: '/map', label: 'Bản đồ GIS', icon: Map },
  ];

  // Secondary sub-navigation links
  const moreNav = [
    { href: '/culture', label: 'Văn hóa Khmer', icon: Landmark, desc: 'Di sản & Lễ hội Bảy Núi' },
    { href: '/guide', label: 'Cẩm nang du lịch', icon: BookOpen, desc: 'Lộ trình xe & Hotline cứu hộ' },
    { href: '/partner', label: 'Cổng đối tác', icon: Briefcase, desc: 'Đăng ký cơ sở kinh doanh' },
    { href: '/admin', label: 'Quản trị hệ thống', icon: ShieldAlert, desc: 'Admin Control Center' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-header border-b border-slate-200 shadow-xs bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-9 h-9 rounded-xl bg-[#1B4D3E] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
            <Compass className="w-5 h-5 text-[#D99B26]" />
          </div>
          <div>
            <span className="font-extrabold text-base text-[#1B4D3E] tracking-tight block leading-none">
              DU LỊCH TRI TÔN
            </span>
            <span className="text-[10px] font-bold text-[#D99B26] tracking-widest uppercase block mt-0.5">
              AI TOURISM PORTAL
            </span>
          </div>
        </Link>

        {/* Desktop Primary Navigation */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-700">
          {mainNav.map((link) => {
            const Icon = link.icon;
            return (
              <Link 
                key={link.href}
                href={link.href} 
                className="flex items-center gap-1.5 hover:text-[#1B4D3E] transition-colors py-1 border-b-2 border-transparent hover:border-[#1B4D3E]"
              >
                <Icon className="w-3.5 h-3.5 text-[#1B4D3E]" />
                <span>{link.label}</span>
              </Link>
            );
          })}

          {/* More Dropdown Menu */}
          <div className="relative" onMouseLeave={() => setDropdownOpen(false)}>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              onMouseEnter={() => setDropdownOpen(true)}
              className="flex items-center gap-1 hover:text-[#1B4D3E] transition-colors py-1 text-xs font-semibold text-slate-700"
            >
              <span>Thêm</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180 text-[#1B4D3E]' : ''}`} />
            </button>

            {dropdownOpen && (
              <div 
                className="absolute top-full right-0 w-64 pt-2 animate-in fade-in slide-in-from-top-1 duration-150"
                onMouseEnter={() => setDropdownOpen(true)}
              >
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-2 space-y-1">
                  {moreNav.map((sub) => {
                    const SubIcon = sub.icon;
                    return (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-emerald-50 transition-colors group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-emerald-100/60 text-[#1B4D3E] flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#1B4D3E] group-hover:text-white transition-colors">
                          <SubIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-xs text-slate-900 block group-hover:text-[#1B4D3E]">
                            {sub.label}
                          </span>
                          <span className="text-[10px] text-slate-500 block leading-tight">
                            {sub.desc}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* CTA AI Trip Planner Button */}
        <div className="hidden lg:flex items-center gap-3">
          <Link
            href="/itinerary"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1B4D3E] hover:bg-[#143B2F] text-white text-xs font-bold shadow-md transition-all hover:scale-105"
          >
            <Sparkles className="w-4 h-4 text-[#D99B26]" />
            <span>Lập Tour AI</span>
          </Link>
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-top duration-200">
          
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 block mb-1">
              Chuyên Mục Chính
            </span>
            {mainNav.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-800 hover:bg-emerald-50 hover:text-[#1B4D3E] font-semibold text-xs transition-colors"
                >
                  <Icon className="w-4 h-4 text-[#1B4D3E]" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="border-t border-slate-100 pt-3 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 block mb-1">
              Khám Phá & Tiện Ích
            </span>
            {moreNav.map((sub) => {
              const SubIcon = sub.icon;
              return (
                <Link
                  key={sub.href}
                  href={sub.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 font-medium text-xs transition-colors"
                >
                  <SubIcon className="w-4 h-4 text-[#D99B26]" />
                  <span>{sub.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-2">
            <Link
              href="/itinerary"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#1B4D3E] text-white font-bold text-xs shadow-md"
            >
              <Sparkles className="w-4 h-4 text-[#D99B26]" />
              <span>Tạo Lịch Trình AI Ngay</span>
            </Link>
          </div>
        </div>
      )}

      {/* Persistent Mobile Bottom Navigation Dock Bar */}
      <MobileBottomNav />
    </header>
  );
}
