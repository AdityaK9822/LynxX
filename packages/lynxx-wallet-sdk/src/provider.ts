import {
  isConnected as freighterIsConnected,
  requestAccess as freighterRequestAccess,
  signAuthEntry as freighterSignAuthEntry,
  signTransaction as freighterSignTransaction,
} from "@stellar/freighter-api";
import { FeeBumpTransaction, Transaction, xdr } from "@stellar/stellar-sdk";

import {
  InvalidXdrError,
  SigningTimeoutError,
  UserRejectedError,
  WalletNotFoundError,
  mapWalletError,
} from "./errors";
import type {
  SignAuthEntryOptions,
  SignedAuthEntryResult,
  SignedTransactionResult,
  SignTransactionOptions,
  TransactionLike,
  WalletClient,
} from "./types";

const DEFAULT_TIMEOUT_MS = 5 * 60 * 1000;

const defaultClient: WalletClient = {
  isConnected: freighterIsConnected,
  requestAccess: freighterRequestAccess,
  signTransaction: freighterSignTransaction,
  signAuthEntry: freighterSignAuthEntry,
};

export class LynxxWalletProvider {
  private publicKey: string | null = null;

  constructor(private readonly client: WalletClient = defaultClient) {}

  /** Whether `connect()` has previously succeeded in this session. */
  get connected(): boolean {
    return this.publicKey !== null;
  }

  /** The public key returned by the last successful `connect()` call, if any. */
  get address(): string | null {
    return this.publicKey;
  }

  /**
   * Detects the Freighter extension and requests access to the user's
   * public key.
   */
  async connect(): Promise<{ publicKey: string }> {
    const connectedResult = await this.callWallet(
      () => this.client.isConnected(),
      "Failed to detect the Freighter wallet."
    );

    if (connectedResult.error || !connectedResult.isConnected) {
      throw new WalletNotFoundError();
    }

    const accessResult = await this.callWallet(
      () => this.client.requestAccess(),
      "Failed to request wallet access."
    );

    if (accessResult.error || !accessResult.address) {
      throw mapWalletError(
        accessResult.error,
        "The wallet denied access to an account."
      );
    }

    this.publicKey = accessResult.address;
    return { publicKey: this.publicKey };
  }

  /**
   * Requests a signature for a Stellar transaction from the connected
   * wallet. Accepts a raw XDR string or a `Transaction`/`FeeBumpTransaction`
   * instance from `@stellar/stellar-sdk`.
   */
  async signTransaction(
    transaction: TransactionLike,
    opts: SignTransactionOptions = {}
  ): Promise<SignedTransactionResult> {
    const transactionXdr = toTransactionXdr(transaction);
    const { timeoutMs = DEFAULT_TIMEOUT_MS, ...walletOpts } = opts;

    const result = await this.withTimeout(
      this.callWallet(
        () => this.client.signTransaction(transactionXdr, walletOpts),
        "The wallet failed to sign the transaction."
      ),
      timeoutMs
    );

    if (result.error) {
      throw mapWalletError(
        result.error,
        "The wallet failed to sign the transaction."
      );
    }

    if (!result.signedTxXdr) {
      throw new UserRejectedError();
    }

    return {
      signedTxXdr: result.signedTxXdr,
      signerAddress: result.signerAddress,
    };
  }

  /**
   * Requests a signature for a Soroban `SorobanAuthorizationEntry`, used to
   * authorize smart contract invocations on behalf of the connected account.
   */
  async signAuthEntry(
    entryXdr: string,
    opts: SignAuthEntryOptions = {}
  ): Promise<SignedAuthEntryResult> {
    assertValidAuthEntryXdr(entryXdr);
    const { timeoutMs = DEFAULT_TIMEOUT_MS, ...walletOpts } = opts;

    const result = await this.withTimeout(
      this.callWallet(
        () => this.client.signAuthEntry(entryXdr, walletOpts),
        "The wallet failed to sign the authorization entry."
      ),
      timeoutMs
    );

    if (result.error) {
      throw mapWalletError(
        result.error,
        "The wallet failed to sign the authorization entry."
      );
    }

    if (!result.signedAuthEntry) {
      throw new UserRejectedError();
    }

    return {
      signedAuthEntry: result.signedAuthEntry,
      signerAddress: result.signerAddress,
    };
  }

  /** Runs a wallet call, normalizing thrown exceptions into LynxxWalletErrors. */
  private async callWallet<T>(
    fn: () => Promise<T>,
    fallbackMessage: string
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      throw mapWalletError(error, fallbackMessage);
    }
  }

  private async withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    if (!timeoutMs || timeoutMs <= 0) {
      return promise;
    }

    let timer: ReturnType<typeof setTimeout>;
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new SigningTimeoutError()), timeoutMs);
    });

    try {
      return await Promise.race([promise, timeout]);
    } finally {
      clearTimeout(timer!);
    }
  }
}

function toTransactionXdr(transaction: TransactionLike): string {
  if (typeof transaction === "string") {
    assertValidTransactionXdr(transaction);
    return transaction;
  }

  if (
    transaction instanceof Transaction ||
    transaction instanceof FeeBumpTransaction
  ) {
    return transaction.toXDR();
  }

  throw new InvalidXdrError(
    "signTransaction() expects an XDR string or a Transaction/FeeBumpTransaction instance."
  );
}

function assertValidTransactionXdr(transactionXdr: string): void {
  try {
    xdr.TransactionEnvelope.fromXDR(transactionXdr, "base64");
  } catch (error) {
    throw new InvalidXdrError(
      `Received a malformed transaction envelope XDR: ${(error as Error).message}`
    );
  }
}

function assertValidAuthEntryXdr(entryXdr: string): void {
  try {
    xdr.SorobanAuthorizationEntry.fromXDR(entryXdr, "base64");
  } catch (error) {
    throw new InvalidXdrError(
      `Received a malformed SorobanAuthorizationEntry XDR: ${(error as Error).message}`
    );
  }
}
