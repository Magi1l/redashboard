import { NextRequest, NextResponse } from "next/server";
import { getMetrics } from "@/lib/monitoring/metrics";
import { getPerfSummary } from "@/lib/monitoring/performance";
import { alertHistory } from "@/lib/monitoring/alert";

export async function GET(req: NextRequest) {
  // 헬스체크 및 메트릭/성능/알림 내역 반환
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    metrics: getMetrics(),
    perf: getPerfSummary(),
    alerts: alertHistory.slice(0, 50),
  });
} 