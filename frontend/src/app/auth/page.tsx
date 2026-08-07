"use client";

import { useState } from "react";
import Link from "next/link";
import { User, Store, ShieldCheck, Lock, Mail, ChevronRight } from "lucide-react";

export default function AuthPage() {
  const [role, setRole] = useState("tourist");

  const roles = [
    { id: "tourist", icon: User, label: "Du khách" },
    { id: "partner", icon: Store, label: "Đối tác" },
    { id: "admin", icon: ShieldCheck, label: "Quản trị" },
  ];

  return (
    <div className="bg-slate-100 min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-[480px] overflow-hidden shadow-xl border border-slate-200">
        
        {/* Auth Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <Link href="/" className="font-heading font-extrabold text-xl text-emerald-950">
              Tri Tôn <span className="text-emerald-700">AI Tourism</span>
            </Link>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Đăng nhập để tiếp tục trải nghiệm
            </p>
          </div>
          <Link
            href="/"
            className="p-2 rounded-full hover:bg-slate-200 text-slate-500 transition-colors text-xs font-bold"
          >
            ✕
          </Link>
        </div>

        {/* Auth Body */}
        <div className="p-8 space-y-6">
          
          {/* Select Role */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Chọn vai trò của bạn
            </label>
            <div className="grid grid-cols-3 gap-3">
              {roles.map((r) => {
                const Icon = r.icon;
                const active = role === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => setRole(r.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-bold transition-all ${
                      active
                        ? "border-emerald-700 bg-emerald-50 text-emerald-900 shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <Icon className={`h-5 w-5 mb-1 ${active ? "text-emerald-700" : "text-slate-400"}`} />
                    {r.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Email hoặc Tên đăng nhập</label>
              <div className="relative flex items-center">
                <Mail className="h-4 w-4 text-slate-400 absolute left-3.5" />
                <input
                  type="email"
                  placeholder="admin@triton.gov.vn..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-700"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Mật khẩu</label>
              <div className="relative flex items-center">
                <Lock className="h-4 w-4 text-slate-400 absolute left-3.5" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-700"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Đăng Nhập ({role.toUpperCase()})</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
