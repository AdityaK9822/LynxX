"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import QRCode from "react-qr-code";
import { Copy, Check, Download, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import mainBG from "../media/mainBG.png";

export default function Receive({ address }) {
    const [copied, setCopied] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const qrWrapperRef = useRef(null);

    const handleCopy = () => {
        if (!address) return;
        navigator.clipboard.writeText(address);
        setCopied(true);
        toast.success("Address copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
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
                const padding = 40;
                const size = 500;
                canvas.width = size + padding * 2;
                canvas.height = size + padding * 2;

                const ctx = canvas.getContext("2d");
                if (ctx) {
                    ctx.fillStyle = "#ffffff";
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(image, padding, padding, size, size);

                    const pngUrl = canvas.toDataURL("image/png");
                    const downloadLink = document.createElement("a");
                    const shortAddr = address.length > 10 ? `${address.slice(0, 6)}_${address.slice(-4)}` : "wallet";
                    downloadLink.href = pngUrl;
                    downloadLink.download = `lynxx-qr-${shortAddr}.png`;
                    document.body.appendChild(downloadLink);
                    downloadLink.click();
                    document.body.removeChild(downloadLink);
                    URL.revokeObjectURL(blobURL);

                    toast.success("QR Code downloaded as PNG");
                }
                setIsDownloading(false);
            };

            image.onerror = () => {
                toast.error("Failed to generate QR image");
                setIsDownloading(false);
            };

            image.src = blobURL;
        } catch (err) {
            console.error("QR download error:", err);
            toast.error("Could not download QR Code");
            setIsDownloading(false);
        }
    };

    if (!address) {
        return (
            <div className="receive-page-hero relative min-h-screen w-full py-12 px-4 flex flex-col items-center justify-center overflow-hidden" style={{ background: '#000' }}>
                <Image
                    src={mainBG}
                    alt=""
                    fill
                    priority
                    aria-hidden="true"
                    style={{ objectFit: 'cover', objectPosition: 'center', opacity: 0.85, zIndex: 0 }}
                    quality={85}
                />
                <div className="relative z-10 max-w-xl w-full mx-auto bento-card p-10 rounded-3xl bg-[#0a0b10]/90 border border-white/15 backdrop-blur-3xl text-center shadow-[0_20px_60px_rgba(0,0,0,0.95)]">
                    <h1 className="text-2xl font-bold text-white mb-2">Receive XLM & Assets</h1>
                    <p className="text-slate-300 text-sm">
                        Connect your wallet to view your receiving address and QR code.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div 
            className="receive-page-hero relative w-full min-h-[calc(100vh-80px)] py-8 px-4 flex flex-col justify-center items-center overflow-hidden"
            style={{ position: 'relative', background: '#000' }}
        >
            {/* 3D Fluid Glass Full-Bleed Page Background Image matching LynxX Claim & Home page */}
            <Image
                src={mainBG}
                alt="LynxX 3D Background"
                fill
                priority
                aria-hidden="true"
                style={{ objectFit: 'cover', objectPosition: 'center', opacity: 0.85, zIndex: 0 }}
                quality={85}
            />

            {/* Content Container Floating on Top of 3D Fluid BG */}
            <div className="relative z-10 max-w-4xl w-full mx-auto">
                {/* Header */}
                <div className="mb-7 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-1">
                            Receive Funds
                        </h1>
                        <p className="text-slate-300 text-sm font-medium">
                            Scan QR code or copy address to receive XLM and Stellar assets.
                        </p>
                    </div>
                    <a
                        href={`https://stellar.expert/explorer/testnet/account/${address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-glass-secondary text-xs px-4 py-2 rounded-xl inline-flex items-center gap-1.5 font-mono text-slate-300 hover:text-white border border-white/15 backdrop-blur-xl"
                    >
                        <span>Explorer</span>
                        <ExternalLink size={13} />
                    </a>
                </div>

                {/* Floating Glassmorphism Content Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                    
                    {/* Left Glass Card: Framed QR Code */}
                    <div 
                        className="md:col-span-5 bento-card p-7 rounded-3xl bg-[#0a0b10]/90 border border-white/15 backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,0,0,0.95)] flex flex-col items-center justify-between"
                    >
                        {/* Framed QR Box */}
                        <div 
                            ref={qrWrapperRef}
                            className="qr-frame-box w-full p-6 mb-5 rounded-2xl bg-gradient-to-br from-cyan-500/15 via-purple-500/20 to-indigo-500/15 border border-purple-500/40 flex justify-center items-center relative overflow-hidden transition-all duration-300 cursor-pointer"
                        >
                            {/* Inner 3D Glass Accent Image for QR Box */}
                            <Image
                                src={mainBG}
                                alt=""
                                fill
                                aria-hidden="true"
                                style={{ objectFit: 'cover', objectPosition: 'center', opacity: 0.4, pointerEvents: 'none' }}
                            />

                            {/* Crisp White QR Stage */}
                            <div className="relative z-10 p-4 rounded-2xl bg-white shadow-[0_12px_40px_rgba(0,0,0,0.65)] border border-white/30">
                                <QRCode
                                    id="receive-qr-svg"
                                    value={address}
                                    size={185}
                                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                    viewBox={`0 0 256 256`}
                                />
                            </div>
                        </div>

                        {/* Primary Gradient Download Button */}
                        <button
                            id="btn-download-qr"
                            type="button"
                            onClick={handleDownloadQR}
                            disabled={isDownloading}
                            className="w-full py-3.5 px-4 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-cyan-500 via-purple-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 border border-white/20 shadow-[0_10px_30px_rgba(56,189,248,0.35)] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                            <Download size={16} />
                            <span>{isDownloading ? "Generating..." : "Download QR Code"}</span>
                        </button>
                    </div>

                    {/* Right Glass Card: Address Details & Actions */}
                    <div 
                        className="md:col-span-7 bento-card p-7 rounded-3xl bg-[#0a0b10]/90 border border-white/15 backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,0,0,0.95)] flex flex-col justify-between"
                    >
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-bold text-white">Stellar Public Address</h3>
                                <span className="text-xs text-slate-400 font-mono">ED25519</span>
                            </div>

                            {/* Input Wrap Address Display */}
                            <div className="p-4 mb-6 rounded-2xl bg-black/60 border border-white/15 font-mono text-sm text-cyan-300 break-all leading-relaxed shadow-[inset_0_2px_6px_rgba(0,0,0,0.6)]">
                                <p className="text-white select-all font-mono text-xs md:text-sm tracking-wide leading-relaxed">{address}</p>
                            </div>

                            {/* Copy Button */}
                            <button 
                                id="btn-copy-receive-address"
                                type="button"
                                onClick={handleCopy}
                                className={`w-full py-3.5 px-5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer ${
                                    copied 
                                        ? "bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 shadow-[0_0_20px_rgba(34,197,94,0.3)]" 
                                        : "bg-white/10 hover:bg-white/15 border border-white/20 text-white shadow-[0_10px_25px_rgba(0,0,0,0.5)]"
                                }`}
                            >
                                {copied ? (
                                    <>
                                        <Check size={16} className="text-emerald-400" />
                                        <span>Copied to Clipboard</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy size={16} />
                                        <span>Copy Address</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Minimal Warning Footer */}
                        <div className="mt-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
                            <p className="text-xs text-slate-300 leading-relaxed">
                                <strong className="text-amber-300 font-semibold">Asset Notice:</strong> Send only native Stellar (XLM) or supported Soroban tokens (USDC/EURC) on Testnet to this public address.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
