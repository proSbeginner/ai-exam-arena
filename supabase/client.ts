import { DataSourceConfigError } from '@/server/providers/data-source';

interface SupabaseResponseError {
  message?: string;
  details?: string;
  hint?: string;
  code?: string;
}

function getSupabaseConfig(): { url: string; serviceRoleKey: string } {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, '');
  const serviceRoleKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new DataSourceConfigError('SUPABASE_URL and SUPABASE_SECRET_KEY must be configured.', 'SUPABASE_CONFIG_MISSING');
  }
  return { url, serviceRoleKey };
}

export async function supabaseRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { url, serviceRoleKey } = getSupabaseConfig();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
    cache: 'no-store',
  });
  const body = await response.text();
  const payload = body ? (JSON.parse(body) as T | SupabaseResponseError) : null;
  if (!response.ok) {
    const error = payload as SupabaseResponseError | null;
    throw new Error(error?.message ?? `Supabase request failed with status ${response.status}.`);
  }
  return payload as T;
}

export function supabaseQuery(params: Record<string, string>): string {
  return new URLSearchParams(params).toString();
}
