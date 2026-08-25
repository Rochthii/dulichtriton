'use client';

import React from 'react';
import { X, Database, RefreshCw, FileText } from 'lucide-react';

interface AuditLog {
  id: string;
  user_name: string;
  user_role: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: Record<string, unknown>;
  created_at: string;
}

interface AuditLogsModalProps {
  isOpen?: boolean;
  onClose: () => void;
  logs: AuditLog[];
  loading: boolean;
  onRefresh?: () => void;
}

export const AuditLogsModal: React.FC<AuditLogsModalProps> = ({
  isOpen = true,
  onClose,
  logs,
  loading,
  onRefresh,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in font-body">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-100 max-h-[85vh] flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-700 border border-blue-100">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-base font-display">
                Nhật Ký Kiểm Toán Hệ Thống (Audit Logs)
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Ghi nhận chi tiết mọi thao tác Thêm, Sửa, Xóa và Đồng bộ dữ liệu
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                disabled={loading}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                title="Làm mới nhật ký"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            )}
            <button
              onClick={onClose}
              type="button"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Table */}
        <div className="py-4 overflow-y-auto max-h-[50vh]">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs font-medium">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-300" />
              Đang tải nhật ký kiểm toán...
            </div>
          ) : logs.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs font-medium">
              Chưa có bản ghi kiểm toán nào được tạo.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {logs.map((log) => (
                <div key={log.id} className="py-3 flex items-start justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 font-display">{log.user_name || 'Admin'}</span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono text-[10px]">
                        {log.action}
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px]">
                      Loại tài nguyên: <strong className="text-slate-700">{log.resource_type}</strong>
                      {log.resource_id && ` (ID: ${log.resource_id})`}
                    </p>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono shrink-0">
                    {new Date(log.created_at).toLocaleString('vi-VN')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-4 border-t border-slate-100 font-display">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
