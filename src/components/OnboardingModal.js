import { useState, useEffect } from "react";
import { toast as sonnerToast } from "sonner";
import { Key, Fingerprint, CheckCircle, AlertCircle } from "lucide-react";
import { createPasskey, isPasskeySupported, getSavedPasskeyId } from "../lib/passkey";

const STEPS = [
    {
        icon: "🚀",
        title: "Welcome to LynxX",
        desc: "The non-custodial dApp for instant payments and on-chain crowdfunding on the Stellar blockchain. Let's get you set up in quick steps.",
        action: null,
        actionLabel: null,
        showPasskeyOption: true,
    },
    {
        icon: "🦋",
        title: "Install Freighter Wallet",
        desc: "Freighter is a free, open-source browser extension that manages your Stellar keys. You sign every transaction locally — we never touch your funds.",
        action: "https://www.freighter.app/",
        actionLabel: "Install Freighter →",
    },
    {
        icon: "🌐",
        title: "Switch to Testnet",
        desc: "Open Freighter → Settings → Network → select Testnet. This lets you explore the app with free test XLM — no real money required.",
        action: null,
        actionLabel: null,
    },
    {
        icon: "💸",
        title: "Fund Your Wallet",
        desc: "Get free testnet XLM from Friendbot in seconds. Just paste your public key (starts with G…) and hit the link below.",
        action: "https://friendbot.stellar.org/",
        actionLabel: "Open Friendbot →",
    },
    {
        icon: "🎉",
        title: "You're Ready!",
        desc: "Click 'Connect Wallet' on the homepage, approve in Freighter, and your live XLM balance will load. Then send XLM or make an on-chain donation!",
        action: null,
        actionLabel: null,
    },
];

const STORAGE_KEY = "sf_onboarded_v1";

export default function OnboardingModal({ onClose }) {
    const [step, setStep] = useState(0);
    const [visible, setVisible] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const [passkeyRegisteredId, setPasskeyRegisteredId] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);

    useEffect(() => {
        // Fade-in on mount & check for previously saved passkey
        const t = setTimeout(() => setVisible(true), 50);
        const savedId = getSavedPasskeyId();
        if (savedId) {
            setPasskeyRegisteredId(savedId);
        }
        return () => clearTimeout(t);
    }, []);

    const finish = () => {
        try { localStorage.setItem(STORAGE_KEY, "true"); } catch {}
        setVisible(false);
        setTimeout(onClose, 300);
    };

    const next = () => {
        if (step < STEPS.length - 1) setStep(s => s + 1);
        else finish();
    };

    const prev = () => { if (step > 0) setStep(s => s - 1); };

    const handleCreatePasskey = async () => {
        setErrorMessage(null);
        if (!isPasskeySupported()) {
            const msg = "Passkeys (WebAuthn) are not supported on this device or browser.";
            setErrorMessage(msg);
            sonnerToast.error(msg);
            return;
        }

        setIsRegistering(true);
        try {
            const res = await createPasskey("user@lynxx.app");
            if (res.success) {
                setPasskeyRegisteredId(res.credentialID);
                sonnerToast.success("Passkey account registered successfully!");
            }
        } catch (err) {
            console.error("Passkey registration failed:", err);
            const msg = err.message || "Failed to create passkey.";
            setErrorMessage(msg);
            sonnerToast.error(msg);
        } finally {
            setIsRegistering(false);
        }
    };

    const s = STEPS[step];

    return (
        <div className={`onboard-overlay ${visible ? "onboard-overlay-in" : ""}`}>
            <div className={`onboard-modal ${visible ? "onboard-modal-in" : ""}`}>
                {/* Close */}
                <button className="onboard-close" onClick={finish} aria-label="Skip onboarding">×</button>

                {/* Step indicator */}
                <div className="onboard-steps">
                    {STEPS.map((_, i) => (
                        <div
                            key={i}
                            className={`onboard-step-dot ${i === step ? "onboard-step-active" : i < step ? "onboard-step-done" : ""}`}
                            onClick={() => setStep(i)}
                        />
                    ))}
                </div>

                {/* Icon */}
                <div className="onboard-icon">{s.icon}</div>

                {/* Content */}
                <h2 className="onboard-title">{s.title}</h2>
                <p className="onboard-desc">{s.desc}</p>

                {/* WebAuthn Passkey Registration Option on Welcome Step */}
                {s.showPasskeyOption && (
                    <div className="onboard-passkey-card">
                        <div className="passkey-card-header">
                            <Fingerprint size={20} className="text-cyan-400" />
                            <span>Seedless Passkey Registration</span>
                        </div>

                        {passkeyRegisteredId ? (
                            <div className="passkey-saved-badge">
                                <CheckCircle size={16} className="text-emerald-400" />
                                <span>Passkey Saved ({passkeyRegisteredId.slice(0, 10)}...)</span>
                            </div>
                        ) : (
                            <button
                                id="btn-create-passkey"
                                type="button"
                                className="btn btn-gradient btn-full btn-passkey"
                                onClick={handleCreatePasskey}
                                disabled={isRegistering}
                            >
                                {isRegistering ? (
                                    <>
                                        <span className="spinner"></span>
                                        <span>Authorizing Biometrics...</span>
                                    </>
                                ) : (
                                    <>
                                        <Key size={16} />
                                        <span>Create account with Passkey</span>
                                    </>
                                )}
                            </button>
                        )}

                        {errorMessage && (
                            <div className="passkey-error-msg">
                                <AlertCircle size={14} />
                                <span>{errorMessage}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* External action */}
                {s.action && (
                    <a
                        href={s.action}
                        target="_blank"
                        rel="noreferrer"
                        className="onboard-action-link"
                    >
                        {s.actionLabel}
                    </a>
                )}

                {/* Nav */}
                <div className="onboard-nav">
                    {step > 0 ? (
                        <button className="onboard-btn-secondary" onClick={prev}>← Back</button>
                    ) : (
                        <button className="onboard-btn-secondary" onClick={finish}>Skip</button>
                    )}
                    <button className="onboard-btn-primary" onClick={next}>
                        {step === STEPS.length - 1 ? "Let's Go 🚀" : "Next →"}
                    </button>
                </div>

                {/* Progress text */}
                <div className="onboard-progress-text">Step {step + 1} of {STEPS.length}</div>
            </div>
        </div>
    );
}

/* Helper: check if the user has already been onboarded */
export function shouldShowOnboarding() {
    try { return !localStorage.getItem(STORAGE_KEY); } catch { return false; }
}
