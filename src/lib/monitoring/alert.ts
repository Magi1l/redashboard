import { log } from "@/lib/logging/logger";

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
const ALERT_WEBHOOK_URL = process.env.ALERT_WEBHOOK_URL;

export type AlertEvent = {
  type: "slack" | "webhook";
  channel?: string;
  message: string;
  payload?: any;
  at: number;
  status: "success" | "fail";
  error?: string;
};

export const alertHistory: AlertEvent[] = [];
const ALERT_HISTORY_LIMIT = 50;

export async function sendSlackAlert(message: string, options?: Record<string, any>) {
  if (!SLACK_WEBHOOK_URL) {
    log.warn("SLACK_WEBHOOK_URL 미설정, 슬랙 알림 전송 생략", { message });
    return;
  }
  try {
    await fetch(SLACK_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: message, ...options }),
    });
    log.info("슬랙 알림 전송 완료", { message });
    alertHistory.unshift({ type: "slack", channel: "slack", message, payload: options, at: Date.now(), status: "success" });
  } catch (err: any) {
    log.error("슬랙 알림 전송 실패", { error: err?.message });
    alertHistory.unshift({ type: "slack", channel: "slack", message, payload: options, at: Date.now(), status: "fail", error: err?.message });
  }
  if (alertHistory.length > ALERT_HISTORY_LIMIT) alertHistory.length = ALERT_HISTORY_LIMIT;
}

export async function sendWebhookAlert(payload: any) {
  if (!ALERT_WEBHOOK_URL) {
    log.warn("ALERT_WEBHOOK_URL 미설정, 웹훅 알림 전송 생략", { payload });
    return;
  }
  try {
    await fetch(ALERT_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    log.info("웹훅 알림 전송 완료", { payload });
    alertHistory.unshift({ type: "webhook", channel: "webhook", message: JSON.stringify(payload), payload, at: Date.now(), status: "success" });
  } catch (err: any) {
    log.error("웹훅 알림 전송 실패", { error: err?.message });
    alertHistory.unshift({ type: "webhook", channel: "webhook", message: JSON.stringify(payload), payload, at: Date.now(), status: "fail", error: err?.message });
  }
  if (alertHistory.length > ALERT_HISTORY_LIMIT) alertHistory.length = ALERT_HISTORY_LIMIT;
} 