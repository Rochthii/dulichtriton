/**
 * @file chatLogCleanupService.ts
 * @description Dịch vụ thực thi dọn dẹp các bản ghi nhật ký kiểm toán chat_logs hết hạn (Chat Logs Cleanup Service).
 * Tuân thủ chính sách thời hạn lưu trữ nhật ký kiểm toán (30 ngày) và nhiệm vụ P05-004.
 * 
 * Phê duyệt: Chăm Rốch Thi (Lead Technical Architect)
 */

import type { SupabaseClient } from '@supabase/supabase-js';
export { verifyCleanupAuthorization } from './chatSessionCleanupService';

/**
 * Số ngày lưu trữ tối đa của một bản ghi nhật ký kiểm toán chat_logs (30 ngày / 720 giờ).
 */
export const CHAT_LOG_RETENTION_DAYS = 30;

/**
 * Số mili-giây tương đương với thời hạn lưu trữ nhật ký kiểm toán (2,592,000,000 ms).
 */
export const CHAT_LOG_RETENTION_MS = CHAT_LOG_RETENTION_DAYS * 24 * 60 * 60 * 1000;

/**
 * Mệnh đề SQL INTERVAL chuẩn tắc dùng cho PostgreSQL query và migration.
 */
export const CHAT_LOG_RETENTION_SQL_INTERVAL = "INTERVAL '30 days'";

export interface ChatLogCleanupExecutionOptions {
  supabaseClient?: SupabaseClient | null;
  batchLimit?: number;
  customCutoffDate?: Date;
}

export interface ChatLogCleanupResult {
  success: boolean;
  deletedCount: number;
  batchLimit: number;
  cutoffTime: string;
  retentionDays: number;
  executionTimeMs: number;
  methodUsed: 'database_rpc' | 'server_query_fallback';
  error?: string;
}

/**
 * Kiểm tra xem một mốc thời gian nhật ký kiểm toán (created_at) đã hết hạn hay chưa.
 * 
 * @param createdAt Mốc thời gian tạo bản ghi
 * @param nowReference Thời điểm tham chiếu (mặc định Date.now())
 */
export function isChatLogExpired(
  createdAt: string | number | Date,
  nowReference: number | Date = Date.now()
): boolean {
  if (!createdAt) return true;

  const createdTime = createdAt instanceof Date 
    ? createdAt.getTime() 
    : typeof createdAt === 'string' 
      ? new Date(createdAt).getTime() 
      : createdAt;

  if (Number.isNaN(createdTime)) {
    return true; // Fail-closed
  }

  const nowTime = nowReference instanceof Date ? nowReference.getTime() : nowReference;
  const ageMs = nowTime - createdTime;

  return ageMs >= CHAT_LOG_RETENTION_MS;
}

/**
 * Tính toán thời điểm hết hạn chính xác của một bản ghi nhật ký kiểm toán.
 */
export function calculateChatLogExpirationDate(createdAt: string | number | Date): Date {
  const createdTime = createdAt instanceof Date 
    ? createdAt.getTime() 
    : typeof createdAt === 'string' 
      ? new Date(createdAt).getTime() 
      : createdAt;

  if (Number.isNaN(createdTime)) {
    return new Date(0);
  }

  return new Date(createdTime + CHAT_LOG_RETENTION_MS);
}

/**
 * Thực thi dọn dẹp theo lô các bản ghi nhật ký kiểm toán chat_logs hết hạn (> 30 ngày kể từ created_at).
 * 
 * @param options Tùy chọn thực thi (client, batch limit, custom cutoff)
 * @returns Kết quả thực thi chi tiết
 */
export async function executeChatLogCleanup(
  options: ChatLogCleanupExecutionOptions = {}
): Promise<ChatLogCleanupResult> {
  const startTime = Date.now();
  const batchLimit = Math.max(1, Math.min(options.batchLimit ?? 1000, 5000));
  
  const cutoffDate = options.customCutoffDate ?? new Date(Date.now() - CHAT_LOG_RETENTION_MS);
  const cutoffIso = cutoffDate.toISOString();

  const supabase = options.supabaseClient;
  if (!supabase) {
    return {
      success: false,
      deletedCount: 0,
      batchLimit,
      cutoffTime: cutoffIso,
      retentionDays: CHAT_LOG_RETENTION_DAYS,
      executionTimeMs: Date.now() - startTime,
      methodUsed: 'database_rpc',
      error: 'Supabase server client không khả dụng hoặc chưa được cấu hình service_role.'
    };
  }

  // 1. Thử gọi RPC database function: cleanup_expired_chat_logs
  try {
    const { data, error } = await supabase.rpc('cleanup_expired_chat_logs', {
      p_batch_limit: batchLimit
    });

    if (!error && typeof data === 'number') {
      return {
        success: true,
        deletedCount: data,
        batchLimit,
        cutoffTime: cutoffIso,
        retentionDays: CHAT_LOG_RETENTION_DAYS,
        executionTimeMs: Date.now() - startTime,
        methodUsed: 'database_rpc'
      };
    }
  } catch {
    // Nếu RPC chưa có hoặc gặp lỗi RPC, fallback an toàn sang PostgREST query
  }

  // 2. Phương án Fallback qua Service Role PostgREST Client
  try {
    // Bước 2a: Tìm các ID ứng viên hết hạn
    const { data: candidates, error: selectErr } = await supabase
      .from('chat_logs')
      .select('id')
      .lt('created_at', cutoffIso)
      .order('created_at', { ascending: true })
      .limit(batchLimit);

    if (selectErr) {
      return {
        success: false,
        deletedCount: 0,
        batchLimit,
        cutoffTime: cutoffIso,
        retentionDays: CHAT_LOG_RETENTION_DAYS,
        executionTimeMs: Date.now() - startTime,
        methodUsed: 'server_query_fallback',
        error: selectErr.message
      };
    }

    if (!candidates || candidates.length === 0) {
      return {
        success: true,
        deletedCount: 0,
        batchLimit,
        cutoffTime: cutoffIso,
        retentionDays: CHAT_LOG_RETENTION_DAYS,
        executionTimeMs: Date.now() - startTime,
        methodUsed: 'server_query_fallback'
      };
    }

    const idsToDelete = candidates.map((row) => (row as { id: number | string }).id);

    // Bước 2b: Xóa chính xác danh sách ID đã chọn
    const { data: deletedRows, error: deleteErr } = await supabase
      .from('chat_logs')
      .delete()
      .in('id', idsToDelete)
      .select('id');

    if (deleteErr) {
      return {
        success: false,
        deletedCount: 0,
        batchLimit,
        cutoffTime: cutoffIso,
        retentionDays: CHAT_LOG_RETENTION_DAYS,
        executionTimeMs: Date.now() - startTime,
        methodUsed: 'server_query_fallback',
        error: deleteErr.message
      };
    }

    const actualCount = deletedRows ? deletedRows.length : idsToDelete.length;

    return {
      success: true,
      deletedCount: actualCount,
      batchLimit,
      cutoffTime: cutoffIso,
      retentionDays: CHAT_LOG_RETENTION_DAYS,
      executionTimeMs: Date.now() - startTime,
      methodUsed: 'server_query_fallback'
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      deletedCount: 0,
      batchLimit,
      cutoffTime: cutoffIso,
      retentionDays: CHAT_LOG_RETENTION_DAYS,
      executionTimeMs: Date.now() - startTime,
      methodUsed: 'server_query_fallback',
      error: errorMsg
    };
  }
}
