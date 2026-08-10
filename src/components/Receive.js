"use client";

import { useState, useRef } from "react";
import QRCode from "react-qr-code";
import { 
  Copy, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  ShieldCheck, 
  Sparkles, 
  ExternalLink,
  QrCode as QrIcon,
  Zap,
  Check
} from "lucide-react";
import { toast } from "sonner";

export default function Receive({ address }) {
    const [copied, setCopied] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const qrWrapperRef = useRef(null);

    // Custom Glassmorphic Toast Notification
    const showRichToast = (title, description, icon) => {
        toast.custom(() => (
            <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-[#0d0f17]/95 border border-cyan-500/40 backdrop-blur-2xl shadow-[0_12px_40px_rgba(56,189,248,0.3)] text-white min-w-[300px]">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center flex-shrink-0 text-cyan-300 shadow-[0_0_15px_rgba(56,189,248,0.3)]">
                    {icon}
                </div>
                <div className="flex-1">
                    <h4 className="font-bold text-sm text-white tracking-wide">{title}</h4>
                    <p className="text-xs text-slate-300 mt-0.5 leading-snug">{description}</p>
                </div>
            </div>
        ), { duration: 3500 });
    };

    const handleCopy = () => {
        if (!address) return;
        navigator.clipboard.writeText(address);
        setCopied(true);
        showRichToast(
            "Public Key Copied!",
            "Address saved to your clipboard for instant sharing.",
            <CheckCircle2 size={20} className="text-emerald-400" />
        );
        setTimeout(() => setCopied(false), 2200);
    };

    const handleDownloadQR = () => {
        if (!address || !qrWrapperRef.current) return;
        
        setIsDownloading(true);

        try {
            const svgElement = qrWrapperRef.current.querySelector("svg");
            if (!svgElement) {
                toast.error("QR Code element not found.");
                setIsDownloading(false);
                return;
            }

            const svgString = new XMLSerializer().serializeToString(svgElement);
            const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
            const URL = window.URL || window.webkitURL || window;
            const blobURL = URL.createObjectURL(svgBlob);

            const image = new Image();
            image.onload = () => {
                const canvas = document.createElement("canvas");
                const padding = 50;
                const size = 600;
                canvas.width = size + padding * 2;
                canvas.height = size + padding * 2;

                const ctx = canvas.getContext("2d");
                if (ctx) {
                    // Premium White background for 100% scanning accuracy
                    ctx.fillStyle = "#ffffff";
                    ctx.fillRect(0, 0, canvas.width, canvas.height);

                    // Draw QR Code
                    ctx.drawImage(image, padding, padding, size, size);

                    // Convert to PNG & Download
                    const pngUrl = canvas.toDataURL("image/png");
                    const downloadLink = document.createElement("a");
                    const shortAddr = address.length > 10 ? `${address.slice(0, 6)}_${address.slice(-4)}` : "wallet";
                    downloadLink.href = pngUrl;
                    downloadLink.download = `lynxx-receive-qr-${shortAddr}.png`;
                    document.body.appendChild(downloadLink);
                    downloadLink.click();
                    document.body.removeChild(downloadLink);
                    URL.revokeObjectURL(blobURL);

                    showRichToast(
                        "QR Code Downloaded!",
                        "High-res PNG saved to your downloads folder.",
                        <Download size={20} className="text-cyan-300" />
                    );
                }
                setIsDownloading(false);
            };

            image.onerror = () => {
                toast.error("Failed to generate QR Code image for download.");
                setIsDownloading(false);
            };

            image.src = blobURL;
        } catch (err) {
            console.error("QR download error:", err);
            toast.error("Could not download QR Code.");
            setIsDownloading(false);
        }
    };

    if (!address) {
        return (
            <div className="receive-container max-w-4xl mx-auto px-4 py-10">
                <div className="bento-card p-12 text-center rounded-3xl bg-[#0a0b10]/90 border border-white/15 backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,0,0,0.9)]">
                    <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-6">
                        <AlertCircle size={32} className="text-amber-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">No Wallet Connected</h3>
                    <p className="text-slate-300 text-sm max-w-md mx-auto mb-6">
                        Connect your Freighter or Stellar wallet to view your public receiving address and export QR code.
                    </p>
                </div>
            </div>
        );
    }

    const shortAddr = `${address.slice(0, 6)}...${address.slice(-6)}`;

    return (
        <div className="receive-container max-w-4xl mx-auto px-4 py-8 relative">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 mb-3 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
                        <Sparkles size={14} className="text-cyan-400 animate-pulse" />
                        <span>Soroban SAC Non-Custodial Receive</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                        Receive XLM & Assets
                    </h1>
                    <p className="text-slate-300 text-sm mt-1 font-medium">
                        Scan the high-precision QR code or copy your public key to accept payments instantly.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <a
                        href={`https://stellar.expert/explorer/testnet/account/${address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.05] border border-white/15 text-xs text-slate-300 hover:text-white hover:border-purple-500/40 transition-all font-mono"
                    >
                        <span>Stellar Explorer</span>
                        <ExternalLink size={14} />
                    </a>
                </div>
            </div>

            {/* Main Hero Bento Grid Container */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                
                {/* Left Column: Centerpiece QR Code Stage */}
                <div className="lg:col-span-5 bento-card p-8 rounded-3xl bg-[#0a0b10]/95 border border-white/15 backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,0,0,0.95)] flex flex-col items-center justify-between relative overflow-hidden group">
                    {/* Ambient Glow Effects */}
                    <div className="absolute -top-20 -left-20 w-56 h-56 bg-cyan-500/20 rounded-full blur-[90px] pointer-events-none"></div>
                    <div className="absolute -bottom-20 -right-20 w-56 h-56 bg-purple-500/20 rounded-full blur-[90px] pointer-events-none"></div>

                    <div className="w-full flex items-center justify-between mb-4 relative z-10">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <QrIcon size={14} className="text-cyan-400" />
                            <span>Scan Code</span>
                        </span>
                        <span className="text-[11px] font-mono text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 rounded-full">
                            SVG Vector
                        </span>
                    </div>

                    {/* QR Code Stage Wrapper */}
                    <div 
                        ref={qrWrapperRef}
                        className="w-full max-w-[240px] p-5 rounded-2xl bg-white shadow-[0_0_35px_rgba(56,189,248,0.25)] border-2 border-cyan-400/40 relative z-10 transition-transform duration-300 group-hover:scale-[1.02] flex items-center justify-center"
                    >
                        <QRCode
                            id="receive-qr-svg"
                            value={address}
                            size={200}
                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                            viewBox={`0 0 256 256`}
                        />
                    </div>

                    <p className="text-slate-400 text-xs text-center mt-4 mb-6 leading-relaxed relative z-10">
                        Scan with <span className="text-white font-semibold">Freighter</span>, <span className="text-white font-semibold">Albedo</span>, or any mobile Stellar wallet.
                    </p>

                    {/* Primary QR Download Action Button */}
                    <button
                        id="btn-download-qr"
                        type="button"
                        onClick={handleDownloadQR}
                        disabled={isDownloading}
                        className="w-full py-3.5 px-4 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-cyan-500 via-purple-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 shadow-[0_10px_30px_rgba(56,189,248,0.35)] border border-white/20 transition-all duration-300 flex items-center justify-center gap-2 relative z-10 cursor-pointer disabled:opacity-50"
                    >
                        <Download size={18} />
                        <span>{isDownloading ? "Generating PNG..." : "Download High-Res PNG"}</span>
                    </button>
                </div>

                {/* Right Column: Public Key Display & Action Hub */}
                <div className="lg:col-span-7 bento-card p-8 rounded-3xl bg-[#0a0b10]/95 border border-white/15 backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,0,0,0.95)] flex flex-col justify-between relative overflow-hidden">
                    {/* Ambient Glow */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>

                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <span>Stellar Public Address</span>
                            </h3>
                            <span className="text-xs text-slate-400 font-mono">ED25519</span>
                        </div>

                        {/* Monospace Address Display Box */}
                        <div className="p-4 rounded-2xl bg-black/80 border border-cyan-500/30 mb-6 font-mono text-sm text-cyan-300 break-all leading-relaxed shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] relative group">
                            <div className="flex justify-between items-center mb-1 text-[11px] text-slate-400 font-sans">
                                <span>Active Wallet Key</span>
                                <span className="text-cyan-400 font-mono">{shortAddr}</span>
                            </div>
                            <p className="text-white select-all font-mono text-xs md:text-sm tracking-wide">{address}</p>
                        </div>

                        {/* Primary Copy Button */}
                        <button 
                            id="btn-copy-receive-address"
                            type="button"
                            onClick={handleCopy}
                            className={`w-full py-4 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all duration-300 cursor-pointer ${
                                copied 
                                    ? "bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 shadow-[0_0_20px_rgba(34,197,94,0.3)]" 
                                    : "bg-white/10 hover:bg-white/15 border border-white/20 text-white shadow-[0_10px_25px_rgba(0,0,0,0.5)]"
                            }`}
                        >
                            {copied ? (
                                <>
                                    <Check size={20} className="text-emerald-400" />
                                    <span>Public Key Copied to Clipboard!</span>
                                </>
                            ) : (
                                <>
                                    <Copy size={20} />
                                    <span>Copy Public Key Address</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Network Safety Note */}
                    <div className="mt-8 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3">
                        <AlertCircle size={20} className="text-amber-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-slate-300 leading-relaxed">
                            <strong className="text-amber-300 font-semibold">Asset Security Notice:</strong> Send only native Stellar (XLM) or Soroban smart contract tokens (USDC/EURC) on Testnet to this public key.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
