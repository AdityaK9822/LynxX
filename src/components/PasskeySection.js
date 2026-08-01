"use client";

import { useState, useEffect } from "react";
import { toast as sonnerToast } from "sonner";
import {
  Key,
  Fingerprint,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  Lock,
  Smartphone
} from "lucide-react";
import {
  createPasskey,
  isPasskeySupported,
  getSavedPasskeyId,
  getSavedPublicKey,
  clearSavedPasskey,
  authenticatePasskey
} from "../lib/passkey";

export default function PasskeySection() {
  const [supported, setSupported] = useState(true);
  const [username, setUsername] = useState("user@lynxx.app");
  const [isRegistering, setIsRegistering] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [savedCredentialId, setSavedCredentialId] = useState(null);
  const [savedPublicKey, setSavedPublicKey] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [authSuccessMsg, setAuthSuccessMsg] = useState(null);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  useEffect(() => {
    setSupported(isPasskeySupported());
    refreshSavedCredentials();
  }, []);

  const refreshSavedCredentials = () => {
    setSavedCredentialId(getSavedPasskeyId());
    setSavedPublicKey(getSavedPublicKey());
  };

  const handleCreate = async () => {
    setErrorMessage(null);
    setAuthSuccessMsg(null);
    if (!supported) {
      const msg = "Passkeys (WebAuthn) are not supported on this browser or device.";
      setErrorMessage(msg);
      sonnerToast.error(msg);
      return;
    }

    setIsRegistering(true);
    try {
      const res = await createPasskey(username.trim() || "user@lynxx.app");
      if (res.success) {
        refreshSavedCredentials();
        sonnerToast.success("Device Key generated & saved successfully!");
      } else {
        setErrorMessage(res.error);
        sonnerToast.error(res.error);
      }
    } catch (err) {
      const msg = err?.message || "Failed to create passkey.";
      setErrorMessage(msg);
      sonnerToast.error(msg);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleTestSign = async () => {
    setErrorMessage(null);
    setAuthSuccessMsg(null);
    setIsAuthenticating(true);
    try {
      const res = await authenticatePasskey("Confirm test transaction of 10 XLM on LynxX Testnet");
      if (res.success) {
        const successText = `Transaction signed! Credential verified with signature: ${res.signature?.slice(0, 20)}...`;
        setAuthSuccessMsg(successText);
        sonnerToast.success("Biometric device signature verified!");
      } else {
        setErrorMessage(res.error);
        sonnerToast.error(res.error);
      }
    } catch (err) {
      const msg = err?.message || "Verification failed.";
      setErrorMessage(msg);
      sonnerToast.error(msg);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleReset = () => {
    clearSavedPasskey();
    refreshSavedCredentials();
    setErrorMessage(null);
    setAuthSuccessMsg(null);
    sonnerToast.info("Saved Device Key removed.");
  };

  const copyText = (text, type) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    if (type === "id") {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } else {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
    sonnerToast.success("Copied to clipboard!");
  };

  return (
    <div className="passkey-section-wrapper" style={{ padding: "10px 0" }}>
      <div
        className="passkey-section-container"
        style={{
          background: "linear-gradient(145deg, rgba(15,23,42,0.85), rgba(9,14,23,0.95))",
          border: "1px solid rgba(56, 189, 248, 0.2)",
          borderRadius: "28px",
          padding: "40px",
          boxShadow: "0 20px 50px rgba(0,0,0,0.4), 0 0 30px rgba(14, 165, 233, 0.08)",
          color: "#fff",
          position: "relative",
          overflow: "hidden"
        }}
      >
        {/* Glow decoration */}
        <div
          style={{
            position: "absolute",
            top: "-120px",
            right: "-120px",
            width: "300px",
            height: "300px",
            background: "radial-gradient(circle, rgba(14,165,233,0.18) 0%, rgba(0,0,0,0) 70%)",
            filter: "blur(40px)",
            pointerEvents: "none"
          }}
        />

        {/* Section Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "28px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "18px",
              background: "linear-gradient(135deg, rgba(14,165,233,0.2), rgba(16,185,129,0.2))",
              border: "1px solid rgba(56,189,248,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#38bdf8",
              boxShadow: "0 0 20px rgba(56, 189, 248, 0.25)"
            }}
          >
            <Fingerprint size={30} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <h3 style={{ fontSize: "1.75rem", fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>
                Seedless Onboarding & Device Key
              </h3>
              {supported ? (
                <span
                  style={{
                    fontSize: "0.75rem",
                    padding: "4px 10px",
                    borderRadius: "999px",
                    background: "rgba(16, 185, 129, 0.15)",
                    color: "#34d399",
                    border: "1px solid rgba(16, 185, 129, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    fontWeight: 600
                  }}
                >
                  <CheckCircle size={12} /> WebAuthn Supported
                </span>
              ) : (
                <span
                  style={{
                    fontSize: "0.75rem",
                    padding: "4px 10px",
                    borderRadius: "999px",
                    background: "rgba(244, 63, 94, 0.15)",
                    color: "#fb7185",
                    border: "1px solid rgba(244, 63, 94, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    fontWeight: 600
                  }}
                >
                  <AlertCircle size={12} /> Unsupported Device
                </span>
              )}
            </div>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.95rem", margin: 0, lineHeight: 1.5 }}>
              Generate a cryptographic Device Key using your phone or laptop's Secure Enclave (FaceID / TouchID). No seed phrases required.
            </p>
          </div>
        </div>

        {/* Unsupported Warning Fallback */}
        {!supported && (
          <div
            style={{
              background: "rgba(244, 63, 94, 0.1)",
              border: "1px solid rgba(244, 63, 94, 0.3)",
              borderRadius: "16px",
              padding: "20px",
              marginBottom: "24px",
              display: "flex",
              alignItems: "flex-start",
              gap: "14px",
              color: "#fecdd3"
            }}
          >
            <AlertCircle size={22} className="text-rose-400 flex-shrink-0" style={{ marginTop: "2px" }} />
            <div>
              <h4 style={{ margin: "0 0 6px", fontWeight: 600, color: "#fff" }}>WebAuthn / Passkeys Unavailable</h4>
              <p style={{ margin: 0, fontSize: "0.88rem", lineHeight: 1.5 }}>
                Your current browser or device does not support hardware passkeys (navigator.credentials.create). You can still use LynxX with a standard wallet like Freighter.
              </p>
            </div>
          </div>
        )}

        {/* Grid layout for Generation / Saved Key Inspector */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
          {/* Left Column: Generate Passkey Box */}
          <div
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "20px",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between"
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px", color: "#38bdf8" }}>
                <Smartphone size={18} />
                <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>1. Register Hardware Device Key</span>
              </div>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.85rem", marginBottom: "20px", lineHeight: 1.5 }}>
                Create an ECDSA (P-256) key pair on your device. The private key never leaves your Secure Enclave.
              </p>

              <label style={{ display: "block", fontSize: "0.8rem", color: "rgba(255,255,255,0.5)", marginBottom: "6px", fontWeight: 500 }}>
                USER IDENTIFIER / EMAIL
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="user@lynxx.app"
                disabled={isRegistering}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  background: "rgba(0,0,0,0.35)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#fff",
                  fontSize: "0.95rem",
                  marginBottom: "20px",
                  outline: "none"
                }}
              />
            </div>

            <button
              type="button"
              onClick={handleCreate}
              disabled={!supported || isRegistering}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "14px",
                background: isRegistering
                  ? "rgba(56, 189, 248, 0.4)"
                  : "linear-gradient(135deg, #0284c7, #0369a1)",
                border: "1px solid rgba(56,189,248,0.5)",
                color: "#fff",
                fontWeight: 600,
                fontSize: "1rem",
                cursor: !supported || isRegistering ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                boxShadow: "0 4px 15px rgba(2, 132, 199, 0.3)",
                transition: "all 0.2s ease"
              }}
            >
              {isRegistering ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  <span>Prompting Biometrics...</span>
                </>
              ) : (
                <>
                  <Key size={18} />
                  <span>Sign up with FaceID / Passkey</span>
                </>
              )}
            </button>
          </div>

          {/* Right Column: Credential Inspector & Signer */}
          <div
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "20px",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between"
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#34d399" }}>
                  <ShieldCheck size={18} />
                  <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>2. Stored Credential & Transaction Signing</span>
                </div>
                {savedCredentialId && (
                  <button
                    type="button"
                    onClick={handleReset}
                    title="Remove saved passkey"
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "rgba(255,255,255,0.4)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "0.78rem"
                    }}
                  >
                    <Trash2 size={14} /> Remove
                  </button>
                )}
              </div>

              {savedCredentialId ? (
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ marginBottom: "12px" }}>
                    <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.45)", marginBottom: "4px" }}>
                      CREDENTIAL ID
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: "rgba(0,0,0,0.3)",
                        padding: "10px 12px",
                        borderRadius: "10px",
                        border: "1px solid rgba(255,255,255,0.08)",
                        fontFamily: "monospace",
                        fontSize: "0.82rem",
                        color: "#38bdf8"
                      }}
                    >
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {savedCredentialId}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyText(savedCredentialId, "id")}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: copiedId ? "#34d399" : "rgba(255,255,255,0.6)",
                          cursor: "pointer",
                          padding: "2px",
                          marginLeft: "8px"
                        }}
                      >
                        {copiedId ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>

                  {savedPublicKey && (
                    <div>
                      <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.45)", marginBottom: "4px" }}>
                        PUBLIC KEY (EXTRACTED HEX)
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          background: "rgba(0,0,0,0.3)",
                          padding: "10px 12px",
                          borderRadius: "10px",
                          border: "1px solid rgba(255,255,255,0.08)",
                          fontFamily: "monospace",
                          fontSize: "0.82rem",
                          color: "#a78bfa"
                        }}
                      >
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {savedPublicKey}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyText(savedPublicKey, "key")}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: copiedKey ? "#34d399" : "rgba(255,255,255,0.6)",
                            cursor: "pointer",
                            padding: "2px",
                            marginLeft: "8px"
                          }}
                        >
                          {copiedKey ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  style={{
                    background: "rgba(0,0,0,0.25)",
                    border: "1px dashed rgba(255,255,255,0.15)",
                    borderRadius: "14px",
                    padding: "24px",
                    textAlign: "center",
                    color: "rgba(255,255,255,0.4)",
                    marginBottom: "16px",
                    fontSize: "0.88rem"
                  }}
                >
                  No passkey saved on this device yet. Click "Sign up with FaceID / Passkey" to register.
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleTestSign}
              disabled={!savedCredentialId || isAuthenticating}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "14px",
                background: !savedCredentialId
                  ? "rgba(255,255,255,0.05)"
                  : isAuthenticating
                  ? "rgba(16, 185, 129, 0.4)"
                  : "linear-gradient(135deg, #059669, #047857)",
                border: !savedCredentialId ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(16,185,129,0.5)",
                color: !savedCredentialId ? "rgba(255,255,255,0.3)" : "#fff",
                fontWeight: 600,
                fontSize: "1rem",
                cursor: !savedCredentialId || isAuthenticating ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                boxShadow: savedCredentialId ? "0 4px 15px rgba(5, 150, 105, 0.3)" : "none",
                transition: "all 0.2s ease"
              }}
            >
              {isAuthenticating ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  <span>Verifying Biometrics...</span>
                </>
              ) : (
                <>
                  <Lock size={18} />
                  <span>Test Sign with FaceID / Passkey</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Status Alerts */}
        {errorMessage && (
          <div
            style={{
              marginTop: "20px",
              padding: "14px 18px",
              borderRadius: "12px",
              background: "rgba(244, 63, 94, 0.15)",
              border: "1px solid rgba(244, 63, 94, 0.3)",
              color: "#fecdd3",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "0.9rem"
            }}
          >
            <AlertCircle size={18} className="text-rose-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {authSuccessMsg && (
          <div
            style={{
              marginTop: "20px",
              padding: "14px 18px",
              borderRadius: "12px",
              background: "rgba(16, 185, 129, 0.15)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              color: "#a7f3d0",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "0.9rem"
            }}
          >
            <CheckCircle size={18} className="text-emerald-400 flex-shrink-0" />
            <span>{authSuccessMsg}</span>
          </div>
        )}
      </div>
    </div>
  );
}
