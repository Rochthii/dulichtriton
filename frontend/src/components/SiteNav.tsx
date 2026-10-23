"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  Compass,
  Heart,
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
  Smartphone,
} from "lucide-react";
import AppLogo from "./AppLogo";

export default function SiteNav() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [mobileMenuOpen]);

  if (pathname.startsWith('/admin')) return null;
  const isCurrent = (href: string) => pathname === href
    || (href !== '/' && pathname.startsWith(`${href}/`))
    || (href === '/itinerary' && pathname === '/planner');

  const navLinks = [
    { name: "Trang Chủ", href: "/", icon: Home },
    { name: "Khám Phá", href: "/places", icon: Compass },
    { name: "Đã lưu", href: "/places?saved=1", icon: Heart, mobileOnly: true },
    { name: "Ẩm Thực", href: "/food", icon: Utensils },
    { name: "Lưu Trú", href: "/stay", icon: Hotel },
    { name: "Lễ Hội", href: "/culture", icon: Calendar },
    { name: "Lịch Trình", href: "/itinerary", icon: Sparkles },
    { name: "Bản Đồ", href: "/map", icon: MapPin },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#26221B]/10 bg-[var(--surface)] shadow-[var(--shadow-1)]">
      <div className="mx-auto flex h-16 md:h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
        {/* Brand Logo */}
        <Link href="/" prefetch={true} className="flex items-center shrink-0 group whitespace-nowrap">
          <AppLogo size="md" showText={true} />
        </Link>

        {/* Center Desktop Navigation Links */}
        <nav aria-label="Điều hướng chính" className="hidden xl:flex items-center gap-1 xl:gap-1.5 shrink-0">
          {navLinks.filter(link => !link.mobileOnly).map((link) => {
            const Icon = link.icon;
            const isActive = isCurrent(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                prefetch={true}
                aria-current={isActive ? 'page' : undefined}
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

        {/* Right CTA Actions */}
        <div className="hidden xl:flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("triton:open-chat"));
              }
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-extrabold text-slate-950 bg-gradient-to-r from-[#FFD37A] via-[#F0A32F] to-[#D98E20] hover:shadow-md hover:brightness-105 transition-all shadow-xs active:scale-95 font-display whitespace-nowrap shrink-0 cursor-pointer"
            title="Mở Trợ Lý AI Du Lịch Tri Tôn"
          >
            <Bot className="h-4 w-4 text-slate-950" />
            <span>Trợ Lý AI</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("open-pwa-install"));
              }
            }}
            className="hidden 2xl:flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-full border border-emerald-200 transition-colors font-display whitespace-nowrap shrink-0 cursor-pointer"
            title="Cài Đặt Ứng Dụng Du Lịch Tri Tôn Vào Điện Thoại"
          >
            <Smartphone className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
            <span>Cài App</span>
          </button>

          <Link
            href="/emergency"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-full border border-rose-200 transition-colors font-display whitespace-nowrap shrink-0"
            title="Tổng Đài Hỗ Trợ & Cứu Hộ Khẩn Cấp Bảy Núi"
          >
            <PhoneCall className="h-3.5 w-3.5 text-rose-600 shrink-0" />
            <span className="hidden xl:inline">Cứu Hộ 24/7</span>
          </Link>
        </div>

        {/* Mobile Menu Button & Highlighted AI Button */}
        <div className="flex xl:hidden items-center gap-2 shrink-0">
          <Link href="/emergency" aria-label="SOS — Trợ giúp khẩn cấp" className="min-h-11 min-w-11 flex items-center justify-center gap-1 px-2 rounded-full text-rose-700 bg-rose-50 border border-rose-200 font-bold text-xs">
            <PhoneCall className="h-4 w-4" /><span>SOS</span>
          </Link>
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("triton:open-chat"));
              }
            }}
            className="hidden sm:flex min-h-11 items-center gap-1.5 px-3 rounded-full text-xs font-black text-[var(--ink)] bg-[var(--palm)] font-display cursor-pointer"
            title="Hỏi Đáp Cùng Trợ Lý Du Lịch Tri Tôn AI"
          >
            <Bot className="h-4 w-4 text-slate-950 stroke-[2.5]" />
            <span className="font-extrabold tracking-tight">Hỏi AI</span>
          </button>

          <button
            ref={menuButtonRef}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="min-h-11 min-w-11 flex items-center justify-center rounded-full text-[var(--ink)] bg-[var(--bg)] border border-[#26221B]/10"
            aria-label={mobileMenuOpen ? 'Đóng menu điều hướng' : 'Mở menu điều hướng'}
            aria-expanded={mobileMenuOpen}
            aria-controls="site-navigation-menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5 text-slate-900" /> : <Menu className="h-5 w-5 text-slate-800" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div id="site-navigation-menu" className="xl:hidden max-h-[calc(100dvh-5rem)] overflow-y-auto border-t border-[#26221B]/10 bg-[var(--surface)] px-4 pt-3 pb-6 space-y-2 shadow-xl">
          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = isCurrent(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? 'page' : undefined}
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
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new CustomEvent("open-pwa-install"));
                }
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black bg-emerald-600 text-white shadow-sm font-display cursor-pointer"
            >
              <Smartphone className="h-4 w-4 text-[#FFD37A]" />
              <span>Cài Đặt App Tri Tôn Ra Màn Hình Chính</span>
            </button>

            <Link
              href="/chatbot"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-sm font-display"
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
              <span>Xem danh bạ trợ giúp khẩn cấp</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
