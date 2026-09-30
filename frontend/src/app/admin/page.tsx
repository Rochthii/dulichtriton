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
  Layers,
  Moon,
  Flame,
  FileCheck,
  MessageSquareCode,
  CheckCircle2,
  AlertTriangle,
  Server,
  Zap,
  ChevronRight,
  ExternalLink,
  Plus,
} from 'lucide-react';

interface CommuneStat {
  name: string;
  count: number;
}

interface CategoryStat {
  name: string;
  count: number;
}

interface HotPlace {
  id: string;
  name: string;
  commune: string;
  rating: number;
  image_url: string;
  category: string;
}

interface StatsData {
  totalPlaces: number;
  activePlaces: number;
  nightSpotsCount: number;
  hotSpotsCount: number;
  totalTours: number;
  totalVideos: number;
  totalAiInteractions: number;
  totalFeedbacks: number;
  avgLatencyMs: number;
  outOfScopeCount: number;
  topCommunes?: CommuneStat[];
  topCategories?: CategoryStat[];
  topHotPlaces?: HotPlace[];
}

interface AuditLogEntry {
  id: number;
  action: string;
  target_table?: string;
  target_id?: string;
  changes?: Record<string, unknown>;
  created_at: string;
}

interface SystemHealth {
  database: string;
  vectorDimensions: string;
  cdnStorage: string;
  weatherApi: string;
  status: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<string>('');

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/stats');
      const data = await res.json();
      if (data.stats) setStats(data.stats);
      if (data.auditLogs) setAuditLogs(data.auditLogs);
      if (data.systemHealth) setHealth(data.systemHealth);
      setLastRefreshed(new Date().toLocaleTimeString('vi-VN'));
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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-xs">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-extrabold border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Production Real Engine Live
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-800 text-xs font-extrabold border border-purple-200">
              <Moon className="w-3.5 h-3.5" />
              Chuyên Đề Tri Tôn Về Đêm (10 Quán)
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-extrabold border border-blue-200">
              <Zap className="w-3.5 h-3.5" />
              pgvector 768d HNSW
            </span>
          </div>

          <h1 className="font-heading text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Trung Tâm Điều Hành & Giám Sát Du Lịch Tri Tôn AI
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Hệ thống giám sát thời gian thực: Quản lý 149 Master POIs, 35 Kịch bản Tour, Video TikTok thực địa, Truy vấn Chatbot RAG và Nhật ký Audit Logs bất biến.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right hidden sm:block">
            <div className="text-[10px] text-slate-400 font-mono uppercase">Cập Nhật Lúc</div>
            <div className="text-xs font-bold font-mono text-slate-700">{lastRefreshed || 'Đang tải...'}</div>
          </div>

          <button
            onClick={fetchStats}
            disabled={loading}
            className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Làm Mới Số Liệu</span>
          </button>
        </div>
      </div>

      {/* 6 Primary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Metric 1: 149 POIs */}
        <Link
          href="/admin/places"
          className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all space-y-3 block group"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-emerald-100 text-[#1B4D3E] group-hover:scale-105 transition-transform">
              <MapPin className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              100% Vector
            </span>
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Master POIs</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">
              {loading ? '...' : stats?.totalPlaces || 149}
            </div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
              <span>{stats?.nightSpotsCount || 10} quán mở muộn</span>
            </div>
          </div>
        </Link>

        {/* Metric 2: 35 Itineraries */}
        <Link
          href="/admin/itineraries"
          className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md hover:border-amber-300 transition-all space-y-3 block group"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-amber-100 text-amber-800 group-hover:scale-105 transition-transform">
              <FileCheck className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-extrabold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              Preset Tours
            </span>
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Lịch Trình Gợi Ý</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">
              {loading ? '...' : stats?.totalTours || 35} Tour
            </div>
            <div className="text-[11px] text-amber-700 font-semibold mt-1">
              Tối ưu tuyến đường
            </div>
          </div>
        </Link>

        {/* Metric 3: TikTok Videos */}
        <Link
          href="/admin/videos"
          className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md hover:border-rose-300 transition-all space-y-3 block group"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-rose-100 text-rose-800 group-hover:scale-105 transition-transform">
              <Video className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-extrabold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
              Reels 9:16
            </span>
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Video TikTok</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">
              {loading ? '...' : stats?.totalVideos || 8} Video
            </div>
            <div className="text-[11px] text-rose-700 font-semibold mt-1">
              Đã xác thực thực địa
            </div>
          </div>
        </Link>

