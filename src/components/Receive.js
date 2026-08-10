"use client";

import { useState, useRef } from "react";
import QRCode from "react-qr-code";
import { 
  Copy, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  ExternalLink, 
  QrCode as QrIcon,
  Check,
  ShieldCheck
} from "lucide-react";
import { toast } from "sonner";

export default function Receive({ address }) {
    const [copied, setCopied] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const qrWrapperRef = useRef(null);

    // Elegant Dark Pastel Toast Notification
    const showPastelToast = (title, description, icon) => {
        toast.custom(() => (
            <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-[#121420]/95 border border-purple-500/20 backdrop-blur-2xl shadow-[0_12px_36px_rgba(0,0,0,0.6)] text-white min-w-[300px]">
                <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-400/25 flex items-center justify-center flex-shrink-0 text-purple-300">
                    {icon}
                </div>
                <div className="flex-1">
                    <h4 className="font-semibold text-sm text-purple-100 tracking-wide">{title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5 leading-snug">{description}</p>
                </div>
            </div>
        ), { duration: 3200 });
    };

    const handleCopy = () => {
        if (!address) return;
        navigator.clipboard.writeText(address);
        setCopied(true);
        showPastelToast(
            "Address Copied",
            "Public key saved to your clipboard.",
            <CheckCircle2 size={18} className="text-emerald-300" />
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
                const padding = 45;
                const size = 550;
                canvas.width = size + padding * 2;
                canvas.height = size + padding * 2;

                const ctx = canvas.getContext("2d");
                if (ctx) {
                    // Crisp white background for 100% scanning accuracy
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

                    showPastelToast(
                        "QR Image Saved",
                        "High-resolution PNG saved to your downloads.",
                        <Download size={18} className="text-purple-300" />
                    );
                }
                setIsDownloading(false);
            };

            image.onerror = () => {
                toast.error("Failed to generate QR image.");
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
                <div className="bento-card p-12 text-center rounded-3xl bg-[#0e1017]/90 border border-white/10 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-5">
                        <AlertCircle size={28} className="text-amber-300" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No Wallet Connected</h3>
                    <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
                        Connect your wallet to view your public receiving address and QR code.
                    </p>
                </div>
            </div>
        );
    }

    const shortAddr = `${address.slice(0, 6)}...${address.slice(-6)}`;

    return (
        <div className="receive-container max-w-4xl mx-auto px-4 py-8 relative">
            {/* Elegant Muted Pastel Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 rounded-xl bg-purple-950/40 border border-purple-500/20 text-purple-300 text-xs font-medium">
                        <ShieldCheck size={14} className="text-purple-400" />
                        <span>Non-Custodial · Stellar Network</span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-100 tracking-tight">
                        Receive XLM & Assets
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Scan the QR code or share your public address to receive payments.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <a
                        href={`https://stellar.expert/explorer/testnet/account/${address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-slate-300 hover:text-white hover:border-white/20 transition-all font-mono"
                    >
                        <span>Stellar Explorer</span>
                        <ExternalLink size={13} />
                    </a>
                </div>
            </div>

            {/* Main Hero Grid Container */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-stretch">
                
                {/* Left Column: QR Code Container */}
                <div className="lg:col-span-5 bento-card p-7 rounded-3xl bg-[#0f111a]/95 border border-white/10 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col items-center justify-between relative overflow-hidden">
                    <div className="w-full flex items-center justify-between mb-4">
                        <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                            <QrIcon size={14} className="text-purple-400" />
                            <span>Scan Code</span>
                        </span>
                        <span className="text-[11px] font-mono text-slate-400 bg-white/[0.04] border border-white/10 px-2.5 py-0.5 rounded-lg">
                            SVG Vector
                        </span>
                    </div>

                    {/* Clean QR Stage */}
                    <div 
                        ref={qrWrapperRef}
                        className="w-full max-w-[220px] p-4.5 rounded-2xl bg-white shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-white/20 flex items-center justify-center transition-transform duration-200 hover:scale-[1.01]"
                    >
                        <QRCode
                            id="receive-qr-svg"
                            value={address}
                            size={190}
                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                            viewBox={`0 0 256 256`}
                        />
                    </div>

                    <p className="text-slate-400 text-xs text-center mt-4 mb-5 leading-relaxed">
                        Scan with <span className="text-slate-200 font-medium">Freighter</span>, <span className="text-slate-200 font-medium">Albedo</span>, or mobile Stellar wallet.
                    </p>

                    {/* Dark Pastel Primary Download Button */}
                    <button
                        id="btn-download-qr"
                        type="button"
                        onClick={handleDownloadQR}
                        disabled={isDownloading}
                        className="w-full py-3 px-4 rounded-xl font-medium text-xs text-purple-200 bg-gradient-to-r from-purple-900/40 to-indigo-900/40 hover:from-purple-900/60 hover:to-indigo-900/60 border border-purple-500/30 shadow-[0_6px_20px_rgba(139,92,246,0.15)] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                        <Download size={16} />
                        <span>{isDownloading ? "Generating PNG..." : "Download High-Res PNG"}</span>
                    </button>
                </div>

                {/* Right Column: Address & Actions Hub */}
                <div className="lg:col-span-7 bento-card p-7 rounded-3xl bg-[#0f111a]/95 border border-white/10 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col justify-between relative overflow-hidden">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-slate-100">
                                Stellar Public Key
                            </h3>
                            <span className="text-xs text-slate-400 font-mono">ED25519</span>
                        </div>

                        {/* Soft Dark Pastel Address Display Box */}
                        <div className="p-4 rounded-2xl bg-[#0a0b12] border border-white/10 mb-5 font-mono text-xs text-slate-200 break-all leading-relaxed shadow-[inset_0_2px_6px_rgba(0,0,0,0.6)]">
                            <div className="flex justify-between items-center mb-1.5 text-[11px] text-slate-400 font-sans">
                                <span>Active Wallet Key</span>
                                <span className="text-purple-300 font-mono">{shortAddr}</span>
                            </div>
                            <p className="text-slate-100 select-all font-mono text-xs md:text-sm tracking-wide leading-relaxed">{address}</p>
                        </div>

                        {/* Soft Glass Copy Button */}
                        <button 
                            id="btn-copy-receive-address"
                            type="button"
                            onClick={handleCopy}
                            className={`w-full py-3.5 px-5 rounded-xl font-medium text-xs flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${
                                copied 
                                    ? "bg-emerald-500/15 border border-emerald-500/35 text-emerald-300" 
                                    : "bg-white/[0.05] hover:bg-white/[0.08] border border-white/15 text-slate-200"
                            }`}
                        >
                            {copied ? (
                                <>
                                    <Check size={16} className="text-emerald-300" />
                                    <span>Address Copied to Clipboard</span>
                                </>
                            ) : (
                                <>
                                    <Copy size={16} />
                                    <span>Copy Public Key</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Muted Pastel Security Warning */}
                    <div className="mt-6 p-3.5 rounded-xl bg-amber-500/[0.06] border border-amber-500/15 flex items-start gap-2.5">
                        <AlertCircle size={18} className="text-amber-300/80 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-slate-300/90 leading-relaxed">
                            <strong className="text-amber-200/90 font-medium">Asset Notice:</strong> Send only native Stellar (XLM) or supported SAC tokens (USDC/EURC) on Testnet to this public address.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
