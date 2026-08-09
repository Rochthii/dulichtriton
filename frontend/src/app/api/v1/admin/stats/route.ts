import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://knmlbwsmfljlabhvqfid.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    const [placesRes, videosRes, chatLogsRes, sessionsRes, auditRes] = await Promise.all([
      supabase.from('places').select('id', { count: 'exact', head: true }),
      supabase.from('video_discoveries').select('id', { count: 'exact', head: true }),
      supabase.from('chat_logs').select('id', { count: 'exact', head: true }),
      supabase.from('chat_sessions').select('id', { count: 'exact', head: true }),
      supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(6),
    ]);

    // Average latency calculation from recent chat logs
    const { data: recentLogs } = await supabase
      .from('chat_logs')
      .select('latency_ms, is_out_scope')
      .order('created_at', { ascending: false })
      .limit(50);

    const totalLatency = (recentLogs || []).reduce((acc, curr) => acc + (curr.latency_ms || 0), 0);
    const avgLatencyMs = recentLogs && recentLogs.length > 0 ? Math.round(totalLatency / recentLogs.length) : 1200;
    const outOfScopeCount = (recentLogs || []).filter(l => l.is_out_scope).length;

    return NextResponse.json({
      success: true,
      stats: {
        totalPlaces: placesRes.count || 82,
        totalVideos: videosRes.count || 8,
        totalAiInteractions: chatLogsRes.count || 0,
        totalSessions: sessionsRes.count || 0,
        avgLatencyMs,
        outOfScopeCount,
      },
      auditLogs: auditRes.data || [],
    });
  } catch (error: unknown) {
    console.error('[Admin Stats Error]:', error);
    return NextResponse.json({ error: 'Failed to fetch admin stats' }, { status: 500 });
  }
}
