"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendDiscordNotification = sendDiscordNotification;
const axios_1 = __importDefault(require("axios"));
// Simple in-memory cache to prevent duplicate notifications
// In production, you might want to use Redis
const notificationCache = new Set();
async function sendDiscordNotification(eventId, payload) {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) {
        console.warn("DISCORD_WEBHOOK_URL is not set. Skipping Discord notification.");
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
        console.log(`[Discord Webhook] Successfully sent notification for event: ${eventId}`);
    }
    catch (error) {
        console.error(`[Discord Webhook] Failed to send notification for event ${eventId}:`, error.message);
    }
}
