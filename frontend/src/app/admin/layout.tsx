import React from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';

export const metadata = {
  title: 'Admin Control Center | Du Lịch Tri Tôn AI',
  description: 'Production Control Center & Management Portal for Tri Ton Tourism.',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans antialiased">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-xs sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-bold text-slate-800">Production Mode (Supabase Real Engine)</span>
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
