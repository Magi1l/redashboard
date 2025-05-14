import { sendDiscordAlert } from "@/lib/monitoring/alert";

type Metric = {
  count: number;
  success: number;
  fail: number;
  totalTime: number;
  lastStatus: number;
  lastError?: string;
};

const metrics: Record<string, Metric> = {};

// 임계치(기본값, 환경변수로 오버라이드 가능)
const ERROR_RATE_THRESHOLD = Number(process.env.ERROR_RATE_THRESHOLD) || 0.2; // 20%
const AVG_MS_THRESHOLD = Number(process.env.AVG_MS_THRESHOLD) || 2000; // 2초
const lastAlertAt: Record<string, number> = {};
const ALERT_INTERVAL = 5 * 60 * 1000; // 5분 중복 알림 방지

export function recordMetric(endpoint: string, status: number, duration: number, error?: string) {
  if (!metrics[endpoint]) {
    metrics[endpoint] = { count: 0, success: 0, fail: 0, totalTime: 0, lastStatus: 0 };
  }
  const m = metrics[endpoint];
  m.count++;
  m.totalTime += duration;
  m.lastStatus = status;
  if (status >= 200 && status < 400) {
    m.success++;
  } else {
    m.fail++;
    if (error) m.lastError = error;
  }

  // 임계치 초과 감지 및 알림
  const now = Date.now();
  const errorRate = m.count ? m.fail / m.count : 0;
  const avgMs = m.count ? m.totalTime / m.count : 0;
  if ((errorRate > ERROR_RATE_THRESHOLD || avgMs > AVG_MS_THRESHOLD)) {
    if (!lastAlertAt[endpoint] || now - lastAlertAt[endpoint] > ALERT_INTERVAL) {
      lastAlertAt[endpoint] = now;
      sendDiscordAlert(
        `[ALERT] ${endpoint} 임계치 초과\n에러율: ${(errorRate * 100).toFixed(1)}% (기준 ${ERROR_RATE_THRESHOLD * 100}%)\n평균응답: ${Math.round(avgMs)}ms (기준 ${AVG_MS_THRESHOLD}ms)\n최근에러: ${m.lastError || "-"}`
      );
    }
  }
}

export function getMetrics() {
  // 평균 응답속도 등 요약 포함
  return Object.entries(metrics).map(([endpoint, m]) => ({
    endpoint,
    count: m.count,
    success: m.success,
    fail: m.fail,
    avgMs: m.count ? Math.round(m.totalTime / m.count) : 0,
    lastStatus: m.lastStatus,
    lastError: m.lastError,
  }));
} 