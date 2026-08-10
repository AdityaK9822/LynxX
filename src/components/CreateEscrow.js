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
  ArrowUpRight,
  Info, 
  RefreshCw 
} from "lucide-react";

import { submitEscrowDeposit, DEFAULT_ESCROW_CONTRACT_ID } from "../lib/escrowContract";

export default function CreateEscrow({ address }) {
  const [token, setToken] = useState("USDC");
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [title, setTitle] = useState("");
  const [releaseCondition, setReleaseCondition] = useState("manual"); // "manual" | "timelock" | "milestone"
  const [timelockDuration, setTimelockDuration] = useState("7"); // in days
  const [inspectionPeriod, setInspectionPeriod] = useState("2"); // in days
  const [isGenerating, setIsGenerating] = useState(false);
  const [txStatusMsg, setTxStatusMsg] = useState("");
  const [generatedLink, setGeneratedLink] = useState(null);
  const [copied, setCopied] = useState(false);

  // Approximate USD conversion rates for UI display
  const tokenRates = {
    USDC: 1.0,
    XLM: 0.328,
    EURC: 1.08,
  };

  const usdValue = amount && !isNaN(amount) ? (parseFloat(amount) * tokenRates[token]).toFixed(2) : "0.00";

  const handleGenerateLink = async (e) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      sonnerToast.error("Please enter a valid token amount.");
      return;
    }

    setIsGenerating(true);
    setTxStatusMsg("Preparing Soroban deposit...");

    try {
      const depositResult = await submitEscrowDeposit({
        senderAddress: address,
        contractId: DEFAULT_ESCROW_CONTRACT_ID,
        token,
        amount: parseFloat(amount),
        recipient: recipient.trim() || "Anyone with link",
        title: title.trim() || "Escrow Agreement",
        releaseCondition,
        timelockDays: releaseCondition === "timelock" ? parseInt(timelockDuration, 10) : null,
        inspectionDays: releaseCondition === "manual" ? parseInt(inspectionPeriod, 10) : null,
        onStateChange: (state) => {
          if (state.message) setTxStatusMsg(state.message);
          if (state.step === "connecting") {
            sonnerToast.info("Connecting Stellar wallet...");
          } else if (state.step === "signing") {
            sonnerToast.info("Please approve deposit in your wallet.");
          } else if (state.step === "submitting") {
            sonnerToast.info("Submitting transaction to Soroban RPC...");
          }
        },
      });

      const origin = typeof window !== "undefined" ? window.location.origin : "https://lynxx.app";
      const escContractId = depositResult.contractId || DEFAULT_ESCROW_CONTRACT_ID;
      const claimUrl = `${origin}/claim?c=${escContractId}&amt=${amount}&token=${token}${depositResult.senderAddress ? `&from=${depositResult.senderAddress}` : ""}`;

      setGeneratedLink({
        url: claimUrl,
        id: escContractId,
        txHash: depositResult.txHash,
        details: {
          creatorAddress: depositResult.senderAddress,
          token,
          amount: parseFloat(amount),
          usdEquivalent: parseFloat(usdValue),
          recipient: recipient.trim() || "Anyone with link",
          title: title.trim() || "Escrow Agreement",
          releaseCondition,
          timelockDays: releaseCondition === "timelock" ? parseInt(timelockDuration, 10) : null,
          inspectionDays: releaseCondition === "manual" ? parseInt(inspectionPeriod, 10) : null,
          createdAt: new Date().toISOString(),
        },
      });

      sonnerToast.success("Soroban escrow deposit submitted & link generated!");
    } catch (err) {
      console.error("Escrow deposit error:", err);
      const msg = err?.message || "Failed to submit deposit transaction to Soroban smart contract.";
      sonnerToast.error(msg);
    } finally {
      setIsGenerating(false);
      setTxStatusMsg("");
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
              <div className="escrow-amount-row mb-2">
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
                  <span className="bento-usd-suffix text-cyan-300 font-mono font-medium text-xs px-2.5 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/20">
                    ≈ ${usdValue} USD
                  </span>
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
              <div className="flex justify-between items-center text-[11px] text-muted px-1">
                <span>Rate: 1 {token} ≈ ${tokenRates[token]} USD</span>
                <span className="text-cyan-400/80 font-mono">Live Oracle Feed</span>
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
                  <span className="spinner"></span> {txStatusMsg || "Processing Soroban Deposit..."}
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
                    {origin}/claim?c={generatedLink.id.slice(0, 6)}...&amp;amt={generatedLink.details.amount}
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
                {generatedLink.txHash && (
                  <div className="summary-row">
                    <span className="summary-label">Soroban Tx Hash</span>
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${generatedLink.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="summary-value text-xs font-mono text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      {generatedLink.txHash.slice(0, 6)}...{generatedLink.txHash.slice(-4)}
                      <ArrowUpRight size={12} />
                    </a>
                  </div>
                )}
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
            <div className="escrow-card info-side-card border border-purple-500/20 bg-gradient-to-b from-purple-950/20 to-black/40">
              <div className="info-card-header mb-20 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center">
                  <Lock size={20} className="text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white leading-snug">How Escrow Links Work</h3>
                  <span className="text-[11px] text-purple-300/80 font-mono">Soroban Trustless Protocol</span>
                </div>
              </div>

              <ul className="escrow-steps-list space-y-4">
                <li className="flex gap-3">
                  <div className="step-badge w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center justify-center flex-shrink-0">1</div>
                  <div>
                    <h4 className="font-semibold text-white text-sm">Set Terms & Amount</h4>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">Choose token amount and release condition (manual inspection or time-locked).</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="step-badge w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/40 text-purple-300 font-bold text-xs flex items-center justify-center flex-shrink-0">2</div>
                  <div>
                    <h4 className="font-semibold text-white text-sm">Share Escrow Link</h4>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">Send the unique link to your counterparty to commence work or trade.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="step-badge w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-center flex-shrink-0">3</div>
                  <div>
                    <h4 className="font-semibold text-white text-sm">Lock & Authorize Release</h4>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">Funds remain safely locked in Soroban smart contracts until authorized for payout.</p>
                  </div>
                </li>
              </ul>

              <div className="escrow-security-note mt-6 p-3.5 rounded-xl bg-black/60 border border-white/10 flex items-start gap-2.5">
                <ShieldCheck size={18} className="text-cyan-400 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-white font-medium">Non-custodial:</strong> Funds are locked directly in WASM smart contract state with zero intermediary access.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
