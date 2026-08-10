/**
 * Gasless transaction relayer. Accepts a signed (but un-submitted) inner
 * transaction envelope from the client, wraps it in a CAP-0015 fee bump paid
 * for by the backend's funded operational wallet, and submits it to Horizon.
 */

import {
  FeeBumpTransaction,
  Horizon,
  Keypair,
  Networks,
  Transaction,
  TransactionBuilder,
} from '@stellar/stellar-sdk';

function json(body: unknown, status: number): Response {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: Request): Promise<Response> {
  const relayerSecret = process.env.RELAYER_SECRET_KEY;
  if (!relayerSecret) {
    return json({ error: 'Relayer is not configured' }, 500);
  }

  let body: { xdr?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Request body must be JSON' }, 400);
  }

  const { xdr } = body;
  if (typeof xdr !== 'string' || !xdr) {
    return json({ error: 'xdr (base64 transaction envelope) is required' }, 400);
  }

  const networkPassphrase =
    process.env.NETWORK_PASSPHRASE || Networks.TESTNET;

  let innerTransaction: Transaction | FeeBumpTransaction;
  try {
    innerTransaction = TransactionBuilder.fromXDR(xdr, networkPassphrase);
  } catch {
    return json({ error: 'xdr is not a valid transaction envelope' }, 400);
  }

  if (innerTransaction instanceof FeeBumpTransaction) {
    return json({ error: 'xdr must be an inner transaction, not already a fee bump' }, 400);
  }

  const server = new Horizon.Server(
    process.env.HORIZON_URL || 'https://horizon-testnet.stellar.org'
  );

  const feeSource = Keypair.fromSecret(relayerSecret);

  let feeBumpTransaction: FeeBumpTransaction;
  try {
    const baseFee = await server.fetchBaseFee();
    const feeBumpFee = String(
      (innerTransaction.operations.length + 1) * baseFee
    );

    feeBumpTransaction = TransactionBuilder.buildFeeBumpTransaction(
      feeSource,
      feeBumpFee,
      innerTransaction,
      networkPassphrase
    );
    feeBumpTransaction.sign(feeSource);
  } catch (error) {
    return json(
      { error: error instanceof Error ? error.message : 'Failed to build fee bump transaction' },
      400
    );
  }

  try {
    const result = await server.submitTransaction(feeBumpTransaction);
    return json({ hash: result.hash, ledger: result.ledger }, 200);
  } catch (error) {
    const extras = (error as { response?: { data?: { extras?: { result_codes?: unknown } } } })
      ?.response?.data?.extras;
    if (extras?.result_codes) {
      return json({ error: 'Transaction rejected', result_codes: extras.result_codes }, 400);
    }
    return json(
      { error: error instanceof Error ? error.message : 'Failed to submit transaction' },
      502
    );
  }
}
