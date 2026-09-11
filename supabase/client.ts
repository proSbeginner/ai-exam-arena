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

export async function supabaseCount(path: string): Promise<number> {
  const { url, serviceRoleKey } = getSupabaseConfig();
  const response = await fetch(url + '/rest/v1/' + path, {
    headers: {
      Accept: 'application/json',
      apikey: serviceRoleKey,
      Authorization: 'Bearer ' + serviceRoleKey,
      Prefer: 'count=exact',
      Range: '0-0',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const payload = (await response.json()) as SupabaseResponseError;
    throw new Error(payload.message ?? 'Supabase count request failed.');
  }

  const contentRange = response.headers.get('content-range');
  const total = Number(contentRange?.split('/')[1]);
  if (!Number.isInteger(total) || total < 0) throw new Error('Supabase did not return a valid count.');
  return total;
}
export function supabaseQuery(params: Record<string, string>): string {
  return new URLSearchParams(params).toString();
}
