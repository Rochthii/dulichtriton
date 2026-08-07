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
  User,
} from "lucide-react";

export default function SiteNav() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Khám Phá", href: "/places", icon: Compass },
    { name: "Ẩm Thực", href: "/food", icon: Utensils },
    { name: "Lưu Trú", href: "/stay", icon: Hotel },
    { name: "Lễ Hội", href: "/culture", icon: Calendar },
    { name: "Lịch Trình AI", href: "/planner", icon: Sparkles },
    { name: "Bản Đồ", href: "/map", icon: MapPin },
    { name: "Trợ Lý AI", href: "/chatbot", icon: Bot },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 glass-nav shadow-sm transition-all duration-300">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-xl bg-emerald-700 flex items-center justify-center text-white shadow-md shadow-emerald-950/20 group-hover:scale-105 transition-transform">
            <Compass className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-heading font-extrabold text-xl tracking-tight text-emerald-950 flex items-center gap-1.5">
              Tri Tôn <span className="text-emerald-700">AI</span>
            </span>
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-widest -mt-1">
              Tourism Guide
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/70 p-1.5 rounded-full border border-slate-200/60">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-white text-emerald-800 shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-emerald-700" : "text-slate-400"}`} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA Actions */}
        <div className="hidden lg:flex items-center gap-3">
          <Link
            href="/emergency"
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition-colors"
          >
            <PhoneCall className="h-3.5 w-3.5 text-amber-600" />
            Cứu hộ 24/7
          </Link>
          <button className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-md shadow-emerald-900/10 transition-all hover:scale-[1.02]">
            <User className="h-3.5 w-3.5" />
            Đăng nhập
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-lg px-4 pt-3 pb-6 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-emerald-50 text-emerald-900 font-bold"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-emerald-700" : "text-slate-400"}`} />
                {link.name}
              </Link>
            );
          })}
          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
            <Link
              href="/emergency"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-amber-900 bg-amber-50 border border-amber-200"
            >
              <PhoneCall className="h-4 w-4 text-amber-600" />
              Tổng đài Cứu hộ Du lịch
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
