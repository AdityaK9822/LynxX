import axios from "axios";

export interface DiscordEmbed {
  title?: string;
  description?: string;
  url?: string;
  color?: number;
  author?: {
    name: string;
    url?: string;
    icon_url?: string;
  };
  fields?: Array<{
    name: string;
    value: string;
    inline?: boolean;
  }>;
  footer?: {
    text: string;
    icon_url?: string;
  };
  timestamp?: string;
}

export interface DiscordPayload {
  content?: string;
  embeds: DiscordEmbed[];
}

export type WebhookCategory = 
  | "general"
  | "available_issues"
  | "claimed_issues"
  | "pull_requests"
  | "completed"
  | "completed_contributions";

// Simple in-memory cache to prevent duplicate notifications
const notificationCache = new Set<string>();

export async function sendDiscordNotification(
  eventId: string,
  payload: DiscordPayload,
  category: WebhookCategory = "general"
): Promise<void> {
  // Determine which webhook to use based on the category
  let webhookUrl = process.env.DISCORD_WEBHOOK_GENERAL || process.env.DISCORD_WEBHOOK_URL;

  if (category === "available_issues" && process.env.DISCORD_WEBHOOK_AVAILABLE_ISSUES) {
    webhookUrl = process.env.DISCORD_WEBHOOK_AVAILABLE_ISSUES;
  } else if (category === "claimed_issues" && process.env.DISCORD_WEBHOOK_CLAIMED_ISSUES) {
    webhookUrl = process.env.DISCORD_WEBHOOK_CLAIMED_ISSUES;
  } else if (category === "pull_requests" && process.env.DISCORD_WEBHOOK_PULL_REQUESTS) {
    webhookUrl = process.env.DISCORD_WEBHOOK_PULL_REQUESTS;
  } else if (category === "completed" && process.env.DISCORD_WEBHOOK_COMPLETED) {
    webhookUrl = process.env.DISCORD_WEBHOOK_COMPLETED;
  } else if (category === "completed_contributions" && process.env.DISCORD_WEBHOOK_COMPLETED_CONTRIBUTIONS) {
    webhookUrl = process.env.DISCORD_WEBHOOK_COMPLETED_CONTRIBUTIONS;
  }

  if (!webhookUrl) {
    console.warn(
      `No Webhook URL found for category '${category}' or general fallback. Skipping notification.`
    );
    return;
  }

  // Deduplication check
  if (notificationCache.has(eventId)) {
    console.log(`[Discord Webhook] Skipping duplicate event: ${eventId}`);
    return;
  }

  try {
    await axios.post(webhookUrl, payload);
    notificationCache.add(eventId);

    // Keep cache from growing indefinitely (clean up after 10 minutes)
    setTimeout(() => {
      notificationCache.delete(eventId);
    }, 10 * 60 * 1000);

    console.log(`[Discord Webhook] Successfully sent notification to '${category}' for event: ${eventId}`);
  } catch (error: any) {
    console.error(
      `[Discord Webhook] Failed to send notification to '${category}' for event ${eventId}:`,
      error.message
    );
  }
}
