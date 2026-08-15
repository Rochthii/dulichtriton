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
} from "lucide-react";

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
    { name: "Trợ Lý AI", href: "/chatbot", icon: Bot, isChatTrigger: true },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#26221B]/8 bg-[#FAF3E7]/95 backdrop-blur-md shadow-xs transition-all duration-300">
      <div className="mx-auto flex h-16 md:h-18 max-w-7xl items-center justify-between px-3 sm:px-5 lg:px-8 gap-2">
        {/* Brand Logo - Folk-Modern Palm & Twin Mountain Motif */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group whitespace-nowrap">
          <div className="h-9 w-9 md:h-10 md:w-10 rounded-xl bg-[#0E8C7F] flex items-center justify-center text-[#FAF3E7] shadow-sm shadow-[#0E8C7F]/20 group-hover:scale-105 transition-transform shrink-0">
            <Compass className="h-5 w-5 md:h-5.5 md:w-5.5 text-[#FFD37A]" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-extrabold text-base md:text-lg tracking-tight text-[#26221B] leading-tight">
              Du Lịch <span className="text-[#0E8C7F]">Tri Tôn</span>
            </span>
            <span className="font-body text-[9px] md:text-[10px] font-bold text-[#6B6355] uppercase tracking-wider -mt-0.5">
              AI Tourism
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links (Pill Container) */}
        <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 bg-[#FFFDF7] p-1 rounded-full border border-[#26221B]/8 shadow-2xs shrink-0">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href === '/itinerary' && pathname === '/planner');
            
            if (link.isChatTrigger) {
              return (
                <Link
                  key={link.name}
                  href="/chatbot"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#26221B] bg-[#F0A32F] hover:bg-[#C97F1B] hover:text-white transition-all shadow-xs active:scale-95 ml-0.5 font-display whitespace-nowrap shrink-0"
                >
                  <Bot className="h-3.5 w-3.5 text-[#26221B]" />
                  <span>{link.name}</span>
                </Link>
              );
            }

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-full text-xs font-semibold font-body transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? "bg-[#0E8C7F] text-white shadow-xs font-bold"
                    : "text-[#6B6355] hover:text-[#26221B] hover:bg-[#FAF3E7]"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-white" : "text-[#6B6355]"}`} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Medium Screen Navigation Links (768px - 1024px) */}
        <nav className="hidden md:flex lg:hidden items-center gap-0.5 bg-[#FFFDF7] p-1 rounded-full border border-[#26221B]/8 shadow-2xs shrink-0">
          {navLinks.filter(l => ['Trang Chủ', 'Khám Phá', 'Ẩm Thực', 'Lịch Trình', 'Bản Đồ', 'Trợ Lý AI'].includes(l.name)).map((link) => {
            const isActive = pathname === link.href || (link.href === '/itinerary' && pathname === '/planner');
            if (link.isChatTrigger) {
              return (
                <Link
                  key={link.name}
                  href="/chatbot"
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold text-[#26221B] bg-[#F0A32F] hover:bg-[#C97F1B] hover:text-white transition-all shadow-xs active:scale-95 font-display whitespace-nowrap shrink-0"
                >
                  <Bot className="h-3.5 w-3.5 text-[#26221B]" />
                  <span>AI</span>
                </Link>
              );
            }

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-2 py-1.5 rounded-full text-xs font-semibold font-body transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? "bg-[#0E8C7F] text-white font-bold"
                    : "text-[#6B6355] hover:text-[#26221B] hover:bg-[#FAF3E7]"
                }`}
              >
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right CTA Actions */}
        <div className="hidden xl:flex items-center gap-2 shrink-0">
          <Link
            href="/emergency"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#26221B] bg-[#FFFDF7] hover:bg-[#FAF3E7] rounded-full border border-[#26221B]/10 transition-colors shadow-2xs font-display whitespace-nowrap shrink-0"
          >
            <PhoneCall className="h-3.5 w-3.5 text-[#F26B3A] shrink-0" />
            <span>Cứu Hộ 24/7</span>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-full text-[#26221B] bg-[#FFFDF7] border border-[#26221B]/8 hover:bg-[#FAF3E7] focus:outline-none shrink-0"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#26221B]/8 bg-[#FAF3E7]/98 backdrop-blur-xl px-4 pt-3 pb-6 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href === '/itinerary' && pathname === '/planner');
            if (link.isChatTrigger) {
              return (
                <Link
                  key={link.name}
                  href="/chatbot"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-full text-sm font-bold bg-[#F0A32F] text-[#26221B] shadow-xs active:scale-95 font-display whitespace-nowrap"
                >
                  <Bot className="h-4.5 w-4.5 text-[#26221B]" />
                  <span>Trò Chuyện Cùng Trợ Lý AI</span>
                </Link>
              );
            }

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-[#0E8C7F] text-white font-bold"
                    : "text-[#26221B] bg-[#FFFDF7] border border-[#26221B]/5"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-[#0E8C7F]"}`} />
                <span>{link.name}</span>
              </Link>
            );
          })}
          <div className="pt-2 border-t border-[#26221B]/8 flex flex-col gap-2">
            <Link
              href="/emergency"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-bold text-[#26221B] bg-[#FFFDF7] border border-[#26221B]/10 font-display whitespace-nowrap"
            >
              <PhoneCall className="h-4 w-4 text-[#F26B3A] shrink-0" />
              <span>Tổng Đài Cứu Hộ Du Lịch Tri Tôn</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
