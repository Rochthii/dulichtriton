'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MapPin,
  Compass,
  Brain,
  Video,
  Sparkles,
  MessageSquareHeart,
  Activity,
  BarChart3,
  ArrowLeft,
  ShieldCheck,
  LogOut,
  Layers
} from 'lucide-react';

interface NavGroup {
  groupName: string;
  items: {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    groupName: 'Dữ Liệu Thực Địa',
    items: [
      {
        href: '/admin',
        label: 'Tổng Quan Hệ Thống',
        icon: LayoutDashboard,
        badge: 'Live',
      },
      {
        href: '/admin/places',
        label: 'Quản Lý Điểm Đến',
        icon: MapPin,
        badge: 'Danh Mục Điểm Đến',
      },
      {
        href: '/admin/itineraries',
        label: '27 Tour Lịch Trình',
        icon: Compass,
        badge: '27 Tours',
      },
    ],
  },
  {
    groupName: 'Trí Tuệ Nhân Tạo & Media',
    items: [
      {
        href: '/admin/knowledge-base',
        label: 'Cơ Sở Tri Thức AI',
        icon: Brain,
        badge: 'RAG Brain',
      },
      {
        href: '/admin/videos',
        label: 'Kho Video TikTok',
        icon: Video,
        badge: 'TikTok',
      },
      {
        href: '/admin/stories',
        label: 'Bài Viết & Audio Di Sản',
        icon: Sparkles,
        badge: 'CMS',
      },
    ],
  },
  {
    groupName: 'Cộng Đồng & Đóng Góp',
    items: [
      {
        href: '/admin/feedbacks',
        label: 'Báo Lỗi & Đóng Góp',
        icon: MessageSquareHeart,
        badge: 'Hộp thư',
      },
    ],
  },
  {
    groupName: 'Hạ Tầng & Giám Sát',
    items: [
      {
        href: '/admin/chat-logs',
        label: 'Nhật Ký Chat AI',
        icon: Activity,
        badge: 'Logs',
      },
      {
        href: '/admin/ai-metrics',
        label: 'Chỉ Số AI & Telemetry',
        icon: BarChart3,
        badge: 'Metrics',
      },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await fetch('/api/v1/admin/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors
    } finally {
      window.location.href = '/admin/login';
    }
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col shrink-0 border-r border-slate-800 min-h-screen font-body select-none">
      {/* Brand Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#F0A32F] to-[#D98A1E] flex items-center justify-center text-slate-950 font-black shadow-md">
            <ShieldCheck className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="font-display font-black text-sm text-white tracking-tight">
              Du Lịch Tri Tôn
            </div>
            <div className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Admin Management</span>
            </div>
          </div>
        </div>
      </div>

      {/* Nav Groups */}
      <nav className="p-3.5 space-y-4 flex-1 overflow-y-auto scrollbar-thin">
        {NAV_GROUPS.map((group, gidx) => (
          <div key={gidx} className="space-y-1">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 py-1 font-display">
              {group.groupName}
            </div>

            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#0E8C7F] text-white shadow-md font-bold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold font-mono ${
                        isActive ? 'bg-black/20 text-amber-200' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer Links & Logout */}
      <div className="p-3.5 border-t border-slate-800 space-y-1 font-display">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white px-3 py-2 rounded-xl hover:bg-slate-800 transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Về Cổng Thông Tin</span>
        </Link>

        <button
          onClick={handleLogout}
          type="button"
          className="w-full flex items-center gap-2 text-xs font-semibold text-rose-400 hover:text-rose-300 px-3 py-2 rounded-xl hover:bg-rose-950/40 transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Đăng Xuất Quản Trị</span>
        </button>
      </div>
    </aside>
  );
}
