/**
 * Inner transaction constructor for the LynxX fee bump relayer.
 * The device builds and signs the inner transaction; the relayer wraps it in a
 * fee bump and pays the fee. CAP-0015 validates the inner envelope in full, so
 * an unsigned inner fails with txBAD_AUTH and the signature is not optional.
 * Network calls stay in the caller so this remains unit-testable.
 */

import {
  Account,
  Asset,
  BASE_FEE,
  Networks,
  Operation,
  TransactionBuilder,
} from '@stellar/stellar-sdk';

export type AssetInput =
  Asset | 'native' | 'XLM' | { code: string; issuer?: string };

/** Signs a base64 XDR envelope and returns the signed envelope. */
export type SignTransaction = (
  xdr: string,
  opts: { networkPassphrase: string; address: string }
) => Promise<string>;

export interface BuildInnerTransactionOptions {
  /**
   * Sender's current sequence number, as returned by Horizon's
   * `loadAccount()`. The builder stamps sequence + 1 onto the transaction.
   */
  sequence: string;
  /** Defaults to the connected wallet. Inject a stub to test wallet-free. */
  signTransaction?: SignTransaction;
  networkPassphrase?: string;
  /** Inner fee in stroops. The fee bump supersedes it. */
  baseFee?: string;
  /** Seconds until the transaction expires. */
  timeout?: number;
}

const STELLAR_ADDRESS = /^G[A-Z2-7]{55}$/;
const AMOUNT = /^\d+(\.\d{1,7})?$/;

function assertAddress(value: string, label: string): void {
  if (typeof value !== 'string' || !STELLAR_ADDRESS.test(value)) {
    throw new Error(`${label} is not a valid Stellar public key: ${value}`);
  }
}

/** Mirrors the client-side rule in docs/security/input-validation.md. */
function normaliseAmount(amount: string | number): string {
  const raw =
    typeof amount === 'number'
      ? amount.toString()
      : (amount ?? '').toString().trim();

  if (!AMOUNT.test(raw) || parseFloat(raw) <= 0) {
    throw new Error(`Amount must be greater than 0, got: ${raw || '(empty)'}`);
  }
  return raw;
}

function resolveAsset(asset: AssetInput): Asset {
  if (asset instanceof Asset) return asset;
  if (asset === 'native' || asset === 'XLM') return Asset.native();

  if (asset && typeof asset === 'object' && asset.code) {
    if (asset.code === 'XLM' && !asset.issuer) return Asset.native();
    if (!asset.issuer)
      throw new Error(`Asset ${asset.code} requires an issuer`);

    assertAddress(asset.issuer, `Issuer for ${asset.code}`);
    return new Asset(asset.code, asset.issuer);
  }

  throw new Error('Asset must be an Asset, "native", or { code, issuer }');
}

/** Signs via the connected wallet, the same call Wallet.js sendPayment makes. */
const signWithWallet: SignTransaction = async (xdr, opts) => {
  const { StellarWalletsKit } = await import('@creit.tech/stellar-wallets-kit');

  const { signedTxXdr } = await StellarWalletsKit.signTransaction(xdr, opts);
  if (!signedTxXdr) {
    throw new Error('Wallet did not return a signed transaction.');
  }
  return signedTxXdr;
};

/**
 * Build and sign the inner transaction for a fee bump.
 * @returns base64 XDR of the signed transaction envelope.
 */
export async function buildInnerTransaction(
  senderPublicKey: string,
  recipientAddress: string,
  amount: string | number,
  asset: AssetInput,
  options: BuildInnerTransactionOptions
): Promise<string> {
  assertAddress(senderPublicKey, 'Sender');
  assertAddress(recipientAddress, 'Recipient');

  if (senderPublicKey === recipientAddress) {
    throw new Error('Sender and recipient must differ');
  }

  const { sequence } = options ?? ({} as BuildInnerTransactionOptions);
  if (typeof sequence !== 'string' || sequence === '') {
    throw new Error(
      'options.sequence is required. Load it with server.loadAccount(senderPublicKey).'
    );
  }

  const {
    signTransaction = signWithWallet,
    networkPassphrase = Networks.TESTNET,
    baseFee = BASE_FEE,
    timeout = 180,
  } = options;

  const transaction = new TransactionBuilder(
    new Account(senderPublicKey, sequence),
    { fee: baseFee, networkPassphrase }
  )
    .addOperation(
      Operation.payment({
        destination: recipientAddress,
        asset: resolveAsset(asset),
        amount: normaliseAmount(amount),
      })
    )
    .setTimeout(timeout)
    .build();

  return signTransaction(transaction.toXDR(), {
    networkPassphrase,
    address: senderPublicKey,
  });
}

export default buildInnerTransaction;
