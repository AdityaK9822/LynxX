// @vitest-environment node
import { describe, expect, test } from 'vitest';
import {
  Keypair,
  Networks,
  Transaction,
  TransactionBuilder,
} from '@stellar/stellar-sdk';

import {
  buildInnerTransaction,
  type SignTransaction,
} from './buildInnerTransaction';

const sender = Keypair.random();
const recipient = Keypair.random();
const issuer = Keypair.random();
const relayer = Keypair.random();

const USDC = { code: 'USDC', issuer: issuer.publicKey() };

/** Stands in for the wallet: signs locally so tests need no extension. */
const signWith =
  (keypair: Keypair): SignTransaction =>
  async (xdr, { networkPassphrase }) => {
    const tx = new Transaction(xdr, networkPassphrase);
    tx.sign(keypair);
    return tx.toXDR();
  };

/** Narrows the operation union so the asset fields are reachable. */
function paymentOp(tx: Transaction) {
  const op = tx.operations[0];
  if (op.type !== 'payment') {
    throw new Error(`expected a payment operation, got ${op.type}`);
  }
  return op;
}

function build(amount: string | number, overrides = {}) {
  return buildInnerTransaction(
    sender.publicKey(),
    recipient.publicKey(),
    amount,
    USDC,
    { sequence: '10', signTransaction: signWith(sender), ...overrides }
  );
}

describe('buildInnerTransaction', () => {
  test('builds a signed USDC payment envelope', async () => {
    const tx = new Transaction(await build('25.5'), Networks.TESTNET);

    expect(tx.source).toBe(sender.publicKey());
    expect(tx.operations).toHaveLength(1);
    expect(tx.operations[0]).toMatchObject({
      type: 'payment',
      destination: recipient.publicKey(),
      // Stellar stores amounts as stroops, so the round trip pads to 7 places.
      amount: '25.5000000',
    });
    expect(paymentOp(tx).asset.getCode()).toBe('USDC');
    expect(paymentOp(tx).asset.getIssuer()).toBe(issuer.publicKey());
  });

  test('the returned envelope actually carries the signature', async () => {
    const tx = new Transaction(await build('1'), Networks.TESTNET);

    expect(tx.signatures).toHaveLength(1);
    expect(sender.verify(tx.hash(), tx.signatures[0].signature())).toBe(true);
  });

  test('survives being wrapped in a fee bump with the signature intact', async () => {
    const inner = new Transaction(await build('1'), Networks.TESTNET);

    const feeBump = TransactionBuilder.buildFeeBumpTransaction(
      relayer,
      '200',
      inner,
      Networks.TESTNET
    );

    // CAP-0015 validates the inner envelope in full, so an unsigned inner
    // would build here but fail on-network with txBAD_AUTH.
    expect(feeBump.innerTransaction.signatures).toHaveLength(1);
    expect(feeBump.feeSource).toBe(relayer.publicKey());
  });

  test('stamps sequence + 1, matching what Horizon hands back', async () => {
    const tx = new Transaction(
      await build('1', { sequence: '42' }),
      Networks.TESTNET
    );

    expect(tx.sequence).toBe('43');
  });

  test('rejects a zero amount', async () => {
    await expect(build('0')).rejects.toThrow(/greater than 0/);
  });

  test('rejects a negative amount', async () => {
    await expect(build('-5')).rejects.toThrow(/greater than 0/);
  });

  test('rejects more than 7 decimal places', async () => {
    await expect(build('1.12345678')).rejects.toThrow(/greater than 0/);
  });

  test('requires the sequence number rather than guessing one', async () => {
    await expect(build('1', { sequence: undefined })).rejects.toThrow(
      /sequence is required/
    );
  });

  test('rejects a malformed sender or recipient', async () => {
    await expect(
      buildInnerTransaction('not-a-key', recipient.publicKey(), '1', USDC, {
        sequence: '10',
        signTransaction: signWith(sender),
      })
    ).rejects.toThrow(/Sender is not a valid Stellar public key/);
  });

  test('rejects a non-native asset with no issuer', async () => {
    await expect(build('1', {})).resolves.toBeTypeOf('string');
    await expect(
      buildInnerTransaction(
        sender.publicKey(),
        recipient.publicKey(),
        '1',
        { code: 'USDC' },
        { sequence: '10', signTransaction: signWith(sender) }
      )
    ).rejects.toThrow(/requires an issuer/);
  });

  test('accepts the native asset shorthand', async () => {
    const xdr = await buildInnerTransaction(
      sender.publicKey(),
      recipient.publicKey(),
      '1',
      'native',
      { sequence: '10', signTransaction: signWith(sender) }
    );

    const tx = new Transaction(xdr, Networks.TESTNET);
    expect(paymentOp(tx).asset.isNative()).toBe(true);
  });

  test('passes the network through to the signer', async () => {
    const seen: string[] = [];
    const spy: SignTransaction = async (xdr, opts) => {
      seen.push(opts.networkPassphrase);
      return signWith(sender)(xdr, opts);
    };

    await build('1', {
      networkPassphrase: Networks.PUBLIC,
      signTransaction: spy,
    });

    expect(seen).toEqual([Networks.PUBLIC]);
  });
});
