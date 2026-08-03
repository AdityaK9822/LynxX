import { StellarWalletsKit, Networks } from "@creit.tech/stellar-wallets-kit";
import { defaultModules } from "@creit.tech/stellar-wallets-kit/modules/utils";
import type { LynxxConfig, LynxxNetwork } from "./types";

const NETWORK_PASSPHRASES: Record<LynxxNetwork, Networks> = {
  TESTNET: Networks.TESTNET,
  PUBLIC: Networks.PUBLIC,
};

/**
 * Thrown when a wallet operation fails, e.g. the user closes the wallet
 * selection modal, rejects a signing request, or no wallet is connected yet.
 */
export class LynxxWalletError extends Error {
  /** Machine-readable error code, e.g. `"ModalClosed"` or `"SigningRejected"`. */
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "LynxxWalletError";
    this.code = code;
  }
}

/**
 * Manages the connection to a user's Stellar wallet (Freighter, xBull,
 * Albedo, and other wallets supported by `@creit.tech/stellar-wallets-kit`)
 * and provides helpers for signing transactions.
 *
 * Use {@link initLynxx} to create an instance rather than constructing this
 * class directly.
 */
export class LynxxWalletProvider {
  private readonly networkPassphrase: Networks;
  private address: string | null = null;

  constructor(config: LynxxConfig = {}) {
    const network = config.network ?? "TESTNET";
    this.networkPassphrase = NETWORK_PASSPHRASES[network];

    StellarWalletsKit.init({
      network: this.networkPassphrase,
      modules: defaultModules(),
    });
  }

  /**
   * Opens the wallet-selection modal and connects to the user's chosen
   * wallet.
   *
   * @returns The connected account's Stellar public key (`G...`).
   * @throws {@link LynxxWalletError} `"ModalClosed"` if the user closes the
   * modal without selecting a wallet, or approves without an address being
   * returned.
   *
   * @example
   * ```ts
   * const wallet = initLynxx();
   * const address = await wallet.connect();
   * console.log(`Connected: ${address}`);
   * ```
   */
  async connect(): Promise<string> {
    try {
      const { address } = await StellarWalletsKit.authModal();
      if (!address) {
        throw new Error("No address returned from wallet.");
      }
      this.address = address;
      return address;
    } catch (error) {
      throw new LynxxWalletError(
        "ModalClosed",
        error instanceof Error
          ? error.message
          : "Wallet connection was cancelled.",
      );
    }
  }

  /**
   * Signs a transaction with the connected wallet.
   *
   * @param xdr - The unsigned transaction, base64-encoded XDR (e.g. the
   * result of `transaction.toXDR()` from `@stellar/stellar-sdk`).
   * @returns The signed transaction as a base64-encoded XDR string.
   * @throws {@link LynxxWalletError} `"NotConnected"` if {@link connect} has
   * not been called yet, or `"SigningRejected"` if the user rejects the
   * signing request in their wallet.
   *
   * @example
   * ```ts
   * import { TransactionBuilder, Networks } from "@stellar/stellar-sdk";
   *
   * const signedXdr = await wallet.signTransaction(transaction.toXDR());
   * const signedTx = TransactionBuilder.fromXDR(signedXdr, Networks.TESTNET);
   * ```
   */
  async signTransaction(xdr: string): Promise<string> {
    if (!this.address) {
      throw new LynxxWalletError(
        "NotConnected",
        "No wallet connected. Call connect() before signTransaction().",
      );
    }

    try {
      const { signedTxXdr } = await StellarWalletsKit.signTransaction(xdr, {
        networkPassphrase: this.networkPassphrase,
        address: this.address,
      });

      if (!signedTxXdr) {
        throw new Error("Wallet did not return a signed transaction.");
      }

      return signedTxXdr;
    } catch (error) {
      throw new LynxxWalletError(
        "SigningRejected",
        error instanceof Error
          ? error.message
          : "Transaction signing was rejected.",
      );
    }
  }

  /**
   * The currently connected wallet address.
   * @returns The connected `G...` public key, or `null` if not connected.
   */
  getAddress(): string | null {
    return this.address;
  }

  /** Whether a wallet is currently connected. */
  isConnected(): boolean {
    return this.address !== null;
  }

  /**
   * Clears the local connection state.
   *
   * This only forgets the address on the client; it does not revoke the
   * dApp's permission from within the wallet itself.
   */
  disconnect(): void {
    this.address = null;
  }
}
