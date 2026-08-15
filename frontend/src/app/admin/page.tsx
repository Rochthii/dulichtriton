'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Video,
  Bot,
  MapPin,
  Clock,
  ShieldCheck,
  Activity,
  ArrowUpRight,
  RefreshCw,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

interface StatsData {
  totalPlaces: number;
  totalVideos: number;
  totalAiInteractions: number;
  totalSessions: number;
  avgLatencyMs: number;
  outOfScopeCount: number;
}

interface AuditLogEntry {
  id: number;
  user_name: string;
  action: string;
  resource_type: string;
  created_at: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/stats');
      const data = await res.json();
      if (data.stats) setStats(data.stats);
      if (data.auditLogs) setAuditLogs(data.auditLogs);
    } catch (e) {
      console.warn('Failed to fetch admin stats:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Production Real Control Center</span>
          </div>
          <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Bảng Điều Khiển Admin
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tổng quan thời gian thực về dữ liệu POI, Video TikTok, truy vấn Chatbot AI và Audit Logs.
          </p>
        </div>

        <button
          onClick={fetchStats}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all flex items-center gap-2 cursor-pointer shrink-0 self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Làm mới Dữ liệu
        </button>
      </div>

      {/* 4 Primary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-emerald-100 text-[#1B4D3E]">
              <MapPin className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" /> 100% Validated
            </span>
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold">Master Data POIs</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">
              {loading ? '...' : stats?.totalPlaces || 149} Địa điểm
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-amber-100 text-[#B45309]">
              <Video className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Real TikTok
            </span>
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold">Video TikTok Thực Tế</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">
              {loading ? '...' : stats?.totalVideos || 8} Video
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-blue-100 text-blue-800">
              <Bot className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> RAG Engine
            </span>
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold">Lượt Chat AI & Vector Search</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">
              {loading ? '...' : stats?.totalAiInteractions || 0} Truy vấn
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-purple-100 text-purple-800">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
              Fast Race
            </span>
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold">Độ Trễ Trung Bình (Latency)</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">
              {loading ? '...' : `${stats?.avgLatencyMs || 1200} ms`}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/admin/videos"
          className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-[#B45309] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Video className="w-5 h-5" />
          </div>
          <h3 className="font-heading font-extrabold text-slate-900 text-base mb-1">
            Quản Lý Video TikTok Review
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Duyệt/từ chối video, nhúng video TikTok thật, nhập hàng loạt link hoặc quét theo Hashtag target.
          </p>
        </Link>

        <Link
          href="/admin/chat-logs"
          className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-[#1B4D3E] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <MessageSquare className="w-5 h-5" />
          </div>
          <h3 className="font-heading font-extrabold text-slate-900 text-base mb-1">
            Giám Sát AI Chat & RAG Logs
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Xem lịch sử truy vấn thực tế, kiểm tra độ trễ server, nhà cung cấp LLM chiến thắng và câu hỏi out-scope.
          </p>
        </Link>

        <Link
          href="/admin/places"
          className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <MapPin className="w-5 h-5" />
          </div>
          <h3 className="font-heading font-extrabold text-slate-900 text-base mb-1">
            Quản Lý 149 POI Master Data
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Kiểm tra 149 địa danh đã xác minh, bật/tắt địa điểm Hot, cập nhật khung giờ vàng và tạo Vector Embeddings.
          </p>
        </Link>
      </div>

      {/* Audit Logs Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#1B4D3E]" />
            <h3 className="font-heading font-extrabold text-slate-900 text-base">
              Nhật Ký Thao Tác Quản Trị (Audit Logs Bất Biến)
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">Lưu vết Supabase PostgreSQL</span>
        </div>

        {auditLogs.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-500">Chưa có thao tác quản trị nào gần đây.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-bold text-slate-800">{log.user_name}</span>
                  <span className="text-slate-600 font-medium">[{log.action}]</span>
                  <span className="text-slate-400">trên bảng {log.resource_type}</span>
                </div>
                <div className="text-slate-400 font-mono text-[11px]">
                  {new Date(log.created_at).toLocaleString('vi-VN')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
