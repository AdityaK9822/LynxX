import { NextRequest, NextResponse } from 'next/server';
import * as StellarSdk from '@stellar/stellar-sdk';

// Rate limiting (10 requests per minute per IP)
const rateLimit = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxRequests = 10;

  const record = rateLimit.get(ip);
  
  if (!record) {
    rateLimit.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (now > record.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  rateLimit.set(ip, record);
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Max 10 requests per minute.' },
        { status: 429 }
      );
    }

    // Parse request
    const body = await request.json();
    const { innerTxXdr } = body;

    if (!innerTxXdr) {
      return NextResponse.json(
        { error: 'Missing innerTxXdr in request body' },
        { status: 400 }
      );
    }

    // Get relayer keypair
    const relayerSecret = process.env.RELAYER_SECRET_KEY;
    if (!relayerSecret) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const relayerKeypair = StellarSdk.Keypair.fromSecret(relayerSecret);

    // Network
    const network = process.env.STELLAR_NETWORK || 'testnet';
    const passphrase = network === 'mainnet' 
      ? StellarSdk.Networks.PUBLIC 
      : StellarSdk.Networks.TESTNET;

    // Parse XDR - use TransactionBuilder.fromXDR to get a Transaction object
    let transaction;
    try {
      transaction = StellarSdk.TransactionBuilder.fromXDR(innerTxXdr, passphrase);
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid XDR format' },
        { status: 400 }
      );
    }

    // Check if transaction is already a FeeBumpTransaction
    if (transaction instanceof StellarSdk.FeeBumpTransaction) {
      return NextResponse.json(
        { error: 'Transaction is already a fee bump transaction' },
        { status: 400 }
      );
    }

    // Build fee bump transaction - fee must be a string
    const feeBumpTx = StellarSdk.TransactionBuilder.buildFeeBumpTransaction(
      relayerKeypair,
      '100',
      transaction,
      passphrase
    );

    // Submit
    const serverUrl = network === 'mainnet' 
      ? 'https://horizon.stellar.org' 
      : 'https://horizon-testnet.stellar.org';
    
    const server = new StellarSdk.Horizon.Server(serverUrl);
    const response = await server.submitTransaction(feeBumpTx);

    return NextResponse.json({
      success: true,
      txHash: response.hash,
      network: network,
    });

  } catch (error: any) {
    console.error('Relay error:', error);

    if (error.response?.data?.extras?.result_codes) {
      return NextResponse.json(
        { 
          error: 'Transaction failed',
          details: error.response.data.extras.result_codes,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
