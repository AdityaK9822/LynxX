/**
 * Supabase REST client — cashtag persistence for the SEP-0002 federation resolver.
 * Follows the same fetch-based pattern as jsonbin.js (no Supabase SDK).
 */

function getSupabaseUrl() { return process.env.NEXT_PUBLIC_SUPABASE_URL || ''; }
function getSupabaseKey() { return process.env.NEXT_PUBLIC_SUPABASE_KEY || ''; }

function isConfigured(): boolean {
  return !!(getSupabaseUrl() && getSupabaseKey());
}

function headers(): HeadersInit {
  const key = getSupabaseKey();
  return {
    'Content-Type': 'application/json',
    apikey: key,
    Authorization: `Bearer ${key}`,
    Prefer: 'return=minimal',
  };
}

function endpoint(table: string, params = ''): string {
  return `${getSupabaseUrl()}/rest/v1/${table}${params}`;
}

/**
 * Forward lookup: handle → stellar_address.
 * Returns null when not found or when Supabase is not configured.
 */
export async function getCashtagAddress(handle: string): Promise<string | null> {
  if (!isConfigured()) return null;
  try {
    const res = await fetch(
      endpoint('cashtags', `?handle=eq.${encodeURIComponent(handle)}&select=stellar_address&limit=1`),
      { headers: headers(), cache: 'no-store' }
    );
    if (!res.ok) return null;
    const rows = await res.json() as { stellar_address: string }[];
    return rows[0]?.stellar_address ?? null;
  } catch {
    return null;
  }
}

/**
 * Reverse lookup: stellar_address → handle + domain.
 * Returns null when not found or when Supabase is not configured.
 */
export async function getCashtagByAddress(
  stellarAddress: string
): Promise<{ handle: string; domain: string } | null> {
  if (!isConfigured()) return null;
  try {
    const res = await fetch(
      endpoint('cashtags', `?stellar_address=eq.${encodeURIComponent(stellarAddress)}&select=handle,domain&limit=1`),
      { headers: headers(), cache: 'no-store' }
    );
    if (!res.ok) return null;
    const rows = await res.json() as { handle: string; domain: string }[];
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

/**
 * Register a new cashtag. Throws if the handle is already taken (Supabase UNIQUE constraint).
 */
export async function registerCashtag(
  handle: string,
  stellarAddress: string
): Promise<void> {
  if (!isConfigured()) {
    throw new Error(
      'Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_KEY.'
    );
  }
  const res = await fetch(endpoint('cashtags'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: getSupabaseKey(),
      Authorization: `Bearer ${getSupabaseKey()}`,
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ handle, stellar_address: stellarAddress }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(err.message || `Failed to register cashtag: HTTP ${res.status}`);
  }
}
