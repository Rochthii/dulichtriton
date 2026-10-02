/**
 * @file chatSessionCleanupService.ts
 * @description Dịch vụ thực thi dọn dẹp các phiên trò chuyện hết hạn (Chat Sessions Cleanup Service).
 * Tuân thủ Decision Record G3 (DR-G3-RETENTION-SESSIONS-001) và nhiệm vụ P05-003.
 * 
 * Phê duyệt: Chăm Rốch Thi (Lead Technical Architect)
 */

import { timingSafeEqual } from 'crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import { 
  CHAT_SESSION_RETENTION_HOURS, 
  CHAT_SESSION_RETENTION_MS 
} from './chatSessionRetentionPolicy';

export interface CleanupExecutionOptions {
  supabaseClient?: SupabaseClient | null;
  batchLimit?: number;
  customCutoffDate?: Date;
}

export interface CleanupResult {
  success: boolean;
  deletedCount: number;
  batchLimit: number;
  cutoffTime: string;
  retentionHours: number;
  executionTimeMs: number;
  methodUsed: 'database_rpc' | 'server_query_fallback';
  error?: string;
}

/**
 * Xác thực mã bí mật Authorization cho Cron Job (timing-safe).
 * 
 * @param providedHeader Header Authorization từ request (ví dụ: 'Bearer secret_xyz' hoặc chuỗi raw secret)
 * @param expectedSecret Giá trị biến môi trường CRON_SECRET được cấu hình
 */
export function verifyCleanupAuthorization(
  providedHeader?: string | null,
  expectedSecret?: string | null
): boolean {
  if (!expectedSecret || expectedSecret.trim().length === 0) {
    // Fail-closed: Nếu máy chủ chưa cấu hình CRON_SECRET thì từ chối mọi yêu cầu
    return false;
  }

  if (!providedHeader || providedHeader.trim().length === 0) {
    return false;
  }

  let token = providedHeader.trim();
  if (token.toLowerCase().startsWith('bearer ')) {
    token = token.slice(7).trim();
  }

  const tokenBuffer = Buffer.from(token);
  const secretBuffer = Buffer.from(expectedSecret.trim());

  if (tokenBuffer.length !== secretBuffer.length) {
    return false;
  }

  return timingSafeEqual(tokenBuffer, secretBuffer);
}

/**
 * Thực thi dọn dẹp theo lô các phiên trò chuyện hết hạn (> 24 giờ kể từ updated_at).
 * 
 * @param options Tùy chọn thực thi (client, batch limit, custom cutoff)
 * @returns Kết quả thực thi chi tiết
 */
export async function executeChatSessionCleanup(
  options: CleanupExecutionOptions = {}
): Promise<CleanupResult> {
  const startTime = Date.now();
  const batchLimit = Math.max(1, Math.min(options.batchLimit ?? 1000, 5000));
  
  const cutoffDate = options.customCutoffDate ?? new Date(Date.now() - CHAT_SESSION_RETENTION_MS);
  const cutoffIso = cutoffDate.toISOString();

  const supabase = options.supabaseClient;
  if (!supabase) {
    return {
      success: false,
      deletedCount: 0,
      batchLimit,
      cutoffTime: cutoffIso,
      retentionHours: CHAT_SESSION_RETENTION_HOURS,
      executionTimeMs: Date.now() - startTime,
      methodUsed: 'database_rpc',
      error: 'Supabase server client không khả dụng hoặc chưa được cấu hình service_role.'
    };
  }

  // 1. Thử gọi RPC database function chính thức: cleanup_expired_chat_sessions
  try {
    const { data, error } = await supabase.rpc('cleanup_expired_chat_sessions', {
      p_batch_limit: batchLimit
    });

    if (!error && typeof data === 'number') {
      return {
        success: true,
        deletedCount: data,
        batchLimit,
        cutoffTime: cutoffIso,
        retentionHours: CHAT_SESSION_RETENTION_HOURS,
        executionTimeMs: Date.now() - startTime,
        methodUsed: 'database_rpc'
      };
    }
  } catch {
    // Nếu RPC chưa được nạp trên DB hoặc gặp lỗi kết nối RPC, chuyển sang phương án fallback an toàn
  }

  // 2. Phương án Fallback trực tiếp qua Service Role PostgREST Client
  try {
    // Bước 2a: Tìm các session_id ứng viên thỏa mãn điều kiện hết hạn
    const { data: candidates, error: selectErr } = await supabase
      .from('chat_sessions')
      .select('session_id')
      .lt('updated_at', cutoffIso)
      .order('updated_at', { ascending: true })
      .limit(batchLimit);

    if (selectErr) {
      return {
        success: false,
        deletedCount: 0,
        batchLimit,
        cutoffTime: cutoffIso,
        retentionHours: CHAT_SESSION_RETENTION_HOURS,
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
        retentionHours: CHAT_SESSION_RETENTION_HOURS,
        executionTimeMs: Date.now() - startTime,
        methodUsed: 'server_query_fallback'
      };
    }

    const sessionIdsToDelete = candidates.map((row) => (row as { session_id: string }).session_id);

    // Bước 2b: Xóa chính xác danh sách ID đã chọn
    const { data: deletedRows, error: deleteErr } = await supabase
      .from('chat_sessions')
      .delete()
      .in('session_id', sessionIdsToDelete)
      .select('session_id');

    if (deleteErr) {
      return {
        success: false,
        deletedCount: 0,
        batchLimit,
        cutoffTime: cutoffIso,
        retentionHours: CHAT_SESSION_RETENTION_HOURS,
        executionTimeMs: Date.now() - startTime,
        methodUsed: 'server_query_fallback',
        error: deleteErr.message
      };
    }

    const actualCount = deletedRows ? deletedRows.length : sessionIdsToDelete.length;

    return {
      success: true,
      deletedCount: actualCount,
      batchLimit,
      cutoffTime: cutoffIso,
      retentionHours: CHAT_SESSION_RETENTION_HOURS,
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
      retentionHours: CHAT_SESSION_RETENTION_HOURS,
      executionTimeMs: Date.now() - startTime,
      methodUsed: 'server_query_fallback',
      error: errorMsg
    };
  }
}
