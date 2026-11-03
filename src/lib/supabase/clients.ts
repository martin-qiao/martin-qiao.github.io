import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { readServerEnv } from "@/lib/env";

function required(name: string): string | null {
  return readServerEnv(name) || null;
}

function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const timeout = AbortSignal.timeout(8000);
  const signal = init?.signal ? AbortSignal.any([init.signal, timeout]) : timeout;
  return fetch(input, { ...init, signal });
}

function create(key: string | null): SupabaseClient | null {
  const url = required("SUPABASE_URL");
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: fetchWithTimeout },
  });
}

/** Anon client for published reads. Never sent to the browser. */
export function createAnonClient(): SupabaseClient | null {
  return create(required("SUPABASE_ANON_KEY"));
}

/** Service-role client. Server only. Bypasses RLS for admin writes. */
export function createServiceClient(): SupabaseClient | null {
  return create(required("SUPABASE_SERVICE_ROLE_KEY"));
}
