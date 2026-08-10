"use client";

import { useState, useRef } from "react";
import QRCode from "react-qr-code";
import { Copy, CheckCircle2, AlertCircle, Download, QrCode as QrIcon, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function Receive({ address }) {
    const [copied, setCopied] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const qrWrapperRef = useRef(null);

    const handleCopy = () => {
        if (!address) return;
        navigator.clipboard.writeText(address);
        setCopied(true);
        toast.success("Address copied to clipboard!");
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
                    // White clean background for crisp QR scanning
                    ctx.fillStyle = "#ffffff";
                    ctx.fillRect(0, 0, canvas.width, canvas.height);

                    // Draw QR Code
                    ctx.drawImage(image, padding, padding, size, size);

                    // Convert to PNG & Download
                    const pngUrl = canvas.toDataURL("image/png");
                    const downloadLink = document.createElement("a");
                    const shortAddr = address.length > 10 ? `${address.slice(0, 6)}_${address.slice(-4)}` : "wallet";
                    downloadLink.href = pngUrl;
                    downloadLink.download = `lynxx-qr-${shortAddr}.png`;
                    document.body.appendChild(downloadLink);
                    downloadLink.click();
                    document.body.removeChild(downloadLink);
                    URL.revokeObjectURL(blobURL);

                    toast.success("QR Code downloaded as PNG!");
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
            <div className="receive-container" style={{ width: '100%', maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: '500', marginBottom: '24px', color: '#fff' }}>Receive Funds</h2>
                <div className="empty-state" style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <AlertCircle size={48} style={{ color: 'rgba(255,255,255,0.2)', marginBottom: '16px', display: 'inline-block' }} />
                    <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '8px' }}>No wallet connected</h3>
                    <p style={{ color: 'rgba(255,255,255,0.6)' }}>Connect your wallet to see your receive address and QR code.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="receive-container" style={{ width: '100%', maxWidth: '840px', margin: '0 auto', padding: '40px 20px' }}>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '600', color: '#fff', margin: 0 }}>Receive XLM & Tokens</h2>
                    <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem', marginTop: '4px' }}>
                        Share your QR code or Stellar public address to receive assets directly.
                    </p>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
                    <ShieldCheck size={14} className="text-cyan-400" />
                    <span>Non-Custodial</span>
                </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                
                {/* Card 1: QR Code & Download */}
                <div className="receive-card" style={{
                    padding: '32px',
                    background: 'linear-gradient(135deg, rgba(16, 18, 27, 0.9) 0%, rgba(10, 11, 16, 0.95) 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
                }}>
                    <div 
                        ref={qrWrapperRef}
                        id="receive-qr-wrapper"
                        style={{
                            background: '#ffffff',
                            padding: '20px',
                            borderRadius: '20px',
                            marginBottom: '20px',
                            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(56, 189, 248, 0.15)',
                            border: '1px solid rgba(255, 255, 255, 0.2)'
                        }}
                    >
                        <QRCode
                            id="receive-qr-svg"
                            value={address}
                            size={200}
                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                            viewBox={`0 0 256 256`}
                        />
                    </div>

                    <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.85rem', textAlign: 'center', marginBottom: '20px' }}>
                        Scan QR code with Freighter, Albedo, or any Stellar wallet.
                    </p>

                    <button
                        id="btn-download-qr"
                        type="button"
                        onClick={handleDownloadQR}
                        disabled={isDownloading}
                        className="btn btn-glass-secondary"
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: '12px',
                            borderRadius: '14px',
                            fontSize: '0.92rem',
                            fontWeight: '600',
                            background: 'rgba(56, 189, 248, 0.12)',
                            color: '#38bdf8',
                            border: '1px solid rgba(56, 189, 248, 0.3)',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        <Download size={18} />
                        <span>{isDownloading ? "Generating PNG..." : "Download QR Code"}</span>
                    </button>
                </div>

                {/* Card 2: Address Details & Actions */}
                <div className="receive-card" style={{
                    padding: '32px',
                    background: 'linear-gradient(135deg, rgba(16, 18, 27, 0.9) 0%, rgba(10, 11, 16, 0.95) 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
                }}>
                    <div>
                        <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '16px', fontWeight: '600' }}>Your Stellar Public Key</h3>
                        
                        <div style={{
                            background: 'rgba(0, 0, 0, 0.45)',
                            padding: '18px',
                            borderRadius: '16px',
                            border: '1px solid rgba(56, 189, 248, 0.2)',
                            marginBottom: '20px',
                            wordBreak: 'break-all',
                            fontFamily: 'monospace',
                            color: '#38bdf8',
                            fontSize: '0.88rem',
                            lineHeight: '1.6',
                            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4)'
                        }}>
                            {address}
                        </div>

                        <button 
                            id="btn-copy-receive-address"
                            onClick={handleCopy}
                            className={`btn ${copied ? 'btn-glass-primary' : 'btn-primary'}`}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                padding: '14px',
                                borderRadius: '14px',
                                fontSize: '0.95rem',
                                fontWeight: '700',
                                transition: 'all 0.2s',
                                background: copied ? 'rgba(34, 197, 94, 0.2)' : 'linear-gradient(135deg, #0284c7 0%, #7e22ce 100%)',
                                color: copied ? '#22c55e' : '#ffffff',
                                border: copied ? '1px solid rgba(34, 197, 94, 0.5)' : '1px solid rgba(255,255,255,0.2)',
                                cursor: 'pointer',
                                boxShadow: copied ? 'none' : '0 8px 24px rgba(2, 132, 199, 0.3)'
                            }}
                        >
                            {copied ? (
                                <>
                                    <CheckCircle2 size={18} /> Address Copied!
                                </>
                            ) : (
                                <>
                                    <Copy size={18} /> Copy Public Key
                                </>
                            )}
                        </button>
                    </div>

                    <div style={{
                        marginTop: '24px',
                        padding: '16px',
                        background: 'rgba(234, 179, 8, 0.08)',
                        border: '1px solid rgba(234, 179, 8, 0.2)',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px'
                    }}>
                        <AlertCircle size={20} color="#eab308" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.82rem', margin: 0, lineHeight: '1.5' }}>
                            <strong style={{ color: '#eab308' }}>Network Warning:</strong> Send only Stellar (XLM) or native SAC assets on Testnet/Mainnet to this public key.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
