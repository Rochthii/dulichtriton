'use client';

import React from 'react';
import { ShieldCheck, MapPin, Clock, ArrowUpRight } from 'lucide-react';

interface CommuneStat {
  name: string;
  count: number;
}

interface AuditLogEntry {
  id: number;
  action: string;
  target_table?: string;
  target_id?: string;
  changes?: Record<string, unknown>;
  created_at: string;
}

interface AdminRecentActivityProps {
  topCommunes?: CommuneStat[];
  auditLogs: AuditLogEntry[];
}

export default function AdminRecentActivity({
  topCommunes = [],
  auditLogs = [],
}: AdminRecentActivityProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 font-body">
      {/* 1. Top Communes POIs Distribution */}
      <section className="p-5 sm:p-6 rounded-3xl bg-[#FFFDF7] border border-[#26221B]/8 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#26221B]/8 pb-3 font-display">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#0E8C7F]" />
            <h3 className="font-extrabold text-sm text-[#26221B]">
              Phân Bố 149 Điểm Đến Theo 15 Xã & Thị Trấn
            </h3>
          </div>
        </div>

        <div className="space-y-2.5 text-xs">
          {(topCommunes.length > 0
            ? topCommunes
            : [
                { name: 'Xã Núi Tô', count: 26 },
                { name: 'Thị trấn Tri Tôn', count: 24 },
                { name: 'Xã Châu Lăng', count: 21 },
                { name: 'Xã Cô Tô', count: 18 },
                { name: 'Xã Ô Lâm', count: 15 },
                { name: 'Thị trấn Ba Chúc', count: 14 },
              ]
          ).map((c, idx) => {
            const pct = Math.round((c.count / 149) * 100);
            return (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#26221B]">{c.name}</span>
                  <span className="text-[#6B6355] font-mono">{c.count} POIs ({pct}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#FAF3E7] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#0E8C7F]"
                    style={{ width: `${pct * 3}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. Immutable Audit Logs Stream */}
      <section className="p-5 sm:p-6 rounded-3xl bg-[#FFFDF7] border border-[#26221B]/8 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#26221B]/8 pb-3 font-display">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="font-extrabold text-sm text-[#26221B]">
              Nhật Ký Kiểm Toán Gần Đây (Audit Logs)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            Immutable Trail
          </span>
        </div>

        {auditLogs.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#6B6355]">
            Chưa có ghi nhận nhật ký kiểm toán nào trong phiên này.
          </div>
        ) : (
          <div className="space-y-2 text-xs">
            {auditLogs.slice(0, 5).map((log, lidx) => (
              <div
                key={log.id || lidx}
                className="p-2.5 rounded-xl bg-[#FAF3E7] border border-[#26221B]/6 flex items-center justify-between"
              >
                <div className="space-y-0.5">
                  <span className="font-bold text-[#26221B] font-display block">
                    {log.action} — {log.target_table || 'places'}
                  </span>
                  <span className="text-[10px] text-[#6B6355] font-mono">
                    ID: {log.target_id || 'N/A'}
                  </span>
                </div>
                <span className="text-[10px] text-[#6B6355] font-mono">
                  {log.created_at ? new Date(log.created_at).toLocaleTimeString('vi-VN') : 'Vừa xong'}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
