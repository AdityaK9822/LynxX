"use client";

import { useState } from "react";
import { toast as sonnerToast } from "sonner";
import { 
  ShieldCheck, 
  Lock, 
  Clock, 
  UserCheck, 
  Copy, 
  Check, 
  Sparkles, 
  ArrowRight, 
  Info, 
  RefreshCw,
  ExternalLink
} from "lucide-react";
import { connectWallet } from "./Wallet";
import { depositEscrow, ESCROW_CONTRACT_ID } from "../lib/escrowContract";

export default function CreateEscrow({ address }) {
  const [token, setToken] = useState("USDC");
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [title, setTitle] = useState("");
  const [releaseCondition, setReleaseCondition] = useState("manual"); // "manual" | "timelock" | "milestone"
  const [timelockDuration, setTimelockDuration] = useState("7"); // in days
  const [inspectionPeriod, setInspectionPeriod] = useState("2"); // in days
  const [isGenerating, setIsGenerating] = useState(false);
  const [txStatus, setTxStatus] = useState("idle"); // "idle" | "connecting" | "preparing" | "signing" | "submitting" | "confirming" | "success" | "error"
  const [generatedLink, setGeneratedLink] = useState(null);
  const [copied, setCopied] = useState(false);

  // Approximate USD conversion rates for UI display
  const tokenRates = {
    USDC: 1.0,
    XLM: 0.328,
    EURC: 1.08,
  };

  const usdValue = amount && !isNaN(amount) ? (parseFloat(amount) * tokenRates[token]).toFixed(2) : "0.00";

  const getStatusLabel = () => {
    switch (txStatus) {
      case "connecting":
        return "Connecting Wallet...";
      case "preparing":
        return "Simulating Transaction...";
      case "signing":
        return "Awaiting Wallet Signature...";
      case "submitting":
        return "Submitting to Soroban RPC...";
      case "confirming":
        return "Confirming On-Chain...";
      default:
        return "Generating Link...";
    }
  };

  const handleGenerateLink = async (e) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      sonnerToast.error("Please enter a valid token amount.");
      return;
    }

    setIsGenerating(true);
    let activeAddress = address;

    try {
      if (!activeAddress) {
        setTxStatus("connecting");
        activeAddress = await connectWallet();
      }

      setTxStatus("preparing");
      const { hash } = await depositEscrow({
        senderAddress: activeAddress,
        amount: amount,
        token: token,
        contractId: ESCROW_CONTRACT_ID,
        onStatusUpdate: (status) => setTxStatus(status),
      });

      const formState = {
        creatorAddress: activeAddress,
        token,
        amount: parseFloat(amount),
        usdEquivalent: parseFloat(usdValue),
        recipient: recipient.trim() || "Anyone with link",
        title: title.trim() || "Escrow Agreement",
        releaseCondition,
        timelockDays: releaseCondition === "timelock" ? parseInt(timelockDuration, 10) : null,
        inspectionDays: releaseCondition === "manual" ? parseInt(inspectionPeriod, 10) : null,
        createdAt: new Date().toISOString(),
        txHash: hash,
      };

      console.log("Create Escrow Deposit Tx Hash:", hash);

      const origin = typeof window !== "undefined" ? window.location.origin : "https://lynxx.app";
      const fakeUrl = `${origin}/claim?c=${ESCROW_CONTRACT_ID}&amt=${amount}&token=${token}&from=${activeAddress}`;

      setGeneratedLink({
        url: fakeUrl,
        id: ESCROW_CONTRACT_ID,
        details: formState,
        txHash: hash,
      });

      setTxStatus("success");
      sonnerToast.success("Soroban escrow deposit confirmed!");
    } catch (err) {
      console.error("Escrow deposit error:", err);
      setTxStatus("error");
      sonnerToast.error(err.message || "Failed to submit deposit transaction.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink.url);
    setCopied(true);
    sonnerToast.success("Escrow link copied! Opening claim page...");
    setTimeout(() => setCopied(false), 2500);
    if (typeof window !== "undefined") {
      window.open(generatedLink.url, "_blank");
    }
  };

  const handleReset = () => {
    setGeneratedLink(null);
    setAmount("");
    setRecipient("");
    setTitle("");
    setIsGenerating(false);
  };

  return (
    <div className="escrow-container">
      <div className="escrow-header mb-24">
        <div className="flex items-center gap-3 mb-8">
          <div className="escrow-badge">
            <ShieldCheck size={16} className="text-cyan-400" />
            <span>Trustless Smart Escrow</span>
          </div>
          <span className="badge-testnet">Soroban Protocol</span>
        </div>
        <h1 className="escrow-title">Create Escrow Link</h1>
        <p className="escrow-subtitle">
          Lock funds securely in an on-chain smart contract. Share the generated link with your counterparty to commence work or trade.
        </p>
      </div>

      <div className="escrow-grid">
        {/* Left Column: Input Form */}
        <div className="escrow-card main-form-card">
          <form onSubmit={handleGenerateLink}>
            {/* Title / Description */}
            <div className="send-field mb-20">
              <label className="escrow-field-label">
                <span>Escrow Title / Memo</span>
                <span className="text-muted text-xs">Optional</span>
              </label>
              <div className="send-input-wrap">
                <input
                  id="escrow-title-input"
                  type="text"
                  placeholder="e.g. Website Design Milestone 1"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
            </div>

            {/* Token & Amount Input */}
            <div className="send-field mb-20">
              <label className="escrow-field-label">
                <span>Deposit Token & Amount</span>
              </label>
              <div className="escrow-amount-row">
                <div className="send-input-wrap amount-wrap flex-1">
                  <input
                    id="escrow-amount-input"
                    type="number"
                    step="any"
                    min="0"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                  <span className="bento-usd-suffix">≈ ${usdValue} USD</span>
                </div>

                <div className="escrow-token-selector">
                  {["USDC", "XLM", "EURC"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={`token-chip ${token === t ? "active" : ""}`}
                      onClick={() => setToken(t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Counterparty / Recipient Address */}
            <div className="send-field mb-20">
              <label className="escrow-field-label">
                <span>Counterparty Stellar Address</span>
                <span className="text-muted text-xs">Optional (Default: Anyone with link)</span>
              </label>
              <div className="send-input-wrap">
                <input
                  id="escrow-recipient-input"
                  type="text"
                  placeholder="G... or leave blank for open claim"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                />
              </div>
            </div>

            {/* Release Condition Toggle Selector */}
            <div className="send-field mb-24">
              <label className="mb-12 block">Release Condition</label>
              <div className="release-condition-grid">
                {/* Manual Release */}
                <div
                  className={`release-option-card ${releaseCondition === "manual" ? "selected" : ""}`}
                  onClick={() => setReleaseCondition("manual")}
                >
                  <div className="release-option-header">
                    <UserCheck size={18} className="release-icon" />
                    <span className="release-title">Manual Release</span>
                    <input
                      type="radio"
                      name="releaseCondition"
                      checked={releaseCondition === "manual"}
                      onChange={() => setReleaseCondition("manual")}
                    />
                  </div>
                  <p className="release-desc">
                    Buyer inspects and manually confirms payment release upon satisfactory delivery.
                  </p>
                </div>

                {/* Time-locked */}
                <div
                  className={`release-option-card ${releaseCondition === "timelock" ? "selected" : ""}`}
                  onClick={() => setReleaseCondition("timelock")}
                >
                  <div className="release-option-header">
                    <Clock size={18} className="release-icon" />
                    <span className="release-title">Time-locked</span>
                    <input
                      type="radio"
                      name="releaseCondition"
                      checked={releaseCondition === "timelock"}
                      onChange={() => setReleaseCondition("timelock")}
                    />
                  </div>
                  <p className="release-desc">
                    Funds auto-release or unlock after a specified duration expires.
                  </p>
                </div>
              </div>

              {/* Conditional options based on release type */}
              {releaseCondition === "timelock" && (
                <div className="mt-16 sub-option-box">
                  <label className="text-xs mb-8 block text-muted">Time-lock Duration</label>
                  <div className="flex gap-2">
                    {["1", "3", "7", "14", "30"].map((days) => (
                      <button
                        key={days}
                        type="button"
                        className={`duration-chip ${timelockDuration === days ? "active" : ""}`}
                        onClick={() => setTimelockDuration(days)}
                      >
                        {days} Days
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {releaseCondition === "manual" && (
                <div className="mt-16 sub-option-box">
                  <label className="text-xs mb-8 block text-muted">Inspection Window (Before Buyer Dispute Expiration)</label>
                  <div className="flex gap-2">
                    {["1", "2", "5", "7"].map((days) => (
                      <button
                        key={days}
                        type="button"
                        className={`duration-chip ${inspectionPeriod === days ? "active" : ""}`}
                        onClick={() => setInspectionPeriod(days)}
                      >
                        {days} Days Inspection
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Primary Action Button */}
            <button
              id="btn-generate-escrow"
              type="submit"
              className="btn btn-gradient btn-full btn-lg"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <span className="spinner"></span> {getStatusLabel()}
                </>
              ) : (
                <>
                  <Sparkles size={18} /> Generate Escrow Link <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Info & Generated Link Preview */}
        <div className="escrow-col-side">
          {generatedLink ? (
            /* Generated Link Result Card */
            <div className="escrow-card generated-link-card">
              <div className="flex items-center gap-2 mb-16 text-emerald-400">
                <Check size={20} />
                <h3 className="text-lg font-semibold text-white">Escrow Link Ready!</h3>
              </div>

              <p className="text-xs text-muted mb-16">
                Share this link with your seller or counterparty. Funds will be deposited upon link authorization.
              </p>

              <div className="link-output-box mb-20">
                <a
                  href={generatedLink.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-url-text hover:underline"
                  title="Click to open claim page"
                >
                  <span className="truncate">
                    {generatedLink.url}
                  </span>
                </a>
                <button
                  type="button"
                  className="btn-copy-icon"
                  onClick={handleCopyLink}
                  title="Copy full link"
                >
                  {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                </button>
              </div>

              <div className="escrow-summary-table mb-20">
                {generatedLink.txHash && (
                  <div className="summary-row">
                    <span className="summary-label">Soroban Tx</span>
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${generatedLink.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="summary-value text-xs text-purple-400 hover:underline flex items-center gap-1 font-mono"
                    >
                      {generatedLink.txHash.slice(0, 6)}...{generatedLink.txHash.slice(-6)} <ExternalLink size={12} />
                    </a>
                  </div>
                )}
                <div className="summary-row">
                  <span className="summary-label">Amount</span>
                  <span className="summary-value font-bold text-white">
                    {generatedLink.details.amount} {generatedLink.details.token}
                  </span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Condition</span>
                  <span className="summary-value capitalize text-cyan-400">
                    {generatedLink.details.releaseCondition === "manual" ? "Manual Release" : "Time-locked"}
                  </span>
                </div>
                {generatedLink.details.releaseCondition === "timelock" && (
                  <div className="summary-row">
                    <span className="summary-label">Lock Duration</span>
                    <span className="summary-value text-amber-400">
                      {generatedLink.details.timelockDays} Days
                    </span>
                  </div>
                )}
                <div className="summary-row">
                  <span className="summary-label">Counterparty</span>
                  <span className="summary-value text-xs text-muted truncate max-w-[140px]">
                    {generatedLink.details.recipient}
                  </span>
                </div>
              </div>

              <div className="escrow-card-actions">
                <button
                  type="button"
                  className="btn btn-gradient btn-full mb-12"
                  onClick={handleCopyLink}
                >
                  {copied ? "Copied & Opening..." : "Copy Escrow Link"}
                </button>
                <button
                  type="button"
                  className="btn btn-glass-secondary btn-full text-xs justify-center"
                  onClick={handleReset}
                  title="Create Another Escrow"
                >
                  <RefreshCw size={14} /> Create Another Escrow
                </button>
              </div>
            </div>
          ) : (
            /* Explainer Side Card */
            <div className="escrow-card info-side-card">
              <div className="info-card-header mb-16">
                <Lock size={28} className="text-purple-400 mb-8" />
                <h3 className="text-lg font-semibold text-white">How Escrow Links Work</h3>
              </div>

              <ul className="escrow-steps-list">
                <li>
                  <div className="step-badge">1</div>
                  <div>
                    <h4 className="font-medium text-white text-sm">Set Terms & Amount</h4>
                    <p className="text-xs text-muted">Choose your token amount and release condition (manual or time-locked).</p>
                  </div>
                </li>
                <li>
                  <div className="step-badge">2</div>
                  <div>
                    <h4 className="font-medium text-white text-sm">Share Escrow Link</h4>
                    <p className="text-xs text-muted">Send the unique URL to your freelancer, buyer, or trading partner.</p>
                  </div>
                </li>
                <li>
                  <div className="step-badge">3</div>
                  <div>
                    <h4 className="font-medium text-white text-sm">Lock & Release</h4>
                    <p className="text-xs text-muted">Funds are held safely in a Soroban smart contract until conditions are met.</p>
                  </div>
                </li>
              </ul>

              <div className="escrow-security-note mt-20">
                <Info size={16} className="text-cyan-400 flex-shrink-0" />
                <span className="text-xs text-muted">
                  Non-custodial: funds are stored directly in Soroban contracts with zero intermediary access.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
