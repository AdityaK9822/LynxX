/**
 * SEP-0002 federation endpoint. Resolves a CashTag such as `aman*lynxx.app`
 * to its Stellar account id. Lookup is delegated to lib/federationResolver so
 * the datastore can be swapped without touching this route (issue #8).
 */

import {
  resolveAccountId,
  resolveFederationAddress,
} from '@/lib/federationResolver';

/** SEP-0002 requires CORS on every response and forbids caching them. */
const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Cache-Control': 'no-store',
};

const SUPPORTED = new Set(['name', 'id']);
const KNOWN = new Set(['name', 'id', 'txid', 'forward']);

function json(body: unknown, status: number): Response {
  return Response.json(body, { status, headers: HEADERS });
}

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  const type = searchParams.get('type');

  if (!q || !type) {
    return json({ error: 'Both q and type are required' }, 400);
  }

  if (!SUPPORTED.has(type)) {
    return json(
      {
        error: KNOWN.has(type)
          ? `Federation type "${type}" is not supported by this server`
          : `Unknown federation type "${type}"`,
      },
      400
    );
  }

  // SEP-0002 usernames are broader than the LynxX handle format, so anything
  // we cannot parse is "not found" rather than a bad request.
  const record =
    type === 'name'
      ? await resolveFederationAddress(q)
      : await resolveAccountId(q);

  if (!record) {
    return json({ error: `Federation record not found for "${q}"` }, 404);
  }

  return json(
    {
      stellar_address: `${record.handle}*${record.domain}`,
      account_id: record.accountId,
    },
    200
  );
}
