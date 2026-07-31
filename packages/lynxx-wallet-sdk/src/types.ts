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
