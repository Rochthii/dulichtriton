'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, MapPin, Sparkles, PhoneCall } from 'lucide-react';

export default function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Khám Phá',
      href: '/',
      icon: Compass,
      activeColor: 'text-[#1B4D3E]',
    },
    {
      label: 'Bản Đồ GIS',
      href: '/map',
      icon: MapPin,
      activeColor: 'text-[#1B4D3E]',
    },
    {
      label: 'Trợ Lý AI',
      href: '/chatbot',
      icon: Sparkles,
      activeColor: 'text-[#D99B26]',
      isHighlight: true,
    },
    {
      label: 'Cứu Hộ 24/7',
      href: '/emergency',
      icon: PhoneCall,
      activeColor: 'text-rose-600',
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-xl border-t border-slate-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-safe">
      <div className="grid grid-cols-4 items-center h-16 px-1 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 py-1.5 px-1 rounded-xl transition-all touch-manipulation ${
                isActive
                  ? 'scale-105 font-bold'
                  : 'opacity-70 hover:opacity-100 font-medium'
              }`}
            >
              <div
                className={`relative flex items-center justify-center p-1 rounded-xl ${
                  item.isHighlight && isActive
                    ? 'bg-amber-50 border border-amber-200 shadow-xs'
                    : item.isHighlight
                    ? 'bg-amber-50/60'
                    : isActive
                    ? 'bg-emerald-50'
                    : ''
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${
                    isActive ? item.activeColor : 'text-slate-600'
                  }`}
                />
                {item.isHighlight && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#D99B26] animate-ping" />
                )}
              </div>
              <span
                className={`text-[10px] tracking-tight leading-none ${
                  isActive ? 'text-slate-900 font-extrabold' : 'text-slate-600'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
