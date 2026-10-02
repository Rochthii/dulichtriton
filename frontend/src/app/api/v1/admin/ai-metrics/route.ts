import { NextRequest, NextResponse } from 'next/server';
import { getAIProviderMetrics } from '@/lib/aiProvider';
import { verifyAdminSession } from '@/lib/adminSessionGuard';
import { requireSupabaseServerClient } from '@/lib/serverSupabase';
import {
  calculateChatLatencyMetrics,
  calculateChatProviderFallbackMetrics,
  calculateChatRetrievalZeroResultMetrics,
} from '@/lib/chatAuditLatencyHelper';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAdminSession(req);
    if (!auth.authenticated) return auth.response;

    const supabase = requireSupabaseServerClient();

    // 1. Get memory metrics from Centralized AI Provider
    const providerMetrics = getAIProviderMetrics();

    // 2. Fetch Semantic Cache statistics from Supabase
    let cacheStats = {
      totalCachedQueries: 0,
      totalHits: 0,
      quotaSavedPercent: '0%',
    };

    try {
      const { data, count } = await supabase
        .from('semantic_chat_cache')
        .select('hit_count', { count: 'exact' });

      if (data) {
        const totalCached = count || data.length;
        const totalHits = data.reduce((acc, row) => acc + (row.hit_count || 1), 0);
        const savedPercent = totalHits > 0 ? ((totalHits - totalCached) / totalHits * 100).toFixed(1) + '%' : '0%';
        cacheStats = {
          totalCachedQueries: totalCached,
          totalHits,
          quotaSavedPercent: savedPercent,
        };
      }
    } catch {
      /* table might not exist yet */
    }

    // 3. Calculate latency metrics from the latest persisted chat log samples
    let latencyMetrics = calculateChatLatencyMetrics([]);
    let providerFallbackMetrics = calculateChatProviderFallbackMetrics([]);
    let retrievalZeroResultMetrics = calculateChatRetrievalZeroResultMetrics([]);
    try {
      const { data: logs } = await supabase
        .from('chat_logs')
        .select('latency_ms, provider_fallback, retrieval_zero_result')
        .order('id', { ascending: false })
        .limit(50);

      latencyMetrics = calculateChatLatencyMetrics((logs || []).map((log) => log.latency_ms));
      providerFallbackMetrics = calculateChatProviderFallbackMetrics((logs || []).map((log) => log.provider_fallback));
      retrievalZeroResultMetrics = calculateChatRetrievalZeroResultMetrics((logs || []).map((log) => log.retrieval_zero_result));
    } catch {
      /* ignore */
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      providers: providerMetrics,
      cache: cacheStats,
      observability: {
        ...latencyMetrics,
        ...providerFallbackMetrics,
        ...retrievalZeroResultMetrics,
        uptimeStatus: '100% Operational',
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
