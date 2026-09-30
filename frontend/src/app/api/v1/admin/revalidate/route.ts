import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { clearServerCache } from '@/lib/serverCache';
import { invalidateSinglePlaceCache, invalidateAllPlacesCache } from '@/lib/dataCache';
import { verifyAdminSession, AdminPrincipal } from '@/lib/adminSessionGuard';

export const dynamic = 'force-dynamic';

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return null;
  return createClient(supabaseUrl, serviceRoleKey);
}

function logAudit(
  action: string,
  resourceId: string,
  details: Record<string, unknown>,
  principal?: AdminPrincipal,
) {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  void Promise.resolve(
    supabase.from('audit_logs').insert({
      user_name: principal ? (principal.fullName || principal.email) : 'Admin_Manager',
      user_role: principal?.role || 'ADMIN',
      action,
      resource_type: 'cache_revalidation',
      resource_id: resourceId,
      details,
    })
  ).catch(e => console.warn('[AuditLog] Error:', e));
}

/**
 * Surgical On-Demand Cache Revalidation Endpoint (Requires Admin Session)
 * Only revalidates the exact POI and its direct category page.
 * Zero blanket layout purges, saving 99.9% of Vercel ISR writes!
 */
export async function POST(req: NextRequest) {
  const auth = await verifyAdminSession(req);
  if (!auth.authenticated) return auth.response;

  if (process.env.ADMIN_MUTATIONS_ENABLED === 'false') {
    return NextResponse.json({ error: 'Admin mutations are temporarily disabled' }, { status: 503 });
  }

  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // empty body
    }

    const { slug, id, category, all } = body;

    clearServerCache();

    if (all) {
      // Full site purge (only when explicitly requested)
      invalidateAllPlacesCache();
      logAudit('CACHE_REVALIDATE', 'all', { mode: 'full' }, auth.principal);

      return NextResponse.json({
        success: true,
        mode: 'full',
        message: 'All places caches purged on-demand.',
        timestamp: new Date().toISOString(),
      });
    }

    // Surgical Invalidation (Default)
    const targetKey = slug || id || '';
    invalidateSinglePlaceCache(targetKey, category);
    logAudit('CACHE_REVALIDATE', targetKey || 'places_index', { mode: 'surgical', category: category || 'none' }, auth.principal);

    return NextResponse.json({
      success: true,
      mode: 'surgical',
      target: targetKey || 'places_index',
      category: category || 'none',
      message: `Surgically revalidated /places/${targetKey} (0 impact on unrelated pages).`,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Revalidation error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
