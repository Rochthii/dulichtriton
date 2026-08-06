import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ShieldCheck, Video, Database, ListOrdered } from 'lucide-react';

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0F172A] text-slate-100">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-slate-800 rounded-2xl p-10 border border-slate-700 text-center">
          <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-white">Admin Control Center & Audit Logs Dashboard (Màn hình 13)</h1>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-2">
            Khung thư mục `src/app/admin/` đã khởi tạo. Quản trị 106 bản ghi Master, Duyệt Video TikTok Shorts & Quản lý Audit Trail bất biến.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
