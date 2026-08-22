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
  Smartphone,
  Globe,
} from "lucide-react";
import AppLogo from "./AppLogo";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function SiteNav() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  const navLinks = [
    { name: t("nav.home"), href: "/", icon: Home },
    { name: t("nav.places"), href: "/places", icon: Compass },
    { name: t("nav.food"), href: "/food", icon: Utensils },
    { name: t("nav.stay"), href: "/stay", icon: Hotel },
    { name: t("nav.culture"), href: "/culture", icon: Calendar },
    { name: t("nav.itinerary"), href: "/itinerary", icon: Sparkles },
    { name: t("nav.map"), href: "/map", icon: MapPin },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-xl shadow-xs transition-all">
      <div className="mx-auto flex h-16 md:h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
        {/* Brand Logo */}
        <Link href="/" prefetch={true} className="flex items-center shrink-0 group whitespace-nowrap">
          <AppLogo size="md" showText={true} />
        </Link>

        {/* Center Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1.5 shrink-0">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href === "/itinerary" && pathname === "/planner");

            return (
              <Link
                key={link.href}
                href={link.href}
                prefetch={true}
                className={`flex items-center gap-1 xl:gap-1.5 px-2 xl:px-3 py-1.5 xl:py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? "bg-emerald-50 text-[#0E8C7F] border border-emerald-200 shadow-2xs font-black"
                    : "text-slate-600 hover:text-slate-950 hover:bg-slate-100/80 font-semibold"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 xl:h-4 xl:w-4 shrink-0 ${isActive ? "text-[#0E8C7F]" : "text-slate-400"}`} />
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
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
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
        <div className="hidden md:flex items-center gap-1.5 xl:gap-2 shrink-0">
          {/* Language Switcher Toggle */}
          <button
            type="button"
            onClick={() => setLanguage(language === "vi" ? "en" : "vi")}
            className="flex items-center gap-1 px-2.5 xl:px-3 py-1.5 xl:py-2 text-xs font-bold rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-all font-display whitespace-nowrap shrink-0 cursor-pointer shadow-2xs hover:border-[#0E8C7F]"
            title={language === "vi" ? "Switch to English" : "Chuyển sang Tiếng Việt"}
          >
            <Globe className="h-3.5 w-3.5 text-[#0E8C7F]" />
            <span className="font-extrabold">{language === "vi" ? "🇬🇧 EN" : "🇻🇳 VI"}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("triton:open-chat"));
              }
            }}
            className="flex items-center gap-1.5 px-3 xl:px-4 py-1.5 xl:py-2 rounded-full text-xs font-extrabold text-slate-950 bg-gradient-to-r from-[#FFD37A] via-[#F0A32F] to-[#D98E20] hover:shadow-md hover:brightness-105 transition-all shadow-xs active:scale-95 font-display whitespace-nowrap shrink-0 cursor-pointer"
            title={language === "vi" ? "Mở Trợ Lý AI Du Lịch Tri Tôn" : "Open Tri Ton AI Travel Assistant"}
          >
            <Bot className="h-3.5 w-3.5 xl:h-4 xl:w-4 text-slate-950 shrink-0" />
            <span>{t("nav.aiAssistant")}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("open-pwa-install"));
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-full border border-emerald-200 transition-colors font-display whitespace-nowrap shrink-0 cursor-pointer"
            title="Cài Đặt Ứng Dụng Du Lịch Tri Tôn Vào Điện Thoại"
          >
            <Smartphone className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
            <span>{language === "vi" ? "Cài App" : "App"}</span>
          </button>

          <Link
            href="/emergency"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-full border border-rose-200 transition-colors font-display whitespace-nowrap shrink-0"
            title={language === "vi" ? "Tổng Đài Hỗ Trợ & Cứu Hộ Khẩn Cấp Bảy Núi" : "Seven Mountains 24/7 Emergency Hotline"}
          >
            <PhoneCall className="h-3.5 w-3.5 text-rose-600 shrink-0" />
            <span className="hidden xl:inline">{language === "vi" ? "Cứu Hộ 24/7" : "SOS 24/7"}</span>
          </Link>
        </div>

        {/* Mobile Action Controls: Language Toggle & Menu Button */}
        <div className="flex md:hidden items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setLanguage(language === "vi" ? "en" : "vi")}
            className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-extrabold rounded-full border border-slate-200 bg-slate-50 text-slate-800 shadow-2xs font-display active:scale-95 transition-transform cursor-pointer"
            title={language === "vi" ? "Switch to English" : "Chuyển sang Tiếng Việt"}
          >
            <Globe className="h-3 w-3 text-[#0E8C7F]" />
            <span>{language === "vi" ? "🇬🇧 EN" : "🇻🇳 VI"}</span>
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-95 transition-transform focus:outline-none shrink-0 border border-slate-200/60 cursor-pointer"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="h-5 w-5 text-slate-900" /> : <Menu className="h-5 w-5 text-slate-800" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white/98 backdrop-blur-2xl px-4 pt-3 pb-6 space-y-2 shadow-xl">
          {/* Language Switcher in Mobile Drawer */}
          <div className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-100 mb-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
              <Globe className="h-4 w-4 text-[#0E8C7F]" />
              {t("common.language")}
            </span>
            <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setLanguage("vi")}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  language === "vi" ? "bg-[#0E8C7F] text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                🇻🇳 VI
              </button>
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  language === "en" ? "bg-[#0E8C7F] text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                🇬🇧 EN
              </button>
            </div>
          </div>

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
              <span>{language === "vi" ? "Cài Đặt App Tri Tôn Ra Màn Hình Chính" : "Install Tri Ton App to Home Screen"}</span>
            </button>

            <Link
              href="/chatbot"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-sm font-display"
            >
              <Bot className="h-4 w-4" />
              <span>{language === "vi" ? "Hỏi Đáp Du Lịch Cùng Trợ Lý AI" : "Ask Tri Ton AI Travel Assistant"}</span>
            </Link>

            <Link
              href="/emergency"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 py-2.5 rounded-2xl text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 font-display"
            >
              <PhoneCall className="h-3.5 w-3.5 text-rose-600 shrink-0" />
              <span>{language === "vi" ? "Tổng Đài Cứu Hộ Bảy Núi: 0296.3874.113" : "24/7 Emergency Hotline: 0296.3874.113"}</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
