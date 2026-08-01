/**
 * WebAuthn / Passkey Registration & Verification Unit Tests
 * Tests Issue #49 Acceptance Criteria:
 * 1. WebAuthn capability checking & graceful fallback
 * 2. navigator.credentials.create() flow
 * 3. Extracting public key from credential
 * 4. Saving credential ID & public key locally
 * 5. Signing verification challenge
 */

import {
  isPasskeySupported,
  createPasskey,
  getSavedPasskeyId,
  getSavedPublicKey,
  clearSavedPasskey,
  authenticatePasskey,
  STORAGE_PASSKEY_ID,
  STORAGE_PASSKEY_PUBKEY
} from "../lib/passkey";

describe("WebAuthn Passkey Registration Flow", () => {
  const originalNavigator = window.navigator;
  const originalPublicKeyCredential = window.PublicKeyCredential;

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(window, "navigator", {
      value: originalNavigator,
      writable: true,
    });
    window.PublicKeyCredential = originalPublicKeyCredential;
  });

  test("AC 1 & 5: handles graceful fallback when WebAuthn is unsupported", async () => {
    Object.defineProperty(window, "PublicKeyCredential", {
      value: undefined,
      writable: true,
    });

    expect(isPasskeySupported()).toBe(false);
    const res = await createPasskey("user@lynxx.app");
    expect(res.success).toBe(false);
    expect(res.error).toContain("not supported");
  });

  test("AC 2 & 3 & 4: creates passkey, extracts public key, and stores credential ID locally", async () => {
    const mockCredential = {
      id: "test-credential-id-12345",
      rawId: new ArrayBuffer(16),
      response: {
        getPublicKey: () => new Uint8Array([1, 2, 3, 4]).buffer,
      },
    };

    const mockCreate = vi.fn().mockResolvedValue(mockCredential);
    Object.defineProperty(window, "PublicKeyCredential", {
      value: vi.fn(),
      writable: true,
    });
    Object.defineProperty(window, "navigator", {
      value: {
        credentials: {
          create: mockCreate,
        },
      },
      writable: true,
    });

    expect(isPasskeySupported()).toBe(true);

    const res = await createPasskey("aman@lynxx.app");
    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(res.success).toBe(true);
    expect(res.credentialID).toBe("test-credential-id-12345");
    expect(res.publicKey).toBe("01020304");

    expect(getSavedPasskeyId()).toBe("test-credential-id-12345");
    expect(getSavedPublicKey()).toBe("01020304");
  });

  test("AC 4: clears saved passkey correctly", () => {
    localStorage.setItem(STORAGE_PASSKEY_ID, "cred-123");
    localStorage.setItem(STORAGE_PASSKEY_PUBKEY, "pub-456");

    expect(getSavedPasskeyId()).toBe("cred-123");
    expect(getSavedPublicKey()).toBe("pub-456");

    clearSavedPasskey();

    expect(getSavedPasskeyId()).toBeNull();
    expect(getSavedPublicKey()).toBeNull();
  });

  test("AC 4: authenticatePasskey verifies signature with saved credential", async () => {
    localStorage.setItem(STORAGE_PASSKEY_ID, "cred-123");

    const mockAssertion = {
      id: "cred-123",
      response: {
        signature: new Uint8Array([10, 20, 30]).buffer,
      },
    };

    const mockGet = vi.fn().mockResolvedValue(mockAssertion);
    Object.defineProperty(window, "PublicKeyCredential", {
      value: vi.fn(),
      writable: true,
    });
    Object.defineProperty(window, "navigator", {
      value: {
        credentials: {
          create: vi.fn(),
          get: mockGet,
        },
      },
      writable: true,
    });

    const res = await authenticatePasskey("Sign test tx");
    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(res.success).toBe(true);
    expect(res.credentialID).toBe("cred-123");
    expect(res.signature).toBe("0a141e");
  });
});
