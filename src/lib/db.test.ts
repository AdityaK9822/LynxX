// @vitest-environment node
import { beforeEach, afterEach, describe, expect, test, vi } from 'vitest';
import { getCashtagAddress, getCashtagByAddress } from './db';

const ALICE = 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN';

function mockFetch(rows: unknown[]) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => rows,
  } as Response);
}

function mockFetchError() {
  global.fetch = vi.fn().mockResolvedValue({ ok: false } as Response);
}

beforeEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://fake.supabase.co';
  process.env.NEXT_PUBLIC_SUPABASE_KEY = 'fake-key';
});

afterEach(() => {
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_KEY;
  vi.restoreAllMocks();
});

describe('getCashtagAddress', () => {
  test('returns stellar address when handle is found', async () => {
    mockFetch([{ stellar_address: ALICE }]);
    expect(await getCashtagAddress('alice')).toBe(ALICE);
  });

  test('returns null when handle is not in the database', async () => {
    mockFetch([]);
    expect(await getCashtagAddress('nobody')).toBeNull();
  });

  test('returns null when Supabase is not configured', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    expect(await getCashtagAddress('alice')).toBeNull();
  });

  test('returns null on network error instead of throwing', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('network fail'));
    expect(await getCashtagAddress('alice')).toBeNull();
  });

  test('returns null when Supabase returns a non-ok status', async () => {
    mockFetchError();
    expect(await getCashtagAddress('alice')).toBeNull();
  });
});

describe('getCashtagByAddress', () => {
  test('returns handle and domain when address is found', async () => {
    mockFetch([{ handle: 'alice', domain: 'lynxx.app' }]);
    const result = await getCashtagByAddress(ALICE);
    expect(result).toEqual({ handle: 'alice', domain: 'lynxx.app' });
  });

  test('returns null when address is not registered', async () => {
    mockFetch([]);
    expect(await getCashtagByAddress(ALICE)).toBeNull();
  });

  test('returns null when Supabase is not configured', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    expect(await getCashtagByAddress(ALICE)).toBeNull();
  });
});
