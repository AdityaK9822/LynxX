"use client";
import { toast as sonnerToast } from "sonner";

import { useState, useEffect } from "react";
import { 
    Home, Send as SendIconLucide, Download, RefreshCw, Clock, Users, BarChart2, 
    Settings, ExternalLink, ArrowRight, Bell, LogOut, ChevronDown, ChevronRight, Eye, EyeOff, 
    Copy as CopyIcon, QrCode, CreditCard, Layers, ArrowUpRight, ArrowDownLeft, ShieldCheck 
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";

// ── Always-needed components (loaded eagerly) ──
import Reveal from "./Reveal";
import Counter from "./Counter";
import FAQ from "./FAQ";
import Contracts from "./Contracts";
import Roadmap from "./Roadmap";
import Testimonials from "./Testimonials";
import NotificationBell from "./NotificationBell";
import OnboardingModal, { shouldShowOnboarding } from "./OnboardingModal";

// ── Below-fold / conditional components (loaded lazily) ──
// These are only needed after scroll or on user action, so we split them into
// separate JS chunks that the browser fetches on demand instead of on initial load.
const Terminal        = dynamic(() => import("./Terminal"),        { ssr: false });
const Crowdfund       = dynamic(() => import("./Crowdfund"),       { ssr: false });
const MagicRings      = dynamic(() => import("./MagicRings"),      { ssr: false });
const Analytics       = dynamic(() => import("./Analytics"),       { ssr: false });
const Activity        = dynamic(() => import("./Activity"),        { ssr: false });
const Receive         = dynamic(() => import("./Receive"),         { ssr: false });
const MarketAnalytics = dynamic(() => import("./MarketAnalytics"), { ssr: false });
const MultiChainSwap  = dynamic(() => import("./motion/swap").then(m => ({ default: m.MultiChainSwap })), { ssr: false });
const UserInteractions = dynamic(() => import("./UserInteractions"), { ssr: false });
const FeedbackForm     = dynamic(() => import("./FeedbackForm"),     { ssr: false });
const CreateEscrow     = dynamic(() => import("./CreateEscrow"),     { ssr: false });
const PasskeySection   = dynamic(() => import("./PasskeySection"),   { ssr: false });

// ── Image imports (used as src strings for Next.js <Image> / CSS) ──
import mainBG       from "../media/mainBG.png";
import logoImg      from "../media/LynxX.png";
import mainCatImg   from "../media/maincat.png";
import ribbonImg    from "../media/ribbon.png";
import featureImg   from "../media/lynxxfeature.png";
import howItWorksImg from "../media/howitworks.png";
import footerBgImg  from "../media/footor.png";
import faqBgImg     from "../media/FAQ.png";
import crowdfundImg from "../media/crowdfund.png";
import smallpieceImg from "../media/smallpiece.png";
import setinImg     from "../media/setin.png";
import feedbackImg  from "../media/feedback.png";

import { connectWallet, fetchBalance, sendPayment } from "./Wallet";
import { donate } from "./Fund";
import { recordInteraction } from "../lib/jsonbin";


/* ── SVG Icons ── */
const SendIcon = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
);
const ZapIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
);
const ShieldIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
);
const GlobeIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
);
const LogoutIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
        <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
);
const CheckIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
);
const ClockIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
);
const AlertIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
);
const LayersIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
    </svg>
);
const KeyIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
    </svg>
);
const ArrowRightIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
);
const TwitterIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 1.2h3.7l-8 9.1L24 22.8h-7.4l-5.8-7.5-6.6 7.5H.5l8.5-9.7L0 1.2h7.6l5.2 6.9zM17.6 20.6h2L6.5 3.3H4.3z"/></svg>
);
const GithubIcon = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5C5.4.5 0 5.9 0 12.5c0 5.3 3.4 9.8 8.2 11.4.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.3-1.8-1.3-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2 0-.4-.5-1.6.2-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.7 18.3 5 18.3 5c.7 1.6.2 2.8.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 24 12.5C24 5.9 18.6.5 12 .5z"/></svg>
);

