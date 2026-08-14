"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Utensils, Bot, Map } from "lucide-react";

export default function MobileBottomNav() {
  const pathname = usePathname();

  // Hide on admin routes or full-screen immersive map
  if (pathname?.startsWith("/admin")) {
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
      className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] sm:hidden transition-all duration-300"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all active:scale-95 select-none ${
                item.isActive
                  ? "text-[#1B4D3E]"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <div
                className={`relative flex items-center justify-center px-3.5 py-1 rounded-2xl transition-all ${
                  item.isActive
                    ? "bg-emerald-100/80 text-[#1B4D3E] shadow-xs scale-105"
                    : "text-slate-500"
                }`}
              >
                <Icon className={`w-5 h-5 ${item.isActive ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
              </div>
              <span
                className={`text-[10px] tracking-tight mt-0.5 ${
                  item.isActive ? "font-extrabold text-[#1B4D3E]" : "font-medium"
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
