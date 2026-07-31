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
  embeds: DiscordEmbed[];
}

// Simple in-memory cache to prevent duplicate notifications
// In production, you might want to use Redis
const notificationCache = new Set<string>();

export async function sendDiscordNotification(
  eventId: string,
  payload: DiscordPayload
): Promise<void> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn(
      "DISCORD_WEBHOOK_URL is not set. Skipping Discord notification."
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

    console.log(`[Discord Webhook] Successfully sent notification for event: ${eventId}`);
  } catch (error: any) {
    console.error(
      `[Discord Webhook] Failed to send notification for event ${eventId}:`,
      error.message
    );
  }
}
