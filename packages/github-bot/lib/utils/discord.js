"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendDiscordNotification = sendDiscordNotification;
const axios_1 = __importDefault(require("axios"));
// Simple in-memory cache to prevent duplicate notifications
const notificationCache = new Set();
async function sendDiscordNotification(eventId, payload, category = "general") {
    // Determine which webhook to use based on the category
    let webhookUrl = process.env.DISCORD_WEBHOOK_GENERAL || process.env.DISCORD_WEBHOOK_URL;
    if (category === "available_issues" && process.env.DISCORD_WEBHOOK_AVAILABLE_ISSUES) {
        webhookUrl = process.env.DISCORD_WEBHOOK_AVAILABLE_ISSUES;
    }
    else if (category === "claimed_issues" && process.env.DISCORD_WEBHOOK_CLAIMED_ISSUES) {
        webhookUrl = process.env.DISCORD_WEBHOOK_CLAIMED_ISSUES;
    }
    else if (category === "pull_requests" && process.env.DISCORD_WEBHOOK_PULL_REQUESTS) {
        webhookUrl = process.env.DISCORD_WEBHOOK_PULL_REQUESTS;
    }
    else if (category === "completed" && process.env.DISCORD_WEBHOOK_COMPLETED) {
        webhookUrl = process.env.DISCORD_WEBHOOK_COMPLETED;
    }
    else if (category === "completed_contributions" && process.env.DISCORD_WEBHOOK_COMPLETED_CONTRIBUTIONS) {
        webhookUrl = process.env.DISCORD_WEBHOOK_COMPLETED_CONTRIBUTIONS;
    }
    if (!webhookUrl) {
        console.warn(`No Webhook URL found for category '${category}' or general fallback. Skipping notification.`);
        return;
    }
    // Deduplication check
    if (notificationCache.has(eventId)) {
        console.log(`[Discord Webhook] Skipping duplicate event: ${eventId}`);
        return;
    }
    try {
        await axios_1.default.post(webhookUrl, payload);
        notificationCache.add(eventId);
        // Keep cache from growing indefinitely (clean up after 10 minutes)
        setTimeout(() => {
            notificationCache.delete(eventId);
        }, 10 * 60 * 1000);
        console.log(`[Discord Webhook] Successfully sent notification to '${category}' for event: ${eventId}`);
    }
    catch (error) {
        console.error(`[Discord Webhook] Failed to send notification to '${category}' for event ${eventId}:`, error.message);
    }
}
