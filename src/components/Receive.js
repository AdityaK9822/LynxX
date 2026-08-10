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
            <div className="receive-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
                <h1 className="escrow-title" style={{ fontSize: '1.8rem', fontWeight: '600', marginBottom: '8px' }}>Receive</h1>
                <div className="escrow-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
                    <p className="text-muted" style={{ fontSize: '0.95rem', margin: 0 }}>
                        Connect your wallet to view receive address and QR code.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="receive-wrapper-outer" style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 16px' }}>
            {/* Outer Glassmorphic Background Section with 3D Fluid BG Image */}
            <div 
                className="receive-section-hero" 
                style={{
                    position: 'relative',
                    borderRadius: '28px',
                    padding: '36px 32px',
                    background: 'radial-gradient(circle at 20% 20%, rgba(56, 189, 248, 0.15) 0%, rgba(168, 85, 247, 0.15) 50%, rgba(5, 6, 10, 0.95) 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    boxShadow: '0 24px 60px rgba(0, 0, 0, 0.7), inset 0 1px 1px rgba(255, 255, 255, 0.15)',
                    overflow: 'hidden'
                }}
            >
                {/* 3D Fluid Glass Hero Section Background Image */}
                <Image
                    src={mainBG}
                    alt="LynxX 3D Section Background"
                    fill
                    priority
                    aria-hidden="true"
                    style={{ objectFit: 'cover', objectPosition: 'center', opacity: 0.28, pointerEvents: 'none', zIndex: 0 }}
                />

                {/* Header */}
                <div style={{ position: 'relative', zIndex: 2, marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 className="escrow-title" style={{ fontSize: '1.8rem', fontWeight: '600', marginBottom: '6px', color: '#fff' }}>
                            Receive Funds
                        </h1>
                        <p className="text-muted" style={{ fontSize: '0.9rem', margin: 0 }}>
                            Scan QR code or copy address to receive payments.
                        </p>
                    </div>
                    <a
                        href={`https://stellar.expert/explorer/testnet/account/${address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-glass-secondary text-xs"
                        style={{ padding: '8px 14px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                        <span>Explorer</span>
                        <ExternalLink size={13} />
                    </a>
                </div>

                {/* Glassmorphism Cards Content Grid */}
                <div style={{ position: 'relative', zIndex: 2, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                    
                    {/* Left Glass Card: Framed QR Code */}
                    <div 
                        className="receive-glass-card" 
                        style={{
                            padding: '28px',
                            background: 'rgba(10, 11, 16, 0.75)',
                            backdropFilter: 'blur(24px)',
                            WebkitBackdropFilter: 'blur(24px)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            borderRadius: '24px',
                            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.65)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}
                    >
                        {/* Framed QR Box with Dedicated Image & Vibrant Gradient Overlay */}
                        <div 
                            ref={qrWrapperRef}
                            className="qr-frame-box"
                            style={{
                                position: 'relative',
                                width: '100%',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                padding: '30px 20px',
                                background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(168, 85, 247, 0.22) 50%, rgba(99, 102, 241, 0.15) 100%)',
                                border: '1px solid rgba(168, 85, 247, 0.4)',
                                borderRadius: '22px',
                                transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                                cursor: 'pointer',
                                marginBottom: '20px',
                                overflow: 'hidden'
                            }}
                        >
                            {/* Inner 3D Glass Background Image for QR Box */}
                            <Image
                                src={mainBG}
                                alt="LynxX QR Box Background"
                                fill
                                aria-hidden="true"
                                style={{ objectFit: 'cover', objectPosition: 'center', opacity: 0.45, pointerEvents: 'none' }}
                            />

                            {/* Vibrant Radial Ambient Glow Overlay */}
                            <div style={{
                                position: 'absolute',
                                inset: 0,
                                background: 'radial-gradient(circle at center, rgba(56, 189, 248, 0.3) 0%, rgba(168, 85, 247, 0.25) 50%, transparent 80%)',
                                pointerEvents: 'none'
                            }} />

                            {/* Crisp White QR Stage */}
                            <div style={{
                                position: 'relative',
                                zIndex: 2,
                                background: '#ffffff',
                                padding: '18px',
                                borderRadius: '18px',
                                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.65), 0 0 25px rgba(56, 189, 248, 0.3)',
                                border: '1px solid rgba(255, 255, 255, 0.3)'
                            }}>
                                <QRCode
                                    id="receive-qr-svg"
                                    value={address}
                                    size={190}
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
                            className="btn btn-gradient btn-full"
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px 16px', fontSize: '0.9rem' }}
                        >
                            <Download size={16} />
                            <span>{isDownloading ? "Generating..." : "Download QR Code"}</span>
                        </button>
                    </div>

                    {/* Right Glass Card: Address Details & Actions */}
                    <div 
                        className="receive-glass-card" 
                        style={{
                            padding: '28px',
                            background: 'rgba(10, 11, 16, 0.75)',
                            backdropFilter: 'blur(24px)',
                            WebkitBackdropFilter: 'blur(24px)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            borderRadius: '24px',
                            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.65)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                        }}
                    >
                        <div>
                            <label className="escrow-field-label" style={{ marginBottom: '12px', display: 'block' }}>
                                <span>Stellar Public Address</span>
                            </label>

                            {/* Input Wrap Address Display */}
                            <div className="send-input-wrap mb-20" style={{ padding: '14px 16px', background: 'rgba(0,0,0,0.5)', borderRadius: '14px', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
                                <p style={{
                                    fontFamily: 'monospace',
                                    color: '#38bdf8',
                                    fontSize: '0.88rem',
                                    wordBreak: 'break-all',
                                    margin: 0,
                                    lineHeight: '1.6'
                                }}>
                                    {address}
                                </p>
                            </div>

                            {/* Copy Button */}
                            <button 
                                id="btn-copy-receive-address"
                                type="button"
                                onClick={handleCopy}
                                className={`btn ${copied ? 'btn-glass-secondary' : 'btn-gradient'} btn-full`}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px 16px', fontSize: '0.9rem', marginBottom: '24px' }}
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
                        <div style={{
                            padding: '14px 16px',
                            background: 'rgba(234, 179, 8, 0.06)',
                            border: '1px solid rgba(234, 179, 8, 0.18)',
                            borderRadius: '14px'
                        }}>
                            <p className="text-muted text-xs" style={{ margin: 0, lineHeight: '1.5' }}>
                                <strong style={{ color: '#eab308' }}>Note:</strong> Send only Stellar (XLM) or supported assets on Testnet to this public address.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
