"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Utensils, Bot, Map } from "lucide-react";

export default function MobileBottomNav() {
  const pathname = usePathname();

  // Hide on admin routes or full-screen chatbot page to avoid double UI
  if (pathname?.startsWith("/admin") || pathname === "/chatbot") {
    return null;
  }

  const navItems = [
    {
      label: "Trang chủ",
      href: "/",
      icon: Home,
      isActive: pathname === "/"
    },
    {
      label: "Khám phá",
      href: "/places",
      icon: Compass,
      isActive: pathname.startsWith("/places")
    },
    {
      label: "Ẩm thực",
      href: "/food",
      icon: Utensils,
      isActive: pathname.startsWith("/food")
    },
    {
      label: "AI Chat",
      href: "/chatbot",
      icon: Bot,
      isActive: pathname.startsWith("/chatbot")
    },
    {
      label: "Bản đồ",
      href: "/map",
      icon: Map,
      isActive: pathname.startsWith("/map")
    }
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 inset-x-0 z-40 bg-[#FAF3E7]/95 backdrop-blur-lg border-t border-[#26221B]/10 shadow-[0_-4px_20px_rgba(38,34,27,0.08)] sm:hidden transition-all duration-300 font-body"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2 relative">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isAI = item.href === "/chatbot";

          if (isAI) {
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.dispatchEvent(new CustomEvent("triton:open-chat"));
                  }
                }}
                className="flex flex-col items-center justify-center -mt-6 select-none group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E8C7F] focus-visible:ring-offset-2 rounded-full"
                title="Hỏi Trợ Lý Du Lịch Tri Tôn AI"
                aria-label="Hỏi Trợ Lý Du Lịch Tri Tôn AI"
              >
                <div className="relative flex items-center justify-center w-13 h-13 rounded-full bg-gradient-to-tr from-[#D98E20] via-[#F0A32F] to-[#FFD37A] text-slate-950 shadow-[0_6px_20px_rgba(240,163,47,0.45)] border-4 border-[#FAF3E7] active:scale-95 transition-transform">
                  <Bot className="w-6 h-6 text-slate-950 stroke-[2.5]" />
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                  </span>
                </div>
                <span className="text-[10px] font-black text-amber-700 font-display mt-0.5 tracking-tight">
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              aria-label={item.label}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all active:scale-95 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E8C7F] rounded-xl ${
                item.isActive
                  ? "text-[#0E8C7F]"
                  : "text-[#6B6355] hover:text-[#26221B]"
              }`}
            >
              <div
                className={`relative flex items-center justify-center px-3 py-1 rounded-2xl transition-all ${
                  item.isActive
                    ? "bg-[#0E8C7F]/15 text-[#0E8C7F] shadow-xs scale-105"
                    : "text-[#6B6355]"
                }`}
              >
                <Icon className={`w-5 h-5 ${item.isActive ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
              </div>
              <span
                className={`text-[10px] tracking-tight mt-0.5 ${
                  item.isActive ? "font-extrabold text-[#0E8C7F]" : "font-medium"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
