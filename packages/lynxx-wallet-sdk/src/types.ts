import type { Transaction, FeeBumpTransaction } from "@stellar/stellar-sdk";

/**
 * Stellar network the SDK should operate on.
 *
 * - `"TESTNET"` — Stellar Test Network, used for development.
 * - `"PUBLIC"` — Stellar Public (main) Network, used in production.
 */
export type LynxxNetwork = "TESTNET" | "PUBLIC";

/**
 * Configuration options accepted by {@link initLynxx}.
 */
export interface LynxxConfig {
  /**
   * The Stellar network to connect to.
   * @default "TESTNET"
   */
  network?: LynxxNetwork;
}

/** A transaction envelope, either as an XDR string or a parsed stellar-sdk object. */
export type TransactionLike = Transaction | FeeBumpTransaction | string;

export interface SignTransactionOptions {
  /** The network passphrase the transaction was built for (e.g. `Networks.TESTNET`). */
  networkPassphrase?: string;
  /** Public key to request the signature from, if the wallet manages multiple accounts. */
  address?: string;
  /** Milliseconds to wait for the wallet to respond before rejecting. Defaults to 5 minutes. */
  timeoutMs?: number;
}

export interface SignedTransactionResult {
  /** The signed transaction, re-encoded as an XDR string. */
  signedTxXdr: string;
  /** The public key that produced the signature. */
  signerAddress: string;
}

export type SignAuthEntryOptions = SignTransactionOptions;

export interface SignedAuthEntryResult {
  /** The signed `SorobanAuthorizationEntry`, re-encoded as an XDR string. */
  signedAuthEntry: string;
  /** The public key that produced the signature. */
  signerAddress: string;
}

/**
 * Minimal surface of `@stellar/freighter-api` that the provider depends on.
 * Exposed so tests (and alternate wallet backends) can supply a substitute.
 */
export interface WalletClient {
  isConnected(): Promise<{ isConnected: boolean; error?: unknown }>;
  requestAccess(): Promise<{ address: string; error?: unknown }>;
  signTransaction(
    transactionXdr: string,
    opts?: { networkPassphrase?: string; address?: string }
  ): Promise<{ signedTxXdr: string; signerAddress: string; error?: unknown }>;
  signAuthEntry(
    entryXdr: string,
    opts?: { networkPassphrase?: string; address?: string }
  ): Promise<{
    signedAuthEntry: string | null;
    signerAddress: string;
    error?: unknown;
  }>;
}
