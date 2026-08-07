"use client";

import { useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Users,
  Bot,
  AlertTriangle,
  FileText,
  Bell,
  ArrowUpRight,
  ShieldCheck,
  Activity,
  ChevronRight
} from "lucide-react";

export default function AdminPage() {
  const metrics = [
    {
      title: "Total Visits",
      value: "124,592",
      change: "+12%",
      icon: TrendingUp,
      bgColor: "bg-emerald-50 text-emerald-700"
    },
    {
      title: "New Partners",
      value: "48",
      change: "+5%",
      icon: Users,
      bgColor: "bg-amber-50 text-amber-700"
    },
    {
      title: "AI Interactions",
      value: "8,932",
      change: "+24%",
      icon: Bot,
      bgColor: "bg-blue-50 text-blue-700"
    },
    {
      title: "System Errors",
      value: "3",
      change: "0%",
      icon: AlertTriangle,
      bgColor: "bg-rose-50 text-rose-700"
    }
  ];

  const auditLogs = [
    {
      user: "Admin_Tuan",
      action: "cập nhật thông tin Hồ Tà Pạ (Xã Núi Tô)",
      time: "10 phút trước"
    },
    {
      user: "System_RAG",
      action: "đồng bộ Vector Embeddings 82 địa điểm",
      time: "45 phút trước"
    },
    {
      user: "Partner_AnGiang",
      action: "đăng ký mới thông tin Homestay Soài Chek",
      time: "2 giờ trước"
    }
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background font-body-base text-on-surface antialiased">
      <main className="mx-auto w-full max-w-container-max flex-grow flex-col gap-section-gap px-margin-mobile py-8 md:px-margin-desktop md:py-12">
        
        {/* Admin Header */}
        <header className="mb-8 border-b border-outline-variant/30 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
              <ShieldCheck className="h-4 w-4" />
              <span>Production Control Center</span>
            </div>
            <h1 className="font-display-lg text-display-lg-mobile text-primary md:text-display-lg font-bold">
              Admin Dashboard
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              System overview and AI interaction metrics for Tri Ton Tourism.
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-full text-xs font-bold shadow-sm hover:bg-slate-800 transition-all self-start sm:self-auto">
            <Bell className="h-4 w-4 text-amber-400" />
            <span>Thông báo hệ thống</span>
          </button>
        </header>

        {/* 4 Metric Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {metrics.map((m, idx) => {
            const Icon = m.icon;
            return (
              <div
                key={idx}
                className="bg-surface rounded-2xl p-6 border border-outline-variant/20 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-xl ${m.bgColor}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded font-badge-tag text-xs font-bold flex items-center gap-1">
                    <ArrowUpRight className="h-3.5 w-3.5" /> {m.change}
                  </span>
                </div>
                <div>
                  <h3 className="font-body-sm text-xs text-on-surface-variant mb-1 font-semibold">
                    {m.title}
                  </h3>
                  <p className="font-headline-md text-2xl font-bold text-on-surface">
                    {m.value}
                  </p>
                </div>
              </div>
            );
          })}
        </section>

        {/* Main Admin Content: Growth Chart & Audit Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Chart Section */}
          <section className="lg:col-span-2 bg-surface rounded-2xl p-6 border border-outline-variant/20 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-headline-md text-xl font-bold text-on-surface flex items-center gap-2">
                <Activity className="h-5 w-5 text-emerald-700" />
                Tourism Growth (Tri Tôn)
              </h2>
              <select className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-xs font-semibold text-slate-700 focus:outline-none">
                <option>7 Ngày qua</option>
                <option>30 Ngày qua</option>
                <option>Năm nay</option>
              </select>
            </div>
            <div className="h-64 w-full bg-slate-50 rounded-xl flex items-end justify-between p-6 border border-slate-200/60 gap-3">
              <div className="w-full bg-emerald-300 rounded-t-lg h-[40%]" />
              <div className="w-full bg-emerald-400 rounded-t-lg h-[55%]" />
              <div className="w-full bg-emerald-300 rounded-t-lg h-[35%]" />
              <div className="w-full bg-emerald-500 rounded-t-lg h-[70%]" />
              <div className="w-full bg-emerald-600 rounded-t-lg h-[60%]" />
              <div className="w-full bg-emerald-800 rounded-t-lg h-[90%] shadow-md" />
              <div className="w-full bg-emerald-700 rounded-t-lg h-[75%]" />
            </div>
          </section>

          {/* Audit Logs List */}
          <section className="bg-surface rounded-2xl border border-outline-variant/20 shadow-sm flex flex-col">
            <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center">
              <h2 className="font-headline-md text-xl font-bold text-on-surface flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-700" />
                Audit Logs
              </h2>
            </div>
            <div className="p-6 space-y-4 flex-grow">
              {auditLogs.map((log, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>{log.user}</span>
                    <span className="text-[11px] text-slate-400 font-normal">{log.time}</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{log.action}</p>
                </div>
              ))}
            </div>
          </section>

        </div>

      </main>
    </div>
  );
}
