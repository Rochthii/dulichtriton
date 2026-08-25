'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Zap, RefreshCw, Check, Globe } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [isRevalidating, setIsRevalidating] = useState(false);
  const [revalidateToast, setRevalidateToast] = useState(false);

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) {
      setChecking(false);
      return;
    }

    // Verify authentication status
    fetch('/api/v1/admin/auth/me')
      .then((res) => res.json())
      .then((data) => {
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

  const handleRevalidateCache = async () => {
    setIsRevalidating(true);
    try {
      await fetch('/api/v1/admin/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tag: 'places' }),
      });
      setRevalidateToast(true);
      setTimeout(() => setRevalidateToast(false), 3000);
    } catch (e) {
      console.warn('Revalidate error:', e);
    } finally {
      setIsRevalidating(false);
    }
  };

  // If on login page, render full-screen login layout
  if (isLoginPage) {
    return <>{children}</>;
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center text-xs font-bold font-mono">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
          <span>Đang xác thực quyền Quản trị Tri Tôn...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#FAF3E7] font-body text-[#26221B] antialiased">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="bg-[#FFFDF7] border-b border-[#26221B]/10 px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-2xs sticky top-0 z-30 font-body">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Supabase Engine Realtime</span>
            </span>

            <span className="text-xs text-[#6B6355] hidden md:inline font-display font-medium">
              Trung Tâm Điều Hành Dữ Liệu Du Lịch Tri Tôn
            </span>
          </div>

          <div className="flex items-center gap-2 font-display">
            {revalidateToast && (
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-600" />
                <span>Đã xóa & làm mới CDN cache!</span>
              </span>
            )}

            <button
              onClick={handleRevalidateCache}
              disabled={isRevalidating}
              className="px-3 py-1.5 rounded-xl bg-[#FAF3E7] hover:bg-[#EBE1D0] text-[#26221B] border border-[#26221B]/10 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Làm mới ISR Cache toàn trang web"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRevalidating ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isRevalidating ? 'Đang làm mới...' : 'Xóa & Revalidate Cache'}</span>
            </button>
          </div>
        </header>

        <main className="p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
