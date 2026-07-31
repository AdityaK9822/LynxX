# lynxx-wallet-sdk

> Non-custodial Stellar wallet integration SDK for dApps built on Soroban.

[![npm version](https://img.shields.io/npm/v/lynxx-wallet-sdk.svg)](https://www.npmjs.com/package/lynxx-wallet-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](../../LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)

---

## Installation

```bash
npm install lynxx-wallet-sdk
```

---

## Quick Start

```ts
import { initLynxx } from 'lynxx-wallet-sdk';

const wallet = initLynxx();

// Connect to Freighter wallet
await wallet.connect();
```

---

## API

### `initLynxx()`

Returns a new `LynxxWalletProvider` instance. This is the primary entry point for dApps integrating the SDK.

```ts
import { initLynxx } from 'lynxx-wallet-sdk';

const wallet = initLynxx();
```

### `LynxxWalletProvider`

The core provider class for managing wallet connections and transaction
signing on the Stellar network. Wraps [`@stellar/freighter-api`](https://www.npmjs.com/package/@stellar/freighter-api).

| Method | Returns | Description |
|--------|---------|-------------|
| `connect()` | `Promise<{ publicKey: string }>` | Detects Freighter and requests access to an account |
| `signTransaction(tx, opts?)` | `Promise<SignedTransactionResult>` | Requests a signature for a transaction |
| `signAuthEntry(entryXdr, opts?)` | `Promise<SignedAuthEntryResult>` | Requests a signature for a Soroban authorization entry |

| Getter | Type | Description |
|--------|------|-------------|
| `connected` | `boolean` | Whether `connect()` has previously succeeded |
| `address` | `string \| null` | The public key from the last successful `connect()` |

#### `signTransaction(transaction, opts?)`

Accepts either an XDR string or a `Transaction`/`FeeBumpTransaction` instance
from `@stellar/stellar-sdk`.

```ts
import { initLynxx } from 'lynxx-wallet-sdk';
import { Networks } from '@stellar/stellar-sdk';

const wallet = initLynxx();
await wallet.connect();

const { signedTxXdr, signerAddress } = await wallet.signTransaction(tx, {
  networkPassphrase: Networks.TESTNET,
});
```

`opts` accepts:

| Option | Type | Description |
|--------|------|-------------|
| `networkPassphrase` | `string` | Network the transaction was built for |
| `address` | `string` | Request the signature from a specific account |
| `timeoutMs` | `number` | Time to wait for the wallet before rejecting (default 5 minutes) |

#### `signAuthEntry(entryXdr, opts?)`

Signs a Soroban `SorobanAuthorizationEntry` XDR, used to authorize smart
contract invocations made on behalf of the connected account. Soroban
transactions must be simulated first so the entry can be extracted from the
simulation result — see [Signing Transactions](../../docs/wallet-integration/signing-transactions.md).

```ts
const { signedAuthEntry } = await wallet.signAuthEntry(entryXdr, {
  networkPassphrase: Networks.TESTNET,
});
```

#### Errors

All rejections are instances of `LynxxWalletError` (exported from the
package), with a specific subclass depending on the failure:

| Class | `code` | When |
|-------|--------|------|
| `WalletNotFoundError` | `WALLET_NOT_FOUND` | Freighter extension isn't installed/detected |
| `UserRejectedError` | `USER_REJECTED` | The user declined the request in the wallet popup |
| `SigningTimeoutError` | `SIGNING_TIMEOUT` | The wallet didn't respond within `timeoutMs` |
| `InvalidXdrError` | `INVALID_XDR` | The provided XDR is malformed or the wrong type |
| `WalletRequestError` | `WALLET_REQUEST_FAILED` | Any other wallet-reported failure |

```ts
import { UserRejectedError } from 'lynxx-wallet-sdk';

try {
  await wallet.signTransaction(tx);
} catch (err) {
  if (err instanceof UserRejectedError) {
    // user cancelled — no need to surface this as an error
  } else {
    throw err;
  }
}
```

### `LynxxConfig`

TypeScript interface for SDK configuration.

```ts
interface LynxxConfig {
  network: string; // e.g. 'testnet' or 'mainnet'
}
```

---

## Requirements

- [`@stellar/stellar-sdk`](https://www.npmjs.com/package/@stellar/stellar-sdk) >= 10.0.0 (peer dependency)
- [Freighter Wallet](https://freighter.app/) browser extension

---

## Part of LynxX

This SDK is part of the [LynxX](https://github.com/amankoli09/LynxX) open-source crowdfunding dApp built on Stellar Soroban.

- 🌐 [GitHub Repository](https://github.com/amankoli09/LynxX)
- 📦 [npm Package](https://www.npmjs.com/package/lynxx-wallet-sdk)
- 📄 [Changelog](../../CHANGELOG.md)

---

## License

MIT © [Aman Koli](https://github.com/amankoli09)
