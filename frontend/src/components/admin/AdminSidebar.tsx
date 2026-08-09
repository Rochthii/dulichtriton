'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Video,
  MessageSquareCode,
  MapPin,
  ShieldCheck,
  ArrowLeft,
  Activity,
  FileCheck,
} from 'lucide-react';

export default function AdminSidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      href: '/admin',
      label: 'Tổng Quan Hệ Thống',
      icon: LayoutDashboard,
      badge: 'Real-time',
    },
    {
      href: '/admin/videos',
      label: 'Quản Lý Video TikTok',
      icon: Video,
      badge: 'Live',
    },
    {
      href: '/admin/chat-logs',
      label: 'AI Chat Logs & RAG',
      icon: MessageSquareCode,
      badge: 'Observability',
    },
    {
      href: '/admin/places',
      label: 'Master Data 95 POI',
      icon: MapPin,
      badge: 'Master',
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col shrink-0 border-r border-slate-800 min-h-screen">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#D99B26] flex items-center justify-center text-slate-950 font-black shadow-md">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="font-heading font-extrabold text-sm text-white tracking-tight">
              Du Lịch Tri Tôn
            </div>
            <div className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Admin Production
            </div>
          </div>
        </div>
      </div>

      {/* Nav Section */}
      <nav className="p-4 space-y-1.5 flex-1">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-2">
          Menu Quản Trị
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-[#1B4D3E] text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                    isActive ? 'bg-amber-400/20 text-amber-300' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Return Link */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white px-3 py-2 rounded-xl hover:bg-slate-800 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Trở về Trang Chủ Portal</span>
        </Link>
      </div>
    </aside>
  );
}
