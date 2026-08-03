import React, { useState, useEffect } from 'react';
import { Check, X, Copy, User, RefreshCw, Shield, ArrowRight } from 'lucide-react';
import { 
  getUserCashTag, 
  checkCashTagAvailability, 
  claimCashTag, 
  copyToClipboard 
} from '../lib/federation';

export default function CashTagSettings({ address, setToast }) {
  const [claimedTag, setClaimedTag] = useState(null);
  const [handleInput, setHandleInput] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [checkStatus, setCheckStatus] = useState(null); // { available: boolean, message: string }
  const [isClaiming, setIsClaiming] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Load user's existing CashTag on mount or address change
  useEffect(() => {
    if (address) {
      const existing = getUserCashTag(address);
      setClaimedTag(existing);
      if (existing) {
        // Extract handle portion before *lynxx.app
        const handlePart = existing.split('*')[0];
        setHandleInput(handlePart);
      }
    }
  }, [address]);

  // Handle availability check on blur or submit
  const handleCheckAvailability = async (valueToCheck) => {
    const target = (valueToCheck !== undefined ? valueToCheck : handleInput).trim();
    if (!target) {
      setCheckStatus(null);
      return;
    }

    setIsChecking(true);
    setCheckStatus(null);

    try {
      const res = await checkCashTagAvailability(target, address);
      if (res.available) {
        setCheckStatus({
          available: true,
          message: res.reason || 'Available ✓'
        });
      } else {
        setCheckStatus({
          available: false,
          message: res.reason || 'Taken ✗'
        });
      }
    } catch (err) {
      setCheckStatus({
        available: false,
        message: 'Error checking availability'
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    setHandleInput(val);
    setCheckStatus(null);
  };

  const handleBlur = () => {
    if (handleInput.trim()) {
      handleCheckAvailability(handleInput);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!checkStatus && handleInput.trim()) {
        handleCheckAvailability(handleInput);
      } else if (checkStatus?.available && !isClaiming) {
        onClaim();
      }
    }
  };

  const onClaim = async () => {
    if (!handleInput.trim() || !address) return;

    setIsClaiming(true);
    try {
      const res = await claimCashTag(handleInput, address);
      if (res.success) {
        setClaimedTag(res.cashtag);
        setIsEditing(false);
        setCheckStatus(null);
        if (setToast) {
          setToast({
            title: 'CashTag Claimed!',
            message: `Your CashTag ${res.cashtag} is now active.`,
            type: 'success'
          });
        }
      }
    } catch (err) {
      if (setToast) {
        setToast({
          title: 'Claim Failed',
          message: err.message || 'Unable to claim handle. Please try again.',
          type: 'error'
        });
      }
    } finally {
      setIsClaiming(false);
    }
  };

  const handleCopy = async () => {
    if (!claimedTag) return;
    const success = await copyToClipboard(claimedTag);
    if (success) {
      setCopied(true);
      if (setToast) {
        setToast({
          title: 'Copied!',
          message: `${claimedTag} copied to clipboard`,
          type: 'success'
        });
      }
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="cashtag-settings-container">
      {/* Page Header */}
      <div className="cashtag-page-header mb-24">
        <h2 className="cashtag-title">Settings</h2>
        <p className="cashtag-subtitle">
          Manage your account preferences and your unique Stellar federation handle.
        </p>
      </div>

      {/* Prominent Active CashTag View */}
      {claimedTag && !isEditing && (
        <div className="bento-card cashtag-claimed-card mb-24">
          <div className="bento-card-header">
            <span className="cashtag-card-badge">
              <User size={13} /> Your Active CashTag
            </span>
            <span className="bento-card-sub text-muted" onClick={() => setIsEditing(true)}>
              <RefreshCw size={13} /> Edit Handle
            </span>
          </div>

          <div className="cashtag-display-hero">
            <div className="cashtag-hero-text">
              <span className="cashtag-star">*</span>
              <span className="cashtag-handle-name">{claimedTag.split('*')[0]}</span>
              <span className="cashtag-domain-suffix">*lynxx.app</span>
            </div>
            
            <button 
              className={`cashtag-copy-btn ${copied ? 'copied' : ''}`}
              onClick={handleCopy}
              title="Copy CashTag"
            >
              {copied ? <Check size={15} /> : <Copy size={15} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="cashtag-meta-row mt-16">
            <div className="cashtag-meta-pill">
              <Shield size={13} /> Linked to {address ? `${address.slice(0, 6)}...${address.slice(-5)}` : 'Wallet'}
            </div>
            <div className="cashtag-meta-pill success">
              <span className="status-dot"></span> Federation Active
            </div>
          </div>
        </div>
      )}

      {/* Handle Form Card (when not claimed or editing) */}
      {(!claimedTag || isEditing) && (
        <div className="bento-card cashtag-form-card mb-24">
          <div className="bento-card-header">
            <span className="bento-card-title">
              {claimedTag ? 'Update CashTag Handle' : 'Claim Your CashTag'}
            </span>
            {isEditing && (
              <button className="cashtag-cancel-btn" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
            )}
          </div>
          <p className="bento-card-desc mb-20 text-muted" style={{ fontSize: '0.88rem' }}>
            Choose a unique handle (3–20 characters). Friends can send XLM to this handle directly.
          </p>

          {/* Text Input with *lynxx.app Suffix */}
          <div className="cashtag-input-container mb-16">
            <label className="cashtag-input-label">Desired Handle</label>
            <div className="cashtag-input-wrap">
              <span className="cashtag-prefix">*</span>
              <input 
                id="cashtag-input"
                type="text" 
                className="cashtag-text-input" 
                placeholder="yourname"
                value={handleInput}
                onChange={handleInputChange}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                maxLength={20}
                disabled={isClaiming}
              />
              <span className="cashtag-suffix-badge">*lynxx.app</span>
            </div>
          </div>

          {/* Status Indicator Bar */}
          <div className="cashtag-status-bar mb-20">
            {isChecking && (
              <div className="cashtag-status-pill checking">
                <RefreshCw size={14} className="animate-spin" />
                <span>Checking availability...</span>
              </div>
            )}

            {!isChecking && checkStatus && (
              <div className={`cashtag-status-pill ${checkStatus.available ? 'available' : 'taken'}`}>
                {checkStatus.available ? (
                  <>
                    <Check size={14} />
                    <span>Available ✓</span>
                  </>
                ) : (
                  <>
                    <X size={14} />
                    <span>Taken ✗ ({checkStatus.message})</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="cashtag-action-row">
            <button 
              id="cashtag-check-btn"
              className="cashtag-btn-secondary"
              onClick={() => handleCheckAvailability()}
              disabled={isChecking || !handleInput.trim()}
            >
              Check Availability
            </button>

            <button 
              id="cashtag-claim-btn"
              className="cashtag-btn-primary"
              onClick={onClaim}
              disabled={isClaiming || isChecking || !checkStatus?.available}
            >
              {isClaiming ? 'Claiming...' : 'Claim CashTag'}
            </button>
          </div>
        </div>
      )}

      {/* Overview / Federation Details Card */}
      <div className="bento-card cashtag-info-card">
        <div className="bento-card-header">
          <span className="bento-card-title">
            About Federation Handles
          </span>
        </div>
        <div className="cashtag-info-body text-muted">
          <p>
            Stellar Federation (SEP-0002) maps complex public keys (e.g. <code>G...F3T2</code>) to memorable handles like <code>name*lynxx.app</code>.
          </p>
          <ul className="cashtag-feature-list mt-12">
            <li>
              <ArrowRight size={13} className="list-icon" />
              <span>Simplified payments without copying 56-character public keys.</span>
            </li>
            <li>
              <ArrowRight size={13} className="list-icon" />
              <span>Direct cryptographic binding to your connected wallet.</span>
            </li>
            <li>
              <ArrowRight size={13} className="list-icon" />
              <span>Compatible with standard Stellar network wallets and dApps.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
