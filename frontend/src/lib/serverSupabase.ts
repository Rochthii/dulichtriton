import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Server-Side Supabase Client Factory (Fail-Closed)
 * Strictly requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
 * Never falls back to anon key or placeholder credentials.
 * If either URL or SERVICE_ROLE_KEY is missing, returns null (fail-closed).
 */
export function getSupabaseServerClient(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!supabaseUrl || !serviceRoleKey || serviceRoleKey === 'placeholder' || supabaseUrl.includes('placeholder')) {
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Requires a valid service_role client.
 * Throws an explicit error if missing to fail-closed immediately.
 */
export function requireSupabaseServerClient(): SupabaseClient {
  const client = getSupabaseServerClient();
  if (!client) {
    throw new Error('Supabase service_role configuration missing or invalid (fail-closed).');
  }
  return client;
}

/**
 * Server-Side Anonymous Supabase Client (For explicitly unauthenticated public queries only)
 * Strictly uses NEXT_PUBLIC_SUPABASE_ANON_KEY.
 * Never elevates to service role.
 */
export function getSupabaseAnonServerClient(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!supabaseUrl || !anonKey || anonKey === 'placeholder' || supabaseUrl.includes('placeholder')) {
    return null;
  }

  return createClient(supabaseUrl, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
