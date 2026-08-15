"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Compass,
  Utensils,
  Hotel,
  Calendar,
  MapPin,
  Bot,
  Menu,
  X,
  Sparkles,
  PhoneCall,
  Home,
  Shield,
} from "lucide-react";
import AppLogo from "./AppLogo";

export default function SiteNav() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Trang Chủ", href: "/", icon: Home },
    { name: "Khám Phá", href: "/places", icon: Compass },
    { name: "Ẩm Thực", href: "/food", icon: Utensils },
    { name: "Lưu Trú", href: "/stay", icon: Hotel },
    { name: "Lễ Hội", href: "/culture", icon: Calendar },
    { name: "Lịch Trình", href: "/itinerary", icon: Sparkles },
    { name: "Bản Đồ", href: "/map", icon: MapPin },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-xl shadow-xs transition-all">
      <div className="mx-auto flex h-16 md:h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
        {/* Brand Logo */}
        <Link href="/" prefetch={true} className="flex items-center shrink-0 group whitespace-nowrap">
          <AppLogo size="md" showText={true} />
        </Link>

        {/* Center Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 shrink-0">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href === "/itinerary" && pathname === "/planner");

            return (
              <Link
                key={link.href}
                href={link.href}
                prefetch={true}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? "bg-emerald-50 text-[#0E8C7F] border border-emerald-200 shadow-2xs font-black"
                    : "text-slate-600 hover:text-slate-950 hover:bg-slate-100/80 font-semibold"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-[#0E8C7F]" : "text-slate-400"}`} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Medium Screen Nav (768px - 1024px) */}
        <nav className="hidden md:flex lg:hidden items-center gap-1 shrink-0">
          {navLinks.slice(0, 5).map((link) => {
            const isActive = pathname === link.href || (link.href === "/itinerary" && pathname === "/planner");
            return (
              <Link
                key={link.href}
                href={link.href}
                prefetch={true}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-emerald-50 text-[#0E8C7F]"
                    : "text-slate-600 hover:text-slate-950 hover:bg-slate-100"
                }`}
              >
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right CTA Actions */}
        <div className="hidden md:flex items-center gap-2.5 shrink-0">
          <Link
            href="/chatbot"
            prefetch={true}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-extrabold text-slate-950 bg-gradient-to-r from-[#FFD37A] via-[#F0A32F] to-[#D98E20] hover:shadow-md hover:brightness-105 transition-all shadow-xs active:scale-95 font-display whitespace-nowrap shrink-0"
          >
            <Bot className="h-4 w-4 text-slate-950" />
            <span>Trợ Lý AI</span>
          </Link>

          <Link
            href="/emergency"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-full border border-rose-200 transition-colors font-display whitespace-nowrap shrink-0"
            title="Tổng Đài Hỗ Trợ & Cứu Hộ Khẩn Cấp Bảy Núi"
          >
            <PhoneCall className="h-3.5 w-3.5 text-rose-600 shrink-0" />
            <span className="hidden xl:inline">Cứu Hộ 24/7</span>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2 shrink-0">
          <Link
            href="/chatbot"
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-black bg-[#F0A32F] text-slate-950 font-display"
          >
            <Bot className="h-3.5 w-3.5" />
            <span>AI</span>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 focus:outline-none shrink-0"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white/98 backdrop-blur-2xl px-4 pt-3 pb-6 space-y-2 shadow-xl">
          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href === "/itinerary" && pathname === "/planner");

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-[#0E8C7F] text-white shadow-xs"
                      : "text-slate-700 bg-slate-50 border border-slate-100 hover:bg-slate-100"
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-[#0E8C7F]"}`} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <Link
              href="/chatbot"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs font-black bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-sm font-display"
            >
              <Bot className="h-4 w-4" />
              <span>Hỏi Đáp Du Lịch Cùng Trợ Lý AI</span>
            </Link>

            <Link
              href="/emergency"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 py-2.5 rounded-2xl text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 font-display"
            >
              <PhoneCall className="h-3.5 w-3.5 text-rose-600 shrink-0" />
              <span>Tổng Đài Cứu Hộ Bảy Núi: 0296.3874.113</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
