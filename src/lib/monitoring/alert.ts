import { log } from "@/lib/logging/logger";

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
const DISCORD_ALERT_WEBHOOK_URL = process.env.DISCORD_ALERT_WEBHOOK_URL;

export type AlertEvent = {
  type: "discord" | "webhook";
  channel?: string;
  message: string;
  payload?: Record<string, unknown>;
  at: number;
  status: "success" | "fail";
  error?: string;
};

export const alertHistory: AlertEvent[] = [];
const ALERT_HISTORY_LIMIT = 50;

export async function sendDiscordAlert(message: string, options?: Record<string, unknown>) {
  if (!DISCORD_WEBHOOK_URL) {
    log.warn("DISCORD_WEBHOOK_URL 미설정, 디스코드 알림 전송 생략", { message });
    return;
  }
  try {
    await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      body: JSON.stringify({ content: message }),
      headers: { "Content-Type": "application/json" },
    });
    log.info("디스코드 알림 전송 완료", { message });
    alertHistory.unshift({ type: "discord", channel: "discord", message, payload: options, at: Date.now(), status: "success" });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    log.error("디스코드 알림 전송 실패", { error });
    alertHistory.unshift({ type: "discord", channel: "discord", message, payload: options, at: Date.now(), status: "fail", error: errorMsg });
  }
  if (alertHistory.length > ALERT_HISTORY_LIMIT) alertHistory.length = ALERT_HISTORY_LIMIT;
}

export async function sendWebhookAlert(payload: Record<string, unknown>) {
  if (!DISCORD_ALERT_WEBHOOK_URL) {
    log.warn("DISCORD_ALERT_WEBHOOK_URL 미설정, 웹훅 알림 전송 생략", { payload });
    return;
  }
  try {
    await fetch(DISCORD_ALERT_WEBHOOK_URL, {
      method: "POST",
      body: JSON.stringify({ content: JSON.stringify(payload) }),
      headers: { "Content-Type": "application/json" },
    });
    log.info("웹훅 알림 전송 완료", { payload });
    alertHistory.unshift({ type: "webhook", channel: "webhook", message: JSON.stringify(payload), payload, at: Date.now(), status: "success" });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    log.error("웹훅 알림 전송 실패", { error });
    alertHistory.unshift({ type: "webhook", channel: "webhook", message: JSON.stringify(payload), payload, at: Date.now(), status: "fail", error: errorMsg });
  }
  if (alertHistory.length > ALERT_HISTORY_LIMIT) alertHistory.length = ALERT_HISTORY_LIMIT;
} 