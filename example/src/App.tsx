import { useRef, useState } from "react";
import {
  Horizon,
  TransactionBuilder,
  Networks,
  Asset,
  Operation,
} from "@stellar/stellar-sdk";
import { initLynxx, LynxxWalletError } from "lynxx-wallet-sdk";

// Create the provider once and reuse it for the app's lifetime.
const wallet = initLynxx({ network: "TESTNET" });
const server = new Horizon.Server("https://horizon-testnet.stellar.org");

export default function App() {
  const [address, setAddress] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");
  const destinationRef = useRef<HTMLInputElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);

  async function handleConnect() {
    setStatus("Connecting...");
    try {
      const connected = await wallet.connect();
      setAddress(connected);
      setStatus(`Connected: ${connected}`);
    } catch (error) {
      if (error instanceof LynxxWalletError) {
        setStatus(`Connection failed (${error.code}): ${error.message}`);
      } else {
        setStatus(`Connection failed: ${String(error)}`);
      }
    }
  }

  function handleDisconnect() {
    wallet.disconnect();
    setAddress(null);
    setStatus("Disconnected.");
  }

  async function handleSend() {
    const destination = destinationRef.current?.value.trim();
    const amount = amountRef.current?.value.trim();

    if (!address) {
      setStatus("Connect a wallet first.");
      return;
    }
    if (!destination || !amount) {
      setStatus("Enter a destination address and amount.");
      return;
    }

    setStatus("Building transaction...");
    try {
      const account = await server.loadAccount(address);
      const fee = await server.fetchBaseFee();

      const transaction = new TransactionBuilder(account, {
        fee: fee.toString(),
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          Operation.payment({
            destination,
            asset: Asset.native(),
            amount,
          }),
        )
        .setTimeout(30)
        .build();

      setStatus("Waiting for signature in wallet...");
      const signedXdr = await wallet.signTransaction(transaction.toXDR());
      const signedTx = TransactionBuilder.fromXDR(signedXdr, Networks.TESTNET);

      setStatus("Submitting transaction...");
      const result = await server.submitTransaction(signedTx);
      setStatus(`Payment sent! Hash: ${result.hash}`);
    } catch (error) {
      if (error instanceof LynxxWalletError) {
        setStatus(`Signing failed (${error.code}): ${error.message}`);
      } else {
        setStatus(`Payment failed: ${String(error)}`);
      }
    }
  }

  return (
    <main style={{ fontFamily: "sans-serif", maxWidth: 480, margin: "3rem auto" }}>
      <h1>lynxx-wallet-sdk example</h1>
      <p>Demonstrates connecting a Stellar wallet and signing a testnet payment.</p>

      {!address ? (
        <button onClick={handleConnect}>Connect Wallet</button>
      ) : (
        <>
          <p>
            <strong>Address:</strong> {address}
          </p>
          <button onClick={handleDisconnect}>Disconnect</button>

          <fieldset style={{ marginTop: "1.5rem" }}>
            <legend>Send testnet XLM</legend>
            <div>
              <label>
                Destination
                <input ref={destinationRef} type="text" placeholder="G..." style={{ display: "block", width: "100%" }} />
              </label>
            </div>
            <div style={{ marginTop: "0.5rem" }}>
              <label>
                Amount (XLM)
                <input ref={amountRef} type="text" placeholder="1" style={{ display: "block", width: "100%" }} />
              </label>
            </div>
            <button style={{ marginTop: "0.75rem" }} onClick={handleSend}>
              Sign & Send
            </button>
          </fieldset>
        </>
      )}

      {status && <p style={{ marginTop: "1.5rem", wordBreak: "break-all" }}>{status}</p>}
    </main>
  );
}
