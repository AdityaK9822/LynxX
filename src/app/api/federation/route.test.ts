// @vitest-environment node
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { GET } from './route';

const ALICE = 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN';

function call(query: string): Promise<Response> {
  return GET(new Request(`https://lynxx.app/api/federation?${query}`));
}

describe('GET /api/federation', () => {
  beforeEach(() => {
    process.env.FEDERATION_DOMAIN = 'lynxx.app';
    process.env.FEDERATION_ACCOUNTS = JSON.stringify({ alice: ALICE });
  });

  afterEach(() => {
    delete process.env.FEDERATION_DOMAIN;
    delete process.env.FEDERATION_ACCOUNTS;
  });

  test('resolves a registered CashTag', async () => {
    const res = await call('q=alice*lynxx.app&type=name');

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      stellar_address: 'alice*lynxx.app',
      account_id: ALICE,
    });
  });

  test('sets the CORS and no-cache headers SEP-0002 requires', async () => {
    const res = await call('q=alice*lynxx.app&type=name');

    expect(res.headers.get('access-control-allow-origin')).toBe('*');
    expect(res.headers.get('cache-control')).toBe('no-store');
  });

  test('keeps those headers on the 404 path', async () => {
    const res = await call('q=nobody*lynxx.app&type=name');

    expect(res.headers.get('access-control-allow-origin')).toBe('*');
  });

  test('404s an unregistered CashTag with an error body', async () => {
    const res = await call('q=nobody*lynxx.app&type=name');

    expect(res.status).toBe(404);
    expect((await res.json()).error).toContain('nobody*lynxx.app');
  });

  test('404s an address belonging to another domain', async () => {
    expect((await call('q=alice*example.com&type=name')).status).toBe(404);
  });

  test('404s rather than 400s a malformed address', async () => {
    expect((await call('q=alice&type=name')).status).toBe(404);
  });

  test('resolves the reverse lookup for type=id', async () => {
    const res = await call(`q=${ALICE}&type=id`);

    expect(res.status).toBe(200);
    expect((await res.json()).stellar_address).toBe('alice*lynxx.app');
  });

  test('400s when q or type is missing', async () => {
    expect((await call('type=name')).status).toBe(400);
    expect((await call('q=alice*lynxx.app')).status).toBe(400);
  });

  test('400s a federation type this server does not implement', async () => {
    expect((await call('q=alice*lynxx.app&type=txid')).status).toBe(400);
    expect((await call('q=alice*lynxx.app&type=nonsense')).status).toBe(400);
  });

  test('404s everything when no accounts are configured', async () => {
    delete process.env.FEDERATION_ACCOUNTS;

    expect((await call('q=alice*lynxx.app&type=name')).status).toBe(404);
  });

  test('ignores malformed entries in FEDERATION_ACCOUNTS', async () => {
    process.env.FEDERATION_ACCOUNTS = JSON.stringify({ bob: 'not-a-key' });

    expect((await call('q=bob*lynxx.app&type=name')).status).toBe(404);
  });
});
