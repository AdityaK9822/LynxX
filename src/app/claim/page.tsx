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
  CheckCircle2,
  FileCheck,
  ShieldCheck
} from "lucide-react";

import logoImg from "../../media/LynxX.png";
import mainBG from "../../media/mainBG.png";
import { submitEscrowRelease, DEFAULT_ESCROW_CONTRACT_ID } from "../../lib/escrowContract";

function ClaimContent() {
  const searchParams = useSearchParams();
  
  const contractId = searchParams.get("c") || "";
  const rawAmt = searchParams.get("amt") || "";
  const token = (searchParams.get("token") || "USDC").toUpperCase();
  const fromAddress = searchParams.get("from") || "";

  const amountNumber = parseFloat(rawAmt);
  const isValidAmount = Number.isFinite(amountNumber) && amountNumber > 0;
  const isValidContract = contractId.trim().length > 0;

  const isValidLink = isValidAmount && isValidContract;

  const [copied, setCopied] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimStatusMsg, setClaimStatusMsg] = useState("");
  const [claimResult, setClaimResult] = useState<{
    txHash: string;
    claimedAt: string;
    recipientAddress: string;
    contractId: string;
  } | null>(null);

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

  const handleConnectAndClaim = async () => {
    if (isClaiming) return;
    setIsClaiming(true);
    setClaimStatusMsg("Initiating claim...");

    try {
      const result = await submitEscrowRelease({
        contractId: contractId || DEFAULT_ESCROW_CONTRACT_ID,
        onStateChange: (state) => {
          if (state.message) setClaimStatusMsg(state.message);
          if (state.step === "connecting") {
            sonnerToast.info("Connecting Stellar wallet...");
          } else if (state.step === "signing") {
            sonnerToast.info("Please approve release transaction in your wallet.");
          } else if (state.step === "submitting") {
            sonnerToast.info("Submitting transaction to Soroban RPC...");
          }
        },
      });

      setClaimResult(result);
      sonnerToast.success("Soroban release transaction confirmed! Funds unlocked.");
    } catch (err: any) {
      console.error("Escrow release error:", err);
      const msg = err?.message || "Failed to submit release transaction to Soroban smart contract.";
      sonnerToast.error(msg);
    } finally {
      setIsClaiming(false);
      setClaimStatusMsg("");
    }
  };

  const shortAddr = (addr: string) => 
    addr.length > 14 ? `${addr.slice(0, 6)}...${addr.slice(-6)}` : addr;

  return (
    <section 
      className="lp-hero-section min-h-screen flex flex-col justify-between overflow-x-hidden"
      style={{ position: 'relative', background: '#000' }}
    >
      {/* 3D Fluid Glass Background matching LynxX Home page */}
      <Image
        src={mainBG}
        alt=""
        fill
        priority
        aria-hidden="true"
        style={{ objectFit: 'cover', objectPosition: 'center', zIndex: 0 }}
        quality={85}
      />

      {/* Navigation Header - Pixel-perfect match with Home Page navbar */}
      <nav className="cf-nav" style={{ position: 'relative', zIndex: 10 }}>
        <div className="cf-nav-left">
          <div className="cf-nav-brand">
            <Link href="/" title="Return to LynxX Home">
              <Image 
                className="cf-nav-logo" 
                src={logoImg} 
                alt="LynxX logo" 
                width={120} 
                height={36} 
                priority 
                style={{ cursor: 'pointer', height: '36px', width: 'auto' }} 
              />
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="claim-main-content relative z-10 max-w-3xl w-full mx-auto px-4 py-8 flex-1 flex flex-col items-center justify-center">
        {isValidLink ? (
          /* Valid Escrow Claim Card with Dark Glass Opacity for Effortless Readability */
          <div className="bento-card claim-card w-full max-w-xl p-8 md:p-10 rounded-3xl bg-[#0a0b10]/95 border border-white/15 backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,0,0,0.95)]">
            {/* Soroban Protocol Header Badge */}
            <div className="flex items-center justify-between mb-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
                <ShieldCheck size={14} className="text-cyan-400" />
                <span>Soroban Smart Escrow</span>
              </div>
              <span className="text-[11px] font-mono text-purple-300 bg-purple-500/15 border border-purple-500/30 px-2.5 py-0.5 rounded-full">
                Stellar Testnet
              </span>
            </div>
            {/* Sender Pill */}
            {fromAddress && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-6 rounded-full bg-white/[0.06] border border-white/15 text-xs">
                <span className="text-slate-300">Sent by:</span>
                <span className="font-mono text-white font-medium">{shortAddr(fromAddress)}</span>
              </div>
            )}

            {/* Headline Message */}
            <h1 className="claim-amount-headline text-3xl md:text-4xl font-extrabold text-white mb-2 leading-tight tracking-tight">
              You have been sent <span className="highlight-amt bg-gradient-to-r from-cyan-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">{amountNumber.toLocaleString()} {token}</span> in escrow.
            </h1>

            <p className="text-slate-300 text-sm mb-8 font-medium">
              ≈ ${usdValue} USD locked in Soroban Smart Contract
            </p>

            {/* Contract ID Information Box */}
            <div className="claim-contract-info-box p-4 mb-8 rounded-2xl bg-black/60 border border-white/15">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-slate-300 font-medium">Escrow Contract ID</span>
                <a 
                  href={`https://stellar.expert/explorer/testnet/contract/${contractId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-purple-400 flex items-center gap-1 hover:underline font-mono"
                >
                  Explorer <ExternalLink size={12} />
                </a>
              </div>
              <div className="link-output-box flex items-center justify-between gap-3 p-3 rounded-xl bg-black/80 border border-purple-500/40 font-mono text-xs overflow-hidden">
                <span className="text-purple-300 truncate flex-1 min-w-0">{contractId}</span>
                <button type="button" className="btn-copy-icon text-white/70 hover:text-white p-1" onClick={handleCopyContract} title="Copy Contract ID">
                  {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            {/* Upgraded Primary Claim Action Button / Success Banner */}
            <div className="claim-action-wrap mb-8">
              {claimResult ? (
                <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 size={22} className="text-emerald-400" />
                    <h3 className="font-bold text-white text-base">Escrow Released Successfully!</h3>
                  </div>
                  <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                    Funds have been released from Soroban contract <span className="font-mono text-emerald-300">{shortAddr(claimResult.contractId)}</span> to your connected wallet address.
                  </p>
                  {claimResult.txHash && (
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${claimResult.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-300 hover:underline"
                    >
                      View Tx on Stellar Explorer <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              ) : (
                <>
                  <button
                    id="btn-claim-wallet"
                    type="button"
                    className="claim-action-btn"
                    onClick={handleConnectAndClaim}
                    disabled={isClaiming}
                  >
                    <Wallet size={20} />
                    <span>{isClaiming ? (claimStatusMsg || "Processing Release...") : "Connect Wallet to Claim"}</span>
                    <ArrowRight size={18} strokeWidth={2.5} />
                  </button>
                  <p className="text-xs text-slate-300 text-center mt-3 flex items-center justify-center gap-1 font-medium">
                    <Lock size={12} /> Non-custodial: Connect your Stellar wallet (Freighter / Albedo) to authorize release.
                  </p>
                  {isClaiming && (
                    <div className="mt-4 p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-between text-xs text-purple-200 animate-pulse">
                      <div className="flex items-center gap-2.5">
                        <span className="spinner w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></span>
                        <span className="font-mono text-purple-300 font-medium">{claimStatusMsg}</span>
                      </div>
                      <span className="text-[10px] font-mono uppercase bg-purple-500/20 px-2 py-0.5 rounded text-purple-200 border border-purple-500/30">
                        Soroban RPC
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Systematic How Claiming Works Section */}
            <div className="claim-explainer-box p-5 rounded-2xl bg-black/60 border border-white/15">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <span>Systematic Claiming Process</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="process-step p-3.5 rounded-xl bg-white/[0.04] border border-white/10 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-lg bg-cyan-500/25 text-cyan-300 font-bold text-xs flex items-center justify-center">1</span>
                    <Wallet size={14} className="text-white/60" />
                  </div>
                  <h5 className="text-xs font-semibold text-white">Connect Wallet</h5>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-normal">Sign in with your Freighter or Albedo Stellar wallet.</p>
                </div>

                <div className="process-step p-3.5 rounded-xl bg-white/[0.04] border border-white/10 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-lg bg-purple-500/25 text-purple-300 font-bold text-xs flex items-center justify-center">2</span>
                    <FileCheck size={14} className="text-white/60" />
                  </div>
                  <h5 className="text-xs font-semibold text-white">Verify Terms</h5>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-normal">Review smart contract release parameters.</p>
                </div>

                <div className="process-step p-3.5 rounded-xl bg-white/[0.04] border border-white/10 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-lg bg-emerald-500/25 text-emerald-300 font-bold text-xs flex items-center justify-center">3</span>
                    <CheckCircle2 size={14} className="text-white/60" />
                  </div>
                  <h5 className="text-xs font-semibold text-white">Instant Payout</h5>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-normal">Funds unlock directly into your non-custodial wallet.</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Malformed / Missing Parameters Error State View */
          <div className="bento-card claim-card claim-error-card w-full max-w-md p-8 md:p-10 text-center rounded-3xl bg-[#0a0b10]/90 border border-white/15 backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,0,0,0.95)]">
            <div className="error-icon-wrapper w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} className="text-amber-400" />
            </div>

            <h1 className="text-xl font-bold text-white mb-3">Invalid or Expired Escrow Link</h1>

            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
              This escrow link appears to be missing required parameters (contract ID or amount). Please verify the URL with the sender to obtain a valid claim link.
            </p>

            <div className="error-details-box p-4 mb-6 rounded-2xl bg-black/60 border border-white/15 text-left flex flex-col gap-2">
              <div className="summary-row flex justify-between text-xs">
                <span className="text-slate-400">Contract ID (c)</span>
                <span className="font-mono text-amber-400 font-medium">{contractId ? shortAddr(contractId) : "Missing"}</span>
              </div>
              <div className="summary-row flex justify-between text-xs">
                <span className="text-slate-400">Token Amount (amt)</span>
                <span className="font-mono text-amber-400 font-medium">{rawAmt || "Missing"}</span>
              </div>
            </div>

            <Link href="/" className="claim-action-btn justify-center">
              <span>Return to LynxX Home</span>
              <ArrowRight size={18} strokeWidth={2.5} />
            </Link>
          </div>
        )}
      </main>

      {/* Simple Footer */}
      <footer className="w-full py-6 text-center text-xs text-slate-400 relative z-10 font-medium">
        LynxX Non-Custodial Smart Escrow Protocol
      </footer>
    </section>
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
