"use client";

import { useState, useRef } from "react";
import QRCode from "react-qr-code";
import { Copy, Check, Download, ExternalLink } from "lucide-react";
import { toast } from "sonner";

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
        <div className="receive-container" style={{ maxWidth: '840px', margin: '0 auto', padding: '40px 20px' }}>
            {/* Minimal Header */}
            <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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

            {/* Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                
                {/* Left Card: QR Code with Framed Hover Container */}
                <div className="escrow-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
                    
                    {/* Framed QR Box */}
                    <div 
                        ref={qrWrapperRef}
                        className="qr-frame-box"
                        style={{
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: '24px',
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            borderRadius: '20px',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                            marginBottom: '20px'
                        }}
                    >
                        <div style={{
                            background: '#ffffff',
                            padding: '16px',
                            borderRadius: '16px',
                            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)'
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

                {/* Right Card: Address & Actions */}
                <div className="escrow-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                        <label className="escrow-field-label" style={{ marginBottom: '12px', display: 'block' }}>
                            <span>Stellar Public Address</span>
                        </label>

                        {/* Input Wrap Address Display */}
                        <div className="send-input-wrap mb-20" style={{ padding: '14px 16px', background: 'rgba(0,0,0,0.4)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
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
                        background: 'rgba(234, 179, 8, 0.05)',
                        border: '1px solid rgba(234, 179, 8, 0.15)',
                        borderRadius: '14px'
                    }}>
                        <p className="text-muted text-xs" style={{ margin: 0, lineHeight: '1.5' }}>
                            <strong style={{ color: '#eab308' }}>Note:</strong> Send only Stellar (XLM) or supported assets on Testnet to this public address.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
