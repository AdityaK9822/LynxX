"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast as sonnerToast } from "sonner";
import { 
  ShieldCheck, 
  Copy, 
  Check, 
  ExternalLink, 
  AlertTriangle, 
  ArrowRight, 
  Info,
  Wallet,
  Lock
} from "lucide-react";
import logoImg from "../../media/LynxX.png";

function ClaimContent() {
  const searchParams = useSearchParams();
  
  const contractId = searchParams.get("c") || "";
  const rawAmt = searchParams.get("amt") || "";
  const token = (searchParams.get("token") || "USDC").toUpperCase();
  const fromAddress = searchParams.get("from") || "";

  const amountNumber = parseFloat(rawAmt);
  const isValidAmount = !isNaN(amountNumber) && amountNumber > 0;
  const isValidContract = contractId.trim().length > 0;

  const isValidLink = isValidAmount && isValidContract;

  const [copied, setCopied] = useState(false);

  // Conversion rate for USD estimate display
  const rates: Record<string, number> = { USDC: 1.0, XLM: 0.328, EURC: 1.08 };
  const usdValue = isValidAmount ? (amountNumber * (rates[token] || 1.0)).toFixed(2) : "0.00";

  const handleCopyContract = () => {
    if (!contractId) return;
    navigator.clipboard.writeText(contractId);
    setCopied(true);
    sonnerToast.success("Contract ID copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  const handleMockConnectClaim = () => {
    sonnerToast.info(
      "Wallet claiming integration will be enabled in the upcoming Soroban smart contract release.",
      { duration: 4000 }
    );
  };

  const shortAddr = (addr: string) => 
    addr.length > 14 ? `${addr.slice(0, 6)}...${addr.slice(-6)}` : addr;

  return (
    <div className="claim-page-wrapper relative overflow-hidden min-h-screen bg-black text-white">
      {/* Decorative background orbs matching LynxX landing theme */}
      <div className="lp-orb lp-orb-1" />
      <div className="lp-orb lp-orb-2" />

      {/* LynxX Platform Navigation Header */}
      <header className="w-full px-6 py-4 flex justify-between items-center relative z-10 border-b border-white/5">
        <nav className="cf-nav w-full max-w-6xl mx-auto flex justify-between items-center">
          <div className="cf-nav-left flex items-center gap-6">
            <div className="cf-nav-brand">
              <Link href="/">
                <Image className="cf-nav-logo" src={logoImg} alt="LynxX logo" width={120} height={36} priority style={{ height: "36px", width: "auto" }} />
              </Link>
            </div>
            <div className="cf-nav-pill hidden md:flex items-center gap-6 text-sm">
              <Link href="/" className="cf-nav-link text-white/60 hover:text-white transition-colors">Home</Link>
              <Link href="/docs" className="cf-nav-link text-white/60 hover:text-white transition-colors">Docs</Link>
            </div>
          </div>
          <button className="cf-nav-cta-glass" onClick={handleMockConnectClaim}>
            <span>Connect Wallet</span>
            <div className="cf-nav-cta-icon"><ArrowRight size={18} strokeWidth={2.5} /></div>
          </button>
        </nav>
      </header>

      {/* Main Container */}
      <main className="claim-main-content relative z-10 max-w-4xl mx-auto px-6 py-16 flex flex-col items-center">
        {isValidLink ? (
          /* Valid Escrow Claim Card */
          <div className="bento-card claim-card w-full max-w-xl p-8 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-2xl shadow-2xl">
            <div className="claim-badge-row flex items-center justify-between mb-6">
              <div className="escrow-badge flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
                <ShieldCheck size={16} />
                <span>On-Chain Soroban Escrow</span>
              </div>
              <span className="claim-status-tag text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-3 py-1 rounded-full">
                ● Ready to Claim
              </span>
            </div>

            {/* Sender / From info */}
            {fromAddress && (
              <div className="claim-sender-pill inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-white/[0.04] border border-white/10 text-xs">
                <span className="text-white/50">Sent by:</span>
                <span className="font-mono text-white">{shortAddr(fromAddress)}</span>
              </div>
            )}

            {/* Headline Message (Acceptance Criteria Requirement) */}
            <h1 className="claim-amount-headline text-2xl md:text-3xl font-extrabold text-white mb-2 leading-snug tracking-tight">
              You have been sent <span className="highlight-amt bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">{amountNumber.toLocaleString()} {token}</span> in escrow.
            </h1>

            <p className="text-white/50 text-sm mb-8">
              ≈ ${usdValue} USD locked trustlessly in Soroban Smart Contract
            </p>

            {/* Contract ID Information Card */}
            <div className="claim-contract-info-box p-4 mb-8 rounded-2xl bg-white/[0.02] border border-white/10">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-white/50 font-medium">Escrow Contract ID</span>
                <a 
                  href={`https://stellar.expert/explorer/testnet/contract/${contractId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-purple-400 flex items-center gap-1 hover:underline font-mono"
                >
                  Explorer <ExternalLink size={12} />
                </a>
              </div>
              <div className="link-output-box flex items-center justify-between gap-3 p-3 rounded-xl bg-black/60 border border-purple-500/30 font-mono text-xs overflow-hidden">
                <span className="text-purple-300 truncate flex-1 min-w-0">{contractId}</span>
                <button type="button" className="btn-copy-icon text-white/60 hover:text-white p-1" onClick={handleCopyContract} title="Copy Contract ID">
                  {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            {/* Primary Action Button (Acceptance Criteria Requirement: disabled/mock Connect Wallet to Claim) */}
            <div className="claim-action-wrap mb-8">
              <button
                id="btn-claim-wallet"
                type="button"
                className="cf-hero-cta w-full justify-center opacity-85 hover:opacity-100 cursor-pointer"
                onClick={handleMockConnectClaim}
              >
                <Wallet size={18} />
                <span>Connect Wallet to Claim</span>
                <div className="cf-hero-cta-icon"><ArrowRight size={18} strokeWidth={2.5} /></div>
              </button>
              <p className="text-xs text-white/40 text-center mt-3 flex items-center justify-center gap-1">
                <Lock size={12} /> Non-custodial: Connect your Stellar wallet (Freighter / Albedo) to authorize release.
              </p>
            </div>

            {/* How claiming works explainer */}
            <div className="claim-explainer-box p-4 rounded-2xl bg-white/[0.02] border border-white/5 border-dashed">
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                <Info size={14} className="text-cyan-400" /> How Claiming Works
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-white/60">
                <div className="explainer-step-item flex items-center gap-2">
                  <div className="step-num-sm w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold text-[10px] flex items-center justify-center flex-shrink-0">1</div>
                  <span>Connect your Stellar Testnet wallet.</span>
                </div>
                <div className="explainer-step-item flex items-center gap-2">
                  <div className="step-num-sm w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold text-[10px] flex items-center justify-center flex-shrink-0">2</div>
                  <span>Authorize smart contract payout transaction.</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Malformed / Missing Parameters Error State View (Acceptance Criteria Requirement) */
          <div className="bento-card claim-card claim-error-card w-full max-w-md p-8 text-center rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-2xl shadow-2xl">
            <div className="error-icon-wrapper w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} className="text-amber-400" />
            </div>

            <h1 className="text-xl font-bold text-white mb-3">Invalid or Expired Escrow Link</h1>

            <p className="text-sm text-white/50 mb-6 leading-relaxed">
              This escrow link appears to be missing required parameters (contract ID or amount). Please verify the URL with the sender to obtain a valid claim link.
            </p>

            <div className="error-details-box p-4 mb-6 rounded-2xl bg-white/[0.02] border border-white/10 text-left flex flex-col gap-2">
              <div className="summary-row flex justify-between text-xs">
                <span className="text-white/40">Contract ID (c)</span>
                <span className="font-mono text-amber-400">{contractId ? shortAddr(contractId) : "Missing"}</span>
              </div>
              <div className="summary-row flex justify-between text-xs">
                <span className="text-white/40">Token Amount (amt)</span>
                <span className="font-mono text-amber-400">{rawAmt || "Missing"}</span>
              </div>
            </div>

            <Link href="/" className="cf-hero-cta w-full justify-center">
              <span>Return to LynxX Home</span>
              <div className="cf-hero-cta-icon"><ArrowRight size={18} strokeWidth={2.5} /></div>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

export default function ClaimPage() {
  return (
    <Suspense fallback={
      <div className="claim-page-wrapper flex items-center justify-center min-h-screen bg-black">
        <div className="spinner"></div>
      </div>
    }>
      <ClaimContent />
    </Suspense>
  );
}