function Header() {
    const [address, setAddress]     = useState(() => typeof window !== "undefined" ? localStorage.getItem("connected_wallet") || "" : "");
    const [balance, setBalance]     = useState("");
    const [isBalanceVisible, setIsBalanceVisible] = useState(true);
    const [recipient, setRecipient] = useState("");
    const [amount, setAmount]       = useState("");
    const [status, setStatus]       = useState("");
    const [hash, setHash]           = useState("");
    const [txHistory, setTxHistory] = useState([]);
    const [errorMsg, setErrorMsg]   = useState("");
    const [isConnecting, setIsConnecting] = useState(false);
    const [isSending, setIsSending]       = useState(false);
    const [scrolled, setScrolled]         = useState(false);
    const [walletPrompt, setWalletPrompt] = useState(null); // { title, message, showInstall }
    const [coinsOk, setCoinsOk]           = useState(true);  // hero coins image present?
    const [showOnboarding, setShowOnboarding] = useState(false); // first-visit guide
    const [activeView, setActiveView] = useState("home"); // "home" | "analytics"
    const [toast, setToast] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    // Tracks the last recorded interaction so UserInteractions re-renders
    const [latestInteraction, setLatestInteraction] = useState(null);

    const [isLoadingBalance, setIsLoadingBalance] = useState(false);
    const showToast = (message, type = 'error') => {
        if (type === 'error') sonnerToast.error(message);
        else sonnerToast.success(message);
    };

    // Sticky-nav: add a solid background once the user scrolls past the hero top.
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 24);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // First-visit onboarding modal
    useEffect(() => {
        const t = setTimeout(() => { if (shouldShowOnboarding()) setShowOnboarding(true); }, 1200);
        return () => clearTimeout(t);
    }, []);

    // Load history from localStorage for a given wallet address
    const loadHistory = (pk) => {
        try {
            const saved = localStorage.getItem(`sf_history_${pk}`);
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    };

    // Persist a new tx entry to localStorage
    const saveHistory = (pk, entries) => {
        try {
            localStorage.setItem(`sf_history_${pk}`, JSON.stringify(entries));
        } catch {}
    };

    // Rehydrate connection session on reload
    useEffect(() => {
        const savedPk = localStorage.getItem("connected_wallet");
        if (savedPk) {
            setAddress(savedPk);
            setIsLoadingBalance(true);
            fetchBalance(savedPk)
                .then(bal => {
                    setBalance(Number(bal).toFixed(2));
                    setIsLoadingBalance(false);
                })
                .catch(e => {
                    console.error("Could not fetch balance on reconnect:", e);
                    setIsLoadingBalance(false);
                });
            setTxHistory(loadHistory(savedPk));
        }
    }, []);

    const handleConnect = async () => {
        setIsConnecting(true);
        try {
            const pk  = await connectWallet();
            setAddress(pk);
            setIsLoadingBalance(true);
            const bal = await fetchBalance(pk);
            setBalance(Number(bal).toFixed(2));
            setIsLoadingBalance(false);
            // Save session to localStorage
            localStorage.setItem("connected_wallet", pk);
            // Restore this wallet's history from localStorage
            setTxHistory(loadHistory(pk));
            // ── Record wallet interaction for Level 4 proof ──
            recordInteraction(pk, "connect");
            setLatestInteraction({ action: "connect", ts: Date.now() });
        } catch (e) {
            // Show a friendly in-app modal instead of a raw alert. Missing
            // wallet → offer the install link; anything else → explain & retry.
            
            let errorMessage = e?.message || "Failed to connect wallet. Please try again.";
            if (errorMessage.toLowerCase().includes("closed the modal") || errorMessage.toLowerCase().includes("user rejected")) {
                errorMessage = "Connection request was cancelled securely. Please try again when you are ready.";
            }

            setWalletPrompt({
                title: e?.code === "NotInstalled" ? "Wallet not detected" : "Connection Cancelled",
                message: errorMessage,
                showInstall: e?.code === "NotInstalled",
            });
            setIsLoadingBalance(false);
        } finally { setIsConnecting(false); }
    };

    const handleDisconnect = () => {
        localStorage.removeItem("connected_wallet");
        setAddress(""); setBalance(""); setRecipient("");
        setAmount(""); setStatus(""); setHash("");
        // Keep txHistory in memory for UX; it's already saved in localStorage
        setTxHistory([]);
    };

    const handleSend = async () => {
        if (!recipient || !amount) { showToast("Please fill in recipient and amount"); return; }

        // Basic Stellar address validation
        if (!recipient.startsWith("G") || recipient.length !== 56) {
            showToast(`Invalid Stellar address.`);
            return;
        }

        setIsSending(true);
        try {
            setStatus("pending"); setHash("");
            const txHash = await sendPayment(address, recipient, amount);
            setHash(txHash);
            setStatus("success");
            const newEntry = { to: recipient, amount, date: new Date().toLocaleDateString(), hash: txHash };
            const updated  = [newEntry, ...txHistory];
            setTxHistory(updated);
            saveHistory(address, updated);   // persist to localStorage
            setRecipient(""); setAmount("");
            // ── Record send interaction ──
            recordInteraction(address, "send", amount, txHash);
            setLatestInteraction({ action: "send", ts: Date.now() });
            
            setIsLoadingBalance(true);
            const bal = await fetchBalance(address);
            setBalance(Number(bal).toFixed(2));
            setIsLoadingBalance(false);
            
            const newNotif = { id: Date.now(), text: "You have been successfully transaction", date: new Date().toLocaleTimeString(), read: false };
            setNotifications(prev => [newNotif, ...prev]);
            showToast("Transaction successful!", "success");
        } catch (e) {
            console.error(e);
            setStatus("error");
            showToast(e?.message || "Transaction failed. Please try again.", "error");
            setIsLoadingBalance(false);
        } finally { setIsSending(false); }
    };

    const handleCampaignDonate = async () => {
        if (!address) {
            showToast("Please connect your wallet first.", "error");
            return;
        }
        setIsSending(true);
        try {
            const txHash = await donate(address, "20");
            setIsLoadingBalance(true);
            const bal = await fetchBalance(address);
            setBalance(Number(bal).toFixed(2));
            setIsLoadingBalance(false);
            const newNotif = { id: Date.now(), text: "You have been successfully transaction", date: new Date().toLocaleTimeString(), read: false };
            setNotifications(prev => [newNotif, ...prev]);
            showToast(`Donated 20 XLM! Hash: ${txHash.slice(0, 8)}...`, "success");
            // ── Record donation interaction ──
            recordInteraction(address, "donate", "20", txHash);
            setLatestInteraction({ action: "donate", ts: Date.now() });
        } catch (e) {
            console.error(e);
            showToast(e?.message || "Donation failed.", "error");
            setIsLoadingBalance(false);
        } finally {
            setIsSending(false);
        }
    };

    const refreshBalance = async () => {
        if (!address) return;
        try {
            setIsLoadingBalance(true);
            const bal = await fetchBalance(address);
            setBalance(Number(bal).toFixed(2));
            setIsLoadingBalance(false);
        } catch (e) { 
            console.warn("balance refresh failed", e);
            setIsLoadingBalance(false);
        }
    };

    const short = addr => addr ? `${addr.slice(0,8)}...${addr.slice(-8)}` : "";

    const statusMeta = {
        pending: { cls: "status-badge-pending", icon: <ClockIcon />,  text: "Processing on network..." },
        success: { cls: "status-badge-success", icon: <CheckIcon />,  text: "Transaction confirmed" },
        error:   { cls: "status-badge-error",   icon: <AlertIcon />,  text: errorMsg || "Transaction failed. Try again." },
    };

    /* ════════════════════
       LANDING PAGE
    ════════════════════ */
    if (!address) return (
        <>
            {/* Onboarding modal — shown on first visit */}
            {showOnboarding && <OnboardingModal onClose={() => setShowOnboarding(false)} />}

            {/* Decorative background orbs */}
            <div className="lp-orb lp-orb-1" />
            <div className="lp-orb lp-orb-2" />

            {/* ── Wallet prompt modal (missing extension / connect error) ── */}
            {walletPrompt && (
                <div className="wallet-modal-overlay" onClick={() => setWalletPrompt(null)}>
                    <div className="wallet-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="wallet-modal-close" onClick={() => setWalletPrompt(null)} aria-label="Close">×</button>
                        <div className="wallet-modal-icon"><KeyIcon /></div>
                        <h3 className="wallet-modal-title">{walletPrompt.title}</h3>
                        <p className="wallet-modal-text">{walletPrompt.message}</p>
                        <div className="wallet-modal-actions">
                            {walletPrompt.showInstall && (
                                <a className="btn btn-gradient" href="https://www.freighter.app/" target="_blank" rel="noreferrer">
                                    Install Freighter <ArrowRightIcon />
                                </a>
                            )}
                            <button className="btn btn-glass-secondary" onClick={() => setWalletPrompt(null)}>
                                {walletPrompt.showInstall ? "Maybe later" : "Got it"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Framed hero panel (ChainFund-style) ── */}
            <section 
                className="lp-hero-section" 
                style={{ 
                    position: 'relative',
                }}
            >
                {/* Hero background — loaded as priority WebP via Next.js Image optimizer */}
                <Image
                    src={mainBG}
                    alt=""
                    fill
                    priority
                    aria-hidden="true"
                    style={{ objectFit: 'cover', objectPosition: 'center', zIndex: 0 }}
                    quality={85}
                />

                {/* In-panel nav */}
                <nav className={`cf-nav ${scrolled ? "cf-nav-scrolled" : ""}`} style={{ position: 'relative', zIndex: 1 }}>
                    <div className="cf-nav-left">
                        <div className="cf-nav-brand">
                            <Image className="cf-nav-logo" src={logoImg} alt="LynxX logo" width={120} height={36} priority onClick={() => setActiveView('home')} style={{cursor: 'pointer', height: '36px', width: 'auto'}} />
                        </div>
                        <div className="cf-nav-pill">
                            <span className="cf-nav-link" onClick={() => { setActiveView('home'); setTimeout(() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }), 50); }}>Features</span>
                            <span className="cf-nav-link" onClick={() => { setActiveView('home'); setTimeout(() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }), 50); }}>How it works</span>
                            <span className="cf-nav-link" onClick={() => { setActiveView('home'); setTimeout(() => document.getElementById('campaign')?.scrollIntoView({ behavior: 'smooth' }), 50); }}>Crowdfund</span>
                            <span className="cf-nav-link" onClick={() => { setActiveView('home'); setTimeout(() => document.getElementById('passkey-onboarding')?.scrollIntoView({ behavior: 'smooth' }), 50); }}>Passkeys</span>
                            <span className={`cf-nav-link ${activeView === 'analytics' ? 'cf-nav-active' : ''}`} onClick={() => { setActiveView('analytics'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Analytics</span>
                            <Link href="/docs" className="cf-nav-link" style={{ textDecoration: 'none' }}>Docs</Link>
                        </div>
                    </div>
                    <button id="btn-connect-nav" className="cf-nav-cta-glass" onClick={handleConnect} disabled={isConnecting}>
                        {isConnecting ? <span className="spinner"></span> : null}
                        <span>Connect Wallet</span>
                        <div className="cf-nav-cta-icon"><ArrowRight size={18} strokeWidth={2.5} /></div>
                    </button>
                </nav>

                {activeView === 'analytics' ? (
                    <MarketAnalytics />
                ) : (
                    <>
                    <div className="cf-hero" style={{ position: 'relative', zIndex: 1 }}>
                        <div className="cf-hero-copy">
                            <div className="hero-eyebrow">[ Live on Stellar Testnet ]</div>
                        <h1 className="hero-h1">
                            Send money<br />
                            Beyond Borders
                        </h1>
                        <p className="cf-sub">
                            Non-custodial payments and on-chain<br />
                            crowdfunding, powered by Stellar &amp; Soroban.
                        </p>
                        <button id="btn-connect-hero" className="cf-hero-cta" onClick={handleConnect} disabled={isConnecting}>
                            {isConnecting ? <span className="spinner"></span> : null}
                            <span>Get Started</span>
                            <div className="cf-hero-cta-icon"><ArrowRight size={18} strokeWidth={2.5} /></div>
                        </button>
                    </div>


                </div>


                </>
                )}
            </section>

            {activeView === 'home' && (
                <>
                {/* ── Metrics band ── */}
                <section className="lp-metrics">
                    <div className="lp-section-inner lp-metrics-grid">
                        <Reveal className="metric">
                            <div className="metric-num"><Counter to={5} decimals={1} prefix="~" suffix="s" /></div>
                            <div className="metric-lbl">Avg. settlement</div>
                        </Reveal>
                        <Reveal className="metric" delay={80}>
                            <div className="metric-num"><Counter to={0.00001} decimals={5} prefix="$" /></div>
                            <div className="metric-lbl">Network fee</div>
                        </Reveal>
                        <Reveal className="metric" delay={160}>
                            <div className="metric-num"><Counter to={180} suffix="+" /></div>
                            <div className="metric-lbl">Countries reachable</div>
                        </Reveal>
                        <Reveal className="metric" delay={240}>
                            <div className="metric-num"><Counter to={99.9} decimals={1} suffix="%" /></div>
                            <div className="metric-lbl">Network uptime</div>
                        </Reveal>
                    </div>
                </section>

                {/* ── Features (bento) ── */}
                <section className="lp-features" id="features">
                <div className="lp-section-inner" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center', gap: '80px' }}>
                    <Reveal className="lp-features-left">
                        <Image 
                            src={featureImg} 
                            alt="LynxX features" 
                            width={700}
                            height={500}
                            style={{ 
                                width: '100%', 
                                maxWidth: '700px', 
                                height: 'auto',
                                display: 'block',
                                filter: 'brightness(1.15) drop-shadow(0 20px 40px rgba(0,0,0,0.5))' 
                            }} 
                        />
                    </Reveal>
                    <Reveal className="lp-features-right" style={{ padding: '20px 0' }}>
                        <h2 className="lp-section-title" style={{ fontSize: 'clamp(2.5rem, 4vw, 3.2rem)', marginBottom: '24px', lineHeight: '1.1', fontWeight: '500', letterSpacing: '-0.02em', textAlign: 'left' }}>
                            Everything you need<br />to move money fast
                        </h2>
                        <p style={{ fontSize: '1.15rem', color: 'rgba(255,255,255,0.65)', lineHeight: '1.6', marginBottom: '40px', maxWidth: '480px' }}>
                            LynxX merges fast, non-custodial payments with real on-chain
                            smart contracts — unlocking trustless transfers and crowdfunding on Stellar.
                        </p>
                        <button className="cf-hero-cta" onClick={handleConnect} disabled={isConnecting}>
                            {isConnecting ? <span className="spinner"></span> : null}
                            <span>Get started</span>
                            <div className="cf-hero-cta-icon"><ArrowRight size={18} strokeWidth={2.5} /></div>
                        </button>
                    </Reveal>
                </div>
            </section>

            {/* ── How it Works ── */}
            <section className="lp-how" id="how-it-works">
                <div className="lp-section-inner" style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', alignItems: 'center', gap: '60px' }}>
                    <Reveal className="lp-how-left">
                        <h2 className="lp-section-title" style={{ fontSize: 'clamp(2.5rem, 4vw, 3.2rem)', marginBottom: '40px', lineHeight: '1.1', fontWeight: '500', letterSpacing: '-0.02em', textAlign: 'left' }}>
                            Three simple steps
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                                <div style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#a855f7', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '1.3rem', fontWeight: '500', color: '#fff', marginBottom: '8px' }}>Install Freighter</h4>
                                    <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '1.1rem', lineHeight: '1.5', margin: 0, maxWidth: '400px' }}>Download the Freighter browser extension and create or import your Stellar wallet.</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                                <div style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#a855f7', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '1.3rem', fontWeight: '500', color: '#fff', marginBottom: '8px' }}>Connect your wallet</h4>
                                    <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '1.1rem', lineHeight: '1.5', margin: 0, maxWidth: '400px' }}>Click "Launch app" and approve the connection request in Freighter.</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                                <div style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#a855f7', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '1.3rem', fontWeight: '500', color: '#fff', marginBottom: '8px' }}>Send &amp; fund</h4>
                                    <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '1.1rem', lineHeight: '1.5', margin: 0, maxWidth: '400px' }}>Send XLM to any address or donate to the on-chain campaign.</p>
                                </div>
                            </div>
                        </div>
                    </Reveal>
                    <Reveal className="lp-how-right" delay={120}>
                        <Image 
                            src={howItWorksImg} 
                            alt="How it works" 
                            width={700}
                            height={500}
                            style={{ 
                                width: '100%', 
                                height: 'auto',
                                display: 'block', 
                                transform: 'scale(1.15)',
                                transformOrigin: 'center left',
                                filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.5))' 
                            }} 
                        />
                    </Reveal>
                </div>
            </section>

            {/* ── Terminal Demo (Replaced by Image) ── */}
            <section className="lp-terminal" id="terminal" style={{ position: 'relative', overflow: 'hidden' }}>
                <Image src={smallpieceImg} alt="" width={600} height={600} aria-hidden="true" style={{ position: 'absolute', top: '20px', right: '-300px', width: '600px', height: 'auto', opacity: 0.9, transform: 'rotate(-70deg)', pointerEvents: 'none', zIndex: 0 }} />
                <div className="lp-terminal-inner" style={{ position: 'relative', zIndex: 1 }}>
                    <Reveal delay={120}>
                        <Image src={setinImg} alt="See it in action" width={1200} height={800} style={{ width: '100%', height: 'auto', borderRadius: '16px', display: 'block', margin: '0 auto' }} />
                    </Reveal>
                </div>
            </section>

            {/* ── Live On-chain Campaign ── */}
            <section className="lp-campaign" id="campaign" style={{ position: 'relative', overflow: 'hidden' }}>
                <Image src={smallpieceImg} alt="" width={600} height={600} aria-hidden="true" style={{ position: 'absolute', top: '60px', left: '-300px', width: '600px', height: 'auto', opacity: 0.9, transform: 'rotate(110deg)', pointerEvents: 'none', zIndex: 0 }} />
                <div className="lp-campaign-inner" style={{ position: 'relative', zIndex: 1 }}>
                    <Reveal delay={120}>
                        <Image src={crowdfundImg} alt="Crowdfunding campaign" width={900} height={600} style={{ width: '100%', height: 'auto', borderRadius: '16px' }} />
                    </Reveal>
                    <Reveal className="lp-campaign-copy">
                        <div className="lp-section-eyebrow">[ Powered by Soroban ]</div>
                        <h2 className="lp-section-title" style={{ fontSize: '3.5rem', fontWeight: '700', lineHeight: '1.1', marginBottom: '24px', letterSpacing: '-0.02em' }}>
                            Crowdfunding that lives<br />entirely on-chain
                        </h2>
                        <p className="lp-campaign-text">
                            No middlemen, no backend. Every donation is a Soroban contract call —
                            funds settle trustlessly inside the contract, the bar you see updates
                            straight from on-chain events, and only the beneficiary can withdraw.
                        </p>
                        <div className="lp-campaign-points">
                            <div className="lp-campaign-point"><CheckIcon /> Donations are signed by you, settled on-chain</div>
                            <div className="lp-campaign-point"><CheckIcon /> Progress streams live from contract events</div>
                            <div className="lp-campaign-point"><CheckIcon /> Verifiable on the public ledger</div>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* ── Seedless Onboarding & Device Key Generation (Passkeys) ── */}
            <section id="passkey-onboarding" style={{ padding: '80px 4%', background: 'rgba(255,255,255,0.01)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
                    <Reveal>
                        <div className="lp-section-eyebrow">Seedless Security</div>
                        <h2 className="lp-section-title" style={{ marginBottom: '16px' }}>Biometric &amp; Hardware Passkeys</h2>
                        <p className="lp-faq-sub" style={{ marginBottom: '36px' }}>No seed phrases to memorize or lose. Generate your cryptographic Device Key using your phone or laptop&apos;s Secure Enclave.</p>
                        <PasskeySection />
                    </Reveal>
                </div>
            </section>

            {/* ── Smart Contracts ── */}
            <section className="lp-contracts" id="contracts" style={{ position: 'relative', overflow: 'hidden' }}>
                <Image src={smallpieceImg} alt="" width={700} height={700} aria-hidden="true" style={{ position: 'absolute', bottom: '-10%', right: '-350px', width: '700px', height: 'auto', opacity: 0.9, transform: 'rotate(160deg)', pointerEvents: 'none', zIndex: 0 }} />
                <div className="lp-section-inner" style={{ position: 'relative', zIndex: 1 }}>
                    <Reveal>
                        <div className="lp-section-eyebrow">On-chain architecture</div>
                        <h2 className="lp-section-title" style={{ fontSize: '3.5rem', fontWeight: '700', lineHeight: '1.1', marginBottom: '24px', letterSpacing: '-0.02em' }}>
                            Two contracts, talking to each other
                        </h2>
                        <p className="lp-faq-sub">StellarFund and DonorBadge are live Soroban contracts — every donation triggers a real cross-contract call.</p>
                    </Reveal>
                    <Reveal delay={120}><Contracts /></Reveal>
                </div>
            </section>

            {/* ── Roadmap ── */}
            <section className="lp-roadmap" id="roadmap">
                <div className="lp-section-inner">
                    <Reveal>
                        <div className="lp-section-eyebrow">Roadmap</div>
                        <h2 className="lp-section-title">Where LynxX is headed</h2>
                    </Reveal>
                    <Reveal delay={120}><Roadmap /></Reveal>
                </div>
            </section>



            {/* ── Testimonials ── */}
            <section className="lp-testimonials" id="testimonials">
                <div className="lp-section-inner">
                    <Reveal>
                        <div className="lp-section-eyebrow">Loved by builders</div>
                        <h2 className="lp-section-title">What people are saying</h2>
                    </Reveal>
                    <Reveal delay={120}><Testimonials /></Reveal>
                </div>
            </section>

            {/* ── Live User Interactions ── */}
            <section id="interactions" style={{ padding: '100px 4%', background: 'rgba(255,255,255,0.01)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
                    <Reveal>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '14px' }}>[ Stellar Testnet ]</div>
                        <UserInteractions latestAddress={latestInteraction} />
                    </Reveal>
                </div>
            </section>

            {/* ── User Feedback Form ── */}
            <section id="user-feedback" style={{ padding: '100px 4%' }}>
                <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
                    <Reveal>
                        <FeedbackForm prefillWallet={address || ""} />
                    </Reveal>
                </div>
            </section>

            {/* ── Testimonial Card ── */}
            <section className="lp-feedback" id="feedback" style={{ padding: '80px 4%' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <Reveal>
                        <div style={{ display: 'flex', flexWrap: 'wrap', backgroundColor: '#fff', borderRadius: '32px', overflow: 'hidden', minHeight: '450px' }}>
                            <div style={{ flex: '1 1 600px', padding: '80px 80px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <div style={{ color: '#888', fontSize: '0.85rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '32px', fontWeight: '600' }}>TESTIMONIAL</div>
                                <div style={{ fontSize: '2.2rem', fontWeight: '500', color: '#111', lineHeight: '1.4', marginBottom: '32px', fontFamily: 'Inter, sans-serif' }}>
                                    "We went from 3 to 28 people in just 3 months thanks for the great management of LynxX."
                                </div>
                                <div>
                                    <div style={{ color: '#111', fontWeight: '600', fontSize: '1.1rem', marginBottom: '6px' }}>Richard Oconor</div>
                                    <div style={{ color: '#666', fontSize: '1rem' }}>Marketing Manager at Intelo</div>
                                </div>
                            </div>
                            <div style={{ flex: '1 1 400px', position: 'relative', minHeight: '450px' }}>
                                <Image src={feedbackImg} alt="Glass curve" width={600} height={450} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
                            </div>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* ── FAQ ── */}
            <section className="lp-faq" id="faq" style={{ backgroundImage: `url(${faqBgImg.src})`, backgroundSize: 'cover', backgroundPosition: 'bottom center', backgroundRepeat: 'no-repeat' }}>
                <div className="lp-section-inner lp-faq-inner">
                    <Reveal className="lp-faq-head">
                        <div className="lp-section-eyebrow">FAQ</div>
                        <h2 className="lp-section-title" style={{ fontSize: 'clamp(2.5rem, 5vw, 3.8rem)', marginBottom: '24px' }}>Got questions?<br/>We've got answers.</h2>
                        <p className="lp-faq-sub" style={{ fontSize: '1.25rem' }}>Everything you need to know before making your first trustless payment.</p>
                    </Reveal>
                    <Reveal delay={120}><FAQ /></Reveal>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="lp-cta" id="cta">
                <Reveal className="lp-cta-card" style={{ backgroundImage: `url(${footerBgImg.src})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', overflow: 'hidden', padding: '100px 40px' }}>
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <h2 className="lp-cta-title">Ready to send your first payment?</h2>
                        <p className="lp-cta-sub">Connect your wallet and experience the speed of Stellar — no sign-up, no custodian, no fees.</p>
                        <button id="btn-connect-cta" className="cf-hero-cta" onClick={handleConnect} disabled={isConnecting} style={{ margin: '0 auto' }}>
                            {isConnecting ? <span className="spinner"></span> : null}
                            <span>Connect Wallet</span>
                            <div className="cf-hero-cta-icon"><ArrowRight size={18} strokeWidth={2.5} /></div>
                        </button>
                    </div>
                </Reveal>
            </section>
            </>
            )}

            {/* ── Footer ── */}
            <footer className="lp-footer" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '80px 40px 40px', background: '#000', color: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '60px', maxWidth: '1200px', margin: '0 auto 80px' }}>
                    
                    {/* Left Huge Text */}
                    <div style={{ flex: '1', minWidth: '300px' }}>
                        <h2 style={{ fontSize: '3.5rem', fontWeight: 'bold', lineHeight: '1.1', textTransform: 'uppercase', letterSpacing: '0.02em', margin: 0 }}>
                            YOUR WALLET,<br/>YOUR RULES
                        </h2>
                    </div>
                    
                    {/* Right Columns */}
                    <div style={{ display: 'flex', gap: '60px', flexWrap: 'wrap', flex: '2', justifyContent: 'flex-end' }}>
                        {/* WALLET */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: '140px' }}>
                            <h4 style={{ fontSize: '0.85rem', fontWeight: 'bold', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#fff', marginBottom: '8px' }}>Wallet</h4>
                            <span className="lp-footer-link" style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', transition: 'color 0.2s' }}>About LynxX</span>
                            <span className="lp-footer-link" style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', transition: 'color 0.2s' }}>Security</span>
                            <span className="lp-footer-link" style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', transition: 'color 0.2s' }}>Supported Assets</span>
                            <span className="lp-footer-link" style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', transition: 'color 0.2s' }}>Fees</span>
                        </div>
                        {/* FEATURES */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: '140px' }}>
                            <h4 style={{ fontSize: '0.85rem', fontWeight: 'bold', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#fff', marginBottom: '8px' }}>Features</h4>
                            <span className="lp-footer-link" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', transition: 'color 0.2s' }}>Send & Receive</span>
                            <span className="lp-footer-link" onClick={() => { setActiveView('swap'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', transition: 'color 0.2s' }}>Multi-Chain Swap</span>
                            <span className="lp-footer-link" onClick={() => document.getElementById('campaign')?.scrollIntoView({ behavior: 'smooth' })} style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', transition: 'color 0.2s' }}>Crowdfund</span>
                            <span className="lp-footer-link" onClick={() => { setActiveView('analytics'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', transition: 'color 0.2s' }}>Analytics</span>
                        </div>
                        {/* COMMUNITY */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: '140px' }}>
                            <h4 style={{ fontSize: '0.85rem', fontWeight: 'bold', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#fff', marginBottom: '8px' }}>Community</h4>
                            <span className="lp-footer-link" style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', transition: 'color 0.2s' }}>Discord</span>
                            <span className="lp-footer-link" style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', transition: 'color 0.2s' }}>Twitter / X</span>
                            <span className="lp-footer-link" style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', transition: 'color 0.2s' }}>GitHub</span>
                            <span className="lp-footer-link" style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', transition: 'color 0.2s' }}>Blog</span>
                        </div>
                        {/* DEVELOPERS */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: '140px' }}>
                            <h4 style={{ fontSize: '0.85rem', fontWeight: 'bold', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#fff', marginBottom: '8px' }}>Developers</h4>
                            <Link href="/docs" className="lp-footer-link" style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', transition: 'color 0.2s', textDecoration: 'none', display: 'block' }}>Documentation</Link>
                            <span className="lp-footer-link" style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', transition: 'color 0.2s' }}>API Reference</span>
                            <span className="lp-footer-link" style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', transition: 'color 0.2s' }}>Stellar Network</span>
                            <span className="lp-footer-link" style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', transition: 'color 0.2s' }}>Smart Contracts</span>
                        </div>
                    </div>
                </div>
                
                {/* Logo & CTA Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', maxWidth: '1200px', margin: '0 auto 40px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Image src={logoImg} alt="LynxX logo" width={32} height={32} style={{ width: '32px', height: '32px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
                        <span style={{ fontSize: '1.25rem', fontWeight: 'bold', letterSpacing: '0.05em' }}>LynxX</span>
                    </div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <button onClick={handleConnect} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', padding: '10px 24px', borderRadius: '30px', fontSize: '0.85rem', fontWeight: 'bold', letterSpacing: '0.05em', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={(e) => e.target.style.borderColor = '#fff'} onMouseOut={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.3)'}>
                            CONNECT WALLET
                        </button>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', paddingTop: '32px', borderTop: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', gap: '32px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: '#fff', fontWeight: '500' }}>English <ChevronDown size={14} /></span>
                        <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = '#fff'} onMouseOut={(e) => e.target.style.color = 'rgba(255,255,255,0.5)'}>Terms of Use</span>
                        <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = '#fff'} onMouseOut={(e) => e.target.style.color = 'rgba(255,255,255,0.5)'}>Privacy Policy</span>
                        <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = '#fff'} onMouseOut={(e) => e.target.style.color = 'rgba(255,255,255,0.5)'}>Cookie Settings</span>
                    </div>
                    <div style={{ textAlign: 'right', lineHeight: '1.6' }}>
                        Copyright {new Date().getFullYear()} LynxX. All rights reserved.<br/>
                        Designed by <strong style={{ color: '#fff' }}>K</strong> - Powered by <strong style={{ color: '#fff' }}>Stellar</strong>
                    </div>
                </div>
            </footer>
        </>
    );

    /* ════════════════════
       BENTO DASHBOARD
    ════════════════════ */
    return (
        <div className="bento-dashboard-page">
            {/* Sidebar */}
            <aside className="bento-sidebar">
                <div className="bento-logo" style={{ display: 'flex', justifyContent: 'center' }}>
                    <Image 
                        src={mainCatImg}
                        alt="LynxX logo" 
                        width={140}
                        height={140}
                        priority
                        onClick={handleDisconnect}
                        style={{ cursor: 'pointer', height: '140px', width: 'auto', objectFit: 'contain' }}
                    />
                </div>
                <nav className="bento-nav">
                    <a href="#" className={`bento-nav-item ${activeView === 'home' ? 'active' : ''}`} onClick={e => { e.preventDefault(); setActiveView('home'); }}><Home size={20} /> Dashboard</a>
                    <a href="#" className={`bento-nav-item ${activeView === 'send' ? 'active' : ''}`} onClick={e => { e.preventDefault(); setActiveView('send'); }}><SendIconLucide size={20} /> Send</a>
                    <a href="#" className={`bento-nav-item ${activeView === 'escrow' ? 'active' : ''}`} onClick={e => { e.preventDefault(); setActiveView('escrow'); }}><ShieldCheck size={20} /> Escrow</a>
                    <a href="#" className={`bento-nav-item ${activeView === 'receive' ? 'active' : ''}`} onClick={e => { e.preventDefault(); setActiveView('receive'); }}><Download size={20} /> Receive</a>
                    <a href="#" className={`bento-nav-item ${activeView === 'swap' ? 'active' : ''}`} onClick={e => { e.preventDefault(); setActiveView('swap'); }}><RefreshCw size={20} /> Swap</a>
                    <a href="#" className={`bento-nav-item ${activeView === 'activity' ? 'active' : ''}`} onClick={e => { e.preventDefault(); setActiveView('activity'); }}><Clock size={20} /> Activity</a>

                    <a href="#" className={`bento-nav-item ${activeView === 'analytics' ? 'active' : ''}`} onClick={e => { e.preventDefault(); setActiveView('analytics'); }}><BarChart2 size={20} /> Analytics</a>
                    <a href="#" className="bento-nav-item" onClick={e => e.preventDefault()}><Settings size={20} /> Settings</a>
                </nav>
                
                <div className="bento-sidebar-bottom">
                    <div className="bento-network-badge">
                        <span className="bento-dot"></span> Testnet Connected
                    </div>
                    <div className="bento-address-pill">
                        <span>{address.slice(0, 6)}...{address.slice(-5)}</span> <ExternalLink size={14} />
                    </div>
                    <div className="bento-help-card">
                        <h5>Need Help?</h5>
                        <p>Visit our docs or get support from our team.</p>
                        <ArrowRight size={16} />
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="bento-main">
                {/* Top Header */}
                <header className="bento-header">
                    <div className="bento-header-left"></div>
                    <div className="bento-header-right">
                        <NotificationBell 
                            notifications={notifications} 
                            setNotifications={setNotifications}
                            showNotifications={showNotifications}
                            setShowNotifications={setShowNotifications}
                        />
                        <button className="bento-btn-outline" onClick={handleDisconnect}>
                            <LogOut size={16} /> Disconnect
                        </button>
                        <div className="bento-avatar-pill">
                            <div className="bento-avatar gradient-1"></div>
                            {address.slice(0, 6)}...{address.slice(-5)} <ChevronDown size={16} />
                        </div>
                    </div>
                </header>

                {/* Dashboard Grid */}
                {activeView === 'send' ? (
                    <div style={{ display: 'flex', width: '100%', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 20px', position: 'relative', flexShrink: 0 }}>
                        {/* Right-side ribbon background */}
                        <Image 
                            src={ribbonImg} 
                            alt="" 
                            width={500}
                            height={900}
                            aria-hidden="true"
                            style={{ position: 'absolute', right: '-25%', top: '50%', transform: 'translateY(-50%)', height: '110%', width: 'auto', opacity: 0.5, pointerEvents: 'none', zIndex: 0 }} 
                        />
                        <div className="bento-card bento-send-card" style={{ maxWidth: '600px', width: '100%', position: 'relative', zIndex: 1, background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)' }}>
                            <div className="bento-card-header">
                                <span className="bento-card-title">Send XLM</span>
                                <span className="bento-card-sub text-muted">Recent <ChevronDown size={14} /></span>
                            </div>
                            <div className="bento-card-desc mb-16 text-muted" style={{fontSize: '0.85rem'}}>Send to any Stellar address on the Testnet</div>
                            
                            <div className="bento-recent-contact mb-20">
                                <img src="https://api.dicebear.com/7.x/pixel-art/svg?seed=GDZ5" alt="avatar" className="bento-contact-avatar" />
                                <div className="bento-contact-info">
                                    <div className="bento-contact-name">GDZ5...F3T2 <span className="badge">Friend</span></div>
                                    <div className="bento-contact-sub">GDonald | @gdwx.test</div>
                                </div>
                                <ChevronRight size={16} className="text-muted" />
                            </div>

                            <div className="send-field mb-16">
                                <label>Recipient Address</label>
                                <div className="send-input-wrap">
                                    <input id="input-recipient" type="text" placeholder="G... full Stellar address"
                                        value={recipient}
                                        onChange={e => setRecipient(e.target.value.trim())}
                                    />
                                </div>
                            </div>

                            <div className="send-field mb-16">
                                <label>Amount</label>
                                <div className="send-input-wrap amount-wrap">
                                    <span className="bento-pill-prefix">XLM</span>
                                    <input id="input-amount" type="number" placeholder="0.00"
                                        value={amount} onChange={e => setAmount(e.target.value)}
                                    />
                                    <span className="bento-usd-suffix">≈ ${(amount * 0.328).toFixed(2)} USD</span>
                                </div>
                            </div>

                            <div className="send-field mb-20">
                                <label>Memo (optional)</label>
                                <div className="send-input-wrap">
                                    <input type="text" placeholder="What's this for?" />
                                </div>
                            </div>

                            <button id="btn-send" className="btn btn-primary bento-submit-btn" onClick={handleSend} disabled={isSending}>
                                {isSending ? <><span className="spinner"></span> Sending...</> : <>Review Transfer <ArrowRight size={16} /></>}
                            </button>

                            {status && (
                                <div className="status-panel mt-16">
                                    <div className={`status-badge ${statusMeta[status].cls}`}>
                                        <span className="status-dot"></span>
                                        {statusMeta[status].icon}
                                        {statusMeta[status].text}
                                    </div>
                                    {hash && (
                                        <div className="tx-hash-box mt-8 flex flex-col gap-3">
                                            <div>
                                                <div className="tx-hash-label mb-1">Transaction Hash</div>
                                                <div className="tx-hash-value" style={{fontSize: '0.75rem', wordBreak: 'break-all'}}>{hash}</div>
                                            </div>
                                            <a 
                                                href={`https://stellar.expert/explorer/testnet/tx/${hash}`} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="btn btn-glass-secondary flex items-center justify-center gap-2" 
                                                style={{fontSize: '0.8rem', padding: '8px 16px', textDecoration: 'none', width: 'fit-content', borderRadius: '8px', cursor: 'pointer'}}
                                            >
                                                View on Explorer
                                                <ExternalLink size={14} />
                                            </a>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ) : activeView === 'escrow' ? (
                    <CreateEscrow address={address} />
                ) : activeView === 'swap' ? (
                    <div style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
                        <MultiChainSwap />
                    </div>
                ) : activeView === 'activity' ? (
                    <Activity address={address} />
                ) : activeView === 'receive' ? (
                    <Receive address={address} />
                ) : activeView === 'analytics' ? (
                    <MarketAnalytics /> // Assuming you want analytics inside the dashboard as well if clicked from sidebar
                ) : (
                <div className="bento-grid">
                    {/* Column 1 */}
                    <div className="bento-col bento-col-1">
                        {/* Total Balance */}
                        <div className="bento-card bento-balance-card">
                            <div className="bento-card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span>Total Balance</span>
                                <div onClick={() => setIsBalanceVisible(!isBalanceVisible)} style={{ cursor: 'pointer' }}>
                                    {isBalanceVisible ? <Eye size={16} className="text-muted" /> : <EyeOff size={16} className="text-muted" />}
                                </div>
                            </div>
                            <div className="bento-balance-amount" style={{ fontSize: '4.5rem', marginTop: '1rem', marginBottom: '1rem' }}>
                                {isLoadingBalance ? (
                                    <div style={{ height: '5rem', width: '200px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
                                ) : (
                                    <>{isBalanceVisible ? balance : '******'} <span>XLM</span></>
                                )}
                            </div>
                            <div className="bento-balance-usd" style={{ fontSize: '1.2rem' }}>
                                {isLoadingBalance ? (
                                    <div style={{ height: '1.5rem', width: '100px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px', animation: 'pulse 1.5s infinite' }} />
                                ) : (
                                    isBalanceVisible ? `≈ $${(balance * 0.328).toFixed(2)} USD` : '******'
                                )}
                            </div>
                            
                            {/* Mock Sparkline */}
                            <div className="bento-sparkline" style={{ marginTop: '2rem' }}>
                                <svg viewBox="0 0 100 40" preserveAspectRatio="none">
                                    <defs>
                                        <linearGradient id="sparklineGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
                                            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                                        </linearGradient>
                                    </defs>
                                    <path d="M0,35 C10,25 20,40 30,20 C40,0 50,25 60,10 C70,0 80,20 90,5 L100,0 L100,40 L0,40 Z" fill="url(#sparklineGrad)" />
                                    <path d="M0,35 C10,25 20,40 30,20 C40,0 50,25 60,10 C70,0 80,20 90,5 L100,0" fill="none" stroke="#ffffff" strokeWidth="2.5" />
                                </svg>
                            </div>
                            <div className="bento-timeframes">
                                <span className="active">1D</span><span>7D</span><span>30D</span><span>1Y</span><span>All</span>
                            </div>
                        </div>
                    </div>

                    {/* Column 3 */}
                    <div className="bento-col bento-col-3">
                        {/* Campaigns */}
                        <div className="bento-campaigns-header">
                            <span className="bento-card-title">Campaigns</span>
                            <a href="#" className="bento-view-all">View All</a>
                        </div>
                        <div className="bento-card bento-crowdfund-card" style={{ backgroundImage: `url(${ribbonImg.src || ribbonImg})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                            <div className="bento-cf-overlay"></div>
                            <div className="bento-cf-content">
                                <div className="bento-cf-badge"><span className="bento-dot green"></span> LIVE</div>
                                <h3>Back the campaign, on-chain</h3>
                                
                                <div className="bento-cf-stats mt-16">
                                    <div className="flex-between mb-8">
                                        <span className="cf-amt"><strong>20</strong> XLM</span>
                                        <span className="cf-goal text-muted">of 1,000 XLM goal</span>
                                    </div>
                                    <div className="cf-progress-bar"><div className="cf-progress-fill" style={{width: '2%'}}></div></div>
                                    <div className="flex-between mt-8 text-muted" style={{fontSize: '0.8rem'}}>
                                        <span>2.0% funded</span>
                                        <span>3 donors</span>
                                    </div>
                                </div>

                                <button className="donate-glass-btn" onClick={handleCampaignDonate} disabled={isSending}>
                                    <span>{isSending ? 'Processing...' : 'Donate'}</span>
                                    <div className="donate-glass-icon"><ArrowRight size={18} strokeWidth={2.5} /></div>
                                </button>
                                <div className="text-center mt-12 text-muted" style={{fontSize: '0.8rem'}}>You've contributed <span style={{color: '#ffffff'}}>5 XLM</span></div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="bento-card bento-stats-card mt-24">
                            <div className="bento-card-title mb-16">Quick Stats</div>
                            <div className="bento-stat-row">
                                <div className="bento-stat-label"><ZapIcon /> Avg. Fee</div>
                                <div className="bento-stat-val">~0.00001 XLM</div>
                            </div>
                            <div className="bento-stat-row">
                                <div className="bento-stat-label"><Clock size={16}/> Avg. Time</div>
                                <div className="bento-stat-val">2-5s</div>
                            </div>
                            <div className="bento-stat-row">
                                <div className="bento-stat-label"><GlobeIcon /> Network</div>
                                <div className="bento-stat-val"><span className="bento-dot green"></span> Stellar Testnet <ChevronDown size={14}/></div>
                            </div>
                            <div className="bento-stat-row">
                                <div className="bento-stat-label"><LayersIcon /> Protocol</div>
                                <div className="bento-stat-val">Soroban</div>
                            </div>
                        </div>

                        {/* Security Card */}
                        <div className="bento-card bento-security-card mt-24">
                            <div className="bento-sec-content">
                                <h4>Your Keys, Your Funds</h4>
                                <p>LynxX is non-custodial. You're in full control.</p>
                                <a href="#">Learn More <ArrowRight size={14}/></a>
                            </div>
                            <div className="bento-sec-icon">
                                <ShieldIcon />
                            </div>
                        </div>
                    </div>
                </div>
                )}

                {/* Toast Notification */}
                {toast && (
                    <div className={`bento-toast bento-toast-${toast.type}`}>
                        <div className="bento-toast-icon">
                            {toast.type === 'success' ? '✓' : '✕'}
                        </div>
                        <div className="bento-toast-msg">
                            {toast.message}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default Header;