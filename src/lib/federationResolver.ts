/**
 * Server-side CashTag resolution for the SEP-0002 federation endpoint.
 * Reads a config/env mapping today; swap `lookupAccountId` for the persistent
 * store once issue #8 lands. The client-side counterpart, federation.js, is
 * backed by localStorage and is not readable from the server.
 */

/** Domain this server is authoritative for. Read lazily so runtime env wins. */
export function federationDomain(): string {
  return process.env.FEDERATION_DOMAIN || 'lynxx.app';
}

export interface FederationRecord {
  handle: string;
  domain: string;
  accountId: string;
}

const STELLAR_ADDRESS = /^G[A-Z2-7]{55}$/;
const HANDLE = /^[a-z0-9_-]{3,20}$/;

/** Handle-to-account map from FEDERATION_ACCOUNTS, a JSON object. */
function configuredAccounts(): Record<string, string> {
  const raw = process.env.FEDERATION_ACCOUNTS;
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {};
    }

    return Object.entries(parsed).reduce<Record<string, string>>(
      (acc, [handle, accountId]) => {
        const clean = handle.trim().toLowerCase();
        if (
          typeof accountId === 'string' &&
          HANDLE.test(clean) &&
          STELLAR_ADDRESS.test(accountId)
        ) {
          acc[clean] = accountId;
        }
        return acc;
      },
      {}
    );
  } catch {
    console.warn('FEDERATION_ACCOUNTS is not valid JSON, ignoring it');
    return {};
  }
}

/** Split `handle*domain`, or null if malformed or off-domain. */
export function parseFederationAddress(
  address: string
): { handle: string; domain: string } | null {
  if (typeof address !== 'string') return null;

  const parts = address.trim().toLowerCase().split('*');
  if (parts.length !== 2) return null;

  const [handle, domain] = parts;
  if (!HANDLE.test(handle) || domain !== federationDomain()) return null;

  return { handle, domain };
}

/** The seam issue #8 replaces. Null when the handle is not registered. */
async function lookupAccountId(handle: string): Promise<string | null> {
  return configuredAccounts()[handle] ?? null;
}

/** Resolve `aman*lynxx.app` to its account, or null if unregistered. */
export async function resolveFederationAddress(
  address: string
): Promise<FederationRecord | null> {
  const parsed = parseFederationAddress(address);
  if (!parsed) return null;

  const accountId = await lookupAccountId(parsed.handle);
  if (!accountId) return null;

  return { handle: parsed.handle, domain: parsed.domain, accountId };
}

/** Reverse lookup for SEP-0002 `type=id`. */
export async function resolveAccountId(
  accountId: string
): Promise<FederationRecord | null> {
  if (!STELLAR_ADDRESS.test(accountId ?? '')) return null;

  const match = Object.entries(configuredAccounts()).find(
    ([, id]) => id === accountId
  );
  if (!match) return null;

  return { handle: match[0], domain: federationDomain(), accountId };
}
