'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) {
      setChecking(false);
      return;
    }

    // Verify authentication status
    fetch('/api/v1/admin/auth/me')
      .then(res => res.json())
      .then(data => {
        if (!data.authenticated) {
          router.replace('/admin/login');
        } else {
          setChecking(false);
        }
      })
      .catch(() => {
        router.replace('/admin/login');
      });
  }, [pathname, isLoginPage, router]);

  // If on login page, render full-screen login layout
  if (isLoginPage) {
    return <>{children}</>;
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center text-xs font-bold font-mono">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
          <span>Xác thực quyền Quản trị Tri Tôn...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans antialiased">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-xs sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-bold text-slate-800">Production Control Center (Supabase Real Engine)</span>
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Hệ thống Quản trị Du Lịch Tri Tôn AI • An Giang
          </div>
        </header>

        <main className="p-6 md:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
