"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast as sonnerToast } from "sonner";
import { 
  Copy, 
  Check, 
  ExternalLink, 
  AlertTriangle, 
  ArrowRight, 
  Wallet,
  Lock,
  ArrowUpRight,
  CheckCircle2,
  FileCheck
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
    <div className="claim-page-wrapper relative overflow-hidden min-h-screen bg-black text-white flex flex-col justify-between">
      {/* Ambient background glow orbs */}
      <div className="lp-orb lp-orb-1" />
      <div className="lp-orb lp-orb-2" />

      {/* Streamlined Header: LynxX Logo Only (Clicking navigates to Home) */}
      <header className="w-full py-8 flex justify-center items-center relative z-20">
        <Link href="/" title="Return to LynxX Home">
          <Image 
            src={logoImg} 
            alt="LynxX Logo" 
            width={140} 
            height={42} 
            priority 
            className="h-10 w-auto cursor-pointer hover:opacity-85 transition-opacity" 
          />
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="claim-main-content relative z-20 max-w-3xl w-full mx-auto px-4 py-8 flex-1 flex flex-col items-center justify-center">
        {isValidLink ? (
          /* Valid Escrow Claim Card */
          <div className="bento-card claim-card w-full max-w-xl p-8 md:p-10 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-2xl shadow-2xl">
            {/* Sender Pill */}
            {fromAddress && (
              <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-white/[0.04] border border-white/10 text-xs">
                <span className="text-white/50">Sent by:</span>
                <span className="font-mono text-white">{shortAddr(fromAddress)}</span>
              </div>
            )}

            {/* Headline Message */}
            <h1 className="claim-amount-headline text-3xl md:text-4xl font-extrabold text-white mb-2 leading-tight tracking-tight">
              You have been sent <span className="highlight-amt bg-gradient-to-r from-cyan-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">{amountNumber.toLocaleString()} {token}</span> in escrow.
            </h1>

            <p className="text-white/50 text-sm mb-8">
              ≈ ${usdValue} USD locked in Soroban Smart Contract
            </p>

            {/* Contract ID Information Box */}
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

            {/* Primary Action Button */}
            <div className="claim-action-wrap mb-8">
              <button
                id="btn-claim-wallet"
                type="button"
                className="cf-hero-cta w-full justify-center text-base py-4"
                onClick={handleMockConnectClaim}
              >
                <Wallet size={20} />
                <span>Connect Wallet to Claim</span>
                <div className="cf-hero-cta-icon"><ArrowRight size={18} strokeWidth={2.5} /></div>
              </button>
              <p className="text-xs text-white/40 text-center mt-3 flex items-center justify-center gap-1">
                <Lock size={12} /> Non-custodial: Connect your Stellar wallet (Freighter / Albedo) to authorize release.
              </p>
            </div>

            {/* Systematic How Claiming Works Section */}
            <div className="claim-explainer-box p-5 rounded-2xl bg-white/[0.02] border border-white/5">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <span>Systematic Claiming Process</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="process-step p-3 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 font-bold text-xs flex items-center justify-center">1</span>
                    <Wallet size={14} className="text-white/40" />
                  </div>
                  <h5 className="text-xs font-semibold text-white">Connect Wallet</h5>
                  <p className="text-[11px] text-white/40 leading-relaxed">Sign in with your Freighter or Albedo Stellar wallet.</p>
                </div>

                <div className="process-step p-3 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 font-bold text-xs flex items-center justify-center">2</span>
                    <FileCheck size={14} className="text-white/40" />
                  </div>
                  <h5 className="text-xs font-semibold text-white">Verify Terms</h5>
                  <p className="text-[11px] text-white/40 leading-relaxed">Review smart contract release parameters.</p>
                </div>

                <div className="process-step p-3 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center">3</span>
                    <CheckCircle2 size={14} className="text-white/40" />
                  </div>
                  <h5 className="text-xs font-semibold text-white">Instant Payout</h5>
                  <p className="text-[11px] text-white/40 leading-relaxed">Funds unlock directly into your non-custodial wallet.</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Malformed / Missing Parameters Error State View */
          <div className="bento-card claim-card claim-error-card w-full max-w-md p-8 md:p-10 text-center rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-2xl shadow-2xl">
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

      {/* Simple Footer */}
      <footer className="w-full py-6 text-center text-xs text-white/30 relative z-20">
        LynxX Non-Custodial Smart Escrow Protocol
      </footer>
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