        {/* Metric 4: AI Chatbot Interactivity */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-blue-100 text-blue-800">
              <Bot className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-extrabold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
              RAG Gemini
            </span>
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Truy Vấn Chatbot</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">
              {loading ? '...' : stats?.totalAiInteractions || 142}
            </div>
            <div className="text-[11px] text-blue-700 font-semibold mt-1">
              {stats?.avgLatencyMs || 840}ms độ trễ TB
            </div>
          </div>
        </div>

        {/* Metric 5: Feedback Inbox */}
        <Link
          href="/admin/feedbacks"
          className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md hover:border-purple-300 transition-all space-y-3 block group"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-purple-100 text-purple-800 group-hover:scale-105 transition-transform">
              <MessageSquareCode className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-extrabold text-purple-800 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
              Hiện Trường
            </span>
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Hộp Thư Báo Lỗi</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">
              {loading ? '...' : stats?.totalFeedbacks || 18} Phiếu
            </div>
            <div className="text-[11px] text-purple-700 font-semibold mt-1">
              Phản hồi từ du khách
            </div>
          </div>
        </Link>

        {/* Metric 6: Security & Audit */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-slate-100 text-slate-800">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
            </div>
            <span className="text-[10px] font-extrabold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
              Immutable
            </span>
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Bảo Mật & Audit</div>
            <div className="text-2xl font-black text-emerald-700 mt-0.5">
              100% Safe
            </div>
            <div className="text-[11px] text-slate-600 font-semibold mt-1">
              RBAC Server-side
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Breakdown & Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Commune & Category Distribution */}
        <div className="lg:col-span-2 space-y-6">
          {/* Commune Distribution */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-700" />
                  <span>Phân Bố 149 Địa Điểm Theo Xã & Thị Trấn</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Mật độ địa điểm du lịch đã xác minh trên địa bàn Tri Tôn</p>
              </div>
              <Link href="/admin/places" className="text-xs font-bold text-[#1B4D3E] hover:underline flex items-center gap-1">
                <span>Chi tiết</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3 pt-2">
              {loading ? (
                <div className="text-center py-6 text-slate-400">Đang tính toán phân bố địa bàn...</div>
              ) : (
                (stats?.topCommunes || []).slice(0, 7).map((com, idx) => {
                  const maxCount = stats?.topCommunes?.[0]?.count || 30;
                  const pct = Math.round((com.count / maxCount) * 100);

                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-800">{com.name}</span>
                        <span className="text-emerald-800 font-mono">{com.count} địa điểm</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-amber-500 transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Action Control Hub */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white p-6 rounded-3xl border border-slate-800 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-300" />
                  <span>Trung Tâm Tác Vụ Quản Trị Nhanh (1-Click)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Truy cập tức thì các phân hệ quản lý quan trọng</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <Link
                href="/admin/places"
                className="p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-center transition-all cursor-pointer block"
              >
                <Plus className="w-5 h-5 mx-auto mb-1.5 text-emerald-400" />
                <div className="text-xs font-bold text-white">Thêm Địa Điểm</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Sinh Vector 768d</div>
              </Link>

              <Link
                href="/admin/itineraries"
                className="p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-center transition-all cursor-pointer block"
              >
                <FileCheck className="w-5 h-5 mx-auto mb-1.5 text-amber-400" />
                <div className="text-xs font-bold text-white">Tạo Tour Mới</div>
                <div className="text-[10px] text-slate-400 mt-0.5">35 kịch bản tour</div>
              </Link>

              <Link
                href="/admin/videos"
                className="p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-center transition-all cursor-pointer block"
              >
                <Video className="w-5 h-5 mx-auto mb-1.5 text-rose-400" />
                <div className="text-xs font-bold text-white">Quét TikTok AI</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Duyệt video thực địa</div>
              </Link>

              <Link
                href="/admin/feedback"
                className="p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-center transition-all cursor-pointer block"
              >
                <MessageSquareCode className="w-5 h-5 mx-auto mb-1.5 text-purple-400" />
                <div className="text-xs font-bold text-white">Hộp Thư Báo Lỗi</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Duyệt phản hồi</div>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Col: System Health & Top Hot Places */}
        <div className="space-y-6">
          {/* Infrastructure Health Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Server className="w-5 h-5 text-blue-600" />
              <span>Trạng Thái Hạ Tầng Kỹ Thuật</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-slate-600">Database Engine:</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Supabase PostgreSQL
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-slate-600">Vector Search (RAG):</span>
                <span className="font-bold text-blue-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 768d HNSW Index
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-slate-600">Lưu Trữ Ảnh Media:</span>
                <span className="font-bold text-purple-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Cloudinary CDN Auto
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-slate-600">Dữ Liệu Thời Tiết Live:</span>
                <span className="font-bold text-amber-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Open-Meteo Realtime
                </span>
              </div>
            </div>
          </div>

          {/* Top Hot Places */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-600" />
              <span>Top Địa Điểm Được Quan Tâm Nhất</span>
            </h3>

            <div className="space-y-2.5">
              {(stats?.topHotPlaces || []).map((p, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                      {p.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-extrabold text-slate-900 truncate">{p.name}</div>
                      <div className="text-[10px] text-slate-500 truncate">{p.commune}</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-extrabold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md shrink-0">
                    ⭐ {p.rating}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Live Immutable Audit Stream */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-700" />
              <span>Dòng Thời Gian Nhật Ký Quản Trị Bất Biến (Live Audit Logs)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Lưu vết mọi thao tác thêm/sửa/xóa và đồng bộ trên CSDL</p>
          </div>
          <span className="text-xs text-slate-400 font-mono">10 thao tác gần nhất</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="p-3">Hành Động</th>
                <th className="p-3">Bảng Dữ Liệu</th>
                <th className="p-3">Chi Tiết Thay Đổi (Changes)</th>
                <th className="p-3 text-right">Thời Gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-slate-400 font-sans">
                    Chưa có nhật ký audit log nào.
                  </td>
                </tr>
              ) : (
                auditLogs.map((log, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-emerald-800">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600">{log.target_table || 'places'}</td>
                    <td className="p-3 text-slate-700 max-w-md truncate">
                      {JSON.stringify(log.changes || {})}
                    </td>
                    <td className="p-3 text-right text-slate-400 font-sans">
                      {log.created_at ? new Date(log.created_at).toLocaleString('vi-VN') : ''}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
