export * from "./types";
export * from "./provider";
export * from "./errors";

import { LynxxWalletProvider } from "./provider";
import type { LynxxConfig } from "./types";

/**
 * Initializes and returns a new LynxX Wallet Provider instance.
 * This is the primary entry point for dApps integrating the SDK.
 *
 * @param config - Optional SDK configuration, e.g. which Stellar network to
 * connect to. Defaults to `{ network: "TESTNET" }`.
 *
 * @example
 * ```ts
 * import { initLynxx } from "lynxx-wallet-sdk";
 *
 * const wallet = initLynxx({ network: "TESTNET" });
 * const address = await wallet.connect();
 * ```
 */
export function initLynxx(config?: LynxxConfig): LynxxWalletProvider {
  return new LynxxWalletProvider(config);
}
