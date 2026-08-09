'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@triton.gov.vn');
  const [password, setPassword] = useState('TriTon2026!Admin');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim() || isLoading) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/v1/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Đăng nhập không thành công!');
      }

      // Redirect to Admin Dashboard
      router.push('/admin');
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi kết nối máy chủ';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Accent Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#1B4D3E]/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-[#D99B26]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-md rounded-3xl p-8 border border-slate-800 shadow-2xl relative z-10 space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#1B4D3E] text-amber-300 flex items-center justify-center mx-auto border border-emerald-500/30 shadow-lg">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="font-heading font-extrabold text-2xl text-white tracking-tight">
            Đăng Nhập Quản Trị Hệ Thống
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Cổng điều khiển & quản lý dữ liệu Du Lịch Tri Tôn AI
          </p>
        </div>

        {/* Credentials Info Badge */}
        <div className="bg-emerald-950/60 border border-emerald-800/60 rounded-2xl p-3.5 text-xs text-emerald-200 space-y-1">
          <div className="font-bold text-amber-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Tài khoản Quản trị Mặc định:
          </div>
          <div className="font-mono text-[11px] text-emerald-300">
            Email: <span className="font-bold text-white">admin@triton.gov.vn</span>
          </div>
          <div className="font-mono text-[11px] text-emerald-300">
            Mật khẩu: <span className="font-bold text-white">TriTon2026!Admin</span>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-rose-950/80 border border-rose-800 text-rose-200 p-3.5 rounded-2xl text-xs flex items-center gap-2.5 font-medium animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Email Quản Trị
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@triton.gov.vn"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Mật Khẩu Quản Trị
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-[#1B4D3E] hover:bg-[#153e32] text-white font-extrabold text-xs transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            <span>{isLoading ? 'Đang xác thực bảo mật...' : 'Đăng Nhập Quản Trị'}</span>
            <ArrowRight className="w-4 h-4 text-amber-300" />
          </button>
        </form>

        {/* Footer link back */}
        <div className="text-center pt-2">
          <Link href="/" className="text-xs text-slate-400 hover:text-white font-medium transition-colors">
            ← Quay lại Trang Chủ Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
