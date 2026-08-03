# lynxx-wallet-sdk example

A minimal React + Vite app demonstrating `lynxx-wallet-sdk`: connecting a
Stellar wallet and signing a testnet payment.

It depends on the SDK via the pnpm workspace (`"lynxx-wallet-sdk": "workspace:*"`),
so it always runs against the current source in [`packages/lynxx-wallet-sdk`](../packages/lynxx-wallet-sdk).

## Running

From the repository root:

```bash
pnpm install
pnpm --filter lynxx-wallet-sdk run build   # build the SDK once
pnpm --filter lynxx-wallet-sdk-example run dev
```

Open the printed local URL (default [http://localhost:5173](http://localhost:5173)).

You'll need a Testnet-funded Stellar wallet (e.g. [Freighter](https://freighter.app/)
set to the Test Network) to try connecting and sending a payment. Fund a
testnet account via [Friendbot](https://laboratory.stellar.org/#account-creator?network=test).

## What it shows

- `src/App.tsx` — initializes the SDK once with `initLynxx({ network: "TESTNET" })`,
  connects via `wallet.connect()`, builds a payment transaction with
  `@stellar/stellar-sdk`, and signs it via `wallet.signTransaction()` before
  submitting to Horizon.
