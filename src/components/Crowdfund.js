import { toast } from "sonner";
import { useState, useEffect, useCallback, useRef } from "react";
import { ExternalLink } from "lucide-react";
import { triggerDonationConfetti } from "../lib/confettiUtils";
import {
    getCampaign,
    getMyContribution,
    getRecentDonations,
    donate,
    CONTRACT_ID,
    FundError,
    getBadgeTier,
} from "./Fund";

const short = (a) => (a ? `${a.slice(0, 4)}…${a.slice(-4)}` : "");
const fmt = (n) => Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 });

/**
 * StellarFund crowdfunding panel.
 *  - `address` present  → full donate experience (dashboard)
 *  - `address` null     → read-only live preview (landing page)
 */
export default function Crowdfund({ address = null, onDonated }) {
    const [campaign, setCampaign]   = useState(null);
    const [recent, setRecent]       = useState([]);
    const [mine, setMine]           = useState(0);
    const [badgeTier, setBadgeTier] = useState("None");
    const [amount, setAmount]       = useState("");
    const [status, setStatus]       = useState("idle"); // idle | pending | success | error
    const [hash, setHash]           = useState("");
    const [errorMsg, setErrorMsg]   = useState("");
    const mounted = useRef(true);

    const refresh = useCallback(async () => {
        try {
            const [c, r] = await Promise.all([getCampaign(), getRecentDonations()]);
            if (!mounted.current) return;
            setCampaign(c);
            setRecent(r);
            if (address) {
                setMine(await getMyContribution(address));
                setBadgeTier(await getBadgeTier(address));
            }
        } catch (e) {
            console.warn("campaign refresh failed:", e);
        }
    }, [address]);

    // Initial load + real-time polling (state synchronization).
    useEffect(() => {
        mounted.current = true;
        refresh();
        const id = setInterval(refresh, 8000);
        return () => { mounted.current = false; clearInterval(id); };
    }, [refresh]);

    const handleDonate = async () => {
        setStatus("pending");
        setHash("");
        setErrorMsg("");
        try {
            const oldTier = await getBadgeTier(address);
            const txHash = await donate(address, amount);

            setHash(txHash);
            setStatus("success");
            setAmount("");

            await refresh();

            const isGoalReached = campaign ? (campaign.closed || campaign.progress >= 100) : false;
            triggerDonationConfetti(isGoalReached);

            const newTier = await getBadgeTier(address);
            if (oldTier !== newTier) {
                toast.success(`🎉 Congratulations! Your badge tier is now ${newTier}`);
            } else {
                toast.success("🎉 Thank you! Your donation was successfully recorded on-chain.");
            }

            onDonated?.();
        } catch (e) {
            setStatus("error");
            const msg = e instanceof FundError ? e.message : e?.message || "Donation failed. Please try again.";
            setErrorMsg(msg);
            toast.error(msg);
        }
    };

    const pct = campaign ? campaign.progress : 0;

    return (
        <div className="cf-panel">
            <div className="cf-head">
                <div>
                    <div className="cf-eyebrow">On-chain crowdfunding · Soroban</div>
                    <div className="cf-title">Back the campaign, on-chain</div>
                </div>
                {campaign && (
                    <span className={`cf-state ${campaign.closed ? "cf-state-closed" : "cf-state-live"}`}>
                        <span className="status-dot" /> {campaign.closed ? "Goal reached" : "Live"}
                    </span>
                )}
            </div>

            {/* Campaign Summary & Progress Bar */}
            <div className="cf-body">
                <div className="cf-metrics">
                    <div className="cf-metric">
                        <div className="cf-m-lbl">Raised</div>
                        <div className="cf-m-val">{campaign ? `${fmt(campaign.raisedXlm)} XLM` : "..."}</div>
                    </div>
                    <div className="cf-metric">
                        <div className="cf-m-lbl">Goal</div>
                        <div className="cf-m-val">{campaign ? `${fmt(campaign.target)} XLM` : "..."}</div>
                    </div>
                    <div className="cf-metric">
                        <div className="cf-m-lbl">Donors</div>
                        <div className="cf-m-val">{campaign ? campaign.donorsCount : "..."}</div>
                    </div>
                </div>

                <div className="cf-progress-track">
                    <div className="cf-progress-fill" style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>
                <div className="cf-progress-lbl">
                    <span>{pct.toFixed(1)}% funded</span>
                    {campaign?.closed && <span className="cf-goal-badge">🏆 Target Achieved</span>}
                </div>

                {/* Donation Form */}
                {address ? (
                    <div className="cf-donate-form" style={{ marginTop: "20px" }}>
                        <div style={{ display: "flex", gap: "8px" }}>
                            <input
                                type="number"
                                placeholder="Amount in XLM"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                disabled={status === "pending" || campaign?.closed}
                                className="input"
                                style={{ flex: 1 }}
                            />
                            <button
                                onClick={handleDonate}
                                disabled={status === "pending" || !amount || campaign?.closed}
                                className="btn btn-primary"
                            >
                                {status === "pending" ? "Donating..." : "Donate XLM"}
                            </button>
                        </div>

                        {mine > 0 && (
                            <div className="cf-user-info" style={{ marginTop: "12px", fontSize: "0.85rem", color: "rgba(255,255,255,0.7)" }}>
                                Your Total Contribution: <strong>{fmt(mine)} XLM</strong> · Badge Tier: <span className="badge-chip">{badgeTier}</span>
                            </div>
                        )}

                        {status === "success" && hash && (
                            <div className="cf-status-success" style={{ marginTop: "12px", fontSize: "0.85rem", color: "#34d399" }}>
                                Transaction confirmed!{" "}
                                <a
                                    href={`https://stellar.expert/explorer/testnet/tx/${hash}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{ color: "#38bdf8", textDecoration: "underline" }}
                                >
                                    View Tx <ExternalLink size={12} style={{ display: "inline" }} />
                                </a>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="cf-preview-note" style={{ marginTop: "16px", fontSize: "0.85rem", color: "rgba(255,255,255,0.5)" }}>
                        Connect wallet to back this campaign on Stellar Testnet.
                    </div>
                )}

                {/* Recent Donations Feed */}
                {recent.length > 0 && (
                    <div className="cf-recent-feed" style={{ marginTop: "24px" }}>
                        <div style={{ fontSize: "0.85rem", fontWeight: "600", color: "#fff", marginBottom: "8px" }}>
                            Recent Supporters
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            {recent.slice(0, 4).map((r, i) => (
                                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "rgba(255,255,255,0.7)", background: "rgba(255,255,255,0.03)", padding: "6px 12px", borderRadius: "8px" }}>
                                    <span>{short(r.donor)}</span>
                                    <span style={{ color: "#38bdf8", fontWeight: "600" }}>+{fmt(r.amount)} XLM</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
