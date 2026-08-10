'use client';

import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Zap,
  Activity,
  Database,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Server,
  Layers,
} from 'lucide-react';

interface KeyMetric {
  label: string;
  status: 'active' | 'cooldown';
  cooldownRemainingSec: number;
  totalRequests: number;
  lastUsedAt: number | null;
}

interface MetricsData {
  success: boolean;
  timestamp: string;
  providers: {
    geminiKeysCount: number;
    activePointer: number;
    keys: KeyMetric[];
    groq: { hasKey: boolean; status: string; totalRequests: number };
    openRouter: { hasKey: boolean; status: string; totalRequests: number };
  };
  cache: {
    totalCachedQueries: number;
    totalHits: number;
    quotaSavedPercent: string;
  };
  observability: {
    avgLatencyMs: number;
    uptimeStatus: string;
  };
}

export default function AIMetricsAdminPage() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/admin/ai-metrics');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: MetricsData = await res.json();
      setMetrics(data);
    } catch (err: unknown) {
      setError((err as Error).message || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const timer = setInterval(fetchMetrics, 10000); // auto-refresh every 10s
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Cpu className="w-7 h-7 text-emerald-600" />
            Bảng Điều Khiển Sức Khỏe AI Engine & Quota Balancer
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Giám sát thời gian thực trạng thái 6 API Key, Bộ ngắt mạch Circuit Breaker, và Bộ nhớ đệm Semantic Cache.
          </p>
        </div>

        <button
          onClick={fetchMetrics}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-sm transition-colors shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Làm mới chỉ số
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>Lỗi tải chỉ số: {error}</span>
        </div>
      )}

      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Trạng Thái Hệ Thống</span>
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-xl font-bold text-emerald-600">
            {metrics?.observability.uptimeStatus || 'Hoạt động 100%'}
          </div>
          <p className="text-xs text-slate-400">Luân chuyển 4 Tầng Phân Giải</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Độ Trễ Phản Hồi TB</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {metrics?.observability.avgLatencyMs || 0} ms
          </div>
          <p className="text-xs text-slate-400">Tốc độ xử lý bình quân RAG</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Tiết Kiệm API Quota</span>
            <Zap className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-indigo-600">
            {metrics?.cache.quotaSavedPercent || '0%'}
          </div>
          <p className="text-xs text-slate-400">Tỉ lệ Hit Semantic Cache</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Tổng Đã Cache Vector</span>
            <Database className="w-5 h-5 text-sky-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {metrics?.cache.totalCachedQueries || 0}
          </div>
          <p className="text-xs text-slate-400">{metrics?.cache.totalHits || 0} lượt tìm thấy trùng</p>
        </div>
      </div>

      {/* Gemini Keys Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            Trạng Thái Bộ API Keys Google Gemini (Round-Robin Balancer)
          </h2>
          <span className="text-xs font-medium px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
            Con trỏ hiện tại: Key {((metrics?.providers.activePointer || 0) % 4) + 1}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics?.providers.keys.map((k, idx) => {
            const isActive = k.status === 'active';
            const isCurrent = idx === (metrics?.providers.activePointer || 0) % 4;

            return (
              <div
                key={k.label}
                className={`p-4 rounded-xl border transition-all ${
                  isCurrent
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/30'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-slate-800 text-sm flex items-center gap-1.5">
                    {k.label.toUpperCase().replace('_', ' ')}
                    {isCurrent && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    )}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                      isActive
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {isActive ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" /> Sẵn sàng
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-3 h-3" /> Cooldown ({k.cooldownRemainingSec}s)
                      </>
                    )}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Tổng request đã xử lý:</span>
                    <span className="font-bold text-slate-900">{k.totalRequests}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Lần cuối sử dụng:</span>
                    <span>
                      {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleTimeString() : 'Chưa sử dụng'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Secondary Providers Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Server className="w-5 h-5 text-indigo-600" />
              Groq API (Llama 3.3 70B - 300tok/s)
            </h3>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                metrics?.providers.groq.status === 'active'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {metrics?.providers.groq.status === 'active' ? 'Active' : 'Cooldown'}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Dự phòng Tầng 2: Tự động kích hoạt khi cả 4 Key Gemini bận hoặc vượt ngưỡng Quota.
          </p>
          <div className="text-sm font-semibold text-slate-700">
            Lượt xử lý dự phòng: <span className="text-indigo-600 font-bold">{metrics?.providers.groq.totalRequests || 0}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-sky-600" />
              OpenRouter Free Models (Zero-Downtime Guard)
            </h3>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                metrics?.providers.openRouter.status === 'active'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {metrics?.providers.openRouter.status === 'active' ? 'Active' : 'Cooldown'}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Dự phòng Tầng 3: Lớp giáp bảo vệ cuối cùng đảm bảo AI phản hồi 24/7.
          </p>
          <div className="text-sm font-semibold text-slate-700">
            Lượt xử lý dự phòng: <span className="text-sky-600 font-bold">{metrics?.providers.openRouter.totalRequests || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
