"use client";

import { useState, useEffect } from "react";
import { toast as sonnerToast } from "sonner";
import { 
  Repeat, 
  Lock, 
  X, 
  CheckCircle2, 
  Calendar, 
  Building2, 
  Coins 
} from "lucide-react";

export default function SubscriptionPrompt({
  merchantName = "Acme Premium SaaS",
  amount = "15",
  token = "USDC",
  intervalDays = 30,
  isOpen = true,
  onAuthorize,
  onCancel,
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => setVisible(true), 40);
      return () => clearTimeout(t);
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAuthorize = () => {
    const subscriptionDetails = {
      merchantName,
      amount,
      token,
      intervalDays,
      authorizedAt: new Date().toISOString(),
      status: "authorized",
    };

    // Acceptance Criteria Requirement 4: console.log the subscription details
    console.log("💳 [LynxX Subscription Authorized]:", subscriptionDetails);

    sonnerToast.success(`Recurring pull authorized for ${merchantName}!`);

    if (typeof onAuthorize === "function") {
      onAuthorize(subscriptionDetails);
    }
  };

  const handleCancel = () => {
    setVisible(false);
    setTimeout(() => {
      if (typeof onCancel === "function") {
        onCancel();
      }
    }, 200);
  };

  return (
    <div className={`subscription-overlay ${visible ? "subscription-overlay-in" : ""}`}>
      <div className={`subscription-modal ${visible ? "subscription-modal-in" : ""}`}>
        {/* Close Button */}
        <button
          type="button"
          className="subscription-close-btn"
          onClick={handleCancel}
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Top Header Badge */}
        <div className="subscription-badge-wrap mb-16">
          <div className="subscription-badge">
            <Repeat size={14} className="text-cyan-400" />
            <span>Recurring Payment Pull</span>
          </div>
        </div>

        {/* Merchant Avatar Pill */}
        <div className="subscription-merchant-pill mb-16">
          <Building2 size={14} className="text-purple-400" />
          <span className="font-semibold text-white text-xs">{merchantName}</span>
        </div>

        {/* Clear Summary Headline (Acceptance Criteria Requirement 2) */}
        <h2 className="subscription-summary-headline mb-20">
          Authorize <span className="highlight-merchant">{merchantName}</span> to pull{" "}
          <span className="highlight-amount">{amount} {token}</span> every{" "}
          <span className="highlight-interval">{intervalDays} days</span>?
        </h2>

        {/* Details Table */}
        <div className="subscription-details-card mb-20">
          <div className="summary-row">
            <span className="summary-label flex items-center gap-2">
              <Building2 size={13} className="text-muted" /> Service Merchant
            </span>
            <span className="summary-value font-semibold text-white">{merchantName}</span>
          </div>
          <div className="summary-row">
            <span className="summary-label flex items-center gap-2">
              <Coins size={13} className="text-muted" /> Payment Amount
            </span>
            <span className="summary-value font-bold text-cyan-400">{amount} {token}</span>
          </div>
          <div className="summary-row">
            <span className="summary-label flex items-center gap-2">
              <Calendar size={13} className="text-muted" /> Billing Frequency
            </span>
            <span className="summary-value text-purple-300">Every {intervalDays} Days</span>
          </div>
        </div>

        {/* Security Warning (Acceptance Criteria Requirement 5) */}
        <div className="security-warning-box mb-24">
          <Lock size={14} className="text-cyan-400 flex-shrink-0" />
          <span>You can revoke this at any time from Settings.</span>
        </div>

        {/* Action Buttons (Acceptance Criteria Requirement 3) */}
        <div className="subscription-action-row flex gap-3">
          <button
            id="btn-cancel-subscription"
            type="button"
            className="btn btn-glass-secondary flex-1"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            id="btn-authorize-subscription"
            type="button"
            className="btn btn-gradient flex-1 flex items-center justify-center gap-2"
            onClick={handleAuthorize}
          >
            <CheckCircle2 size={16} /> Authorize
          </button>
        </div>
      </div>
    </div>
  );
}
