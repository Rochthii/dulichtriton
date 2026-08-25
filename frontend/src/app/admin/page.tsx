'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, ShieldCheck, Zap } from 'lucide-react';
import AdminMetricCards from '@/components/admin/dashboard/AdminMetricCards';
import AdminQuickActions from '@/components/admin/dashboard/AdminQuickActions';
import AdminRecentActivity from '@/components/admin/dashboard/AdminRecentActivity';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [health, setHealth] = useState<any>(null);
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
    <div className="space-y-6 max-w-7xl mx-auto font-body">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-[#FFFDF7] border border-[#26221B]/10 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#0E8C7F] uppercase tracking-wider font-display">
            <ShieldCheck className="w-4 h-4 text-[#0E8C7F]" />
            <span>Trung Tâm Điều Hành Dữ Liệu Du Lịch Tri Tôn</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#26221B] font-display mt-1">
            Bảng Điều Khiển Quản Trị (Admin Dashboard)
          </h1>
          <p className="text-xs text-[#6B6355] mt-0.5">
            Quản trị các điểm đến, 27 tour lịch trình, cơ sở tri thức AI RAG và giám sát hạ tầng thực địa.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {lastRefreshed && (
            <span className="text-[11px] text-[#6B6355] font-mono hidden sm:inline">
              Cập nhật: {lastRefreshed}
            </span>
          )}
          <button
            onClick={fetchStats}
            disabled={loading}
            className="p-2.5 rounded-2xl bg-[#FAF3E7] hover:bg-[#EBE1D0] text-[#26221B] border border-[#26221B]/10 transition-colors cursor-pointer"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 1. Metric Cards KPIs */}
      <AdminMetricCards stats={stats} />

      {/* 2. Quick Management Actions Grid */}
      <AdminQuickActions />

      {/* 3. Recent Activity & Distribution */}
      <AdminRecentActivity
        topCommunes={stats?.topCommunes || []}
        auditLogs={auditLogs}
      />
    </div>
  );
}
