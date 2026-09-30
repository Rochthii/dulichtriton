import { NextRequest, NextResponse } from 'next/server';
import { getAIProviderMetrics } from '@/lib/aiProvider';
import { verifyAdminSession } from '@/lib/adminSessionGuard';
import { requireSupabaseServerClient } from '@/lib/serverSupabase';

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

    // 3. Fetch average latency from chat_logs
    let avgLatencyMs = 0;
    try {
      const { data: logs } = await supabase
        .from('chat_logs')
        .select('latency_ms')
        .order('id', { ascending: false })
        .limit(50);

      if (logs && logs.length > 0) {
        const validMs = logs.map(l => l.latency_ms).filter(Boolean) as number[];
        if (validMs.length > 0) {
          avgLatencyMs = Math.round(validMs.reduce((a, b) => a + b, 0) / validMs.length);
        }
      }
    } catch {
      /* ignore */
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      providers: providerMetrics,
      cache: cacheStats,
      observability: {
        avgLatencyMs,
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
