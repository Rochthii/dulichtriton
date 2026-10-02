'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageSquareCode,
  Search,
  Clock,
  Zap,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Cpu,
  Database,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ChatLogRecord {
  id: number;
  session_id: string;
  query: string;
  response_preview: string;
  provider_used: string;
  model_used?: string;
  rag_method: string;
  places_count: number;
  latency_ms: number;
  is_out_scope: boolean;
  created_at: string;
}

export default function AdminChatLogsPage() {
  const [logs, setLogs] = useState<ChatLogRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [outScopeOnly, setOutScopeOnly] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('chat_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (outScopeOnly) {
        query = query.eq('is_out_scope', true);
      }

      const { data, error } = await query;
      if (!error && data) {
        setLogs(data);
      }
    } catch (e) {
      console.warn('Error fetching chat logs:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [outScopeOnly]);

  const filteredLogs = logs.filter(l => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (l.query && l.query.toLowerCase().includes(q)) ||
      (l.session_id && l.session_id.toLowerCase().includes(q)) ||
      (l.provider_used && l.provider_used.toLowerCase().includes(q)) ||
      (l.model_used && l.model_used.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold mb-2">
            <MessageSquareCode className="w-4 h-4" />
            <span>AI Chatbot Observability</span>
          </div>
          <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Giám Sát Chat Logs & RAG Engine
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Lịch sử truy vấn bất biến từ `chat_logs` — theo dõi độ trễ (ms), nhà cung cấp LLM chiến thắng & phản hồi RAG.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all flex items-center gap-2 cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Làm mới Logs
        </button>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3 text-xs font-semibold">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={outScopeOnly}
              onChange={e => setOutScopeOnly(e.target.checked)}
              className="w-4 h-4 rounded-md text-emerald-600 focus:ring-emerald-500 border-slate-300"
            />
            <span className="text-slate-700">Chỉ hiện câu hỏi Out-of-Scope (Bị từ chối)</span>
          </label>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo nội dung câu hỏi, session_id..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="text-center py-12 text-slate-500 text-xs flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" /> Đang tải dữ liệu chat logs từ Supabase...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            Chưa có log truy vấn nào phù hợp với bộ lọc.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Thời gian</th>
                  <th className="py-3.5 px-4">Câu hỏi du khách</th>
                  <th className="py-3.5 px-4">Provider LLM</th>
                  <th className="py-3.5 px-4">RAG Method</th>
                  <th className="py-3.5 px-4">Độ trễ</th>
                  <th className="py-3.5 px-4">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-4 max-w-md">
                      <div className="font-bold text-slate-900">{log.query}</div>
                      {log.response_preview && (
                        <div className="text-[11px] text-slate-500 truncate mt-0.5 max-w-sm">
                          AI: {log.response_preview}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1 items-start">
                        <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded-lg text-[11px] font-bold">
                          <Cpu className="w-3 h-3 text-emerald-600" />
                          {log.provider_used || 'gemini'}
                        </span>
                        {log.model_used && (
                          <span className="text-[10px] text-slate-500 font-mono pl-0.5">
                            {log.model_used}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 px-2.5 py-1 rounded-lg text-[11px] font-bold border border-amber-200/60">
                        <Database className="w-3 h-3 text-amber-600" />
                        {log.rag_method || 'vector'} ({log.places_count || 0} POIs)
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold whitespace-nowrap text-slate-700">
                      <span className="inline-flex items-center gap-1">
                        <Zap className="w-3 h-3 text-amber-500" />
                        {log.latency_ms || 1200} ms
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {log.is_out_scope ? (
                        <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold inline-flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Out-of-Scope
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Tri Tôn Valid
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
