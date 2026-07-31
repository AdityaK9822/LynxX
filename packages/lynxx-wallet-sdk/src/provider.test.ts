import {
  Account,
  Address,
  Keypair,
  Networks,
  Operation,
  TransactionBuilder,
  xdr,
} from "@stellar/stellar-sdk";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  InvalidXdrError,
  SigningTimeoutError,
  UserRejectedError,
  WalletNotFoundError,
  WalletRequestError,
} from "./errors";
import { LynxxWalletProvider } from "./provider";
import type { WalletClient } from "./types";

const TEST_ADDRESS = "GABC" + "A".repeat(52);

function buildTestTransaction() {
  const keypair = Keypair.random();
  const account = new Account(keypair.publicKey(), "0");
  return new TransactionBuilder(account, {
    fee: "100",
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(Operation.bumpSequence({ bumpTo: "1" }))
    .setTimeout(30)
    .build();
}

function buildTestAuthEntryXdr(): string {
  const contractAddress = Address.contract(Buffer.alloc(32)).toScAddress();
  const invokeArgs = new xdr.InvokeContractArgs({
    contractAddress,
    functionName: "test",
    args: [],
  });
  const rootInvocation = new xdr.SorobanAuthorizedInvocation({
    function:
      xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
        invokeArgs
      ),
    subInvocations: [],
  });
  const entry = new xdr.SorobanAuthorizationEntry({
    credentials: xdr.SorobanCredentials.sorobanCredentialsSourceAccount(),
    rootInvocation,
  });
  return entry.toXDR("base64");
}

function createMockClient(
  overrides: Partial<WalletClient> = {}
): WalletClient {
  return {
    isConnected: vi.fn().mockResolvedValue({ isConnected: true }),
    requestAccess: vi.fn().mockResolvedValue({ address: TEST_ADDRESS }),
    signTransaction: vi.fn().mockResolvedValue({
      signedTxXdr: "signed-xdr",
      signerAddress: TEST_ADDRESS,
    }),
    signAuthEntry: vi.fn().mockResolvedValue({
      signedAuthEntry: "signed-auth-entry",
      signerAddress: TEST_ADDRESS,
    }),
    ...overrides,
  };
}

describe("LynxxWalletProvider.connect", () => {
  it("resolves with the wallet's public key", async () => {
    const client = createMockClient();
    const provider = new LynxxWalletProvider(client);

    const result = await provider.connect();

    expect(result).toEqual({ publicKey: TEST_ADDRESS });
    expect(provider.connected).toBe(true);
    expect(provider.address).toBe(TEST_ADDRESS);
    expect(client.requestAccess).toHaveBeenCalledOnce();
  });

  it("throws WalletNotFoundError when the extension is not detected", async () => {
    const client = createMockClient({
      isConnected: vi.fn().mockResolvedValue({ isConnected: false }),
    });
    const provider = new LynxxWalletProvider(client);

    await expect(provider.connect()).rejects.toBeInstanceOf(
      WalletNotFoundError
    );
    expect(provider.connected).toBe(false);
  });

  it("maps a declined access request to UserRejectedError", async () => {
    const client = createMockClient({
      requestAccess: vi.fn().mockResolvedValue({
        address: "",
        error: { code: -4, message: "User declined access" },
      }),
    });
    const provider = new LynxxWalletProvider(client);

    await expect(provider.connect()).rejects.toBeInstanceOf(
      UserRejectedError
    );
  });

  it("wraps unexpected thrown errors from the wallet client", async () => {
    const client = createMockClient({
      isConnected: vi.fn().mockRejectedValue(new Error("extension crashed")),
    });
    const provider = new LynxxWalletProvider(client);

    await expect(provider.connect()).rejects.toBeInstanceOf(
      WalletRequestError
    );
  });
});

describe("LynxxWalletProvider.signTransaction", () => {
  let client: WalletClient;
  let provider: LynxxWalletProvider;

  beforeEach(() => {
    client = createMockClient();
    provider = new LynxxWalletProvider(client);
  });

  it("signs a raw XDR string and returns the signed result", async () => {
    const tx = buildTestTransaction();

    const result = await provider.signTransaction(tx.toXDR(), {
      networkPassphrase: Networks.TESTNET,
    });

    expect(result).toEqual({
      signedTxXdr: "signed-xdr",
      signerAddress: TEST_ADDRESS,
    });
    expect(client.signTransaction).toHaveBeenCalledWith(tx.toXDR(), {
      networkPassphrase: Networks.TESTNET,
    });
  });

  it("accepts a stellar-sdk Transaction instance directly", async () => {
    const tx = buildTestTransaction();

    await provider.signTransaction(tx);

    expect(client.signTransaction).toHaveBeenCalledWith(tx.toXDR(), {});
  });

  it("rejects malformed XDR before calling the wallet", async () => {
    await expect(
      provider.signTransaction("not-a-real-xdr")
    ).rejects.toBeInstanceOf(InvalidXdrError);
    expect(client.signTransaction).not.toHaveBeenCalled();
  });

  it("throws UserRejectedError when the user declines in the wallet popup", async () => {
    const tx = buildTestTransaction();
    client.signTransaction = vi.fn().mockResolvedValue({
      signedTxXdr: "",
      signerAddress: "",
      error: { code: -4, message: "User declined access" },
    });

    await expect(provider.signTransaction(tx)).rejects.toBeInstanceOf(
      UserRejectedError
    );
  });

  it("throws SigningTimeoutError when the wallet never responds", async () => {
    const tx = buildTestTransaction();
    client.signTransaction = vi.fn(() => new Promise(() => {}));

    await expect(
      provider.signTransaction(tx, { timeoutMs: 10 })
    ).rejects.toBeInstanceOf(SigningTimeoutError);
  });

  it("propagates generic wallet failures as WalletRequestError", async () => {
    const tx = buildTestTransaction();
    client.signTransaction = vi.fn().mockResolvedValue({
      signedTxXdr: "",
      signerAddress: "",
      error: { code: -1, message: "Internal wallet error" },
    });

    await expect(provider.signTransaction(tx)).rejects.toBeInstanceOf(
      WalletRequestError
    );
  });
});

describe("LynxxWalletProvider.signAuthEntry", () => {
  let client: WalletClient;
  let provider: LynxxWalletProvider;

  beforeEach(() => {
    client = createMockClient();
    provider = new LynxxWalletProvider(client);
  });

  it("signs a valid SorobanAuthorizationEntry XDR", async () => {
    const entryXdr = buildTestAuthEntryXdr();

    const result = await provider.signAuthEntry(entryXdr);

    expect(result).toEqual({
      signedAuthEntry: "signed-auth-entry",
      signerAddress: TEST_ADDRESS,
    });
    expect(client.signAuthEntry).toHaveBeenCalledWith(entryXdr, {});
  });

  it("rejects malformed auth entry XDR before calling the wallet", async () => {
    await expect(
      provider.signAuthEntry("not-a-real-auth-entry")
    ).rejects.toBeInstanceOf(InvalidXdrError);
    expect(client.signAuthEntry).not.toHaveBeenCalled();
  });

  it("throws UserRejectedError when the user declines authorization", async () => {
    const entryXdr = buildTestAuthEntryXdr();
    client.signAuthEntry = vi.fn().mockResolvedValue({
      signedAuthEntry: null,
      signerAddress: "",
      error: { code: -4, message: "User declined access" },
    });

    await expect(provider.signAuthEntry(entryXdr)).rejects.toBeInstanceOf(
      UserRejectedError
    );
  });

  it("throws SigningTimeoutError when the wallet never responds", async () => {
    const entryXdr = buildTestAuthEntryXdr();
    client.signAuthEntry = vi.fn(() => new Promise(() => {}));

    await expect(
      provider.signAuthEntry(entryXdr, { timeoutMs: 10 })
    ).rejects.toBeInstanceOf(SigningTimeoutError);
  });
});
