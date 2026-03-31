import type { NotificationChannel } from "@paperclipai/shared";
import { logger } from "../middleware/logger.js";

export interface NotificationPayload {
  title: string;
  body: string;
  /** Optional URL to link to (e.g. the agent page) */
  url?: string;
}

/** Send a notification to a single channel. Returns true on success. */
async function sendToChannel(channel: NotificationChannel, payload: NotificationPayload): Promise<boolean> {
  if (channel.type === "wecom_bot") {
    return sendWecomBotMessage(channel.webhookUrl, payload);
  }
  logger.warn({ channelType: (channel as { type: string }).type }, "notifications: unknown channel type, skipping");
  return false;
}

async function sendWecomBotMessage(webhookUrl: string, payload: NotificationPayload): Promise<boolean> {
  const text = payload.url
    ? `**${payload.title}**\n${payload.body}\n${payload.url}`
    : `**${payload.title}**\n${payload.body}`;

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ msgtype: "markdown", markdown: { content: text } }),
    });
    if (!res.ok) {
      logger.warn({ status: res.status, webhookUrl }, "notifications: wecom bot webhook returned non-2xx");
      return false;
    }
    return true;
  } catch (err) {
    logger.warn({ err, webhookUrl }, "notifications: wecom bot webhook request failed");
    return false;
  }
}

/** Send a notification to all configured channels. Errors are logged, not thrown. */
export async function sendNotification(
  channels: NotificationChannel[],
  payload: NotificationPayload,
): Promise<void> {
  if (channels.length === 0) return;
  await Promise.all(
    channels.map((channel) =>
      sendToChannel(channel, payload).catch((err) => {
        logger.warn({ err }, "notifications: unexpected error sending to channel");
      }),
    ),
  );
}
