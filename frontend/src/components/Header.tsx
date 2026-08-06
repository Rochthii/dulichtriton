'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Compass, MapPin, Utensils, Sparkles, Menu, X } from 'lucide-react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full glass-header border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-[#1B4D3E] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
            <Compass className="w-6 h-6 text-[#D99B26]" />
          </div>
          <div>
            <span className="font-bold text-lg text-[#1B4D3E] tracking-tight block leading-none">
              DU LỊCH TRI TÔN
            </span>
            <span className="text-[11px] font-semibold text-[#D99B26] tracking-widest uppercase block mt-0.5">
              BẢY NÚI AN GIANG
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 font-medium text-sm text-slate-700">
          <Link 
            href="/" 
            className="flex items-center gap-1.5 hover:text-[#1B4D3E] transition-colors py-1 border-b-2 border-transparent hover:border-[#1B4D3E]"
          >
            <Compass className="w-4 h-4 text-[#1B4D3E]" />
            <span>Trang chủ</span>
          </Link>

          <Link 
            href="/places" 
            className="flex items-center gap-1.5 hover:text-[#1B4D3E] transition-colors py-1 border-b-2 border-transparent hover:border-[#1B4D3E]"
          >
            <MapPin className="w-4 h-4 text-[#1B4D3E]" />
            <span>106 Địa điểm</span>
          </Link>

          <Link 
            href="/food" 
            className="flex items-center gap-1.5 hover:text-[#1B4D3E] transition-colors py-1 border-b-2 border-transparent hover:border-[#1B4D3E]"
          >
            <Utensils className="w-4 h-4 text-[#1B4D3E]" />
            <span>Đặc sản & Ẩm thực</span>
          </Link>
        </nav>

        {/* CTA Button */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/places"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1B4D3E] hover:bg-[#143B2F] text-white text-sm font-semibold shadow-xs transition-all hover:shadow-md"
          >
            <Sparkles className="w-4 h-4 text-[#D99B26]" />
            <span>Khám Phá Ngay</span>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-800 hover:bg-emerald-50 hover:text-[#1B4D3E] font-medium"
          >
            <Compass className="w-5 h-5 text-[#1B4D3E]" />
            <span>Trang chủ</span>
          </Link>

          <Link
            href="/places"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-800 hover:bg-emerald-50 hover:text-[#1B4D3E] font-medium"
          >
            <MapPin className="w-5 h-5 text-[#1B4D3E]" />
            <span>106 Địa điểm Tri Tôn</span>
          </Link>

          <Link
            href="/food"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-800 hover:bg-emerald-50 hover:text-[#1B4D3E] font-medium"
          >
            <Utensils className="w-5 h-5 text-[#1B4D3E]" />
            <span>Đặc sản Gà Đốt</span>
          </Link>
        </div>
      )}
    </header>
  );
}
